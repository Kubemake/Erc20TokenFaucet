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
    node_uri: 'http://bsc:6546541p@95.216.46.114:18545',
    signer: '',
    gasAdjustment: 1, //gwei
  };

  return config;
};
