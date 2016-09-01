$.createSecondMenu("store_manage","门店管理");
document.title="门店商品列表";
var storeId = Util.getUrlParam("storeId");
// 初始化获取导购列表
getDataOfStock(0,"","","","",0);
$("#selectBrand").select2();
$(".filterTitle>a").on("click",function(e){
	e.preventDefault();
	if($(this).hasClass("current")) return false;
	$(this).addClass("current").siblings().removeClass("current");
	var status = $(this).data("status"),storeTags="";
	if(status == "0"){
		$("#offShelvesBtn,#onShellTimeTitle").show();
		$("#onShelvesBtn,#offShellTimeTitle").hide();
	}else if(status == "1"){
		$("#offShelvesBtn,#onShellTimeTitle").hide();
		$("#onShelvesBtn,#offShellTimeTitle").show();
	}else if(status == "99"){
		$("#onShellTimeTitle").show();
		$("#onShelvesBtn,#offShellTimeTitle,#offShelvesBtn").hide();
		status=0;
		storeTags = "置顶"
	}
	getDataOfStock(status,"","","","",0,storeTags);
});

// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var startTime = Util.getUnixTime($("#dateStart").val()),
		endTime = Util.getUnixTime($("#dateEnd").val()),
		name = $("#fuzzyProductName").val(),
		brandId = $("#selectBrand").val();
	getDataOfStock($(".filterTitle a.current").data("status"),name,brandId,startTime,endTime,0);
});
$(".timeSel").on("click",function(e){
	e.preventDefault();
	var startTime = getQsTime(this),endTime = getQsTime(this,"end");
	getDataOfStock($(".filterTitle a.current").data("status"),"","",startTime,endTime,0);
});
function getDataOfStock(off,fuzzyName,brandId,startTime,endTime,idx,storeTags){
	var tbody = $("#mainTable tbody");
	tbody.empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	$("#checkAll").prop("checked",false);
	var options={
		off:off,
		fuzzyName:fuzzyName,
		brandId:brandId,
		storeId:storeId,
		offStartTime:startTime,
		offEndTime:endTime,
		supplyTypeList:"1_3",
		storeTags:storeTags,
		index:idx,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"queryStoreAllStock.json",
		data:options,
		type:'POST',
		success:function(data){
			var dataHtml = "";
			if(data.result.stockVoList.length > 0){
				var tempData={
					list:data.result.stockVoList,
					off:off
				}
				dataHtml = template('tempData', tempData);
			}else{
				dataHtml = '<tr><td class="tc" colspan="100">列表为空</td></tr>';
			}
			tbody.empty().append(dataHtml);
			$(".filterTitle a.current .count").html('('+data.result.count+')');
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getDataOfStock(off,fuzzyName,brandId,startTime,endTime,_i,storeTags);
			});
			$("#mainTable").setTheadFixed({
				leaveTop: 64,
				fixedFn:function(){
					$(".tableAction").css({"position":"fixed","top":"0"});
					$("#mainTable").css("margin-top","64px");
				},
				unfixedFn:function(){
					$(".tableAction").css({"position":"static","top":"0"});
					$("#mainTable").css("margin-top","0");
				}
			});
		}
	});
}
// 批量上下架
$("#onShelvesBtn, #offShelvesBtn").on("click",function(e){
	var seld = $("#mainTable tbody").find("input[name=select]:checked"),off = this.id=="onShelvesBtn" ? 0 : 1;
	if(seld.length == 0){
		Util.alert("请至少选择一件商品")
	}else{
		var seldArr=[];
		seld.each(function(i,e){
			seldArr.push($(e).data("stockid"))
		});
		var productIdList=seldArr.join("_");
		if(off==1){
			Util.confirm("是否确认下架所选商品？",function(){
				$.getJSON("allocateProductToStore.json?stockIdList="+productIdList+"&storeIdList="+storeId+"&off=1",function(data){
					if(data.status=="0"){
						getDataOfStock(0,"","","","",0);
						Util.alert("下架成功");
					}else{
						Util.alert(data.msg ?　data.msg : "系统繁忙，请稍后再试")
					}
				});
			});
		}else{
			$.getJSON("allocateProductToStore.json?stockIdList="+productIdList+"&storeIdList="+storeId+"&off=0",function(data){
				if(data.status=="0"){
					getDataOfStock(1,"","","","",0);
					Util.alert("上架成功");
				}else{
					Util.alert(data.msg ?　data.msg : "系统繁忙，请稍后再试")
				}
			});
		}
		
	}
});
// 单独上下架
$("#mainTable").on("click",".onShelves",function(e){
	var status=$(this).data("status"),id=$(this).data("stockid"),tr=$(this).closest("tr");
	if(status=="0"){
		Util.confirm("是否确认下架该商品？",function(){
			$.getJSON("allocateProductToStore.json?stockIdList="+id+"&storeIdList="+storeId+"&off=1",function(data){
				if(data.status=="0"){
					tr.fadeOut(500);
					var oldCount = $(".filterTitle a.current .count").html().replace(/[()]/g,"");
					$(".filterTitle a.current .count").html('('+ (~~oldCount-1)+')');
				}else{
					Util.alert(data.msg ?　data.msg : "系统繁忙，请稍后再试")
				}
			})
		})
	}else{
		$.getJSON("allocateProductToStore.json?stockIdList="+id+"&storeIdList="+storeId+"&off=0",function(data){
			if(data.status=="0"){
				tr.fadeOut(500);
				var oldCount = $(".filterTitle a.current .count").html().replace(/[()]/g,"");
				$(".filterTitle a.current .count").html('('+ (~~oldCount-1)+')');
			}else{
				Util.alert(data.msg ?　data.msg : "系统繁忙，请稍后再试")
			}
		})
	}
	
}).on("click",".setStoreTags",function(e){
	var _t = $(this);
	var status = _t.data("status")=="置顶" ? "" : "置顶";
	var param={
		stockIdList:_t.data("id"),
		storeTags:status,
		storeId:storeId
	}
	$.ajax({
		url:"setStoreStockTag.json",
		data:param,
		success:function(data){
			if(data.status=="0"){
				if(status=="置顶"){
					_t.html("取消推荐").data("status","置顶");
					Util.alert("推荐成功（每家店最多设置6个）");
				}else{
					_t.html("店长推荐").data("status","");
					Util.alert("取消成功");
					if($(".filterTitle .current").index()=="2"){
						_t.closest("tr").fadeOut();
					}
				}
			}else{
				Util.alert(data.msg ? data.msg : "系统繁忙，请稍后再试")
			}
		}
	})
})
// 调价
var modifyPriceBox;
$("#mainTable").on("click",".modifyStorePrice",function(e){
	var tr = $(this).closest("tr"),stockId=$(this).data("id"),productId=$(this).data("pid");
	tr.addClass("hover").siblings().removeClass("hover");
	var param={
		"productId":productId,
		"storeId":storeId,
		"index":0,
		"length":300
	}
	jQuery.getJSON("queryStoreStock.json",param,function(data){
		var vo = data.result.stockVo;
		var stock = vo ? vo.stock : [],
			sku = vo.nativeStockSkuVoList,
			skuString = "";
		$("#norms1Name").html(Util.getNormsName[vo.productSupplier.norms1Id]);
		$("#norms2Name").html(Util.getNormsName[vo.productSupplier.norms2Id]);
		$.each(sku,function(i,e){
			skuString += '<tr data-id="'+e.stockSku.skuId+'">\
				<td>'+e.productSku.color+'</td>\
				<td>'+e.productSku.size+'</td>\
				<td>￥'+e.stockSku.skuPrice.toFixed(2)+'</td>\
				<td><input type="text" class="min price" value="'+e.stockSku.skuPrice.toFixed(2)+'"></td>'+
				($("#useStoreStock").val() == "0" ? ('<td><input type="text" class="min count" value="'+e.stockSku.skuCount+'"></td>') : '')+
			'</tr>';
		});
		$("#skuPriceWrap").html(skuString);
		modifyPriceBox = dialog({
	        title:"调整价格",
	        id:"util-modifyPrice",
	        fixed: true,
	        content: $("#priceDialog"),
	        width:500,
	        okValue: '确定',
	        cancelValue:'取消',
	        backdropOpacity:"0",
	        ok: function () {
				var tagPrice = $(".ui-dialog .tagPrice").val();
				if(!tagPrice || parseFloat(tagPrice) <= 0){
					Util.alert("请输入正确的吊牌价");
					return false;
				}
				var priceFormat = true,stockSkuListJson=[];
				$("#skuPriceWrap tr").each(function(i,e){
					// stockSkuListJson.push('{"skuId":'+$(e).data("id")+',"skuPrice":'+$(e).find(".price").val()+($("#useStoreStock").val() == 0 ? (',"skuCount":'+$(e).find(".price").val()))+'}')
					if($("#useStoreStock").val() == "0"){
						stockSkuListJson.push({
							skuId: $(e).data("id"),
							skuPrice: $(e).find(".price").val(),
							skuCount:$(e).find(".count").val()
						});
					}else{
						stockSkuListJson.push({
							skuId: $(e).data("id"),
							skuPrice: $(e).find(".price").val()
						});
					}
					if(!$(e).find(".price").val() || parseFloat($(e).val()) <= 0){
						priceFormat=false;
						return false;
					}
				});
				if(!priceFormat){
					Util.alert("请输入正确的价格");
					return false;
				}
				var param = {
					"productId":productId,
					"storeId":storeId,
					"tagPrice":tagPrice,
					"stockSkuListJson":JSON.stringify(stockSkuListJson)
				}
				jQuery.getJSON("modifyStorePrice.json",param,function(data){
					if(data.status="0"){
						Util.alert("调价成功");
					}
				});
	        },
	        cancel:function(){
	        }
	    }).showModal();
		$("#editPriceBatchBtn").on("click",function(){
            var price = parseFloat($("#editPriceBatchIpt").val()).toFixed(2);
            if(price == "NaN" || price<=0) {
                Util.alert("请输入正确的价格");
                return false;
            }
            $("#skuPriceWrap .price").val(price);
        });
		$(".ui-dialog .oldTagPrice").text(stock.tagPrice.toFixed(2));
		$(".ui-dialog .tagPrice").val(stock.tagPrice.toFixed(2));
	});
	
});
// 获取门店价格
$(document).on("change",".storeList",function(){
	var storeId = $(this).val(), productId=$(this).data("pid");
	if(storeId=="") return false;
	var param={
		"productId":productId,
		"storeId":storeId,
		"index":0,
		"length":300
	}
	jQuery.getJSON("queryStoreStock.json",param,function(data){
		var stock = data.result.stockVo ? data.result.stockVo.stock : [];
		$(".ui-dialog .oldMarketPrice").text(~~stock.marketPrice);
		$(".ui-dialog .oldTagPrice").text(~~stock.tagPrice);
	});
});
// 全选
$("body").on("click","#checkAll",function(){
	var checkedList = $("#mainTable tbody").find("input[name=select]");
	if(checkedList.not(":checked").length > 0){
		checkedList.prop("checked",true);
	}else{
		checkedList.prop("checked",false);
	}
});