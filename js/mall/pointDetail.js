var pointDetail = function(){
	this.getcustomerPointFlowVo = '../mall/customerPointFlowVo.json'
}

pointDetail.prototype = {
	init:function(){
		this.getcustomerPointDetail(0); /*获取信息列表*/
	},
	getcustomerPointDetail:function(index){
		var _this = this;
		$.ajax({
			url: _this.getcustomerPointFlowVo,
			type: 'post',
			data: {
				index: index,
				length: '20'
			},
			success:function(res){
				if (res.status==='0') {
					if (res.result.all==true) {
						var html = template('pointDetailData', res.result||'');
						$("#content").append(html);
						$(".dLoading").text("没有更多了").show();
					}
					else if (res.result.all!=true) {
						var html = template('pointDetailData', res.result||'');
						$("#content").append(html);
						$(".dLoading").text("点击加载更多").show();
						$(window).off().on('scroll',function(){
							if ($(window).scrollTop()===$(document).height()-$(window).height()) {
								index = index + 20;
								_this.getcustomerPointDetail(index);
							}
						})
					}
					else if (res.result.count===0){
						$(".listNone").removeClass("hide");
					}
					else {
						$(".dLoading").text("没有更多了");
					}
				}
				else {
					$.alert(res.errmsg||"系统繁忙，请稍后再试");
				}
			}
		})
	}
}

var d = new pointDetail();
d.init();

