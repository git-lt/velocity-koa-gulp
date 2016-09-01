document.title="商品管理-分销商品";
$.createSecondMenu("product_manage","分销商品(分销商)");
Util.createHelpTip("商品相关问题",[
	{"title":"添加商品","link":"https://qiakr.kf5.com/posts/view/39380/"},
	{"title":"添加品牌/添加分类","link":"#"},
	{"title":"商品批量导入","link":"https://qiakr.kf5.com/posts/view/39381/"},
	{"title":"商品批量改价改库存","link":"https://qiakr.kf5.com/posts/view/39379/"},
	{"title":"上架商品到微商城","link":"https://qiakr.kf5.com/posts/view/39393/"},
	{"title":"门店自建商品","link":"https://qiakr.kf5.com/posts/view/39378/"},
	{"title":"导购提成设置","link":"#"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);
$(".select2").select2();
$(".select2s").select2({
	minimumResultsForSearch: -1
});

getAjaxData(0);
function getAjaxData(idx, sortField, sortType,name,brandId,familyCategoryId,categoryId){
	$("#mainTable tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	$(".checkAll").prop("checked",false);
	var options={
		fuzzyName:name,
		brandId:brandId,
		index:idx,
		length:Util.listLength,
		familyCategoryId:familyCategoryId,
		categoryId:categoryId,
		sortField:sortField || 'gmt_create',
		sortType:sortType || 'desc'
	};
	jQuery.ajax({
		url:"getDistProductListByDistributor.json",
		data:options,
		success:function(data){
			if(data.status != "0"){
				Util.alert("系统繁忙，请稍后再试");
				return false;
			}
			var dataHtml="";
			if(data.result.distStockVoList.length==0){
				dataHtml = '<tr><td class="tc" colspan="100">分销商品列表为空</td></tr>'
			}else{
				tempData={
					list:data.result.distStockVoList
				}
				dataHtml = template('tempData', tempData);
			}

			$("#mainTable tbody").empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getAjaxData(_i, sortField, sortType,name,brandId,familyCategoryId,categoryId);
			});
			$('#mainTable thead').off().on('click','.sort-btn',function(){
				var $this=$(this),state,sortName;
		    	state = $this.data('state');
		    	sortName = $this.data('name');
		    	state = state=='desc' ? 'asc' : 'desc';
				$this.data('state',state);
		    	getAjaxData(0, sortName, state,name,brandId,familyCategoryId,categoryId);
		    	$('#mainTable thead .sort-btn').find(".iconfont").removeClass("active");
		    	$this.find('.'+state).addClass('active').siblings().removeClass('active');
			});
			$("#mainTable").setTheadFixed({
				leaveTop: 134,
				fixedFn:function(){
					$(".tableAction").css({"position":"fixed","top":"60px"});
					$("#mainTable").css("margin-top","134px");
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
			})
		}
	});
}

var p_storeList = {
	o:{
		categoryFamilyVoList:{},
		copyDialog:dialog({
            id:"util-copping",
            fixed: true,
            content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;商品正在复制中，请勿离开页面',
            width:300,
            backdropOpacity:"0"
        }),
        distDialog:dialog({
        	id:"util-disting",
            fixed: true,
            content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;商品正在加入分销，请勿离开页面',
            width:300,
            backdropOpacity:"0"
        }),
        cancelDistDialog:dialog({
        	id:"util-cancelDist",
            fixed: true,
            content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;商品正在取消分销，请勿离开页面',
            width:300,
            backdropOpacity:"0"
        })
	},
	init:function(){
		this.querySupplierCategoryList();
		this.distribution(); //分销
		this.copyProduct(); //复制
	},
	getDuplicateMsg:function(data){
		var errHtml = '<div class="duplicateTip">商品信息复制到总库后，默认库存信息均为0，您可以前往总库编辑该商品实际的库存情况。</div>';
		var count = data.result.count;
		if(data.result.resultList && data.result.resultList.length > 0){
			var length = data.result.resultList.length
			errHtml += '<div style="padding:10px 0;">'+(count-length)+'个商品复制成功,'+length+'个商品复制失败</div><div class="duplicateErrList">';
			$.each(data.result.resultList,function(i,e){
				var errmsg="";
				switch(e.reason){
					case "productCode dupe":
					errmsg = "商品货号已存在";
					break;
					case "shapeCode dupe":
					errmsg = "款号条形码已存在";
					break;
					case "not exist":
					errmsg = "商品不存在";
					break;
					default:
					errmsg = "系统错误";
				}
				if(e.reason == "shapeCode dupe"){
					$.each(e.dupeShapeCodeSet,function(t,j){
						errHtml += '<div class="ovh pt5"><span class="fn-left">'+e.productName+'</span><span class="fn-right">款号('+j+')已存在</span></div>';
					})
				}else{
					errHtml += '<div class="ovh pt5"><span class="fn-left">'+e.productName+'</span><span class="fn-right">'+errmsg+'</span></div>';
				}
			});
			errHtml += '</div>';
		}else{
			errHtml += '<div style="padding:10px 0;">'+count+'个商品复制成功,0个商品复制失败</div>';
		}
		dialog({
            title:"系统提示",
            id:"util-alert",
            fixed: true,
            content: errHtml,
            width:500,
            cancel: false,
            okValue: '确定',
            backdropOpacity:"0.5",
            ok: function () {}
        }).showModal();
	},
	distribution:function(){
		var o = this.o;
		$("#mainTable").on("click",".choose",function(e){
			var _t=$(this),pid=_t.data("pid"),sid=_t.data("sid");
			$.getJSON('chooseDistProduct.json?productJson=[{"productId":'+pid+',"sourceSupplierId":'+sid+'}]',function(data){
				if(data.status=="0"){
					Util.alert("分销成功")
					_t.removeClass("choose").addClass("cancel").text("取消分销");
				}else{
					Util.alert("系统繁忙，请稍后再试");
				}
			});
		}).on("click",".cancel",function(e){
			var _t=$(this),pid=_t.data("pid"),sid=_t.data("sid");
			$.getJSON('cancelDistProduct.json?productJson=[{"productId":'+pid+',"sourceSupplierId":'+sid+'}]',function(data){
				if(data.status=="0"){
					Util.alert("已取消分销")
					_t.removeClass("cancel").addClass("choose").text("加入分销");
				}else{
					Util.alert("系统繁忙，请稍后再试");
				}
			});
		});

		// 批量
		$("#addDistribution, #delDistribution, #copyDistribution").on("click",function(e){
			var seld = $("#mainTable tbody").find("input[name=select]:checked"),onLine = false;
			if(seld.length == 0){
				Util.alert("请至少选择一件商品");
				return false;
			}
			var seldArr=[];
			seld.each(function(i,e){
				seldArr.push({
					productId:$(e).data("pid"),
					sourceSupplierId:$(e).data("sid")
				});
			});
			var productJson=JSON.stringify(seldArr);
			if(this.id=="addDistribution"){
				o.distDialog.showModal();
				$.getJSON("chooseDistProduct.json?productJson="+productJson,function(data){
					o.distDialog.close();
					if(data.status=="0"){
						Util.alert("加入分销成功");
						seld.closest("tr").find(".choose").removeClass("choose").addClass("cancel").text("取消分销");
					}else{
						Util.alert("系统繁忙，请稍后再试");
					}
				});
			}else if(this.id=="delDistribution"){
				o.cancelDistDialog.showModal();
				$.getJSON("cancelDistProduct.json?productJson="+productJson,function(data){
					o.cancelDistDialog.close();
					if(data.status=="0"){
						Util.alert("取消分销成功");
						seld.closest("tr").find(".cancel").removeClass("cancel").addClass("choose").text("加入分销");
					}else{
						Util.alert("系统繁忙，请稍后再试");
					}
				});
			}else{
				o.copyDialog.showModal();
				$.getJSON("duplicateDistProduct.json?productJson="+productJson,function(data){
					o.copyDialog.close();
					if(data.status=="0"){
						p_storeList.getDuplicateMsg(data);
						// seld.closest("tr").find(".copy").removeClass("copy").addClass("copyed").text("已复制商品信息");
					}else{
						Util.alert("系统繁忙，请稍后再试");
					}
				});
			}
		});
	},
	copyProduct:function(){
		var o = this.o;
		$("#mainTable").on("click",".copy",function(e){
			var _t=$(this),pid=_t.data("pid"),sid=_t.data("sid");
			o.copyDialog.showModal();
			$.getJSON("duplicateDistProduct.json?productJson=[{'productId':"+pid+",'sourceSupplierId':"+sid+"}]",function(data){
				o.copyDialog.close();
				if(data.status=="0"){
					p_storeList.getDuplicateMsg(data);
					// _t.removeClass("copy").addClass("copyed").text("已复制商品信息");
				}else{
					Util.alert("系统繁忙，请稍后再试");
				}
			});
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
    }
};

p_storeList.init();

// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var name = $("#fuzzyProductName").val(),
		// 分类
		familyCategoryId = $('#sltCategory').val() == 999 ? "" : $('#sltCategory').val(),
		categoryId = $('#sltCategoryList').val() == 999 ? "" : $('#sltCategoryList').val(),
		// 类型
		brandId = $("#selectBrand").val();
	getAjaxData(0, "", "",name,brandId,familyCategoryId,categoryId);
});

// 全选
$("body").on("click",".checkAll",function(){
	if($(this).prop("checked")){
		$("#mainTable tbody").find("input[name=select]").prop("checked",true);
	}else{
		$("#mainTable tbody").find("input[name=select]").prop("checked",false);
	}
});
