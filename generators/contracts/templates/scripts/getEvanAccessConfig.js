/*
  Copyright (c) 2018-present evan GmbH.
 
  Licensed under the Apache License, Version 2.0 (the 'License');
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an 'AS IS' BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const runtimeConfig = require('../config/deployment').runtimeConfig

module.exports = () => {
  const evanAccessConfig = {
    accounts : {},
    dfs: runtimeConfig.ipfs,
    web3: runtimeConfig.web3,
    sourceFiles: [ "contracts" ]
  }
  Object.keys(runtimeConfig.accountMap).forEach((account) => {
    evanAccessConfig.accounts[account] = {
      private_key: runtimeConfig.accountMap[account],
      profile_key: runtimeConfig.encryptionKeys[account],
    }
  })
  return evanAccessConfig
}