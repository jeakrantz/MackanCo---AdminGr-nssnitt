let { src, dest, parallel, series, watch } = require('gulp');
let concat = require('gulp-concat');
let terser = require('gulp-terser');
let cssnano = require('gulp-cssnano');
let browserSync = require('browser-sync').create();
var reload = browserSync.reload;
const sass = require('gulp-sass')(require('node-sass'));
var ts = require('gulp-typescript');

//sökvägar

let files = {
    htmlPath: "src/**/*.html",
    cssPath: "src/css/*.css",
    jsPath: "src/js/*.js",
    sassPath: "src/sass/*.scss",
    tsPath: "src/typescript/*.ts"
}

//HTML-task, kopiera html
function copyHTML() {
    return src(files.htmlPath)
        .pipe(dest('pub'));
}

//CSS-task
function cssTask() {
    return src(files.cssPath)
        /* Slå ihop filer */
        .pipe(concat('main.css'))
        /* ta bort kommentarer och radbrytningar */
        .pipe(cssnano())
        .pipe(dest('pub/css'));
}


//JS-task
function jsTask() {
    return src(files.jsPath)
        /* slå ihop filer */
        .pipe(concat('main.js'))
        /* ta bort kommentarer */
        .pipe(terser())
        .pipe(dest('pub/js'));
}

function typescriptTask() {
    return src(files.tsPath)
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'typescript.js'
        }))
        .pipe(dest('pub/js'));
}

function sassTask() {
    return src(files.sassPath)
        .pipe(sass().on("error", sass.logError))
        .pipe(dest("pub/css"))
        .pipe(browserSync.stream());
}


//Watch-task, kör tasks om något ändras i filerna.
function watchTask() {

    // ändringar live i browser
    browserSync.init({
        server: {
            baseDir: "./pub"
        }
    });

    watch([files.htmlPath, files.cssPath, files.jsPath, files.sassPath, files.tsPath], parallel(copyHTML, cssTask, jsTask, sassTask, typescriptTask)).on("change", reload);

}

exports.default = series(
    parallel(copyHTML, cssTask, jsTask, sassTask, typescriptTask),
    watchTask
);