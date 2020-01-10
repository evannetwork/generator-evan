const gulp = require('gulp')
const Web3 = require('web3');
const { createDefaultRuntime, Ipfs, } = require('@evan.network/api-blockchain-core');

const {
  deployRegistrar,
} = require('../scripts/registrar-helper');

const runtimeConfig = require('../scripts/config/deployment.js').runtimeConfig;


let web3;
let dfs;
let runtime;

gulp.task('init', gulp.series(async () => {
  if (!runtimeConfig.registrar.domainParentOwner ||
      !runtimeConfig.registrar.domainParentOwnerKey) {
    throw new Error('Missing ens parent domain owner setup. ' +
      'Provider those by setting them as environment keys "ENS_OWNER" and "ENS_OWNER_KEY"');
  }

  const provider = new Web3.providers.WebsocketProvider(runtimeConfig.web3Provider);
  web3 = new Web3(provider, null, { transactionConfirmationBlocks: 1 }); 

  const ensOwnerRuntimeConfig = JSON.parse(JSON.stringify(runtimeConfig))
  ensOwnerRuntimeConfig.accountMap = {};
  ensOwnerRuntimeConfig.accountMap[runtimeConfig.registrar.domainParentOwner] =
    runtimeConfig.registrar.domainParentOwnerKey;
  dfs = new Ipfs({
    dfsConfig:runtimeConfig.ipfs,
    web3: web3,
    accountId: runtimeConfig.registrar.domainParentOwner,
    privateKey: runtimeConfig.registrar.domainParentOwnerKey
  })
  runtime = await createDefaultRuntime(web3, dfs, ensOwnerRuntimeConfig);
}))

gulp.task('deploy-registrar', gulp.series(['init']), async () => {
  await deployRegistrar(runtime, runtimeConfig);
})


gulp.task('default', gulp.series(['deploy-registrar']));
