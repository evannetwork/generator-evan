const fs = require('fs')
const gulp = require('gulp')

const ch = require('../scripts/contracts-helper.js')
const config = require('../scripts/config/deployment.js').runtimeConfig

const buildFolder = '../build'

// any tasks that depends on evan-access needs to call evan_close at its end
gulp.task('evan-access', gulp.series((cb) => {
  evan.init(config)
    .then(() => { cb() })
    .catch(err => { cb(err) })
}))

gulp.task('build', gulp.series((cb) => { if(!fs.existsSync(buildFolder)) fs.mkdirSync(buildFolder); cb(); }))
gulp.task('compile-contracts', gulp.series(['build']), ch.compile('contracts', '../build/contracts') )
gulp.task('default', gulp.series(['compile-contracts']))
