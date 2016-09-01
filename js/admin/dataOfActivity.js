/**
 * [活动 模块]
 */
define(['toastr','daterangepicker','echarts','select2','AppCard','twbsPagination'],function(toastr){

	var CONFIG={
		getPromotionDataPreview: 'getPromotionDataPreview.json',
		getCustomerFlashsaleDataBetween: 'getCustomerFlashsaleDataBetween.json',
		geCustomerFlashsaleDataStatList: 'geCustomerFlashsaleDataStatList.json',
		defaultstart: Util.getUnixTime(moment().subtract('days', 30).format('YYYY-M-D')), //最近30天
		defaultend: Util.getUnixTime(moment().format('YYYY-M-D')),
		listChartOpt:{
		  tooltip : { trigger: 'axis' },
		    grid:{
		      x:50,
		      y:150,
		      x2:50,
		      y2:80
		    },
		    legend: {
		        data:["浏览活动次数","浏览活动人数","闪购成功人数", "闪购订单数", "闪购成交金额"]
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
		      name:'浏览活动次数', 
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
		    },
		    {
		      name:'浏览活动人数', 
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
		    },
		      {
		        name:'闪购成功人数', 
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
		        name:'闪购订单数', 
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
		        name:'闪购成交金额', 
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
		}
	};

	var actPreview_VM,  //概览
		actChart_VM,
	    p_activity,
	    actListChart;

  	actPreview_VM = avalon.define({
  		$id:'actPreviewCtrl',
  		startTime:CONFIG.defaultstart,
  		endTime:CONFIG.defaultend,
  		MS_activeCustomerCount:0,
  		MS_orderCount:0,
  		MS_orderPayment:0,
  		QHB_totalReceiveCount:0,
  		QHB_orderPayment:0,
  		QHB_orderCount:0,
  		XYHSJ_totalReceiveCount:0,
  		XYHSJ_orderPayment:0,
  		XYHSJ_orderCount:0,
  		store_activeCustomerCount:0,
  		store_orderPayment:0,
  		store_orderCount:0,

  		currActivityName:'',
  		currActivityId:'',
  		currActivityStoreName:'',
  		currActivityStoreId:'',
  		index:0,
  		searchEv:function(){
  			p_activity.getActivityList.bind(p_activity)();
  		}

  	});

  	actChart_VM = avalon.define({
  		$id:'actChartCtrl',
  		startTime:CONFIG.defaultstart,
  		endTime:CONFIG.defaultend,
  		suc_orderCount:0,
  		suc_orderPayment:0,
  		activeCustomerCount:0,
  		pvCount:0,
  		uvCount:0,
  		suc_activeCustomerCount:0,
  	});

	//===逻辑
	p_activity = {
		init: function(){
			this.initDateRange();
			this.initCharts();
			
			this.getPreviewData();
			this.getActivityList();
			// this.tblGetDetailEv();
		},
		initDateRange:function(){
			var self = this;
			$('#activityDateRange1 span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));
			$('#activityDateRange1').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
				var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
				var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
				if(Math.floor((ET-ST)/(24*3600*1000))>90){
				  toastr.warning('请选择少于90天的时间！');
				  return fales;
				}

				$('#activityDateRange1 span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
				actChart_VM.startTime =  ST;
				actChart_VM.endTime = ET;
			});
		},
		initCharts:function(){
			actListChart = echarts.init($('#actListChart')[0]);
		},
		getPreviewData:function(){
			var oCardBox = $('#mainCard');
			materialadmin.AppCard.addCardLoader(oCardBox);

			$.when($.post(CONFIG.getPromotionDataPreview))
			.done(function(data){
				if(data.status === '0'){
					var aData = data.result.statCouponVoList;
					var xyhsjData= aData.filter(function(v, i){
						return v.promotionType==1;
					})[0];

					var qhbData= aData.filter(function(v, i){
						return v.promotionType==4;
					})[0];
					// 秒杀
					actPreview_VM.MS_activeCustomerCount = data.result.flashSaleOrderStatVo.activeCustomerCount;
					actPreview_VM.MS_orderCount = data.result.flashSaleOrderStatVo.orderCount;
					actPreview_VM.MS_orderPayment = data.result.flashSaleOrderStatVo.orderPayment;
					// 抢红包
					actPreview_VM.QHB_totalReceiveCount = qhbData?qhbData.totalReceiveCount:'0';
					actPreview_VM.QHB_orderPayment = qhbData?qhbData.orderPayment:'0';
					actPreview_VM.QHB_orderCount = qhbData?qhbData.orderCount:'0';
					// 新用户送券
					actPreview_VM.XYHSJ_totalReceiveCount = xyhsjData?xyhsjData.totalReceiveCount:'0';
					actPreview_VM.XYHSJ_orderPayment = xyhsjData?xyhsjData.orderPayment:'0';
					actPreview_VM.XYHSJ_orderCount = xyhsjData?xyhsjData.orderCount:'0';
				}
				materialadmin.AppCard.removeCardLoader(oCardBox);
			})
			.fail(function(data){
				toastr.error('服务器繁忙');
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});
		},
		getActivityList:function(activityName){
			var self = this;
			var oCardBox = $('#actChartCard');
			materialadmin.AppCard.addCardLoader(oCardBox);
			var pms = {
			  startTime:actChart_VM.$model.startTime,
			  endTime:actChart_VM.$model.endTime
			};

			$.when($.post(CONFIG.getCustomerFlashsaleDataBetween, pms), $.post(CONFIG.geCustomerFlashsaleDataStatList, pms))
			.done(function(d1, d2){
			  d1 = d1[0]; d2 = d2[0];
			  if(d1.status==='0'){
			    actChart_VM.suc_orderCount = d1.result.flashSaleOrderStatVo.orderCount;
			    actChart_VM.suc_orderPayment = d1.result.flashSaleOrderStatVo.orderPayment;
			    actChart_VM.activeCustomerCount = d1.result.flashSaleCreateOrderStatVo.activeCustomerCount;
			    actChart_VM.pvCount = d1.result.flashSaleStatPageViewVo.pvCount;
			    actChart_VM.uvCount = d1.result.flashSaleStatPageViewVo.uvCount;
			    actChart_VM.suc_activeCustomerCount = d1.result.flashSaleOrderStatVo.activeCustomerCount;

			    var listData = d2.result.statYmdVoList;
			    if(!listData.length){
			      CONFIG.listChartOpt.xAxis.data = [0];
			      CONFIG.listChartOpt.series[0].data = [0];
			      CONFIG.listChartOpt.series[1].data = [0];
			      CONFIG.listChartOpt.series[2].data = [0];
			      CONFIG.listChartOpt.series[3].data = [0];
			      CONFIG.listChartOpt.series[4].data = [0];
			    }else{
			      var chartsData = Util.chartsDataFormat(listData);
			      CONFIG.listChartOpt.xAxis.data = chartsData.ymd.map(function(v,i){ 
	              	return avalon.filters.date(v,'MM.dd');
	              }); 
			      CONFIG.listChartOpt.series[0].data = chartsData.pvCount;
			      CONFIG.listChartOpt.series[1].data = chartsData.uvCount;
			      CONFIG.listChartOpt.series[2].data = chartsData.activeCustomerCount;
			      CONFIG.listChartOpt.series[3].data = chartsData.orderCount;
			      CONFIG.listChartOpt.series[4].data = chartsData.orderPayment;
			    }
			  }
			  actListChart.clear().setOption(CONFIG.listChartOpt);
			  materialadmin.AppCard.removeCardLoader(oCardBox);
			})
			.fail(function(){
				toastr.error('服务器繁忙，请稍候重试！');
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});

		},
		tblGetDetailEv:function(){
			// var self = this;
			// $('#activityListTbody').on('click','tr', function(){
			// 	var sid = $(this).data('storeid');
			// 	$(this).addClass('info').siblings().removeClass('info');
			// 	$('#actListChart').show();
			// 	if(!actListChart){
			// 		actListChart = echarts.init($('#actListChart')[0]);
			// 	};
			// 	self.getStoreActivityList.bind(self, sid)();
			// })
		},
		renderList2Tbl:function(data){
		},
		getStoreActivityList:function(storeId){
		}
	};

	//===初始化
	return {
		init:function(){
			p_activity.init();
			avalon.scan($('#viewContentBox')[0]);
		}
	};

});

