/**
 * [装修模块]
 */
define(['kindeditor','utils','m_uploader','xss','charcount','swiper','jqueryui','zclip'],function(){
var STORE_INFO,
	suid = $('#g_supplierId').val(),
	isDragToReplace = false,  //是否是新建模块
	RES_CONF = {}, 	  //店铺配置
	DEF_CONF = {"m1012":{"mid":"m1012","orderNum":1},
				"m1013":{"mid":"m1013","orderNum":2},
				"m1002-6cfe":{"orderNum":0,"imgUrl":"https://qncdn.qiakr.com/Fr1r0TwJP8YzZwKbyHLAxRD8RHYC","linkType":"1","linkInfo":{"url":"/store.htm?suid=276"},"mid":"m1002-6cfe","meid":"me1002-6cfe"},
				"version":1
			},
	cusEditor = null, //当前富文本编辑器
	LINK_DIC = [];
	Reg_URL = /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/i;
	DEBUG = true;
$.fn.fileUploader.DEFAULTS.token = $('#token7').val();

// 前台页面需要加上suid的值
LINK_DIC=[
	'customer', 		//自定义链接
	'/store.htm?suid='+suid, //微商城首页
	'/mall/customer.htm?suid='+suid, 			//个人中心
	'/mall/mySalesList.htm?suid='+suid,  //我的导购
	'/mall/getOrderListOfCustomer.htm?suid='+suid, //我的订单
	'/mall/getShoppingCart.htm?suid='+suid, 		  //我的购物车
	'/mall/myCouponList.htm?suid='+suid, //我的优惠券
	'/mall/getCustomerFavoriteStockList.htm?suid='+suid, //我的收藏
	'/mall/activityOfSeckill.htm?suid='+suid, //天天闪购
	'/mall/qiangHongBao.htm?suid='+suid, 	 //抢红包
	'special' //商品专题
];

PAGE_CONF={
	apiGetSpecialPromotion:'getSpecialPromotionList.json?index=0&length=100',// 获取专题活动列表
	apiGetDiscountPromotion: 'getDiscountPromotionVoList.json?processing=3&index=0&length=100',// 获取满减满折活动列表
	apiGetStockList: 'queryAllocatedSupplierStock.json',// 获取商户下所有的商品列表
	brandData:[],
	categorysData:[],
	groupData:[],
	specialPromotionData:[],
	discountPromotionData:[],
};

// ============================
// 	模块的默认配置
// ============================
/* m1011：我的积分 | m1012：积分通知 | m1013：积分兑换商品列表 | m1001：轮播广告 | m1002：通栏广告 | m1003：两栏广告  | m1005：文本 | m1008：自定义区域*/
var MODULES={
	'm1012':{
		orderNum:-8,
		modTplId:'m_integral'
	},
	'm1013':{
		orderNum:-7,
		modTplId:'m_exchangeList'
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
	'm1005':{
		text:'',
		editTplId:'e_text',
		modTplId:'m_text'
	},
	'm1008':{
		htmlStr:'',
		editTplId:'e_custom',
		modTplId:'m_custom'
	}
};

var m_editeBox,	//模板编辑
	m_phoneBox,	//手机预览
	page;	//页面主逻辑

// 模块  编辑界面相关操作
m_editeBox={
	init:function(){
		this.previewEv();
		this.cancelEv();
	},
	getModDom:function(data){ /*获取编辑模块的DOM*/
		// 判断是否已经存在，存在：返回 ，不存在：创建
		var meid = data.meid;
		var mDom = $('#'+meid);

		if(mDom.length){
			$('#'+meid).replaceWith(template(data.editTplId, data));
		}else{
			$('#editWrap').append(template(data.editTplId, data));
		}
		this.initCompents2EditeMod(meid);
	 	return $('#'+meid);
	},
	initCompents2EditeMod:function(meid){ /*初始化编辑界面的组件*/
		var self = this;
		var $modEl = $('#'+meid);
		switch(meid.split('-')[0].substring(2)){
			case '1001': //轮播广告
				var $tipH = $('#carousel-tips-height'+meid);

				// 注册选择高度事件
				$('#carouselImgHheightSelect'+meid).on('click', 'input', function(){
					$tipH.html($(this).val());
				});

				// 注册广告列表删除事件
				$('#carouselUploaderBox'+meid).on('click', '.icon_delete', function(){
					$(this).closest('.carousel_item').remove();
				});

				// 上传组件
				$('#carouselUploaderBox'+meid).fileUploader({
					fileQueuedEv:false,
					uploadStartEv:false,
					uploadProgressEv:false,
					uploadSuccessEv:function(file, response){
						var max=0, eachNum=0, data;
						$('#carouselUploaderBox'+meid+' .carousel_item_num').each(function(){
							eachNum = ~~$(this).val();
							if(eachNum>max){
								max = eachNum;
							}
						});
						data = {
							url:'https://qncdn.qiakr.com/'+response.hash,
							num: max+1
						};
						$('#carouselListTbd'+meid).append(template.compile('<tr data-tag="item" class="carousel_item">\
                            <td data-tag="item-i"><input type="number" class="carousel_item_num" name="orderNum"  value="{{num}}"></td>\
                            <td>\
                                <div class="uploaded" style="margin:10px 0">\
                                    <img src="{{url}}" width="94" height="54" data-tag="item-img" />\
                                </div>\
                            </td>\
                            <td class="tal">\
                            </td>\
                            <td>\
                                <a href="javascript:;" class="icon_delete" title="删除" >删除</a>\
                            </td>\
                        </tr>')(data));

                        $('#carouselListTbd'+meid+' .carousel_item:last').find('.tal').html($('#cpSltBox').html());
                        $('#mainwrapper').height($('#editWrap').height()+100);
					},
				});

				setTimeout(function(){
					$modEl.find('[name="imgLinkType"]').trigger('change');
				}, 500);
				
				break;
			case '1002': //通栏广告 
				$('#onecolumnUploader'+meid).fileUploader({
					// 缩略图
					thumbW:320,
					thumbH:160,
					// 压缩
					compressW:640,
					compressH:320
				}); 
				setTimeout(function(){
					$modEl.find('[name="imgLinkType"]').trigger('change');
				}, 500);

				$modEl.find('[name="imgLinkType"]').select2({minimumResultsForSearch: Infinity});
				break;
			case '1003': //两栏广告
				$('#twocolumnRightUploader'+meid+',#twocolumnLeftUploader'+meid).fileUploader();
				setTimeout(function(){
					$modEl.find('[name="imgLinkType"]').trigger('change');
				}, 500);

				$modEl.find('[name="imgLinkType"]').select2({minimumResultsForSearch: Infinity});
				break;
			case '1005': //文字
				// 初始化字数限制组件
				$('#textModContent'+meid).charcount({ maxLength: 500, position:'after', preventOverage: true });
				break;
			case '1008': //自定义
				KindEditor.lang({
				    imgUploader : '上传图片'
				});
				// 富文本编辑
				cusEditor = KindEditor.create('#customEditor'+meid, {
			        items:['source','fontsize', 'forecolor', 'hilitecolor', 'bold','italic', 'underline', 'strikethrough', 'lineheight','fontname',  '|','imgUploader','table', 'hr', 'emoticons', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', '|', 'preview', 'autoheight'],
			        resizeType:1,
			        autoHeightMode:true,
			        filterMode:false
			   });
				break;
		}
		page.linkSltEv();
	},
	show:function(data){ /*显示界面*/
		$('#editWrap').fadeIn();
		var d = this.getModDom(data);
		d.addClass('active');
		setTimeout(function(){$('#mainwrapper').height($('#editWrap').height()+100);}, 500);
	},
	hide:function(){ /*隐藏界面*/
		$('.ui_dialog_wrapper.active').removeClass('active');
		$('#editWrap').fadeOut();
	},
	previewEv:function(){ /*预览*/
		var self = this,o = this.o;
		$('#editWrap').on('click','[data-tag="save"]', function(){
			var meid = $(this).data('id');
			var mid = 'm'+meid.substring(2);
			var $pbox = $('#'+meid);

			var modID = meid.split('-')[0].replace('e','');
			var modData = {};

			switch(modID){
				case 'm1001': //轮播广告
					var $cItems = $('#carouselListTbd'+meid+' tr'), imgs=[];
					if($cItems.length){
						$cItems.each(function(){
							var $this = $(this);
							var imgLinkType=$this.find('[name="imgLinkType"]').val();
							var tData = {
								orderNum: ~~$this.find('[name="orderNum"]').val(),
								imgUrl: $this.find('img').attr('src'),
								linkType: imgLinkType
							}
							tData.linkInfo = self.getLinkInfoByLinkType(imgLinkType, $this);
							imgs.push(tData);
						});

						for(var i in imgs){
							if(!(Reg_URL.test(imgs[i].linkInfo.url)) && imgs[i].linkType==='0'){
								toastr.warning('请输入正确的链接地址！');
								return false;
							}
						}
					}else{
						toastr.warning('请至少上传一张广告图片！');
						return false;
					}

					if(imgs.length>5){
						toastr.warning('设置的图片数量不能大于5张！');
						return false;
					}

					modData={
						imgHeight:$pbox.find('[name="imgHeight"]:checked').val(),
						imgs:imgs,
					}
					break;
				case 'm1002': //通栏广告
					var imgLinkType = $pbox.find('[name="imgLinkType"]').val();
					modData = {
						imgUrl: $pbox.find('[name="imgUrl"]').val().trim(),
						linkType: imgLinkType
					}
					modData.linkInfo = self.getLinkInfoByLinkType(imgLinkType, $pbox);

					if(modData.imgUrl=='' || modData.imgUrl == 'https://qncdn.qiakr.com/qk_v3/fullcolumn.png'){
						toastr.warning('请至少上传一张广告图片！');
						return false;
					}
					
					if(!(Reg_URL.test(modData.linkInfo.url)) && modData.linkType==='0'){
						toastr.warning('请输入正确的链接地址！');
						return false;
					}
					break;
				case 'm1003': //两栏广告
					modData={
						leftImg:{
							imgUrl:$pbox.find('[name="leftImgUrl"]').val().trim(),
						},
						rightImg:{
							imgUrl:$pbox.find('[name="rightImgUrl"]').val().trim(),
						},
					}
					var $linkL = $('.twocolumn-link'+meid+':first');
					var $linkR = $('.twocolumn-link'+meid+':last');
					var linkTypeL = $linkL.find('[name="imgLinkType"]').val();
					var linkTypeR = $linkR.find('[name="imgLinkType"]').val();

					modData.leftImg.linkType = linkTypeL;
					modData.rightImg.linkType = linkTypeR;

					modData.leftImg.linkInfo = self.getLinkInfoByLinkType(linkTypeL, $linkL);
					modData.rightImg.linkInfo = self.getLinkInfoByLinkType(linkTypeR, $linkR);
					if(modData.leftImg.imgUrl=='' || modData.rightImg.imgUrl=='' || modData.leftImg.imgUrl=='https://qncdn.qiakr.com/qk_v3/left.png' || modData.rightImg.imgUrl=='https://qncdn.qiakr.com/qk_v3/right.png' ){
						toastr.warning('广告图片不能为空！');
						return false;
					}

					if((!(Reg_URL.test(modData.leftImg.linkInfo.url)) && modData.leftImg.linkType==='0')|| (!(Reg_URL.test(modData.rightImg.linkInfo.url)) && modData.rightImg.linkType==='0') ){
						toastr.warning('请输入正确的链接地址！');
						return false;
					}
					break;
				case 'm1005': //文本
					modData = {
						text:$('#textModContent'+meid).val().trim(),
						// hasMargin:$pbox.find('.text-margin').prop('checked')
					}
					if(modData.text==''){
						toastr.warning('文本不能为空！');
						return false;
					}
					break;
				case 'm1008': //自定义
					modData={
						htmlStr:cusEditor && filterXSS(cusEditor.html())
					}
					if(cusEditor.isEmpty()){
						toastr.warning('自定义内容不能为空！');
						return false;
					}
					break;
			}

			modData.mid = mid;
			modData.meid = meid;
			RES_CONF[mid] = modData;

			DEBUG && console.info('更新预览：', modData);

			// 1. 更新到预览 3. 隐藏界面 4. 提示保存
			self.refreshOrderNum4Mod();
			self.refreshDataToPhone(mid);
			$pbox.removeClass('active');
			$('#editWrap').fadeOut();
			m_phoneBox.hideMask(meid);
		});
	},
	getLinkInfoByLinkType:function(linkType, $linkBox){
		var linkInfo={}, lId = 0;
		if(linkType==='0' || linkType==='10' || linkType==='13'){
			if(linkType==='0'){
				linkInfo={
					url: $linkBox.find('[name="customerLinkUrl"]').val().trim()
				}
			}else if(linkType==='10'){
				lId = $linkBox.find('[name="specialPromotionLink"]').val();
				linkInfo={
					url:'getSpecialPromotion.htm?suid='+suid+'&id='+lId,
					id:lId
				}
				if(lId == '-1') linkInfo.url="javascript:;";
			}else{
				lId = $linkBox.find('[name="discountPromotionLink"]').val();
				linkInfo={
					url:'discountPromotionDetail.htm?id='+lId+'&storeId=0',
					id:lId
				}
				if(lId == '-1') linkInfo.url="javascript:;";
			}
		}else{
			linkInfo={
				url:LINK_DIC[linkType]
			}
		}
		return linkInfo;
	},
	cancelEv:function(){ /*取消*/
		$('#editWrap').on('click','.ui_dialog_close', function(){
			var $pbox = $(this).closest('.ui_dialog_wrapper');
			var meid = $pbox.attr('id');
			var mid = 'm'+meid.substring(2);

			// 判断是否保存过，如果没有则移除，如果有，则隐藏
			if( typeof RES_CONF[mid] == 'undefined' ){
				$('#'+meid).remove();
				$('#'+mid).remove();
			}

			m_phoneBox.hideMask(meid);
			$pbox.removeClass('active');
			$('#editWrap').fadeOut();
		})
	},
	refreshDataToPhone:function(mid){ /*更新数据到预览*/
		// 获取配置初始化手机预览界面
		var modId = mid.split('-')[0];
		var data = RES_CONF[mid];
		var $box = $('#'+mid);

		$box.replaceWith(template(MODULES[modId].modTplId, data));
		// 轮播
		if(modId == 'm1001'){
			setTimeout(function(){
				if($('#'+mid).find('.swiper-wrapper a').length>1){
					new Swiper($box.find('.swiper-container')[0], {
				       pagination: $box.find('.swiper-pagination'),
				       autoplayDisableOnInteraction:false,
				       paginationClickable: true,
				       autoplay: 3000
				    });
				}
			}, 500);
		}
	},
	refreshOrderNum4Mod:function(){ //刷新模块的排序ID
		$('#shopview .wx_mod').each(function(i, v){
			RES_CONF[v.id] && (RES_CONF[v.id]['orderNum']=i);
		});
	}
}

// 手机预览
m_phoneBox = {
	init:function(){
		this.foldEv();
		this.editEv();
		this.trushEv();
	},
	foldEv:function(){ /*折叠*/ 
		$('#shopview').on('click', '.btn_fold', function(){
			var $this = $(this), $parent = $this.closest('.wx_mod');
			if(!$parent.find('.title').is(':visible')){
				$this.addClass('down');
				$parent.find('.title').show();
				$parent.find('.bd').hide();
			}else{
				$this.removeClass('down');
				$parent.find('.title').hide();
				$parent.find('.bd').show();
			}
			// $( "#shopview" ).sortable( 'refreshPositions' );
		});
	},
	editEv:function(){ /*编辑*/ 
		// 获取该模块ID
		$('#shopview').on('click', '.btn_edit', function(){
			var $parent = $(this).closest('.wx_mod');
			var mid = $parent.attr('id'); 
			var data = RES_CONF[mid];
			var modId = mid.split('-')[0];

			data.meid = 'me'+mid.substring(1);
			data.editTplId = MODULES[modId].editTplId;

			m_editeBox.show(data);
			m_phoneBox.showMask(mid);
		});
	},
	trushEv:function(){ /*删除*/
		// 获取该模块ID
		$('#shopview').on('click', '.btn_trash', function(){
			var $parent = $(this).closest('.wx_mod');
			var mid = $parent.attr('id');
			var meid = 'me'+mid.substring(1);

			// 删除数据，删除DOM 获取data
			var data = MODULES[mid.split('-')[0]];
			var editTplId =  MODULES[mid.split('-')[0]].editTplId;

			delete RES_CONF[mid];

			$parent.remove();
			if($('#'+meid).hasClass('active')){
				m_editeBox.hide(data);
				m_phoneBox.hideMask(mid);
			}
			toastr.warning('店铺装修已更改，请注意保存装修！！！');
		});
	},
	showMask:function(mid){
		// 隐藏模块遮罩 显示整体遮罩 当前模块隐藏 收起和编辑
		$('#shopview').find('.ui_mask_wrapper').hide();
		$('.ui_overlay').css('height', $('#phoneContainer')[0].scrollHeight+'px').show();
		$('#'+mid).addClass('current').find('.ui_mask_wrapper').show();
		// .find('.btn_trash').show();
		// $('#previewBtn').hide();
	},
	hideMask:function(meid){
		// 隐藏整体遮罩 显示模块遮罩 当前模块显示 收起和编辑
		var mid = 'm'+meid.substring(2);
		$('.ui_overlay').hide();
		$('#shopview').find('.ui_mask_wrapper').show();
		$('#'+mid).removeClass('current').find('.btn_trash').show();
		$('#previewBtn').show();
	}
};

page = {
	init:function(confData){
		var dfr = $.Deferred();
		var self = this;
		var tplId = mainVM.$model.params.templateId;

		this.dragSortEv();
		this.linkSltEv();
		this.saveConfigEv();
		this.zclipboardEv();
		m_editeBox.init();
		m_phoneBox.init();

		$.when(this.initDEF_CONF()).done(function(){
			self.renderConf.bind(self)();
			dfr.resolve();
		}).fail(function(){
			toastr.error('装修数据初始化失败！');
			dfr.reject();
		});
		return dfr;
	},
	initDEF_CONF:function(){ /*初始化默认数据*/
		// 获取 品牌、类目、自定义类别、专题、满减满折
		var dtd = $.Deferred();
		$.when(
			$.ajax({url:PAGE_CONF.apiGetSpecialPromotion, data:{index:0, length:100}}), 
			$.ajax({url:PAGE_CONF.apiGetDiscountPromotion, data:{index:0, length:100,processing:3}})
		).done(function(d3, d4){
			d3 = d3[0]; d4=d4[0];
			if((d3.status - d4.status)!==0){
				toastr.error('数据初始化失败！');
				return false;
			}
			d3 = d3.result.specialPromotionList;
			d4 = d4.result.discountPromotionVoList;

			PAGE_CONF.specialPromotionData = (d3 && d3.length)?d3.map(function(v,i){ return '<option value="'+v.id+'">'+v.name+'</option>';}).join(''):'<option value="-1">暂无此类活动</option>';
			PAGE_CONF.discountPromotionData = (d4 && d4.length)?d4.map(function(v,i){ return '<option value="'+v.id+'">'+v.promotionName+'</option>';}).join(''):'<option value="-1">暂无此类活动</option>';


			RES_CONF = $.extend(true,{}, DEF_CONF);

			dtd.resolve();
		})
		.fail(function(){
			dtd.reject();
		});

		return dtd;
	},
	dragSortEv:function(){ /*初始化拖动和排序*/
		$( "#moduleList .ui-draggable" ).draggable({
			containment:'#dragWrap',
			connectToSortable: "#shopview",
			helper: "clone",
			revert: "invalid",
			start:function(){ isDragToReplace = true; },
			stop:function(){ isDragToReplace = false; }
		});

		$( "#shopview" ).sortable({
			items: ".wx_mod,#shopview",
			cancel: ".ui-state-disabled",
			placeholder: "ui-state-highlight",
			revert: false,
			axis: "y",
			stop:function(e, ui){
				m_editeBox.refreshOrderNum4Mod();
				if(!isDragToReplace){
					toastr.warning('模块位置发生了变化，请注意保存装修！');
					return;
				}
				
				// 拿到模块原始ID
			  	var mid = ui.item.context.getAttribute('moduleid');
			  	var $newMod = $('#shopview').find('.mod_item');

			  	var emptyStr='';
			  	// 生成新的模块ID
			  	var newId = (new Date()).getTime().toString(16).substring(7);
			  	var data = MODULES['m'+mid];
				  	data.mid ='m'+mid+'-'+newId;
				  	data.meid ='me'+mid+'-'+newId;

			  	// 创建模块到预览
		  		$newMod.replaceWith(template(data.modTplId, data));
		  		m_phoneBox.showMask(data.mid);
	  			// 显示编辑界面
			  	m_editeBox.show(data);
			}
		});

		$("#shopview").disableSelection();
	},
	initView:function(confData){ /*初始化界面*/
	},
	renderConf:function(){ /*使用配置渲染到手机预览*/
		var shopConf = RES_CONF;
		var arrConf=[], self = this;
		for(var i in shopConf){
    		if(i!='version'){
	    		shopConf[i].mid=i;
	    		arrConf.push(shopConf[i]);
    		}
    	}
		var arrConf = arrConf.sort(function(a,b){
			return a.orderNum-b.orderNum;
		});

		var strArr=[];

		while(arrConf.length){
			oMod = arrConf.shift();
			var modId = oMod['mid'].split('-')[0];

			switch(modId){
				case 'm1001':// 轮播
					if(oMod.imgs.length>1){
						oMod.imgs.sort(function(a, b){ return a.orderNum-b.orderNum});
						(function(mid){
							setTimeout(function(){
								var $mBox = $('#'+mid);
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
			}

			strArr.push(template(MODULES[modId].modTplId, oMod));
		}
		$('#shopview').append(strArr.join(''));
		$('.ui_mask_wrapper').show();
	},
	linkSltEv:function(){ /*选择链接*/
		// 选择链接 事件
		$('#editWrap').on('change', '[name="imgLinkType"]', function(){
			var $this = $(this);
			var $td = $this.parent().parent();
			var val = ~~$this.val();
			var $sSlt = $td.find('[name="specialPromotionLink"]');
			var $dSlt = $td.find('[name="discountPromotionLink"]');
			var $cIpt = $td.find('[name="customerLinkUrl"]');

			if(val === 0 || val === 10 || val===13){
				if(val == 10){
					$sSlt.show();
					$dSlt.hide();
					$cIpt.hide();

					$sSlt.html()=='' &&  $sSlt.html(PAGE_CONF.specialPromotionData);
					$sSlt.data('id') !== '' && $sSlt.val($sSlt.data('id')).trigger('change');
				}else if(val===13){
					$sSlt.hide();
					$dSlt.show();
					$cIpt.hide();

					$dSlt.html()=='' && $dSlt.html(PAGE_CONF.discountPromotionData);
					$dSlt.data('id') !== '' && $dSlt.val($dSlt.data('id')).trigger('change');
				}else{
					$sSlt.hide();
					$dSlt.hide();
					$cIpt.show();
				}
			}else{
				$sSlt.hide();
				$dSlt.hide();
				$cIpt.hide();
			}
		}).on('change', '[name="specialPromotionLink"]', function(){
			$(this).data('id',$(this).val());
		}).on('change', '[name="discountPromotionLink"]', function(){
			$(this).data('id',$(this).val());
		});
	},
	zclipboardEv:function(){
		$("#copyExchangeLink").zclip({
		    path: "//res.qiakr.com/plugins/zclip/zclip.swf",
		    copy: function(){
		    	return 'https://mall.qiakr.com/mall/home.htm?suid='+$("#g_supplierId").val();
		    },
		    beforeCopy:function(){
				// $(this).css('background','#449d44');
			},
		    afterCopy:function(){/* 复制成功后的操作 */
		    	Utils.alert('复制成功');
		    }
		});
	},
	getData:function(){
		var resD = $.extend(true, {}, RES_CONF);
		
		resD.version = (typeof resD.version != 'undefined') ? (~~resD.version+1) : 1;

		DEBUG && console.log('保存：',resD);
		return resD;
	},
	saveConfigEv:function(){
		$('#btnSaveConf').on('click',function(){
			var _this = $(this);

			$('#editWrap:visible').find('[data-tag="save"]').trigger('click');
			var pms ={
				templateConfig:JSON.stringify(page.getData())
			}
			var url = "";

			console.log(pms)
			// _this.uiLoading('sm');
			// $.post(url, pms).done(function(data){
			// 	if(data.status==='0'){
					
			// 	}else{
			// 		toastr.error(data.errmsg || '数据更新失败，服务器繁忙！');
			// 	}
			// }).always(function(){
			// 	_this.uiLoading('sm');
			// });

		});
	}
};

// page.init();

return {
	init:function(data){
		return page.init();
	}
};

});