import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import browserify from 'browserify';
import debowerify from 'debowerify';
import notifier from 'node-notifier';
import gutil from 'gulp-util';
import ngAnnotate from 'gulp-ng-annotate';
import templateCache from 'gulp-angular-templatecache';
// import browserSync from 'browser-sync';
import babel from 'gulp-babel';
var browserSync = require('browser-sync').create();
/**
 *  Caching templates
 */
gulp.task('templateCache', (cb) => {
  return gulp.src('client/**/*.html')
    .pipe(templateCache({
      standalone: true,
      root: 'client/'
    }))
    .pipe(gulp.dest('client/app'))
    // .on('end', cb);
});

/**
 * Build application (concat and uglify)
 */
gulp.task('buildApp', ['templateCache'], () => {
  return gulp.src([
    './client/app/components/modules.js/',
    './client/app/shared/modules.js/',
    './client/app/app.modules.js',
    './client/app/**/*.js',
    './client/app/*.js',
    './client/main.js'
  ])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('app.js'))
    .pipe(babel({presets: ['es2015'], compact: false, minified: true}).on('error', function(err) {
      gutil.log(gutil.colors.bold.red('Babel compile error'), err.message);
      notifier.notify({title: 'Babel compile error',message: err.message});
      this.emit('end');
    }))
    .pipe(ngAnnotate())
    .pipe(uglify().on('error', gutil.log).on('error', function(err) {
      gutil.log(gutil.colors.bold.red('Uglify error'), err.message);
      notifier.notify({title: 'Uglify error',message: err.message});
      this.emit('end');
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./client/build/'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Build application vendor (browserify and uglify)
 */
gulp.task('buildAppVendor', () => {
  var vendor = browserify('./client/vendor.js', {
    debug: false
  });
  vendor.transform(debowerify);
  vendor.bundle()
    .on('error', function (err) {
      gutil.log(gutil.colors.bgRed("Browserify error (Vendor)"), gutil.colors.bgBlue(err.message));
      notifier.notify({title: "Browserify error (Vendor)", message: err.message });
      this.emit("end");
    })
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./client/build/'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Build styles for application from SASS for
 */
gulp.task('buildSass', function () {
  return gulp.src('./client/main.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({outputStyle: 'compressed'}).on('error', function(err) {
      gutil.log(gutil.colors.bold.red('Sass compile error'), err.message);
      notifier.notify({title: 'Sass compile error',message: err.message});
      this.emit('end');
    }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./client/build/'))
    .pipe(browserSync.stream());
});

/**
 * Build styles for vendors from SASS
 */
gulp.task('buildSassVendor', function () {
  gulp.src('./client/vendor.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', function(err) {
      gutil.log(gutil.colors.bold.red('Sass compile error'), err.message);
      notifier.notify({title: 'Sass compile error',message: err.message});
      this.emit('end');
    }))
    .pipe(gulp.dest('./client/build/'))
    .pipe(browserSync.stream());
});

/**
 * Watch for file changes
 */
gulp.task('watch', function () {
  gulp.watch(['./client/main.js', './client/app/**/*.js'], ['buildApp']);
  gulp.watch(['./client/app/**/*.html'], ['buildApp']);
  gulp.watch('./client/vendor.js', ['buildAppVendor']);
  gulp.watch(['./client/main.scss', './client/styles/*.scss', './client/app/**/*.scss'], ['buildSass']);
  gulp.watch('./client/vendor.scss', ['buildSassVendor']);
  gulp.watch(['./*.html']).on("change", browserSync.reload);
});

/**
 * Start the server and watch for changes in server folder
 */
 gulp.task('browserSync', () => {
   browserSync.init({
     server: './'
   });
 });

// Default Gulp Task
gulp.task('default', ['buildApp', 'buildAppVendor', 'buildSass', 'buildSassVendor', 'browserSync', 'watch']);
