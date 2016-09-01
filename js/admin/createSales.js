document.title="添加导购";
$.createSecondMenu("store_manage","门店管理");
var storeId = Util.getUrlParam("storeId");
if(storeId){
    $("#editStore").attr("href","createStore.htm?storeId="+storeId);
}
$('.newRow').on("click",function(){
	var tr = '<tr>\
			<td>导购姓名</td>\
			<td><input class="name" type="text"></td>\
			<td>手机号</td>\
			<td><input class="mobile" type="text"></td>\
			<td>职位</td>\
			<td><select name="position" class="position min">\
				<option value="1">店员</option>\
				<option value="5">店长</option>\
			</select></td>\
			<td><button class="btn btn-success">确认添加</button></td>\
		</tr>';
	$(".table").append(tr);
});
$(".table").on("click",".btn",function(){
	var tr = $(this).closest("tr"),
		param={
			name : tr.find(".name").val(),
			mobile : tr.find(".mobile").val(),
			position : tr.find(".position").val(),
			storeId : storeId
		}
		
	if(param.name==""||param.mobile==""||param.idCard==""){
		Util.alert("请填写完整信息");
		return false;
	}
	if(param.mobile.length != 11 || !/^1+\d{10}$/.test(param.mobile)){
		Util.alert("请填写正确的手机号码");
		return false;
	}
	$.ajax({
		url:"createNewSales.json",
		data:param,
		success:function(data){
			if(data.status=="0"){
				Util.alert("添加成功。<br>导购登陆账号为该手机号，密码已通过短信发送至手机号，可直接登陆洽客导购版。<br><a target='_blank' href='https://qiakr.kf5.com/posts/view/39654/'>查看洽客导购版下载地址</a>");
				tr.find(".btn").css("visibility","hidden");
			}else if(data.returnCode=="2"){
				dialog({
			        title:"新建导购",
			        id:"util-newSale",
			        fixed: true,
			        content: $("#newSaleBox"),
			        width:400,
			        okValue: '确认添加',
			        cancelValue:'取消',
			        backdropOpacity:"0",
			        ok: function(){
		        		var newParam = {
		        			name : param.name,
							mobile : param.mobile,
							position : param.position,
							storeId : storeId,
							verifyCode : $("#verifyCode").val()
		        		};
		        		$.ajax({
							url:"createNewSales.json",
							data:newParam,
							success:function(data){
								if(data.status=="0"){
									Util.alert("添加成功",function(){
										location.reload();
									});
								}else{
									$("#createSaleError").html(data.msg ? data.msg : "系统繁忙，请稍后再试");
								}
							}
						});
			        	return false;
			        },
			        cancel: function(){}
			    }).showModal();
			}else{
				Util.alert(data.msg ? data.msg : "系统繁忙，请稍后再试");
			}
		}
	})
});
$(".gotoDetail").click(function(e){
	e.preventDefault();
	location.href="storeList.htm";
});