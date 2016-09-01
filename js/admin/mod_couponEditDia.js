/**
 * 优惠券编辑模块
 * use: $.couponDia.show(id, okFn, cancelFn);
 * version: v0.0.1
 * author: LT
 */
define(['niceV','WdatePicker','powerSeleteDia','categorySelectDia','slimscroll'], function(){

	var couponVM, 
		couponView,
		CONF,
		DEF_COUPON_DATA,
		INITED = false,
		tplId = 'diaCouponEditTpl',
		couponCache=[],
		storeSltDia, proSltDia, brandSltDia;

	CONF = {
		apiGetCategoryList: 'getAllCategoryFamily.json',
        apiGetCategoryLeaf: 'getCategoryListByFamilyId.json',
        apiGetProList: 'queryAllocatedSupplierStock.json',
        apiGetStoreList: 'getStoreList.json',
        apiGetBrandList: 'getBrandList.json',
        apiGetCouponById: 'getCouponById.json',
	}

	DEF_COUPON_DATA = {
		coupon:{
			couponName: '',
			couponValue: null,
			orderLimitValue: null,
			limitType: '1',
			limitIds: '',
			limitStoreIds:[],
			startTime: null,
			endTime: null,
			couponDescription: '1. 必须在订单金额满足时才能使用；\r\n2. 一张店铺优惠券仅限于单笔订单消费抵用；\r\n3. 优惠券过期则作废;\r\n4. 活动商品，如闪购秒杀不可使用优惠券\r\n5. 优惠券不可抵扣运费\r\n',
			color: '#F44336'
		},
		categoryList:[],
		productList:[],
		brandList:[],
		storeNameStr:''
	}

	function pick(fObj, tObj){
		var res = {};
		for(var i in tObj){
			res[i] = fObj[i];
		}
		return res;
	}

	// UI操作
	couponView = {
		_initVM:function(data){
			couponVM = avalon.define({
				$id: 'couponEditCtrl',
				coupon: data.coupon,
				categoryList: data.categoryList,
				productList: data.productList,
				brandList: data.brandList,
				storeNameStr: data.storeNameStr,
				limitStoreType: '0',
				limitTimeType: '0',
				setColor: function(c){
					couponVM.coupon.color = c;
				}
			});

			avalon.scan($('#diaCouponEditTpl')[0]);
		},
		_initComs:function(){
			// 时间选择/门店限制 / 品牌、商品限制 / 品类限制
			$.initDatePicker([{ST:'#ST_CP', ET:'#ET_CP'}]);

			// 选择商品
			proSltDia =  $.powerSelectDia({
			 	apiGetData: CONF.apiGetProList,
                title: '选择商品',
                listDataName: 'stockVoList',
                itemsStyle: {width:'100%'},
                selectMulti: true,
                checkboxTpl: '<table class="table table-condensed">\
                				<thead><tr><th>选择</th><th>价格</th><th>总库存</th></tr></thead>\
                				{{each data as item i}}\
                					<tr>\
                						<td><div class="checkbox sltdia-item checkbox-primary m0"><input id="d-{{item.id}}" class="j-dia-item"  data-id="{{item.id}}" type="checkbox" value="{{item.id}}"><label for="d-{{item.id}}" title="{{item.text}}">[{{item.productCode || "无款号"}}]{{item.text | truncate:15}}</label> </div></td>\
                						<td>￥{{item.minSkuPrice}}-￥{{item.maxSkuPrice}}</td>\
                						<td>{{item.count}}</td>\
                						</tr>\
        						{{/each}}\
    						</table>',
                searchTpl: '<div class="form-group"><div class="input-group"> <input type="text" class="form-control input-sm w150 j-sales-name" name="fuzzyName" placeholder="请输入商品名称或款号"> <span class="input-group-btn"> <button type="button" class="btn btn-primary btn-sm j-dia-search">筛选</button> </span> </div> </div>',
                getSearchPms: function($searchWrap) {
                    var keywords = $.trim($searchWrap.find('[name="fuzzyName"]').val());

                    if (keywords.length > 80) {
                        toastr.warning('输入信息过长');
                        return false;
                    }

                    return { fuzzyName: keywords, supplyTypeList:'1_3', status:0 };
                },
                getItemsDataFn: function(data) {
                    return data.map(function(v) {
                        return { 
                        	id: v.stock.id, 
                        	text: v.stock.productName || 'xxx',
                        	count: v.stock.count,
                        	productCode: v.product.productCode,
                        	minSkuPrice: v.minSkuPrice,
                        	maxSkuPrice: v.maxSkuPrice,
                        };
                    })
                },
                okFn: function(chkRes) {
                	if(chkRes.length){
                		var res = '';
                		res = chkRes.map(function(v){
                			return '<div data-id="'+v.id+'" class="rel dib w200 ell pr20 mr5">'+v.text+' <i class="iconfont limit-close-btn" data-id="'+v.id+'">&#xe671;</i></div>'
                		}).join('');
                		$('#limitResBox').data('limit',chkRes).html(res);
                	}
                }
			 });

			// 选择门店
			storeSltDia =  $.powerSelectDia({
			 	apiGetData: CONF.apiGetStoreList,
                title: '选择门店',
                listDataName: 'storeVoList',
                selectMulti: true,
                searchTpl: '<div class="form-group text-right"><div class="input-group"> <input type="text" class="form-control input-sm w150 j-sales-name" name="storeName" placeholder="店铺名称"> <span class="input-group-btn"> <button type="button" class="btn btn-primary btn-sm j-dia-search">筛选</button> </span> </div> </div>',
                getSearchPms: function($searchWrap) {
                    var storeName = $.trim($searchWrap.find('[name="storeName"]').val());

                    if (storeName.length > 80) {
                        toastr.warning('输入信息过长');
                        return false;
                    }

                    return { storeName: storeName};
                },
                getItemsDataFn: function(data) {
                    return data.map(function(v) {
                        return { id: v.store.id, text: v.store.name || 'xxx' };
                    })
                },
                okFn: function(chkRes) {
                	console.log(chkRes);
                	if(chkRes.length){
                		var res = '';
                		res = chkRes.map(function(v){
                			return '<div data-id="'+v.id+'" class="rel dib w150 ell pr20 mr5">'+v.text+' <i class="iconfont limit-close-btn" data-id="'+v.id+'">&#xe671;</i></div>';
                		}).join('');
                		$('#limitStoreResBox').data('limit',chkRes).html(res);
                	}
                }
			 });

			// 选择品牌
			brandSltDia =  $.powerSelectDia({
			 	apiGetData: CONF.apiGetBrandList,
                title: '选择品牌',
                listDataName: 'productBrandList',
                selectMulti: true,
                searchTpl: '<div class="form-group text-right"><div class="input-group"> <input type="text" class="form-control input-sm w150 j-sales-name" name="fuzzyKeyword" placeholder="品牌名称"> <span class="input-group-btn"> <button type="button" class="btn btn-primary btn-sm j-dia-search">筛选</button> </span> </div> </div>',
                getSearchPms: function($searchWrap) {
                    var keywords = $.trim($searchWrap.find('[name="fuzzyKeyword"]').val());

                    if (keywords.length > 80) {
                        toastr.warning('输入信息过长');
                        return false;
                    }

                    return { fuzzyKeyword: keywords };
                },
                getItemsDataFn: function(data) {
                    return data.map(function(v) {
                        return { id: v.id, text: v.brandName || 'xxx' };
                    })
                },
                okFn: function(chkRes) {
                	if(chkRes.length){
                		var res = '';
                		res = chkRes.map(function(v){
                			return '<div data-id="'+v.id+'" class="rel dib w150 ell pr20 mr5">'+v.text+' <i class="iconfont limit-close-btn" data-id="'+v.id+'">&#xe671;</i></div>'
                		}).join('');
                		console.log(res);
                		$('#limitResBox').data('limit',chkRes).html(res);
                	}
                }
			 });
		},
		_initEvents:function(){
			$('#ipt_cp_31').on('change', function(){
				var t = $(this).val();
				
				var chkedData = $('#limitResBox').data('limit');

				switch(t){
					case '1': $.categoryDia.show(chkedData); break;
					case '2': proSltDia.show(chkedData); break;
					case '3': brandSltDia.show(chkedData); break;
					default: break;
				}
			})
			$('#ipt_cp_4').on('change', function(){
				var chkedData = $('#limitStoreResBox').data('limit');
				if($(this).val()==='1'){
					storeSltDia.show(chkedData);
				}
			})

			$('#ipt_cp_31_edit').on('click', function(){
				$('#ipt_cp_31').trigger('change');
			})

			$('#ipt_cp_4_edit').on('click', function(){
				$('#ipt_cp_4').trigger('change');
			})

			$('#limitResBox').on('click', '.limit-close-btn', function(){
				var $this = $(this);
				var id = Number($(this).data('id'));
				var data = $('#limitResBox').data('limit');

				data.forEach(function(v, i){
					if(v.id == id){
						$this.parent().fadeOut(function(){$(this).remove()});
						return data.splice(i, 1);
					}
				})

				$('#limitResBox').data('limit', data);
			})

			$('#limitStoreResBox').on('click', '.limit-close-btn', function(){
				var $this = $(this);
				var id = Number($(this).data('id'));
				var data = $('#limitStoreResBox').data('limit');

				data.forEach(function(v, i){
					if(v.id == id){
						$this.parent().fadeOut(function(){$(this).remove()});
						return data.splice(i, 1);
					}
				})
				$('#limitResBox').data('limit', data);
			})
		},
		show:function(initData, okFn, cancelFn){
			var cpData, _this = this;

			// cpData = {
			// 	coupon:{},
			// 	categoryList:[],
			// 	productList:[],
			// 	brandList:[],
			// 	storeNameStr:'',
			// }
			
			if(typeof initData === 'object'){
				cpData = initData;
			}else if(initData){
				var id = Number(initData);
				cpData = couponCache['c-'+id] ||  $.post(CONF.apiGetCouponById, {id: id});
			}

			if(cpData && cpData.done){
				cpData.done(function(data){
						if(data.status==='0'){
							cpData ={
								coupon: pick(data.couponLimitVo.coupon, DEF_COUPON_DATA.coupon),
								categoryList: data.couponLimitVo.categoryList || [],
								productList: data.couponLimitVo.productList || [],
								brandList: data.couponLimitVo.brandList || [],
								storeNameStr: ''
							};
							_this._open.bind(_this)(cpData, okFn, cancelFn);
						}else{
							return toastr.warning('获取优惠券信息失败！');
						}
					})
			}else{
				_this._open.bind(_this)(cpData, okFn, cancelFn);
			}

			return _this;
		},
		_open:function(cpData, okFn, cancelFn){
			var _this = this;
			var isCreate = !cpData;
			var cpData = cpData ? cpData: $.extend({},DEF_COUPON_DATA);
			
			dialog({
	            title: isCreate?'创建优惠券':'编辑优惠券',
				fixed: true,
	            padding: 0,
	            width: 720,
	            height: 550,
	            content: $('#diaCouponEditTpl'),
	            okValue: '确定',
	            onshow:function(){
	            	// 对话框加载后
					if(!INITED){
						_this._initVM(cpData);
						_this._initComs();
						_this._initEvents();
						INITED = true;
					}else{
						_this._resetVM(cpData);
					}
					$('.dia-coupon-wrap').parent().slimscroll({
						height:520,
						width:718
					})
					$('#limitResBox, #limitStoreResBox').slimscroll({height:120})
	            },
	            ok: function (){
	               	return okFn && okFn(_this.getData());
	            },
	            cancelValue: '取消',
	            cancel: function () {
	                cancelFn && cancelFn();
	                return true;
	            }
	        }).showModal();
		},
		getData:function(){
			return $.extend({},couponVM.$model.coupon);
		},
		_resetVM:function(data){
			couponVM.coupon = data.coupon;
			couponVM.categoryList = data.categoryList;
			couponVM.productList = data.productList;
			couponVM.brandList = data.brandList;
			couponVM.storeNameStr = data.storeNameStr;
		}
	}

	return $.couponDia = couponView;
})
