document.title="回收站";
$.createSecondMenu("product_manage","回收站");
Util.createHelpTip("商品相关问题",[
	{"title":"添加商品","link":"https://qiakr.kf5.com/posts/view/39380/"},
	{"title":"添加品牌/添加分类","link":"#"},
	{"title":"商品批量导入","link":"https://qiakr.kf5.com/posts/view/39381/"},
	{"title":"商品批量改价改库存","link":"https://qiakr.kf5.com/posts/view/39379/"},
	{"title":"上架商品到微商城","link":"https://qiakr.kf5.com/posts/view/39393/"},
	{"title":"门店自建商品","link":"https://qiakr.kf5.com/posts/view/39378/"},
	{"title":"导购提成设置","link":"#"},
]);

getAjaxData("",0);

function getAjaxData(name,idx){
	$("#mainTable tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	$("#checkAll").prop("checked",false);
	var options={
		status:"1",
		sourceType:"0",
		fuzzyName:name,
		supplyTypeList:"1",
		index:idx,
		length:Util.listLength
	};
	jQuery.ajax({
		url:"querySupplierStock.json",
		data:options,
		success:function(data){
			if(data.status!="0"){
				Util.alert(data.errmsg || "系统繁忙，请稍后再试");
			}
			var tempData={
				list:data.result.stockVoList,
				status:"1"
			}
			var dataHtml = template('tempData', tempData);
			$("#mainTable tbody").empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$("nav .pagination"),function(_i){
				getAjaxData(name,_i);
			});
			$("#mainTable").setTheadFixed({
				leaveTop: 134,
				fixedFn:function(){
					$(".tableAction").css({"position":"fixed","top":"60px"});
					$("#mainTable").css("margin-top","75px");
				},
				unfixedFn:function(){
					$(".tableAction").css({"position":"static","top":"0"});
					$("#mainTable").css("margin-top","0");
				}
			});
		}
	});
}


// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	var name = $("#fuzzyProductName").val();
	getAjaxData(name,0);
});

// 全选
$(document).on("click",".checkAll",function(){
	if($(this).prop("checked")){
		$("#mainTable tbody").find("input[name=select]").prop("checked",true);
	}else{
		$("#mainTable tbody").find("input[name=select]").prop("checked",false);
	}
});

// 批量移入总库
$("#saleable").on("click",function(e){
	var seld = $("#mainTable tbody").find("input[name=select]:checked"),onLine = true;
	if(seld.length == 0){
		Util.alert("请至少选择一件商品");
	}else{
		var seldArr=[];
		seld.each(function(i,e){
			seldArr.push($(e).data("id"));
		});
		var productIdList=seldArr.join("_");
		$.getJSON("setStatus.json?productIdList="+productIdList+"&status=0",function(data){
			if(data.status=="0"){
				getAjaxData("",0);
				Util.alert("还原成功");
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		});
	}
});

// 批量彻底删除
$("#deleteBatch").on("click",function(e){
	var seld = $("#mainTable tbody").find("input[name=select]:checked"),onLine = true;
	if(seld.length == 0){
		Util.alert("请至少选择一件商品");
	}else{
		Util.confirm("<p>注意！彻底删除后，商品将无法还原，</p><p>请确认是否继续操作</p>",function(){
			var seldArr=[];
			seld.each(function(i,e){
				seldArr.push($(e).data("id"));
			});
			var productIdList=seldArr.join("_");
			$.getJSON("deleteSupplierStock.json?productIdList="+productIdList,function(data){
				if(data.status=="0"){
					getAjaxData("",0);
					Util.alert("删除成功");
				}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
			});
		});
	}
});

// 还原
$("#mainTable").on("click",".restore",function(e){
	var id=$(this).data("id"),tr=$(this).closest("tr");
	Util.confirm("是否还原回总库？",function(){
		$.getJSON("setStatus.json?productIdList="+id+"&status=0",function(data){
			if(data.status=="0"){
				tr.fadeOut(500);
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		});
	});
}).on("click",".delete",function(e){
	var id=$(this).data("id"),tr=$(this).closest("tr");
	Util.confirm("<p>注意！彻底删除后，商品将无法还原，</p><p>请确认是否继续操作</p>",function(){
		$.getJSON("deleteSupplierStock.json?productIdList="+id,function(data){
			if(data.status=="0"){
				tr.fadeOut(500);
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		});
	});
});


