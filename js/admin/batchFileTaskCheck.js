var menuCurrent = "product_manage";
document.title="批量导入商品"; 
var taskId = Util.getUrlParam("taskId");

jQuery.post("getBatchFileTaskItemCreateList.json?taskId="+taskId,function(data){
	var okList=data.result.okItemList, okDataHtml = "";
	var errorList=data.result.errorItemList,errorDataHtml = "";

	$('#N1Name').text(data.result.norms1Name);
	$('#N2Name').text(data.result.norms2Name);

	jQuery.each(okList,function(i,e){
		okDataHtml+='<tr>\
			<td>'+e.batchProductName+'</td>\
			<td>'+e.batchBrandName+'</td>\
			<td>'+e.batchProductCode+'</td>\
			<td>'+e.batchShapeCode+'</td>\
			<td class="hover">'+e.batchColor+'</td>\
			<td>'+e.batchSize+'</td>\
			<td class="hover">'+e.batchCategoryName+'</td>\
			<td class="hover">'+e.batchSkuPrice+'</td>\
			<td class="hover">'+e.batchTagPrice+'</td>\
			<td class="hover">'+e.batchSkuCount+'</td>\
		</tr>';
	});
	$("#okTable tbody").html(okDataHtml);

	if(errorList.length > 0){
		for(var i=0; i<errorList.length; i++){
			errorDataHtml+='<tr>\
				<td class="c-rd">'+errorList[i].line+'</td>\
				<td class="c-rd">'+errorList[i].error+'</td>\
			</tr>';
		}
		$("#errorTable tbody").html(errorDataHtml);
		$("#errorList").show();
	}
});

$("#submit").on("click",function(e){
	e.preventDefault();
	$.getJSON("commitBatchFileTaskCreate.json?taskId="+taskId,function(data){
		if(data.status=="0"){
			Util.alert(data.result.batchFileTask.msg,function(){
				location.href="batchFileTask.htm";
			});
		}
	});
});

//打开对话框提示错误修改方式
var errDia=null; 
$('#showErrorTipDia').on('click', function(){
	errDia=dialog({
		id:"errTipDia",
		fixed: true,
		content: $('#errTipDia')[0],
		width:700,
		backdropOpacity:"0.5"
	}).showModal();
});

// 关闭对话框
$('#btnSure').on('click', function(){
	errDia && errDia.close();
});