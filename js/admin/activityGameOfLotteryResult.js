define(['utils','WdatePicker','momentPicker'], function(Util,WdatePicker,datePicker){

	template.helper('percent', function (num, allnum) {
	    return (num/allnum*100).toFixed(2) + "%";
	});
	var LotyResult = {
		init: function(){

			this.render();

			this.eventInit();
		},
		render: function(){

			datePicker.init();//初始化时间

			$("ul.tabs").tabs(function(el){ //初始化tab
				var a_id = el.data("id"),
				selor = {
					lotteryResult: '#lotteryResult,#lotyResDesc,#lotyResFilt',
					useStatistics: '#useStatDesc,#useStatFilt,#useStatistics'
				};
				selor.all = selor.lotteryResult+','+selor.useStatistics;
				$(selor.all).addClass('dn');
				$(selor[a_id]).removeClass('dn');
			});

			this.loadlotteryResultData({pagination: true});
			this.loaduseStatisticsData({pagination: true});
		},
		eventInit: function(){
			$("#listFilter").on("click", function(){
				var ops = {pagination: true};
				$(".filterEvt").each(function(){
					if ($(this).hasClass("time"))
						ops[$(this).attr("name")] = $(this).val() && new Date($(this).val()).getTime();
					else
						ops[$(this).attr("name")] = $(this).val();
				});

				LotyResult.loadlotteryResultData(ops);
			});
			$(".useFilterBtn").on("click", function(){
				var ops = {
					pagination: true
				};
				if ($("#useFilterSel").val() != "")
					ops.couponStatus = $("#useFilterSel").val();
				LotyResult.loaduseStatisticsData(ops);
			});
		},
		loadlotteryResultData:function(ops){
			$("#lotteryResultList").html('<p class="text-center"><img src="../images/admin/loading.gif" /></p>');
			ops = ops || {};
			ops.index = ops.index || 0;
			ops.length = ops.length || Util.listLength;
			// ops.length = ops.length || 2;
			ops.luckyDrawId = mainVM.params.id;
			$.ajax({
				url:"queryLuckyRecordList.json",
				data:ops,
				success:function(data){
					if(data.status!="0"){
						return Util.alert(data.errmsg || "系统繁忙，请稍后再试");
					}
					$(".takeNum").text(data.result.count || 0);
					$(".rewNum").text(data.result.personCount || 0);
					$(".rewPercent").text((data.result.personCount/data.result.count*100).toFixed(2) + "%");
					if(data.result && !data.result.luckyRecordVoList.length){
						$("#lotteryResultList").html('<p class="f20 p30">暂无数据</p>');
						$('#lotteryResultPagination').pagination({
							totalData:1,
							showData:1
						});
						return;
					}
					var dataHtml = template('lotydata', data.result);
					$("#lotteryResultList").html(dataHtml);

					if(ops.pagination){
						$('#lotteryResultPagination').pagination({
							totalData: data.result.count,
							showData: ops.length,
							callback:function(i){
								ops.pagination=false;
								ops.index=(i-1)*ops.length;
								LotyResult.loadlotteryResultData(ops);
							}
						});
					}
				}
			});
		},
		loaduseStatisticsData: function(ops){
			$("#useStatisticsList").html('<p class="text-center"><img src="../images/admin/loading.gif" /></p>');
			ops = ops || {};
			ops.index = ops.index || 0;
			ops.length = ops.length || Util.listLength;
			ops.luckyDrawId = mainVM.params.id;
			$.ajax({
				url: "queryCouponStat.json",
				data: ops,
				success:function(data){
					if(data.status!="0"){
						return Util.alert(data.errmsg || "系统繁忙，请稍后再试");
					}

					if(data.result && !data.result.couponRewardVoList.length)
						$("#useStatDescList").html('<p class="f20 p30">暂无数据</p>');
					else{
						var cusdataHtml = template('cusdata', {arr: data.result.couponRewardVoList});
						$("#useStatDescList").html(cusdataHtml);
					}
					
					// 测试数据
					// data.result.couponRewardVoCustomerList = [
					// 	{couponName: "优惠券那么", takeTime: 1467353530000,useTime: 1467353530000,customerName:"轮子",customerPhone:"18625423023",orderCode: "xxooxxoo"},
					// 	{couponName: "优惠券那么", takeTime: 1467353530000,useTime: 1467353530000,customerName:"轮子",customerPhone:"18625423023",orderCode: "xxooxxoo"}
					// ];

					if(data.result && !data.result.couponRewardVoCustomerList.length){
						$("#useStatisticsList").html('<p class="f20 p30">暂无数据</p>');
						$('#useStatisticsListPagination').pagination({
							totalData:1,
							showData:1
						});
					} else {
						var usedataHtml = template('usedata', {arr: data.result.couponRewardVoCustomerList});
						$("#useStatisticsList").html(usedataHtml);

						if(ops.pagination){
							$('#useStatisticsListPagination').pagination({
								totalData: data.result.couponRewardVoCustomerList.length,
								showData: ops.length,
								callback:function(i){
									ops.pagination=false;
									ops.index=(i-1)*ops.length;
									LotyResult.loaduseStatisticsData(ops);
								}
							});
						}
					}
				}
			});
		}
	}
	return {
		init: function(){
			LotyResult.init();
		}
	}
});
