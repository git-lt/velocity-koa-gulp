$(".orderList:not(.appraised) .pjWrap b").on("click",function(){
  $("#inserAppraise").removeAttr("disabled");
  var wrap = $(this).closest(".orderList");
    wrap.find(".pjWrap b").removeClass("ac");
    var idx = $(this).index()+1;
    for(var i=0;i<idx;i++){
      wrap.find(".pjWrap b:eq("+i+")").addClass("ac");
    }
});
$("#inserAppraise").on("click",function(){
  var appParam=[];
  $(".orderList:not(.appraised)").each(function(i,e){
    var star = $(e).find(".pjWrap b.ac").length;
    if(star != 0){
      var param = {
        stars : star,
        orderItemId : getUrlParam('orderItemId'),
        comment : $(e).find(".appCont").val()
      };
      appParam.push(param);
    }
  })
  // console.log(appParam)
  $.ajax({
    type:"post",
    url: "insertAppraiseStock.json",
    data: "stockCommentListJson="+JSON.stringify(appParam),
    success:function(data){
      if(data.status == "0"){
        mobileAlert("评价成功");
        setTimeout(function(){
          // location.href="getOrderListOfCustomer.htm";
          location.href="orderAppraiseList.htm?finish=finish&orderId=" + getUrlParam("orderId");
        },1000);
      }
    }
  });
});
// 钻石评价
// 获取标签
// 选择标签
// 添加标签
// 点击关注
// 生成二维码
// 提交评价