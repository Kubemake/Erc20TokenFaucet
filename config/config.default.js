module.exports = appInfo => {
  const config = {}
  config.middleware = ['errorHandler']
  config.keys = '5creX1BXp*YkqsXm@K$hZW63OE)L5SEOUVSvz)*O%UZj#Av3!n-N-UtBbr#79uyH'
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.tpl': 'nunjucks',
    },
  }

  config.cluster = {
    listen: {
      port: 7002,
    }
  }

  config.security = {
    csrf: {
      queryName: '_csrf',
      bodyName: '_csrf',
      headerName: 'x-csrf-token',
      ignoreJSON: true,
    },
    domainWhiteList: ['http://127.0.0.1:' + config.cluster.listen.port, 'http://localhost:' + config.cluster.listen.port, 'http://127.0.0.1:' + config.cluster.listen.port + '/', 'http://localhost:' + config.cluster.listen.port + '/'],
  }

  config.custom = {
    host: 'https://amtfaucet.amazy.io', //http://127.0.0.1:7001',
    tokensFile: 'tokens.js',
    privateKey: '',
    amount: 1000,
    node_uri: 'https://app.amazy.io:18545',
    signer: '',
    gasAdjustment: 3, //gwei
  }

  return config
}
