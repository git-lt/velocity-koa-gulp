define(['utils'],function(utils){
	var page={
		init:function(){
			$('#fileUpload').singleFileUploader();

			this.submitEv(); //上传文件
		},
		submitEv:function(){
			var fileType = "7";
			$(".submit").on("click",function(e){
				if($(this).hasClass("disabled")){
					utils.alert("请先上传.csv文件");
					return false;
				} 
				var url = $("#fileUrl").val();
				if(url == ""){
					utils.alert("请重新上传.csv文件");
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
									location.href="batchFileImport.htm?taskId="+data.result.batchFileTask.id+"&fileType="+fileType;
								}else if(status == 4){
									clearInterval(getLastTask);
									utils.alert(data.result.batchFileTask.msg || "导入出错，请稍后重试",function(){
										location.reload();
									});
								}
							});
						},2000);
					});
				}
			});
		}
	}
			

	return {
		init:function(){
			page.init();
		}
	}
});