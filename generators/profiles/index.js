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
const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');
// Checks for available update and returns an instance
const notifier = updateNotifier({pkg, updateCheckInterval: 0});

// Notify using the built-in convenience method
notifier.notify({defer:false});
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
  writing() {
    this._copyTemplateIntoDApps();

    console.log(`
      Scripts for managing profiles have been added to your project.
      You can configure them in your 'config/deployment.js' file

      To start the default task bundle, run
      gulp --gulpfile ./gulp/create-profiles.js

      You can also add the "create-profiles" or any subtask tasks from "./gulp/create-profiles.js" to your gulp tasks.
    `);
  }
  /**
   * Copy files from a path under the templates directory into the specific dapp folder
   */
  _copyTemplateIntoDApps() {
    this.fs.copyTpl(
      this.templatePath('**/{.[^.],}*'),
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
