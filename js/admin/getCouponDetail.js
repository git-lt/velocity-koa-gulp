document.title="洽客-优惠券"; 
$.createSecondMenu("promotion_manage","所有活动");
template.helper('statusFormat', function (data, format) {
    var arr = ["未使用","已使用","已过期"];
    format = arr[data];
    return format;
});
template.helper('typeFormat', function (data, format) {
    var arr = ["首页领券","新会员送券","买后送券","导购送券","抢红包"];
    format = arr[data];
    return format;
});

getAjaxData(0,"",Util.getUrlParam("type"));
function getAjaxData(idx,status,type){
	$("#mainTable tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		index:idx,
		length:Util.listLength,
		promotionType:type,
		couponStatus:status
	};
	jQuery.ajax({
		url:"queryCustomerCouponBySupplierId.json",
		data:options,
		success:function(data){
			var tempData={
				list:data.result.couponList
			}
			if(!data.result.couponList.length){
				$("nav .pagination").empty();
				$("#mainTable tbody").html('<tr><td class="tc" colspan="100">暂时没有此类优惠券');
				return;
			}
			var dataHtml = template('tempData', tempData);
			$("#mainTable tbody").empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getAjaxData(_i,status,type);
			});
			$("#mainTable").setTheadFixed();
		}
	});
}

if(Util.getUrlParam("type")){
	$("select[name=promotionType]").val(Util.getUrlParam("type")).trigger("change");
}

$("#listFilter").on("click",function(){
	var params = $("#filterForm").serializeObject();
	getAjaxData(0,params.couponStatus,params.promotionType);
});
