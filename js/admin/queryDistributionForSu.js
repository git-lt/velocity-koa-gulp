document.title="商品管理-分销商品";
$.createSecondMenu("product_manage","分销商品(供应商)");
Util.createHelpTip("商品相关问题",[
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);
$(".select2").select2();
var chkProDia = MOD_SelectProsDia.init({
	dist:0
});

getAjaxData(0);
function getAjaxData(idx, sortField, sortType, name, brandId, familyCategoryId, categoryId){
	$("#mainTable tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	$(".checkAll").prop("checked",false);
	var options={
		fuzzyName:name,
		brandId:brandId,
		index:idx,
		length:Util.listLength,
		familyCategoryId:familyCategoryId,
		categoryId:categoryId,
		sortField:sortField || 'st.gmt_create',
		sortType:sortType || 'desc'
	};
	jQuery.ajax({
		url:"getDistStockVoListBySupplier.json",
		data:options,
		success:function(data){
			if(data.status != "0"){
				Util.alert("系统繁忙，请稍后再试");
				return false;
			}
			var dataHtml="";
			if(data.result.stockVoList.length==0){
				dataHtml = '<tr><td class="tc" colspan="100">分销商品列表为空</td></tr>'
			}else{
				tempData={
					list:data.result.stockVoList,
					status:0
				}
				dataHtml = template('tempData', tempData);
			}

			$("#mainTable tbody").empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$("#distributionList nav .pagination"),function(_i){
				getAjaxData(_i, sortField, sortType, name, brandId, familyCategoryId, categoryId);
			});
			$('#mainTable thead').off().on('click','.sort-btn',function(){
				var $this=$(this),state,sortName;
		    	state = $this.data('state');
		    	sortName = $this.data('name');
		    	state = state=='desc' ? 'asc' : 'desc';
				$this.data('state',state);
		    	getAjaxData(0, sortName, state, name, brandId, familyCategoryId, categoryId);
		    	$('#mainTable thead .sort-btn').find(".iconfont").removeClass("active");
		    	$this.find('.'+state).addClass('active').siblings().removeClass('active');
			});
			$("#mainTable").setTheadFixed({
				leaveTop: 74,
				fixedFn:function(){
					$(".tableAction").css({"position":"fixed","top":"0"});
					$("#mainTable").css("margin-top","74px");
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
		this.querySupplierCategoryList();
		this.changePage();
		this.addProEv();
	},
	changePage:function(){
		$(".filterTitle a").on("click",function(){
			var _t = $(this);
			if(_t.hasClass("current")) return false;
			_t.addClass("current").siblings().removeClass("current");
			if(_t.data("type")=="1"){
				$("#distributionList").hide();
				$("#disSupplierList").show();
				$(".filterTitle .tips").show();
				if($("#disSupplierList tbody tr").length < 1){
					$.getJSON("getDistSupplierList.json",function(data){
						if(data.status!="0"){
							Util.alert("系统繁忙，请稍后再试");
							return false;
						}
						var dataHtml="";
						if(data.result.distSupplierList.length==0){
							dataHtml = '<tr><td class="tc" colspan="100">分销商列表为空</td></tr>'
						}else{
							tempData={
								list:data.result.distSupplierList,
								status:0
							}
							dataHtml = template('distTempData', tempData);
						}
						$("#supplierTable tbody").empty().append(dataHtml);
					});
				}
			}else{
				$("#distributionList").show();
				$("#disSupplierList").hide();
				$(".filterTitle .tips").hide();
			}
		});
	},
	addProEv:function(){
		var self = this, o = this.o;
		$('#addNewStock').on('click',function(){
			chkProDia.show(function(res){
				var seled = $.grep(res,function(e,i){return e!=undefined}),productIdList=[];
				$.each(seled,function(i,e){
					productIdList.push(e.id);
				});
				var params={
					productIds:productIdList.join("_"),
					dist:'1'
				}
				$.getJSON("updateProductSupplierDist.json",params,function(data){
					Util.alert("加入分销成功");
					getAjaxData(0);
				});
				
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
    querySupplierCategoryList:function(){ 	/*获取分类信息*/
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
    			}
    		}else{
    			Util.alert('系统繁忙，请稍后再试');
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


// 停止分销
$("#mainTable").on("click",".stopDist",function(e){
	e.stopPropagation();
	var id=$(this).data("pid"),tr=$(this).closest("tr");
	Util.confirm("停止分销后，所有代理商都将下架该商品，<br>是否确认停止分销？",function(){
		$.getJSON("updateProductSupplierDist.json?productIds="+id+"&dist=0",function(data){
			if(data.status=="0"){
				tr.fadeOut(500);
			}
		});
	});
});

// 批量停止分销
$("#stopDistribution").on("click",function(e){
	var seld = $("#mainTable tbody").find("input[name=select]:checked"),onLine = false;
	if(seld.length == 0){
		Util.alert("请至少选择一件商品");
	}else{
		var seldArr=[];
		seld.each(function(i,e){
			seldArr.push($(e).data("pid"));
		});
		var productIdList=seldArr.join("_");
		Util.confirm("停止分销后，所有代理商都将下架这些商品，<br>是否确认停止分销？",function(){
			$.getJSON("updateProductSupplierDist.json?productIds="+productIdList+"&dist=0",function(data){
				if(data.status=="0"){
					getAjaxData(0);
					Util.alert("停止分销成功");
				}
			});
		});
	}
});


// 全选
$("body").on("click",".checkAll",function(){
	if($(this).prop("checked")){
		$("#mainTable tbody").find("input[name=select]").prop("checked",true);
	}else{
		$("#mainTable tbody").find("input[name=select]").prop("checked",false);
	}
});
