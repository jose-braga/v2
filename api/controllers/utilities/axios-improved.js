const _axios = require('axios')
const axiosRetry = require('axios-retry')

const axios = _axios.create();
axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay});

module.exports = axios;
