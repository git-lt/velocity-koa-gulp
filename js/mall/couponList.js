getAjaxData(0)
function getAjaxData(idx){
    $(".loadingBox a").html("正在加载中···");
	var param={
        storeId : getUrlParam("storeId"),
		index : idx,
		length : baseOption.pageSize
	};
	$.getJSON("getHomePageCouponListBySupplier.json",param,function(data){
		if(data.status=="0"){
			var list = data.result.coupon,listStr = "";
            if(list.length == 0){
                listStr = '<div class="noResult"><span>暂时没有优惠券可领</span></div>';
            }else{
                $(".loadingBox").show();
    			var tempData={
                    list : data.result.coupon
                }
                listStr = template('tempData', tempData);
            }
			$("#couponList").append(listStr);
			if(data.result.all){
				$(".loadingBox a").html("没有更多了").off();
			}else{
				$(".loadingBox a").html("点击查看更多").off().on("click",function(e){
					e.preventDefault();
			    	getAjaxData((idx + ~~baseOption.pageSize));
			    });
			}
		}
	});
}

$("#couponList").on("click",".item",function(e){
    var _t = $(this),id=_t.data("id");
    $.getJSON("gainCoupon.json?couponPromotionId="+id,function(data){
        if(data.status=="0"){
            mobileToast("成功领取优惠券<br>请至“我的账户-我的优惠券”栏目查看",2500);
            setTimeout(function(){
                _t.find(".use").html("已领取");
            },2500);
        }else{
            mobileToast(data.errmsg);
        }
    })
})