define(['moment','utils','WdatePicker','location'],function(moment,Utils){
	Utils.mainMenuChk('customer_manage');
	var customerVM, p_cus, CONFIG={};

	CONFIG ={
		apiStore: 'getStoreList.json',
		apiSales: 'getSalesListOfStore.json',
		apiCusList: 'getCustomerListOfSupplier.json',
		apiCusStatCount:'getCustomerStatCount.json',
		quickTime:[],
		quickNames:{time:['startTime', 'endTime'], payment:['minOrderPayment','maxOrderPayment'], count:['minOrderCount','maxOrderCount'],point:['minOrderPoint','maxOrderPoint'],coupon:['minOrderCoupon','maxOrderCoupon']},
		searching:false
	};

	CONFIG.quickTime.push(moment().format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD HH:mm:ss'));
	CONFIG.quickTime.push(moment().subtract(1,'days').format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD 00:00:00'));
	CONFIG.quickTime.push(moment().subtract(7,'days').format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD 00:00:00'));
	CONFIG.quickTime.push(moment().subtract(30,'days').format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD 00:00:00'));

	// Loading
	$.fn.uiLoading = function(type){$(this).toggleClass('ui-loading-'+type);};

	customerVM = avalon.define({
		$id:'cusListCtr',
		tblTotal:0,
		customerSubAndBandingCount:0,
		customerSubscribeCount:0,
		customerPayCount:0,
		customerBandingCount:0,
		filters:{
			index: 0,
			length: 30,
			startTime: '',
			endTime: '',
			maxOrderPayment:'',
			minOrderPayment:'',
			maxOrderCount:'',
			minOrderCount:'',
			keywords: '',
			storeId: '',
			salesId: '',
			orderName: 'gmt_create',
			orderType: 'desc',
			subscribe: '',
			hasCard: ''
		},
		quickSltEv:function(e){
			e.preventDefault();
			var _this = $(this), names = CONFIG.quickNames;
			_this.toggleClass('active');

			var type = _this.data('type'), interval = _this.data('interval');

			if(_this.hasClass('active')){
				_this.siblings().removeClass('active');
				if(interval===''){
					customerVM.filters[names[type][0]] = '';
					customerVM.filters[names[type][1]] = '';
				}else{
					customerVM.filters[names[type][0]] = type=='time' ? CONFIG.quickTime[interval].split('&')[0]:interval.split('-')[0];
					customerVM.filters[names[type][1]] = type=='time' ? CONFIG.quickTime[interval].split('&')[1]:interval.split('-')[1];
				}
			}else{
				customerVM.filters[names[type][0]] = '';
				customerVM.filters[names[type][1]] = '';
			}
		},
		searchEv:function(){
			customerVM.$model.filters.index = 0;
			CONFIG.searching = true;
			p_cus.initTblData.bind(p_cus)();
		},
		sortEv:function(){
			var _this = $(this);
			customerVM.filters.orderName = _this.data('name');
			if(_this.hasClass('sorting') || _this.hasClass('sorting_asc')){
				_this.attr('class','sorting_desc');
				customerVM.$model.filters.orderType = 'desc';
			}else{
				_this.attr('class','sorting_asc');
				customerVM.$model.filters.orderType = 'asc';
			}
			_this.siblings('[class^="sorting_"]').attr('class','sorting');

			customerVM.$model.filters.index = 0;
			p_cus.initTblData.bind(p_cus)();
		},
		exportEv:function(e){
			var pms = $.extend({},customerVM.$model.filters), t=[];
			pms.startTime = Utils.getUnixTime(pms.startTime);
			pms.endTime = Utils.getUnixTime(pms.endTime);
			pms.maxOrderPayment = $.trim(pms.maxOrderPayment)===''?'':avalon.filters.parseNumber(pms.maxOrderPayment,2);
			pms.minOrderPayment = $.trim(pms.minOrderPayment)===''?'':avalon.filters.parseNumber(pms.minOrderPayment,2);
			pms.maxOrderCount = $.trim(pms.maxOrderCount)===''?'':avalon.filters.parseNumber(pms.maxOrderCount,0);
			pms.minOrderCount = $.trim(pms.minOrderCount)===''?'':avalon.filters.parseNumber(pms.minOrderCount,0);
			pms.keywords = $.trim(pms.keywords);
			pms.hasCard = pms.hasCard!==''? ~~pms.hasCard>0 : '';
			
			if(pms.startTime || pms.endTime)
			t.push('加入时间：'+Utils.getLocalTime(pms.startTime)+'~'+Utils.getLocalTime(pms.endTime));

			if(pms.minOrderPayment || pms.maxOrderPayment)
			t.push('消费金额：'+pms.minOrderPayment+'~'+pms.maxOrderPayment);

			if(pms.minOrderCount || pms.maxOrderCount)
			t.push('消费单数：'+pms.minOrderCount+'~'+pms.maxOrderCount);

			t.push('是否关注公众号：'+ (pms.subscribe===''?'全部':(pms.subscribe=='1'?'已关注':'未关注')));
			t.push('是否申请会员卡：'+ (pms.hasCard===''?'全部':(pms.hasCard===true?'已申请':'未申请')));
			t.push('所属导购：'+ (pms.salesId===''?'全部导购':$('#salesSlt').select2('data').text));

			if(pms.keywords)
			t.push('查询关键词：'+	pms.keywords);

			pms.parmssJsonCn = JSON.stringify(t);

			$(e.target).uiLoading('sm');
			$.post("exportCustomerList.json",pms)
			.done(function(data){
				if(data.status=="0"){
					dialog({
			            title:"报表导出成功",
			            id:"util-export",
			            fixed: true,
			            content: '报表正在生成中，可前往报表中心下载',
			            width:300,
			            okValue: '前往报表中心',
			            cancelValue:'返回',
			            backdropOpacity:"0.3",
			            ok:function(){
			            	window.open("exportList.htm");
			            },
			            cancel:function(){}
		        }).showModal();
				}else{
					Utils.alert(data.errmsg || "系统繁忙，请稍后再试");
				}
				$(e.target).uiLoading('sm');
			})
			.fail(function(){
				toastr.error('数据报表生成失败，服务器繁忙！');
				$(e.target).uiLoading('sm');
			});
		}
	});

	p_cus = {
		init:function(){
			$('[name="customer"]','#mainMenusBox').addClass('active');
			this.initTimePiker();
			this.initSlt();
			this.initStatCount();
			this.initTblData();
			this.u_logoutEv();
			this.salesChangeEv();
			this.select2Ev();
			this.getPosition();
			this.highGradeToggleEv();
		},
		highGradeToggleEv:function(){
			$(".hGClassfiy").on('click',function(){
				$(".highGrade").toggleClass("highDisplay");
				if($(".hGClassfiy").text()=="会员高级筛选"){
					$(".hGClassfiy").text("会员基本筛选");
				}
				else{
					$(".hGClassfiy").text("会员高级筛选");
				}
			});
		},
		getPosition:function(){
			var loc = new Location();
			var title   = ['省份' , '地级市' , '市、县、区'];
			$.each(title , function(k , v) {
				title[k]    = '<option value="">'+v+'</option>';
			});
			$('#loc_province').append(title[0]);
			$('#loc_city').append(title[1]);
			$('#loc_town').append(title[2]);
			loc.fillOption('loc_province' , '0');
			$("#loc_province,#loc_city,#loc_town").select2();
			
			$('#loc_province').change(function() {
				$('#loc_city').empty();
				if($(this).val()){
					loc.fillOption('loc_city' , '0,'+$('#loc_province').val());
					$('input[name=province]').val($(this).find("option:selected").text());
					$('#loc_city').change();
				}else{
					$('input[name=province],input[name=city],input[name=district]').val("");
					$('#loc_city').html(title[1]).change();
					$('#loc_town').html(title[2]).change();
				}
			});
			$('#loc_city').change(function() {
				$('#loc_town').empty();
				if($(this).val()){
					loc.fillOption('loc_town' , '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
					$('input[name=city]').val($(this).find("option:selected").text());
				}
				$('#loc_town').change();
			});
			$('#loc_town').change(function() {
				$('input[name=district]').val($(this).find("option:selected").text());
			});
		},
		select2Ev:function(){
			$("#pubNumSlt,#vipNumSlt,#bindGuide,#gender,#mebTags,#meblevel").select2({
				minimumResultsForSearch: -1
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
		initTimePiker:function(){
			$.initDatePicker([
					{ST:'#cusListDateStart', ET:'#cusListDateEnd'},
					{ST:'#ST2', ET:'#ET2'}
				]);


			// $("#cusListDateStart").on("click",function(){
			// 	WdatePicker({
   //      		startDate:'%y-%M-%d 00:00:00',
			// 			dateFmt:'yyyy-MM-dd HH:mm:ss',
			// 			qsEnabled:false,
			// 			maxDate:'%y-%M-%d',
			// 			minDate:'#F{$dp.$D(\'cusListDateEnd\',{M:-3});}'
			// 	});
			// });

			// $("#cusListDateEnd").on("click",function(){
			// 		WdatePicker({
		 //        startDate:'%y-%M-%d 23:59:59',
			// 			dateFmt:'yyyy-MM-dd HH:mm:ss',
			// 			qsEnabled:false,
			// 			maxDate: $("#cusListDateStart").val() ? '#F{$dp.$D(\'cusListDateStart\',{M:3})}' : '%y-%M-%d',
			// 			minDate:'#F{$dp.$D(\'cusListDateStart\');}'
			// 		});
			// });
		},
		initSlt:function(){
			var self = this;
			$.post(CONFIG.apiStore).done(function(data){
				if(data.status === '0'){
					var storeD = data.result.storeVoList;

					var storesSltData =[{id:' ', text:'所有门店'}].concat(storeD.map(function(v){
						return {id:v.store.id, text:v.store.name||'无'};
					}).filter(function(v){
						if(v) return v;
					}));

					$('#storeSlt').select2({data: storesSltData, width: "174"}).val(' ').trigger('change');
					$('#salesSlt').select2({data:[{id: ' ', text: "所有导购"}], width:'174'}).val(' ').trigger('change');

					$('#storeSlt').on('change', function(){
						var strId = $.trim($(this).val());
						customerVM.filters.storeId = strId;
						if(strId===''){
							$('#salesSlt').select2({data:[{id: ' ', text: "所有导购"}], width:'174'}).val(' ').trigger('change');
						}else{
							self.getSalesByStoreId();
						}
					});
				}else{
					toastr.error('服务器繁忙!');
				}
			}).fail(function(){
				toastr.error('服务器繁忙!');
			});
		},
		salesChangeEv:function(){
			$('#salesSlt').on('change', function(){ customerVM.filters.salesId = $.trim($(this).val()); });
		},
		getSalesByStoreId:function(){
			$.post(CONFIG.apiSales,{storeId:customerVM.$model.filters.storeId})
				.done(function(data){
					if(data.status === '0'){
						var salesSltData = [{id:' ', text:'所有导购'}].concat(data.result.salesAdminVoList.map(function(v,i){
							return {id:v.salesId, text:v.name||'无'};
						}));
						$('#salesSlt').empty().select2({data: salesSltData, width: "174"}).val(' ').trigger('change');
					}
				})
				.fail(function(){
					toastr.warning('未获取到导购数据');
				});
		},
		initTblData:function(){
			var self = this;
			var url = CONFIG.apiCusList;
			$('#cusListTbl').uiLoading('lg');
			CONFIG.searching && $('#searchCusBtn').uiLoading('sm');
			var pms = $.extend({},customerVM.$model.filters);
			pms.startTime = Utils.getUnixTime(pms.startTime);
			pms.endTime = Utils.getUnixTime(pms.endTime);
			pms.maxOrderPayment = $.trim(pms.maxOrderPayment)===''?'':avalon.filters.parseNumber(pms.maxOrderPayment,2);
			pms.minOrderPayment = $.trim(pms.minOrderPayment)===''?'':avalon.filters.parseNumber(pms.minOrderPayment,2);
			pms.maxOrderCount = $.trim(pms.maxOrderCount)===''?'':avalon.filters.parseNumber(pms.maxOrderCount,0);
			pms.minOrderCount = $.trim(pms.minOrderCount)===''?'':avalon.filters.parseNumber(pms.minOrderCount,0);
			pms.keywords = pms.keywords;
			pms.hasCard = pms.hasCard!==''? ~~pms.hasCard>0 : '';

			var $pageBox = $('#cusNavPagesNumBox');
			$.post(url, pms)
			.done(function(data){
				if(data.status==='0'){
					var d = data.result.customerStatInfoVoList;
					if(d.length){
						self.renderList2Tbl(d);
						$("#fixedTable").setTheadFixed();
						var count = data.result.count;
						var totalP = Math.ceil(count/pms.length);
						$('#dataTotal').text(count);
						if(totalP>1){
							$pageBox.pagination({
								totalData:count,
								showData:30,
								coping:true,
								callback:function(i){
									pms.index = (i-1)*pms.length;
									$('#cusListTbl').uiLoading('lg');
									$.post(url, pms)
									.done(function(data){
										self.renderList2Tbl(data.result.customerStatInfoVoList);
										$('#cusListTbl').uiLoading('lg');
										setTimeout(function(){
											var t = $("#cusListTbl").offset().top-350;
											$("html,body").animate({scrollTop:t}, 500);
										}, 300);
									});
								}
							});
						}else{
							$pageBox.html('');
						}
					}else{
						$('#cusListTbd').html('<tr><td colspan="30"><p class="p20 c-8 text-center"> 未查询到相关数据 </p></td></tr>');
						$pageBox.html('');
						customerVM.tblTotal = 0;

					}
				}else{
					toastr.error('服务器繁忙');
					customerVM.tblTotal = 0;
				}
				$('#cusListTbl').uiLoading('lg');
				CONFIG.searching && $('#searchCusBtn').uiLoading('sm');
				CONFIG.searching = false;
			})
			.fail(function(data){
				toastr.error('服务器繁忙');
				$('#cusListTbd').html('<tr><td colspan="30"><p class="p20 c-8 text-center"> 数据查询失败 </p></td></tr>');
				$('#cusListTbl').uiLoading('lg');
				CONFIG.searching && $('#searchCusBtn').uiLoading('sm');
				CONFIG.searching = false;
				customerVM.tblTotal = 0;
			});
		},
		initStatCount:function(){
			$('#cusStatBox').uiLoading('lg');
			$.get(CONFIG.apiCusStatCount)
			.done(function(data){
				if(data.status==='0'){
					var d = data.result.customerStatCount;
					customerVM.customerSubAndBandingCount = d.customerSubAndBandingCount;
					customerVM.customerSubscribeCount = d.customerSubscribeCount;
					customerVM.customerPayCount = d.customerPayCount;
					customerVM.customerBandingCount = d.customerBandingCount;
				}else{
					toastr.error('服务器繁忙');
				}
				$('#cusStatBox').uiLoading('lg');
				$('.vs-hd').removeClass('vs-hd');
			})
			.fail(function(){
					toastr.error('服务器繁忙');
					$('#cusStatBox').uiLoading('lg');
			});
		},
		renderList2Tbl:function(data){
			var str = [], customer, gmt, cardNum, avatar, phone;
			for(var i in data){
				customer=data[i].customer;
				gmt = customer.gmtCreate ? avalon.filters.date(customer.gmtCreate, 'yyyy-MM-dd HH:mm:ss').split(' ').join('<br>'):'无';
				cardNum = customer.cardNo || '暂无';
				phone = customer.phone || '暂无';
				avatar = customer.avatar || 'https://qncdn.qiakr.com/mall/default-photo.png';

				str.push('<tr data-qiakrCustomerId="'+customer.qiakrCustomerId+'">');
				str.push('<td>'+ gmt +'</td>');
				str.push('<td><img src="'+avatar+'" class="img-circle" width="50" height="50" /><a title="'+customer.name+'" href="customerDetail.htm?customerId='+customer.id+'" target="_blank">'+avalon.filters.truncate(customer.name,10, '...')+'</a><br><div class="f12 mt5">卡号：'+cardNum+'</div><div class="f12 mt5">手机号：'+phone+'</div></td>');
				str.push('<td>'+ avalon.filters.gender(customer.gender) +'</td>');
				str.push('<td>'+ avalon.filters.truncate(data[i].salesName || '暂无',12,'') +'</td>');
				str.push('<td>'+ avalon.filters.truncate(data[i].storeName || '暂无',12,'') +'</td>');
				str.push('<td>'+ avalon.filters.number(data[i].orderCount, 0)+'</td>');
				str.push('<td>'+ avalon.filters.number(data[i].orderPayment, 2)+'</td>');
				str.push('<td>'+(data[i].subscribe=='1'?'已关注':'未关注')+'</td>');
				str.push('<td><a href="#!/customerDetail?customerId='+customer.id+'" target="_blank">查看详情</a></td>');
				str.push('</tr>');
			}
			$('#cusListTbd').html(str.join(''));
		}
	}

	return {
		init:function(){
			p_cus.init();
			avalon.scan($('#subContainer')[0]);
			$('[data-toggle="tooltip"]').tooltip();
		}
	};

});

