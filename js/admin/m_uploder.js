/**
 * [文件上传模块]
 */
define(['webuploader','utils'],function(WebUploader){
	function FileUploader(ele, opt){
		this.$el = $(ele);
		this.$pick = this.$el.find(opt.pickCls);
		this.o = opt;
		this.uploader=null;
		this.init();
	};

	FileUploader.prototype={
		constructor:FileUploader,
		init:function(){
			this.uploader = WebUploader.create(this.getConfig());
			this.addEvents(this.uploader);
		},
		getConfig:function(){
			var o = this.o, config;
			config = {
				auto: true,
    		swf: o.swfPath,
		    server: o.serverPath,
		   	prepareNextFile: true,	
				disableGlobalDnd: true,
				fileNumLimit: o.fileNumLimit,
				fileSizeLimit: o.fileSizeLimit,
				fileSingleSizeLimit: o.fileSingleSizeLimit,
		    pick:{
	        id:this.$pick[0],
	        multiple : o.multipleable
		    },
		    formData : {
	        token: o.token
		    },
				accept:{
					title: 'limitTypes',
					extensions: o.extensions,
					mimeTypes: o.mimeTypes
				},
				thumb:{
					crop: true,
					type: 'image/png'
				},
				compress:{
	        width: o.compressW,
	        height: o.compressH,
	        quality: 90,
	        compressSize: o.compressSize
				}
			};
			return config;
		},
		addEvents:function(uploader){
			var o = this.o; 
			o.fileQueuedEv && typeof o.fileQueuedEv === 'function' && uploader.on('fileQueued', o.fileQueuedEv.bind(this));
			o.uploadStartEv && typeof o.uploadStartEv === 'function' && uploader.on('uploadStart', o.uploadStartEv.bind(this));
			o.uploadProgressEv && typeof o.uploadProgressEv === 'function' && uploader.on('uploadProgress', o.uploadProgressEv.bind(this));
			o.uploadErrorEv && typeof o.uploadErrorEv === 'function' && uploader.on('uploadError', o.uploadErrorEv.bind(this));
			o.uploadSuccessEv && typeof o.uploadSuccessEv === 'function' && uploader.on('uploadSuccess', o.uploadSuccessEv.bind(this));
			o.uploadCompleteEv && typeof o.uploadCompleteEv === 'function' && uploader.on('uploadComplete', o.uploadCompleteEv.bind(this));
			o.errorEv && typeof o.errorEv === 'function' && uploader.on('error', o.errorEv.bind(this));
		}
	};

	$.fn.fileUploader = function(option){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data('baidu-fileUploader');
			var options = $.extend({}, $.fn.fileUploader.DEFAULTS, typeof option === 'object' && option);

			if (!data) $this.data('baidu-fileUploader', (data = new FileUploader(this, options) ));
			if (typeof option === 'string') data[ option ].apply(data, arguments);
		});
	}

	// 可以是图片，也可以是文件, 可以是单个，也可以是多个
	$.fn.fileUploader.DEFAULTS = {
		token: '',
		// 上传路径配置
		swfPath:'//res.qiakr.com/plugins/webuploader/Uploader.swf',
		serverPath:GLOBAL_CONFIG.uploadServer,
		resultInput:'',
		// 个数和大小限制
		fileSingleSizeLimit:1000*100,
		// 上传按钮
		pickCls:'.file_picker',
		multipleable:false,
		// 类型限制
		extensions:'gif,jpg,jpeg,png',
		mimeTypes:'image/*',
		// 缩略图
		thumbW:100,
		thumbH:100,
		// 压缩
		compressW:100,
		compressH:100,
		compressSize:1000*100,
		// 事件
		fileQueuedEv:function(file){
			// 预览
			var oThis = this, $img = this.$el.find('.ui_image_preview');

			oThis.uploader.makeThumb(file, function( error, src ) {
		       if ( error ) {
		           $img.replaceWith('<span>不能预览</span>');
		           return;
		       }
		       $img.attr( 'src', src );
			}, oThis.o.thumbW,  oThis.o.thumbH);
		},
		uploadStartEv:function(){
			// 设置图片预览的进度
			var $img = this.$el.find('.select_img');
			var $progress = $img.find('.progress');
			
			if(!$progress.length){
				$img.append('<div class="progress mb0">\
          <div class="progress-bar progress-bar-primary progress-bar-striped active" role="progressbar" style="width: 0%;">\
              <span class="sr-only"></span>\
          </div>\
      </div>');
			}else{
				this.$el.find('.progress-bar').css('width',0).parent().show();
			}
		},
		uploadProgressEv:function(file, percentage){
			var $progerssBar = this.$el.find('.progress-bar');
			$progerssBar.css('width', percentage * 100 + '%');
		},
		uploadSuccessEv:function(file, response){
			var url = 'https://qncdn.qiakr.com/'+response.hash;
			this.$el.find('.progress-bar').css('width',0).parent().hide();
			this.$el.find('.uploader_resimg').val(url);
		},
		uploadErrorEv:function(file, reason){
			toastr.warning('上传失败：'+(reason=='http'?'登录超时，请刷新重试':reason));
		},
		uploadCompleteEv:function(file){
			this.uploader.reset();
		},
		errorEv:function(type){
			var msg = '';
			switch(type){
				case 'Q_EXCEED_NUM_LIMIT':
					msg = '文件个数超过限制，请重试！';
					break;
				case 'F_EXCEED_SIZE':	
				case 'Q_EXCEED_SIZE_LIMIT':
					msg = '文件大小超过限制，请重试！';
					break;
				case 'Q_TYPE_DENIED':
					msg = '文件类型不符，请重试！';
					break;
				case 'F_DUPLICATE':
					msg = '请勿重复上传！';
					break;
			}
			if(msg){
				toastr.warning(msg); 
			}else{
				toastr.warning('文件上传失败:( '+type); 
			}
		}
	};

});
	