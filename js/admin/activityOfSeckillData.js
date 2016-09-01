getAjaxData(0);
function getAjaxData(idx){
	// p_customerList.o.cacheVipSalesData.length=0;
	$(".table tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');

	jQuery.getJSON("getFlashsaleStatistics.json",{index:idx,length:Util.listLength},function(data){
		if(data.status=='0'){
			var tempData={ list:data.result.flashsaleStatistics.flashsaleStatisticsDetailVoList};
			
			var dataHtml = template('tempData', tempData);
			$(".table tbody").html(dataHtml);
			Util.createPagination(data.result.count,idx,$(".pagination"),function(_i){
				getAjaxData(_i);
			});
		}else{
			Util.alert('系统繁忙，请稍候重试。');
		}
		
	});
}