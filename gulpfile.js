const gulp = require('gulp'),
      nodemon = require('gulp-nodemon'),
      notifier = require('node-notifier'),
      rimraf = require('rimraf'),
      babel = require("gulp-babel"),
      runSequence = require('run-sequence');

gulp.task('default', () => {
  nodemon({
    script: './index.js',
    ext: 'js',
    tasks: function (changedFiles) {
      var tasks = [];
      changedFiles.forEach((file) => {
        if (file.indexOf('command/generateSVG') === 0 || file.indexOf('command\\generateSVG') === 0) {
          tasks = ['build'];
        }
      });
      return tasks;
    },
    ignore: ['gulpfile.js']
  })
    .on('crash', () => {
      notifier.notify({
        title: 'nodemon',
        message: 'App crashed!',
        sound: true
      });
    });
});

// Clean
gulp.task('clean', (callback) => {
  rimraf('./command/generateSVG/dest', callback);
});

// Babel
gulp.task('babel', () => {
  return gulp.src('./command/generateSVG/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./command/generateSVG/dest'));
});

// Build
gulp.task('build', (callback) => {
  return runSequence(
    'clean',
    'babel',
    callback
  );
});
