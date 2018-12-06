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
const { createDefaultRuntime, Ipfs, } = require('@evan.network/api-blockchain-core');

const {
  deployRegistrar,
} = require('../scripts/registrar-helper');

const runtimeConfig = require('../scripts/config/deployment.js').runtimeConfig;


let web3;
let dfs;
let runtime;

gulp.task('init', async () => {
  if (!runtimeConfig.registrar.domainParentOwner ||
      !runtimeConfig.registrar.domainParentOwnerKey) {
    throw new Error('Missing ens parent domain owner setup. ' +
      'Provider those by setting them as environment keys "ENS_OWNER" and "ENS_OWNER_KEY"');
  }

  web3 = new Web3();
  web3.setProvider(new web3.providers.WebsocketProvider(runtimeConfig.web3Provider));

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
})

gulp.task('deploy-registrar', ['init'], async () => {
  await deployRegistrar(runtime, runtimeConfig);
})


gulp.task('default', ['deploy-registrar']);
