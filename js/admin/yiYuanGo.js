(function(window, document,$){
	var chkProDia = MOD_SelectProsDia.init({
		sourceType:0
	});

	var p_yyg={
		o:{
			getOldYygListUrl:'getOneYuanPurchaseHistoryList.json',
			newYygPro:{},
			editDia:null
		},
		init:function(){
			this.addProEv();
			this.getCurrYygInfo();
			this.getOldYygList();
			this.offShelves();
		},
		addProEv:function(){
			var self = this, o = this.o;
			$('#yyg_btnSetPro1,#yyg_btnSetPro2').on('click', function(){
				chkProDia.show(function(res){
					var c = 0, currProId = 0;
					for(var i in res){
						if(res[i]) c++;
					}
					if(c>1){
						Util.alert('只能选择一个商品参与活动！');
						return false;
					}else if(c==0){
						return true;
					}else{
						// 保存选择的商品id 到隐藏域中
						for(var k in res ){
							if(res[k]){
								currProId = res[k].stockId;
								break;
							}
						}
						$('#hidNewProId').val(currProId);
						setTimeout($.proxy(self.showEditeYygFrm, self),500);
					}
				});
			});
		},
		showEditeYygFrm:function(){
			var newProId = $('#hidNewProId').val(),o = this.o, self = this;
			if(newProId){
				$.getJSON('querySupplierStockById.json',{stockId:newProId}, function(data){
					console.log(data);
					if(data.status==='0'){
						if(data.result.stockVo){
							o.newYygPro = data.result;
							// 加载数据到模板
							var str = template('editeYygTpl',{data:data.result.stockVo});
							$('#yygEditeForm').html(str);
							o.editDia = dialog({
								title:'一元购活动设置',
								content:$('#yygEditeForm')[0]
							}).width(750).showModal();

							// 验证事件
							// 确定事件
							$.proxy(self.saveYygInfo(), self);
						}else{
							// console.log('未获取到商品数据');
						}
					}else{
						Util.alert('系统繁忙，请稍后再试！');
					}
				});
			}
		},
		getCurrYygInfo:function(){
			var o = this.o, self = this;
			$.getJSON('querySupplierStock.json', {tags:'一元购', index:0, length:30, status:'0'},function(data){
				if(data.status==='0'){
					if(data.result.stockVoList.length>0){
						$('#hidOldProId').val(data.result.stockVoList[0].stock.productId);
						console.log(data.result.stockVoList);
						$('#yygTbl tbody').html(template('newYygTpl', {
							data:[data.result.stockVoList[0]],
							oCount:0
						}));
						$("#yygTbl").setTheadFixed();
						setTimeout(function(){
							self.getCurrCusmNum();
						}, 50);
					}else{
						$('#yygTbl tbody').html('<tr><td colspan="8" class="tc"><span class="c-8">暂无一元购活动商品&emsp;</span></td></tr>');
					}
				}else{
					Util.alert('系统繁忙，请稍后再试！');
				}
			});
		},
		getOldYygList:function(){
			var o = this.o, self = this;
			$.getJSON('getOneYuanPurchaseHistoryList.json',{index:0,length:30}, function(data){
				if(data.status==='0'){
					if(data.result.stockOneYuanPurchaseVos.length>0){
						$('#yygOldListTbl tbody').html(template('oldYygListTpl', {data:data.result.stockOneYuanPurchaseVos}));
						$('#yygOldListBox').show();
					}else{
						$('#yygOldListBox').hide();
					}
				}else{
					Util.alert('系统繁忙，请稍后再试！')
				}
			});
		},
		saveYygInfo:function(){
			var o = this.o, self = this;
			
			$('#btnSaveYygInfo').off().on('click',function(){
				if($('#btnSaveYygInfo').find('input.n-invalid').length>0) return false;
			   	var _pName = $('#productName').val(),
			   		_delivery = $('#limitDelivery').val(),
			   		skusP=[];

			   $('#yygSkuTbl tbody tr').each(function(){
			   		skusP[$(this).data('skuid')] = $(this).find('input').val();
			   });	

			   //设置新的价格
			   for(var k in o.newYygPro.stockVo.stockSkuVoList){
			   	o.newYygPro.stockVo.stockSkuVoList[k]['stockSku']['skuPrice'] =  skusP[o.newYygPro.stockVo.stockSkuVoList[k]['stockSku']['skuId']];
			   }
			   var skuListJson = [];
			   for(var j in o.newYygPro.stockVo.stockSkuVoList){
			   	skuListJson.push({
			   		"color":o.newYygPro.stockVo.stockSkuVoList[j]['productSku']['color']||'',
			   		"size":o.newYygPro.stockVo.stockSkuVoList[j]['productSku']['size']||'',
			   		"skuCount":o.newYygPro.stockVo.stockSkuVoList[j]['stockSku']['skuCount']||0,
			   		"shapeCode":o.newYygPro.stockVo.stockSkuVoList[j]['productSku']['shapeCode']||'',
			   		"skuPrice":o.newYygPro.stockVo.stockSkuVoList[j]['stockSku']['skuPrice']||0,
			   		"skuId":o.newYygPro.stockVo.stockSkuVoList[j]['stockSku']['skuId']||0
			   	});
			   }
			   var data ={
				   	stockId:o.newYygPro.stockVo.stock.id,
				   	productName:_pName,
				   	couponDisable:0,
				   	tags:'一元购',
				   	norms1Id: o.newYygPro.productNorms1 && o.newYygPro.productNorms1.id || '',
				   	norms2Id: o.newYygPro.productNorms2 && o.newYygPro.productNorms2.id || '',
				   	familyId:o.newYygPro.categoryFamily.id,
				   	categoryId:o.newYygPro.stockVo.product.categoryId,
				   	brandId:o.newYygPro.stockVo.product.brandId,
				   	productCode:o.newYygPro.stockVo.product.productCode,
				   	tagPrice:o.newYygPro.stockVo.stock.tagPrice,
				   	productPicUrl:o.newYygPro.stockVo.stock.productPicUrl,
				   	limitDelivery:_delivery,
				   	limitCount:1,
				   	commissionType:o.newYygPro.stockVo.productSupplier.commissionType,
				   	commissionRate:o.newYygPro.stockVo.productSupplier.commissionRate,
				   	description:o.newYygPro.stockVo.productSupplier.description,
				   	previewJson:o.newYygPro.stockVo.productSupplier.previewJson,
				   	stockSkuListJson:JSON.stringify(skuListJson)
			   };

			   if(o.newYygPro.stockVo.productSupplier.commissionType==2 || o.newYygPro.stockVo.productSupplier.commissionType==3){
			   	data.commission_rate = o.newYygPro.stockVo.productSupplier.commission_rate;
			   }else if(o.newYygPro.stockVo.productSupplier.commissionType==3){
			   	data.commissionValue = o.newYygPro.stockVo.productSupplier.commissionValue;
			   }
			   
			   if($('#hidStatus').val()=='1'){
	   		   		// 设置新的一元购商品
	   	   		   $.post('updateSupplierStock.json',data,function(res){
	   	   			   	// 编辑成功
	   	   			   	o.editDia.close();
	   	   			   	if(res.status==='0'){
	   	   			   		var stockId = res.result.stockId;
	   	   			   		if(stockId){
	   	   			   			// 提示设置成功！
	   	   			   			$.getJSON('querySupplierStockById.json',{
	   	   			   				stockId:stockId,
	   	   			   				tags:'一元购'
	   	   			   			},function(data){
	   	   			   				console.log(data);
	   	   			   				if(data.status === '0'){
	   	   			   					$('#hidOldProId').val(data.result.stockVo.stock.productId);
	   	   			   					$('#yygTbl tbody').html(template('newYygTpl', {
	   	   			   						data:[data.result.stockVo],
	   	   			   						oCount:data.oneYuanPurchasecustomerCount
	   	   			   					}));
	   	   			   					Util.alert('设置成功！');
	   	   			   				}else{
	   	   			   					// console.log('未获取到更新后的商品数据！');
	   	   			   				}
	   	   			   			});
	   	   			   		}else{
	   	   			   			// console.log('没有返回商品ID');
	   	   			   		}
	   	   			   	}else{
	   	   			   		Util.alert('服务器繁忙，请稍候重试！');
	   	   			   	}
	   	   		   });
			   }else{
				   // 下架旧的一元购商品
				   $.post('setStatus.json',{productIdList:$('#hidOldProId').val(), status:1},function(resData){
				   	// 如果下架成功，则设置新的一元购商品
				   	if(resData.status === '0'){
				   		// 清空tags标签
				   		$.post('setProductTag.json',{productIdList:$('#hidOldProId').val(), tags:''},function(d){
				   			if(d.status==='0'){
	   					   		// 设置新的一元购商品
	   				   		   $.post('updateSupplierStock.json',data,function(res){
	   				   			   	// 编辑成功
	   				   			   	o.editDia.close();
	   				   			   	if(res.status==='0'){
	   				   			   		var stockId = res.result.stockId;
	   				   			   		if(stockId){
	   				   			   			// 提示设置成功！
	   				   			   			$.getJSON('querySupplierStockById.json',{
	   				   			   				stockId:stockId,
	   				   			   				tags:'一元购'
	   				   			   			},function(data){
	   				   			   				if(data.status === '0'){
	   				   			   					$('#hidOldProId').val(data.result.stockVo.stock.productId);
	   				   			   					$('#yygTbl tbody').html(template('newYygTpl', {
	   				   			   						data:[data.result.stockVo],
	   				   			   						oCount:data.oneYuanPurchasecustomerCount
	   				   			   					}));
	   				   			   					Util.alert('设置成功！');
	   				   			   				}else{
	   				   			   					// console.log('未获取到更新后的商品数据！');
	   				   			   				}
	   				   			   			});
	   				   			   		}else{
	   				   			   			// console.log('没有返回商品ID');
	   				   			   		}
	   				   			   	}else{
	   				   			   		Util.alert('服务器繁忙，请稍候重试！');
	   				   			   	}
	   				   		   });
	   					   		

				   			}else{
				   				// console.log('清空tags标签失败！');
				   			}
				   		});
				   	}else{
				   		// console.log('一元购商品下架失败！');
				   	}
				   });
			   }
			});
		},
		offShelves:function(){
			$('#yygTbl').on('click','.offShelves',function(){
				if($('#hidStatus').val()=='1'){
					Util.alert('商品已经下架！');
					return false;
				}else{
					$.post('setStatus.json',{productIdList:$('#hidOldProId').val(), status:1},function(resData){
						// 如果下架成功，则设置新的一元购商品
						if(resData.status === '0'){
							// 清空tags标签
							$.post('setProductTag.json',{productIdList:$('#hidOldProId').val(), tags:''},function(d){
								if(d.status==='0'){
									Util.alert('下架成功！');
									$('#hidStatus').val('1');
									$('#yygTbl tbody').html('<tr><td colspan="7" class="tc"><span class="c-8">暂无一元购活动商品&emsp;</span></td></tr>');
									// $('#yygCode').append('<span class="badge red ml5">已下架</span>');
								}
							});
						}
					});
				}
			});
		},
		getCurrCusmNum:function(){ //获取当前一元购活动的用户数
			var pId = $('#hidOldProId').val();
				$.getJSON('getOneYuanPurchaseCurrent.json',{productId:pId}, function(data){
						if(data.status ==='0'){
							$('#ccc'+pId).text(data.result.oneYuanPurchasecustomerCount||0);
						}else{
							// console.log('获取当前一元购用户数失败！');
						}
					}
			);
		}
	};

	p_yyg.init();

})(window, document, jQuery);
