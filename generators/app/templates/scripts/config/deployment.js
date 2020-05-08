const externalAccounts = require('./externalAccounts');
const managedAccounts = require('./managedAccounts');

const bcConfig = {
  nameResolver: {
    ensAddress: process.env.ENS_ADDRESS || '0x937bbC1d3874961CA38726E9cD07317ba81eD2e1',
    ensResolver: process.env.ENS_RESOLVER || '0xDC18774FA2E472D26aB91deCC4CDd20D9E82047e',
    labels: {
      businessCenterRoot: process.env.BC_ROOT || 'testbc.evan',
      ensRoot: process.env.ENS_ROOT || 'evan',
      factory: 'factory',
      admin: 'admin',
      eventhub: 'eventhub',
      profile: 'profile',
      mailbox: 'mailbox'
    },
    domains: {
      root: ['ensRoot'],
      factory: ['factory', 'businessCenterRoot'],
      adminFactory: ['admin', 'factory', 'ensRoot'],
      businessCenter: ['businessCenterRoot'],
      eventhub: process.env.ENS_EVENTS || ['eventhub', 'ensRoot'],
      profile: process.env.ENS_PROFILES || ['profile', 'ensRoot'],
      profileFactory: ['profile', 'factory', 'ensRoot'],
      mailbox: process.env.ENS_MAILBOX || ['mailbox', 'ensRoot'],
    },
  },
  smartAgents: {
    onboarding: {
      accountId: '0x063fB42cCe4CA5448D69b4418cb89E663E71A139',
    },
  },
  alwaysAutoGasLimit: 1.1,
  ensRootOwner: '0x4a6723fC5a926FA150bAeAf04bfD673B056Ba83D',
}

let runtimeConfig = {
  useIdentity: true,
  web3Provider: 'wss://testcore.evan.network/ws',                              // default value
  ipfs: { host: 'ipfs.test.evan.network', port: '443', protocol: 'https' },    // default value
  minBalance: 1000000000000000000,
  bookmarkDefinitions: {
    // bookmarks as ENS domain and DBCP for bookmark
    // "sample.evan": {
    //   "name": "sample",
    //   "description": "evan.network sample bookmark",
    //   "i18n": {
    //     "description": {
    //       "en": "evan.network sample"
    //     },
    //     "name": {
    //       "en": "sample"
    //     }
    //   },
    //   // ...
    // }
  },
  bookmarks: {
    // accounts and their bookmarks as ENS domain names
    // 'race game grant legal illegal spring stable banana walk quiz vanish middle': ['sample.evan'],
  },
  businessCenters: {
    // 'sample.evan': {
    //   owner: '0x0000000000000000000000000000000000000001',
    //   members: [
    //     'race game grant legal illegal spring stable banana walk quiz vanish middle',
    //     'recycle web high fan relax ignore chalk require main about casual near',
    //   ],
    // },
  },
  contracts: {
    // // contract id or ens name
    // '0xc0274ac700000000000000000000000000000000': {
    //   // mnemonic or account id
    //   owner: 'race game grant legal illegal spring stable banana walk quiz vanish middle',
    //   members: [{
    //     // mnemonic or account id
    //     account: 'recycle web high fan relax ignore chalk require main about casual near',
    //     sharings: ['*']
    //   }],
    // }
  },
  registrar: {
    // // subdomains of this are claimable
    // domain: 'certificates.sartorius.evan',
    // // parent domain for registrar, has to be owned by 'domainParentOwner'
    // domainParent: 'sartorius.evan',
    // // owner of 'domainParent', registers and assigns 'domain' to new registrar
    // domainParentOwner: process.env.ENS_OWNER,
    // // Ethereum private key of 'domainParentOwner'
    // domainParentOwnerKey: process.env.ENS_OWNER_KEY,
  },
}

const evan = require('../evan.access.js')
runtimeConfig = evan.getAccountConfig(runtimeConfig, externalAccounts, managedAccounts)

module.exports = { bcConfig, runtimeConfig, };