const fs = require('fs-extra');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const minifyjs = require('gulp-js-minify');
const sassGlob = require('gulp-sass-glob');
const util = require('gulp-util');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const autoprefixer = require('gulp-autoprefixer');
const config = require('./app.config');
const isDev = process.env.NODE_ENV === 'dev';

gulp.task('watch', [ 'sass', 'pug', ...(!isDev ? [ 'js' ] : []) ], () => {
	try {
		gulp.watch(`${config.src.root}/**/*`, [ 'sass' ]);
		gulp.watch(`${config.src.root}/**/*`, [ 'pug' ]);
		gulp.watch(`${config.src.root}/*.html`).on('change', browserSync.reload);
		if (isDev) {
			gulp.watch(`${config.cache.root}/*.html`).on('change', browserSync.reload);
		}
		if (!isDev) {
			gulp.watch(`${config.src.js}/**/*`, [ 'js' ]);
		}
		gulp.watch(`${config.src.js}/*.js`).on('change', browserSync.reload);
	} catch (err) {
		console.log(err);
	}
});

// Static Server + watching scss/html files
gulp.task('serve', () => {
	browserSync.init({
		port: config.browserSync.port,
		server: {
			baseDir: config.browserSync.baseDir
		},
		logConnections: true,
		logFileChanges: true,
		notify: true,
		open: isDev
	});
});

function setPlumber() {
	return plumber({
		errorHandler: (err) => {
			notify.onError({
				title: 'Gulp error in ' + err.plugin,
				message: err.toString()
			})(err);

			// play a sound once
			util.beep();
		}
	});
}

gulp.task('sass', () => {
	if (isDev) {
		return gulp
			.src(`${config.src.styles}/*.scss`)
			.pipe(sourcemaps.init())
			.pipe(setPlumber())
			.pipe(sassGlob())
			.pipe(sass())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(config.cache.styles))
			.pipe(browserSync.stream());
	}
	return gulp
		.src(`${config.src.styles}/*.scss`)
		.pipe(setPlumber())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(
			autoprefixer({
				browsers: [ 'last 2 versions' ],
				cascade: false
			})
		)
		.pipe(gulp.dest(config.build.styles))
		.pipe(gulp.dest(config.react_public.styles))
		.pipe(browserSync.stream());
});

gulp.task('js', () => {
	return (
		gulp
			.src(`${config.src.js}/*.js`)
			// .pipe(concat("script.min.js"))
			// .pipe(minifyjs())
			.pipe(gulp.dest(isDev ? config.cache.js : config.build.js))
			.pipe(gulp.dest(isDev ? config.cache.js : config.react_public.js))
	);
});

gulp.task('pug', () => {
	return gulp
		.src(`${config.src.root}/*.pug`)
		.pipe(plumber())
		.pipe(
			pug({
				pretty: true,
				globals: [ 'require' ]
			})
		)
		.pipe(gulp.dest(isDev ? config.cache.root : config.build.root))
		.pipe(gulp.dest(isDev ? config.cache.root : config.react_public.root));
});

if (isDev) {
	fs.removeSync(config.build.root);
} else {
	fs.removeSync(config.cache.root);
}

gulp.task('copyImages', () => {
	return gulp
		.src(`${config.src.images}/**/*`)
		.pipe(gulp.dest(config.build.images))
		.pipe(gulp.dest(config.react_public.images));
});

gulp.task('copyVendors', () => {
	return gulp
		.src(`${config.src.vendors}/**/*`)
		.pipe(gulp.dest(config.build.vendors))
		.pipe(gulp.dest(config.react_public.vendors));
});

gulp.task('copyHtml', () => {
	return gulp
		.src(`${config.src.root}/*.html`)
		.pipe(gulp.dest(config.build.root))
		.pipe(gulp.dest(config.react_public.root));
});

gulp.task('dev', [ 'serve', 'watch' ]);

gulp.task('build', [ 'serve', 'watch', 'copyImages', 'copyVendors', 'copyHtml' ], () => {
	browserSync.exit();
	process.exit();
});
