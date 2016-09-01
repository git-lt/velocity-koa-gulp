if(typeof $ != "function"){
	var ZeptoErrorCount = parseInt(sessionStorage.ZeptoError||"0")
	if(ZeptoErrorCount<5){
		sessionStorage.ZeptoError=ZeptoErrorCount+1;
		location.reload();
	}else{
		alert("基础模块加载失败，请查看网络连接或更换网络环境后再试")
	}
}

// FastClick 优化click点击延迟
var FAST_CLICK = /qiakr/.test(location.host);
var baseOption = {
	pageSize:"20",
	ickdID:"108386",
	ickdKey:"e5f4bb052cc515e85f217f7fc9d7d580",
	uploadServer:location.protocol==="https:" ? 'https://up.qbox.me/' : 'http://up.qiniu.com/',
	messageCallback:[]
}
// mobile.js
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
function mobileAlert(con,time, callback){
	$(".ma-box").remove();
	$("body").append('<div class="ma-box-back"></div><div style="width:'+(document.body.clientWidth-50)+'px;" class="ma-box">'+con+'</div>');
	setTimeout(function(){$(".ma-box, .ma-box-back").remove(); callback && callback();},time||1500);
}
function mobileToast(con,time){
	$(".ma-box").remove();
	$("body").append('<div class="ma-box-back"></div><div style="width:'+(document.body.clientWidth-140)+'px;" class="ma-box toast">'+con+'</div>');
	setTimeout(function(){$(".ma-box, .ma-box-back").remove()},time||1500);
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
function getOrderStatus (code,dt) {
	var status = "";
    switch(code){
        case 1 : 
        status="待付款";
        break;
        case 2 :
        if(dt && dt=="2"){
        	status="待提货";
        }else{
        	status="已发货";
        }
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

// 弹出手机号注册
function showMPLoginBox(_callback,suid){
	var loginStr = '<div id="mpLoginBox">\
	  <div class="cont">\
	    <div class="tx-c fs16 pb10">请使用手机号登录<span class="cancelLogin">×</span></div>\
	    <input type="tel" class="tel" placeholder="请填写11位手机号码">\
	    <div class="wbox pt15">\
	      <div class="wbox-1 pr10"><input class="code" type="text" maxlength="6" placeholder="短信收到的验证码"></div>\
	      <button class="btn btn-red getCode">获取</button>\
	    </div>\
	    <div class="fc-red lh22 tips pb15"></div>\
	    <button class="mt10 btn btn-red full submit" disabled>确认</button>\
	  </div>\
	</div>';

	$("body").append(loginStr);
	// var logBox = $('#mpLoginBox');

	$("#mpLoginBox").on("click",".cancelLogin",function(){
		$("#mpLoginBox").remove();
	}).on("click",".getCode",function(){
		if(!$(this).hasClass("btn-red")){
			return false;
		}
		var tel = $.trim($("#mpLoginBox .tel").val());
		if(tel.length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(tel)){
			var btn=$(this),timeEnd = 59;
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
			$.getJSON("../user/getRegisterCode.json?phone="+tel,function(data){
				if(data.status=="0"){
					$("#mpLoginBox .tips").html("验证码已发送，请注意查收手机短信");
				}else{
					$("#mpLoginBox .tips").html(data.errmsg ? data.errmsg : "验证码发送失败，请重新获取");
					btn.addClass("btn-red").text("获取");
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
				sessionStorage.removeItem("loginAccountStatus");
				_callback();
			}else{
				$("#mpLoginBox .tips").html(data.errmsg ? data.errmsg : "登陆失败，系统繁忙，请稍后再试");
			}
		});
	}).on("click",function(e){
		e.preventDefault();
		if(e.target == this){
			$("#mpLoginBox").remove();
		}
	});
}

var qkUtil = {
	// 隐藏微信右上角菜单项
	hideOptionMenu:function(){
		if (typeof WeixinJSBridge == "undefined"){
            document.addEventListener('WeixinJSBridgeReady', function(){WeixinJSBridge.call('hideOptionMenu');}, false);
      	}else {
          	WeixinJSBridge.call('hideOptionMenu');
      	}
	},
	// 显示微信右上角菜单项（IOS系统下，一旦关闭\打开之后，后续页面会持续关闭\打开，要手动开关！）
	showOptionMenu:function(){
		if (typeof WeixinJSBridge == "undefined"){
            document.addEventListener('WeixinJSBridgeReady', function(){WeixinJSBridge.call('showOptionMenu');}, false);
      	}else {
          	WeixinJSBridge.call('showOptionMenu');
      	}
	},
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
	},
	obj2UrlPms:function(obj){
	    var str=[];
	    for(var i in obj){
	        str.push(i+'='+obj[i]);
	    }
	    return str.join('&');
	},
	stopTouchMove:function(){
		window.ontouchmove=function(e){
		   e.preventDefault();
		   e.stopPropagation();
		   e.returnValue=false;
		   return false;
		 };
	},
	releaseTouchMove:function(){
		window.ontouchmove=function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    e.returnValue=true;
		    return true;
		};
	},
	getDataStorage:function(key,func){
		if(localStorage.dataStorage){
			var objData = JSON.parse(localStorage.dataStorage);
			var value=objData[key] ? objData[key] : "";
			func(value);
		}else{
			$.getJSON('getCustomerStorage.json',function(data){
				if(data.status==='0'){
					localStorage.dataStorage = data.result.customerStorage ? data.result.customerStorage.dataStorage : '{}';
					var objData = JSON.parse(localStorage.dataStorage);
					var value=objData[key] ? objData[key] : "";
					func(value);
				}
			});
		}
	},
	setDataStorage:function(obj){
		var objData = localStorage.dataStorage ? JSON.parse(localStorage.dataStorage) : {};
		objData = $.extend(objData,obj);
		localStorage.dataStorage = JSON.stringify(objData);
		if(sessionStorage.isLogin=="true"){
			$.post('setCustomerStorage.json?dataStorage='+localStorage.dataStorage, function(data){
				if(data.status=='0'){
					console.log('set dataStorage ok');
				}
			});
		}
	},
	// 建立websocket连接
	do_chat: function(uid){
		var socketServer = location.host.indexOf("mall.qiakr")>-1 ? "//mall.qiakr.com:29001" : location.host.indexOf("mall.ekeban")> -1 ? "//mall.ekeban.com:29000" : "//www.ekeban.com:29000"; 
	    socket = io.connect(socketServer);
	 	var message = {
	        fId: 0,
	        uId: uid
	    };
	    socket.emit('login',message);
	    socket.on('message', function(data) {
	        console.log(data);
	        if(data.fId != "0"){
	        	data = JSON.parse(data.data);
	        	while(baseOption.messageCallback.length>0){
					var fn = baseOption.messageCallback.pop();
					fn(data.content);
				}
	        	var from = data.from;
	        	var newMsgAccountArray = sessionStorage.qiakrNewMessage ? JSON.parse(sessionStorage.qiakrNewMessage) : [];
	        	if(from && $.inArray(from,newMsgAccountArray) < 0){
	                newMsgAccountArray.push(from);
	                sessionStorage.qiakrNewMessage = JSON.stringify(newMsgAccountArray);
	            }
	            if($("#chatMessageList").length === 0){
	            	$("#goChat").addClass("hasNewMsg");
	            }else{
		        	// 消息中心处理
	        		location.reload();
		        }
		        if($("#newMsgVoice").length === 0){
		        	$("body").append('<audio id="newMsgVoice" src="https://qncdn.qiakr.com/webim/converted_newMsg.mp3"></audio>');
		        }
		        $("#newMsgVoice")[0].play();
		    }
	    });
	}
};

// artTemplate模板扩展
(function(){
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
	template.helper('timeFormat', function (date, format) {
		if(!date) return "";
		date = Number(date);
		date = new Date(date);
	    format = (date.getHours() <10 ? "0" : "")+date.getHours()+":"+(date.getMinutes() <10 ? "0" : "")+date.getMinutes()+":"+(date.getSeconds() <10 ? "0" : "")+date.getSeconds();
	    return format;
	});
	template.helper('toFixed2', function (data, format) {
		if(!data || isNaN(data)) return "0.00";
	    format = parseFloat(data).toFixed(2);
	    return format;
	});
	template.helper('placeholderImg', function (data, format) {
	    var placeholderImg = '';
	    switch(format){
	        case 'product': placeholderImg = 'https://qncdn.qiakr.com/admin/placeholer_300x300.gif'; break;
	        case 'avatar': placeholderImg = 'http://static.qiakr.com/images/default_photo.png'; break;
	        default: placeholderImg = 'https://qncdn.qiakr.com/admin/placeholer_300x300.gif'; break;
	    }
	    if(!data || data.length<5) return placeholderImg;
	    return data;
	});
	template.helper('truncate', function(data, len){
		if(!data || data.length<len) return data;
		return data.substring(0,len)+'...';
	});
	template.helper('truncate2', function(data, len){
		if(!data || data.length<len) return data;
		return data.substring(0,len);
	});
})();


var loginToChatBase = function (id){
	if(typeof io != "undefined"){
	    qkUtil.do_chat(id);
	    return;
	 }
	 setTimeout(arguments.callee,100);
};

if(sessionStorage.loginCustomerId){
	loginToChatBase(sessionStorage.loginCustomerId);
}else{
	if(/\/mall/.test(location.pathname)||location.href.indexOf('waitAnswer')!=-1){ //不是在mall目录下则不请求
		$.getJSON("../mall/getLoginCustomer.json",function(data){
			if(data.status=="0"){
				sessionStorage.isLogin="true";
				sessionStorage.removeItem("loginAccountStatus");
				sessionStorage.loginCustomerId = data.result.customerId;
				loginToChatBase(data.result.customerId);
			}else{
				sessionStorage.isLogin="false";
				if(data.status=="401"){
					sessionStorage.loginAccountStatus="401";
				}
			}
		});
	}
}

$(function(){
	if($("#goChat").length>0 && sessionStorage.qiakrNewMessage && JSON.parse(sessionStorage.qiakrNewMessage).length > 0){
		$("#goChat").addClass("hasNewMsg");
	}
	// 显示\隐藏微信右上角菜单
	var pageName = location.pathname.split("/").reverse()[0].split(".")[0],
		hideOptionMenuList=["confirmOrderInfo","confirmOrderOfSeckill","confirmOrderOfSharePhoto","couponInfo","centerCard","appointmentDetail","appointmentCancel","appointmentResult","appointmentSalesList","getOrderInfoOfCustomer","orderAppraise","orderAppraiseList","payOrder","payOrderResult","refundApply","refundDelivery","refundDetail","refundFlow","addSalesTags","alipayResult"];
	if($.inArray(pageName,hideOptionMenuList)>-1){
		qkUtil.hideOptionMenu();
	}else{
		qkUtil.showOptionMenu();
	}

	$("body").on("click",".linkNeedLogin",function(){
		if(sessionStorage.isLogin == "false" && getUrlParam("type")!="preview"){
			var href = location.href;
			showMPLoginBox(function(){
	        	location.href=href;
	      	},$(this).data("suid"));
	      	return false;
		}
	}).on("click","#goChat,#pageChat",function(){
		if($(".products-msg").length > 0){
			sessionStorage.talkAboutStock = '{"Description":"","Url":"'+location.href+'&from=booking","PicUrl":"'+$("#productPicUrl").val()+'","Title":"'+document.title+'"}';
		}
		if($(this).hasClass("hasNewMsg")){
			var salesId = JSON.parse(sessionStorage.qiakrNewMessage)[0];
			location.href="../webim/chat.htm?salesId="+salesId;
			return false;
		}
	}).on("click","#gotoCustomer",function(){
		if(sessionStorage.isLogin == "false"){
			showMPLoginBox(function(){
	          	$("#gotoCustomer").trigger("click");
      		},$(this).data("suid"));
      		return false;
		}
	});

	// 商品搜索
	$(".searchCover").height($(this).height()-51);
	$(".searchBox.stock input[type=search]").focus(function(){
	    var box = $(this).closest(".searchBox");
    	$(".stockList").hide(); 
    	$('html').addClass('no-scroll');qkUtil.stopTouchMove();
	    box.addClass("doing").find(".s-cancel").show();
	    var searchHistory = localStorage.searchHistory ? JSON.parse(localStorage.searchHistory) : [],
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
		$('html').removeClass('no-scroll'); qkUtil.releaseTouchMove();
    	$(".searchCover").hide();
	    $(".stockList").show();
	    $(".searchBox").removeClass("doing").find(".s-cancel").hide();
	});
	$(".searchBox.stock form").submit(function(){
	    var searchHistory = localStorage.searchHistory ? JSON.parse(localStorage.searchHistory) : [];
	    var word = $(".searchBox input[type=search]").val();
	    if(word && $.inArray(word,searchHistory) < 0){
		    searchHistory.unshift(word);
		    localStorage.searchHistory = JSON.stringify(searchHistory);
	    }
	});
	$(".searchCover").on("click",".wbox-1",function(e){
		e.preventDefault();
		$('body').removeClass('no-scroll'); qkUtil.releaseTouchMove();
       	var word = $(this).text();
        $(".searchBox input[type=search]").val(word);
        $(".searchBox form").submit();
	}).on("click",".clear .btn",function(e){
		e.preventDefault();
		localStorage.searchHistory = "";
	    $(this).parent().html('<span>暂无搜索历史记录</span>').removeClass("clear").addClass("noResult").siblings().remove();
	}).on("click",".remove",function(e){
		e.preventDefault();
		var word = $(this).siblings(".wbox-1").text();
		var searchHistory = JSON.parse(localStorage.searchHistory);
		var searchHistoryNew = $.grep(searchHistory,function(item){
		    return item != word;
		});
		$(this).parent().remove();
		localStorage.searchHistory=JSON.stringify(searchHistoryNew);
	});


	$('#doSearch').click(function(){ 
		var $searchBox = $(".searchBox.stock");
		$searchBox.show();
		$searchBox.find("input[type=search]").focus();
		$searchBox.find(".s-cancel").on('click', function(){
			$searchBox.hide();
		});
	});
});


/**
 *  JS组件
 */
(function(){
	$.fn.replaceClass=function(a,b){
	    var _t = $(this);
	    if(_t.hasClass(a)){
	        _t.removeClass(a).addClass(b);
	    }else{
	        _t.removeClass(b).addClass(a);
	    }
	};
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
	};

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

	// textarea 高度自适应
	$.fn.sizeTextarea = function(){
		var _t = this,textareaTimeout;
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
};

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
            this.$el.addClass('active');
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
};
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
	buttons:[] 			//对话框中的按钮：{text:'确定', id:'alertConfirm', handler:funciton(oThis,val){}}
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
		var self = this, o = this.o, val;
		var len = o.buttons.length, btnHtml='';
		if(len){
			for(var i=0; i<len; i+=1){
				btnHtml += '<span class="msg-btn" id='+o.buttons[i].id+'>'+o.buttons[i].text+'</span>';
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
			this.$footer.remove();
		}
	},
	setPosition:function(){
		var o = this.o;
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
};
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
			cacheIns:false,
			hasCloseBtn:true,
			closeByMask:true,
			buttons: [
				{ text:'取消', id:'confBtnCancel', handler:onCancel || function(oThis){ oThis.close(); } },
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
			cacheIns:false,
			hasCloseBtn:false,
			closeByMask:true,
			hasInput:true,
			buttons: [
				{ text:'取消', id:'propBtnCancel', handler:onCancel || function(oThis){ oThis.close(); } },
				{ text:'确定', id:'propBtnConfirm', handler:onConfirm }
			]
		};

		if($.isPlainObject(title)){
			options.content = '<input type="text" tabindex="1" class="msg-prompt-ipt" placeholder="'+(title.labelTxt||'请输入')+'" value="'+(title.defaultVal||'')+'"/>';
			options = $.extend({},options,title);
		}else{
			options.title = title|| '输入';
		}
		promIns = createInstance('prompt',options);

		return promIns;
	},
	popup:function(title, content){ /*参数：标题，内容*/
		var options = {
			title: '',
			content: content || '',
			cacheIns:false,
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
			cacheIns: false,
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


// ================================
(function($){$.fn.serializeObject=function(){"use strict";var result={};var extend=function(i,element){var node=result[element.name];if('undefined'!==typeof node&&node!==null){if($.isArray(node)){node.push(element.value)}else{result[element.name]=[node,element.value]}}else{result[element.name]=element.value}};$.each(this.serializeArray(),extend);return result}})(Zepto);
