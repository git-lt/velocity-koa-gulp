define(['utils','location','mod_decorationMods', 'couponDia'], function(){
	var CONF, pageVM, page, tplDia;

	console.log($.couponDia);

	CONF={
		apiGetDefConf:'getSupplierFrontConf.json',
		apiSaveConfUrl:'insertSupplierFrontConf.json',
		apiInitDefaultTpl:'initSupplierTemplate.json',
		apiGetStoreTplList:'queryStoreTemplate.json',
		apiGetTplList:'getTemplateListOfSupplier.json',
		apiGetTplVoList:'getTemplateVoListOfSupplier.json',
		apiBatchSetStoreTpl:'batchSetStoreTemplate.json',
		apiSetSiderbarStyle:'updateSupplierDisplayType.json',
		apiGetCategoryList: 'querySupplierCategoryList.json',
		apiGetDisplayType: 'getSupplierDisplayType.json',
		apiGetTplByStoreId:'getTemplateOfStore.json',
		tplListCache:[],
		storeCache:{},
		storeListCache:'',
	};

	pageVM = avalon.define({
		$id:'decMainCtr',
		searchPms:{
			province:'',
			city:'',
			district:'',
			storeName:'',  
			index:0,
			length:30,      
			templateId:'',
		},
		searching:false,
		searchEv:function(){
			pageVM.searching = true;
			pageVM.searchPms.index=0;
			page.getDecList();
		}
	});

	var DEF_CONF={
		'm1000':{
			show:true,
			orderNum:-10,
		},
		'm1011':{
			show:true,
			orderNum:-9,
		},
		'm1012':{
			show:true,
			orderNum:-8,
		},
		'm1006':{ //活动导航
			hasMiaosha:true,
			hasHongbao:true,
			hasNewhot:true,
			hasCoupon:true,
			appointment:false,
			hasClass:false,
			orderNum:1,
		},
		'm1004':{
			hasTitle:true,
			autoRecommend:true,//是否自动推荐
			autoPms:{ //自动: 查询参数
				keywords:'',
				limitNum:8,
				showListType:'category',
				showListByBrand:false, //是否按品牌展示列表
				showListTypeInfo:null,   //选择 按类目或按品牌 的选择信息
				orderTypeNum:0
			},
			productInfoAuto:[],
			orderNum:2
		}
	};

	page = {
		init:function(){
			var self = this;
			this.initcoms();
			this.changeTplEv();
			this.editTplEv();
			this.chkStoreEv();
			this.batchSetStoreTplEv();
			this.setTpl2StoreEv();
			this.setSiderbarStyleEv();
			this.initDisplay();

			//初始化商户默认装修配置： 先获取分类，初始化默认数据，判断商户是否已经初始化，如果没有则使用默认数据初始化
			this.initCategorysData().done(function(){
				$.when(self.initDefaultTpl()).done(function(){
					self.getTplList();
					self.getDecList();
				}).fail(function(){
					toastr.error('初始化模板数据失败！');
				});
			});
			
		},
		resetVM:function(){
			pageVM.searchPms = {
				province:'',
				city:'',
				district:'',
				storeName:'',  
				index:0,
				length:30,      
				templateId:'',
			};
			pageVM.searching = false;
		},
		initDisplay:function(){
			$.post(CONF.apiGetDisplayType)
			.done(function(v){
				if(v.status==='0'){
					$('#displayTypeSlt').val(v.displayType).trigger('change');
				}
			});
		},
		initcoms:function(){
			var self = this;
			// tab
			$('#decTabBox').navTab(function($el){
				var status = $el.parent().data('status');
				$('#tabContentWrap').children().hide().eq(status).fadeIn();
				$('#tplSearchBox')[status === 0?'fadeIn':'hide']();
				if(status === 1) self.getTplList();

			});

			$('#decTabBox li:first a').trigger('click');

			// 省市区选择
			var loc = new Location();
			loc.fillOption('loc_province' , '0');

			// 模板选择
			$.post(CONF.apiGetTplList).done(function(data){
				if(data.status==='0'){
					var tplSltData = data.templateList.map(function(v){
						return {id:v.id, text:v.templateName};
					});
					CONF.tplListCache = data.templateList;

					$('#tplSlt').select2({data:[{id:' ', text:'全部'}].concat(tplSltData), minimumResultsForSearch: Infinity});
					$('#tplSlt').val(' ').trigger('change');
				}
			});

			// select2
			$("#loc_province,#loc_city,#loc_town").select2();

			// select change
			$('#loc_province').change(function() {
			    $('#loc_city').empty();
			    if($(this).val()){
				    loc.fillOption('loc_city' , '0,'+$('#loc_province').val());
				    $('#loc_city').change();
				    pageVM.searchPms.province = $(this).select2('data').text;
					}else{
						pageVM.searchPms.province="";
						pageVM.searchPms.city="";
						pageVM.searchPms.district="";
						$('#loc_city').html('<option value="">地级市</option>').change();
      			$('#loc_town').html('<option value="">市、县、区</option>').change();
					}
			});
			$('#loc_city').change(function() {
			    $('#loc_town').empty();
			    if($(this).val()){
			    	loc.fillOption('loc_town' , '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
			    }
			    $('#loc_town').change();
			    pageVM.searchPms.city = $(this).val() ? $(this).select2('data').text : '';
			});
			$('#loc_town').change(function() {
					
					pageVM.searchPms.district = $(this).val() ? $(this).select2('data').text : '';
			});

			$('#tplSlt').change(function() {
			    pageVM.searchPms.templateId = $.trim($(this).val());
			});
		},
		getDecList:function(){
			var pms = $.extend({}, pageVM.$model.searchPms),
					url = CONF.apiGetStoreTplList,
					$tbl = $('#decListTbl'),
					$tbdBox = $('#decListTbd'),
					$pageBox = $('#decListPagesNums');

			$tbl.uiLoading('lg');
			return $.post(url, pms)
			.done(function(data){
				if(data.status==='0'){
					var listData = data.result.storeTemplateVoList,
							count = data.result.count;

					$('#decListDataTotal').text(count);
					if(count>0){
						$tbdBox.html(template('list_dec_tpl', {data: listData}));

						$pageBox.pagination({
							totalData:count,
							showData:pms.length,
							coping:true,
							callback:function(i){
								pms.index = (i-1)*pms.length;
								$tbl.uiLoading('lg');
								$.post(url, pms)
								.done(function(data){
									$tbdBox.html(template('list_dec_tpl', {data: data.result.storeTemplateVoList}));
									$tbl.uiLoading('lg');
								});
							}
						});
					}else{
						$tbdBox.html('<tr><td colspan="4"><p class="p20 c-8 text-center"> 未查询到相关数据 </p></td></tr>');
						$pageBox.html('');
					}
				}else{
					toastr.error(data.errmsg || '服务器繁忙！');
				}
			})
			.always(function(){
				$tbl.uiLoading('lg');
				pageVM.searching = false;
			});
		},
		initDefaultTpl:function(){
			// 初始化默认模板
			 var dfd = $.Deferred();
			 $.post(CONF.apiGetDefConf)
			 .done(function(data){
			 	if(data.status==='0'){
			 		if(!data.result.templateInit){
			 			var defConf = (data.result.config && data.result.config.config) || JSON.stringify(DEF_CONF);
			 			$.post(CONF.apiInitDefaultTpl, {defaultConfig:defConf})
				 			.done(function(data){
				 				if(data.status!==0){ console.log('初始化模板成功！');}
				 			});
			 		}else{
		 				// 保存默认配置至本地localstrage
		 				window.localStorage && localStorage.setItem('defaultTpl',(data.result.config && data.result.config.config) || JSON.stringify(DEF_CONF));
			 		}
			 }}).always(function(){
			 		dfd.resolve();
			 });
			 return dfd;
		},
		initCategorysData:function(){
			var dfd = $.Deferred();
			$.post(CONF.apiGetCategoryList)
			.done(function(data){
				if(data.status==='0'){
					var res = data.result.categoryFamilyVoList.map(function(v, i){ 
						return {id:v.id, name:v.categoryFamily.familyName}; 
					})
					DEF_CONF['m1004'].autoPms.showListTypeInfo = res;
					$('#cacheCategoryData').data({'categorys': res});
					return dfd.resolve();
				}else{
					toastr.error(data.errmsg || ERRMSG['100']);
					return dfd.reject();
				}
				return dfd.reject();
			});
			return dfd;
		},
		getTplList:function(){
			var pms = {index:0, length:30},
					url = CONF.apiGetTplVoList,
					$tbl = $('#tplListTbl'),
					$tbdBox = $('#tplListTbd'),
					$pageBox = $('#tplListPagesNums');

			$tbl.uiLoading('lg');
			return $.post(url, pms)
			.done(function(data){
				if(data.status==='0'){
					var listData = data.result.templateVoList,
							count = data.result.count;

					$('#tplListDataTotal').text(count);
					if(count>0){
						$tbdBox.html(template('list_tpls_tpl', {data: listData}));

						$pageBox.pagination({
							totalData:count,
							showData:pms.length,
							coping:true,
							callback:function(i){
								pms.index = (i-1)*pms.length;
								$tbl.uiLoading('lg');
								$.post(url, pms)
								.done(function(data){
									$tbdBox.html(template('list_tpls_tpl', {data: data.result.templateVoList}));
									$tbl.uiLoading('lg');
								});
							}
						});
					}else{
						$tbdBox.html('<tr><td colspan="3"><p class="p20 c-8 text-center"> 未查询到相关数据 </p></td></tr>');
						$pageBox.html('');
					}
				}else{
					toastr.error(data.errmsg || '服务器繁忙！');
				}
			})
			.always(function(){
				$tbl.uiLoading('lg');
			});
		},
		changeTplEv:function(){
			var self = this;
			$('#listTbl1').on('click', '.btn-change-tpl', function(){
				var storeId = $(this).data('id'),
						tplId = $(this).data('tplid'), 
						data,
						len = CONF.tplListCache.length,
						$tplBox = $('#tplDiaInner'), storeInfo;
				
				// 判断是否有自定义模板配置
				// 如果没有，则添加一个
				var hasCustomerTpl = CONF.tplListCache.some(function(v){
					return v.templateType === 1;
				});
				if(!hasCustomerTpl){
					CONF.tplListCache = [{
						templateConfig: '',
						templateName: "自定义装修",
						templateType: 1,
					}].concat(CONF.tplListCache);
				}


				if(len<=3){
					data = CONF.tplListCache;
				}else{
					data = CONF.tplListCache.slice(0,3);
				}
				$tplBox.html(template('tplRender', {data:data, storeId:storeId, tplId:tplId}));

				if(CONF.storeCache['s'+storeId]){
					storeInfo = CONF.storeCache['s'+storeId];
					$('#tplRenderNavPages').pagination({
							totalData:len,
							coping:false,
							showData:3,
							callback:function(i){
								$tplBox.html(template('tplRender', {data:CONF.tplListCache.slice((i-1)*3,3*i), storeId:storeId}));
								$('.shop-view-wrap').renderShopConfig({
									storeInfo:storeInfo
								});
							}
					});

					tplDia= dialog({
						title:'选择模板',
						content:$('#tplDia')[0],
						width:1020,
						height:600,
						fixed: true,
						padding:0,
						onshow:function(){
							$('.shop-view-wrap').renderShopConfig({
								storeInfo:storeInfo
							});
						}
					}).showModal();
				}else{
					self.getStoreInfo(storeId).done(function(){
					storeInfo = CONF.storeCache['s'+storeId];
					$('#tplRenderNavPages').pagination({
							totalData:len,
							coping:false,
							showData:3,
							callback:function(i){
								$tplBox.html(template('tplRender', {data:CONF.tplListCache.slice((i-1)*3,3*i), storeId:storeId, tplId:tplId}));
								$('.shop-view-wrap').renderShopConfig({
									storeInfo:storeInfo
								});
							}
					});
					tplDia= dialog({
						title:'选择模板',
						content:$('#tplDia')[0],
						width:1020,
						height:600,
						fixed: true,
						padding:0,
						onshow:function(){
							$('.shop-view-wrap').renderShopConfig({
								storeInfo:storeInfo
							});
						}
					}).showModal();
					});
				}
			});
		},
		getStoreInfo:function(storeId){
			var dfd = $.Deferred();
			$.post('getStore.json',{storeId:storeId})
				.done(function(data){
					if(data.status==='0'){
						CONF.storeCache['s'+storeId] = data.store;
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
		useTplEv:function(){
			$('#tplDiaInner').on('click', '.btn-use-tpl', function(){
				$(this).uiLoading('sm');
				$.post();
				$(this).uiLoading('sm');
			});
		},
		editTplEv:function(){
			$('#tplDiaInner').on('click', '.btn-edit-tpl', function(){
				tplDia && tplDia.close();
				avalon.router.navigate('/decoration_edit?templateId='+$(this).data('tplid')+'&storeId='+$(this).data('storeid'));
			});
		},
		delTplEv:function(){
			// $('#tplListTbl').on('click', '.btn-del-tpl', function(){});
		},
		chkStoreEv:function(){
			// 全选、反选、单选
			$('#chkAllStore').on('click', function(){
				var chked = $(this).prop('checked');
				$('#decListTbd input[name="storeId"]').prop('checked', chked);
				$('#decListTbd tr').toggleClass('active', chked);
			});
			$('#decListTbd').on('click', 'tr', function(){
				var _this = $(this);
				_this.toggleClass('active');
				_this.find('input[name="storeId"]').prop('checked',_this.hasClass('active'));

				$('#chkAllStore').prop('checked',$('#decListTbd tr.active').length == $('#decListTbd tr').length);
			});
		},
		batchSetStoreTplEv:function(){
			$('#batchSetStoreTpl').on('click', function(){
				var storeIds = $('input[name="storeId"]','#decListTbd').serializeArray().map(function(v){return v.value;}).join('_');
				if(!storeIds){ return toastr.warning('请至少选择一个门店！'); }
				var data,$tplBox = $('#tplDiaInner'), storeInfo;
				var tplData = CONF.tplListCache.filter(function(v){
					if(v.templateType != 1) return v;
				});
				var len = tplData.length;
				if(tplData<=3){
					data = tplData;
				}else{
					data = tplData.slice(0,3);
				}
				$tplBox.html(template('tplRender', {data:data, storeId:storeIds, tplId:''}));
				$('#tplRenderNavPages').pagination({
						totalData:len,
						coping:false,
						showData:3,
						callback:function(i){
							$tplBox.html(template('tplRender', {data:tplData.slice((i-1)*3,3*i), storeId:storeIds, tplId:''}));
							$('.shop-view-wrap').renderShopConfig();
						}
				});
				tplDia = dialog({
					title:'选择模板',
					content:$('#tplDia')[0],
					width:1100,
					height:600,
					fixed: true,
					padding:0,
					onshow:function(){
						$('.shop-view-wrap').renderShopConfig();
					}
				}).showModal();
			});
		},
		setTpl2StoreEv:function(){
			var self = this;
			$('#tplDiaInner').on('click','.btn-use-tpl', function(){
				$(this).uiLoading('sm');
				var type = $(this).data('type'), 
						tplId = $(this).data('tplid'), 
						storeId=$(this).data('storeid');

				var pms = {
					storeId:storeId,
					templateId:tplId
				};

				if(!tplId){
					tplDia && tplDia.close();
					// 如果没有tplid，说明是门店第一次使用自定义模板，直接跳转至装修界面
					avalon.router.navigate('/decoration_edit?storeId='+storeId);
					return;
				}

				$.post(CONF.apiBatchSetStoreTpl, pms)
				.done(function(data){
					if(data.status==='0'){
						toastr.success('模板设置成功');
						tplDia && tplDia.close();
						if(type===1){
							avalon.router.navigate('/decoration_edit?templateId='+tplId+'&storeId='+storeId);
							return;
						}
						self.getDecList();
					}else{
						toastr.error(data.errmsg || ERRMSG['100']);
					}
					$('#chkAllStore').prop('checked',false);
				});
			})
		},
		setSiderbarStyleEv:function(){
			$('#btnSetSidebar').on('click', function(){
				var _this = $(this);
				_this.uiLoading('sm');
				$.post(CONF.apiSetSiderbarStyle, {displayType:$('#displayTypeSlt').val()})
				.done(function(data){
					if(data.status==='0'){
						toastr.success('菜单展示设置成功！')
					}else{
						toastr.error(data.errmsg || ERRMSG['100'])
					}
				}).always(function(){
					_this.uiLoading('sm');
				});
			});
			$('#displayTypeSlt').on('change', function(){
				$('.imgs-tip-box').children().hide().eq($(this).val()).show();
			})
		}
	}

	return {
		init:function(){
			page.init();
			avalon.scan($('#mainContent')[0]);
		}
	}
});


