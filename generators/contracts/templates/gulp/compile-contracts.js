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

const fs = require('fs')
const gulp = require('gulp')

const getEvanAccessConfig = require('../scripts/getEvanAccessConfig.js')
const evan = require('../scripts/evan.access.js')


const buildFolder = 'build'

// any tasks that depends on evan-access needs to call evan_close at its end
gulp.task('evan-access', (cb) => {
  evan.init(getEvanAccessConfig())
    .then(() => { cb() })
    .catch(err => { cb(err) })
})

gulp.task('build', function(){ if(!fs.existsSync(buildFolder)) fs.mkdirSync(buildFolder) })

gulp.task('compile-contracts', ['build'], evan.compile('contracts', 'build/contracts') )

gulp.task('default', ['evan-access', 'compile-contracts'])