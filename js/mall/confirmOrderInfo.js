var stockInfo;
if(!sessionStorage.stockInfo){  // 没有购买信息则跳转回购物车
  history.go(-1);
}else{
  stockInfo = JSON.parse(sessionStorage.stockInfo)[0];
}
template.helper('toString', function (data, format) {
    if(!data) return '';
    return JSON.stringify(data);
});

var page = {
    delivery : stockInfo.delivery,
    couponable : stockInfo.sourceType == 0 ? true : false,  //是否可使用优惠券
    suid : getUrlParam("suid"),
    useCoupon : true,
    couponId : '',  // 优惠券ID
    discountPromotionId:'', //满减满折活动
    addressList:[],
    addressId : '',  // 收获地址
    tagPrice : 0,  
    storeId : stockInfo.storeId,
    availableCouponList : [],  // 可用优惠券
    unavailableCouponList : [],  // 不可用优惠券
    discountPromotionList : [],
    loadedCoupon : false,
    shoppingListJson : '',
    isCouponLoaded: false,
    init:function(){
      this.initDefaultAddress();
      this.initStock();
      this.confirmEv();
    },
    initDefaultAddress:function(){
      var _t = this;
      $.getJSON("getCustomerAddressList.json",{index:0,length:"20"},function(data) {
        if(data.status=="0"){
          var list = data.result.addressList;
          if(list.length===0){
            var html = template("receiverEditor",{
              type:_t.delivery,
              info:{}
            });
            $("#addressSel").parent().on("click",function(){
              _t.initActionSheet(html);
              _t.bindEditEvent("new");
            }).trigger("click");
          }else{
            var defaultArr = $.grep(list,function(e){
              return e.defaultAddr==1;
            });
            if(defaultArr.length>0){
              var addr = defaultArr[0];
              if(_t.delivery == 1 && (!addr.district || !addr.detail)){
                  var editHtml = template("receiverEditor",{
                    type:_t.delivery,
                    info:addr
                  });
                  _t.initActionSheet(editHtml);
                  _t.bindEditEvent();
              }else{
                _t.addressId=addr.id;
                $("#addressSel").html('<p class="name">'+addr.personName+" "+addr.mobile+' <span class="defaultTip">默认</span></p>'+(addr.district&&_t.delivery=="1" ? ('<p class="c-9 detail fs14">'+addr.province+addr.city+addr.district+addr.detail+'</p>'):''));
              }
              list = $.grep(list,function(e){
                return e.defaultAddr==0;
              });
              list = defaultArr.concat(list);
            }
            _t.addressList = list;
            $("#addressSel").parent().on("click",function(){
              _t.selectReceiverAddress();
            });
          }
        }
      });
    },
    bindEditEvent:function(type){
      var myApp = new Framework7();
      var loc = new mLocation();
      var existVaule = loc.refind($("#addressPicker").val());
      // console.log(existVaule)
      var locPicker = myApp.picker({
        input: '#addressPicker',
          // rotateEffect: true, //3D效果
          formatValue: function (picker, values, displayValues) {
              return displayValues[0]+" "+displayValues[1]+" "+displayValues[2];
          },
          cols: [
              {
                  textAlign: 'left',
                  values: loc.find("0").key,
                  displayValues: loc.find("0").val,
                  width:"25%",
                  onChange: function (picker, v) {
                    if(picker.cols[1].replaceValues){
                      var arr = loc.find("0,"+v);
                        picker.cols[1].replaceValues(arr.key,arr.val);
                      }
                      if(picker.cols[2].replaceValues){
                        var town = loc.find("0,"+v,'key').key,
                          arr2 = loc.find("0,"+v+","+town[0]);
                          picker.cols[2].replaceValues(arr2.key,arr2.val);
                      }
                  }
              },
              {
                textAlign: 'left',
                  values: loc.find('0,1').key,
                  displayValues: loc.find("0,1").val,
                  width:"35%",
                  onChange: function (picker, v) {
                      if(picker.cols[2].replaceValues){
                        var arr = loc.find("0,"+picker.cols[0].value+","+v);
                          picker.cols[2].replaceValues(arr.key,arr.val);
                      }
                  }
              },
              {
                textAlign: 'left',
                  values: loc.find('0,1,2').key,
                  displayValues: loc.find("0,1,2").val,
                  width:"40%"
              }
          ],
          onOpen:function(){
            $("#addressPicker").focus();
            locPicker.setValue(existVaule);
            existVaule="";
            $("#weui_actionsheet").addClass("slideUpBox");
          },
          onClose:function(){
            $("#weui_actionsheet").removeClass("slideUpBox");
          }
      });
      $("#saveAddress").on("click",function(){
        var form = $("#weui_actionsheet form"),msg = form.serializeObject();
        form.find(".weui_cell").each(function(i,e){
          if($(e).find("input").val().trim()===""&&!$(e).hasClass("dn-must")){
            $(e).addClass("weui_cell_warn");
          }else{
            $(e).removeClass("weui_cell_warn");
          }
        });
        if(form.find(".weui_cell_warn").length === 0){
          if(!/^1[34578][0-9]{1}\d{8}$/.test(msg.mobile)){
            mobileAlert("请填写正确的手机号码");
            $("input[name=mobile]").closest(".weui_cell").addClass("weui_cell_warn");
            return false;
          }
          var addr = msg.locat ? msg.locat.split(" ") : ["","",""];
          msg.country="中国";
          msg.province=addr[0];
          msg.city=addr[1];
          msg.district=addr[2];
          delete msg.locat;
          Zepto.ajax({
            type:"post",
            url:msg.id ? "updateCustomerAddress.json" :"insertCustomerAddress.json",
            dataType:"json",
            data:msg,
            success:function(data){
              if(data.status=="0"){
                var newAr = data.result.address;
                $.getJSON("getCustomerAddressList.json",{index:0,length:"20"},function(newAddr) {
                  if(newAddr.status=="0"){
                    page.addressList = newAddr.result.addressList;
                    if(type=="new"){
                      $("#addressSel").parent().off().on("click",function(){
                        page.selectReceiverAddress();
                      });
                    }
                  }
                });
                page.addressId=newAr.id;
                $("#addressSel").html('<p class="fs16">'+newAr.personName+" "+newAr.mobile+'</p>'+(msg.province&&page.delivery=="1" ? ('<p class="c-9">'+newAr.province+(newAr.city||"")+(newAr.district||"")+(newAr.detail||"")+'</p>') : ''));
                $("#mask").trigger("click");
              }else{
                mobileAlert(data.errmsg||"系统繁忙，请稍后再试");
              }
            }
          });
        }
      });
    },
    selectReceiverAddress:function(){
      var _t = this;
      var html = template("addressListTpl",{
        type:_t.delivery,
        list:_t.addressList,
        id:_t.addressId
      });
      _t.initActionSheet(html);
      $('#weui_actionsheet').find(".weui_check").on("click",function(){
        var addr="",dom = $(this).closest(".weui_cell").find(".weui_cell_bd"),info=$(this).closest(".weui_cells_checkbox").find(".editAddress").data("info");
        if(_t.delivery=="1"){
          if(!info.detail || !info.district){
            $('#addressReplenishDia').show().on('click', '.closeDia', function () {
              $('#addressReplenishDia').off('click').hide();
            }).on('click','.confirmDia',function(){
              $('#addressReplenishDia').off('click').hide();
              dom.closest(".weui_cells_checkbox").find(".editAddress").trigger("click");
              return false;
            });
          }else{
            addr = dom.html();
          }
        }else{
          addr = dom.find(".name")[0].outerHTML;
        }
        if(addr){
          _t.addressId=$(this).val();
          $("#addressSel").html(addr);
        }
        $('#mask').trigger("click");
      });
      $('#weui_actionsheet').find(".editAddress").on("click",function(){
        var info = $(this).data("info");
        $('#mask,#weui_actionsheet').remove();
        var editHtml = template("receiverEditor",{
          type:_t.delivery,
          info:info
        });
        _t.initActionSheet(editHtml);
        _t.bindEditEvent();
      });
      $('#weui_actionsheet').find(".newAddress").on("click",function(){
        $('#mask,#weui_actionsheet').remove();
        var editHtml = template("receiverEditor",{
          type:_t.delivery,
          info:{}
        });
        _t.initActionSheet(editHtml);
        _t.bindEditEvent();
      });
    },
    selectCoupon:function(){
      var mask = $('#mask_coupon');
      var action = $('#weui_actionsheet_coupon');
      setTimeout(function(){
        action.addClass('weui_actionsheet_toggle');
        mask.show().addClass('weui_fade_toggle').one('click', function () {
            hideActionSheet(action, mask);
        });
      },0);
      action.unbind('transitionend').unbind('webkitTransitionEnd');
      function hideActionSheet(action,mask){
        action.removeClass('weui_actionsheet_toggle');
        mask.removeClass('weui_fade_toggle');
        action.on('transitionend', function () {
            mask.hide();
        }).on('webkitTransitionEnd', function () {
            mask.hide();
        });
      }
    },
    initActionSheet:function(html){
      $("body").append(html);
      var mask = $('#mask');
      var action = $('#weui_actionsheet');
      setTimeout(function(){
        action.addClass('weui_actionsheet_toggle');
        mask.show().addClass('weui_fade_toggle').one('click', function () {
            hideActionSheet(action, mask);
        });
      },0);
      $('#actionsheet_cancel').one('click', function () {
          hideActionSheet(action, mask);
      });
      function hideActionSheet(action,mask){
        action.removeClass('weui_actionsheet_toggle');
        mask.removeClass('weui_fade_toggle');
        action.on('transitionend', function () {
            mask.remove();
            action.remove();
        }).on('webkitTransitionEnd', function () {
            mask.remove();
            action.remove();
        });
      }
    },
    initStock:function(){
      // 分销订单不支持优惠券
      if(!page.couponable){
        $("#couponSel").closest(".selection").hide();
      }
      var shoppingListArray = [];
      var stockHtml = template("stockListTpl",{
        list:stockInfo.stockList
      });
      $("#confirmList").append(stockHtml);
      Zepto.each(stockInfo.stockList, function(j, t) {
        var shoppingListItem = '{"shoppingCount":' + t.count + ',"skuId":' + t.skuId + ',"stockId":' + t.id + (t.cartId ? ',"id":' + t.cartId + '' : '') + '}';
        shoppingListArray.push(shoppingListItem);
      });
      page.shoppingListJson = '[' + shoppingListArray.join(",") + ']';
      this.prepareOrder();
    },
    prepareOrder:function(couponId,discountId){
      var _t = this;
      var params = {
        storeId:_t.storeId,
        deliveryType : _t.delivery,
        shoppingListJson : _t.shoppingListJson
      };
      if(couponId){
        params.customerCouponId = couponId;
      }
      if(discountId){
        params.discountPromotionId = discountId;
      }
      $.getJSON("prepareOrder.json",params,function(data) {
        if (data.status != 0) {
          mobileAlert("获取支付信息失败，请稍后重试");
          $("#gotoPay").hide();
        }
        if(!_t.loadedCoupon){
          _t.getCouponList(data.result.payment,data.result.totalPrice);
        }else{
          $("#totlePrice").html(data.result.payment);
          $("#totalSettlement").html(data.result.totalPrice);
        }
        if(parseFloat(data.result.postFee)>0){
          $("#postFeeSettlement").show().html("运费：+"+data.result.postFee+'元');
         }else{
          $("#postFeeSettlement").hide();
         }
      });
    },
    getCouponList:function(payment,totalPrice){
      var _t = this;
      var couponParam = {
        storeId: _t.storeId,
        payment: totalPrice,
        shoppingListJson: _t.shoppingListJson
      };
      $.getJSON("getAvailableCoupon.json", couponParam, function(data) {
        if (data.status == 0) {
          $("#totlePrice").html(payment);
          $("#totalSettlement").html(totalPrice);
          _t.availableCouponList = data.result.availableList;
          _t.unavailableCouponList = data.result.unavailableList;
          _t.loadedCoupon = true;
          var promotionList = data.result.discountPromotionVoList;
          if(data.result.availableList.length===0 && promotionList.length==0){
            $("#couponSel .weui_cell_bd").html("暂无可用优惠");
            // return false;
          }
          var maxDiscount={
            id:"",
            name:"",
            value:0
          },maxCoupon = {
            id: "",
            name: "",
            value: 0
          };
          if (data.result.availableList.length > 0) {
            // 获取最大可使用优惠券
            _t.availableCouponList.sort(function(a,b){return b.coupon.couponValue-a.coupon.couponValue;});
            maxCoupon = {
              id: _t.availableCouponList[0].customerCouponId,
              name: _t.availableCouponList[0].coupon.couponName,
              value: _t.availableCouponList[0].coupon.couponValue
            };
            if(+payment <= +maxCoupon.value){
              mobileAlert("支付金额不能小于优惠的金额");
              $("#gotoPay").hide();
            }else{
              $("#gotoPay").show();
            }
          }
          
          if(promotionList.length > 0){
            promotionList.sort(function(a,b){
              return b.discountPrice - a.discountPrice;
            });
            _t.discountPromotionList = promotionList;
            maxDiscount = {
              id:promotionList[0].id,
              name:promotionList[0].promotionName,
              value:promotionList[0].discountPrice
            };
          }
          if(+maxCoupon.value <= +maxDiscount.value){
            maxCoupon = maxDiscount;
            _t.discountPromotionId = maxDiscount.id;
          }else{
            _t.couponId = maxCoupon.id;
          }
          _t.initCouponList();
          if(+maxCoupon.value > 0){
            $("#couponSel .weui_cell_bd").html(maxCoupon.name + " <span class='fc-red'>-" + maxCoupon.value.toFixed(2) + "元</span>");
            $("#discountSettlement").show().html("使用优惠：-"+maxCoupon.value.toFixed(2)+"元");
            $("#totlePrice").html((parseFloat(payment) - maxCoupon.value).toFixed(2));
          }
        }
        page.isCouponLoaded = true;
      });
    },
    initCouponList:function(){
      var _t = this;
      if(_t.availableCouponList.length===0 && _t.unavailableCouponList.length===0 && _t.discountPromotionList.length===0){
        $("#discountSettlement").hide();
        return false;
      }else{
        var wrap = template('couponListWrap',{});
        $("body").append(wrap);
        var listStr2 = template('couponTemplate', {
          list : _t.unavailableCouponList,
          status : "disabled"
        });
        $(".couponListWrap").prepend(listStr2);
        var listStr1 = template('couponTemplate', {
          list : _t.availableCouponList,
          using : _t.couponId
        });
        $(".couponListWrap").prepend(listStr1);
        var listStr0 = template('discountTemplate', {
          list : _t.discountPromotionList,
          using : _t.discountPromotionId
        });
        $(".couponListWrap").prepend(listStr0);
        
        $("#couponSel").on("click",function(){
          _t.selectCoupon();
        });
        $('#weui_actionsheet_coupon .weui_check').on("click",function(){
          if($(this).hasClass("disable")){
              $("#mask_coupon").trigger("click");
              $('#couponDisableDia').show().on('click', '.closeDia', function () {
                $('#couponDisableDia').off('click').hide();
              }).on('click','.confirmDia',function(){
                location.href="getStoreHomePage.htm?storeId="+_t.storeId;
              });
            return false;
          }
          var name = $(this).closest(".weui_cell").find(".promotionName").text(),
            value=parseFloat($(this).data("val")).toFixed(2),
            id=$(this).val();
          if(!isNaN(value)){
            if($(this).hasClass("useDiscount")){
              _t.discountPromotionId=id;
              _t.couponId="";
            }else{
              _t.discountPromotionId="";
              _t.couponId=id;
            }
            $("#couponSel .weui_cell_bd").html(name + " <span class='fc-red'>-" + value + "</span>");
            $("#discountSettlement").show().html("使用优惠：-"+value+"元");
          }else{
            _t.discountPromotionId="";
            _t.couponId="";
            $("#couponSel .weui_cell_bd").html(" 请选择优惠方式");
            $("#discountSettlement").hide().empty();
          }
          _t.prepareOrder(_t.couponId,_t.discountPromotionId);
          $("#mask_coupon").trigger("click");
        });
      }
    },
    createOrder:function(){
      var _t = this;
      var param = {
        storeId: _t.storeId,
        customerCouponId: _t.couponId,
        discountPromotionId:  _t.discountPromotionId,
        payment: $("#totlePrice").text(),
        preparePayment: $("#totlePrice").text(),
        salesId: sessionStorage.salesId,
        share: sessionStorage.salesId ? "1" : "0",
        deliveryType: _t.delivery,
        payType: $("input[name=payType]:checked").val(),
        customerAddressId: _t.addressId,
        remark:$("#orderRemark").val(),
        shoppingListJson: _t.shoppingListJson
      };
      $.getJSON("createOrder.json", param, function(data) {
        if (data.status === "0") {
          if(!data.result.orderId){
            mobileAlert('');
            msg.alert({
              title: '生成订单失败',
              content: '优惠信息或商品价格已变更，请刷新结算页面',
              buttons: [
                  { text:'刷新', id:"refreshPage", handler:function(){location.reload();} }
              ]
            });
            return false;
          }
          sessionStorage.removeItem("stockInfo");
          if (param.payType == 2) {
            location.href = "wechatPayOpenId.htm?orderId=" + data.result.orderId;
          } else {
            location.href = "alipayConfirm.htm?orderId=" + data.result.orderId;
          }
        } else if (data.status == 1) {
          mobileAlert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
        } else {
          mobileAlert("系统繁忙，请稍后再试");
          setTimeout(function() {
            location.reload();
          }, 1500);
        }
      });
    },
    confirmEv:function(){
      var _t = this;
      $("#gotoPay").on("click", function() {
        if (!_t.addressId) {
          mobileAlert("请选择收货人");
          return false;
        }
        if (!page.isCouponLoaded){
          mobileAlert("正在计算优惠方式");
          return false;
        }
        // 判断登录
        if (sessionStorage.isLogin == "false") {
          showMPLoginBox(function() {
            $("#gotoPay").trigger("click");
          },_t.suid);
          return false;
        }
        _t.createOrder();
      });
    }
};
page.init();
