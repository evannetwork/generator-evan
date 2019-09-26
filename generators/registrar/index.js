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
      Scripts for deploying a registrar for ENS addresses have been added to your project.
      You can configure it in your 'config/deployment.js' file

      To start the default task bundle, run
      gulp --gulpfile ./gulp/deploy-registrar.js

      You can also add the "deploy-registrar" or any subtask tasks from "./gulp/deploy-registrar.js" to your gulp tasks.
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
