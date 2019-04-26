const { api, CLI } = require('actionhero')

module.exports = class <%= NameWithoutSpecials %>Command extends CLI {
  constructor () {
    super()
    this.name = '<%= name %>'
    this.description = '<%= name %> command'
    this.example = 'actionhero <%= name %> --prefix actionhero'
  }

  inputs () {
    return {
      prefix: {
        required: true,
        default: 'actionhero',
        note: '<%= name %> command'
      }
    }
  }

  async run ({ params }) {
    // use same
    let keys = await api.redis.clients.client.keys(params.prefix)
    return keys
  }
}
