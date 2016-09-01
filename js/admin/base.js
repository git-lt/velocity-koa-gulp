if(typeof($)=="undefined" || typeof(dialog)=="undefined"){
    var jQueryErrorCount = parseInt(sessionStorage.jQueryError||"0");
    if(jQueryErrorCount<5){
        sessionStorage.jQueryError=jQueryErrorCount+1;
        location.reload();
    }else{
        alert('基础模块加载失败，请查看网络是否屏蔽"qiniudns.com"或更换网络环境后再试');
    }
}

var Util = {
    listLength:parseInt($.cookie("settingOfPageLimit")) || 30,// 所有列表每页显示的数量
    cdn:"https://qncdn.qiakr.com/",
    uploadServer:location.protocol==="https:" ? 'https://up.qbox.me/' : 'http://up.qiniu.com/',
    cdnPrivate:"http://export.qiakr.com/",
    getLocalTime:function(ms,day){
        if(!ms){
            return "";
        }
        ms = Number(ms);
        var _date = new Date(ms);
        var year=_date.getFullYear(),
            month=_date.getMonth()+1,
            date=_date.getDate(),
            hour=_date.getHours(),
            minute=_date.getMinutes(),
            second=_date.getSeconds();
        return year+"-"+(month<10 ? ("0"+month) : month)+"-"+(date<10 ? ("0"+date) : date)+ 
            (!day ? (" "+(hour<10 ? ("0"+hour) : hour)+":"+(minute<10?("0"+minute):minute)+":"+(second<10?("0"+second):second)) : ""); 
    },
    getUnixTime:function(localTime){
        if(!localTime){
            return "";
        }
        var newstr = localTime.replace(/-/g,'/'); 
        var date =  new Date(newstr);
        return date.getTime();
    },
    getUrlParam: function(key){
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if(r) return decodeURIComponent(r[2]);  return "";
    },
    alert:function(con,_callback){
        dialog({
            title:"系统提示",
            id:"util-alert",
            fixed: true,
            content: con,
            width:300,
            cancel: false,
            okValue: '确定',
            backdropOpacity:"0.5",
            ok: function () {
                if(_callback){
                    _callback();
                }
            }
        }).showModal();
    },
    confirm:function(con,okCallback,cancelCallback){
        dialog({
            title:"系统提示",
            id:"util-confirm",
            fixed: true,
            content: con,
            width:300,
            okValue: '确定',
            cancelValue:'取消',
            backdropOpacity:"0.5",
            ok: okCallback,
            cancel:cancelCallback ? cancelCallback : function(){}
        }).showModal();
    },
    getByteLen:function(str){ 
        if(!str){
            return 0;
        }
        var l=str.length; 
        var n = l; 
        for ( var i=0;i <l;i++){
            if( str.charCodeAt(i) <0 ||str.charCodeAt(i)> 255){
                n++; 
            } 
        } 
        return n; 
    },
    createPagination:function(count,idx,container,callback){
        container.empty();
        var pages = Math.ceil(count/Util.listLength),pageHtml="";            
        container.siblings().remove().end().after('<span class="c-9 m20 r">共'+count+'条记录</span>')

        if(pages > 1){
            pageHtml += '<li '+(idx==0 ? 'class="disabled"' :'')+'><a data-index="'+(idx-Util.listLength)+'">上一页</a></li>'
            var currentPage = idx/Util.listLength;
            for(var i=0;i<pages;i++){
                if(pages>15){
                    var moreClass=""
                    if((i != 0) && (i != pages-1)){
                        if(i==currentPage-4 ){
                            pageHtml += '<li><a data-more="leftMore" class="more">...</a></li>';
                        }
                        if(i==currentPage+4){
                            pageHtml += '<li><a data-more="rightMore" class="more">...</a></li>';
                        }
                        moreClass = i<currentPage-3 ? "leftMore fn-hide" : i>currentPage+3 ? "rightMore fn-hide" : "";
                    }
                    pageHtml += '<li '+(currentPage == i ? 'class="active"' : '')+'><a class="'+moreClass+'" data-index="'+i*Util.listLength+'">'+(i+1)+'</a></li>';
                }else{
                    pageHtml += '<li '+(currentPage == i ? 'class="active"' : '')+'><a data-index="'+i*Util.listLength+'">'+(i+1)+'</a></li>';
                }
            }
            pageHtml +='<li '+(idx/Util.listLength+1 >= pages ? 'class="disabled"' :'')+'><a data-index="'+(idx+Util.listLength)+'">下一页</a></li>' ;
            pageHtml += '<div class="listConfig dib pl20"><input type="text" placeholder="每页条数('+Util.listLength+')" style="width:115px;float:left;" /><button class="btn btn-white l" style="border-left:0;border-radius:0;">修改</button></div>'
            container.append(pageHtml);
            container.off().on("click","a:not('.more')",function(e){
                e.preventDefault();
                var _t = $(this),_tp = _t.parent(), _i = _t.data("index");
                if(_tp.hasClass("active") || _tp.hasClass("disabled")) return false;
                _tp.addClass("active");
                callback(_i);
            });
            container.on("click","a.more",function(e){
                var more = $(this).data("more");
                $(this).parent().remove();
                container.find("."+more).show();
            });
        }
    },
    loadUploadScript:function(){
        if($("#uploadScript").length == 0){
            $("body").append('<input type="hidden" id="uploadScript" />');
            jQuery.ajax({
                url: "//res.qiakr.com/plugins/webuploader/webuploader-0.1.5.min.js",
                dataType: "script",
                cache: true
            });
        }
    },
    getNormsName:["","颜色","尺码","重量","版本","材质","尺寸","其他规格"],
    refreshStringArr:function(sArr, isObj){/*刷新关联数组的数据，去掉空值，添加length*/
        if(!sArr) return false;
        var t=[],len=0;
        if(isObj) t = {};
        for(var i in sArr){
            if(sArr[i]){
                t[i]=sArr[i];
                len++;
            }
        }
        t.length = len;
        return t;
    },
    createHelpTip:function(title,list){
        // $("body").append('');
        // var QaHtml = '<div class="helpBar" id="helpBar"><a href="javascript:;" class="help-tip bdr-e4">有<br>问<br>题<br>点<br>我</a>\
        //     <div class="qaContainer"><h5 class="title">'+title+'</h5>\
        //     <ul class="helpList">';
        // $.each(list,function(i,e){
        //     QaHtml += '<li><a target="_blank" href="'+e.link+'">'+e.title+'</a></li>';
        // });
        // QaHtml += '</ul></div>';
        // $("body").append(QaHtml);
        // $("#helpBar").on("mouseover",function(){
        //     $(this).find(".qaContainer").show();
        // }).on("mouseout",function(){
        //     $(this).find(".qaContainer").hide();
        // });
    }
};

jQuery.ajaxSetup({
    type: "POST",
    dataType: 'json',
    timeout: 60000,
    beforeSend:function(request){
        var urlSp = this.url.split("/"),url=urlSp[urlSp.length-1].split(".")[0];
        var params = this.type==="GET"?this.url.split("?")[1]:this.data;
        if(window["ajax-"+url] && window["ajax-"+url]==params){
            request.abort();
        }else{
            window["ajax-"+url] = params;
        }
    },
    //检验登陆超时
    dataFilter: function (data, type) {
        if (type === "json") {
            data = JSON.parse(data);
            if(data.status == "401") {
                Util.alert("登录已超时，请重新登录",function(){
                    top.location.href = "index.htm";
                });
            }else if(data.status == "403"){
                Util.alert("抱歉，您没有权限进行此项操作");
            }else{
                return JSON.stringify(data);
            }
        }else{
            return data;
        }
    },
    complete:function(){
        var urlSp = this.url.split("/"),url=urlSp[urlSp.length-1].split(".")[0];
        window["ajax-"+url] = undefined;
    },
    error: function () {
        Util.alert("系统繁忙，请稍后再试");
    }
});

$(function(){
    if(typeof menuCurrent != "undefined"){
        $("#bs-navbar .nav li[name="+menuCurrent+"]").addClass("active");
    }
    var minHeight = Math.max($(window).height()-60,$("#sidebar-menu").height()+90);
    $(".content-page").css({"min-height":minHeight+"px"});    // 保证页面上线全屏
    
    if($('#setMenu').length > 0){
        $("#setMenu").on("click",function(){$(this).toggleClass("open");});
        var tableList = dialog({
            title:"列表个数设置",
            id:"util-tableList",
            fixed: true,
            backdropOpacity:"0",
            content: $('#settingContent'),
            statusbar:"默认30条",
            okValue: '确定',
            cancelValue:'取消',
            ok: function(){
                var limit = $('#settingContent input[name=limit]').val();
                if(~~limit < 10){
                    Util.alert("至少每页10条");
                    return false;
                }else if(~~limit > 100){
                    Util.alert("最多每页100条");
                    return false;
                }else{
                    $.cookie("settingOfPageLimit",limit,{expires: 300});
                    location.reload();
                }
            },
            cancel:function(){
                this.close();
                return false;
            }
        });
        $(document).on("click",function(e){
            if(!$(e.target).hasClass("setting")){
                $(".setList").hide();
            }
        })
        $(".dropdown-menu").on("click",".tableList",function(e){
            tableList.showModal();
            $('#settingContent input[name=limit]').val(Util.listLength);
        });
        $("#qkLogout").on("click",function(e){
            e.preventDefault();
            $.getJSON("../logout.json",function(data){
                location.href="index.htm";
            });
        });

        $(document).on("click",".listConfig .btn",function(){
            var len = $(this).siblings("input").val();
            len = ~~len;
            if(!len){
                $(this).siblings("input").focus();
                return false;
            }else if(~~len < 10){
                Util.alert("至少每页10条");
                return false;
            }else if(~~len > 100){
                Util.alert("最多每页100条");
                return false;
            }else{
                $.cookie("settingOfPageLimit",len,{expires: 300});
                location.reload();
            }
        })
    }

    // 点击表单任意位置触发选中当前列
    $(".table").on("click","tbody tr td:not(:first-child)",function(){
        $(this).parent().find("td:first input[type=checkbox]").trigger("click");
    });

    // 全屏切换
    (function(){
        var FullScreen = function() {
            this.$body = $("body"),
            this.fullscreenCls ="#btn-fullscreen"
        };
        FullScreen.prototype.launchFullscreen  = function(element) {
          if(element.requestFullscreen) {
            element.requestFullscreen();
          } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
          } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
          }
        },
        FullScreen.prototype.exitFullscreen = function() {
          if(document.exitFullscreen) {
            document.exitFullscreen();
          } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        },
        //toggle screen
        FullScreen.prototype.toggle_fullscreen  = function() {
          var $this = this;
          var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
          if(fullscreenEnabled) {
            if(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
              $this.launchFullscreen(document.documentElement);
            } else{
              $this.exitFullscreen();
            }
          }
        },
        //init sidemenu
        FullScreen.prototype.init = function() {
          var $this  = this;
          //bind
          $this.$body.on('click',this.fullscreenCls, function() {
            $this.toggle_fullscreen();
          });
        },
         //init FullScreen
        $.FullScreen = new FullScreen, $.FullScreen.Constructor = FullScreen;
        $.FullScreen.init();
    })();
});


// artTemplate模板扩展
(function(){
    template.helper('dateFormat', function (date, format) {
        if(!date) return '';
        format = Util.getLocalTime(date);
        return format;
    });
    template.helper('dayFormat', function (date, format) {
        if(date){
            format = Util.getLocalTime(date,true);
            return format;
        }
        return '';
    });
    template.helper('toFixed2', function (data, format) {
        if(!isNaN(data)){
            format = parseFloat(data).toFixed(2);
            return format;
        }
        return '0.00';
    });
    template.helper('stringify', function (data, format) {
        format = JSON.stringify(data);
        return format;
    });
    template.helper('orderStatus', function (data, status) {
        switch(data){
            case 1 : 
            status="待付款";
            break;
            case 2 :
            status="已发货";
            break;
            case 10 :
            status="待发货";
            break;
            case 3 :
            status="待评价";
            break;
            case 4 :
            status="已评价";
            break;
            case 5 :
            status="已关闭";
            break;
        }
        return status;
    });
    template.helper('placeholderImg', function (data, format) {
        var placeholderImg = '';
        switch(format){
            case 'product': placeholderImg = 'https://qncdn.qiakr.com/admin/placeholer_300x300.gif'; break;
            case 'avatar': placeholderImg = 'https://qncdn.qiakr.com/mall/default-photo.png'; break;
            case 'video': placeholderImg = 'https://qncdn.qiakr.com/website/video_pic_ph.jpg'; break;
            default: placeholderImg = 'https://qncdn.qiakr.com/admin/placeholer_300x300.gif'; break;
        }
        if(!data || data.length<5) return placeholderImg;
        return data;
    });
    template.helper('getHBGN', function (data, probability) {
        switch(data){
            case 5 : probability="最小概率[很难中奖]";break;
            case 50 : probability="一般概率[有机率中奖]";break;
            case 100 : probability="最大概率[人人有奖]";break;
        }
        return probability;
    });
})();

// jquery插件扩展
(function(){
    $.fn.singleImgUploader = function(options){
        Util.loadUploadScript();
        var _this = $(this);
        var setIntervalCon = setInterval(function(){
            if(typeof WebUploader != "undefined"){
                clearInterval(setIntervalCon);

                var imgW = options.width || "160",
                    imgH = options.height || "160";

                var uploader = WebUploader.create({
                    auto: true,
                    swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
                    server: Util.uploadServer,
                    pick:{
                        id:_this[0],
                        multiple : false
                    },
                    // runtimeOrder : "flash",
                    duplicate : true,
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,png',
                        mimeTypes: 'image/*'
                    },
                    formData : {
                        'token' : $('#uptoken').val()
                    },
                    compress : {
                        width: options.limitLarger ? 1600 : 800,
                        height: options.limitLarger ? 1600 : 800,
                        quality: 90,
                        allowMagnify: true,
                        crop: false,
                        preserveHeaders: true,
                        noCompressIfLarger: true,
                        // 单位字节，如果图片大小小于此值，不会采用压缩。
                        compressSize: options.limitLarger ? 1024*1024 : 300*1024
                    }
                });
                uploader.on("uploadStart",function(file){
                    _this.find(".webuploader-pick").addClass("uploading").append('<div class="progressBar"><div class="progress" style="width:0%"></div></div>')
                }).on("uploadProgress",function(file,percentage){
                    _this.find(".progress").css("width",percentage*100+'%');
                }).on("uploadSuccess",function(file,response){
                    var url = Util.cdn+response.hash+"?imageView2/1/w/"+imgW+"/h/"+imgH
                    _this.css("background-image","url("+url+")").find(".webuploader-pick").removeClass("uploading").find(".progressBar").remove()
                    if(options.resultInput){
                        options.resultInput.val(Util.cdn+response.hash);
                    }
                    if(options.callback){
                        options.callback(Util.cdn+response.hash);
                    }
                }).on("uploadError",function(file, reason,result){
                    Util.alert("上传失败，请稍后再试或刷新页面重试");
                }).on("error",function(msg){
                    Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
                });
            }
        },100);
    };

    $.fn.singleFileUploader = function(options){
        Util.loadUploadScript();
        var _this = $(this);
        var setIntervalCon = setInterval(function(){
            if(typeof WebUploader != "undefined"){
                clearInterval(setIntervalCon);
                var uploader = WebUploader.create({
                    auto: true,
                    swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
                    server: Util.uploadServer,
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
                    // formData : {"json":'{"type":3,"ext":"csv"}'}
                    formData : {
                        'token' : $('#uptokenPrivate').val()
                    }
                });
                uploader.on("uploadStart",function(file){
                    _this.find(".webuploader-pick").addClass("uploading").append('<div class="progressBar"><div class="progress" style="width:0%"></div></div>')
                }).on("uploadProgress",function(file,percentage){
                    _this.find(".progress").css("width",percentage*100+'%');
                }).on("uploadSuccess",function(file,response){
                    _this.find(".webuploader-pick").removeClass("uploading").find(".progressBar").remove()
                    var url = Util.cdnPrivate+response.hash;
                    $("#fileUrl").val(url);
                    $("#loadedFileName").html(file.name);
                    $(".submit").removeClass("disabled");
                }).on("uploadError",function(file, reason,result){
                    Util.alert("上传失败，请稍后再试或刷新页面重试");
                }).on("error",function(msg){
                    Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确，请上传.csv文件" : msg);
                });
            }
        },100);
    };

    $.fn.setTheadFixed = function(options){
        var o = $.extend({},options);
        var s = $(this),tableId = o.id ? o.id : "fixedThead";
        var tableTop = s.offset().top-(o.leaveTop ? o.leaveTop : 0),tableLeft = s.offset().left,tableWidth = s.width();
        var h = '<table id="'+tableId+'" class="fixedTable table" style="left:'+tableLeft+'px;width:'+tableWidth+'px;top:'+(o.leaveTop ? o.leaveTop : 0)+'px;display:none;"><thead><tr>';
        s.find("thead:first").find("th:visible").each(function(i,e){
            h += '<th width="'+($(e).width()+16)+'">'+$(e).html()+'</th>';
        });
        h += '</tr></thead></table>';
        $(".fixedTable.table").remove();
        s.parent().append(h);
        $(document).on("scroll",function(){
            if($(document).scrollTop()>=tableTop){
                $("#"+tableId).show();
                if(o.fixedFn){
                    o.fixedFn();
                }
            }else{
                $("#"+tableId).hide();
                if(o.unfixedFn){
                    o.unfixedFn();
                }
            }
        });
    };

    // 弹出门店列表
    // example:
    // $.popupStoreSelect({
    //     title:"上架到门店",
    //     type:"single"/"multiple",
    //     length:300,
    //     okCallback:function(storeListArray){
    //         doSomthing...
    //     }
    // });
    $.popupStoreSelect = function(options){
        var defaultOpt = {
            dialogId:'ui-storeList',
            title:'门店列表',
            type:'single',
            open:0,
            clear:false,
            resultName : 'storeVoList',
            provinceId:"loc_province_pop",
            cityId:"loc_city_pop",
            townId:"loc_town_pop"
        };
        var o = $.extend(defaultOpt,options);
        var getStoreList = function(params){
            params = $.extend({},params);
            jQuery.ajax({
                url: o.url ? o.url : 'getStoreList.json',
                data: {
                    open : o.open||0,
                    province : params.province||"",
                    city : params.city||"",
                    district : params.district||"",
                    brand : o.brand||"",
                    storeName: params.storeName||"",
                    productId: o.productId||""
                },
                success:function(data){
                    var storeListStr="",resultList = data.result[o.resultName];
                    if(o.resultName=='otherStoreList'){
                        if(resultList.length>0){
                            storeListStr+= '<p class="pb5 c-9">该商品未上架门店：</p>';
                        }else{
                            storeListStr+= '<p class="pt25 c-9">该商品已上架所有门店</p>';
                        }
                    }else if(o.resultName=='allocatedStoreList'){
                        if(resultList.length>0){
                            storeListStr+= '<p class="pb5 c-9">该商品已上架门店：</p>';
                        }else{
                            storeListStr+= '<p class="pt25 c-9">该商品未在任何门店上架</p>';
                        }
                    }
                    jQuery.each(resultList,function(i,e){
                        if(o.type == 'multiple'){
                            if(o.resultName=='otherStoreList' || o.resultName=='allocatedStoreList'){
                                storeListStr += '<label class="inline"><input name="store" data-id="'+e.id+'" type="checkbox">'+e.name+'</label>';
                            } else {
                                storeListStr += '<label class="inline"><input name="store" data-salescount="'+e.salesCount+'" data-id="'+e.store.id+'" type="checkbox">'+e.store.name+'</label>';
                            }                        
                        }else{
                            storeListStr += '<label class="inline"><input name="store" data-salescount="'+e.salesCount+'" data-id="'+e.store.id+'" type="radio">'+e.store.name+'</label>';
                        }
                    });
                    $("#filterStoreBox .storeListContainer").html(storeListStr)
                }
            })
        }
        if(window.popupStoreSelectBox && !o.clear){
            window.popupStoreSelectBox.showModal();
            if(o.type == 'multiple' && o.length){
                $("#checkAll-dialog").siblings(".maxLength").html(o.length);
            }
        }else{
            window.popupStoreSelectBox && window.popupStoreSelectBox.remove();
            var storeContainerStr = '';
            storeContainerStr+= '<div class="mb10" id="filterStoreBox">\
                                <div style="background:#f4f4f4;padding:12px;" class="form-inline">\
                                    <select id="'+o.provinceId+'" class="form-control" name="province_pop" style="width:120px;"><option value="">省份</option></select>\
                                    <select id="'+o.cityId+'" class="form-control" name="city_pop" style="width:120px;"><option value="">地级市</option></select>\
                                    <select id="'+o.townId+'" class="form-control" name="district_pop" style="width:120px;"><option value="">市、县、区</option></select>\
                                    <div class="input-group">\
                                        <input placeholder="店铺名称" type="text" class="form-control" value="" style="width:170px" name="storeName">\
                                        <span class="input-group-btn">\
                                            <input class="btn btn-default" id="filterStoreSearchBtnPop" type="button" value="筛选">\
                                        </span>\
                                    </div>\
                                </div>\
                                <div class="storeListContainer p10" style="max-height:300px;overflow:auto;">\
                                </div>\
                            </div>';
            window.popupStoreSelectBox = dialog({
                title:o.title,
                id:o.dialogId,
                fixed: true,
                content: storeContainerStr,
                width:690,
                okValue: '确定',
                cancelValue:'取消',
                backdropOpacity:"0.6",
                statusbar: o.type == 'multiple' ? ('<label class="inline"><input type="checkbox" id="checkAll-dialog" />全选'+(o.length ? '(本次最多同时操作<span class="maxLength"></span>家门店)':'')+'</label>') : '',
                ok: function () {
                    var storeList = [],
                        maxLength = ~~$("#checkAll-dialog").siblings(".maxLength").text(),
                        uiOff = $("#checkAll-dialog").data("off");
                    $("#filterStoreBox .storeListContainer","[id='content:"+o.dialogId+"']").find("input:checked").each(function(i,e){
                        storeList.push({
                            id: $(e).data("id"),
                            name: $(e).parent().text(),
                            salesCount : $(e).data("salescount")
                        });
                    });
                    if(storeList.length == 0){
                        Util.alert("至少选择一家门店");
                        return false;
                    }else if(o.length && storeList.length > maxLength){
                        Util.alert("本次最多同时操作"+maxLength+"家门店,您已选"+storeList.length+"家");
                        return false;
                    }else{
                        o.okCallback && o.okCallback(storeList);
                        this.close();return false;
                    }
                },
                cancel:function(){this.close();return false;}
            });
            window.popupStoreSelectBox.showModal();
            if(o.type == 'multiple' && o.length){
                $("#checkAll-dialog").siblings(".maxLength").html(o.length);
            }
            getStoreList();
            // 初始化下拉框
            var loc = new Location();
            loc.fillOption(o.provinceId, '0');
            $("#"+o.provinceId+",#"+o.cityId+",#"+o.townId).select2();

            $('#'+o.provinceId).change(function() {
                $('#'+o.cityId).html('<option value="">地级市</option>');
                if($(this).val()){
                    loc.fillOption(o.cityId , '0,'+$(this).val());
                }
                $('#'+o.cityId).change();
            });
            $('#'+o.cityId).change(function() {
                $('#'+o.townId).html('<option value="">市、县、区</option>');
                if($(this).val()){
                    loc.fillOption(o.townId , '0,' + $('#'+o.provinceId).val() + ',' + $(this).val());
                }
                $('#'+o.townId).change();
            });

            $('#filterStoreSearchBtnPop',"[id='content:"+o.dialogId+"']").on('click', function(){
                var $diaFrm = $('#filterStoreBox',"[id='content:"+o.dialogId+"']"), 
                    pro = $diaFrm.find('[name="province_pop"] option:selected').text(),
                    city = $diaFrm.find('[name="city_pop"] option:selected').text(),
                    dist = $diaFrm.find('[name="district_pop"] option:selected').text(),
                    storeName = $diaFrm.find('[name="storeName"]').val();
                pro= pro=='省份'?'':pro;
                city= city == '地级市'?'':city;
                dist= dist =='市、县、区'?'':dist;
                getStoreList({
                    province : pro,
                    city : city,
                    district : dist,
                    storeName: storeName
                });
                $('#checkAll-dialog').prop('checked',false);
            });
            $("#checkAll-dialog").on("click",function(e){
                if($(this).prop("checked")){
                    $(".storeListContainer input").prop("checked",true);
                }else{
                    $(".storeListContainer input").prop("checked",false);
                }
            });
        }
    };
     
    $.createSecondMenu = function(firstMenu,secondMenu){
        var menuData = [],menuId="";
        if(!firstMenu){
            return false;
        }
        menuCurrent = firstMenu;
        switch(firstMenu){
            case "m_home":
            menuId = "101";
            break;
            case "store_manage":
            menuId = "102";
            break;
            case "product_manage":
            menuId = "103";
            break;
            case "promotion_manage":
            menuId = "106";
            break;
            case "data_view":
            menuId = "107";
            break;
            case "m_settings":
            menuId = "108";
            break;
            case "finance_manage":
            menuId = "178";
            break;
        }
        $.each(secondPrivilegeList,function(i,e){
            if(e.parentId == menuId){
                menuData.push(e);
                $.each(secondPrivilegeList,function(j,f){
                    if(f.parentId == e.id){
                        menuData.push(f);
                    }
                });
            }
        });
        var menu='<ul data-menu="'+firstMenu+'">';
        $.each(menuData,function(i,e){
            if(e){
                menu += '<li name="'+e.code+'" data-sub="'+e.id+'"><a '+(e.pic ? '' : 'style="padding-left:60px;"')+(e.mode=="1"?'target="_blank"':'')+' href="'+(e.url ? e.url : 'javascript:;')+'"'+(e.name==secondMenu ? ' class="active"':'') +'>'+(e.pic ? ('<i class="iconfont">'+e.pic+'</i>') : '')+'<span>'+e.name+'</span></a></li>'
            }
        });
        menu += '</ul>';
        $("#sidebar-menu").html(menu);
    };

    $.fn.replaceClass=function(a,b){
        var _t = $(this);
        if(_t.hasClass(a)){
            _t.removeClass(a).addClass(b);
        }else{
            _t.removeClass(b).addClass(a);
        }
    };

    $.fn.tabs=function(callback){
        return this.each(function(){
            $(this).children('li').on('click', 'a', function(){
                var _this = $(this);
                _this.parent().siblings('li').removeClass('active').end().addClass('active');
                (typeof callback === 'function') && callback(_this);
            })
        });
    };

    $.initDatePicker = function(pickers, options){
        pickers.forEach(function(v){
            var ST = v.ST, ET = v.ET, onpicked = v.onpicked || new Function, oncleared = v.oncleared || new Function;
            var st = ST.substring(1);
            var et = ET.substring(1);

            $(ST).on("click",function(){
                var $this = $(this);
                WdatePicker({
                    startDate:'%y-%M-%d 00:00:00',
                    dateFmt:'yyyy-MM-dd HH:mm:ss',
                    qsEnabled:false,
                    maxDate:'%y-%M-%d',
                    minDate:'#F{$dp.$D('+et+',{M:-3});}',
                    onpicked: function(){ onpicked($this);},
                    oncleared: function(){ oncleared($this)}
                });
            });

            $(ET).on("click",function(){
                var $this = $(this);
                WdatePicker({
                    startDate:'%y-%M-%d 23:59:59',
                    dateFmt:'yyyy-MM-dd HH:mm:ss',
                    qsEnabled:false,
                    maxDate: $(ST).val() ? '#F{$dp.$D('+st+',{M:3})}' : '%y-%M-%d',
                    minDate:'#F{$dp.$D('+st+');}',
                    onpicked: function(){ onpicked($this);},
                    oncleared: function(){ oncleared($this)}
                });
            });
        })
    }
})();
/*
组件：数字加减spinner.js
 */
/*
 * Fuel UX Spinner
 * https://github.com/ExactTarget/fuelux
 *
 * Copyright (c) 2012 ExactTarget
 * Licensed under the MIT license.
 */
!function(e){var t=function(t,i){this.$element=e(t),this.options=e.extend({},e.fn.spinner.defaults,i),this.$input=this.$element.find(".spinner-input"),this.$element.on("keyup",this.$input,e.proxy(this.change,this)),this.options.hold?(this.$element.on("mousedown",".spinner-up",e.proxy(function(){this.startSpin(!0)},this)),this.$element.on("mouseup",".spinner-up, .spinner-down",e.proxy(this.stopSpin,this)),this.$element.on("mouseout",".spinner-up, .spinner-down",e.proxy(this.stopSpin,this)),this.$element.on("mousedown",".spinner-down",e.proxy(function(){this.startSpin(!1)},this))):(this.$element.on("click",".spinner-up",e.proxy(function(){this.step(!0)},this)),this.$element.on("click",".spinner-down",e.proxy(function(){this.step(!1)},this))),this.switches={count:1,enabled:!0},this.switches.speed="medium"===this.options.speed?300:"fast"===this.options.speed?100:500,this.lastValue=null,this.render(),this.options.disabled&&this.disable()};t.prototype={constructor:t,render:function(){var e=this.$input.val();e?this.value(e):this.$input.val(this.options.value),this.$input.attr("maxlength",(this.options.max+"").split("").length)},change:function(){var e=this.$input.val();e/1?this.options.value=e/1:(e=e.replace(/[^0-9]/g,""),this.$input.val(e),this.options.value=e/1),this.triggerChangedEvent()},stopSpin:function(){clearTimeout(this.switches.timeout),this.switches.count=1,this.triggerChangedEvent()},triggerChangedEvent:function(){var e=this.value();e!==this.lastValue&&(this.lastValue=e,this.$element.trigger("changed",e),this.$element.trigger("change"))},startSpin:function(t){if(!this.options.disabled){var i=this.switches.count;1===i?(this.step(t),i=1):i=3>i?1.5:8>i?2.5:4,this.switches.timeout=setTimeout(e.proxy(function(){this.iterator(t)},this),this.switches.speed/i),this.switches.count++}},iterator:function(e){this.step(e),this.startSpin(e)},step:function(e){var t=this.options.value,i=e?this.options.max:this.options.min;if(e?i>t:t>i){var s=t+(e?1:-1)*this.options.step;(e?s>i:i>s)?this.value(i):this.value(s)}else if(this.options.cycle){var n=e?this.options.min:this.options.max;this.value(n)}},value:function(e){return!isNaN(parseFloat(e))&&isFinite(e)?(e=parseFloat(e),this.options.value=e,this.$input.val(e),this):this.options.value},disable:function(){this.options.disabled=!0,this.$input.attr("disabled",""),this.$element.find("button").addClass("disabled")},enable:function(){this.options.disabled=!1,this.$input.removeAttr("disabled"),this.$element.find("button").removeClass("disabled")}},e.fn.spinner=function(i,s){var n,a=this.each(function(){var a=e(this),o=a.data("spinner"),r="object"==typeof i&&i;o||a.data("spinner",o=new t(this,r)),"string"==typeof i&&(n=o[i](s))});return void 0===n?a:n},e.fn.spinner.defaults={value:1,min:1,max:999,step:1,hold:!0,speed:"medium",disabled:!1},e.fn.spinner.Constructor=t,e(function(){e("body").on("mousedown.spinner.data-api",".spinner",function(){var t=e(this);t.data("spinner")||t.spinner(t.data())})})}(window.jQuery);