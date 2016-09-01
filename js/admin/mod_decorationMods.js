define(['utils','swiper'],function(){
	var MODULES={
		'm1000':{
			show:true,
			orderNum:-10,
			modTplId:'m_search'
		},
		'm1001':{
			imgHeight:320,
			imgs:[],
			editTplId:'e_scroll',
			modTplId:'m_scroll'
		},
		'm1002':{
			imgUrl:'https://qncdn.qiakr.com/qk_v3/fullcolumn.png',
			linkType:'',
			linkInfo:{url:'', id:''}, //只有当linkType=0或10时，才存储url
			editTplId:'e_onecolumn',
			modTplId:'m_onecolumn'
		},
		'm1003':{
			leftImg:{
			imgUrl:'https://qncdn.qiakr.com/qk_v3/left.png',
			linkType:'',
			linkInfo:{url:'', id:''}, //只有当linkType=0或10时，才存储url
			},
			rightImg:{
				imgUrl:'https://qncdn.qiakr.com/qk_v3/right.png',
				linkType:'',
				linkInfo:{url:'', id:''}, //只有当linkType=0或10时，才存储url
			},
			editTplId:'e_twocolumn',
			modTplId:'m_twocolumn'
		},
		'm1004':{
			hasTitle:true,
			autoRecommend:true,//是否自动推荐
			autoPms:{ //自动: 查询参数
				keywords:'',
				limitNum:10,
				showListByBrand:false,  //是否按品牌展示列表
				showListType:'category', // category品类、brand品牌、new新品、offer特价
				showListTypeId:'', 
				showListTypeInfo:[],   //选择 按品类或按品牌 的选择信息
				orderTypeNum:0
			},
			productInfoAuto:[{ //自动推荐的商品信息（根据配置异步获取后生成，用于渲染数据）
				titleInfo:{id:0, name:''},
				proInfo:[]
			}],
			productInfo:{ //手动推荐的商品信息 (在配置时保存)
				titleInfo:{name:'店主精选'},
				proInfo:[]
			},
			editTplId:'e_recommend',
			modTplId:'m_recommend'
		},
		'm1005':{
			text:'',
			editTplId:'e_text',
			modTplId:'m_text'
		},
		'm1006':{
			hasMiaosha:true,
			hasHongbao:true,
			hasNewhot:true,
			appointment:false,
			hasCoupon:true,
			editTplId:'e_activityNav',
			modTplId:'m_activityNav'
		},
		'm1007':{
			brands:[],
			editTplId:'e_brandNav',
			modTplId:'m_brandNav'
		},
		'm1008':{
			htmlStr:'',
			editTplId:'e_custom',
			modTplId:'m_custom'
		},
		'm1009':{
			categorys:[],
			editTplId:'e_categoryNav',
			modTplId:'m_categoryNav',
		},
		'm1010':{
			groups:[],
			editTplId:'e_groupNav',
			modTplId:'m_groupNav',
		},
		'm1011':{
			img:'',
			url:'',
			show:true,
			modTplId:'m_banner',
			orderNum:-9,
		},
		'm1012':{
			logoImg:'',
			shopName:'',
			show:true,
			modTplId:'m_info',
			orderNum:-8,
		}
	};
	var ORDER_DIC = [
		{name:'gmt_create', type:'desc'},
		{name:'market_price', type:'desc'},
		{name:'market_price', type:'asc'},
		{name:'shopping_count', type:'desc'},
		{name:'shopping_count', type:'asc'}
	];
	var DEFAULT_STORE = {
		logo:'https://qncdn.qiakr.com/qk_v3/iconfont-stroe.png',
		name:'一号店',
		picture:'https://qncdn.qiakr.com/qk_v3/home_banner.jpg',
		id:''
	};
	var DEF_CONF={
		'm1000':{
			show:true,
			orderNum:-10,
		},
		'm1011':{
			show:true,
			orderNum:-9,
		},
		'm1012':{
			show:true,
			orderNum:-8,
		},
		'm1006':{ //活动导航
			hasMiaosha:true,
			hasHongbao:true,
			hasNewhot:true,
			hasCoupon:true,
			appointment:false,
			orderNum:1,
		},
		'm1004':{
			hasTitle:true,
			autoRecommend:true,//是否自动推荐
			autoPms:{ //自动: 查询参数
				keywords:'',
				limitNum:8,
				showListType:'category',
				showListByBrand:false, //是否按品牌展示列表
				showListTypeInfo:null,   //选择 按品类或按品牌 的选择信息
				orderTypeNum:0
			},
			productInfoAuto:[{ //自动推荐的商品信息（根据配置异步获取后生成，用于渲染数据）
				titleInfo:{id:0, name:''},
				proInfo:[] // {proid:'', proname:'', proimg:'', proprice:'', tagprice:'', stockid:'',tags:''}
			}],
			orderNum:2
		}
	}

	var storeCache={};

	function RenderShopConfig(opt, el){
		this.$el = $(el);
		this.$footer = this.$el.find('.mod_footer');
		this.config = this.$el.data('config');
		if(this.config==''){ this.config = DEF_CONF; }
		this.tplId = this.$el.data('tplid');
		this.storeInfo = opt.storeInfo;
		this.$el.uiLoading('lg');
		this.init();
		this.$el.uiLoading('lg');
	}

	RenderShopConfig.prototype = {
		constructor:RenderShopConfig,
		init:function(){
			var conf = this.config, self = this, storeId = this.storeId;
			if( typeof conf.version === 'undefined'){
				conf['m1000'] = $.extend(true,{},MODULES['m1000']);
				conf['m1011'] = $.extend(true,{},MODULES['m1011']);
				conf['m1012'] = $.extend(true,{},MODULES['m1012']);
			}

			this._render.call(self, conf);
		},
		_render:function(shopConf){
			var arrConf=[], self = this;
    	for(var i in shopConf){
    		if(i!='version'){
	    		shopConf[i].mid=i;
	    		arrConf.push(shopConf[i]);
    		}
    	}

    	// 模块排序
			var arrConf = arrConf.sort(function(a,b){ return a.orderNum-b.orderNum; });

			var strArr=[];

			while(arrConf.length){
				oMod = arrConf.shift();
				var modId = oMod['mid'].split('-')[0];

				switch(modId){
					case 'm1000': case 'm1011': case 'm1012':
						if(oMod.show){
							oMod.store = self.storeInfo?self.storeInfo:DEFAULT_STORE;
							oMod.store.picture = !oMod.store.picture?DEFAULT_STORE.picture : oMod.store.picture;
							oMod.store.picture = Utils.QNCropSuffix(oMod.store.picture, 320, 120);
							oMod.store.logo = Utils.QNCropSuffix(oMod.store.logo, 44, 44);
							break;
						}else{
							continue;
						}
					case 'm1001':// 轮播
						if(oMod.imgs.length>1){
							oMod.imgs.sort(function(a, b){ return a.orderNum-b.orderNum});
							(function(mid){
								setTimeout(function(){
									var $mBox = self.$el.find('.'+mid);
									if($mBox.find('.swiper-wrapper a').length>1){
										new Swiper($mBox.find('.swiper-container')[0], {
										   pagination: $mBox.find('.swiper-pagination'),
									       autoplayDisableOnInteraction:false,
									       autoplay: 3000
									    });
									}
								}, 200);
							})(oMod.mid);
						}
						break;
					case 'm1004'://商品
						(function(data){ setTimeout(function(){self._creatProList.call(self, data);}, 500); })(oMod)
						break;
					case 'm1007'://品牌
						oMod.brands.sort(function(a, b){ return a.orderNum-b.orderNum});
						break;
					case 'm1009'://品类
						oMod.categorys.sort(function(a, b){ return a.orderNum-b.orderNum});
						break;
					case 'm1010'://类别
						oMod.groups.sort(function(a, b){ return a.orderNum-b.orderNum});
						break;
				}

				strArr.push(template(MODULES[modId].modTplId, oMod));
			}

			this.$footer.before(strArr.join(''));
		},
		_creatProList:function(proConfData){
			 var self = this;
			if(proConfData.autoRecommend){ //自动推荐 异步请求数据
				var pms = {
					status: 0,
					index: 0,
					length: proConfData.autoPms.limitNum,
					fuzzyName: proConfData.autoPms.keywords,
					orderName: ORDER_DIC[proConfData.autoPms.orderTypeNum].name,
					orderType: ORDER_DIC[proConfData.autoPms.orderTypeNum].type,
					supplyTypeList: '1_3'
				};

				var typesData = JSON.parse(JSON.stringify(proConfData.autoPms.showListTypeInfo)) || $('#cacheCategoryData').data('categorys'),
					dtd=null,
					productInfoAuto=[];

				self.$el.find('.m_recommend_bd'+proConfData.mid).html('');

				function getProListByType(showListType){
					dtd = $.Deferred();
					if(!typesData.length){
						dtd.resolve();
						return dtd;
					}
					var getProsDataByType = function(id){
						switch(showListType){
							case 'category': pms.categoryFamilyIds = id; break;
							case 'brand': pms.brandId = id; break;
							case 'new':
							case 'offer':
								pms.tags = proConfData.autoPms.showListTypeInfo[0].name; break;
						}
						window['ajax-queryAllocatedSupplierStock']=false;
						return $.post('queryAllocatedSupplierStock.json', pms);
					}

					// 循环获取所有商品信息并缓存
					typesData= typesData.slice(0,3);
					function prosessData(){
						var curr = typesData.shift();
						if(typeof curr !== 'undefined'){
							getProsDataByType(curr.id)
							.done(function(data, a, b){
								productInfoAuto = [];
								if(data.status === '0'){
									var stockList = data.result.stockVoList, price=0;
									if(!curr.id) curr.id = 'r'+Math.random().toString(16).substring(5);
									productInfoAuto['F'+curr.id]={
										titleInfo: {id:curr.id, name:curr.name},
										proInfo: []
									};
									for(var y in stockList){
										productInfoAuto['F'+curr.id].proInfo.push({
											proid: stockList[y].stock.productId, 
											proname: stockList[y].stock.productName, 
											proimg: stockList[y].stock.productPicUrl, 
											proprice: stockList[y].minSkuPrice, 
											tagprice: stockList[y].stock.tagPrice,
											stockid: stockList[y].stock.id,
											tags: stockList[y].productSupplier.tags||''
										});
									}

									var arrPro=[];
							    	for(var i in productInfoAuto){
							    		arrPro.push(productInfoAuto[i]);
							    	}
							    	self.$el.find('.m_recommend_bd'+proConfData.mid).append(template('proListTpl',{data:arrPro}));
								}else{
									dtd.resolve();
								}
								prosessData();
							})
							.fail(function(){
								dtd.resolve();
							});
						}else{
							dtd.resolve(productInfoAuto);
						}
					}
					prosessData();
					return dtd;
				}
				// 将所有商品信息 渲染并显示
				getProListByType(proConfData.autoPms.showListType);
			}else{ //手动推荐
				proConfData.productInfo.proInfo  = proConfData.productInfo.proInfo.sort(function(a, b){ return a.ordernum - b.ordernum;});
				self.$el.find('.m_recommend_bd'+proConfData.mid).html(template('proListTpl',{data:[proConfData.productInfo]}));
			}
		}
	}

	$.fn.renderShopConfig = function(opt){
		return this.each(function(){
			var $this = $(this),
					data = $this.data('renderShopConfig'),
					options = $.extend({},$.fn.renderShopConfig.DEFAULTS, opt || {});
			if(!data) $this.data('renderShopConfig',(data=new RenderShopConfig(options, this)));
		});
	}

	$.fn.renderShopConfig.DEFAULTS={
		storeInfo:''
	}

});