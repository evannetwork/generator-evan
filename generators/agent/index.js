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
const Web3 = require('web3-utils')

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

    try { external = require(this.destinationPath('./scripts/config/externalProfiles.js')) }
    catch (e) { if (e.code !== "MODULE_NOT_FOUND") throw e; }

    created = this.fs.readJSON(this.destinationPath('./scripts/config/createdProfiles.json'))
    
    this.answers = await this.prompt([
      {
        type    : 'input',
        name    : 'name',
        message : 'Name the agent: smart-agent-*',
        default : this.appname,     // Default to current folder name
      },
      {
        type    : 'input',
        name    : 'description',
        message : 'What does the agent do? Describe it.',
        default : this.appname,     // Default to current folder name
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

          if(external)
            for(let k in external)
              accounts.push({
                name: [k, external[k].id, external[k].alias].join(', '),
                value: {
                  id: external[k].id,
                  privateKey: external[k].privateKey,
                  profileKey: external[k].profileKey,
                },
              })
          
          if(created)
            for(let k in created)
              accounts.push({
                name: [k, created[k].id, created[k].alias].join(', '),
                value: {
                  id: created[k].id,
                  privateKey: created[k].privateKey,
                  profileKey: created[k].profileKey,
                },
              })

          return accounts
        },
        when: accounts.length,
      },
    ])

    this.answers['Name'] = this.answers.name[0].toUpperCase() + this.answers.name.substr(1)
    this.answers['fullname'] = 'smart-agent-' + this.answers.name

    this.answers.account = this.answers._accounts.length ? this.answers._accounts[0].id : ''
    
    this.answers.keys = { }
    this.answers.accounts = { }

    for(let a of this.answers._accounts) {
      this.answers.accounts[a.id] = a.privateKey
      this.answers.keys[sha3(a.id)] = a.profileKey
      this.answers.keys[sha9(a.id,a.id)] = a.profileKey
    }
    this.answers.accounts = JSON.stringify(this.answers.accounts,null,2).slice(1,-1)
    this.answers.keys = JSON.stringify(this.answers.keys,null,2).slice(1,-1)
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  async writing() {
    const pkg = this.fs.readJSON('./package.json')
    if(!pkg.devDependencies['@evan.network/edge-server-seed']) {
      pkg.devDependencies['@evan.network/edge-server-seed'] = '^1.0.0'
      pkg.scripts['start'] = "cd node_modules/@evan.network/edge-server-seed; npm start"
      pkg.scripts['debug'] = "cd node_modules/@evan.network/edge-server-seed; npm debug"
      this.fs.writeJSON( './package.json', pkg, null, 2)

      console.log(`
      Added developer dependency for edge-server-seed, running 'npm i' to install.
      `)

      const util = require('util');
      const exec = util.promisify(require('child_process').execSync);
      exec('npm i', { stdio: 'inherit'});

      this._copyTemplate('root','');
    }

    await this._copyTemplate('smart-agent', this.answers.fullname);

    const renameOrDelete = (key,src,dst) => {
      if(this.answers.components.indexOf(key) >= 0)
        this.fs.move(this.destinationPath(this.answers.fullname + '/' + key + src),
                     this.destinationPath(this.answers.fullname + '/' + key + dst))
      else
        this.fs.delete(this.destinationPath(this.answers.fullname + '/'+ key))
    }

    renameOrDelete('config/', 'smart-agent-.js', this.answers.fullname+'.js')
    renameOrDelete('initializers/', 'init.js', this.answers.name+'.js')
    renameOrDelete('actions/', 'actions.js', this.answers.name+'-actions.js')
    renameOrDelete('bin/', 'cmd.js', this.answers.name+'-cmd.js')
    
    console.log(`
      Created '${this.answers.fullname}'.
      
      Run 'gulp link-agents' to link it into edge-server.
      Run 'gulp test-agents' to start edge-server with all linked smart agents.
      Run 'gulp smart-agent' to create deployment packages for all project smart-agents and configurations in build/
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
};