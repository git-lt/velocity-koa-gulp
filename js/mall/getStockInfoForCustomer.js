template.config('escape', false);
template.helper('starsFormat', function (data, format) {
    if(!data) return 0;
    format = parseInt(data)*20;
    return format;
});
template.helper('normsFormat', function (data, format) {
    if(!data) return "";
    var normsArr = ["","颜色","尺码","重量","版本","材质","尺寸","其它","段位","网络制式","类型","容量","型号","日期","大小","座垫套件数量","钻石重量","钻石颜色","钻石净度","组合","自定义项","种类","纸张规格","珍珠直径","珍珠颜色","遮阳挡件数","长度","圆床尺寸","雨刷尺寸","有效期","邮轮房型","绣布CT数","胸围尺码","胸垫尺码","鞋码（内长）","鞋码","镶嵌材质","香味","线长","线号","线材长度","系列","洗车机容量","袜子尺码","娃娃尺寸","套餐","手镯内径","适用年龄","适用户外项目","适用规格","适用范围","适用床尺寸","适用","剩余保质期","上市时间","色温","伞面尺寸","撒的发","入住时段","皮带长度","内裤尺码","内存","奶嘴规格","帽围","毛色","链子长度","类型（例如实体票,电子票）","款式","口味","克重","开本","镜子尺寸","镜片适合度数","净含量","金重","戒圈","介质","建议身高（尺码）","吉祥图案","机芯","画框尺寸","画布尺寸","花束直径","花盆规格","户外手套尺码","户外帽尺码","锅身直径尺寸","锅具尺寸","贵金属成色","规格尺寸","规格（粒/袋/ml/g）","规格","功率","佛珠尺寸","粉粉份量","房型","防潮垫大小","方形地毯规格","儿童/青少年床尺寸","钓钩尺寸","蛋糕尺寸","大小描述","瓷砖尺寸（平方毫米）","床品尺寸","床垫厚度","床垫规格","床尺寸","窗帘尺寸（宽X高)","出行日期","出行人群","出发日期","宠物适用尺码","乘客类型","车用香水香味","产地","布尿裤尺码","笔芯颜色","包装","安全套规格","类别","次数","服务类型","金额","木杆","铁杆","推杆","分类"];
    format = normsArr[data];
    return format;
});
if(getUrlParam("salesId")||getUrlParam("owner")){
    sessionStorage.salesId = getUrlParam("salesId")||getUrlParam("owner");
}
var page = {
    o:{
        stockId:getUrlParam("stockId"),
        from:getUrlParam("from"),
        stockVo:null,
        appriseLoaded:false,
        recommendLoaded:false,
        existedRule:{},
        existedRuleStore:{},
        seledColor:"默认",
        seledSize:"默认",
        skuId:"",
        limitCount:null,
        shoppingType:"",
        deliveryStockType:1,
        pickupStockType:1
    },
    init:function(){
        // FAST_CLICK && $.bindFastClick(); ！！加上会有bug！！
        this.getStockInfo();
        this.insertFav();
        this.shoppingEv();
    },
    getStockInfo:function(){
        var o = this.o;
        $.getJSON("getStockInfo.json?stockId="+o.stockId,function(data){
            if(data.status!=0) return false;
            o.stockVo = data.result.stockVo;
            o.limitCount = o.stockVo.productSupplier.limitCount;
            o.deliveryStockType = data.result.deliveryStockType;
            o.pickupStockType = data.result.pickupStockType;
            document.title=o.stockVo.productSupplier.name;
            var previewImags = o.stockVo.productSupplier.previewJson || 'https://qncdn.qiakr.com/mall/defaultImg3.png';
            var stockInfo = template("stockMessage",{
                stockVo:o.stockVo,
                previewImags:previewImags.split(","),
                clientWidth:$(window).width(),
                salesId:$("#salesId").val(),
                promotion:data.result.discountPromotionRandom
            });
            $("#homePageContainer").prepend(stockInfo);
            page.initSlide();
            page.loadAPPriseAndRecommend();
            var contactUrl = $("#salesId").val() ? ("contactSales.htm?salesId="+$("#salesId").val()) : $("#pageChat").attr("href");
            $("#goChat").attr("href","javascript:page.jumpChat('" + contactUrl + "')");
            $("#shoppingCartBtn").attr("href","getShoppingCart.htm?suid="+o.stockVo.supplier.id);
            if(o.stockVo.stock.off + o.stockVo.stock.status > 0){
                $("#shoppingNow").remove();
                $("#shoppingCart").html("该商品已下架").addClass("disabled").css("width","100%");
                return false;
            }
            // initSku
            var norms1List=[],norms2List=[];
            $.each(o.stockVo.stockSkuVoList,function(i,e){
                if(norms1List.indexOf(e.productSku.color)<0){
                    norms1List.push(e.productSku.color);
                }
                if(norms2List.indexOf(e.productSku.size)<0){
                    norms2List.push(e.productSku.size);
                }
                if(e.stockSku.skuCount){
                    if(!o.existedRule[e.productSku.color]){
                        o.existedRule[e.productSku.color]=[];
                    }
                    o.existedRule[e.productSku.color].push(e.productSku.size);
                    if(!o.existedRule[e.productSku.size]){
                        o.existedRule[e.productSku.size]=[];
                    }
                    o.existedRule[e.productSku.size].push(e.productSku.color);
                }
            });
            $.each(o.stockVo.nativeStockSkuVoList,function(i,e){
                if(e.stockSku.skuCount){
                    if(!o.existedRuleStore[e.productSku.color]){
                        o.existedRuleStore[e.productSku.color]=[];
                    }
                    o.existedRuleStore[e.productSku.color].push(e.productSku.size);
                    if(!o.existedRuleStore[e.productSku.size]){
                        o.existedRuleStore[e.productSku.size]=[];
                    }
                    o.existedRuleStore[e.productSku.size].push(e.productSku.color);
                }
            });
            var skuInfo = template("tpl_skuSelect",{
                stockVo:o.stockVo,
                norms1List:norms1List,
                norms2List:norms2List
            });
            $(".skuPopupBox").append(skuInfo);
            page.countController();
            page.changeGetStockType(norms1List,norms2List);
            $("#getStockType .skuBox:first").trigger("click");
        });
    },
    jumpChat: function(url){
        var salesListUrl = 'bandingSales.htm?storeId=' + $("#storeId").val() + '&redirect=chat';
        switch(parseInt(saleStatus)){
            case 1: //离职
                $.confirm('该顾问已离职，是否切换其他顾问？','提示', function(){
                    window.location.href = $("#salesId").val() ? url : salesListUrl;  
                });
                break;
            case 2: //换门店
                $.confirm('该顾问已换其他门店，是否切换其他顾问？','提示', function(){
                    window.location.href = $("#salesId").val() ? url : salesListUrl;
                });
                break;
            default:
                window.location.href = url;    
        }
    },
    initSkuEvent:function(rule,voList){
        var o = this.o;
        if(!o.stockVo.productSupplier.norms1Id && !o.stockVo.productSupplier.norms2Id){
            o.skuId=o.stockVo[voList][0].productSku.id;
            var count = o.stockVo[voList][0].stockSku.skuCount;
            // attr('data-limit'.xxx)不要用data('limit',XX),safari下会有问题
            $("#countInput").val("1").attr("data-limit",o.limitCount>0 ? Math.min(o.limitCount,count) : count);
            $(".countController .sub").addClass("disabled");
            $(".countController .add").removeClass("disabled");
             $("#skuConfirmBtn").removeClass("disabled");
        }else if(!o.stockVo.productSupplier.norms2Id){
            var s = o[rule]['默认'] || [];
            $('#colorSkus i').each(function () {
                if (s.indexOf(this.title) > -1){
                    $(this).removeClass('disabled');
                }else{
                    $(this).addClass('disabled');
                }
            });
        }
        $('#colorSkus i,#sizeSkus i').off().click(function () {
            var t = $(this), isSize = t.parent().attr('id') == 'sizeSkus';
            if (t.hasClass('disabled')) return false;
            if(t.hasClass('ac')){
                t.removeClass('ac');
                $("#skuConfirmBtn").addClass("disabled");
                $("#countInput").val("1").attr("data-limit","1");
                $(isSize ? '#colorSkus i' : '#sizeSkus i').removeClass("disabled");
                return false;
            }
            t.addClass('ac').siblings().removeClass('ac');
            o[isSize ? "seledSize" :"seledColor"] = t.attr('title');
            var s = o[rule][t.attr('title')] || []; //获取规则
            $(isSize ? '#colorSkus i' : '#sizeSkus i').each(function () {
                if (s.indexOf(this.title) > -1){
                    $(this).removeClass('disabled');
                }else{
                    $(this).addClass('disabled');
                }
            });
            if($("#sizeSkus").length > 0){  //代表2种规格
                if($("#colorSkus i.ac").length > 0 && $("#sizeSkus i.ac").length > 0){
                    $.each(o.stockVo[voList],function(i,e){
                        if(e.productSku.color==o.seledColor && e.productSku.size==o.seledSize){
                            o.skuId=e.productSku.id;
                            $("#skuCountLast").html(e.stockSku.skuCount);
                            $("#skuPrice").html('¥'+e.stockSku.skuPrice);
                            $("#countInput").val("1").attr("data-limit",o.limitCount ? Math.min(o.limitCount,e.stockSku.skuCount) : e.stockSku.skuCount);
                            $(".countController .sub").addClass("disabled");
                            $(".countController .add").removeClass("disabled");
                            $("#skuConfirmBtn").removeClass("disabled");
                        }
                    });
                }
            }else{
                $.each(o.stockVo[voList],function(i,e){
                    if(e.productSku.color==o.seledColor){
                        o.skuId=e.productSku.id;
                        $("#skuCountLast").html(e.stockSku.skuCount);
                        $("#skuPrice").html('¥'+e.stockSku.skuPrice);
                        $("#countInput").val("1").attr("data-limit",o.limitCount ? Math.min(o.limitCount,e.stockSku.skuCount) : e.stockSku.skuCount);
                        $(".countController .sub").addClass("disabled");
                        $(".countController .add").removeClass("disabled");
                        $("#skuConfirmBtn").removeClass("disabled");
                    }
                });
            }
        });
    },
    shoppingEv:function(){
        var o = this.o;
        $("#shoppingCart,#shoppingNow").on("click",function(e){
            var _t = this;
            $.post('getCustomerCard.json',{supplierId:o.stockVo.supplier.id},function(data){
                if(data.status==='0'){
                    if(!data.result.customerCard || !data.result.customerCard.cardNo) {
                        require(["../js/mall/regVip.js"],function(Vip){
                            Vip.regVip({
                                external: data.result.external,
                                suid:o.stockVo.supplier.id,
                                successFn:function(){
                                    showSku(_t);
                                }
                            });
                        });
                    }else{
                        showSku(_t);
                    }
                }
            });
            function showSku(e){
                $(".skuPopupBox").show().addClass('actionBottom');
                $(".ui-mask").show();
                $("body").css("overflow","hidden");
                if($(".skuPopupBox").height() > $(window).height()){
                    $(".skuPopupBox").css("max-height",$(window).height()-20);
                    $("#skuBoxWrap").css({"height":$(window).height()-30,"overflow":"auto"});
                }
                o.shoppingType = e.id == 'shoppingNow' ? "buy" : "cart"; 
            }
        });

        $("body").on("click","#skuConfirmBtn",function(){
            if(o.shoppingType == "cart"){
                var params={
                   stockId:o.stockVo.stock.id,
                   skuId:o.skuId,
                   shoppingCount:$("#countInput").val(),
                   salesId:sessionStorage.salesId||$("#salesId").val(),//to do: set sessionstroge 
                   deliveryType:$("#getStockType .ac").data("type")
                }
                $.post("insertOrUpdateCustomerShoppingCart.json",params,function(data){
                    if(data.status == "0"){
                        $(".closeMask").trigger("click");
                        msg.confirm({
                            title:"添加成功",
                            content:"产品已成功添加至购物车",
                            buttons: [
                                { text:'继续购物', id:"qqwewrwer324", handler:function(oThis, val){ oThis.close(); } },
                                { text:'立即结算', id:"werer3435", handler:function(){location.href="getShoppingCart.htm?suid="+o.stockVo.supplier.id} }
                            ]
                        });
                        $(".newCartAni").removeClass("ac").show().addClass("ac");
                        if($(".hasShoppingCart").length==0){
                            $("#shoppingCartBtn").append('<span class="hasShoppingCart">1</span>');
                        }
                    }else if(data.status=="401"){
                        showMPLoginBox(function(){
                            $("#skuConfirmBtn").trigger("click");
                        },o.stockVo.supplier.id);
                    }
                });
            }else{
                var data = [{
                    delivery:$("#getStockType .ac").data("type"),
                    sourceType:o.stockVo.stock.sourceType,
                    storeId:$("#storeId").val(),
                    storeName:$("#storeMsg").text(),
                    supplierId : o.stockVo.supplier.id,
                    stockList:[{
                        id : o.stockVo.stock.id,
                        img : o.stockVo.stock.productPicUrl,
                        name : o.stockVo.productSupplier.name,
                        price : parseFloat($("#skuPrice").text().replace("¥","")),
                        color : o.seledColor,
                        size : o.seledSize,
                        count : $("#countInput").val(),
                        skuId : o.skuId
                    }]
                }];
                sessionStorage.stockInfo = JSON.stringify(data);
                if(sessionStorage.isLogin == "false"){
                    showMPLoginBox(function(){
                        location.href="confirmOrderInfo.htm?suid="+o.stockVo.supplier.id+"&storeId="+$("#storeId").val();
                    },o.stockVo.supplier.id);
                    return false;
                }
              window.location.href="confirmOrderInfo.htm?suid="+o.stockVo.supplier.id+"&storeId="+$("#storeId").val();
            }
        }).on("click",".closeMask",function(){
            $(".skuPopupBox").hide();
            $(".ui-mask").hide();
            $("body").css("overflow","auto");
        });
    },
    changeGetStockType:function(norms1List,norms2List){
        var o = this.o;
        $("#getStockType .skuBox").on("click",function(){
            if($(this).hasClass("ac")) return false;
            $(this).addClass("ac").siblings().removeClass("ac");
            $('#colorSkus i,#sizeSkus i').removeClass("ac").removeClass("disabled");
            
            $("#skuConfirmBtn").addClass("disabled");
            if($(this).data("type")=="1"){
                if(o.deliveryStockType==1){
                    page.initSkuEvent('existedRule','stockSkuVoList');
                    $("#skuCountLast").html(o.stockVo.stock.count);
                    if(o.stockVo.stock.count==0){
                        $("#skuConfirmBtn").addClass("disabled");
                    }
                }else{
                    page.initSkuEvent('existedRuleStore','nativeStockSkuVoList');
                    $("#skuCountLast").html(o.stockVo.nativeStock.count);
                    if(o.stockVo.nativeStock.count==0){
                        $("#skuConfirmBtn").addClass("disabled");
                    }
                }
            }else{
                if(o.pickupStockType==1){
                    page.initSkuEvent('existedRule','stockSkuVoList');
                    $("#skuCountLast").html(o.stockVo.stock.count);
                    if(o.stockVo.stock.count==0){
                        $("#skuConfirmBtn").addClass("disabled");
                    }
                }else{
                    $("#skuCountLast").html(o.stockVo.nativeStock.count);
                    page.initSkuEvent('existedRuleStore','nativeStockSkuVoList');
                    if(o.stockVo.nativeStock.count==0){
                        $("#skuConfirmBtn").addClass("disabled");
                    }
                }
                
            }
            if(norms1List.length==1){
                $('#colorSkus i').eq(0).trigger("click");
            }
            if(norms2List.length==1){
                $('#sizeSkus i').eq(0).trigger("click");
            }
            if(o.stockVo.productSupplier.norms1Id && !o.stockVo.productSupplier.norms2Id && norms1List.length>1){
                $('#colorSkus i').eq(0).not(".disabled").trigger("click");
            }
        });
    },
    countController:function(){
        $(".countController").on("click",".add",function(){
            var _t = $(this);
            var count = ~~$("#countInput").val(),limit = ~~$("#countInput").data("limit");
            if(count < limit){
                $(".countController .sub").removeClass("disabled");
                $("#countInput").val(count+1);
                if(count+1==limit){
                    _t.addClass("disabled");
                }
            }
        });
        $(".countController").on("click",".sub",function(){
            var _t = $(this);
            var count = ~~$("#countInput").val(),limit = ~~$("#countInput").data("limit");
            if(count > 1){
                $(".countController .add").removeClass("disabled");
                $("#countInput").val(count-1);
                if(count==2){
                    _t.addClass("disabled");
                }
            }
        });
        $("#countInput").on("input keypress keyup paste cut",function(){
            if(~~$(this).val() > ~~$(this).data("limit")){
                $(this).val($(this).data("limit"));
            }else if(~~$(this).val() < 1){
                $(this).val("1");
            }
        });
    },
    initSlide:function(){
        $.mggScrollImg('.main_image ul',{
            loop : true,//循环切换
            auto : true //自动切换
        });
    },
    insertFav:function(){
        var o = this.o;
       $("#insertFav").click(function(){
            if(!$(this).hasClass("on")){
                $.getJSON("insertCustomerFavorite.json?stockId="+o.stockId+"&salesId="+sessionStorage.salesId,function(data){
                    if(data.status == "0"){
                        mobileToastMin("收藏成功");
                        $("#insertFav").addClass("on").html('<i class="iconfont c-or">&#xe61a;</i><p class="c-or">已收藏</p>');
                    }else if(data.status=="401"){
                        showMPLoginBox(function(){
                          $("#insertFav").trigger("click");
                        });
                    }
                });
            }else{
                $.getJSON("deleteCustomerFavorite.json?stockId="+o.stockId,function(data){
                    if(data.status == 0){
                        mobileToastMin("已取消收藏");
                        $("#insertFav").removeClass("on").html('<i class="iconfont">&#xe619;</i><p>收藏</p>');
                    }
                });
            }
        });
    },
    loadAPPriseAndRecommend:function(){
        var o = this.o;
        var wHeight = window.screen.height;
        $(document).on("scroll",function(){
            var top = $("body").scrollTop(),
            appriseTop = $("#appriseContainer").offset().top,
            recommendTop = $("#recommendContainer").offset().top;
            if(!o.appriseLoaded){
                if(wHeight + top >= appriseTop){
                    o.appriseLoaded = true;
                    $.getJSON("getStockAppraiseList.json?stockId="+o.stockId+"&index=0&length=1",function(data){
                        if(data.status="0"){
                            var tData = data.result.appraiseStockVoList;
                            if(tData.length){
                                var str = template('tpl_appraise', {
                                    list:tData,
                                    count:data.result.count,
                                    stockId:o.stockId,
                                    from:o.from
                                });
                                $('#appriseContainer').html(str);
                            }
                        }
                    });
                }
            }
            if(!o.recommendLoaded){
                if(wHeight + top >= recommendTop){
                    o.recommendLoaded = true;
                    var params = {
                        storeId:o.stockVo.stock.ownerId,
                        productId:o.stockVo.stock.productId,
                        stockId:o.stockId
                    }
                    $.getJSON("getRecommendStockList.json",params,function(data){
                        if(data.status="0"){
                            var tData = data.result.stockList;
                            if(tData.length){
                               var commendStr = template('tpl_recommend', {
                                    list:tData,
                                    stockId:o.stockId,
                                    from:o.from
                                });
                                $('#recommendContainer').html(commendStr);
                            }
                        }
                    });
                }
            }
        });
    }
}

page.init();   