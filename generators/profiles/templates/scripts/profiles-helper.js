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
    runtimeConfig.mnemonic2account = runtimeConfig.mnemonic2account || {};
    for (let mnemonic of Object.keys(runtimeConfig.mnemonics)) {
      const vault = await promisify(keystore.createVault).bind(keystore)({
        seedPhrase: mnemonic,
        password: runtimeConfig.mnemonics[mnemonic],
        hdPathString : 'm/45\'/62\'/13\'/7'
      });
      const pwDerivedKey = await promisify(vault.keyFromPassword).bind(vault)(runtimeConfig.mnemonics[mnemonic]);
      vault.generateNewAddress(pwDerivedKey, 1);
      const accountId = web3.utils.toChecksumAddress(vault.getAddresses()[0]);
      const pKey = vault.exportPrivateKey(accountId.toLowerCase(), pwDerivedKey);
      const dataKey = web3.utils.sha3(runtimeConfig.mnemonics[mnemonic]).substr(2);
      runtimeConfig.accounts.push(accountId);
      runtimeConfig.accountMap[accountId] = pKey;
      runtimeConfig.keyConfig[web3.utils.soliditySha3(accountId)] = dataKey;
      runtimeConfig.keyConfig[web3.utils.soliditySha3(web3.utils.soliditySha3(accountId), web3.utils.soliditySha3(accountId))] = dataKey;
      runtimeConfig.mnemonic2account[mnemonic] = accountId;
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
    for (let account of Object.keys(runtimeConfig.accountMap)) {
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
    const tasks = Object.keys(runtimeConfig.mnemonics).map((mnemonic) => {
      const account = runtimeConfig.mnemonic2account[mnemonic];
      const accountRuntime = runtimes[account];
      return async () => {
        console.log(`checking profile for ${account}`);
        if (! await accountRuntime.profile.exists()) {
        // if (true) {
          console.log(`creating profile for ${account}`);
          const keys = await accountRuntime.keyExchange.getDiffieHellmanKeys();
          await accountRuntime.profile.createProfile(keys);
          const alias = runtimeConfig.aliases[mnemonic] || runtimeConfig.aliases[account];
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
    for (let mnemonic of Object.keys(runtimeConfig.contactConfig)) {
      const account = runtimeConfig.mnemonic2account[mnemonic];
      const runtime = runtimes[account];
      await runtime.profile.loadForAccount(runtime.profile.treeLabels.addressBook);
      if (!runtime) {
        throw new Error(`no private key found for ${account}, make sure, accounts you configured for key exchange are included in private key config as well`);
      }
      const contacts = runtimeConfig.contactConfig[mnemonic];
      const tasks = contacts.map((contact) => {
        return async () => {
          const split = contact.split(':');
          if (split.length === 1 || split.length === 2 && split[0] === 'user') {
            // plain account, cover both sides
            const targetAccount = runtimeConfig.mnemonic2account[contact];
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
              await targetRuntime.profile.addProfileKey(account, 'alias', runtimeConfig.aliases[mnemonic]);
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
                console.log(`setting alias for ${mnemonic || account}`);
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
    const tasks = Object.keys(runtimeConfig.bookmarks).map((mnemonic) => {
      const accountId = runtimeConfig.mnemonic2account[mnemonic];
      const accountRuntime = runtimes[accountId];
      return async () => {
        for (let bookmark of runtimeConfig.bookmarks[mnemonic]) {
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
  addToBusinessCenters: async (runtimes, runtimeConfig) => {
    debugger;
    console.group('addToBusinessCenters');
    // pick first runtime for read operation (account id behind doesn't matter)
    const runtime = runtimes[Object.keys(runtimes)[0]];
    for (let bc of Object.keys(runtimeConfig.businessCenters)) {
      const owner = runtimeConfig.businessCenters[bc].owner;
      const bcAddress = await runtime.nameResolver.getAddress(bc);
      const bcContract = runtime.contractLoader.loadContract('BusinessCenterInterface', bcAddress);
      // get business center join schema
      const joinSchema = JSON.parse(
        await runtime.executor.executeContractCall(bcContract, 'joinSchema'));

      const tasks = runtimeConfig.businessCenters[bc].members.map((mnemonic) => async () => {
        const member = runtimeConfig.mnemonic2account[mnemonic];
        if (await runtime.executor.executeContractCall(bcContract, 'isMember', member)) {
          // continue if already member
          console.log(`account "${member}" is already a member of "${bc}"`);
          return;
        }
        // validate requirements for schemas: SelfJoin, AddOnly, Handshake, JoinOrAdd
        if (joinSchema === 0 && !runtimes[member]) {
          throw new Error(`bc "${bc}" has join schema "SelfJoin", ` +
            `but no member runtime found for account "${member}"`);
        } else if (joinSchema === 1 && !owner) {
          throw new Error(`bc "${bc}" has join schema "AddOnly", ` +
            `but no owner runtime found for account "${owner}"`);
        } else if (joinSchema === 2 && (!owner || !runtimes[member])) {
          throw new Error(`bc "${bc}" has join schema "Handshake", ` +
            `but either no owner runtime for "${owner}" or no member runtime found for "${member}"`);
        } else if (joinSchema === 3 && !owner && !runtimes[member]) {
          throw new Error(`bc "${bc}" has join schema "JoinOrAdd", ` +
            `but no owner runtime for "${owner}" and no member runtime found for "${member}"`);
        }
        // join schema is SelfJoin, Handshake, if JoinOrAdd try to use member runtime
        if (joinSchema === 0 || joinSchema === 2 || (joinSchema === 3 && runtimes[member])) {
          // join as new member
          console.log(`joining with account "${member}"`);
          await runtimes[member].executeContractTransaction(bcContract, 'join', { from: member, });
        }
        // if join schema is AddOnly or Handshake, if JoinOrAdd and no member runtime
        if (joinSchema === 1 || joinSchema === 2 || (joinSchema === 3 && !runtimes[member])) {
          // invite new member
          console.log(`inviting "${member}" with account "${owner}"`);
          await runtimes[owner].executor.executeContractTransaction(bcContract, 'invite', { from: owner, }, member);
        }
      });
      if (tasks.length) {
        await prottle(prottleMaxRequests, tasks);
      }
    }
    console.groupEnd('addToBusinessCenters');
  },
  inviteToContracts: async (runtimes, runtimeConfig) => {
    console.group('inviteToContracts');
    for (let contractKey of Object.keys(runtimeConfig.contracts)) {
      console.group(`contract ${contractKey}`);
      const contract = runtimeConfig.contracts[contractKey];
      const ownerRuntime = runtimes[contract.owner];
      let ownerId;
      if (contract.owner.startsWith('0x')) {
        ownerId = contract.owner;
      } else {
        ownerId = runtimeConfig.mnemonic2account[contract.owner];
      }
      let contractId;
      if (contractKey.startsWith('0x')) {
        contractId = contractKey;
      } else {
        contractId = await ownerRuntime.nameResolver.getAddress(contractKey);
      }
      let businessCenterId;
      if (!contract.businessCenter) {
        businessCenterId = null;
      } else if (contract.businessCenter.startsWith('0x')) {
        businessCenterId = contract.businessCenter;
      } else {
        businessCenterId = await ownerRuntime.nameResolver.getAddresses(contract.businessCenter);
      }
      const tasks = contract.members.map((member) => {
        return async() => {
          console.group(`member ${member.account}`);
          let memberId;
          if (member.account.startsWith('0x')) {
            memberId = member.account;
          } else {
            memberId = runtimeConfig.mnemonic2account[member.account];
          }
          await ownerRuntime.dataContract.inviteToContract(businessCenterId, contractId, ownerId, memberId);
          for (let sharing of member.sharings) {
            console.log(`sharing ${sharing}`);
            const contentKey = await ownerRuntime.sharing.getKey(contractId, ownerId, sharing);
            await ownerRuntime.sharing.addSharing(contractId, ownerId, memberId, sharing, 0, contentKey);
          }
          console.groupEnd(`member ${member}`);
        };
      });
      await prottle(1, tasks);
      console.groupEnd(`contract ${contractKey}`);
    }
    console.groupEnd('inviteToContracts');
  },
};