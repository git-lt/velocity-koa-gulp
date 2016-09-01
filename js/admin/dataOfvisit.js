/**
 * [商户 模块]
 */
define(['echarts','select2','AppCard','datePicker','colVis'],function(){
	var CONFIG, visitVM, p_visit, kindDatePicker;

	var chartGL_KL,chartCURRT,
		chartRDLQS, chartXKLQS, chartCFKLQS, 
		chartRDL, chartKLL, chartLGK, chartDFCS,
		chartGKLX,chartGKLX_Rate,
		chartZDSC,
		chartLFZQQS;

	var tableQSPH;

	var tabPage = {
		dpgl:false,  //店铺概览
		rdqs:false,  //入店趋势
		klqs:false,  //客流趋势	
		zdsc:false,  //驻店时长	
		gklx:false,  //顾客类型
		lfzq:false   //来访周期	
	};


	var customerTypes ={
		c0:'全部顾客',
		c3:'新顾客',
		c10:'老顾客',
		c11:'高活跃度顾客',
		c12:'中活跃度顾客',
		c13:'低活跃度顾客',
		c14:'沉睡顾客',
		c1:'路人',
		c2:'员工'
	}; 


	//===页面配置stats_all_groups
	CONFIG={
		Group:'32015362',
		appKey:'9da102a06bf536d0fb6ace9b17fc8b12',
		appSecret:'1f2c139563f320b46941a1b5ce9bb175',
		supplierId:1,
		storeName:'蚁国科技',
		CurrentTime:avalon.filters.date(new Date(),'yyyy-MM-dd HH:mm:ss'),
		dataUrl:'postZhimaApi.json',
		realtime_customers_rate:'realtime_customers_rate', 	 // 实时接口 当前入店量
		realtime_customers_count:'realtime_customers_count', // 实时接口 入店率
		realtime_customers_type:'realtime_customers_type', 	 // 实时接口 新老顾客的数量
		today_customers_count_hours:'today_customers_count_hours', //StartTime+EndTime+Group 当天每小时入店量统计
		stats_all_groups:'stats_all_groups', 				//获取店铺的信息
		trend_rank_by_group:'over_view/trend_rank_by_group', //趋势排行
		stats_ing_rate:'statis_customer/stats_ing_rate', 	 //入店率（趋势）
		stats_customer_count:'statis_customer/stats_customer_count', 	//入店量（趋势）
		stats_people_flow:'statis_customer/stats_people_flow', 	//客流量（趋势）
		customer_data_trend:'statis_customer_type/customer_data_trend', 	//顾客类型（趋势）
		stats_visit_frequency_scatter:'statis_frequency/stats_visit_frequency_scatter', 	//到访次数分布
		duration_trend:'statis_duration/duration_trend', 	//驻店时长（趋势）
		visit_cycle_trend:'statis_visit_cycle/visit_cycle_trend' 	//来访周期（趋势）
	};

	// avalon.filters.rate = function(v){
	// 	if(v === null) return '0.0%';
	// 	var num= avalon.filters.number(v)*100;
	// 	return avalon.filters.number(num, 1)+'%';
	// }
	avalon.filters.getGroupName = function(v){
		var gname = "", groups = global_conf.zhimaGroupInfo;
		if(v){
			for(var i in groups){
				if(groups[i].group == v)
					gname = groups[i].storeName;
			}
		}
		return gname;
	}

	var creatChartOptions = function(title, xAxisData, seriesData, isRate){
		var chartOpt = {
		    title : { text: title },
		    tooltip : { 
		    	trigger: 'axis',
    		    formatter: function (params,ticket,callback) {
    	           return params[0].seriesName + '<br/>'+ params[0].name +': ' + (isRate?avalon.filters.rate(params[0].value):params[0].value);
    	        }
		     },
		    legend: { x:'right', data:[CONFIG.storeName] },
		    toolbox: { show : false },
		    grid: { x:30, y:50, x2:20, y2:30 },
		    calculable : true,
		    xAxis : [{
		            type : 'category',
		            boundaryGap : false,
		            data : xAxisData
		        }
		    ],
		    yAxis : [{type : 'value'}],
		    series : [{
		            name:CONFIG.storeName,
		            type:'line',
		            data:seriesData
		        }
		    ]
		};
		return chartOpt;
	}

	visitVM = avalon.define({
		$id:'visitCtr',
		StartTime:'',
		EndTime:'',
		TimeType:'',
		currTab:mainVM.tabName || '',
		Dimension2RD:1,  // 1：日数据,2：周数据,3：月数据
		Dimension2KL:1,  //0:小时 1：日数据,2：周数据,3：月数据
		CustomerType4zdsc:0,
		CustomerType4gklx:3,
		QSData:{
			CustomerFlow: "",
			CustomerFlowChange: "",
			CustomerRate: "",
			CustomerRateChange: "",
			DeepCustomerCount: "",
			DeepCustomerCountChange: "",
			DeepCustomerRate: "",
			DeepCustomerRateChange: "",
			Duration: "",
			DurationChange: "",
			EnteringCustomerFlow: "",
			EnteringCustomerFlowChange: "",
			EnteringCustomerFlowNumber: "",
			EnteringCustomerFlowNumberChange: "",
			GroupId: 0,
			HighVisitNumber: "",
			HighVisitNumberChange: "",
			LowVisitNumber: "",
			LowVisitNumberChange: "",
			MiddleVisitNumber: "",
			MiddleVisitNumberChange: "",
			NewCustomerNumber: "",
			NewCustomerNumberChange: "",
			NewCustomerRate: "",
			NewCustomerRateChange: "",
			OutCustomerCount: "",
			OutCustomerCountChange: "",
			OutCustomerRate: "",
			OutCustomerRateChange: "",
			RankChange: "",
			RepeatCustomerNumber: "",
			RepeatCustomerNumberChange: "",
			RepeatCustomerRate: "",
			RepeatCustomerRateChange: "",
			SleepVisitNumber: "",
			SleepVisitNumberChange: "",
			VisitCycle: "",
			VisitCycleChange: ""
		},
		changeDs2RD:function(v){/*时间类型*/
			if(visitVM.$model.Dimension2RD != v){
				visitVM.Dimension2RD = v;
				// $.when(p_visit.refreshQSPH()).always(function(){
					p_visit.render();
				// });
			}
		},
		changeDs2KL:function(v){/*时间类型*/
			if(visitVM.$model.Dimension2KL != v){
				visitVM.Dimension2KL = v;
				$.when(p_visit.refreshQSPH()).always(function(){
					p_visit.render();
				});
			}
		},
		changeCT4zdsc:function(v){/* 顾客类型 */
			if(visitVM.$model.CustomerType4zdsc != v){
				visitVM.CustomerType4zdsc = v;
				p_visit.render();
			}
		},
		changeCT4gklx:function(v){/* 顾客类型 */
			if(visitVM.$model.CustomerType4gklx != v){
				visitVM.CustomerType4gklx = v;
				p_visit.render();
			}
		}
	});
	mainVM.$watch('tabName', function(v){
		if(v && visitVM.currTab != v){
			visitVM.currTab = v;
			p_visit.render();
		}
	});

	//===页面逻辑
	var isFirstInit = true;
	p_visit = {
		init: function(){
			if(isFirstInit){
				// 获取当前商户下的所有店铺列表
				this.initGroupSlt();
				// ,this.initDatePickerMult()
				$.when(this.initDatePickerTop())
				.done(function(){
					p_visit.render(); 
				});
			}else{
				p_visit.render(); 
			}
		},
		render:function(){
			var currTab = visitVM.$model.currTab;
			if(currTab==='')  return;

			if(tabPage[currTab]){ 			//刷新
				this['refresh_'+currTab]();
			}else{ 							//加载
				this['init_'+currTab]();
				this['refresh_'+currTab]();
				tabPage[currTab] = true;
			}
			avalon.scan($('#viewVisit')[0]);
		},
		initGroupSlt:function(){
			var self = this;
			var groups = $.map(global_conf.zhimaGroupInfo, function(v, i){
				return {id:v.group, text:v.storeName};
			});
			$('#grouplistSlt').select2();
			if(groups[0]){
				$('#grouplistSlt').select2({data: groups}).val(groups[0].id).trigger('change');
				CONFIG.Group = global_conf.zhimaGroupInfo[0].group;
				CONFIG.appKey = global_conf.zhimaGroupInfo[0].appKey;
				CONFIG.appSecret = global_conf.zhimaGroupInfo[0].appSecret;
				CONFIG.supplierId = global_conf.zhimaGroupInfo[0].supplierId;
				CONFIG.storeName = global_conf.zhimaGroupInfo[0].storeName;
			}
			

			$('#grouplistSlt').on('change', function(){
				var gId = $(this).val();
				$.each(global_conf.zhimaGroupInfo, function(i, v){
						if(v.group === gId){
							CONFIG.Group = gId;
							CONFIG.appKey = v.appKey;
							CONFIG.appSecret = v.appSecret;
							CONFIG.storeName = v.storeName;
						}
				});

				self.render();
			});
		},
		getDataPost:function(strApi, pmsJson, callback, failCallback, alwaysFn){
			// ?appKey=9da102a06bf536d0fb6ace9b17fc8b12&appSecret=1f2c139563f320b46941a1b5ce9bb175&supplierId=1
			var pms = {
				appKey:CONFIG.appKey,
				appSecret:CONFIG.appSecret,
				supplierId:CONFIG.appSecret,
				url:'http://open.zhimatech.com/api/retail/v3/'+strApi,
				paramJson:JSON.stringify(pmsJson)
			};
			$.post(CONFIG.dataUrl, pms).done(function(data){
				if(data.status === '0'){
					var res = data.result.response;
					var resJSON;
					try{
						resJSON = JSON.parse(res);
					}catch(e){
						// console.log('JSON转换失败，返回的数据格式错误');
						failCallback && failCallback();
						return;
					}
					if(resJSON.Code == 1000){ // 数据结果
						callback && callback(resJSON.DataList);
					}else{
						var err = '';
						switch(resJSON.Code){
							case 1001: err = '系统错误'; break;
							case 1002: err = '鉴权失败'; break;
							case 1003: err = '参数错误'; break;
							case 1004: err = '缺失必选参数(%s)'; break;
							case 1005: err = '参数非法'; break;
							case 1006: err = '手机号码不正确'; break;
							case 1006: err = '参数token错误'; break;
							case 1009: err = '用户未付费'; break;
							case 1010: err = '接口不存在'; break;
							case 2001: err = '设备失去连接'; break;
							case 2002: err = '设备请求超时'; break;
							case 1008: callback && callback([]); return;
							default: err = '其它错误'; break;
						}
						console.log(err);
						failCallback && failCallback(err);
					}
				}else{
					// console.log('数据请求失败，服务器繁忙！');
				}
			}).fail(function(){
				failCallback && failCallback();
			}).always(function(){
				alwaysFn && alwaysFn();
			}); 
		},
		initDatePickerTop:function(){
			var dtd = $.Deferred();

			var $timeType = $('#time_type');
			var $start_time = $('#start_time');
			var $end_time = $('#end_time');
			var $last_start_time = $('#last_start_time');
			var $selectPeriod = $('#select_period');

			var periodObj = {
			    day:1,
			    week:2,
			    month:3,
			    season:4
			}

			var isFirst = true, self = this;

			function DatePeriodInit(callback, isCompare){ //日历
			    
			    kindDatePicker = $('#calendar_drop').datePicker({
			        totalMonth:3,
			        inter:1,
			        onlyChoosePeriod:true,
			        chooseByGroup:true,
			        onlyPeriodCallback:function(period){
			            if(period.firstPeriod){
			                var firstPeriodStr = getTimeStr(period.firstPeriod.start) + '-' + getTimeStr(period.firstPeriod.end);
			                this.find('.calendar-dropdown-txt').html(firstPeriodStr);
			                var ST = getTimeSpe(period.firstPeriod.start);
			                var ET = getTimeSpe(period.firstPeriod.end);

			                $start_time.val(ST);
			                $end_time.val(ET);

			                visitVM.StartTime =ST;
			                visitVM.EndTime = ET;

			                if(isCompare){
			                    $last_start_time.val(getTimeSpe(getLastPeriod(periodObj[$selectPeriod.val()],period.firstPeriod.start)));
			                }

			                // 当前模块第一次加载时，不执行回调
			                callback && callback();

			                dtd.resolve();
			                if(kindDatePicker){
			                    kindDatePicker.hide();
			                }
			            }
			        },
			        showCallback:function(){
			            this.find('.fa').attr('class','fa fa-caret-up');
			        },
			        hideCallback:function(){
			            this.find('.fa').attr('class','fa fa-caret-down');
			        }
			    });

			    $selectPeriod.on('change',function(){
			        $timeType.val(periodObj[this.value]);
			        visitVM.TimeType = periodObj[this.value];
			        kindDatePicker.showKindCalendar(this.value);
			    });

			    var dateLevel = kindDatePicker.getPeriodAmount();

			    if(dateLevel.type){
			        $selectPeriod.val(dateLevel.type);
			        $timeType.val(periodObj[dateLevel.type]);
			        visitVM.TimeType = periodObj[dateLevel.type];
			    }else{
			        $timeType.val(periodObj['day']);
			        visitVM.TimeType = periodObj['day'];
			    }

			    function getLastPeriod(type,startTime){
			        var lastStartTime,
			            oneDayTime = 1000*60*60*24;

			        switch(type){
			            case 1:
			                lastStartTime = startTime - oneDayTime;
			                break;
			            case 2:
			                lastStartTime = startTime - oneDayTime*7;
			                break;
			            case 3:
			                var date = new Date(startTime);
			                var year = date.getFullYear();
			                var month = date.getMonth();
			                if(month>0){
			                    month = month - 1;
			                }else{
			                    month = 11;
			                    year = year - 1;
			                }
			                var dayLength = getDaySize({year:year,month:month});
			                lastStartTime = startTime - oneDayTime*(dayLength);
			                break;
			            case 4:
			                var date ;
			                var year ;
			                var month ;
			                var dayLength;
			                lastStartTime = startTime;
			                for(var i = 0;i<3;i++){
			                    date = new Date(lastStartTime);
			                    year = date.getFullYear();
			                    month = date.getMonth();
			                    if(month>0){
			                        month = month - 1;
			                    }else{
			                        month = 11;
			                        year = year - 1;
			                    }
			                    dayLength = getDaySize({year:year,month:month});
			                    
			                    lastStartTime = lastStartTime - oneDayTime*dayLength;
			                }

			                break;
			        }

			        return lastStartTime;
			    }

			    function getTimeStr(time){
			        var date = new Date(time);
			        return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
			    }

			    function getTimeSpe(time){
			        var date = new Date(time);
			        var month = date.getMonth() + 1;
			        var day = date.getDate();
			        month = month<10 ? '0' + month : month ;
			        day = day<10 ? '0' + day : day ;
			        return date.getFullYear() + '-' + month + '-' + day;
			    }

			    function getDaySize(monthPeriod){
			        var size = [31,,31,30,31,30,31,31,30,31,30,31];
			        if(size[monthPeriod.month]){
			            return size[monthPeriod.month];
			        }

			        var year = monthPeriod.year;
			        if((year%4===0 && year%100!==0) || (year%400===0)){
			            return 29;
			        }
			        return 28;
			    }
			}

			function dateSelectedCallBack(){

				// 根据时间 获取一次概览信息
				if(visitVM.$model.currTab != 'dpgl'){
					// 加载概览
					var pms = {
							RequestType:4, //店铺
							OrderItem:3,
							OrderType:0,
							TimeType:visitVM.TimeType, //1：日，2：周，3：月，4：季度
							StartTime:visitVM.$model.StartTime,
							GroupType:4,  			//店铺
							GroupList:[CONFIG.Group],
							PageNumber:30,
							CurrentPage:1
						};
					self.getDataPost(CONFIG.trend_rank_by_group, pms, function(data){
						// console.log('趋势排行');
						// console.log(data);
						visitVM.QSData=data[0];
					}, function(){}, function(){
						p_visit.render();
					});
				}else{
					p_visit.render();
				}
				

			}

			DatePeriodInit(dateSelectedCallBack,true, dtd);

			return dtd;
		},
		initDatePickerMult:function(){/* 选择自定义时间段 */
			var datePicker, dtd = $.Deferred();
			function dateDefinedInit(callback){
					var canlendarParent = $('#calendar_drop2').closest('.ch-calendar');
					var calendarTxt = $('#calendar_drop2 .calendar-dropdown-txt');

					datePicker = $('#calendar_drop2').datePicker({
						totalMonth:3,
						inter:1,
						choosePeriod:true,
						compare:false,
						applyCallback:function(period,isNotExcuteCallback){
							if(period.firstPeriod){
								var firstPeriodOneDay = false;
								//判断开始时间和结束时间是否相等
								if(period.firstPeriod.start === period.firstPeriod.end){
									firstPeriodOneDay = true;
								}

								var result = changeText(period);
								visitVM.StartTime = getTimeSpe(period.firstPeriod.start);
								visitVM.EndTime = getTimeSpe(period.firstPeriod.end);

								if(isNotExcuteCallback){ return; }

								var timeType;
								if(period.firstPeriod.start != period.firstPeriod.end){
									timeType = 'defined'
								}else{
									timeType = 'day';
								}

				                // 当前模块第一次加载时，不执行回调
			                	tabPage[visitVM.$model.currTab] && callback && callback();

								dtd.resolve();
							}
						},
						showCallback:function(){
							this.find('.fa').attr('class','fa fa-caret-up');
						},
						hideCallback:function(){
							this.find('.fa').attr('class','fa fa-caret-down');
						}
					});

					function getTimeStr(time){
						var date = new Date(time);
						return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
					}

			        function getTimeSpe(time){
			            var date = new Date(time);
			            var day = date.getDate();
			            var month = date.getMonth() + 1;
			            month = month<10 ? '0' + month : month ;
			            day = day<10 ? '0' + day : day ;
			            return date.getFullYear() + '-' + month + '-' + day;
			        }

			        function changeText(period){
						var firstPeriodStr = getTimeStr(period.firstPeriod.start) + '-' + getTimeStr(period.firstPeriod.end);
						var hasSecondPeriod = false;
						var secondPeriodOneDay = false;
						var timeText = [];

						calendarTxt.html(firstPeriodStr);
						canlendarParent.removeClass('calendar-compare');
						hasSecondPeriod = false;
						timeText.length = 0;

						datePicker && datePicker.hide();

						return {
							hasSecondPeriod:hasSecondPeriod,
							timeText:timeText,
							secondPeriodOneDay:secondPeriodOneDay
						}
					}

					datePicker.changeText = changeText;
			}

			// 选择日期后的回调 刷新数据
			function callback(){ 
				// 根据时间 获取一次概览信息
				if(visitVM.$model.currTab != 'dpgl'){
					// 加载概览
					var pms = {
							RequestType:4, //店铺
							OrderItem:3,
							OrderType:0,
							TimeType:3, //1：日，2：周，3：月，4：季度
							StartTime:visitVM.$model.StartTime,
							GroupType:4,  			//店铺
							GroupList:[CONFIG.Group],
							PageNumber:30,
							CurrentPage:1
						};
					if(visitVM.$model.currTab == 'klqs'){
						pms.TimeType = visitVM.$model.Dimension2KL;
					}else{
						pms.TimeType = visitVM.$model.Dimension2RD;
					}
					this.getDataPost(CONFIG.trend_rank_by_group, pms, function(data){
						// console.log('趋势排行');
						// console.log(data);
						visitVM.QSData=data[0];
					});
				}
				p_visit.render(); 
			}
			dateDefinedInit(callback.bind(this));
			return dtd;
		},
		initTootip:function(){
			 $('[data-toggle="tooltip"]').tooltip();
		},
		refreshQSPH:function(beforeFn){/* 刷新趋势排行的数据 */
			var dtd = $.Deferred();
			// 各版块选择日期类型时，刷新趋势排行的数据
			var pms = {
				RequestType:4, //店铺
				OrderItem:3,
				OrderType:0,
				TimeType:3, //1：日，2：周，3：月，4：季度
				StartTime:visitVM.$model.StartTime,
				GroupType:4,  			//店铺
				GroupList:[CONFIG.Group],
				PageNumber:30,
				CurrentPage:1
			};
			if(visitVM.$model.currTab == 'klqs'){
				pms.TimeType = visitVM.$model.Dimension2KL;
			}else{
				pms.TimeType = visitVM.$model.Dimension2RD;
			}
			beforeFn && beforeFn();
			this.getDataPost(CONFIG.trend_rank_by_group, pms, function(data){
				// console.log('趋势排行');
				// console.log(data);
				visitVM.QSData=data[0];
				dtd.resolve();
			}, function(){
				dtd.reject();
			});

			return dtd;
		},
		init_dpgl:function(){/* 店铺概览 */
			chartGL_KL = echarts.init($('#chartGL_KL')[0]);
			this.initTootip();
		},
		refresh_dpgl:function(){
			var pms = {
				RequestType:4, //店铺
				OrderItem:3,
				OrderType:0,
				TimeType:visitVM.TimeType, //1：日，2：周，3：月，4：季度
				StartTime:visitVM.StartTime,
				GroupType:4,  			//店铺
				GroupList:[CONFIG.Group],
				PageNumber:30,
				CurrentPage:1
			};

			var pms2 = {
				StartTime:visitVM.StartTime,
				EndTime:visitVM.EndTime,
				Group:CONFIG.Group,
				GroupType:4,
				CustomerType:0,
				Dimension:1 //0:小时 1：日数据,2：周数据,3：月数据
			}
 
 			var oCardBox = $('#dpgl_qsph_card');
 			materialadmin.AppCard.addCardLoader(oCardBox);

			this.getDataPost(CONFIG.trend_rank_by_group, pms, function(qsData){
				console.log('趋势排行');
				console.log(qsData);
				visitVM.QSData=qsData[0];
				(tableQSPH && (typeof tableQSPH !== "undefined")) && tableQSPH.data().clear().draw().destroy();

			 	// 初始化图表
			 	tableQSPH = $('#tblQSPH').DataTable( {
			 		data:qsData,
		 			deferRender: true,
		 			retrieve: true,
		 			destory:true,
		 			columns:[
		 				{data:function(row){
			                return avalon.filters.getGroupName(row.GroupId);
		              	}},
		 				{data:function(row){
		 					return avalon.filters.number(row.CustomerFlow,0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.EnteringCustomerFlow,0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.EnteringCustomerFlowNumber,0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.rate(row.CustomerRate);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.NewCustomerNumber, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.RepeatCustomerNumber, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.rate(row.NewCustomerRate, 0);
		 				}},
		 				{data:'VisitCycle'},
		 				{data:function(row){
		 					return avalon.filters.number(row.HighVisitNumber, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.MiddleVisitNumber, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.LowVisitNumber, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.SleepVisitNumber, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.Duration, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.DeepCustomerCount, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.number(row.OutCustomerCount, 0);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.rate(row.DeepCustomerRate);
		 				}},
		 				{data:function(row){
		 					return avalon.filters.rate(row.OutCustomerRate);
		 				}}
		 			],
		 			"dom": 'Crt',
		 			"order": [],
		 			"columnDefs": [{
		 			    "targets": '_all',
		 			    "orderable": false
		 			  },{
		 			    "targets": [10,11,12,13,14,15,16,17],
		 			    "visible": false
		 			  },{
		 			    "targets":"_all",
		 			    "defaultContent":""
		 			}],
		 			"colVis": {
		 				"buttonText": "选择列",
		 				"overlayFade": 0,
		 				"align": "right"
		 			},
		 			"language": {
		 				"sProcessing": "处理中...",
		 		        "sEmptyTable": "暂无数据",
		 		        "sLoadingRecords": "载入中...",
		 		        "sInfoThousands": ",",
		 				"search": '<i class="iconfont">&#xe62d;</i>',
		 				"paginate": {
		 					"previous": '<i class="iconfont">&#xe66c;</i>',
		 					"next": '<i class="iconfont">&#xe66b;</i>'
		 				}
		 			}
			    });

				materialadmin.AppCard.removeCardLoader(oCardBox);
			}, function(){
				materialadmin.AppCard.removeCardLoader(oCardBox);
			});

			// 客流量 & 入店量
			var glData = {
				RD:[],
				KL:[]
			};
			var self = this;
			function getKLData(){
				var dtdKL = $.Deferred(); 
				self.getDataPost(CONFIG.stats_people_flow, pms2, function(data){
					// console.log('客流量');
					// console.log(data);
					glData.KL = data;
					dtdKL.resolve();
				}, function(){
					
				});
				return dtdKL;
			}
			function getRDData(){
				var dtdRD = $.Deferred(); 
				self.getDataPost(CONFIG.stats_customer_count, pms2 , function(data){
					// console.log('入店量');
					// console.log(data);
					glData.RD = data;
					dtdRD.resolve();
				}, function(){
					dtdRD.reject();
				})

				return dtdRD;
			}
			$.when(getKLData(), getRDData()).always(function(){
				// console.log('客流和入店：');
				// console.log(glData);
				if(glData.RD.length || glData.KL.length){
					var rd_dt = Util.chartsDataFormat(glData.RD);
					var kl_dt = Util.chartsDataFormat(glData.KL);
					var times = rd_dt.Time.length ? rd_dt.Time : kl_dt.Time;

					var opts = {
						title : { text: '' },
						tooltip : { trigger: 'axis' },
						legend: { x:'right', data:['客流量', '入店量'] },
						toolbox: { show : false },
						grid: { x:30, y:50, x2:20, y2:30 },
						calculable : true,
						xAxis : [{
						        type : 'category',
						        boundaryGap : false,
						        data : times
						    }
						],
						yAxis : [{type : 'value'}],
						series : [{
						        name:'客流量',
						        type:'line',
						        data:kl_dt.Count
						    },
						    {
						        name:'入店量',
						        type:'line',
						        data:rd_dt.Count
						    }
						]
					};

					chartGL_KL.clear().setOption(opts);
				}
			});
		},
		init_currt:function(){/* 时实数据 */
			chartCURRT = echarts.init($('#chartCURRT')[0]);
			var self = this;
			$('#refreshCurrDataLink').click(function(){
				self.refresh_currt();
			});
		},
		refresh_currt:function(){
			var self = this;
			var pms = {
				CurrentTime:avalon.filters.date(new Date(),'yyyy-MM-dd HH:mm:ss'),
				Group:CONFIG.Group
			};

			var pms2 = {
				StartTime:avalon.filters.date(new Date(),'yyyy-MM-dd 08:00:00'),
				EndTime:avalon.filters.date(new Date(),'yyyy-MM-dd HH:mm:ss'),
				Group:CONFIG.Group
			}

			this.getDataPost(CONFIG.realtime_customers_count, pms, function(data){
				// console.log('入店量');
				$('#currAmout').text(data[0].Count || '0');
			});

			this.getDataPost(CONFIG.realtime_customers_rate, pms, function(data){
				// console.log('入店率');
				$('#currCusRate').text(avalon.filters.rate(data[0].Rate));
			});

			this.getDataPost(CONFIG.today_customers_count_hours, pms2, function(data){
				// console.log('每小时入店量');
				// console.log(data);
				if(data.length){
				var res = Util.chartsDataFormat(data);
					var chartOpt = {
					    title : { text: '在店量趋势' },
					    tooltip : { trigger: 'axis' },
					    legend: { x:'right', data:['新顾客','老顾客'] },
					    toolbox: { show : false },
					    grid: { x:30, y:50, x2:20, y2:30 },
					    calculable : true,
					    xAxis : [{
					            type : 'category',
					            boundaryGap : false,
					            data : res.Time
					        }
					    ],
					    yAxis : [{type : 'value'}],
					    series : [{
					            name:'新顾客',
					            type:'line',
					            data:res.Count
					        },
					        {
					            name:'老顾客',
					            type:'line',
					            data:res.OldCount
					        }
					    ]
					};

					chartCURRT.clear().setOption(chartOpt);
					chartCURRT.hideLoading();
				}else{
					// chartCURRT.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
			});
		},
		init_rdqs:function(){/* 入店趋势 */
			chartRDLQS = echarts.init($('#chartRDLQS')[0]);
/*			chartXKLQS = echarts.init($('#chartXKLQS')[0]);
			chartCFKLQS = echarts.init($('#chartCFKLQS')[0]);*/
		},
		refresh_rdqs:function(){
			var pms = {
				StartTime:visitVM.StartTime,
				EndTime:visitVM.EndTime,
				Group:CONFIG.Group,
				GroupType:4,
				CustomerType:3,
				Dimension:visitVM.Dimension2RD //1：日数据,2：周数据,3：月数据
			}

			chartRDLQS.showLoading({text : '正在努力的加载...'});
/*			chartXKLQS.showLoading({text : '正在努力的加载...'});
			chartCFKLQS.showLoading({text : '正在努力的加载...'});*/

			// 入店率（趋势）
			this.getDataPost(CONFIG.stats_ing_rate, pms, function(data){
				// console.log('入店率（趋势）');
				// console.log(data);
				if(data.length){
					var res = Util.chartsDataFormat(data);
					chartRDLQS.clear().setOption(creatChartOptions('入店率趋势', res.Time, res.Rate, true));
					chartRDLQS.hideLoading();
				}else{
					chartRDLQS.clear().setOption(creatChartOptions('入店率趋势', [], []));
					chartRDLQS.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
				
			}, function(){
				chartRDLQS.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			});

			// 新客流入店率趋势  statis_customer_type/customer_data_trend
			// this.getDataPost(CONFIG.customer_data_trend, $.extend({},pms, {CustomerType:3}), function(data){
			// 	// console.log('新客流入店率趋势');
			// 	console.log(data);

			// 	if(data.length){
			// 		var res = Util.chartsDataFormat(data);
			// 		chartXKLQS.clear().setOption(creatChartOptions('新客流入店率趋势', res.Time, res.Rate, true));
			// 		chartXKLQS.hideLoading();
			// 	}else{
			// 		chartXKLQS.clear().setOption(creatChartOptions('新客流入店率趋势', [], []));
			// 		chartXKLQS.showLoading({text : '暂无数据 :(', effect:'whirling'});
			// 	}
				
			// }, function(){
			// 	chartXKLQS.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			// });

			// 重复客流入店率趋势
			// this.getDataPost(CONFIG.customer_data_trend,  $.extend({},pms, {CustomerType:10}), function(data){
			// 	console.log('重复客流入店率趋势');
			// 	console.log(data);

			// 	if(data.length){
			// 		var res = Util.chartsDataFormat(data);
			// 		chartCFKLQS.clear().setOption(creatChartOptions('重复客流入店率趋势', res.Time, res.Rate, true));
			// 		chartCFKLQS.hideLoading();
			// 	}else{
			// 		chartCFKLQS.clear().setOption(creatChartOptions('重复客流入店率趋势', [], []));
			// 		chartCFKLQS.showLoading({text : '暂无数据 :(', effect:'whirling'});
			// 	}
				
			// }, function(){
			// 	chartCFKLQS.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			// });	
		},
		init_klqs:function(){/* 客流趋势 */
			chartRDL = echarts.init($('#chartRDL')[0]);
			chartKLL = echarts.init($('#chartKLL')[0]);
			// chartLGK = echarts.init($('#chartLGK')[0]);
			chartDFCS = echarts.init($('#chartDFCS')[0]);
		},
		refresh_klqs:function(){
			// console.log('refresh_klqs');
			var pms = {
				StartTime:visitVM.StartTime,
				EndTime:visitVM.EndTime,
				Group:CONFIG.Group,
				GroupType:4,
				CustomerType:3,
				Dimension:visitVM.Dimension2KL //0:小时 1：日数据,2：周数据,3：月数据
			}

			chartRDL.showLoading({text : '正在努力的加载...'});
			chartKLL.showLoading({text : '正在努力的加载...'});
			// chartLGK.showLoading({text : '正在努力的加载...'});
			chartDFCS.showLoading({text : '正在努力的加载...'});

			// 入店量（趋势）
			this.getDataPost(CONFIG.stats_customer_count, pms, function(data){
				// console.log('入店量（趋势）');
				// console.log(data);

				if(data.length){
					var res = Util.chartsDataFormat(data);
					chartRDL.clear().setOption(creatChartOptions('入店量趋势', res.Time, res.Count));
					chartRDL.hideLoading();
				}else{
					chartRDL.clear().setOption(creatChartOptions('入店量趋势', [], []));
					chartRDL.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
				
			}, function(){
				chartRDL.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			});

			// 客流量（趋势）
			this.getDataPost(CONFIG.stats_people_flow, pms, function(data){
				// console.log('客流量（趋势）');
				if(data.length){
					var res = Util.chartsDataFormat(data);
					chartKLL.clear().setOption(creatChartOptions('客流量趋势', res.Time, res.Count));
					chartKLL.hideLoading();
				}else{
					chartKLL.clear().setOption(creatChartOptions('客流量趋势', [], []));
					chartKLL.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
				
			}, function(){
				chartKLL.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			});

			// 顾客类型（趋势） CustomerType=1 路过
			function pmsLimit(pms){
				var obj = $.extend({}, pms);
				if(obj.Dimension==0)
					obj.Dimension = 1;
				return obj;
			}
			// this.getDataPost(CONFIG.customer_data_trend, $.extend({},pmsLimit(pms), {CustomerType:1}), function(data){
			// 	console.log('路过客流趋势');
			// 	// console.log(data);
			// 	if(data.length){
			// 		var res = Util.chartsDataFormat(data);
			// 		chartLGK.clear().setOption(creatChartOptions('路过客流趋势', res.Time, res.Count));
			// 		chartLGK.hideLoading();
			// 	}else{
			// 		chartLGK.clear().setOption(creatChartOptions('路过客流趋势', [], []));
			// 		chartLGK.showLoading({text : '暂无数据 :(', effect:'whirling'});
			// 	}
			// }, function(){
			// 	chartLGK.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			// });

			// 到访次数分布  CustomerType
			// StartTime EndTime Group GroupType CustomerType
			this.getDataPost(CONFIG.stats_visit_frequency_scatter,$.extend({}, pms, {CustomerType:1}), function(data){
				// console.log('到访次数分布');
				// console.log(data);

				var chartOpt = {
				    title : { text: '路人经过次数分布' },
				    tooltip : { 
				    	trigger: 'axis'
				   	},
				    legend: { x:'right', data:['客流人数'] },
				    toolbox: { show : false },
				    grid: { x:50, y:50, x2:20, y2:30 },
				    calculable : true,
				    xAxis : [{ type : 'value', boundaryGap : [0, 0.01] }],
				    yAxis : [{ type: 'category', data:['5次以上','3~5次','2次','1次'] }],
				    series : [{
				            name:'客流人数',
				            type:'bar',
				            data:[]
				        }
				    ]
				};
				if(data.length){
					var res = Util.chartsDataFormat(data);
					chartOpt.series[0].data = res.Count.reverse();
					chartDFCS.clear().setOption(chartOpt);
					chartDFCS.hideLoading();
				}else{
					chartDFCS.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
			}, function(){
				chartDFCS.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			});
		},
		init_zdsc:function(){/* 驻店时长 */
			chartZDSC = echarts.init($('#chartZDSC')[0]);
			// chartSFQS = echarts.init($('#chartSFQS')[0]);
			// chartTCQS = echarts.init($('#chartTCQS')[0]);
		},
		refresh_zdsc:function(){
			var pms = {
				StartTime:visitVM.StartTime,
				EndTime:visitVM.EndTime,
				Group:CONFIG.Group,
				GroupType:4,
				CustomerType:visitVM.CustomerType4zdsc,
				Dimension:visitVM.Dimension2RD //1：日数据,2：周数据,3：月数据
			}

			chartZDSC.showLoading({text : '正在努力的加载...'});
			// chartSFQS.showLoading({text : '正在努力的加载...'});
			// chartTCQS.showLoading({text : '正在努力的加载...'});

			// 驻店时长（趋势） CustomerType
			// StartTime EndTime Group GroupType CustomerType Dimension
			this.getDataPost(CONFIG.duration_trend, pms, function(data){
				// console.log('驻店时长（趋势');
				// console.log(data);

				if(data.length){
					var res = Util.chartsDataFormat(data);
					res.DurationTime = $.map(res.DurationTime, function(v, i){
						return avalon.filters.number(v/60,1);
					});
					chartZDSC.clear().setOption(creatChartOptions('驻店时长趋势', res.Time, res.DurationTime));
					chartZDSC.hideLoading();
				}else{
					chartZDSC.clear().setOption(creatChartOptions('驻店时长趋势', [], []));
					chartZDSC.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
				
			}, function(){
				chartZDSC.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			});
		},
		init_lfzq:function(){/* 来访周期 */
			chartLFZQQS = echarts.init($('#chartLFZQQS')[0]);
			this.initTootip();
		},
		refresh_lfzq:function(){
			var pms = {
				StartTime:visitVM.StartTime,
				EndTime:visitVM.EndTime,
				Group:CONFIG.Group,
				GroupType:4,
				CustomerType:visitVM.CustomerType4zdsc,
				Dimension:visitVM.Dimension2RD //1：日数据,2：周数据,3：月数据
			}
			
			chartLFZQQS.showLoading({text : '正在努力的加载...'});

			// 来访周期（趋势）
			this.getDataPost(CONFIG.visit_cycle_trend, pms, function(data){
				// console.log('来访周期（趋势）');
				// console.log(data);

				if(data.length){
					var res = Util.chartsDataFormat(data);
					chartLFZQQS.clear().setOption(creatChartOptions('来访周期趋势', res.Time, res.Count));
					chartLFZQQS.hideLoading();
				}else{
					chartLFZQQS.clear().setOption(creatChartOptions('来访周期趋势', [], []));
					chartLFZQQS.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
				
			}, function(){
				chartLFZQQS.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			});
		},
		init_gklx:function(){/* 顾客类型 */
			chartGKLX = echarts.init($('#chartGKLX')[0]);
			chartGKLX_Rate = echarts.init($('#chartGKLX_Rate')[0]);
		},
		refresh_gklx:function(){
			var pms = {
				StartTime:visitVM.StartTime,
				EndTime:visitVM.EndTime,
				Group:CONFIG.Group,
				GroupType:4,
				CustomerType:visitVM.CustomerType4gklx,
				Dimension:visitVM.Dimension2RD //1：日数据,2：周数据,3：月数据
			};

			chartGKLX.showLoading({text : '正在努力的加载...'});
			this.getDataPost(CONFIG.customer_data_trend, pms, function(data){
				if(data.length){
					var res = Util.chartsDataFormat(data);
					chartGKLX.clear().setOption(creatChartOptions('各类型顾客趋势', res.Time, res.Count));
					chartGKLX.hideLoading();
				}else{
					chartGKLX.clear().setOption(creatChartOptions('各类型顾客趋势', [], []));
					chartGKLX.showLoading({text : '暂无数据 :(', effect:'whirling'});
				}
				
			}, function(){
				chartGKLX.clear().showLoading({text : '数据加载失败 :(', effect:'whirling'});
			});


			var rateOpt = {
			    tooltip : {
			        trigger: 'item',
			        formatter: "{a} <br/>{b} : {c} ({d}%)"
			    },
			    legend: {
			        y : 'center',
			        x : 'center',
			        data:['新顾客','老顾客']
			    },
			    toolbox: {
			        show : false
			    },
			    calculable : false,
			    series : [
			        {
			            name:'',
			            type:'pie',
			            radius : [100, 140],
			            // for funnel
			            x: '60%',
			            width: '35%',
			            funnelAlign: 'left',
			            max: 1048,
			            data:[
			                {value:visitVM.$model.QSData.NewCustomerNumber || 0, name:'新顾客'},
			                {value:visitVM.$model.QSData.RepeatCustomerNumber || 0, name:'老顾客'}
			            ]
			        }
			    ]
			};
			if(rateOpt.series[0].data[0].value+rateOpt.series[0].data[1].value==0){
				chartGKLX_Rate.clear();
				chartGKLX_Rate.showLoading({text : '暂无数据 :(', effect:'whirling'});
			}else{
				chartGKLX_Rate.hideLoading();
				chartGKLX_Rate.clear().setOption(rateOpt);
			}
		}
	};

	//===页面初始化
	return {
		init:function(){
			for(var i in tabPage)
				tabPage[i] = false;
			p_visit.init();
		}
	};

});
