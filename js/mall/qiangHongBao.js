function getDateDiff(startTimeUnix, endTimeUnix){
    var dataSpan = endTimeUnix - startTimeUnix;

    //计算出相差天数
    var days=Math.floor(dataSpan/(24*3600*1000))
     
    //计算出小时数
    var leave1=dataSpan%(24*3600*1000)    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000))
    //计算相差分钟数
    var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000))
    //计算相差秒数
    var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000)

   return {
        d:days,
        h:hours,
        m:minutes,
        s:seconds
   };
}


// TODO: 在导购APP里面打开，不需要提示登录
// 在mall下先异步验证是否已经登录，再弹框
if(sessionStorage.isLogin == "false" || !sessionStorage.loginCustomerId){
  if(/\/mall/.test(location.pathname)){
    $.getJSON("getLoginCustomer.json",function(data){
      if(data.status=="0"){
        sessionStorage.isLogin="true";
        sessionStorage.loginCustomerId = data.result.customerId;
      }else{
        sessionStorage.isLogin="false";
        if(data.status=="401"){
          sessionStorage.loginAccountStatus="401";
        }
        showMPLoginBox(function(){
          location.reload();
        },$('#suid').val());
      }
    });
  }
}

// 基本配置
var SHAKE_THRESHOLD = 1800;
var last_update = 0;
var x = y = z = last_x = last_y = last_z = 0;
var isPlayer = false;
var isactive = false; //参与

var pageHB = {
    o:{
        suid:$('#suid').val(),
        HBDataCache:{},
        hasNext:false,
        canShake:false,
        currHBId:null,
        isLottery:false,
        $pBefore:$('#hbNotBegin'),
        $pIng:$('#hbIng'),
        $pEnd:$('#hbEnd')
    },
    init:function(){
        var o = this.o, self=this;
        // $.post('getCustomerCard.json',{supplierId:o.suid},function(data){
        //     if(data.status==='0'){
        //         if(!data.result.customerCard || !data.result.customerCard.cardNo) {
        //             require(["../js/mall/regVip.js"],function(Vip){
        //                 Vip.regVip({
        //                     external: data.result.external,
        //                     suid:o.suid,
        //                     successFn:function(){
        //                         self.getHBInfo.bind(self)();
        //                     }
        //                 });
        //             });
        //         }else{
        //             self.getHBInfo.bind(self)();
        //         }
        //     }
        // });
        this.getHBInfo.bind(self)();
        this.addEvents();
        $(function(){ $('#gotoTalk,.toShoppingCart').hide(); });
    },
    renderRecords:function(){/*获取中奖信息并渲染*/
        // 判断是否有中奖记录
        var o = this.o, self = this, str=[];
        
        if(o.HBDataCache.couponPackWiningList && o.HBDataCache.couponPackWiningList.length){
            var data = o.HBDataCache.couponPackWiningList;
            for(var i in data){
                str.push('<li class="li-avards-item ui-tbl">\
                  <div class="cell" style="width:15%">\
                      <div class="avatar" style="background-image:url('+(data[i].avatar||'https://qncdn.qiakr.com/wx/QuHGU_0.jpeg')+')"></div>\
                  </div>\
                  <div class="cell">\
                      <div class="name">'+(data[i].name||"匿名用户")+'</div>\
                      <div class="time">'+getLocalTime(data[i].gmtCreate)+'</div>\
                  </div>\
                  <div class="prizeNum cell">'+data[i].couponValue+'元</div>\
                  </li>');
            }
            if(str.length){
                $('#recordsItemBox').html(str.join(''));
                $('#awardsListWrap').show();
            }
        }
    },
    addEvents:function(){
        var self = this;
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', this.deviceMotionHandler.bind(this), false);
            this.shareBtnEv();
        } else {
            alert('很抱歉，您的设备太落后，无法参加该活动:(');
        }

        $('#otherHD,#lookBtn').on('click',function(){
            return self.guanZhu();
        });
    },
    getHBInfo:function(){
        // getCouponPackPromotion.json //获取 红包信息 next current
        var o =this.o, self = this;
        $.getJSON('getCouponPackPromotion.json',{supplierId:o.suid},function(data){
            if(data.status === '0' ){
                // 有当前，显示正在活动
                // 无当前，有下一个，显示倒计时, 有当前，有一下个，显示正在活动中
                o.HBDataCache = data.result;
                data.result.next &&  (o.hasNext=true);
                
                if(data.result.current){/*活动中*/
                    self.renderRecords();

                    // 判断用户是否已经参与过当前活动
                    if(data.result.couponId !== undefined){
                        if(data.result.couponId != null){
                            o.isLottery = true; // 当前活动已经中过奖了
                            // 中奖了
                            self.showPrize.bind(self)(data.result.couponId);
                        }else{
                            // 未中奖
                            self.showFailed.bind(self)();
                        }
                        return false;
                    }

                    o.canShake = true;
                    o.currHBId = data.result.current.id;

                    var bigHB=0, hbList = data.result.current.couponPackDetailVoList;
                    for(var x in hbList){
                        if(hbList[x].coupon.couponValue>bigHB)
                            bigHB = hbList[x].coupon.couponValue;
                    }
                    window.document.title = '摇一摇领红包啦，'+bigHB+'元红包等你拿！';
                    $('#bigPrizeVal').text(bigHB);
                    o.$pIng.show();
                }else if(data.result.next){/*显示下一轮倒计时*/
                    // 获取当前时间和开始时间的时间差 开始倒计时
                    var nextHB = data.result.next, t, tStr, $tBox = $('#hbNotBeginTime');
                    (function(){
                        t= getDateDiff(new Date().getTime(),nextHB.couponPromotion.startTime);
                        if(t.d+t.h+t.m+t.s==0){
                            // 隐藏当前面页面，显示活动中
                            o.$pBefore.hide();
                            o.$pIng.hide();
                            o.canShake = true;
                            o.currHBId = data.result.next.id;
                        }else{
                            t.h = t.h<10?'0'+t.h:t.h;
                            t.m = t.m<10?'0'+t.m:t.m;
                            t.s = t.s<10?'0'+t.s:t.s;
                            tStr = '<b>'+t.d+'</b>天<b>'+t.h+'</b>小时<b>'+t.m+'</b>分<b>'+t.s+'</b>秒';
                            $tBox.html(tStr);
                            setTimeout(arguments.callee,1000);
                        }
                    })();
                    
                    o.$pBefore.show();
                    o.$pIng.hide();
                }else{/*没有红包*/
                    o.$pEnd.show();
                }
            }else{
            }
        })
    },
    showPrize:function(cId){
        var o = this.o, self = this;
        o.$pIng.hide();
        $('#shakeHBBox').hide();
        o.canShake=false;

        // 获取中奖信息，更新dom
        var cpArr = o.HBDataCache.current.couponPackDetailVoList;
        var cpVal='';
        for(var i in cpArr){
            if(cpArr[i].coupon.id===cId)
                cpVal = cpArr[i].coupon.couponValue;
        }
        $('#cpValBig,#cpValSm').text(cpVal);
        if(o.isLottery){
            $('#lotteryTxt').show();
            $('#prizeTxt').hide();
        }
        this.showNextCutdown.bind(self)();
        $('#result').show();
    },
    showFailed:function(){
        var o = this.o, self = this;
        o.canShake = false;
        $('#shakeHBBox').hide();
        $('#resHBPrize').hide();
        $('#resHBEmpty').show();
        self.showNextCutdown.bind(self)();
        $('#result').show();
    },
    showNextCutdown:function(){
        var o = this.o, self = this;
        // 是否显示下一轮倒计时
        if(o.hasNext){
            var $nextTime = $('#hbNextTime');

            var nextHB = o.HBDataCache.next, t, tStr;
            (function(){
                t= getDateDiff(new Date().getTime(),nextHB.couponPromotion.startTime);
                if(t.d+t.h+t.m+t.s==0){
                    // 刷新当前页面
                    window.location.reload();
                }else{
                    t.h = t.h<10?'0'+t.h:t.h;
                    t.m = t.m<10?'0'+t.m:t.m;
                    t.s = t.s<10?'0'+t.s:t.s;
                    tStr = '<b>'+t.d+'</b>天<b>'+t.h+'</b>小时<b>'+t.m+'</b>分<b>'+t.s+'</b>秒';
                    $nextTime.html(tStr);
                    setTimeout(arguments.callee,1000);
                }
            })();
            $('#resTimeBox').show();
        }
    },
    deviceMotionHandler:function(eventData){
        var o = this.o, self = this;
        if(!o.canShake) return false;
        var acceleration = eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();

        if ((curTime - last_update) > 100) {

            var diffTime = curTime - last_update;
            last_update = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;
            var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 15000;

            if (speed > SHAKE_THRESHOLD && !isPlayer) {
                this.doResult();
            }
            last_x = x;
            last_y = y;
            last_z = z;
        }
    },
    doResult:function(){
        var o = this.o, self = this;
            if (isactive) return;
            isactive = true;
            isPlayer = true;
            var media = document.getElementById("musicBox");
            media.setAttribute("src", 'https://qncdn.qiakr.com/wx/shake.wav');
            media.load();

            var audioEle = document.getElementById("endMp3");
            audioEle.setAttribute("src", 'https://qncdn.qiakr.com/wx/end.mp3');
            audioEle.load();

            //raffleCouponPack.json //获取 结果信息
            // 显示loading
            qkUtil.loading.show()
            $.post('raffleCouponPack.json', {
                supplierId:o.suid,
                couponPromotionId:o.currHBId
            },function (res) {
                setTimeout(function(){
                    qkUtil.loading.hide();
                    if(res.status==='0'){
                        if(res.result.couponId){ //中奖了
                            self.showPrize.bind(self)(res.result.couponId);
                        }else{ //未中奖
                            self.showFailed.bind(self)();
                        }
                    }else{
                        self.showFailed.bind(self)();
                    }
                }, 3000);
            });

            media.play();
            setTimeout(function () {
                media.pause();
                audioEle.play();
            }, 2300);
    },
    guanZhu:function(){
        if($('#gunzhuBox').length){
            $('#gunzhuBox').show().on('click', function(){
                $(this).hide();
            });
            return false;
        }
    },
    shareBtnEv:function(){
        // 显示分享
        $('#shareBtn').on('click', function(){
            $('#maskShare').show();
            setTimeout(function(){
                $('#maskShare').addClass('active').on('click', function(){
                    $(this).hide().removeClass('active');
                });
            },50);
           
        });
    }
};

pageHB.init();

$('#test').on('click', function(){
    $.msg.actions({
        title:'填写基本信息',
        content:$('#vipFrmDia').html(),
        closeByMask: false
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
 var opt = {
    name:'share',
    param:{
        title: $('#shareTit').text(), 
        desc:  $('#shareTit').text(), 
        img: $('#shareImg').attr('src').trim(), 
        url: location.protocol+"//"+location.host+"/mall/qiangHongBao.htm?suid="+getUrlParam("suid")+"&salesId="+getUrlParam("salesId")
    }
 };
 Hybrid.callByJS(opt);
}
window.Hybrid_init = function(){
 var opt = {
    name:'share',
    param:{
        title: $('#shareTit').text(), 
        desc:  $('#shareTit').text(), 
        img: $('#shareImg').attr('src').trim(), 
        url: location.protocol+"//"+location.host+"/mall/qiangHongBao.htm?suid="+getUrlParam("suid")+"&salesId="+getUrlParam("salesId")
    }
 };
 Hybrid.callByJS(opt);
}
