function getUrlParam(key){
	var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if(r) return decodeURIComponent(r[2]);  return "";
}
function getUrlHash(key){
	var reg = new RegExp("(#|&)" + key + "=([^&]*)(&|$)", "i");
    var r = location.hash.match(reg);
    if(r) return decodeURIComponent(r[2]);  return "";
}
String.prototype.getParam = function(key){
	var reg = new RegExp("(#|&)" + key + "=([^&]*)(&|$)");
    var r = this.match(reg);
    if(r) return decodeURIComponent(r[2]);  return "";
}
function mobileAlert(con,time){
	$(".ma-box").remove();
	$("body").append('<div class="ma-box-back"></div><div style="width:'+(document.body.clientWidth-50)+'px;" class="ma-box">'+con+'</div>');
	hideMobileAlert = setTimeout(function(){$(".ma-box, .ma-box-back").remove()},time||1500);
}
function mobileToast(con,time){
	$(".ma-box").remove();
	$("body").append('<div class="ma-box-back"></div><div style="width:'+(document.body.clientWidth-140)+'px;" class="ma-box toast">'+con+'</div>');
	hideMobileAlert = setTimeout(function(){$(".ma-box, .ma-box-back").remove()},time||1500);
}
var baseOption = {
	pageSize:"20",
	ickdID:"108386",
	ickdKey:"e5f4bb052cc515e85f217f7fc9d7d580"
}
function getLocalTime(ms,day){
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

var qkUtil = {
	loading:{
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
	}
}
function getOrderStatus (code) {
	var status = "";
    switch(code){
        case 1 : 
        status="待付款";
        break;
        case 2 :
        status="已发货";
        break;
        case 10 :
        status="待发货";
        break;
        case 3 :
        status="待评价";
        break;
        case 4 :
        status="已完成";
        break;
        case 5 :
        status="已关闭";
        break;
    }
    return status;
}

$(function(){
	// 商品搜索
	$(".searchCover").height($(this).height()-51);
	$(".searchBox.stock input[type=search]").focus(function(){
	    var box = $(this).closest(".searchBox");
    	$(".stockList").hide();
	    box.addClass("doing").find(".s-cancel").show();
	    var searchHistory = sessionStorage.searchHistory ? JSON.parse(sessionStorage.searchHistory) : [],
        	historyStr = "";
	    $.each(searchHistory,function(i,e){
	        historyStr+='<li class="wbox"><a href="" class="wbox-1">'+e+'</a><a href="" class="remove">删除</a></li>';
	    });
	    if(searchHistory.length > 0){
	        historyStr+='<li class="tx-c clear"><a href="" class="btn">清除搜索记录</a></li>';
	    }else{
	        historyStr+='<li class="noResult"><span>暂无搜索历史记录</span></li>';
	    }
	    $(".searchCover").show().find(".history").empty().append(historyStr);
	});
	$(".s-cancel").on("click",function(){
    	$(".searchCover").hide();
	    $(".stockList").show();
	    $(".searchBox").removeClass("doing").find(".s-cancel").hide();
	});
	$(".searchBox.stock form").submit(function(){
	    var searchHistory = sessionStorage.searchHistory ? JSON.parse(sessionStorage.searchHistory) : [];
	    var word = $(".searchBox input[type=search]").val();
	    if(word && $.inArray(word,searchHistory) < 0){
		    searchHistory.unshift(word);
		    sessionStorage.searchHistory = JSON.stringify(searchHistory);
	    }
	});
	$(".searchCover").on("click",".wbox-1",function(e){
		e.preventDefault();
       	var word = $(this).text();
        $(".searchBox input[type=search]").val(word);
        $(".searchBox form").submit();
	}).on("click",".clear .btn",function(e){
		e.preventDefault();
		sessionStorage.searchHistory = "";
	    $(this).parent().html('<span>暂无搜索历史记录</span>').removeClass("clear").addClass("noResult").siblings().remove();
	}).on("click",".remove",function(e){
		e.preventDefault();
		var word = $(this).siblings(".wbox-1").text();
		var searchHistory = JSON.parse(sessionStorage.searchHistory);
		var searchHistoryNew = $.grep(searchHistory,function(item){
		    return item != word;
		});
		$(this).parent().remove();
		sessionStorage.searchHistory=JSON.stringify(searchHistoryNew)
	});
});

// artTemplate模板扩展
template.helper('dateFormat', function (date, format) {
    format = getLocalTime(date,true).replace(/-/g,".");
    return format;
});
template.helper('toFixed2', function (data, format) {
    format = data.toFixed(2);
    return format;
});
template.helper('getStatus', function (data, format) {
    format = getOrderStatus(data);
    return format;
});

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
                $('body').removeClass('no-scroll'); 
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
            $('body').addClass('no-scroll');
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
	clsIn:'zoomIn',		//进入的动画名称
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
			typeof callback === 'function' && (o.onClosed = callback);
			o.onClosed(self);
			self.isShow = false;
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
					$('#'+o.buttons[i].id).one('click',function(handler){
						if(o.hasInput) val = self.$el.find('input').val();
						o.buttons[i].handler(self, val);
					});
				})(i);
			}
		}else{
			this.$footer.remove()
		}

	},
	setPosition:function(){
		var self = this, o = this.o;
		var w = o.width, h = o.height || this.$el.getRealSize().height;
		if(!o.isPop){
			switch(o.position){
				case 'center':
					this.$el.attr('style','width:'+w+'; height:'+h+'; left:50%; top:50%; margin-left:-'+w/2+'px; margin-top:'+(-h/2-20)+'px;');
					break;
				case 'top':
				case 'left':
					this.$el.attr('style','width:'+w+'; height:'+h+'; left:0; top:0;');
					break;
				case 'right':
					this.$el.attr('style','width:'+w+'; height:'+h+'; right:0; top:0;');
					break;
				case 'bottom':
					this.$el.attr('style','width:'+w+'; height:'+h+'; left:0; bottom:0;top:auto;');
					break;
			}
		}

		//[SETUP:title & content & close]
		if(o.title==='') {
			this.$header.remove();
		}else{
			this.$header.find('.title').html(o.title);
		}
		
		o.content && this.$body.html('').append(o.content);
		this.$body.children().css('display','block');

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
			title: title || '提示',
			content: content ||'',
			width: width || 270,
			cacheIns:true
		};
		if(onConfirm && typeof onConfirm == 'function'){
			options.buttons=[{ text:'确定', id:'confBtnConfirm', handler:onConfirm }];
		}
		if($.isPlainObject(title)) options = $.extend({},options,title);

		if(!alertIns){
			alertIns = createInstance('alert',options);
		}else{
			alertIns.toggle.call(alertIns,options);
		}
		return alertIns;
	},
	confirm:function(title, content, onConfirm, onCancel, width){ /*参数：标题，内容，确认回调，取消回调，宽度*/
		var options = {
			title: title || '确认',
			content: content ||'',
			width: width || 270,
			cacheIns:false,
			hasCloseBtn:true,
			closeByMask:true,
			buttons: [
				{ text:'取消', id:'confBtnCancel', handler:onCancel || function(oThis, val){ oThis.close(); } },
				{ text:'确定', id:'confBtnConfirm', handler:onConfirm }
			]
		};

		if($.isPlainObject(title)) options = $.extend({},options,title);

		confIns = createInstance('confirm',options);

		return confIns;
	},
	prompt:function(title, labelTxt, onConfirm, onCancel, defaultVal, width){ /*参数：标题，提示文本，确认事件，取消事件，默认值，宽度*/
		var options = {
			title: title || '输入',
			content: '<label class="msg-prompt-lbl">'+(labelTxt||'请输入：')+'</label>'+
					 '<input type="text" tabindex=1 class="msg-prompt-ipt" value="'+(defaultVal||'')+'"/>',
			width: width || 270,
			cacheIns:false,
			hasCloseBtn:true,
			closeByMask:true,
			hasInput:true,
			buttons: [
				{ text:'取消', id:'propBtnCancel', handler:onCancel || function(oThis, val){ oThis.close(); } },
				{ text:'确定', id:'propBtnConfirm', handler:onConfirm }
			]
		};

		if($.isPlainObject(title)) options = $.extend({},options,title);

		promIns = createInstance('prompt',options);

		return promIns;
	},
	popup:function(title, content){ /*参数：标题，内容*/
		var options = {
			title: title || '提示',
			content: content || '',
			cacheIns:false,
			hasCloseBtn:true,
			clsIn:'fadeInUp',
			clsOut:'fadeOutDown',
			isPop:true
		};

		if($.isPlainObject(title)) options =  $.extend({},options,title);

		popIns = createInstance('popup', options);
		return popIns;
	},
	actions:function(content, onOpened, position, clsIn, clsOut){ /*参数：内容，显示后的回调，位置，进入动画，关闭动画*/
		var options = {
			content: content ||'',
			width: '100%', // 100%/auto
			height: '100%',
			position: position || 'top',
			hasCloseBtn: false,
			cacheIns: false,
			closeByMask: true,
			onOpened: onOpened || $.noop, //这里可以对actions box中元素进行的事件注册 参数：oThis 当前实例
			clsIn: clsIn || 'fadeInDown',
			clsOut: clsOut || 'fadeOutUp'
		};

		if($.isPlainObject(content)) options = $.extend({},options,content);

		actIns = createInstance('actions', options);
		return actIns;

	}
};
$.msg = msg;