// 无限加载
var LoadDataByScroll = function(o){
	this.timer = null;
	this.loadH = o.loadH || 50;
	this.innerH = window.innerHeight;
	this.pageNum = o.pageNum || 1;
	this.pageTotal = o.pageTotal || 10;
	this.loadFn = o.loadFn;
	this.endFn = o.endFn;

	this.init();
};
LoadDataByScroll.prototype={
	init:function(){
		this.addScrollEv();
	},
	loadStart:function(){
		var pageNum = this.pageNum;
		var pageTotal = this.pageTotal;
		var loadFn = this.loadFn;
		var endFn = this.endFn;
		var self = this;
		var dis = 0;
		var _body = window.document.body;

		this.timer && clearTimeout(this.timer);
		this.timer = setTimeout(function(){
			dis = _body.scrollHeight - _body.scrollTop - self.innerH;
			console.log(dis);
			if(dis<=self.loadH){
				if(self.pageNum >= self.pageTotal){
					console.log('over');
				$(window).off('scroll');
					endFn && endFn();
				}else{
					self.pageNum++;
					console.log(self.pageNum);
					loadFn && loadFn(self.pageNum);
				}
			}
		}, 100);
	},
	addScrollEv:function(){
		$(window).on('scroll', this.loadStart.bind(this));
	}
}

var GLOBAL={
	token:getUrlParam('token')
};

var pageLength = 20;
var pageTotal =1;
var pageNum = 1;

var p_SalesIncomeDetail={
	init:function(){
		this.initList();  //初始化列表
		this.getCashEv(); //提现 [暂无]
		this.getIncomeInfo();
	},
	getIncomeInfo:function(){
		$.post('getSalesWallet.json', {token:GLOBAL.token}, function(data){
			if(data.status === '0'){
				var info = data.result.salesWallet;
				if(info){
					$('#incomeTotal').text(info.incomeTotal.toFixed(2));
				}
			}
		});
	},
	initList:function(){
		var pms = {
			token:GLOBAL.token,
			index:0+'',
			length:pageLength+''
		}
		$.ajax({
			url:'getSalesWalletDetailList.json',
			data:pms,
			dataType:'json',
			type:'POST',
			success:function(data){
				if(data.status==='0'){
					if(data.result.count>0){
						var listData = data.result.salesWalletDetailList;
						// 使用模板渲染
						$('#incomeListBox').html(template('incomeListTpl',{data:listData}));

						var count = data.result.count;
						pageTotal = Math.ceil(count/pageLength);
						if(pageTotal>1){
							new LoadDataByScroll({
								pageTotal:pageTotal,
								loadFn:function(pageNum){
									pms.index = (pageNum-1)*pageLength;
									$.post('getSalesWalletDetailList.json',pms, function(data){
										if(data.status==='0'){
											if(data.result.count===0){
												return;
											}
											var listData2 = data.result.salesWalletDetailList;
											$('#incomeListBox').append(template('incomeListTpl',{data:listData2}));
										}
									})
								},
								endFn:function(){
									$('#incomeListBox').append('<li><div class="tc p20 c-8">没有更多了</div></li>');
								}
							})
						}
					}else{
						$('#loadingBox').html('暂无数据');
						console.log('收支记录为空');
					}
				}else{
					$('#loadingBox').html('服务器繁忙，请稍候重试！');
				}
			},
			error:function(){
				$('#loadingBox').html('服务器繁忙，请稍候重试！');
			}

		});
	},
	getCashEv:function(){

	}
};

p_SalesIncomeDetail.init();