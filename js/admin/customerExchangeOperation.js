define(['utils','momentPicker','WdatePicker'],function(utils,datePicker){
	var CONFIG, page;
	CONFIG = {
		apigetCustomer:'getCustomerPointFlowVoList.json'
	};

	page={
		init:function(){
			$("#shopTypeR").select2({minimumResultsForSearch: -1});
			datePicker.init();
			this.initTimePiker(); //时间初始化
			this.getCustomer();   //会员积分列表
			this.searchEv();      //搜索
		},
		initTimePiker:function(){
			$.initDatePicker([
				{ST:'#dateStart', ET:'#dateEnd'}
			]);
		},
		getCustomer:function(){
			$('#jiOperate').uiLoading('lg');
			var startTime=$("#dateStart").val();
			var endTime=$("#dateEnd").val();
			var options = {
	    		customerMobile:$("#memberTel").val(),
				customerName:$("#memberNc").val(),
				startTime: utils.getUnixTime(startTime),
				endTime: utils.getUnixTime(endTime),
				index:0,
				length:utils.listLength,
				referType:$("#shopTypeR").val()
	    	};
	    	$.post(CONFIG.apigetCustomer,options,function(data){
	    		if(data.status=="0"){
	    			var list=data.result.list;
	    			if(list!=''){
	    				$('#jiOperate').uiLoading('lg');
	    				$('#jiOperate').html(template('jiOperaList',{list:data.result.list}));
	    				$('#pagination').pagination({
	    					totalData:data.result.count,
	    					showData:utils.listLength,
	    					callback:function(i){
	    						options.index=(i-1)*options.length;
	    						$.post(CONFIG.apigetCustomer, options, function(data){
	    							if(data.status=="0"){
    								$('#jiOperate').html(template('jiOperaList',{list:data.result.list}));
	    							}else{
	    								toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
	    							}
	    						});
	    					}
	    				})
	    			}else{
	    				$('#jiOperate').uiLoading('lg');
	    				$("#jiOperate").html(template('no'));
	    				$('#pagination').pagination({
		    				totalData:1,
		    				showData:1
		    			});
	    			}
	    		}else{
	    			toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
	    		}
	    	})
		},
	    searchEv:function(){
	    	var _this=this;
	    	$("#sRecordBtn").on("click",function(e){
	    		e.preventDefault();
	    		_this.getCustomer();
	    	});
	    }
	}
			

	return {
		init:function(){
			page.init();
		}
	}
});