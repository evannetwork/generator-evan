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
const path = require('path');
const { claimDomain, getRuntime } = require(`./templates/scripts/domain-helper.js`);
const registrarDomainSuffix = '.fifs.registrar.test.evan';
const registrarDomainSuffixWithoutEvan = '.fifs.registrar.test';
const registrarDomainLengh = registrarDomainSuffix.split('.').length;

module.exports = class extends Generator {
  /**
   * Ask the user for project information.
   *
   * @return     {Promise}  resolved when done
   */
  async prompting() {
    this.answers = await this.prompt([
      {
        type    : 'input',
        name    : 'projectName',
        message : 'Your project name',
        default : this.appname,
        required: true
      },
      {
        type    : 'input',
        name    : 'description',
        message : 'Your projects description'
      },
      {
        type    : 'confirm',
        name    : 'ensClaim',
        message : 'Should i claim you a sub ens address on evan.network for you? (mnemonic required)',
        default : true
      }
    ]);
    if(this.answers.ensClaim) {
      const mnemonic = await this.prompt([
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
        }
      ]);
      const domain = await this.prompt([
        {
          type    : 'input',
          name    : 'domain',
          message : 'Claim which subdomain?',
          default : this.answers.projectName,
          validate: async (input) => {
            const split = input.split('.');
            if (split.length === registrarDomainLengh && !input.endsWith(registrarDomainSuffix)) {
              return `FQDNs have to end with "${registrarDomainSuffix}"`;
            } else if (split.length > registrarDomainLengh) {
              return `FQDNs have to be direct subdomains of "${registrarDomainSuffix}"`;
            } else {
              try {
                await claimDomain(input, mnemonic.mnemonic);
                return true;
              } catch(e) {
                return `${input}${registrarDomainSuffix} isnt free anymore ... choose another one`;
              }
            }
          },
          filter: (input) => `${input}${registrarDomainSuffix}`,
          transformer: (input) => `${input}${registrarDomainSuffix}`,
        },
      ]);
      const userRuntime = await getRuntime(mnemonic.mnemonic);
      const accountId = userRuntime.activeAccount;
      this.answers.dappsDomain = `${domain.domain}`.replace(/\.evan$/, '');
      this.answers.deploymentAccountId = accountId;
      this.answers.deploymentPrivateKey = await userRuntime.accountStore.getPrivateKey(accountId);

      await userRuntime.dfs.stop();
      await userRuntime.web3.currentProvider.connection.close();
    } else {
      this.answers.dappsDomain = '';
      this.answers.deploymentAccountId = '';
      this.answers.deploymentPrivateKey = '';
    }
    this.answers.deploymentConfigLocation = path.normalize(`${this.destinationPath()}/scripts/config/deployment.js`).replace(/\\/g, '\\\\');
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  async writing() {
    await this.fs.copyTpl(
      this.templatePath('**'),
      this.destinationPath(`${ this.destinationRoot() }`),
      this.answers,
      {
        globOptions: {
          dot: true
        } 
      }
    );
  }

  end() {
    process.exit();
  }
};
