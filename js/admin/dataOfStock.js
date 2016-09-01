/**
 * [商品 模块]
 */
define(['toastr','daterangepicker','echarts','AppCard'],function(toastr){

	var CONFIG={
		getProductDataBetween: 'getProductDataBetween.json',
		getProductDataStatList: 'getProductDataStatList.json',
		getProductOrderRank: 'getProductOrderRank.json',
		getStores:'getStoreList.json',
		getCategorys: 'querySupplierCategoryList.json',
		getBrands: 'getSupplierBrandList.json',
		defaultstart: Util.getUnixTime(moment().subtract('days', 30).format('YYYY-M-D')), //最近30天
		defaultend: Util.getUnixTime(moment().format('YYYY-M-D')),
		stockListChartOpt:{
		    tooltip : { trigger: 'axis' },
		    grid:{
		      x:80,
		      y:150,
		      x2:50,
		      y2:80
		    },
		    legend: {
		        data:["动销会员数", "订单数", "订单额"]
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
		        name:'动销会员数', 
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
		stockRankOptL:{
			title : { text: '商品订单数排行' },
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
		        show : false
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
		stockRankOptR:{
			title : { text: '商品销售额排行' },
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
			        show : false
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

	var stockPreview_VM,  //概览
	    p_stock,
	    stockListChart,
	  	stockRankChartL,
	  	stockRankChartR;

// storeId=1&categoryId=2&brandId=3&startTime=1446307200000&endTime=1448035200000
  	

	//===逻辑
	p_stock = {
		init: function(){
			this.initVM();
			this.initDateRange();
			this.initCharts();
			this.initSlt();
		},
		initVM:function(){
			stockPreview_VM = avalon.define({
				$id:'stockPreviewCtrl',
				startTime:CONFIG.defaultstart,
				endTime:CONFIG.defaultend,
				storeId:'',
				categoryId:'',
				brandId:'',
				categoryFamilyId:'',
				activeProductCount:0,
				shoppingCount:0,
				jointRate:0,
				orderPayment:0,
				allProductCount:0,
				newProductCount:0,
				offProductCount:0,
				searchEv:function(){
					p_stock.getPreviewData.bind(p_stock)();
					p_stock.getRankData.bind(p_stock)();
				}
			});
		},
		initSlt:function(){
			var self = this, cateSltData=[];
			$.when($.post(CONFIG.getStores), $.post(CONFIG.getBrands), $.post(CONFIG.getCategorys))
			.done(function(d1, d2, d3){
				d1 = d1[0]; d2 = d2[0]; d3 = d3[0];
				if(d1.status === '0' && d2.status === '0' && d3.status === '0'){
					// 初始化 门店 品牌 品类选择
					var allStoreItem = $("#subStore").val()=="yes" ? [] : [{id:' ', text:'所有门店'}];
					var storesSltData =allStoreItem.concat(d1.result.storeVoList.map(function(v, i){
						return {id:v.store.id, text: v.store.name};
					}));
					stockPreview_VM.storeId = $.trim(storesSltData[0].id);
					self.getPreviewData();
					self.getRankData();
					var cateFamilySltData=[], brandsSltData=[];
					brandsSltData = [{id:' ', text:'所有品牌'}].concat(d2.result.brandList.map(function(v, i){
						return {id:v.id, text: v.brandName};
					}));

					cateFamilySltData = [{id:' ', text:'所有一级品类'}].concat(d3.result.categoryFamilyVoList.map(function(v, i){
							cateSltData[v.categoryFamily.id] = v.categoryVoList.map(function(val, index){
								return {id:val.category.id, text: val.category.name};
							});
							return {id:v.categoryFamily.id, text: v.categoryFamily.familyName};
					}));

					$('#stockStoreSlt').select2({data:storesSltData});
					$('#stockFamilyCategorySlt').select2({data:cateFamilySltData});
					$('#stockCategorySlt').select2({data:[{id:' ', text:'所有二级品类'}]});
					$('#stockBrandSlt').select2({data:brandsSltData});

					$('#stockFamilyCategorySlt').on('change', function(){
						var cid = $(this).val();
						stockPreview_VM.categoryFamilyId = cid;
						if(cid==''){
							$('#stockCategorySlt').empty().select2({data:[{id:' ', text:'所有二级品类'}]}).trigger('change');
						}else{
							if(cateSltData[cid] && cateSltData[cid].length){
								$('#stockCategorySlt').empty().select2({data:[{id:' ', text:'所有二级品类'}].concat(cateSltData[cid])}).trigger('change');
							}else{
								$('#stockCategorySlt').empty().select2({data:[{id:' ', text:'所有二级品类'}]}).trigger('change');
							}
						}
					});

					$('#stockStoreSlt').on('change', function(){
						stockPreview_VM.storeId = $.trim($(this).val());
					});
					$('#stockCategorySlt').on('change', function(){
						stockPreview_VM.categoryId = $.trim($(this).val());
					});
					$('#stockBrandSlt').on('change', function(){
						stockPreview_VM.brandId = $.trim($(this).val());
					});
				}
			})
			.fail(function(){
				toastr.error('服务器繁忙');
			});
		},
		initDateRange:function(){
			var self = this;
			$('#stockDateRange1 span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));
			$('#stockDateRange1').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
			var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
			var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
			if(Math.floor((ET-ST)/(24*3600*1000))>90){
			  toastr.warning('请选择少于90天的时间！');
			  return fales;
			}

			$('#stockDateRange1 span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
			stockPreview_VM.startTime =  ST;
			stockPreview_VM.endTime = ET;
			});
		},
		initCharts:function(){
			stockListChart = echarts.init($('#stockListChart')[0]);
			stockRankChartL = echarts.init($('#stockRankChartL')[0], 'macarons');
			stockRankChartR = echarts.init($('#stockRankChartR')[0], 'macarons');
		},
		getPreviewData:function(){
			var pms = { 
				startTime: stockPreview_VM.$model.startTime,
				endTime: stockPreview_VM.$model.endTime,
				storeId: stockPreview_VM.$model.storeId,
				categoryFamilyId: stockPreview_VM.$model.categoryFamilyId,
				categoryId: stockPreview_VM.$model.categoryId,
				brandId: stockPreview_VM.$model.brandId
			};
			var oCardBox = $('#stockListCard');
			materialadmin.AppCard.addCardLoader(oCardBox);
			$.when($.post(CONFIG.getProductDataBetween, pms), $.post(CONFIG.getProductDataStatList, pms))
			.done(function(d1, d2){
				d1 = d1[0]; d2 = d2[0];
				if(d1.status === '0' && d2.status === '0'){
					stockPreview_VM.activeProductCount = d1.result.orderStatItemVo.activeProductCount;
					stockPreview_VM.shoppingCount = d1.result.orderStatItemVo.shoppingCount;
					stockPreview_VM.jointRate = d1.result.orderStatItemVo.jointRate;
					stockPreview_VM.orderPayment = d1.result.orderStatItemVo.orderPayment;
					stockPreview_VM.allProductCount = d1.result.allProductCount;
					stockPreview_VM.newProductCount = d1.result.newProductCount;
					stockPreview_VM.offProductCount = d1.result.offProductCount;

					var listData = d2.result.statYmdVoList;
					if(!listData.length){
					  CONFIG.stockListChartOpt.xAxis.data = [0];
					  CONFIG.stockListChartOpt.series[0].data = [0];
					  CONFIG.stockListChartOpt.series[1].data = [0];
					  CONFIG.stockListChartOpt.series[2].data = [0];
					}else{
					  var chartsData = Util.chartsDataFormat(listData);
					  CONFIG.stockListChartOpt.xAxis.data = chartsData.ymd.map(function(v,i){ 
			              return avalon.filters.date(v,'MM.dd')
		              }); 
					  CONFIG.stockListChartOpt.series[0].data = chartsData.activeCustomerCount;
					  CONFIG.stockListChartOpt.series[1].data = chartsData.orderCount;
					  CONFIG.stockListChartOpt.series[2].data = chartsData.orderPayment;
					}
					
					stockListChart.clear().setOption(CONFIG.stockListChartOpt);
				}else{
					toastr.error('获取商品数据失败');
				}
				materialadmin.AppCard.removeCardLoader(oCardBox);
			})
			.fail(function(data){
				toastr.error('服务器繁忙');
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});
		},
		getRankData:function(){
			var oCardBox = $('#stockRankCard');
			materialadmin.AppCard.addCardLoader(oCardBox);
			var pmsL ={
				startTime: stockPreview_VM.$model.startTime,
				endTime: stockPreview_VM.$model.endTime,
				sortName: 'orderCount',
				storeId:stockPreview_VM.$model.storeId,
				categoryFamilyId: stockPreview_VM.$model.categoryFamilyId,
				categoryId:stockPreview_VM.$model.categoryId,
				brandId:stockPreview_VM.$model.brandId,
				sortType: 'DESC',
				length: 20
			}

			var pmsR ={
				startTime: stockPreview_VM.$model.startTime,
				endTime: stockPreview_VM.$model.endTime,
				sortName: 'orderPayment',
				categoryFamilyId: stockPreview_VM.$model.categoryFamilyId,
				storeId:stockPreview_VM.$model.storeId,
				categoryId:stockPreview_VM.$model.categoryId,
				brandId:stockPreview_VM.$model.brandId,
				sortType: 'DESC',
				length: 20
			}

			$.when($.post(CONFIG.getProductOrderRank, pmsL), $.post(CONFIG.getProductOrderRank, pmsR))
			.done(function(d1, d2){
				d1 = d1[0]; d2 = d2[0];
				if(d1.status === '0' && d2.status=== '0'){
					var rankDataL = d1.result.productOrderRank;
					var rankDataR = d2.result.productOrderRank;

					if(!rankDataL.length){
					  CONFIG.stockRankOptL.yAxis[0].data = [0];
					  CONFIG.stockRankOptL.series[0].data = [0];

					  CONFIG.stockRankOptR.yAxis[0].data = [0];
					  CONFIG.stockRankOptR.series[0].data = [0];
					}else{
					  var chartsDataL = Util.chartsDataFormat(rankDataL);
					  var chartsDataR =  Util.chartsDataFormat(rankDataR);

					  CONFIG.stockRankOptL.yAxis[0].data = chartsDataL.rankName.map(function(v,i){ return v||''}).reverse();
					  CONFIG.stockRankOptL.series[0].data = chartsDataL.orderCount.reverse();

					  CONFIG.stockRankOptR.yAxis[0].data = chartsDataR.rankName.map(function(v,i){ return v||''}).reverse();
					  CONFIG.stockRankOptR.series[0].data = chartsDataR.orderPayment.reverse();
					}

					stockRankChartL.clear().setOption(CONFIG.stockRankOptL);
					stockRankChartR.clear().setOption(CONFIG.stockRankOptR);
				}else{
					toastr.error('获取排行数据失败！');
				}
				materialadmin.AppCard.removeCardLoader(oCardBox);
			})
			.fail(function(){
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});
		}
	};

	//===初始化
	return {
		init:function(){
			p_stock.init();
			avalon.scan($('#viewContentBox')[0]);
		}
	};

});

