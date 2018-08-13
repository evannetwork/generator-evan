# generator-evan

The generator-evan is an yeoman generator for evan.network projects. By using the generator you can
easily create and handle smart-contracts, smart-agents and dapps.

## Basic project structure

The basic project structure is needed to handle all sub components and will include several scripts,
commands and configurations for making your life easier. It will create the following project
structure:

  - README.md: Description and minimal user instructions VERSIONS.md: Description of changes
  - package.json: Development packages installed by npm .gitignore: files that should be ignored by
  - git .npmrc: disabled package.lock.json lerna.json: management for nested lerna projects (needed
  - for smart-agents, dapps, ...)  config/deployment.js: DBCP deployment configuration, have a look
  - into the readme.md file for more details

Run the following command:
```bash
yo evan
```


