define(['utils'],function(utils){
	var CONFIG, page;
	$.fn.replaceClass=function(a,b){
		var _t = $(this);
		if(_t.hasClass(a)){
			_t.removeClass(a).addClass(b);
		}else{
			_t.removeClass(b).addClass(a);
		}
	}
	CONFIG = {
		apisaveSupplier: 'saveSupplierCustomerConfig.json', //保存积分基础规则
		apigetSupplier:'getSupplierCustomerConfig.json'    //获取积分基础规则
	};

	page={
		init:function(){
			$(".select2").select2({minimumResultsForSearch: -1});
			this.getSupplier(); //获取积分基础规则

			this.showmesEv();   //开启关闭
			this.helpEv();      //帮助说明
			this.integralSettingEv(); //积分设置

			this.saveBasisEv();  //保存
		},
		getSupplier:function(){
			$.post(CONFIG.apigetSupplier,function(data){
				if(data.status=="0"){
					var supplier=data.result.supplierCustomerConfig;
					if(supplier!=null){
						if(supplier.pointEnable==1){
							$(".slideBtn").addClass("on");
						}else{
							$(".slideBtn").addClass("off");
							$("#keywords").prop("disabled",true);
							$("#openmember").addClass("hide");
							$("#shopping").addClass("hide");
							$("#assess").addClass("hide");
						}
						$("input[name=useStoreStock]").val(supplier.pointEnable);
						$("#keywords").val(supplier.pointName);
						$(".openmemberNum").text(supplier.createPoint);
						$(".shoppingNum").text(supplier.consumptionPoint);
						$("#shopNo").data("id",supplier.consumptionPayLimit);
						$(".assessNum").text(supplier.commentPoint);

					}
				}else {
	    			toastr.error(data.errmsg || '服务器繁忙，请稍后重试。')
	    		};
			})
		},
		SaveSupplier:function(){
			var options={
				pointEnable:$("input[name=useStoreStock]").val(),
				pointName:$("#keywords").val(),
				createPoint:$(".openmemberNum").text(),
				consumptionPoint:$(".shoppingNum").text(),
				consumptionPayLimit:$("#shopNo").data("id"),
				commentPoint:$(".assessNum").text(),
			}
			return $.post(CONFIG.apisaveSupplier,options)
		},
		showmesEv:function(){
			$(".slideBtn").on("click",function(e){
				e.preventDefault();
				var _t = $(this);
				_t.replaceClass("on","off")
				if(_t.hasClass("on")){
					$("input[name=useStoreStock]").val("1");
					$("#keywords").prop("disabled",false);
					$("#openmember").removeClass("hide");
					$("#shopping").removeClass("hide");
					$("#assess").removeClass("hide");
				}else{
					$("input[name=useStoreStock]").val("0");
					$("#keywords").prop("disabled",true);
					$("#openmember").addClass("hide");
					$("#shopping").addClass("hide");
					$("#assess").addClass("hide");
				}
			});
		},
		integralSettingEv:function(){
			var reg=/^\d+$/;
			//开通会员卡送积分
			$("#openmember").on("click",function(){
				var openText=$(".openmemberNum").text();
				$("input[name=openmemberNum]").val(openText);
				$(".openmemberNum").addClass("hide");
				$("input[name=openmemberNum]").removeClass("hide");
				$(".openSave").removeClass("hide");
				$("#openSaveBtn").on("click",function(){
					var openVal=$("input[name=openmemberNum]").val();
					if(reg.test(openVal)){
						$(".openmemberNum").text(openVal);
						$(".openmemberNum").removeClass("hide");
						$("input[name=openmemberNum]").addClass("hide");
						$(".openSave").addClass("hide");
					}else{
						toastr.error("请输入整数");
						return false
					}
				})
			});
			//购物消费送积分
			$("#shopping").on("click",function(){
				var shopText=$(".shoppingNum").text();
				$("input[name=shoppingNum]").val(shopText);
				$(".shoppingNum").addClass("hide");
				$("input[name=shoppingNum]").removeClass("hide");
				$(".paymentNo").addClass("hide");
				$("#payment").removeClass("hide");
				$(".shopSave").removeClass("hide");
				$("#shopSaveBtn").on("click",function(){
					var shopVal=$("input[name=shoppingNum]").val();
					if(reg.test(shopVal)){
						$(".shoppingNum").text(shopVal);
						$(".shoppingNum").removeClass("hide");
						$("input[name=shoppingNum]").addClass("hide");
						$(".paymentNo").removeClass("hide");
						$("#payment").addClass("hide");
						$(".shopSave").addClass("hide");
					}else{
						utils.alert("请输入整数");
						return false
					}
					var payment=$("#payment").select2("data").text;
					$(".paymentNo").text(payment);
					var paymentVal=$("#payment").val();
					$("#shopNo").data("id",paymentVal);
				})
			});
			//评价导购送积分
			$("#assess").on("click",function(){
				var assessText=$(".assessNum").text();
				$("input[name=assessNum]").val(assessText);
				$(".assessNum").addClass("hide");
				$("input[name=assessNum]").removeClass("hide");
				$(".assessSave").removeClass("hide");
				$("#assessSaveBtn").on("click",function(){
					var assessVal=$("input[name=assessNum]").val();
					if(reg.test(assessVal)){
						$(".assessNum").text(assessVal);
						$(".assessNum").removeClass("hide");
						$("input[name=assessNum]").addClass("hide");
						$(".assessSave").addClass("hide");
					}else{
						toastr.error("请输入整数");
						return false
					}
				})
			});
		},
		saveBasisEv:function(){
			var _this=this;
			$("#saveBasisBtn").on("click",function(){
				$('#saveBasisBtn').uiLoading('sm');
				var openBasis=$("input[name=useStoreStock]").val();
				if(openBasis=="0"){
					var options={
						pointEnable:0,
						pointName:"积分",
						createPoint:0,
						consumptionPoint:0,
						consumptionPayLimit:0,
						commentPoint:0,
					}
					$.post(CONFIG.apisaveSupplier,options,function(data){
						if(data.status=="0"){
							utils.alert("保存成功");
							$('#saveBasisBtn').uiLoading('sm');
							$(".paymentNo").text("无限制");
							_this.getSupplier();
						}else{
							$('#saveBasisBtn').uiLoading('sm');
							toastr.error(data.errmsg || "系统繁忙，请稍后再试");
						}
					})
				}else{
					_this.SaveSupplier()
					.done(function(data){
						if(data.status=="0"){
							utils.alert("保存成功");
						}else{
							toastr.error(data.errmsg || "系统繁忙，请稍后再试");
						}
						$('#saveBasisBtn').uiLoading('sm');
					})
					.fail(function(data){
						$('#saveBasisBtn').uiLoading('sm');
						toastr.error(data.errmsg || "系统繁忙，请稍后再试");
					});
				}
			})
		},
		helpEv:function(){
			$("#tipOne").on("click",function(){
				dialog({
				    title: '积分显示说明',
			        fixed: true,
				    content: "老用户默认关闭，需自行开启，规则内初始值均为0。<br>新用户默认开启，规则内初始值均为0。<br>个人中心“我的积分”入口不显示。<br>商品页关于积分提示不显示。",
			        width:400,
				    okValue: '确定',
			        backdropOpacity:"0.3",
				    ok: function () {}
				}).showModal();
			})
		}
	}
		
	return {
		init:function(){
			page.init();
		}
	}
});