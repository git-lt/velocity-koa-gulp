$.createSecondMenu("product_manage","门店自建");
Util.createHelpTip("商品相关问题",[
	{"title":"添加商品","link":"https://qiakr.kf5.com/posts/view/39380/"},
	{"title":"添加品牌/添加分类","link":"#"},
	{"title":"商品批量导入","link":"https://qiakr.kf5.com/posts/view/39381/"},
	{"title":"商品批量改价改库存","link":"https://qiakr.kf5.com/posts/view/39379/"},
	{"title":"上架商品到微商城","link":"https://qiakr.kf5.com/posts/view/39393/"},
	{"title":"门店自建商品","link":"https://qiakr.kf5.com/posts/view/39378/"},
	{"title":"导购提成设置","link":"#"},
]);
var queryFromStoreStock = {
	o:{
		categoryId:""
	},
	init:function(){
		document.title="门店自建商品";
		$(".select2").select2();
		this.getAjaxData(0); //获取列表数据
		this.listFilter(); // 筛选
		this.copyToSupplier(); //复制
		this.initSelectCategory(); // 初始化分类
		this.initCommissionSelect(); // 提成设置
		this.deleteStock(); //删除商品
		$(".storeStock-tip .close").click(function(){
			$(this).closest(".row").fadeOut();
		})
	},
	getAjaxData:function(idx,name, orderName, orderType,storeId){
		$("#mainTable tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
		var options={
			status:"0",
			fuzzyName:name,
			index:idx,
			length:Util.listLength,
			supplyTypeList:"2",
			orderName:orderName || 'status_time',
			orderType:orderType || 'desc',
			supplyStoreId:storeId
		};
		jQuery.ajax({
			url:"querySupplierStock.json",
			data:options,
			success:function(data){
				var tempData={
					list:data.result.stockVoList
				}
				var dataHtml = '';
				if(data.result.stockVoList.length==0){
					dataHtml='<tr><td colspan="99" class="tc" style="padding:50px 0;">暂无商品<a href="https://qiakr.kf5.com/posts/view/39378/">[查看门店自建商品说明]</a></td></tr>';
				}else{
					dataHtml = template('tempData', tempData);
				}
				$("#mainTable tbody").empty().append(dataHtml);
				Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
					queryFromStoreStock.getAjaxData(_i,name, orderName, orderType,storeId);
				});
				$("#mainTable").setTheadFixed();
			}
		});
	},
	listFilter:function(){
		$("#listFilter").on("click",function(e){
			e.preventDefault();
			var name = $("#fuzzyProductName").val(),storeId = $("#sltStore").val();
			queryFromStoreStock.getAjaxData(0,name,"","",storeId);
		});
	},
	copyToSupplier:function(){
		var o = this.o;
		$("#mainTable").on("click",".copyToSupplier",function(){
			var name=$(this).closest("tr").find("a.name").text(),store=$(this).closest("tr").find(".store").text();
			var info = $(this).data("info");
			o.categoryId = info.categoryId;
			dialog({
		        title:"转移商品到总库 - 信息补全",
		        id:"util-copy",
		        fixed: true,
		        content: $("#copyTemp"),
		        width:500,
		        cancelValue:'取消',
		        okValue:'确认',
		        backdropOpacity:"0",
		        ok: function () {
		            var createParam = $("#copyToSupplierFrom").serializeObject();
		            createParam.tagPrice = parseFloat(createParam.tagPrice);
		            if(!createParam.categoryId){
		            	Util.alert("请选择商品分类");
		            	return false;
		            }
		            if(!createParam.tagPrice){
		            	Util.alert("请填写商品原价");
		            	return false;
		            }
		            if(createParam.commissionType != "1"){
		            	if(!createParam.commissionRate && !createParam.commissionValue){
		            		Util.alert("请填写导购提成");
		            		return false;
		            	}
		            }
		            $.ajax({
		            	url:"copyToSupplierStock.json",
		            	data:createParam,
		            	success:function(data){
		            		if(data.status=="0"){
		            			Util.alert("转移成功");
		            			queryFromStoreStock.getAjaxData(0);
		            		}else{
		            			Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
		            		}
		            	}
		            })
		        }
		    }).showModal();
			$.getJSON("getCategoryById.json?categoryId="+info.categoryId,function(data){
				$("#selectFirstCategory").val(data.result.categoryFamily.id).trigger("change");
			});
		    $("#copyTemp .productId").val(info.id);
		    $("#selectBrand").val(info.brandId).trigger("change");
		    $("#copyTemp input[name=productCode]").val(info.code);
		    $("#copyTemp input[name=tagPrice]").val(info.tagPrice);
		    $("#copyTemp select[name=limitDelivery]").val(info.delivery);
		    $("#copyTemp .storeName").html(store);
		    $("#copyTemp .stockName").html(name);
		});
	},
	deleteStock:function(){
		$("#mainTable").on("click",".saleable",function(e){
			var id=$(this).data("id"),tr=$(this).closest("tr");
			Util.confirm("门店自建的商品删除后<span class='fn-red'>不可找回</span>，是否确认删除？",function(){
				$.getJSON("deleteStoreStock.json?productIdList="+id,function(data){
					if(data.status=="0"){
						tr.fadeOut(500);
					}
				});
			});
		})
	},
	initSelectCategory:function(){
		var o = this.o;
		$('#selectFirstCategory').select2({
		    placeholder:"选择一级分类"
		}).change(function(){
		    var id=$(this).val();
		    $.getJSON("getCategoryListByFamilyId.json?familyId="+id,function(data){
		        var list = data.result.categoryList,listStr='<option value=""></option>';
		        $.each(list,function(i,e){
		            listStr += '<option value="'+e.id+'">'+e.name+'</option>'
		        });
		        $('#selectSecondCategory').empty().append(listStr).select2({placeholder:"选择二级分类"}).val(o.categoryId).trigger("change");
		    });
		});
	},
	initCommissionSelect:function(){
		$("#commissionSelect").on("change",function(){
		    var _t = $(this).val();
		    switch (_t){
		        case "1" : 
		        $(".commissionValSet").empty();
		        break;
		        case "2" : 
		        $(".commissionValSet").html('<input name="commissionRate" type="text" class="min" /> %');
		        break;
		        case "3" : 
		        $(".commissionValSet").html('<input name="commissionValue" type="text" class="min" />');
		        break;
		    }
		});
	}
}
queryFromStoreStock.init();







