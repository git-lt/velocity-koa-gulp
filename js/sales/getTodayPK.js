var API = [];
var token = getUrlParam('token');

API['PKData'] =  'todayPK.json?token='+token;
API['acceptPK'] =  'acceptPK.json?token='+token;
API['getFriend'] = 'getFriendSalesList.json?token='+token;
API['createPK'] = 'createPK.json?token='+token;

var defaultFace = 'https://qncdn.qiakr.com/mall/default-photo.png';
var salesId = $('salesId').val();
var suid = $('#suid').val();

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
    name:'redirectUrl',
    param:{
        text: 'PK记录', 
        url: 'http://'+window.location.host+'/sales/recordListForPK.htm?token='+token
    }
 };
 Hybrid.callByJS(opt);
}
/**
 * [$.toast 消息提示]
 * @param  {[string]} msg [消息内容]
 */
$.toast = function(msg, callback){
  var $toast = $("<div class='modal-toast'>"+msg+"</div>").appendTo(document.body);
  var t = 2000, unit=14, msgW = 0, w=0, h=0,docW = document.documentElement.clientWidth;

  unit = $toast.css('font-size').match(/\d+/)[0]-0;
  msgW = unit*msg.length;
  w = msgW+20 >= docW ? msgW-20 : msgW;
  h =  msgW+20 >= docW ? unit*2+20 : unit+20;

  $toast.css({'margin-left':-w/2+'px', 'margin-top':-h/2+'px'});
  $toast.offset();
  $toast.addClass('toast-show');
  
  setTimeout(function() {
    $toast.addClass('toast-hide');
    setTimeout(function(){
      $toast.remove();
      callback && callback();
    }, t);
  }, t);
}

/**
 * [fnTimeCountDown 倒计时工具函数]
 * @param  {[type]} d [到达的Unix时间戳,例：new Date().getTime()]
 * @param  {[type]} o [显示时间的相关配置：{
     sec: 显示秒数值的标签对象,
     mini: 显示分钟数值的标签对象,
     hour: 显示小时数值的标签对象,
     day: 显示天数数值的标签对象,
     month: 显示月份数值的标签对象,
     year: 显示年数数值的标签对象
}]
 */
var fnTimeCountDown = function(startUnix, endUnix, targetObj, endFn, processFn){
	var t = null;
  var startT = new Date(startUnix).getTime();
	var f = {
		zero: function(n){
			var n = parseInt(n, 10);
			if(n > 0){
				if(n <= 9){
					n = "0" + n;	
				}
				return String(n);
			}else{
				return "00";	
			}
		},
		dv: function(){
			endUnix = endUnix || new Date(2050,5,5).getTime(); //如果未定义时间，则我们设定倒计时日期是2050年5月5日
			var future = endUnix, now = startT-1;
			//现在将来秒差值
			var dur = Math.round((future - now) / 1000), pms = {
				sec: "00",
				mini: "00",
				hour: "00",
				day: "00",
				month: "00",
				year: "0"
			};
			if(dur > 0){
				pms.sec = f.zero(dur % 60);
				pms.mini = Math.floor((dur / 60)) > 0? f.zero(Math.floor((dur / 60)) % 60) : "00";
				pms.hour = Math.floor((dur / 3600)) > 0? f.zero(Math.floor((dur / 3600)) % 24) : "00";
				pms.day = Math.floor((dur / 86400)) > 0? f.zero(Math.floor((dur / 86400)) % 30) : "00";
				//月份，以实际平均每月秒数计算
				pms.month = Math.floor((dur / 2629744)) > 0? f.zero(Math.floor((dur / 2629744)) % 12) : "00";
				//年份，按按回归年365天5时48分46秒算
				pms.year = Math.floor((dur / 31556926)) > 0? Math.floor((dur / 31556926)) : "0";
			}

			pms.dur = dur;
			return pms;
		},
		ui: function(){
			var pms = f.dv();
			for (var i in targetObj) {
				targetObj[i].innerHTML = pms[i];
			}

			if(pms.dur<0){
				clearTimeout(t);
				endFn && endFn();
			}else{
				processFn && processFn(pms);
				t = setTimeout(f.ui, 1000);
			}
		}
	};	
	f.ui();
};

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

var p_todayPK = {
	init:function(){
		this.getPKInfo();

		this.acceptPKEv();
		this.changeFriendsEv();
		this.clickAvatarEv();
		this.confirmBtnEv();
	},
	getFriendCallback:function(){
		var _challengeBox = $('#challenge');
    $.ajax({
      type:'POST',
      url:API['getFriend'],
      success:function(data){
        if(data.status==='0'){
          if(data.list && data.list.length>0){
            data.list = data.list.map(function(v){
              v.sales.avatar = v.sales.avatar ? QNCropSuffix(v.sales.avatar, 100) :defaultFace;
              return v;
            });
            _challengeBox.html(template('friendsListTpl',{data: data.list, isAll:data.isAll}));
          }else{
            _challengeBox.html('暂无好友');
          }
        }

        $('#changeFriendsBtn').removeClass('disabled').find('span').show();
        $('#changeFriendsBtn').find('img').hide();
      },
      error:function(){
        $('#changeFriendsBtn').removeClass('disabled').find('span').show();
        $('#changeFriendsBtn').find('img').hide();
      }
    });
	},
	getPKInfo:function(){
		$.post(API['PKData'], function(data){
			if(data.status==='0'){
				if(data.result.list.length){
					data.result.list=data.result.list.map(function(v){
						v.leftPhoto = v.leftPhoto ? QNCropSuffix(v.leftPhoto, 100) :defaultFace;
						v.rightPhoto = v.rightPhoto ? QNCropSuffix(v.rightPhoto, 100) :defaultFace;
						return v;
					});

					// 0-等待接受 1-已接受 2-已完成 3-已超时
					$('#todayPKWrap').html(template('pkListTpl', {data:data.result.list}));
					// 未接受的PK，显示倒计时，时间到了之后改变状态
          // 倒计时
					$('[data-accept]').each(function(i, v){
						var _this = $(this), ST=_this.data('start'), ET=_this.data('accept');
            if(!ST || !ET){ $.toast('时间错误！'); return;}
						fnTimeCountDown(ST, ET,{
							sec: _this.find('.sec')[0],
					    mini: _this.find('.mini')[0],
					    hour: _this.find('.hour')[0],
						},function(){
							window.location.reload();
						});
					});

          // 等待结果
					$('[data-wait]').each(function(i, v){
						var _this = $(this), ST=_this.data('start'), ET=_this.data('wait');
            if(!ST || !ET){ $.toast('时间错误！'); return;}
						fnTimeCountDown(ST, ET,{
							sec: _this.find('.sec')[0],
					    mini: _this.find('.mini')[0],
              hour: _this.find('.hour')[0],
					    day: _this.find('.day')[0],
						},function(){
							window.location.reload();
						});
					});
				}else{
					$('#todayPKWrap').html('<p class="tc c-8">暂无PK记录</p>');
				}
			}else{
				$.toast(data.message || '系统繁忙！');
			}
		});
	},
	acceptPKEv:function(){
		$('#todayPKWrap').on('click','.accept', function(){
			var _this = $(this), pkId = $(this).data('id');
			$.post(API['acceptPK'],{pkId:pkId}, function(data){
				if(data.status === '0'){
					$.toast('你已接受挑战，快去备战吧');
					_this.removeClass('accept');
					_this = _this.html('离公布结果还有<span class="day"></span>天<span class="hour"></span>小时<span class="mini"></span>分<span class="sec"></span>秒');
					$('[data-active="'+pkId+'"]').remove();
          setTimeout(function(){
            window.location.reload();
          },2000);
				}else if(data.status === '2'){
          $.toast('对TA的PK已经发起过了，不能重复发起');
        }else if(data.status === '1'){
          $.toast('每天只能发起两次PK，明天再来吧:)');
        }else if(data.status === '3'){
          $.toast('发起失败，宝石数据不足！');
        }else{
          $.toast('服务器繁忙！');
        }
			});
		});
	},
	changeFriendsEv:function(){
    var self = this;
    $('#challenge').on('click','#changeFriendsBtn', function(){
      var _this = $(this);
      _this.addClass('disabled').find('span').hide();
      _this.find('img').show();
      self.getFriendCallback();
    })
  },
  clickAvatarEv:function(){
    var self = this, _state;
    $('#challenge').on('click', '.chk-state', function(){
      _state = $(this);
      if(_state.hasClass('acitve')) return;
      $('.chk-state.active').removeClass('active');
      _state.toggleClass('active');
    });
  },
  confirmBtnEv:function(){
    $('#challenge').on('click', '#confirmBtn', function(){
      var $this = $(this);
      var chkedSales = $('.chk-state.active');
      if(chkedSales.length<1){
        $.toast('请选择一位好友发起挑战！');
        return;
      }

      $this.addClass('dis');
      $.ajax({
          url:API['createPK'],
          data:{rightSalesId:chkedSales.data('id'), supplierId:suid},
          type:'POST',
          success:function(data){
            if(data.status==='0'){
              $.toast('PK发起成功，等待对方接受！');
		          setTimeout(function(){
		            Mobilebone.transition($('#homePage')[0],$('#challenge')[0]);
		            setTimeout(function(){window.location.reload();},1000);
		          },2500);
            }else if(data.status === '2'){
              $.toast('对TA的PK已经发起过了，不能重复发起');
            }else if(data.status === '1'){
              $.toast('每天只能发起两次PK，明天再来吧:)');
            }else if(data.status === '3'){
              $.toast('发起失败，宝石数据不足！');
            }else if(data.status === '4'){
              $.toast('目标导购的次数已用完，换其他人吧！');
            }else if(data.status === '5'){
              $.toast('已存在和目标导购相匹配的pk（方向相反），请等待结果！');
            }else{
              $.toast('服务器繁忙！');
            }
            $this.removeClass('dis');
          },
          error:function(){
            $.toast('服务器繁忙！');
            $this.removeClass('dis');
          }
      });

    });
  }
};

p_todayPK.init();


