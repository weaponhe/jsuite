var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('build', function() {
	browserify('./test/test.js', {
			debug: true
		})
		.bundle().on('error', function(e) {
			console.log(e);
		})
		.pipe(source('script.js'))
		.pipe(gulp.dest('./test/'));
});

gulp.task('watch', function() {
	gulp.watch(['./test/*.js', './lib/*.js'], ['build']);
});