# generator-evan

## Next Version
### Features
### Fixes
- add missing mailbox light styling
- fix dappName for empty dappsDomain

### Deprecations

## Version 1.3.1
### Features
- digital twin DApp: add created contract to favorites 

### Fixes
- fix deployment path when app is generated
- add missing package.json depdency for DApp's

## Version 1.3.0
### Features
- `yo evan` does not generates a new folder
- split into multiple dapp frameworks (Angular 5, VueJS)
- add package.json enhancement for dapp dependencies
- remove default angular-gulp for serve / build job => use minimal gulp job and each dapp will specify its own build job
- generate digital twin DApps

### Fixes
- fix empty undefined answer values `dappsDomain`, `deploymentAccountId`, `deploymentPrivateKey` when generating root structure without custom ens dapps domain

## Version 1.2.1
### Features
### Fixes
- fix correct version of blockchain-core
### Deprecations

## Version 1.2.0
### Features
- add deployment flow for dapps
- add free subdomain claim for dapp deployments
### Fixes
- fix deployment path for new ui-dapp-browser
### Deprecations
- remove account config from `deployment.js` and only use  `externalAccounts.js` and `managedAccounts.js` for this purpose

## Version 1.1.0
### Features
- better generators for dapps
- generators for smart-agents
- generator for registrar generation
- generator for automatic profile generation
- generator for contract creation

## Version 1.0.1
### Features
- add account creation scripts
- add business center member handling scripts
- add script for inviting accounts to contracts
- add script for deploying ENS registrars
- add custom dapp stylings

### Fixes
- add web3 dependencies in the right version 
- typos

### Deprecations

## Next Version
### Features

### Fixes

### Deprecations
