const path = require('path');
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
     const {tokensFile, signer, host, amount} = this.config.custom;

    const tokens = require(path.join(this.app.baseDir, 'app/extend', tokensFile));

    const data = {tokens, amount, hostUrl: host, signer};

    await this.ctx.render('index.tpl', data);
  }

  async create() {
    let data = this.ctx.request.body;
    const {amount} = this.config.custom;
    const {service} = this;
    const result = await service.eth.transfer(data.token, data.address, amount);

    this.ctx.body = {
      success: true,
      msg: 'OK',
      statusCode: 200,
      data: result,
    };
  }
}

module.exports = HomeController;