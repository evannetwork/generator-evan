exports['default'] = {

  ethAccounts: {
    <%- accounts %>
  },

  encryptionKeys: {
    <%- keys %>
  },
  
  smartAgentFaucet: (api) => {
    return {
      disabled: false,
      name: '<%= name %>',
      ethAccount: '<%= account %>',
    }
  }
}
