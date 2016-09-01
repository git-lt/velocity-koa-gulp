var menuCurrent = "tool";
document.title="专题页面";
$.createSecondMenu("promotion_manage","商品专题");
Util.createHelpTip("商品专题相关问题",[
	{"title":"商品专题场景说明","link":"https://qiakr.kf5.com/posts/view/39417/"},
	{"title":"商品专题活动设置","link":"https://qiakr.kf5.com/posts/view/39777/"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);
getAjaxData(0);

function getAjaxData(status,idx,clearCount){
	$(".table tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		index:idx||0,
		length:Util.listLength
	};
	$.ajax({
		url:'getSpecialPromotionList.json',
		data:options,
		success:function(data){
			var tempData={
				list : data.result.specialPromotionList,
				hostUrl:'http://'+window.location.host
			}
			var dataHtml = template('promListTpl', tempData);
			$(".table tbody").empty().append(dataHtml);
			$(".filterTitle a.current .count").html('('+data.result.specialPromotionList.length+')');
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getAjaxData(_i);
			});
			$(".table").setTheadFixed();
		}
	});
}


$(".table").on("click",".viewUrl",function(e){
			// 拼接活动链接，设置到input
			// 用成二维码/mall/getSpecialPromotion.htm?id=2&suid=2
			$("#copyHBLink").val('复制链接');

			var link ='http://'+window.location.host+'/mall/getSpecialPromotion.htm?id='+$(this).data('id')+'&suid='+$(this).data('suid');

			$('#rwmImg').empty();
		     var qrcode = new QRCode(document.getElementById("rwmImg"), {
		         width : 200,
		         height : 200
		     });
		     qrcode.makeCode(link);
			$('#hbLinkIpt').val(link);
			
			dialog({
				title:'获取活动链接',
				content:$('#copyCPLink'),
            	backdropOpacity:"0.5",
            	width:500
			}).showModal();

			setTimeout(function(){
				$("#copyHBLink").zclip({
				    path: "//res.qiakr.com/plugins/zclip/zclip.swf",
				    copy: function(){
				    	return $('#hbLinkIpt').val();
				    },
				    setCSSEffects:false,
				    beforeCopy:function(){
						$(this).css('background','#449d44');
					},
				    afterCopy:function(){/* 复制成功后的操作 */
				    	$(this).val('复制成功');
				    }
				});
			},500);
});


var p_specialPromotion = {
	o:{},
	init:function(){
		this.delPromEv();
		this.openGuideEv();
	},
	delPromEv:function(){
		$('#promListBox').on('click','.delPromotion',function(){
			// 获取promId
			var promId = $(this).parents('tr').data('id');
			var data = {specialPromotionId:promId};

			Util.confirm('是否确认删除专题活动？', function(){
				$.post('delSpecialPromotion.json',data, function(data){
					if(data.status==='0'){
						Util.alert('删除成功！', function(){
							// 刷新列表
							window.location.href = window.location.href;
						})
					}else{
						Util.alert('删除数据失败，请重试！');
					}
				});
			})

		});
	},
	openGuideEv:function(){
		$('#promGuideLink').on('click',function(){
			dialog({
				title:'专题活动说明',
				content:$('#promGuideDia')[0],
				okValue:'我已了解'
			}).show();

		});
	}
}
p_specialPromotion.init();