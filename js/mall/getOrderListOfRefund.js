var status="1_2_3_4_5_80",dataPage=0,allowScroll=true;
getOrderData(status,0,false);
$(".s-items li a").click(function(e){
    e.preventDefault();
    if($(this).hasClass("curr")){
        return false;
    }
    $(".s-items li a").removeClass("curr");
    $(this).addClass("curr");
    status=$(this).data("status");
    allowScroll=true;
    dataPage = 0;
    getOrderData(status,0,false);
});

function getOrderData(status,idx,more){
	if(allowScroll){
		allowScroll=false;
	    if(!more){
	        $(".orderList,.noResult").remove();
	    }
	    if($(".loading-bottom").length == 0){
	        $("body").append('<div class="loading-bottom">加载中...</div>');
	    }
	    var param={
	    	refund:status,
	    	index:idx,
	    	length:baseOption.pageSize
	    }
	    if(status="88_99"){
	    	param.refunded="true";
	    }
	    $.getJSON("getOrderListOfCustomer.json",param,function(data){
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
	        $(".loading-bottom").remove();
	        $("body").append(dataStr);
	        allowScroll = data.result.all ? false : true;
	    });
	}
}

scrollToLoadMore({
    callback:function(){
        getOrderData(status,dataPage,true);
    }
});