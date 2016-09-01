define(['utils'],function(utils){
	var CONFIG, page;
	CONFIG = {
		apiupdateExchange:'updateExchangeActionStatus.json', //批量上下架兑换商品
	};

	page={
		init:function(){
			this.checkAllEv();  //全选
			this.addNewShop();  //新增兑换商品
			this.allUpBtnEv();  //批量上架
			this.allDownBtnEv();//批量下架
			this.deleteEv();    //删除
		},
		initElement:function(){
			$("#shopTypeG").select2({minimumResultsForSearch: -1});
			$("#yesNoUp").select2({minimumResultsForSearch: -1});
			//页面滚动生成导航栏
			$("#ExchangeGoods").setTheadFixed({
				leaveTop:134,
				fixedFn:function(){
					$(".tableAction").css({"position":"fixed","top":"60px"});
					$("#ExchangeGoods").css("margin-top","76px");
				},
				unfixedFn:function(){
					$(".tableAction").css({"position":"static","top":"0"});
					$("#ExchangeGoods").css("margin-top","0");
				}
			});
		},
		checkAllEv:function(){
			$("#checkAll").on("click",function(){
				var checkedList = $("#jiFenShop").find("input[name=select]");
				if(checkedList.not(":checked").length > 0){
					checkedList.prop("checked",true);
					$('#jiFenShop tr').toggleClass('active', true);
				}else{
					checkedList.prop("checked",false);
					$('#jiFenShop tr').toggleClass('active', false);
				}
			});
			$("#jiFenShop").on("click","tr",function(){
				var _this=$(this);
				_this.toggleClass('active');
				_this.find("input[name=select]").prop("checked",_this.hasClass('active'))
			})
		},
		addNewShop:function(){
			$("#addNewShop").on("click",function(){
				dialog({
				    title: '选择兑换类型',
			        fixed: true,
				    content: template('addNewShopBox'),
			        width:400,
			        backdropOpacity:"0.3",
				}).showModal();
				$(".duihuan").hover(function(){
					var index=$(".duihuan").index(this);
					$(".duihuan").eq(index).css({color:"#337ab7"});
					//$("a.imgD").eq(index).css({border:"1px solid #337ab7"})
				},function(){
					var index=$(".duihuan").index(this);
					$(".duihuan").eq(index).css({color:"#000"});
					//$("a.imgD").eq(index).css({border:"1px solid #f0f0f0"})
				})
			})
		},
		allUpBtnEv:function(){
			$("#allUpBtn").on("click",function(){
				var check = $("#jiFenShop").find("input[type=checkbox]:checked");
				if(check.length === 0){
					utils.alert("请至少选择一个商品");
				}else{
					
				}
			})
		},
		allDownBtnEv:function(){
			$("#allDownBtn").on("click",function(){
				var check = $("#jiFenShop").find("input[type=checkbox]:checked");
				if(check.length === 0){
					utils.alert("请至少选择一个商品");
				}else{

				}
			})
		},
	    deleteEv:function(){
	    	$("#ExchangeGoods").on("click",".del_JFshop",function(){
		    	utils.confirm("删除不可找回，是否确认删除？",function(){
					
				});
			});
	    },
	}
			

	return {
		init:function(){
			page.init();
		}
	}
});