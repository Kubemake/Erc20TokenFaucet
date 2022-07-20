const path = require('path')
const Controller = require('egg').Controller
const moment = require('moment')

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
      }
    }

    if (!service.eth.isValidEthAddress(data.token)) {
      return this.ctx.body = {
        success: false,
        msg: 'OK',
        statusCode: 400,
        error: 'Invalid token',
      }
    }

    const tokens = require(path.join(this.app.baseDir, 'app/extend', this.config.custom.tokensFile))
    const current = tokens.filter(i => i.address === data.token)?.pop()
    let limit = 0
    const ipInfo = this.ctx.req.headers['x-real-ip'] ?? this.ctx.req.headers['x-forwarded-for'] ?? this.ctx.ip

    // todo: огринич по ип и кол-ву
    if (current?.limit > 0) {

      this.checkExistsLimits(data.address, ipInfo, current.symbol)

      if (this.app.limits[data.address].expire[current.symbol] < moment() && this.app.limits[ipInfo].expire[current.symbol] < moment()) {
        this.app.limits[data.address].limit[current.symbol] = this.app.limits[data.address].limit[current.symbol] >= current.limit ? 0 : this.app.limits[data.address].limit[current.symbol]
        this.app.limits[ipInfo].limit[current.symbol] = this.app.limits[ipInfo].limit[current.symbol] >= curret.day ? 0 : this.app.limits[ipInfo].limit[current.symbol]
        this.app.limits[data.address].expire[current.symbol] = moment().add(10, 'minute')
        this.app.limits[ipInfo].expire[current.symbol] = moment().add(1, 'day')
      }

      limit = this.app.limits[data.address].limit[current.symbol] > this.app.limits[ipInfo].limit[current.symbol] ? this.app.limits[data.address].limit[current.symbol] : this.app.limits[ipInfo].limit[current.symbol]

      if (limit + amount >= current.limit) {
        amount = Math.abs(current.limit - limit)
      }

      if (amount <= 0) {
        return this.ctx.body = {
          success: false,
          msg: 'OK',
          statusCode: 400,
          error: 'Daily limit exceeded',
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
      this.app.limits[data.address].limit[current.symbol] = limit + amount
      this.app.limits[ipInfo].limit[current.symbol] = limit + amount
    }

    this.ctx.body = {
      success: true,
      msg: 'OK',
      statusCode: 200,
      data: result,
    }
  }

  checkExistsLimits (address, ipInfo, symbol) {
    if (typeof this.app.limits[address] === 'undefined') {
      this.app.limits[address] = {}
    }

    if (typeof this.app.limits[address]?.expire?.[symbol] === 'undefined') {
      if (typeof this.app.limits[address].expire === 'undefined') {
        this.app.limits[address].expire = {}
      }
      this.app.limits[address].expire[symbol] = this.app.limits?.[ipInfo]?.expire?.[symbol] ?? moment().add(1, 'day')
    }

    if (typeof this.app.limits[address]?.limit?.[symbol] === 'undefined') {
      if (typeof this.app.limits[address].limit === 'undefined') {
        this.app.limits[address].limit = {}
      }
      this.app.limits[address].limit[symbol] = this.app.limits[ipInfo]?.limit?.[symbol] ?? 0
    }

    if (typeof this.app.limits[ipInfo] === 'undefined') {
      this.app.limits[ipInfo] = {}
    }

    if (typeof this.app.limits[ipInfo].expire?.[symbol] === 'undefined') {
      if (typeof this.app.limits[ipInfo].expire === 'undefined') {
        this.app.limits[ipInfo].expire = {}
      }
      this.app.limits[ipInfo].expire[symbol] = this.app.limits?.[address]?.expire?.[symbol] ?? moment().add(1, 'day')
    }

    if (typeof this.app.limits[ipInfo]?.limit?.[symbol] === 'undefined') {
      if (typeof this.app.limits[ipInfo].limit === 'undefined') {
        this.app.limits[ipInfo].limit = {}
      }
      this.app.limits[ipInfo].limit[symbol] = this.app.limits[address]?.limit?.[symbol] ?? 0
    }
  }
}

module.exports = HomeController