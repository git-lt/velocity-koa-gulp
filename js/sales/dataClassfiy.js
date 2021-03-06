var DO = function(){
	this.pickStartDay = null,this.pickEndDay = null;
	this.pickers = {};
	this.getSupplierDataBetweenUrl = '../admin/getProductDataBetween.json';
	this.getSupplierDataStatListUrl = '../admin/getProductDataStatList.json';
}

DO.prototype = {
	init: function(){
		var _this = this;
		_this.loadData(_this.getTimesBefore(7), _this.getTimesEnd(1), 1);
		//开始时间，结束时间，选中下标
		$(".navbarEvt").on("click",function(){
			_this.loadData(_this.getTimesBefore($(this).data("start")), _this.getTimesEnd($(this).data("end")), $(this).data("sel"));
        	$(this).addClass("time_navbar_on").siblings().removeClass("time_navbar_on");
        });
        _this.openDatePicker(1);//初始化第一个自定义时间选择控件
	},
	callNativeSetTitle: function(sTime,eTime,sel){
		// var unit = Math.floor((eTime - sTime)/24/60/60/1000);
		// var title = '';
		// if (isCustom) unit = 2;
		// switch(parseInt(unit)){
		// 	case 0: title = '今日';break;
		// 	case 1: title = '昨日';break;
		// 	default:
		// 		title = getLocalTime(sTime).split(" ")[0] + "至" + getLocalTime(eTime).split(" ")[0];
		// 		break;
		// }
		if(sel==1) 
			{
				title='今日'
			}
		else if(sel==2)
			{
				title='昨日'
			}
		else
		{
			title = getLocalTime(sTime).split(" ")[0] + "至" + getLocalTime(eTime-1000*60*60*24).split(" ")[0];
		}
		/*console.log(title);*/
		/*window.WebViewJavascriptBridge.callHandler('setTitleAction',{//调native改变title
			title: title
		});*/
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
    loadData: function(sTime, eTime, sel){
    	var _this = this;
    	$.ajax({
    		url: _this.getSupplierDataBetweenUrl,
            type: "post",
            data: {
            	token: getUrlParam("token"),
                startTime: sTime, 
                endTime : eTime
            },
            success: function(res){
            	if(res.status === '0'){
            		_this.callNativeSetTitle(sTime,eTime,sel);
            		var html = template('dataO', res.result||'');
					$("#content").html(html);
            	} else 
            		return mobileAlert(res.errmsg ? res.errmsg : "系统繁忙，请稍后再试");
            }
    	});
    	$.ajax({
            url: _this.getSupplierDataStatListUrl,
            type: "post",
            data: {
            	token: getUrlParam("token"),
                startTime: sTime, 
                endTime : eTime
            },
            success: function(res){
            	if (res.status!=0) return;
            	var chartArr = [];
            	$(".chartEvt").each(function(i){
            		chartArr['options' + (i+1)] = new Object();
            		chartArr['options' + (i+1)].id = $(this).attr("id");
            		chartArr['options' + (i+1)].text = $(this).data("text");
            		chartArr['options' + (i+1)].keys = [],chartArr['options' + (i+1)].values = [];
            		$.each(res.result.statYmdVoList, function(j, item){
            			var key = (new Date(item.ymd).getMonth()+1) + '.' + new Date(item.ymd).getDate();
        				chartArr['options' + (i+1)].keys.push(sel && j == res.result.statYmdVoList.length-sel ? {value: key, textStyle: {color: '#EEAEEE'}} : key);

	                    var val = '';
	                    switch(i+1){
	                    	//case 1: val = item.customerBandingCount+(i+1)*(j+1)*3;break;//测试数据需删除
	                    	case 1: val = item.activeCustomerCount;break;
	                    	case 2: val = item.orderCount;break;
	                    	case 3: val = item.orderPayment;break;
	                    }
	                    chartArr['options' + (i+1)].values.push(sel && j == res.result.statYmdVoList.length-sel ? {value: val, itemStyle: {normal:{color: '#EEAEEE'}}} : val);
	                });
	                _this.echartsInit(chartArr['options' + (i+1)]);
            	});
            }
        });
    },
    openDatePicker: function(num){
    	var _this = this;
    	var myApp = new Framework7();
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
		 		var _self = this;
		 		$("body").addClass('overFh');
		 		$("#picker-date1").addClass("time_navbar_on").siblings().removeClass("time_navbar_on");
		 		$("#cancel").off().on("click", function(){
		 			_this.pickers['picker' + num].close();
		 		});
		 		$("#next").off().on("click", function(){
		 			_this.openDatePicker(num+1);
		 			setTimeout(function(){
		 				_this.pickers['picker' + (num+1)].open();
		 			},600);
		 		});
		 		$("#submit").off().on("click", function(){
		 			var p1 = _this.pickers['picker1'].value, p2 = _this.pickers['picker2'].value;
		 			var sTime = new Date(p1[0], p1[1], p1[2], 0, 0, 0) - 0, eTime = new Date(p2[0], p2[1], p2[2], 0, 0, 0) - 0 + 1000*60*60*24;
		 			_this.loadData(sTime, eTime);
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
    }
}