'use strict'
const { Action, api } = require('actionhero')

const rxEtherAccount = /^0x[\da-fA-F]{40}/

class SmartAgent<%= Name %> extends Action {
  constructor() {
    super()
    this.name = 'smart-agents/<%= name %>/<%= name %>'
    this.description = '<%= Name %> action.'
    this.inputs = {
      srcId: {
        required: true,
        validator: this.accountValidator
      },
    }
    this.outputExample = { }
  }

  accountValidator (param) {
    if (!param.match(rxEtherAccount))
      throw new Error('not a valid account address')
  }

  async run({ params, response }) {
    try {
      
      var srcId = await api.eth.web3.eth.accounts.recover(api.config.smartAgent<%= Name %>.sign_message,
                                                          params.srcSignature);
      if(srcId !== params.srcId) throw new Error("No verified Account.")
      
      /*
        do stuff
        api.smartAgent<%= Name %>.exampleFunction('some value')
      */
      
      response.status = 'success'
      
    } catch (ex) {
      api.log(ex)
      response.status = 'error'
      response.error = ex
    }
  }
}

module.exports = {
  SmartAgent<%= Name %>
}
