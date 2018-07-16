var gulp = require('gulp');
var gulpClean = require('gulp-clean');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var  imageminMozjpeg = require('imagemin-mozjpeg');

gulp.task('default', ['style', 'images', 'scripts'],  defaultTask);
gulp.task('clean', cleanTask);
gulp.task('scripts', scriptsTask);
gulp.task('scripts-dist', scriptsDistTask);
gulp.task('images', imagesTask);
gulp.task('style', styleTask);

function defaultTask(done) {
	done();
}

function cleanTask() {
	gulp.src('dist/**/*', {read: false})
		.pipe(gulpClean({force: true}));
}

function scriptsTask() {
	gulp.src('js/**/*.js')
		//.pipe(babel({presets: ['env']}))
		//.pipe(concat('scripts.js'))
		.pipe(gulp.dest('dist/js'));
}

function scriptsDistTask() {
	gulp.src('js/**/*.js')
		//.pipe(babel({presets: ['env']}))
		//.pipe(concat('scripts.js'))
		//.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
}

function imagesTask(){

	gulp.src('img/icon.png')
		.pipe(gulp.dest('dist/img'));

	gulp.src('img/photos/*.jpg')
 		.pipe(imagemin({
			progressive: true,
			use: [pngquant()]
		}))
		.pipe(imagemin([imageminMozjpeg({
			quality: 85
	
		})]))		
		.pipe(gulp.dest('dist/img/photos'));

	gulp.src('img/photos/thumbnails/*.jpg')
 		.pipe(imagemin({
			progressive: true,
			use: [pngquant()]
		}))
		.pipe(imagemin([imageminMozjpeg({
			quality: 50
	
		})]))		
		.pipe(gulp.dest('dist/img/photos/thumbnails'));
}

function styleTask(){
	gulp.src('css/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('dist/css'));
}