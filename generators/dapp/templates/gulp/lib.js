const exec = require('child_process').exec;
const path = require('path');
const { lstatSync, readdirSync } = require('fs');

const scriptsFolder = process.cwd();
const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
const nodeEnv = process.argv.indexOf('--prod') !== -1 ?'production' :
  process.env.NODE_ENV || 'development';

/**
 * Executes and console command
 *
 * @param      {string}       command        command to execute
 * @param      {string}       runtimeFolder  path for runtime folder
 * @return     {Promise<any}  resolved when command is finished
 */
async function runExec(command, runtimeFolder) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: runtimeFolder, NODE_ENV: nodeEnv }, async (err, stdout, stderr) => {
      if (err) {
        reject(stdout);
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = { runExec, scriptsFolder, isDirectory, getDirectories, nodeEnv }