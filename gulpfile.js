/* 
    By Bill Rocha <prbr@ymail.com>

    Antes de usar, instale a última versão do GULP-CLI
    
       npm i -g gulp-cli

    Este script requer o Gulp 4 ou posterior    
    Verfique a instalação dos plugins necessários no arquivo "install_info.txt"    
 */


// Fazendo compras
const {series, parallel, src, dest} = require('gulp'),
    gulpif = require('gulp-if'),
    minifyCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-html-minifier2'),
    //sass = require('gulp-sass'),
    streamqueue = require('streamqueue'),
    javascriptObfuscator = require('gulp-javascript-obfuscator'),
    uglifyes = require('uglify-es'),
    composer = require('gulp-uglify/composer')

// Fazendo o uglify ficar bonito ...
const uglify = composer(uglifyes, console)

// Chaveando DEV/PRO
const argv = require('yargs').argv
const devMode = argv.pro === undefined ? true : false // gulp [--pro] -> define como produção

// Deixando as coisas bem claras ...
console.log('\n\t-- Compilando em modo ' + (devMode ? 'DESENVOLVIMENTO (para "produção" digite "gulp --pro")' : 'PRODUÇÃO') + '\n')


// Html ------------------------------------------------------------------- [HTML]

// Carregando (e tratando em PROduction) os arquivos da pasta src/html
const html = () => src('src/html/**/*.html')
    .pipe(gulpif(!devMode, htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true
    })))
    .pipe(dest('app/html'))

// Carregando (e tratando em PROduction) o arquivo INDEX.html    
const html_index = () => src('src/index.html')
    .pipe(gulpif(!devMode, htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true
    })))
    .pipe(dest('app'))
    

// STYLES (CSS & more) ---------------------------------------------------- [CSS]

// Concatenando os arquivos CSS
const style = () => streamqueue({objectMode: true},
    //src(['src/sass/**/*.scss']).pipe(sass()),
    src(['semantic/dist/semantic.min.css', 
         'src/css/fonts.css', 
         'src/css/style.css']))
    .pipe(concat('style.css'))
    .pipe(gulpif(!devMode, minifyCSS({level: {1: {specialComments: 0}}})))
    .pipe(dest('app/css'))

// Copiando os arquivos do semantic - theme
const style_semanticAssets = () => src('semantic/dist/themes/default/assets/**/*.*')
    .pipe(dest('app/css/themes/default/assets'))

// Copiando CSS extra
const style_extra = () => src('src/css/print.css')
    .pipe(gulpif(!devMode, minifyCSS({level: {1: {specialComments: 0}}})))
    .pipe(dest('app/css'))


// Comprimindo e juntando os arquivos JS ---------------------------------- [JS]

// JS Vendors
const js_vendor = () => src([
        'node_modules/jquery/dist/jquery.min.js',
        'src/js/app/lib.js',
        'node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
        'semantic/dist/semantic.min.js'
    ])
    .pipe(gulpif(!devMode, uglify()))
    .pipe(concat('vendor.js'))
    .pipe(dest('app/js'))

// JS main files
const js_main = () => src([
        'src/js/app/config.js',

        'src/js/module/cadastro.js',
        'src/js/module/relatorio.js',
        'src/js/module/lancamento.js',
        'src/js/module/notificacao.js',

        'src/js/app/utils.js',
        'src/js/app/contextmenu.js',
        'src/js/app/menu.js',
        'src/js/app/server.js',
        'src/js/app/info.js',
        'src/js/user.js',
        'src/js/app.js'
    ])
    .pipe(gulpif(!devMode, uglify()))
    .pipe(concat('main.js'))
    .pipe(gulpif(!devMode, javascriptObfuscator({compact:true, sourceMap: false})))
    .pipe(dest('app/js'))

// JS modules
const js_module = () => src(['src/js/module/**/*.js', '!src/js/module/*.js'])
    .pipe(gulpif(!devMode, uglify()))
    .pipe(gulpif(!devMode, javascriptObfuscator({compact:true, sourceMap: false})))
    .pipe(dest('app/js/module'))

// JS index (node)
const js_index = () => src('src/index.js')
    .pipe(gulpif(!devMode, uglify()))
    .pipe(gulpif(!devMode, javascriptObfuscator({compact:true, sourceMap: false})))
    .pipe(dest('app'))



// Default task ----------------------------------------------------------- [DEFAULT]
exports.default = 
    parallel( html, html_index,
              style, style_semanticAssets, style_extra,
              js_vendor, js_main, js_module, js_index )