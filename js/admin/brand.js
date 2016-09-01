/**
 * 品牌 列表页
 */
var brandConf, brandInfoVM, p_brand, creatDia, editeDia, isEdite=false;

brandConf = {
	createProductBrandUrl:'createProductBrand.json',
	getBrandListUrl:'getBrandListByCategoryFamilyId.json',
	getBrandListd:'getBrandListd.json',
	updateProductBrand:'updateProductBrand.json',
	editeProductBrandUrl:'',
	brandListCache:[]
};


p_brand = {
	init:function(){
		this.addBrandEv(); 		//添加 品牌
		this.searchBrandEv(); 	//搜索 品牌
		this.editeBrandEv(); 	//编辑 品牌
		this.initUploader(); 	//初始化上传控件
		this.validatorFrm(); 	//初始化表单验证

		this.getBrandList(); 	//获取品牌信息列表
		this.initCategoryList();//获取所有品类
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
			brandInfo:brandInfo
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
		    	 frmData.categoryFamilyIdList = frmData.categoryFamilyIdList.join('_');

		    	 self.saveBrand(frmData);
		    }
		});
	},
	addBrandEv:function(){
		$('#addBrandBtn').on('click', function(){
			isEdite = false;
			// 清空表单
			$('#addBrandDia')[0].reset();
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
			
			var brandId = $(this).data('brandid');
			var brandData = $.map(brandConf.brandListCache,function(item){
				 if(item.id == brandId){ return item;}
			});

			brandInfoVM.brandInfo = brandData[0];

			dialog({
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
	saveBrand:function(frmData){
		var self = this;
		var url = isEdite ? brandConf.updateProductBrand : brandConf.editeProductBrandUrl;
		// ==================
		$.post(url, frmData).done(function(data){
			if(data.status === '0'){
				creatDia.close();
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
		});
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
			fuzzyKeyword:pms && pms.fuzzyKeyword || ''
		};
		$.post(brandConf.getBrandListd, pms).done(function(data){
			if(data.status === '0'){
				var d = data.result.productBrandList;
				if(d.length){
					brandConf.brandListCache = data.result.productBrandList;
					$('#brandListTbd').html(template('brandListTpl',{data:d}));
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
		$.post('getAllCategoryFamily.json').done(function(data){
			if(data.status === '0'){
				var d = data.result.categoryFamilyList;
				if(d.length){
					var tD = [];
					for(var x in d){
						tD.push({id:d[x].id, text:d[x].familyName});
					}
					self.renderCategoryToSelect([{id:'', text:'所有品牌'}].concat(tD));
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

p_brand.init();
