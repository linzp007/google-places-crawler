const Apify = require('apify');
const Puppeteer = require('puppeteer'); /// eslint-disable-line no-unused-vars

const { stringifyGoogleXrhResponse } = require('../utils');

const { Review, PersonalDataOptions } = require('../typedefs');

const { log, sleep } = Apify.utils;

/**
 *
 * @param {Review[]} reviews
 * @param {PersonalDataOptions} personalDataOptions
 * @returns {Review[]}
 */
 const removePersonalDataFromReviews = (reviews, personalDataOptions) => {
    for (const review of reviews) {
        if (!personalDataOptions.scrapeReviewerName) {
            review.name = null;
        }
        if (!personalDataOptions.scrapeReviewerId) {
            review.reviewerId = null;
        }
        if (!personalDataOptions.scrapeReviewerUrl) {
            review.reviewerUrl = null;
        }
        if (!personalDataOptions.scrapeReviewId) {
            review.reviewId = null;
        }
        if (!personalDataOptions.scrapeReviewUrl) {
            review.reviewUrl = null;
        }
        if (!personalDataOptions.scrapeResponseFromOwnerText) {
            review.responseFromOwnerText = null;
        }
    }
    return reviews;
}

/**
 * Parses review from a single review array json Google format
 * @param {any} jsonArray
 * @param {string} reviewsTranslation
 * @return {Review}
 */
 const parseReviewFromJson = (jsonArray, reviewsTranslation) => {
    let text = jsonArray[3];

    // Optionally remove translation
    // TODO: Perhaps the text is differentiated in the JSON
    if (typeof text === 'string' && reviewsTranslation !== 'originalAndTranslated') {
        const splitReviewText = text.split('\n\n(Original)\n');

        if (reviewsTranslation === 'onlyOriginal') {
            // Fallback if there is no translation
            text = splitReviewText[1] || splitReviewText[0];
        } else if (reviewsTranslation === 'onlyTranslated') {
            text = splitReviewText[0];
        }
        text = text.replace('(Translated by Google)', '').replace('\n\n(Original)\n', '').trim();
    }

    return {
        name: jsonArray[0][1],
        text,
        publishAt: jsonArray[1],
        publishedAtDate: new Date(jsonArray[27]).toISOString(),
        likesCount: jsonArray[16],
        reviewId: jsonArray[10],
        reviewUrl: jsonArray[18],
        reviewerId: jsonArray[6],
        reviewerUrl: jsonArray[0][0],
        reviewerNumberOfReviews: jsonArray[12] && jsonArray[12][1] && jsonArray[12][1][1],
        isLocalGuide: jsonArray[12] && jsonArray[12][1] && Array.isArray(jsonArray[12][1][0]),
        // On some places google shows reviews from other services like booking
        // There isn't stars but rating for this places reviews
        stars: jsonArray[4] || null,
        // Trip advisor
        rating: jsonArray[25] ? jsonArray[25][1] : null,
        responseFromOwnerDate: jsonArray[9] && jsonArray[9][3]
            ? new Date(jsonArray[9][3]).toISOString()
            : null,
        responseFromOwnerText: jsonArray[9] ? jsonArray[9][1] : null,
    };
}



/**
 * Response from google xhr is kind a weird. Mix of array of array.
 * This function parse reviews from the response body.
 * @param {Buffer | string} responseBody
 * @param {string} reviewsTranslation
 * @return [place]
 */
 const parseReviewFromResponseBody = (responseBody, reviewsTranslation) => {
    /** @type {Review[]} */
    const currentReviews = [];
    const stringBody = typeof responseBody === 'string'
        ? responseBody
        : responseBody.toString('utf-8');
    let results;
    try {
        results = stringifyGoogleXrhResponse(stringBody);
    } catch (e) {
        return { error: e.message };
    }
    if (!results || !results[2]) {
        return { currentReviews };
    }
    results[2].forEach((/** @type {any} */ jsonArray) => {
        const review = parseReviewFromJson(jsonArray, reviewsTranslation);
        currentReviews.push(review);
    });
    return { currentReviews };
};

/**
 * @param {{
 *    page: Puppeteer.Page,
 *    reviewsCount: number,
 *    request: Apify.Request,
 *    targetReviewsCount: number,
 *    reviewsSort: string,
 *    reviewsTranslation: string,
 *    defaultReviewsJson: any,
 *    personalDataOptions: PersonalDataOptions,
 * }} options
 * @returns {Promise<Review[]>}
 */
module.exports.extractReviews = async ({ page, reviewsCount, request,
    targetReviewsCount, reviewsSort, reviewsTranslation, defaultReviewsJson, personalDataOptions }) => {

    /** Returned at the last line @type {Review[]} */
    let reviews = [];

    if (targetReviewsCount === 0) {
        return [];
    }

    // If we already have all reviews from the page as default ones, we can finish
    // Just need to sort appropriately manually
    if (defaultReviewsJson.length >= targetReviewsCount) {
        reviews = defaultReviewsJson
            .map((defaultReviewJson) => parseReviewFromJson(defaultReviewJson, reviewsTranslation));
        // mostRelevant is default

        if (reviewsSort === 'newest') {
            reviews.sort((review1, review2) => {
                const unixDate1 = new Date(review1.publishedAtDate).getTime();
                const unixDate2 = new Date(review2.publishedAtDate).getTime();
                return unixDate2 - unixDate1;
            })
        }
        if (reviewsSort === 'highestRanking') {
            reviews.sort((review1, review2) => review2.stars - review1.stars);
        }
        if (reviewsSort === 'lowestRanking') {
            reviews.sort((review1, review2) => review1.stars - review2.stars);
        }
        //log.info(`[PLACE]: Reviews extraction finished: ${reviews.length}/${reviewsCount} --- ${page.url()}`);
    } else {
        // Standard scrolling
        // We don't use default reviews if we gonna scroll.
        // Scrolling is fast anyway so we can easily do it from scratch
        const reviewsButtonSel = 'button[jsaction="pane.reviewChart.moreReviews"]';

        try {
            await page.waitForSelector(reviewsButtonSel, { timeout: 15000 });
        } catch (e) {
            //log.warning(`Could not find reviews count, check if the page really has no reviews --- ${page.url()}`);
        }

        // click the consent iframe, working with arrays so it never fails.
        // also if there's anything wrong with Same-Origin, just delete the modal contents
        // TODO: Why is this isolated in reviews?
        await page.$$eval('#consent-bump iframe', async (frames) => {
            try {
                frames.forEach((frame) => {
                    // @ts-ignore
                    [...frame.contentDocument.querySelectorAll('#introAgreeButton')].forEach((s) => s.click());
                });
            } catch (e) {
                document.querySelectorAll('#consent-bump > *').forEach((el) => el.remove());
            }
        });

        try {
            await page.waitForSelector(reviewsButtonSel);
        } catch (e) {
            throw 'Reviews button selector did not load in time';
        }

        /** @type {{[key: string]: number}} */
        const reviewSortOptions = {
            mostRelevant: 0,
            newest: 1,
            highestRanking: 2,
            lowestRanking: 3,
        };

        await sleep(500);
        let reviewsResponse;
        try {
            const responses = await Promise.all([
                page.waitForResponse((response) => response.url().includes('preview/review/listentitiesreviews')),
                page.click(reviewsButtonSel),
            ]);
            reviewsResponse = responses[0];
        } catch (e) {
            throw 'Didn\'t receive response in time after clicking on reviews button';
        }

        //log.info(`[PLACE]: Extracting reviews: ${reviews.length}/${reviewsCount} --- ${page.url()}`);
        let reviewUrl = reviewsResponse.url();

        // We start "manual scrolling requests" from scratch because of sorting
        reviewUrl = reviewUrl.replace(/!3e\d/, `!3e${reviewSortOptions[reviewsSort] + 1}`);

        // TODO: We capture the first batch, this should not start from 0 I think
        // Make sure that we star review from 0, setting !1i0
        reviewUrl = reviewUrl.replace(/!1i\d+/, '!1i0');

        /** @param {string} url */
        const increaseLimitInUrl = (url) => {
            // @ts-ignore
            const numberString = reviewUrl.match(/!1i(\d+)/)[1];
            const number = parseInt(numberString, 10);
            return url.replace(/!1i\d+/, `!1i${number + 10}`);
        };

        while (reviews.length < targetReviewsCount) {
            // Request in browser context to use proxy as in browser
            const responseBody = await page.evaluate(async (url) => {
                const response = await fetch(url);
                return response.text();
            }, reviewUrl);
            const { currentReviews, error } = parseReviewFromResponseBody(responseBody, reviewsTranslation);
            if (error) {
                // This means that invalid response were returned
                // I think can happen if the review count changes
                //log.warning(`Invalid response returned for reviews. `
                // + `This might be caused by updated review count. The reviews should be scraped correctly. ${page.url()}`);
                //log.warning(error);
                break;
            }
            if (currentReviews.length === 0) {
                break;
            }
            reviews.push(...currentReviews);
            reviews = reviews.slice(0, targetReviewsCount);
            //log.info(`[PLACE]: Extracting reviews: ${reviews.length}/${reviewsCount} --- ${page.url()}`);
            reviewUrl = increaseLimitInUrl(reviewUrl);
        }
        // NOTE: Sometimes for unknown reason, Google gives less reviews and in different order
        // TODO: Find a cause!!! All requests URLs look the same otherwise
        if (reviews.length < targetReviewsCount) {
            // MOTE: We don't want to get into infinite loop or fail the request completely
            if (request.retryCount < 2) {
                throw `Google served us less reviews than it should (${reviews.length}/${targetReviewsCount}). Retrying the whole page`;
            } else {
                //log.warning(`Google served us less reviews than it should (${reviews.length}}/${targetReviewsCount})`);
            }
        }
        //log.info(`[PLACE]: Reviews extraction finished: ${reviews.length}/${reviewsCount} --- ${page.url()}`);
        // Clicking on the back button using navigateBack function here is infamously buggy
        // So we just do reviews as last everytime
    }
    reviews = reviews.slice(0, targetReviewsCount);
    return removePersonalDataFromReviews(reviews, personalDataOptions);
};