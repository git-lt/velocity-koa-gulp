var menuCurrent = "product_manage";
document.title="批量导入商品"; 

$('#fileUpload').singleFileUploader();
var openedApi = false;

$.getJSON("getSupplierApiInfo.json",function(data){
    if(data.result.openType==1){
        openedApi=true;
    }
});

$(".submit").on("click",function(e){
	if($(this).hasClass("disabled")){
		Util.alert("请先上传.csv文件");
		return false;
	} 
	var url = $("#fileUrl").val();
	if(url == ""){
		Util.alert("请重新上传.csv文件");
	}else{
		$.getJSON("createBatchFileTask.json?fileUrl="+url+"&fileType=1",function(data){
			// Util.alert("系统正在导入，请稍后查看导入信息。");
            dialog({
                id:"util-uploading",
                fixed: true,
                content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;文件正在导入处理中，请勿离开页面',
                width:300,
                backdropOpacity:"0.5"
            }).showModal();

            var getLastTask = setInterval(function(){
                $.getJSON("getLastBatchFileTask.json?taskId="+data.result.batchFileTask.id,function(data2){
                    var status = data2.result.batchFileTask ? data2.result.batchFileTask.status : "empty";
                    if(status == 20){
                        clearInterval(getLastTask);
                        location.href="batchFileTaskCheck.htm?taskId="+data2.result.batchFileTask.id;
                    }else if(status == 4){
                        clearInterval(getLastTask);
                        Util.alert(data2.result.batchFileTask.msg ? data2.result.batchFileTask.msg : "导入出错，请检查格式或稍后重试");
                        dialog({ id:"util-uploading" }).close();
                    }
                });
            },2000);

		});
	}
});
$(".filterTitle a").on("click",function(){
    if($(this).hasClass("current")) return false;
    $(this).addClass("current").siblings().removeClass("current");
    var status=$(this).data("status");
    location.href="#type-"+status;
    $(".minContainer:eq("+~~status+")").show().siblings(".minContainer").hide();
});
$("#useXingxingTool").on("click",function(e){
    e.preventDefault();
    if(openedApi){
        window.open($(this).attr("href"));
    }else{
        dialog({
            title:"您暂未开启API接口",
            id:"util-alert",
            fixed: true,
            content: '该工具需调用您的商品创建接口，以便实现商品搬家功能。',
            width:300,
            cancelValue:'取消',
            okValue: '去开启洽客API接口',
            backdropOpacity:"0.5",
            ok: function () {
                location.href="developSetting.htm";
            },
            cancel:function(){}
        }).showModal();
    }
})

if(location.hash){
    var type = location.hash.split("-")[1];
    $(".filterTitle a:eq("+~~type+")").trigger("click");
}