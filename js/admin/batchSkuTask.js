var menuCurrent = "product_manage";
document.title="批量修改库存价格"; 
var fileType = "2";

$('#fileUpload').singleFileUploader();

$(".filterTitle>a").on("click",function(e){
    e.preventDefault();
    if($(this).hasClass("current")) return false;
    $(this).addClass("current").siblings().removeClass("current");
    $("#fileUrl").val("");
    $("#loadedFileName").empty();
    $(".submit").addClass("disabled");
    if($(this).index() == 0){
        fileType = "2";
        $("#skuCode").show();
        $("#productCode").hide();
    }else{
        fileType = "5";
        $("#skuCode").hide();
        $("#productCode").show();
    }
});
if(Util.getUrlParam("type")=="code"){
    $(".filterTitle a:eq(1)").trigger("click");
}

$(".submit").on("click",function(e){
	if($(this).hasClass("disabled")){
		Util.alert("请先上传.csv文件");
		return false;
	} 
	var url = $("#fileUrl").val();
	if(url == ""){
		Util.alert("请重新上传.csv文件");
	}else{
		$.getJSON("createBatchFileTask.json?fileUrl="+url+"&fileType="+fileType,function(data){
			dialog({
                id:"util-uploading",
                fixed: true,
                content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>文件正在导入处理中，请勿离开页面',
                width:300,
                backdropOpacity:"0.5"
            }).showModal();
            var getLastTask = setInterval(function(){
                $.getJSON("getLastBatchFileTask.json?taskId="+data.result.batchFileTask.id,function(data){
                    var status = data.result.batchFileTask ? data.result.batchFileTask.status : "empty";
                    if(status == 20){
                        clearInterval(getLastTask);
                        location.href="batchSkuTaskCheck.htm?taskId="+data.result.batchFileTask.id+"&fileType="+fileType;
                    }else if(status == 4){
                        clearInterval(getLastTask);
                        Util.alert(data.result.batchFileTask.msg || "导入出错，请稍后重试",function(){
                            location.reload();
                        });
                    }
                });
            },2000);
		});
	}
});

$("#batchTask").on("click",function(){
    dialog({
        title:"请选择批量方式",
        id:"util-batchTask",
        fixed: true,
        backdropOpacity:"0.5",
        content: $("#batchTaskBox"),
        okValue: '',
        cancelValue:''
    }).showModal();
});
var url=window.location.search;
if(url==""){
    $("#bulkTypeOne").removeClass("hide");
    $("#bulkTypeTwo").addClass("hide");
    $("#skuCode").removeClass("hide");
    $("#productCode").addClass("hide");
}else{
    $("#bulkTypeOne").addClass("hide");
    $("#bulkTypeTwo").removeClass("hide");
    $("#skuCode").addClass("hide");
    $("#productCode").removeClass("hide");
}
