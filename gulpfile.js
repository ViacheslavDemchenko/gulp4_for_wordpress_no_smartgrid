const gulp = require('gulp'),
    pug = require('gulp-pug'),
    del = require('del'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    htmlhint = require('gulp-htmlhint'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    gcmq = require('gulp-group-css-media-queries'),
    sourcemaps = require('gulp-sourcemaps'),
    csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    imgmin = require('gulp-tinypng-nokey'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    newer = require('gulp-newer'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    browserSync = require('browser-sync').create(),
    webp = require('gulp-webp');


/* FILES PATHS /wp-content/themes/twentytwenty-child/*/

const paths = {
    prod: {
        build: './build'
    },
    html: {
        src: './src/pages/*.pug',
        dest: './build',
        watch: ['./src/blocks/**/*.pug', './src/mixins-pug/**/*.pug', './src/pages/**/*.pug', './src/sections/**/*.pug']
    },
    css: {
        src: './src/styles/main.scss',
        dest: './build/wp-content/themes/twentytwenty-child/css',
        watch: ['./src/blocks/**/*.scss', './src/sections/**/*.scss', './src/styles/**/*.scss', './src/css-libraries/**/*', '!./src/css-plugins/**/*', '/build/wp-content/themes/twentytwenty-child/css/*.css']
    },
    cssPlugins: {
        src: './src/css-plugins/**/*',
        dest: './build/wp-content/themes/twentytwenty-child/css',
        watch: './src/css-plugins/**/*'
    },
    js: {
        src: ['./src/js/libraries/**/*.js',  './src/js/custom/**/*.js', 'node_modules/svgxuse/svgxuse.min.js'],
        dest: './build/wp-content/themes/twentytwenty-child/js',
        watch: ['./src/js/libraries/**/*.js', './src/js/custom/**/*.js', ]
    },
    jsPlugins: {
        src: './src/js/plugins/**/*.js',
        dest: './build/wp-content/themes/twentytwenty-child/js',
        watch: './src/js/plugins/**/*.js'
    },
    images: {
        src: ['./src/img/**/*', '!./src/img/**/*.svg', '!./src/img/**/*.webp'],
        dest: './build/wp-content/themes/twentytwenty-child/img',
        watch: ['./src/img/**/*', '!./src/img/**/*.svg', '!./src/img/**/*.webp']
    },
    webpImages: {
        src: './src/img/**/*.webp',
        dest: './build/wp-content/themes/twentytwenty-child/img',
        watch: './src/img/**/*.webp'
    },
    svgSprite: {
        src: './src/img/icons/**/*.svg',
        dest: './build/wp-content/themes/twentytwenty-child/img/icons',
        watch: './src/img/icons/**/*.svg'
    },
    svg: {
        src: ['./src/img/**/*.svg', '!./src/img/icons/**/*.svg'],
        dest: './build/wp-content/themes/twentytwenty-child/img/icons',
        watch: ['./src/img/**/*.svg', '!./src/img/icons/**/*.svg']
    },
    fonts: {
        src: './src/fonts/**/*',
        dest: './build/wp-content/themes/twentytwenty-child/fonts',
        watch: './src/fonts/**/*'
    },
    php: {
        src: './src/php/**/*.php',
        dest: './build/wp-content/themes/twentytwenty-child/php',
        watch: './src/php/**/*.php'
    }
};

/* PPUG TO HTML MINIFICATION */

gulp.task('html', () => {
    return gulp.src(paths.html.src)
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
        .pipe(htmlhint.failOnError())
        //.pipe(htmlmin({
        //    collapseWhitespace: true
        //}))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream())
});

/* SCSS TO CSS CONVERTATION & MINIFICATION */

gulp.task('styles', () => {
    return gulp.src(paths.css.src)
        .pipe(plumber())
        //.pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            Browserslist: ['last 3 versions'],
            cascade: true
        }))
        .pipe(gcmq())
        .pipe(gulp.dest(paths.css.dest))
        .pipe(csso())
        //.pipe(sourcemaps.write())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(paths.css.dest))
        .pipe(browserSync.stream())
});

/* CSS PLUGINS MOVING TO BUILD */

gulp.task('cssPlugins', () => {
    return gulp.src(paths.cssPlugins.src)
        .pipe(plumber())
        .pipe(csso())
        .pipe(gulp.dest(paths.cssPlugins.dest))
});

/* JAVASCRIPT BABEL & MINIFICATION */

gulp.task('scripts', () => {
    return gulp.src(paths.js.src)
        .pipe(plumber())
        //.pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(uglify({
            mangle: {
                toplevel: true
            }
        }))
        //.pipe(sourcemaps.write())
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest(paths.js.dest))
});

/* JAVASCRIPT & QJUERY PLUGINS MOVING TO BUILD */

gulp.task('jsPlugins', () => {
    return gulp.src(paths.jsPlugins.src)
        .pipe(plumber())
        .pipe(gulp.dest(paths.jsPlugins.dest))
});

/* IMAGES MINIFICATION */

gulp.task('imgmin', () => {
    return gulp.src(paths.images.src)
        .pipe(plumber())
        .pipe(newer(paths.images.dest))
        .pipe(imgmin())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* IMAGES JPG/JPEG & PNG TO WEBP CONVERTATION */

gulp.task('webp', () => {
    return gulp.src(paths.images.src)
        .pipe(plumber())
        .pipe(webp())
        .pipe(gulp.dest(paths.images.dest))
});

/* SVG SPRITES */

gulp.task('sprites', () => {
    return gulp.src(paths.svgSprite.src)
        .pipe(plumber())
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: ($) => {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(gulp.dest(paths.svgSprite.dest))
});

/* SVG MINIFICATION */

gulp.task('svg', () => {
    return gulp.src(paths.svg.src)
        .pipe(plumber())
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest(paths.svg.dest))
});

/* FONTS MOVING TO BUILD */

gulp.task('fonts', () => {
    return gulp.src(paths.fonts.src)
        .pipe(plumber())
        .pipe(gulp.dest(paths.fonts.dest))
});

/* PHP MOVING TO BUILD */

gulp.task('php', () => {
    return gulp.src(paths.php.src)
        .pipe(plumber())
        .pipe(gulp.dest(paths.php.dest))
});

/* BUILD FOLDER ERASE */

gulp.task('clean', () => {
    return del(paths.prod.build);
});

/* BROWSER SYNC */

function reload(done) {
  browserSync.reload({ stream: true });
  done();
}

gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: paths.prod.build
        },
        reloadOnRestart: true
    });
    gulp.watch(paths.html.watch, gulp.series('html', reload));
    gulp.watch(paths.css.watch, gulp.series('styles', reload))
    gulp.watch(paths.cssPlugins.watch, gulp.series('cssPlugins', reload));
    gulp.watch(paths.js.watch, gulp.series('scripts', reload));
    gulp.watch(paths.jsPlugins.watch, gulp.series('jsPlugins', reload));
    gulp.watch(paths.images.watch, gulp.series('imgmin', reload));
    gulp.watch(paths.images.watch, gulp.series('webp', reload));
    gulp.watch(paths.svgSprite.watch, gulp.series('sprites', reload));
    gulp.watch(paths.svg.watch, gulp.series('svg', reload));
    gulp.watch(paths.fonts.watch, gulp.series('fonts', reload));
    gulp.watch(paths.php.watch, gulp.series('php', reload));
});

/* PROJECT TASK BUILD QUEUE */

gulp.task('build', gulp.series(
    //'clean',
    'html',
    'styles',
    'cssPlugins',
    'scripts',
    'jsPlugins',
    'imgmin',
    'webp',
    'sprites',
    'svg',
    'fonts',
    'php'
));

/* START GULP */

gulp.task('default', gulp.series(
    'build', 'server'
));
