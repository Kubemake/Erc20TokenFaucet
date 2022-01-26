'use strict';
const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    config.middleware = ['errorHandler'];

    config.security = {
        csrf: {
            queryName: '_csrf',
            bodyName: '_csrf',
            headerName: 'x-csrf-token',
            ignoreJSON: true
        },
        domainWhiteList: ["https://faucet.enft.ai", "http://localhost:3000/", "http://localhost:3000", "http://127.0.0.1:3000/", "http://127.0.0.1:3000"]
    };

    // exports.cors = {
    //     origin: '*',
    //     allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
    // };

    config.view = {
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.nj': 'nunjucks',
        },
        root: [
            path.join(appInfo.baseDir, 'app/view'),
            path.join(appInfo.baseDir, 'path/to/another'),
        ].join(',')
    };

    config.keys = appInfo.name + '_1538988032206_7794';

    config.ether = {
        signer: '0x7A5CC9D2aB8b8aBC369bA9ADBccF1B2c2f8957B1',
        amount: 1000
    };

    return config;
};