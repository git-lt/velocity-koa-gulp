document.title = "管理后台角色设置";
$.createSecondMenu("m_settings","管理后台权限");
var page = {
	treeObj:{},
	bossTreeObj:{},
	mustCheck:[101,109,111,112,113],
	setting:{
		check: {
			enable: true,
			autoCheckTrigger: true,
			chkboxType:{"Y":"ps","N":"s"}
		},
		view:{
			showIcon: function(treeId,node){
				return node.useStore == 1;
			}
			// showIcon: true
		},
		data: {
			simpleData: {
				enable: true
			},
			key:{
				title:"title"
			}
		},
		callback: {
			onClick: function(event, treeId, treeNode){
				page.treeObj.checkNode(treeNode, treeNode.checked?false:true, true);
			}
		}
	},
	filterLastChild:function(node){
		return node.level == 3 || (node.level == 2 && node.field==12);
		// return node.level == 2 || (node.level == 1 && !node.children);
	},
	initTree:function(list){
		this.treeObj = $.fn.zTree.init($("#privilegeTree"), page.setting, list);
		this.treeObj.expandAll(true);
		var nodes = this.treeObj.getNodesByFilter(page.filterLastChild);
		for(var i=0;i<nodes.length;i++){
			$("#"+nodes[i].tId).addClass("lastLevel");
		}
	},
	initBossTree:function(list){
		this.bossTreeObj = $.fn.zTree.init($("#privilegeBossTree"), $.extend({},page.setting,{
				callback: {
					onClick: function(event, treeId, treeNode){
						page.bossTreeObj.checkNode(treeNode, treeNode.checked?false:true, true);
					}
				}
			}), list);
		this.bossTreeObj.expandAll(true);
	},
	init:function(){
		$.getJSON("getPrivilegesBySupplierId.json",function(data){
			if(data.status!="0") {
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				return false;
			}
			var list = data.result.platformPrivilegesList,treeList=[],bossTreeList=[{"id":900,"pId":null,"name":"APP端Boss权限","field":13,"title":"APP端Boss权限", iconSkin:"icon01","nocheck":true},{"id":901,"pId":900,"name":"工作台","field":13,"title":"工作台", iconSkin:"icon01"},{"id":902,"pId":900,"name":"洽一洽","field":14,"title":"洽一洽", iconSkin:"icon01"}];
			$.each(list,function(i,e){
				if(e.field===11 || e.field===12){
					treeList.push({"id":e.id,"pId":e.parentId,"name":e.name,"field":e.field,"title":e.name,"useStore":e.useStore, iconSkin:"icon01"});
				}
			});

			$.each(list,function(i,e){
				if(e.field===13){
					bossTreeList.push({"id":e.id,"pId":901,"name":e.name,"field":e.field,"title":e.name,iconSkin:"icon01"});
				}
				if(e.field===14){
					bossTreeList.push({"id":e.id,"pId":902,"name":e.name,"field":e.field,"title":e.name,iconSkin:"icon01"});
				}
			});
			page.initTree(treeList);
			page.initBossTree(bossTreeList);
			if(Util.getUrlParam("supplierRoleId")){
				page.initExistPrivile(Util.getUrlParam("supplierRoleId"));
			}else{
				var privilegeNode = page.treeObj.getNodesByParam("name","管理后台权限",null)[0];
				page.treeObj.removeNode(privilegeNode);
				if(page.mustCheck && page.mustCheck.length>0){
					$.each(page.mustCheck,function(i,e){
						var node = page.treeObj.getNodesByParam("id",e,null)[0];
						if(node){
							page.treeObj.checkNode(node,true,false);
							page.treeObj.setChkDisabled(node, true);
						}
					});
				}
			}
		});
	},
	initExistPrivile:function(roleId){
		$.get("getSupplierRoleById.json?supplierRoleId="+roleId,function(data){
			if(data.status==="0"){
				var privilegesIdList = data.result.privilegesIdList,roleName= data.result.supplierRole.supplierRoleName;
				$.each(privilegesIdList,function(i,e){
					var node = page.treeObj.getNodesByParam("id",e,null)[0];
					var bossNode = page.bossTreeObj.getNodesByParam("id",e,null)[0];
					if(node){
						page.treeObj.checkNode(node,true,false);
					}
					if(bossNode){
						page.bossTreeObj.checkNode(bossNode,true,false);
					}
				});
				if(page.mustCheck && page.mustCheck.length>0){
					$.each(page.mustCheck,function(i,e){
						var node = page.treeObj.getNodesByParam("id",e,null)[0];
						if(node){
							page.treeObj.checkNode(node,true,false);
							page.treeObj.setChkDisabled(node, true);
						}
					});
				}
				if(roleName=="后台管理员" || roleName=="超级管理员"){
					$("#roleToSave").remove();
					$("#adminToReturn").show();
					var nodes = page.treeObj.transformToArray(page.treeObj.getNodes());
		            for (var i=0, l=nodes.length; i < l; i++) {
		                page.treeObj.setChkDisabled(nodes[i], true);
		            }
				}else{
					var privilegeNode = page.treeObj.getNodesByParam("name","管理后台权限",null)[0];
					page.treeObj.removeNode(privilegeNode);
				}
			}else{
                Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
            }
		});
	}
};
page.init();

$("#newRolFrom").validate({
    rules: {
    	supplierRoleName:"required"
    },
    messages: {
    	supplierRoleName:"请填写角色名称"
    },
    submitHandler:function(form){
        var createParam = $(form).serializeObject();
        var rolePrivilegesList = $.extend([],page.mustCheck),seldNodes=page.treeObj.getCheckedNodes().concat(page.bossTreeObj.getCheckedNodes());
        for(var i=0;i<seldNodes.length;i++){
			rolePrivilegesList.push(seldNodes[i].id);
		}
		if(rolePrivilegesList.length ===0){
			Util.alert("请至少选择一项权限给这个角色");
			return false;
		}
		createParam.rolePrivilegesListJson = rolePrivilegesList.join("_");
		var saveUrl = "createSupplierRole.json";
		if(Util.getUrlParam("supplierRoleId")){
			createParam.supplierRoleId = Util.getUrlParam("supplierRoleId");
			saveUrl = "modifySupplierRole.json";
		}
        $.getJSON(saveUrl,createParam,function(data){
            if(data.status=="0"){
                Util.alert("保存成功");
            }else{
                Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
            }
        });
    }
});