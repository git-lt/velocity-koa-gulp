/**
 * [Hybrid.js Web与Native交互]
 * JS调Native Hybrid.callByJS
 * Native调JS Hybrid.callByNative
 */
;(function(window){
	var DEBUG = true;
	var callbacks = {};
	var guid = 0;
	var ua = navigator.userAgent;

	// 平台判断
	var ANDROID = /android/i.test(ua);
	var IOS = /iphone|ipad/i.test(ua);
	var WP = /windows phone/i.test(ua);

	// 日志记录
	function log() {
	    if (DEBUG) {
	        console.log.call(console, Array.prototype.join.call(arguments, ' '));
	    }
	}
	/**
	 * 平台相关的Web与Native单向通信方法
	 */
	function invoke(cmd) {
	    // log('invoke', cmd);
	    if (ANDROID) {
	        prompt(cmd);
	    }
	    else if (IOS) {
	        location.href = 'qiakr://' + window.encodeURIComponent(cmd);
	    }
	    else if (WP) {
	        // TODO ...
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

		    // Native主动调用Web
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
		    // Web主动调用Native，Native被动响应
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

var token = getUrlParam('token');
var code = null;

var page = {
	init:function(){
		this.getCode();
		this.switchEv();
		this.shareEv();
	},
	getCode:function(){
		$.post('getSupplierInviteCode.json',{token:token}, function(data){
			if(data.status==='0'){
				$('#authNum').text(data.result.authenticationCount);
				$('#invitNum').text(data.result.registerCount);
				code = data.result.inviteCode;
			}else{
				mobileToastMin('服务器繁忙！');
			}
		});
	},
	switchEv:function(){
		$('#getRcmdDesc,#btnReturn').on('click', function(){
			$('#rcmdDesc,#rcmdCon').toggleClass('active');
		})
	},
	shareCallBack:function(){
		mobileToastMin('分享成功！');
	},
	shareEv:function(){
		$('#btnShare').on('click', function(){
			if(code===null){
				mobileAlert('邀请码生成失败，分享失败');
				return false;
			}
			var opt = {
				name:'supplierInvite',
				param:{title:'我正在使用洽客，是时候换一种全新的零售方式，邀您注册。', desc:'我正在使用洽客，是时候换一种全新的零售方式，邀您注册。', img:'https://qncdn.qiakr.com/wx/logo-3.png',url:'http://www.qiakr.com/registerForSupplier.htm?form=app&inviteCode='+code},
				callback: self.shareCallBack
			};
			Hybrid.callByJS(opt);
		})
	}
}

page.init();



