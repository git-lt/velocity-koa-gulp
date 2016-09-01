define(['utils'], function(Util){
	var Loty = {
		init: function(){
			this.render();
		},
		render: function(){
			$("ul.tabs").tabs(function(el){ //初始化tab
				var a_id = el.data("id"),
				selor = {
					ongoing: '#ongoing',
					nostart: '#nostart',
					isover: '#isover'
				};
				selor.all = selor.ongoing+','+selor.nostart+','+selor.isover;
				$(selor.all).addClass('dn');
				$(selor[a_id]).removeClass('dn');
			});

			this.loadData({id: "ongoing", pagination: true, status: 1});
			this.loadData({id: "nostart", pagination: true, status: 2});
			this.loadData({id: "isover", pagination: true, status: 3});
		},
		eventInit: function(){

		},
		loadData:function(ops){
			ops = ops || {};
			var id = ops.id || "";
			ops.index = ops.index || 0;
			ops.length = ops.length || Util.listLength;

			$("#" + id + "List").html('<p class="f20 p30"><img src="../images/admin/loading.gif" /></p>');

			$.ajax({
				url: "queryLuckyDrawList.json",
				data: ops,
				success:function(data){
					if(data.status!="0"){
						return Util.alert(data.errmsg || "系统繁忙，请稍后再试");
					}
					if(data.result && !data.result.luckyDrawList.length){
						$("#" + id + "List").html('<p class="f20 p30">暂无数据</p>');
						$(".nav-tabs ." + id + "Count").html('(0)');
						$('#' + id + 'Pagination').pagination({
							totalData:1,
							showData:1
						});
						return;
					}
					var dataHtml = template(id + 'data', data.result);
					$("#" + id + "List").html(dataHtml);

					if(ops.pagination){
						$(".nav-tabs ." + id + "Count").html('(' + data.result.count + ')');
						$('#' + id + 'Pagination').pagination({
							totalData: data.result.count,
							showData: ops.length,
							callback:function(i){
								ops.pagination=false;
								ops.index=(i-1)*ops.length;
								Loty.loadData(ops);
							}
						});
					}
				}
			});
		}
	};

	return {
		init:function(data){
			Loty.init();
		}
	};
});