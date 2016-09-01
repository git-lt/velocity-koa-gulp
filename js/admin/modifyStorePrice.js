document.title="商品调价";
// 获取店铺列表
(function(){
	jQuery.getJSON("getStoreList.json",function(data){
		var list = data.result.storeList,storeList = "";
		jQuery.each(list,function(i,e){
			storeList += '<option value="'+e.id+'">'+e.name+'</option>';
		});
		$("#storeList").append(storeList).select2();
	});
})();

// 获取门店价格
$("#storeList").change(function(){
	var storeId = $(this).val();
	if(storeId=="") return false;
	var param={
		"productId":$("#productId").val(),
		"storeId":storeId,
		"index":0,
		"length":300
	}
	jQuery.getJSON("queryStoreStock.json",param,function(data){
		var stock = data.result.stockVo ? data.result.stockVo.stock : [];
		$("#oldMarketPrice").text(~~stock.marketPrice);
		$("#oldTagPrice").text(~~stock.tagPrice);
		$("#marketPrice").val(~~stock.marketPrice);
		$("#tagPrice").val(~~stock.tagPrice);
	});
});

$("#submit").on("click",function(e){
	e.preventDefault();
	var storeId = $("#storeList").val();
	if(storeId == ""){
		Util.alert("请选择门店");
		return false;
	}
	var marketPrice = parseFloat($("#marketPrice").val()),
		tagPrice = parseFloat($("#tagPrice").val());
	if(!marketPrice || !tagPrice){
		Util.alert("请输入调整的价格");
		return false;
	}
	if(marketPrice<0 || tagPrice<0){
		Util.alert("请输入正数的价格");
		return false;
	}
	var param = {
		"productId":$("#productId").val(),
		"storeId":storeId,
		"marketPrice":marketPrice,
		"tagPrice":tagPrice
	}
	jQuery.getJSON("modifyStorePrice.json",param,function(data){
		if(data.status="0"){
			$("#oldMarketPrice").text(marketPrice);
			$("#oldTagPrice").text(tagPrice);
			Util.alert("调价成功");
		}
	});
})