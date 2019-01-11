'use strict'

const {
  api,
  Initializer,
} = require('actionhero')

// configuration shortcut
const config = api.config.smartAgent<%= NameWithoutSpecials %>


module.exports = class SmartAgent<%= NameWithoutSpecials %>Initializer extends Initializer {
  constructor() {
    super()
    this.name = '<%= name %>'
    this.loadPriority = 4100
    this.startPriority = 4100
    this.stopPriority = 4100
  }

  async initialize() {
    if (config.disabled) {
      return
    }

    // specialize from blockchain smart agent library
    class SmartAgent<%= NameWithoutSpecials %> extends api.smartAgents.SmartAgent {
      async initialize () {
        await super.initialize()
      }
    }

    // start the initialization code
    const smartAgent<%= NameWithoutSpecials %> = new SmartAgent<%= NameWithoutSpecials %>(config)
    await smartAgent<%= NameWithoutSpecials %>.initialize()

    // objects and values used outside initializer
    api.smartAgent<%= NameWithoutSpecials %> = smartAgent
  }
}
