var dataPage=0,page = {
    o:{
        latitude:"",
        longitude:"",
        userSupplierId:getUrlParam("supplierId"),
        allowScroll:true,
        storeHistory:localStorage.storeHistory3 ? JSON.parse(localStorage.storeHistory3)[getUrlParam("supplierId")]||[] : []
    },
    init:function(){
        var _this = this,o = _this.o;
        qkUtil.loading.show("正在为您查找附近的门店");
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                o.latitude = position.coords.latitude;
                o.longitude = position.coords.longitude;
                _this.getAppiontmentStore();
                _this.getAjaxData(0,true);
            },function(){
                _this.getAppiontmentStore();
                var openRadius=$("#openRadius").val();
                if(openRadius==='false'){
                    _this.getAjaxData(0,true);
                }else{
                    qkUtil.loading.hide();
                    mobileAlert("请打开浏览器定位设置，然后刷新本页面，并允许设置");
                }
            },{ maximumAge: 30000, timeout: 5000});
            // maximumAge 设定位置缓存时间,该值为0时，位置定位时会重新获取一个新的位置对象；该值大于0时，即从上一次获取位置时开始，缓存位置对象
            // timeout 设备位置获取操作的超时时间设定,如果在设定的timeout时间内未能获取位置定位，则会执行errorCallback()返回code（3）(数值为3) 表示超时
        }else{
            _this.getAppiontmentStore();
            var openRadius=$("#openRadius").val();
            if(openRadius==='false'){
                _this.getAjaxData(0,true);
            }else{
                qkUtil.loading.hide();
                mobileAlert("请打开浏览器定位设置，然后刷新本页面，并允许设置");
            }
        }
        scrollToLoadMore({
            callback:function(){
                _this.getAjaxData(dataPage,false);
            }
        });
        this.saveSomething();
    },
    getAppiontmentStore:function(){
        var o = this.o;
        // 预约才会显示预约过的门店
        if(location.search.indexOf("appointmentSalesList")<0){
            return false;
        }
        var param={
            supplierId : o.userSupplierId,
            longitude : o.longitude,
            latitude : o.latitude,
            index : "0",
            length : "30",
            open : "0"
        };
        $.post("getAppiontmentStoreList.json",param,function(data){
            if(data.status=="0"){
                var list = data.result.appointmentStoreVoList;
                if(list.length > 0){
                    var listStr = template("storeCardTemplate",{
                        list:list,
                        suid:o.userSupplierId,
                        redirect:$("#redirect").val()
                    });
                    $("#storeAppointment").html(listStr);
                    $(".tips.appointment").show();
                }
            }
        });
    },
    getAjaxData:function(idx,clear){
        var o = this.o;
        if(o.allowScroll){
            o.allowScroll=false;
            if($(".loading-bottom").length == 0 && $("#storeAround li").length>0){
                $("body").append('<div class="loading-bottom"><i class="iconfont">&#xe607;</i></div>');
                $("body").scrollTop($("body").scrollTop()+80)
            }
            var param={
                supplierId : o.userSupplierId,
                longitude : o.longitude,
                latitude : o.latitude,
                index : idx,
                length : baseOption.pageSize,
                open : "0"
            };
            $.post("searchStoreBySupplierId.json",param,function(data){
                if(data.status=="0"){
                    var list = data.result.storeSearchVoList,listStr = [],listV=[];
                    if(list.length == 0){
                        listStr.push('<div class="noResult"><span class="store">没有找到相关门店</span></div>') ;
                    }else{
                        listV = $.grep(list,function(e,i){
                            return $.inArray(e.store.id+"",o.storeHistory)>-1
                        });
                        list = $.grep(list,function(e,i){
                            return $.inArray(e.store.id+"",o.storeHistory)<0
                        });
                        listStr.push(template("storeCardTemplate",{
                            list:list,
                            suid:o.userSupplierId,
                            redirect:$("#redirect").val()
                        }));
                    }
                    if(listV.length>0){
                        var listVStr = template("storeCardTemplate",{
                            list:listV,
                            suid:o.userSupplierId,
                            redirect:$("#redirect").val()
                        });
                        $("#storeVisited").html(listVStr);
                        $(".tips.visited").show();
                    }
                    $("#storeAround").append(listStr.join(''));
                    $(".container").removeClass("op0");
                    qkUtil.loading.hide();
                    $(".loading-bottom").remove();
                    o.allowScroll = data.result.all ? false : true;
                }
            });
        }
    },
    saveSomething:function(){
        $(".storeList").on("click",".store-link",function(e){
            sessionStorage.removeItem("salesId");
            var storeId=$(this).data("id");
            var redirect = $("#redirect").val();
            if(redirect){
                location.href=redirect+(redirect.indexOf("?")>0 ? "&" : "?")+"storeId="+storeId;
                return false;
            }
        });
    }
}
page.init();

template.helper('getDistance', function (d, format) {
    if(!d || d == 999999999){
        return "";
    }else if(d<1000){
        return (~~d*1.2).toFixed(1)+"m";
    }else if(d<1000000){
        return (d*1.2/1000).toFixed(1)+"km";
    }else{
        return "千里之外";
    }
});
template.helper('isVisited', function (id, format) {
    if(!id){
        return "";
    }
    if($.inArray(id,page.o.storeHistory)>-1){
        return "active";
    }else{
        return "";
    }
});