define(['utils','momentPicker','WdatePicker'],function(utils,datePicker){
	var CONFIG, page;

	CONFIG = {
		
	};

	page={
		init:function(){
			this.initElement();  //信息初始化
		},
		initElement:function(){
			$("#shopTypeR").select2({minimumResultsForSearch: -1});
			datePicker.init();
		},
	}
			

	return {
		init:function(){
			page.init();
		}
	}
});