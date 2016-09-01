// 注册引导页 必带参数 storeId salesId suid
function getStrLen(str){
	return str.replace(/[^\x00-\xff]/g,"**").length/2;
}
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

var salesId = getUrlParam('salesId');
var token = getUrlParam('token');

var QN_path = 'https://qncdn.qiakr.com/';
var imgSize = '?imageView2/1/w/300/q/70';

var page = {
	init:function(){
		this.takePicEv();
		this.delPicEv();
		this.subFeedbackEv();
	},
	subFeedbackEv:function(){
		$('#subFeedbackBtn').on('click', function(){
			var imgs=[];
			$('.pic-item').each(function(){
				imgs.push($(this).data('img'));
			});

			var pms = {
				salesId:salesId,
				token:token,
				content:$('<div>').html($('#feedbackTxt').val()).text().trim(),
				picture:JSON.stringify(imgs),
				type:$('#adviceType').val()
			}
			if(pms.content==''){
				mobileAlert('请输入您的建议！')
				$('#feedbackTxt').focus();
				return false;
			}
			if(getStrLen(pms.content)>255){
				mobileAlert('字数超限，请少于255个字符！');
				return false;
			}

			$.ajax({
				url:'insertFeedback.json',
				data:pms,
				type:'post',
				dataType:'json',
				success:function(data){
					if(data.status==='0'){
						mobileAlert('您的反馈已经提交成功！');
						$('#feedbackTxt').val();
						$('.pic-item').remove();
						setTimeout(function(){Hybrid.callByJS({name:'returnSales'})}, 2000);
					}else{
						mobileAlert('系统繁忙，请稍候重试！');
					}
				},
				error:function(data){
					mobileAlert('系统繁忙，请稍候重试！');
				}
			});
		})
	},
	showPic:function(data){
		if($('.pic-item').length>3){
			mobileAlert('最多只能上传3张图片！');
			return false;
		}else{
			if(data.length){
				var url = QN_path+data+imgSize;
				
				var itemStr = '<li class="pic-item" data-img="'+(QN_path+data)+'"><div class="img-box" style="background-image:url('+url+')"></div><a href="javascript:;" class="c-bl del">删除</a></li>';
				$('#takePic').before(itemStr);
			}
		}
	},
	takePicEv:function(){
		var self = this;
		$('#takePic').on('click', function(){
			if($('.pic-item').length<3){
				var pms={
					name:'takePic',
					param:{salesId: salesId},
					callback:self.showPic.bind(self)
				};
				Hybrid.callByJS(pms);
			}else{
				mobileAlert('最多只能上传三张照片！');
			}
		})
	},
	delPicEv:function(){
		$('#imgsWrap').on('click', '.del', function(){
			if(window.confirm('是否确定删除该图片？')){
				var $this = $(this);
				$this.parent('.pic-item').remove();
				mobileAlert('删除成功！');
			}
		})
	}
}

page.init();



