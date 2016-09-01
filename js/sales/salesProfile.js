// $.bindFastClick();
/**
 * [Hybrid.js Web与Native交互]
 * JS调Native Hybrid.callByJS
 * Native调JS Hybrid.callByNative
 */
;(function(window){
	var DEBUG = false;
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

window.Hybrid_init = function(){
 var opt = {
    name:'share',
    param:{
        title: $('title').text(), 
        desc:  $('title').text(), 
        img: $('#shareImg').attr('src').trim(), 
        url: "http://"+window.location.host+"/mall/salesProfile.htm?salesId="+getUrlParam('salesId')
    }
 };
 Hybrid.callByJS(opt);
}

var staticPath = 'https://qncdn.qiakr.com/';
var $bg = $('#profileBox');
var $saleImg = $('#profileImg');
var $body = $('body');
var $proBox = $('#recProListBox');
var currTheme = '';
var currSalesId = getUrlParam('salesId');
var token =  getUrlParam('token');
var PRO_INFO=[]; 	//商品信息
var SALES_PHOTO=''; //导购形象图片地址
var PRO_DESC=[
	'这件超赞的，今年很流行，最配年轻貌美的你',
	'精心挑选了这件店里最热门款式推荐给你，不来看看嘛？'
];
var tempNum = 1;

var p_salesEvaluate = {
	init:function(){
		this.initTheme(); 		//初始化主题
		this.addRecProductEv(); //添加商品
		this.changeThemeEv();	//重新编辑
		this.delProEv(); 		//删除商品
	},
	initTheme:function(){
		// 如果地址中有theme 说明是新主页
		var theme = getUrlParam('theme');
		if(theme){
			var upImg =staticPath+getUrlParam('photo');
			currTheme = 'sales'+theme;
			SALES_PHOTO = upImg;

			$body.attr('class', 'rel '+currTheme);
			$bg.css('background-image', 'url('+upImg+')');
			$('#shareImg').attr('src',upImg);
			$('#recProListBox').offset().height;
			$('#profileLoading').addClass('out');
			setTimeout(function(){$('#profileLoading').remove();}, 2100);
			$('#profileLoading').hide();
			this.saveProfileConf();
		}else{
			// 使用已经存在的配置
			this.initByConfig();
			$('#profileLoading').addClass('out');
			setTimeout(function(){$('#profileLoading').remove();}, 2100);
		}
	},
	initByConfig:function(){
		$.ajax({
			url:'getSalesProfile.json',
			type:'POST',
			data:{token:token},
			dataType:'json',
			cache:false,
			success:function(data){
				if(data.status === '0'){
					var profInfo = data.result.salesProfile, sConf;
					if(profInfo && profInfo.salesConfig){
						sConf = JSON.parse(profInfo.salesConfig);
						currTheme = sConf.theme;
						SALES_PHOTO = sConf.photo;

						// 设置主题 和 图片
						$body.attr('class', 'rel '+currTheme);
						$bg.css('background-image', 'url('+SALES_PHOTO+')');

						// 渲染商品
						PRO_INFO = sConf.pros;
						if(PRO_INFO.length){
							$('#recProListBox .add-pro-tip').remove();

							var proStr = [], link='';
							for(var i in PRO_INFO){
								link='../mall/getStockInfoForCustomer.htm?salesId='+PRO_INFO[i].salesId+'&from=sales&stockId='+PRO_INFO[i].stockId;
								proStr.push('<div class="ovh mt15 pro-item" data-id="'+PRO_INFO[i].stockId+'">');
								proStr.push('<div class="rel pro-img-box mr10 ml10">');
								proStr.push('<a href="'+link+'" class="block">');
								proStr.push('<i class="img-border-bg db abs"></i>');
								proStr.push('<span class="pro-img db abs" style="background-image:url('+PRO_INFO[i].picUrl+')"></span>');
								proStr.push('</a></div><div class="p10">');
								proStr.push('<h3 class="pro-tit f14"><a href="'+link+'">'+PRO_INFO[i].name+'</a></h3>');
								proStr.push('<p class="pro-des c-8">'+PRO_INFO[i].desc+'</p>');
								proStr.push('<p class="pro-price b">¥'+ PRO_INFO[i].price +'<a href="javascript:;" class="del">&emsp;删除</a></p></div></div>');
							}
							$('#recProListBox').append(proStr.join(''));
						}
					}else{
						console.log('导购配置为空！！');
					}
				}else if(data.status == '403'){
					mobileAlert('没有权限！');
				}else{
					console.log('获取配置，出错了！');
				}
			},
			error:function(data){
				console.log('获取配置，出错了！');
			}
		});
	},
	updateTheme:function(data){
		var theme = 'sales'+data.theme;
		// 拍照完成后的回调处理，替换图片
		var msg = '拍照返回成功  主题：'+theme+' 照片：'+data.photo;
		console.log(msg);
		$body.attr('class', 'rel '+theme);
		$bg.css('background-image', 'url('+staticPath+data.photo+')');
		currTheme = theme;
		SALES_PHOTO = staticPath+data.photo;

		this.saveProfileConf();
		$('#recProListBox').offset().height;
	},
	addRecProductEv:function(){
		var self = this;
		function addProFn(){
			var pNum = $('.pro-item').length;
			var opt = {};

			if(pNum===2){
				mobileAlert('最多只能推荐两件商品！');
				return false;
			}
			
			var opt = {
				name:'getProduct',
				callback: self.renderProduct.bind(self)
			};
			if(pNum===1){
				opt['param'] = {stockId:$('.pro-item').data('id')||''};
			}
			Hybrid.callByJS(opt);
		}
		$('#addRecPro').on('click',addProFn)
		$('#recProListBox').on('click', '.add-pro-tip', addProFn)
	},
	renderProduct:function(data){
		$('#recProListBox .add-pro-tip').remove();
		var pNum = $('.pro-img-box').length;
		var proStr = [];
		var link='../mall/getStockInfoForCustomer.htm?salesId='+currSalesId+'&from=sales&stockId='+data.id;
		tempNum *= -1;
		var decStr = PRO_DESC[tempNum>0?1:0];
		
		proStr.push('<div class="ovh mt15 pro-item" data-id="'+data.id+'">');
		proStr.push('<div class="rel pro-img-box mr10 ml10">');
		proStr.push('<a href="'+link+'" class="block">');
		proStr.push('<i class="img-border-bg db abs"></i>');
		proStr.push('<span class="pro-img db abs" style="background-image:url('+data.productPicUrl+')"></span>');
		proStr.push('</a></div><div class="p10">');
		proStr.push('<h3 class="pro-tit f14"><a href="'+link+'">'+data.productName+'</a></h3>');
		proStr.push('<p class="pro-des c-8">'+decStr+'</p>');
		proStr.push('<p class="pro-price b">¥'+ (data.marketPrice).toFixed(2) +'<a href="javascript:;" class="del">&emsp;删除</a></p></div></div>');

		$('#recProListBox').append(proStr.join(''));
		mobileAlert('成功添加1件商品！');

		PRO_INFO.push({
			salesId:currSalesId,
			stockId:data.id, 
			productId:data.productId,
			name:data.productName, 
			desc:decStr, 
			picUrl:data.productPicUrl, 
			price:(data.marketPrice).toFixed(2)
		});

		this.saveProfileConf();
	},
	changeThemeEv:function(){ /*重新编辑*/
		var self = this;
		$('#changeTheme').on('click', function(){
			var opt = {
				name:'photograph',
				param:{theme:currTheme && currTheme.replace('sales','')||''},
				callback: self.updateTheme.bind(self)
			};
			Hybrid.callByJS(opt);
		});
	},
	shareProfile:function(){
		var pNum = $('.pro-img-box').length;
		if(pNum==0){
			mobileAlert('请至少推荐一件商品！');
			return false;
		}
		var tit = '我叫'+$('#salesName').val()+', 我为 '+ $('#storeName').val()+' 带盐！';
		var desc = $('.profile-tags div').text();
		desc = desc && desc.replace(/[\t\n]/g," ").replace(/\ +/g," ").trim().replace(/\s/,'：')||'';

		var opt = {
			name:'shareProfile',
			param:{title:tit, desc:desc, img:SALES_PHOTO},
			callback: self.shareCallBack
		};
		Hybrid.callByJS(opt);
	},
	shareCallBack:function(){
		mobileAlert('分享成功！');
	},
	delProEv:function(){
		var self = this;
		$proBox.on('click', '.del', function(){
			if(window.confirm('是否确定删除？')){
				var $item = $(this).closest('.pro-item');
				var stockId = $item.data('id');
				// 删除数据
				PRO_INFO.forEach(function(v, i){
					(v.stockId == stockId ) && (PRO_INFO.splice(i,1));
				});
				$item.remove();
				if(!PRO_INFO.length){
					$('#recProListBox').html('<div class="add-pro-tip tc"><i class="iconfont">&#xe633;</i><br><p>添加要分享的商品</p></div>');
				}
				self.saveProfileConf();
			}
			
		});
	},
	saveProfileConf:function(){
		var salesConfig = {
			photo:SALES_PHOTO,
			pros:PRO_INFO,
			theme:currTheme
		}
		$.post('saveSalesProfile.json',{salesConfig:JSON.stringify(salesConfig),token:token},function(data){
			if(data.status === '0'){
				// console.log('主页保存成功！');
			}else if(data.status == '403'){
				mobileAlert('没有权限！');
			}else{
				mobileAlert('主页保存失败！');
			}
		});
	}
};

p_salesEvaluate.init();