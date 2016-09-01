document.title="编辑导购信息";
$.createSecondMenu("store_manage","导购管理");
var salesId = Util.getUrlParam("salesId"),storeId=Util.getUrlParam("storeId");

(function(){
	var yearDataStr=monthDataStr=dayDataStr='<option value=""></option>',startYear=1950,thisYear = new Date().getFullYear();
	var addYear = startYear,addMonth=1;
	do{
        // '+(oldBirthYear==addYear ? "selected" : "")+'
		yearDataStr += '<option value="'+addYear+'">'+addYear+'年</option>';
		addYear++;
	}while(addYear<=thisYear);
	do{
		monthDataStr += '<option value="'+(addMonth < 10 ? "0"+addMonth : addMonth)+'">'+(addMonth < 10 ? "0"+addMonth : addMonth)+'月</option>';
		addMonth++;
	}while(addMonth<=12);
	$("#birthYear").append(yearDataStr).select2({
		placeholder: "出生年",
		minimumResultsForSearch: -1
	}).change(function(){
		$("#birthMonth").empty().append(monthDataStr).select2({
			placeholder: "出生月",
			minimumResultsForSearch: -1
		});
		$("#birthDay").empty().append('<option value=""></option>').select2({
			placeholder: "出生日",
			minimumResultsForSearch: -1
		});
	});
	$("#birthMonth").select2({
		placeholder: "出生月",
		minimumResultsForSearch: -1
	}).change(function(){
		var year=$("#birthYear").val(),month = $(this).val(), maxDay=31;
		$("#birthDay").empty();
		dayDataStr='<option value=""></option>';
		var addDay=1;
		if(month==4 || month==6 || month==9 || month==11){
			maxDay = 30;
		}else if(month==2){
			// 判断是闰年
			if(0 == year%4 && (year%100 !=0 || year%400 == 0)){
				maxDay = 29;
			}else{
				maxDay = 28;
			}
		}
		do{
			dayDataStr += '<option value="'+(addDay < 10 ? "0"+addDay : addDay)+'">'+(addDay < 10 ? "0"+addDay : addDay)+'日</option>';
			addDay++;
		}while(addDay<=maxDay);
		$("#birthDay").append(dayDataStr).select2({
			placeholder: "出生日",
			minimumResultsForSearch: -1
		});
	});
	$("#birthDay").select2({
		placeholder: "出生日",
		minimumResultsForSearch: -1
	});
	$("#brandIdList").select2();
    if(oldBirth){
        var oldBirthYear = oldBirth.getFullYear(),
            oldBirthMonth=oldBirth.getMonth() < 9 ? ("0"+(oldBirth.getMonth()+1)) : oldBirth.getMonth()+1,
            oldBirthDay = oldBirth.getDate() < 10 ? ("0"+oldBirth.getDate()) : oldBirth.getDate();
        $("#birthYear").val(oldBirthYear).trigger("change");
        $("#birthMonth").val(oldBirthMonth).trigger("change");
        $("#birthDay").val(oldBirthDay).trigger("change");
    }
})();

$("#editSaleseForm").validate({
    rules: {
        name: {
            required: true,
            maxlength: 20
        },
        phone:{
            required:true,
            number:true
        },
        idCard:{
        	required:true,
            isIdCardNo:true
        }
    },
    messages: {
        name: {
            required: "请输入导购名称",
            maxlength: "最长20个字"
        },
        phone:{
            required:"请填写联系电话",
            number:"只能包含数字"
        },
        idCard:{
        	required:"请填写身份证号码",
            isIdCardNo:"身份证号码错误"
        }
    },
    submitHandler:function(form){
        createParam = $(form).serializeObject();
        createParam.birthday = $("#birthDay").val() ? (Util.getUnixTime($("#birthYear").val()+"-"+$("#birthMonth").val()+"-"+$("#birthDay").val())) : "";
        createParam.permission = $("#permission").prop("checked") ? "0" : "1";
        $.ajax({
            url:"updateSalesOfStore.json",
            data:createParam,
            success:function(data){
                if(data.status=="0"){
                    Util.alert("保存成功",function(){
                        location.href="salesList.htm";
                    });
                }
            }
        });
        
    }
});

// 图片上传
$("#photoUpload").singleImgUploader({
    resultInput : $("#photoUrl")
});