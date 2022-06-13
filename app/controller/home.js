const path = require('path')
const Controller = require('egg').Controller
const moment = require('moment')
const fs = require('fs')

class HomeController extends Controller {
  async index () {
    const { tokensFile, signer, host, amount } = this.config.custom

    const tokens = require(path.join(this.app.baseDir, 'app/extend', tokensFile))

    const data = { tokens, amount, hostUrl: host, signer }

    await this.ctx.render('index.tpl', data)
  }

  async create () {
    let data = this.ctx.request.body
    let amount = this.config.custom.amount
    const { service } = this

    if (!service.eth.isValidEthAddress(data.address)) {
      return this.ctx.body = {
        success: false,
        msg: 'OK',
        statusCode: 400,
        error: 'Invalid address',
      };
    }

    if (!service.eth.isValidEthAddress(data.token)) {
      return this.ctx.body = {
        success: false,
        msg: 'OK',
        statusCode: 400,
        error: 'Invalid token',
      };
    }

    const tokens = require(path.join(this.app.baseDir, 'app/extend', this.config.custom.tokensFile))
    const current = tokens.filter(i => i.address === data.token)?.pop()
    let limit = 0
    const ipInfo = this.ctx.ip
    const whiteList = fs.readFileSync(path.join(this.app.baseDir, 'config/whiteList')).toString().split('\n')

    if (!whiteList.includes(data.address)) {
      return this.ctx.body = {
        success: false,
        msg: 'OK',
        statusCode: 400,
        error: 'You are not whitelisted',
      }
    }

    // todo: огринич по ип и кол-ву
    if (current?.limit > 0) {
      if (typeof this.app.limits[data.address] === 'undefined') {
        this.app.limits[data.address] = {
          limit: this.app.limits?.[ipInfo]?.limit ?? 0,
          expire: this.app.limits?.[ipInfo]?.expire ?? moment().add(1, 'month')
        }
      }

      if (typeof this.app.limits[ipInfo] === 'undefined') {
        this.app.limits[ipInfo] = {
          limit: this.app.limits[data.address].limit ?? 0,
          expire: this.app.limits?.[data.address]?.expire ?? moment().add(1, 'month')
        }
      }

      if (this.app.limits[data.address].expire < moment() && this.app.limits[ipInfo].expire < moment()) {
        this.app.limits[data.address].limit = this.app.limits[data.address].limit >= current.limit ? 0 : this.app.limits[data.address].limit
        this.app.limits[ipInfo].limit = this.app.limits[ipInfo].limit >= current.limit ? 0 : this.app.limits[ipInfo].limit
        this.app.limits[data.address].expire = moment().add(1, 'month')
        this.app.limits[ipInfo].expire = moment().add(1, 'month')
      }

      limit = this.app.limits[data.address].limit > this.app.limits[ipInfo].limit ? this.app.limits[data.address].limit : this.app.limits[ipInfo].limit

      if (limit + amount >= current.limit) {
        amount = Math.abs(current.limit - limit)
      }

      if (amount <= 0) {
        return this.ctx.body = {
          success: false,
          msg: 'OK',
          statusCode: 400,
          error: 'Address limit exceeded',
        }
      }
    }

    let result
    try {
      result = await service.eth.transfer(data.token, data.address, amount)
    } catch (e) {
      return this.ctx.body = {
        success: false,
        msg: 'OK',
        statusCode: 400,
        error: e.message,
      }
    }

    if (current?.limit > 0) {
      this.app.limits[data.address].limit = limit + amount
      this.app.limits[ipInfo].limit = limit + amount
    }

    this.ctx.body = {
      success: true,
      msg: 'OK',
      statusCode: 200,
      data: result,
    }
  }
}

module.exports = HomeController