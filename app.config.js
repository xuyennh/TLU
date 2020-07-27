const isDev = process.env.NODE_ENV === 'dev';
const config = {
	src: {
		root: 'src',
		styles: 'src/assets/scss',
		js: 'src/assets/js',
		vendors: 'src/assets/vendors',
		images: 'src/assets/images'
	},
	build: {
		root: 'build',
		styles: 'build/assets/css',
		js: 'build/assets/js',
		vendors: 'build/assets/vendors',
		images: 'build/assets/images'
	},
	react_public: {
		root: '../react/public',
		styles: '../react/public/assets/css',
		js: '../react/public/assets/js',
		vendors: '../react/public/assets/vendors',
		images: '../react/public/assets/images'
	},
	cache: {
		root: '.cache',
		styles: '.cache/assets/css',
		js: '.cache/assets/js'
	},
	browserSync: {
		port: process.env.PORT || 8080,
		baseDir: [ 'src', isDev ? '.cache' : 'build' ]
	}
};

module.exports = config;
