const gulp = require('gulp')
const livereload = require('gulp-livereload')

require('./tasks/gulp/clean')
require('./tasks/gulp/build')
require('./tasks/gulp/sass')
require('./tasks/gulp/copy-assets')
require('./tasks/gulp/serve')

gulp.task('watch', gulp.parallel('build:watch', 'scss:watch', 'copy-assets:watch', (done) => {
  livereload.listen()
  done()
}))

gulp.task('prepare', gulp.series('compile', 'scss:compile', 'copy-assets'))

gulp.task('build', gulp.series('clean', 'prepare'))

gulp.task('default', gulp.series('build', 'watch', 'serve'))

gulp.task('rebuild', gulp.series('build', (done) => {
  console.log('Reloading page')
  gulp.src('dist/*').pipe(livereload({ quiet: true }))
  done()
}))
