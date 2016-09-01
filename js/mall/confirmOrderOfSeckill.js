'use strict';
var stockInfo;
if(!sessionStorage.stockInfo){  // 没有购买信息则跳转回购物车
  history.go(-1);
}else{
  stockInfo = JSON.parse(sessionStorage.stockInfo)[0];
}
template.helper('toString', function (data) {
  if(!data) return '';
  return JSON.stringify(data);
});

var page = {
    totlePrice : +stockInfo.stockList[0].price,
    storeId:'',
    addressId:'',
    addressDetail:'',
    stockId:stockInfo.stockId,
    delivery:stockInfo.delivery=="2"?"1":"2",
    addressList:[],
    postFee : stockInfo.postFee ? parseFloat(stockInfo.postFee) : 0,
    init:function(){
      this.initDelivery();
      this.initDefaultAddress();
      this.initStock();
      this.initStoreList();
      this.confirmEv();
      this.judge();
    },
    judge:function(){
      $(document).on("ready",function(){
             var a = $("input[name=delivery]:checked").val();
             if(a==1)  $("#storeSel").hide();           
      });
    },
    initDelivery:function(){
      var _t = this;
      // stockInfo.delivery0:快递+店取;1:到店自取;2.仅快递
      $("#totalSettlement").html(_t.totlePrice.toFixed(2));
      if(stockInfo.delivery == "1"){ //到店自取
        $("#delivery1").closest(".weui_cell").hide(); //快递
        $("#delivery2").prop("checked", true); //到店
        $("#totlePrice").html(_t.totlePrice);
      }else if(stockInfo.delivery == "2"){ //快递
        $("#delivery2").closest(".weui_cell").hide();
        $("#delivery1").prop("checked", true);
        $("#storeSel").hide();
        if(_t.postFee){
          $("#postFeeSettlement").show().html("运费：+"+_t.postFee.toFixed(2)+'元');
        }
        $("#totlePrice").html(parseFloat(_t.totlePrice+_t.postFee).toFixed(2));
      }else{ // 快递+店取
        $("#totlePrice").html(_t.totlePrice.toFixed(2));
      }
      $("input[name=delivery]").on("change",function(){
        _t.delivery = $(this).val();
        if(_t.delivery=="2"){
          // 到店自提
          $("#storeSel").show();
          $("#postFeeSettlement").hide();
          $("#totlePrice").html(_t.totlePrice.toFixed(2));
        }else{
          // 快递
          $("#storeSel").hide();
          if(_t.postFee){
            $("#postFeeSettlement").show().html("运费：+"+_t.postFee.toFixed(2)+'元');
          }
          $("#totlePrice").html(parseFloat(_t.totlePrice+_t.postFee).toFixed(2));
          if(_t.addressDetail===""){
            $("#addressSel").html("请重新选择收货人");
            _t.addressId="";
          }
        }
        if(_t.addressList.length===0){
          var html = template("receiverEditor",{
            type:_t.delivery,
            info:{}
          });
          $("#addressSel").parent().off().on("click",function(){
            _t.initActionSheet(html);
            _t.bindEditEvent("new");
          }).trigger("click");
        }
      });
    },
    initDefaultAddress:function(){
      var _t = this;
      $.getJSON("getCustomerAddressList.json",{index:0,length:"20"},function(data) {
        if(data.status=="0"){
          var list = data.result.addressList;
          _t.addressList = list;
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
              _t.addressDetail=addr.province+addr.city+addr.district+addr.detail;
              if(stockInfo.delivery != "2" || (addr.district!="" && addr.detail!="")){
                _t.addressId=addr.id;
                $("#addressSel").html('<p class="name">'+addr.personName+" "+addr.mobile+' <span class="defaultTip">默认</span></p>'+(addr.district&&_t.delivery=="1" ? ('<p class="c-9 detail fs14">'+addr.province+addr.city+addr.district+addr.detail+'</p>'):''));
              }
              list = $.grep(list,function(e){
                return e.defaultAddr===0;
              });
              list = defaultArr.concat(list);
            }
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
          if(!new RegExp(/^1[34578][0-9]{1}\d{8}$/).test(msg.mobile)){
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
                var addr = data.result.address;
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
                page.addressId=addr.id;
                page.addressDetail=addr.province+addr.city+addr.district+addr.detail;
                $("#addressSel").html('<p class="fs16">'+addr.personName+" "+addr.mobile+'</p>'+(msg.province&&page.delivery=="1" ? ('<p class="c-9">'+addr.province+addr.city||""+addr.district||""+addr.detail||""+'</p>') : ''));
                $("#mask").trigger("click");
              }else{
                mobileAlert(data.errmsg||"系统繁忙，请稍后再试")
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
            _t.addressDetail=dom.find(".detail").html().trim();
          }
        }else{
          addr = dom.find(".name")[0].outerHTML;
          _t.addressDetail=dom.find(".detail").html().trim();
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
      var stockHtml = template("stockListTpl",{
        list:stockInfo.stockList
      });
      $("#confirmList").append(stockHtml);
    },
    initStoreList:function(){
      var _t = this;
      $.getJSON("getStoreListByFlashsleStockId.json?stockId="+_t.stockId,function(data){
        var listStr = template('storeListTpl', {
          list : data.result.storeList
        });
        $("body").append(listStr);
        $("#storeSel").on("click",function(){
          var mask = $('#mask_store');
          var action = $('#weui_actionsheet_store');
          setTimeout(function(){
            action.addClass('weui_actionsheet_toggle');
            mask.show().addClass('weui_fade_toggle').one('click', function () {
                hideActionSheet2(action, mask);
            });
          },0);
          action.unbind('transitionend').unbind('webkitTransitionEnd');
          function hideActionSheet2(action,mask){
            action.removeClass('weui_actionsheet_toggle');
            mask.removeClass('weui_fade_toggle');
            action.on('transitionend', function () {
                mask.hide();
            }).on('webkitTransitionEnd', function () {
                mask.hide();
            });
          }
        });
        $('#weui_actionsheet_store .weui_check').on("click",function(){
          _t.storeId=$(this).val();
          var name = $(this).closest(".weui_cell").html();
          $("#storeSel .weui_cell_bd").html(name);
          $("#mask_store").trigger("click");
        });
      });
    },
    createOrder:function(info){
      var param={
          orderId : stockInfo.orderId,
          storeId : page.storeId,
          deliveryType : page.delivery,
          payType : $("input[name=payType]:checked").val(),
          customerAddressId : page.addressId,
          remark:$("#orderRemark").val(),
        }
        $.getJSON("updateFlashsaleOrder.json",param,function(data){
          if(data.status==0){
            if(param.payType == 2){
              location.href="wechatPayOpenId.htm?orderId="+stockInfo.orderId;
            }else{
              location.href="alipayConfirm.htm?orderId="+stockInfo.orderId;
            }
          }else{
            mobileAlert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
            setTimeout(function(){
              location.reload();
            },2000);
          }
        });
    },
    confirmEv:function(){
      $("#gotoPay").on("click",function(){
        if (!page.addressId) {
          mobileAlert("请选择收货人");
        }else if(!page.storeId && page.delivery == "2"){
          mobileAlert("请选择自提门店");
        }else{
          if(sessionStorage.isLogin == "false"){
            showMPLoginBox(function(){
              $("#gotoPay").trigger("click");
            },stockInfo.supplierId);
            return false;
          }
          page.createOrder();
        }
      });
    }
}
page.init();