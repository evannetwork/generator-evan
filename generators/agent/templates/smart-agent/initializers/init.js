'use strict'
var request = require('request')
const { Initializer, api } = require('actionhero')
const { Profile, KeyProvider, Ipld, ContractState, DataContract, Description, Sharing } = require('@evan.network/api-blockchain-core')

// configuration shortcut
const cfg = api.config.smartAgent<%= Name %>


module.exports = class SmartAgent<%= Name %> extends Initializer {
  constructor() {
    super()
    this.name = '<%= name %>'
    this.loadPriority = 4100
    this.startPriority = 4100
    this.stopPriority = 4100
  }

  async initialize() {
    if (cfg.disabled) return

    // objects and values used outside initializer
    api.smartAgent<%= Name %> = {
      /*
      exampleFunction: async (status) => {
      },
      */
    }

    // specialize from blockchain smart agent library
    class SmartAgent<%= Name %> extends api.smartAgents.SmartAgent {
      async initialize () { await super.initialize() }
    }

    // start the initialization code
    this.smartAgent<%= Name %> = new SmartAgent<%= Name %>(cfg)
    await this.smartAgent<%= Name %>.initialize()

  }

  async start() { }
  async stop() { api.log('Stopped Listening.', 'debug', this.name) }
}
