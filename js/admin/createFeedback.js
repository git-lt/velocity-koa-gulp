function html_encode(a) {
    var b = "";
    return 0 == a.length ? "" : (b = a.replace(/&/g, "&amp;"),
    b = b.replace(/</g, "&lt;"),
    b = b.replace(/>/g, "&gt;"),
    b = b.replace(/\'/g, "&#39;"),
    b = b.replace(/\"/g, "&quot;"),
    b = b.replace(/\n/g, "<br>"))
}

function getStrLen(str){
  return str.replace(/[^\x00-\xff]/g,"**").length/2;
}

$.toast = function(msg, callback){
  var $toast = $("<div class='modal-toast'>"+msg+"</div>").appendTo(document.body);
  var t = 2000;
  
  var o = $toast;
  var w = o.width();
  var h = o.height();
  $toast.css({'margin-left':-w/2+'px', 'margin-top':-h/2+'px'});
  $toast.offset();
  $toast.addClass('toast-show');
  
  setTimeout(function() {
    $toast.addClass('toast-hide');
    setTimeout(function(){
      $toast.remove();
      callback && callback();
    }, t);
  }, t);
}

var fdk_timmer = null; 
var p_createFeedback = {
  init:function(){
    this.initUploader();
    this.saveFeedbackEv();
  },
  initUploader:function(){
    // 主图上传
  	$("#newsImageUpload1").singleImgUploader({
  	    resultInput : $("#newsImageUrl1")
  	});

    $("#newsImageUpload2").singleImgUploader({
  	    resultInput : $("#newsImageUrl2")
  	});

    $("#newsImageUpload3").singleImgUploader({
        resultInput : $("#newsImageUrl3")
    });
  },
  validate:function(obj){
    var self = this;
    if(getStrLen(obj.content)<7){
      $.toast('内容太短，请不要少于7个字符');
      $('#feedback-message-content').css('border-color','red');
      return false;
    }

    if(getStrLen(obj.content)>512){
      $.toast('内容太长，不要超过512个字符');
      $('#feedback-message-content').css('border-color','red');
      return false;
    }

    return obj;
  },
  saveFeedbackEv:function(){
    var self = this;
    $('#feedback-message-submit').on('click', function(){
      var pics = [],s;
      $('.webuploaderImgSrc').each(function(){
        s = $(this).val()
        if(s !='') pics.push(s);
      });

      var obj = {
        type:$('#feedbackType').val(),
        content:html_encode($('#feedback-message-content').val()).trim(),
        picture:pics
      };
      obj = self.validate(obj);
      var uPhone = $.trim($('<div>').html($('#feedback-message-phone').val()).text());
      var uName = $.trim($('<div>').html($('#feedback-message-name').val()).text());

      obj.picture = JSON.stringify(obj.picture);
      if(uPhone) obj.content+=' 手机号：'+ uPhone+' ';
      if(uName) obj.content+=' 联系人：'+ uName;
      if(obj){
        $('#feedback-message-submit').addClass('disabled');
        $.post('insertFeedback.json', obj).done(function(data){
          if(data.status === '0'){
            $.toast('反馈已经提交成功！');
            $('#feedback-message-content,#feedback-message-phone,#feedback-message-email').val('');
            $('.webuploaderImgSrc').val('');
            $('.webuploader-container').css({background:'none'})
          }else{
            $.toast('提交失败！');
          }
          $('#feedback-message-submit').removeClass('disabled');
        }).fail(function(){
          $.toast('服务器繁忙');
          $('#feedback-message-submit').removeClass('disabled');
        });
      }
    });

    $('#feedback-message-content').on('focus', function(){
      $(this).css('border-color','#cccccc')
    })
  }
}

p_createFeedback.init();