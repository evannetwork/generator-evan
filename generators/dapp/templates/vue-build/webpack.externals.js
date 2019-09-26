/**
 * Returns the default webpack vue externals.
 *
 * @param      {any}     customExcludes  object with custom externals
 * @return     {Object}  object with all externals
 */
module.exports = function(customExcludes) {
  return {
    '@evan.network/api-blockchain-core': '@evan.network/api-blockchain-core',
    '@evan.network/smart-contracts-core': '@evan.network/smart-contracts-core',
    '@evan.network/ui': '@evan.network/ui',
    '@evan.network/ui-dapp-browser': '@evan.network/ui-dapp-browser',
    '@evan.network/ui-vue-core': '@evan.network/ui-vue-core',
    'axios': 'axios',
    'dexie': 'dexie',
    'vue': 'vue',
    'vue-material': 'vue-material',
    'vue-recaptcha': 'vue-recaptcha',
    'vue-router': 'vue-router',
    'vuex': 'vuex',
    'vuex-i18n': 'vuex-i18n',
    ...(customExcludes || { }) 
  };
}