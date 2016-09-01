// 无限加载
var LoadDataByScroll = function(o){
    this.timer = null;
    this.loadH = o.loadH || 250;
    this.innerH = window.innerHeight;
    this.pageNum = o.pageNum || 1;
    this.pageTotal = o.pageTotal || 10;
    this.loadFn = o.loadFn;
    this.endFn = o.endFn;

    this.init();
};
LoadDataByScroll.prototype={
    init:function(){
        this.addScrollEv();
    },
    loadStart:function(){
        var pageNum = this.pageNum;
        var pageTotal = this.pageTotal;
        var loadFn = this.loadFn;
        var endFn = this.endFn;
        var self = this;
        var dis = 0;
        var _body = window.document.body;

        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(function(){
            dis = _body.scrollHeight - _body.scrollTop - self.innerH;
            console.log(dis);
            if(dis<=self.loadH){
                if(self.pageNum >= self.pageTotal){
                    console.log('over');
                $(window).off('scroll');
                    endFn && endFn();
                }else{
                    self.pageNum++;
                    console.log(self.pageNum);
                    loadFn && loadFn(self.pageNum);
                }
            }
        }, 100);
    },
    addScrollEv:function(){
        $(window).on('scroll', this.loadStart.bind(this));
    }
}

// Native 分享
;(function(window){
    var DEBUG = true;
    var callbacks = {};
    var guid = 0;
    var ua = navigator.userAgent;

    var ANDROID = /android/i.test(ua);
    var IOS = /iphone|ipad/i.test(ua);
    var WP = /windows phone/i.test(ua);

    function log() {
        if (DEBUG) {
            console.log.call(console, Array.prototype.join.call(arguments, ' '));
        }
    }
    function invoke(cmd) {
        if (ANDROID) {
            prompt(cmd);
        }
        else if (IOS) {
            location.href = 'qiakr://' + window.encodeURIComponent(cmd);
        }
    }

    var Hybrid = {
        callByJS: function(opt) {
            log('callByJS', JSON.stringify(opt));
            var pms = {};
            pms.name = opt.name;
            pms.token = ++guid;
            pms.param = opt.param || {};
            callbacks[pms.token] = opt.callback;

            invoke(JSON.stringify(pms));
        },
        callByNative: function(opt) {
            log('callByNative', JSON.stringify(opt));
            var callback = callbacks[opt.token];
            var result = opt.result || {};
            var script = opt.script || '';

            if (script) {
                log('callByNative script', script);
                try {
                    invoke(JSON.stringify({
                        token: opt.token,
                        result: eval(script)
                    }));
                }catch(e) {
                    console.error(e);
                }
            }
            else if (callback) {
                callback(result);
                try {
                    delete callback;
                    log(callbacks);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

    window.Hybrid = Hybrid;
})(window);

window.Hybrid_Share = function(){
 var opt = {
    name:'share',
    param:{
        title: $('#shareTit').text(), 
        desc:  $('#shareDesc').text(), 
        img: $('#shareImg').attr('src').trim(), 
        url: location.protocol+"//"+location.host+"/mall/getSpecialPromotion.htm?id="+getUrlParam("id")+"&suid="+getUrlParam("suid")+"&salesId="+getUrlParam("salesId")
    }
 };
 Hybrid.callByJS(opt);
}
window.Hybrid_init = function(){
 var opt = {
    name:'share',
    param:{
        title: $('#shareTit').text(), 
        desc:  $('#shareDesc').text(), 
        img: $('#shareImg').attr('src').trim(), 
        url: location.protocol+"//"+location.host+"/mall/getSpecialPromotion.htm?id="+getUrlParam("id")+"&suid="+getUrlParam("suid")+"&salesId="+getUrlParam("salesId")
    }
 };
 Hybrid.callByJS(opt);
}

$(function(){
    // 获取推广商品列表
    var skuArray=[], //单个产品 的sku信息
        skuFormatCount=0,
        limitBuyCount=0,
        _skuId,
        isPreview = getUrlParam("type")=="preview",
        salesId = getUrlParam('salesId'),
        suid = getUrlParam('suid'),
        skuArr=[], //所有产品的sku信息
        skuInfoArr=[]; //产品的sku列表

    if(isPreview){
        $("a").attr("href","javascript:;")
    }

    var spPms={
        index:'0',
        length:'10',
        supplierId:suid,
        id:getUrlParam("id")
    };
    $.post('getSpecialPromotion.json', spPms, function(data){
        if(data.status=="0"){
            var result = data.result.storeSpecialPromotionStockVoList;
            var listArray = [];
            if($('#isEmptyProm').length){
                alert('该专题活动已经结束！')
                window.location.href = "../store.htm?suid="+($('#suid').val()||0);
            }

            $.each(result,function(i,e){
                var colorArray=[],sizeArray=[],totalCount=0,skuArraym=[];

                if(e.storeStockVo){
                    listArray.push({
                        id:e.storeStockVo.stock.id,
                        salesId:salesId || e.salesId,
                        previewJson:e.storeStockVo.productSupplier.previewJson.split(","),
                        name:e.storeStockVo.productSupplier.name,
                        desct:e.stockDescription,
                        status:e.storeStockVo.stock.status,
                        minSkuPrice:e.storeStockVo.minSkuPrice.toFixed(2),
                        maxSkuPrice:e.storeStockVo.maxSkuPrice.toFixed(2),
                        tagPrice:e.storeStockVo.stock.tagPrice.toFixed(2),
                        stockType:e.stockType || 1
                    });
                }else if(e.flashsaleVo){
                    var fData = e.flashsaleVo.flashsaleStock;
                    listArray.push({
                        id:fData.id,
                        salesId:salesId || e.salesId,
                        previewJson:fData.previewJson.split(","),
                        name:fData.productName,
                        desct:e.stockDescription,
                        status:fData.status,
                        minSkuPrice:e.flashsaleVo.minPrice.toFixed(2),
                        maxSkuPrice:e.flashsaleVo.maxPrice.toFixed(2),
                        tagPrice:fData.tagPrice.toFixed(2),
                        stockType:e.stockType || 1
                    });
                }
            });

            var dataHtml = template('stockItemTpl', {list : listArray, fromApp:isPreview});
            $(".csp-list-box").append(dataHtml);
            slideStockImages();

            // 上拉无限分页
            var count = data.result.count;
            var pageLength = ~~spPms.length;
            pageTotal = Math.ceil(count/pageLength);
            if(pageTotal>1){
                new LoadDataByScroll({
                    pageTotal:pageTotal,
                    loadFn:function(pageNum){
                        spPms.index = (pageNum-1)*pageLength+'';
                        $.post('getSpecialPromotion.json',spPms, function(data){
                            if(data.status==='0'){
                                if(data.result.count===0){
                                    return;
                                }

                                var result = data.result.storeSpecialPromotionStockVoList;
                                var listArray = [];

                                $.each(result,function(i,e){
                                    var colorArray=[],sizeArray=[],totalCount=0,skuArraym=[];
                                    if(e.storeStockVo){
                                        listArray.push({
                                            id:e.storeStockVo.stock.id,
                                            salesId:salesId || e.salesId,
                                            previewJson:e.storeStockVo.productSupplier.previewJson.split(","),
                                            name:e.storeStockVo.productSupplier.name,
                                            desct:e.stockDescription,
                                            status:e.storeStockVo.stock.status,
                                            minSkuPrice:e.storeStockVo.minSkuPrice.toFixed(2),
                                            maxSkuPrice:e.storeStockVo.maxSkuPrice.toFixed(2),
                                            tagPrice:e.storeStockVo.stock.tagPrice.toFixed(2),
                                            stockType:e.storeStockVo.stock.stockType || 1
                                        });
                                    }else if(e.flashsaleVo){
                                        var fData = e.flashsaleVo.flashsaleStock;
                                        listArray.push({
                                            id:fData.id,
                                            salesId:salesId || e.salesId,
                                            previewJson:fData.previewJson.split(","),
                                            name:fData.productName,
                                            desct:e.stockDescription,
                                            status:fData.status,
                                            minSkuPrice:e.flashsaleVo.minPrice.toFixed(2),
                                            maxSkuPrice:e.flashsaleVo.maxPrice.toFixed(2),
                                            tagPrice:fData.tagPrice.toFixed(2),
                                            stockType:e.stockType || 1
                                        });
                                    }
                                    
                                });

                                var dataHtml = template('stockItemTpl', {list : listArray, fromApp:isPreview});
                                $(".csp-list-box").append(dataHtml);
                                slideStockImages();
                            }
                        })
                    },
                    endFn:function(){
                        $('#salesAppraiseVoListBox').append('<li><div class="tc p20 c-8">没有更多了</div></li>');
                    }
                })
            }
        }
    });

    // 商品图片轮播
    function slideStockImages(){
        $(".swiper-containter .main_image li img").width(document.body.clientWidth-60);
        $(".swiper-containter").each(function(i,e){
            var _t = $(this);
            $.mggScrollImg(_t.find('.main_image ul'),{
                loop : true,//循环切换
                auto : false//自动切换
            });
        });
    }
    var currSalesId = 0;

    $(document).on("click",".buyNow",function(){
        // 预览不执行
        if(getUrlParam("type")=="preview"){
            return false;
        }else{
            location.href="getStockInfoForCustomer.htm?stockId="+$(this).data("stockid")+"&salesId="+$(this).data("salesid");
        }
    })
});




