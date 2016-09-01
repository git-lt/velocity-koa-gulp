var promotionType=Util.getUrlParam("type");

template.helper('getlength', function (data, format) {
	if(!data) return "";
    format = JSON.parse(data).length;
    return format;
});
if(promotionType == '3'){
	getAjaxData(0);
}else{
	getAjaxData(0,0);
}
function getAjaxData(idx,status){
	$(".table tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		index:idx,
		length:Util.listLength,
		promotionType:Util.getUrlParam("type"),
		processing:status   //0=进行中，1=未开始，2=已结束
	};
	jQuery.ajax({
		url:"queryCouponPromotionBySupplierId.json",
		data:options,
		success:function(data){
			var tempData={
				list:data.result.couponList,
				now:new Date().getTime()
			}
			if(!data.result.couponList.length){
				$("nav .pagination").empty();
				$(".table tbody").html('<tr><td class="tc" colspan="100">暂时没有相关活动,<a href="createCouponPromotion.htm?type='+promotionType+'">点击创建</a></td></tr>');
				return;
			}
			var dataHtml = template('tempData', tempData);
			$(".table tbody").empty().append(dataHtml);
			$(".filterTitle a.current .count").html('('+data.result.count+')');
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getAjaxData(_i,status);
			});
			$("#mainTable").setTheadFixed();
		}
	});
}

$(".filterTitle>a").on("click",function(e){
	e.preventDefault();
	if($(this).hasClass("current")) return false;
	$(this).addClass("current").siblings().removeClass("current");
	var status = $(this).data("status");
	getAjaxData(0,status);
});

$("#mainTable").on("click",".closePro",function(e){
	var _t = $(this), id = _t.data("id");
	Util.confirm("确定中途结束活动？",function(){
		$.getJSON("closeCouponPromotion.json?couponPromotionId="+id,function(data){
			if(data.status=="0"){
				_t.replaceWith('<span class="c-9">活动已结束</span>');
			}
		});
	},function(){});
}).on("click",".closeProOfSales",function(e){
	var _t = $(this), id = _t.data("id");
	Util.confirm("结束活动后，此次发放给导购的未使用的优惠券将失效，是否确定结束活动？",function(){
		$.getJSON("cancelSalesCouponPromotion.json?couponPromotionId="+id,function(data){
			if(data.status=="0"){
				_t.replaceWith('<span class="c-9">活动已结束</span>');
			}
		});
	},function(){});
});