'use strict';

import { src, series, dest, parallel, watch } from 'gulp';
import browserify from 'browserify';
import tsify from 'tsify';
import source from 'vinyl-source-stream';
import del from 'del';

const clean = () => {
	return del(['./dist/**', '!./dist']);
};

const copy = () => {
	return src('./src/**/*.{html,css,png}').pipe(dest('./dist'));
};

const typescript = () => {
	return browserify(['./src/js/game.ts'], { debug: true })
		.plugin(tsify)
		.bundle()
		.on('error', (err) => {
			console.error(err);
		})
		.pipe(source('bundle.js'))
		.pipe(dest('./dist'));
};

const build = series(clean, parallel(copy, typescript));

exports.default = build;
exports.watch = () => {
	watch('./src/**/*.ts', build);
};
