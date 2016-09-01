$.fn.countDown=function(options){
    time = Number(options.time);
    return this.each(function(){
        var self = $(this);
        self.html('<span class="hours">'+(parseInt(time/3600) > 9 ? parseInt(time/3600) : ("0"+parseInt(time/3600)))+'</span>小时'+'<span class="minutes">'+(parseInt((time%3600)/60) > 9 ? parseInt((time%3600)/60) : ("0"+parseInt((time%3600)/60)))+'</span>分'+'<span class="seconds">'+(time%60 > 9 ? time%60 : ("0"+time%60))+'</span>秒');
        var countFn = setInterval(function(){
            if(time > 1){
                time--;
                self.html('<span class="hours">'+(parseInt(time/3600) > 9 ? parseInt(time/3600) : ("0"+parseInt(time/3600)))+'</span>小时'+'<span class="minutes">'+(parseInt((time%3600)/60) > 9 ? parseInt((time%3600)/60) : ("0"+parseInt((time%3600)/60)))+'</span>分'+'<span class="seconds">'+(time%60 > 9 ? time%60 : ("0"+time%60))+'</span>秒');
            }else{
                options.callback && options.callback();
                clearInterval(countFn);
            }
        },1000);
    });
}

if(getUrlParam("salesId")||getUrlParam("owner")){
    sessionStorage.salesId = getUrlParam("salesId")||getUrlParam("owner");
}

// 获取商品SKU信息
var selectedSkuColor = "默认",
    selectedSkuSize = "默认",
    skuFormatCount = $("#sizeBox").length + $("#colorBox").length;

_skuId = SkuArray[0].id;
if(skuFormatCount==0){ $("#cartBtn").removeAttr("disabled"); }

var page = {
    o:{},
    init:function(){
        // this.checkVipCard();
        this.countDown();
        this.skuInit(skuColorArray,skuSizeArray);
        this.buyEvents();
        this.selectSku();
        this.selectDefaultSku();
        this.initPreviews();
        this.contactSales();
        this.refreshSkuCount();
        if(sessionStorage.receiveStoreId){
            sessionStorage.removeItem("receiveStore");
            sessionStorage.removeItem("receiveStoreId");
        }
    },
    checkVipCard:function(callback){
        // 检查会员卡信息
        $.post('getCustomerCard.json',{supplierId:getUrlParam("supplierId")},function(data){
            if(data.status==='0'){
                if(!data.result.customerCard || !data.result.customerCard.cardNo) {
                    require(["../js/mall/regVip.js"],function(Vip){
                        Vip.regVip({
                            external: data.result.external,
                            suid:getUrlParam("supplierId"),
                            successFn:function(){
                                callback();
                            }
                        });
                    });
                }else{
                    callback();
                }
            }
        });
    },
    countDown:function(){
        if(_lastedCount=="0" || _status=="1"){
            $("#buyNow").html("活动已结束").attr("disabled","disabled");
            $("#lastedCount").parent().remove();
            $("#seckillType").html("本次活动已结束，请关注其它活动");
        }else if(seckillStart>nowtime){
            $("#buyNow").html("活动未开始").attr("disabled","disabled");
            $("#seckillType").html("离活动开始还有");
            $("#timeOver").countDown({
                time:(seckillStart-nowtime)/1000,
                callback:function(){
                    $("#seckillType").html("离活动结束还有");
                    $("#buyNow").html("立即抢购").removeAttr("disabled");
                    $("#timeOver").countDown({
                        time:(seckillEnd-seckillStart)/1000
                    });
                }
            });
        }else if(seckillEnd>nowtime){
            $("#timeOver").countDown({
                time:(seckillEnd-nowtime)/1000,
                callback:function(){
                    location.reload();
                }
            });
        }else{
            $("#lastedCount").parent().remove();
            $("#buyNow").html("活动已结束").attr("disabled","disabled");
            $("#seckillType").html("本次活动已结束，敬请关注其它闪购活动");
        }
    },
    skuInit:function(colorList,sizeList){
        var colorStr="",sizeStr="";
        Zepto.each(colorList,function(i,e){
            colorStr += '<b>'+e+'</b>';
        });
        $("#colorBox").append(colorStr);

        Zepto.each(sizeList,function(i,e){
            sizeStr += '<b>'+e+'</b>';
        });
        $("#sizeBox").append(sizeStr);
    },
    buyEvents:function(){
        $('#buyNow').on('click', function(){
            if(sessionStorage.loginAccountStatus=="401"){
                showMPLoginBox(function(){
                    $("#buyNow").trigger("click");
                },getUrlParam("supplierId"));
                return false;
            }
            page.checkVipCard(function(){
                if(skuFormatCount==0){
                    $("#cartBtn").trigger("click");
                }else{
                    $(".popSku").show();
                    $("html,body").css({"height":"100%","overflow":"hidden","margin":"0"});
                    if($(".p_list").height()+20 > $(window).height()){
                        $(".p_list").find(".sizeDl,.colorDl").css({"max-height":($(window).height()*.5-100)+"px","overflow":"auto"});
                    }
                }
            });
        });
        // 取消购买
        $("#cancelCartBtn").on("click",function(){
          $(".popSku").hide();
          $("html,body").css({"height":"auto","overflow":"auto","margin":""});
        });
        // 遮盖层取消
        $(".popSku").on("click",function(e){
            if(e.target == this){
                $(".popSku").hide();
                $("html,body").css({"height":"auto","overflow":"auto","margin":""});
            }
        });
    },
    selectSku:function(){
        // 颜色大小选择
        $("#sizeBox b, #colorBox b").click(function(){
            var _t = $(this);
            if(_t.hasClass("disabled")) return false;
            if(_t.hasClass("se")){
                _t.removeClass("se");
                if(_t.parent()[0].id == "colorBox"){
                    $("#sizeBox b").removeClass("disabled");
                }else{
                    $("#colorBox b").removeClass("disabled"); 
                }
                $("#cartBtn").attr("disabled","disabled");
                return false;
            }
            _t.addClass("se").siblings().removeClass("se");
            if(_t.parent()[0].id == "colorBox"){
                var _color = _t.text();
                selectedSkuColor = _color;
                if($("#sizeBox b").length > 0){
                    $("#sizeBox b").removeClass("disabled").each(function(t,v){
                        var skuExist = false;
                        $.map(SkuArray,function(s){
                            if(s.size == $(v).text() && s.color == _color){
                                skuExist = true;
                                if(s.count < 1 && s.unpayCount<1){
                                    $(v).addClass("disabled");
                                }
                            }
                            if(s.color == selectedSkuColor && s.size == selectedSkuSize){
                                _skuId = s.id;
                                if(s.count < 1 && s.unpayCount > 0){
                                    $("#unpaySkuOrderTip").text(s.unpayCount).parent().show();
                                    $("#cartBtn").hide();
                                    $("#refreshSkuCount").show();
                                }else{
                                    $("#unpaySkuOrderTip").parent().hide();
                                    $("#cartBtn").show();
                                    $("#refreshSkuCount").hide();
                                }
                                $("#stockCount").html(s.count);
                                $("#skuPriceBox").html("￥"+s.price.toFixed(2));
                            }
                        });
                        if(!skuExist){
                           $(v).addClass("disabled"); 
                        }
                    });
                    if($("#sizeBox b.se").length > 0){
                        $("#cartBtn").removeAttr("disabled");
                    }
                }else{
                    $.map(SkuArray,function(s){
                        if(s.color == selectedSkuColor && s.size == selectedSkuSize){
                            _skuId = s.id;
                            if(s.count > 0){
                                $("#cartBtn").removeAttr("disabled");
                            }else{
                                $("#cartBtn").attr("disabled","disabled");
                            }
                            $("#stockCount").html(s.count);
                            $("#skuPriceBox").html("￥"+s.price.toFixed(2));

                            if(s.count<1 && s.unpayCount>0){
                                $('#unpaySkuOrderTip').text(s.unpayCount);
                                $('#uppayTipSpan').css('display','inline-block');
                                $('#cartBtn').hide();
                                $('#refreshSkuCount').show();
                            }else{
                                $('#unpaySkuOrderTip').text('0');
                                $('#uppayTipSpan').hide();
                                $('#cartBtn').show();
                                $('#refreshSkuCount').hide();
                            }
                        }
                    });
                }
            }
            if(_t.parent()[0].id == "sizeBox"){
                var _size = _t.text();
                selectedSkuSize = _size;
                $("#colorBox b").removeClass("disabled").each(function(t,v){
                    var skuExist = false;
                    $.map(SkuArray,function(s){
                        if(s.color == $(v).text() && s.size == _size){
                            skuExist = true;
                            if(s.count < 1 && s.unpayCount<1){
                                $(v).addClass("disabled");
                            }
                        }
                        if(s.color == selectedSkuColor && s.size == selectedSkuSize){
                            _skuId = s.id;
                            if(s.count<1 && s.unpayCount>0){
                                $('#unpaySkuOrderTip').text(s.unpayCount);
                                $('#uppayTipSpan').css('display','inline-block');
                                $('#cartBtn').hide();
                                $('#refreshSkuCount').show();
                            }else{
                                $('#unpaySkuOrderTip').text('0');
                                $('#uppayTipSpan').hide();
                                $('#cartBtn').show();
                                $('#refreshSkuCount').hide();
                            }
                            $("#stockCount").html(s.count);
                            $("#skuPriceBox").html("￥"+s.price.toFixed(2));
                        }
                    });
                    if(!skuExist){
                       $(v).addClass("disabled"); 
                    }
                });
                if($("#colorBox b.se").length > 0){
                    $("#cartBtn").removeAttr("disabled");
                }
            }
        });
    },
    selectDefaultSku:function(){
        // 默认选中规格
        $.each(SkuArray,function(i,e){
            if(e.count > 0){
                $("#colorBox b").each(function(t,j){
                    if($(j).text()== e.color){
                        $(j).trigger("click");
                        return false;
                    }
                });
                $("#sizeBox b").each(function(t,j){
                    if($(j).text()== e.size){
                        $(j).trigger("click");
                        return false;
                    }
                });
                return false;
            }
        });
    },
    initPreviews:function(){
        Zepto.each(previewArr,function(i,e){
            previewStr += '<li style="width:'+document.body.clientWidth+'px;"><img src="'+e+'?imageView2/1/h/640"></li>';
            iconStr += '<a href="#" class="">'+i+'</a>';
        });
        $('.main_image ul').append(previewStr);
        $.mggScrollImg('.main_image ul',{
            loop : true,//循环切换
            auto : true//自动切换
        });
    },
    contactSales:function(){
        // 联系导购
        $("#getSalesAndChat,#getSalesAndChat2").on("click",function(){
            if(sessionStorage.salesId){
                location.href="contactSales.htm?supplierId="+getUrlParam("supplierId")+"&salesId="+sessionStorage.salesId;
            }else{
                $.getJSON("getSalesForFlashsaleStock.json?flashsaleStockId="+getUrlParam("stockId"),function(data){
                  if(data.status=="0"){
                    location.href="contactSales.htm?supplierId="+getUrlParam("supplierId")+"&salesId="+data.result.salesId;
                  }
                });
            }
            // var url = "contactSales.htm?supplierId="+getUrlParam("supplierId")+"&salesId=" + $("#storeId").val();
            // var salesListUrl = 'bandingSales.htm?storeId=' + $("#storeId").val() + '&redirect=chat';
            // var saleStatus = 2;
            // switch(parseInt(saleStatus)){
            //     case 1: //离职
            //         $.confirm('该顾问已离职，是否切换其他顾问？','提示', function(){
            //             window.location.href = $("#salesId").val() ? url : salesListUrl;  
            //         });
            //         break;
            //     case 2: //换门店
            //         $.confirm('该顾问已换其他门店，是否切换其他顾问？','提示', function(){
            //             window.location.href = $("#salesId").val() ? url : salesListUrl;
            //         });
            //         break;
            //     default:
            //         window.location.href = url;    
            // }
        });
    },
    refreshSkuCountRequest:function(callback){
        $.getJSON("refreshFlashsaleStock.json?stockId="+getUrlParam("stockId"),function(data){
            callback(data);
        })
    },
    refreshSkuCount:function(){
        $("#refreshSkuCount").on("click",function(){
            $(this).addClass("disabled");
            var time=3;
            (function(){
                if(time===0){
                    $("#refreshSkuCount").removeClass("disabled").html("刷新库存");
                    return;
                }
                $("#refreshSkuCount").html("刷新库存("+time+")");
                time--;
                setTimeout(arguments.callee,1000);
            })();
            var clickReflashCall = function(data){
                SkuArray=[];
                $.each(data.result.flashsaleVo.flashsaleSkuList,function(i,e){
                    SkuArray.push({
                        tag:e.color+'-'+e.size,
                        id:e.skuId,
                        color:e.color,
                        size:e.size,
                        count:e.skuCount,
                        unpayCount:e.waitingPaySkuCount,
                        price : e.skuPrice
                    });
                    if(e.skuId == _skuId){
                        $("#stockCount").text(e.skuCount);
                        $("#unpaySkuOrderTip").text(e.waitingPaySkuCount);
                        $('#uppayTipSpan').css('display','inline-block');
                        if(e.skuCount>0){
                            $("#unpaySkuOrderTip").parent().hide();
                            $("#cartBtn").prop('disabled',false).show();
                            $("#refreshSkuCount").hide();
                        }else if(e.skuCount<1 && e.waitingPaySkuCount<1){
                            $("#unpaySkuOrderTip").parent().html("该款已售完");
                            $("#cartBtn").prop('disabled',true).show();
                            $("#refreshSkuCount").hide();
                            $(".p_list b.se").removeClass("se");
                        }else{}
                    }
                })
            }
            page.refreshSkuCountRequest(clickReflashCall);
        })
    }
}

$(function(){
    page.init();
});

// 查询自提门店相关
Mobilebone.evalScript = true;
Mobilebone.captureLink = false;  // 默认链接跳转
Mobilebone.rootTransition = {
  initStoreList:function(){
    $.getJSON("getStoreListByFlashsleStockId.json?stockId="+getUrlParam("stockId"),function(data2){
      var listStr = template('storeTemplate', {
        list : data2.result.storeList
      });
      $("#storeList .storeList").append(listStr);
    });
  }
}