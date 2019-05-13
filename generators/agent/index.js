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

const { promisify } = require('util')
const Generator = require('yeoman-generator');
const Web3 = require('web3-utils')
const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');
// Checks for available update and returns an instance
const notifier = updateNotifier({pkg, updateCheckInterval: 0});

// Notify using the built-in convenience method
notifier.notify({ defer:false });


const sha3 = Web3.soliditySha3
function sha9(a, b) { return sha3.apply(sha3, [sha3(a), sha3(b)].sort()) }

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
    var external
    var created
    const accounts =  [] //{ name: 'none', value: '', checked: true} ]

    try {
      external = require(this.destinationPath('./scripts/config/externalAccounts.js'))
    } catch (e) {
      if (e.code !== "MODULE_NOT_FOUND") {
        throw e;
      }
    }

    created = require(this.destinationPath('./scripts/config/managedAccounts.js'))

    this.answers = await this.prompt([
      {
        type    : 'input',
        name    : 'name',
        message : 'Name the agent: smart-agent-*',
        default : this.appname.replace(/\s+/g, '-'),     // Default to current folder name
      },
      {
        type    : 'input',
        name    : 'description',
        message : 'What does the agent do? Describe it.',
        default : this.appname.replace(/\s+/g, '-'),     // Default to current folder name
      },
      {
        type    : 'checkbox',
        name    : 'components',
        message : `
        Choose which functionalities you will need in your agent.
        config and initializers are practically always required.
        `,
        choices : [
          {
            name : "config",
            value: 'config/',
            checked: true,
          },
          {
            name : 'initializers',
            value: 'initializers/',
            checked: true,
          },
          {
            name : 'actions/web requests',
            value: 'actions/',
          },
          {
            name : 'commands/command line tools',
            value: 'bin/',
          },
        ],
      },
      {
        type    : 'checkbox',
        name    : '_accounts',
        message : 'Add accounts to smart agent configuration:',
        choices : (answers) => {

          if(external) {
            for(let k in external) {
              accounts.push({
                name: [external[k].alias, external[k].id].join(', '),
                value: {
                  id: external[k].id,
                  privateKey: external[k].privateKey,
                  profileKey: external[k].profileKey,
                },
              })
            }
          }

          if(created) {
            for(let k in created) {
              accounts.push({
                name: [created[k].alias, created[k].id].join(', '),
                value: {
                  id: created[k].id,
                  privateKey: created[k].privateKey,
                  profileKey: created[k].profileKey,
                },
              })
            }
          }

          return accounts
        },
        when: accounts.length,
      },
    ])

    this.answers['Name'] = this.answers.name[0].toUpperCase() + this.answers.name.substr(1)
    this.answers['NameWithoutSpecials'] = this._toCamelCase(this.answers['Name'])
    this.answers['fullname'] = 'smart-agent-' + this.answers.name

    this.answers.account = this.answers._accounts.length ? this.answers._accounts[0].id : ''

    this.answers.keys = { }
    this.answers.accounts = { }

    for(let a of this.answers._accounts) {
      this.answers.accounts[a.id] = a.privateKey
      this.answers.keys[sha3(a.id)] = a.profileKey
      this.answers.keys[sha9(a.id,a.id)] = a.profileKey
    }
    this.answers.accountKeys = Object.keys(this.answers.accounts)
    this.answers.keysKeys = Object.keys(this.answers.keys)
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  async writing() {
    const pkg = this.fs.readJSON('./package.json')
    if(!pkg.dependencies['@evan.network/edge-server-seed']) {
      pkg.dependencies['@evan.network/edge-server-seed'] = '^1.0.0'
      pkg.scripts['start'] = "cd node_modules/@evan.network/edge-server-seed && npm start"
      pkg.scripts['debug'] = "cd node_modules/@evan.network/edge-server-seed && npm run debug"
      this.fs.writeJSON('./package.json', pkg, null, 2)

      console.log(`
      Added developer dependency for edge-server-seed, running 'npm i' to install.
      `)

      this._copyTemplate('root','');
    }

    await this._copyTemplate('smart-agent', this.answers.fullname);

    await this.fs.copyTpl(
      this.templatePath(`smart-agent/.*`),
      this.destinationPath(this.answers.fullname),
      this.answers,
      {
        globOptions: {
          dot: true
        }
      }
    );

    const renameOrDelete = (key,src,dst) => {
      if(this.answers.components.indexOf(key) >= 0) {
        this.fs.move(this.destinationPath(this.answers.fullname + '/' + key + src),
                     this.destinationPath(this.answers.fullname + '/' + key + dst))
      }
      else {
        this.fs.delete(this.destinationPath(this.answers.fullname + '/'+ key))
      }
    }

    renameOrDelete('actions/', '-actions.js', `${this.answers.fullname}-actions.js`)
    renameOrDelete('bin/', '-cmd.js', `${this.answers.fullname}-cmd.js`)
    renameOrDelete('config/', '-config.js', `${this.answers.fullname}-config.js`)
    renameOrDelete('initializers/', '-initializers.js', `${this.answers.fullname}-initializers.js`)

  }

  install() {
    this.npmInstall([], {}, null, { cwd: this.destinationPath(this.answers.fullname) });
    this.npmInstall();
  }

  end() {
    console.log(`
      Created '${this.answers.fullname}'.

      Run 'gulp link-agents' to link it into edge-server.
      Run 'npm start' to start edge-server.
    `);
  }

  /**
   * Copy files from a path under the templates directory into the specific dapp folder
   */
  _copyTemplate(src, dst) {
    return this.fs.copyTpl(
      this.templatePath(src),
      this.destinationPath(dst),
      this.answers,
      {
        globOptions: {
          dot: true
        }
      }
    );
  }

  _toCamelCase(str) {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
      if (p2) return p2.toUpperCase();
      return p1.toUpperCase();
    });
  }
};
