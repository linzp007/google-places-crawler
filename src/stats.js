const Apify = require('apify');

const typedefs = require('./typedefs'); // eslint-disable-line no-unused-vars

const { utils: { log } } = Apify;

module.exports = class Stats {
    constructor() {
        /** @type {typedefs.InnerStats} */
        this.stats = { failed: 0, ok: 0, outOfPolygon: 0, outOfPolygonCached: 0, places: 0, maps: 0 };
        /** @type {typedefs.PlaceOutOfPolygon[]} */
        this.placesOutOfPolygon = [];
        this.statsKVKey = 'STATS';
        this.placesOutOfPolygonKVKey = 'PLACES-OUT-OF-POLYGON';
        this.persistBatchSize = 10000;
    }

    /**
     * @param {any} events
     */
    async initialize(events) {
        const loadedStats = /** @type {typedefs.InnerStats | undefined} */ (await Apify.getValue(this.statsKVKey));
        if (loadedStats) {
            this.stats = loadedStats;
        }
        await this.loadPlacesOutsideOfPolygon();

        events.on('persistState', async () => {
            await this.saveStats();
        });
    }

    async logInfo() {
        const statsArray = [];

        for (const [key, value] of Object.entries(this.stats)) {
            statsArray.push(`${key}: ${value}`);
        }

        //log.info(`[STATS]: ${statsArray.join(' | ')}`);
    }

    async saveStats() {
        await Apify.setValue(this.statsKVKey, this.stats);
        await this.persitsPlacesOutsideOfPolygon();
        await this.logInfo();
    }

    failed() {
        this.stats.failed++;
    }

    ok() {
        this.stats.ok++;
    }

    outOfPolygon() {
        this.stats.outOfPolygon++;
    }

    maps() {
        this.stats.maps++;
    }

    places() {
        this.stats.places++;
    }

    outOfPolygonCached() {
        this.stats.outOfPolygonCached++;
    }

    /** @param {typedefs.PlaceOutOfPolygon} placeInfo */
    addOutOfPolygonPlace(placeInfo) {
        this.placesOutOfPolygon.push(placeInfo);
    }

    async persitsPlacesOutsideOfPolygon() {
        if (this.placesOutOfPolygon.length === 0) {
            return;
        }
        for (let i = 0; i < this.placesOutOfPolygon.length; i += this.persistBatchSize) {
            const slice = this.placesOutOfPolygon.slice(i, i + this.persistBatchSize);
            await Apify.setValue(`${this.placesOutOfPolygonKVKey}-${i / this.persistBatchSize}`, slice);
        }
    }

    async loadPlacesOutsideOfPolygon() {
        for (let i = 0; ; i += this.persistBatchSize) {
            const placesOutOfPolygonSlice =
                /** @type {typedefs.PlaceOutOfPolygon[] | undefined} */
                (await Apify.getValue(`${this.placesOutOfPolygonKVKey}-${i / this.persistBatchSize}`));
            if (!placesOutOfPolygonSlice) {
                return;
            }
            this.placesOutOfPolygon = this.placesOutOfPolygon.concat(placesOutOfPolygonSlice);
        }
    }
}
