document.title="编辑活动";
$.createSecondMenu("promotion_manage","买后送券");
Util.createHelpTip("买后送券相关问题",[
    {"title":"买后送券场景说明","link":"https://qiakr.kf5.com/posts/view/39415/"},
    {"title":"买后送券活动设置","link":"https://qiakr.kf5.com/posts/view/39803/"},
    {"title":"如何提高优惠券使用率","link":"https://qiakr.kf5.com/posts/view/39902/"},
    {"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);
var createPromotion = {
    init:function(){
        this.timeInit();
        this.limitTypeChangeEv();
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
    limitTypeChangeEv:function(){
        $(".limitType").on("change",function(){
            var _v = $(this).val();
            if(_v == "0"){
                $(this).siblings("input.min").val("0").hide();
            }else{
                $(this).siblings("input.min").val("").show();
            }
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
                    // height:450,
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
                            location.href="activityCouponOfShopping.htm";
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
                            location.href="activityCouponOfShopping.htm";
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }
    }
});