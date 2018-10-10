/*
  Copyright (c) 2018-present evan GmbH.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const { lstatSync, readdirSync } = require('fs');
const gulp = require('gulp');
const path = require('path');
const del = require('del');
const exec = require('child_process').exec;

const scriptsFolder = process.cwd();
const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

/**
 * Executes and console command
 *
 * @param      {string}       command  command to execute
 * @return     {Promise<any}  resolved when command is finished
 */
async function runExec(command) {
  return new Promise((resolve, reject) => {
    exec(command, { }, async (err, stdout, stderr) => {
      if (err) {
        reject(stdout);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

const dappDirs = getDirectories(path.resolve('../dapps'))

/**
 * save latest serve and build status
 */
const serves = { };

dappDirs.forEach(dappDir => {
  const dappName = dappDir.split('/').pop();

  serves[dappName] = { };
});

/**
 * Show the current wachting status
 */
const logServing = () => {
  console.clear();

  console.log('Watching DApps');
  console.log('--------------\n');

  for (let dappDir of dappDirs) {
    const dappName = dappDir.split('/').pop();

    // load the status of the dapp
    if (serves[dappName].rebuild) {
      console.log(`  ${ dappName }: rebuilding`);
    } else if (serves[dappName].loading) {
      console.log(`  ${ dappName }: building`);
    } else {
      console.log(`  ${ dappName }: watching`);
    }

    if (serves[dappName].stderr) {
      console.log();
      console.log(serves[dappName].stderr);
    }

    if (serves[dappName].error) {
      console.log();
      console.log(serves[dappName].error);
    }
  }

  console.log('\n');
}

/**
 * Build a specific DApp and log the status.
 *
 * @param      {string}  dappDir  the directory of the dapp
 * @return     {Promise<void>}  resolved when done
 */
const buildDApp = async (dappDir, event) => {
  // if its not already building, build the dapp
  const dappName = dappDir.split('/').pop();
  if (!serves[dappName].loading) {
    serves[dappName].loading = true;
    serves[dappName].stderr = '';
    logServing();

    try {
      // navigate to the dapp dir and run the build command
      process.chdir(dappDir);
      serves[dappName].stderr = (await runExec('npm run build')).stderr;

      delete serves[dappName].error;
    } catch (ex) {
      serves[dappName].error = ex.message;
    }

    // reset loading, rebuild if nessecary
    serves[dappName].loading = false;
    if (serves[dappName].rebuild) {
      buildDApp(dappDir);
    } else {
      logServing();
    }

    // remove rebuilding flag
    delete serves[dappName].rebuild;
  } else {
    // if multiple files were changed, set the rebuild flag
    serves[dappName].rebuild = true;
  }
}

// Run Express, auto rebuild and restart on src changes
gulp.task('dapps-serve', () => {
  dappDirs.forEach(dappDir =>
    gulp.watch(`${dappDir}/src/**/*`, (event) => buildDApp(dappDir, event))
  );

  setTimeout(() => logServing());
});

// Run Express, auto rebuild and restart on src changes
gulp.task('dapps-build', async function () {
  for (let dappDir of dappDirs) {
    try {
      // navigate to the dapp dir and run the build command
      process.chdir(dappDir);
      await runExec('npm run build');
    } catch (ex) {
      console.error(ex);
    }
  }
});

gulp.task('default', [ 'dapps-build' ]);
