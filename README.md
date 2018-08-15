# generator-evan

The generator-evan is an yeoman generator for evan.network projects. By using the generator you can
easily create and handle smart-contracts, smart-agents and dapps.

## Installation

```bash
npm install -g yeoman
npm install -g generator-evan
```

## Generate: Basic project structure

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

Run the following command to create a new project structure:

```bash
yo evan
```

After you generated the basic project structure, you can navigate to this directory and run the
other commands. All commands and descriptions to handle everything descripted within the readme.md
file of the newly generated project.

## Generate smart-contract

## Generate edge-server

## Generate smart-agent

## Generate dapp

To generate a new dapp for your project, you can use the following command:

```bash
yo evan:dapp
```

This sub generator will ask for each data that is needed to specify the basic structure of your
dapp. Each new dapp will placed within the "dapps" folder of your basi project.You can shoose one of
4 DApp templates for a fast development start.

1. Single DApp = Mostly used for handling OnePage Apps for a Dashboard or Contract Select View.
2. Dashboard DApp = Represents a DApp that handles a Dashboard with left side panel navigation, that can organize and open other DApps.
3. DataContract DApp = A single DApp for creating and viewing a DataContract. The DApp includes the basic routing for contract addresses and the logic for creating a new data contract and setting some data.
4. Custom Contract DApp = A single DApp that includes your custom smart contract ABI definition. The DApp includes the basic routing for contract addresses and the logic for creating a new data contract and setting some data.

After you created your DApp, you can now build your DApps by running:

```bash
npm run dapps-build
```

You can now start your local dev server by running:

```bash
npm run serve
```

After you started your local dev server, visit localhost:3000/dev.html.
You can now open your DApp by adding it to your favorites using the following name ${ this.answers.dbcpName }.

More infos about DApps:

- [DApp Tutorials](https://evannetwork.github.io/dapps/basics)
- [API Reference UI](https://ipfs.evan.network/ipns/QmReXE5YkiXviaHNG1ASfY6fFhEoiDKuSkgY4hxgZD9Gm8)
- [API Reference blockchain-core / DBCP](https://ipfs.evan.network/ipns/QmYmsPTdPPDLig6gKB1wu1De4KJtTqAXFLF1498umYs4M6)
