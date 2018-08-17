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
      A contracts folder been added to your project.
      This folder contains a sample contract (Greeter.sol), you can replace it with your own contracts.

      To build your contracts run:
      gulp --gulpfile ./gulp/compile-contracts.js

      You can also add the "compile-contracts" tasks from "./gulp/compile-contracts.js" to your gulp tasks.
    `);
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
