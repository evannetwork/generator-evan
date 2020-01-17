const {series, task} = require('gulp')
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
let runtimes;

task('init-profiles', async () => {
  const provider = new Web3.providers.WebsocketProvider(runtimeConfig.web3Provider);
  web3 = new Web3(provider, null, { transactionConfirmationBlocks: 1 });

  await buildKeyConfig(web3, runtimeConfig);
  await checkBalances(web3, runtimeConfig);

  runtimes = await createRuntimes(web3, runtimeConfig);
 
  return evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later
}]))

task('ensure-profiles', series(['init-profiles']), async () => {
  await ensureProfiles(runtimes, runtimeConfig);
  await evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later
})
const ensureProfilesSeries = 

async function exchangeKeysTask() {
  await exchangeKeys(runtimes, runtimeConfig);
}
const exchangeKeysSeries = series(initProfilesTask, ensureProfilesTask, exchangeKeysTask);
exchangeKeysSeries.displayName = 'exchange-keys';

async function addBookmarksTask() {
  await addBookmarks(runtimes, runtimeConfig);
}
const addBookmarksSeries = series(initProfilesTask, ensureProfilesTask, addBookmarksTask)
addBookmarksSeries.displayName = 'add-bookmarks';

async function addToBusinessCentersTask(){
  addToBusinessCenters(runtimes, runtimeConfig);
}
const addToBusinessCentersSeries = series(initProfilesTask, addToBusinessCentersTask);
addToBusinessCentersSeries.displayName = 'add-to-business-centers';

async function inviteToContractsTask(done) {
  await inviteToContracts(runtimes, runtimeConfig);
  await evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later
}
const inviteToContractsSeries = series(initProfilesTask, inviteToContractsTask);
inviteToContractsSeries.displayName = 'invite-to-contracts';

async function createProfilesTask() {
  await ensureProfiles(runtimes, runtimeConfig);
  await exchangeKeys(runtimes, runtimeConfig);
  await addBookmarks(runtimes, runtimeConfig);
  await addToBusinessCenters(runtimes, runtimeConfig);
  await inviteToContracts(runtimes, runtimeConfig);
  await evan.cacheProfiles(runtimeConfig);   // so we can avoid checking on the network later

  web3.currentProvider.disconnect(1000);
  setTimeout(() => {console.log('Task finished successfully. Please press CTRL-C.')});
}
const createProfilesSeries = series(initProfilesTask, createProfilesTask);
createProfiles.displayName = 'create-profiles'


exports.createProfilesSeries = createProfilesSeries;
exports.inviteToContractsSeries = inviteToContractsSeries;
exports.addToBusinessCentersSeries = addToBusinessCentersSeries;
exports.addBookmarksSeries = addBookmarksSeries;
exports.exchangeKeysSeries = exchangeKeysSeries;
exports.default = createProfiles;
