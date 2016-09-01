document.title="门店导购列表";
$.createSecondMenu("store_manage","门店管理");
var storeId = Util.getUrlParam("storeId");
// 初始化获取导购列表
getDataOfSales("","",0);

// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var startTime = Util.getUnixTime($("#dateStart").val()),
		endTime = Util.getUnixTime($("#dateEnd").val());
	getDataOfSales(startTime,endTime,0);
});
$(".timeSel").on("click",function(e){
	e.preventDefault();
	var startTime = getQsTime(this),endTime = getQsTime(this,"end");
	getDataOfSales(startTime,endTime,0);
});
function getDataOfSales(startTime,endTime,idx){
	var tbody = $("#mainTable tbody");
	tbody.empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		storeId:storeId,
		startTime:startTime,
		endTime:endTime,
		index:idx,
		supplyTypeList:1,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"getSalesListOfStore.json",
		data:options,
		success:function(data){
			var tempData={
				list:data.result.salesAdminVoList
			}
			var dataHtml = template('tempData', tempData);
			tbody.empty().append(dataHtml);
			$(".filterTitle a.current .count").html('('+data.result.count+')');
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getDataOfSales(startTime,endTime,_i);
			});
			$("#mainTable").setTheadFixed();
		}
	});
}

$(document).on("click",".delSales",function(){
	var tr = $(this).closest("tr"),id=$(this).data("id");
	if(tr.siblings().length==0){
		Util.alert("门店至少保留一个导购。");
		return false;
	}
	tr.addClass("hover").siblings().removeClass("hover");
	dialog({
        title:"系统提示",
        id:"util-tip",
        fixed: true,
        content: '操作导购离职后，该导购所有绑定的粉丝将随机分配到同店其它导购，该操作<b>无法回退</b>。',
        width:300,
        okValue: '我已了解',
        cancelValue:'取消',
        backdropOpacity:"0",
        ok: function(){
        	Util.confirm("是否确定要让该导购离职？",function(){
				$.getJSON("dimissionSalesOfStore.json?storeId="+storeId+"&salesId="+id,function(data){
					if(data.status="0"){
						tr.fadeOut(300,function(){
							$(this).remove();
						});
					}
				});
			});
        },
        cancel:function(){}
    }).showModal();
});

// 迁移至店铺
var moveBox;
$(document).on("click",".moveTo",function(e){
	var _t = $(this);
	_t.closest("tr").addClass("hover").siblings().removeClass("hover");
	window.changeSalesParams={
		salesId: _t.data("id"),
		target:_t
	};
	// console.log(stockIdList);
	$.popupStoreSelect({
	    title:"迁移到门店",
	    type:"single",
	    okCallback:function(list){
	        console.log(list);
	        $.getJSON("changeSalesOfStore.json?salesId="+window.changeSalesParams.salesId+"&oldStoreId="+storeId+"&newStoreId="+list[0].id,function(data){
        		if(data.status=="0"){
        			Util.alert("迁移成功",function(){
        				getDataOfSales("","",0);
        			});
        		}else{
					Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				}
        	});
	    }
	});
});