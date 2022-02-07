const Apify = require('apify');

const typedefs = require('./typedefs');

const MAX_CRAWLED_PLACES_STATE_RECORD_NAME = 'MAX_CRAWLED_PLACES_STATE';

module.exports = class MaxCrawledPlacesTracker {
    /**
     * @param {number} maxCrawledPlaces 
     * @param {number} maxCrawledPlacesPerSearch 
     */
    constructor(maxCrawledPlaces, maxCrawledPlacesPerSearch) {
        this.maxCrawledPlaces = maxCrawledPlaces;
        this.maxCrawledPlacesPerSearch = maxCrawledPlacesPerSearch;
        this.enqueuedTotal = 0;
        /** @type {Object.<string, number>} */
        this.enqueuedPerSearch = {};
        this.scrapedTotal = 0;
        /** @type {Object.<string, number>} */
        this.scrapedPerSearch = {};
    }

    /**
     * @param {any} events
     */
    async initialize(events) {
        const loadedState = /** @type {typedefs.MaxCrawledPlacesState | undefined}  */
            (await Apify.getValue(MAX_CRAWLED_PLACES_STATE_RECORD_NAME));
        if (loadedState) {
            this.enqueuedTotal = loadedState.enqueuedTotal;
            this.enqueuedPerSearch = loadedState.enqueuedPerSearch;
            this.scrapedTotal = loadedState.scrapedTotal;
            this.scrapedPerSearch = loadedState.scrapedPerSearch;
        }

        events.on('persistState', async () => {
            await this.persist();
        });
    }

    /**
     * Returns true if we can still enqueue more for this search string
     * @param {string} [searchString]
     * @returns {boolean}
     */
    canEnqueueMore(searchString) {
        if (this.enqueuedTotal >= this.maxCrawledPlaces) {
            return false;
        }
        if (searchString && this.enqueuedPerSearch[searchString] >= this.maxCrawledPlacesPerSearch) {
            return false;
        }
        return true;
    }

    /**
     * You should use this stateful function before each enqueueing
     * Increments a counter for enqueued requests
     * Returns true if the requests count was incremented
     * and the request should be really enqueued, false if not
     * @param {string} [searchString]
     * @returns {boolean}
     */
    setEnqueued(searchString) {
        if (searchString && !this.enqueuedPerSearch[searchString]) {
            this.enqueuedPerSearch[searchString] = 0;
        }
        
        // Here we first check before enqueue
        const canEnqueueMore = this.canEnqueueMore(searchString);
        if (!canEnqueueMore) {
            return false;
        }
        this.enqueuedTotal++;
        if (searchString) {
            this.enqueuedPerSearch[searchString]++;
        }
        return true;
    }

    /**
     * Returns true if we can still scrape more for this search string
     * @param {string} [searchString]
     * @returns {boolean}
     */
     canScrapeMore(searchString) {
        if (this.scrapedTotal >= this.maxCrawledPlaces) {
            return false;
        }
        if (searchString && this.scrapedPerSearch[searchString] >= this.maxCrawledPlacesPerSearch) {
            return false;
        }
        return true;
    }

    /**
     * You should use this stateful function after each place pushing
     * Increments a counter for scraped requests
     * Returns true if the requests count was incremented
     * and we should continue to scrape for this search, false if not
     * @param {string} [searchString]
     * @returns {boolean}
     */
     setScraped(searchString) {
        if (searchString && !this.scrapedPerSearch[searchString]) {
            this.scrapedPerSearch[searchString] = 0;
        }
        // Here we push and then check
        this.scrapedTotal++;
        if (searchString) {
            this.scrapedPerSearch[searchString]++;
        }
        
        const canScrapeMore = this.canScrapeMore(searchString);
        if (!canScrapeMore) {
            return false;
        }
        
        return true;
    }

    async persist() {
        await Apify.setValue(
            MAX_CRAWLED_PLACES_STATE_RECORD_NAME,
            { enqueuedTotal: this.enqueuedTotal, enqueuedPerSearch: this.enqueuedPerSearch }
        );
    }
}
