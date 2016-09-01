getAjaxData(0)
function getAjaxData(idx){
	var param = {
		stockId : getUrlParam("stockId"),
		index : idx,
		length : baseOption.pageSize
	}
	$.getJSON("getStockAppraiseList.json",param,function(data){
	    if(data.status="0"){
	        $("#commentCount").html(data.result.count);
	        var comStr = "";
	        $.each(data.result.appraiseStockVoList,function(i,e){
	            comStr+='<div class="item">\
	              <div class="wbox">\
	                <img src="'+(e.customer.avatar ? e.customer.avatar :"https://qncdn.qiakr.com/mall/default-photo.png")+'" class="size43 round mr10">\
	                <div class="wbox-1 lh22">\
	                  <div>\
	                    '+(e.customer.name ? e.customer.name : "匿名")+'<div class="appProgress ml5"><span class="val" style="width:'+(e.appraiseStock.stars*20).toFixed(2)+'%"></span></div>\
	                  </div>\
	                  <div class="fc-grey fs12">'+getLocalTime(e.appraiseStock.gmtCreate)+'</div>\
	                </div>\
	              </div>\
	              <div class="fc-grey pt5">'+e.appraiseStock.comment+'</div>\
	            </div>';
	        });
	        $(".appriseBox .cont").append(comStr);
	        if(data.result.all){
	            $(".loadingBox a").html("没有更多了").off();
	        }else{
	            $(".loadingBox a").html("点击查看更多").off().on("click",function(e){
	                e.preventDefault();
	                getAjaxData(idx + ~~baseOption.pageSize);
	            });
	        }
	    }
	});
}