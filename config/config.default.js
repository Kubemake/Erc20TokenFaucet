module.exports = appInfo => {
  const config = {};
  config.middleware = ['errorHandler'];
  config.keys = '5creX1BXp*YkqsXm@K$hZW63OE)L5SEOUVSvz)*O%UZj#Av3!n-N-UtBbr#79uyH';
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.tpl': 'nunjucks',
    },
  };
  config.security = {
    csrf: {
      queryName: '_csrf',
      bodyName: '_csrf',
      headerName: 'x-csrf-token',
      ignoreJSON: true,
    },
    domainWhiteList: ['http://127.0.0.1:7001', 'http://localhost:7001'],
  };
  config.custom = {
    host: 'http://127.0.0.1:7001',
    tokensFile: 'tokens.js',
    privateKey: '',
    amount: 1000,
    node_uri: 'https://ropsten.infura.io/v3/852850796333476b92a8f7b56be10180',
    signer: '',
    gasAdjustment: 1, //gwei
  };

  return config;
};
