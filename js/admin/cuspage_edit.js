define(['m_decoration','xss'], function(ModDec){
	var CONF, pageVM, page;
	// 模板类型：0为默认模板，1为自定义模板，2为其它类型
	CONF = {
		apiAddTpl:'addSelfPage.json',
		apiUpdateTpl:'updateSelfPage.json',
		apiGetTplById:'getPageOfTemplate.json',
		templateId:'',
		storeId:'',
		templateType:'1',
		suid:$('#g_supplierId').val(),
	}	

	page = {
		init: function(){
			var self = this;
			this.saveConfEv();

			CONF.templateId = mainVM.$model.params.templateId;
			CONF.storeId = mainVM.$model.params.storeId;
			CONF.templateType = CONF.storeId ? '1':'2';

			if(CONF.storeId){
				this.getStoreInfo(CONF.storeId).done(function(store){
					$('#currStoreName').text('当前门店：'+store.name).css('visibility','visible');
					self.initView(store);
				});
				return;
			}

			self.initView();
		},
		getStoreInfo:function(storeId){
			var dfd = $.Deferred();
			$.post('getStore.json',{storeId:storeId})
				.done(function(data){
					if(data.status==='0'){
						dfd.resolve(data.store);
					}else{
						dfd.reject();
					}
				})
				.fail(function(){
					dfd.reject();
				});

			return dfd;
		},
		initView:function(storeInfo){
			var self = this;
			$('#decWrap').uiLoading();
			if(CONF.templateId){
				$.post(CONF.apiGetTplById, {templateId:CONF.templateId})
					.done(function(data){
						if(data.status==='0'){
							var tplD = data.template;
							CONF.templateName = tplD.templateName;
							CONF.templateType = tplD.templateType;
							// 显示模板名称和类型
							$('#tplName').val(CONF.templateName);
							$('#tplTypeChkBox span').text(template.helpers.getTplTpye(CONF.templateType));
							
							console.log('获取：', JSON.parse(tplD.templateConfig));

							ModDec.init({config:JSON.parse(tplD.templateConfig), storeInfo:storeInfo})
								.always(function(){$('#decWrap').uiLoading();});
						}else{
							toastr.error(data.errmsg || '获取数据失败，服务器繁忙！');
						}
					});
			}else{
				CONF.storeId && $('#tplName').val('自定义模板');
				$('#tplTypeChkBox span').text(template.helpers.getTplTpye(CONF.templateType));
				ModDec.init({storeInfo:storeInfo})
					.always(function(){$('#decWrap').uiLoading();});
			}
		},
		saveConfEv:function(){
			$('#btnSaveConf').on('click',function(){
				var _this = $(this);
				var isEdit = !!CONF.templateId;
				var d = ModDec.getData();

				var pms ={
					pageConfig:JSON.stringify(d),
					pageName:filterXSS($.trim($('#tplName').val())),
					templateId:CONF.templateId,
				}
// pageConfig   string
// pageUrl      string
// pageName    string

				if(pms.templateName==''){
					toastr.warning('模板名称不能为空！');
					return false;
				}
				if(Utils.getStrLen(pms.templateName)>15){
					toastr.warning('模板名称不能超过15个字符');
					return false;
				}

				var url = isEdit ? CONF.apiUpdateTpl : CONF.apiAddTpl;

				_this.uiLoading('sm');
				$.post(url, pms).done(function(data){
					if(data.status==='0'){
						toastr.success('装修模板'+(isEdit?'更新':'保存')+'成功！');
						// isEdit && avalon.router.navigate('/decoration_main');
						if(data.templateId){
							CONF.templateId = data.templateId;
							ModDec.createQrCode(CONF.suid, data.templateId, CONF.storeId || '');
						}
					}else{
						toastr.error(data.errmsg || '数据更新失败，服务器繁忙！');
					}
				})
				.always(function(){
						_this.uiLoading('sm');
				});

			})
		}
	}

	return {
		init: function(){
			page.init();
		}
	}
});