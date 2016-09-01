// 注册引导页 必带参数 storeId salesId suid
var Utils = {
	getUrlParam: function(key){
		var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    return r ? decodeURIComponent(r[2]) : '';
	}
};

var isFromSales = Utils.getUrlParam('from')==='sales';
var page = {
	init:function(){
		this.initSwiper();
		this.initShow();
	},
	initSwiper:function(){
		var swiper = new Swiper('.swiper-container', {
		    pagination: '.swiper-pagination',
		    paginationClickable: true,
		    direction: 'vertical'
		});
	},
	initShow:function(){
		if(isFromSales){
			$('.show-sales').show();
			$('.show-wx').hide();
		}else{
			$('title').text('恭喜您注册成功');
			$('.show-sales').hide();
			$('.show-wx').show();
		}
	}
}

page.init();



