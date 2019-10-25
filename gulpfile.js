const gulp = require('gulp');
const del = require('del');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const router = require('express').Router();
const colors = require('colors');
const dateformat = require('dateformat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;

//root paths
const src = './src';
const dist = './dist';

//source paths
const markup_src = `${src}/markup/**/*.pug`;
const scss_src = `${src}/scss/bundle.scss`;
const js_src = `${src}/js/**/*.js`;

//distribution paths
const html_dist = `${dist}`;
const css_dist = `${dist}/css`;
const js_dist = `${dist}/js`;
const all_dist = [html_dist, css_dist];

//watched paths
const watched_scss = `${src}/scss/**/*.scss`;
const watched_markup = `${src}/markup/**/*.pug`;
const watched_js = `${src}/js/**/*.js`;

//series definitions
const clean_series = ['clean'];
const markup_series = ['markup'];
const css_series = ['css'];
const js_series = ['js'];
const watch_series = ['watch'];
const default_series = [...clean_series, ...markup_series, ...css_series, ...js_series, ...watch_series];

clean = () => {
    return del(all_dist)
        .then(() => { log(`Success: Deleted transpiled files from '${dist}'`, 'success') });
}

markup = () => {
    return gulp.src(markup_src)
        .pipe(pug({ pretty: true })
            .on('error', () => { log('failed to get .pug files', 'error') })
            .on('end', () => { log('pug files found ...') }))

        .pipe(gulp.dest(html_dist)
            .on('error', () => { log(`Failed: HTML failed to write to '${html_dist}'`, 'error') })
            .on('end', () => { log(`Success: HTML transpiled and written to '${html_dist}'`, 'success') }))

        .pipe(browserSync.stream())
}

css = () => {
    return gulp.src([scss_src])
        .pipe(sourcemaps.init())

        .pipe(sass()
            .on('error', () => { log(`failed to get .scss files`, 'error') })
            .on('end', () => { log(`scss files found...`) }))

        .pipe(concat(`bundle.min.css`)
            .on('error', () => { log(`failed to concat to bundle.min.css`, 'error') })
            .on('end', () => { log(`scss bundled...`) }))

        .pipe(postcss([autoprefixer()])
            .on('error', () => { log(`failed to add browser prefixes`, 'error') })
            .on('end', () => { log(`browser prefixes added...`) }))

        .pipe(cleanCSS({ compatibility: 'ie8' })
            .on('error', () => { log(`failed to minify css`, 'error') })
            .on('end', () => { log(`minified css - compatibility : 'ie8'...`) }))

        .pipe(sourcemaps.write()
            .on('error', () => { log(`failed mapping minified css`, 'error') })
            .on('end', () => { log(`sourcemaps added...`) }))

        .pipe(gulp.dest(`${css_dist}`)
            .on('error', () => { log(`Failed: CSS failed to write to '${css_dist}'`, 'error') })
            .on('end', () => { log(`Success: CSS transpiled and written to '${css_dist}'`, 'success') }))

        .pipe(browserSync.stream());
}

js = () => {
    return gulp.src(js_src)
        .pipe(sourcemaps.init())

        .pipe(babel({
            "presets": ["@babel/preset-env"],
            "plugins": ["@babel/plugin-proposal-class-properties"]
        })
            .on('error', () => { log(`failed to get .js files`, 'error') })
            .on('end', () => { log(`javascript files found...`) }))

        .pipe(concat('bundle.min.js')
            .on('error', () => { log(`failed to concat to all.min.js`, 'error') })
            .on('end', () => { log(`javascript bundled...`) }))

        .pipe(uglify()
            .on('error', () => { log(`failed to minify javascript`, 'error') })
            .on('end', () => { log(`minified javascript...`) }))

        .pipe(sourcemaps.write('.')
            .on('error', () => { log(`failed mapping minified javascript`, 'error') })
            .on('end', () => { log(`sourcemaps added...`) }))

        .pipe(gulp.dest(js_dist)
            .on('error', () => { log(`Failed: Javascript failed to write to '${js_dist}'`, 'error') })
            .on('end', () => { log(`Success: Javascript transpiled and written to '${js_dist}'`, 'success') }))

        .pipe(browserSync.stream())

}

watch = () => {
    watchSeries(watched_scss, css_series);
    watchSeries(watched_markup, markup_series);
    watchSeries(watched_js, js_series);
    log("watching for file changes...");
}

watchSeries = (path, series) => {
    gulp.watch(path, (done) => {
        gulp.series(series)(done);
    });
}

sync = () => {
    browserSync.init({
        server: {
            baseDir: html_dist,
            index: "index.html",
        },
        open: true,
        notify: true,
        browser: ["chrome"],
        middleware: [function (req, res, next) {
            router(req, res, next)
        }]
    });
    log("browser syncing is active is active...");
}


log = (message, type) => {
    let timestamp = `${colors.white('[')}${colors.grey(dateformat(new Date(), 'hh:MM:ss'))}${colors.white(']')}`;

    if (type === 'error')
        return console.log(`${timestamp} ${colors.red(message)}`);

    if (type === 'success')
        return console.log(`${timestamp} ${colors.green(message)}`);

    return console.log(colors.blue(`${timestamp} ${colors.grey("-")}${message}`));
}

// > gulp clean
gulp.task('clean', () => { return clean() });

// > gulp markup
gulp.task('markup', () => { return markup() });

// > gulp css
gulp.task('css', () => { return css() });

// > gulp js
gulp.task('js', () => { return js() });

// > gulp watch
gulp.task('watch', () => { return watch() });

// > gulp sync
gulp.task('sync', () => { return sync() });

// > gulp
gulp.task('default', gulp.series(default_series));

// > gulp start
gulp.task('start', gulp.series(gulp.parallel(markup, css, js), gulp.parallel(watch, sync)));