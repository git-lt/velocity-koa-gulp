define(['moment','jquery','avalon'],function(moment){

	var quickTime=[];
	quickTime.push(moment().format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD HH:mm:ss'));
	quickTime.push(moment().subtract(1,'days').format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD 00:00:00'));
	quickTime.push(moment().subtract(7,'days').format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD 00:00:00'));
	quickTime.push(moment().subtract(30,'days').format('YYYY-MM-DD 00:00:00')+'&'+moment().format('YYYY-MM-DD 00:00:00'));
	var defaultInterval= $("button[data-interval].active").data("interval"),startTime="",endTime="";
	if(defaultInterval){
		startTime =  quickTime[defaultInterval].split('&')[0];
		endTime = quickTime[defaultInterval].split('&')[1];
	}
	var datePickerVM = avalon.define({
		$id:'datePicker',
		startTime: startTime,
		endTime: endTime,
		quickSltEv:function(e){
			e.preventDefault();
			var _this = $(this);
			_this.toggleClass('active');
			var interval = _this.data('interval');
			if(_this.hasClass('active')){
				_this.siblings().removeClass('active');
				if(interval===''){
					datePickerVM.startTime = '';
					datePickerVM.endTime = '';
				}else{
					datePickerVM.startTime =  quickTime[interval].split('&')[0];
					datePickerVM.endTime = quickTime[interval].split('&')[1];
				}
			}else{
				datePickerVM.startTime = '';
				datePickerVM.endTime = '';
			}
		}
	});

	var datePicker = {
		init:function(){
			$("#dateStart").on("click",function(){
				WdatePicker({
					startDate:'%y-%M-%d 00:00:00',
					dateFmt:'yyyy-MM-dd HH:mm:ss',
					qsEnabled:false,
					maxDate:'%y-%M-%d',
					minDate:'#F{$dp.$D(\'dateEnd\',{M:-3});}'
				});
			});

			$("#dateEnd").on("click",function(){
				WdatePicker({
					startDate:'%y-%M-%d 23:59:59',
					dateFmt:'yyyy-MM-dd HH:mm:ss',
					qsEnabled:false,
					maxDate: $("#dateStart").val() ? '#F{$dp.$D(\'dateStart\',{M:3})}' : '%y-%M-%d',
					minDate:'#F{$dp.$D(\'dateStart\');}'
				});
			});

			avalon.scan();
		}
	};
	return datePicker;
});