const { bcConfig } = require('./config/deployment');

module.exports = {
  deployRegistrar: async (runtime, runtimeConfig) => {
    console.group('deployRegistrar');
    // create fifs registrar for testing and give it ownership over 'registrar.test.evan'
    const fifsRegistrar = await runtime.executor.createContract(
      'FIFSRegistrar',
      [bcConfig.nameResolver.ensAddress, runtime.nameResolver.namehash(runtimeConfig.registrar.domain)],
      { from: runtime.activeAccount, gas: 1000000, },
    )
    // assign parent domain to ens owner
    await runtime.nameResolver.setAddress(
      runtimeConfig.registrar.domainParent,
      null,
      runtime.activeAccount,
    )
    // assign domain to registrar
    await runtime.nameResolver.setAddress(
      runtimeConfig.registrar.domain,
      null,
      runtime.activeAccount,
      fifsRegistrar.options.address,
    )
    console.groupEnd('deployRegistrar');
  },
};