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
  alwaysAutoGasLimit: 1.1
}

const runtimeConfig = {
  ipfs: { host: 'ipfs.evan.network', port: '443', protocol: 'https' },
  web3Provider: 'wss://testcore.evan.network/ws',
  minBalance: 1000000000000000000,
  mnemonics: {
    // account mnemonics and their data keys
    // 'race game grant legal illegal spring stable banana walk quiz vanish middle': 'some password',
    // 'recycle web high fan relax ignore chalk require main about casual near': 'another password',
  },
  aliases: {
    // account mnemonics and their aliases
    // 'race game grant legal illegal spring stable banana walk quiz vanish middle': 'Sample User 1',
    // 'recycle web high fan relax ignore chalk require main about casual near': 'Sample User 2',
  },
  contactConfig: {
    // accounts and their contacts, you only need to do this for one way
    // 'race game grant legal illegal spring stable banana walk quiz vanish middle': [
    //   'recycle web high fan relax ignore chalk require main about casual near',
    // ],
  },
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

module.exports = { bcConfig, runtimeConfig }
