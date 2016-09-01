define(['template','dialog'],function(template){
    var Util = {
        listLength:30,// 所有列表每页显示的数量
        countLessThan:"",// 商品低库存预警
        cdn:"https://qncdn.qiakr.com/",
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
        createSecondMenu:function(menuList,current){
            var menu='<ul>';
            $.each(menuList,function(i,e){
                menu += '<li'+(e.name==current ? ' class="ac"' : '')+(e.top ? ' style="margin-top:'+e.top+'px;"' : '')+'><a href="'+e.url+'"'+(e.blank ? 'target="_blank"' : '') +'>'+(e.icon ? e.icon : '')+e.name+'</a></li>'
            });
            menu += '</ul>';
            $("#leftSide").html(menu);
        }
    };
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
            if(data){
                format = data.toFixed(2);
                return format;
            }return '';
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
    })();

    jQuery.ajaxSetup({
        type: "post",
        dataType: 'json',
        timeout: 60000,
        //检验登陆超时
        dataFilter: function (data, type) {
            if (type === "json") {
                data = JSON.parse(data);
                if(data.status == "401") {
                    Util.alert("登录已超时，请重新登录",function(){
                        top.location.href = "index.htm";
                    });
                }else{
                    return JSON.stringify(data);
                }
            }else{
                return data;
            }
        },
        error: function () {
            Util.alert("系统繁忙，请稍后再试");
        }
    });

    $.fn.serializeObject=function(){"use strict";var result={};var extend=function(i,element){var node=result[element.name];if('undefined'!==typeof node&&node!==null){if($.isArray(node)){node.push(element.value)}else{result[element.name]=[node,element.value]}}else{result[element.name]=element.value}};$.each(this.serializeArray(),extend);return result};

    window.Util=Util;
    window.template=template;
});

$(function(){
    if(typeof menuCurrent != "undefined"){
        $(".header .nav li[name="+menuCurrent+"]").addClass("current");
    }
    $(".container").css({"min-height":($(window).height()-190)+"px"});
    $.getJSON("../admin/getLoginSupplierAccount.json",function(data){
        $(".header .account").html(data.result.loginAccount.username);
    });
    $(".header .out").on("click",function(e){
        e.preventDefault();
        $.getJSON("../logout.json",function(data){
            location.href="index.htm";
        })
    });
});