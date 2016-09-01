document.title="门店管理";
$.createSecondMenu("store_manage","门店管理");
Util.createHelpTip("门店相关问题",[
	{"title":"添加门店","link":"https://qiakr.kf5.com/posts/view/39475/"},
	{"title":"添加导购","link":"https://qiakr.kf5.com/posts/view/39474/"},
	{"title":"批量下载导购二维码","link":"https://qiakr.kf5.com/posts/view/39780/"},
	{"title":"导购转店或离职","link":"https://qiakr.kf5.com/posts/view/39473/"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);

getAjaxData(0,"","","",0);
function getAjaxData(status,startTime,endTime,name,idx){
	$('#storeTabs a').addClass("pen");
	$(".dataTable").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
	$(".checkAll").prop("checked",false);
	var province= $("#loc_province").select2('data').text;
	var city= $("#loc_city").select2('data').text;
	var district= $("#loc_town").select2('data').text;

	province = province =='省份'?'':province;
	city = city=='地级市'?'':city;
	district = district== '市、县、区'?'':district;

	var options={
		startTime:startTime,
		endTime:endTime,
		open:status,
		index:idx,
		keywords:name,
		length:Util.listLength,
		province:province,
		city: city,
		district: district,
		storeType:$("#typeAllStore").val()
	};
	jQuery.ajax({
		url:"getStoreListOfSupplier.json",
		data:options,
		success:function(data){
			$('#storeTabs a').removeClass("pen");
			if(data.status!="0"){
				Util.alert(data.errmsg || "系统繁忙，请稍后再试");
			}
			var tempData={
				list:data.result.storeAdminVoList,
				status:status
			};
			var count=data.result.count;
			if(count!=0){
				var dataHtml = template('tempData', tempData);
				$(".dataTable").empty().append(dataHtml);
				$("#storeTabs .active .count").html('('+count+')');
				Util.createPagination(data.result.count,idx,$(".pagination"),function(_i){
					getAjaxData(status,startTime,endTime,name,_i);
				});
				$(".table").setTheadFixed();
			}else if(count==0){
				var dataHtml = '<colgroup width="30"></colgroup><colgroup width="320"></colgroup><colgroup width="300"></colgroup><thead><tr><th><input class="checkAll" type="checkbox"></th><th>门店信息</th><th>到期时间</th><th>操作</th></tr></thead><tbody><tr><td class="tc" colspan="100">门店列表为空</td></tr></tbody>';
				$(".dataTable").empty().append(dataHtml);
				Util.createPagination(data.result.count,idx,$(".pagination"),function(_i){
					getAjaxData(status,startTime,endTime,name,_i);
				});

			}
		}
	});
}

$('#storeTabs').tabs(function($el){
	var status = $el.data("status");
	if(status == "0"){
		$("#offLineBtn").show();
		$("#onLineBtn").hide();
		$(".dataTable thead th:first").show();
	}else if(status == "1"){
		$("#offLineBtn").hide();
		$("#onLineBtn").show();
		$(".dataTable thead th:first").show();
	}else if(status == "2"){
		$("#offLineBtn").hide();
		$("#onLineBtn").hide();
		$(".dataTable thead th:first").hide();
	}
	getAjaxData(status,"","","",0);
});

// 服务区域初始化
var loc = new Location();
var title   = ['省份' , '地级市' , '市、县、区'];
$.each(title , function(k , v) {
    title[k]    = '<option value="">'+v+'</option>';
});
$('#loc_province').append(title[0]);
$('#loc_city').append(title[1]);
$('#loc_town').append(title[2]);
loc.fillOption('loc_province' , '0');
$("#loc_province,#loc_city,#loc_town").select2();
$('#loc_province').change(function() {
    $('#loc_city').empty();
    if($(this).val()){
        loc.fillOption('loc_city' , '0,'+$('#loc_province').val());
        $('input[name=province]').val($(this).find("option:selected").text());
        $('#loc_city').change();
    }else{
        $('input[name=province],input[name=city],input[name=district]').val("");
        $('#loc_city').html(title[1]).change();
        $('#loc_town').html(title[2]).change();
    }
});
$('#loc_city').change(function() {
    $('#loc_town').empty();
    if($(this).val()){
        loc.fillOption('loc_town' , '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
        $('input[name=city]').val($(this).find("option:selected").text());
    }
    $('#loc_town').change();
});
$('#loc_town').change(function() {
    $('input[name=district]').val($(this).find("option:selected").text());
});



// 筛选
$("#listFilter").on("click",function(e){
	e.preventDefault();
	// var startTime = Util.getUnixTime($("#dateStart").val()),
	// 	endTime = Util.getUnixTime($("#dateEnd").val()),
	var name=$("#keywords").val();
	getAjaxData($("#storeTabs .active a").data("status"),'','',name,0,true);
});
// $(".timeSel").on("click",function(e){
// 	e.preventDefault();
// 	var startTime = getQsTime(this),endTime = getQsTime(this,"end");
// 	getAjaxData($("#storeTabs .active a").data("status"),startTime,endTime,"","",0,true);
// });

// 全选
$("body").on("click",".checkAll",function(){
	if($(this).prop("checked")){
		$(".table tbody").find("input[name=select]").prop("checked",true);
	}else{
		$(".table tbody").find("input[name=select]").prop("checked",false);
	}
});

// 停业/营业
$("#offLineBtn, #onLineBtn").on("click",function(e){
	var seld = $(".table tbody").find("input[name=select]:checked"),onLine = this.id=="onLineBtn" ? true : false;
	if(seld.length === 0){
		Util.alert("请至少选择一家门店");
	}else{
		var seldArr=[],salesCount=0;
		seld.each(function(i,e){
			seldArr.push($(e).data("id"));
			salesCount += parseInt($(e).data("sales"));
		});
		var storeIdList=seldArr.join("_");
		if(salesCount>0 && !onLine){
			Util.alert("所选门店还有导购，请先转移到其它门店或离职。");
			return false;
		}
		$.getJSON("updateStoreOpenStatus.json?storeIds="+storeIdList+"&open="+(onLine ? 0 : 1),function(data){
			if(data.status=="0"){
				if(onLine){
					getAjaxData(1,"","","",0);
					Util.alert("所选门店已开始营业");
				}else{
					getAjaxData(0,"","","",0);
					Util.alert("所选门店已暂停营业");
				}
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		});
	}
});
$(".table").on("click",".onLineBtn",function(e){
	e.stopPropagation();
	var open=$(this).data("open"),id=$(this).data("id"),tr=$(this).closest("tr");
	if(open == "0"){
		if(parseInt($(this).data("sales"))>0){
			Util.alert("该门店还有导购，请先转移到其它门店或离职。");
			return false;
		}
		Util.confirm("确定暂停营业该门店？暂停后该门店在洽客商城将不再显示",function(){
			updateStoreOpenStatus(open,id,tr);
		});
	}else{
		Util.confirm("确定开始营业该门店？",function(){
			updateStoreOpenStatus(open,id,tr);
		});
	}
});
function updateStoreOpenStatus(open,id,tr){
	$.getJSON("updateStoreOpenStatus.json?storeIds="+id+"&open="+(open=="1" ? 0 : 1),function(data){
		if(data.status=="0"){
			if(open=="1"){
				Util.alert("门店已开始营业");
			}else{
				Util.alert("门店已暂停营业");
			}
			tr.fadeOut(500);
			var oldCount = $("#storeTabs .active .count").html().replace(/[()]/g,"");
			$("#storeTabs .active .count").html('('+ (~~oldCount-1)+')');
		}else{
			Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
		}
	});
}

function buyServer(){
	if(location.host.indexOf("ekeban")>-1){
		location.href="http://www.ekeban.com/finance/admin/account.htm#!/servicesBuying";
	}else{
		location.href="http://finance.qiakr.com/admin/account.htm#!/servicesBuying";
	}
}

$("#typeAllStore").select2({
	minimumResultsForSearch: -1
});