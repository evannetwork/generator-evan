'use strict'
var request = require('request')
const { Initializer, api } = require('actionhero')
const { Profile, KeyProvider, Ipld, ContractState, DataContract, Description, Sharing } = require('@evan.network/api-blockchain-core')

// configuration shortcut
const cfg = api.config.smartAgent<%= NameWithoutSpecials %>


module.exports = class SmartAgent<%= NameWithoutSpecials %> extends Initializer {
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
    api.smartAgent<%= NameWithoutSpecials %> = {
      /*
      exampleFunction: async (status) => {
      },
      */
    }

    // specialize from blockchain smart agent library
    class SmartAgent<%= NameWithoutSpecials %> extends api.smartAgents.SmartAgent {
      async initialize () { await super.initialize() }
    }

    // start the initialization code
    this.smartAgent<%= NameWithoutSpecials %> = new SmartAgent<%= NameWithoutSpecials %>(cfg)
    await this.smartAgent<%= NameWithoutSpecials %>.initialize()

  }

  async start() { }
  async stop() { api.log('Stopped Listening.', 'debug', this.name) }
}
