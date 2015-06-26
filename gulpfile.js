var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('default', function() {
  gulp.src('txtinput.js')
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest('.'))
});
