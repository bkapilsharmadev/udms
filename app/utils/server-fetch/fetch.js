const axios = require('axios');

async function serverfetch(url, options) {
    try {
        const response = await axios(url, options);
        const headers = {};
        for (const key in response.headers) {
            if (response.headers.hasOwnProperty(key)) {
                headers[key.toLowerCase()] = response.headers[key];
            }
        }

        return {
            status: response.status,
            headers,
            body: response.data,
        };
    } catch (error) {
        console.error('Fetch error:', error);
        return {
            status: error.response?.status || 500,
            headers: error.response?.headers || {},
            body: error.response?.data || error.message,
        };

    }
}

module.exports = serverfetch;
