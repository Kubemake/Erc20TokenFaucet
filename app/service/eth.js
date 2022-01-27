const abi = require('../extend/abi');
const {toBN, toWei} = require('web3-utils');

const Service = require('egg').Service;

class EthService extends Service {

  static nonce = 0;

  async calcGasPrice() {
    const {gasAdjustment} = this.config.custom;

    const _gasPriceDec = await this.app.web3.eth.getGasPrice();
    const _gasPrice = toBN(_gasPriceDec);
    const addGwei = +gasAdjustment * +toWei('1', 'gwei');
    const gasPrice = _gasPrice.add(toBN(addGwei));

    return gasPrice.toString();
  }

  async transfer(contractAddress, toAddress, amount) {
    const {signer, privateKey} = this.config.custom;
    const {web3} = this.app;

    try {
      const erc20 = new web3.eth.Contract(abi, contractAddress);
      const data = erc20.methods.transfer(toAddress, toWei(String(amount), 'ether')).encodeABI();

      EthService.nonce = EthService.nonce > 0 ? EthService.nonce : await web3.eth.getTransactionCount(signer);

      const gasPrice = await this.calcGasPrice();

      let txConfig = {
        from: signer,
        to: contractAddress,
        value: 0,
        nonce: EthService.nonce,
        data: data,
      };

      EthService.nonce += 1;// fix tx underpriced

      const gasLimit = await web3.eth.estimateGas(txConfig);
      txConfig.gasPrice = gasPrice;
      txConfig.gas = gasLimit;

      const signed = await web3.eth.accounts.signTransaction(txConfig, '0x' + privateKey);

      web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', async receipt => console.log(receipt)).on('error', err => {
        console.error('Error on send signed transaction: ', err.message);
        if (err.message.includes('nonce too low')) {
          EthService.nonce = EthService.nonce + 1;
        }
        throw new Error(err.message);
      });
      return signed.transactionHash;
    } catch (err) {
      console.error('Error on send signed transaction: ', err.message);
      throw new Error(err.message);
    }
  }

}

module.exports = EthService;