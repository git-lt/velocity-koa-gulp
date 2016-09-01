if($("#pickUpCode").length > 0){
  var barWidth = document.body.clientWidth < 360 ? 1 : 2;
  $("#pickUpCode").barcode($("#pickUpCode").text(), "code128",{
    barWidth:barWidth, 
    barHeight:60,
    showHRI:false
  });
}

var salesAppPercent = parseFloat($(".appProgress .val").data("star"))*20
$(".appProgress .val").css("width",salesAppPercent+"%");

$(".pjWrap .iconfont").on("click",function(){
  var num = $(this).index()+1;
  window.location.href = 'addSalesTags.htm?orderId='+getUrlParam('orderId')+'&num='+num+'&salesId='+$('#salesId').val();
});