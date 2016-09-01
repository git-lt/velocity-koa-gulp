define(['utils'],function(utils){
	var orderVM = avalon.define({
		$id: "orderDetailCtl",
		orderInfo:{},
		supplierId:$("#supplierId").val(),
		orderItems:[],
		customer:{},
		orderRemark:[],
		sales:{},
		store:{},
		refundValue:0,
		salesListStr:'',
		salesChangePrice:0,
		qiakrFlow:'',
		remark:function(){
			var remarkBox = dialog({
	            title:"订单备注",
	            id:"util-remart",
	            fixed: true,
	            content: '<textarea maxlength="140" placeholder="添加备注" class="comment" id="remarkContent" maxlength="200" style="width:300px;height:90px;"></textarea>',
	            width:300,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(){
	            	var comment = $("#remarkContent",".ui-dialog").val();
	            	if(comment){
	            		jQuery.ajax({
							url:"insertCustomerOrderRemarkFromSupplier.json",
							dataType:"json",
							data:{
								"orderId":mainVM.params.$model.orderId,
								"remarkContent":comment
							},
							success:function(data){
								if(data.status == "0"){
									$("#remarkList").prepend('<li>刚刚 <strong>您</strong>：'+comment+'</li>');
					    		}else{
									utils.alert(data.errmsg || "系统繁忙，请稍后再试");
					    		}
							}
						});
	            	}
	            },
	            cancel:function(){
	            	
	            }
	        }).showModal();
		},
		delivery:function(e){
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
							"orderId":mainVM.params.$model.orderId,
							"expressCompany":compName,
							"expressId":comp,
							"expressCode":number
						},
						success:function(data){
							if(data.status == "0"){
				    			location.reload();
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
		},
		activeRefund:function(){
			var _t = $(this);
			var refundBox = dialog({
	            title:"主发起退款",
	            id:"util-refund",
	            fixed: true,
	            content: '<div class="alert alert-warning p10">您正在发起主动退款，请输入商品退款金额，退款金额将根据支付方式直接返回给消费者。</div>'+_t.parent().siblings(".dia:first").html(),
	            width:420,
	            okValue: '确定',
	            cancelValue:'取消',
	            backdropOpacity:"0.3",
	            ok: function(){
	            	var id = _t.data("id"),max = parseFloat($("#refundValue",".ui-dialog").data("max")).toFixed(2);
	            	var params={
	            		orderItemId:id,
	            		value:$("#refundValue",".ui-dialog").val(),
	            		password:$("#password",".ui-dialog").val()
	            	};
	            	if(isNaN(params.value) || params.value=="0.00"){
	            		$("#refundValue",".ui-dialog").parent().addClass("has-error");
	            		return false;
	            	}
	            	if(+params.value > +max){
	            		$("#refundError",".ui-dialog").html("退款金额不能大于最大可退金额(¥"+parseFloat(max).toFixed(2)+")");
	            		return false;
	            	}
	            	if(!params.password){
	            		$("#password",".ui-dialog").parent().addClass("has-error");
	            		return false;
	            	}
	            	$(".ui-dialog-button .btn-info").uiLoading("sm");
            		jQuery.ajax({
						url:"activeRefund.json",
						data:params,
						success:function(data){
							$(".ui-dialog-button .btn-info").uiLoading("sm");
							if(data.status=="0"){
								refundBox.close();
								utils.alert("退款已向支付机构发起成功，退款金额将在3个工作日内退到消费者的付款账户。",function(){
									location.reload();
								})
							}else{
								$("#refundError",".ui-dialog").html(data.errmsg || "系统繁忙，请稍后再试")
							}
						}
					});
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
	avalon.scan($("#orderDetailContainer")[0]);

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
		o:{
			expressList:[]
		},
		dataInit:function(){
			$.getJSON("getOrderInfo.json?orderId="+mainVM.params.$model.orderId,function(data){
				var order = data.result.orderVo,serviceTime = data.result.serviceTime,salesList=[];
				orderVM.orderInfo = order.customerOrder;
				orderVM.orderItems = order.orderItemList;
				orderVM.customer = order.customer;
				orderVM.orderRemark = order.orderRemarkList;
				orderVM.sales = order.sales||{};
				orderVM.store = order.store||{};
				orderVM.salesChangePrice = order.salesChangePrice;
				orderVM.refundValue=0;
				orderVM.qiakrFlow = data.result.qiakrFlow;
				$.each(order.orderItemList,function(i,e){
					orderVM.refundValue += e.refundValue||0;
					if(salesList.indexOf(e.brandSalesName)<0){
						salesList.push(e.brandSalesName);
					}
				});
				orderVM.salesListStr = salesList.join(",");
				
				if($("#payTimeDown").length>0){
					var seconds;
					if(order.customerOrder.flashSale==1){
						// 秒杀订单倒计时10分钟
						seconds = order.customerOrder.gmtCreate + 600*1000 - serviceTime;
					}else{
						// 普通订单倒计时2天
						seconds = order.customerOrder.gmtCreate + 48*3600*1000 - serviceTime;
					}
					$("#payTimeDown").countDown(seconds/1000);
				}
				if($("#confirmTimeDown").length>0){
					var seconds = order.customerOrder.deliveryTime + 240*3600*1000 - serviceTime
					$("#confirmTimeDown").countDown(parseInt(seconds/1000));
				}
				$('#orderCodeMore').popover({
					container:'body',
					content:$("#orderCodeMoreCon").html(),
					placement:'bottom',
					html:true
				});
				setTimeout(function(){$("#colLeft,#colRight").height(Math.max($("#colLeft").height(),$("#colRight").height()));},300);
			});
			$("body").on("blur","#refundValue",function(){
				var _input = $(this);
				var val = parseFloat(_input.val());
				if(isNaN(val)){
					_input.val("");
				}else{
					_input.val(val.toFixed(2));
				}
			}).on("click",function(e){
				if(!$(e.target).parent().hasClass("popover-content") && e.target.id!='orderCodeMore'){
					$('#orderCodeMore').popover("hide");
				}
			})
		}
	}
	return {
		init:function(){ 
			page.dataInit();
		}
	}
});