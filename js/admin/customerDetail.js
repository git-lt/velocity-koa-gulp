define(['utils'],function(){
	'use strict';
	document.title="会员详情";
	Utils.mainMenuChk('customer_manage');
	var cusDetailVM, p_cusDetail, CONFIG={};
	CONFIG ={
		apiCusDetail: 'getCustStoreStatInfo.json',
		apiOrderList:'getOrderListOfSupplier.json',
		customerId:mainVM.params.$model.customerId,
	};

	cusDetailVM = avalon.define({
		$id:'cusDetailCtr',
		cusName:'',
		tags:'',
		gender:'',
		avatar:'',
		phone:'',
		gmtCreate:'',
		cardNo:'',
		subscribe:'',
		orderPayment:'',
		lastOrderPaytime:'',
		orderCount:'',
		customerId:'',
		bandingVo:[],
		orderStoreStatVo:[],
		sortEv:function(){
			var _this = $(this);
			if(_this.hasClass('sorting') || _this.hasClass('sorting_asc')){
				_this.attr('class','sorting_desc');
			}else{
				_this.attr('class','sorting_asc');
			}
			_this.siblings('[class^="sorting_"]').attr('class','sorting');
		}
	});

	p_cusDetail = {
		init:function(){
			$('[name="customer"]','#mainMenusBox').addClass('active');
			this.initCusDetailData();
			if($('#cusListTblWrap').length>0){
				this.initOrderListData();
			}
			this.u_logoutEv();
			this.tabsChange();   //选项卡转换
		},
		tabsChange:function(){
			$(".nav-tabs li").on('click',function(){
				var status =$(this).attr("data-status");
				if(!$(this).hasClass("active")){
					$(this).addClass("active");
					$(this).siblings().removeClass("active");
				}
				switch(status){
					case "0": $(".status0").removeClass("hide");$(".status0").siblings().addClass("hide");break;
					case "1": $(".status1").removeClass("hide");$(".status1").siblings().addClass("hide");break;
					case "2": $(".status2").removeClass("hide");$(".status2").siblings().addClass("hide");break;
					case "3": $(".status3").removeClass("hide");$(".status3").siblings().addClass("hide");break;
					case "4": $(".status4").removeClass("hide");$(".status4").siblings().addClass("hide");break;
					case "5": $(".status5").removeClass("hide");$(".status5").siblings().addClass("hide");break;
					case "6": $(".status6").removeClass("hide");$(".status6").siblings().addClass("hide");break;
				};
			});
		},
		u_logoutEv:function(){
			 $("#qkLogout").on("click",function(e){
            $.getJSON("../logout.json",function(){
                location.href="index.htm";
            });
            e.preventDefault();
        });
		},
		processTags:function(tags){
			var colors = ['default','primary','success','info','warning','danger','purple','inverse','pink'];
			tags = tags.split(',').map(function(v){
				var i = Math.floor(Math.random()*(8+1));
				return '<span class="label label-'+colors[i]+'">'+v+'</span>';
			});
			return tags.join(' ');
		},
		initCusDetailData:function(){
			var self = this;

			$.post(CONFIG.apiCusDetail, {customerId: CONFIG.customerId})
			.done(function(data){
				if(data.status==='0'){
					var d = data.result.customerStatInfoDetailVo;
					var cusInfo = d.customerStatInfo.customer;

					cusDetailVM.avatar = avalon.filters.avatar(cusInfo.avatar);
					cusDetailVM.tags = d.tags ? self.processTags(d.tags):'暂无';
					cusDetailVM.cusName = cusInfo.name;
					cusDetailVM.phone = cusInfo.phone;
					cusDetailVM.gmtCreate = cusInfo.gmtCreate;
					cusDetailVM.customerId = cusInfo.id;
					cusDetailVM.lastOrderPaytime = d.customerStatInfo.lastOrderPaytime?avalon.filters.date(d.customerStatInfo.lastOrderPaytime,'yyyy-MM-dd HH:mm:ss'):'暂无';
					cusDetailVM.orderCount = d.customerStatInfo.orderCount;
					cusDetailVM.orderPayment = d.customerStatInfo.orderPayment;
					cusDetailVM.subscribe = d.customerStatInfo.subscribe;
					cusDetailVM.cardNo = cusInfo.cardNo;

					d.customerBandingVo.length && (cusDetailVM.bandingVo = d.customerBandingVo);
					d.customerOrderStoreStatVo.length && (cusDetailVM.orderStoreStatVo = d.customerOrderStoreStatVo);
					$('.vs-hd').removeClass('vs-hd');
					$('.ms-controller').removeClass('ms-controller');
				}else{
					toastr.error('服务器繁忙');
				}
			})
			.fail(function(){
				toastr.error('服务器繁忙');
			});
		},
		initOrderListData:function(){
			var self = this;
			var url = CONFIG.apiOrderList;
			var pms = {
				index:0,
				length:30,
				orderType:0,
				customerId:CONFIG.customerId
			};
			$('#cusListTblWrap').uiLoading('lg');
			$.post(url, pms)
				.done(function(data){
					if(data.status==='0'){
						var d = data.result.orderList;
						var navpageBox = $('#cusDetailNavPages');

						if(d.length){
							d = self.processOrderData(d);
							$('#cusListTbd').html(template('orderListTpl',{data:d}));
							var count = data.result.count;
							var totalP = Math.ceil(count/pms.length);

							$('#cusListTotal').text(count);
							if(totalP>1){
								navpageBox.pagination({
									totalData:count,
									showData:30,
									coping:true,
									callback:function(i){
										pms.index = (i-1)*pms.length;
										$('#cusListTblWrap').uiLoading('lg');
										$.post(url, pms)
										.done(function(data){
											var tplD = self.processOrderData(data.result.orderList);
					            $('#cusListTbd').html(template('orderListTpl',{data:tplD}));
											$('#cusListTblWrap').uiLoading('lg');

											setTimeout(function(){
												var t = $("#cusListTblWrap").offset().top-100;
												$("html,body").animate({scrollTop:t}, 500);
											}, 300);
										});
									}
								});

							}else{
								navpageBox.html('');
							}
						}else{
							$('#cusListTbd').html('<div class="c-8 text-center p20"> 未查询到相关数据 </div>');
							navpageBox.html('');
						}
						$('#cusListTblWrap').uiLoading('lg');
						
					}else{
						toastr.error('服务器繁忙');
						$('#cusListTblWrap').uiLoading('lg');
					}
				})
				.fail(function(){
					toastr.error('服务器繁忙');
					$('#cusListTbd').html('<div class="c-8 tc p20"> 数据查询失败 </div>');
				});
		},
		processOrderData:function(data){
			return data.map(function(v){
				v.orderItemList = v.orderItemList.map(function(o){
					o.productPicUrl = avalon.filters.placeholderImg(o.productPicUrl,'product', 50);
					o.productName = avalon.filters.truncate(o.productName, 28, '...');
					o.price = avalon.filters.number(o.price, 2);
					return o;
				});
				v.customerOrder.gmtCreate = avalon.filters.date(v.customerOrder.gmtCreate,'yyyy-MM-dd hh:mm:ss');
				v.customerOrder.status = avalon.filters.getOrderStatus(v.customerOrder.status);
				v.customerOrder.payment = avalon.filters.number(v.customerOrder.payment, 2);

				return v;
			})
		}
	};

	return {
		init:function(){
			p_cusDetail.init();
			avalon.scan($('#subContainer')[0]);
		}
	};
});