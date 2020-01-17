// Fix Error: More than one instance of bitcore-lib found. Please make sure to require bitcore-lib
// and check that submodules do not also include their own bitcore-lib dependency.
Object.defineProperty(global, '_bitcore', { get(){ return undefined }, set(){}, configurable: true });

const Generator = require('yeoman-generator');
const path = require('path');
const { claimDomain, getRuntime } = require(`./templates/scripts/domain-helper.js`);
const { createBusinessCenter } = require(`./templates/scripts/bc-helper.js`);
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

      const createBC = (await this.prompt([
        {
          type    : 'confirm',
          name    : 'createBC',
          message : 'Should a business center be created at the given address? (default no)',
          default : false
        }
      ])).createBC;

      const userRuntime = await getRuntime(mnemonic);
      const accountId = userRuntime.activeAccount;
      this.answers.dappsDomain = `${domain}`.replace(/\.evan$/, '');
      this.answers.deploymentAccountId = accountId;
      this.answers.deploymentPrivateKey = await userRuntime.accountStore.getPrivateKey(accountId);

      if (createBC) {
        const joinSchema = (await this.prompt([
          {
            type : 'list',
            name : 'joinSchema',
            message : 'Which join schema should be used for your business center?',
            choices: [
              {
                name: 'SelfJoin (0) - everyone can join, invite does not work',
                value: 0
              },
              {
                name: 'AddOnly (1) - only owners can invite new members',
                value: 1
              },
              {
                name: 'Handshake (2) - owners can invite new members & members can request membership',
                value: 2
              },
              {
                name: 'JoinOrAdd (3) - everyone can join and new membes can be invited',
                value: 3
              }
            ]
          }
        ])).joinSchema;

        await createBusinessCenter(userRuntime, accountId, domain, joinSchema);

        this.answers.bcDomain = domain;
        this.answers.joinSchema = joinSchema;
      } else {
        this.answers.bcDomain = '';
        this.answers.joinSchema = '';
      }

      await userRuntime.dfs.stop();
      await userRuntime.web3.currentProvider.connection.close();
    } else {
      this.answers.dappsDomain = '';
      this.answers.bcDomain = '';
      this.answers.deploymentAccountId = '';
      this.answers.deploymentPrivateKey = '';
      this.answers.joinSchema = '';
    }

    this.answers.deploymentConfigLocation = path.normalize(`${this.destinationPath()}/scripts/config/deployment.js`).replace(/\\/g, '\\\\');
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
