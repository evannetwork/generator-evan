# generator-evan

The generator-evan is an yeoman generator for evan.network projects. By using the generator you can
easily create and handle smart-contracts, smart-agents and dapps.

<!-- MarkdownTOC autolink="true" -->

- [Installation](#installation)
- [Generate a new Project](#generate-a-new-project)
  - [Generate: Basic project structure](#generate-basic-project-structure)
  - [Configuring External Accounts](#configuring-external-accounts)
- [Generate smart-contract](#generate-smart-contract)
- [Generate profiles](#generate-profiles)
  - [Configuring Managed Accounts](#configuring-managed-accounts)
  - [Gulp Tasks](#gulp-tasks)
    - [create-profiles](#create-profiles)
    - [ensure-profiles](#ensure-profiles)
    - [exchange-keys](#exchange-keys)
    - [add-bookmarks](#add-bookmarks)
    - [add-to-business-centers](#add-to-business-centers)
    - [invite-to-contracts](#invite-to-contracts)
- [Generate ENS Registrar](#generate-ens-registrar)
- [Generate smart-agent](#generate-smart-agent)
- [Generate dapp](#generate-dapp)
  - [DApp custom style](#dapp-custom-style)

<!-- /MarkdownTOC -->


## Installation

```bash
npm install -g yo
npm install -g generator-evan
```

## Generate a new Project
Run the following command to create a new project structure:

```bash
mkdir projectName
cd projectName
yo evan
```

After you generated the basic project structure, you can navigate to this directory and run the
other commands. All commands and descriptions to handle everything descripted within the readme.md
file of the newly generated project.


### Generate: Basic project structure
The basic project structure is needed to handle all sub components and will include several scripts,
commands and configurations for making your life easier. It will create the following project
structure:

  - README.md: Description and minimal user instructions
  - VERSIONS.md: Description of changes
  - package.json: Development packages installed by npm
  - .gitignore: files that should be ignored by
  - git .npmrc: disabled package.lock.json
  - lerna.json: management for nested lerna projects (needed for smart-agents, dapps, ...)
  - config/deployment.js: DBCP deployment configuration, have a look into the readme.md file for more details


### Configuring External Accounts
Accounts can be configured in the `./scripts/config/externalAccounts.js`.

If you need blockchain accounts for deployments, etc. you can configure them as external accounts or managed accounts. External accounts are accounts, that already exist and you basically want to just use them to make transactions. Managed accounts are used by the scripts from [Generate Profiles](#generate-profiles) and allow to perform basic profile setup steps on them.

Examples for configurations are:
```javascript
module.exports = {
  // basic account, that can be used to perform transactions
  basicAccount: {
    id: '0xAa44fb6F6f6Aef3F11AF0b8829469885eb15E4cc',
    privateKey: 'd889c45eded0f91b36afc726981b3b4a016d512677c58f52900ddce8f0d67bf4',
  },

  // account, that also has access to own profile and can interact with other accounts or contracts
  accountWithProfileKey: {
    id: '0xAa44fb6F6f6Aef3F11AF0b8829469885eb15E4cc',
    privateKey: 'd889c45eded0f91b36afc726981b3b4a016d512677c58f52900ddce8f0d67bf4',
    profileKey: 'c832ab188dc417d17fe080d862b0f6ef185995862565c549c444d30e602884be',
  },

  // the following account requires the evan:profiles scripts to work properly
  accountViaMemnonic: {
    mnemonic: 'town ignore tennis display genuine vocal client mandate symbol breeze orange defense',
    profileKey: 'c832ab188dc417d17fe080d862b0f6ef185995862565c549c444d30e602884be',
  },

  // basic account optional alias for account
  basicAccountWithAlias: {
    id: '0xAa44fb6F6f6Aef3F11AF0b8829469885eb15E4cc',
    alias: 'Testaccount1',
    privateKey: 'd889c45eded0f91b36afc726981b3b4a016d512677c58f52900ddce8f0d67bf4',
  },
}
```


## Generate smart-contract
To add support for your own smart contracts to your project, run:
```
yo evan:contracts
```

To build your contracts run
```
gulp --gulpfile ./gulp/compile-contracts.js
```

The generator allows to add custom contract files to your project and build them alongside the default contracts. You are able to import them as if they would be in the same directory as the default contract files from:
- [dbcp](https://github.com/evannetwork/dbcp)
- [smart-contracts-core](https://github.com/evannetwork/smart-contracts-core)

To import contracts from these projects, import them like local contracts:
```solidity
import "./AbstractDescribed.sol";
```

By default, a sample contract called `Greeter.sol` is added to the project. This is a sample contract, that you can replace with your own logic.

When the contracts have been compiled, the resulting `compiles.json` and `compiled.js` are placed in the `contracts` subfolder.


## Generate profiles
To add support for configuring profiles within your project, run:
```
yo evan:profiles
```

To create/ensure your configured profiles run
```
gulp --gulpfile ./gulp/create-profiles.js
```

You can configure profiles and their relationships in your project, which by default includes
- creating profiles for them to work in evan.network
- exchanging keys between them and add them to their address books
- add bookmarks for them
- add accounts to business centers
- invite accounts to contracts


### Configuring Managed Accounts
Managed accounts can be configured in the file `./scripts/config/managedAccounts.js`.

The combine with accounts configured in [Configuring External Accounts](#configuring-external-accounts), which means, that scripts, that use either managed accounts or external accounts, have access to all configured accounts and you don't have to configure them twice.

Examples for configurations are:
```javascript
module.exports = {
  // basic account, that can be used for setup
  basicAccount: {
    mnemonic: 'coconut tree unfold enforce swim wrap ritual brain sting avoid dust awesome',
    password: 'testpassword123',
  },
  // basic account with alias; alias will be stored in profile
  basicAccountWithAlias: {
    alias: 'Test0',
    mnemonic: 'dress mother round decide ghost slide fire tennis salt injury stadium annual',
    password: 'testpassword123',
  },
  // account, that has another account as a contact
  basicAccountWithContacts: {
    alias: 'Test1',
    mnemonic: 'rack power message electric swarm fever improve bar chair ladder knee radar',
    password: 'testpassword123',
    contacts: [
      'dress mother round decide ghost slide fire tennis salt injury stadium annual',
    ],
  },
}
```

Some notes about the config properties:
- account references in general: When referencing to other accounts like in `contacts`, you can use multiple values to do so. The following properties can be used to identify the accounts:
  + an account id (starting with `0x`)
  + a mnemonic
  + an alias
  + their key (name property name in the config file, e.g. `basicAccount`, `basicAccountWithAlias`, etc.) from one of the config files (`externalAccounts.js`/`managedAccounts.js`)
- `contacts`: see [exchange-keys](#exchange-keys) for details
- `alias`: You should consider adding aliases to your accounts, as they will be shows in the ÐApps. This goes for
  + creating profiles (aliases will be used as the name of the account - aka 'the own name')
  + exchange keys (aliases will be set as display names for the accounts (so basically everywhere))

As managed accounts may need funds to perform transactions, a check that verifies, if the accounts have enough founds, is done before starting the other scripts. The required amount (in Wei) can be configured in `./scripts/config/deployment.js`, `runtimeConfig.minBalance`.

```javascript
const runtimeConfig = {
  // ...
  minBalance: 1000000000000000000,
  // ...
}
```


### Gulp Tasks
#### create-profiles
The main task, runs the other tasks in order.


#### ensure-profiles
Ensures, that all managed accounts have proper profiles, which includes
- creating diffie hellman keys for key exchange
- setting own account display name (if `alias` is configured)


#### exchange-keys
Key exchanges can be configured with the `contacts` property in the managed accounts.

Please note:
- contacts identifiers can be defined as described in the last section
- configured contacts trigger key exchanges, if the accounts to not yet have performed them
- you only have to configure one direction of your key exchanges, if account1 already has account2 as a contact, there is no need to configure it at account2 as well
- there are to types of key exchanges
  + direct key exchange: key exchange will be **completed** by the script, both accounts need to properly configured as managed accounts
  + bmail key exchange (only if contact is configured as an account id and has the prefix 'bmail:': key exchange will be **initiated** by the script, the account, that has the contacts property set, will send a bmail with a key exchange request to the target account


#### add-bookmarks
Configured in `./scripts/config/deployment.js`, `runtimeConfig.bookmarkDefinitions`, `runtimeConfig.bookmarks`.

The bookmarks have two parts, `bookmarkDefinitions` and `bookmarks`. The first one defines bookmarks for ENS addresses, the value is a [DBCP](https://github.com/evannetwork/dbcp) description for the bookmark. This can be the description of the ÐApp deployed at this ENS address. The `bookmarks` config maps account identifiers and a list of ENS addresses defined in the `bookmarkDefinitions` section.

Example for the config properties:
```javascript
const runtimeConfig = {
  // ...
  bookmarkDefinitions: {
    // bookmarks as ENS domain and DBCP for bookmark
    "sample.evan": {
      "name": "sample",
      "description": "evan.network sample bookmark",
      "i18n": {
        "description": {
          "en": "evan.network sample"
        },
        "name": {
          "en": "sample"
        },
      },
      // ...
    }
  },
  bookmarks: {
    // accounts and their bookmarks as ENS domain names
    'coconut tree unfold enforce swim wrap ritual brain sting avoid dust awesome': ['sample.evan'],
  },
  // ...
}
```


#### add-to-business-centers
Configured in `./scripts/config/deployment.js`, `runtimeConfig.bookmarkDefinitions`.

Business centers are defined as ENS addresses and a config for invites. The account configured as `owner` (configured as account ID, optional) may be used to invite the accounts configured as `members` - depending on the business centers join schema.

Example configuration:
```javascript
const runtimeConfig = {
  // ...
  businessCenters: {
    'sample.evan': {
      owner: '0x0000000000000000000000000000000000000001',
      members: [
        'coconut tree unfold enforce swim wrap ritual brain sting avoid dust awesome',
        'dress mother round decide ghost slide fire tennis salt injury stadium annual',
      ],
    },
  },
  // ...
}
```


#### invite-to-contracts
Configured in `./scripts/config/deployment.js`, `runtimeConfig.contracts`.

The owner has to be a configured account (either an external or a managed account) and is used to invite the new members. This comes with a few requirements, that have to be already met or have to be configured in previous steps:
- if the owner is an external account, it needs a `profile_key` configured
- owner and and members must have completed a key exchange or be configured as contacts

Example configuration:
```javascript
const runtimeConfig = {
  // ...
  contracts: {
    // contract id or ens name
    '0xc0274ac700000000000000000000000000000000': {
      // mnemonic or account id
      owner: 'coconut tree unfold enforce swim wrap ritual brain sting avoid dust awesome',
      members: [{
        // mnemonic or account id
        account: 'dress mother round decide ghost slide fire tennis salt injury stadium annual',
        sharings: ['*']
      }],
    }
  },
  // ...
}
```


## Generate ENS Registrar
To add a deployment script for a custom registar to your project, run:
```
yo evan:registar
```

To create/ensure your registrar scripts are running
```
gulp --gulpfile ./gulp/deploy-registrar.js
```

Configuration is placed in `./scripts/config/deployment.js`, `runtimeConfig.registrar`.

The script will
- create a new registrar contract with the account `domainParentOwner`
- hand over the ownership over the domain `domain` to the new contract

The default registrar, that is deployed, is the [ENS FIFS registrar](https://github.com/ensdomains/ens/blob/master/contracts/FIFSRegistrar.sol). If you wish to use another registrar, adjust the script `./scripts/registrar-helper.js` to your needs.

Note, that the executing account in the sample below is not included as an external account and the account details have not been added to the config, but are pulled from environment. As this account has to hold ownership over the domain `parentDomain` adding it to the config may expose it to a security scope not intended for it.

Example configuration:
```javascript
const runtimeConfig = {
  // ...
  contracts: {
    // subdomains of this are claimable
    domain: 'registrar.sample.evan',
    // parent domain for registrar, has to be owned by 'domainParentOwner'
    domainParent: 'sample.evan',
    // owner of 'domainParent', registers and assigns 'domain' to new registrar
    domainParentOwner: process.env.ENS_OWNER,
    // Ethereum private key of 'domainParentOwner'
    domainParentOwnerKey: process.env.ENS_OWNER_KEY,
  },
  // ...
}
```


## Generate smart-agent


## Generate dapp

To generate a new dapp for your project, you can use the following command:

```bash
yo evan:dapp
```

This sub generator will ask for each data that is needed to specify the basic structure of your
dapp. Each new dapp will placed within the "dapps" folder of your basi project. You can shoose one
of several templates for a fast development start.

1. Angular 5
  1. Single DApp = Mostly used for handling OnePage Apps for a Dashboard or Contract Select View.
  2. Dashboard DApp = Represents a DApp that handles a Dashboard with left side panel navigation, that can organize and open other DApps.
  3. DataContract DApp = A single DApp for creating and viewing a DataContract. The DApp includes the basic routing for contract addresses and the logic for creating a new data contract and setting some data.
  4. Digital Twin = Create, view and change data of your own digital twin. The yeoman script will generate a customized formular for you, that allows to enter several metadata.

2. VueJS
  1. Hello World = DApp that handles basic login and contract creation.

After you created your DApp, you can now build your DApps by running:

```bash
npm run dapps-build
```

You can now start your local dev server by running:

```bash
npm run serve
```

After you started your local dev server, visit localhost:3000/dev.html.
You can now open your DApp by adding it to your favorites using the dbcp name of your new DApp.

More infos about DApps:

- [DApp Tutorials](https://evannetwork.github.io/dapps/basics)
- [API Reference UI](https://ipfs.evan.network/ipns/QmReXE5YkiXviaHNG1ASfY6fFhEoiDKuSkgY4hxgZD9Gm8)
- [API Reference blockchain-core / DBCP](https://ipfs.evan.network/ipns/QmYmsPTdPPDLig6gKB1wu1De4KJtTqAXFLF1498umYs4M6)

### DApp custom style

The evan.network provides two color themes. The basic dark one, that is activated everywhere, and the light one, that can be activated by adding the **.evan-light** class to your dapps element. If you want to create a custom DApp styling, you can simply use the **@evan.network/ui-angular-sass** theme definitions. How to create custom themes, please have a look at the following documentation: [UI-SASS documentation](https://ipfs.evan.network/ipns/QmReXE5YkiXviaHNG1ASfY6fFhEoiDKuSkgY4hxgZD9Gm8/angular-sass/index.html)

After your custom theme is defined, your DApp will include a full custom evan.network design. To enable this design, apply your custom-style class (or the evan-light class) to your dapp entrypoint element (e.g. within the index.ts of your DApp).

```
  ...
  // Add project class name to the ion-app / .evan-dapp element for generalized styling
  ionicAppEl.className += ' .evan-custom-style';
  ...
```
