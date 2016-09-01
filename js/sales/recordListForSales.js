var token = Zepto('#token').val() || getUrlParam('token');
var recordList={},rankApi=[], rendered=[];
var _indicator = $('#indicator');
var useCache = false;
var p_rank={};
var defaultFace = 'https://qncdn.qiakr.com/mall/default-photo.png';
var salesId=$('#salesId').val();
var suid =$('#suid').val();
var isShown = false;
var setHeight = true;

rankApi['XS']='getSalesRank.json?unit=saleroom&order=1&token='+token;
rankApi['JF']='getSalesRank.json?unit=customerCount&order=1&token='+token;
rankApi['BS']='getSalesRank.json?unit=starCount&&order=1&token='+token;
rankApi['getFriend'] = 'getFriendSalesList.json?token='+token;
rankApi['createPK'] = 'createPK.json?token='+token;

rendered['XS']=false;
rendered['JF']=false;
rendered['BS']=false;

// Hybrid Bridge
;(function(window){
    var DEBUG = true;
    var callbacks = {};
    var guid = 0;
    var ua = navigator.userAgent;

    var ANDROID = /android/i.test(ua);
    var IOS = /iphone|ipad/i.test(ua);
    var WP = /windows phone/i.test(ua);

    function log() {
        if (DEBUG) {
            console.log.call(console, Array.prototype.join.call(arguments, ' '));
        }
    }
    function invoke(cmd) {
        if (ANDROID) {
            prompt(cmd);
        }
        else if (IOS) {
            location.href = 'qiakr://' + window.encodeURIComponent(cmd);
        }
    }

    var Hybrid = {
        callByJS: function(opt) {
            log('callByJS', JSON.stringify(opt));
            var pms = {};
            pms.name = opt.name;
            pms.token = ++guid;
            pms.param = opt.param || {};
            callbacks[pms.token] = opt.callback;

            invoke(JSON.stringify(pms));
        },
        callByNative: function(opt) {
            log('callByNative', JSON.stringify(opt));
            var callback = callbacks[opt.token];
            var result = opt.result || {};
            var script = opt.script || '';

            if (script) {
                log('callByNative script', script);
                try {
                    invoke(JSON.stringify({
                        token: opt.token,
                        result: eval(script)
                    }));
                }catch(e) {
                    console.error(e);
                }
            }
            else if (callback) {
                callback(result);
                try {
                    delete callback;
                    log(callbacks);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

    window.Hybrid = Hybrid;
})(window);
window.Hybrid_init = function(){
 var opt = {
    name:'share',
    param:{
        title: '我的今日排行', 
        desc: '我的今日排行' ,
        img: $('#shareImg').attr('src').trim(), 
        url: 'http://'+window.location.host+'/sales/sharedOfSalesRank.htm?salesId='+salesId+'&shareTime='+new Date().getTime()
    }
 };
 Hybrid.callByJS(opt);
}

window.Hybrid_Share = function(){
 var opt = {
    name:'share',
    param:{
        title: '我的今日排行', 
        desc: '我的今日排行' ,
        img: $('#shareImg').attr('src').trim(), 
        url: 'http://'+window.location.host+'/sales/sharedOfSalesRank.htm?salesId='+salesId+'&shareTime='+new Date().getTime()
    }
 };
 Hybrid.callByJS(opt);
}
/**
 * store.js 本地存储
 */
!(function(window, undefined){
  var lsName = 'localStorage', ls = undefined;

  var Store = function(){
    this.version = '0.0.1';

    ls = this.support();
    if(ls === false){
      console.warn('localStorage is not supported！');
      return;
    } 
  };
  
  Store.prototype={
    constructor: Store,
    support:function(){
      try {
        return (lsName in window && window[lsName]);
      }catch(e){
        return false;
      }
    },
    parseJSON:function(v){
      if (typeof v != 'string') { return undefined }
      try { return JSON.parse(v) }
      catch(e) { return v || undefined }
    },
    set:function(key, val, seconds){
      if (val === undefined) { return store.remove(key) }

      ls.setItem(key, JSON.stringify(val));
      if(/\d+/.test(seconds)){
        if(seconds<=0) return;
        ls.setItem(key+'_t', JSON.stringify({start:new Date().getTime(), expires:seconds }));
      }
      //清空所有过期的数据
      this.refreshData(); 

      return val;
    },
    refreshData:function(){
      // 检查所有存储的数据是否过期，过期则清除
      var nowT = new Date().getTime();
      var self = this, oldT, timespan;

      self.keys().filter(function(v, i){
        return /_t$/.test(v);
      }).forEach(function(v, i){
          oldT = self.get(v);
          var timespan = nowT - oldT.start;
          if(timespan > parseFloat(oldT.expires)*1000){
            self.remove(v);
            self.remove(v.split('_')[0]);
          }
      });
    },
    get:function(key, callback){
      if(!ls.hasOwnProperty(key)) return '';

      var val = store.parseJSON(ls.getItem(key))
      // 不带时间的数据直接返回
      if(!ls.hasOwnProperty(key+'_t')) return val;

      // 带时间的数据，判断是否超时
      var oldT = JSON.parse(ls.getItem(key+'_t'));
      var timespan = new Date().getTime() - oldT.start;

      if(timespan > parseInt(oldT.expires)*1000){
        store.remove(key);
        store.remove(key+'_t');
        return '';
      }else{
        return val;
      }
    },
    has:function(key){
      return ls.hasOwnProperty(key);
    },
    remove:function(key){
      ls.removeItem(key);
    },
    clear:function(){
      ls.clear();
    },
    getAll:function(){
      var ret = {};
      this.forEach(function(i, v){ ret[i] = v;});
      return ret;
    },
    keys:function(){
      if(Object.keys) return Object.keys(ls);

      var keys = [], key='';
      for(key in ls){
        if(ls.hasOwnProperty(key)) keys.push(key);
      }
      return keys;
    },
    forEach:function(callback){
      for (var i=0; i<ls.length; i++) {
        var key = ls.key(i)
        callback(key, store.get(key))
      }
    },
  }
  window.store = new Store();
})(window, undefined);

/**
 * [QNCropSuffix 添加七牛裁切后缀]
 */
function QNCropSuffix(url, width, height, type){
  if(!url || url.length<5 || url.indexOf('imageView2')>-1 || !width) return url;
  var qnSuffix = 'imageView2/'+(type?type:1)+'/w/'+width;
  if(height) qnSuffix += '/h/'+height;

  return url.indexOf('?')>-1?url+'&'+qnSuffix:url+'?'+qnSuffix;
}

template.helper('getAvatar', function (url, width) {
    var w = width || 80;
    if(!url || url.length<5) return defaultFace;
    return QNCropSuffix(url.split('?')[0], w);
});


p_rank = {
    init:function(){
      this.listPKEv();
      this.goPKpageEv();
    },
    tabShowCallback:function(pagein){
      var i = $(pagein).index();
      $('.record-menus .cell').removeClass('active').eq(i).addClass('active');
      // _indicator.css('left',i*0.93333+'rem');

      var type = pagein.id.split('_')[1];

      p_rank.renderRankData(type);
    },
    renderRankData:function(type){
      var self = this;
      
      var _panel = $('#listPanel_'+type);
      var _msgIconBox = _panel.find('.qk-loading-icon'),
          _msgCon = _panel.find('.qk-loading-con');
      var cacheData = store.get(type);

      // 如果有数据, 则返回
      if(store.has(type) && cacheData !== '' && useCache){ 
        if(rendered[type]===false){
          _panel.html(template('rankListTpl', cacheData));
          $('#rankWrap').css('height',_panel[0].scrollHeight);
        }
        console.log('client'+' '+ new Date().toLocaleTimeString());
        return; 
      }
      // 获取销售排行数据
      $.ajax({
          method:'GET',
          url:rankApi[type],
          success:function(data){
            // 未登录
            if(typeof data=='string'){
                if(JSON.parse(data).status == '401'){
                    location.href="../error.htm";
                    return false;
                }else{
                    _msgIconBox.removeClass('icon-loading');
                    _msgCon.html('未知错误，请联系客服！'+data);
                    return false;
                }
            }else if(data && data.result){
                if(data.result.rankList){
                    var tplData = data.result.rankList;
                    $('#timeTody').text(getLocalTime(data.result.endTime,true));
                    tplData = tplData.map(function(v, i){
                        if(!v.sales.avatar || v.sales.avatar.length<10){
                            v.sales.avatar = defaultFace;
                        }
                        return v;
                    })
                    var eachData = {data: tplData, rankType:type, currSales:data.result.salesSelfRank, isAuthSupplier:data.result.isAuthSupplier};
                    _panel.html(template('rankListTpl', eachData));

                    if(setHeight){
                      var height = _panel.find('li:first').height();
                      $('#rankWrap').css('height',height * (tplData.length+1)+20);
                      setHeight = false;
                    }
                    if(data.result.salesSelfRank.rank>3 && type=='XS'){
                      $('#shareImg').attr('src', 'https://qncdn.qiakr.com/pk/pk_gold.png')
                    }

                    if(!isShown){
                      // 显示小红点
                      $('#redDot')[data.result.isNewWatch?'show':'hide']();
                      // 显示权限
                      $('#btnNeedPK, #linkGetRule')[data.result.isAuthSupplier?'show':'hide']();
                      isShown = true;
                    }

                    rendered[type]=true;
                    console.log('server'+' '+ new Date().toLocaleTimeString());

                    if(useCache){
                      // 10点以前打开，则缓存到10点，10点以后打开，缓存到第二天10点
                      var nowT = new Date(), ts, y = nowT.getFullYear(),m = nowT.getMonth(), d = nowT.getDate();
                      
                      if(nowT.getHours()<22){
                        ts = new Date(y, m, d, 22,00,00).getTime() - nowT.getTime();
                        store.set(type, eachData, ts/1000);
                      }else{
                        ts = new Date(y, m, d+1, 22,00,00).getTime() - nowT.getTime();
                        store.set(type, eachData, ts/1000);
                      }
                    }
                }else{
                    _msgIconBox.removeClass('icon-loading');
                    _msgCon.html('暂时还没有排名唉 :(');
                }
            }else{
                _msgIconBox.removeClass('icon-loading');
                _msgCon.html('暂时还没有排名唉 :(');
            }
          },
          error:function(){
              _msgIconBox.removeClass('icon-loading');
              _msgCon.html('请检查网络链接或尝试刷新！');
          }
      });
    },
    listPKEv:function(){
      $('#listPanel_XS').on('click','.cus-pk', function(){
        var $this = $(this);
        $this.addClass('dis');
        $.ajax({
          url:rankApi['createPK'],
          data:{ rightSalesId:$this.data('id'), supplierId:suid },
          type:'GET',
          success:function(data){
            if(data.status==='0'){
              mobileAlert('PK发起成功，等待对方接受');
            }else if(data.status === '2'){
              mobileAlert('对TA的PK已经发起过了，不能重复发起');
            }else if(data.status === '1'){
              mobileAlert('今天已经发起过两次PK了，明天再来吧');
            }else if(data.status === '3'){
              mobileAlert('发起失败，宝石数据不足！');
            }else if(data.status === '4'){
              mobileAlert('目标导购的次数已用完，换其他人吧！');
            }else if(data.status === '5'){
              mobileAlert('已存在和目标导购相匹配的pk（方向相反），请等待结果！');
            }else{
              mobileAlert('服务器繁忙！');
            }
            $this.removeClass('dis');
          },
          error:function(){
            mobileAlert('服务器繁忙！');
            $this.removeClass('dis');
          }
        });
      });
    },
    goPKpageEv:function(){
      $('#btnNeedPK').on('click', function(){
        window.location.href = 'getTodayPK.htm?token='+token;
      });
    }
}
p_rank.init();




