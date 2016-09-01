document.title="编辑活动";
$.createSecondMenu("promotion_manage","发券给导购");
Util.createHelpTip("发券给导购相关问题",[
    {"title":"发券给导购场景说明","link":"https://qiakr.kf5.com/posts/view/39414/"},
    {"title":"发券给导购活动设置","link":"https://qiakr.kf5.com/posts/view/39804/"},
    {"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);

var getCouponSalesCount=0;

var createPromotion = {
    init:function(){
        this.timeInit();
        this.couponBoxShow();
        this.couponCodeListen();
        this.couponCodeTip();
    },
    timeInit:function(){
        $("#dateStart").on("click",function(){
            WdatePicker({
                startDate:'%y-%M-%d 00:00:00',
                dateFmt:'yyyy-MM-dd HH:mm:ss',
                qsEnabled:false,
                maxDate:'#F{$dp.$D(\'dateEnd\');}'
            });
        });
        $("#dateEnd").on("click",function(){
            WdatePicker({
                startDate:'%y-%M-%d 23:59:59',
                dateFmt:'yyyy-MM-dd HH:mm:ss',
                qsEnabled:false,
                minDate:'#F{$dp.$D(\'dateStart\');}'
            });
        });
    },
    couponBoxShow:function(){
        $("#editCoupon").on("click",function(e){
            if(_couponDialog){
                _couponDialog.showModal();
            }else{
                _couponDialog = dialog({
                    title:"发放的优惠券",
                    id:"util-coupon",
                    // fixed: true,
                    width:560,
                    content: $("#couponDialog"),
                    cancelValue:'取消',
                    oklValue:'确定',
                    backdropOpacity:"0.2",
                    cancel:function(){
                        this.close();return false;
                    },
                    ok:function(){
                        $("#newCouponForm").submit();
                        return false
                    }
                });
                _couponDialog.showModal();
            }
        });
        if(!Util.getUrlParam("id")){
            $("#editCoupon").trigger("click");
        }
    },
    getSalesList:function(index,storeId,fuzzyKeyword){
        $.ajax({
            url:"getSaleVoListOfSupplier.json",
            data:{
                index:index,
                length:30,
                storeId:storeId,
                fuzzyKeyword:fuzzyKeyword
            },
            success:function(data){
                var dataHtml="";
                if(data.result.salesVoList.length==0){
                    dataHtml = '<p>商品列表为空</p>'
                }else{
                    $.each(data.result.salesVoList,function(i,e){
                        dataHtml += '<label class="inline"><input name="sales" data-id="'+e.salesId+'" type="checkbox">'+e.salesName+'</label>';
                    });
                }
                $("#salesContainer .salesList").empty().append(dataHtml);
                Util.createPagination(data.result.count,index,$("nav .pagination"),function(_i){
                    createPromotion.getSalesList(_i,storeId,fuzzyKeyword);
                });
            }
        });
    },
    getStoreList:function(){
        $.getJSON("getStoreList.json",{openArray:0},function(data){
            if(data.status!="0"){
                console.log("获取门店列表失败");
                return false;
            }
            var storeList = [{id:"",text:"全部门店"}];
            $.each(data.result.storeVoList,function(i,e){
                storeList.push({
                    id:e.store.id,
                    text:e.store.name
                });
            });
            $("#storeSelect").select2({
                data:storeList,
                placeholder:"选择门店"
            }).on("change", function (e) {
                 createPromotion.getSalesList(0,e.val,"");
            });
        });
    },
    couponCodeTip:function(){
        var html = '1. 导入券码的优惠券类型请于您新建的保持一致。<br>\
            若您新建的券为满100减10元，则券码必须也为该种类型券。<br>\
            2.导入列项，第一列为券码，首行即为券码，无需添加列项名称。<br>\
            3. 单次上传csv最大条目（行数）为10万条。<br>\
            4. <a target="_blank" href="https://qncdn.qiakr.com/file/洽客自有券码模板.csv">下载模板示例</a><br>\
            5. 上传前请检查csv文件内券码是否正常。';
        $("#codeUploadTip").on("click",function(){
            dialog({
                align: "right top",
                quickClose: true,
                content:html
            }).show(this);
        });
    },
    couponCodeListen:function(){
        if(Util.getUrlParam("id")){
            $("#couponCodeTypeTr").hide();
        }
        $("input[name=couponCodeType]").on("change",function(){
            if($(this).val()==1){
                $("#couponCodeUploadTr").show();
                $("#totalLimitCount").val("1").trigger("change").prop("disabled",true);
                $("input[name=totalLimitCount]").prop("readonly",true).attr("placeholder","上传券码决定");
                $("input[name=couponCodeType][value=0]").prop("disabled",true);
                if($(".webuploader-pick").length==0){
                    $('#fileUpload').couponCodeUploader();
                }
            }else{
                $("#couponCodeUploadTr").hide();
                $("#totalLimitCount").val("0").trigger("change").prop("disabled",false);
                $("input[name=totalLimitCount]").prop("readonly",false).attr("placeholder","不可修改");
            }
        });
    },
    previewCodeUpload:function(taskId,total,errorList,previewList){
        var html = '<p>文件内共含有'+total+'个券码</p>';
        html += '<p>首条券码预览：'+(previewList[0] ? previewList[0].code : '(不存在)')+'</p>';
        html += '<p class="">若券码个数不正确，或券码预览显示异常，请检查CSV文件后重新上传</p>';
        html += template('codeTpl', {list:errorList});
        var dialogOpt = {
            title:"自有券码导入预览",
            id:"previewCodeUpload",
            fixed: true,
            content:html,
            width:600,
            backdropOpacity:"0.6"
        }
        if(errorList.length == 0){
            dialogOpt.okValue = "确认导入";
            dialogOpt.cancelValue = "重新上传";
            dialogOpt.ok = function(){
                if(errorList.length>0){
                    Util.alert("券码中存在错误，请核对后重新上传");
                    return false;
                }
                var params = {
                    taskId: taskId,
                    couponId: $("#couponId").val()
                }
                $.getJSON("commitBatchFileTaskCouponCode.json",params,function(data){
                    if(data.status=="0"){
                        // dialog.get("previewCodeUpload").close();
                        $("#fileUpload").parent().html("券码已上传");
                        $("input[name=totalLimitCount]").val(total);
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
                    }
                })
            };
            dialogOpt.cancel=function(){};
        }else{
            dialogOpt.okValue = "重新上传";
            dialogOpt.cancel = false;
            dialogOpt.ok = function(){
                // dialog.get("previewCodeUpload").close();
            }
        }
        dialog(dialogOpt).showModal();
    },
}
createPromotion.init();

$("#newCouponPromotionForm").validate({
    rules: {
        couponId : "required",
        startTime:"required",
        endTime:"required",
        grantAmount:{
            required:true,
            min: 1
        }
    },
    messages: {
        couponId : "请创建发放的优惠券",
        startTime:"请选择开始时间",
        endTime:"请选择结束时间",
        grantAmount:{
            min: "最少1张"
        }
    },
    ignore : ".ignore input",
    submitHandler:function(form){
        if(Util.getUrlParam("id")){
            $.ajax({
                url:"updateCouponPromotion.json",
                data:{
                    couponPromotionId:Util.getUrlParam("id"),
                    comment:$('input[name="comment"]').val()
                },
                success:function(data){
                    if(data.status=="0"){
                        Util.alert("更新成功",function(){
                            location.href="activityCouponOfSales.htm";
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }else{
            var createParam = $(form).serializeObject();
            if($("#fileUpload").length > 0 && createParam.couponCodeType == "1"){
                Util.alert("请上传自有券码");
                return false;
            }
            if(createParam.couponCodeType=="1"){
                if(~~createParam.totalLimitCount < ~~createParam.grantAmount*getCouponSalesCount){
                    Util.alert("导入的优惠券总量少于要发放的数量");
                    return false;
                }
            }
            createParam.startTime = Util.getUnixTime($("#dateStart").val());
            createParam.endTime = Util.getUnixTime($("#dateEnd").val());
            if(createParam.endTime && createParam.endTime < new Date().getTime()){
                $("#dateEnd").addClass("error").parent().append('<label id="dateEnd-error" class="error" for="dateEnd">结束时间必须大于当前时间</label>')
                return false;
            }
            $.ajax({
                url:"insertCouponPromotion.json",
                data:createParam,
                success:function(data){
                    if(data.status=="0"){
                        Util.alert("创建成功",function(){
                            location.href="activityCouponOfSales.htm";
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }
    }
});

$("#grantTypeSel").on("change",function(){
    if($(this).val()=="1"){
        // console.log(stockIdList);
        $.popupStoreSelect({
            title:"选择发放门店",
            type:"multiple",
            clear:true,
            dialogId:"storeList-promotion",
            provinceId:"loc_province_pop3",
            cityId:"loc_city_pop3",
            townId:"loc_town_pop3",
            okCallback:function(list){
                console.log(list);
                var storeIdList = [],storeStr="";
                $.each(list,function(i,e){
                    storeIdList.push(e.id);
                    storeStr += '<p>'+e.name+'</p>'
                    getCouponSalesCount += ~~e.salesCount;
                });
                if(storeIdList.length==0){
                    Util.alert("请选择门店");
                    return false;
                }
                storeStr = '<p class="pb5">已选择'+storeIdList.length+"家门店共"+getCouponSalesCount+'位导购</p>'+storeStr;
                $("#salesStoreList").html(storeStr);
                $("#grantValue").val(JSON.stringify(storeIdList));
                $("#changeStore").show();
            }
        });
    }else if($(this).val()=="2"){
        if(typeof popupSalesSelectBox == "undefined"){
            createPromotion.getSalesList(0);
            createPromotion.getStoreList();
            popupSalesSelectBox = dialog({
                title:"选择导购",
                id:"util-salesList",
                fixed: true,
                content: $("#salesContainer"),
                width:670,
                okValue: '确定',
                cancelValue:'取消',
                backdropOpacity:"0.6",
                statusbar: '<label class="inline"><input type="checkbox" id="checkAllSales-dialog" />全选</label>',
                ok: function () {
                    var salesList = [],salesStr="";
                    $("#salesContainer .salesList").find("input:checked").each(function(i,e){
                        salesList.push($(e).data("id"));
                        salesStr += '<p>'+$(e).parent().text()+'</p>';
                    });
                    getCouponSalesCount = salesList.length;
                    if(salesList.length == 0){
                        Util.alert("至少选择一位导购");
                        return false;
                    }else{
                        $("#salesStoreList").html(salesStr);
                        $("#grantValue").val(JSON.stringify(salesList));
                        $("#changeStore").show();
                        this.close();return false;
                    }
                },
                cancel:function(){this.close();return false;}
            });

            $("#checkAllSales-dialog").off().on("click",function(e){
                if($(this).prop("checked")){
                    $("#salesContainer input").prop("checked",true);
                }else{
                    $("#salesContainer input").prop("checked",false);
                }
            });

            $("#salesFilter").on("click",function(){
                var store = $("#storeSelect").val(),
                    salesName = $("#salesName").val();
                createPromotion.getSalesList(0,store,salesName);
            });
        }
        popupSalesSelectBox.showModal();
    }else{
        $("#grantValue").val("");
        $("#seldStoreCount").empty();
        $("#changeStore").hide();
    }
});
$("#changeStore").on("click",function(){
    if($("#grantTypeSel").val()=="1"){
        $("#grantTypeSel").trigger("change");
    }else{
        popupSalesSelectBox.showModal();
    }
    
});