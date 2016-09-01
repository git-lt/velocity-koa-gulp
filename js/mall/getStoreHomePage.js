/**
 * [模块： 店铺首页]
 */
define(['swiper', 'iscroll', 'qrcode'],function(a, iScroll){
	var page, 
		scrollMain, 
		scrollM1, 
		scrollM2, 
		scrollM3,
		PRO_LIST=[], 
		AJAX_LOCKED = false, 
		PRO_LIST_LINK, 
		PRO_LINK,
		PREVIEW = getUrlParam('templateId')!=='';

	// 函数防抖
	function debounce(fn, delay) {
	  var timer;
	  return function () {
	    var context = this;
	    var args = arguments;
	    clearTimeout(timer);
	    timer = setTimeout(function () {
	      fn.apply(context, args);
	    }, delay);
	  };
	}
	// 添加七牛裁切后缀
	function QNCropSuffix(url, width, height, type){
    if(!url || url.length<5 || url.indexOf('imageView2')>-1 || !width) return url;
    var qnSuffix = 'imageView2/'+(type?type:1)+'/w/'+width;
    if(height) qnSuffix += '/h/'+height;
    return url.indexOf('?')>-1?url+'&'+qnSuffix:url+'?'+qnSuffix;
  }
	// 显示品牌的中文名
	template.helper('getCNName', function (data) {
		return data.indexOf('/')>0 ? data.split('/')[1] : data;
	});

	PAGE_CONF=$.extend({},{
		apiGetStockListByPms:'getStockListForCustomer.json',
		apiGetStockListByProId:'getConfigStockList.json',
		apiGetCateorysUrl:'getCategoryFamilyListByStoreId.json',
		apiGetBrandsUrl:'getBrandListByStoreId.json',
		linkGetStockList:'getStockListForCustomer.htm',
		apiGetStockListByProIdUrl:'getConfigStockList.json?storeId='+getUrlParam('storeId'),
		suid: getUrlParam('supplierId') || $('#suid').val(),
		storeId: getUrlParam('storeId'),
		salesId: getUrlParam('salesId') || $('[name="salesId"]').val(),
	}, PAGE_CONF);

	/**
	 * [DEF_CONF 默认配置]
	 * m1000 搜索
	 * m1011 店招
	 * m1012 店铺信息
	 * m1004 商品推荐 自动
	 */
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
		'm1006':{
			hasMiaosha:true,
			hasHongbao:true,
			hasNewhot:true,
			hasCoupon:true,
			appointment:false,
			hasClass:false,
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
				showListTypeInfo:[],   //选择 按类目或按品牌 的选择信息
				orderTypeNum:0
			},
			productInfoAuto:[],
			orderNum:2
		}
	};

	var DEFAULT_STORE = {
		logo:'https://qncdn.qiakr.com/qk_v3/iconfont-stroe.png',
		name:'一号店',
		picture:'https://qncdn.qiakr.com/qk_v3/home_banner.jpg',
		id:''
	};

	PRO_LIST_LINK = 'getStockListForCustomer.htm?storeId='+PAGE_CONF.storeId+'&orderName=off_time&orderType=desc&index=0&length=20&salesId='+PAGE_CONF.salesId;
	PRO_LINK = 'getStockInfoForCustomer.htm';


	if(!PAGE_CONF.storeInfo){
		PAGE_CONF.storeInfo = $.extend({},DEFAULT_STORE);
	}

	(function($, window){
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
				linkInfo:{url:'', id:''},
				editTplId:'e_onecolumn',
				modTplId:'m_onecolumn'
			},
			'm1003':{
				leftImg:{
				imgUrl:'https://qncdn.qiakr.com/qk_v3/left.png',
				linkType:'',
				linkInfo:{url:'', id:''},
				},
				rightImg:{
					imgUrl:'https://qncdn.qiakr.com/qk_v3/right.png',
					linkType:'',
					linkInfo:{url:'', id:''},
				},
				editTplId:'e_twocolumn',
				modTplId:'m_twocolumn'
			},
			'm1004':{
				hasTitle:true,
				autoRecommend:true,
				autoPms:{
					keywords:'',
					limitNum:10,
					showListByBrand:false,
					showListType:'category',
					showListTypeId:'', 
					showListTypeInfo:[],
					orderTypeNum:0
				},
				productInfoAuto:[{
					titleInfo:{id:0, name:''},
					proInfo:[]
				}],
				productInfo:{
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
		
		var storeCache={};

		function RenderShopConfig(opt, el){
			this.$el = $(el);
			this.$footer = this.$el.find('.mod_footer');
			this.$loading = this.$el.find('.list-loading-box');
			this.config = opt.config;
			this.storeInfo = opt.storeInfo;
			if(this.config===''){ throw new Error('config is empty!'); }
			this.init();
		}

		RenderShopConfig.prototype = {
			constructor:RenderShopConfig,
			init:function(){
				var conf = this.config, self = this, storeId = this.storeId;
				if( typeof conf.version === 'undefined' || typeof conf['m1000'] == 'undefined'){
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
		    	if(!shopConf['m1000'].show) $('#viewportWrap').css('top','0px');

	    		// 模块排序
				arrConf = arrConf.sort(function(a,b){ return a.orderNum-b.orderNum; });

				var strArr=[];
				while(arrConf.length){
					oMod = arrConf.shift();
					var modId = oMod['mid'] && oMod['mid'].split('-')[0];

					switch(modId){
						case 'm1000': case 'm1011': case 'm1012':
							if(oMod.show){
								if(modId=='m1000'){
									 $('#searchWrap').html(template(MODULES[modId].modTplId, oMod));
									 continue;
								}
								oMod.store = self.storeInfo?self.storeInfo:DEFAULT_STORE;
								oMod.store.picture = !oMod.store.picture?DEFAULT_STORE.picture : oMod.store.picture;
								oMod.store.picture = QNCropSuffix(oMod.store.picture, 640, 240);
								oMod.store.logo = QNCropSuffix(oMod.store.logo, 88, 88);
								break;
							}else{
								continue;
							}
						case 'm1001': //轮播
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
						case 'm1004': //商品
							// 如果是自动推荐，并且是 品类或品牌
							if(oMod.autoRecommend && (oMod.autoPms.showListType=='category' || oMod.autoPms.showListType=='brand')){
								PRO_LIST.push(oMod);
							}else{
								(function(data){ setTimeout(function(){self._creatProList.call(self, data);}, 500); })(oMod);
							}
							break;
						case 'm1007': //品牌
							oMod.brands.sort(function(a, b){ return a.orderNum-b.orderNum});
							break;
						case 'm1009': //品类
							oMod.categorys.sort(function(a, b){ return a.orderNum-b.orderNum});
							oMod.link = PRO_LIST_LINK;
							break;
						case 'm1010': //类别
							oMod.groups.sort(function(a, b){ return a.orderNum-b.orderNum});
							oMod.link = PRO_LIST_LINK;
							break;
					}

					strArr.push(template(MODULES[modId].modTplId, oMod));
				}

				this.$loading.before(strArr.join(''));

				function getAjaxUrl(pms, id, type){
					var p={
						orderName:ORDER_DIC[pms.orderTypeNum].name,
						orderType:ORDER_DIC[pms.orderTypeNum].type,
						length:pms.limitNum,
						index:0,
						fuzzyName:pms.keywords,
						supplyTypeList:1,
						storeId:PAGE_CONF.storeId
					};
					type == 'brand' ? (p.brandId=id):(p.categoryFamilyIds=id);

					return PAGE_CONF.apiGetStockListByPms +'?'+qkUtil.obj2UrlPms(p);
				}

				var listQueue = [];
				PRO_LIST.forEach(function(v1){
					v1.autoPms.showListTypeInfo.forEach(function(v){
						listQueue.push({mid:v1.mid, hasTitle:v1.hasTitle, id:v.id, type:v1.autoPms.showListType, name:v.name, url:getAjaxUrl(v1.autoPms, v.id, v1.autoPms.showListType)});
					});
				});

				function loadProList(){
					var reqD = listQueue.shift();
					if(reqD){
						$('#listLoading').show();
						$.post(reqD.url)
						.done(function(data){
							if(data.status==='0'){
								var productInfoAuto = [];
								var stockList = data.result.stockList, price=0;
								if(stockList.length){
									if(!reqD.id) reqD.id = 'r'+Math.random().toString(16).substring(5);
									productInfoAuto['F'+reqD.id]={
										titleInfo: {id:reqD.id, name:reqD.name, hasTitle:reqD.hasTitle},
										proInfo: []
									};

									for(var y in stockList){
										productInfoAuto['F'+reqD.id].proInfo.push({
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
						    	var moreLink = reqD.type!='brand'?'&categoryName='+reqD.name+'&categoryFamilyIds='+reqD.id:'&brandId='+reqD.id;

						    	self.$el.find('.m_recommend_bd'+reqD.mid).append(template('proListTpl',{data:arrPro, link:PRO_LINK, moreLink:PRO_LIST_LINK+moreLink}));
						    	$('#listLoading').hide();
						    	debounce(function(){
						    		scrollMain && scrollMain.refresh();
						    		PREVIEW && $('a').attr('href', 'javascript:;');
						    	}, 200)();
						    }else{
						    	loadProList();
						    }
							}
							AJAX_LOCKED=false;
						});
					}else{
						AJAX_LOCKED=true;
						PREVIEW && (PRO_LIST_LINK='javascript:;');
						$('#listLoading').html('<a href="'+PRO_LIST_LINK+'" style="display:block;">查看所有商品</a>').show();
						debounce(function(){scrollMain && scrollMain.refresh();}, 200)();
					}
				}

				// 判断页面是否有滚动条【没有】则加载一个列表 判断是否有，没有则再加载【有】通过触发，加载下一个列表
				debounce(function(){
					// 初始化页面滚动
					scrollMain = new iScroll('#viewportWrap',{click:true});
					scrollMain.on('scrollEnd', function(){
						if(this.y <= (this.maxScrollY + 300)){
							if(!AJAX_LOCKED){
								AJAX_LOCKED = true;
								loadProList();
							}
						}
					})
					if(Math.abs(scrollMain.maxScrollY-50) < scrollMain.wrapperHeight){
						loadProList();
					}

					// 隐藏Loading 显示界面
					$('#pageLoadingBox').remove();
					$('#viewportWrap').css('visibility','visible');

					if(!PREVIEW){
						// 初始化边栏和关注
						page.showSiderbarEv();
						page.attentionEv();
						// 商品分享storeId修正
						$('a[href*="shareStockInfoForCustomer.htm"]').each(function(){
							var href = $(this).attr("href");
							$(this).attr("href",href+"&storeId="+PAGE_CONF.storeId);
						});
						$('a[href*="discountPromotionDetail.htm"]').each(function(){
							var href = $(this).attr("href");
							$(this).attr("href",href.replace(/storeId=0/g,"storeId="+PAGE_CONF.storeId));
						});
					}else{
						$('a').attr('href','javascript:;')
					}
				},300)();
			},
			_creatProList:function(proConfData){
				 var self = this;
				if(proConfData.autoRecommend){ //自动推荐 异步请求数据
					var pms = {
						storeId: PAGE_CONF.storeId,
						status: 0,
						index: 0,
						length: proConfData.autoPms.limitNum+'',
						fuzzyName: proConfData.autoPms.keywords,
						orderName: ORDER_DIC[proConfData.autoPms.orderTypeNum].name,
						orderType: ORDER_DIC[proConfData.autoPms.orderTypeNum].type,
						supplyTypeList: '1_3'
					};

					var typesData = JSON.parse(JSON.stringify(proConfData.autoPms.showListTypeInfo)),
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
							return $.post(PAGE_CONF.apiGetStockListByPms, pms);
						};

						// 循环获取所有商品信息并缓存
						typesData= typesData.slice(0,3);
						function prosessData(){
							var curr = typesData.shift();
							if(typeof curr !== 'undefined'){
								getProsDataByType(curr.id)
								.done(function(data, a, b){
									productInfoAuto = [];
									if(data.status === '0'){
										var stockList = data.result.stockList;
										if(!curr.id) curr.id = 'r'+Math.random().toString(16).substring(5);
										productInfoAuto['F'+curr.id]={
											titleInfo: {id:curr.id, name:curr.name, hasTtile:proConfData.hasTitle},
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

							    	var linkSrc='';
						    		switch(proConfData.autoPms.showListType){
					        		case 'category': 
						        		linkSrc = PRO_LIST_LINK+'&categoryName='+curr.name+'&categoryFamilyIds='+curr.id;
						        		break;
					        		case 'brand': 
					        			linkSrc = PRO_LIST_LINK+'&brandId='+curr.id;
					        			break;
					        		case 'new':
					        		case 'offer':
						        		linkSrc = PRO_LIST_LINK+'&tags='+curr.name; 
						        		break;
					        	}
							    	self.$el.find('.m_recommend_bd'+proConfData.mid).append(template('proListTpl',{data:arrPro, moreLink:linkSrc, link:PRO_LINK, isAuto:true}));
							    	debounce(function(){
							    		scrollMain && scrollMain.refresh();
							    		PREVIEW && $('a').attr('href', 'javascript:;');
							    	}, 300)();
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
					// 获取所有手动推荐的商品id，重新查询出当前上架的商品列表，并展示
					proConfData.productInfo.titleInfo.hasTitle = proConfData.hasTitle;

					var pData = proConfData.productInfo, pIds = [];
					var pDataOrder = pData.proInfo.sort(function(a, b){return a.ordernum-b.ordernum});

					for(var i in pData.proInfo){
						pIds.push(pData.proInfo[i].proid);
					}

					pIds = pIds.join('_');

					$.post(PAGE_CONF.apiGetStockListByProIdUrl, {productIdList: pIds}, function(data){
						if(data.status==='0'){
							var cusProList = data.result.stockList;

							// 商品排序
							var CPLO = [];
							pDataOrder.forEach(function(o){
								cusProList.forEach(function(v){
									if(v.product.id==o.proid)
										CPLO.push(v);
								});
							});
							
							if(CPLO.length>0){
								var proDataInfo = CPLO.map(function(v){
									return {
										proid: v.stock.productId, 
										proname: v.stock.productName, 
										proimg: v.stock.productPicUrl, 
										proprice: v.minSkuPrice, 
										tagprice: v.stock.tagPrice,
										stockid: v.stock.id,
										tags: v.productSupplier.tags||''
									};
								});
								pData.proInfo = proDataInfo;
								self.$el.find('.m_recommend_bd'+proConfData.mid).html(template('proListTpl',{data:[pData], link:PRO_LINK, moreLink:PRO_LIST_LINK}));
								debounce(function(){
									scrollMain && scrollMain.refresh();
									PREVIEW && $('a').attr('href', 'javascript:;');
								}, 300)();
							}
						}
					});
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
		};
		$.fn.renderShopConfig.DEFAULTS={
			storeInfo:''
		};
	})(Zepto, window);

	page = {
		init:function(){
			this.renderConfig();
			if(!PREVIEW){
				this.initSidebarMenu();
				this.chkSidebarMenuEv();
				this.recordHistory();
				this.searchEv();			
				if(getUrlParam("salesId")){
				    sessionStorage.salesId = getUrlParam("salesId")||getUrlParam("owner");
				}
			}
			
			// FAST_CLICK && $.bindFastClick();
		},
		recordHistory:function(){
			// 记录用户最近访问的门店列表
	    var totalHistory=localStorage.storeHistory3 ? JSON.parse(localStorage.storeHistory3) : {},
			storeHistory=totalHistory[PAGE_CONF.suid]||[];
		storeHistory = $.grep(storeHistory,function(e,i){
        	return e != PAGE_CONF.storeId;
      	});
      storeHistory.unshift(PAGE_CONF.storeId);
      totalHistory[PAGE_CONF.suid] = storeHistory;
      localStorage.storeHistory3 = JSON.stringify(totalHistory);
		},
		getVipInfo:function(){
			if(getUrlParam("pass")=="newCustomer"){
				$.post('getCustomerCard.json',{supplierId:PAGE_CONF.suid},function(data){
				    if(data.status==='0'){
				        if(!data.result.customerCard || !data.result.customerCard.cardNo) {
				            require(["../js/mall/regVip.js"],function(Vip){
				                Vip.regVip({
				                    external: data.result.external,
				                    suid:PAGE_CONF.suid
				                });
				            });
				        }
				    }
				});
			}
		},
		renderConfig:function(){
			PAGE_CONF.categorys && PAGE_CONF.categorys.forEach(function(v){
					DEF_CONF['m1004'].autoPms.showListTypeInfo.push({id:v.categoryFamily.id, name:v.categoryFamily.familyName});
			});

			var sConf;
			if(PAGE_CONF.config && PAGE_CONF.config.templateConfig){
				sConf = JSON.parse(PAGE_CONF.config.templateConfig);
			}else{
				sConf = DEF_CONF;
			}

			PAGE_CONF.storeInfo.salesName = $('#salesName').val();
			$('#shopview').renderShopConfig({
				storeInfo:PAGE_CONF.storeInfo,
				config: sConf,
			});
		},
		initSidebarMenu:function(){
			var pms = {storeId:PAGE_CONF.storeId},
				link = 'getStockListForCustomer.htm?storeId='+PAGE_CONF.storeId+'&orderName=off_time&orderType=desc&index=0&length=20&salesId='+PAGE_CONF.salesId;
			var menusList=[], ajaxNum = 0, hasBrands=false;

			var pms1 = {
				storeId: PAGE_CONF.storeId,
				orderName: 'off_time',
				orderType: 'desc',
				index: '0',
				length: '20',
				salesId: PAGE_CONF.salesId,
			};

			// 默认三个菜单
			var menuData = [
				{text:'全部商品',link:PRO_LIST_LINK},
				{text:'新品上市',link:PRO_LIST_LINK+'&tags=新品'},
				{text:'特价促销',link:PRO_LIST_LINK+'&tags=特价'},
			];

			var menu1 = [],menu2 = [],menu3 =[];
			menu1 = menuData.concat(menu1);

			// 品牌
			menu1.push({text:'品牌', id:'PP', type:'brand'});
			menu2.push(PAGE_CONF.brands.map(function(v){
				return {text:v.brandName, link:PRO_LIST_LINK+'&brandId='+v.id, rootid:'PP', type:'brand'};
			}) || []);
			console.log(PAGE_CONF);
			if(PAGE_CONF.supplier.displayType === 1 && PAGE_CONF.groups && PAGE_CONF.groups.length){
				// 分类
				PAGE_CONF.groups.forEach(function(gv){
					gv.firstLevel && gv.firstLevel.length && gv.firstLevel.forEach(function(v){
						menu1.push({text:v.groupName, link:PRO_LIST_LINK+'&groupId='+v.groupId, id:v.groupId, type:'group'});
					});

					if(gv.secondLevel && gv.secondLevel.length && gv.secondLevel.length){

						gv.secondLevel.unshift({groupName: "全部", link:PRO_LIST_LINK, rootId: gv.secondLevel[0].rootId,groupId: gv.secondLevel[0].rootId, type:"group"});

						menu2.push(gv.secondLevel.map(function(v){
							return {text:v.groupName, link:PRO_LIST_LINK+'&groupId='+v.groupId, rootid:v.rootId, id:v.groupId, type:"group"};
						}));
					}
					if(gv.thirdLevel && gv.thirdLevel.length && gv.thirdLevel.length){

						gv.thirdLevel.unshift({groupName: "全部", link:PRO_LIST_LINK, rootId: gv.thirdLevel[0].rootId,groupId: gv.thirdLevel[0].rootId, type:"group"});

						menu3.push(gv.thirdLevel.map(function(v){
							return {text:v.groupName, link:PRO_LIST_LINK+'&groupId='+v.groupId, rootid:v.rootId, id:v.groupId, type:'group'};
						}));
					}
				});
			}else{
				// 类目
				PAGE_CONF.categorys.forEach(function(v){
					menu1.push({text:v.categoryFamily.familyName, id:v.categoryFamily.id, link:'', type:'category'});

					v.categoryVoList.unshift({category:{id: v.categoryFamily.id,type: "familyCategory", name: "全部", rootid:v.categoryFamily.id }});
					menu2.push(v.categoryVoList.map(function(item){ 
						return {text:item.category.name, type:'category', rootid:item.category.familyId, link:PRO_LIST_LINK+'&' + (item.category.type == "familyCategory" ? "categoryFamilyIds" : "categoryIds") + '='+item.category.id};
					}));
				});
			}

			$('#menu1Box').html(template('sidebarMenuTpl', {data:menu1, isMenu1:true}));

			menu2.length && $('#m2ScrollView').html(template('sidebarMenuTpl', {data:menu2, isMenu1:false}));
			menu3.length ? $('#m3ScrollView').html(template('sidebarMenuTpl', {data:menu3, isMenu1:false})):$('#menu3Box').remove();
		},
		showSiderbarEv:function(){
			$('#categoryMenu').on('click', function() {
			    $.msg.actions({
		        content: $('#sidebarMenusBox'),
		        position: 'left',
		        clsIn: 'slideInLeft',
		        clsOut: 'slideOutLeft',
		        width: '100%',
		        bodyStyle: 'position: absolute; z-index: 500; top: 0;right: 0;bottom: 0;left: 0; background-color:#fff; padding:0; overflow:hidden;',
		        onOpened: function(oThis) {
	            scrollM1 = new iScroll('#menu1Box',{click:true, snap:'li'});
							$('#menu2Box .sidebar-ul').length && (scrollM2 = new iScroll('#menu2Box',{click:true, snap:'li'}));
							$('#menu3Box .sidebar-ul').length && (scrollM3 = new iScroll('#menu3Box',{click:true, snap:'li'}));

							$('#btnSidebarClose').off().on('click', function(){ $.msg.actions(); });

							$('#menu1Box .sidebar-li').removeClass('active').eq(3).addClass('active');
							var $firstM2 = $('#menu2Box .sidebar-ul').hide().eq(0).show();

							debounce(function(){scrollM2 && scrollM2.refresh();}, 200)();
		        },
		        hasCloseBtn: false,
		        cacheIns: true
			    });
			});
			$('.hasClass').on('click', function(){ 
				$('#categoryMenu').trigger('click'); 
			})
		},
		attentionEv:function(){ // 关注
			$('#attention').on('click',function(){
				$.msg.alert({
					title:'添加关注',
					content:$('#qrCodeWrap').html(),
					closeByMask:true,
					hasCloseBtn: true,
					clsIn:'fadeInDown',
					clsOut:'fadeOutUp'
				});
			})
		},
		chkSidebarMenuEv:function(){
			var centerYOffset = Math.floor(((window.document.documentElement.clientHeight-40)/44-1)/2)*44;
			var m2Timmer = null;

			$('#menu1Box').on('click', '.sidebar-li', function(e){
				var $el = $(this), i = $el.index();
				var mid = $el.data('id'), type = mid.split('_')[0];

				// 判断是否有二级
				var $m2items = $('#menu2Box').find('[data-id="'+mid+'"]');
				if(!$m2items.length){
					return true;
				}else{
					e.preventDefault();
				}

				// 调整宽度
				if(type == 'group'){
					$('#menu2Box').css('width','1.0666rem');
				}else{
					$('#menu2Box').css('width','2.1333rem');
				}

				var allCount = $('#menu1Box .sidebar-li').length;
				var scrollY = scrollM1.y;
				var offsetA = i*44;
				var offsetB = Math.abs(scrollY)+centerYOffset;

				$('#menu1Box .sidebar-li').removeClass('active');
				$el.addClass('active');
				$('#menu2Box .sidebar-ul').hide();

				$m2items.parent().show();

				if(allCount - (i+1)<=6){
					scrollM1.scrollToElement($('#menu1Box .sidebar-li').last()[0],500);
				}else if(i+1<=6){
					scrollM1.scrollTo(0, 0, 500);
				}else{
					scrollM1.scrollTo(0, (offsetB-offsetA+scrollY), 500);
				}

				debounce(function(){scrollM2 && scrollM2.refresh()}, 200)();
			})


			$('#menu2Box').on('click', '.sidebar-li', function(e){
				var $el = $(this), i = $el.index();
				var $m3lis = $('#menu3Box').find('[data-id="group_'+$el.data('cid')+'"]');
				if(!$m3lis.length){
					return true;
				}else{
					e.preventDefault();
				}

				$('#menu2Box .sidebar-li').removeClass('active');
				$el.addClass('active');
				$('#menu3Box .sidebar-li').hide();
				$m3lis.show();

				debounce(function(){scrollM3 && scrollM3.refresh()}, 200)();
			})
		},
		searchEv:function(){
			$('body').on('click', '.search_input', function(){ 
				var $searchBox = $(".searchBox.stock");
				$searchBox.show();
				$searchBox.find("input[type=search]").focus();
				$searchBox.find(".s-cancel").on('click', function(){
					$searchBox.hide();
				});
			});
		}
	};

	return {
		init:function(){
			page.init();
			// document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		}
	}
});