const babel  = require("gulp-babel");
const babelRegister = require('babel-register');
const concat = require("gulp-concat");
const gulp   = require('gulp');
const jshint = require('gulp-jshint');
const mocha  = require('gulp-mocha');
const sourcemaps = require("gulp-sourcemaps");
const watch  = require('gulp-watch');

gulp.task('default', ['compile', 'test']);

gulp.task('watch', function() {
    gulp.watch(['spec/**', 'src/**'],   { ignoreInitial: false }, ['compile', 'test']);
});

gulp.task("compile", function () {
    gulp
        .src("src/**.js")
        .pipe(jshint({esversion: 6}))
        .pipe(jshint.reporter('default'))
        .pipe(sourcemaps.init())
        .pipe(babel({
  "plugins": ["transform-es2015-modules-umd"]
}))
        .pipe(gulp.dest("dist"));
});
  
gulp.task('test', function() {
    gulp
        .src(['spec/*.js'])
        .pipe(jshint({esversion: 6}))
        .pipe(jshint.reporter('default'))
        .pipe(mocha({
            compilers:babelRegister
        }));
});