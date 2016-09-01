'use strict';

// 加载模块
var gulp = require('gulp'),
    fs = require('fs'),
    through2 = require('through2'),
    gulpSequence = require('gulp-sequence'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean'),
    gulpif = require('gulp-if'),
    // csslint = require("gulp-csslint"),
    htmlmin = require("gulp-htmlmin"),
    cssSprite = require('gulp-sprite-generator2'),
    csso = require('gulp-csso'),
    postcss = require('gulp-postcss'),
    px2rem = require('postcss-px2rem'),
    color = require('gulp-color'),
    base64 = require('gulp-base64-inline'),
    merge = require('merge-stream'),
    livereload = require('gulp-livereload'),
    cheerio = require('gulp-cheerio'),
    cheerio1 = require('cheerio'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

let DEBUG = false;
const SUFFIX_QINIU = '//qncdn.qiakr.com/wx';
const CURR_PAGE = 'cusVipCardDetail.vm';
const QIN_PATH = '/Users/xxx/work/cdn/wx/'; //文件发布到七牛的同步目录下
const PRO_NAME = 'mall'; // mall or sales

const SRC_PATH = 'velocity/'+PRO_NAME+'/src/';
const DIST_PATH = 'velocity/'+PRO_NAME+'/dist/';

var getUUID = function(){
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1)+'_'+(((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

var filterToFile = function($builds, type, $, fs){

  var contents= '', lastTag;
  lastTag = $builds.last();
  if($builds.length>1){
    $builds.each((i,v)=>{
      contents+= ($(v).text()+'\n');
      i!== $builds.length-1 &&  $(v).remove();
    });
  }else{
    lastTag = $builds.first();
    contents = lastTag.html();
  }

  var fileName = getUUID()+'.'+type;
  fs.writeFileSync('velocity/mall/dist/'+fileName, contents, {encoding:'UTF-8'});

  return fileName;
}

function log(msg){
  return through2.obj(function(file, enc, done){
    console.log(color(msg, 'green'));
    this.push(file);
    done();
  })
}

// 提取 css、js、img(雪碧图)
gulp.task('build:init', ()=>{
  return new Promise(function(resolve, reject){
    gulp.src(SRC_PATH+CURR_PAGE)
      .pipe(cheerio({
        run:function($, file, done){
          var builds = $('[build]');
          var cssBuilds= builds.filter((i,v)=>{if(v.name === 'style') return v});
          var jsBuilds= builds.filter((i,v)=>{if(v.name === 'script') return v});

          var cssFileName = filterToFile(cssBuilds, 'css', $, fs);
          var jsFileName = filterToFile(jsBuilds, 'js', $, fs);

          // 读取文件
          var outStream;
          outStream = gulp.src(DIST_PATH+cssFileName)
            .pipe(cssSprite({
                baseUrl:         SRC_PATH+"img/",
                spriteSheetName: "[name]_sprite.png",
                spriteSheetPath: SUFFIX_QINIU,
                padding: 4,
                filter: [
                   function(image) {
                       return !(image.url.indexOf("?__sprite") === -1);  //只对?__sprite进行雪碧图合并
                   }
                 ]
            }));

          outStream.img
            .pipe(imagemin())
            .pipe(gulp.dest(DIST_PATH+"image/"))
            .pipe(gulp.dest(QIN_PATH))
            .pipe(log('E ========== img'));

          outStream.css
            .pipe(base64('velocity/mall/src/img/'))
            .pipe(gulp.dest(DIST_PATH))
            .pipe(log('E ========== css:1'))
            .pipe(through2.obj(function(file,enc,done){
              // 读取 cssFile
              // var newCss = fs.readFileSync(DIST_PATH+cssFileName).toString("utf-8");
              var newCss = file.contents.toString("utf-8");
              var currVm = fs.readFileSync(DIST_PATH+CURR_PAGE).toString("utf-8");

              var $newVM = cheerio1.load(currVm);
              $newVM('style[build]').html(newCss);
              var newStr = $newVM.html();

              fs.writeFileSync(DIST_PATH+CURR_PAGE, newStr, {encoding:'UTF-8'});

              resolve();
              this.push(file);
              done();
            }))

          fs.writeFileSync(DIST_PATH+'manifest.json', '{"css":"'+cssFileName+'","js":"'+jsFileName+'"}', {encoding:'UTF-8'});
          done()
        },
        parserOptions:{ decodeEntities: false }
      }))
      .pipe(gulp.dest(DIST_PATH))
      .pipe(log('E ========== create file'));
  })
})

// 优化压缩css、js
gulp.task('build:cssjs', ()=>{
  var manifest = JSON.parse(fs.readFileSync('velocity/mall/dist/manifest.json').toString("utf-8"));

  return merge(
    gulp.src(DIST_PATH+manifest.css)
      .pipe(autoprefixer({
            browsers: ['last 2 Chrome versions', 'safari 5', 'ios 7', 'android 4'],
            cascade: false
      }))
      .pipe(gulpif(!DEBUG, postcss([px2rem({remUnit: 75})])))
      .pipe(gulpif(!DEBUG, csso()))
      .pipe(gulp.dest(DIST_PATH))
      .pipe(log('E ========== css:2')),
    gulp.src(DIST_PATH+manifest.js)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(gulpif(!DEBUG, uglify()))
      .pipe(gulp.dest(DIST_PATH))
      .pipe(log('E ========== js'))
  )
})

// 替换页面中的css、js
gulp.task('build:replace', ()=>{
  var manifest = JSON.parse(fs.readFileSync(DIST_PATH+'manifest.json').toString("utf-8"))
  var cssCon = fs.readFileSync(DIST_PATH+manifest.css).toString("utf-8")
  var jsCon = fs.readFileSync(DIST_PATH+manifest.js).toString("utf-8")

  debugger;
  return gulp.src(DIST_PATH+CURR_PAGE)
    .pipe(cheerio({
      run:function($, file){
        $('style[build]').html(cssCon);
        $('script[build]').html(jsCon);
      },
      parserOptions:{ decodeEntities: false }
    }))
    .pipe(gulpif(!DEBUG, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('velocity/'+PRO_NAME+'/'))
    .pipe(livereload())
    .pipe(log('E ========== replace'));
})

// 监听变动 时实刷新
gulp.task('watch', function() {
  gulp.watch(SRC_PATH+CURR_PAGE, ['build:dev']);
  console.log(color('watching...','green'));
  livereload.listen();
});

// 清理
gulp.task('clean', function() {
  console.log(color('E ========== clean', 'green'));
  return gulp.src([
    'velocity/mall/dist/*.*',
    'velocity/mall/dist/image/*.*'
  ], {read: false})
  .pipe(clean());
});

// 构建开发版
gulp.task('build:pro',['clean'],(done)=>{
  DEBUG = false;
  return gulpSequence('build:init', 'build:cssjs', 'build:replace', done);
})

// 构建调试版
gulp.task('build:dev',['clean'],(done)=>{
  DEBUG = true;
  return gulpSequence('build:init', 'build:cssjs', 'build:replace','watch', done);
})

// 预设任务
gulp.task('default', function() {
    gulp.start('build:dev');
});
