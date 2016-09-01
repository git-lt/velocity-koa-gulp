$("input.yes").prop("checked",false);
sessionStorage.removeItem("usedCoupon");
$("#returnStore").attr("href","../mall/getStoreHomePage.htm?storeId="+sessionStorage.storeId)
var priceTottle = 0,selectedStore;

// 勾选商品
$(".storeMsg .yes").click(function(){
  var thisStoreSel = $(this).closest(".cart-list").find('input[name="checkProduct"]');
  if($(this).prop("checked")){
    thisStoreSel.prop("checked",true);
  }else{
    thisStoreSel.prop("checked",false);
  }
});
$('.list .yes, .storeMsg .yes').click(function(){
  if($(this).prop("checked")){
    var otherStore = $(this).closest(".cart-list").siblings().find('input[name="checkProduct"]:checked');
    if(otherStore.length>0){
        mobileAlert("暂不支持跨店铺结算");
        otherStore.prop("checked",false);
    }
    if($(this).closest(".cart-list").find("input.self:checked").length > 0 && $(this).closest(".cart-list").find("input.post:checked").length > 0 && !$(this).closest(".cart-list").data("supplier")){
      $(this).closest(".cart-list").find("input.self").prop("checked",false);
      mobileAlert("到店自提的商品请单独下单");
    }
  }
  getPayment();
});
$('.list .yes').click(function(){
  if($(this).closest(".list").find('input[name="checkProduct"]').not("input:checked").length==0){
    $(this).closest(".cart-list").find(".storeMsg .yes").prop("checked",true);
  }else{
    $(this).closest(".cart-list").find(".storeMsg .yes").prop("checked",false);
  }
});

// 自动勾选店铺下的商品
if(sessionStorage.storeId){
  $(".cart-list").each(function(i,e){
    if($(e).data("store")==sessionStorage.storeId){
      $(e).find(".storeMsg .yes").trigger("click");
    }
  })
}

// 编辑购物车
$(".storeMsg .edit").on("click",function(e){
  e.preventDefault();
  if(!$(this).hasClass("doing")){
    $(this).text("完成").addClass("doing").closest(".cart-list").find(".d-plus, .remove").show();
    $(this).closest(".cart-list").find(".money").hide();
  }else{
    $(this).text("编辑").removeClass("doing").closest(".cart-list").find(".d-plus, .remove").hide();
    $(this).closest(".cart-list").find(".money").show();
    $(this).closest(".cart-list").find(".shopCount").each(function(i,e){
      $(e).html($(this).closest("dl").find("input.count").val());
    })
  }
});

// 编辑购物车数量
$(".d-plus .count").on("blur",function(){
    var count = ~~$(this).val(), maxCount = ~~$(this).data("max"),limitBuyCount=~~$(this).data("limit");
    if(limitBuyCount){
        // 限购获取库存和限购数量的最小值
        if(count > Math.min(limitBuyCount,maxCount)){
            $(this).val(Math.min(limitBuyCount,maxCount));
            return false;
        }
    }else{
        // 未限购
        if(count > maxCount){
            $(this).val(maxCount);
            return false;
        }
    }
    if(count < 1){
        $(this).val("1");
    }else{
        $(this).val(count);
    }
    getPayment();
});
$(".d-plus .jia, .d-plus .jian").on("click",function(){
    var countInput = $(this).parent().find(".count"),
        priceSingle=$(this).closest(".list").find(".price").text(),
        max = ~~countInput.data("max"),
        limitBuyCount = ~~countInput.data("limit");
    if($(this).hasClass("jia")){
        if(limitBuyCount){
            if(~~countInput.val() >= Math.min(limitBuyCount,max)){
                return false;
            }
        }else{
            if(~~countInput.val() >= max){
                return false;
            }
        }
        priceTottle = priceTottle + parseFloat(priceSingle);
        countInput.val(~~countInput.val()+1);
    }else{
      if(~~countInput.val() <= 1) return false;
      priceTottle = priceTottle - parseFloat(priceSingle);
      countInput.val(~~countInput.val()-1);
    }
    getPayment();
});

// 删除购物车
$(".cart-list .remove").on("click",function(e){
  var _t = $(this),cartid = _t.data("id");
  $.getJSON("deleteCustomerShoppingCart.json?customerShoppingCartId="+cartid,function(data){
    if(data.status==0){
      var store = _t.closest(".cart-list");
      _t.closest("dl").remove();
      getPayment();
      if(store.find(".list .wbox").length==0){
        store.remove();
      }
    }
  })
});


// 结算购物车价格
function getPayment(){
  priceTottle = 0;
  Zepto.each($('.list .yes:checked'),function(i,e){
    var dl = $(e).closest("dl");
    priceTottle += (parseFloat(dl.find(".price").text()) * parseFloat(dl.find(".count").val()))||0 ;
  });
  $("#priceTottle").html(priceTottle.toFixed(2));
  if(priceTottle == 0){
    $("#gotoPay").attr("disabled","disabled");
  }else{
    $("#gotoPay").removeAttr("disabled");
  }
}
$(".d-plus").on("click",function(e){
  e.preventDefault();
});


$("#gotoPay").on("click",function(){
  if(!$(this).attr("disabled")){
    var stockArray=[],
      tit=$('.list .yes:checked:first').closest(".cart-list").find("a.store"),
      firstChecked = $('.list .yes:checked:first'),
      delivery = firstChecked.closest(".cart-list").data("supplier") ? 1 : (firstChecked.hasClass("self") ? 2 : 1);
    var stockMsg = {
        "storeName":tit.text(),
        "storeId":tit.data("id"),
        "salesId" : firstChecked.data("salesid"),
        "stockList":[],
        "delivery":delivery,
        "sourceType":$('.list .yes:checked:first').closest(".cart-list").data("supplier") ? 1 : 0,
      }
    Zepto.each($('.list .yes:checked'),function(i,e){
      var dd = $(e).closest("dl").find(".stockInfo");
      stockMsg.stockList.push({
          "img":dd.find(".size40").attr("src"),
          "name":dd.find(".name").text(),
          "id":dd.data("id"),
          "cartId":dd.data("cartid"),
          "size":dd.find(".size").text(),
          "color":dd.find(".color").text(),
          "skuId":dd.data("skuid"),
          "count":dd.find(".count").val(),
          "price":dd.siblings(".action").find(".price").text()
      });
    });
    stockArray.push(stockMsg)
    sessionStorage.stockInfo = JSON.stringify(stockArray);
    if(location.pathname.indexOf("qstore") > -1){
      location.href="../mall/confirmOrderInfo.htm?storeId="+tit.data("id")+"&salesId="+firstChecked.data("salesid");
    }else{
      location.href="confirmOrderInfo.htm?suid="+getUrlParam("suid")+"&storeId="+tit.data("id")+"&salesId="+firstChecked.data("salesid");
    }
  }
});

$(".toShoppingCart").hide();