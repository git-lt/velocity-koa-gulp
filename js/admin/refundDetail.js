define(['utils'],function(utils){
	var refundVM = avalon.define({
		$id: "refundDetailCtl",
		customer:{},
		item:{},
		order:{},
		service:{},
		store:'',
		sales:'',
		log:[],
		supplierId:$("#supplierId").val(),
		customerServiceId:'',
		remark:function(){
			var remarkBox = dialog({
	            title:"订单备注",
	            id:"util-remart",
	            fixed: true,
	            content: '<textarea placeholder="添加备注" maxlength="200" class="comment" id="remarkContent" style="width:300px;height:90px;"></textarea>',
	            width:300,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(){
	            	var comment = $("#remarkContent",".ui-dialog").val();
	            	if(comment){
	            		jQuery.ajax({
							url:"addCustomerServiceRemark.json",
							data:{
								"customerServiceId":refundVM.$model.customerServiceId,
								"remark":comment
							},
							success:function(data){
								if(data.status == "0"){
									$(".refundHistory").prepend('<div class="item pb10 pt10 bdr-b"><h5>商家</h5><div>备注：'+comment+'</div><div class="text-muted pt5">刚刚</div></div>');
					    		}else{
					    			utils.alert(data.errmsg||"系统繁忙，请稍后再试")
					    		}
							}
						});
	            	}
	            },
	            cancel:function(){}
	        }).showModal();
		},
		agreeRefund:function(){
			var agreeRefundBox = dialog({
	            title:"处理售后",
	            id:"util-agree",
	            fixed: true,
	            content: $('#agreeRefundDia')[0],
	            width:420,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(a,b,c){
	            	var password=$("#password",".ui-dialog").val();
	            	if(password){
	            		$(".ui-dialog-button .btn-info").uiLoading("sm");
	            		$.ajax({
							url:"verifyApplyCustomerService.json",
							data:{
								"customerServiceId":refundVM.$model.customerServiceId,
								"disAgree":"0",
								"password":password
							},
							success:function(data){
								$(".ui-dialog-button .btn-info").uiLoading("sm");
								if(data.status == "0"){
									agreeRefundBox.close();
									utils.alert("退款已向支付机构发起成功，退款金额将在3个工作日内退到消费者的付款账户。",function(){
										location.reload();
									});
					    		}else{
					    			$("#refundActionError",".ui-dialog").html(data.errmsg || "系统繁忙，请稍后再试").show();
					    		}
							}
						});
	            	}else{
	            		$("#password",".ui-dialog").parent().addClass("has-error");
	            	}
	            	return false;
	            },
	            cancel:function(){}
	        }).showModal();
			$("#password",".ui-dialog").val("");
		},
		agreeRefundReceived:function(){
			var agreeRefundBox = dialog({
	            title:"处理售后",
	            id:"util-agree",
	            fixed: true,
	            content: $('#agreeRefundDia')[0],
	            width:420,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(){
	            	var password=$("#password",".ui-dialog").val();
	            	if(password){
	            		$(".ui-dialog-button .btn-info").uiLoading("sm");
	            		$.ajax({
							url:"verifyExpressCustomerService.json",
							data:{
								"customerServiceId":refundVM.$model.customerServiceId,
								"disAgree":"0",
								"password":password
							},
							success:function(data){
								$(".ui-dialog-button .btn-info").uiLoading("sm");
								if(data.status == "0"){
									agreeRefundBox.close();
									utils.alert('退款已向支付机构发起成功，退款金额将在3个工作日内退到消费者的付款账户。',function(){
										location.reload();
									});
					    		}else{
					    			$("#refundActionError",".ui-dialog").html(data.errmsg || "系统繁忙，请稍后再试").show();
					    		}
							}
						});
	            	}else{
	            		$("#password",".ui-dialog").parent().addClass("has-error");
	            	}
	            	return false;
	            },
	            cancel:function(){}
	        }).showModal();
		},
		agreeDelivery:function(){
			var agreeDeliveryBox = dialog({
	            title:"处理售后",
	            id:"util-agree",
	            fixed: true,
	            content: $('#agreeDeliveryDia')[0],
	            width:420,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(){
	            	var remark=$("#refundAddress",".ui-dialog").val();
	            	if(remark){
	            		$(".ui-dialog-button .btn-info").uiLoading("sm");
	            		$.ajax({
							url:"verifyApplyCustomerService.json",
							data:{
								"customerServiceId":refundVM.$model.customerServiceId,
								"disAgree":"0",
								"remark":JSON.stringify({
									"退货地址":remark
								})
							},
							success:function(data){
								$(".ui-dialog-button .btn-info").uiLoading("sm");
								if(data.status == "0"){
									agreeDeliveryBox.close();
									utils.alert('已同意退货，等待买家退货',function(){
										location.reload();
									});
					    		}else{
					    			$("#refundActionError",".ui-dialog").html(data.errmsg || "系统繁忙，请稍后再试").show();
					    		}
							}
						});
	            	}else{
	            		$("#password",".ui-dialog").parent().addClass("has-error");
	            	}
	            	return false;
	            },
	            cancel:function(){}
	        }).showModal();
		},
		refuseDelivery:function(){
			var refuseDeliveryDia = dialog({
	            title:"处理售后",
	            id:"util-refuse",
	            fixed: true,
	            content: $('#refuseDeliveryDia')[0],
	            width:420,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(){
	            	var remark=$("#refuseDeliveryReason",".ui-dialog").val();
	            	$(".ui-dialog-button .btn-info").uiLoading("sm");
            		$.ajax({
						url:"verifyExpressCustomerService.json",
						data:{
							"customerServiceId":refundVM.$model.customerServiceId,
							"disAgree":"1",
							"remark":JSON.stringify({
									"拒绝理由":remark
								})
						},
						success:function(data){
							$(".ui-dialog-button .btn-info").uiLoading("sm");
							if(data.status == "0"){
								refuseDeliveryDia.close();
								utils.alert('未收到退货，买家可重新填写退货单',function(){
									location.reload();
								});
				    		}else{
				    			$("#refundActionError",".ui-dialog").html(data.errmsg || "系统繁忙，请稍后再试").show();
				    		}
						}
					});
					return false;
	            },
	            cancel:function(){}
	        }).showModal();
		},
		refuse:function(){
			var remarkBox = dialog({
	            title:"拒绝退款",
	            id:"util-refuse",
	            fixed: true,
	            content: $('#refuseDia')[0],
	            width:420,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(){
	            	var comment = $("#refuseReason",".ui-dialog").val();
	            	if(comment){
	            		$(".ui-dialog-button .btn-info").uiLoading("sm");
	            		jQuery.ajax({
							url:"verifyApplyCustomerService.json",
							data:{
								"customerServiceId":refundVM.$model.customerServiceId,
								"disAgree":"1",
								"remark":JSON.stringify({
									"拒绝理由":comment
								})
							},
							success:function(data){
								$(".ui-dialog-button .btn-info").uiLoading("sm");
								if(data.status == "0"){
									remarkBox.close();
									utils.alert('已拒绝退货，买家可重新发起退款申请',function(){
										location.reload();
									});
					    		}else{
					    			$("#refundActionError",".ui-dialog").html(data.errmsg || "系统繁忙，请稍后再试").show();
					    		}
							}
						});
	            	}else{
	            		$("#refuseReason",".ui-dialog").parent().addClass("has-error");
	            	}
	            	return false;
	            },
	            cancel:function(){}
	        }).showModal();
		},
		checkExpress:function(){
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
				    data:{
				    	"id":GLOBAL_CONFIG.kuaichaId,
				    	"secret":GLOBAL_CONFIG.kuaichaSecret,
				    	"com":id,
				    	"nu":code
				    },
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
		}
	});
	avalon.scan($("#refundDetailContainer")[0]);

	// 倒计时
	$.fn.countDown=function(sec){
	    sec = Number(sec);
	    if(sec <= 0) return false;
	    return this.each(function(){
	        var self = $(this);
	        var countFn = setInterval(function(){
	            if(sec > 1){
	                sec--;
	                var days = parseInt(sec/(3600*24)),
		        	hours = parseInt((sec%(3600*24))/3600),
		        	hours = hours > 9 ? hours : ('0'+hours),
		        	minutes = parseInt(sec%3600/60),
		        	minutes = minutes > 9 ? minutes : ('0'+minutes),
		        	seconds = parseInt(sec%60),
		        	seconds = seconds > 9 ? seconds : ('0'+seconds);
	                self.html(days+'天'+hours+'小时'+minutes+'分'+seconds+'秒');
	            }else{
	                location.reload();
	            }
	        },1000);
	    });
	}

	var page={
		dataInit:function(){
			$.getJSON("getCustomerServiceVo.json?orderItemId="+mainVM.params.$model.orderItemId,function(data){
				var refund = data.result.CustomerServiceVo,serviceTime = data.result.serviceTime;
				refundVM.item = refund.customerOrderItem;
				refundVM.order = refund.customerOrder;
				refundVM.service = refund.customerService;
				refundVM.customer = refund.customer;
				
				refundVM.sales =  refund.sales ? refund.sales.name : "";
				refundVM.store =  refund.store ? refund.store.name : "";
				refundVM.customerServiceId = refund.customerService.id;
				$.each(refund.customerServiceItemList,function(i,e){
					try{
						var log="",remark = JSON.parse(e.remark);
						if(typeof remark == "number"){
							JSON.parse("number");
						}
						for(var k in remark){
							if (remark[k].constructor == Array) {
								var imgList="";
								$.each(remark[k],function(j,m){
									imgList+=m;
								});
								log = log + "<div>" + k+"："+imgList+"</div>";
							}else{
								log = log + "<div>" + k+"："+remark[k]+"</div>";
							}
						}
						e.remark = log;
					}catch(error){
						e.remark = e.remark ? ("备注："+e.remark) : "";
					}
				});
				refundVM.log = refund.customerServiceItemList.reverse();
				if($(".refundTimeDown").length>0){
					var seconds = refund.customerService.endTime - serviceTime
					$(".refundTimeDown").countDown(seconds/1000);
				}			
				setTimeout(function(){$("#colLeft,#colRight").height(Math.max($("#colLeft").height(),$("#colRight").height()));},100);
			});
		}
	}
	return {
		init:function(){ 
			page.dataInit();
		}
	}
});