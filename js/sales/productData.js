var myApp = new Framework7();
var DO = function(){
	this.pickStartDay = null,this.pickEndDay = null;
	this.pickers = {};
	this.getProductDataBetweenUrl = '../admin/getProductDataBetween.json';
	this.getProductDataStatListUrl = '../admin/getProductDataStatList.json';
	this.getStoreList = '../admin/getStoreList.json';
	this.getTopCategoryList = '../admin/querySupplierCategoryList.json';
	this.getSupplierBrandList = '../admin/getSupplierBrandList.json';
}

DO.prototype = {
	init: function(){
		var _this = this;
		_this.loadData(_this.getTimesBefore(7), _this.getTimesEnd(1), 1,null,null,param);
		//开始时间，结束时间，选中下标
		_this.navBarChange();//选项卡切换并重新loadData
        _this.openDatePicker(1);//初始化第一个自定义时间选择控件
        _this.keepMask();// 阻止picker点mask关闭  
        _this.conditionConfirm();//筛选条件确定
        _this.setFilter();
	},
	navBarChange:function(){
		var _this = this;
		$(".navbarEvt").on("click",function(){
			_this.loadData(_this.getTimesBefore($(this).data("start")), _this.getTimesEnd($(this).data("end")), $(this).data("sel"));
        	$(this).addClass("time_navbar_on").siblings().removeClass("time_navbar_on");
        });
	},
	keepMask: function(){
		$("#mask").on("click",function(e){
        	e.stopPropagation();
        	return false;
        });
	},
	conditionConfirm: function(){
		var _this = this;
		$('#conditionConfirm').on('click',function(){
        	_this.filtBtn();
        });
        $('#conditionCancel').on('click',function(){
        	$("#mask").removeClass("mask");
        	$("body").removeClass('overFh');
        });
	},
	callNativeSetTitle: function(sTime,eTime,sel){
		switch(sel){
			case 1: title='今日';break;
			case 2: title='昨日';break;
			default:title = getLocalTime(sTime).split(" ")[0] + "至" + getLocalTime(eTime-1000*60*60*24).split(" ")[0];break; 
		}
		$(function(){
			if(window.WebViewJavascriptBridge){
				window.WebViewJavascriptBridge.callHandler('setTitleAction',{//调native改变title
					title: title
				});
			}
		});
	},
	getTimesBefore: function(sDay){
        var d = new Date();
        var a = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);

        return a - 1000*60*60*24*(sDay-1);
    },
    getTimesEnd: function(eDay){
        var a = new Date();
        return new Date(a.getFullYear(), a.getMonth(), a.getDate(), 0, 0, 0) - 0 + eDay*1000*60*60*24;
    },
    echartsInit: function(ops){
    	var option = {
            title: {
                text: ops.text||'',
                itemGap: 10,  
        		padding: [11,15,11,12],
                textStyle: {
		            fontSize: 16,
		            fontWeight: 'normal',	          
		            color: '#fff'  // 主标题文字颜色
		        }
            },
            color: ['#80baff'],  //柱子颜色   
            backgroundColor: '#0076ff', //背景颜色
            textStyle: {
            	 fontSize: 22,
            	color: '#fff' //全局字体颜色
            },
            itemStyle: {
	            normal: {
	                barBorderRadius: [5, 5, 0, 0] //柱子圆角
	            }
	        },
            xAxis: [{
	            axisLine: {show:false},
	            axisTick: {show:false},
	            splitArea: {show:false},
	            splitLine: {show:false},            
	            axisLabel: {
	            	interval: 'auto',
                    textStyle: {
                        color: '#fff',
                        fontSize:12
                    }
                },
	            data : ops.keys||[]
	        }],
            yAxis: [{
            	minInterval: 1,
            	axisLine: {show:false},
	            axisTick: {show:false},
	            splitArea: {show:false},
	            splitLine: {show:false},
	            axisLabel: {
	            	interval: 'auto',
                    textStyle: {
                        color: '#fff'
                    }
                },
            	position: 'right'
	            //min: 10,
	            // max: 200,
	        }],
            series: [{
                name: ops.text||'',
                type: 'bar',
                barMaxWidth: 30,
                data: ops.values||[]
            }],
            grid:{
	            left: 20,
	            top : 40,
	            right: 40,
	            bottom: 30
	        }
        }
        var myEcharts = echarts.init(document.getElementById(ops.id||''));
        myEcharts.setOption(option);
    },
    loadData: function(sTime, eTime, sel,timeSpace,sTime2,param){
    	var _this = this;
    	switch(sel){
    		case 0: sTimeT = sTime2;eTimeY = eTime;break;
    		case 1: sTimeT = _this.getTimesBefore(1);eTimeY = _this.getTimesEnd(0)+86400000;break;
    		case 2: sTimeT = _this.getTimesBefore(2);eTimeY = _this.getTimesEnd(0);break;
    		default: sTimeT=sTime;eTimeY=eTime;break;
    	};
    	$("#param").attr("data-startTimeB", sTimeT);	
		$("#param").attr("data-endTimeB", eTimeY);
		$("#param").attr("data-startTimeL", sTime);		
		$("#param").attr("data-endTimeL", eTime);
		$("#param").attr("data-sel", sel);
		var param = _this.getCondition();
    	$.ajax({
    		url: _this.getProductDataBetweenUrl,
            type: "post",
            data: {
            	token: getUrlParam("token"),
                startTime: sTimeT||param.sTimeB, 
                endTime : eTimeY||param.eTimeB,
                storeid : param.storeId||'',
                categoryFamilyId : param.c1||'',
                categoryId : param.c2||'',
                brandId : param.brandId||''
            },
            success: function(res){
            	if(res.status === '0'){
            		_this.callNativeSetTitle(sTimeT,eTimeY,sel);
            		var html = template('dataO', res.result||'');
					$("#content").html(html);
					$(".dataValue").each(function(i){
						var dataValueWidth = $(".dataValue").eq(i).width(); 	/*获取宽度*/
						if(dataValueWidth>=105){
							$(".dataValue").eq(i).wrap("<marquee></marquee>");
						}
					})
            	} 
            	else{
            		$("#mask").removeClass("mask");
        			$("body").removeClass('overFh');
            		return mobileAlert(res.errmsg ? res.errmsg : "系统繁忙，请稍后再试");
            	} 	
            }
    	});

    	$.ajax({
            url: _this.getProductDataStatListUrl,
            type: "post",
            data: {
            	token: getUrlParam("token"),
                startTime: param.sTimeL||sTime, 
                endTime : param.eTimeL||eTime,
                storeId : param.storeId||'',
                categoryFamilyId : param.c1||'',
                categoryId : param.c2||'',
                brandId : param.brandId||''
            },
            success: function(res){
            	if (res.status!=="0") return;
            	var chartArr = [];
            	$(".chartEvt").each(function(i){
            		chartArr['options' + (i+1)] = new Object();
            		chartArr['options' + (i+1)].id = $(this).attr("id");
            		chartArr['options' + (i+1)].text = $(this).data("text");
            		chartArr['options' + (i+1)].keys = [],chartArr['options' + (i+1)].values = [];
            		if (timeSpace==undefined) {
            			$.each(res.result.statYmdVoList, function(j, item){
	            			var key = (new Date(item.ymd).getMonth()+1) + '.' + new Date(item.ymd).getDate();
	            			chartArr['options' + (i+1)].keys.push(sel && j == res.result.statYmdVoList.length-sel ? {value: key, textStyle: {color: '#fff'}} : key);

		                    var val = '';
		                    switch(i+1){
		                    	 //case 1: val = item.customerBandingCount+(i+1)*(j+1)*3;break;//测试数据需删除
		                    	case 1: val = item.activeCustomerCount;break;
		                    	case 2: val = item.orderCount;break;
		                    	case 3: val = item.orderPayment;break;
		                    }
		                    chartArr['options' + (i+1)].values.push(sel && j == res.result.statYmdVoList.length-sel ? {value: val, itemStyle: {normal:{color: '#fff'}}} : val);
	                	});
            		}
            		else{	//自定义七天之内
            			$.each(res.result.statYmdVoList, function(j, item){
	            			var key = (new Date(item.ymd).getMonth()+1) + '.' + new Date(item.ymd).getDate();
	            			/*console.log(j,timeSpace)*/
	            			chartArr['options' + (i+1)].keys.push(j>=7-timeSpace ? {value: key, textStyle: {color: '#fff'}} : key);

		                    var val = '';
		                    switch(i+1){
		                    	 //case 1: val = item.customerBandingCount+(i+1)*(j+1)*3;break;//测试数据需删除
		                    	case 1: val = item.customerBandingCount;break;
		                    	case 2: val = item.activeCustomerCount;break;
		                    	case 3: val = item.orderCount;break;
		                    	case 4: val = item.orderPayment;break;
		                    }
		                    chartArr['options' + (i+1)].values.push(j>=7-timeSpace ? {value: val, itemStyle: {normal:{color: '#fff'}}} : val);
	                	});
            		}
            		
	                _this.echartsInit(chartArr['options' + (i+1)]);
            	});
            }
        });
    },
    openDatePicker: function(num){
    	var _this = this;
		var D = new Date();
		if (num == 2){	//设定结束时间的初始value
			var p1 = _this.pickers['picker1'].value;	
			var PD1 = new Date(p1[0], p1[1], p1[2]);
			D = PD1;
		}
		function getYearArr(num,text){
			text = text||'';
			if (num == 1){
				var arr = [];
                for (var i = 1970; i <= new Date().getFullYear(); i++) { arr.push(i + text); }
                return arr;
			} else if (num == 2){
				var Y = PD1.getFullYear(), OY = new Date(PD1-0+30*1000*60*60*24).getFullYear();
	            var arr = [Y + text];
	            if (OY != Y)
	            	arr.push(OY + text);
	            return arr;
			}
		}
		function getMonthArr(num, text){
			if (num == 1){
				return text?('1月 2月 3月 4月 5月 6月 7月 8月 9月 10月 11月 12月').split(' '):('0 1 2 3 4 5 6 7 8 9 10 11').split(' ');
			} else if (num == 2){
				var M = PD1.getMonth(), OM = new Date(PD1-0+30*1000*60*60*24).getMonth();
	            var arr = [text?[(M+1) + text]:M];
	            if (OM != M){
	            	var val = text?[(OM+1) + text]:OM;
	            	arr.push(val);
	            }
	            return arr;
			}
		}
		function getHdHtml(num){
			switch(parseInt(num)){
				case 1: 
					return '<div class="toolbar">' +
					            '<div class="toolbar-inner">' +
					                '<div class="left">' +
					                    '<a href="#" id="cancel" class="link toolbar-randomize-link">取消</a>' +
					                '</div>' +
					                '<div class="center">　请选择开始时间</div>' +
					                '<div class="right">' +
					                    '<a href="#" id="next" class="link close-picker">下一步</a>' +
					                '</div>' +
					            '</div>' +
					        '</div>';
				case 2: 
					return '<div class="toolbar">' +
					            '<div class="toolbar-inner">' +
					                '<div class="center">　请选择结束时间</div>' +
					                '<div class="right">' +
					                    '<a href="#" id="submit" class="link close-picker">完成</a>' +
					                '</div>' +
					            '</div>' +
					        '</div>';	        
			}
		}
		_this.pickers['picker' + num] = myApp.picker({
		    input: '#picker-date' + num,
		    toolbar: true,
		    rotateEffect: true,
		    toolbarTemplate: getHdHtml(num),
		    value: [D.getFullYear(),D.getMonth(), D.getDate()],
		 	onOpen: function(){
		 		$("#mask").addClass("mask");
		 		var _self = this;
		 		$("body").addClass('overFh');
		 		$("#picker-date1").addClass("time_navbar_on").siblings().removeClass("time_navbar_on");
		 		$("#cancel").off().on("click", function(){
		 			$("#mask").removeClass("mask");
		 			_this.pickers['picker' + num].close();
		 		});
		 		$("#next").off().on("click", function(){
		 			_this.openDatePicker(num+1);
		 			setTimeout(function(){
		 				_this.pickers['picker' + (num+1)].open();
		 			},600);
		 		});
		 		$("#submit").off().on("click", function(){
		 			$("#mask").removeClass("mask");
		 			var p1 = _this.pickers['picker1'].value, p2 = _this.pickers['picker2'].value;
		 			var sTime = new Date(p1[0], p1[1], p1[2], 0, 0, 0) - 0, eTime = new Date(p2[0], p2[1], p2[2], 0, 0, 0) - 0 + 1000*60*60*24;
		 			var timeSpace = (eTime-sTime)/86400000;		//自定义选取时间间隔
		 			$("#param").attr("data-space", timeSpace);
		 			if (timeSpace<7) {
		 				_this.loadData(eTime-86400000*7, eTime,0,timeSpace,sTime);
		 			}
		 			else{
		 				_this.loadData(sTime, eTime);
		 			}
		 		});
		 	},
		    onChange: function (picker, values, displayValues) {
		        var daysInMonth = new Date(picker.value[0], picker.value[1]-0+1, 0).getDate();
		        var ymd = new Date(picker.value[0], picker.value[1], picker.value[2]);
		        var now = new Date();		        
		        if (values[2] > daysInMonth)	//设定这个月有多少天
		            picker.cols[2].setValue(daysInMonth);
		        if ((ymd-0) > (now-0)){	//设定选择时间不能超过今天
		        	picker.cols[0].setValue(now.getFullYear());
	        		picker.cols[1].setValue(now.getMonth());
	        		picker.cols[2].setValue(now.getDate());
		        }
		        if (num == 2){	//结束时间选择
		        	var ymd = new Date(picker.value[0], picker.value[1], picker.value[2]);
		        	var year = picker.value[0], month = picker.value[1], day = picker.value[2];
		        	var maxEndDate = new Date(p1[0], p1[1], p1[2]) - 0 + 30*1000*60*60*24;
		        	/*console.log(ymd-0,day,PD2,p1)*/	        	
		        	if ((ymd-0) < (PD1-0)){	//结束时间不能小于开始时间
		        		picker.cols[0].setValue(p1[0]);
		        		picker.cols[1].setValue(p1[1]);
		        		picker.cols[2].setValue(p1[2]);
		        	} 
		        	if ((ymd-0) > maxEndDate){//设定结束时间在开始时间30天以内
		        		picker.cols[0].setValue(new Date(maxEndDate).getFullYear());
		        		picker.cols[1].setValue(new Date(maxEndDate).getMonth());
		        		picker.cols[2].setValue(new Date(maxEndDate).getDate());
		        	}
		        }
		    },
		    onClose: function(){
		    	$("body").removeClass('overFh');
		    },
		    cols: [  
		        {// Years
		            values: getYearArr(num),
		            displayValues: getYearArr(num, '年')
		        },  
		        {// Months
		            values: getMonthArr(num),
		            displayValues: getMonthArr(num, '月')
		        },
		        {// Days
		            values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
		            displayValues: ['1日','2日','3日','4日','5日','6日','7日','8日','9日','10日','11日','12日','13日','14日','15日','16日','17日','18日','19日','20日','21日','22日','23日','24日','25日','26日','27日','28日','29日','30日','31日']
		        }
		    ]
		});     
    },
    setFilter: function(){		//to do 对接native 添加筛选	
    	var _this = this;
		$('#filtBtn').off().on('click', function () {
			$("body").addClass('overFh');
			$("#mask").addClass("mask");
			myApp.pickerModal('.picker-info');
			setTimeout(function(){
 				$('.picker-info').addClass('modal-in')
 			}, 100);
		  	$('.storeList').off().on('click',function(){
		  		myApp.closeModal('.picker-info');	/*关闭条件*/
		  		setTimeout(function(){				/*打开门店列表*/
		 				_this.openStoreList();
		 		},600);	
		  	});
		  	$('.topCategory').off().on('click',function(){
		  		myApp.closeModal('.picker-info');	
		  		setTimeout(function(){				/*打开一级分类列表*/
		 				_this.openTopCategoryaList();
		 		},600);	
		  	});
		  	$('.twoCategory').off().on('click',function(){
		  		myApp.closeModal('.picker-info');	
		  		setTimeout(function(){				/*打开二级分类列表*/
		 				_this.openTwoCategoryaListNone();
		 		},600);	
		  	});
		  	$('.allBrand').off().on('click',function(){
		  		myApp.closeModal('.picker-info');	
		  		setTimeout(function(){				/*打开品牌列表*/
		 				_this.openSupplierBrandList();
		 		},600);	
		  	});
		}); 
	},
	getClassfiyHtm: function (num){
		switch(parseInt(num)){
			case 1: 
				return '<div class="toolbar">' +
				            '<div class="toolbar-inner">' +
				                '<div class="left">' +
				                    '<a href="#" id="cancel" class="link toolbar-randomize-link">取消</a>' +
				                '</div>' +
				                '<div class="center">　请选择门店</div>' +
				                '<div class="right">' +
				                    '<a href="#" id="storeConfirm" class="link close-picker">确定</a>' +
				                '</div>' +
				            '</div>' +
				        '</div>';
			case 2: 
				return '<div class="toolbar">' +
				            '<div class="toolbar-inner">' +
				                '<div class="left">' +
				                    '<a href="#" id="cancel" class="link toolbar-randomize-link">取消</a>' +
				                '</div>' +
				                '<div class="center">　请选择一级分类</div>' +
				                '<div class="right">' +
				                    '<a href="#" id="topCategoryConfirm" class="link close-picker">确定</a>' +
				                '</div>' +
				            '</div>' +
				        '</div>';
			case 3:
				return '<div class="toolbar">' +
				            '<div class="toolbar-inner">' +
				                '<div class="left">' +
				                    '<a href="#" id="cancel" class="link toolbar-randomize-link">取消</a>' +
				                '</div>' +
				                '<div class="center">　请选择二级分类</div>' +
				                '<div class="right">' +
				                    '<a href="#" id="twoCategoryConfirm" class="link close-picker">确定</a>' +
				                '</div>' +
				            '</div>' +
				        '</div>';
			case 4:
				return '<div class="toolbar">' +
				            '<div class="toolbar-inner">' +
				                '<div class="left">' +
				                    '<a href="#" id="cancel" class="link toolbar-randomize-link">取消</a>' +
				                '</div>' +
				                '<div class="center">　请选择品牌</div>' +
				                '<div class="right">' +
				                    '<a href="#" id="SupplierBrand" class="link close-picker">确定</a>' +
				                '</div>' +
				            '</div>' +
				        '</div>';        
			}
    },
    openStoreList:function(){	/*门店列表查询*/
    	var _this = this;
    	$.ajax({
    		url:_this.getStoreList,
    		type:'post',
    		data:{
    			open:'0_1',
    			index:'0',
    			length:'30'
    		},
    		success:function(res){
			 	if (res.status === '0'){
			    	var pickerCustomToolbar = myApp.picker({
					    input: '',
					    rotateEffect: true,
					    toolbarTemplate:_this.getClassfiyHtm(1) ,
					    cols: [
					        {
					        	textAlign: 'center',
					            values: (function(){
					            	var storeArr=[];
					            	storeArr.push('所有门店');
					            	for (var i=0;i<=res.result.storeVoList.length-1;i++) {
			    						storeArr.push(res.result.storeVoList[i].store.name)
			    					}
			    					return storeArr;
					            })(),
					        }
					    ],
						onOpen:function(){
				    	$("#cancel").off().on("click", function(){
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in')
					 			}, 100);
					 		},600);
					 	});
					 	/*console.log(res)*/
					 	$('#storeConfirm').off().on('click',function(){
					 		var storePicker = pickerCustomToolbar.cols[0].value;	/*获取所选门店*/	
					 		$('.storeText').text(storePicker);
					 		if (storePicker!='所有门店') {
					 			for(var i=0;res.result.storeVoList.length-1;i++){		/*查询并存储storeId*/
					 			if (res.result.storeVoList[i].store.name==storePicker)
						 			{
						 				var storeId = res.result.storeVoList[i].store.id;
						 				break;
						 			}
						 		}
						 		$("#param").attr("data-storeId", storeId);
					 		}	
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in');
					 			}, 100);
					 		},600);
					 	});
				    	},
				    	onChange:function(){

				    	}
					});
					pickerCustomToolbar.open();
    			}
    			 else {
    			 	return mobileAlert(res.errmsg ? res.errmsg : "获取门店列表失败！");
    			}
    		}
    	})
    },
    openTopCategoryaList:function(){
    	var _this = this;
    	$.ajax({
    		url: _this.getTopCategoryList,
    		type: 'post',
    		success:function(res){
    			var categroy = res;
    			if (res.status === '0'){
			    	var pickerCustomToolbar = myApp.picker({
					    input: '',
					    rotateEffect: true,
					    toolbarTemplate:_this.getClassfiyHtm(2) ,
					    cols: [
					        {
					        	textAlign: 'center',
					            values: (function(){
					            	var storeArr=[];
					            	storeArr.push('所有一级分类');
					            	for (var i=0;i<=res.result.categoryFamilyVoList.length-1;i++) {
			    						storeArr.push(res.result.categoryFamilyVoList[i].categoryFamily.familyName)
			    					}
			    					return storeArr;
					            })(),
					        }
					    ],
						onOpen:function(){
				    	$("#cancel").off().on("click", function(){
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in')
					 			}, 100);
					 		},600);
					 	});
					 	$('#topCategoryConfirm').off().on('click',function(){
					 		var topCategoryConfirm = pickerCustomToolbar.cols[0].value;	/*获取选定的值*/
					 		$('.topText').text(topCategoryConfirm);
					 		if (topCategoryConfirm!='所有一级分类') {
					 			for(var i=0;res.result.categoryFamilyVoList.length-1;i++){		/*查询并储存一级分类id*/
						 			if (res.result.categoryFamilyVoList[i].categoryFamily.familyName==topCategoryConfirm)
						 			{
						 				var c1 = res.result.categoryFamilyVoList[i].categoryFamily.id;
						 				break;
						 			}
						 		}
						 		$("#param").attr("data-c1", c1);
					 		}
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			if (topCategoryConfirm!='所有一级分类'){
					 				_this.openTwoCategoryaList(categroy,topCategoryConfirm);
					 			}
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in');
					 			}, 100);
					 		},600);
					 	});
				    	}
					});
					pickerCustomToolbar.open();
    			 }
    			 else {
    			 	return mobileAlert(res.errmsg ? res.errmsg : "获取一级分类列表失败！");
    			 }
    		}
    	})
    },
    openTwoCategoryaList:function(categroy,topCategoryConfirm){
    	var _this = this;			
    	$('.twoCategory').off().on('click',function(){
    		myApp.closeModal('.picker-info');
    		setTimeout(function(){
	    		for(var i=0;i<=categroy.result.categoryFamilyVoList.length;i++){
					var categroyList = categroy.result.categoryFamilyVoList;
					if (categroyList[i].categoryFamily.familyName==topCategoryConfirm)
					 {
						var twoCateList = categroyList[i].categoryVoList;
						break;
					}	
	    		}
				var pickerCustomToolbar = myApp.picker({
				    input: '',
				    rotateEffect: true,
				    toolbarTemplate:_this.getClassfiyHtm(3) ,
				    cols: [
				        {
				        	textAlign: 'center',
				            values: (function(){
				            	var twoCateArr=[];
				            	twoCateArr.push('所有二级分类');
				            	for (var i=0;i<=twoCateList.length-1;i++) {
		    						twoCateArr.push(twoCateList[i].category.name);
		    					}
		    					return twoCateArr;
				            })(),
				        }
				    ],
					onOpen:function(){
				    	$("#cancel").off().on("click", function(){
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in')
					 			}, 100);
					 		},600);
					 	});
					 	/*console.log(twoCateList);*/
					 	$('#twoCategoryConfirm').off().on('click',function(){
					 		var twoCategoryConfirm = pickerCustomToolbar.cols[0].value;	/*获取选定的值*/
							$('.twoText').text(twoCategoryConfirm);
							if (twoCategoryConfirm!='所有二级分类') {
								for(var i=0;i<=twoCateList.length-1;i++){		/*获取并储存c2*/	
						 			if (twoCateList[i].category.name==twoCategoryConfirm)
						 			{
						 				var c2 = twoCateList[i].category.id;
						 				break;
						 			}
						 		}
						 		$("#param").attr("data-c2", c2);
							}
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in');
					 			}, 100);
					 		},600);
					 	});
			    	}
				});
				pickerCustomToolbar.open();
			},600);
    	})   	
    },
    openTwoCategoryaListNone:function(){
    	var _this = this;
    	if ($('.topText').text()=='所有一级分类') {
    		var pickerCustomToolbar = myApp.picker({
			    input: '',
			    rotateEffect: true,
			    toolbarTemplate:_this.getClassfiyHtm(3) ,
			    cols: [
			        {
			        	textAlign: 'center',
			            values: ['所有二级分类'],
			        }
			    ],
				onOpen:function(){
		    	$("#cancel").off().on("click", function(){
			 		pickerCustomToolbar.close();
			  		setTimeout(function(){
			 			myApp.pickerModal('.picker-info');
			 			setTimeout(function(){
			 				$('.picker-info').addClass('modal-in')
			 			}, 100);
			 		},600);
			 	});
			 	$('#twoCategoryConfirm').off().on('click',function(){
			 		pickerCustomToolbar.close();
			  		setTimeout(function(){
			 			myApp.pickerModal('.picker-info');
			 			setTimeout(function(){
			 				$('.picker-info').addClass('modal-in')
			 			}, 100);
			 		},600);
			 	});
		    	}
			});
			pickerCustomToolbar.open();
    	}
    },
    openSupplierBrandList:function(){
    	var _this = this;
    	$.ajax({
    		url: _this.getSupplierBrandList,
    		type: 'post',
    		success:function(res){
    			if (res.status === '0'){
			    	var pickerCustomToolbar = myApp.picker({
					    input: '',
					    rotateEffect: true,
					    toolbarTemplate:_this.getClassfiyHtm(4),
					    cols: [
					        {
					        	textAlign: 'center',
					            values: (function(){
					            	var storeArr=[];
					            	storeArr.push('所有品牌');
					            	for (var i=0;i<=res.result.brandList.length-1;i++) {
			    						storeArr.push(res.result.brandList[i].brandName)
			    					}
			    					return storeArr;
					            })(),
					        }
					    ],
						onOpen:function(){
				    	$("#cancel").off().on("click", function(){
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in')
					 			}, 100);
					 		},600);
					 	});
					 	$('#SupplierBrand').off().on('click',function(){
					 		var SupplierBrand = pickerCustomToolbar.cols[0].value;	/*获取选定的值*/
					 		$('.SupplierBrand').text(SupplierBrand);
					 		if (SupplierBrand!='所有品牌') {
					 			for(var i=0;res.result.brandList.length-1;i++){		/*获取并储存brandId*/	
						 			if (res.result.brandList[i].brandName==SupplierBrand)
						 			{
						 				var brandId = res.result.brandList[i].id;
						 				break;
						 			}
						 		}
						 		$("#param").attr("data-brandId", brandId);
					 		}
					 		pickerCustomToolbar.close();
					  		setTimeout(function(){
					 			myApp.pickerModal('.picker-info');
					 			setTimeout(function(){
					 				$('.picker-info').addClass('modal-in');
					 			}, 100);
					 		},600);
					 	});
				    	}
					});
					pickerCustomToolbar.open();
    			 }
    			 else {
    			 	return mobileAlert(res.errmsg ? res.errmsg : "获取品牌列表失败！");
    			 }
    		}
    	})
    },
    getCondition:function(){	/*获取条件*/
    	var $dom = $("#param");
    	var param = {
    		storeId: $dom.attr("data-storeId"),
    		c1: $dom.attr("data-c1"),
    		c2: $dom.attr("data-c2"),
    		brandId :$dom.attr("data-brandId"),
    		sTimeB :$dom.attr("data-startTimeB"),
    		eTimeB :$dom.attr("data-endTimeB"),
    		sTimeL :$dom.attr("data-startTimeL"),
    		eTimeL :$dom.attr("data-endTimeL"),
    		sel : $dom.attr("data-sel"),
    		space : $dom.attr("data-space")
    	}
    	return param;
    },
    filtBtn:function(){	/*筛选条件确定*/
    	var _this = this;
    	var param = _this.getCondition();
    	$("#mask").removeClass("mask");
        $("body").removeClass('overFh');
    	_this.loadData(param.sTimeL,param.eTimeL,param.sel,param.space,param.sTimeB,param);
    }
}
var d = new DO(); 
d.init();