var dataPage=0,allowScroll=true;
qkUtil.loading.show();
getAjaxData(dataPage,true);
function getAjaxData(idx,clear){
    if(allowScroll){
        allowScroll = false;
        $("body").append('<div class="loading-bottom">加载中...</div>');
        $.getJSON("getCustomerFavoriteStockList.json?index="+idx+"&length="+baseOption.pageSize,function(data){
            if(data.status=='0'){
                if(data.result.stockList.length>0){
                    var htmlStr = [];
                    $.each(data.result.stockList,function(i,e){
                        htmlStr.push('<li><a href="getStockInfoForCustomer.htm?stockId='+e.stock.id+'">\
                                        <div class="p-img" style="background-image:url('+e.productSupplier.picUrl+'?imageView2/1/h/300)"></div>\
                                        <div class="p-info">'+e.productSupplier.name+'</div><div class="p-flag">');
                        if(e.minSkuPrice==e.stock.tagPrice){
                             htmlStr.push('<span class="sku-price normal">¥'+parseFloat(e.minSkuPrice).toFixed(2)+'</span>');
                        }else{
                            htmlStr.push('<span class="sku-price">¥'+parseFloat(e.minSkuPrice).toFixed(2)+'</span>\
                                         <span class="tag-price"><span class="yen">¥'+parseFloat(e.stock.tagPrice).toFixed(2)+'</span>');
                        }
                        htmlStr.push('</div></a></li>');
                    });
                    $('#favListItem').append(htmlStr.join(''));
                }else{
                    if(clear){
                        $('#favListItem').append('<section class="noResult tc"><span>收藏夹为空哦</span><div><a href="../store.htm?suid='+$("#suid").val()+'" class="btn btn-red" style="display:inline-block;background:#e04241;">立即去添加</a></div></section>');
                    }
                }
                qkUtil.loading.hide();
                $(".loading-bottom").remove();
                allowScroll = data.result.all ? false : true;
            }
            
        });
    }
}

scrollToLoadMore({
    callback:function(){
        getAjaxData(dataPage);
    }
});