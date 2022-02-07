/* eslint-env jquery */
const Apify = require('apify');
const Puppeteer = require('puppeteer'); // eslint-disable-line

const { log, sleep } = Apify.utils;

const { navigateBack, scrollTo } = require('../utils');

/** @param {string[]} imageUrls */
const enlargeImageUrls = (imageUrls) => {
    // w1920-h1080
    const FULL_RESOLUTION = {
        width: 1920,
        height: 1080,
    };
    return imageUrls.map((imageUrl) => {
        const sizeMatch = imageUrl.match(/=s\d+/);
        const widthHeightMatch = imageUrl.match(/=w\d+-h\d+/);
        if (sizeMatch) {
            return imageUrl.replace(sizeMatch[0], `=s${FULL_RESOLUTION.width}`);
        }
        if (widthHeightMatch) {
            return imageUrl.replace(widthHeightMatch[0], `=w${FULL_RESOLUTION.width}-h${FULL_RESOLUTION.height}`);
        }
        return imageUrl;
    });
};

/**
 * @param {{
 * page: Puppeteer.Page,
 * maxImages: number,
 * targetReviewsCount: Number,
 * placeUrl: String
 }} options
 */
module.exports.extractImages = async ({ page, maxImages, targetReviewsCount, placeUrl }) => {
    if (!maxImages || maxImages === 0) {
        return undefined;
    }

    let resultImageUrls;

    const mainImageSel = '[jsaction="pane.heroHeaderImage.click"]';
    let mainImage;
    try {
        mainImage = await page.waitForSelector(mainImageSel);
    } catch (e) {
        //log.warning(`Cannot find main image, skipping image extraction`);
        return undefined;
    }

    if (maxImages === 1) {
        // @ts-ignore
        const imageUrl = await mainImage.$eval('img', (el) => el.src);
        resultImageUrls = [imageUrl];
    }
    if (maxImages > 1) {
        await sleep(2000);
        await mainImage.click();
        let lastImage = null;
        let pageBottom = 10000;
        let imageUrls = [];

        //log.info(`[PLACE]: Infinite scroll for images started, url: ${placeUrl}`);

        for (;;) {
            // TODO: Debug infiniteScroll properly, it can get stuck in there sometimes, for now just adding a race
            await Promise.race([

                // infiniteScroll(page, pageBottom, '.section-scrollbox', 1),
                scrollTo(page, '.section-scrollbox', pageBottom),
                Apify.utils.sleep(20000),
            ]);
            imageUrls = await page.evaluate(() => {
                /** @type {string[]} */
                const urls = [];
                $('[data-photo-index]').each((i, el) => {
                    // @ts-ignore
                    const urlMatch = $(el).find('div').eq(0).attr('style').match(/url\("(.*)"\)/);
                    if (!urlMatch) return;
                    let imageUrl = urlMatch[1];
                    if (imageUrl[0] === '/') imageUrl = `https:${imageUrl}`;
                    urls.push(imageUrl);
                });
                return urls;
            });
            if (imageUrls.length >= maxImages || lastImage === imageUrls[imageUrls.length - 1]) {
                //log.info(`[PLACE]: Infinite scroll for images finished, url: ${placeUrl}`);
                break;
            }
            //log.info(`[PLACE]: Infinite scroll continuing for images, currently ${imageUrls.length}, url: ${placeUrl}`);
            lastImage = imageUrls[imageUrls.length - 1];
            pageBottom += 6000;
            await sleep(500);
        }
        resultImageUrls = imageUrls.slice(0, maxImages);
        // If no reviews are needed, we don't have to hit the back button
        if (targetReviewsCount > 0) {
            await navigateBack(page, 'images', placeUrl);
        }
    }

    return enlargeImageUrls(resultImageUrls);
};