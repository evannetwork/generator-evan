# generator-evan

## Next Version
### Features
### Fixes
### Deprecations


## Version 1.7.1
### Fixes
- use latest library versions
- fix angular dapp template default style class names
- use correct `api-blockchain-core` imports


## Version 1.7.0
### Features
- add support for `angular dapps` and the new `angular-gulp` jobs


## Version 1.6.2
### Fixes
- adjust reconnecting issues with keepalive ping
- include hidden files when copying from templates
- fix run order of `package.json` update and `npm install`


## Version 1.6.1
### Fixes
- replace all spaces in project name with dashes
- fix smart agent instance api assignment


## Version 1.6.0
### Fixes
- code cleanup for smart-agentsa templates


## Version 1.5.0
### Features
- add ipfs identification header to enable future ipfs payments
- use web3 1.0.0-beta.37

### Fixes
- fix "out of eve" handling (use fs.readline instead of stdin)


## Version 1.4.0
### Features
- enhance digital twin DApp generator to support multiple, dynamic datasets
- generate business-center on app container generation + add business center support for DataContract + DigitalTwin DApps
- CSV import for generated Digital Twin DApps to bulk import multiple digital twins

### Fixes
- fix dappName for empty dappsDomain

### Deprecations
- remove light DApp design (is included by `@evan.network/ui-angular-sass` custom themes now)


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


## Next Version
### Features
### Fixes
### Deprecations
