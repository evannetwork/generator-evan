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

const { promisify } = require('util');

const prottle = require('prottle');
delete global._bitcore;   // -.-
const keystore = require('eth-lightwallet/lib/keystore');
delete global._bitcore;   // -.-

const {
  createDefaultRuntime,
  Profile,
} = require('@evan.network/api-blockchain-core');


const prottleMaxRequests = 10;

module.exports = {
  buildKeyConfig: async (web3, runtimeConfig) =>  {
    console.group('buildKeyConfig');
    runtimeConfig.accounts = runtimeConfig.accounts || [];
    runtimeConfig.accountMap = runtimeConfig.accountMap || {};
    runtimeConfig.keyConfig = runtimeConfig.keyConfig || {};
    runtimeConfig.memnonic2account = runtimeConfig.memnonic2account || {};
    for (let memnonic of Object.keys(runtimeConfig.memnonics)) {
      const vault = await promisify(keystore.createVault).bind(keystore)({
        seedPhrase: memnonic,
        password: runtimeConfig.memnonics[memnonic],
        hdPathString : 'm/45\'/62\'/13\'/7'
      });
      const pwDerivedKey = await promisify(vault.keyFromPassword).bind(vault)(runtimeConfig.memnonics[memnonic]);
      vault.generateNewAddress(pwDerivedKey, 1);
      const accountId = web3.utils.toChecksumAddress(vault.getAddresses()[0]);
      const pKey = vault.exportPrivateKey(accountId.toLowerCase(), pwDerivedKey);
      const dataKey = web3.utils.sha3(runtimeConfig.memnonics[memnonic]).substr(2);
      runtimeConfig.accounts.push(accountId);
      runtimeConfig.accountMap[accountId] = pKey;
      runtimeConfig.keyConfig[web3.utils.soliditySha3(accountId)] = dataKey;
      runtimeConfig.keyConfig[web3.utils.soliditySha3(web3.utils.soliditySha3(accountId), web3.utils.soliditySha3(accountId))] = dataKey;
      runtimeConfig.memnonic2account[memnonic] = accountId;
    }
    console.groupEnd('buildKeyConfig');
  },
  checkBalances: async (web3, runtimeConfig) => {
    console.group('checkBalances');
    // check balances
    let notEnoughBalance;
    const accounts = Object.keys(runtimeConfig.accountMap);
    const tasks = accounts.map((account) => {
      return async () => {
        const balance = parseInt(await web3.eth.getBalance(account), 10);
        if (balance < runtimeConfig.minBalance) {
          notEnoughBalance = true;
          console.log(`account ${account} does not have enough funds (${web3.utils.fromWei(balance.toString())} EVE)`)
        }
      };
    });
    await prottle(prottleMaxRequests, tasks);
    if (notEnoughBalance) {
      throw new Error(`at least one of the accounts does not have enough balance, make sure, accounts have at least ${web3.utils.fromWei(runtimeConfig.minBalance.toString())} EVE`);
    }
    console.groupEnd('checkBalances');
  },
  createRuntimes: async (web3, dfs, runtimeConfig) => {
    console.group('createRuntimes');
    const runtimes = {};
    for (let account of runtimeConfig.accounts) {
      const reducedRuntimeConfig = Object.assign({}, runtimeConfig);
      reducedRuntimeConfig.accountMap = {};
      reducedRuntimeConfig.accountMap[account] = runtimeConfig.accountMap[account];
      runtimes[account] = await createDefaultRuntime(web3, dfs, reducedRuntimeConfig);
    }
    console.groupEnd('createRuntimes');
    return runtimes;
  },
  ensureProfiles: async (runtimes, runtimeConfig) => {
    console.group('ensureProfiles');
    const tasks = Object.keys(runtimeConfig.memnonics).map((memnonic) => {
      const account = runtimeConfig.memnonic2account[memnonic];
      const accountRuntime = runtimes[account];
      return async () => {
        console.log(`checking profile for ${account}`);
        if (! await accountRuntime.profile.exists()) {
        // if (true) {
          console.log(`creating profile for ${account}`);
          const keys = await accountRuntime.keyExchange.getDiffieHellmanKeys();
          await accountRuntime.profile.createProfile(keys);
          const alias = runtimeConfig.aliases[memnonic] || runtimeConfig.aliases[account];
          if (alias) {
            console.log(`setting alias for ${account}`);
            await accountRuntime.profile.loadForAccount(accountRuntime.profile.treeLabels.addressBook);
            await accountRuntime.profile.addProfileKey(account, 'alias', alias);
            await accountRuntime.profile.storeForAccount(accountRuntime.profile.treeLabels.addressBook);
          }
          console.log(`created for ${account}`);
        }
      };
    });
    await prottle(prottleMaxRequests, tasks);
    console.groupEnd('ensureProfiles');
  },
  exchangeKeys: async (runtimes, runtimeConfig) => {
    console.group('exchangeKeys');
    for (let memnonic of Object.keys(runtimeConfig.contactConfig)) {
      const account = runtimeConfig.memnonic2account[memnonic];
      const runtime = runtimes[account];
      await runtime.profile.loadForAccount(runtime.profile.treeLabels.addressBook);
      if (!runtime) {
        throw new Error(`no private key found for ${account}, make sure, accounts you configured for key exchange are included in private key config as well`);
      }
      const contacts = runtimeConfig.contactConfig[memnonic];
      const tasks = contacts.map((contact) => {
        return async () => {
          const split = contact.split(':');
          if (split.length === 1 || split.length === 2 && split[0] === 'user') {
            // plain account, cover both sides
            const targetAccount = runtimeConfig.memnonic2account[contact];
            console.log(`checking key exchange from ${account} with user ${targetAccount}`);
            if (await runtime.profile.getContactKey(targetAccount, 'commKey')) {
            // if (false) {
              console.log(`key found from ${account} with user ${targetAccount}`);
            } else {
              console.log(`exchanging keys from ${account} with user ${targetAccount}`);
              const targetRuntime = runtimes[targetAccount];
              await targetRuntime.profile.loadForAccount(targetRuntime.profile.treeLabels.addressBook);
              // generate commKey
              const commKey = await runtime.keyExchange.generateCommKey();
              // store for current account
              await runtime.profile.addContactKey(targetAccount, 'commKey', commKey);
              await runtime.profile.addProfileKey(targetAccount, 'alias', runtimeConfig.aliases[contact]);
              await runtime.profile.storeForAccount(runtime.profile.treeLabels.addressBook);
              // store for target account
              await targetRuntime.profile.addContactKey(account, 'commKey', commKey);
              await targetRuntime.profile.addProfileKey(account, 'alias', runtimeConfig.aliases[memnonic]);
              await targetRuntime.profile.storeForAccount(targetRuntime.profile.treeLabels.addressBook);
            }
          } else if (split.length === 2 && split[0] === 'bmail') {
            // smart agent, send request only
            const targetAccount = split[split.length - 1];
            console.log(`checking key exchange from ${account} with account ${account}`);
            if (await runtime.profile.getContactKey(targetAccount, 'commKey')) {
            // if (false) {
              console.log(`key found from ${account} with account ${targetAccount}`);
            } else {
              const agentProfile = new Profile({
                accountId: targetAccount,
                contractLoader: runtime.contractLoader,
                dataContract: runtime.dataContract,
                executor: runtime.executor,
                ipld: runtime.ipld,
                nameResolver: runtime.nameResolver,
              });
              const targetPubkey = await agentProfile.getPublicKey();
              const commKey = await runtime.keyExchange.generateCommKey();
              await runtime.profile.addContactKey(targetAccount, 'commKey', commKey);
              const alias = runtimeConfig.aliases[targetAccount];
              if (alias) {
                console.log(`setting alias for ${memnonic || account}`);
                await runtime.profile.addProfileKey(account, 'alias', alias);
              }
              await runtime.profile.storeForAccount(runtime.profile.treeLabels.addressBook);
              await runtime.profile.loadForAccount(runtime.profile.treeLabels.addressBook);
              await runtime.keyExchange.sendInvite(targetAccount, targetPubkey, commKey, { fromAlias: account, });
            }
          } else {
            throw new Error(`unsupported format for contacts: "${contact}", use plain account id or prefix it with "agent" / "user"`);
          }
        };
      });
      await prottle(1, tasks);  // 1 -> avoid overwriting profile keys
    }
    console.groupEnd('exchangeKeys');
  },
  addBookmarks: async (runtimes, runtimeConfig) => {
    console.group('addBookmarks');
    const tasks = Object.keys(runtimeConfig.bookmarks).map((memnonic) => {
      const accountId = runtimeConfig.memnonic2account[memnonic];
      const accountRuntime = runtimes[accountId];
      return async () => {
        for (let bookmark of runtimeConfig.bookmarks[memnonic]) {
          const existingBookmark = await accountRuntime.profile.getDappBookmark(bookmark);
          const bookmarkDefinition = runtimeConfig.bookmarkDefinitions[bookmark];
          if (!existingBookmark && bookmarkDefinition) {
            console.log(`setting bookmark "${bookmark}" for account ${accountId}`);
            await accountRuntime.profile.loadForAccount(accountRuntime.profile.treeLabels.bookmarkedDapps);
            await accountRuntime.profile.addDappBookmark(bookmark, bookmarkDefinition);
            await accountRuntime.profile.storeForAccount(accountRuntime.profile.treeLabels.bookmarkedDapps);
          }
        }
      };
    });
    await prottle(prottleMaxRequests, tasks);
    console.groupEnd('addBookmarks');
  },
};