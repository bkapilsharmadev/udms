const axios = require('axios');
const { CustomError } = require('../error/CustomError');

async function serverfetch(url, options) {
    try {
        const response = await axios(url, options);
        const headers = {};
        for (const key in response.headers) {
            if (response.headers.hasOwnProperty(key)) {
                headers[key.toLowerCase()] = response.headers[key];
            }
        }

        console.log('Headers in fetchService:', headers);

        return {
            status: response.status,
            headers,
            body: response.data,
        };
    } catch (error) {
        console.error('Fetch error:', error);

        throw new CustomError({
            message: error.message,
            httpStatus: error.response ? error.response.status : 500,
        })

    }
}

module.exports = serverfetch;
