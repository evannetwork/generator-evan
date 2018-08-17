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

let bcc = null  // only initialize it if needed, since it takes a while
let busy = 0
const Transform = require('stream').Transform
const IpfsApi = require('ipfs-api')
const BCC = require('@evan.network/api-blockchain-core')
const { Ipfs, createDefaultRuntime, PropertyType, ModificationType } = BCC
const Web3 = require('web3')
const path = require('path')
const fs = require('fs')
const pfy = require('util').promisify


// the configuration/accounts used to work on the eblockchain in this project
const cfg = require('./evan.json')

const sha3 = Web3.utils.soliditySha3
function sha9(a, b) { return sha3.apply(sha3, [sha3(a), sha3(b)].sort()) }

const defaultWeb3 = 'wss://testcore.evan.network/ws'
const defaultDFS = {host: 'ipfs.evan.network', port: '443', protocol: 'https'}

const default_config = {
  accounts : {
    "0xB68997a5159d8d074E70561baF245Bef56eDB6a4": {
      "private_key": "ab94c7ca5247b989a4d57d8b8943106a2d8af785968a0bea086f1b57f5e7a324",
      "profile_key": "ae2b7832049db054f528cc079aeffb40b634c6bce4ff9f8dbf61adc1e307bb09"
    }
  },
  dfs: defaultDFS,
  web3: defaultWeb3,
  sourceFiles: [ "contracts" ]
}

function example_gulp_plugin() {
  const transformStream = new Transform({objectMode: true})
  
  transformStream._transform = async (file, encoding, callback) => {
  }
  return transformStream;
}


async function init(cfg) {
  // if we really want to support mulitple different blockchain cores with different cfg at the same time,
  // we need a real stack to manage this
  ++busy
  if (bcc) return bcc
  cfg = cfg || default_config
  const accounts = Object.keys(cfg.accounts)
  const config = { accounts, accountMap: {}, keyConfig: {},
                   ipfs: cfg.dfs || default_config.dfs,
                   web3Provider: cfg.web3 || default_config.web3,
                   contractsLoadPath: [ 'build/contracts', 'contracts' ]
                 }
  
  for(const account of accounts) {
    config.accountMap[account] = cfg.accounts[account].private_key
    const profile_key = cfg.accounts[account].profile_key

    // dataKeys
    config.keyConfig[sha3(account)] = profile_key

    // commKeys, talking with yourself takes just your normal data key
    // but you need to look it up like all the other edge keys, with a combined hash
    config.keyConfig[sha9(account, account)] = profile_key
  }
  
  // important!
  config.keyConfig[sha3('mailboxKeyExchange')] =
    '346c22768f84f3050f5c94cec98349b3c5cbfa0b7315304e13647a4918ffff22'     // accX <--> mailbox edge key

  const web3 = new Web3()
  web3.setProvider(new web3.providers.WebsocketProvider(config.web3Provider))
  const dfs = new Ipfs({ remoteNode: new IpfsApi(config.ipfs), })
  return createDefaultRuntime(web3, dfs, config)
    .then(v => { v.accounts  = accounts;
                 bcc = v;
                 console.log('Connected to evan.network as ', accounts[0]);
                 return v})
    .catch(e => { throw e })
}

function close() {
  if( --busy && !bcc) return
  bcc.web3.currentProvider.connection.close();
  bcc.dfs.stop().then(() => process.exit(0));
}

function instantiate(name, arguments, gas, owner) {
  init(cfg)
  if(!bcc.contractLoader.contracts[name]) return console.error('Could not find: ', name)
  if(!owner) owner = bcc.activeAccount

  bcc.executor.createContract(name, arguments,
                              { from: A, gas: gas })
    .then(c => {
    })
  close()
}

function compile(src, dst) {
  return async () => {
    const Solc = require('@evan.network/smart-contracts-core').Solc

    const scc = new Solc({ log: console.log, config: { compileContracts: true } })
    const srcR = path.resolve(process.cwd(), src)
    const dstR = path.resolve(process.cwd(), dst)
    return scc.ensureCompiled(srcR, dstR)
  }
}



function upload(files) {
  const live = 'live/'
  files = Array.isArray(files) ? files : [files]
  return  async () => {
    const ei = init(cfg)
    // TODO: check file dates to only upload if new
    //const ifiles = await Promise.all(files.map( v => pfy(fs.stat)(v) ))
    //const lfiles = await Promise.all(files.map( v => pfy(fs.stat)(live+v) ))

    //const ffiles
    const pfiles = await Promise.all(files.map(f => pfy(fs.readFile)(f)))

    const args = []
    for(let i in files) 
      args.push({ path: files[i], content: pfiles[i] })

    await ei
    const hashes = await bcc.dfs.addMultiple(args)
    const map = {}
    for(let i in hashes) map[files[i]] = hashes[i]
    await Promise.all(hashes.map((v,i) => pfy(fs.appendFile)(live + files[i], Ipfs.bytes32ToIpfsHash(hashes[i])+'\n', 'utf-8')))
    close()

    return map
  }
}

function download() {}

module.exports = { bcc, init, close, compile, instantiate, upload }
