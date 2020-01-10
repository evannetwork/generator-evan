let bcc = null; // only initialize it if needed, since it takes a while
let busy = 0;
const { Ipfs, createDefaultRuntime } = require('@evan.network/api-blockchain-core');
const { soliditySha3: sha3 } = require('web3-utils');
const fs = require('fs');
const promisify = require('util').promisify;

const  options = require('./config/deployment.js').options;

const defaultWeb3 = 'wss://testcore.evan.network/ws';
const defaultDFS = {host: 'ipfs.test.evan.network', port: '443', protocol: 'https'};

let accessProfiles = {};
let managedProfiles = {};
let createdProfiles = {};

// the account sources to add
try{ accessProfiles = require('./config/externalAccounts.js') }
catch(e) { if (e.code !== "MODULE_NOT_FOUND") throw e }
try{ managedProfiles = require('./config/managedProfiles.js') }
catch(e) { if (e.code !== "MODULE_NOT_FOUND") throw e }

// createdProfiles can change doring execution, and is written back then
try{ createdProfiles = require('./config/createdProfiles.json') }
catch(e) { if (e.code !== "MODULE_NOT_FOUND") throw e }

function sha9(a, b) { 
  return sha3.apply(sha3, [sha3(a), sha3(b)].sort());
}

/*
  It is almost always a bad idea to have account data in repositories,
  especially public repositories.
  This is not just a security problem, it would also prevent developers to have own accounts configured.
  For this reason account data configuration is by default separated into own files in the config/ directory:

  externalAccounts.js  - precreated profiles that are used in development and deployment tasks
  managedAccounts.js   - profiles that are automatically created if they don't exist already
  createdProfiles.js   - the profiles that have already been created - generated when profiles are created

  From those files a config object that can actually be used by blockchain-core is created and returned.
  The returned config object can be further edited or used immediately with default values.
  The runtimeConfig expected by the blockchain creation tools can use mnemonics or accountIds as lookup keys
  maybe shortened IDs in the future, but not aliases

  evanCfg    - an optional and reduced blockchain-core to overwrite default config values
               actual account fields are filled in from account config files and accountCfg
  accountCfg - you can provide accessProfiles via argument that will be merged with what is read from the file
*/
function getAccountConfig(evanConfig = {}, accountConfig = {}, createConfig = {} ) {

  // default runtime config
  const config = {
    ensureProfiles: false,
    accounts: [], accountMap: {}, keyConfig: {},
    mnemonics: {} , aliases: {}, contactConfig: {},
    ipfs: defaultDFS,
    web3Provider: defaultWeb3,
    contractsLoadPath: [ 'build/contracts', 'contracts' ]
  }

  Object.assign(config, evanConfig)

  function mapAccount(profileName, profile) {
    if(!profile.id || !profile.privateKey || !profile.profileKey) {
      return console.log('Skipped loading account ', profileName)
    }

    config.accounts.push(profile.id)
    config.accountMap[profile.id] = profile.privateKey
    config.keyConfig[sha3(profile.id)] = profile.profileKey
    config.keyConfig[sha9(profile.id, profile.id)] = profile.profileKey
  }

  Object.assign(accessProfiles, accountConfig)
  Object.assign(managedProfiles, createConfig)


  for(const profile in accessProfiles) {
    mapAccount(profile, accessProfiles[profile])
  }

  // first fetch the accounts to create from the original runtime config
  for(let aliasName in config.aliases) {
    const alias = config.aliases[aliasName];
    const account = createdProfiles.accounts[alias];
    if(account) {
      mapAccount(alias, account);
      console.log('Already created, loading ', alias);
    }
  }

  for(const profileName in managedProfiles) {
    const managedProfile = managedProfiles[profileName];
    const createdProfile = createdProfiles[profileName];

    if(createdProfile) {
      mapAccount(profileName, createdProfile);
    }

    if(!managedProfile.mnemonic || !managedProfile.password || !managedProfile.alias) {
      console.log('skipped creating account ', profileName);
    }
    else {
      config.ensureProfiles = true;
      config.mnemonics[managedProfile.mnemonic] = managedProfile.password;
      config.aliases[managedProfile.mnemonic] = managedProfile.alias;
      if(managedProfile.contacts && managedProfile.contacts.length) {
        const key = managedProfile.id || managedProfile.mnemonic;
        config.contactConfig[key] = [];
        for(let contactName of managedProfile.contacts) {
          const contact = accessProfiles[contactName] || managedProfiles[contactName];
          config.contactConfig[key].push(contact.id || contact.mnemonic);
        }
      }
    }
  }

  config.activeAccount = config.activeAccount || config.accounts[0];

  return config
}

// creating profiles, is done by profiles-helper
// in this file we only load profiles and parse/edit configs

async function cacheProfiles(config) {

  const createRTCache = {}
  for(let mn in config.mnemonic2account) {
    const accountId = config.mnemonic2account[mn]

    let addToCache = true

    for(let profile in createdProfiles) {
      if(profile.id === accountId) { 
        addToCache = false; 
        break;
      } 
    }

    if (addToCache) {

      console.log('caching ', config.aliases[mn],'/',accountId)
      createRTCache[config.aliases[mn]] = {
        id: accountId,
        alias: config.aliases[mn],
        mnemonic: mn,
        password: config.mnemonics[mn],
        privateKey: config.accountMap[accountId],
        profileKey: config.keyConfig[sha3(accountId)],
        contacts: [],
      }
    }
  }

  if(Object.keys(createRTCache).length) {
    Object.assign(createdProfiles, createRTCache)
    return promisify(fs.writeFile)( __dirname + '/config/createdProfiles.json', JSON.stringify(createdProfiles, null, 2))
  }
}


// this just loads existing accounts, cached or preconfigured
// if you want to create profiles, don't use this, it never loads the profile-helpers
async function init(cfg = {}) {
  // if we really want to support mulitple different blockchain cores with different cfg at the same time,
  // we need a real stack to manage this
  busy += 1;
  if (bcc) {
    return bcc;
  }
  cfg = Object.assign(options, cfg);
  cfg = getAccountConfig(cfg);

  // important!
  cfg.keyConfig[sha3('mailboxKeyExchange')] =
    '346c22768f84f3050f5c94cec98349b3c5cbfa0b7315304e13647a4918ffff22';     // accX <--> mailbox edge key

  const provider = new Web3.providers.WebsocketProvider(
    runtimeConfig.web3Provider, { clientConfig: { keepalive: true, keepaliveInterval: 5000 } });
  const web3 = new Web3(provider, null, { transactionConfirmationBlocks: 1 });
  const dfs = new Ipfs({
    dfsConfig:cfg.ipfs,
    web3: web3,
    accountId:
    cfg.accounts[0],
    privateKey:cfg.accountMap[cfg.accounts[0]]
  });

  return createDefaultRuntime(web3, dfs, cfg)
    .then(v => {
      v.accounts = cfg.accounts;
      bcc = v;
      console.log('Connected to evan.network as ', v.accounts[0]);
      return v
    })
}

function close() {
  busy -= 1;
  if(busy && !bcc) {
    return;
  }
  bcc.web3.currentProvider.connection.close();
  bcc.dfs.stop().then(() => process.exit(0));
}

function upload(files) {
  const live = 'live/';
  files = Array.isArray(files) ? files : [files];
  return  async () => {
    const fileContents = await Promise.all(files.map(f => promisify(fs.readFile)(f)));

    const args = []
    for(let i in files) {
      args.push({ path: files[i], content: fileContents[i] });
    }

    await init();
    const hashes = await bcc.dfs.addMultiple(args);
    const map = {};
    for(let i in hashes) {
      map[files[i]] = hashes[i];
    }
    await Promise.all(
      hashes.map((v,i) => promisify(fs.appendFile)(live + files[i], Ipfs.bytes32ToIpfsHash(hashes[i])+'\n', 'utf-8'))
    )
    close();

    return map;
  }
}

module.exports = { bcc, init, close, upload, getAccountConfig, cacheProfiles };
