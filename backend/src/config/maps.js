const MAPS_CONFIG = {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    defaultCenter: {
        lat: parseFloat(process.env.DEFAULT_LAT) || 28.7041,
        lng: parseFloat(process.env.DEFAULT_LNG) || 77.1025
    },
    defaultZoom: 12
};

module.exports = MAPS_CONFIG;