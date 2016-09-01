document.title="专题页面";
$.createSecondMenu("promotion_manage","商品专题");

Util.createHelpTip("商品专题相关问题",[
	{"title":"商品专题场景说明","link":"https://qiakr.kf5.com/posts/view/39417/"},
	{"title":"商品专题活动设置","link":"https://qiakr.kf5.com/posts/view/39777/"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);
// 设置获取上架商品的链接
MOD_SelectProsDia.o.getProListUrl = 'queryAllocatedSupplierStock.json';
var chkProDia = MOD_SelectProsDia.init({
    seckillStock:true
});

avalon.filters.toWrap =function (data, format) {
  if(!data) return "无";
  return data.replace(/\n|\r\n/g,"<br>"); 
}

var promVM = avalon.define({
	$id:'promInfoView',
    name: '',
    topImage:'https://qncdn.qiakr.com/placeholderImg.gif',
    description:'',
    title:'',
    theme:'',
    stockJsonArray:[{stockId:0, name:'商品标题[示例]', stockDescription:'商品描述信息文字[示例]', picUrl:'https://qncdn.qiakr.com/placeholderImg.gif', skuPrice:'9.00', tagPrice:'12.30',stockType:1}],
    chkTheme:function(){
    	var tImg = '',
    		themeTxt = $(this).data('theme'),
    		defaultImgs = ['s_theme_red','s_theme_pink','s_theme_green','s_theme_brown','s_theme_turquoise','placeholderImg'];
    	promVM.theme = themeTxt;

    	// 检查用户是否已经上传过banner，如果没有，则显示模板中的banner
    	var m=0;
    	for(var i in defaultImgs){
    		if(promVM.$model.topImage.indexOf(defaultImgs[i])>0){
    			m++;
    		}
    	}
    	if(m===0) return false;

    	switch(themeTxt){
    		case 's_theme_red': tImg = 'https://qncdn.qiakr.com/s_theme_red.jpg'; break;
    		case 's_theme_pink': tImg = 'https://qncdn.qiakr.com/s_theme_pink.jpg'; break;
    		case 's_theme_green': tImg = 'https://qncdn.qiakr.com/s_theme_green.jpg'; break;
    		case 's_theme_grey': tImg = 'https://qncdn.qiakr.com/s_theme_brown.jpg'; break;
    		case 's_theme_turquoise': tImg = 'https://qncdn.qiakr.com/s_theme_turquoise.jpg'; break;
    		default: tImg = 'https://qncdn.qiakr.com/placeholderImg.gif'; break;
    	}
    	promVM.topImage = tImg;
    }
});


var p_createSpProm = {
	o:{
		promProList:[],
		isPromEdite:false
	},
	init:function(){
		this.switchPromTab(); /*tab 切换事件*/
		this.initUploadImg(); /*上传组件初始化*/

		this.initPromInfo(); /*加载初始信息[编辑]*/

		this.nextEv(); /*下一步*/
		this.addProEv(); /*添加商品*/
		this.delProEv(); /*删除商品*/
		this.tplPreviewEv();

		this.setMaxlength();
		this.setListMaxLen();

		this.savePromInfoEv(); /*保存*/
	},
	switchPromTab:function(){
		$('#promSettingBox .filterTitle').on('click','a',function(){
			var $this = $(this),i=$this.index();
			$this.addClass('current').siblings().removeClass('current');
			$('#promTabConBox').children().removeClass('active').eq(i).addClass('active');
		});
	},
	initUploadImg:function(){
		$("#previewUpload").singleImgUploader({
		    resultInput : $("#productPicUrl"),
		    width:640,
		    height:340
		});
	},
	setMaxlength:function(){
		$('[data-maxlength="limited"]').maxlength({
		    'feedback' : '.charsLeft' 
		});
	},
	setListMaxLen:function(){
		setTimeout(function(){
			$('.pv-setting-two [data-maxlength="limited"]').maxlength({'feedback' : '.charsLeft'});
		},500);
		
	},
	initPromInfo:function(){/*打开时加载5个上架的商品*/
		// 获取基本信息和商品信息，并更新ViewModel
		var promId = Util.getUrlParam('id');
		if(promId){// 如果有promId， 则表示为编辑专题信息
			this.o.isPromEdite = true;
			$.getJSON('getSpecialPromotionDetail.json',{specialPromotionId:promId,index:0,length:50},function(data){
				if(data.status === '0'){
					var res = data.result,
					    promBase=res.specialPromotion,
					    promStockList=res.specialPromotionStockVoList;

					    // Object
					    // flashsaleVo: Object
					    // flashSalePayedCount: null
					    // flashsaleSkuList: Array[2]
					    // flashsaleStock: Object
					    // brandId: 2584
					    // categoryId: 9
					    // count: 0
					    // deliveryWay: 1
					    // description: ""
					    // endTime: 1451577599000
					    // flashsalePromotionId: 1
					    // gmtCreate: 1450679391000
					    // gmtUpdate: 1450679391000
					    // id: 1110
					    // marketPrice: 0.01
					    // normalMarketPrice: 0.01
					    // norms1Id: 1
					    // norms2Id: null
					    // postFee: null
					    // previewJson: "https://qncdn.qiakr.com/FrOm8goRh5yhKH3A_IEodoSYHwW_"
					    // productCode: null
					    // productId: 44677
					    // productName: "新用户专享100元优惠券 只需80元"
					    // productPicUrl: "https://qncdn.qiakr.com/FrOm8goRh5yhKH3A_IEodoSYHwW_"
					    // startTime: 1450679378000
					    // status: 1
					    // stockId: 582739
					    // supplierId: 276
					    // tagPrice: 100
					    // totalCount: 2
					    // __proto__: Object
					    // flashsaleStoreList: Array[8]
					    // maxPrice: 0.01
					    // minPrice: 0.01
					    // product: Object
					    // productSupplier: Object
					    // waitingPayCount: 0
					    // __proto__: Object
					    // salesId: null
					    // stockDescription: ""
					    // stockType: 2
					    // stockVo: null
					    // storeStockVo: null

					promVM.name = promBase.name;
					promVM.topImage = promBase.topImage;
					promVM.description = promBase.description.replace(/<br>/g,'\r\n');
					promVM.title = promBase.title;
					promVM.theme = promBase.theme||'';
					promVM.stockJsonArray.removeAll();
					if(promStockList.length){
						for(var j in promStockList){
							if(promStockList[j].stockVo){
								promVM.stockJsonArray.push({
									stockId:promStockList[j].stockVo.stock.id, 
									name:promStockList[j].stockVo.stock.productName, 
									stockDescription:promStockList[j].stockDescription, 
									picUrl:promStockList[j].stockVo.stock.productPicUrl, 
									skuPrice:promStockList[j].stockVo.minSkuPrice.toFixed(2), 
									tagPrice:promStockList[j].stockVo.stock.tagPrice.toFixed(2),
									stockType:promStockList[j].stockType
								});
							}else if(promStockList[j].flashsaleVo){
								promVM.stockJsonArray.push({
									stockId:promStockList[j].flashsaleVo.flashsaleStock.id, 
									name:promStockList[j].flashsaleVo.flashsaleStock.productName, 
									stockDescription:promStockList[j].stockDescription, 
									picUrl:promStockList[j].flashsaleVo.flashsaleStock.productPicUrl, 
									skuPrice:promStockList[j].flashsaleVo.flashsaleStock.marketPrice.toFixed(2), 
									tagPrice:promStockList[j].flashsaleVo.maxPrice.toFixed(2),
									stockType:promStockList[j].stockType
								});
							}
							
						}
					}

				}else{
					Util.alert('获取数据失败，服务器错误！')
				}
			});
		}else{
			setTimeout(function(){$('#tplPreview').trigger('click');},500);
		}
	},
	savePromInfoEv:function(){/*保存专题设置信息*/
		var o = this.o;
		$('#savePromInfoBtn').on('click', function(){
			// 验证数据是否正确
			if(promVM.$model.stockJsonArray.length===0){
				Util.alert('活动商品数量不能为0！');
				return false;
			}
			var data = {
				name:$.trim(promVM.$model.name.replace(/script/ig,'')),
				topImage:promVM.$model.topImage,
				theme:promVM.$model.theme,
				description:$('[name="description"]').val().replace(/\n|\r\n/g,"<br>"),
				title:$.trim(promVM.$model.title.replace(/script/ig,'')),
				stockJsonArray:JSON.stringify(promVM.$model.stockJsonArray)
			};

			// 判断是否为 编辑
			if(o.isPromEdite){
				data.specialPromotionId = Util.getUrlParam('id');
				$.post('editSpecialPromotion.json',data, function(data){
					if(data.status === '0'){
						Util.alert('编辑成功！', function(){
							window.location.href="specialPromotion.htm";
						})
					}else{
						Util.alert('数据保存失败，服务器错误！');
					}
				});
			}else{
				$.post('createSpecialPromotion.json', data, function(data){
		            if(data.status === '0'){
		                Util.alert('活动创建成功！',function(){
							window.location.href="specialPromotion.htm";
						});
		            }else{
		                alert('系统繁忙，请稍后再试');
		            }
		        });
			}
		});
	},
	nextEv:function(){
		function checkBaseInfo(){
			// 校验信息
			if($.trim(promVM.$model.name) == ''){
				Util.alert('专题名称不能为空！');
				return false;
			}
			if(promVM.$model.topImage == '' || promVM.$model.topImage == 'https://qncdn.qiakr.com/placeholderImg.gif'){
				Util.alert('活动主图不能为空！');
				return false;
			}
			if($.trim(promVM.$model.description) == ''){
				Util.alert('专题描述不能为空！');
				return false;
			}
			if($.trim(promVM.$model.title) == ''){
				Util.alert('列表标题不能为空！');
				return false;
			}
			return true;
		};

		$('#promSettingNext').on('click', function(){
			if(checkBaseInfo()){
				$('#promSettingBox .filterTitle a').last().trigger('click');
				return false;
			}
		});

		$('#promSettingBox .filterTitle a:last').on('click', function(){
			return checkBaseInfo();
		});
	},
	_pushAble: function(stockId){
		for(var i in promVM.$model.stockJsonArray){
			 if(promVM.$model.stockJsonArray[i].stockId === stockId){
			 	return false;
			 }
		}
		return true;
	},
	addProEv:function(){
		var self = this, o = this.o;
		$('#selectPro').on('click',function(){
			var chkedProNum = $('.pv-setting-two .pv-addpro-item').length;
			if(chkedProNum==50){
				Util.alert('最多只能设置50件活动商品！');
				return false;
			}
			// 获取
			chkProDia.show(function(res){
				var m = 0;
				for(var k in res){
					if(res[k]) m++;
				}
				if((m+chkedProNum)>50){
					Util.alert('最多只能设置50件活动商品！');
					return false;
				}
				if(m===0) return true;
				promVM.stockJsonArray.removeAll(function(el){
					return (el.stockId == 0);
				});
				for(var i in res){
					if(self._pushAble(res[i]['stockId'])){
						promVM.stockJsonArray.push({
							stockId: res[i]['stockId'], 
							name: res[i]['name'],
							picUrl: res[i]['picUrl'],
							tagPrice: res[i]['tagPrice'].toFixed(2),
							skuPrice: res[i]['skuPrice'].toFixed(2), 
							stockType: res[i]['type'],
							stockDescription: ''
						});
					}
				}
				chkProDia.o.SPChkInfo=[];
				$('.sp-tbl-wrap :checkbox').prop('checked', false);
				$('#SPChkResBox').html('<p class="c-8 f12">请选择需要限制的商品。</p>');
				self.setListMaxLen();
			}, function(){
				chkProDia.o.SPChkInfo=[];
				$('.sp-tbl-wrap :checkbox').prop('checked', false);
				$('#SPChkResBox').html('<p class="c-8 f12">请选择需要限制的商品。</p>');
			});
		});
	},
	delProEv:function(){
		var self = this, o = this.o;
		$('#promTabConBox').on('click','.close', function(){
			var $this = $(this), 
				proId = $this.data('id'),
				cNum = $('.pv-setting-two .pv-addpro-item').length;

			$this.parents('.pv-addpro-item').hide(350,function(){
				o.promProList[proId]=null;
				o.promProList = Util.refreshStringArr(o.promProList);
				$this.remove();

				// 更新左侧的商品预览内容
				promVM.stockJsonArray.removeAll(function(el){
					return (el.stockId == proId);
				});
			});
		});
	},
    tplPreviewEv:function(){
    	var isFirstShow= true,tplDia; 
    		
        $('#tplPreview').on('click', function(){
			tplDia = dialog({
	    		title:'选择模板',
	    		padding:10,
	    		fixed:true,
	    		content:$('#tplPreviewBox')[0]
	    	}).width(930).height(520).showModal();

        	if(isFirstShow){
        		var swiperOpt = {
        			scrollContainer:true,
        			mousewheelControl : true,
        			mode:'vertical',
        			scrollbar: {
        				container :'.swiper-scrollbar',
        				hide: true,
        				draggable: false
        			}
        		};
        		var mySwiper1 = new Swiper('.swiper-container.s1',swiperOpt);
        		var mySwiper2 = new Swiper('.swiper-container.s2',swiperOpt);
        		var mySwiper3 = new Swiper('.swiper-container.s3',swiperOpt);
        		var mySwiper4 = new Swiper('.swiper-container.s4',swiperOpt);
        		var mySwiper5 = new Swiper('.swiper-container.s5',swiperOpt);
        		var mySwiper6 = new Swiper('.swiper-container.s6',swiperOpt);
        		isFirstShow = false;
        	}
        });

        $('#tplPreviewBox').on('click', '.chkTplBtn', function(){
        	var tImg = '',
        		themeTxt = $(this).data('theme'),
        		defaultImgs = ['s_theme_red','s_theme_pink','s_theme_green','s_theme_brown','s_theme_turquoise','placeholderImg'];
        	promVM.theme = themeTxt;

        	// 检查用户是否已经上传过banner，如果没有，则显示模板中的banner
        	var m=0;
        	for(var i in defaultImgs){
        		if(promVM.$model.topImage.indexOf(defaultImgs[i])>0){
        			m++;
        		}
        	}
        	if(m===0){
        		tplDia.close();
        		return false;
        	}

        	switch(themeTxt){
        		case 's_theme_red': tImg = 'https://qncdn.qiakr.com/s_theme_red.jpg'; break;
        		case 's_theme_pink': tImg = 'https://qncdn.qiakr.com/s_theme_pink.jpg'; break;
        		case 's_theme_green': tImg = 'https://qncdn.qiakr.com/s_theme_green.jpg'; break;
        		case 's_theme_grey': tImg = 'https://qncdn.qiakr.com/s_theme_brown.jpg'; break;
        		case 's_theme_turquoise': tImg = 'https://qncdn.qiakr.com/s_theme_turquoise.jpg'; break;
        		default: tImg = 'https://qncdn.qiakr.com/placeholderImg.gif'; break;
        	}
        	promVM.topImage = tImg;
        	tplDia.close();
        });

    }
};
p_createSpProm.init();


