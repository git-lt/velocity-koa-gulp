define(['fileUploader','niceV','tagsinput','maxlength'], function(){
	var CONF, page, pageVM, newsEditor;
	CONF = {
		apiCreate:'addArticles.json',
		apiUpdate:'editArticles.json',
		apiGetDetail:'getArticles.json',
		newsId:'',
	};

	pageVM = avalon.define({
		$id:'newsCtrl',
		newsId: '',
		createData:{
			tag:'0',
			title:'',
			thumb:'//qncdn.qiakr.com/website/video_default_face.png',
			summary:'',
			text:'',
			status:'1'
		}
	})

	page = {
		init:function(){
			this.initComs();
			this.frmValiEv();
			this.saveEv();

			CONF.newsId = mainVM.params.$model.id || '';
			this.initVM();
		},
		initVM:function(){
			if(CONF.newsId){
				$.post(CONF.apiGetDetail, {id: CONF.newsId})
					.done(function(data){
						if(data.status==='0'){
							var newsD = data.result.articles;
							pageVM.createData = newsD;
							newsEditor.html(newsD.text);
						}else{
							toastr.error(data.errmsg || ERRMSG['100'])
						}
					})
			}else{
				this.resetVM();
			}
		},
		resetVM:function(){
			pageVM.createData = {
				tag:'0',
				title:'',
				thumb:'//qncdn.qiakr.com/website/video_default_face.png',
				summary:'',
				text:'',
				status:'2',
			}
			newsEditor.html('');
		},
		saveEv:function() {
			$('#btnCreateNews').click(function(e){
				$('#newsFrm').trigger("validate");
				e.preventDefault();
			});
		},
		initComs:function(){
			$('#newsPicUploaderWrap').fileUploader({
		        thumbW:320,
		        thumbH:180,
		    });

			newsEditor = KindEditor.create('#newsContentArea', {
		        width:'100%',
		        height:600,
		        items:['fontsize', 'forecolor', 'hilitecolor', 'bold','italic', 'underline', 'strikethrough', 'lineheight','fontname',  '|','imgUploader','table', 'hr', 'emoticons', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', '|', 'fullscreen'],
		        resizeType:1,
		        afterChange:function(){
		        	pageVM.createData.text = this.html();
		        }
		    });
		},
		frmValiEv:function(){
			var _this = this;

		    $('#newsFrm').on('valid.form', function(e, form){
		      var pms = $.extend({},pageVM.$model.createData), 
      			isCreate = typeof mainVM.$model.params.id === 'undefined';
    	
    			JSON.parse(JSON.stringify(pms, ['tag','title','thumb','summary','text','status']), function(k, v){
						if(k == 'tag') return Number(v);
						if(k == 'status') return Number(v);
						return v;
    			})

		      //xss过滤
		      var api = isCreate ? CONF.apiCreate : CONF.apiUpdate;
		      // 添加 更新ID
		      if(!isCreate) pms.id = Number(CONF.newsId);
		      // 去掉七牛后缀
		      pms.thumb = pms.thumb.split('?')[0];

		      $.post(api, pms).done(function(data){
		        if(data.status==='0'){
		        	Utils.confirm('操作成功',function(){
		        		avalon.router.navigate('/news');
		        	}, function(){
		        		isCreate && _this.resetVM();
		        	}, '返回列表', '继续'+(isCreate?'添加':'编辑'))
		        }
		      }).fail(function(data){
		        toastr.error(data.message || '服务器繁忙，请尝试重新提交！');
		      });

		    });
		}
	};

	return {
		init:function(){
			page.init();
			avalon.scan();
		}
	}

});

