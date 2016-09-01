var pointSign = function(){
	this.getCustomerSignDetail = '../mall/customerSignDetail.json'
	this.postSignSuccess = '../mall/customerSign.json'
}

pointSign.prototype = {
	init:function(){
		this.getSignDetail(); /*获取签到信息*/
		this.jalendarInit(); /*日历初始化*/
		this.signButtonEv(); /*点击按钮签到*/
	},
	jalendarInit:function(){
		$('#jalendar').jalendar({
		color: '#fff',
		weekColor: '#EA5C49',
	    type: 'selector',
	    dateType: 'yyyy-mm-dd'
		});
		$(".prv-m,.nxt-m,.header h1").remove();
		var width = document.body.clientWidth-40;
		$('#jalendar').width(width); 
	},
	signButtonEv:function(){
		var _this = this;
		$(".signBtn").on('touchstart',function(){
		_this.signSuccess();
		})
	},
	getSignDetail:function(){
		var _this = this;
		$.ajax({
			url: _this.getCustomerSignDetail,
			type: 'post',
			success:function(res){
				if (res.status === '0') {
					var cDays = res.result.consecutiveDays;
					var reward = res.result.reward;
					$('.cDays').text(cDays);
					$('.reward').text(reward);
					if (res.result.isSignToday === true) {
						$('.signBtn').addClass('signed')
						$('.today').addClass('active');
					}
				}
			}
		})
	},
	signSuccess:function(){
		var _this = this;
		$.ajax({
			url: _this.postSignSuccess,
			type: 'post',
			success:function(res){
				if (res.status===0) {
					$(this).addClass('signed')
					$('.today').addClass('active');
					$.toast('签到成功',res.result.reward);
				}
				else{
					$.toast(res.errmsg||"系统繁忙，请稍后再试");
				}
			}
		})

	}
}

var d = new pointSign();
d.init();