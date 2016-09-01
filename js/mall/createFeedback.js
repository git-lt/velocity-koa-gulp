var Utils = {
	getUrlParam: function(key){
		var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    return r ? decodeURIComponent(r[2]) : '';
	},
	getStrLen:function(str){
		return str.replace(/[^\x00-\xff]/g,"**").length/2;
	}
}
/**
 * [$.toast 消息提示]
 * @param  {[string]} msg [消息内容]
 */
$.toast = function(msg, callback){
	var $toast = $("<div class='modal-toast'>"+msg+"</div>").appendTo(document.body);
	var t = 2000;
	
	var o = $toast.offset();
	var w = o.width;
	var h = o.height;
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

/**
 * [图片上传]
 */
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


var salesId = Utils.getUrlParam('salesId');
var token = Utils.getUrlParam('token');

var QN_path = 'https://qncdn.qiakr.com/';
var imgSize = '?imageView2/1/w/300/q/70';

var page = {
	init:function(){
		this.delPicEv();
		this.subFeedbackEv();
		this.initUploader();
	},
	subFeedbackEv:function(){
		$('#subFeedbackBtn').on('click', function(){
			var imgs=[];
			$('.pic-item').each(function(){
				imgs.push($(this).data('img'));
			});

			var pms = {
				content:$('<div>').html($('#feedbackTxt').val()).text().trim(),
				picture:JSON.stringify(imgs),
				type:$('#adviceType').val()
			}
			if(pms.content==''){
				$.toast('请输入您的建议！')
				$('#feedbackTxt').focus();
				return false;
			}
			if(Utils.getStrLen(pms.content)>255){
				$.toast('字数超限，请少于255个字符！');
				return false;
			}
			var aName = $('#adviceName').val();
			var aPhone = $('#advicePhone').val();
			if(Utils.getStrLen(aName)>20){
				$.toast('字数超限，请少于20个字符！');
				return false;
			}

			if(!(/^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/.test(aPhone))){
				$.toast('电话号码格式不正确！');
				return false;
			}
			pms.content += ' '+aName+'--'+aPhone;

			$.ajax({
				url:'insertFeedback.json',
				data:pms,
				type:'post',
				dataType:'json',
				success:function(data){
					if(data.status==='0'){
						$.toast('您的反馈已经提交成功！');
						$('#feedbackTxt').val('');
						$('#adviceName').val('');
						$('#advicePhone').val('');
						$('.pic-item').remove();
						$('#addSuccessTip').addClass('active');
					}else{
						$.toast('系统繁忙，请稍候重试！');
					}
				},
				error:function(data){
					$.toast('系统繁忙，请稍候重试！');
				}
			});
		})
	},
	showPic:function(data){
		if($('.pic-item').length>3){
			$.toast('最多只能上传3张图片！');
			return false;
		}else{
			if(data.length){
				var url = QN_path+data+imgSize;
				var itemStr = '<li class="pic-item" data-img="'+QN_path+data+'"><div class="img-box" style="background-image:url('+url+')"></div><a href="javascript:;" class="c-bl del">删除</a></li>';
				$('#takePic').before(itemStr);
				if($('.pic-item').length==3){
					$('#takePic').hide();
				}
			}
		}
	},
	initUploader:function(){
		var self = this, loadingLen = 0, $loading=$('#uploadingBox');
		$('#file-img-feedback').imgUploader({
			url: 'https://up.qbox.me/',		
			data: {token:$('#uptoken').val()},
			canPreview:false,
			maxSize: 1024*4000,
			acceptImgType: ['jpg','png','gif','jpeg','bmp'],
			onError: function(errorMsg,level,file){
				$.toast(errorMsg);
			},
			onSelected:function(){
				$loading.show();
			},
			onProgress:function(e, file, currPercent, totalPercent){
				loadingLen = loadingLen>0 ? loadingLen: $('#fdbkPicBox').width();
				$loading.css('width',loadingLen*(totalPercent/100)+'px');
				if(Math.ceil(totalPercent)>=100){
					setTimeout(function(){$loading.hide().css('width','0px');}, 100);
				}
			},
			onSuccess: function(e,res, file) {
				if($('.pic-item').length<3){
					self.showPic(JSON.parse(res).key);
				}else{
					$('#takePic').hide();
				}
			},
			onCompleted: function() {
				$.toast('上传成功！');
			}
		});
	},
	delPicEv:function(){
		$('#imgsWrap').on('click', '.del', function(){
			if(window.confirm('是否确定删除该图片？')){
				var $this = $(this);
				$this.parent('.pic-item').remove();
				$.toast('删除成功！');
				$('#takePic').show();
			}
		})
	}
}

page.init();



