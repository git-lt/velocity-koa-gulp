document.title="商品管理";
$.createSecondMenu("product_manage","总库商品");
Util.createHelpTip("商品相关问题",[
	{"title":"添加商品","link":"https://qiakr.kf5.com/posts/view/39380/"},
	{"title":"添加品牌/添加分类","link":"https://qiakr.kf5.com/posts/view/59986"},
	{"title":"商品批量导入","link":"https://qiakr.kf5.com/posts/view/39381/"},
	{"title":"商品批量改价改库存","link":"https://qiakr.kf5.com/posts/view/39379/"},
	{"title":"上架商品到微商城","link":"https://qiakr.kf5.com/posts/view/39393/"},
	{"title":"门店自建商品","link":"https://qiakr.kf5.com/posts/view/39378/"},
	{"title":"导购提成设置","link":"https://qiakr.kf5.com/posts/view/60007"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);
$(".select2").select2();
$(".select2s").select2({
	minimumResultsForSearch: -1
});
$("#couponDisable").select2({
	placeholder:"是否可用优惠券",
	minimumResultsForSearch: -1
});
$("#onShelves").select2({
	placeholder:"是否已上架",
	minimumResultsForSearch: -1
});

getAjaxData(0);

function getAjaxData(idx, orderName, orderType,name,brandId,tags,categoryIds,couponDisable,allocated){
	$("#mainTable tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	var options={
		status:0,
		allocated:allocated,
		fuzzyName:name,
		brandId:brandId,
		index:idx,
		length:Util.listLength,
		tags:tags,
		categoryIds:categoryIds,
		orderName:orderName || 'status_time',
		orderType:orderType || 'desc',
		supplyTypeList:"1_3",
		couponDisable:couponDisable || ''
	};
	jQuery.ajax({
		url:"querySupplierStock.json",
		data:options,
		success:function(data){
			var dataHtml="";
			if(data.result.stockVoList.length===0){
				dataHtml = '<tr><td class="tc" colspan="100">商品列表为空</td></tr>';
			}else{
				var tempData={
					list:data.result.stockVoList,
					status:0
				};
				var dataHtml = template('tempData', tempData);
			}

			$("#mainTable tbody").empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$("#pagination .pagination"),function(_i){
				getAjaxData(_i, orderName, orderType,name,brandId,tags,categoryIds,couponDisable,allocated);
			});
			$('#mainTable thead').off().on('click','.sort-btn',function(){
				var $this=$(this),state,sortName;
		    	state = $this.data('state');
		    	sortName = $this.data('name');
		    	state = state=='desc' ? 'asc' : 'desc';
				$this.data('state',state);
		    	getAjaxData(0, sortName, state,name,brandId,tags,categoryIds,couponDisable,allocated);
		    	$('#mainTable thead .sort-btn').find(".iconfont").removeClass("active");
		    	$this.find('.'+state).addClass('active').siblings().removeClass('active');
			});
			$("#mainTable").setTheadFixed({
				leaveTop: 134,
				fixedFn:function(){
					$(".tableAction").css({"position":"fixed","top":"60px"});
					$("#mainTable").css("margin-top","76px");
				},
				unfixedFn:function(){
					$(".tableAction").css({"position":"static","top":"0"});
					$("#mainTable").css("margin-top","0");
				}
			});
			$(".fixedTable.table").on("click",".sort-btn",function(){
				var idx = $(this).closest("th").index();
				$("#mainTable thead tr th").eq(idx).find(".sort-btn").trigger("click");
				$(document).scrollTop(0);
			});
		}
	});
}

// Add By LT 2015-04-27
var p_storeList = {
	o:{
		brandListData:{},
		categoryFamilyVoList:{},
		firstInitLocation:true,
		isSingleShelves:false,
		allocateBox:null
	},
	init:function(){
		// this.getBrandList();
		this.querySupplierCategoryList();
		this.mulOnShelves(); // 批量上架
		this.sinOnShelves(); // 单独上架
		this.cancelCouponEv(); //禁止使用优惠卷
		this.newProduct();
		this.batchTask();
		this.tabSwitchStoreEv();
	},
	getSeldPIdList:function(){

	},
	cancelCouponEv:function(){
		$('#couponDisableBtn').on('click', function(){
			var chksIpt = $("#mainTable tbody").find("input[name=select]:checked"),
				proIds=[],hasDistStock = false;

			if(!chksIpt.length){
				Util.alert("请至少选择一件商品");
				return false;
			}

			proIds = $.map(chksIpt, function(v, i){
				if($(v).data("dist")=="1"){
					hasDistStock = true;
					return false;
				}
				return $(v).data('id');
			});
			if(hasDistStock){
				Util.alert("分销商品不能进行优惠券设置");
				return false;
			}

			proIds = proIds.join('_');

			// 请求服务 - 取消优惠卷使用
			var pms = {
				couponDisable:1,
				productIdList:proIds
			};

			$.post('setCouponisable.json', pms)
				.done(function(data){
					if(data.status === '0'){
						Util.alert('成功取消优惠卷使用！');
						chksIpt.prop('checked', false);
						chksIpt = null;
					}else{
						Util.alert('取消优惠卷使用失败');
					}
				})
				.fail(function(res){
					Util.alert('取消优惠卷使用失败');
				});
		});
	},
	tabSwitchStoreEv:function(){
		var $storeBox = $('#storeListBox');
		$storeBox.on('click', '.tab-nav', function(){
			var $this = $(this);
			var i = $this.index();
			$this.addClass('current').siblings().removeClass('current');
			$('#storeListWrap').children().eq(i).show().siblings().hide();
		});
	},
    getCategoryListById:function(cId){
    	var o = this.o;
    	$("#sltCategoryList").select2({
	        placeholder: "选择二级分类",
	        data:o.categoryFamilyVoList.leafData[cId]
	    }).val(999).trigger('change');
    },
    querySupplierCategoryList:function(){ 	/*获取商家品类信息*/
    	var self = this, o = this.o;
    	$.ajax({
    		url:'querySupplierCategoryList.json'
    	}).done(function(data){
    		if(data.status === '0'){
    			var d = data.result.categoryFamilyVoList;
    			if(d.length){
    				// 将数据拼接为select数据格式
					var fData = o.categoryFamilyVoList.fData = [];
					var leafData = o.categoryFamilyVoList.leafData = [];

					fData.push({id:999,text:'全部一级分类'});
					for(var x in d){
						fData.push({id:d[x]['categoryFamily'].id, text:d[x]['categoryFamily'].familyName});

						var tt = leafData[d[x]['categoryFamily'].id+'']=[];
						tt.push({id:999,text:'全部二级分类'});
						for(var k in d[x]['categoryVoList']){
							 tt.push({id:d[x]['categoryVoList'][k]['category'].id, text:d[x]['categoryVoList'][k]['category'].name});
						}
					}
					$("#sltCategory").select2({
					    placeholder: "全部一级分类",
					    data:o.categoryFamilyVoList.fData
					}).val(999).trigger('change');

					$("#sltCategoryList").select2({
				        data:[{id:999, text:'全部二级分类'}]
				    }).val(999).trigger('change');
					self.chkCategoryEv();
					// console.log(o.categoryFamilyVoList);
    			}else{
					$("#sltCategory").select2({
					    data:[{id:999,text:'全部一级分类'}]
					}).val(999).trigger('change');

					$("#sltCategoryList").select2({
				        data:[{id:999, text:'全部二级分类'}]
				    }).val(999).trigger('change');


    				console.log('未查询到商家品类信息！');
    			}
    		}else{
    			Util.alert('未知错误，请联系客服！');
    		}
    	});
    },
    chkCategoryEv:function(){
    	var self = this;
    	$('#sltCategory').on('change',function(){
    		if($(this).val()=="999"){
    			$("#sltCategoryList").select2({
			        data:[{id:999, text:'全部二级分类'}]
			    }).val(999).trigger('change');
    		}else{
    			self.getCategoryListById($(this).val());
    		}
    	});
    },
    mulOnShelves:function(){
    	var self = this;
		$("#onShelvesBtn").on("click",function(e){
			self.o.isSingleShelves = false;
			var seld = $("#mainTable tbody").find("input[name=select]:checked");
			if(seld.length == 0){
				Util.alert("请至少选择一件商品");
				return false;
			}
			var seldProductArr=[],seldStockArr=[],noImgCount=0;
			seld.each(function(i,e){
				seldProductArr.push($(e).data("id"));
				seldStockArr.push($(e).data("stockid"));
				if($(e).closest("tr").find(".img img").length===0){
					noImgCount++;
				}
			});
			if(noImgCount>0){
				Util.alert("有"+noImgCount+"个商品没有图片，请上传图片后上架");
				return false;
			}
			var stockIdList=seldStockArr.join("_"),
				stockLength  = seldStockArr.length,
				maxStoreLength = ~~(10000/stockLength);

			window.onShelvesParams={
				stockIdList:stockIdList
			};
			var params = {
			    title:"上架微商城",
			    type:"multiple",
			    clear:true,
			    length:maxStoreLength,
			    okCallback:function(list){
			    	dialog({
		                id:"util-uploading",
		                fixed: true,
		                content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;正在操作请稍候，请勿离开页面',
		                width:300,
		                backdropOpacity:"0.5"
		            }).showModal();
			        var storeIdList = [];
			        $.each(list,function(i,e){
			        	storeIdList.push(e.id);
			        });
			        $.ajax({
	        			url:"allocateProductToStore.json",
	        			data:"stockIdList="+ window.onShelvesParams.stockIdList +"&storeIdList="+storeIdList.join("_")+"&off=0",
	        			success:function(data){
	        				if(data.status=="0"){
	        					dialog({ id:"util-uploading" }).close();
		        				Util.alert("上架成功");
		        			}
	        			}
	        		});
			    }
			};
			if(seldStockArr.length===1){
				params.resultName = 'otherStoreList';
				params.productId = seldProductArr[0];
				params.url = 'getStoreListOfProduct.json';
			}
			// console.log(stockIdList);
			$.popupStoreSelect(params);
		});
    },
    sinOnShelves:function(){
    	var self=this;
    	$("#mainTable").on("click",".onShelves",function(e){
    		e.stopPropagation();
    		var _t = $(this);
    		if(_t.closest("tr").find(".img img").length===0){
    			Util.alert("该商品没有上传图片，请上传图片后上架");
				return false;
    		}
    		window.onShelvesParams={
				stockIdList:_t.data("stockid"),
				target : _t
			};
			// console.log(stockIdList);
			$.popupStoreSelect({
			    title:"上架微商城",
			    url : 'getStoreListOfProduct.json',
			    type:"multiple",
			    length:10000,
			    productId:_t.data("id"),
			    resultName : 'otherStoreList',
			    clear:true,
			    okCallback:function(list){
			    	dialog({
		                id:"util-uploading",
		                fixed: true,
		                content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;正在操作请稍候，请勿离开页面',
		                width:300,
		                backdropOpacity:"0.5"
		            }).showModal();
			        var storeIdList = [];
			        $.each(list,function(i,e){
			        	storeIdList.push(e.id);
			        });
			        $.ajax({
	        			url:"allocateProductToStore.json",
	        			data:"stockIdList="+ window.onShelvesParams.stockIdList +"&storeIdList="+storeIdList.join("_")+"&off=0",
	        			success:function(data){
	        				if(data.status=="0"){
	        					dialog({ id:"util-uploading" }).close();
		        				Util.alert("上架成功");
		        			}
	        			}
	        		});
			    }
			});
    	});
    },
    newProduct:function(){
    	$("#addNewStock").on("click",function(){
    		dialog({
	            title:"请选择添加方式",
	            id:"util-newProduct",
	            fixed: true,
	            backdropOpacity:"0.5",
	            content: $("#addNewStockBox"),
	            okValue: '',
	            cancelValue:''
	        }).showModal();
	    });
    },
    batchTask:function(){
    	$("#batchTask").on("click",function(){
    		dialog({
	            title:"请选择批量方式",
	            id:"util-batchTask",
	            fixed: true,
	            backdropOpacity:"0.5",
	            content: $("#batchTaskBox"),
	            okValue: '',
	            cancelValue:''
	        }).showModal();
    	});
    }
};

p_storeList.init();

// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var name = $("#fuzzyProductName").val(),
		// 分类
		categoryIds = $('#sltCategoryList').val(),
		// 类型
		tags = $('#sltTags').val(),
		allocated = $('#onShelves').val(),
		brandId = $("#selectBrand").val(),
		couponDisable = $('#couponDisable').val();

		// 如果二级分类为全部，则拼接所有的二级分类id
		if(categoryIds == 999){
			var t = $('#sltCategory').val(),
				leafArr = p_storeList.o.categoryFamilyVoList.leafData[t],
				ids=[];
			if(t == 999){
				categoryIds="";
			}else{
				for(var m in leafArr){
					leafArr[m].id !=999 && ids.push(leafArr[m].id);
				}
				categoryIds = ids.join('_');
			} 
		}
	getAjaxData(0, "", "",name,brandId,tags,categoryIds,couponDisable,allocated);
});


// 回收
$("#mainTable").on("click",".saleable",function(e){
	e.stopPropagation();
	if($(this).data("dist")=="1"){
		Util.alert("本商品正在参与分销，请先停止分销后再做删除");
		return false;
	}
	var id=$(this).data("id"),tr=$(this).closest("tr");
	Util.confirm("删除后可在回收站找回，是否确认删除？",function(){
		$.getJSON("setStatus.json?productIdList="+id+"&status=1",function(data){
			if(data.status=="0"){
				tr.fadeOut(500);
			}
		});
	});
}).on("click",".editBtn",function(e){
	$(this).closest("tr").addClass("hover").siblings().removeClass("hover");
}).on("click",".cancelTags",function(e){
	e.stopPropagation();
	var _t = $(this),id = _t.data("id");
	$.getJSON("setProductTag.json?productIdList="+id+"&tags=",function(data){
		if(data.status=="0"){
			_t.siblings(".tags").remove();
			_t.remove();
		}
	});
});

// 停止分销
$("#mainTable").on("click",".stopDist",function(e){
	var _t = $(this),id=_t.data("pid");
	Util.confirm("停止分销后，所有代理商都将下架该商品，<br>是否确认停止分销？",function(){
		$.getJSON("updateProductSupplierDist.json?productIds="+id+"&dist=0",function(data){
			if(data.status=="0"){
				_t.hide();
				_t.closest("tr").find(".distring").remove();
				_t.closest("tr").find(".saleable").data("dist","0");
			}else{
				Util.alert("系统繁忙，请稍后再试");
			}
		});
	});
}).on("click",".cancelDist",function(e){
	var _t=$(this),pid=_t.data("pid"),sid=_t.data("sid");
	$.getJSON('cancelDistProduct.json?productJson=[{"productId":'+pid+',"sourceSupplierId":'+sid+'}]',function(data){
		if(data.status=="0"){
			Util.alert("取消成功");
			_t.closest("tr").remove();
		}else{
			Util.alert("系统繁忙，请稍后再试");
		}
	});
});

// 全选
$("body").on("click","#checkAll",function(){
	var checkedList = $("#mainTable tbody").find("input[name=select]");
	if(checkedList.not(":checked").length > 0){
		checkedList.prop("checked",true);
	}else{
		checkedList.prop("checked",false);
	}
});

// 批量删除
$("#disSaleable").on("click",function(e){
	var seld = $("#mainTable tbody").find("input[name=select]:checked");
	if(seld.length === 0){
		Util.alert("请至少选择一件商品");
		return false;
	}
	var seldArr=[],hasDistStock = false;
	seld.each(function(i,e){
		if($(e).data("dist")=="1"){
			hasDistStock = true;
			return false;
		}
		seldArr.push($(e).data("id"));
	});
	if(hasDistStock){
		Util.alert("分销商品不能进行删除操作");
		return false;
	}
	var productIdList=seldArr.join("_");
	$.getJSON("setStatus.json?productIdList="+productIdList+"&status=1",function(data){
		if(data.status=="0"){
			getAjaxData(0);
			Util.alert("回收成功");
		}
	});
});

// 批量设置标签
$(".setTagBtn").on("click",function(e){
	var seld = $(".table tbody").find("input[name=select]:checked"),tags = $(this).data("tags");
	if(seld.length === 0){
		Util.alert("请至少选择一件商品");
	}else{
		var seldArr=[],hasDistStock = false;
		seld.each(function(i,e){
			if($(e).data("dist")=="1"){
				hasDistStock = true;
				return false;
			}
			seldArr.push($(e).data("id"));
		});
		if(hasDistStock){
			Util.alert("分销商品不能设置标签");
			return false;
		}
		var productIdList=seldArr.join("_");
		$.ajax({
			url:"setProductTag.json",
			data:"productIdList="+productIdList+"&tags="+tags,
			success:function(data){
				if(data.status=="0"){
					Util.alert("标记成功");
					seld.each(function(i,e){
						var id = $(e).data("id");
						$(e).closest("tr").find(".msg").find(".tags, .cancelTags").remove().end().append('<span class="tags">'+tags+'</span><a href="javascript:;" class="cancelTags" data-id="'+id+'">取消标签</a>');
					});
				}
			}
		});
	}
});


// 批量提成
$("#commission").on("click",function(e){
	var seld = $(".table tbody").find("input[name=select]:checked");
	if(seld.length === 0){
		Util.alert("请至少选择一件商品");
	}else{
		var seldArr=[],hasDistStock = false;
		seld.each(function(i,e){
			if($(e).data("dist")=="1"){
				hasDistStock = true;
				return false;
			}
			seldArr.push($(e).data("id"));
		});
		if(hasDistStock){
			Util.alert("分销商品不能批量设置提成");
			return false;
		}
		var productIdList=seldArr.join("_");
		var batchCommission = dialog({
            title:"批量设置导购提成",
            id:"util-batchCommission",
            fixed: true,
            width:350,
            backdropOpacity:"0",
            content: $("#commissionBox"),
            okValue: '确定',
            cancelValue:'取消',
            ok: function(){
                var type = $('#commissionBox select').val(),
                	value = $('.commissionValSet input').val(),
                	param={
                		productIdList:productIdList,
                		commissionType:type,
                		commissionValue:value,
                		commissionRate:value
                	}
                if((type=="2" && parseFloat(value) > 70) || parseFloat(value) < 0){
                	Util.alert("提成范围0~70%");
                    return false;
                }
                $.getJSON("setCommission.json",param,function(data){
                    if(data.status=="0"){
                        Util.alert("设置成功",function(){location.reload();});
                    }
                });
                return false;
            },
            cancel:function(){
                this.close();
                return false;
            }
        });
        batchCommission.showModal();
	}
});
$("#commissionBox select").on("change",function(){
	var _t = $(this).val();
	switch (_t){
		case "1" : 
		$(".commissionValSet").empty();
		break;
		case "2" : 
		$(".commissionValSet").html('<input type="text" class="min" /> %');
		break;
		case "3" : 
		$(".commissionValSet").html('<input type="text" class="min" />');
		break;
	}
});


