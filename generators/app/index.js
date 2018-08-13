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

const Generator = require('yeoman-generator');

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
      }
    ]);
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  writing() {
    this.fs.copyTpl(
      this.templatePath('**'),
      this.destinationPath(`${ this.destinationRoot() }/${ this.answers.projectName }`),
      this.answers,
      {
        globOptions: {
          dot: true
        } 
      }
    );
  }
};
