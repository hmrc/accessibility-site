const path = require('path')
const gulp = require('gulp')
const sass = require('gulp-sass')(require('node-sass'))
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const rename = require('gulp-rename')
const header = require('gulp-header')
const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')

const pathFromRoot = require('../../util/pathFromRoot')

const scssPaths = [
  pathFromRoot('node_modules', 'govuk-frontend', '*.scss')
]

const errorHandler = function (error) {
  // Log the error to the console
  console.error(error.message)

  // Ensure the task we're running exits with an error code
  this.once('finish', () => process.exit(1))
  this.emit('end')
}

gulp.task('scss:watch', (done) => {
  gulp.watch(pathFromRoot('**', '*.scss'), gulp.parallel('rebuild'))
  done()
})

gulp.task('scss:accessibility-site', (done) => {
  gulp.src('./application/scss/accessibility-site.scss')
    .pipe(header('$govuk-assets-path: "/extension-assets/govuk-frontend/govuk/assets/";\n'))
    .pipe(plumber(errorHandler))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(postcss([
      autoprefixer,
      cssnano
    ]))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./dist'))
    .on('end', done)
})

gulp.task('scss:pattern-libraries', (done) => {
  gulp.src(scssPaths, { base: 'node_modules' })
    .pipe(plumber(errorHandler))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    // minify css add vendor prefixes and normalize to compiled css
    .pipe(postcss([
      autoprefixer,
      cssnano
    ]))
    .pipe(rename((path) => {
      path.basename = path.dirname
      path.dirname = 'assets/stylesheets'
      path.extname = '.min.css'
    }))
    .pipe(gulp.dest('./dist'))
    .on('end', done)
})

gulp.task('scss:compile', gulp.parallel('scss:pattern-libraries', 'scss:accessibility-site'))
