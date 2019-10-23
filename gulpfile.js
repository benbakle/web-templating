const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const source_path = './src';
const target_path = './dist';

//source paths
const scss_source = `${source_path}/scss/**/*.scss`;
const global_scss_source = `${source_path}/scss/bundle.scss`;

//target paths
const css_target = `${target_path}/css`;
const generated_code_file_paths = [css_target];

//Task definitions
const css_tasks = ['css'];
const default_tasks = ['clean', ...css_tasks, 'watch'];

gulp.task('clean', () => { return deleteGeneratedFiles() });
gulp.task('css', () => { return bundledCSS() });
gulp.task('watch', () => { return watchList() });
gulp.task('default', gulp.series(default_tasks));

deleteGeneratedFiles = () => {
    return del(generated_code_file_paths);
}

bundledCSS = () => {
    return gulp.src([global_scss_source])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat(`bundle.min.css`))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(`${css_target}`))
       // .pipe(browserSync.stream());
}

watchList = () => {
    watch(scss_source, css_tasks); //css
}

watch = (path, tasks) => {
    gulp.watch(path, (done) => {
        gulp.series(tasks)(done);
    });
}


