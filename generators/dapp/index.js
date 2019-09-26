const fs = require('fs');
const Generator = require('yeoman-generator');
const path = require('path');
const extend = require('deep-extend');
const digitaltwinHandling = require('./digitaltwin');
const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');
// Checks for available update and returns an instance
const notifier = updateNotifier({pkg, updateCheckInterval: 0});

// Notify using the built-in convenience method
notifier.notify({defer:false});
/**
 * Copy files from a path under the templates directory into the specific dapp folder
 *
 * @param      {<type>}  folderName  The folder name
 */
const copyTemplateIntoDApps = function(folderName, customDestionation) {
  this.fs.copyTpl(
    this.templatePath(folderName),
    this.destinationPath(customDestionation ||
      `${ this.destinationRoot() }/dapps/${ this.answers.projectName }`),
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
    // ask for the framework that should be used
    const framework = (await this.prompt([
      {
        type    : 'list',
        name    : 'framework',
        message : 'Which framework you want to use?',
        choices: [
          {
            name: 'Angular 5, Ionic 3',
            value: 'angular'
          },
          {
            name: 'VueJS',
            value: 'vue'
          },
        ]
      }
    ])).framework;

    // ask for projectName seperated to handle get the default dbcp name
    const projectName = (await this.prompt([{
      type    : 'input',
      name    : 'projectName',
      message : 'Your project name',
      default : this.appname // Default to current folder name
    }])).projectName;

    // ask for dbcp details
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
      }
    ]);

    // require deployment config to get the ENS Path (if exists)
    try {
      const deploymentConfig = require(`${ this.destinationRoot() }/scripts/config/deployment.js`);
      this.answers.dbcpName = projectName;
      if (deploymentConfig.bcConfig.nameResolver.domains.dappsDomain) {
        this.answers.dbcpName = `${ projectName }.${ deploymentConfig.bcConfig.nameResolver.domains.dappsDomain }`;
      }

      if (deploymentConfig.bcConfig.nameResolver.domains.bcDomain) {
        this.answers.bcDomain = deploymentConfig.bcConfig.nameResolver.domains.bcDomain;
        this.answers.factoryPath = `testdatacontract.${ this.answers.bcDomain }`;
        this.answers.joinSchema = deploymentConfig.bcConfig.nameResolver.domains.joinSchema;
      } else {
        this.answers.bcDomain = '';
        this.answers.joinSchema = '';
        this.answers.factoryPath = `testdatacontract`;
      }

      this.answers.cleanName = this.answers.dbcpName.replace(/\.|\-/g, '');
    } catch(e) {
      // silent
      this.answers.bcDomain = '';
      this.answers.joinSchema = '';
      this.answers.factoryPath = `testdatacontract`;
      this.answers.dbcpName = projectName;
      this.answers.cleanName = this.answers.dbcpName.replace(/\.|\-/g, '');
    }

    // as for dapp types specific for each framework
    switch (framework) {
      case 'angular': {
        this.answers.type = (await this.prompt([
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
                name: 'Digital Twin (DApp including create and data management)',
                value: 'digitaltwin'
              },
            ]
          }
        ])).type;

        // load digital twin properties and apply them to the answers
        if (this.answers.type === 'digitaltwin') {
          const digitaltwinConfiguration = await digitaltwinHandling.call(this, projectName, this.answers.dbcpName);

          Object.keys(digitaltwinConfiguration).forEach(key => {
            this.answers[key] = digitaltwinConfiguration[key];
          });
        }

        break;
      }
      case 'vue': {
        this.answers.type = (await this.prompt([
          {
            type    : 'list',
            name    : 'type',
            message : 'Which type of DApp you want to create?',
            choices: [
              {
                name: 'Hello World DApp',
                value: 'hello-world'
              }
            ]
          }
        ])).type;

        break;
      }
    }

    // set the dbcp standalone state
    if (this.answers.type === 'single' || this.answers.type === 'dashboard') {
      this.answers.standalone = true;
    } else {
      this.answers.standalone = false;
    }

    // append projectName into the answers object to handle it within the
    this.answers.projectName = projectName;
    this.answers.framework = framework;
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  writing() {
    copyTemplateIntoDApps.call(this, `${ this.answers.framework }/root`);
    copyTemplateIntoDApps.call(this, `${ this.answers.framework }/${ this.answers.type }`);
    copyTemplateIntoDApps.call(this, 'gulp', `${ this.destinationRoot() }/gulp`);
    copyTemplateIntoDApps.call(this, 'vue-build', `${ this.destinationRoot() }/vue`);

    // load the current package json and enhance it with the new scripts and dependencies
    const rootPackageJSON = require(`${ this.destinationRoot() }/package.json`);
    const enhanceJSON = require(path.resolve(__dirname, 'templates/package-enhance',
      `${ this.answers.framework }.json`));
    extend(enhanceJSON, rootPackageJSON);

    // save it!
    this.fs.writeJSON(`${ this.destinationRoot() }/package.json`, enhanceJSON);

    console.log(`
      Your app was generated successfully!

      You can now build your DApps by running: "npm run dapps-build".
      You can now start your local dev server by running: "npm run serve".

      After you started your local dev server, visit localhost:3000/dev.html.
      You can now open your DApp by adding it to your favorites using the following name ${ this.answers.dbcpName }.
    `);
  }

  install() {
    this.npmInstall();
  }
};
