// customerServiceList
define(['utils','datePicker'],function(utils){
	var page={
		o:{
			exportBtnList:[],
			expressList:[]
		},
		init:function(){
			$("select.select").select2({
				minimumResultsForSearch: -1
			});
			this.searchEv(); //筛选
			this.showSetCusServiceTipEv(); //设置售后提示
			this.tabSwitchEv(); //选项卡切换
			this.handingCusServiceEv(); //处理售后
			this.getCusServiceDetailEv(); //获取售后详情
			this.exportCusServiceListEv(); //导出售后订单
			var orderCode = utils.getUrlParam('orderCode');
			if(orderCode){
				$('#fuzzyCode').val(orderCode);
			}
			this.getServiceList({pagination:true}, orderCode);
			this.getStoreList();
			$('#sltStore').on('change',function(){
				page.getSalesListById($(this).val());
			});
		},
		getServiceList:function(options, orderCode){
			var self = this;
			$("#serviceListTbd").html('<tr><td colspan="99" class="text-center"><img src="../images/admin/loading.gif" /></td></tr>');
			options = options||{};
			options.index = options.index||0;
			options.length = options.length||utils.listLength;
			options.dateType = options.dateType||"create";
			options.orderCode = options.orderCode;
			$.post("getServiceOrderVoList.json", options).done(function(data){
				if(data.status === '0'){
					var tplData={
						list:data.result.serviceOrderVoList,
						supplierId:$("#supplierId").val()
					}
					if(!tplData.list.length){
						$("#serviceListTbd").html('<tr><td colspan="99" class="text-center">暂无数据</td></tr>');
						return;
					}
					var dataHtml = template('serviceListTpl', tplData);
					$("#serviceListTbd").empty().append(dataHtml);
					if(options.pagination){
						$(".tabs .active .count").html('('+data.result.count+')');
						$('#pagination').pagination({
							totalData:data.result.count,
							showData:options.length,
							callback:function(i){
								options.pagination=false;
								options.index=(i-1)*options.length;
								page.getServiceList(options);
							}
						});
					}
				}else{
					utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
				}
			}).fail(function(data){
				utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
			});
		},
		searchEv:function(){
			$("#searchOrderBtn").on("click",function(){
				var options = $(".search-form-wrap").serializeObject();
				options.gmtCreateStart = utils.getUnixTime($("#dateStart").val());
				options.gmtCreateEnd = utils.getUnixTime($("#dateEnd").val());
				options.storeId = options.storeId==999 ? "" : options.storeId;
				options.salesId = options.salesId==999 ? "" : options.salesId;
				options.pagination = true;
				page.getServiceList(options);
			});
		},
		tabSwitchEv:function(){
			$(".tabs .tab a").on("click",function(){
				var status = $(this).data("status");
				$("#orderStatus").val(status);
				page.getServiceList({
					status:status,
					pagination:true
				});
			})
		},
		showSetCusServiceTipEv:function(){
			$('#setCusServiceTipBtn').on('click', function(){
				var d = dialog({
					title:'设置售后须知',
					width:500,
					content:'<textarea col="30" row="10" class="service-tip-txt c-8 f12" placeholder="请输入售后说明...">'+$('#cusServiceInfoTxt').html()+'</textarea>',
					ok:function(){
						var $this = $(this.node);
						var str = $this.find('.service-tip-txt').val();

						$.post("updateServiceOrderInfo.json",{ serviceOrderInfo: str}).done(function(data){
							if(data.status === '0'){
								d.close();
								$('#cusServiceInfoTxt').html(str);
							}else{
								utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
							}
						}).fail(function(data){
							utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
						});
					},
					okValue:'确定',
					cancel:function(){},
					cancelValue:'取消'
				}).showModal();
			})
		},
		handingCusServiceEv:function(){
			$('#serviceListTbd').on('click', '.record', function(){
				var oId = $(this).data('id');
				$.post("getServiceOrderVoByItemId.json", {customerOrderItemId: oId}).done(function(data){
					if(data.status === '0'){
						var d = dialog({
							title:'售后详情',
							width:700,
							content:template('serviceDetailTpl', data.result),
							ok:function(){
								var $this = $(this.node);
								var $slt = $this.find('.sltServiceType');
								var pms = {
									customerOrderItemId: $slt.data('id'),
									content: $this.find('.serviceProcessMark').val().trim(),
									status: $slt.val()
								}

								$.post("dealWithServiceOrder.json", pms).done(function(data){
									if(data.status==='0'){
										utils.alert('操作成功');
										d.close();
										window.location.reload();
									}else{
										alert(data.errmsg);
									}
								});
							},
							okValue:'确定',
							cancel:function(){},
							cancelValue:'取消'
						}).showModal();
					}else{
						utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
					}
				}).fail(function(data){
					utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
				});
			})
		},
		getCusServiceDetailEv:function(){
			$('#serviceListTbd').on('click', '.getDetail', function(){
				var oId = $(this).data('id');
				$.post("getServiceOrderVoByItemId.json", {customerOrderItemId: oId}).done(function(data){
					if(data.status === '0'){
						console.log(data.result);
						var d = dialog({
							title:'售后详情',
							width:700,
							content:template('serviceDetailTpl', data.result),
							ok:function(){
								var $this = $(this.node);
								var $slt = $this.find('.sltServiceType');
								var state = $slt.val();
								if(state == 2) {
									d.close();
									return;
								}
								var pms = {
									customerOrderItemId: $slt.data('id'),
									content: '重新开启了售后',
									status: $slt.val()
								}

								$.post("dealWithServiceOrder.json", pms).done(function(data){
									if(data.status==='0'){
										utils.alert('操作成功');
										d.close();
										window.location.reload();
									}else{
										utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
									}
								}).fail(function(data){
									utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
								});
							},
							okValue:'确定',
							cancelValue:'取消'

						}).showModal();
					}else{
						utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
					}
				}).fail(function(data){
					utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
				});
			})
		},
		exportCusServiceListEv:function(){
			$('#exportCusServiceListBtn').on('click', function(){
				if(!$("#dateStart").val() || !$("#dateEnd").val()){
					utils.alert("导出售后订单请选择起止时间");
					return false;
				}
				var pms = {};
				var options = $("#filterForm").serializeObject();
				options.gmtCreateStart = utils.getUnixTime($("#dateStart").val());
				options.gmtCreateEnd = utils.getUnixTime($("#dateEnd").val());

				$(".filterTitle a[data-status="+options.status+"]").addClass("current").siblings().removeClass("current");

				function jsonToUrlPms(jsonObj){
					var s = [];
					for(var i in jsonObj){
						s.push(i+'='+jsonObj[i])
					}
					return s.join('&');
				}

				 window.open('exportServiceOrderList.htm?'+jsonToUrlPms(options));
			})
		},
		getStoreList:function(){
			$.ajax({
				url:'getStoreList.json'
			}).done(function(data){
				if(data.status==='0'){
	        		var tArr = [], tData = data.result.storeVoList;
	        		if(tData.length){
	        		    tArr.push({id:999, text:'所有门店'});
	        		    for(i in tData){
	        		        tArr.push({id:tData[i].store.id, text:tData[i].store.name});
	        		    }

	        		    $("#sltStore").select2({
	        		        placeholder: "选择门店",
	        		        data:tArr
	        		    });
	        		    $("#sltSales").select2({
	        		        placeholder: "选择导购",
	        		        data:[]
	        		    });
	        		    
	        		}else{
						$("#sltStore").select2({
						    placeholder: "选择门店",
						    data:[{id:999,text:'暂无数据'}]
						});
						$("#sltSales").select2({
						    placeholder: "选择导购",
						    data:[{id:999,text:'暂无数据'}]
						});
						console.log('门店列表为空');
	        		}
				}else{
					utils.alert('系统繁忙，请稍后再试');
				}
			});
		},
		getSalesListById:function(storeId){
			$.ajax({
				url:'getSalesListOfStore.json',
				data:{storeId:storeId}
			}).done(function(data){
				if(data.status==='0'){
	        		var tArr = [], tData = data.result.salesAdminVoList;
	        		if(tData.length){
	        			tArr.push({id:999, text:'全部'});
	        		    for(i in tData){
	        		        if(tData[i].name){
	        		    		tArr.push({id:tData[i].salesId, text:tData[i].name});
	        		    	}
	        		    }

	        		    $("#sltSales").select2({
	        		        placeholder: "选择导购",
	        		        data:tArr
	        		    });
	        		}else{
						console.log('暂无数据');
	        		}
				}else{
					utils.alert('系统繁忙，请稍后再试');
				}
			});
		}
	};

	return {
		init:function(){
			page.init();
		}
	};
});
