define(['utils','validate'],function(utils){
	return {
		init:function(){
			$("#freeType").on("change",function(){
				if($(this).val()=="1"){
					$(".postConfig").removeClass("hide");
				}else{
					$(".postConfig").addClass("hide");
				}
			});
			$("select.select").select2({
				minimumResultsForSearch: -1
			});
			$("#postConfigForm").validate({
			    rules: {
			        freePostReachedFee :{
			            required:true,
			            min: 0
			        },
			        postFee:{
			            required:true,
			            min: 0
			        }
			    },
			    messages: {
			        freePostReachedFee :{
			            min: "请填写正确的金额"
			        },
			        postFee:{
			            min: "请填写正确的金额"
			        }
			    },
			    ignore : "input:hidden",
			    submitHandler:function(form){
			    	var params = $(form).serializeObject();
					if(params.isPostFree == 0){
						params.freePostReachedFee = 0;
					}
					$.getJSON("updateSupplierPostConfig.json",params,function(data){
						if(data.status=="0"){
							utils.alert("保存成功");
						}else{
							utils.alert(data.errmeg ? data.errmeg : "系统繁忙，请稍后再试");
						}
					})
			    }
			});
		}
	};
});