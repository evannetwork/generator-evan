'use strict'

const {
  api,
  Initializer
} = require('actionhero')

module.exports = class SmartAgent<%= NameWithoutSpecials %>Initializer extends Initializer {
  constructor () {
    super()
    this.name = '<%= name %>'
    this.loadPriority = 4100
    this.startPriority = 4100
    this.stopPriority = 4100
  }

  async initialize () {
    if (api.config.smartAgent<%= NameWithoutSpecials %>.disabled) {
      return
    }

    // specialize from blockchain smart agent library
    class SmartAgent<%= NameWithoutSpecials %> extends api.smartAgents.SmartAgent {
      async initialize () {
        await super.initialize()
      }
    }

    // start the initialization code
    const smartAgent<%= NameWithoutSpecials %> = new SmartAgent<%= NameWithoutSpecials %>(api.config.smartAgent<%= NameWithoutSpecials %>)
    await smartAgent<%= NameWithoutSpecials %>.initialize()

    // objects and values used outside initializer
    api.smartAgent<%= NameWithoutSpecials %> = smartAgent<%= NameWithoutSpecials %>
  }
}
