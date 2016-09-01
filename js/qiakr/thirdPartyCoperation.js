define(['qiakr/base_old','validate','select2_3','twbsPagination'],function(){

	var CONF, 
		p_thirdParty, 
		creatDia, 
		editeDia, 
		searchDataCache,
		isEdite = false;

	CONF = {
		getStoreListBySupplierId:'getStoreListBySupplierId.json',
		getSupplierAuthList:'getSupplierAuthList.json',
		getZhimaSupplierList:'getZhimaSupplierList.json',
		getZhimaSupplier:'getZhimaSupplier.json?index=0&length=999',
		insertZhimaGroup:'insertZhimaGroup.json',
		deleteZhimaGroup:'deleteZhimaGroup.json',
		updateZhimaSupplierInfo:'updateZhimaSupplierInfo.json'
	};


	p_thirdParty = {
		init:function(){
			this.creatMenue();
			this.initSelect();
			this.validatorFrm();
			this.getList();

			this.addEv();
			this.addStoreInfoEv();
			this.searchEv();
			this.updateEv();
			this.editeGroupEv();
			this.deleteGroupEv();
		},
		creatMenue:function(){
			Util.createSecondMenu([
			    {"name":"芝麻设备管理","url":"thirdPartyCoperation.htm"}
			],"芝麻设备管理");
		},
		initSelect:function(){
			// 获取商户列表并初始化下拉列表
			// index=0&length=10&applyTimeStart=0&applyTimeEnd=9234567890123&auth=1&wechatAuth=1&keywords=%E6%88%91%E4%BB%AC
			var self = this;
			var pms = {
				index: 0,
				length: 99999
			};
			$.post(CONF.getSupplierAuthList, pms).done(function(data){
				// console.log('商户列表');
				// console.log(data);

				var d = data.result.supplierAuthVoList;
				if(!d.length)
					return false;
				var sltData=[];
				for(var i in d){
					if(d[i]['supplier']['id'] && d[i]['supplier']['companyName']){
						sltData.push({
							id:d[i]['supplier']['id'],
							text:d[i]['supplier']['companyName']
						});
					}
				}

				$('#suplierSltDia').select2({
				  data: sltData
				}).val(sltData[0].id).trigger('change');

				$.post(CONF.getStoreListBySupplierId,{supplierId:sltData[0].id}).done(function(data){
					if(data.status==='0'  ){
						var d = data.result.storeList;
						if(d.length){
							var storeData = [], firstV=d[0].id;
							for(var i in d){
								storeData.push({
									id:d[i]['id'],
									text:d[i]['name']
								});
							}
							$('#sltStore').select2({
								data:storeData
							}).val(firstV).trigger('change');

						}else{
							$('#sltStore').select2({
								data:[{id:'',text:'暂无数据'}]
							}).val('').trigger('change');
						}
					}
				}).fail();



				$('#suplierSltDia').on('change', function(){
					// 显示 选择门店 查询门店 重新初始化门店下拉框
					var v = $(this).val();
					if(v && v>0){
						$.post(CONF.getStoreListBySupplierId,{supplierId:v}).done(function(data){
							if(data.status==='0'  ){
								var d = data.result.storeList;
								if(d.length){
									var storeData = [], firstV=d[0].id;
									for(var i in d){
										storeData.push({
											id:d[i]['id'],
											text:d[i]['name']
										});
									}
									$('#sltStore').select2({
										data:storeData
									}).val(firstV).trigger('change');
								}else{
									$('#sltStore').select2({
										data:[{id:'',text:'该商户下暂无门店'}]
									}).val('').trigger('change');
								}
							}
						}).fail();
					}
				});

			}).fail();
		},
		validatorFrm:function(){
			var self = this;
			$("#addSupplierDia").validate({
			    rules: {
			        supplierId: 'required',
			        appKey:"required",
			        appSecret:'required',
			        storeId:'required',
			        group:'required',
			    },
			    messages: {
			        supplierId:"请选择商户",
			        appKey:"不能为空",
			        appSecret:'不能为空',
			        storeId:'请选择店铺',
			        group:'不能为空'
			    },
			    errorPlacement: function(error, element) {
			    	error.appendTo( element.closest('li').find('.v-error'));
				},
			    submitHandler:function(form){
			    	 var frmData = $(form).serializeObject();
			    	 if(!frmData.storeId){
			    	 	Util.alert('请选择相关店铺！');
			    	 	return false;
			    	 }
			    	 self.save(frmData);
			    }
			});
		},
		addEv:function(){ /* 添加商户 */
			$('#addSupplierBtn').on('click', function(){
				isEdite = false;
				// 清空表单
				var $frm = $('#addSupplierDia');
				$frm.find('[name="appKey"]').val('');
				$frm.find('[name="appSecret"]').val('');
				$frm.find('[name="group"]').val('');

				creatDia = dialog({
					title:'添加商户',
					content:$('#addSupplierDia')[0],
					cancelValue: '关闭',
				    cancel: function () {
				    	this.close();
				    }
				}).width(600).showModal();
			});
		},
		addStoreInfoEv:function(){ /* 新增门店 */
			$('#addStroeBtn').on('click', function(){
				$("#addSupplierDia").submit();
			});
		},
		updateEv:function(){
			var self = this;

			$('#supplierListTbd').on('click','.edite', function(){
				isEdite = true;
				// 清空表单
				var $frm = $('#addSupplierDia');
				$frm.find('[name="appKey"]').val('');
				$frm.find('[name="appSecret"]').val('');
				$frm.find('[name="group"]').val('');
				
				var sId = $(this).data('id'), $brandEdite = $('#addSupplierDia');

				self.getGroupList(sId, function(){
					editeDia = dialog({
						title:'编辑',
						content:$('#addSupplierDia')[0],
						cancelValue: '关闭',
					    cancel: function () {
					    	this.close();
					    }
					}).width(600).showModal();
				});
			});
		},
		getGroupList:function(sId, callback){
			var pms = {
				supplierId:sId,
				index:0,
				length:9999
			}
			$.post(CONF.getZhimaSupplier, pms).done(function(data){
				// console.log(data);
				if(data.status === '0'){
					var d = data.result.zhimaGroupList;
					if(d.length){
						$('#groupTbd').html(template('groupListTpl',{data:d}));
					}else{
						$('#groupTbd').html('<tr><td colspan="5" class="tc c-8">暂无店铺数据！</td></tr>');
					}

					callback && callback();
				}
			}).fail();
		},
		editeGroupEv:function(){
			$('#groupTbd').on('click','.edite', function(){
				var $this = $(this);
				var $tr = $this.closest('tr');
				if($tr.hasClass('editing')){
					// 保存
					var $groupTxt = $tr.find('.txt-group');
					var $appKeyTxt = $tr.find('.txt-appKey');
					var $appSecretTxt = $tr.find('.txt-appSecret');

					var pms = {
							group:$tr.find('[name="g-group"]').val().trim(),
							appKey:$tr.find('[name="g-appKey"]').val().trim(),
							appSecret:$tr.find('[name="g-appSecret"]').val().trim(),
							supplierId:$tr.data('suid')
					}
					if(pms.appKey && pms.appSecret){
						$.post(CONF.updateZhimaSupplierInfo,pms)
						.done(function(data){
							if(data.status==='0'){
								Util.alert('编辑成功！');
								$appKeyTxt.text(pms.appKey);
								$appSecretTxt.text(pms.appSecret);
								$groupTxt.text(pms.group);

								$this.text('编辑');
								$tr.removeClass('editing');
							}else{
								Util.alert(data.errmsg || '编辑失败！');
							}
						}).fail(function(){
							Util.alert('编辑失败！');
						});
						
					}else{
						Util.alert('输入不能为空！');
					}
					
				}else{
					$this.text('保存');
					$tr.addClass('editing')
				}
			});
		},
		deleteGroupEv:function(){
			$('#groupTbd').on('click','.delete', function(){
				var $this = $(this);
				var gId = $this.data('id');
				var $tr = $this.closest('tr');
				$.post(CONF.deleteZhimaGroup, {id:gId}).done(function(data){
					// console.log(data);
					if(data.status==='0'){
						Util.alert('删除成功！');
						$tr.fadeOut(500,function(){
							$tr.remove();
							setTimeout(function(){
								if($('#groupTbd tr').length==0){
									$('#groupTbd').html('<tr><td colspan="5" class="tc c-8">暂无店铺数据！</td></tr>');
								}
							}, 200);
						});
					}else{
						Util.alert(data.errmsg || '删除失败！');
					}
				});
			});
		},
		save:function(data){
			// console.log('保存');
			// console.log(data);

			var self = this, sId = data.supplierId;
			$.post(CONF.insertZhimaGroup, data).done(function(data){
				if(data.status==='0'){
					Util.alert('数据保存成功！');
					self.getGroupList(sId);
					self.getList();

					// 清空表单
					var $frm = $('#addSupplierDia');
					$frm.find('[name="appKey"]').val('');
					$frm.find('[name="appSecret"]').val('');
					$frm.find('[name="group"]').val('');

				}else{
					Util.alert(data.errmsg || '数据保存失败！');
				}
			}).fail();
		},
		searchEv:function(){
			var self = this;
			$('#searchSupplierBtn').on('click', function(){
				if($('#supplierKey').val().trim()==''){
					Util.alert('请输入搜索关键词！');
				}else{
					self.getList();
				}
			});
		},
		getList:function(){
			var pms = {
				index:0,
				length:10,
				keywords:$('#supplierKey').val()||''
			};
			$.post(CONF.getZhimaSupplierList, pms).done(function(data){
				// console.log('商户列表');
				// console.log(data);

				if(data.status === '0'){
					var d = data.result.zhimaSupplierList;
					if(d.length){
						searchDataCache = d;
						// 渲染
						$('#supplierListTbd').html(template('supplierListTpl',{data:d}));

						// 分页
						var totalP = Math.ceil(data.result.count/pms.length);
						if(totalP>1){
							$('#navPagesNumBox').data({'opt':pms, 'url':CONF.getZhimaSupplierList});

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
							            searchDataCache = data.result.zhimaSupplierList;
							           $('#supplierListTbd').html(template('supplierListTpl',{data:searchDataCache}));
							        });
							    }
							});
						}
					}else{
						$('#supplierListTbd').html('<tr><td colspan="4" class="tc c-8">未查询到相关数据</td></tr>');
					}
				}else{
					Util.alert(data.errmsg || '数据返回失败！');
				}
			}).fail(function(){Util.alert('服务器繁忙，请稍候重试！');});
		}
	}

	return {
		init: function(){
			p_thirdParty.init();
		}
	}
});