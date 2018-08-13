const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type    : 'input',
        name    : 'projectName',
        message : 'Your project name',
        default : this.appname // Default to current folder name
      }
    ]);
  }

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