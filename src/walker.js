const Apify = require('apify');

const { log } = Apify.utils;

exports.createStartRequestsWithWalker = ({ walker, searchString }) => {
    const generatedRequests = [];
    const { zoom, step, bounds } = walker;
    const { northeast, southwest } = bounds;
    //log.info(`Using walker mode, generating pieces of map to walk with step ${step}, zoom ${step} and bounds ${JSON.stringify(bounds)}.`);
    /**
     * The hidden feature, with walker you can search business in specific square on map.
     */
    // Generate URLs to walk
    for (let walkerLng = northeast.lng; walkerLng >= southwest.lng; walkerLng -= step) {
        for (let walkerLat = northeast.lat; walkerLat >= southwest.lat; walkerLat -= step) {
            generatedRequests.push({
                url: `https://www.google.com/maps/@${walkerLat},${walkerLng},${zoom}z/search`,
                userData: { label: 'startUrl', searchString },
            });
        }
    }

    return generatedRequests;
};
