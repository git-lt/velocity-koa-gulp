define(function(require, exports, module){
   WebUploader = require('webuploader');
    $.fn.singleImgUploader = function(options){
        var _this = $(this);
        var imgW = options.width || "",
            imgH = options.height || "";

        var uploader = WebUploader.create({
            auto: true,
            swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
            server: 'https://up.qbox.me/',
            pick:{
                id:_this[0],
                multiple : false
            },
            // runtimeOrder : "flash",
            duplicate : true,
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,png',
                mimeTypes: 'image/*'
            },
            formData : {
                'token' : $('#uptoken').val()
                // 'key' : options.name ? options.name : ""
            },
            compress : {
                width: options.limitLarger ? 1600 : 800,
                height: options.limitLarger ? 1600 : 800,
                quality: 90,
                allowMagnify: true,
                crop: false,
                preserveHeaders: true,
                noCompressIfLarger: true,
                // 单位字节，如果图片大小小于此值，不会采用压缩。
                compressSize: options.limitLarger ? 1024*1024 : 300*1024
            }
        });
        uploader.on("uploadStart",function(file){
            _this.find(".webuploader-pick").addClass("uploading").append('<div class="progressBar"><div class="progress" style="width:0%"></div></div>')
        }).on("uploadProgress",function(file,percentage){
            _this.find(".progress").css("width",percentage*100+'%');
        }).on("uploadSuccess",function(file,response){
            var url = (imgW && imgH) ? (Util.cdn+response.key+"?imageView2/1/w/"+imgW+"/h/"+imgH+"/q/100") : (Util.cdn+response.hash)
            _this.css("background-image","url("+url+")").find(".webuploader-pick").removeClass("uploading").find(".progressBar").remove()
            if(options.resultInput){
                options.resultInput.val(url);
            }
            if(options.callback){
                options.callback(url);
            }
        }).on("uploadError",function(file, reason,result){
            Util.alert("上传失败，请稍后再试或刷新页面重试");
        }).on("error",function(msg){
            Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
        });
    }
});