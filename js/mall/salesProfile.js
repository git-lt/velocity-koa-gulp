// $.bindFastClick();

/**
 * [$.toast 消息提示]
 * @param  {[string]} msg [消息内容]
 */
$.toast = function(msg, callback){
	var $toast = $("<div class='modal-toast'>"+msg+"</div>").appendTo(document.body);
	var t = 2000;

	var o = $toast.offset();
	var w = o.width;
	var h = o.height;
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

$.fn.replaceClass=function(a,b){
    var _t = $(this);
    if(_t.hasClass(a)){
        _t.removeClass(a).addClass(b);
    }else{
        _t.removeClass(b).addClass(a);
    }
}
// 对zepto获取不到隐藏元素高宽的修正
$.fn.getRealSize=function(){
	var self = this.eq(0),
		cssShow = { position: "relative", visibility: "hidden", display: "block" },
		oldProperty = {},rW = 0,rH = 0;
	for(var i in cssShow){
	    oldProperty[i] = self.css(i);
	    self.css(i,cssShow[i]);
	}
	rW = self.width();
	rH =  self.height();
	for( i in cssShow){
        self.css(i,oldProperty[i]);
    }
	return {width:rW,height:rH};
}

// mask 遮罩层弹出插件
$.fn.emulateTransitionEnd = function(duration) {
  var called = false;
  var $el = this;

  $(this).one('webkitTransitionEnd', function() {
    called = true;
  });

  var callback = function() {
    if (!called) {
      $($el).trigger('webkitTransitionEnd');
    }
    $el.transitionEndTimmer = undefined;
  };
  this.transitionEndTimmer = setTimeout(callback, duration);
  return this;
};


var Mask = function(option){
    this.inited = false;
    this.isShow = false;
    this.$el = null;
    this.o = option;
    this.init();
};

Mask.DEFAUTS={
    selector:'[data-ui-mask]',
    opacity:0.4,
    color:'black',
    parentId:'body',
    tpl:'<div class="ui-mask" data-ui-mask></div>'
}

Mask.prototype={
    constructor:Mask,
    init:function(){
        if(!this.inited && !this.isShow){
            $('body').append(this.o.tpl);
            this.$el = $(Mask.DEFAUTS.selector);
            this.inited = true;
        }
    },
    show:function(option){
        if(option) this.o = option;
        if(!this.isShow){
            this._initStyle();
            this.$el.addClass('active')
            this.isShow = true;
        }
    },
    hide:function(){
        if(this.isShow){
            this.$el.removeClass('active').one('webkitTransitionEnd',function(){
                $(this).hide();
                $('html').removeClass('no-scroll');
            });
            this.$el.emulateTransitionEnd(150);
            this.isShow = false;
        }
    },
    _initStyle:function(){
        //set dimmer style
        var rgba = this.o.color === 'white' ? 'rgba(255,255,255,'+this.o.opacity+')' : 'rgba(0,0,0,'+this.o.opacity+')';
        if(this.o.parentId != 'body'){
            var $Parent = $('#'+this.o.parentId);
            this.$el.css({
                'width':$Parent.width(),
                'height':$Parent.height(),
                'left':$Parent.offset().left+'px',
                'top':$Parent.offset().top+'px',
                'backgroundColor':rgba,
                'display':'table'
            });
        }else{
        	$('html').addClass('no-scroll');
            this.$el.css({'width':'100%','height':'100%','left':0,'top':0,'backgroundColor':rgba,'display':'block'});
        }
    }
};

Mask.INSTANCE = null;

$.mask ={
    $el:null,
    instance:null,
    show:function(opacity,color,parentId){
        var options = {
            opacity:opacity || 0.4,
            color:color|| 'black',
            parentId: parentId || 'body'
        };

        if($.isPlainObject(opacity)) options = opacity;
        var option = $.extend({}, Mask.DEFAUTS, options);

        !Mask.INSTANCE && (Mask.INSTANCE = new Mask(option));

        this.$el = Mask.INSTANCE.$el;
        this.instance = Mask.INSTANCE;

        Mask.INSTANCE.show.call(Mask.INSTANCE,option);
        return Mask.INSTANCE;
    },
    hide:function(){
        Mask.INSTANCE.hide.call(Mask.INSTANCE);
        return Mask.INSTANCE;
    }
};

// dialog
var Msg = function($el, options){
	this.o = $.extend({}, Msg.DEFAULTS, options || {});
	this.$el = $el;
	this.$header = this.$el.find('.ui-msg-hd');
	this.$footer = this.$el.find('.ui-msg-ft');
	this.$body = this.$el.find('.ui-msg-bd');
	this.$close = this.$header.find('.close');
	this.isShow = false;
	this.open();
	this.bindEvents();
}
Msg.DEFAULTS={
	title:'',  			//标题
	content:'',			//内容
	isModal:true,		//是否模态显示
	hasCloseBtn:true,	//是否有关闭按钮
	width:270,			//宽度
	cacheIns:false,		//是否缓存实例
	position:'center',	//定位：center/top/left/right/bottom
	closeByMask:false,	//是否可以点击遮罩层关闭
	maskOpacity:0.4,	//遮罩的透明度
	maskColor:'black',	//遮罩的颜色
	onOpened:$.noop, 	//弹出层显示后的回调
	onClosed:$.noop,	//弹出层关闭后的回调
	clsIn:'zoomIn',		//进入的动画名称 【animate.css中的动画】
	clsOut:'zoomOut',	//关闭的动画名称
	buttons:[] 			//对话框中的按钮：{text:'确定',id:'alertConfirm',handler:funciton(oThis,val){}}
};
Msg.prototype={
	open:function(options,callback){
		if(options) this.o = $.extend({}, this.o, options); //更新配置项

		var self = this, o = this.o;
		this.addButtons();
		this.setPosition();
		o.isModal && $.mask.show(o.maskOpacity,o.maskColor);
		this.$el.show().addClass(o.clsIn);
		typeof callback === 'function' && (o.onOpened = callback);
		o.onOpened(self);
		this.isShow = true;
		return this;
	},
	close:function(isDestroy,callback){
		var self = this, o = this.o;
		this.$el.removeClass(o.clsIn).addClass(o.clsOut).one('animationend webkitAnimationEnd', function(){
			o.isModal && $.mask.hide();
			self.$el.removeClass(o.clsOut).hide();
			(isDestroy === true || o.cacheIns===false) && self.$el.remove();
			self.isShow = false;
			typeof callback === 'function' && (o.onClosed = callback);
			o.onClosed(self);
			self.$el.off('animationend webkitAnimationEnd');
		});
		return this;
	},
	toggle:function(options){
		if(this.isShow)
			this.close.call(this);
		else
			this.open.call(this,options);
		return this;
	},
	bindEvents:function(){
		var self = this, o = this.o;
		o.hasCloseBtn && this.$close.on('click', function(){ self.close(); });
		o.closeByMask && $.mask.$el.on('click', function(){
			self.close();
		});
	},
	addButtons:function(){
		var self = this, o = this.o, val=undefined;
		var len = o.buttons.length, btnHtml='';
		if(len){
			for(var i=0; i<len; i+=1){
				btnHtml += '<span class="msg-btn" id='+o.buttons[i].id+'>'+o.buttons[i].text+'</span>'
			}
			this.$footer.html(btnHtml);
			//buttons events
			for(var i in o.buttons){
				(function(i){
					$('#'+o.buttons[i].id).off().on('click',function(handler){
						if(o.hasInput) val = self.$el.find('input').val();
						o.buttons[i].handler && o.buttons[i].handler(self, val);
					});
				})(i);
			}
		}else{
			this.$footer.remove()
		}

	},
	setPosition:function(){
		var self = this, o = this.o;
		//[SETUP:title & content & close]
		if(o.title==='') {
			this.$header.remove();
		}else{
			this.$header.find('.title').html(o.title);
		}

		typeof o.content !== 'string' &&  $(o.content).css('display','block');
		o.content && this.$body.html('').append(o.content);

		var w = o.width, h = this.$el.getRealSize().height;
		if(!o.isPop){
			switch(o.position){
				case 'center':
					this.$el.attr('style','width:'+w+'px; left:50%; top:50%; margin-left:-'+w/2+'px; margin-top:'+(-h/2-20)+'px;');
					break;
				case 'top':
					this.$el.attr('style','width:'+w+'; left:0; top:0;');
					break;
				case 'left':
					this.$el.attr('style','width:'+w+'; left:0; top:0; bottom:0;');
					break;
				case 'right':
					this.$el.attr('style','width:'+w+'; top:0; right:0; bottom:0;');
					break;
				case 'bottom':
					this.$el.attr('style','width:'+w+'; left:0; bottom:0;top:auto;');
					break;
			}
		}

		// 侧边栏弹出 bd样式设置
		if(o.position == 'left' && o.bodyStyle){
			this.$body.attr('style', o.bodyStyle);
		}else{
			this.$body.attr('style','');
		}

		!o.hasCloseBtn && this.$close.remove();
	}
};
var alertIns, confIns, promIns, popIns, loadIns, actIns;
var tpls = {
	common:'<div class="ui-msg" tabindex="-1"><div class="inner">'+
				'<div class="ui-msg-hd">'+
					'<h4 class="title"></h4><i class="close">&times;</i>'+
				'</div>'+
				'<div class="ui-msg-bd"></div><div class="ui-msg-ft"></div>'+
			'</div></div>'
};
var createInstance = function(type, options){
	var $el;
	$(tpls.common).addClass('msg-'+type).appendTo('body').attr('data-ui-msg-'+type,'');
	$el = $('[data-ui-msg-'+type+']');
	return (new Msg($el, options));
}
var msg = {
	alert:function(title, content, width, onConfirm){ /*参数：标题，内容，宽度，确定回调*/
		var options = {
			title: '',
			content: content ||'',
			width: width || 270,
			cacheIns:true
		};
		if(onConfirm && typeof onConfirm == 'function'){
			options.buttons=[{ text:'确定', id:'confBtnConfirm', handler:onConfirm }];
		}
		if($.isPlainObject(title)){
			options = $.extend({},options,title);
		}else{
			options.title =  title || '提示';
		}

		if(!alertIns){
			alertIns = createInstance('alert',options);
		}else{
			alertIns.toggle.call(alertIns,options);
		}
		return alertIns;
	}
};
$.msg = msg;

var Utils = {
	getUrlParam: function(key){
		var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    return r ? decodeURIComponent(r[2]) : '';
	}
};

// 弹出手机号注册
function showMPLoginBox(_callback,suid){
	var loginStr = '<div id="mpLoginBox">\
	  <div class="cont">\
	    <div class="tc f16 pb10">请使用手机号登录<span class="cancelLogin">×</span></div>\
	    <input type="tel" class="tel" placeholder="请填写11位手机号码">\
	    <div class="wbox pt15">\
	      <div class="wbox-1 pr10"><input class="code" type="text" maxlength="6" placeholder="短信收到的验证码"></div>\
	      <button class="btn btn-red getCode">获取</button>\
	    </div>\
	    <div class="c-rd lh22 tips pb15"></div>\
	    <button class="mt10 btn btn-red full submit" disabled>确认</button>\
	  </div>\
	</div>';
	$("body").append(loginStr);
	$("#mpLoginBox").on("click",".cancelLogin",function(e){
		$("#mpLoginBox").remove();
	}).on("click",".getCode",function(){
		if(!$(this).hasClass("btn-red")){
			return false;
		}
		var tel = $.trim($("#mpLoginBox .tel").val());
		if(tel.length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(tel)){
			var btn=$(this),timeEnd = 59;
			$.getJSON("../user/getRegisterCode.json?phone="+tel,function(data){
				if(data.status=="0"){
					$("#mpLoginBox .tips").html("验证码已发送，请注意查收手机短信");
					btn.removeClass("btn-red").text(timeEnd);
					var getCodeCount = setInterval(function(){
						if(timeEnd>0){
							timeEnd--;
							btn.text(timeEnd);
						}else{
							clearInterval(getCodeCount);
							btn.addClass("btn-red").text("获取");
						}

					},1000);
				}
			});
		}else{
			$("#mpLoginBox .tips").html("手机号码错误");
		}
	}).on("input",".code",function(){
		if($(this).val().length > 0 && $("#mpLoginBox .tel").val()){
			$("#mpLoginBox .submit").removeAttr("disabled");
		}else{
			$("#mpLoginBox .submit").attr("disabled","disabled");
		}
	}).on("click",".submit",function(){
		var tel = $.trim($("#mpLoginBox .tel").val()),
			code = $("#mpLoginBox .code").val();
		$.getJSON("customerRegister.json?phone="+tel+"&code="+code+"&supplierId="+suid,function(data){
			if(data.status=="0"){
				$("#mpLoginBox").remove();
				sessionStorage.isLogin="true";
				_callback();
			}else{
				$("#mpLoginBox .tips").html(data.errmsg);
			}
		});
	}).on("click",function(e){
		e.preventDefault();
		if(e.target == this){
			$("#mpLoginBox").remove();
		}
	});
}

var $bg = $('#profileBox');
var $saleImg = $('#profileImg');
var $body = $('body');
var $proBox = $('#recProListBox');
var currTheme = '';
var currSalesId = Utils.getUrlParam('salesId');
var token =  Utils.getUrlParam('token');
var PRO_INFO=[]; 	//商品信息
var SALES_PHOTO=''; //导购形象图片地址
// var getWebp = Modernizr.webp.alpha?'?imageMogr2/format/webp':'';
var getWebp = '';

var p_salesEvaluate = {
	init:function(){
		this.initTheme(); 		//初始化主题
		this.followEv();
		this.contactEv();
	},
	initTheme:function(){
		// 使用已经存在的配置
		this.initByConfig();
		// $('#profileLoading').addClass('out');
		// setTimeout(function(){$('#profileLoading').remove();}, 2100);
	},
	initByConfig:function(){
		$.post('getSalesProfile.json',{salesId:currSalesId},function(data){
			if(data.status === '0'){
				var profInfo = data.result.salesProfile, sConf;
				if(profInfo && profInfo.salesConfig){
					sConf = JSON.parse(profInfo.salesConfig);
					currTheme = sConf.theme;
					SALES_PHOTO = sConf.photo+getWebp;

					// 设置主题 和 图片
					$body.attr('class', 'rel '+currTheme);
					$bg.css('background-image', 'url('+SALES_PHOTO+')');

					// 渲染商品
					PRO_INFO = sConf.pros;
					if(PRO_INFO.length){
						$('#recProListBox .add-pro-tip').remove();
						var proStr = [], link='';
						for(var i in PRO_INFO){
							link='getStockInfoForCustomer.htm?salesId='+PRO_INFO[i].salesId+'&stockId='+PRO_INFO[i].stockId;

							proStr.push('<div class="ovh mt15 pro-item" data-id="'+PRO_INFO[i].stockId+'">');
							proStr.push('<div class="rel pro-img-box mr10 ml10">');
							proStr.push('<a href="'+link+'" class="block">');
							proStr.push('<i class="img-border-bg db abs"></i>');
							proStr.push('<span class="pro-img db abs" style="background-image:url('+PRO_INFO[i].picUrl+getWebp+')"></span>');
							proStr.push('</a></div><div class="p10">');
							proStr.push('<h3 class="pro-tit f14"><a href="'+link+'">'+PRO_INFO[i].name+'</a></h3>');
							proStr.push('<p class="pro-des c-8">'+PRO_INFO[i].desc+'</p>');
							proStr.push('<p class="pro-price b">¥'+ PRO_INFO[i].price +'</p></div></div>');
						}
						$('#recProListBox').append(proStr.join(''));
					}else{
						$('.rec-pro-box').remove();
					}
				}else{
					// 判断性别 ,设置默认主题, 显示 联系TA 和 关注TA 按钮
					$('.rec-pro-box').remove();
					var gender = $('#salesGender').val();
					if(gender==='1'){
						$body.attr('class', 'rel sales10');
						SALES_PHOTO = 'https://qncdn.qiakr.com/evluate/theme_sales_boy.jpg';
						$bg.css('background-image', 'url('+SALES_PHOTO+getWebp+')');
					}else{
						$body.attr('class', 'rel sales7');
						SALES_PHOTO = 'https://qncdn.qiakr.com/evluate/theme_sales_gril.jpg';
						$bg.css('background-image', 'url('+SALES_PHOTO+getWebp+')');
					}

					$('#shareProfileImg').html('<img src="'+SALES_PHOTO+'?imageView2/1/w/300/h/300" />');
				}
			}else if(data.status == '403'){
				$.toast('没有权限！');
			}else{
				console.log('获取配置，出错了！');
			}
		});
	},
	followEv:function(){
		var hasQRcode=false;
		$('#follow').on('click', function(){
            if(!hasQRcode){
        	  var $qrcodeImg = $('#qrCodeLoading').find('.qrcode-img');
              $.ajax({
                url:'getQrcodeBySalesId.json',
                data:{salesId:Utils.getUrlParam("salesId")},
                type:'POST',
                async:false,
                dataType:'json',
                success:function(data){
                  if(data.status === '0'){
                    var codeStr =  data.result.qrcode.url;
                    var qrcode = new QRCode($qrcodeImg[0], {
                         width: 170,
                         height: 170
                    });
                    qrcode.makeCode(codeStr);
                    hasQRcode = true;
                  }else{
                    $.toast('获取二维码失败！');
                  }
                },
                error:function(data){
    	            $.toast('获取二维码失败！');
                }
              });
            }
            if(hasQRcode){
            	$.msg.alert({
            	  title:'',
            	  content:$('#qrCodeLoading')[0],
            	  clsIn:'fadeInDown',
            	  clsOut:'fadeOutUp',
            	  closeByMask:true
            	})
            }
		});
	},
	contactEv:function(){
		$('#contact a').on('click', function(){
			var urlStr = $(this).data('href');

			if(sessionStorage.isLogin==='true'){
				window.location.href = urlStr;
			}else{
				$.getJSON("getLoginCustomer.json",function(data){
					if(data.status=="0"){
						sessionStorage.isLogin="true";
						sessionStorage.loginCustomerId = data.result.customerId;
						window.location.href = urlStr;
					}else{
						showMPLoginBox(function(){
							window.location.href = urlStr;
						},$("#supplierId").val());
					}
				});
			}
		})
	}
};

p_salesEvaluate.init();
