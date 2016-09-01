var p_gelAllCategory;

p_gelAllCategory={
	o:{
		getBrandsUrl:'getBrandListByStoreId.json', //?storeId=1108
		storeId: $('[name="storeId"]').val(),
		salesId: $('[name="salesId"]').val()
	},
	init:function(){
		this.initOther();
		this.navClickEv();
		this.ajaxGetBrands();
	},
	initOther:function(){
		$(function(){
			$('#gotoTalk').hide();
			$('.toShoppingCart').hide();	
		});
	},
	ajaxGetBrands:function(){
		var self = this, o = this.o;
		$.ajax({
			url: o.getBrandsUrl,
			data: {storeId:o.storeId},
			method:'POST',
			success:function(data){
				if(data.status==='0'){
					var tData = data.result.brandList, res=[];
					if(tData.length){
						res.push('<li class="ui-list-item"><a href="'+(getUrlParam("from")=="sales" ? ('../getStoreInfoOfSales.htm') : ('getStockListForCustomer.htm?storeId='+o.storeId+'&orderName=market_price&orderType=asc&index=0&length=20&salesId='+o.salesId))+'" class="ui-list-nav down active">品牌<i class="iconfont icon-angle-down">&#xe603</i><span class="more"></span></a><ul>');
						for(var i=0, len=tData.length; i<len; i++){
							res.push('<li class="ui-list-item"><a href="'+(getUrlParam("from")=="sales" ? ('../getStoreInfoOfSales.htm?brandId='+tData[i]['id']) :('getStockListForCustomer.htm?storeId='+o.storeId+'&orderName=market_price&orderType=asc&index=0&length=20&salesId='+o.salesId+'&brandId='+tData[i]['id']))+'" class="ui-list-nav" >'+tData[i]['brandName']+'</a></li>');
						}
						res.push('</ul></li>');
					}
					res.length && $('#navTJCX').after(res.join(''));
				}
			}
		});
	},
	navClickEv:function(){
		// 菜单折叠与展开
		var cBox = Zepto('#categoryListBox');
		cBox.on('click', '.ui-list-nav', function(e){
		    // 如果有子菜单，展开或折叠，如果没有，则跳转
		    var _this = Zepto(this), nextObj = _this.next();

		    if(nextObj.is('ul')){
		        nextObj.toggle();
		        _this.toggleClass('active');
		        return false;
		    }
		    return true;
		});
		cBox.on('click', '.more', function(e){
		    var _url = Zepto(this).parent().prop('href');
		    window.location.href = _url;
		});
	}
};

p_gelAllCategory.init();