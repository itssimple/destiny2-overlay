const gulp = require("gulp");
const replace = require("gulp-replace");
const sass = require("gulp-sass")(require("sass"));
const cleancss = require("gulp-clean-css");
const purgecss = require("gulp-purgecss");

const esbuild = require("gulp-esbuild");
const rimraf = require("rimraf");

const exec = require("child_process").exec;
var uglify = require("gulp-uglify");
const fs = require("fs");

const md = require("markdown-it")();

gulp.task("clean", (cb) => {
  rimraf("resources/compiled", cb);
  rimraf("public/", cb);
});

gulp.task("fix-version", function () {
  const pinfo = require("./package.json");

  return gulp.src("src/manifest.json").pipe(replace("$VERSION$", pinfo.version)).pipe(gulp.dest("./"));
});

gulp.task("fix-windows", function (callback) {
  var changeLog = fs.readFileSync("CHANGELOG.md", "utf8");
  require("fs").writeFileSync("public/changelog.html", md.render(changeLog), {
    encoding: "utf8",
    flag: "w",
  });

  callback();
});

gulp.task("styles-nano", function () {
  return gulp
    .src("src/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(cleancss())
    .pipe(gulp.dest("public/css/"));
});

gulp.task("purge-unused-css", function () {
  return gulp
    .src("src/scss/*.css")
    .pipe(
      purgecss({
        content: ["src/windows/**/*.html", "src/scripts/**/*.js", "src/scripts/**/*.ts", "src/scripts/**/*.tsx"],
      })
    )
    .pipe(gulp.dest("public/css/"));
});

gulp.task("minify-scripts", function () {
  return gulp.src("src/scripts/**/*.js").pipe(uglify()).pipe(gulp.dest("resources/compiled/scripts/"));
});

gulp.task("build-archive", function (callback) {
  exec("PowerShell.exe -File .\\CreateNewPackage.ps1", function (err, stdout, stderr) {
    console.log(stdout);
    callback(err);
  });
});

gulp.task("build-ts", (callback) => {
  exec("yarn snowpack build", function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    callback(err);

    rimraf("resources/compiled/manifest.json", callback);
    rimraf("resources/compiled/scss", callback);
  });
});

gulp.task("default", function () {
  gulp.watch(
    "src/scss/**/*.scss",
    gulp.series(
      "clean",
      "styles-nano",
      "purge-unused-css",
      "fix-windows",
      "build-ts",
      //"minify-scripts",
      "fix-version",
      "build-archive"
    )
  );

  gulp.watch(
    "src/manifest.json",
    gulp.series(
      "clean",
      "styles-nano",
      "purge-unused-css",
      "fix-windows",
      "build-ts",
      //"minify-scripts",
      "fix-version",
      "build-archive"
    )
  );

  gulp.watch(
    "src/windows/*.*",
    gulp.series(
      "clean",
      "styles-nano",
      "purge-unused-css",
      "fix-windows",
      "build-ts",
      //"minify-scripts",
      "fix-version",
      "build-archive"
    )
  );

  gulp.watch(
    "package.json",
    gulp.series(
      "clean",
      "styles-nano",
      "purge-unused-css",
      "fix-windows",
      "build-ts",
      //"minify-scripts",
      "fix-version",
      "build-archive"
    )
  );

  gulp.watch("CHANGELOG.md", gulp.series("fix-windows"));

  gulp.watch(
    ["src/scripts/**/*.tsx", "src/scripts/**/*.ts"],
    gulp.series(
      "clean",
      "styles-nano",
      "purge-unused-css",
      "fix-windows",
      "build-ts",
      //"minify-scripts",
      "fix-version",
      "build-archive"
    )
  );

  gulp.watch(
    "src/scripts/**/*.js",
    gulp.series(
      "clean",
      "styles-nano",
      "purge-unused-css",
      "fix-windows",
      "build-ts",
      //"minify-scripts",
      "fix-version",
      "build-archive"
    )
  );
});

gulp.task(
  "deploy",
  gulp.series(
    "clean",
    "styles-nano",
    "purge-unused-css",
    "fix-windows",
    "build-ts",
    //"minify-scripts",
    "fix-version",
    "build-archive"
  )
);
