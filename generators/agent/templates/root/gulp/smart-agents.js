/*
  Copyright (c) 2018-present evan GmbH.
 
  Licensed under the Apache License, Version 2.0 (the 'License');
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an 'AS IS' BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const gulp = require('gulp')
const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn

gulp.task('link-agents', () => {
  const plugins = path.resolve(process.cwd(),'node_modules/@evan.network/edge-server-seed/config/plugins.js')
  const source_plugins = '../../../../scripts/config/plugins.js'
  try { fs.unlinkSync(plugins) } catch(e){}
  fs.symlink(source_plugins, plugins,  () => { console.log('Replaced ', plugins) })
  gulp.src('smart-agent-*/config/*.js', { read: false })
    .on('data', d => {
      const c = d.history[0]
      const p = path.parse(c)
      const agent_name = p.dir.match('(smart-agent-.*)/config')[1]
      const link = 'node_modules/@evan.network/edge-server-seed/config/' + p.base
      const dd = p.dir.slice(0,-7)
      const dlink = 'node_modules/@evan.network/edge-server-seed/node_modules/' + agent_name

      if(agent_name === p.name) console.log("Linked plugin: ",link,' ', dd, ' ', dlink )

      if(agent_name === p.name) {
        fs.symlink(c, link, () => console.log("Linked plugin: ", agent_name ))
        fs.symlink(dd, dlink, () => {} )
      }
    })
})

gulp.task('test-agents', () => {
  const cmd = `
npm start;
`
  return spawn(cmd, [], { stdio: 'inherit', shell: true });
})

function agentFilesCommands(M, A) {
  const suffix = M === A ? '' : '-'+M
  const cfg = A + '.js'
  const m = M + '.js' 
  const S = A+'/'
  const E = 'node_modules/@evan.network/edge-server-seed'
  const plugin = `'${A}': { path: __dirname + '/../node_modules/${A}' },`
  const match = '// EDGE-SERVER SMART-AGENT-PLUGIN'
  
  return [
    'tmp=`mktemp -d`','dst=$PWD/build/'+ A + suffix + '.tgz','mkdir -p $tmp/'+A+'/config',
    'mkdir -p $tmp/'+E+'/config $tmp/'+E+'/node_modules $tmp/contracts',
    'cp build/contracts/compiled.json build/contracts/compiled.js $tmp/contracts',
    'cp -R '+S+'initializers '+S+'actions $tmp/'+A,
    'cp '+S+'config/' + m + ' $tmp/'+S+'config/'+cfg,
    //"sed -e 's|"+match+"|"+plugin+"|' scripts/plugins.js > $tmp/"+E+'/config/plugins.js',
    'cp '+S+'config/' + m + ' $tmp/'+E+'/config/'+cfg,
    'ln -s ../../'+A+' $tmp/'+E+'/node_modules/'+A,
    'cd $tmp',
    'tar czf $dst *',
    'cd -',
    'rm -r $tmp'
  ]
}

// when MACHINE_CONFIG is set, it uses this instead of a generic config
gulp.task('smart-agent', () => {
  gulp.src('smart-agent-*/config/*.js', { read: false })
    .on('data', d => {
      const p  = path.parse(d.history[0])
      const agent_name = p.dir.match('(smart-agent-.*)/config')[1]
      const cmd = agentFilesCommands(p.name, agent_name)
      spawn(cmd.join(';'), [], { stdio: 'inherit', shell: true });
    })
})
