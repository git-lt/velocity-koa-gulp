;(function(window, $){
	"use strict";

	function jsonToUrlPms(jsonObj){
		var t = '';
		for(var v in jsonObj)
			t+=('&'+v +'='+jsonObj[v])
		return '?'+t.substring(1);
	};
	var ImgUploader = function(ele, option){
		this.$el = $(ele);
		this.option = option;
		this.files = [];
		this.selectNum = 0;		//选择文件的个数
		this.filesNum = 0; 		//可以上传的个数
		this.sucessNum = 0; 	//上传成功的个数
		this.failureNum = 0; 	//上传失败的个数
		this.totalPercent=0;	//当前总进度值
		this.bindEvents();
	};

	ImgUploader.DEFAULTS= {
		url: '',								//上传的地址
		data: {},								//传递的参数
		maxSize: 1024*1024*100,					//最大大小
		minSize: 10,							//最小大小
		acceptImgType: ['jpg','jpeg','png','gif','bmp'],		//接受的文件类型
		canPreview: true,						//是否生成预览图
		timeout: 800,							//循环上传的延迟时间
		onPreview:function(dataUrl,file){},		//选中文件后的预览回调 [参数：图片的base64编码数据，文件信息]
		filter: function(files){ return files},	//文件过滤回调
		onError: function(errorMsg,level,file){},//错误类别：文件类型、文件太大、文件太小、上传出错, level级别：red/yellow/green/blue
		onStart: function(){},					//文件开始上传时回调
		onSelected: function(files) {},			//文件选择后回调
		onProgress: function(e, file, currPercent, totalPercent) {},	//文件上传进度回调
		onSuccess: function(e,responseText,file) {},					//单个文件上传成功回调
		onCancel: function(e, file){},			//取消上传时的回调
		onCompleted: function() {},				//全部文件上传完毕回调
		createGUID: function(){					//生成识别文件标识的guid
			return 'img'+Math.random().toString(36).substring(2, 10);
		}
	};

	ImgUploader.prototype = {
		constructor:ImgUploader,
		start:function(){
			var self = this, o = this.option;

			if(o.onStart){ 
				if(!this.files.length){
					// alert('没有需要上传的图片'); 
					return false;
				}
				o.onStart(); o.onStart = null; 
			}

		    if (this.files.length) { //还有文件需要上传
		        var file = this.files.shift();
		        this.ajaxUpload(file);
		    } else {				//全部上传完毕
		        this.files = []; 
		        o.onCompleted();
		    }
		},
		getFiles:function(self){
			var self = self, o = self.option;

			self.selectNum = this.files.length;
			self.totalPercent = self.sucessNum = self.failureNum = 0;

			o.onSelected(this.files);

			//转换为数组
			self.files = [].slice.call(this.files);
			//文件过滤
			self.files = self.fileFilter(); 	//内部使用的过滤器
			self.files = o.filter(self.files); 	//自定义的过滤器

			self.filesNum = self.files.length;
			//添加GUID
			self.addGUID();

			if(self.filesNum){
				if(o.canPreview){
					self.renderPreview(); //生成预览图
				}else{
					self.start(); //开始上传
				}
			}

			//清空选择
			this.value='';
		},
		renderPreview:function(){
			var o = this.option, 
				files = this.files, 
				i=0, 
				len=files.length, 
				reader;

			var imgWidth, imgHeight;
			for(;i<len;i+=1){
				var reader = new FileReader();
				reader.onload = (function(f) {
				    return function(e) {
				       o.onPreview(e.target.result, f);
				    }
				})(files[i]);
				reader.readAsDataURL(files[i]);
			};
		},
		addGUID:function(files){
			var o = this.option;
			if(this.files.length){
				var i=0, len = this.files.length;
				for(; i<len; i+=1){
					this.files[i].guid = o.createGUID();
				}
			}
		},
		ajaxUpload:function(file){
			var self = this, o = this.option;

			var url = this.option.url+ jsonToUrlPms(this.option.data)+'&guid='+file.guid;

			var xhr = new XMLHttpRequest();

			//开始 [每个文件开始上传时]
			// xhr.addEventListener('loadstart', function(e){ o.onStart(e, file); });
			//进度
			xhr.upload.addEventListener('progress', function(e){ 
				if (e.lengthComputable) {
			        var percentComplete =  Math.round(e.loaded * 100 / e.total);
			        self.totalPercent = self.sucessNum*100+percentComplete;
			        if(percentComplete==100) self.sucessNum++;
			        var totalPercent = Math.round(self.totalPercent*100/(self.filesNum*100));
			        o.onProgress(e, file, percentComplete, totalPercent);
				}
			});
			//成功
			xhr.addEventListener('load', function(e){ o.onSuccess(e, e.target.responseText, file); setTimeout(function(){self.start.call(self);},o.timeout); });
			//失败
			xhr.addEventListener('error', function(e){ o.onError(e.target.error,'red', file); self.failureNum--; });
			//取消
			xhr.addEventListener('abort', function(e){ o.onCancel(e, file); });

			//上传
			xhr.open('POST',url, true);
			var fd = new FormData();
			fd.append('file', file);
			xhr.send(fd);
		},
		fileFilter:function(){
			var arrFiles = [], o = this.option, type_errorFiles = [], size_errorFiles_big=[], size_errorFiles_small=[];
			var fileName='';
			for (var i = 0, file; file = this.files[i]; i++) {
				fileName = file.name;
				if(o.acceptImgType.indexOf(fileName.substring(fileName.lastIndexOf('.')+1).toLowerCase())===-1){
					type_errorFiles.push(file);
				}else{
					if(file.size<=o.minSize){
						size_errorFiles_small.push(file);
					}
				    else if (file.size >= (o.maxSize)) {
				    	size_errorFiles_big.push(file);
				    } else {
				        arrFiles.push(file);
				    }
			    }
			}
			size_errorFiles_big.length &&　o.onError('图片过大，应小于'+((o.minSize/1024/1024)>>0)+'M', 'yellow', size_errorFiles_big);
		    size_errorFiles_small.length &&　o.onError('图片过小，应大于'+o.minSize+'kb','yellow', size_errorFiles_small);
		    type_errorFiles.length &&　o.onError('图片类型错误', 'yellow', type_errorFiles);

			return arrFiles;
		},
		bindEvents:function(){
			var self = this, o = this.option;
			this.$el.on('change',function(){self.getFiles.bind(this,self)()});
		}
	};

	$.fn.imgUploader = function(options){
		return this.each(function(){
			var $this = $(this);
			var data = $(this).data('ui-imguploader');
			var option = $.extend({}, ImgUploader.DEFAULTS, typeof options === 'object' && options);
			if(!data) $this.data('ui-imguploader',(data=new ImgUploader(this,option)));

			if(typeof options === 'string'){
				data[options].apply(data,Array.prototype.splice.call(arguments,1));
			}
		});
	};
})(window, Zepto);