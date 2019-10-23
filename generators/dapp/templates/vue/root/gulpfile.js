const { lstatSync, readdirSync } = require('fs');
const gulp = require('gulp');
const path = require('path');
const del = require('del');
const exec = require('child_process').exec;
const dappDir = process.cwd();

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
        resolve(stdout);
      }
    });
  });
}

// Run Express, auto rebuild and restart on src changes
gulp.task('build', async function () {
  // load the dapp dbcp
  const dbcp = require(`${ dappDir }/dbcp.json`);
  const dappConfig = dbcp.public.dapp;
  const runtimeFolder = `../../node_modules/@evan.network/ui-dapp-browser/runtime/external/${dbcp.public.name}`;

  // clear the dist folder
  del.sync(`${dappDir}/dist`, { force: true });

  try {
    // bundle everything using webpack
    await runExec('../../node_modules/webpack/bin/webpack.js');

    // copy the dbcp.json and all css files into the runtimeFolder
    await new Promise((resolve, reject) => {
      gulp
        .src([
          `${ dappDir }/dbcp.json`,
          `${ dappDir }/src/**/*.css`,
        ])
        .pipe(gulp.dest(`${ dappDir }/dist`))
        .pipe(gulp.dest(runtimeFolder))
        .on('end', () => resolve());
    });

    // copy the build files into the runtimeFolder
    await new Promise((resolve, reject) => {
      gulp
        .src(`${ dappDir }/dist/**/*`)
        .pipe(gulp.dest(runtimeFolder))
        .on('end', () => resolve());
    });
  } catch (ex) {
    console.error(ex);
  }
});

gulp.task('default', gulp.series([ 'build' ]));
