var sharePhotoListVM, sharePhotoListConf,allowScroll=true,listType="zan",dataPage=0;
template.helper('getPhoto', function (data, format) {
	if(!data) return "";
    format = JSON.parse(data).url;
    return format;
});

sharePhotoListConf = {
	salesId: getUrlParam('salesId'),
	customerId: getUrlParam('customerId'),
	idName:'',
	dataUrl:'',
	currentIndex:0,
	totalDataNum:0
};

var p_sharePhotoList = {
	init:function(){
		this.getsharePhotoList();
		this.changeListType();
		this.initPullRefresh();
	},
	getsharePhotoList:function(){ //点赞列表
		if(allowScroll){
			allowScroll=false;
			var pms = {
				index:dataPage,
				length:'8',
			}, self = this;

			if(sharePhotoListConf.salesId){
				pms.salesId = sharePhotoListConf.salesId;
				if(listType=="zan"){
					sharePhotoListConf.dataUrl = 'getPraiseOtherSharePhotoList.json';
				}else{
					sharePhotoListConf.dataUrl = 'getSalesSharePhotoList.json';
				}
			}else if(sharePhotoListConf.customerId){
				pms.customerId = sharePhotoListConf.customerId;
				sharePhotoListConf.dataUrl = 'getCustomerPraiseSharePhotoList.json';
			}else{
				mobileAlert('地址参数错误');
				return false;
			}
		
			$.getJSON(sharePhotoListConf.dataUrl, pms, function(data){
				if(data.status==='0'){
					var d = data.result.sharePhotoVoList;
					sharePhotoListConf.totalDataNum = data.result.count;
					sharePhotoListConf.currentIndex += sharePhotoListConf.pageLength;
					var listStr = template('tempData', { list : d ,salesId:sessionStorage.salesId});
					$("#sharePhotoListCtr").append(listStr);

					if(sharePhotoListConf.customerId){
						$("#customerPraiseCount").html(data.result.count)
					}
					allowScroll=true;
				}
			});
		}
	},
	changeListType:function(){
		var _this = this;
		$(".ui-flex .cell").on("click",function(){
			if($(this).hasClass("ac")){
				return false
			};
			dataPage = 0;
			$("#sharePhotoListCtr").empty();
			$(this).addClass("ac").siblings().removeClass("ac");
			if($(this).index()==0){
				listType = "zan";
			}else{
				listType = "sp";
			}
			_this.getsharePhotoList();
		});
	},
	initPullRefresh:function(){
		var _this = this;
		scrollToLoadMore({
			length:8,
		    callback:function(){
		        _this.getsharePhotoList();
		    }
		});
	}
}

p_sharePhotoList.init();