define(['utils'],function(utils){
	var refundedVM = avalon.define({
		$id: "refundedFlowCtl",
		order:{},
		service:[],
		refundValue:0
	});
	avalon.scan();

	var page={
		dataInit:function(){
			$.getJSON("getCustomerServiceByOrderId.json?orderId="+mainVM.params.$model.orderId,function(data){
				refundedVM.order = data.result.customerOrder;
				refundedVM.service = data.result.customerServiceList;
				refundedVM.refundValue=0;
				$.each(data.result.customerServiceList,function(i,e){
					if(e.status == 88){
						refundedVM.refundValue += e.value||0;
					}
				});
			});
		}
	}
	return {
		init:function(){ 
			page.dataInit();
		}
	}
});