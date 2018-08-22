/*
  Copyright (c) 2018-present evan GmbH.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

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
} = require('../scripts/profiles-helper');

const runtimeConfig = require('../config/deployment.js').runtimeConfig;


let web3;
let dfs;
let runtimes;

gulp.task('init', async () => {
  web3 = new Web3();
  web3.setProvider(new web3.providers.WebsocketProvider(runtimeConfig.web3Provider));
  dfs = new Ipfs({ remoteNode: new IpfsApi(runtimeConfig.ipfs), });

  await buildKeyConfig(web3, runtimeConfig);
  await checkBalances(web3, runtimeConfig);
  runtimes = await createRuntimes(web3, dfs, runtimeConfig);
})

gulp.task('ensure-profiles', ['init'], async () => {
  await ensureProfiles(runtimes, runtimeConfig);
})

gulp.task('exchange-keys', ['init', 'ensure-profiles'], async () => {
  await exchangeKeys(runtimes, runtimeConfig);
})

gulp.task('add-bookmarks', ['init', 'ensure-profiles'], async () => {
  await addBookmarks(runtimes, runtimeConfig);
})

gulp.task('add-to-business-centers', ['init'], async () => {
  await addToBusinessCenters(runtimes, runtimeConfig);
})

gulp.task('create-profiles', ['init'], async () => {
  await exchangeKeys(runtimes, runtimeConfig);
  await addBookmarks(runtimes, runtimeConfig);
  await addToBusinessCenters(runtimes, runtimeConfig);
})

gulp.task('default', ['create-profiles'])
