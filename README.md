# generator-evan

The generator-evan is an yeoman generator for evan.network projects. By using the generator you can
easily create and handle smart-contracts and smart-agents.

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
To add support for configuring profiles and create profiles within your project, run:
```
yo evan:profiles
```

First you will be asked if you want to generate new profiles for your project. If you choose "Yes" you will be asked to enter an alias for the new profile. Then you can insert a custom password for the profile or when you leave the input empty an automatic generated password will be used. Then the profile will be automatically created with the inserted values. When the process finishes you will get an information that the profile was successfully created and the informations (like mnemonic, password, alias and accountid) are inserted into the file `./scripts/config/managedAccounts.js`.

If you choose "No" then only the needed files to manage/create/maintain profiles will be copied to your project.


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

When you want a smart-agent component in your project you can use the following command:

```bash
yo evan:agent
```

A smart-agent is a small REST API server which gives you the ability to create a API with litte effort. The smart-agent is based on [actionhero.js](https://www.actionherojs.com/) if you want to get further information about it.

When generating a smart agent you must fill out some informations about the agent:

1. Name of the agent: your smart-agent will be prefixed with "smart-agent-". Give your smart agent a name (lowercase, dash separated) what he is supposed to do, like "digital-twin-validation"
2. Description of the agent: Describe the agents tasks in a few words.
3. Choose which functionalities you will need in your agent:
You have 4 different options to check (with the space bar) when you want to use them:
  1. config
  A configuration for your agent is always needed
  2. initializers
  Initializers in the smart-agent are places to save common code which other parts of your application will use. Here is where you might connect to your database or define middlewares or do some blockchain work like event listeners,
  3. actions/web requests
  Actions are the basic units of work. All connection types from all servers can use actions. This means that you only need to write an action once, and both HTTP clients and websocket clients can consume it. Within actions you can call your initializer defined functions for example.
  4. commands/command line tools
  Command line tools can be executed via the command line (u don't say... ;-)). This cli commands can also call your initalizer functions and do some work only once, when the command is executed
4. Add accounts to smart agent
  In this option you can select which accounts should be added to your smart agent (your smart agent also has an identity on evan.network) which you defined in the `./scripts/config/managedAccounts.js` or the `./scripts/config/externalAccounts.js`

After filling out all questions the needed files are copied to your project in the root directory with the name of your smart agent. Also the needed npm installs for the smart agent will be executed after the generation to be instant ready to develop

### Linking / starting smart agent

Because you can have multiple smart agents in your project, you must link them to the actionhero installed in your node_modules folder. To do so run the command "npx gulp link-agents" in your root project folder. After linking the smart agent you can run the server with the command "npm start".

Then the smart agent starts and you can develop your logic as actions/initializers and so on.
