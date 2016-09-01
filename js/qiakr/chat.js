var menuCurrent = "notice";
document.title="洽客-导购咨询"; 
require(["qiakr/base_old","io"],function(base,io){
    Util.createSecondMenu([
        {"name":"小秘书","url":"notice.htm"},
        {"name":"通知中心","url":"notificate.htm"},
        {"name":"导购咨询","url":"consult.htm"},
        {"name":"官网动态","url":"qiakrNews.htm"},
        {"name":"启动屏设置","url":"bootScreen.htm"},
        {"name":"客户反馈","url":"feedback.htm"}
    ],"导购咨询");
    $("#getChatHistory").on("click",function(){
        if($(this).hasClass("all")) return false;
        var _t = $(this).parent();
        _t.hide();
        $("#loading").show();
        var param={
            sUid:$("#customerId").val(),
            dUid:$("#salesId").val(),
            minTime:$(_t.siblings(".msg")[0]).data("time")
        }
        $.getJSON("../webim/getHistoryChatLog.json",param,function(data){
            if(data.status=="0"){
                var log = data.result.chatlog.reverse();
                var logHtml="",hasTime=true;
                if(log.length==0){
                    _t.show().find("span").addClass("all").html("没有更多消息了");
                    $("#loading").hide();
                }else{
                    var firstTime=log[0].sendTime
                }
                $.each(log,function(i,e){
                    var msg;
                      try{
                            msg = JSON.parse(e.content);
                        }catch(e){
                            msg = {
                                content:'<p style="color:#f00">（系统）该条消息格式错误，无法解读</p>'+e.msg,
                                type:0
                            }
                        }
                    var contenter = messageFormat(msg);
                    var reviceTime = new Date(e.sendTime).format("MM-dd HH:mm")
                    if(hasTime){
                        logHtml+="<li class='time'><span>" + reviceTime + "</span></li>";
                        hasTime = false;
                    }
                    if(e.sendTime > (firstTime+5*50*1000)){
                        firstTime += 5*50*1000;
                        hasTime=true;
                    }
                    if(e.from == param.sUid){ // 发送者为客户，表示发送
                        logHtml += "<li class='odd msg' data-time=" + e.sendTime + "><div class='pic'><img src='" + ($("#sAvatar").val()||"https://qncdn.qiakr.com/mall/default-photo.png") + "'/></div>" + contenter + "</li>";
                    }else{ // 表示接收
                        logHtml += "<li class='even msg' data-time=" + e.sendTime + "><div class='pic'><img src='" + ($("#dAvatar").val()||"https://qncdn.qiakr.com/mall/default-photo.png") + "'/></div>" + contenter + "</li>";
                    }
                });
                _t.show();
                $("#loading").hide().after(logHtml);
                $("#chatList").scrollTop(9999999);
            }
        })
    });

    $("#getChatHistory").trigger("click");

    $("#chatList").on("click",".msg .audio",function(e){
        var _t = $(this);
        var audio = _t.parent().find("audio")[0];
        if(_t.hasClass("play")){
            _t.removeClass("play").find(".talk").show().siblings(".talking").hide();
            audio.stop();
        }else{
            _t.addClass("play").find(".talk").hide().siblings(".talking").show();
            audio.play();
        }
        audio.addEventListener("ended", function() {
            _t.removeClass("play").find(".talk").show().siblings(".talking").hide();
        }, false)
    }).on("click",".tip .send",function(){
        var data = JSON.stringify($(this).data("stock"));
        appendContent(4,data);
    }).on("click",".status.error",function(){
        var _t = $(this);
        var msg = _t.data("content");
        if(typeof msg === "object"){
            msg = JSON.stringify(msg);
        }
        _t.removeClass("error").addClass("ing").attr("src","https://qncdn.qiakr.com/webim/loading.gif");
        chatObject.sendMessage($("#salesId").val(), msg, _t.data("type"));
        setTimeout(function(){
            _t.removeClass("ing").addClass("error").attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png");
        },10000);
    });

    function messageFormat(msg){
        var content;
        if(msg.type=="0"){ // 文字
            content = formatTextWithUrl(msg.content);
            try{
                content = content.replaceFace();
            } catch (e){
                content = JSON.stringify(content);
            }
        }else if(msg.type == "1"){ //图片
            content = "<a href='"+msg.content.url+"' target='_blank'><img class='img' style='max-width:600px;max-height:200px;' src='"+msg.content.url+"?imageView2/2/h/120' /></a>";
        }else if(msg.type == "2"){ // 语音
            content = "<div class='audio'><img class='talk' src='https://qncdn.qiakr.com/webim/talkIcon.png' /><img class='talking fn-hide' src='https://qncdn.qiakr.com/webim/talking.gif' /></div><audio src="+msg.content.url.replace(/.amr/gi,"cdf2d.mp3")+"></audio><span class='aTime'>"+~~(msg.content.meta.duration/1000)+"″</span>";
        }else if(msg.type == "7"){ // 图文
            try{
                cont = JSON.parse(msg.content)
            } catch (e){
                cont = msg.content
            }
            content = "<a class='imgText' href="+cont.Url.replace(/&from=.*/,"")+"><div class='wbox'><img class='proImg' src='"+cont.PicUrl+"' /><div class='desc wbox-1'>"+cont.Description+"</div></div></a>"
        }
        return content;
    }
    function getUrlParam(key){
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if(r) return decodeURIComponent(r[2]);  return "";
    }


    var page={
        startX: 0,
        startY: 0,
        pages: $(".page-wrap .page"),
        curPage: 0,
        pageWidth: 0,
        secWidth: 0,
        targetElement: null,
        scrollPrevent: false, 
        movePrevent: false, 
        touchDown: false,
        contentList: $(".page-wrap"),
        thumbs: $(".face-box .pages-thumbs"),
        initPage: function(){
            page.pageWidth = $(window).width();
            if (page.pageWidth > 640){
                page.pageWidth = 640;
            }
            $(".page-wrap .page").each(function(i){
                $(this).css({
                  "width":page.pageWidth+"px"
                });
            });
            page.secWidth = page.pageWidth * ($(".page-wrap .page").length);
            $(".page-wrap").width(page.secWidth);
            page.thumbs.find("span").removeClass("cur");
            page.thumbs.find("span").eq(0).addClass("cur");
            page.contentList.addClass("drag");
            page.animatePage(page.curPage);
        },
        //设置聊天内容区域高度，并滚动到底部
        setHeight: function(){
            var bottomHeight = $("#bottom").height();
            var pageHeight = $(window).height();
            // $("body").height(pageHeight)
            $("#chatList").height(400).css("overflow","auto");
            var chatHeight = $("#chatThread").height();
            $("#chatList").scrollTop(chatHeight);
            $("body").scrollTop(0);
        },
        animatePage: function( newPage ){
            if(newPage<0){
                newPage = 0;
            }
            if(newPage > ($(".page-wrap .page").length - 1)){
                newPage = $(".page-wrap .page").length - 1;
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
        }
    }

    window.onorientationchange = page.initPage;
    $(document).ready(function(){
        page.setHeight();
        page.initPage();
        $(window).resize(function(){
            page.setHeight();
        });
        $("#face-control").click(function(){
            $(this).toggleClass("selected");
            $("#faceSlider").toggle();
            page.setHeight();
        });
    });
    //表情分页划动
    $(".pages-thumbs").on("click","span",function(e){
        var _i = $(this).index();
        page.animatePage(_i);
    })

    $(".btn-send").on("click",function(){
        sendMsg();
    });

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
                    console.log("linking \n\n")
                    break;
                case 0:
                    $(".msg .status.ing").remove();
                    break;
                case 91007:
                    $(".msg .status.ing").removeClass("ing").addClass("error").attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png")
                    chatObject.login();
                    break;
                case 91005:
                    chat.useable = false;
                    appendContent(2,"消息发送失败");
                    break;
                case 91008:
                    chat.useable = false;
                    appendContent(2,"我在你的黑名单中");
                    break;
                case 91009:
                    chat.useable = false;
                    appendContent(2,"对方已将你拉黑");
                    break;
                case 91001:
                    $(".msg .status.ing").removeClass("ing").addClass("error").attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png")
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
            var from = data.from,msg = data.content;
            $("#newMsgVoice")[0].play();
            if(from == $("#salesId").val()){
                var content=messageFormat(msg);
                appendContent(2, content);
            }else{
                if($.inArray(from,newMsgAccountArray) < 0){
                    newMsgAccountArray.push(from);
                    if(newMsgAccountArray.length>10){
                        newMsgAccountArray.shift();
                    }
                    localStorage.hasNewMessage = JSON.stringify(newMsgAccountArray);
                }
                $(".salesInfo .newMsg").addClass("ac");
            }
        }
    }
    var exec_funcs = {'0' : msg.parse_login_msg, '-1' : msg.parse_error_notify, '1' : msg.parse_chat_msg};
    var chatObject;
    var socketServer = location.host.indexOf("mall.qiakr")>-1 ? "//mall.qiakr.com:29001" : location.host.indexOf("mall.ekeban")> -1 ? "//mall.ekeban.com:29000" : "//www.ekeban.com:29000"; 
    var do_chat = function(uid){
        var socket = io.connect(socketServer);
        chatObject = new Chat(socket, uid, $("#userName").val());
        chatObject.login();
        socket.on('message', function(data) {
            var func = exec_funcs[data.fId];
            if(func) {
                func(chatObject, data);
            }
        });
        return chatObject;
    };
    do_chat($("#customerId").val());
    var getHeartStatus,heartLinked=true;
    setInterval(function(){
        console.log("send heart");
        chatObject.heart();
        getHeartStatus = setTimeout(function(){
            heartLinked = false;
            console.log("link breaked \n\n");
        },14000);
    },30000);

    var faces = {},cursorPosition=0;
    var chatContent = $("#chatContent");
    $('.face-list li').each(function(){
        faces[$(this).attr('title')] = $(this).find('img').attr('src')||$(this).find('img').attr('srcr');
    });
    $('.face-list li').on('click', function(){
        var _val = chatContent.val();
        chatContent.val(_val.substr(0,cursorPosition) + $(this).attr('title')+_val.substr(cursorPosition));
        cursorPosition += $(this).attr('title').length;
    });


    String.prototype.replaceFace = function(){
        var p = /\[[^\]]+\]/g;
        var result= this.match(p);
        var s = this;
        for(var i in result) {
            var face = result[i];
            if(!faces[face]) {
                continue;
            }
            s = s.replace(face, '<img class="face" src="' + faces[face] + '" />');
        }
        return s.toString();
    };

    function appendContent(type, msg,msgSrc,time) {
        if(type != 3){
            appendTime(new Date().getTime());
        }
        var cs = "odd";
        var head = $("#sAvatar").val();
        var statusIcon=[];
        if (type == 2) { //接受消息
            cs = "even";
            head = $("#dAvatar").val();
            $("#chatThread").append("<li class='" + cs + " msg' data-time=" + (time ? time : new Date().getTime()) + "><div class='pic'><img src='" + (head||"https://qncdn.qiakr.com/mall/default-photo.png") + "'/></div>" + msg + "</li>");
        }else if(type == 1){  // 发送消息
            var msg2 = formatTextWithUrl(msg);
            msg2 = msg2 +'<img class="status ing" src="https://qncdn.qiakr.com/webim/loading.gif" />';
            $("#chatThread").append("<li class='" + cs + " msg' data-time=" + (time ? time : new Date().getTime()) + "><div class='pic'><img src='" + (head||"https://qncdn.qiakr.com/mall/default-photo.png") + "'/></div>" + msg2 + "</li>");
            statusIcon = $("#chatThread li:last").find(".ing");
        }else if(type == 3){  // 商品链接快捷键
            var title = JSON.parse(msg).Description;
            $("#chatThread").append('<br style="clear:both" /><li class="tip"><div class="stockInfo">'+title+'</div><div data-stock=\''+msg+'\' class="send">发送当前商品链接</div></li>');
        }else if(type == 4){ // 图文消息
            chatObject.sendMessage($("#salesId").val(), msg, "7");
            var msg2=JSON.parse(msg);
            var msg3="<a class='imgText' href="+msg2.Url.replace(/&from=.*/,"")+"><div class='wbox'><img class='proImg' src='"+msg2.PicUrl+"' /><div class='desc wbox-1'>"+msg2.Description+"</div></div></a>"
            msg3 += '<img class="status ing" src="https://qncdn.qiakr.com/webim/loading.gif" />';
            $("#chatThread").append("<li class='" + cs + " msg' data-time=" + new Date().getTime() + "><div class='pic'><img src='" + (head||"https://qncdn.qiakr.com/mall/default-photo.png") + "'/></div>" + msg3 + "</li>");
            statusIcon = $("#chatThread li:last").find(".ing");
        }
        page.setHeight();
        if(statusIcon.length > 0){
            setTimeout(function(){
                statusIcon.removeClass("ing").addClass("error").data("type",type == 4 ? "7" : "0").data("content", msgSrc ? msgSrc : msg).attr("src","https://qncdn.qiakr.com/webim/message-resend@2x.png");
            },10000);
        }
    }

    function sendMsg(type){
        var to = $("#salesId").val();
        var content = $(chatContent).val();
        if(!content || !$.trim(content)) {
            $(chatContent).focus();
            return;
        }
        content = content.replace(/[\r\n]/g,"");
        var msgType = type ? type : "0";
        chatObject.sendMessage(to, content, msgType);
        var contentSrc = content;
        content = contentSrc.replaceFace();
        appendContent(1, content, contentSrc);
        $(chatContent).val('');
        $("#faceSlider").hide();
        $("#face-control").removeClass("selected");
        if(navigator.userAgent.indexOf('Android') > -1){
            $(chatContent).focus();
        }else{
            page.setHeight();
        }
    }

    function formatTextWithUrl(str){
      var Expression='((https://)|(http://)|(www\\.)){1}[A-Za-z0-9-_:\/]+\\.[A-Za-z0-9-_:#%&\?\/.=]+';
      var objExp=new RegExp(Expression,"g");
      var hasUrl = objExp.test(str);
      if(hasUrl){
        var r = str.match(objExp);
        var newStr=str;
        for(var i=0;i<r.length;i++){
            if(r[i].indexOf("webim/face")<0){
                newStr = newStr.replace(r[i],'<a target="_blank" href="'+((r[i].indexOf("https://")<0 && r[i].indexOf("http://")<0)  ? "http://"+r[i] : r[i])+'">'+r[i]+'</a>');
            }
        }
        return newStr;
      }else{
        return str;
      }
    }

    function appendTime(msgTime) {
        msgTime = parseInt(msgTime);
        var ctObj = $('li.msg').last();
        var reviceTimeS = new Date(msgTime).format("yyyy-MM-dd HH:mm");
        var today = new Date().format("yyyy-MM-dd");
        if (reviceTimeS.startWith(today)) { // 这条消息是今天的
            var h = new Date(msgTime).getHours();
            if(h < 7) {
                reviceTimeS = "凌晨 ";
            } else if (h >=7 && h < 9) {
                reviceTimeS = "早上 ";
            } else if (h >=9 && h < 11) {
                reviceTimeS = "上午 ";
            } else if (h >=11 && h < 13) {
                reviceTimeS = "中午 ";
            } else if (h >=13 && h < 19) {
                reviceTimeS = "下午 ";
            } else if (h >=19) {
                reviceTimeS = "晚上 ";
            }
            reviceTimeS += new Date(msgTime).format("HH:mm");
        }
        // 第一条
        if(!ctObj.length) {
            $(chatThread).append("<li class='time'><span>" + reviceTimeS + "</span></li>");
        } else {
            var lastTime = parseInt(ctObj.attr('data-time'));
            // 超过5分钟
            if(msgTime - lastTime > 1 * 60 * 1000) {
                $(chatThread).append("<li class='time'><span>" + reviceTimeS + "</span></li>");
            }
        }
    }

    Date.prototype.format = function(fmt) { //author: meizz
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

    String.prototype.startWith=function(str){
      var reg=new RegExp("^"+str);
      return reg.test(this);
    };

    String.prototype.endWith=function(str){
      var reg=new RegExp(str+"$");
      return reg.test(this);
    };
});