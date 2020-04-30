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
    this._copyTemplate();

    console.log(`
      A contracts folder been added to your project.
      This folder contains a sample contract (Greeter.sol), you can replace it with your own contracts.

      To build your contracts run:
      gulp --gulpfile ./gulp/compile-contracts.js

      You can also add the "compile-contracts" tasks from "./gulp/compile-contracts.js" to your gulp tasks.
    `);
  }
  _copyTemplate() {
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
