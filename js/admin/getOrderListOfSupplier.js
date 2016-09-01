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
				pagination:true
			});
			if($.cookie("distType") != "0"){
				$("#orderTypeSelect").removeClass("dn");
			}
			datePicker.init();
			this.selectOrder();
			this.orderRemark();
			this.searchOrder();
			this.exportOrder();
			this.getStoreList();
			this.closeOrder();
			this.deliveryOrder();
			this.checkExpress();
			$('#sltStore').on('change',function(){
				var storeId=$(this).val();
				if(storeId==""){
					$("#sltSales").val("").trigger("change");
				}else{
					page.getSalesListById(storeId);
				}
			});
		},
		getAjaxData:function(options){
			$("#orderListTbd").html('<p class="text-center"><img src="../images/admin/loading.gif" /></p>');
			options = options||{};
			options.index = options.index||0;
			options.dateType = options.dateType||"create";
			options.length = options.length||utils.listLength;
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
					var dataHtml = template('tempData', tempData);
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
				var status = el.data("status"),deliveryType="";
				$("#orderStatus").val(status).trigger("change");
				if(status=="20"){
					status = "2";
					deliveryType="2";	
				}else if(status=="2"){
					deliveryType="1";
				}
				page.getAjaxData({
					status:status,
					deliveryType:deliveryType,
					pagination:true
				});
			});
		},
		searchOrder:function(){
			$("#orderStatus").on("change",function(){
				if($(this).val()=="20"){
					$("#deliveryType").val("2").trigger("change").prop("disabled",true);
				}else if($(this).val()=="2"){
					$("#deliveryType").val("1").trigger("change").prop("disabled",true);
				}else{
					$("#deliveryType").val("").trigger("change").prop("disabled",false);
				}
			});
			$("#searchOrderBtn").on("click",function(){
				var options = $(".search-form-wrap").serializeObject();
				// $(".nav-tabs li").removeClass("active").find("a[data-status="+options.status+"]").parent().addClass("active");
				$("ul.tabs li.tab").removeClass("active");
				var current = $("ul.tabs li.tab").find("a[data-status="+options.status+"]").parent();
				current.addClass("active");
				$("ul.tabs .indicator").css("left",$("ul.tabs li.tab:eq(0)").width()*current.index());
				if(options.status=="20"){
					options.status = "2";
					options.deliveryType="2";
				}else if(options.status=="2"){
					options.deliveryType="1";
				}
				if(options.refund == "88_99"){
					options.refunded="true";
				}
				options.gmtCreateStart = utils.getUnixTime($("#dateStart").val());
				options.gmtCreateEnd = utils.getUnixTime($("#dateEnd").val());
				options.pagination = true;
				page.getAjaxData(options);
			});
		},
		exportOrder:function(){
			$("#exOrderBtn").on("click",function(){
				if(!$("#dateStart").val() || !$("#dateEnd").val()){
					utils.alert("导出订单请选择起始时间");
					return false;
				}
				var exportBox = dialog({
			        title:"确认导出订单",
			        id:"util-export",
			        fixed: true,
			        content: page.createExportBox(),
			        width:650,
			        cancelValue:'取消',
			        backdropOpacity:"0",
			        button: page.o.exportBtnList.length > 0 ? page.o.exportBtnList : page.createExportBtnList()
			    }).showModal();

			    $("#deliveryList").parent().css("width","100%");
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
		            content: '<textarea maxlength="140" placeholder="添加备注" class="comment" id="remarkContent" style="width:300px;height:90px;"></textarea>',
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
				url:'getStoreList.json',
				data:{
					"open":"0_1"
				}
			}).done(function(data){
				if(data.status==='0'){
	        		var tArr = [], tData = data.result.storeVoList;
	        		if(tData.length){
	        		    tArr.push({id:"", text:'所有门店'});
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
						    data:[{id:"",text:'暂无数据'}]
						});
						$("#sltSales").select2({
						    placeholder: "选择导购",
						    data:[{id:"",text:'暂无数据'}]
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
	        			tArr.push({id:"", text:'全部'});
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
		createExportList:function(params){
			$.post("exportOrderList.json",params,function(data){
				if(data.status=="0"){
					dialog({
			            title:"报表导出成功",
			            id:"util-export",
			            fixed: true,
			            content: '报表正在生成中，可前往报表中心下载',
			            width:300,
			            okValue: '前往报表中心',
			            cancelValue:'返回',
			            backdropOpacity:"0",
			            ok:function(){
			            	window.open("exportList.htm");
			            },
			            cancel:function(){}
			        }).showModal();
				}else{
					utils.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				}
			});
		},
		createExportBtnList:function(){
			var options = $(".search-form-wrap").serializeObject();
			if(options.status=="20"){
				options.status = "2";
				options.deliveryType = "2";
			}
			var paramObj={
				gmtCreateStart:utils.getUnixTime($("#dateStart").val()),
				gmtCreateEnd:utils.getUnixTime($("#dateEnd").val()),
				status: options.status,
				deliveryType: options.deliveryType,
				dateType:"pay",
				parmssJsonCn : page.createParamsCn()
			}
			if($("#deliverExAllow").length>0){
				page.o.exportBtnList.push({
		        	id:'deliveryList',
		        	className:'fn-left btn-primary',
		            value: '导出发货单',
		            callback: function () {
		            	paramObj.exportType="delivery";
		            	paramObj.orderType="0";
		                page.createExportList(paramObj);
		            }
		        });
			}
			if($("#checkExAllow").length>0){
				page.o.exportBtnList.push({
		        	id:'balanceList',
		        	className:'fn-left btn-primary',
		            value: '导出对账单',
		            callback: function () {
		                paramObj.exportType="bill";
		            	paramObj.orderType="0";
		                page.createExportList(paramObj);
		            }
		        });
			}
			if($("#deductExAllow").length>0){
				page.o.exportBtnList.push({
		        	id:'deductExport',
		        	className:'fn-left btn-primary',
		            value: '导出导购提成明细',
		            callback: function () {
		                paramObj.exportType="deduct";
		            	paramObj.orderType="0";
		                page.createExportList(paramObj);
		            }
		        });
			}
			page.o.exportBtnList.push({
	        	className:'fn-right',
	            value: '取消',
	            callback: function () {
	                this.close();
	            }
	        });
			if($("#isDistSupplier").length>0){
				page.o.exportBtnList.unshift({
		        	id:'distOrderList',
		        	className:'fn-left btn-primary',
		            value: '导出分销对账单',
		            callback: function () {
		                paramObj.exportType="bill";
		            	paramObj.orderType="1";
		                page.createExportList(paramObj);
		            }
		        });
			}
			return page.o.exportBtnList;
		},
		createParamsCn:function(){
			var json = ['支付时间: '+$("#dateStart").val()+' ~ '+$("#dateEnd").val()];
			if($("#orderStatus").val()){
				json.push('订单状态: '+$("#orderStatus option:selected").text());
			}
			if($("#deliveryType").val()){
				json.push('物流方式: '+$("#deliveryType option:selected").text());
			}
			return JSON.stringify(json);
		},
		createExportBox:function(){
			var result = '<table class="simpleTable">\
							<tr>\
								<td>支付时间：</td>\
								<td colspan="3">'+$("#dateStart").val()+' 至 '+$("#dateEnd").val()+'</td>\
							</tr>\
							<tr>\
								<td>订单状态：</td>\
								<td>'+$("#orderStatus option:selected").text()+'</td>\
								<td class="text-right">物流方式：</td>\
								<td>'+$("#deliveryType option:selected").text()+'</td>\
							</tr>\
						</table>';
			return result;
		},
		closeOrder:function(){
			$("#orderListTbd").on("click",".closeOrder",function(e){
				e.preventDefault();
				var orderId=$(this).data("id"),_t = $(this);
				$("#orderListTbd tr.active").removeClass("active");
				$(this).closest("tr").addClass("active");
				dialog({
		            title:"关闭订单",
		            id:"util-remart",
		            fixed: true,
		            content: '<textarea placeholder="请填写理由" class="comment" id="closeComment" style="width:300px;height:90px;"></textarea>',
		            width:300,
		            okValue: '确定',
		            cancelValue:'取消',
		            backdropOpacity:"0.3",
		            ok: function(){
		            	var comment = $("#closeComment").val();
		            	if(comment){
		            		jQuery.ajax({
								url:"closeOrder.json",
								dataType:"json",
								data:{
									"orderId":orderId,
									"closeComment":comment
								},
								success:function(data){
									if(data.status == "0"){
						    			_t.parent().html("已关闭");
						    		}else{
						    			utils.alert(data.errmsg || "系统繁忙，请稍后再试");
						    		}
								}
							});
		            	}else{
		            		$("#closeComment").addClass("error");
		            		return false;
		            	}
		            },
		            cancel:function(){
		            	
		            }
		        }).showModal();
			})
		},
		deliveryOrder:function(){
			$("#orderListTbd").on("click",".delivery",function(e){
				e.preventDefault();
				var orderId=$(this).data("id"),_t = $(this);
				$("#orderListTbd tr.active").removeClass("active");
				$(this).closest("tr").addClass("active");
				dialog({
		            title:"订单发货",
		            id:"util-remart",
		            fixed: true,
		            content: '<div class="form-inline" style="width:300px;"><div>快递公司：<input type="text" class="form-control form-inline input-sm" id="expressage" style="width:162px;"></div><div class="mt10">运单号码：<input type="text" id="expressNub" class="number form-control input-sm" placeholder="请填写运单号" maxlength="20"></div></div>',
		            width:300,
		            okValue: '确定',
		            cancelValue:'取消',
		            backdropOpacity:"0.3",
		            ok: function(){
		            	var comp = $("#expressage").val(),number = $("#expressNub").val(),compName=$("#s2id_expressage .select2-chosen").text();
		            	if(!comp){
		            		$("#expressage").parent().addClass("has-error");
		            		return false;
		            	}
		            	if(!number){
		            		$("#expressNub").parent().addClass("has-error");
		            		return false;
		            	}
		            	jQuery.ajax({
							url:"expressOrder.json",
							data:{
								"orderId":orderId,
								"expressCompany":compName,
								"expressId":comp,
								"expressCode":number
							},
							success:function(data){
								if(data.status == "0"){
					    			_t.parent().html("已发货");
					    		}else{
					    			utils.alert(data.errmsg || "系统繁忙，请稍后再试")
					    		}
							}
						});
		            },
		            cancel:function(){
		            	
		            }
		        }).showModal();
		        if(page.o.expressList.length==0){
		        	$.getJSON("../js/tool/expressage.json?v=1",function(data){
						$("#expressage").select2({
						  placeholder: "请选择快递公司",
						  data:data.expressList
						});
						page.o.expressList = data.expressList;
					});
		        }else{
		        	$("#expressage").select2({
					  placeholder: "请选择快递公司",
					  data:page.o.expressList
					});
		        }
			});
		},
		checkExpress:function(){
			$("#orderListTbd").on("click",".checkExpress",function(e){
				e.preventDefault();
				var comp = $(this).data("comp"),code = $(this).data("code"),id=$(this).data("id");
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
					      	expressDia.content('<p>快递公司：'+comp+'</p><p>快递单号：'+code+'</p><p>物流状态：</p><div class="expressMsg">'+dataStr+'</div>').showModal();
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

