define(['fileUploader','niceV','tagsinput','maxlength'], function(WebUploader){
	var CONF, pageVM, page, videoEditor;

	CONF = {
		apiCreate:'createQiakrVideo.json',
		apiUpdate:'updateQiakrVideo.json',
		apiGetDetail:'getQiakrVideoById.json',
		id:'',
	}

	pageVM = avalon.define({
		$id:'videoCtrl',
		createData:{
			videoPic:'https://qncdn.qiakr.com/website/video_default_face.png',
			videoUrl:'',
			mainTitle:'',
			viceTitle:'',
			courseTag:'',
			teacher:'',
			duringTime:'',
			supplierLevel:'',
			courseFee:'',
			courseDescription:'',
			type:1,
			status:'2',
			id:'',
			gmtCreate:'',
			gmtUpdate:'',
			sort:0,
		}
	})

	page = {
		init:function(){
			this.initComs();
			this.saveEv();
			this.sltChangeEv();
			this.frmValiEv();

			CONF.id = mainVM.params.$model.id || '';
			this.initVM();
		},
		initVM:function(){
			if(CONF.id){
				$.post(CONF.apiGetDetail, {qiakrVideoId: CONF.id})
					.done(function(data){
						if(data.status==='0'){
							var video = data.result.qiakrVideo;
							pageVM.createData = video;
							videoEditor.html(video.courseDescription);

						    // 设置slt的值 
						    $('[name="type"]').val(pageVM.$model.createData.type).trigger('change');
						    var levels = pageVM.$model.createData.supplierLevel.split('_');
						    $('[name="supplierLevel"]').val(levels).trigger('change');
						    $('#courseTag').tagsinput('add',pageVM.$model.createData.courseTag.split('_').join(','));

						}else{
							toastr.error(data.errmsg || ERRMSG['100'])
						}
					})
			}else{
				this.resetVM();
			}
		},
		initComs:function(){
		    var self = this;
		    $(".select2").select2();
		    $('.limit-num').maxlength({ threshold: 20 });
		    $('#courseTag').tagsinput();
		    $('#videoPicUploaderWrap').fileUploader({
		        thumbW:320,
		        thumbH:180,
		    });
		    videoEditor = KindEditor.create('#videoContentArea', {
		        width:'100%',
		        height:600,
		        items:['fontsize', 'forecolor', 'hilitecolor', 'bold','italic', 'underline', 'strikethrough', 'lineheight','fontname',  '|','imgUploader','table', 'hr', 'emoticons', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', '|', 'fullscreen'],
		        resizeType:1,
		        afterChange:function(){
		        	pageVM.createData.courseDescription = this.html();
		        }
		    });
		},
		sltChangeEv:function(){
		    $('[name="type"]').on('change', function(){
		      pageVM.createData.type=$(this).val();
		    })

		    $('[name="supplierLevel"]').on('change', function(){
		      pageVM.createData.supplierLevel=$(this).val();
		    })
		},
		frmValiEv:function(){
			var self = this;

		    $('#videoFrm').on('valid.form', function(e, form){
		      var pms = $.extend({},pageVM.$model.createData), 
		      		isCreate = typeof mainVM.$model.params.id === 'undefined';

		      // 处理一下标签连接符 courseTag supplierLevel
		      pms.courseTag = pms.courseTag ? pms.courseTag.split(',').join('_'):'';
		      pms.supplierLevel = $.isArray(pms.supplierLevel) ? pms.supplierLevel.join('_'):pms.supplierLevel;
		      
		      //xss过滤
		      pms.courseDescription = avalon.filters.sanitize(pms.courseDescription);
		      var api = isCreate ? CONF.apiCreate : CONF.apiUpdate;
		      
		      // 添加 更新ID
		      if(!isCreate) pms.qiakrVideoId = CONF.id;
		      
		      // 去掉七牛后缀
		      pms.videoPic = pms.videoPic.split('?')[0];
		     
		     // console.log(pms);
		     // return;
		      $.post(api, pms).done(function(data){
		      	if(data.status==='0'){
		        	Utils.confirm('操作成功',function(){
		        		avalon.router.navigate('/videos');
		        	}, function(){
		        		isCreate && self.resetVM();
		        	}, '返回列表', '继续'+(isCreate?'添加':'编辑'))
		        }
		      }).fail(function(data){
		        toastr.error(data.message || '服务器繁忙，请尝试重新提交！');
		      });

		    });
		},
		saveEv:function(){
			$('#btnCreateVideo').click(function(e){
				$('#videoFrm').trigger("validate");
				e.preventDefault();
			});
		},
		resetVM:function(){
			pageVM.createData = {
				videoPic:'https://qncdn.qiakr.com/website/video_default_face.png',
				videoUrl:'',
				mainTitle:'',
				viceTitle:'',
				courseTag:'',
				teacher:'',
				duringTime:'',
				supplierLevel:'',
				courseFee:'',
				courseDescription:'',
				type:1,
				status:'2',
				id:'',
				gmtCreate:'',
				gmtUpdate:'',
				sort:0,
			};

			$('#courseTag').tagsinput('removeAll');
    		$('[name="supplierLevel"]').val([]).trigger('change');
			videoEditor.html('');
		}
	}

	return {
		init: function(){
			page.init();
			avalon.scan();
		}
	}
});