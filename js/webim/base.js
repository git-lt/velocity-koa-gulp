var Base = {
	// 隐藏微信右上角菜单项
	hideOptionMenu:function(){
		if (typeof WeixinJSBridge == "undefined"){
          	if( document.addEventListener ){
              	document.addEventListener('WeixinJSBridgeReady', function(){WeixinJSBridge.call('hideOptionMenu');}, false);
          	}else if (document.attachEvent){
              	document.attachEvent('WeixinJSBridgeReady', function(){WeixinJSBridge.call('hideOptionMenu');});
              	document.attachEvent('onWeixinJSBridgeReady', function(){WeixinJSBridge.call('hideOptionMenu');});
          	}
      	}else {
          	WeixinJSBridge.call('hideOptionMenu');
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
	}
};