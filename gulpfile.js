(function () {
	'use strict';

	let gulp = require('gulp');
	let tsify = require('tsify');
	let browserify = require('browserify');
	let source = require('vinyl-source-stream');
	let del = require('del');

	gulp.task('clean', function () {
		return del(['./dist/**', '!./dist']);
	});

	gulp.task('copy', ['clean'], function () {
		return gulp.src('./src/**/*.{html,css,png}')
			.pipe(gulp.dest('./dist'));
	});

	gulp.task('ts', ['clean'], function () {
		browserify(['./src/js/game.ts'], {
				debug: true
			})
			.plugin(tsify)
			.bundle()
			.on('error', function (error) { console.error(error.toString()); })
    		.pipe(source('bundle.js'))
    		.pipe(gulp.dest('./dist'));
	});


	gulp.task('default', function () {
		gulp.start('copy', 'ts');
	});
})();