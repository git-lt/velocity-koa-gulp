var DO = function(){
	this.pickStartDay = null,this.pickEndDay = null;
	this.pickers = {};
	this.getSalesOrderRank = '../admin/getSalesOrderRank.json';
}

DO.prototype = {
	init: function(){
		var _this = this;
		_this.sTime = _this.getTimesBefore(1), _this.eTime = _this.getTimesEnd(0);

		_this.loadData(_this.sTime, _this.eTime, 1);//开始时间，结束时间，选中下标
		$(".navbarEvt").on("click",function(){
			_this.loadData(_this.getTimesBefore($(this).data("start")), _this.getTimesEnd($(this).data("end")), $(this).data("sel"));
        	$(this).addClass("time_navbar_on").siblings().removeClass("time_navbar_on");
        });
        _this.openDatePicker(1);//初始化第一个自定义时间选择控件
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
    loadData: function(sTime, eTime, sel){
    	var _this = this;
    	$.ajax({
    		url:_this.getSalesOrderRank,
	        type:'post',
	        data:{
	            index:'0',
	            length:'20',
	            sortType:'DESC',
	            sortName:'orderPayment',
	            startTime: sTime, 
                endTime : eTime
	        },
	        success:function(res){
	            if (res.status === '0') {
	                var html = template('salesOrderTpl', {list:res.result.salesOrderRank});
	                $("#content").html(html);
	                var rankLength = res.result.salesOrderRank.length;
	                if(rankLength===0){
	                	$(".noneData").text("暂无数据");
	                }
	            }
	            else{
	                return mobileAlert(res.errmsg ? res.errmsg : "获取排行数据失败！");
	            }
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