template.config('escape', false);
template.helper('toWrap', function (data, format) {
  if(!data) return "无";
  return data.replace(/\n|\r\n/g,"<br>"); 
});
if($("#pickUpCodeBar").length > 0){
  var barcodeStr = $("#pickUpCodeBar").text();
  var barW = barcodeStr.length>10? 1 : 2;
  $("#pickUpCodeBar").barcode(barcodeStr, "code128",{
    barWidth:barW, 
    barHeight:60,
    showHRI:false
  });
  var orderPickup = function(content){
    if(content.msgType===15){
      $(".pickedUp").show();
      setTimeout(function(){
        location.reload();
      },2000);
    }
  };
  baseOption.messageCallback.push(orderPickup);
}

$("body").on("click",".completeOrder",function(e){
    e.preventDefault();
    if(confirm("请在真正收到货的时候才确认收货\n是否确定？")){
      var id=$(this).data("id");
      $.getJSON("completeOrder.json?orderId="+id,function(data){
        if(data.status == "0"){
          $(".pickedUp").show();
          setTimeout(function(){
            location.reload();
          },1500);
        }
      });
    }
}).on("click",".prepayOrder",function(e){
    sessionStorage.stockInfo =  $(this).attr("data-info");
    sessionStorage.removeItem("confirmOrderMsg");
}).on("click","#payOrderNow",function(e){
  e.preventDefault();
  var _t = $(this),orderId = $(this).data("id");
  $.getJSON("checkBeforePayOrder.json?orderId="+orderId,function(data){
    if(data.status=="0"){
      location.href=_t.attr("href");
    }else{
      mobileAlert(data.errmsg||data.msg||"系统繁忙，请稍后再试。");
    }
  });
});

$(".viewExpress").on("click",function(){
  $(this).hide();
  $(".expressItem").html('<div class="loading-bottom">努力加载中...</div>');
  var id=$(this).data("id"),code = $(this).data("code");
  $.ajax({
    url:"http://api.ickd.cn/",
    data:"id="+baseOption.ickdID+"&secret="+baseOption.ickdKey+"&com="+id+"&nu="+code+"&callback=expressCallback",
    dataType:"jsonp",
    success:function(data){
      console.log(data);
      expressCallback(data);
    }
  });
});
function expressCallback(data){
  var dataStr = '';
  if(data.status == "0"){
    dataStr += data.message ? data.message : "暂时未跟踪到物流信息，请联系导购";
  }else{
    $.each(data.data,function(i,e){
      dataStr += '<div class="time">'+e.time+'</div>'+'<div class="msg">'+e.context+'</div>';
    });
  }
  $(".expressItem").empty().append(dataStr);
}

if($("#pageFrom").val()=="wechat"){
  var openId=$("#payOpenId").val(), orderId=$("#payOrderId").val();
  if(sessionStorage.payedOrder == orderId){
    location.href="getOrderListOfCustomer.htm";
  }else{
    qkUtil.loading.show("正在准备支付");
    // alert("请求:openId="+openId+"\n orderId="+orderId);
    Zepto.getJSON("wechatJsPayWithOpenId.json?openId="+openId+"&orderId="+orderId,function(data){
      qkUtil.loading.hide();
      // alert(JSON.stringify(data))
      if(data.status=="0"){
        var payJson = data.result.requestJson;
        var onBridgeReady=function(){
          var payParam = {
            "appId" : payJson.appId,
             "timeStamp" : payJson.timeStamp,
             "nonceStr" : payJson.nonceStr,
             "package" : payJson.package_,
             "signType" : payJson.signType,
             "paySign" : payJson.paySign
          };
          WeixinJSBridge.invoke('getBrandWCPayRequest', payParam, function(res){
                $("#cover").hide();
                if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                  sessionStorage.payedOrder = orderId;
                  location.href="payOrderResult.htm?orderId="+orderId;
                }
             }
          ); 
        }
        if (typeof WeixinJSBridge == "undefined"){
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
        }else{
          onBridgeReady();
        }
      }else{
        mobileAlert("支付失败，请点击页面下方“立即支付”重新支付",2500);
      }
    });
  }
}

// 关闭订单
var _changeBox = $(".mobilePrompt");
$("body").on("click",".closeOrder",function(){
    _changeBox.show();
}).on("click",".cancelBtn",function(e){
    _changeBox.hide();
}).on("click",".changeBtn",function(e){
    var id=$(this).data("id"),comment = _changeBox.find(".comment").val(),name=$("#cName").val();
    $.getJSON("closeOrder.json?orderId="+id+"&closePersonName="+name+"&closeComment="+comment,function(data){
      if(data.status=="0"){
        _changeBox.hide();
        mobileAlert("订单关闭成功");
        setTimeout(function(){
          sessionStorage.payedOrder == orderId;
          location.href="getOrderListOfCustomer.htm?salesId="+getUrlParam("salesId");
        },1500);
      }else{
        mobileAlert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
      }
    });
});

$(function(){
   // 关注 显示导购二维码
  var hasQRcode=false;
  $('#addAttentionBtn').on('click', function(){
          if(!hasQRcode){
          var $qrcodeImg = $('#qrCodeLoading').find('.qrcode-img');
            $.ajax({
              url:'getQrcodeBySalesId.json',
              data:{salesId:$("#salesId").val()},
              type:'POST',
              async:false,
              dataType:'json',
              success:function(data){
                if(data.status === '0'){
                  var codeStr =  data.result.qrcode.url;
                  var qrcode = new QRCode($qrcodeImg[0], {
                       width: 170,
                       height: 170
                  });
                  qrcode.makeCode(codeStr);
                  hasQRcode = true;
                }else{
                  mobileAlert('获取二维码失败！');
                }
              },
              error:function(){
                mobileAlert('获取二维码失败！');
              }
            });
          }
          if(hasQRcode){
            $.msg.alert({
              title:'', 
              content:$('#qrCodeLoading')[0], 
              clsIn:'fadeInDown', 
              clsOut:'fadeOutUp', 
              closeByMask:true
            });
          }
  });
});
$("#jumpChat").on("click", function(){
    // var contactUrl = $("#salesId").val() ? ("contactSales.htm?salesId="+$("#salesId").val()) : "contactSales.htm?brandId={{stockVo.product.brandId}}&supplierId={{stockVo.supplier.id}}&storeId=$!store.id&salesId=$!sales.id";
    var salesId = $("#salesId").val() || "";
    $.ajax({
        url: "../webim/chatCheckSalesInStore.json",
        type: "post",
        data: {
            salesId: salesId,
            oldStoreId: $("#storeId").val(),
            orderId: $("#orderId").val()
        },
        success: function(res){
          //result   0正常  1换店 2离职 3未确定成单导购，转给店长 4 暂时无法提供服务 5转给其他导购
            switch(parseInt(res.result)){
                case 0:
                    window.location.href = '../webim/chat.htm?salesId=' + salesId;
                    break;
                case 1:
                    $.confirm( '该顾问已换其他门店，是否切换至店长咨询？', '提示', function(){
                        if (res.storeManagerId)
                            window.location.href = '../webim/chat.htm?salesId=' + res.storeManagerId;
                        else
                            return mobileAlert(res.errmsg||"暂时无法提供服务");
                    });
                    break;
                case 2:
                    $.confirm( '该顾问已离职，是否切换至店长咨询？', '提示', function(){
                        if (res.storeManagerId)
                            window.location.href = '../webim/chat.htm?salesId=' + res.storeManagerId;
                        else
                            return mobileAlert(res.errmsg||"暂时无法提供服务"); 
                    });
                    break; 
                default:
                    if (res.storeManagerId)
                        window.location.href = '../webim/chat.htm?salesId=' + res.storeManagerId;
                    else
                        return mobileAlert(res.errmsg||"暂时无法提供服务"); 
            }
        }
    });  
});
// function jumpChat(salesId,storeId){
//     $.ajax({
//         url: "/webim/chatCheckSalesInStore.json",
//         type: "post",
//         data: {
//             salesId: salesId,
//             oldStoreId: storeId
//         },
//         success: function(res){
//             switch(parseInt(res.status)){
//                 case 1: //换门店 or 离职
//                     var text = res.result == 1 ? '该导购已换其他门店，是否切换至店长咨询？' : '该顾问已离职，该导购已换其他门店，是否切换至店长咨询？';
//                     $.confirm( text, '提示', function(){
//                         window.location.href = '../webim/chat.htm?salesId=' + res.storeManagerId;  
//                     });
//                     break;
//                 default:
//                     window.location.href = '../webim/chat.htm?salesId=' + salesId;    
//             }
//         }
//     });
// }

