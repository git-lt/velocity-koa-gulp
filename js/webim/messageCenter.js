Date.prototype.format = function(fmt) {
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "H+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt)) {
      fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
  for(var k in o) {
    if(new RegExp("("+ k +")").test(fmt)){
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
  return fmt;
};

Base.hideOptionMenu();
Base.loading.show();
var newMsgAccountArray = sessionStorage.qiakrNewMessage ? JSON.parse(sessionStorage.qiakrNewMessage) : [];
$.getJSON("getLatestChatList.json?ownerId="+$("#ownerId").val(),function(data){
  var listStr = "";
  if(data.chatList.length==0){
    listStr='<div class="noResult"><span>最近没有聊天记录哦</span></div>';
  }else{
    $.each(data.chatList,function(i,e){
      var msg;
      try{
        msg = JSON.parse(e.content);
      }catch(e){
        return false;
      }
      var content = msg.type == 0 ? msg.content : '[多媒体]';
      var sendId = e.owner == e.to ? e.from : e.to;
      listStr += '<a href="chat.htm?salesId='+e.salesId+'" data-id="'+sendId+'" '+($.inArray(sendId,newMsgAccountArray) > -1 ? ("data-new="+JSON.stringify(e)) : '')+' class="item">\
        <div class="wbox">\
          <img src="'+(e.avatar ? e.avatar : "https://qncdn.qiakr.com/mall/default-photo.png")+'" class="size50 round">\
          <div class="wbox-1">\
            <div><b>'+e.name+'</b><span class="fc-grey pl5">'+e.shopName+'</span></div>\
            <div class="msg">'+content+'</div>\
          </div>\
          <div>\
            <div class="fc-grey">'+new Date(e.sendTime).format("HH:mm")+'</div>\
            <div class="count">'+($.inArray(sendId,newMsgAccountArray) > -1 ? '<span></span>' : '')+'</div>\
          </div>\
        </div>\
      </a>';
    });
  }
  $("#chatMessageList").append(listStr);
  $(".op0").removeClass("op0");
  Base.loading.hide();
});