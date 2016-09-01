
    /* globals Zepto,template */
    var Q = Zepto;
    var pageView = {
      init:function(){ this.getData(); },
      getData:function(){
        var wrap = Q('#mainWrap');
        // 显示loading
        Q.post('customerLevelIndex.json')
          .done(function(data){
            if(data.status==='0'){
              wrap.html(template('vip-card-tpl',data.result));
            }else{
              wrap.html('<div class="empty-tip-box">'+(data.errmsg || '服务器繁忙')+'</div>');
            }
          })
          .fail(function(){
            wrap.html('<div class="empty-tip-box">未登录或服务器繁忙</div>');
          })
          .always(function(){
            wrap.css('background-image','none');
          });
      }
    }
    pageView.init();
  