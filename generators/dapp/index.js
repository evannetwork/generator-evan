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

/**
 * Copy files from a path under the templates directory into the specific dapp folder
 *
 * @param      {<type>}  folderName  The folder name
 */
const copyTemplateIntoDApps = function(folderName) {
  this.fs.copyTpl(
    this.templatePath(folderName),
    this.destinationPath(`${ this.destinationRoot() }/dapps/${ this.answers.projectName }`),
    this.answers,
    {
      globOptions: {
        dot: true
      }
    }
  );
}

module.exports = class extends Generator {
  /**
   * Ask the user for project information.
   *
   * @return     {Promise}  resolved when done
   */
  async prompting() {
    // ask for projectName seperated to handle get the default dbcp name
    const projectName = (await this.prompt([{
      type    : 'input',
      name    : 'projectName',
      message : 'Your project name',
      default : this.appname // Default to current folder name
    }])).projectName;

    this.answers = await this.prompt([
      {
        type    : 'input',
        name    : 'description',
        message : 'Your projects description'
      },
      {
        type    : 'input',
        name    : 'img',
        message : 'Insert a img that represents your DApp. It will be shown by previewing your DApp. We suggest, to use an base64 img.',
        default: 'https://pbs.twimg.com/profile_images/3786155988/46ea2dd8b1bdd31a8ba61044cb5b6ebe_400x400.png'
      },
      {
        type    : 'input',
        name    : 'color',
        message : 'Insert a primary color code that corresponds to your DApp. (e.g. #f9f9ff)'
      },
      {
        type    : 'list',
        name    : 'type',
        message : 'Which type of DApp you want to create?',
        choices: [
          {
            name: 'Single DApp (wrapping DApp including only a sample component)',
            value: 'single'
          },
          {
            name: 'Dashboard DApp (wrapping DApp including predefined left panel navigation)',
            value: 'dashboard'
          },
          {
            name: 'DataContract DApp (DApp including create, detail routing for a DataContract)',
            value: 'datacontract'
          },
          {
            name: 'Custom Contract DApp (DApp including create, detail routing for your custom contract)',
            value: 'contract'
          },
        ]
      }
    ]);

    if (this.answers.type === 'single' || this.answers.type === 'dashboard') {
      this.answers.standalone = true;
    } else {
      this.answers.standalone = false;
    }

    // require deployment config to get the ENS Path (if exists)
    try {
      const deploymentConfig = require(`${ this.destinationRoot() }/scripts/config/deployment.js`);
      this.answers.dbcpName = `${projectName}.${deploymentConfig.bcConfig.nameResolver.domains.dappsDomain}`;
      this.answers.cleanName = this.answers.dbcpName.replace(/\./g, '');
    } catch(e) {
      // silent
      this.answers.dbcpName = `${projectName}`;
      this.answers.cleanName = this.answers.dbcpName.replace(/\./g, '');
    }

    // append projectName into the answers object to handle it within the 
    this.answers.projectName = projectName;
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  writing() {
    copyTemplateIntoDApps.call(this, 'root');
    copyTemplateIntoDApps.call(this, this.answers.type);

    console.log(`
      Your app was generated successfully!

      You can now build your DApps by running: "npm run dapps-build".
      You can now start your local dev server by running: "npm run serve".

      After you started your local dev server, visit localhost:3000/dev.html.
      You can now open your DApp by adding it to your favorites using the following name ${ this.answers.dbcpName }.
    `);
  }
};
