/**
 * 品牌 列表页
 */
define(['qiakr/base_old','avalon','validate','select2_3','tool/uploader','twbsPagination'],function(){
	var brandConf, 
		brandInfoVM, 
		p_brand, 
		creatDia, 
		editeDia, 
		cacheIds=[],
		isEdite = false;

	brandConf = {
		getAllCategoryFamily:'getAllCategoryFamily.json',
		createProductBrandUrl:'createProductBrand.json',
		getBrandListUrl:'getBrandListByCategoryFamilyId.json',
		getBrandList:'getBrandList.json',
		updateProductBrand:'updateProductBrand.json',
		brandListCache:[]
	};

	p_brand = {
		init:function(){
			this.creatMenue();
			this.addBrandEv(); 		//添加 品牌
			this.searchBrandEv(); 	//搜索 品牌
			this.editeBrandEv(); 	//编辑 品牌
			this.initUploader(); 	//初始化上传控件
			this.validatorFrm(); 	//初始化表单验证

			this.getBrandList(); 	//获取品牌信息列表
			this.initCategoryList();//获取所有品类
		},
		creatMenue:function(){
			Util.createSecondMenu([
			    {"name":"品牌库","url":"brand.htm"}
			],"品牌库");
		},
		initBrandInfoVM:function(brandInfo){
			brandInfo = brandInfo || {
				id:'',
				brandLogo: "",
				brandName: "",
				brandPriority: 0,
				brandRegistNumber: "",
				categoryFamilyIdList:'',
				status: 0
			};

			brandInfo.categoryFamilyIdList = brandInfo.categoryFamilyIdList.split('_');
			brandInfoVM = avalon.define({
				$id:'brandInfoCtr',
				brandInfo:brandInfo,
				chkAllEv:function(){
					var chked = $(this).prop('checked');
					if(chked){
						brandInfoVM.brandInfo.categoryFamilyIdList.clear().pushArray(cacheIds);
						console.log(brandInfoVM.brandInfo.categoryFamilyIdList);
					}else{
						brandInfoVM.brandInfo.categoryFamilyIdList.clear();
					}
				}
			});
			avalon.scan($('#addBrandDia')[0]);
		},
		validatorFrm:function(){
			var self = this;
			$("#addBrandDia").validate({
			    rules: {
			        brandName: {
			            required: true,
			            maxlength: 30
			        },
			        brandLogo:{
			            required: false
			        },
			        brandRegistNumber:{
			            number: true
			        },
			        categoryFamilyIdList:'required',
			        brandPriority:{
			            required: true,
			            number: true
			        },
			        status:"required"
			    },
			    messages: {
			        brandName: {
			            required: "请输入品牌名称",
			            maxlength: "最长30个字"
			        },
			        brandLogo:{
			            required:"请上传品牌LOGO"
			        },
			        brandRegistNumber:{
			            number: "请填写数字"
			        },
			        categoryFamilyIdList:'请选择相关品类',
			        brandPriority:{
			            required: "请填写排序值",
			            number: "请填写数字"
			        }
			    },
			    errorPlacement: function(error, element) {
			    	error.appendTo( element.closest('td').find('.v-error'));
				},
			    submitHandler:function(form){
			    	 var frmData = $(form).serializeObject();
			    	 if($.isArray(frmData.categoryFamilyIdList)){
			    	 	frmData.categoryFamilyIdList = frmData.categoryFamilyIdList.join('_');
			    	 }
			    	 self.saveBrand(frmData);
			    }
			});
		},
		addBrandEv:function(){
			$('#addBrandBtn').on('click', function(){
				isEdite = false;
				// 清空表单
				$('#addBrandDia')[0].reset();
				$('#logoUpload').css('backgroundImage','none');
				creatDia = dialog({
					title:'添加品牌',
					content:$('#addBrandDia')[0],
					okValue: '确定',
					   ok: function () {
							$("#addBrandDia").submit();
					       return false;
					   },
					cancelValue: '取消',
				    cancel: function () {
				    	this.close();
				    }
				}).width(600).showModal();
			});
		},
		editeBrandEv:function(){
			$('#brandListTbd').on('click','.brand-edite', function(){
				isEdite = true;
				$("#addBrandDia")[0].reset();
				
				var brandId = $(this).data('brandid'), $brandEdite = $('#addBrandDia');
				var brandData = $.map(brandConf.brandListCache,function(item){
					 if(item.id == brandId){ return item;}
				});
				if(!$.isArray(brandData[0].categoryFamilyIdList)){
					brandData[0].categoryFamilyIdList =brandData[0].categoryFamilyIdList.split('_');
				}

				brandInfoVM.brandInfo = brandData[0];

				editeDia = dialog({
					title:'编辑品牌',
					content:$('#addBrandDia')[0],
						okValue: '确定',
						   ok: function () {
								$("#addBrandDia").submit();
						       return false;
						   },
						cancelValue: '取消',
					    cancel: function () {
					    	this.close();
					    }
				}).width(600).showModal();
			});
		},
		saveBrand:function(frmData){ /*保存 品牌信息*/
			var self = this;
			var url = isEdite ? brandConf.updateProductBrand : brandConf.createProductBrandUrl;

			$.post(url, frmData).done(function(data){
				if(data.status === '0'){
					(creatDia || editeDia).close();
					var pms = {
						categoryFamilyId:$('#categorySlt').val(),
						status:$('#brandStatus').val(),
						fuzzyKeyword:$.trim($('#brandFuzzyName').val())
					};
					// 刷新列表
					self.getBrandList(pms);
				}else{
					Util.alert('数据保存失败，请重试！');
				}
			}).fail(function(){
				Util.alert('数据保存失败，服务器繁忙！');
			})
		},
		searchBrandEv:function(){
			var self = this;

			$('#searchBrandBtn').on('click', function(){
				var pms ={
					categoryFamilyId:$('#categorySlt').val(),
					status:$('#brandStatus').val(),
					fuzzyKeyword:$.trim($('#brandFuzzyName').val())
				};
				self.getBrandList(pms);
			});
		},
		getBrandList:function(pms){
			var pms = {
				categoryFamilyId:pms && pms.categoryFamilyId || '',
				status:pms && pms.status || '',
				index:0,
				length:30,
				fuzzyKeyword:pms && pms.fuzzyKeyword || ''
			}
			$.post(brandConf.getBrandList, pms).done(function(data){
				if(data.status === '0'){
					var d = data.result.productBrandList;
					if(d.length){
						brandConf.brandListCache = data.result.productBrandList;
						$('#brandListTbd').html(template('brandListTpl',{data:d}));

						// 分页
						var totalP = Math.ceil(data.result.total/pms.length);
						if(totalP>1){
							$('#navPagesNumBox').data({'opt':pms, 'url':brandConf.getBrandList});

							// 初始化页码选择事件
							$('#navPagesNumBox').data('twbs-pagination','').off().empty().twbsPagination({
							    totalPages: totalP,
							    startPage: 1,
							    visiblePages: 10,
							    onPageClick:function(e, num){
							        // 异步获取数据并渲染 
							        var info = $('#navPagesNumBox').data(),
							            opt = info.opt,
							            postUrl = info.url;
							        opt.index = (num-1)*opt.length;
							        
							        $.ajax({
							            url:postUrl,
							            data:opt,
							            method:'POST'
							        }).done(function(data){
							            // 渲染数据
							            brandConf.brandListCache = data.result.productBrandList;
							           $('#brandListTbd').html(template('brandListTpl',{data:data.result.productBrandList}));
							        });
							    }
							});
						}
					}else{
						$('#brandListTbd').html('<tr><td colspan="6" class="tc c-8">未查询到相关数据</td></tr>');
					}
				}else{

				}
			}).fail(function(){
				Util.alert('服务器繁忙，请稍候重试！');
			});
		},
		initCategoryList:function(){
			var self = this;
			$.post(brandConf.getAllCategoryFamily).done(function(data){
				if(data.status === '0'){
					var d = data.result.categoryFamilyList;
					if(d.length){
						var tD = [];
						for(var x in d){
							tD.push({id:d[x].id, text:d[x].familyName});
							cacheIds.push(d[x].id+'');
						}
						self.renderCategoryToSelect([{id:'', text:'所有品类'}].concat(tD));
						self.renderCategoryToCheckboxs(tD);

						// 初始化VM
						self.initBrandInfoVM();
					}else{
						
					}
				}else{

				}
			}).fail(function(){
				Util.alert('服务器繁忙，请稍候重试！');
			});
		},
		initUploader:function(){
			$("#logoUpload").singleImgUploader({
			    resultInput : $("#brandLogo")
			});
		},
		renderCategoryToSelect:function(categoryData){
			$('#categorySlt').select2({data: categoryData}).val('').trigger('change');
		},
		renderCategoryToCheckboxs:function(categoryData){
			$('#categoryChkBox').html(template('categroyChkTpl', {data: categoryData}));
		}
	};
	
	return {
		init:function(){
			p_brand.init();
		}
	};
});
