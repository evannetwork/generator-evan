/*
  Copyright (C) 2018-present evan GmbH.

  This program is free software: you can redistribute it and/or modify it
  under the terms of the GNU Affero General Public License, version 3,
  as published by the Free Software Foundation.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program. If not, see http://www.gnu.org/licenses/ or
  write to the Free Software Foundation, Inc., 51 Franklin Street,
  Fifth Floor, Boston, MA, 02110-1301 USA, or download the license from
  the following URL: https://evan.network/license/

  You can be released from the requirements of the GNU Affero General Public
  License by purchasing a commercial license.
  Buying such a license is mandatory as soon as you use this software or parts
  of it on other blockchains than evan.network.

  For more information, please contact evan GmbH at this address:
  https://evan.network/license/
*/

const Generator = require('yeoman-generator');
const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');
// Checks for available update and returns an instance
const notifier = updateNotifier({pkg, updateCheckInterval: 0});

// Notify using the built-in convenience method
notifier.notify({defer:false});

Object.defineProperty(global, '_bitcore', { get(){ return undefined }, set(){}, configurable: false });
const keystore = require('eth-lightwallet/lib/keystore');
const { createDefaultRuntime, Ipfs } = require(`@evan.network/api-blockchain-core`);
const Web3 = require('web3');
const { promisify } = require('util');
const request = require('request');
const fs = require('fs');

let runtime;

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)
  }
  /**
   * Ask the user for project information.
   *
   * @return     {Promise}  resolved when done
   */
  async prompting() {
    let done = false;

    while(!done) {
      const resultCreate = (await this.prompt([{
        type    : 'list',
        name    : 'done',
        message : 'Should i create a new account?',
        choices: [
          {
            name: 'Yes',
            value: false
          },
          {
            name: 'No',
            value: true
          },
        ]
      }])).done;

      if(resultCreate) {
        done = true;
        continue;
      }

      const newProfile = await this.prompt([
        {
          type : 'input',
          name : 'alias',
          message : 'Alias of the account'
        },
        {
          type : 'input',
          name : 'password',
          message : 'Password for the account (leave empty if it should be generated)',
          filter: (input) => {
            if (!input) {
              return this._generatePassword();
            } else {
              return input;
            }
          }
        }
      ]);

      newProfile.mnemonic = keystore.generateRandomSeed();


      const vault = await promisify(keystore.createVault).bind(keystore)({
        seedPhrase: newProfile.mnemonic,
        password: newProfile.password,
        hdPathString : 'm/45\'/62\'/13\'/7'
      });
      const pwDerivedKey = await promisify(vault.keyFromPassword).bind(vault)(newProfile.password);
      vault.generateNewAddress(pwDerivedKey, 1);


      const provider = new Web3.providers.WebsocketProvider(
        'wss://testcore.evan.network/ws',
        { clientConfig: { keepalive: true, keepaliveInterval: 5000 } },
      );
      const web3 = new Web3(provider, null, { transactionConfirmationBlocks: 1 });
      const accountId = web3.utils.toChecksumAddress(vault.getAddresses()[0]);
      const pKey = vault.exportPrivateKey(accountId.toLowerCase(), pwDerivedKey);

      const ipfs = new Ipfs({
        dfsConfig: {host: 'ipfs.test.evan.network', port: '443', protocol: 'https'},
        disablePin: true,
        accountId,
        privateKey: `0x${pKey}`,
        web3
      });

      const sha9Account = web3.utils.soliditySha3.apply(
        web3.utils.soliditySha3,
        [web3.utils.soliditySha3(accountId), web3.utils.soliditySha3(accountId)].sort()
      );
      const sha3Account = web3.utils.soliditySha3(accountId)
      const dataKey = web3.utils
        .keccak256(accountId + newProfile.password)
        .replace(/0x/g, '');
      const runtimeConfig = {
        accountMap: {
          [accountId]: pKey
        },
        keyConfig: {
          [sha9Account]: dataKey,
          [sha3Account]: dataKey
        }
      };
      runtime = await createDefaultRuntime(web3, ipfs, runtimeConfig);

      await this._createOfflineProfile(runtime, newProfile.alias, accountId, pKey)


      const managedAccounts = require(
        this.destinationPath(`${ this.destinationRoot() }/scripts/config/managedAccounts.js`)
      )

      managedAccounts[newProfile.alias.replace(/ /g, '')] = {
        alias: newProfile.alias,
        mnemonic: newProfile.mnemonic,
        password: newProfile.password,
        id: accountId,
        privateKey: pKey,
        profileKey: dataKey,
        contacts: [],
      }

      await promisify(fs.writeFile)(
        this.destinationPath(`${ this.destinationRoot() }/scripts/config/managedAccounts.js`),
        'module.exports = ' + JSON.stringify(managedAccounts,null,2))

      console.log(`created new profile ${newProfile.alias} with accountId ${accountId} and added it to scripts/config/managedAccounts.js`)
    }

  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  writing() {
    this._copyTemplateIntoDApps();

    console.log(`
      Scripts for managing profiles have been added to your project.
      You can configure them in your 'config/deployment.js' file

      To start the default task bundle, run
      gulp --gulpfile ./gulp/create-profiles.js

      You can also add the "create-profiles" or any subtask tasks from "./gulp/create-profiles.js" to your gulp tasks.
    `);

    // close web3 connection to allow generator to exit d
    runtime.web3.currentProvider.connection.close();
  }
  /**
   * Copy files from a path under the templates directory into the specific dapp folder
   */
  _copyTemplateIntoDApps() {
    this.fs.copyTpl(
      this.templatePath('**/{.[^.],}*'),
      this.destinationPath(`${ this.destinationRoot() }/`),
      this.answers,
      {
        globOptions: {
          dot: true
        }
      }
    );
  }

  _generatePassword() {
    var length = 8,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  async _createOfflineProfile(runtime, alias, accountId, pKey) {
    return new Promise(async (resolve, reject) => {
      const profile = runtime.profile;
      // disable pinning while profile files are being created
      profile.ipld.ipfs.disablePin = true;
      // clear hash log
      profile.ipld.hashLog = [];
      const dhKeys = runtime.keyExchange.getDiffieHellmanKeys();
      await profile.addContactKey(runtime.activeAccount, 'dataKey', dhKeys.privateKey.toString('hex'));
      await profile.addProfileKey(runtime.activeAccount, 'alias', alias);
      await profile.addPublicKey(dhKeys.publicKey.toString('hex'));
      const sharing = await runtime.dataContract.createSharing(runtime.activeAccount);
      const fileHashes = {};
      fileHashes[profile.treeLabels.addressBook] = await profile.storeToIpld(profile.treeLabels.addressBook);
      fileHashes[profile.treeLabels.publicKey] = await profile.storeToIpld(profile.treeLabels.publicKey);
      fileHashes.sharingsHash = sharing.sharingsHash;
      const cryptor = runtime.cryptoProvider.getCryptorByCryptoAlgo('aesEcb');
      fileHashes[profile.treeLabels.addressBook] = await cryptor.encrypt(
        Buffer.from(fileHashes[profile.treeLabels.addressBook].substr(2), 'hex'),
        { key: sharing.hashKey, }
      )
      fileHashes[profile.treeLabels.addressBook] = `0x${fileHashes[profile.treeLabels.addressBook].toString('hex')}`;
      // keep only unique values, ignore addressbook (encrypted hash)
      const addressBookHash = fileHashes[profile.treeLabels.addressBook];
      fileHashes.ipfsHashes = [...profile.ipld.hashLog, ...Object.keys(fileHashes).map(key => fileHashes[key])];
      fileHashes.ipfsHashes = (
        (arrArg) => arrArg.filter(
          (elem, pos, arr) => arr.indexOf(elem) === pos && elem !== addressBookHash)
        )(fileHashes.ipfsHashes);
      // clear hash log
      profile.ipld.hashLog = [];
      // re-enable pinning
      profile.ipld.ipfs.disablePin = false;

      var apiURL = 'https://agents.test.evan.network/api/smart-agents/faucet/handout?apiVersion=1';
      const pk = '0x' + pKey;
      const signature = runtime.web3.eth.accounts.sign('Gimme Gimme Gimme!', pk).signature

      request({
        url:'https://agents.test.evan.network/api/smart-agents/faucet/handout?apiVersion=1',
        method: 'POST',
        json: true,
        body: {
          accountId: accountId,
          signature: signature,
          profileInfo: fileHashes,
        }
      })
      .on('response', async (response) => {
        resolve()
      })
    })
  }
};
