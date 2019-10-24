const fs = require('fs')
const gulp = require('gulp')

const ch = require('../scripts/contracts-helper.js')
const config = require('../scripts/config/deployment.js').runtimeConfig

const buildFolder = '../build'

// any tasks that depends on evan-access needs to call evan_close at its end
gulp.task('evan-access', (cb) => {
  evan.init(config)
    .then(() => { cb() })
    .catch(err => { cb(err) })
})

gulp.task('build', function(){ if(!fs.existsSync(buildFolder)) fs.mkdirSync(buildFolder) })

gulp.task('compile-contracts', ['build'], ch.compile('contracts', '../build/contracts') )

gulp.task('default', ['compile-contracts'])
