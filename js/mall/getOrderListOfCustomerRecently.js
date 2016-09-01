var OrdCusRect = function(){
	this.params = {
		startNum: 0,
		len: 7
	};
}

OrdCusRect.prototype = {
	init: function(){

		this.loadData();

		this.eventInit();
	},
	loadData: function(){
		var _this = this;
		var param = {
    		status: "",
    		deliveryType: "",
    		index: _this.params.startNum,
    		length: _this.params.len
    	};
		$.ajax({
	    	url: "getOrderListOfCustomer.json?index=0&length=7",
	    	// type: "post",
	    	// dataType: 'json',
	    	// data: param,
	    	success: function(data){
	    		if (data.status != 0) return mobileAlert("系统繁忙，请稍后再试");
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
		        $("#tempContent").html(dataStr);
		    }, 
		    error: function () {
		        mobileAlert("系统繁忙，请稍后再试");
		    }
	    });
	},
	eventInit: function(){
		$("#tempContent").on("click", ".jumpChatEvt", function(){
			var $this = $(this);
			$.ajax({
		        url: "../webim/chatCheckSalesInStore.json",
		        type: "post",
		        data: {
		            salesId: $this.attr("data-salesid"),
		            oldStoreId: $this.attr("data-storeid"),
		            orderId: $this.attr("data-orderid")
		        },
		        success: function(res){
		          //result   0正常  1换店 2离职 3未确定成单导购，转给店长 4 暂时无法提供服务 5转给其他导购
		            switch(parseInt(res.result)){
		                case 0:
		                    window.location.href = '../webim/chat.htm?salesId=' + $this.attr("data-salesid");
		                    break;
		                case 1:
		                    $.confirm( '该顾问已换其他门店，是否切换至店长咨询？', '提示', function(){
		                        if (res.storeManagerId)
		                            window.location.href = '../webim/chat.htm?salesId=' + res.storeManagerId;
		                        else
		                            return mobileAlert(res.errmsg||"暂时无法提供服务");
		                    });
		                    break;
		                case 2:
		                    $.confirm( '该顾问已离职，是否切换至店长咨询？', '提示', function(){
		                        if (res.storeManagerId)
		                            window.location.href = '../webim/chat.htm?salesId=' + res.storeManagerId;
		                        else
		                            return mobileAlert(res.errmsg||"暂时无法提供服务"); 
		                    });
		                    break; 
		                default:
		                    if (res.storeManagerId)
		                        window.location.href = '../webim/chat.htm?salesId=' + res.storeManagerId;
		                    else
		                        return mobileAlert(res.errmsg||"暂时无法提供服务"); 
		            }
		        }
		    });  
		});
	}
}

new OrdCusRect().init();


template.helper('getStatus', function (data, format) {
	if(!data) return "";
    format = getOrderStatus(data.status,data.deliveryType);
    return format;
});