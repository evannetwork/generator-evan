const gulp = require('gulp')
const IpfsApi = require('ipfs-api');
const Web3 = require('web3');
const { Ipfs, } = require('@evan.network/api-blockchain-core');

const {
  addBookmarks,
  buildKeyConfig,
  checkBalances,
  createRuntimes,
  ensureProfiles,
  exchangeKeys,
  addToBusinessCenters,
  inviteToContracts,
} = require('../scripts/profiles-helper');

const runtimeConfig = require('../scripts/config/deployment.js').runtimeConfig;
const evan = require('../scripts/evan.access.js');

let web3;
let dfs;
let runtimes;

gulp.task('init-profiles', async () => {
  const provider = new Web3.providers.WebsocketProvider(runtimeConfig.web3Provider);
  web3 = new Web3(provider, null, { transactionConfirmationBlocks: 1 });

  await buildKeyConfig(web3, runtimeConfig);
  await checkBalances(web3, runtimeConfig);

  dfs = new Ipfs({
    dfsConfig:runtimeConfig.ipfs,
    web3: web3,
    accountId: runtimeConfig.accounts[0],
    privateKey: runtimeConfig.accountMap[runtimeConfig.accounts[0]]
  })
  runtimes = await createRuntimes(web3, runtimeConfig);
  return evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later
})

gulp.task('ensure-profiles', gulp.series(['init-profiles']), async () => {
  await ensureProfiles(runtimes, runtimeConfig);
  await evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later
})

gulp.task('exchange-keys', gulp.series(['init-profiles', 'ensure-profiles']), async () => {
  await exchangeKeys(runtimes, runtimeConfig);
})

gulp.task('add-bookmarks', gulp.series(['init-profiles', 'ensure-profiles']), async () => {
  await addBookmarks(runtimes, runtimeConfig);
})

gulp.task('add-to-business-centers', gulp.series(['init-profiles']), async () => {
  await addToBusinessCenters(runtimes, runtimeConfig);
})

gulp.task('invite-to-contracts', gulp.series(['init-profiles']), async () => {
  await inviteToContracts(runtimes, runtimeConfig);
  await evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later
})

gulp.task('create-profiles', gulp.series(['init-profiles']), async () => {
  await ensureProfiles(runtimes, runtimeConfig);
  await exchangeKeys(runtimes, runtimeConfig);
  await addBookmarks(runtimes, runtimeConfig);
  await addToBusinessCenters(runtimes, runtimeConfig);
  await inviteToContracts(runtimes, runtimeConfig);
  await evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later
})

gulp.task('default', gulp.series(['create-profiles']))
