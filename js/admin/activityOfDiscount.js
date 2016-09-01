document.title="洽客-满减满折"; 
$.createSecondMenu("promotion_manage","满减满折");

var promotionType=Util.getUrlParam("type");
template.helper('getlength', function (data, format) {
	if(!data) return "";
    format = JSON.parse(data).length;
    return format;
});
getAjaxData(0,0);

function getAjaxData(idx,status){
	$(".table tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		index:idx,
		length:Util.listLength,
		processing:status   //0=进行中，1=未开始，2=已结束
	};
	jQuery.ajax({
		url:"getDiscountPromotionVoList.json",
		data:options,
		success:function(data){
			if(!data.result.discountPromotionVoList || data.result.discountPromotionVoList.length==0){
				$("nav .pagination").empty();
				$(".filterTitle a.current .count").empty();
				$(".table tbody").html('<tr><td class="tc" colspan="100">暂时没有相关活动</td></tr>');
				return false;
			}
			var tempData={
				list:data.result.discountPromotionVoList,
				status:status
			}
			var dataHtml = template('tempData', tempData);
			$(".table tbody").html(dataHtml);
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

$("#mainTable").on("click",".closePromotion",function(e){
	var _t = $(this), id = _t.data("id");
	Util.confirm("确定中途结束活动？",function(){
		$.getJSON("stopDiscountPromotion.json?discountPromotionId="+id,function(data){
			if(data.status=="0"){
				_t.replaceWith('<span class="c-9">活动已结束</span>');
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		});
	},function(){});
});