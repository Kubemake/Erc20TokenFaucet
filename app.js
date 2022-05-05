const Wallet = require('ethereumjs-wallet');
const Web3 = require('web3');

class BtStrap {
  constructor(app) {
    this.app = app;
    this.app.limits = {}
  }

  willReady() {
    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('You should start app like: PRIVATE_KEY=yourpirvetkey npm run dev');
    }
    if (privateKey.indexOf('0x') === 0) privateKey = privateKey.slice(2);
    this.app.config.custom.privateKey = privateKey;
    if (process.env.TOKENS_FILE_NAME) {
      this.app.config.custom.tokens = process.env.TOKENS_FILE_NAME;
    }
    if (process.env.FAUCET_AMOUNT) {
      this.app.config.custom.amount = process.env.FAUCET_AMOUNT;
    }
    if (process.env.GAS_ADJUSTMENT) {
      this.app.config.custom.gasAdjustment = process.env.GAS_ADJUSTMENT;
    }
    if (process.env.NODE_URI) {
      this.app.config.custom.node_uri = process.env.NODE_URI;
    }
    if (process.env.HOST) {
      this.app.config.custom.host = process.env.HOST;
    }
    this.app.config.security.domainWhiteList.push(this.app.config.custom.host);

    const p = Buffer.from(privateKey, 'hex');
    const wallet = Wallet.default.fromPrivateKey(p);
    this.app.config.custom.signer = wallet.getChecksumAddressString();
  }

  async serverDidReady() {
    const {node_uri} = this.app.config.custom;

    const web3 = new Web3(new Web3.providers.HttpProvider(node_uri));
    web3.eth.net.isListening().then(() => {
      console.log('Web3 is connected to', node_uri);
      this.app.web3 = web3;
    }).catch(e => {
      throw new Error('Wow. Can`t connect to web3 provider: ' + e.message);
    });
  }

}

module.exports = BtStrap;

process.on('uncaughtException', msg => {
  // const LCERROR = '\x1b[31m%s\x1b[0m'; //red
  // const LCWARN = '\x1b[33m%s\x1b[0m'; //yellow
  const LCINFO = '\x1b[36m%s\x1b[0m'; //cyan
  // const LCSUCCESS = '\x1b[32m%s\x1b[0m'; //green
  console.error(LCINFO, msg.message);
});