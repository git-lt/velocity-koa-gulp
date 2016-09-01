var storeId = Util.getUrlParam("storeId");
// 初始化获取导购列表
getDataOfSales("","",0);
var type = "sales";
$(".filterTitle>a").on("click",function(e){
	e.preventDefault();
	if($(this).hasClass("current")) return false;
	$(this).addClass("current").siblings().removeClass("current");
	type = $(this).data("type");
	$(".tableWrap").hide();
	$("#table-"+type).show();
	if(type == "sales"){
		if($("#table-sales").hasClass("loaded")){
			return false;
		}
		getDataOfSales("","",0);
	}else if(type == "order"){
		if($("#table-order").hasClass("loaded")){
			return false;
		}
		getDataOfOrder("","",0);
	}else if(type == "stock"){
		if($("#table-stock").hasClass("loaded")){
			return false;
		}
		getDataOfStock("","",0);
	}
});

// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var startTime = Util.getUnixTime($("#dateStart").val()),
		endTime = Util.getUnixTime($("#dateEnd").val());
	if(type == "sales"){
		getDataOfSales(startTime,endTime,0);
	}else if(type == "order"){
		getDataOfOrder(startTime,endTime,0);
	}else if(type == "stock"){
		getDataOfStock(startTime,endTime,0);
	}
});
$(".timeSel").on("click",function(e){
	e.preventDefault();
	var startTime = getQsTime(this),endTime = getQsTime(this,"end");
	if(type == "sales"){
		getDataOfSales(startTime,endTime,0);
	}else if(type == "order"){
		getDataOfOrder(startTime,endTime,0);
	}else if(type == "stock"){
		getDataOfStock(startTime,endTime,0);
	}
});
function getDataOfSales(startTime,endTime,idx){
	var tbody = $("#table-sales .table tbody"),page = $("#table-sales nav .pagination");
	tbody.empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	page.empty();
	var options={
		storeId:storeId,
		startTime:startTime,
		endTime:endTime,
		index:idx,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"getSalesListOfStore.json",
		data:options,
		success:function(data){
			var list=data.result.salesAdminVoList,dataHtml = "";
			jQuery.each(list,function(i,e){
				dataHtml+='<tr>\
					<td class="human">\
						<a class="img fn-left"><img src="'+(e.avatar ? e.avatar : "../images/admin/default-photo.png")+'" alt=""></a>\
						<a class="name fn-left">'+e.name+'</a>\
					</td>\
					<td>'+e.orderCount+'</td>\
					<td><span class="red">￥'+e.saleroom+'</span></td>\
					<td>'+e.newCustomerCount+'</td>\
					<td>'+e.totalCustomerCount+'</td>\
					<td>'+e.disableCustomerCount+'</td>'+
					// '<td><div class="listAction">'+
					// 	'<div><a class="delSales" href="#" data-id="'+e.salesId+'">删除</a></div>'+
					// '</div></td>'+
				'</tr>';
			});
			tbody.empty().append(dataHtml);
			$("#table-sales").addClass("loaded");
			if(!$(".filterTitle a.current .count").html()){
				$(".filterTitle a.current .count").html('('+data.result.count+')');
			}
			Util.createPagination(data.result.count,idx,$("#table-sales .pagination"),function(_i){
				getDataOfSales(startTime,endTime,_i);
			});
		}
	});
}
function getDataOfStock(startTime,endTime,idx){
	var tbody = $("#table-stock .table tbody"),page = $("#table-stock nav .pagination");
	tbody.empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	page.empty();
	var options={
		storeId:storeId,
		startTime:startTime,
		endTime:endTime,
		index:idx,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"queryStoreAllStock.json",
		data:options,
		success:function(data){
			var list=data.result.stockVoList,dataHtml = "";
			jQuery.each(list,function(i,e){
				dataHtml+='<tr>\
					<td>\
						<a class="img fn-left">'+(e.stock.productPicUrl ? ('<img src="'+e.stock.productPicUrl+'">') : "")+'</a>\
						<a class="name fn-left">'+e.stock.productName+'</a>\
						<div class="msg">'+
							(e.productSupplier.tags ? ('<span class="tags" data-id="'+e.product.id+'" title="点击取消标签">'+e.productSupplier.tags+'</span>') : "")+
						'款号: '+e.product.productCode+'</div>\
					</td>\
					<td><span class="red">￥'+e.stock.marketPrice+'</span></td>\
					<td><span class="red">￥'+e.stock.tagPrice+'</span></td>\
					// <td>'+e.stock.count+'</td>'+
					'<td>'+e.stock.shoppingCount+'</td>'+
					'<td>'+Util.getLocalTime(e.stock.onShelvesTime)+'</td>\
				</tr>';
			});
			tbody.empty().append(dataHtml);
			$("#table-stock").addClass("loaded");
			if(!$(".filterTitle a.current .count").html()){
				$(".filterTitle a.current .count").html('('+data.result.count+')');
			}
			Util.createPagination(data.result.count,idx,$("#table-stock .pagination"),function(_i){
				getDataOfStock(startTime,endTime,_i);
			});
		}
	});
}
function getDataOfOrder(startTime,endTime,idx){
	var tbody = $("#table-order .table tbody"),page = $("#table-order nav .pagination");
	tbody.empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	page.empty();
	var options={
		storeId:storeId,
		gmtCreateStart:startTime,
		gmtCreateEnd:endTime,
		index:idx,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"getOrderListOfSupplier.json",
		data:options,
		success:function(data){
			var list=data.result.orderList,dataHtml = "";
			jQuery.each(list,function(i,e){
				dataHtml+='<tr><td>';
				jQuery.each(e.orderItemList,function(j,t){
					dataHtml+='<a class="img fn-left">'+(t.productPicUrl ? '<img src="'+t.productPicUrl+'"/>' : '')+'</a>';
				});
				dataHtml += '</td>\
					<td><div class="widthLimit">'+e.customer.name+'</div></td>\
					<td>'+Util.getLocalTime(e.customerOrder.gmtCreate)+'</td>\
					<td><span class="red">￥'+e.customerOrder.payment+'</span></td>\
					<td>'+getOrderStatus(e.customerOrder.status)+'</td>\
					<td>'+(e.sales ? e.sales.name : "无")+'</td>\
				</tr>';
			});
			tbody.empty().append(dataHtml);
			$("#table-order").addClass("loaded");
			if(!$(".filterTitle a.current .count").html()){
				$(".filterTitle a.current .count").html('('+data.result.count+')');
			}
			Util.createPagination(data.result.count,idx,$("#table-order .pagination"),function(_i){
				getDataOfOrder(startTime,endTime,_i);
			});
		}
	});
}
function getOrderStatus(code){
	var status = "";
	switch(code){
		case 1 : 
		status="待付款";
		break;
		case 2 :
		status="已发货";
		break;
		case 10 :
		status="待发货";
		break;
		case 3 :
		status="待评价";
		break;
		case 4 :
		status="已评价";
		break;
	}
	return status;
}

$(document).on("click",".delSales",function(e){
	e.preventDefault();
	var tr = $(this).closest("tr"),id=$(this).data("id");
	Util.confirm("该操作不可还原，是否确认删除？",function(){
		$.getJSON("dimissionSalesOfStore.json?storeId="+storeId+"&salesId="+id,function(data){
			if(data.status="0"){
				tr.fadeOut(300);
			}
		});
	});
});