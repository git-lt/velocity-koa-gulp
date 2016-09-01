var type = "",deliveryType="",dataPage = 0,allowScroll=true;

$(".s-items li a").click(function(e){
    e.preventDefault();
    if($(this).hasClass("curr")){
        return false;
    }
    $(".s-items li a").removeClass("curr");
    $(this).addClass("curr");
    var s=$(this).data("type"),status="";
    switch(s){
		case 'unpay': 
		// 未支付
		status="1";
		deliveryType="";
		break;
		case 'unreceive': 
		// 未收货
		status="2_10";
		deliveryType = "1";
		break;
		case 'unpick': 
		// 未提货
		status="2";
		deliveryType = "2";
		break;
		case 'unreview': 
		// 待评价
		status="3";
		deliveryType="";
		break;
		case 'cancel': 
		// 已取消
		status="5";
		deliveryType="";
		break;
		default:
		status="";
		deliveryType="";
	}
	type = status;
    dataPage = 0;
    allowScroll=true;
    getOrderData(type,deliveryType,0,false);
});

// 进入页面，优先获取浏览记录
if(getUrlHash("hLength") && getUrlHash("hTop")){
	type = getUrlHash("hType");
	deliveryType = getUrlHash("dlType");
	$('.s-items a').removeClass("curr");
	$('.s-items a[data-type="'+type+'"]').addClass("curr");
	var i = 0;
	switch(type){
		case "1":
		i = 1;
		break;
		case "2_10":
		i = 2;
		break;
		case "2":
		i = 3;
		break;
		case "3":
		i = 4;
		break;
		case "5":
		i = 5;
		break;
	}
	$(".s-items a").eq(i).addClass("curr");
    getOrderData(type,deliveryType,0,false,getUrlHash("hLength"));
    dataPage = parseInt(getUrlHash("hLength"))-20;
}else{
	type = getUrlParam('status');
	$('.s-items a[data-type="'+type+'"]').click();
}

template.helper('getStatus', function (data, format) {
	if(!data) return "";
    format = getOrderStatus(data.status,data.deliveryType);
    return format;
});

function getOrderData(type,deliveryType,idx,more,length){
	if(allowScroll){
		allowScroll=false;
	    if(!more){
	        $(".orderList,.noResult").remove();
	    }
	    if($(".loading-bottom").length == 0){
	        $("body").append('<div class="loading-bottom">加载中...</div>');
	    }
	    var param={
	    	status:type,
	    	deliveryType:deliveryType,
	    	index:idx,
	    	length:length ? length.toString() : baseOption.pageSize
	    }
	    $.ajax({
	    	url: "getOrderListOfCustomer.json",
	    	type: "post",
	    	dataType: 'json',
	    	data: param,
	    	beforeSend:function(request){
		        if(window["getOrderListOfCustomer"]){
		            request.abort();
		        } else 
		        	window["getOrderListOfCustomer"] = true;
		    },
	    	success: function(data){
		        var list = data.result.orderList,dataStr = "";
		        if(list.length==0){
		        	dataStr = '<section class="noResult"><span class="order">没有订单记录</span></section>';
		        }else{
			        var tempData={
			            list : data.result.orderList
			        }
			        dataStr = template('tempData', tempData);
				}
				$(".popLoading").remove();
		        // $("body").append(dataStr);
		        $("#tempContent").html(dataStr);
		        if(length){
		            $("body").scrollTop(getUrlHash("hTop"));
		        }
		        $(".loading-bottom").remove();
		        allowScroll = data.result.all ? false : true;
		    },
		    complete:function(){
		        window["getOrderListOfCustomer"] = false;
		    },    
		    error: function () {
		        mobileAlert("系统繁忙，请稍后再试");
		    }
	    });
	}
}

$("body").on("click",".payOrder",function(e){
	var id=$(this).data("id"),payType=$(this).data("paytype");
	if($(this).hasClass("flashSale")){
		if(payType=="1"){
			location.href="alipayConfirm.htm?orderId="+id;
		}else if(payType=="2"){
			location.href="wechatPayOpenId.htm?orderId="+id;
		}else{
			mobileAlert("不支持的支付方式")
		}
	}else{
		$.getJSON("checkBeforePayOrder.json?orderId="+id,function(data){
			if(data.status=="0"){
				if(payType=="1"){
					location.href="alipayConfirm.htm?orderId="+id;
				}else if(payType=="2"){
					location.href="wechatPayOpenId.htm?orderId="+id;
				}else{
					mobileAlert("不支持的支付方式")
				}
			}else{
				mobileAlert(data.errmsg||data.msg||"系统繁忙，请稍后再试。");
			}
		});
	}
	return false;
}).on("click",".completeOrder",function(e){
	var tip = $(this).hasClass("self") ? "请在真正提到货的时候才确认\n是否确定？" : "请在真正收到货的时候才确认\n是否确定？"
	if(confirm(tip)){
		var id=$(this).data("id"),order = $(this).closest("section");
		$.getJSON("completeOrder.json?orderId="+id,function(data){
			if(data.status == "0"){
				mobileAlert("确认收货成功");
				if(type){
					order.remove();
				}else{
					getOrderData(type,deliveryType,0,false);
				}
			}
		});
	}
	return false;
}).on("click",".prepayOrder",function(e){
	sessionStorage.stockInfo = $(this).attr("data-info");
});

function gotoDetail(obj){
	if(this.event.target.nodeName != "A"){
	    var id = $(obj).data("id"),scTop = $("body").scrollTop(),length = $("section.orderList").length;
	    location.href="#hLength="+length+"&hTop="+scTop+"&hType="+type+"&dlType="+deliveryType;
	    if(/qstore/.test(location.pathname)){
	    	location.href="../mall/getOrderInfoOfCustomer.htm?orderId="+id;
	    }else{
	    	location.href="getOrderInfoOfCustomer.htm?orderId="+id;
	    }
	}
}

scrollToLoadMore({
    callback:function(){
        getOrderData(type,deliveryType,dataPage,true);
    }
});