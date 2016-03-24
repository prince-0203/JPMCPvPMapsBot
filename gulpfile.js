const gulp = require('gulp'),
      nodemon = require('gulp-nodemon'),
      notifier = require('node-notifier');

gulp.task('default', () => {
  nodemon({
    script: './index.js',
    ext: 'js',
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
