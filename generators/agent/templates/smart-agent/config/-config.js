exports['default'] = {
  ethAccounts: {<% for (let i=0; i < accountKeys.length; i++) { %>
    '<%= accountKeys[i] %>': '<%= accounts[accountKeys[i]] %>'<% if(i < accountKeys.length -1) { %>,<%}%><% } %>
  },
  encryptionKeys: {<% for (let i=0; i < keysKeys.length; i++) { %>
    '<%= keysKeys[i] %>': '<%= keys[keysKeys[i]] %>'<% if(i < keysKeys.length -1) { %>,<%}%><% } %>
  },
  smartAgent<%= NameWithoutSpecials %>: (api) => {
    return {
      disabled: false,
      name: '<%= name %>',
      ethAccount: '<%= account %>'
    }
  }
}
