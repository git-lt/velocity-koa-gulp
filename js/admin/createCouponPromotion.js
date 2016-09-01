document.title="编辑活动";
var _couponDialog, getCouponSalesCount=0;

var createPromotion = {
    init:function(){
        this.timeInit();
        this.limitTypeChangeEv();
        this.couponBoxShow();
        this.couponEvListen();
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

        $("#couponDateStart").on("click",function(){
            WdatePicker({
                startDate:'%y-%M-%d 00:00:00',
                dateFmt:'yyyy-MM-dd HH:mm:ss',
                qsEnabled:false,
                maxDate:'#F{$dp.$D(\'couponDateEnd\');}',
                onpicking:function(dp){
                    $('.couponWrap .couponstart').html(dp.cal.getNewDateStr().substring(0,10).replace(/-/g,"."));
                }
            });
        });
        $("#couponDateEnd").on("click",function(){
            WdatePicker({
                startDate:'%y-%M-%d 23:59:59',
                dateFmt:'yyyy-MM-dd HH:mm:ss',
                qsEnabled:false,
                minDate:'#F{$dp.$D(\'couponDateStart\');}',
                onpicking:function(dp){
                    $('.couponWrap .couponend').html(dp.cal.getNewDateStr().substring(0,10).replace(/-/g,"."));
                }
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
    couponEvListen:function(){
        $(".couponColor .colorBlock").on("click",function(e){
            if($(this).hasClass("ac")) return false;
            $(this).addClass("ac").siblings().removeClass("ac");
            var color = this.style.backgroundColor;
            $(".couponWrap .top").css("background-color",color);
        });
        $('input[name=couponName],input[name=couponValue],input[name=orderLimitValue]').on('input propertychange blur', function() {
            var name = this.name;
            $('.couponWrap .'+name).html($(this).val());
            $(this).parent().find("#couponValue-error-my").remove();
        });

        $('input[name=couponValue],input[name=orderLimitValue]').blur(function(e){
            var _val = $(this).val();
            if(parseFloat(_val).toString() == "NaN") return false;
            $(this).val(parseFloat(_val).toFixed(2));
            $(this).trigger("propertychange");
            $(this).trigger("input");
        });
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
                            location.href="activityOfCoupon.htm?type="+Util.getUrlParam("type");
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
            if(Util.getUrlParam("type")=="3" && createParam.couponCodeType=="1"){
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
                            location.href="activityOfCoupon.htm?type="+Util.getUrlParam("type");
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }
    }
});

$("#newCouponForm").validate({
    rules: {
        couponName: {
            required: true,
            maxlength: 20
        },
        couponValue:{
            required: true,
            maxlength:11,
            min: 1
        },
        orderLimitValue:{
            required: true,
            maxlength:11,
            min: 1
        },
        startTime:"required",
        endTime:"required"
    },
    messages: {
        couponName: {
            required: "请填写优惠券名称",
            maxlength: "最长20个字"
        },
        couponValue:{
            required: "请填写面值",
            min: "最小1元"
        },
        orderLimitValue:{
            required: "请填写使用条件",
            min: "最小1元"
        },
        startTime:"请选择生效时间",
        endTime:"请选择过期时间"
    },
    submitHandler:function(form){
        if(parseFloat($("input[name=couponValue]").val()) >= parseFloat($("input[name=orderLimitValue]").val())){
            // Util.alert("优惠券面值必须小于订单总额");
            $('input[name=couponValue]').addClass("error").focus().parent().remove("#couponValue-error-my").append('<label id="couponValue-error-my" class="error">优惠券面值必须小于订单总额</label>')
            return false;
        }

        if($("#couponId").val()){//更新
            var createParam = {
                couponName : $("input[name=couponName]").val(),
                couponId : $("#couponId").val(),
                couponDescription : $("#couponDescription").val(),
                color : $(".couponColor .ac").data("color") || "#F44336"
            };
            $.ajax({
                url:"updateCoupon.json",
                data:createParam,
                success:function(data){
                    if(data.status=="0"){
                        Util.alert("保存成功",function(){
                            _couponDialog.close();
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }else{//保存
            var createParam = $(form).serializeObject();
            createParam.startTime = Util.getUnixTime(createParam.startTime);
            createParam.endTime = Util.getUnixTime(createParam.endTime);
            createParam.color = $(".couponColor .ac").data("color") || "#F44336";
            if(createParam.limitType!= 0 && createParam.limitIds==''){
                Util.alert('商品/品类/品牌限制不能为空！');
                return false;
            }
            $.ajax({
                url:"insertCoupon.json",
                data:createParam,
                success:function(data){
                    if(data.status=="0"){
                        $("#couponId").val(data.couponId);
                        Util.alert("创建成功",function(){
                            _couponDialog.close();
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }
    }
});

if(Util.getUrlParam("type")=="3"){
    $("#grantTypeSel").on("change",function(){
        if($(this).val()=="1"){
            // console.log(stockIdList);
            $.popupStoreSelect({
                title:"选择门店",
                type:"multiple",
                okCallback:function(list){
                    console.log(list);
                    var storeIdList = [];
                    $.each(list,function(i,e){
                        storeIdList.push(e.id);
                        getCouponSalesCount += ~~e.salesCount;
                    });
                    if(storeIdList.length==0){
                        Util.alert("请选择门店");
                        return false;
                    }
                    $("#seldSalesCount").html(getCouponSalesCount+"位");
                    // $("#seldSalesCount").html("全部");
                    $("#seldStoreCount").html(storeIdList.length+"家");
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
                        var salesList = [];
                        $("#salesContainer .salesList").find("input:checked").each(function(i,e){
                            salesList.push($(e).data("id"));
                        });
                        getCouponSalesCount = salesList.length;
                        if(salesList.length == 0){
                            Util.alert("至少选择一位导购");
                            return false;
                        }else{
                            $("#seldSalesCount").html(salesList.length+"位");
                            $("#seldStoreCount").html("相关");
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
            $("#seldStoreCount").html("所有");
            $("#seldSalesCount").html("所有");
            $("#changeStore").hide();
        }
    });
    $("#changeStore").on("click",function(){
        if($("#grantTypeSel").val()=="1"){
            $.popupStoreSelect();
        }else{
            popupSalesSelectBox.showModal();
        }
        
    });
}


// 获取品牌列表
// 获取第一个品牌下的子类
// 事件：
// 点击品牌获取子类，并缓存子类数据
// 点击类别切换active, 获取父类
MOD_SelectProsDia.o.getProListUrl = 'queryAllocatedSupplierStock.json';
var brandDia = MOD_SelectBrandDia.init();
var proDia = MOD_SelectProsDia.init();

var createCoupon = {
    o:{
        getBrandListUrl:'getAllCategoryFamily.json',
        getBrandLeafUrl:'getCategoryListByFamilyId.json',
        getProListUrl:'querySupplierStock.json',
        PLDataCache:[],
        PLCurrChkId:'',
        PLLeafDataCache:[],
        PLLeafTplCache:[],
        chkPLData:[],
        chkPLResIds:''
    },
    init:function(){
        this.limitSltEv();
        this.limitProSltEv();
        this.initPLList();
        this.chkPLEv();
        this.chkPLLeafEv();
        this.editCouponLimitEv();
        this.editPromotionLimitEv();
        this.limitProStore();
    },
    limitSltEv:function(){
        var self = this;
        $('#editCouponLimit').fadeOut();
        $('#couponLimit').on("change", function (e) { 
            var v = $(this).val();
            // console.log(v);
            if(v ==='1'){
                self.openPL();
                $('#editCouponLimit').fadeIn();
            }else if(v ==='2'){
                proDia.show(function(spRes){
                    var seled = $.grep(spRes,function(e,i){return e!=undefined});
                    if(seled.length==0){
                        Util.alert("请选择商品");
                        return false;
                    }
                    var proHtml='',spChkIds=[];
                    $.each(seled,function(i,e){
                        spChkIds.push(e.id);
                        proHtml += '<p>'+e.name+'</p> ';
                    });
                    $('#hid_limitIds').val(spChkIds.join('_'));
                    $('#couponLimitCon').addClass('hasChkRes').html(proHtml);
                });

                $('#editCouponLimit').fadeIn();
            }else if(v === '3'){
                brandDia.show(function(brands){
                    if(brands.length>0){
                        var brandStr ='', chkIds = [];

                        for(var i in brands){
                            chkIds.push(brands[i].brandId);
                            brandStr += '<p>'+brands[i].brandName+'</p> ';
                        }
                        
                        $('#hid_limitIds').val(chkIds.join('_'));
                        $('#couponLimitCon').addClass('hasChkRes').html(brandStr);
                    }else{
                        $('#hid_limitIds').val('');
                        $('#couponLimitCon').removeClass('hasChkRes').html('');
                        Util.alert('至少选择1个品牌！');
                        return false;
                    }
                });
                $('#editCouponLimit').fadeIn();
            }else{
                $('#couponLimitCon').removeClass('hasChkRes').html('');
                $('#hid_limitIds').val('');
                $('#editCouponLimit').fadeOut();
            }
        });
    },
    limitProSltEv:function(){
        var self = this;
        $('#editPromotionLimit').fadeOut();
        $('#promotionLimit').on("change", function (e) { 
            var v = $(this).val();
            // console.log(v);
            if(v ==='1'){
                self.openProPL();
                $('#editPromotionLimit').fadeIn();
            }else if(v ==='2'){
                proDia.show(function(spRes){
                    var seled = $.grep(spRes,function(e,i){return e!=undefined});
                    if(seled.length==0){
                        Util.alert("请选择商品");
                        return false;
                    }
                    var proHtml='',spChkIds=[];
                    $.each(seled,function(i,e){
                        spChkIds.push(e.id);
                        proHtml += '<p>'+e.name+'</p> ';
                    });
                    $('#pro_limitIds').val(spChkIds.join('_'));
                    $('#promotionLimitCon').addClass('hasChkRes').html(proHtml);
                });

                $('#editPromotionLimit').fadeIn();
            }else if(v === '3'){
                brandDia.show(function(brands){
                    if(brands.length>0){
                        var brandStr ='', chkIds = [];

                        for(var i in brands){
                            chkIds.push(brands[i].brandId);
                            brandStr += '<p>'+brands[i].brandName+'</p> ';
                        }
                        
                        $('#pro_limitIds').val(chkIds.join('_'));
                        $('#promotionLimitCon').addClass('hasChkRes').html(brandStr);
                    }else{
                        $('#pro_limitIds').val('');
                        $('#promotionLimitCon').removeClass('hasChkRes').html('');
                        Util.alert('至少选择1个品牌！');
                        return false;
                    }
                });
                $('#editPromotionLimit').fadeIn();
            }else{
                $('#promotionLimitCon').removeClass('hasChkRes').html('');
                $('#pro_limitIds').val('');
                $('#editPromotionLimit').fadeOut();
            }
        });
    },
    openPL:function(){
        var self = this, o = this.o;
            dialog({
                title: '选择品类',
                padding:0,
                content:$('#limitPL')[0],
                okValue: '确定',
                ok: function () {
                    // alert('确定');
                    // 将选择结果显示在指定区域
                    if(!o.chkPLResIds){
                        dialog({
                            title:'提示',
                            content:'请选择需要限制的品类！'
                        }).show();
                        return false;
                    }else{
                        $('#couponLimitCon').addClass('hasChkRes').html($('#limitResBox').children().clone());
                        $('#hid_limitIds').val(o.chkPLResIds);
                        return true;
                    }
                },
                cancelValue: '取消',
                cancel: function () {
                    $('#couponLimitCon').removeClass('hasChkRes').html('');
                    $('#hid_limitIds').val('');
                    $('#couponLimit').val(0).trigger('change');
                    return true;
                }
            }).width(720).showModal();

            $('#plListNav a:first').trigger('click');
    },
    openProPL:function(){
        var self = this, o = this.o;
            dialog({
                title: '选择品类',
                padding:0,
                content:$('#limitPL')[0],
                okValue: '确定',
                ok: function () {
                    // alert('确定');
                    // 将选择结果显示在指定区域
                    if(!o.chkPLResIds){
                        dialog({
                            title:'提示',
                            content:'请选择需要限制的品类！'
                        }).show();
                        return false;
                    }else{
                        $('#promotionLimitCon').addClass('hasChkRes').html($('#limitResBox').children().clone());
                        $('#pro_limitIds').val(o.chkPLResIds);
                        return true;
                    }
                },
                cancelValue: '取消',
                cancel: function () {
                    $('#promotionLimitCon').removeClass('hasChkRes').html('');
                    $('#pro_limitIds').val('');
                    $('#promotionLimit').val(0).trigger('change');
                    return true;
                }
            }).width(720).showModal();

            $('#plListNav a:first').trigger('click');
    },
    initPLList:function(){
        var self = this,o = this.o;
        $.ajax({
            url:this.o.getBrandListUrl,
            method:'POST',
            type:'JOSN'
        }).done(function(data){
            if(typeof data !== 'string'){
                if(data.status==='0'){
                    // 成功
                    var res = data.result.categoryFamilyList;
                    if(!$.isArray(res)){
                        res = [res];
                    }

                    if(res.length){
                        // {id:10, familyName:男装, familyPriority:1}
                        $('#plListNav').html(template('PLTpl', {res:res}));
                        for(var i in res){
                            o.PLDataCache[res[i].id] = res[i].familyName;
                        }
                        
                    }else{
                        // 数据为空
                        $('#plListNav').html('暂无数据！');
                    }
                }else{
                    // 1或者401 未登录
                    dialog({
                        title:'提示',
                        content:'未知错误，请联系客服！'
                    }).show();
                }
            }else{
                // 1或者401 未登录
                dialog({
                    title:'提示',
                    content:'未知错误，请联系客服！'
                }).show();
            }
        });
    },
    getPLChildren:function(PLId, $parentBox){
        var self = this, o = this.o;
        // 先从缓存中取，如果缓存中没有，则异步请求
        // var $leafListBox = $('#PLLeaf-'+PLId).length ? $('#PLLeaf-'+PLId): $('<div>',{'id',PLId}).appendTo('#plListLeaf');

        if(o.PLLeafTplCache[PLId]){
            // {id:10, familyName:男装, familyPriority:1}
            $parentBox.show().siblings().hide();

            // 判断当前子类是否全部选中
            var currLeafBox = $('#PLLeaf-'+PLId);
            if(currLeafBox.find('.active').length === currLeafBox.children().length){
                $('#chkAllPL').addClass('active');
            }else{
                $('#chkAllPL').removeClass('active');
            }
        }else{
            if(PLId){
                $.ajax({
                    url:o.getBrandLeafUrl,
                    data:{familyId:PLId},
                    method:'GET',
                    type:'JSON'
                }).done(function(data){
                    if(typeof data !== 'string'){
                        if(data.status==='0'){
                            // 成功
                            var res = data.result.categoryList;
                            if(!$.isArray(res)){
                                res = [res];
                            }
                            if(res.length){
                                // {id:10, familyName:男装, familyPriority:1}
                                $parentBox.html(template('PLLeafTpl', {res:res}));
                                for(var j in res){
                                    o.PLLeafTplCache[PLId] = res;
                                    o.PLLeafDataCache[res[j].id]= res[j].name;
                                }

                                $('#chkAllPL').removeClass('active');
                            }else{
                                // 数据为空
                                $parentBox.html('<p class="c-8 f12">暂无数据！</p>');
                            }
                        }
                    }else{
                        // 未知错误
                        dialog({
                            title:'提示',
                            content:'未知错误，请联系客服！'
                        }).show();
                    }
                });
            }
        }
    },
    chkPLEv:function(){
        var self = this, o = this.o;
        $('#plListNav').on('click','a',function(){
            var $this = $(this), $thisPrt =$this.parent(),
                currInd = $thisPrt.data('curr') ? $thisPrt.data('curr') : 0,
                targetInd = $this.index();
                familyId = $this.data('id');
            if(targetInd !== currInd){
                $this.addClass('active').siblings().andSelf().eq(currInd).removeClass('active');
                $thisPrt.data('curr',targetInd);
            }else{
                $this.addClass('active');
            }

            var $leafListBox = $('#PLLeaf-'+familyId).length ? $('#PLLeaf-'+familyId): $('<div>',{'id': 'PLLeaf-'+familyId}).appendTo('#plListLeaf');
            self.getPLChildren(familyId,$leafListBox);
            $leafListBox.show().siblings().hide();
            o.PLCurrChkId = familyId;
        });
    },
    chkPLLeafEv:function(){
        var self = this, o = this.o;
        $('#plListLeaf').on('click','a',function(){
            var $this = $(this),
                currInd = $this.data('curr')?$this.data('curr'):0,
                targetInd = $this.index(),
                leafId = $this.data('id').split('-');

            $this.data('curr',targetInd);
            $this.toggleClass('active');

            if(!$.isArray(o.chkPLData[leafId[0]])){
                o.chkPLData[''+leafId[0]]=[];
            }

            var tI = (o.chkPLData[leafId[0]]).indexOf(leafId[1]);

            if($this.hasClass('active') && tI<0){
                // 添加
                o.chkPLData[leafId[0]].push(leafId[1]);
            }else{
                // 删除
                o.chkPLData[leafId[0]].splice(tI,1);
                $('#chkAllPL').removeClass('active');
            }

            // 更新选择结果
            self.showChkPLRes();
        });

        // 全选：
        $('#chkAllPL').on('click', function(){
            var $this = $(this);
            $this.toggleClass('active');

            if($this.hasClass('active')){
                $('#PLLeaf-'+o.PLCurrChkId).children().addClass('active');
                var t = [];
                for(var x in o.PLLeafTplCache[o.PLCurrChkId]){
                    t.push(o.PLLeafTplCache[o.PLCurrChkId][x].id);
                }
                o.chkPLData[o.PLCurrChkId]=t;
            }else{
                $('#PLLeaf-'+o.PLCurrChkId).children().removeClass('active');
                o.chkPLData[o.PLCurrChkId]=[];
            }

            self.showChkPLRes();
        });
    },
    showChkPLRes:function(){
        var self = this, o= this.o, resHtml='', isFirst=true, resArr=[];
        if(o.chkPLData.length){
            for(var i in o.chkPLData){
                if(o.chkPLData[i].length){
                    resArr = resArr.concat(o.chkPLData[i]);
                    resHtml +='<p><b>' + o.PLDataCache[i] + "</b>：";
                    for(var k in o.chkPLData[i]){
                        resHtml += o.PLLeafDataCache[o.chkPLData[i][k]]+'/';
                    }
                    resHtml = resHtml.substring(0,resHtml.length-1)+'</p>';
                }
            }
            $('#limitResBox').html(resHtml);
            // console.log(resArr);
            o.chkPLResIds= resArr.join('_');
        }else{
            $('#limitResBox').html('请选择需要限制的品类。');
        }
    },
    editCouponLimitEv:function(){
        $('#editCouponLimit').on('click', function(){
            $('#couponLimit').trigger('change');
        });
    },
    editPromotionLimitEv:function(){
        $('#editPromotionLimit').on('click', function(){
            $('#promotionLimit').trigger('change');
        });
    },
    limitProStore:function(){
        $("#limitProStoreSel").on("change",function(){
            if($(this).val()=="1"){
                // console.log(stockIdList);
                $.popupStoreSelect({
                    title:"选择门店",
                    type:"multiple",
                    okCallback:function(list){
                        console.log(list);
                        var storeIdList = [],storeNameList=[];
                        $.each(list,function(i,e){
                            storeIdList.push(e.id);
                            storeNameList.push(e.name);
                        });
                        if(storeIdList.length==0){
                            Util.alert("请选择门店");
                            return false;
                        }
                        $("#limitProStoreCon").addClass("hasChkRes").find("p").html(storeNameList.join("/"));
                        $("#limitProStoreIds").val(storeIdList.join("_"));
                        $("#changeProStore").show();
                    }
                });
            }else{
                $("#limitProStoreCon").removeClass("hasChkRes").find("p").empty();
                $("#limitProStoreIds").val("");
                $("#changeProStore").hide();
            }
        });
        $("#changeProStore").on("click",function(){
            if($("#limitProStoreSel").val()=="1"){
                $.popupStoreSelect();
            }
        });
    }
} 
createCoupon.init();

$.fn.couponCodeUploader = function(options){
    Util.loadUploadScript();
    var _this = $(this);
    var setIntervalCon = setInterval(function(){
        if(typeof WebUploader != "undefined"){
            clearInterval(setIntervalCon);
            var uploader = WebUploader.create({
                auto: true,
                swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
                server: '../fileUpload.json',
                // runtimeOrder : "flash",
                pick:{
                    id:_this[0],
                    multiple : false
                },
                duplicate : true,
                accept: {
                    title: 'File',
                    extensions : 'csv',
                    mimeTypes: 'text/csv'
                },
                formData : {"json":'{"type":3,"ext":"csv"}'}
            });
            uploader.on("beforeFileQueued",function(file){
                if($("#couponId").val() === ""){
                    Util.alert("请先创建优惠券");
                    return false;
                }
            }).on("uploadStart",function(file){
                dialog({
                    id:"util-uploading",
                    fixed: true,
                    content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;优惠券码正在导入中，请勿离开页面',
                    width:300,
                    backdropOpacity:"0"
                }).showModal();
            }).on("uploadSuccess",function(file,response){
                var url = response.result.url;
                $.getJSON("createBatchFileTask.json?fileUrl="+url+"&fileType=4",function(data){
                    var getLastTask = setInterval(function(){
                        $.getJSON("getLastBatchFileTask.json?taskId="+data.result.batchFileTask.id,function(data){
                            var status = data.result.batchFileTask ? data.result.batchFileTask.status : "empty";
                            if(status == 20){
                                clearInterval(getLastTask);
                                var taskId = data.result.batchFileTask.id;
                                $.getJSON("getBatchFileTaskCouponCodeList.json?taskId="+taskId,function(result){
                                    dialog({ id:"util-uploading" }).close();
                                    if(result.status=="0"){
                                        createPromotion.previewCodeUpload(taskId,result.result.total,result.result.errorList,result.result.previewList)
                                    }else{
                                        Util.alert(result.errmsg ? result.errmsg : "系统繁忙，请稍后再试")
                                    }
                                });
                            }else if(status == 4){
                                clearInterval(getLastTask);
                                Util.alert(data.result.batchFileTask.msg ? data.result.batchFileTask.msg : "导入出错，请检查格式或稍后重试");
                                dialog({ id:"util-uploading" }).close();
                            }
                        });
                    },2000);
                });
            }).on("uploadError",function(file, reason,result){
                Util.alert("上传失败，请稍后再试或刷新页面重试");
            }).on("error",function(msg){
                Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确，请上传.csv文件" : msg);
            });
        }
    },100);
}
