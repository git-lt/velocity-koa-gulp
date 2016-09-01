/**
 * [导购 模块]
 */
define(['toastr','daterangepicker','echarts','twbsPagination','select2','AppCard','dialog'],function(toastr){

	//===页面配置
	var CONFIG={
		getSalesRank:'getSalesRank.json',
		getStores:'getStoreList.json',
		getSales:'getSalesListOfStore.json', //storeId
		getSalesDataBetween:'getSalesDataBetween.json', //概览
		getSalesDataStatList: 'getSalesDataStatList.json', //列表
		getSalesOrderRank: 'getSalesOrderRank.json', //排行
		defaultstart: Util.getUnixTime(moment().subtract('days', 30).format('YYYY-M-D')), 
		defaultend : Util.getUnixTime(moment().format('YYYY-M-D')),
		viewChartOpt:{
		    tooltip : { trigger: 'axis' },
		    grid:{
		      x:50,
		      y:80,
		      x2:50,
		      y2:80
		    },
		    legend: {
		        data:["绑定会员数", "订单数", "订单额"]
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
		        name:'绑定会员数', 
		        type:'line', 
		        data:[],
		        markPoint : {
		              data : [
		                  {type : 'max', name: '最大值'},
		                  {type : 'min', name: '最小值'}
		              ]
		          },
		          markLine : {
		              data : [
		                  {type : 'average', name: '平均值'}
		              ]
		          }
		      },{
		        name:'订单数', 
		        type:'line', 
		        data:[],
		        markPoint : {
		              data : [
		                  {type : 'max', name: '最大值'},
		                  {type : 'min', name: '最小值'}
		              ]
		          },
		          markLine : {
		              data : [
		                  {type : 'average', name: '平均值'}
		              ]
		          }
		      },{
		        name:'订单额', 
		        type:'line', 
		        data:[],
		        markPoint : {
		              data : [
		                  {type : 'max', name: '最大值'},
		                  {type : 'min', name: '最小值'}
		              ]
		          },
		          markLine : {
		              data : [
		                  {type : 'average', name: '平均值'}
		              ]
		          }
		      }
		    ]
		},
		rankChartOpt:{
			title : { text: '导购订单数排行' },
			grid:{
			  x:80,
			  y:50,
			  x2:50,
			  y2:30
			},
			tooltip : {
			        trigger: 'axis',
			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
			        }
			    },
			    legend: {
			        data:['订单数']
			    },
			    toolbox: {
			        show : true,
			        feature : {
			            saveAsImage : {show: true}
			        }
			    },
			    calculable : true,
			    xAxis : [{ type : 'value'}],
			    yAxis : [{ type : 'category', data : [] }],
			    series : [
			        {
			            name:'订单数',
			            type:'bar',
			            stack: '总量',
			            itemStyle : { normal: {label : {show: true, position: 'insideRight'}}},
			            data:[]
			        }
			    ]
		},
		rankChartROpt:{
			title : { text: '导购销售额排行' },
			grid:{
			  x:80,
			  y:50,
			  x2:50,
			  y2:30
			},
			tooltip : {
			        trigger: 'axis',
			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
			        },
			        formatter:'{b}<br>{c} 元'
			    },
			    legend: {
			        data:['订单额']
			    },
			    toolbox: {
			        show : true,
			        feature : {
			            saveAsImage : {show: true}
			        }
			    },
			    calculable : true,
			    xAxis : [{ type : 'value'}],
			    yAxis : [{ type : 'category', data : [] }],
			    series : [
			        {
			            name:'订单额',
			            type:'bar',
			            stack: '总量',
			            itemStyle : { 
			            	normal: {label : {show: true, position: 'insideRight'},color: '#5AB1EF'}
			        	},
			            data:[]
			        }
			    ]
		}
	};

	var salesTbl_VM,
		salesChart_VM,
	    p_sales,
	    view_Chart,
	  	rank_Chart,
	  	rank_Chart_R,
	  	isFirstInitSales=true; //详情图表

	salesTbl_VM = avalon.define({
		$id:'viewCtr',
		startTime:CONFIG.defaultstart,
		endTime:CONFIG.defaultend,
		storeId:'',
		salesId:'',
		salesName:'',
		sortName:'',
		sortType:'',
		keywords:'',
		searchEv:function(){
			// p_sales.getChartData.bind(p_sales)();
			p_sales.getTblData.bind(p_sales)();
			p_sales.getRankData.bind(p_sales)();
		},
		sortEv:function(){
			var _this = $(this);
			salesTbl_VM.sortName = _this.data('name');

			if(_this.hasClass('sorting') || _this.hasClass('sorting_asc')){
				_this.attr('class','sorting_desc');
				salesTbl_VM.sortType = 'desc';
			}else{
				_this.attr('class','sorting_asc');
				salesTbl_VM.sortType = 'asc';
			}
			_this.siblings('[class^="sorting_"]').attr('class','sorting');
			// list_VM.index=0;
			// list_VM.length=10;

			// 获取数据
			p_sales.getTblData.bind(p_sales)();
		},
		exportEv:function(){
			var parmssJsonCn=['查询时间: '+Util.getLocalTime(salesTbl_VM.$model.startTime)+' ~ '+Util.getLocalTime(salesTbl_VM.$model.endTime-1000)];
			if(~~$("#sltStores2").val()>0){
				parmssJsonCn.push('所属门店：'+$("#sltStores2 option:selected").text());
			}
			if($.trim($("#keywords").val())){
				parmssJsonCn.push('导购名称：'+$("#keywords").val());
			}
			var params = {
				startTime: salesTbl_VM.$model.startTime,
				endTime: salesTbl_VM.$model.endTime,
				keywords: salesTbl_VM.$model.keywords,
				storeId: salesTbl_VM.$model.storeId,
				parmssJsonCn:JSON.stringify(parmssJsonCn)
			}
			$.post("exportSalesList.json",params,function(data){
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
					Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				}
			});
		}
	});

	salesChart_VM = avalon.define({
		$id:'salesChartCtr',
		salesId:0,
		startTime:CONFIG.defaultstart,
		endTime:CONFIG.defaultend,
		// newCustomerCount:0,
		customerSubAndBandingCount:0,
		all_customerSubAndBandingCount:0,
		customerBandingCount:0,
		all_customerBandingCount:0,
		activeCustomerCount: 0,
		activeProductCount: 0,
		jointRate: 0,
		orderCount: 0,
		orderPayment: 0,
		perOrderPayment: 0,
		shoppingCount: 0,
		// all_newCustomerCount:0,
		all_orderPayment:0,
		all_shoppingCount:0,
		all_orderCount:0,
		all_activeCustomerCount:0,
		searchEv:function(){
			p_sales.getChartData.bind(p_sales)();
		}
	});

	//===页面逻辑
	p_sales = {
		init:function(){
			isFirstInitSales = true;
			this.initDateRange(); //初始化日期选择
			this.initCharts(); 	//初始化图表
			this.initSlt();
			this.tblGetDetailEv();
		},
		initSlt:function(){
			var self = this;
			$.post(CONFIG.getStores).done(function(data){
				if(data.status==='0' && data.result.storeVoList){
					var stores = data.result.storeVoList;
					if(stores.length){
						var storeSltData = stores.map(function(v, i){
							return {id:v.store.id, text:v.store.name}
						}).filter(function(v,i){
							if(v) return v;
						});
						var allStoreItem = $("#subStore").val()=="yes" ? [] : [{id:' ', text:'所有门店'}];
						if(storeSltData.length){
							storeSltData = allStoreItem.concat(storeSltData);
							salesTbl_VM.storeId = $.trim(storeSltData[0].id);
							self.getRankData();
							// 初始化门店下拉
							$('#sltStores2').select2({data: storeSltData, width: "160"});
							self.storeChangeEv.bind(self)();
						}else{
							$('#salesListTbody td:first').html('<div class="tc">导购列表为空</div>');
							$('#sltStores2').select2({data: allStoreItem, width: "160"});
						}
					}else{
						// toastr.warning('未获取到门店数据！');
						$('#salesListTbody td:first').html('<div class="tc">导购列表为空</div>');
					}
				}
			}).fail(function(){
				toastr.warning('服务器繁忙，请稍候重试！');
			});
		},
		storeChangeEv:function(){
			var self = this;
			$('#sltStores2').on('change', function(){
				var stId = $.trim($(this).val());
				salesTbl_VM.storeId = stId;
			}).trigger('change');
			$('#searchDataSalse').trigger('click');
		},
		salesChangeEv: function(){
			// var self = this;
			// $('#sltSales2').on('change', function(){
			// 	var sId = $(this).val();
			// 	salesTbl_VM.salesId = sId;
			// 	$('#salesListTbody tr').removeClass('info');
			// 	$('[data-salesid="'+sId+'"]').addClass('info');
			// }).trigger('change');
		},
		getSalesData:function(storeId){
			var self = this;
			if(storeId){
				// 根据第一个门店获取导购
				$.post(CONFIG.getSales,{storeId:storeId}).done(function(data){
					if(data.status === '0'){
						var salesSltData = data.result.salesAdminVoList.map(function(v,i){
							return {id:v.salesId, text:v.name};
						});
						// 初始化导购下拉
						$('#sltSales2').empty().select2({data: salesSltData, width: "160"});

						if(isFirstInitSales){
							self.salesChangeEv.bind(self,salesSltData[0].id)();
							isFirstInitSales = false;
						}
						
						salesTbl_VM.salesId = salesSltData[0].id;
					}
				}).fail(function(data){
					toastr.warning('未获取到导购数据！');
				});
			}
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

				$('#reportrange2 span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
				salesTbl_VM.startTime =  ST;
				salesTbl_VM.endTime = ET;
		 	});
		},
		initCharts:function(){
			view_Chart = echarts.init($('#viewChartBox')[0]);
			rank_Chart = echarts.init($('#rankChartBoxL')[0], 'macarons');
			rank_Chart_R = echarts.init($('#rankChartBoxR')[0], 'macarons');
		},
		getTblData:function(){
			var self = this;
			var oCardBox = $('#salesTblCard');
			materialadmin.AppCard.addCardLoader(oCardBox);

			var listPms = {
				index:0,
				length:5,
				startTime: salesTbl_VM.$model.startTime,
				endTime: salesTbl_VM.$model.endTime,
				keywords: salesTbl_VM.$model.keywords,
				sortName: salesTbl_VM.$model.sortName,
				sortType: salesTbl_VM.$model.sortType,
				storeId: salesTbl_VM.$model.storeId
			}

			$.post(CONFIG.getSalesRank, listPms).done(function(data){
				if(data.status==='0'){
					var d = data.result.storeRandList;
					if(d.length){
						self.renderList2Tbl(d);
						$('#salesListTbody tr:first').trigger('click');
						var totalP = Math.ceil(data.result.count/listPms.length);
						if(totalP>1){
							$('#salesNavPagesNumBox').data({'opt':listPms, 'url':CONFIG.getSalesRank});

							$('#salesNavPagesNumBox').data('twbs-pagination','').off().empty().twbsPagination({
							    totalPages: totalP,
							    startPage: 1,
							    visiblePages: 10,
							    onPageClick:function(e, num){
							        var info = $('#salesNavPagesNumBox').data(),
							            opt = info.opt,
							            postUrl = info.url;
							        opt.index = (num-1)*opt.length;
							        materialadmin.AppCard.addCardLoader(oCardBox);
							        $.ajax({
							            url:postUrl,
							            data:opt,
							            dataType:'json',
							            method:'POST'
							        }).done(function(data){
						            self.renderList2Tbl(data.result.storeRandList);
						            materialadmin.AppCard.removeCardLoader(oCardBox);
							        });
							    }
							});
						}else{
							$('#salesNavPagesNumBox').html('');
						}
					}else{
						$('#salesListTbody').html('<tr><td colspan="11" class="tc c-8"> 未查询到相关数据 </td></tr>');
						$('#salesNavPagesNumBox').html('');
					}
				}else{
					toastr.error('服务器繁忙');
				}
				materialadmin.AppCard.removeCardLoader(oCardBox);
			}).fail(function(){
				toastr.error('服务器繁忙');
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});
		},
		getChartData:function(salesId){
			var self = this;
			var pms = {
				salesId: salesId || salesTbl_VM.$model.salesId,
				startTime: salesTbl_VM.$model.startTime,
				endTime: salesTbl_VM.$model.endTime
			};
			var pms_all = {salesId: salesId || salesTbl_VM.$model.salesId};

			$.when($.post(CONFIG.getSalesDataBetween, pms), $.post(CONFIG.getSalesDataStatList, pms), $.post(CONFIG.getSalesDataBetween, pms_all))
			.done(function(d1, d2, d3){
				d1 = d1[0]; d2 = d2[0]; d3=d3[0];
				if(d1.status==='0' && d2.status==='0'){
					var viewData = d1.result.orderStatItemVo;
					var listData = d2.result.statYmdVoList;
					var allData = d3.result.orderStatItemVo;
					// salesChart_VM.newCustomerCount = d1.result.newCustomerCount;
					salesChart_VM.customerSubAndBandingCount = d1.result.newCustomerStatCount.customerSubAndBandingCount;
					salesChart_VM.all_customerSubAndBandingCount = d3.result.newCustomerStatCount.customerSubAndBandingCount;
					salesChart_VM.customerBandingCount = d1.result.newCustomerStatCount.customerBandingCount;
					salesChart_VM.all_customerBandingCount = d3.result.newCustomerStatCount.customerBandingCount;

					salesChart_VM.activeCustomerCount = viewData.activeCustomerCount;
					salesChart_VM.activeProductCount = viewData.activeProductCount;
					salesChart_VM.jointRate = viewData.jointRate;
					salesChart_VM.orderCount = viewData.orderCount;
					salesChart_VM.orderPayment = viewData.orderPayment;
					salesChart_VM.perOrderPayment = viewData.perOrderPayment;
					salesChart_VM.shoppingCount = viewData.shoppingCount;

					// salesChart_VM.all_newCustomerCount = d3.result.newCustomerCount;
					salesChart_VM.all_orderPayment = allData.orderPayment;
					salesChart_VM.all_shoppingCount = allData.shoppingCount;
					salesChart_VM.all_orderCount = allData.orderCount;
					salesChart_VM.all_activeCustomerCount = allData.activeCustomerCount;

					if(!listData.length){
					  CONFIG.viewChartOpt.xAxis.data = [0];
					  CONFIG.viewChartOpt.series[0].data = [0];
					  CONFIG.viewChartOpt.series[1].data = [0];
					  CONFIG.viewChartOpt.series[2].data = [0];
					}else{
					  var chartsData = Util.chartsDataFormat(listData);
					  CONFIG.viewChartOpt.xAxis.data = chartsData.ymd.map(function(v,i){ 
              return avalon.filters.date(v,'MM.dd');
            }); 
					  CONFIG.viewChartOpt.series[0].data = chartsData.customerBandingCount;
					  CONFIG.viewChartOpt.series[1].data = chartsData.orderCount;
					  CONFIG.viewChartOpt.series[2].data = chartsData.orderPayment;
					}
					
					view_Chart.clear().setOption(CONFIG.viewChartOpt);
				}
			})
			.fail(function(data){
				toastr.error('获取导购数据失败！');
			});
		},
		getRankData:function(){
			var oCardBox = $('#salesRankCard');
			materialadmin.AppCard.addCardLoader(oCardBox);

			var pmsL ={
				startTime: salesTbl_VM.$model.startTime,
				endTime: salesTbl_VM.$model.endTime,
				storeId: salesTbl_VM.$model.storeId,
				sortName: 'orderCount',
				sortType: 'DESC',
				length: 20
			}

			var pmsR ={
				startTime: salesTbl_VM.$model.startTime,
				endTime: salesTbl_VM.$model.endTime,
				storeId: salesTbl_VM.$model.storeId,
				sortName: 'orderPayment',
				sortType: 'DESC',
				length: 20
			}

			$.when($.post(CONFIG.getSalesOrderRank, pmsL), $.post(CONFIG.getSalesOrderRank, pmsR))
			.done(function(d1, d2){
				d1 = d1[0]; d2 = d2[0];

				if(d1.status === '0' && d2.status==='0'){
					var rankDataL = d1.result.salesOrderRank;
					var rankDataR = d2.result.salesOrderRank;

					if(!rankDataL.length){
					  CONFIG.rankChartOpt.yAxis[0].data = [0];
					  CONFIG.rankChartOpt.series[0].data = [0];

					  CONFIG.rankChartROpt.yAxis[0].data = [0];
					  CONFIG.rankChartROpt.series[0].data = [0];
					}else{
					  var chartsDataL = Util.chartsDataFormat(rankDataL);
					  var chartsDataR =  Util.chartsDataFormat(rankDataR);

					  CONFIG.rankChartOpt.yAxis[0].data = chartsDataL.salesName.map(function(v,i){ return v||''}).reverse();
					  CONFIG.rankChartOpt.series[0].data = chartsDataL.orderCount.reverse();

					  CONFIG.rankChartROpt.yAxis[0].data = chartsDataR.salesName.map(function(v,i){ return v||''}).reverse();
					  CONFIG.rankChartROpt.series[0].data = chartsDataR.orderPayment.reverse();
					}

					rank_Chart.clear().setOption(CONFIG.rankChartOpt);
					rank_Chart_R.clear().setOption(CONFIG.rankChartROpt);
				}else{
					toastr.error('获取排行数据失败！');
				}
				materialadmin.AppCard.removeCardLoader(oCardBox);
			})
			.fail(function(){
				toastr.error('服务器繁忙！');
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});
		},
		tblGetDetailEv:function(){
			var self = this;
			$('#salesListTbody').on('click','tr', function(){
				var sid = $(this).data('salesid');
				var sName = $(this).data('salesname');
				$(this).addClass('info').siblings().removeClass('info');
				salesTbl_VM.salesId = sid;
				salesTbl_VM.salesName = sName;
				self.getChartData.bind(self, sid)();
			})
		},
		renderList2Tbl:function(data){
			var str = [];
			for(var i in data){
				str.push('<tr data-salesid="'+data[i].salesId+'" data-salesname="'+ data[i].salesName +'">');
				str.push('<td><p class="ell" style="max-width:10em;">'+ data[i].salesName+'</p></td>');
				str.push('<td>'+ data[i].newStars+'</td>');
				str.push('<td>'+ data[i].newStars+'</td>');
				str.push('<td>'+ data[i].newCustomerStatCount.customerSubAndBandingCount+'</td>');
				str.push('<td>'+ data[i].newCustomerStatCount.customerBandingCount+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.activeCustomerCount+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.orderCount+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.shoppingCount+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.orderPayment +'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.jointRate +'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.perOrderPayment+'</td>');
				str.push('<td>'+ data[i].orderStatItemVo.deduct+'</td>');
				str.push('<td><a href="javascript:;" class="getDetail c-bl" data-salesId="'+data[i].salesId+'">查看</a></td>');
				str.push('</tr>');
			}
			$('#salesListTbody').html(str.join(''));
		}
	};

	//===页面初始化
	return {
		init:function(){
			p_sales.init();
			avalon.scan($('#viewContentBox')[0]);
		}
	};

});

