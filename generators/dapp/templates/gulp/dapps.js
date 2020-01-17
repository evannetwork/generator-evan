const gulp = require('gulp');
const path = require('path');
const { runExec, getDirectories, nodeEnv } = require('./lib');

const dappDirs = getDirectories(path.resolve('../dapps'));
let longestDAppName = 0;

for (let dappDir of dappDirs) {
  const dappNameLength = dappDir.split('/').pop().length;

  if (longestDAppName < dappNameLength) {
    longestDAppName = dappNameLength;
  }
}

/**
 * Fill dapp name with spaces to create an clean watching log.
 *
 * @param      {string}  dappName  dapp name
 * @return     {string}  filled dapp name
 */
const getFilledDAppName = (dappName) => {
  while (dappName.length < longestDAppName + 5) {
    dappName += ' ';
  }

  return dappName;
}

/**
 * save latest serve and build status
 */
const serves = { };
dappDirs.forEach(dappDir => {
  const dappName = dappDir.split('/').pop();

  serves[dappName] = { duration: 0, lastDuration: 0 };
});

/**
 * Show the current wachting status
 */
const logServing = () => {
  console.clear();

  console.log(`Watching DApps: ${ nodeEnv }`);
  console.log('--------------\n');

  for (let dappDir of dappDirs) {
    const dappName = dappDir.split('/').pop();
    const logDAppName = getFilledDAppName(dappName);

    // load the status of the dapp
    const timeLog = `(${ serves[dappName].duration }s / ${ serves[dappName].lastDuration }s)`;
    if (serves[dappName].rebuild) {
      console.log(`  ${ logDAppName }:     rebuilding ${ timeLog }`);
    } else if (serves[dappName].loading) {
      console.log(`  ${ logDAppName }:   building ${ timeLog }`);
    } else {
      console.log(`  ${ logDAppName }: watching ${ timeLog }`);
    }

    if (serves[dappName].error) {
      console.log();
      console.error(serves[dappName].error);
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
const buildDApp = async (dappDir) => {
  // if its not already building, build the dapp
  const dappName = dappDir.split('/').pop();
  if (!serves[dappName].loading) {
    serves[dappName].loading = true;
    serves[dappName].error = '';
    logServing();

    // track the build time
    const startTime = Date.now();
    const timeCounter = setInterval(() => {
      serves[dappName].duration = Math.round((Date.now() - startTime) / 1000);
      logServing();
    }, 1000);

    try {
      // navigate to the dapp dir and run the build command
      process.chdir(dappDir);

      await runExec('npm run build', dappDir);

      // clear timer and calculate time
      serves[dappName].lastDuration = Math.round((Date.now() - startTime) / 1000);

      delete serves[dappName].error;
    } catch (ex) {
      serves[dappName].error = ex;
    }

    clearInterval(timeCounter);

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
gulp.task('dapps-serve', gulp.series(async () => {
  dappDirs.forEach(dappDir =>
    gulp.watch(`${dappDir}/src/**/*`, (event) => buildDApp(dappDir))
  );

  setTimeout(() => logServing());
}));

// Run Express, auto rebuild and restart on src changes
gulp.task('dapps-build', gulp.series(async function () {
  for (let dappDir of dappDirs) {
    try {
      // navigate to the dapp dir and run the build command
      await buildDApp(dappDir);
    } catch (ex) {
      console.error(ex);
    }
  }
}));

gulp.task('default', gulp.series([ 'dapps-build' ]));
