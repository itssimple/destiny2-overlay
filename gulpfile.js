const gulp = require("gulp");
const replace = require("gulp-replace");
const sass = require("gulp-sass");
const cleancss = require("gulp-clean-css");
const purgecss = require("gulp-purgecss");

const exec = require("child_process").exec;
var uglify = require("gulp-uglify");
const fs = require("fs");

const md = require("markdown-it")();

gulp.task("fix-version", function () {
  const pinfo = require("./package.json");

  return gulp
    .src("src/manifest.json")
    .pipe(replace("$VERSION$", pinfo.version))
    .pipe(gulp.dest("./"));
});

gulp.task("fix-windows", function () {
  var changeLog = fs.readFileSync("CHANGELOG.md", "utf8");
  return gulp
    .src("src/windows/**/*.html")
    .pipe(replace("$CHANGELOG$", md.render(changeLog)))
    .pipe(gulp.dest("resources/compiled/windows/"));
});

gulp.task("styles-nano", function () {
  return gulp
    .src("src/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(cleancss())
    .pipe(gulp.dest("resources/compiled/css/"));
});

gulp.task("purge-unused-css", function () {
  return gulp
    .src("src/scss/bootstrap.min.css")
    .pipe(
      purgecss({
        content: ["src/windows/**/*.html", "src/scripts/**/*.js"],
      })
    )
    .pipe(gulp.dest("resources/compiled/css/"));
});

gulp.task("minify-scripts", function () {
  return gulp
    .src("src/scripts/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("resources/compiled/scripts/"));
});

gulp.task("build-archive", function (callback) {
  exec(
    "PowerShell.exe -File .\\CreateNewPackage.ps1",
    function (err, stdout, stderr) {
      console.log(stdout);
      callback(err);
    }
  );
});

gulp.task("default", function () {
  gulp.watch(
    "src/scss/**/*.scss",
    gulp.series(
      "styles-nano",
      "fix-windows",
      "purge-unused-css",
      "fix-version",
      "build-archive"
    )
  );

  gulp.watch(
    "src/manifest.json",
    gulp.series("fix-version", "fix-windows", "build-archive")
  );

  gulp.watch(
    "src/windows/*.*",
    gulp.series(
      "styles-nano",
      "fix-windows",
      "purge-unused-css",
      "fix-version",
      "build-archive"
    )
  );

  gulp.watch(
    "package.json",
    gulp.series("fix-version", "fix-windows", "build-archive")
  );

  gulp.watch("CHANGELOG.md", gulp.series("fix-windows"));

  gulp.watch(
    "src/scripts/**/*.js",
    gulp.series("minify-scripts", "fix-windows", "build-archive")
  );
});

gulp.task(
  "deploy",
  gulp.series(
    "minify-scripts",
    "styles-nano",
    "purge-unused-css",
    "fix-version",
    "fix-windows",
    "build-archive"
  )
);
