qkUtil.loading.show("正在为您查找附近的店");
localStorage.removeItem("storeHistory");
var latitude,longitude,userSupplierId=getUrlParam("supplierId");
if(localStorage.storeHistory2){
    var th=JSON.parse(localStorage.storeHistory2), reg = new RegExp('.*storeId=([^"]*)');
    for(var suid in th){
        var sh = th[suid],suidArr=[];
        $.each(sh,function(i,e){
            var rs = e.match(reg);
            suidArr.push(parseInt(rs[1]));
        });
        th[suid]=suidArr;
    }
    localStorage.storeHistory3 = JSON.stringify(th);
    localStorage.removeItem("storeHistory2");
}
var totalHistory=localStorage.storeHistory3 ? JSON.parse(localStorage.storeHistory3) : {},
    storeHistory=totalHistory[userSupplierId]||[];

var autoGetData=setTimeout(function(){
    getAjaxData(userSupplierId,"","",0,true);
},6000);
if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getStoreList,getLocationFailed);
}
function getStoreList(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    // alert(latitude+"==="+longitude)
    clearTimeout(autoGetData);
    getAjaxData(userSupplierId,longitude,latitude,0,true);
}
function getLocationFailed(error){
    clearTimeout(autoGetData);
	getAjaxData(userSupplierId,"","",0,true);
	// if(error.code=="1"){
	// 	alert("用户拒绝访问地理位置权限");
	// }else{
	// 	alert("获取地理位置失败");
	// }
}
// getAjaxData(userSupplierId,"","",0,true)
function getDistance(d){
	var distance;
	if(!d){
		return ""
	}else if(d<500){
		return "&lt500米";
	}else if(d < 1000){
		return ~~d+"米";
	}else if(d<10000){
		return (d/1000).toFixed(2)+"千米";
	}else if(d<100000){
		return (d/1000).toFixed(1)+"千米";
	}else{
		return "&gt100千米";
	}
}
function getAjaxData(supplierId,lon,lat,idx,clear){
	if(clear){
		$("#storeAround").empty();
	}
	var param={
		supplierId : supplierId,
		longitude : lon,
		latitude : lat,
		index : idx,
		length : "10",
		open : "0"
	};
	$.post("searchStoreBySupplierId.json",param,function(data){
		if(data.status=="0"){
			var list = data.result.storeSearchVoList,listStr = "";
            if(list.length == 0 && clear){
                listStr = '<li class="noResult"><span class="store">抱歉，没有找到相关门店</span></li>';
                $("#storeCnt").parent().remove();
            }else{
                $("#storeCnt").html(list.length);
    			$.each(list,function(i,e){
    				listStr+='<li>'+
						'<a data-id='+e.store.id+' href="getStoreHomePage.htm?storeId='+e.store.id+'" class="with-go-right">'+
							'<div class="wbox">'+
								'<div class="name wbox-1">'+e.store.name+($.inArray(e.store.id,storeHistory)>-1 ? '<span class="historyTag c-or fs12"> 最近逛过</span>' : '')+'</div>'+
								'<div class="c-9">'+getDistance(e.distance)+'</div>'+
							'</div>'+
							'<div class="c-9 pt5">'+(e.store.province||"")+(e.store.city||"")+(e.store.district||"")+" "+(e.store.detail||"")+'</div>'+
						'</a>'+
					'</li>';
    			});
            }
			$("#storeAround").append(listStr);
            var historyStoreList="";
            $(".historyTag").each(function(i,e){
                historyStoreList += $(e).closest("li")[0].outerHTML;
                $(e).closest("li").remove();
            });
            $("#storeAround").prepend(historyStoreList);
            $(".container").removeClass("op0");
            qkUtil.loading.hide();
		}
	});
}

$("#storeAround").on("click","li a",function(e){
    var storeId=$(this).data("id");
    if($.inArray(storeId,storeHistory) < 0){
        if(storeHistory.length>4){
            storeHistory.pop();
        }
        storeHistory.unshift(storeId);
        totalHistory[userSupplierId] = storeHistory;
        localStorage.storeHistory3 = JSON.stringify(totalHistory);
    }
    sessionStorage.removeItem("salesId");
    sessionStorage.firstInStore = "true";
    sessionStorage.latitude=latitude?latitude:"";
    sessionStorage.longitude=longitude?longitude:"";
    sessionStorage.getPosition = "true";
});