document.title = "导购端软件权限设置";
$.createSecondMenu("m_settings","导购端软件权限");

var page = {
	treeList:{
		// myModelTree:{},
		// colleChatTree:{},
		// colleGroupTree:{},
		// custmChatTree:{},
		// custmGroupTree:{},
		functionTree:{}
	},
	setting:{
		check: {
			enable: false
		},
		view:{
			showIcon: false,
			showLine:false,
			dblClickExpand:false
		},
		data: {
			simpleData: {
				enable: true
			}
		}
	},
	init:function(){
		$.getJSON("getSupplierRolePrivileges.json",function(data){
			if(data.status!="0") {
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				return false;
			}
			var list = data.result.platformPrivilegesList,
				treeDataObj={},
				existed=data.result.supplierRolePrivilegesList;
				// treeDataObj.myModelTree=[{"id":901,"pId":"","name":"工作台"}],
				// treeDataObj.colleChatTree=[{"id":902,"pId":"","name":"同事聊天模块"}],
				// treeDataObj.colleGroupTree=[{"id":903,"pId":"","name":"同事群聊模块"}],
				// treeDataObj.custmChatTree=[{"id":904,"pId":"","name":"顾客聊天模块"}],
				// treeDataObj.custmGroupTree=[{"id":905,"pId":"","name":"顾客群聊模块"}],
				treeDataObj.functionTree=[{"id":906,"pId":"","name":"功能权限"}];
			$.each(list,function(i,e){
				switch(e.field){
					// case 27:
					// treeDataObj.myModelTree.push({"id":e.id,"pId":901,"name":e.name,"code":e.code});
					// break;
					// case 22:
					// treeDataObj.colleChatTree.push({"id":e.id,"pId":902,"name":e.name,"code":e.code});
					// break;
					// case 23:
					// treeDataObj.colleGroupTree.push({"id":e.id,"pId":903,"name":e.name,"code":e.code});
					// break;
					// case 24:
					// treeDataObj.custmChatTree.push({"id":e.id,"pId":904,"name":e.name,"code":e.code});
					// break;
					// case 25:
					// treeDataObj.custmGroupTree.push({"id":e.id,"pId":905,"name":e.name,"code":e.code});
					// break;
					case 26:
					treeDataObj.functionTree.push({"id":e.id,"pId":906,"name":e.name,"code":e.code});
					break;
				}
			});
			for(var o in page.treeList){
				page.treeList[o] = $.fn.zTree.init($("#"+o), page.setting, treeDataObj[o]);
				page.treeList[o].expandAll(true);
			}
			setTimeout(function(){
				page.initCheckbox();
				page.initExistPrivile(existed);
			},400);
			
		});
	},
	initCheckbox:function(){
		var nodes,checkboxHtml="",mustCheck=["p_routine","p_mine","p_store_manage","p_invite","p_appointment","p_product_manage","p_order_manage","p_activity_share","p_evaluate","p_income","net_pay"];
		for(var o in page.treeList){
			nodes = page.treeList[o].transformToArray(page.treeList[o].getNodes());
			for(var i=0,l=nodes.length;i<l;i++){
				if(nodes[i].getParentNode()){
					var top = $("li#"+nodes[i].tId).offset().top;
					checkboxHtml+='<div class="checkItem" style="top:'+(top-182)+'px"><label class="'+(mustCheck.indexOf(nodes[i].code)>-1?"c-9":"")+'"><input type="checkbox" name="'+nodes[i].id+'" '+(mustCheck.indexOf(nodes[i].code)>-1?"checked disabled":"")+' code="'+nodes[i].code+'" />启用</label></div>';
				}
			}
		}
		$("#guideCol").html(checkboxHtml);
		$("#salesCol").html(checkboxHtml);
	},
	initExistPrivile:function(existed){
		var salesGrey=[167,175,164,176,173],guideMust=[173];
		$.each(existed,function(i,e){
			if(e.supplierRoleName=="店长"){
				$("#guideCol").data("id",e.supplierRoleId);
				$.each(e.privilegeArray,function(j,n){
					$("#guideCol input[name="+n+"]").prop("checked",true);
				});
			}else{
				$("#salesCol").data("id",e.supplierRoleId);
				$.each(e.privilegeArray,function(j,n){
					$("#salesCol input[name="+n+"]").prop("checked",true);
				});
				$("#salesCol input[type=checkbox]").each(function(i,e){
					if(salesGrey.indexOf(parseInt(e.name))>-1){
						$(e).prop("checked",false).attr("disabled","disabled").parent().addClass("c-9");
					}
				})
			}
		});
	}
};
page.init();

$("#saveAuthorityApp").on("click",function(){
	var listArr = [], params={},gRoleId=$("#guideCol").data("id"),sRoleId=$("#salesCol").data("id");
		params[gRoleId]={},
		params[sRoleId]={},
		params[gRoleId].privileges = [],
		params[sRoleId].privileges = [];
	$("#guideCol input:checked").each(function(i,e){
		params[gRoleId].privileges.push(~~e.name);
	});
	$("#salesCol input:checked").each(function(i,e){
		params[sRoleId].privileges.push(~~e.name);
	});
	// console.log(params);
	for(var item in params){
		listArr.push({
			supplierRoleId : ~~item,
			privileges : params[item].privileges
		});
	}
	// console.log(listArr);
	$.ajax({
		url:"saveSalesSupplierRolePrivileges.json",
		data:{
			onPrivileges:JSON.stringify(listArr)
		},
		success:function(data){
			if(data.status=="0"){
				Util.alert("保存成功");
				$(".slideBtn.change").removeClass("change");
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		}
	});
});