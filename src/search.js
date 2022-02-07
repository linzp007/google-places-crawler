const Apify = require('apify');

const { GEO_TO_DEFAULT_ZOOM } = require('./consts');
const { getGeolocation, findPointsInPolygon, getGeoJson } = require('./polygon');
const { Geolocation, GeolocationFull } = require('./typedefs');

const { log } = Apify.utils;

/**
 * @param {{
 *  country: string | undefined,
 *  state: string | undefined,
 *  county: string | undefined,
 *  city: string | undefined,
 *  postalCode: string | undefined
 * }} geolocation
 */
const getMatchingDefaultZoom = ({ country, state, county, city, postalCode }) => {
    // We start with the most specific that should get highest zoom
    if (postalCode) {
        return GEO_TO_DEFAULT_ZOOM.postalCode;
    }
    if (city) {
        return GEO_TO_DEFAULT_ZOOM.city;
    }
    if (county) {
        return GEO_TO_DEFAULT_ZOOM.county;
    }
    if (state) {
        return GEO_TO_DEFAULT_ZOOM.state;
    }
    if (country) {
        return GEO_TO_DEFAULT_ZOOM.country;
    }
    return GEO_TO_DEFAULT_ZOOM.default;
}

/**
 * @param {{
 *  lat: string | undefined,
 *  lng: string | undefined,
 *  userOverridingZoom: number | undefined,
 *  country: string | undefined,
 *  state: string | undefined,
 *  county: string | undefined,
 *  city: string | undefined,
 *  postalCode: string | undefined,
 *  customGeolocation: Geolocation | undefined,
 * }} options
 */
exports.prepareSearchUrlsAndGeo = async ({ lat, lng, userOverridingZoom, country, state, county, city, postalCode, customGeolocation }) => {
    // Base part of the URLs to make up the startRequests
    const startUrlSearches = [];

    const zoom = userOverridingZoom || getMatchingDefaultZoom({ country, state, county, city, postalCode });
    //log.info(`Using zoom ${zoom} to define the search`);

    /** @type {Geolocation | undefined} */
    let geolocation = undefined;

    // preference for startUrlSearches is state & city > lat & lng
    // because people often use both and we want to split the map for more results
    if (customGeolocation || country || state || county || city || postalCode) {
        /** @type {GeolocationFull | undefined} */
        let fullGeolocation = undefined;
        if (customGeolocation) {
            //log.warning(`Using provided customGeolocation`);
            fullGeolocation = { geojson: customGeolocation, boundingbox: undefined, display_name: undefined }
        }
        if (!fullGeolocation) {
            // Store so we don't have to call it again
            await Apify.getValue('GEO');
        }
        if (!fullGeolocation) {
            fullGeolocation = await getGeolocation({ country, state, county, city, postalCode });
        }
        await Apify.setValue('GEO', fullGeolocation);
        geolocation = getGeoJson(fullGeolocation);

        const points = await findPointsInPolygon(geolocation, zoom);
        for (const point of points) {
            startUrlSearches.push(`https://www.google.com/maps/@${point.lat},${point.lon},${zoom}z/search`);
        }
        //log.info(`Created ${startUrlSearches.length} search page URLs for extraction to ensure maximum results is captured.`);
    } else if (lat || lng) {
        if (!lat || !lng) {
            throw 'You have to define both lat and lng!';
        }
        startUrlSearches.push(`https://www.google.com/maps/@${lat},${lng},${zoom}z/search`);
    } else {
        startUrlSearches.push('https://www.google.com/maps/search/');
    }
    return { startUrlSearches, geolocation };
};
