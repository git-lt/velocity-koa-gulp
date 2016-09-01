var result = JSON.parse(sessionStorage.useCouponList);
var list1 = result.availableList,list2 = result.unavailableList;
var tempData1={
    list : list1
}
var listStr1 = template('tempData', tempData1);
$("#couponList").append(listStr1);
var tempData2={
    list : list2,
    status : "disabled"
}
var listStr2 = template('tempData', tempData2);
$("#couponList").append(listStr2);

if(list1.length==0 && list2.length==0){
    $("#couponList").append('<div class="noResult"><span class="coupon">当前没有可用的优惠券</span><div class="tc pt10"><a href="javascript:history.go(-1);" class="btn btn-red">返回</a></div></div>')
}
if(sessionStorage.usedCoupon){
    var usedId = JSON.parse(sessionStorage.usedCoupon).id;
    $("#couponList .item .use").each(function(i,e){
        if($(this).data("id") == usedId){
            $(this).removeClass("use").addClass("cancelUse").text("取消使用");
            return false;
        }
    })
}

$("#couponList").on("click",".canUse",function(){
    var data={
        "id" : $(this).data("id"),
        "name" : $(this).closest(".item").find(".couponName").text(),
        "value" : $(this).data("cv")
    }
    sessionStorage.usedCoupon=JSON.stringify(data);
    if(getUrlParam('from') == "sharePhoto"){
        location.href="confirmOrderOfSharePhoto.htm";
    }else{
        location.href="confirmOrderInfo.htm";
    }
}).on("click",".cancelUse",function(){
    sessionStorage.removeItem("usedCoupon");
    if(getUrlParam('from') == "sharePhoto"){
        location.href="confirmOrderOfSharePhoto.htm?from=removeCoupon";
    }else{
        location.href="confirmOrderInfo.htm?from=removeCoupon";
    }
})