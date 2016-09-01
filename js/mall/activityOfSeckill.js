Zepto(function($){
    var suid = getUrlParam("suid");
    qkUtil.loading.show();
    $.ajax({
        url:'getFlashsale.json',
        type:"POST",
        dataType: 'json',
        cache:false,
        data:{
            promotionId:$("#promotionId").val(),
            supplierId:suid
        },
        success:function(data){
            if(data.status == '0'){
                var time = data.result.nowtime,
                    today = getLocalTime(time,true),
                    promProList={};
                if(data.result.flashsaleVoList.length==0){
                    $("#viewStockList .empty").show();
                }else{
                    $(".seckillTips").show();
                    promProList["0"]=[];
                    $.each(data.result.flashsaleVoList,function(i,e){
                        var startTime = e.flashsaleStock.startTime,
                            startDate = getLocalTime(e.flashsaleStock.startTime,true),
                            endTime = e.flashsaleStock.endTime,
                            endDate = getLocalTime(e.flashsaleStock.endTime,true);
                        if((startTime < time && endTime>time) || startDate==today){
                            promProList["0"].push(e);
                        }else{
                            if(!promProList[startTime]){
                                promProList[startTime]=[];
                            }
                            promProList[startTime].push(e);
                        }
                    });
                    var listArray=[];
                    for(var item in promProList){
                        listArray.push({
                            time:item,
                            data:promProList[item]
                        });
                    }
                    var stockHtml = template("stockTemp",{list:listArray,now:time});
                    $("#viewStockList").html(stockHtml);
                    // 预览
                    if(getUrlParam("type")=="preview"){
                        $("a").removeClass("linkNeedLogin").attr("href","javascript:;");
                        $('.order.btn,.gotoStoreLink').addClass('disabled');
                    }
                }
                qkUtil.loading.hide();
            }
        },
        error:function(xhr, errorType, error){
            alert(errorType)
        }
    });
    
    if(getUrlParam("salesId")||getUrlParam("owner")){
        sessionStorage.salesId = getUrlParam("salesId")||getUrlParam("owner");
    }


    $("body").on("click",".seckillTips",function(){
        $(".skuPopupBox").show().addClass('actionBottom');
        $(".ui-mask").show();
    }).on("click","#closeDescription",function(){
        $(".skuPopupBox").hide();
        $(".ui-mask").hide();
    }).on("click",".ui-mask",function(){
        $(".skuPopupBox").hide();
        $(".ui-mask").hide();
    });
});

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
// 兼容老版本
 var opt = {
    name:'share',
    param:{
        title: $('title').text(), 
        desc:  $('title').text(), 
        img: $('#shareImg').attr('src').trim(), 
        url: location.protocol+"//"+location.host+"/mall/activityOfSeckill.htm?suid="+getUrlParam("suid")+"&salesId="+getUrlParam("salesId")
    }
 };
 Hybrid.callByJS(opt);
}

window.Hybrid_init = function(){
 var opt = {
    name:'share',
    param:{
        title: $('title').text(), 
        desc:  $('title').text(), 
        img: $('#shareImg').attr('src').trim(), 
        url: location.protocol+"//"+location.host+"/mall/activityOfSeckill.htm?suid="+getUrlParam("suid")+"&salesId="+getUrlParam("salesId")
    }
 };
 Hybrid.callByJS(opt);
}
