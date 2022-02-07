exports.DEFAULT_TIMEOUT = 60 * 1000; // 60 sec

exports.LISTING_PAGINATION_KEY = 'lisState';
exports.MAX_PAGE_RETRIES = 6;

exports.PLACE_TITLE_SEL = 'h1[class*="header-title-title"]';
exports.BACK_BUTTON_SEL = 'button[jsaction*=back], button[aria-label="Back"]';
exports.NEXT_BUTTON_SELECTOR = '[jsaction="pane.paginationSection.nextPage"]';

exports.NO_RESULT_XPATH = '//div[contains(text(), "No results found")]';

exports.REGEXES = {
    PLACE_URL_NORMAL: /google\.[a-z.]+\/maps\/place/,
    PLACE_URL_CID: /google\.[a-z.]+.+cid=\d+(&|\b)/,
    SEARCH_URL_NORMAL: /google\.[a-z.]+\/maps\/search/,
}

exports.GEO_TO_DEFAULT_ZOOM = {
    country: 12,
    state: 12,
    county: 14,
    city: 17,
    postalCode: 18,
    default: 12,
}
