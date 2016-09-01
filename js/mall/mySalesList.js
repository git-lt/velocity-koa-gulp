$(".salesBox").on("click",".action",function(){
    var _t = $(this);
    if(_t.hasClass("ac")){
        _t.removeClass("ac");
        _t.siblings(".actionList").hide();
    }else{
         _t.addClass("ac");
        _t.siblings(".actionList").show();
    }
}).on("click",".disbanding",function(e){
    e.preventDefault();
    var id = $(this).data("id");
    $.getJSON("disbandingSales.json?salesId="+id,function(data){
        if(data.status=="0"){
            location.reload();
        }else{
            mobileAlert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
        }
    });
});