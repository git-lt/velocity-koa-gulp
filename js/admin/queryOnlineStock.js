document.title="商品管理";
$.createSecondMenu("product_manage","微商城");
Util.createHelpTip("商品相关问题",[
	{"title":"添加商品","link":"https://qiakr.kf5.com/posts/view/39380/"},
	{"title":"添加品牌/添加分类","link":"#"},
	{"title":"商品批量导入","link":"https://qiakr.kf5.com/posts/view/39381/"},
	{"title":"商品批量改价改库存","link":"https://qiakr.kf5.com/posts/view/39379/"},
	{"title":"上架商品到微商城","link":"https://qiakr.kf5.com/posts/view/39393/"},
	{"title":"门店自建商品","link":"https://qiakr.kf5.com/posts/view/39378/"},
	{"title":"导购提成设置","link":"#"},
]);
$(".select2").select2();
$(".select2s").select2({
	minimumResultsForSearch: -1
});
getAjaxData(0);

function getAjaxData(idx,name,storeId,brandId,tags,categoryFamilyIds,categoryIds, orderName, orderType){
	$("#mainTable tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	$(".checkAll").prop("checked",false);
	var options={
		status:0,
		fuzzyName:name,
		brandId:brandId,
		index:idx,
		length:Util.listLength,
		tags:tags,
		categoryFamilyIds:categoryFamilyIds,
		categoryIds:categoryIds,
		orderName:orderName || 'status_time',
		orderType:orderType || 'desc',
		storeId:storeId
	};
	jQuery.ajax({
		url:"queryAllocatedSupplierStock.json",
		data:options,
		success:function(data){
			if(data.status!="0"){
				Util.alert(data.errmsg || "系统繁忙，请稍后再试");
			}
			var tempData={
				list:data.result.stockVoList
			}
			var dataHtml = template('tempData', tempData);
			$("#mainTable tbody").empty().append(dataHtml);
			$(".filterTitle a.current .count").html('('+data.result.count+')');
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getAjaxData(_i,name,storeId,brandId,tags,categoryFamilyIds,categoryIds, orderName, orderType);
			});
			$('#mainTable thead').off().on('click','.sort-btn',function(){
				var $this=$(this),state,sortName;
		    	state = $this.data('state');
		    	sortName = $this.data('name');
		    	state = state=='desc' ? 'asc' : 'desc';
				$this.data('state',state);
		    	getAjaxData(0,name,storeId,brandId,tags,categoryFamilyIds,categoryIds, sortName, state)
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
		allocateBox:null
	},
	init:function(){
		// this.getBrandList();
		this.querySupplierCategoryList();
		this.mulOnShelves(); // 批量上架
		this.sinOnShelves(); // 单独上架
	},
    getBrandList:function(){
    	var o = this.o;
        $.ajax({
            url:'getAllBrandList.json'
        }).done(function(data){
        	if(data.status === '0'){
        		var tArr = [], tData = data.result.brandList;
    		    tArr.push({id:'', text:'所有品牌'});
    		    for(i in tData){
    		        tArr.push({id:tData[i].id, text:tData[i].brandName});
    		    }
    		    o.brandListData = tArr;
        	}
        });
    },
    getCategoryListById:function(cId){
    	var o = this.o;
    	$("#sltCategoryList").select2({
	        placeholder: "选择二级分类",
	        data:o.categoryFamilyVoList.leafData[cId]
	    }).val('').trigger('change');
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

					fData.push({id:'',text:'全部一级分类'});
					for(var x in d){
						fData.push({id:d[x]['categoryFamily'].id, text:d[x]['categoryFamily'].familyName});

						var tt = leafData[d[x]['categoryFamily'].id+'']=[];
						tt.push({id:'',text:'全部二级分类'});
						for(var k in d[x]['categoryVoList']){
							 tt.push({id:d[x]['categoryVoList'][k]['category'].id, text:d[x]['categoryVoList'][k]['category'].name});
						}
					}
					$("#sltCategory").select2({
					    placeholder: "全部一级分类",
					    data:o.categoryFamilyVoList.fData
					}).val('').trigger('change');

					$("#sltCategoryList").select2({
				        data:[{id:'', text:'全部二级分类'}]
				    }).val('').trigger('change');
					self.chkCategoryEv();
					// console.log(o.categoryFamilyVoList);
    			}else{
					$("#sltCategory").select2({
					    data:[{id:'',text:'全部一级分类'}]
					}).val('').trigger('change');

					$("#sltCategoryList").select2({
				        data:[{id:'', text:'全部二级分类'}]
				    }).val('').trigger('change');
    				console.log('未查询到商家品类信息！');
    			}
    		}else{
    			$("#sltCategory, #sltCategoryList").hide();
    			console.log('获取商品分类信息出错');
    		}
    	});
    },
    initBrand2Dialog:function(){
    	var tArr = this.o.brandListData;
    	$("#sltBrands").select2({
    	    placeholder: "选择品牌",
    	    allowClear: true,
    	    data:tArr
    	}).val('').trigger('change');
    },
    chkCategoryEv:function(){
    	var self = this;
    	$('#sltCategory').on('change',function(){
    		self.getCategoryListById($(this).val());
    	});
    },
    mulOnShelves:function(){
    	var self = this;
		$("#onShelvesBtn").on("click",function(e){
			var seld = $("#mainTable tbody").find("input[name=select]:checked");
			if(seld.length == 0){
				Util.alert("请至少选择一件商品");
				return false;
			}
			var seldProductArr=[],seldStockArr=[],noImgCount=0;
			seld.each(function(i,e){
				seldProductArr.push($(e).data("id"));
				seldStockArr.push($(e).data("stockid"));
			});
			var stockIdList=seldStockArr.join("_"),
				stockLength  = seldStockArr.length,
				maxStoreLength = ~~(10000/stockLength);
			// console.log(stockIdList);
			window.onShelvesParams={
				stockIdList:stockIdList
			};
			var params = {
			    title:"从微商城下架",
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
	        			data:"stockIdList="+ window.onShelvesParams.stockIdList +"&storeIdList="+storeIdList.join("_")+"&off=1",
	        			timeout:30000,
	        			success:function(data){
	        				if(data.status=="0"){
	        					dialog({ id:"util-uploading" }).close();
		        				Util.alert("下架成功");
		        				getAjaxData(0);
		        			}
	        			}
	        		});
			    }
			}
			if(seldStockArr.length==1){
				params.resultName = 'allocatedStoreList';
				params.productId = seldProductArr[0];
				params.url = 'getStoreListOfProduct.json';
			}
			// console.log(stockIdList);
			$.popupStoreSelect(params);
		});
    },
    sinOnShelves:function(){
    	var self=this;
    	$("#mainTable").on("click",".saleable",function(e){
    		e.preventDefault();
    		var _t = $(this);
    		window.onShelvesParams={
				stockIdList:_t.data("stockid"),
				target : _t
			};
			// console.log(stockIdList);
			$.popupStoreSelect({
			    title:"从微商城下架",
			    url : 'getStoreListOfProduct.json',
			    productId:_t.data("id"),
			    resultName : 'allocatedStoreList',
			    clear:true,
			    type:"multiple",
			    length:10000,
			    okCallback:function(list){
			    	dialog({
		                id:"util-uploading",
		                fixed: true,
		                content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;正在操作请稍候，请勿离开页面',
		                width:300,
		                backdropOpacity:"0.5"
		            }).showModal();
			        console.log(list);
			        var storeIdList = [];
			        $.each(list,function(i,e){
			        	storeIdList.push(e.id);
			        });
			        $.ajax({
	        			url:"allocateProductToStore.json",
	        			data:"stockIdList="+ window.onShelvesParams.stockIdList +"&storeIdList="+storeIdList.join("_")+"&off=1",
	        			timeout:30000,
	        			success:function(data){
	        				if(data.status=="0"){
	        					dialog({ id:"util-uploading" }).close();
		        				Util.alert("下架成功");
		        				getAjaxData(0);
		        			}
	        			}
	        		});
			    }
			});
    	})
    }
};

p_storeList.init();

// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var name = $("#fuzzyProductName").val(),
		categoryIds = $('#sltCategoryList').val(),
		categoryFamilyIds="",
		brandId = $("#selectBrand").val(),
		storeId = $("#sltStore").val(),
		tags = $("#sltTags").val();

		// 如果二级分类为全部，则拼接所有的二级分类id
		if(!categoryIds){
			categoryFamilyIds = $("#sltCategory").val();
			categoryIds="";
		}
	getAjaxData(0,name,storeId,brandId,tags,categoryFamilyIds,categoryIds);
});

// 全选
$(document).on("click",".checkAll",function(){
	if($(this).prop("checked")){
		$("#mainTable tbody").find("input[name=select]").prop("checked",true);
	}else{
		$("#mainTable tbody").find("input[name=select]").prop("checked",false);
	}
});

// 获取链接
$("#mainTable").on("click",".getlink",function(e){
	var $this = $(this),
		$chkBox=$this.parents('tr').find(':checkbox'),
		stockId = $chkBox.data('stockid'),
		proId = $chkBox.data('id'),
		suid = $this.data('suid'),
		shareLink = 'http://'+window.location.host+'/mall/shareStockInfoForCustomer.htm?supplierStockId='+stockId+'&suid='+suid;
	$('#ipt_txtLink').val(shareLink);

	$('#rqCode').empty();
	var qrcode = new QRCode(document.getElementById("rqCode"), {
         width: 180,
         height: 180
    });
    qrcode.makeCode(shareLink);
	dialog({
		title:'获取链接',
		content:$('#diaGetLink')[0],
		okValue:'确定',
		ok:function(){this.close();$('#clip_button').val('复制链接'); return false;},
		onclose: function () { $('#clip_button').val('复制链接'); return true;}
	}).show();
});

// 复制 事件
$(function(){
	// 鼠标点击时，全选
	$('#ipt_txtLink').on('click', function(){
		this.setSelectionRange(0, $(this).val().length);
	});
	$('#diaGetLink').show();
	$("#clip_button").zclip({
	    path: "//res.qiakr.com/plugins/zclip/zclip.swf",
	    copy: function(){
	    	return $('#ipt_txtLink').val();
	    },
	    setCSSEffects:false,
	    beforeCopy:function(){
			$(this).css('background','#449d44');
		},
	    afterCopy:function(){/* 复制成功后的操作 */
	    	$(this).val('复制成功');
	    	var $copysuc = $("<div class='copy-tips'><div class='copy-tips-wrap'>复制成功</div></div>");
			$("body").find(".copy-tips").remove().end().append($copysuc);
			$(".copy-tips").fadeOut(3000);
	    }
	});
	$('#diaGetLink').hide();

});

// 批量设置标签
$(".setTagBtn").on("click",function(e){
	var seld = $(".table tbody").find("input[name=select]:checked"),tags = $(this).data("tags");
	if(seld.length == 0){
		Util.alert("请至少选择一件商品")
	}else{
		var seldArr=[];
		seld.each(function(i,e){
			seldArr.push($(e).data("id"));
		});
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

// 单独取消标签
$("#mainTable").on("click",".cancelTags",function(e){
	e.stopPropagation();
	var _t = $(this),id = _t.data("id");
	$.getJSON("setProductTag.json?productIdList="+id+"&tags=",function(data){
		if(data.status=="0"){
			_t.siblings(".tags").remove();
			_t.remove();
		}
	});
});

