# <%= projectName %>

## Install
- you very likely will need `nvm` installed
- you definitely need `lerna` and `gulp` installed

```bash
npm install
```

## UI Development
- build and serve the local dapp serve
- starts an local server at http://localhost:3000/dev.html
```bash
npm run serve
```

- build all dapps
```bash
npm run dapps-build
```

- serve for file change tracking
```bash
npm run dapps-serve
```

## Deployment
Each DApp can be deployed to the evan.network, so it can be accessed from anywhere, not only from a localhost server. This is handle by an wrapped library, to handle the deployment as simple as possible. To deploy your application run the following command. To deploy DApps to ens paths, you need one configuration file, that specifies which accounts and which configurations should be used for the deployment.
Within the config folder a deployment file is placed. Within this file you must enter your accountID and its private key, that have access to the several ENS domains. You can run the following command to start a deployment:

```bash
npm run deploy --config pathToConfig
```

** Be sure that "pathToConfig" is the absolute path to your deployment configuration! **

Now, you can open the ens address to your application on https://dashboard.evan.network#/my-ens-address.evan. (my-ens-address = dbcp.name)

** Currently: For security reasons, the ownership of the ENS addresses are reserved for the members of the evan GmbH. To deploy your dapps, contact the evan.network team here [gitter](https://gitter.im/evannetwork)**
