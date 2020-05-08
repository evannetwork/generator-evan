// Fix Error: More than one instance of bitcore-lib found. Please make sure to require bitcore-lib
// and check that submodules do not also include their own bitcore-lib dependency.
Object.defineProperty(global, '_bitcore', { get(){ return undefined }, set(){}, configurable: true });

const Generator = require('yeoman-generator');
const path = require('path');
const { claimDomain, getRuntime } = require(`./templates/scripts/domain-helper.js`);
const registrarDomainSuffix = '.fifs.registrar.test.evan';
const registrarDomainLengh = registrarDomainSuffix.split('.').length;
const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');
// Checks for available update and returns an instance
const notifier = updateNotifier({pkg, updateCheckInterval: 0});

// Notify using the built-in convenience method
notifier.notify({defer:false});

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
        default : this.appname.replace(/ /g, '-'),
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
        message : 'Should a sub ENS address on the evan.network be claimed for you? (mnemonic required) (default yes)',
        default : true
      }
    ]);

    if (this.answers.ensClaim) {
      const mnemonic = (await this.prompt([
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
      ])).mnemonic;

      const domain = (await this.prompt([
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
                console.log('\n\nClaiming address: ' + input);
                await claimDomain(input, mnemonic);
                return true;
              } catch (ex) {
                console.log(ex);
                return `${input}${registrarDomainSuffix} isnt free anymore ... choose another one`;
              }
            }
          },
          filter: (input) => `${input}${registrarDomainSuffix}`,
          transformer: (input) => `${input}${registrarDomainSuffix}`,
        },
      ])).domain;

      const userRuntime = await getRuntime(mnemonic);
      const accountId = userRuntime.activeAccount;
      this.answers.deploymentAccountId = accountId;
      this.answers.deploymentPrivateKey = await userRuntime.accountStore.getPrivateKey(accountId);

      await userRuntime.web3.currentProvider.connection.close();
    } else {
      this.answers.deploymentAccountId = '';
      this.answers.deploymentPrivateKey = '';
    }
  }

  /**
   * Copy all files from the origin into the destination and replace the placeholders.
   */
  async writing() {
    await this.fs.copyTpl(
      this.templatePath('**/{.[^.],}*'),
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
