/**
 * [description]
 */
define(['utils'], function(){
	var page, CONF;
	CONF = {
		apiGetPageList:'getPageList.json',
		apiDelPage:'deleteSelfPage.json'
	};

	page = {
		init:function(){
			this.getListData();
		},
		getListData:function(){
			var pms = {
				index:0,
				length:30,
			};

			var	url = CONF.apiGetPageList,
				$tbl = $('#pageListTbl'),
				$tbdBox = $('#pageListTbd'),
				$pageBox = $('#pageListPagesNums'),
				$pageTotal = $('pageListDataTotal');

			$.post(url, pms)
			.done(function(data){
				if(data.status === '0'){
					var listData = data.templatePageVoList,
							count = data.count;

					$pageTotal.text(count);
					if(count>0){
						$tbdBox.html(template('page_list_tpl', {data: listData}));

						$pageBox.pagination({
							totalData:count,
							showData:pms.length,
							coping:true,
							callback:function(i){
								pms.index = (i-1)*pms.length;
								$tbl.uiLoading('lg');
								$.post(url, pms)
								.done(function(data){
									$tbdBox.html(template('page_list_tpl', {data: data.templatePageVoList}));
									$tbl.uiLoading('lg');
								});
							}
						});
					}else{
						$tbdBox.html('<tr><td colspan="10"><p class="p20 c-8 text-center"> 未查询到相关数据 </p></td></tr>');
						$pageBox.html('');
					}
				}else{
					toastr.error(data.errmsg || ERRMSG['100']);
				}
			});
		}
	};

	return {
		init:function(){
			page.init();
		}
	}
});