const Generator = require('yeoman-generator');

const { claimDomain } = require(`${process.cwd()}/scripts/domain-helper`);


const registrarDomainSuffix = '.fifs.registrar.test.evan';
const registrarDomainLengh = registrarDomainSuffix.split('.').length;
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
  async writing() {
    const answers = await this.prompt([
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
      },
      {
        type    : 'input',
        name    : 'domain',
        message : 'Claim which subdomain?',
        validate: (input) => {
          const split = input.split('.');
          if (split.length === registrarDomainLengh && !input.endsWith(registrarDomainSuffix)) {
            return `FQDNs have to end with "${registrarDomainSuffix}"`;
          } else if (split.length > registrarDomainLengh) {
            return `FQDNs have to be direct subdomains of "${registrarDomainSuffix}"`;
          } else {
            return true;
          }
        },
        filter: (input) => `${input}${registrarDomainSuffix}`,
        transformer: (input) => `${input}${registrarDomainSuffix}`,
      },
    ]);
    console.log('calling claimDomain');
    await claimDomain(answers.domain, answers.mnemonic);
  }

  async end() {
    // explicitely exit, as some streams may keep yeoman node alive
    process.exit();
  }
};
