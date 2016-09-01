var menuCurrent = "notice";
document.title="洽客-官网动态"; 
require(["qiakr/base_old","tool/uploader","validate"],function(base,uploader,validate){
	Util.createSecondMenu([
		{"name":"小秘书","url":"notice.htm"},
		{"name":"通知中心","url":"notificate.htm"},
		{"name":"导购咨询","url":"consult.htm"},
		{"name":"官网动态","url":"qiakrNews.htm"},
		{"name":"启动屏设置","url":"bootScreen.htm"}
	],"官网动态");

	// 富文本编辑
	(function(){
		if(typeof KindEditor != "undefined"){
			KindEditor.create('textarea[name="text"]', {
		        width:640,
		        height:525,
		        items:['fontsize', 'forecolor', 'hilitecolor', 'bold','italic', 'underline', 'strikethrough', 'lineheight','fontname',  '|','multiUploader','table', 'hr', 'emoticons', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', '|', 'fullscreen'],
		        resizeType:1
		    });
		    return;
		}
		setTimeout(arguments.callee,200);
	})();

	// 主图上传
	$("#newsImageUpload").singleImgUploader({
	    resultInput : $("#newsImageUrl")
	});

	$.fn.multiImgUploader = function(options){
	    if($("#uploadScript").length == 0){
	        $("body").append('<input type="hidden" id="uploadScript" />');
	        jQuery.ajax({
	            url: "//res.qiakr.com/plugins/webuploader/webuploader-0.1.5.min",
	            dataType: "script",
	            cache: true
	        });
	    }
	    var _this = $(this);
	    var setIntervalCon = setInterval(function(){
	        if(typeof WebUploader != "undefined"){
	            clearInterval(setIntervalCon);
	            var uploader = WebUploader.create({
	                auto: true,
	                swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
	                server: 'https://up.qbox.me/',
	                pick: _this[0],
	                // runtimeOrder : "flash",
	                duplicate : true,
	                accept: {
	                    title: 'Images',
	                    extensions: 'gif,jpg,jpeg,png',
	                    mimeTypes: 'image/*'
	                },
	                formData : {
	                    'token' : $('#uptoken').val()
	                },
	                compress : {
	                    width: 800,
	                    height: 800,
	                    quality: 100,
	                    allowMagnify: false,
	                    crop: false,
	                    preserveHeaders: true,
	                    noCompressIfLarger: true,
	                    // 单位字节，如果图片大小小于此值，不会采用压缩。
	                    compressSize: 300*1024
	                }
	            });
	            var uploaderBtn = $(uploader.option('pick'));
	            uploader.on("uploadStart",function(file){
	                if(options.length){
	                    var fileLength = uploaderBtn.siblings(".loaded").length;
	                    if(fileLength >= ~~options.length){
	                        Util.alert("上传数量超过限制，不能超过"+options.length+"张");
	                        return false;
	                    }
	                    if(fileLength == ~~options.length-1){
	                        uploaderBtn.hide();
	                    }
	                }
	                uploaderBtn.before('<div id="'+file.id+'" class="webuploader-container loaded"><span class="cancel">×</span><div class="webuploader-pick uploading"><div class="progressBar"><div class="progress" style="width:0%"></div></div></div></div>');
	            }).on("uploadProgress",function(file,percentage){
	                $("#"+file.id).find(".progress").css("width",percentage*100+'%');
	            }).on("uploadSuccess",function(file,response){
	                var url = Util.cdn+response.hash;
	                $("#"+file.id).data("url",url).css("background-image","url("+url+"?imageView2/2/w/80/h/80)").find(".webuploader-pick").remove();
	                if(options.resultInput){
	                    options.resultInput.val(response.hash);
	                }
	                if(options.callback){
	                    options.callback(url);
	                }
	            }).on("uploadError",function(file, reason,result){
	                Util.alert("上传失败，请稍后再试或刷新页面重试");
	            }).on("error",function(msg){
	                Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
	            });

	            _this.parent().on("click",".cancel",function(e){
	                $(this).parent().fadeOut(300, function() {
	                    $(this).remove();
	                    if(options.removeCallback){
	                        options.removeCallback();
	                    }
	                    if(options.length){
	                        uploaderBtn.show();
	                    }
	                });
	            });
	        }
	    },100);
	}

	// 提交
	$("#newsForm").validate({
	    rules: {
	        title:"required",
	        text:"required"
	    },
	    messages: {
	        title: "请输入新闻标题",
	        text:"请填写正文"
	    },
	    submitHandler:function(form){
	    	var createParam = $(form).serializeObject();
	    	var url = "addArticles.json";
	    	if(Util.getUrlParam("id")){
	    		url = "editArticles.json";
	    		createParam.id=Util.getUrlParam("id");
	    	}
	    	$.ajax({
	            url:url,
	            data:createParam,
	            success:function(data){
	                if(data.status=="0"){
	                    Util.alert("保存成功",function(){
	                        location.href="qiakrNews.htm";
	                    });
	                }
	            }
	        });
	    }
	});
});