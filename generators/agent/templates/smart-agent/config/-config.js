exports['default'] = {

  ethAccounts: {
    <%- accounts %>
  },

  encryptionKeys: {
    <%- keys %>
  },

  smartAgent<%= NameWithoutSpecials %>: (api) => {
    return {
      disabled: false,
      name: '<%= name %>',
      ethAccount: '<%= account %>',
    }
  }
}
