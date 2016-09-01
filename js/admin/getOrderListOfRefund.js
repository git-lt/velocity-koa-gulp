define(['utils','momentPicker'],function(utils,datePicker){
	template.helper('getRefundStatus', function (status) {
	    var statusCn='';
	    switch(status){
	        case 1: statusCn = '买家发起申请'; break;
	        case 2: statusCn = '退款处理中'; break;
	        case 3: statusCn = '退款处理中'; break;
	        case 4: statusCn = '退款处理中'; break;
	        case 5: statusCn = '退款处理中'; break;
	        case 10: statusCn = '退款处理中'; break;
	        case 80: statusCn = '退款处理中'; break;
	        case 88: statusCn = '退款已处理'; break;
	        case 99: statusCn = '退款已关闭'; break;
	    }
	    return statusCn;
	});
	var page={
		o:{
			exportBtnList:[],
			expressList:[]
		},
		init:function(){
			$("select.select").select2({
				minimumResultsForSearch: -1
			});
			this.getAjaxData({
				pagination:true,
				refund:'1_2_3_4_5_10_80'
			});
			datePicker.init();
			this.selectOrder();
			this.orderRemark();
			this.searchOrder();
			this.getStoreList();
			this.checkExpress();
			$('#sltStore').on('change',function(){
				page.getSalesListById($(this).val());
			});
		},
		getAjaxData:function(options){
			$("#orderListTbd").html('<p class="text-center"><img src="../images/admin/loading.gif" /></p>');
			options = options||{};
			options.index = options.index||0;
			options.dateType = options.dateType||"create";
			options.length = options.length||utils.listLength;
			if(options.refund=="88_99"){
				options.refunded="true";
			}
			jQuery.ajax({
				url:"getOrderListOfSupplier.json",
				data:options,
				success:function(data){
					if(data.status!="0"){
						utils.alert(data.errmsg || "系统繁忙，请稍后再试");
					}
					var tempData={
						list:data.result.orderList,
						supplierId:$("#supplierId").val()
					}
					if(!data.result.orderList.length){
						$("#orderListTbd").html('<p class="text-center">暂无数据</p>');
						$(".tabs .active .count").html('(0)');
						$('#pagination').pagination({
							totalData:1,
							showData:1
						});
						return;
					}
					var dataHtml = template('tempDataRefund', tempData);
					$("#orderListTbd").empty().append(dataHtml);
					$("#fixedTable").setTheadFixed();
					if(options.pagination){
						$(".tabs .active .count").html('('+data.result.count+')');
						$('#pagination').pagination({
							totalData:data.result.count,
							showData:options.length,
							callback:function(i){
								options.pagination=false;
								options.index=(i-1)*options.length;
								page.getAjaxData(options);
							}
						});
					}
				}
			});
		},
		selectOrder:function(){
			$("ul.tabs").tabs(function(el){
				var refund = el.data("refund");
				page.getAjaxData({
					refund:refund,
					pagination:true
				});
			});
		},
		searchOrder:function(){
			$("#searchOrderBtn").on("click",function(){
				$("ul.tabs li").removeClass("active");
				$("ul.tabs li:eq(2)").addClass("active");
				var options = $(".search-form-wrap").serializeObject();
				options.refund="1_2_3_4_5_10_80_88_99";
				options.gmtCreateStart = utils.getUnixTime($("#dateStart").val());
				options.gmtCreateEnd = utils.getUnixTime($("#dateEnd").val());
				options.storeId = options.storeId==999 ? "" : options.storeId;
				options.salesId = options.salesId==999 ? "" : options.salesId;
				options.pagination = true;
				page.getAjaxData(options);
			});
		},
		orderRemark:function(){
			$("#orderListTbd").on("click",".remark",function(e){
				var _t = $(this);
				var orderId=_t.data("id");
				var remarkBox = dialog({
		            title:"订单备注",
		            id:"util-remart",
		            fixed: true,
		            content: '<textarea placeholder="添加备注" class="comment" id="remarkContent" style="width:300px;height:90px;"></textarea>',
		            width:300,
		            okValue: '确定',
		            cancelValue:'取消',
		            backdropOpacity:"0.3",
		            ok: function(){
		            	var comment = $("#remarkContent").val();
		            	if(comment){
		            		jQuery.ajax({
								url:"insertCustomerOrderRemarkFromSupplier.json",
								dataType:"json",
								data:{
									"orderId":orderId,
									"remarkContent":comment
								},
								success:function(data){
									if(data.status == "0"){
						    			_t.closest(".panel").find(".panel-footer").prepend('<div>刚刚 <span class="content">您：'+comment+'</span></div>');
						    		}
								}
							});
		            	}
		            },
		            cancel:function(){
		            	
		            }
		        }).showModal();
			});
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
		},
		checkExpress:function(){
			$("#orderListTbd").on("click",".checkExpress",function(e){
				e.preventDefault();
				var comp = $(this).data("comp"),code = $(this).data("code"),id=$(this).data("id");
				$("#orderListTbd tr.active").removeClass("active");
				$(this).closest("tr").addClass("active");
				var expressDia = dialog({
		            title:"物流查询",
		            id:"util-express",
		            fixed: true,
		            content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;正在努力查询中...',
		            width:500,
		            okValue: '确定',
		            cancel:false,
		            backdropOpacity:"0.3",
		            ok: function(){}
		        }).showModal();
		        if(!code || !id){
					expressDia.content('<p>快递公司: '+comp+'</p><p>快递单号: '+code+'</p><p>物流状态: 无法查询，快递公司或者快递单号为空</p>');
				}else{
					$.ajax({
					    url:"http://api.ickd.cn/",
					    data:"id=108386&secret=e5f4bb052cc515e85f217f7fc9d7d580&com="+id+"&nu="+code,
					    dataType:"jsonp",
					    success:function(data){
					      	console.log(data)
					      	var dataStr = '';
							if(data.status == "0"){
							    dataStr += data.message ? data.message : "暂时未跟踪到物流信息，请核对订单号和快递公司";
							}else{
							    $.each(data.data,function(i,e){
							      	dataStr += '<div class="time">'+e.time+'</div>'+'<div class="msg">'+e.context+'</div>'
							    });
							}
					      	expressDia.content('<p>快递公司: '+comp+'</p><p>快递单号: '+code+'</p><p>物流状态：</p><div class="expressMsg">'+dataStr+'</div>').showModal();
					    }
					});
				}
			});
		}
	}

	return {
		init:function(){
			page.init();
		}
	};

});

