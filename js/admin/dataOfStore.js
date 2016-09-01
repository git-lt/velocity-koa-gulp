/**
 * [商户 模块]
 */
define(['toastr','daterangepicker','echarts','colVis','select2','twbsPagination','AppCard','dialog'],function(toastr){
	//===页面配置
	var CONFIG={
		getStores: 'getStoreList.json',
		getStoreDataBetween: 'getStoreDataBetween.json', //统计
	    getStoreDataStatList: 'getStoreDataStatList.json', //波型图
	    getStoreOrderRank: 'getStoreOrderRank.json', //店铺列表
	    exportStoreUrl: 'getStoreOrderRank.htm',
	    defaultstart: Util.getUnixTime(moment().subtract('days', 30).format('YYYY-M-D')), //最近30天
	    defaultend: Util.getUnixTime(moment().format('YYYY-M-D')),
	    storeChartOpt:{
	    	tooltip : { trigger: 'axis' },
	    	grid:{
	    	  x:50,
	    	  y:40,
	    	  x2:50,
	    	  y2:30
	    	},
	    	legend: {
	    	    data:["新增绑定会员数", "订单数", "销售额"]
	    	},
	    	toolbox: {
	    	    show : false,
	    	    feature : {
	    	        saveAsImage : {show: false}
	    	    }
	    	},
	    	calculable : false,
	    	xAxis : {
	    	  type : 'category',
	    	   boundaryGap: false, 
	    	  splitLine:{
	    	    show:false
	    	  },
	    	  data : []
	    	},
	    	yAxis : [{
	    	    type : 'value',
	    	    splitLine:{
	    	      lineStyle:{
	    	        width:1,
	    	        color:"#eee",
	    	        type:"dashed"
	    	      }
	    	    }
	    	},{
	    	    type : 'value',
	    	    position:'right',
	    	    splitLine : {show : false}
	    	}],
	    	series :[
	    	  {
	    	    name:'新增绑定会员数', 
	    	    type:'line', 
	    	    data:[]
	    	  },{
	    	    name:'订单数', 
	    	    type:'line', 
	    	    data:[]
	    	  },{
	    	    name:'销售额', 
	    	    type:'line', 
	    	    data:[]
	    	}]
	    }
	};

	var storeViewVM,  //门店VM
		store_chart,
	    p_store; //详情图表

	storeViewVM = avalon.define({
		$id:'storeCtrl',
		startTime:CONFIG.defaultstart,
		endTime:CONFIG.defaultend,
		storeId:0,
		index:0,
		allCustomerCount:0,
		// newCustomerCount:0,
		customerSubAndBandingCount:0,
		all_customerSubAndBandingCount:0,
		customerBandingCount:0,
		all_customerBandingCount:0,
		activeCustomerCount:0,
		activeProductCount:0,
		jointRate:0,
		orderCount:0,
		orderPayment:0,
		perOrderPayment:0,
		activeSalesCount:0,
		activeStoreCount:0,
		waitForProcessOrderCount:0,
		// all_newCustomerCount:0,
		all_activeCustomerCount:0,
		all_activeProductCount:0,
		all_orderCount:0,
		all_orderPayment:0,
		all_activeSalesCount:0,
		all_activeStoreCount:0,
		searchEv:function(){
			p_store.getStoreViewData.bind(p_store)();
			// p_store.renderStoreChart.bind(p_store)();
			p_store.initStoreListTbl.bind(p_store)();
		},
		exportEv:function(){
			var params = {
				startTime:storeViewVM.$model.startTime, 
				endTime:storeViewVM.$model.endTime,
				parmssJsonCn:JSON.stringify(['查询时间: '+Util.getLocalTime(storeViewVM.$model.startTime)+' ~ '+Util.getLocalTime(storeViewVM.$model.endTime-1000)])
			};
			$.post("exportStoreList.json",params,function(data){
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
					Util.alert(data.errmsg || "系统繁忙，请稍后再试");
				}
			});
		}
	});

	//===页面逻辑
	p_store = {
		init: function(){
		  this.initDateRange(); //初始化日期选择
		  this.initSltStore();
		  this.initChart();
		  this.initStoreListTbl();
		  this.tblGetDetailEv();
		},
		initDateRange:function(){
			var self = this;
			$('#reportrange2 span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));
			$('#reportrange2').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
				var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
				var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
				if(Math.floor((ET-ST)/(24*3600*1000))>90){
				  toastr.warning('请选择少于90天的时间！');
				  return fales;
				}
				
				storeViewVM.startTime = ST;
				storeViewVM.endTime = ET;
				$('#reportrange2 span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
			});
		},
		initSltStore:function(){
			var self = this;
			$.post(CONFIG.getStores).done(function(data){
				if(data.status==='0' && data.result.storeVoList){
					var stores = data.result.storeVoList;
					if(stores.length){
						var storeSltData = stores.map(function(v, i){
							return {id:v.store.id, text:v.store.name}
						});

						if(storeSltData.length){
							// 初始化门店下拉
							$('#sltStores').select2({data: storeSltData, width: "160"});
							$('#sltStores').on('change', function(){
								var storeId = $(this).val();
								storeViewVM.storeId = storeId;
								self.getStoreViewData.bind(self,storeId)();
								$('#storeListTbody tr').removeClass('info');
								$('[data-storeid="'+storeId+'"]').addClass('info');
							})
							storeViewVM.storeId = storeSltData[0].id;
							self.getStoreViewData.bind(self,storeSltData[0].id)();
						}else{
							toastr.warning('未获取到门店数据！');
						}
					}else{
						toastr.warning('未获取到门店数据！');
					}
				}
			}).fail(function(){
				toastr.warning('服务器繁忙，请稍候重试！');
			});
		},
		getStoreViewData:function(storeId){
			var self = this;
			var oCardBox = $('#storeCard');
			materialadmin.AppCard.addCardLoader(oCardBox);

			var pms = {
				storeId:storeId || storeViewVM.$model.storeId,
				startTime:storeViewVM.$model.startTime,
				endTime:storeViewVM.$model.endTime
			}
			var pmsAll = {
				storeId:storeId || storeViewVM.$model.storeId
			}
			$.when($.post(CONFIG.getStoreDataBetween,pms), $.post(CONFIG.getStoreDataBetween,pmsAll))
			.done(function(d1, d2){
				d1 = d1[0]; d2=d2[0];
				if(d1.status==='0'){
					var itemData = d1.result.orderStatItemVo;
					var statData = d1.result.orderStatVo;

					var allData = d2.result;
					storeViewVM.customerSubAndBandingCount = d1.result.newCustomerStatCount.customerSubAndBandingCount;
					storeViewVM.all_customerSubAndBandingCount = d2.result.newCustomerStatCount.customerSubAndBandingCount;
					storeViewVM.customerBandingCount = d1.result.newCustomerStatCount.customerBandingCount;
					storeViewVM.all_customerBandingCount = d2.result.newCustomerStatCount.customerBandingCount;

					storeViewVM.allCustomerCount = d1.result.allCustomerCount;
					storeViewVM.activeCustomerCount = itemData.activeCustomerCount;
					storeViewVM.all_activeCustomerCount = allData.orderStatItemVo.activeCustomerCount;
					storeViewVM.activeProductCount = itemData.activeProductCount;
					storeViewVM.all_activeProductCount = allData.orderStatItemVo.activeProductCount;
					storeViewVM.jointRate = itemData.jointRate;
					storeViewVM.orderCount = statData.orderCount;
					storeViewVM.all_orderCount = allData.orderStatVo.orderCount;
					storeViewVM.orderPayment = statData.orderPayment;
					storeViewVM.all_orderPayment = allData.orderStatVo.orderPayment;
					storeViewVM.perOrderPayment = statData.perOrderPayment;
					storeViewVM.activeSalesCount = statData.activeSalesCount;
					storeViewVM.all_activeSalesCount = allData.orderStatVo.activeSalesCount;
					storeViewVM.activeStoreCount = statData.activeStoreCount;
					storeViewVM.all_activeStoreCount = allData.orderStatVo.activeStoreCount;
					storeViewVM.waitForProcessOrderCount = statData.waitForProcessOrderCount;

					$('.ava-hide').removeClass('ava-hide');
				}else{
					toastr.error('获取数据错误！');
				}
				materialadmin.AppCard.removeCardLoader(oCardBox);
			}).fail(function(){
				toastr.error('服务器繁忙，请稍候重试！');
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});
			
			self.renderStoreChart.bind(self, storeId)();
		},
		renderStoreChart:function(storeId){
			var self = this;
			var pms = {
				storeId:storeId || storeViewVM.$model.storeId,
				startTime:storeViewVM.$model.startTime,
				endTime:storeViewVM.$model.endTime
			}
			// 波形图
			$.post(CONFIG.getStoreDataStatList,pms).done(function(data){
				if(data.status==='0'){
					var storeList = data.result.statYmdVoList;

					if(!storeList.length){
					  // 清空数据表
					  CONFIG.storeChartOpt.xAxis.data = [0];
					  CONFIG.storeChartOpt.series[0].data = [0];
					  CONFIG.storeChartOpt.series[1].data = [0];
					  CONFIG.storeChartOpt.series[2].data = [0];
					}else{
					  // 行转列 - > 图表 
					  var chartsData = Util.chartsDataFormat(storeList);
					  CONFIG.storeChartOpt.xAxis.data = chartsData.ymd.map(function(v,i){ 
			              return avalon.filters.date(v,'MM.dd')
		              }); 
					  CONFIG.storeChartOpt.series[0].data = chartsData.customerBandingCount;
					  CONFIG.storeChartOpt.series[1].data = chartsData.orderCount;
					  CONFIG.storeChartOpt.series[2].data = chartsData.orderPayment;
					}
					
					store_chart.clear().setOption(CONFIG.storeChartOpt);
				}else{
					toastr.error('获取数据错误！');
				}
			}).fail(function(){
				toastr.error('服务器繁忙，请稍候重试！');
			});
		},
		tblGetDetailEv:function(){
			var self = this;
			$('#storeListTbody').on('click','tr', function(){
				var sid = $(this).data('storeid');
				$(this).addClass('info').siblings().removeClass('info');
				$('#sltStores').val(sid).trigger('change');
			})
		},
		initStoreListTbl:function(storeId){
			var self = this;
			var pms = {
				startTime: storeViewVM.$model.startTime,
				endTime: storeViewVM.$model.endTime,
				index: storeViewVM.$model.index,
				length: 5
			};

			$.post(CONFIG.getStoreOrderRank, pms)
			.done(function(data){
				if(data.status==='0'){
					var d = data.result.storeRandList;
					if(d.length){
						// 渲染数据
						self.renderList2Tbl(d);
						
						var totalP = Math.ceil(data.result.count/pms.length);
						if(totalP>1){
							$('#navPagesNumBox').data({'opt':pms, 'url':CONFIG.getStoreOrderRank});

							// 初始化页码选择事件
							$('#navPagesNumBox').data('twbs-pagination','').off().empty().twbsPagination({
							    totalPages: totalP,
							    startPage: 1,
							    visiblePages: 10,
							    onPageClick:function(e, num){
							        // 异步获取数据并渲染 
							        var info = $('#navPagesNumBox').data(),
							            opt = info.opt,
							            postUrl = info.url;
							        opt.index = (num-1)*opt.length;
							        storeViewVM.index=opt.index;

							        $.ajax({
							            url:postUrl,
							            data:opt,
							            dataType:'json',
							            method:'POST'
							        }).done(function(data){
							            // 渲染数据
							            self.renderList2Tbl(data.result.storeRandList);
							        });
							    }
							});
						}else{
							$('#navPagesNumBox').html('');
						}
					}else{
						$('#storeListTbody').html('<tr><td colspan="11" class="tc c-8"> 未查询到相关数据 </td></tr>');
						$('#navPagesNumBox').html('');
					}
				}
			}).fail(function(){
				toastr.error('服务器繁忙，请稍候重试！');
			});
		},
		renderList2Tbl:function(data){
		var str = [];
		for(var i in data){
				str.push('<tr data-storeid="'+data[i].storeId+'">');
				str.push('<td><p class="ell" style="max-width:14em;">'+ data[i].storeName+'</p></td>');

				str.push('<td>'+ data[i].newCustomerStatCount.customerSubAndBandingCount+'</td>');
				str.push('<td>'+ data[i].allCustomerStatCount.customerSubAndBandingCount+'</td>');
				str.push('<td>'+ data[i].newCustomerStatCount.customerBandingCount+'</td>');
				str.push('<td>'+ data[i].allCustomerStatCount.customerBandingCount+'</td>');

				str.push('<td>'+ data[i].orderStatItemVo.activeProductCount+'</td>');
				str.push('<td>'+ data[i].orderStatVo.activeSalesCount+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.activeCustomerCount+'</td>');
				str.push('<td>'+ data[i].orderStatVo.orderCount+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.shoppingCount+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.jointRate +'</td>');
				str.push('<td>'+ data[i].orderStatVo.orderPayment +'</td>');
				str.push('<td><a href="javascript:;" class="getDetail c-bl" data-storeid="'+data[i].storeId+'">查看</a></td>');
				str.push('</tr>');
			}
			$('#storeListTbody').html(str.join(''));
		},
		initChart:function(){
			store_chart = echarts.init($('#storeListChartBox')[0]);
		}
	};

	//===页面初始化
	return {
		init:function(){
			p_store.init();
			avalon.scan($('#viewContentBox')[0]);
		}
	};

});

