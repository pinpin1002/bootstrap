const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const fs = require("fs");
const path = require("path");

const paths = {
  baseDir: "dist",
  scss: "scss/**/*.scss",
  cssOutput: "dist/assets/css",
  html: "dist/**/*.html",
};

// 編譯 Sass
function compileSass() {
  return (
    gulp
      .src(paths.scss, { allowEmpty: true })
      .pipe(sass().on("error", sass.logError))
      .pipe(autoprefixer({ cascade: false }))
      // .pipe(cleanCSS())
      // .pipe(rename({ suffix: ".min" }))
      .pipe(gulp.dest(paths.cssOutput))
      .pipe(browserSync.stream())
  );
}

// 刪除對應的 CSS + sourcemap 檔案
function deleteCssFile(scssFilePath) {
  const fileName = path.basename(scssFilePath, ".scss");
  const cssPath = path.join(paths.cssOutput, `${fileName}.css`);
  const mapPath = `${cssPath}.map`;

  if (fs.existsSync(cssPath)) {
    fs.unlinkSync(cssPath);
    console.log(`🗑 Deleted CSS: ${cssPath}`);
  }

  if (fs.existsSync(mapPath)) {
    fs.unlinkSync(mapPath);
    console.log(`🗑 Deleted Map: ${mapPath}`);
  }
}

// 啟動開發伺服器與監聽任務
function serve() {
  browserSync.init({
    server: {
      baseDir: paths.baseDir,
    },
    port: 3000,
  });

  const watcher = gulp.watch(paths.scss, compileSass);

  // 刪除 SCSS 對應 CSS 的邏輯
  watcher.on("unlink", function (filePath) {
    deleteCssFile(filePath);
  });

  gulp.watch(paths.html).on("change", browserSync.reload);
}

exports.default = gulp.series(compileSass, serve);
exports.build = compileSass;
