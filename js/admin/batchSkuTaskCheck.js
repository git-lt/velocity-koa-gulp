var menuCurrent = "product_manage";
document.title="批量修改库存价格"; 
var taskId = Util.getUrlParam("taskId");
var resList;
jQuery.getJSON("getBatchFileTaskItemList.json?taskId="+taskId,function(data){
	var tempData={
		lists:data.result.okItemList
	}
	resList = data.result.okItemList;
	var okDataHtml = template('tempData', tempData);
	$("#okTable tbody").html(okDataHtml);

	var errorList=data.result.errorItemList,errorDataHtml = "";
	if(errorList.length > 0){
		jQuery.each(errorList,function(i,e){
			errorDataHtml+='<tr>\
				<td>'+e.line+'</td>\
				<td>'+e.error+'</td>\
			</tr>';
		});
		$("#errorTable tbody").empty().append(errorDataHtml);
		$("#errorList").show();
	}
});

$("#submit").on("click",function(e){
	e.preventDefault();
	var url = Util.getUrlParam("fileType") == "2" ? "commitBatchFileTask.json" : "commitBatchFileTaskSkuPriceByProductCode.json";
	$.getJSON(url,{taskId:taskId},function(data){
		if(data.status=="0"){
			Util.alert(data.result.batchFileTask.msg,function(){
				location.href="querySupplierStock.htm";
			});
		}
	});
});