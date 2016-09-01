document.title="商品调拨";
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

// 获取门店库存
$("#storeList").change(function(){
	var storeId = $(this).val();
	$(".table .store").empty();
	if(storeId=="") return false;
	var param={
		"productId":$("#productId").val(),
		"storeId":storeId,
		"index":0,
		"length":300
	}
	jQuery.getJSON("queryStoreStock.json",param,function(data){
		var list = data.result.stockVo ? data.result.stockVo.stockSkuVoList : [];
		if(list.length==0){
			$(".table tr").each(function(j,t){
				$(t).find(".store").text("0");
			});
			return false;
		}
		jQuery.each(list,function(i,e){
			var id = e.stockSku.skuId, val=e.stockSku.skuCount;
			$(".table tr").each(function(j,t){
				if($(t).data("id") == id){
					$(t).find(".store").text(val);
					return;
				}
			})
		})
	});
});

$("#submit").on("click",function(e){
	e.preventDefault();
	var storeId = $("#storeList").val(),skuArr=[],totalAc=0,noAccount=false,illegal=false;
	if(storeId == ""){
		Util.alert("请选择门店");
		return false;
	}
	$(".acNum").each(function(i,e){
		var item={
			skuCount:~~$(e).val(),
			skuId:$(e).closest("tr").data("id")
		};
		if(item.skuCount < 0){
			illegal = true;
			return false;
		}
		if(item.skuCount > ~~$(e).closest("tr").find(".total").text()){
			noAccount = true;
			return false;
		}
		totalAc += item.skuCount;
		skuArr.push(item);
	});
	if(noAccount){
		Util.alert("要调拨的商品数量不能大于总库库存");
		return false;
	}
	if(illegal){
		Util.alert("请输入正数的库存数量");
		return false;
	}
	// if(totalAc == 0){
	// 	Util.alert("请输入调拨数量");
	// 	return false;
	// }
	var param = {
		"productId":$("#productId").val(),
		"storeId":storeId,
		"supplierStockId": Util.getUrlParam("stockId"),
		"stockSkuListJson":JSON.stringify(skuArr)
	}
	jQuery.getJSON("allocateStock.json",param,function(data){
		if(data.status="0"){
			$(".acNum").each(function(i,e){
				var tr = $(e).closest("tr"),
					val = ~~$(e).val(),
					total = ~~tr.find(".total").text(),
					store = ~~tr.find(".store").text();
				tr.find(".total").text(total-val);
				tr.find(".store").text(store+val);
			});
			Util.alert("调拨成功");
		}
	});
})