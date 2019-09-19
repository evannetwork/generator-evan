'use strict'
const { Action, api } = require('actionhero')

const rxEtherAccount = /^0x[\da-fA-F]{40}/

class SmartAgent<%= NameWithoutSpecials %> extends Action {
  constructor () {
    super()
    this.name = 'smart-agents/<%= name %>/status/get'
    this.description = '<%= Name %> status action.'
    this.inputs = {
      accountId: {
        required: true,
        validator: this.accountValidator
      }
    }
    this.outputExample = { }
    // this.middleware = ['ensureEvanAuth']
  }

  accountValidator (param) {
    if (!param.match(rxEtherAccount)) {
      throw new Error('not a valid account address')
    }
  }

  async run ({ params, response }) {
    try {
      // if required, authenticated user / accountId can be retrieved from connection
      // this requires the "ensureEvanAuth" middleware to be enabled (see above)
      // const accountId = connection.evanAuth.EvanAuth

      response.result = `successful status call from accountId: ${params.accountId}`
      response.status = 'success'
    } catch (ex) {
      api.log(ex)
      response.status = 'error'
      response.error = ex
    }
  }
}

module.exports = {
  SmartAgent<%= NameWithoutSpecials %>
}
