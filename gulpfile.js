// https://code.visualstudio.com/Docs/languages/CSS

const gulp = require("gulp");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const less = require("gulp-less");

const sassPattern = "./src/**/*.scss";
const lessPattern = "./src/**/*.less";

// Sass configuration
gulp.task("sass", (cb) => {
  gulp
    .src(sassPattern)
    .pipe(sass())
    .pipe(
      rename({
        extname: ".wxss",
      }),
    )
    .pipe(
      gulp.dest((f) => {
        return f.base;
      }),
    );
  cb();
});
gulp.task(
  "watch-sass",
  gulp.series("sass", (cb) => {
    gulp.watch(sassPattern, gulp.series("sass"));
    cb();
  }),
);

// Less configuration
gulp.task("less", (cb) => {
  gulp
    .src(lessPattern)
    .pipe(less())
    .pipe(
      rename({
        extname: ".wxss",
      }),
    )
    .pipe(
      gulp.dest((f) => {
        return f.base;
      }),
    );
  cb();
});
gulp.task(
  "watch-less",
  gulp.series("less", (cb) => {
    gulp.watch(lessPattern, gulp.series("less"));
    cb();
  }),
);

// default
gulp.task("default", gulp.series("watch-sass", "watch-less"));
