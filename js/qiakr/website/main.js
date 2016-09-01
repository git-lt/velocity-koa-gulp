/**
 * [项目启动文件]
 */
define(function(require, exports, module){
  require('jquery');
  require('bootstrap');

  require('core');
  require('app');

  var Vue = require('vue');
  var Router = require('vueRouter');


  // Vue filter
  
  // Vue Router
  Vue.use(Router);

  // routing
  var router = new Router();

  var P_video = Vue.extend({
    template:'<h2>Video</h2>'
  });
  var P_Banner = Vue.extend({
    template:'<h2>Banner</h2>'
  });
  var P_News = Vue.extend({
    template:'<h2>News</h2>'
  });

  router.map({
    '/video':{
      component: require(['']),
    },
    '/banner':{
      component: P_Banner,
    },
    '/news':{
      component: P_News,
    }
  });

  router.beforeEach(function () {
    window.scrollTo(0, 0)
  })

  // router.redirect({
  //   '*': '/news/1'
  // })
  
  // Main View Model
  var MainVM = Vue.extend({});


  var p_main = {
    init:function(){
      this.initRouter();
    },
    initRouter:function(){
      router.start(MainVM, '#wrapper');
    }
  }

  return {
    init: function(){
      p_main.init();
    }
  };
});






