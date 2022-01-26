'use strict';

const ERC20Interface = require('./contract/ERC20Interface.sol.js');
const EthereumTx = require('ethereumjs-tx');
const EtherSigner = require('ethereum-offline-sign');
const gasLimit = 4000000;

class Erc20Token {
  constructor(web3, privateKey, signer) {
    this.web3 = web3;
    this.privateKey = Buffer.from(privateKey, 'hex');
    this.signer = signer;
    this.tokenContract = web3.eth.contract(ERC20Interface.abi);
    this.nonce = web3.eth.getTransactionCount(signer);
  }

  transfer(contractAddress, toAddress, amount) {
    let {web3, signer, privateKey} = this;

    if (!web3.isAddress(contractAddress)) {
      throw new Error('erc20 contract error!');
    }

    if (!web3.isAddress(toAddress)) {
      throw new Error('you input address error!');
    }

    let gasPrice = web3.eth.gasPrice;
    let etherSigner = new EtherSigner(this.tokenContract.at(contractAddress), privateKey, gasPrice, gasLimit);

    let params = [toAddress, etherSigner.toWei(amount), {from: signer}];

    function sendTransaction(nonce) {
      let signedTx = etherSigner.contractTransferSign('transfer', params, contractAddress, nonce, 0);
      try {
        return web3.eth.sendRawTransaction(signedTx);
      } catch (e) {
        throw new Error(e);
      }
    }

    try {
      let nnc = web3.eth.getTransactionCount(signer);
      if (nnc > this.nonce) {
        this.nonce = nnc;
      }
      this.nonce += 1;
      let txHash = sendTransaction(this.nonce);
      console.log({txHash, nonce: this.nonce});
      return txHash;
    } catch (e) {
      this.nonce += 1;
      throw new Error(e);
    }
  }
}

module.exports = Erc20Token;