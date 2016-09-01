if(typeof $ != "function"){
	location.reload();
}

var baseOption = {
	pageSize:"20",
	ickdID:"108386",
	ickdKey:"e5f4bb052cc515e85f217f7fc9d7d580"
};

/* 全局通用方法 */
function getUrlParam(key){
	var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if(r) return decodeURIComponent(r[2]);  return "";
}

String.prototype.getParam = function(key){
	var reg = new RegExp("(#|&)" + key + "=([^&]*)(&|$)");
    var r = this.match(reg);
    if(r) return decodeURIComponent(r[2]);  return "";
}
function mobileAlert(con,time, callback){
	$(".ma-box").remove();
	$("body").append('<div class="ma-box-back"></div><div style="width:'+(document.body.clientWidth-50)+'px;" class="ma-box">'+con+'</div>');
	setTimeout(function(){$(".ma-box, .ma-box-back").remove(); callback && callback();},time||1500);
}
function mobileToastMin(con,time){
	$(".ma-box").remove();
	$("body").append('<div style="width:px;" class="ma-box toastMin">'+con+'</div>');
	$(".ma-box.toastMin").css("margin-left","-"+$(".ma-box.toastMin").width()*0.5+"px");
	setTimeout(function(){$(".ma-box, .ma-box-back").remove()},time||1000);
}
function getLocalTime(ms,day){
	ms = Number(ms);
	var _date = new Date(ms);
	var year=_date.getFullYear(),
        month=_date.getMonth()+1,
        date=_date.getDate(),
        hour=_date.getHours(),
        minute=_date.getMinutes(),
        second=_date.getSeconds();
    return year+"-"+(month<10 ? ("0"+month) : month)+"-"+(date<10 ? ("0"+date) : date)+ 
        (!day ? (" "+(hour<10 ? ("0"+hour) : hour)+":"+(minute<10?("0"+minute):minute)+":"+(second<10?("0"+second):second)) : ""); 
}
function getUnixTime(localTime){
    if(!localTime){
        return "";
    }
	var newstr = localTime.replace(/-/g,'/'); 
    var date =  new Date(newstr);
    return date.getTime();
}
function scrollToLoadMore(option){
	var wHeight = $(window).height();
	window.onscroll = function(){
        var sHeight = $("body").scrollTop(), cHeight = $(document).height();
        if(sHeight >= cHeight-wHeight-(option.distance ? option.distance : 20)){
            if($(".loading-bottom").length > 0) {
                return false;
            }else{
	            dataPage += (option.length ? option.length : ~~baseOption.pageSize);
	            option.callback();
	        }
        }
	}
}

var ajaxUrl = {};
function $ajax(opt) {
	if (ajaxUrl[opt.url]) {
		return false;
	}
	ajaxUrl[opt.url] = true;
	opt.cache = true;
	opt.dataType = opt.dataType?opt.dataType:"json";
	opt.type = opt.type?opt.type:"POST";
	opt.error = function(XMLHttpRequest, textStatus) {
		var status = XMLHttpRequest.status;
		if (status == 0)
			return;
		else if (status == 500)
			alert("服务器错误");
		else if (status == 404)
			alert("请求没有找到");
		else
			return;
	};
	opt.goSuccess = opt.success;
	opt.success = function(res) {
		if (opt.goSuccess)
			opt.goSuccess(res);
	};
	opt.complete = function() {
		delete ajaxUrl[opt.url];
	};
	$.ajax(opt);
}

// artTemplate模板扩展
;(function(){
	template.helper('dateFormat', function (date, format) {
		if(!date) return "";
	    format = getLocalTime(date);
	    return format;
	});
	template.helper('dayFormat', function (date, format) {
		if(!date) return "";
	    format = getLocalTime(date,true).replace(/-/g,".");
	    return format;
	});
	template.helper('dayChFormat', function (date, format) {
		if(!date) return "";
		date = Number(date);
		var _date = new Date(date);
		var year=_date.getFullYear(),
	        month=_date.getMonth()+1,
	        date=_date.getDate(),
	        hour=_date.getHours(),
	        minute=_date.getMinutes(),
	        second=_date.getSeconds();

	    return year+"年"+(month<10 ? ("0"+month) : month)+"月"+(date<10 ? ("0"+date) : date)+"日";
	});
	template.helper('timeFormat', function (date, format) {
		if(!date) return "";
		date = Number(date);
		date = new Date(date);
	    format = (date.getHours() <10 ? "0" : "")+date.getHours()+":"+(date.getMinutes() <10 ? "0" : "")+date.getMinutes()+":"+(date.getSeconds() <10 ? "0" : "")+date.getSeconds();
	    return format;
	});
	template.helper('toFixed2', function (data, format) {
		if(!data) return "0.00";
	    format = data.toFixed(2);
	    return format;
	});
	template.helper('placeholderImg', function (data, format) {
	    var placeholderImg = '';
	    switch(format){
	        case 'product': placeholderImg = 'https://qncdn.qiakr.com/admin/placeholer_300x300.gif'; break;
	        case 'avatar': placeholderImg = 'https://qncdn.qiakr.com/mall/default-photo.png'; break;
	        default: placeholderImg = 'https://qncdn.qiakr.com/admin/placeholer_300x300.gif'; break;
	    }
	    if(!data || data.length<5) return placeholderImg;
	    return data;
	});
})();

// js与本地native交互初始化
// 使用方法：
// window.WebViewJavascriptBridge.callHandler(
//     'gotoOrderDetail' // native方法名
//     , {'orderId': ''} // 调用参数
//     , function(responseData) { // js 被动回调方法，可以不实习
//         document.getElementById("show").innerHTML = "send get responseData from java, data = " + responseData
//     }
// );
if(!window.WebViewJavascriptBridge){
	window.WebViewJavascriptBridge={
		callHandler:function(){}
	}
}
// (function(){
// 	var nativeJS = function (callback) {
//         if (window.WebViewJavascriptBridge) {
//             callback(WebViewJavascriptBridge);
//         } else {
//             document.addEventListener('WebViewJavascriptBridgeReady',function() {
//                 callback(WebViewJavascriptBridge);
//             },false);
//         }
//     };

// 	nativeJS(function(bridge) {
//         bridge.init(function(m, responseCallback) {
//             console.log('JS got a message', m);
//             var data = {
//                 'jsResponds': '测试'
//             };
//             console.log('JS responding with', data);
//             responseCallback(data);
//         });
//  	})
// })();
/**
 *  JS组件
 */
;(function(){
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
	$.fn.replaceClass=function(a,b){
	    var _t = $(this);
	    if(_t.hasClass(a)){
	        _t.removeClass(a).addClass(b);
	    }else{
	        _t.removeClass(b).addClass(a);
	    }
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
	// loading
	$.loading={
		show:function(string){
			var loadingHtml='<div class="popLoading">\
		        <div class="cont">\
		            <div class="loadingAmt">\
		                <div class="img">\
		                    <div class="img2"></div>\
		                </div>\
		            </div>\
		            <div class="pt10">'+(string ? string : '正在加载中')+'</div>\
		        </div>\
		    </div>';
		    $("body").append(loadingHtml);
		},
		hide:function(){
			$(".popLoading").hide();
		}
	};
	// textarea 高度自适应
	$.fn.sizeTextarea = function(){
		var _t = this,textareaTimeout=undefined;
		_t.on("change keydown keypress keyup paste cut",function(){
	      	clearTimeout(textareaTimeout);
	        textareaTimeout = setTimeout(function () {
	            _t.css({'height': ''});
			    var height = _t[0].offsetHeight,
			        diff = height - _t[0].clientHeight,
			        scrollHeight = _t[0].scrollHeight;
			    if (scrollHeight + diff > height) {
			        var newAreaHeight = scrollHeight + diff;
			        _t.css({'height': newAreaHeight + 'px'});
			    }
	        }, 0);
	    });
	};
})();

// dialog
;(function(){
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
				closeByMask:true,
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
		},
		confirm:function(title, content, onConfirm, onCancel, width){ /*参数：标题，内容，确认回调，取消回调，宽度*/
			var options = {
				title: '',
				content: content ||'',
				width: width || 270,
				cacheIns:true,
				hasCloseBtn:true,
				closeByMask:true,
				buttons: [
					{ text:'取消', id:'confBtnCancel', handler:onCancel || function(oThis, val){ oThis.close(); } },
					{ text:'确定', id:'confBtnConfirm', handler:onConfirm }
				]
			};

			if($.isPlainObject(title)){
				options = $.extend({},options,title);
			}else{
				options.title = title || '确认';
			}

			confIns = createInstance('confirm',options);

			return confIns;
		},
		prompt:function(title, labelTxt, onConfirm, onCancel, defaultVal, width){ /*参数：标题，提示文本，确认事件，取消事件，默认值，宽度*/
			var options = {
				title: '请输入',
				content: '<input type="text" tabindex="1" class="msg-prompt-ipt" placeholder="'+(labelTxt||'请输入')+'" value="'+(defaultVal||'')+'"/>',
				width: width || 270,
				cacheIns:true,
				hasCloseBtn:false,
				closeByMask:true,
				hasInput:true,
				buttons: [
					{ text:'取消', id:'propBtnCancel', handler:onCancel || function(oThis, val){ oThis.close(); } },
					{ text:'确定', id:'propBtnConfirm', handler:onConfirm }
				]
			};

			if($.isPlainObject(title)){
				options.content = '<input type="text" tabindex="1" class="msg-prompt-ipt" placeholder="'+(title.labelTxt||'请输入')+'" value="'+(title.defaultVal||'')+'"/>';
				options = $.extend({},options,title);
			}else{
				options.title = title|| '输入'
			}
			promIns = createInstance('prompt',options);

			return promIns;
		},
		popup:function(title, content){ /*参数：标题，内容*/
			var options = {
				title: '',
				content: content || '',
				cacheIns:true,
				hasCloseBtn:true,
				clsIn:'fadeInUp',
				clsOut:'fadeOutDown',
				isPop:true
			};

			if($.isPlainObject(title)) 
				options =  $.extend({},options,title);
			else
				options.title = title || '提示';

			if(!popIns){
				popIns = createInstance('popup', options);
			}else{
				popIns.toggle.call(popIns, options);
			}
			return popIns;
		},
		actions:function(content, onOpened, position, clsIn, clsOut){ /*参数：内容，显示后的回调，位置，进入动画，关闭动画*/
			var options = {
				content: '',
				width: '100%', // 100%/auto
				height: '100%',
				position: position || 'top',
				bodyStyle: '',
				hasCloseBtn: false,
				cacheIns: true,
				closeByMask: true,
				onOpened: onOpened || $.noop, //这里可以对actions box中元素进行的事件注册 参数：oThis 当前实例
				clsIn: clsIn || 'fadeInDown',
				clsOut: clsOut || 'fadeOutUp'
			};

			if($.isPlainObject(content)){
				options = $.extend({}, options, content);
			}else{
				options.content = content || '';
			}

			if(!actIns){
				actIns = createInstance('actions', options);
			}else{
				actIns.toggle.call(actIns, options);
			}
			return actIns;

		}
	};
	$.msg = msg;
})();

// serializeObject序列化
(function($){$.fn.serializeObject=function(){"use strict";var result={};var extend=function(i,element){var node=result[element.name];if('undefined'!==typeof node&&node!==null){if($.isArray(node)){node.push(element.value)}else{result[element.name]=[node,element.value]}}else{result[element.name]=element.value}};$.each(this.serializeArray(),extend);return result}})(Zepto);
