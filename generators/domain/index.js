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

const { claimDomain } = require(`${process.cwd()}/scripts/domain-helper`);


const registrarDomainSuffix = '.fifs.registrar.test.evan';
const registrarDomainLengh = registrarDomainSuffix.split('.').length;

// const scriptsFolder = `${process.cwd()}/scripts`;
// const { runtimeConfig } = require(`${scriptsFolder}/config/deployment`);
// const { createDefaultRuntime, Ipfs } = require('@evan.network/api-blockchain-core')
// const IpfsApi = require('ipfs-api')
// const Web3 = require('web3')

// const { buildKeyConfig } = require(`${scriptsFolder}/profile-helper`)
// const createRuntime = require(`${scriptsFolder}/createRuntime`);

// let runtime

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)
  }
  /**
   * Ask the user for project information.
   *
   * @return     {Promise}  resolved when done
   */
  async prompting() { }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  async writing() {
    const answers = await this.prompt([
      {
        type    : 'input',
        name    : 'mnemonic',
        message : 'Use which mnemonic?',
        validate: (input) => {
          if (!/^\s*(?:\w+ ){11}(?:\w+)\s*$/.test(input)) {
            return 'This doesn\'t look like a valid mnemonic.';
          }
          return true;
        },
      },
      {
        type    : 'input',
        name    : 'domain',
        message : 'Claim which subdomain?',
        validate: (input) => {
          const split = input.split('.');
          if (split.length === registrarDomainLengh && !input.endsWith(registrarDomainSuffix)) {
            return `FQDNs have to end with "${registrarDomainSuffix}"`;
          } else if (split.length > registrarDomainLengh) {
            return `FQDNs have to be direct subdomains of "${registrarDomainSuffix}"`;
          } else {
            return true;
          }
        },
        filter: (input) => `${input}${registrarDomainSuffix}`,
        transformer: (input) => `${input}${registrarDomainSuffix}`,
      },
    ]);
    await claimDomain(answers.domain, answers.mnemonic);

    // const web3 = new Web3()
    // web3.setProvider(new web3.providers.WebsocketProvider(runtimeConfig.web3Provider))
    // const dfs = new Ipfs({ remoteNode: new IpfsApi(runtimeConfig.ipfs), })

    // return createDefaultRuntime(web3, dfs, runtimeConfig) 
    // console.dir(runtimeConfig)
    // await buildKeyConfig(web3, runtimeConfig)
    // console.dir(runtimeConfig)
    // runtime = await createRuntime(runtimeConfig)
    process.exit();
    this._copyTemplateIntoDApps();
  }
  /**
   * Copy files from a path under the templates directory into the specific dapp folder
   */
  _copyTemplateIntoDApps() {
    this.fs.copyTpl(
      this.templatePath('**'),
      this.destinationPath(`${ this.destinationRoot() }/`),
      this.answers,
      {
        globOptions: {
          dot: true
        }
      }
    );
  }
};
