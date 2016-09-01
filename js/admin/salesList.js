document.title="导购管理";
$.createSecondMenu("store_manage","导购管理");
Util.createHelpTip("门店相关问题",[
	{"title":"添加导购","link":"https://qiakr.kf5.com/posts/view/39474/"},
	{"title":"批量下载导购二维码","link":"https://qiakr.kf5.com/posts/view/39780/"},
	{"title":"导购转店或离职","link":"https://qiakr.kf5.com/posts/view/39473/"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);

$(".select2").select2();
$(".select2s").select2({
	minimumResultsForSearch:-1
});

// 获取导购列表
getAjaxData("","","",0)
function getAjaxData(storeId,position,fuzzyKeyword,idx){
	$(".table tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		storeId:storeId,
		position:position,
		fuzzyKeyword:fuzzyKeyword,
		index:idx,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"getSaleVoListOfSupplier.json",
		data:options,
		success:function(data){
			if(data.status!="0"){
				Util.alert(data.errmsg || "系统繁忙，请稍后再试");
			}
			var tempData={
				list:data.result.salesVoList,
				hasWechat:!!$('#hasWechat').val(),
				status:status
			}
			var dataHtml = template('tempData', tempData);
			$(".table tbody").empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$(".pagination"),function(_i){
				getAjaxData(storeId,position,fuzzyKeyword,_i);
			});
			$(".table").setTheadFixed();
		}
	});
}

// 导购筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var storeId = $("#sltStore").val(),
		position = $("#sltPosition").val(),
		fuzzyKeyword = $("#keywords").val();
	getAjaxData(storeId,position,fuzzyKeyword,0);
});

// 添加导购表单校验
$("#newSaleForm").validate({
    rules: {
        storeId: {
            required: true
        },
        name:{
            required:true
        },
        mobile:{
        	required:true,
            isMobile:true
        }
    },
    messages: {
        storeId: {
            required: "请选择门店，没有请先新建门店"
        },
        name:{
            required:"请填写导购名称"
        },
        mobile:{
        	required:"请填写导购手机号码",
            isMobile:"请填写正确的手机号码"
        }
    }
});

// 新建导购
$("#newSale").on("click",function(){
	$("#newSaleForm .ignore").hide();
	dialog({
        title:"新建导购",
        id:"util-newSale",
        fixed: true,
        content: $("#newSaleBox"),
        width:400,
        okValue: '添加导购',
        cancelValue:'取消',
        backdropOpacity:"0",
        ok: function(){
        	var self = this;
        	if($("#newSaleForm").valid()){
        		var param = $("#newSaleForm").serializeObject();
        		if($("#verifyCode").is(":visible")){
        			param.verifyCode = $("#verifyCode").val();
        		}
        		$.ajax({
					url:"createNewSales.json",
					data:param,
					success:function(data){
						if(data.status=="0"){
							Util.alert("添加成功。<br>导购登陆账号为该手机号，密码已通过短信发送至手机号，可直接登陆洽客导购版。<br><a target='_blank' href='https://qiakr.kf5.com/posts/view/39654/'>查看洽客导购版下载地址</a>",function(){
								location.reload();
							});
						}else if(data.returnCode=="1" || data.returnCode=="4"){
							$("#createSaleError").html(data.msg);
						}else if(data.returnCode=="2"){
							$("#newSaleForm .ignore").show();
							$("#createSaleError").html(data.msg);
						}else{
							$("#createSaleError").html(data.msg ? data.msg : "系统繁忙，请稍后再试");
						}
					}
				});
        	}
        	return false;
        },
        cancel: function(){}
    }).showModal();
});

// 离职导购
$(document).on("click",".delSales",function(){
	var tr = $(this).closest("tr"),id=$(this).data("id"),store = $(this).data("storeid")
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
				$.getJSON("dimissionSalesOfStore.json?storeId="+store+"&salesId="+id,function(data){
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
$(document).on("click",".moveTo",function(e){
	var _t = $(this);
	_t.closest("tr").addClass("hover").siblings().removeClass("hover");
	window.changeSalesParams={
		salesId: _t.data("id"),
		storeId: _t.data("storeid"),
		target:_t
	};
	// console.log(stockIdList);
	$.popupStoreSelect({
	    title:"迁移到门店",
	    type:"single",
	    okCallback:function(list){
	        console.log(list);
	        $.getJSON("changeSalesOfStore.json?salesId="+window.changeSalesParams.salesId+"&oldStoreId="+window.changeSalesParams.storeId+"&newStoreId="+list[0].id,function(data){
        		if(data.status=="0"){
        			Util.alert("迁移成功");
        			window.changeSalesParams.target.parent().find(".storeName").html(list[0].name);
        			window.changeSalesParams.target.data("storeid",list[0].id);
        		}
        	});
	    }
	});
});

// 下载导购二维码
$("#downloadQrcodeList").on("click",function(e){
	e.preventDefault();
	$.getJSON("getSupplierWechatInfo.json",function(data){
		var service = data.supplierWechat ? data.supplierWechat.serviceTypeInfo : "",
			verify = data.supplierWechat ? data.supplierWechat.verifyTypeInfo : "";
		if(service==2 && $.inArray(verify,[0,3,4,5])>-1){
			window.open("downloadQrcodeList.htm");
		}else{
			Util.alert("该功能只有绑定已认证的微信服务号才可使用");
		}
	});
});
