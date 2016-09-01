// 导购评价列表
function unique(arr) {
	    var result = [], hash = {};
	    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
	        if (!hash[elem]) {
	            result.push(elem);
	            hash[elem] = true;
	        }
	    }
	    return result;
	}
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

var GLOBAL = {
	token:getUrlParam('token')
};

template.helper('fomartTag', function (data, format) {
	var t = [];
	if(data && data.length){
		data = unique(JSON.parse(data));
		t = data.map(function(v,i){
	    	return '<span class="tag">'+v+'</span>';
	    })
	    return t.join('');
	}else{
		return '';
	}
});

var pageLength = 20;
var pageTotal =1;
var pageNum = 1;

var p_salesEvluateList ={
	init:function(){
		this.initList();
	},
	initList:function(){
		var self = this;
		var pms = {
			token:GLOBAL.token,
			index:0+'',
			length:pageLength+''
		};
		$.post('getSalesAppraiseList.json',pms, function(data){
			if(data.status==='0'){
				if(data.result.count===0){
					$('#loadingBox').html('暂无数据');
					return;
				}
				var salesAppraiseVoList = data.result.salesAppraiseVoList;

				$('#salesAppraiseVoListBox').html(template('salesAppraiseVoListTpl',{data:salesAppraiseVoList}));

				setTimeout(function(){self.renderTags();}, 300);

				var count = data.result.count;
				pageTotal = Math.ceil(count/pageLength);
				if(pageTotal>1){
					new LoadDataByScroll({
						pageTotal:pageTotal,
						loadFn:function(pageNum){
							pms.index = (pageNum-1)*pageLength;
							$.post('getSalesAppraiseList.json',pms, function(data){
								if(data.status==='0'){
									if(data.result.count===0){
										return;
									}
									var salesAppraiseVoList2 = data.result.salesAppraiseVoList;
									$('#salesAppraiseVoListBox').append(template('salesAppraiseVoListTpl',{data:salesAppraiseVoList2}));
									setTimeout(function(){self.renderTags();}, 200);
								}
							})
						},
						endFn:function(){
							$('#salesAppraiseVoListBox').append('<li><div class="tc p20 c-8">没有更多了</div></li>');
						}
					})
				}
			}else{
				mobileAlert("系统繁忙，请稍后再试")
			}
		});
	},
	renderTags:function(){
		$('.notchked').removeClass('.notchked').each(function(){
			var _this = $(this);
			_this.find('.iconfont').slice(0,_this.data('num')).addClass('c-rd');
		});
	}
}
p_salesEvluateList.init();