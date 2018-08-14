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
        name    : 'dbcpName',
        message : 'ENS path of your dapp (should only include characters and numbers)',
        default : projectName.replace(/\ |\-/g, '')
      },
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

    // append projectName into the answers object to handle it within the 
    this.answers.projectName = projectName;
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  writing() {
    copyTemplateIntoDApps.call(this, 'root');
    copyTemplateIntoDApps.call(this, this.answers.type);
  }
};
