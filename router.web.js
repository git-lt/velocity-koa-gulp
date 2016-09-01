
import fs from 'fs'
import path from 'path'
import { Engine, Data as VData } from 'velocity'
import Router from 'koa-router'

const rootPath = process.cwd();
const ROOT_VIEW = rootPath+'/velocity';

let router = Router();

let createRouter = () => {

  // return page
  router.get("*.htm", function *(next){
    var realFile = this.path.split('.')[0]+'.vm';
    var st = fs.existsSync('velocity'+realFile);

    if(st){
      this.body = new Engine({
        template:ROOT_VIEW+realFile,
        root:ROOT_VIEW+'/'
      }).render({});
    }else{
      this.body = '该页面被外星人劫走了～～～';
    }
  })

  // Mock API
  router.post("*.json", function *(next){
    var fileName = this.path.split('.')[0].replace('src/','').replace('dist/','');
    var st = fs.existsSync('mock/api'+fileName+'.js');

    this.set('Content-Type','application/json');
    if(st){
      this.body = require('./mock/api'+fileName);
    }else{
      this.body = '{"status":404}';
    }
  })

  return router;
}

module.exports = createRouter;
