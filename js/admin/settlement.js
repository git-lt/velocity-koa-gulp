document.title="财务结算"; 

// 展开
$(".table tbody").on("click",".detail",function(e){
	e.preventDefault();
	var detail = $(this).closest("tr").next(".itemDetail");
	if(detail.is(":visible")){
		detail.hide();
		$(this).text("展开");
	}else{
		detail.show();
		$(this).text("收起");
	}
});

$("#chargeExplain").on("click",function(e){
	dialog({
        title:"结算说明",
        id:"util-chargeExplain",
        fixed: true,
        content: $(".chargeExplain"),
        width:600,
        okValue: '确定',
        backdropOpacity:"0",
        ok: function () {}
    }).showModal();
});

getDataOfSettlement(0);
function getDataOfSettlement(idx){
	var tbody = $(".table tbody");
	tbody.empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		index:idx,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"getSettlementOfSupplier.json",
		data:options,
		success:function(data){
			var tempData={
				list:data.result.settlementList,
				status:status
			}
			var dataHtml = template('tempData', tempData);
			tbody.empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getDataOfSettlement(_i);
			});
		}
	});
}