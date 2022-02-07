const Apify = require('apify'); // eslint-disable-line no-unused-vars
const Puppeteer = require('puppeteer'); // eslint-disable-line no-unused-vars
const MaxCrawledPlacesTracker = require('./max-crawled-places'); // eslint-disable-line no-unused-vars

const { ScrapingOptions, PlaceUserData } = require('./typedefs'); // eslint-disable-line no-unused-vars
const ErrorSnapshotter = require('./error-snapshotter'); // eslint-disable-line no-unused-vars
const Stats = require('./stats'); // eslint-disable-line no-unused-vars

const { extractPageData, extractPopularTimes, extractOpeningHours, extractPeopleAlsoSearch,
    extractAdditionalInfo } = require('./extractors/general');
const { extractImages } = require('./extractors/images');
const { extractReviews } = require('./extractors/reviews');
const { DEFAULT_TIMEOUT, PLACE_TITLE_SEL } = require('./consts');
const { waitForGoogleMapLoader } = require('./utils');

const { log } = Apify.utils;

/**
 * @param {{
 *  page: Puppeteer.Page,
 *  request: Apify.Request,
 *  searchString: string,
 *  session: Apify.Session,
 *  scrapingOptions: ScrapingOptions,
 *  errorSnapshotter: ErrorSnapshotter,
 *  stats: Stats,
 *  maxCrawledPlacesTracker: MaxCrawledPlacesTracker,
 *  crawler: Apify.PuppeteerCrawler,
 * }} options
 */
module.exports.handlePlaceDetail = async (options) => {
    const {
        page, request, searchString, session, scrapingOptions, errorSnapshotter,
        stats, maxCrawledPlacesTracker, crawler
    } = options;
    const {
        includeHistogram, includeOpeningHours, includePeopleAlsoSearch,
        maxReviews, maxImages, additionalInfo, reviewsSort, reviewsTranslation,
    } = scrapingOptions;
    // Extract basic information
    await waitForGoogleMapLoader(page);

    // Some customers are passing link to the reviews subpage for some reason
    const maybeBackButton = await page.$('button[aria-label="Back"]');
    if (maybeBackButton) {
        await maybeBackButton.click();
    }

    try {
        await page.waitForSelector(PLACE_TITLE_SEL, { timeout: DEFAULT_TIMEOUT });
    } catch (e) {
        session.markBad();
        throw 'The page didn\'t load fast enough, this will be retried';
    }

    // Add info from listing page
    const { rank, searchPageUrl, isAdvertisement } = /** @type {PlaceUserData} */ (request.userData);

    // Extract gps from URL
    // We need to URL will be change, it happened asynchronously
    if (!maybeBackButton) {
        await page.waitForFunction(() => window.location.href.includes('/place/'));
    }
    const url = page.url();

    const coordinatesMatch = url.match(/!3d([0-9\-.]+)!4d([0-9\-.]+)/);
    const latMatch = coordinatesMatch ? coordinatesMatch[1] : null;
    const lngMatch = coordinatesMatch ? coordinatesMatch[2] : null;

    const coordinates = latMatch && lngMatch ? { lat: parseFloat(latMatch), lng: parseFloat(lngMatch) } : null;

    // This huge JSON contains mostly everything, we still don't use it fully
    // It seems to be stable over time
    // Examples can be found in the /samples folder
    // NOTE: This is empty for certain types of direct URLs
    // Search and place IDs work fine
    const jsonData = await page.evaluate(() => {
        try {
            // @ts-ignore
            return JSON.parse(APP_INITIALIZATION_STATE[3][6].replace(`)]}'`, ''))[6];
        } catch (e) {
        }
    });

    // Enable to debug data parsed from JSONs - DON'T FORGET TO REMOVE BEFORE PUSHING!
    /*
    await Apify.setValue('APP-OPTIONS', await page.evaluate(() => APP_OPTIONS ))
    await Apify.setValue('APP_INIT_STATE', await page.evaluate(() => APP_INITIALIZATION_STATE ));
    await Apify.setValue('JSON-DATA', jsonData);
    */

    const pageData = await extractPageData({ page, jsonData });

    const orderBy = (() => {
        try {
            return jsonData[75][0][0][2].map((/** @type {any} */ i) => {
                return { name: i[0][0], url: i[1][2][0] }
            });
        } catch (e) {
            return [];
        }
    })();

    let totalScore = jsonData?.[4]?.[7] || null;
    let reviewsCount = jsonData?.[4]?.[8] || 0;
    let permanentlyClosed = (jsonData?.[203]?.[1]?.[4]?.[0] === 'Permanently closed');

    // We fallback to HTML (might be good to do only)
    if (!totalScore) {
        totalScore = await page.evaluate(() => Number($(('[class*="section-star-display"]'))
            .eq(0).text().trim().replace(',', '.')) || null)
    }

    if (!reviewsCount) {
        reviewsCount = await page.evaluate(() => Number($('button[jsaction="pane.reviewChart.moreReviews"]')
            .text()
            .replace(/[^0-9]+/g, '')) || 0);
    }

    if (!permanentlyClosed) {
        permanentlyClosed = await page.evaluate(() => $('#pane').text().includes('Permanently closed'));
    }

    // TODO: Add a backup and figure out why some direct start URLs don't load jsonData
    // direct place IDs are fine
    const reviewsDistributionDefault = {
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,
    };

    let reviewsDistribution = reviewsDistributionDefault;

    if (jsonData) {
        if (Array.isArray(jsonData?.[52]?.[3])) {
            const [oneStar, twoStar, threeStar, fourStar, fiveStar] = jsonData[52][3];
            reviewsDistribution = { oneStar, twoStar, threeStar, fourStar, fiveStar };
        }
    }

    const defaultReviewsJson = jsonData?.[52]?.[0];

    let cid;
    const cidHexSplit = jsonData?.[10]?.split(':');
    if (cidHexSplit && cidHexSplit[1]) {
        // Hexadecimal to decimal. We have to use BigInt because JS Number does not have enough precision
        cid = BigInt(cidHexSplit[1]).toString();
    }

    // How many we should scrape (otherwise we retry)
    const targetReviewsCount = Math.min(reviewsCount, maxReviews);

    // extract categories
    const categories = jsonData?.[13]

    const detail = {
        ...pageData,
        permanentlyClosed,
        totalScore,
        isAdvertisement,
        rank,
        placeId: jsonData?.[78] || request.uniqueKey,
        categories: request.userData.categories || categories,
        cid,
        url,
        searchPageUrl,
        searchString,
        location: coordinates, // keeping backwards compatible even though coordinates is better name
        scrapedAt: new Date().toISOString(),
        ...includeHistogram ? extractPopularTimes({ jsonData }) : {},
        openingHours: includeOpeningHours ? await extractOpeningHours({ page }) : undefined,
        peopleAlsoSearch: includePeopleAlsoSearch ? await extractPeopleAlsoSearch({ page }) : undefined,
        additionalInfo: additionalInfo ? await extractAdditionalInfo({ page, placeUrl: url }) : undefined,
        reviewsCount,
        reviewsDistribution,
        // IMPORTANT: The order of actions image -> reviews is important
        // If you need to change it, you need to check the implementations
        // and where the back buttons need to be

        // NOTE: Image URLs are quite rare for users to require
        // In case the back button fails, we reload the page before reviews
        imageUrls: await errorSnapshotter.tryWithSnapshot(
            page,
            async () => extractImages({ page, maxImages, targetReviewsCount, placeUrl: url }),
            { name: 'Image extraction' },
        ),
        // NOTE: Reviews must be the last action on the detail page
        // because the back button is always a little buggy (unless you fix it :) ).
        // We want to close the page right after reviews are extracted
        reviews: await errorSnapshotter.tryWithSnapshot(
            page,
            async () => extractReviews({
                request,
                page,
                reviewsCount,
                targetReviewsCount,
                reviewsSort,
                reviewsTranslation,
                defaultReviewsJson,
                personalDataOptions: scrapingOptions.personalDataOptions
            }),
            { name: 'Reviews extraction' },
        ),
        orderBy,
    };


    await Apify.pushData(detail);
    stats.places();
    //log.info(`[PLACE]: Place scraped successfully --- ${url}`);
    const shouldScrapeMore = maxCrawledPlacesTracker.setScraped();
    if (!shouldScrapeMore) {
        // log.warning(`[SEARCH]: Finishing scraping because we reached maxCrawledPlaces `
        //     // + `currently: ${maxCrawledPlacesTracker.enqueuedPerSearch[searchKey]}(for this search)/${maxCrawledPlacesTracker.enqueuedTotal}(total) `
        //     + `--- ${searchString} - ${request.url}`);
        crawler.autoscaledPool?.abort();
    }
};
