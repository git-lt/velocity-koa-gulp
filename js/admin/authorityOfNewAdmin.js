document.title = "编辑管理员账号";
$.createSecondMenu("m_settings","管理后台权限");

var page = {
    treeObj:{},
    bossTreeObj:{},
    setting:{
        check: {
            enable: false
        },
        view:{
            showIcon: function(treeId,node){
                return node.useStore == 1;
            }
        },
        data: {
            simpleData: {
                enable: true
            },
            key:{
                title:"title"
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
            if(nodes[i]){
                $("#"+nodes[i].tId).addClass("lastLevel");
            }
        }
    },
    initBossTree:function(list){
        this.bossTreeObj = $.fn.zTree.init($("#privilegeBossTree"), page.setting, list);
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
                    treeList.push({"id":e.id,"pId":e.parentId,"name":e.name,"field":e.field,"chkDisabled":true,"useStore":e.useStore,"title":e.name, iconSkin:"icon01"});
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
            page.initExistPrivile($("#supplierRoleSelect").val());
        });
        $("#supplierRoleSelect").on("change",function(){
            $(".ztree .c-3").removeClass("c-3");
            var id = $(this).val();
            page.initExistPrivile(id);
        });
        this.limitStore();
    },
    limitStore:function(){
        $("#limitStore").on("change",function(){
            if($(this).val()=="1"){
                $.popupStoreSelect({
                    title:"选择可操作的门店",
                    type:"multiple",
                    length:300,
                    okCallback:function(storeListArray){
                        var storeIdArr=[],nameView = [];
                        $.each(storeListArray,function(i,e){
                            storeIdArr.push(e.id);
                            nameView.push(e.name);
                        });
                        $("input[name=storeIdStr]").val(storeIdArr.join("_"));
                        $("#storeListView").html(nameView.join("/"));
                        $("#editStoreLimit").show();
                    }
                });
                
            }else{
                $("input[name=storeIdStr]").val("");
                $("#storeListView").empty();
                $("#editStoreLimit").hide();
            }
        });
        $("#editStoreLimit").on("click",function(){
            $("#limitStore").val("1").trigger("change");
        });
    },
    initExistPrivile:function(roleId){
        $.get("getSupplierRoleById.json?supplierRoleId="+roleId,function(data){
            if(data.status==="0"){
                var privilegesIdList = data.result.privilegesIdList;
                $.each(privilegesIdList,function(i,e){
                    var node = page.treeObj.getNodesByParam("id",e,null)[0];
                    var bossNode = page.bossTreeObj.getNodesByParam("id",e,null)[0];
                    if(node){
                        $("#"+node.tId+"_span").addClass("c-3");
                    }
                    if(bossNode){
                        $("#"+bossNode.tId+"_span").addClass("c-3");
                    }
                });
            }else{
                Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
            }
        });
    }
};
page.init();


$("#newAdminFrom").validate({
    rules: {
    	bossName:"required",
        phone: {
            required: true,
            isMobile:true
        },
        verifyCode:"required"
    },
    messages: {
    	bossName:"请填写管理员姓名",
        phone: {
            required: "请填写手机号码",
            isMobile:"手机号码错误"
        },
        verifyCode:"请填写校验码"
    },
    submitHandler:function(form){
        var createParam = $(form).serializeObject();
        $.ajax({
            url:createParam.bossId ? "updateBossAccount.json" : "createBossAccount.json",
            data:createParam,
            success:function(data){
                if(data.status=="0"){
                    Util.alert("保存成功");
                    setTimeout(function(){
                        location.href="authorityOfAdminList.htm";
                    },1000);
                }else{
                    Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
                }  
            }
        });
    }
});
$("#getCode,#getCodeByVoice").on("click",function(){
    var tel = $.trim($("input[name='phone']").val());
    if(tel.length == 11 && /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(tel)){
        if($("#KinerCode-error").length > 0 || $("#KinerCodeIpt").val()===""){
            $("#KinerCodeIpt").focus();
            return false;
        }
        $("#phone-error").remove();
        $("#getCode,#getCodeByVoice").removeClass("disabled");
        var timeEnd = 59;

        if(this.id === 'getCode'){
            $.getJSON("sendVerifyCode.json?phone="+tel,function(data){
                if(data.status=="0"){
                    Util.alert("验证码已发送，请注意查收手机短信");
                    $("#getCode").addClass("disabled").text(timeEnd);
                    $('#getCodeByVoice').addClass("disabled");
                    var getCodeCount = setInterval(function(){
                        if(timeEnd>0){
                            timeEnd--;
                             $("#getCode").text(timeEnd+'s');
                        }else{
                            clearInterval(getCodeCount);
                            $("#getCode").removeClass("disabled").text("重新获取");
                            $('#getCodeByVoice').removeClass("disabled");
                        }
                    },1000);
                }else{
                    Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
                }
            });
        }else{
            $.post('../getVoiceVerifyCode.json', {phone:tel}).done(function(data){
                if(data.status==='0'){
                    Util.alert("语音验证码已发送，请注意接听来电");
                    $("#getCode,#getCodeByVoice").addClass('disabled');
                    var t=60;
                    (function(){
                        if(t===0){
                            $('#getCodeByVoice').text('重新获取').removeClass('disabled');
                            $('#getCode').removeClass('disabled');
                            return;
                        }
                        $('#getCodeByVoice').text(t+'s');
                        t--;
                        setTimeout(arguments.callee,1000);
                    })();
                }else{
                    Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
                    $('#getCode,#getCodeByVoice').removeClass('disabled');
                }
            }).fail(function(data){
               Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
                $('#getCode,#getCodeByVoice').removeClass('disabled');
            });
        }

    }else{
        if($("#phone-error").length === 0){
            $("input[name='phone']").after('<label id="phone-error" class="error" for="phone">请填写正确的手机号码</label>');
        }
        $('#getCode,#getCodeByVoice').removeClass('disabled');
    }
});