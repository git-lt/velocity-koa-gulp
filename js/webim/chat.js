Base.hideOptionMenu();
// 公共函数
function getCookie(key){
    var strCookie=document.cookie,cookieVal="";
    var arrCookie=strCookie.split("; ");
    for(var i=0;i<arrCookie.length;i++){ 
        var arr=arrCookie[i].split("="); 
        if(key==arr[0]){ 
            cookieVal=arr[1]; 
            break; 
        } 
    } 
    return cookieVal;
}
function getUrlParam(key){
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if(r) return decodeURIComponent(r[2]);  return "";
}

// 消息滚动效果
$.requestAnimationFrame = function (callback) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
    else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
    else {
        return window.setTimeout(callback, 1000 / 60);
    }
};
$.fn.scrollTop = function (top, duration, callback) {
    return this.each(function () {
        var el = this;
        var currentTop, maxTop, newTop, scrollTop;
        var animateTop = top > 0 || top === 0;
        if (animateTop) {
            currentTop = el.scrollTop;
            if (!duration) {
                el.scrollTop = top;
            }
        }
        if (!duration) return;
        if (animateTop) {
            maxTop = el.scrollHeight - el.offsetHeight;
            newTop = Math.max(Math.min(top, maxTop), 0);
        }
        var startTime = null;
        if (animateTop && newTop === currentTop) animateTop = false;
        function render(time) {
            if (time === undefined) {
                time = new Date().getTime();
            }
            if (startTime === null) {
                startTime = time;
            }
            var done;
            var progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
            var easeProgress = 0.5 - Math.cos( progress * Math.PI ) / 2;
            if (animateTop) scrollTop = currentTop + (easeProgress * (newTop - currentTop));
            if (animateTop && newTop > currentTop && scrollTop >= newTop)  {
                el.scrollTop = newTop;
                done = true;
            }
            if (animateTop && newTop < currentTop && scrollTop <= newTop)  {
                el.scrollTop = newTop;
                done = true;
            }

            if (done) {
                if (callback) callback();
                return;
            }
            if (animateTop) el.scrollTop = scrollTop;
            $.requestAnimationFrame(render);
        }
        $.requestAnimationFrame(render);
    });
};

$.fn.sizeTextarea = function(){
  var _t = this,textareaTimeout;
  _t.on("change keydown keypress keyup paste cut",function(){
        clearTimeout(textareaTimeout);
        textareaTimeout = setTimeout(function () {
            _t.css({'height': ''});
        var height = _t[0].offsetHeight,
            diff = height - _t[0].clientHeight,
            scrollHeight = _t[0].scrollHeight;
        if (scrollHeight + diff > height) {
            var newAreaHeight = scrollHeight + diff;
            _t.css({'height': newAreaHeight + 'px'});
        }
        }, 0);
    });
};

// 模板渲染扩展函数
(function(){
  template.config('escape', false);
  template.helper('getJsonParam', function (date, format) {
      var json = JSON.parse(date);
      return json[format];
  });
  template.helper('getStockUrl', function (date) {
      return "../mall/getStockInfoForCustomer.htm?salesId="+getUrlParam("salesId")+"&"+date.match(/stockId=\d*/);
  });
  template.helper('renameAudio', function (date) {
      return date.replace(/.amr/gi,"cdf2d.mp3");
  });
  template.helper('audioTime', function (date) {
      var json = JSON.parse(date);
      return Math.round(json.meta.duration/1000);
  });
  template.helper('audioLength', function (date) {
      var json = JSON.parse(date);
      return Math.round(json.meta.duration/1000)*20;
  });
  template.helper('getSharePhotoUrl', function (date) {
      var json = JSON.parse(date);
      return json.photoUrl.url;
  });
  template.helper('toFixed2', function (data, format) {
    if(!data) return "0.00";
      format = data.toFixed(2);
      return format;
  });
  template.helper('dateFormat', function (date, format) {
    if(!date) return "";
      format = new Date(date).format("Y.M.d");
      return format;
  });
  template.helper('placeholderImg', function (data) {
      if(!data || data.length<5) return 'https://qncdn.qiakr.com/mall/default-photo.png';
      return data;
  });
})();

// 指定socket的服务器地址
var socketServer = location.host.indexOf("mall.qiakr")>-1 ? "//mall.qiakr.com:29001" : location.host.indexOf("mall.ekeban")> -1 ? "//mall.ekeban.com:29000" : "//www.ekeban.com:29000"; 

var Chat = function(socket, uid, fromName) {
    this.socket = socket;
    this.fromName = fromName;
    this.uid = uid;
    this.useable = false;
};

Chat.prototype.login = function() {
    var message = {
        fId: 0,
        uId: this.uid
    };
    this.socket.emit('login', message);
};

Chat.prototype.heart = function() {
    var message = {
        fId: -2,
        uId: this.uid
    };
    this.socket.emit('heart', message);
};

Chat.prototype.sendMessage = function(to, text, type) {
    if(!this.useable) {
        return false;
    }
    var message = {
        fId: 1,
        data : {
            createTime: new Date().getTime(),
            fromNick: this.fromName,
            fromUser: this.uid,
            msg: text,
            msgType: parseInt(type),
            toUser: to,
            voiceLength: 0,
            receiveTime: 0
        }
    };
    console.log(message)
    this.socket.emit('sendMsg', message);
    return true;
};

var msg = {
    parse_error_notify: function(chat, data){
        this.name = 'parse_error_notify';
        var code = data.code;
        console.log("发送结果:"+code)
        switch (code) {
            case -2:
                clearTimeout(getHeartStatus);
                if(!heartLinked){
                    chatObject.login();
                    heartLinked = true;
                    console.log("relinked \n\n")
                }
                // console.log("linking \n\n")
                break;
            case 0:
                $(".message .status.ing").remove();
                break;
            case 91007:
                $(".message .status.ing").removeClass("ing").addClass("error").attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png");
                chatObject.login();
                break;
            case 91001:
                $(".message .status.ing").removeClass("ing").addClass("error").attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png");
                chatObject.login();
                break;
            default:
                break;
        }
    },
    parse_login_msg: function(chat, data){
        this.name = 'parse_login_msg';
        var code = data.code;
        switch (code) {
            case 0: // 登录成功
                // $('#chat_unuseable').hide();
                chat.useable = true;
                break;
            case 91001: // token 错误
                // $('#chat_unuseable').show();
                break;
            default:
                break;
        }
    },
    parse_chat_msg: function(chat, data) {
        console.log(data);
        this.name = 'parse_chat_msg';
        data = JSON.parse(data.data);
        var from = data.from;
        $("#newMsgVoice")[0].play();
        if(from == $("#salesId").val()){
            page.receiveMessage(data);
        }else{
            var newMsgAccountArray = page.newMsgAccountArray;
            if($.inArray(from,newMsgAccountArray) < 0){
                newMsgAccountArray.push(from);
                sessionStorage.qiakrNewMessage = JSON.stringify(newMsgAccountArray);
            }
            $(".salesInfo .newMsg").addClass("ac");
        }
    }
};

var exec_funcs = {'0' : msg.parse_login_msg, '-1' : msg.parse_error_notify, '1' : msg.parse_chat_msg};
var chatObject;
var getHeartStatus,heartLinked=true;
setInterval(function(){
    // console.log("send heart");
    chatObject.heart();
    getHeartStatus = setTimeout(function(){
        heartLinked = false;
        console.log("link breaked \n\n");
    },14000);
},30000);

var page = {
  startX: 0,
  startY: 0,
  pages: $(".facePage-wrap .facePage"),
  curPage: 0,
  pageWidth: 0,
  secWidth: 0,
  targetElement: null,
  scrollPrevent: false, 
  movePrevent: false, 
  touchDown: false,
  contentList: $(".facePage-wrap"),
  thumbs: $(".face-box .facePage-thumbs"),
  textarea:$("#chatContent"),
  historyLogTime:'',
  cursorPosition:0,
  faces:{},
  latestMsgTime:0,
  isFirstLoadLog:true,
  msgTimeSpaceLimit:2*60000,
  textareaTimeout : undefined,
  playingAudio:'',
  newMsgAccountArray : sessionStorage.qiakrNewMessage ? JSON.parse(sessionStorage.qiakrNewMessage) : [],
  init:function(){
    this.initChat();
    this.initNewmsgTip();
    this.btnSendMessage();
    this.getHistory();
    this.initFaces();
    this.faceControl();
    this.audioControl();
    this.viewMessageImage();
    this.toolBarToggle();
    this.resendMessage();
    this.goTelephone();
  },
  initChat:function(){
    // 分享出去的不能抢答
    if (sessionStorage.salesId)
      $("#launchAnswerBtn").hide();
    // 欢迎语
    if(!getCookie("sendWelcomeMsg-"+$("#salesId").val())){
        page.addMessage({
          type:'received',
          msgType:0,
          text: '欢迎光临'+$("#thisStoreName").val()+'，我是导购'+$("#thisSalesName").val()+'，很高兴为您服务',
          avatar: $("#dAvatar").val(),
          time: false
        });
        var expiresHours=12; 
        document.cookie="sendWelcomeMsg-"+$("#salesId").val()+"=1;expires="+new Date(new Date().getTime()+expiresHours*3600*1000).toGMTString();
    }
    // 除了消息容器之外阻止滚动
    window.ontouchmove=function(e){
     e.preventDefault() && e.preventDefault();
     return false;
    };
    $("#messagesList")[0].ontouchmove=function(e){
      e.stopPropagation() && e.stopPropagation();
    };
    // 消息输入框高度自适应
    page.textarea.on("change keydown keypress keyup paste cut",function(){
      clearTimeout(page.textareaTimeout);
        page.textareaTimeout = setTimeout(function () {
            page.sizeTextarea();
        }, 0);
    });
    $("#chatContentTop").sizeTextarea();
    // 建立socket连接
    var socket = io.connect(socketServer);
    chatObject = new Chat(socket, $("#customerId").val(), $("#userName").val());
    chatObject.login();
    socket.on('message', function(data) {
      console.log(data)
        var func = exec_funcs[data.fId];
        if(func) {
            func(chatObject, data);
            if(data.fId==0){
              page.addTalkingStock();
            }
        }
    });
    return chatObject;
  },
  initNewmsgTip:function(){
        var newMsgAccountArray = this.newMsgAccountArray;
        // 新消息列表中删除当前对话
        newMsgAccountArray = $.grep(newMsgAccountArray,function(e){
            return e != $("#salesId").val();
        });
        sessionStorage.qiakrNewMessage = JSON.stringify(newMsgAccountArray);

        if(newMsgAccountArray.length > 0){
            $(".salesInfo .newMsg").addClass("ac");
        }
        $(".salesInfo .newMsg").on("click",function(e){
            e.preventDefault();
            location.href=$(this).attr("href")+"?talkingId="+getUrlParam("salesId");
        });
    },
  initFaces:function(){
    var pageWidth = $(window).width() > 750 ? 750 : $(window).width();
    page.pageWidth = pageWidth;
    $(".facePage-wrap .facePage").width(pageWidth);
    $(".facePage-wrap").width(pageWidth * ($(".facePage-wrap .facePage").length));
  },
  scrollMessages:function(){
    $("#messagesList").scrollTop(999999,300);
  },
  addMessage:function(msg){
    $("#messagesList").append(template("mseeageTemp",msg));
    page.scrollMessages();
    setTimeout(function(){
      page.scrollMessages();
    },500);
  },
  getHistory:function(){
    $("#getChatHistory").on("click",function(){
      if($(this).hasClass("all")) return false;
      var _t = $(this).parent();
      _t.hide();
      $("#loading").show();
      var param={
          sUid:$("#customerId").val(),
          dUid:$("#salesId").val(),
          minTime:page.historyLogTime
      };
      $.getJSON("getHistoryChatLog.json",param,function(data){
          if(data.status=="0"){
              var log = data.result.chatlog.reverse();
              var logHtml="",firstTime=0,hasTime=true;
              if(log.length===0){
                  _t.show().find("span").addClass("all").html("没有更多消息了");
                  $("#loading").hide();
                  return false;
              }else{
                  page.historyLogTime = data.result.chatlog[0].sendTime;
              }
              $.each(log,function(i,e){
                  var contenter = page.messageFormat(e.content);
                  var reviceTime = new Date(e.sendTime).format("MM-dd HH:mm");
                  if(e.sendTime < (firstTime+page.msgTimeSpaceLimit)){
                      hasTime= i>0 ? false : true;
                  }else{
                      firstTime = e.sendTime;
                      hasTime=true;
                  }
                  if(JSON.parse(e.content).type !== null){
                    logHtml += template("mseeageTemp",{
                      supplierId:$("#supplierId").val(),
                      text: contenter,
                      msgType:JSON.parse(e.content).type,
                      type: e.from == param.sUid ? "sent" : "received",
                      avatar: e.from == param.sUid ? $("#sAvatar").val() : $("#dAvatar").val(),
                      time: hasTime ? reviceTime : false
                    });
                  }
              });
              _t.show().after(logHtml);
              page.scrollMessages();
              if(page.isFirstLoadLog){
                setTimeout(function(){
                  page.scrollMessages();
                  page.isFirstLoadLog = false;
                },500);
              }
              if(log.length <10){
                _t.find("span").addClass("all").html("没有更多消息了");
              }
              $(".message img.ing").remove();
              
          }
      });
    });
    $("#getChatHistory").trigger("click");
  },
  sentMessage:function(type,content,source){
    if(page.latestMsgTime+page.msgTimeSpaceLimit < new Date().getTime() && type!=3){
      page.latestMsgTime = new Date().getTime();
      page.msgWithTime = true;
    }else{
      page.msgWithTime = false;
    }
    var sentTime = new Date().format("HH:mm");
    page.addMessage({
      type:"sent",
      msgType:type,
      text: content,
      textSrc:source,
      avatar: $("#sAvatar").val(),
      time: page.msgWithTime ? sentTime : false
    });
    var lastSentMessageStatus = $(".message .status:last");
    setTimeout(function(){
        lastSentMessageStatus.removeClass("ing").addClass("error").attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png");
    },10000);
  },
  receiveMessage:function(data){
    if(page.latestMsgTime+page.msgTimeSpaceLimit < data.sendTime){
      page.latestMsgTime = data.sendTime;
      page.msgWithTime = true;
    }else{
      page.msgWithTime = false;
    }
    var content = page.messageFormat(data.content);
    page.addMessage({
      supplierId:$("#supplierId").val(),
      type:'received',
      msgType:data.content.type,
      text: content,
      avatar: $("#dAvatar").val(),
      time: page.msgWithTime ? (new Date().getHours() + ':' + new Date().getMinutes()) : false
    });
    
  },
  btnSendMessage:function(){          
    var tbs=navigator.userAgent.match(/\/.{2,5}?TBS\//) ? navigator.userAgent.match(/\/.{2,5}?TBS\//).toString().replace(/\//g,"").split(" ")[0] : "7";
    page.textarea.focus(function(){
      var text = $(this).val();
      setTimeout(function(){
        $(document).scrollTop(9999,300);
        if(!/iphone|ipad/i.test(navigator.userAgent)){
          // 兼容新老微信内置webview
          if(parseFloat(tbs)>6.1){
            $(".messages-content").css({
              "height":$(window).height()-$(".salesInfo").height(),
              "margin-top":$(".salesInfo").height()+"px"
            });
          }else{
            $(".toptextarea").show();
            $("#chatContentTop").val(text).focus();
          }
        }
        page.scrollMessages();
      },300);
    });
    $("#chatContentTop").blur(function(){
      var text = $(this).val();
      $("#chatContent").val(text);
      $(".toptextarea").hide();
    });

    $(window).on("resize",function(){
      setTimeout(function(){
        $(document).scrollTop(9999,10);
        if(!/iphone|ipad/i.test(navigator.userAgent)){
          $(".messages-content").css({
            "height":$(window).height()-$(".salesInfo").height(),
            "margin-top":$(".salesInfo").height()+"px"
          });
        }
        page.scrollMessages();
      },300);
    });
    $('.messagebar .link').on('click', function () {
      var messageText = page.textarea.val().trim();
      page.textarea.val("");
      if (messageText.length === 0) return;
      var content = messageText.replace(/[\r\n]/g,"");
      chatObject.sendMessage($("#salesId").val(), content, "0");
      page.sentMessage(0,content.replaceFace().replaceTextUrl(),content);
      if(!/iphone|ipad/i.test(navigator.userAgent)){
        page.textarea.focus();
      }
    });
  },
  addTalkingStock:function(){
    if(sessionStorage.talkAboutStock){
        var stockInfo = sessionStorage.talkAboutStock;
        chatObject.sendMessage($("#salesId").val(), stockInfo, "7");
        page.sentMessage(4,stockInfo);
        sessionStorage.removeItem("talkAboutStock");
    }
  },
  audioControl:function(){
    $(".messages-content").on("click",".audio",function(){
      var _t = $(this).find("audio")[0];
      if(page.playingAudio && !page.playingAudio.paused){
        // 正在播放语音
        page.playingAudio.pause();
        $(page.playingAudio).siblings(".talk").show().siblings(".talking").hide();
        if(_t.src==page.playingAudio.src){
          // 正在播放当前语音
        }else{
          // 正在播放其它语音
          page.playingAudio = _t;
          _t.play();
          $(_t).siblings(".talking").show().siblings(".talk").hide();
        }
      }else{
        // 没有播放语音
        page.playingAudio = _t;
        _t.play();
        $(_t).siblings(".talking").show().siblings(".talk").hide();
      }
      page.playingAudio.addEventListener("ended", function() {
          $(page.playingAudio).siblings(".talk").show().siblings(".talking").hide();
      }, false);
    });
  },
  faceControl:function(){
    //表情分页划动
    var _t = this;
    $("#faceSlider").on('touchstart', function (e) {
        e = e.changedTouches[0];
        // _t.onStart(e);
        if(page.movePrevent === true){
            event.preventDefault();
            return false;
        }
        page.touchDown = true;
        // 起始点，页面位置
        page.startX = e.pageX;
        page.startY = e.pageY;
    }).on('touchmove', function (e) {
        if(page.movePrevent === true || page.touchDown !== true){
            event.preventDefault();
            return false;
        }
        event.preventDefault();
    }).on('touchend', function (e) {
        // _t.onEnd(e.changedTouches[0]);
        e = e.changedTouches[0];
        if(page.movePrevent === true){
            event.preventDefault();
            return false;
        }
        page.touchDown = false;
        if(page.scrollPrevent===false ){
            // 抬起点，页面位置
            page.endX = e.pageX;
            page.endY = e.pageY;
            if (page.endX && page.endX !== page.startX && page.endX-page.startX<=-25) {
              var newPage = page.curPage + 1;
              $("#faceSlider .facePage:eq("+newPage+")").find("img").each(function(){
                  var src=$(this).attr("srcr");
                  $(this).attr("src",src).removeAttr("srcr");
              });
              page.animatePage(newPage);
            }else if(page.endX && page.endX !== page.startX && page.endX-page.startX>=25){
              page.animatePage(page.curPage - 1);
            }
        }
        page.contentList.removeClass("drag");
    });
    // 表情显示隐藏
    $("#face-control").click(function(){
      if($(this).hasClass("selected")){
        $(this).removeClass("selected");
        $("#faceSlider").hide();
        $(".messagebar").height(44);
        $(".page-content").css("padding-bottom","44px");
      }else{
        $(this).addClass("selected");
        setTimeout(function(){
          $("#faceSlider").show();
          $(".messagebar").height(184);
          $(".page-content").css("padding-bottom","184px");
          page.textarea.blur();
          page.scrollMessages();
        },100);
      }
    });

    $('.face-list li').each(function(){
        _t.faces[$(this).attr('title')] = $(this).find('img').attr('src')||$(this).find('img').attr('srcr');
    });
    $('.face-list li').on('click', function(){
        var _val = page.textarea.val();
        page.textarea.val(_val.substr(0,_t.cursorPosition) + $(this).attr('title')+_val.substr(_t.cursorPosition));
        _t.cursorPosition += $(this).attr('title').length;
    });
    page.textarea.focus(function(){
        if($("#faceSlider").is(":visible")){
            $("#face-control").trigger("click");
        }
    }).blur(function(){
      // setTimeout(function(){
      //   if(!/iphone|ipad/i.test(navigator.userAgent)){
      //     $(".messages-content").css({
      //       "height":$(window).height()-$(".salesInfo").height(),
      //       "margin-top":$(".salesInfo").height()+"px"
      //     });
      //   }
      // },300);
        _t.cursorPosition = this.selectionStart;
    });
  },
  animatePage: function( newPage ){
        if(newPage<0){
            newPage = 0;
        }
        if(newPage > ($(".facePage-wrap .facePage").length - 1)){
            newPage = $(".facePage-wrap .facePage").length - 1;
        }
        page.curPage = newPage;
        var newMarginLeft = newPage * (- page.pageWidth);
        page.contentList.css({
            "-webkit-transform" : "matrix(1, 0, 0, 1, "+ newMarginLeft +", 0)"
        });
        page.thumbs.find("span").removeClass("cur");
        page.thumbs.find("span").eq(page.curPage).addClass("cur");
        page.movePrevent = true;
        setTimeout(function(){page.movePrevent=false;}, 300 );
    },
  messageFormat:function(message){
    var content,msg;
    try{
        msg = JSON.parse(message);
        var msger = msg.type+":"+msg.content;
    }catch(e){
        msg=message;
    }
    if(typeof msg.content == "object"){
      content = JSON.stringify(msg.content);
    }else{
      if(msg.type==0){
        content = msg.content.replaceFace().replaceTextUrl();
      }else{
        content = msg.content;
      }
    }
    return content;
  },
  viewMessageImage:function(){
    $("body").on("click",".msgImage",function(){
        var src=$(this).attr("src").split("?")[0];
        var imgHtml = '<div class="imageView"><img src="'+src+'" /></div>';
        $("body").append(imgHtml);
    }).on("touchend",".imageView",function(e){
        $(this).remove();
    });
  },
  toolBarToggle:function(){
    if(localStorage.webimToolbarStatus != "hide"){
      $('.salesInfo').height(100);
      $(".messages-content").css({
        "height":$(window).height()-100,
        "margin-top":"100px"
      });
    }

    $('#infoExpand').on('click', function(){
        var $this = $(this);
        $this.next('.salesInfo').css({
            'height':100,
            'transition':'height .2s linear'
        });
        localStorage.webimToolbarStatus = "show";
        $(".messages-content").css({
          "height":$(window).height()-100,
          "margin-top":"100px"
        });
        page.scrollMessages();
    });
    $('#infoFlod').on('click', function(){
        var $this = $(this);
        $this.closest('.salesInfo').css({
            'height':0,
            'transition':'height .2s linear'
        });
        localStorage.webimToolbarStatus = "hide";
        $(".messages-content").css({
        "height":"100%",
        "margin-top":""
      });
    });
  },
  sizeTextarea:function(){
    // Reset
    page.textarea.css({'height': ''});
    
    var height = page.textarea[0].offsetHeight,
        diff = height - page.textarea[0].clientHeight,
        scrollHeight = page.textarea[0].scrollHeight;
    var pageContent = $('.page-content'),container = $(".messagebar");
    // Update
    if (scrollHeight + diff > height) {
        var newAreaHeight = scrollHeight + diff;
        var newBarHeight = 44 + (newAreaHeight - 32);
        var maxBarHeight = $('.view')[0].offsetHeight - 88;
        if (newBarHeight > maxBarHeight) {
            newBarHeight = parseInt(maxBarHeight, 10);
            newAreaHeight = newBarHeight - 44 + 32;
        }
        page.textarea.css({'height': newAreaHeight + 'px'});
        container.css('height', newBarHeight + 'px');
        var onBottom = (pageContent[0].scrollTop === pageContent[0].scrollHeight - pageContent[0].offsetHeight);
        pageContent.css('padding-bottom', newBarHeight + 'px');
    }else {
      container.css({'height': '', 'bottom': ''});
      pageContent.css({'padding-bottom': ''});
    }
  },
  resendMessage:function(){
    $("body").on("click",".status.error",function(){
        var _t = $(this),msg = _t.siblings(".message-text").data("source");
        _t.removeClass("error").addClass("ing").attr("src","https://qncdn.qiakr.com/webim/loading.gif");
        chatObject.sendMessage($("#salesId").val(), msg, 0);
        setTimeout(function(){
            _t.removeClass("ing").addClass("error").attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png");
        },10000);
    });
  },
  goTelephone:function(){
    $("#goTelephone").on("click",function(e){
      if(/Android/i.test(navigator.userAgent)){
        e.preventDefault();
        location.href = $(this).attr("href")+'#http://mp.weixin.qq.com';
      }
    });
  }
};

Date.prototype.format = function(fmt) { //author: meizz
  var o = {
    "Y+" : this.getFullYear(),
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

String.prototype.replaceFace = function(){
    var p = /\[[^\]]+\]/g;
    var result= this.match(p);
    var s = this;
    for(var i in result) {
        var face = result[i];
        if(!page.faces[face]) {
            continue;
        }
        s = s.replace(face, '<img class="face" src="' + page.faces[face] + '" />');
    }
    return s.toString();
};

String.prototype.replaceTextUrl = function(){
  var s = this;
  var Expression='((https://)|(http://)|(www\\.)){1}[A-Za-z0-9-_:\/]+\\.[A-Za-z0-9-_:#%&\?\/.=]+';
  var objExp=new RegExp(Expression,"g");
  if(objExp.test(s)){
    var r = s.match(objExp);
    var newStr=s;
    for(var i=0;i<r.length;i++){
        if(r[i].indexOf("webim/face")<0){
            newStr = newStr.replace(r[i],'<a href="'+((r[i].indexOf("https://")<0 && r[i].indexOf("http://")<0)  ? "http://"+r[i] : r[i])+'">'+r[i]+'</a>');
        }
    }
    return newStr.toString();
  }else{
    return s.toString();
  }
};

page.init();