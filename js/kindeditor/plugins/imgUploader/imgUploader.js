/**
 * [description]
 * @dependence  dialog FileUploader[webuploader]
 */
// define(['webuploader','kindeditor'],function(WebUploader){
require(['webuploader'], function(WebUploader){
	KindEditor.plugin('imgUploader', function(K) {
    var editor = this, name = 'imgUploader';
    var diaId = Math.random().toString(16).substring(4);

    // 点击图标时执行
    editor.clickToolbar(name, function() {
        var dia = dialog({
	        title:"批量上传图片",
	        id:diaId,
	        fixed: true,
	        content: '<ul class="nav nav-tabs navtab-bg tabs tabs-top" id="insertType"><li class="active"><a href="javascript:;">本地上传</a></li><li class=""><a href="javascript:;">网络图片</a></li></ul>\
	        		<div class="tabContent">\
		        		<div class="webUploaderWrap pt15 localImage">\
	                        <div id="KEUploadBtn'+diaId+'" class="webuploader-pick">点击上传</div>\
	                    </div>\
	                    <div class="netImageWrap" style="display:none">\
							<div class="pt10">请输入图片地址：<input type="text" class="form-control input-sm long newUrl dib w200" /><a href="javascript:;" class="pl10 removeNetImage text-primary">删除</a></div><a href="javascript:;" class="newRow btn btn-white btn-sm mt10">添加一张图片</a>\
	                    </div>\
	        		</div>',
	        width:700,
	        cancel: false,
	        cancelValue:'取消',
	        okValue: '插入所有图片',
	        backdropOpacity:"0",
	        cancel:function(){},
	        ok: function () {
	        	var htmlStr = "", $thisDia = $(document.getElementById('content:'+diaId));
	        	if($thisDia.find(".nav-tabs>li.active").index()==0){
	        		$thisDia.find('.loaded').each(function(i,e){
		        		htmlStr += '<img src="'+$(e).data("url")+'" />';
		        	});
	        	}else{
	        		$thisDia.find(".netImageWrap .newUrl").each(function(i,e){
	        			if($(e).val()!=''){
	        				htmlStr += '<img src="'+$(e).val()+'" />';
	        			}
		        	});
	        	}
	        	K.instances[0].appendHtml(htmlStr);
	        }
	    }).showModal();

        var $thisDia = $(document.getElementById('content:'+diaId));
        $thisDia.find(".nav-tabs li").on("click",function(e){
        	var $this = $(this);
        	if($this.hasClass("active")) return false;
        	var i = $this.index();
        	$this.addClass("active").siblings().removeClass("active");
        	$thisDia.find('.tabContent').children().eq(i).show().siblings().hide();
        });
         $thisDia.find(".netImageWrap").on("click",".newRow",function(){
        	$(this).before('<div class="pt10">请输入图片地址：<input type="text" class="form-control input-sm long newUrl dib w200" /><a href="javascript:;" class="pl10 removeNetImage text-primary">删除</a></div>');
        }).on("click",".removeNetImage",function(){
        	$(this).parent().fadeOut();
        });

        $.fn.multiImgUploader = function(options){
        	var _this = $(this);
	        var uploader = WebUploader.create({
	            auto: true,
	            swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
	            server: 'https://up.qbox.me/',
	            pick: _this[0],
	            duplicate : true,
	            accept: {
	                title: 'Images',
	                extensions: 'gif,jpg,jpeg,png',
	                mimeTypes: 'image/*'
	            },
	            formData : {
	                'token' : $('#token7').val()
	            },
	            compress : {
	                width: 800,
	                quality: 100,
	                allowMagnify: false,
	                crop: false,
	                preserveHeaders: true,
	                noCompressIfLarger: true,
	                compressSize: 300*1024
	            }
	        });
	        var uploaderBtn = $(uploader.option('pick'));
	        uploader.on("uploadStart",function(file){
	            if(options.length){
	                var fileLength = uploaderBtn.siblings(".loaded").length;
	                if(fileLength >= ~~options.length){
	                   toastr.warning("上传数量超过限制，不能超过"+options.length+"张");
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
	            var url = 'https://qncdn.qiakr.com/'+response.hash;
	            
   
	            $("#"+file.id).data("url",url).css({
	            	"background-image": "url("+url+"?imageView2/2/w/80/h/80)",
	            	'background-size': 'contain',
	            	'background-repeat': 'no-repeat',
    						'background-position': 'center center',
	          }).find(".webuploader-pick").remove();
	            if(options.resultInput){
	                options.resultInput.val(response.hash);
	            }
	            if(options.callback){
	                options.callback(url);
	            }
	        }).on("uploadError",function(file, reason,result){
	            toastr.warning("上传失败，请稍后再试或刷新页面重试");
	        }).on("error",function(msg){
	            toastr.warning(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
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
        };

        $("#KEUploadBtn"+diaId).multiImgUploader({});

    });
	});
})
