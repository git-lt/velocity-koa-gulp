document.title="商户设置"; 
var showContentId = location.href.split("#")[1];
var tagsListArray = [],fastReplayArray=[];
$('#'+showContentId+"-c").show().siblings().hide();
if(showContentId=="defaultTags"){
	$("#useReplay").show();
	getDefaultTags();
}
if(showContentId=="fastReplay"){
	$("#newFastReplay").show();
	$("#setReplay").show();
	getFastReplay();
}else{
	$("#newFastReplay").hide();
	$("#setReplay").hide();
}
$("#sidebar-menu li a").each(function(i,e){
	if($(e).attr("href") == "settings.htm#"+showContentId){
		$("#sidebar-menu .active").removeClass("active");
		$(e).addClass("active");
		return false;
	}
});
window.onhashchange=function(){
	var show = location.hash;
	$("#sidebar-menu .active").removeClass("active");
	$("#sidebar-menu li a[href='settings.htm"+show+"']").addClass("active");
	$(show+"-c").show().siblings().hide();
	if(show=="#defaultTags"){
		$("#useReplay").show();
		getDefaultTags();
	}else{
		$("#useReplay").hide();
	}
	if(show=="#fastReplay"){
		$("#newFastReplay").show();
		$("#setReplay").show();
		getFastReplay();
	}else{
		$("#newFastReplay").hide();
		$("#setReplay").hide();
	}
};

$.getJSON("getSupplierWechatInfo.json",function(data){
	var service = data.supplierWechat ? data.supplierWechat.serviceTypeInfo : "",
		verify = data.supplierWechat ? data.supplierWechat.verifyTypeInfo : "";
	var wechatAuthData={
		wechatAuth: data.wechatAuth==0 ? true : false,
		service : service,
		verify : verify
	};
	if(!wechatAuthData.wechatAuth){
		$("#menu-c,#welcome-c").html('<b>微信授权状态</b><p class="mt20 mb20"><span class="pr30">您还未授权绑定公众号</span> <a href="bindingWechat.htm" class="btn btn-info m0">立即授权</a></p>')
	}else if(data.supplierWechat && data.supplierWechat.funcMsgMenu && data.supplierWechat.funcMsgMenu != 0){
		$("#menu-c,#welcome-c").html('<b>微信授权状态</b><p class="mt20 mb20"><span class="pr30">洽客未能获取到"消息及自定义菜单管理"权限</span> <a href="#wechatAuth" class="btn btn-info m0">查看详情</a></p>');
	}
	
	var wechatAuthHtml = template('wechatAuthTemp', wechatAuthData);
	$("#wechatAuth-c").prepend(wechatAuthHtml);
	if(!data.supplierWechat) return false;
	var tempData={
		menu : (data.supplierWechat.funcMsgMenu!=0 || (service==1 && verify == -1)) ? false : true, 
		fuwu : (service==2 && $.inArray(verify,[0,3,4,5]) > -1) ?  true : false,
		dingyue : ((service==0 || service==1) && verify != -1) ? true : false,
		service : service,
		verify : verify
	};
	var statusHtml = template('wechatTemp', tempData);
	$("#wechatStatus").html(statusHtml);
});

$("#setCommissionBtn").on("click",function(){
	var comVal = parseFloat($('.defaultCommissionVal').val());
    if(comVal < 0 || comVal>70){
        Util.alert("提成范围0~70%");
        return false;
    }
    $.getJSON("updateDefaultCommissionRate.json?defaultCommissionRate="+comVal.toFixed(2),function(data){
        if(data.status=="0"){
            Util.alert("设置成功");
        }else{
			Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
		}
    });
});

$("#bandingTypeSel").on("change",function(){
	if($(this).val()=="0"){
		$("#bandingTypeTip").html("全部");
	}else{
		$("#bandingTypeTip").html("每个");
	}
});
$("#setBandingType").on("click",function(e){
	e.preventDefault();
	$.getJSON("updateBandingType.json?bandingType="+$("#bandingTypeSel").val(),function(data){
		if(data.status=="0"){
			Util.alert("设置成功");
		}else{
			Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
		}
	});
});

/*用户标签设置*/
function getDefaultTags(){
	$.getJSON("getTags.json",function(data){
		if(data.status=="0"){
			var list = data.result.tagList,dataHtml="";
			$.each(list,function(i,e){
				tagsListArray.push(e.name);
			});
			dataHtml = template('tagsTempData', {
				list:list
			});
			$("#defaultTags-c .defaultTags").html(dataHtml);
		}
	});
}
$(".defaultTags").on("click",".cover",function(){
	var nameCont = $(this).siblings(".name"), text = nameCont.text(),id = $(this).parent().data("id");
	dialog({
        title:"编辑标签",
        id:"util-tags",
        fixed: true,
        content: $("#setTagsDia"),
        width:400,
        cancelValue:'取消',
        okValue: '确认保存',
        backdropOpacity:"0.5",
        ok: function () {
            var newText = $.trim($("#setTagsDia").find(".defaultTagsText").val());
            if(newText == ""){
        		Util.alert("标签不能为空");
        		return false;
        	}
            var params = {
            	tagId:id,
            	name:newText
            };
            $.getJSON("modifyTagName.json",params,function(data){
				if(data.status=="0"){
					nameCont.text(newText);
				}else{
					Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				}
			});
        },
        cancel:function(){}
    }).showModal();
    $("#setTagsDia").find(".defaultTagsText").val(text);
}).on("click",".remove",function(e){
	e.stopPropagation();
	e.preventDefault();
	var tag = $(this).closest(".item"),id = tag.data("id");
	Util.confirm("是否确认删除？",function(){
		$.getJSON("removeTag.json?tagId="+id,function(data){
			if(data.status=="0"){
				tag.fadeOut();
				tagsListArray = $.grep(tagsListArray,function(e,i){
					return e!=tag.find(".name").text();
				});
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		});
	});
}).on("click",".newTag",function(){
	dialog({
        title:"添加标签",
        id:"util-tags",
        fixed: true,
        content: $("#addTagsDia"),
        width:400,
        cancelValue:'取消',
        okValue: '确认保存',
        backdropOpacity:"0.5",
        ok: function () {
            var text = $.trim($("#addTagsDia").find(".defaultTagsText").val());
            text = text.replace(/[,，]/g,",");
            var textArr = text.split(","),duplicate = [];
            textArr = $.grep(textArr,function(e,n){
    			return e != "";
    		});
            for(var i =0;i<textArr.length;i++){
            	if(textArr[i].length > 16){
            		Util.alert("标签不能多于16字");
            		return false;
            	}
            	for(var j =0;j<tagsListArray.length;j++){
            		if(textArr[i]===tagsListArray[j]){
            			duplicate.push(textArr[i]);
	            		textArr = $.grep(textArr,function(e,n){
	            			return e === textArr[i];
	            		},true);
            		}
            	}
            }
            if(duplicate.length > 0){
            	if(textArr.length>0){
            		Util.confirm("标签 "+JSON.stringify(duplicate)+" 已存在，不再重复添加，是否继续添加剩余标签？",function(){
	            		$.getJSON("addTagList.json?json="+JSON.stringify(textArr),function(data){
							if(data.status=="0"){
								Util.alert("添加成功");
								getDefaultTags();
							}else{
								Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
							}
						});
	            	});
            	}else{
            		Util.alert("您所添加的标签已全部存在，请勿重复添加");
            	}
            }else{
            	$.getJSON("addTagList.json?json="+JSON.stringify(textArr),function(data){
					if(data.status=="0"){
						Util.alert("添加成功");
						getDefaultTags();
					}else{
						Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
					}
				});
            }
        },
        cancel:function(){}
    }).showModal();
});
$(document).on("keydown",".defaultTagsText",function(e){
	if(e.keyCode == 13){
        $(this).closest(".ui-dialog-grid").find(".ui-dialog-button .btn-info").trigger("click");
    }
});

// 设置快捷回复
function getFastReplay(){
	if(fastReplayArray.length!==0){
		return false;
	}
	$.getJSON("getReplayPhrase.json",function(data){
		if(data.status=="0"){
			var list = data.result.replayPhraseList,dataHtml="";
			$.each(list,function(i,e){
				fastReplayArray.push(e.phrase);
			});
			dataHtml = template('fastReplayTempData', {
				list:list
			});
			$("#fastReplay-c .fastReplayList").html(dataHtml);
		}
	});
}
$(".fastReplayList").on("click",".edit",function(){
	var _t = $(this).closest(".item").find(".cont"), text = _t.text(),id = _t.data("id");
	dialog({
        title:"编辑快捷回复",
        id:"util-fastReplay",
        fixed: true,
        content: $("#setFastReplayDia"),
        width:400,
        cancelValue:'取消',
        okValue: '确认保存',
        backdropOpacity:"0.5",
        ok: function () {
             var newText = $("#setFastReplayDia").find(".defaultTagsText").val();
             if($.trim(newText)===""){
             	Util.alert("快捷回复不能为空");
             	return false;
             }
             if(newText.length>140){
             	Util.alert("超过字数限制，请填写140个字以内");
             	return false;
             }
             var params={
             	replayPhraseId:id,
             	phrase:newText
             };
             $.getJSON("modifyPhrase.json",params,function(data){
				if(data.status=="0"){
					_t.text(newText);
				}else{
					Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				}
			});
        },
        cancel:function(){}
    }).showModal();
    $("#setFastReplayDia").find(".defaultTagsText").val(text);
}).on("click",".remove",function(){
	var _t = $(this).closest(".item").find(".cont"),id = _t.data("id");
	Util.confirm("是否确认删除？",function(){
		$.getJSON("removePhrase.json?replayPhraseId="+id,function(data){
			if(data.status=="0"){
				_t.parent().fadeOut();
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		});
	});
});
$("#newFastReplay").on("click",function(){
	dialog({
        title:"新增快捷回复",
        id:"util-fastReplay",
        fixed: true,
        content: $("#addFastReplayDia"),
        width:400,
        cancelValue:'取消',
        okValue: '确认保存',
        backdropOpacity:"0.5",
        ok: function () {
             var newText = $.trim($("#addFastReplayDia").find(".defaultTagsText").val());
             if(!newText){
             	Util.alert("快捷回复不能为空");
             	return false;
             }
             if(newText.length>140){
             	Util.alert("超过字数限制，请填写140个字以内");
             	return false;
             }
             $.getJSON("addReplayPhrase.json?phrase="+newText,function(data){
				if(data.status=="0"){
					var list = [],dataHtml="";
					list.push(data.result.replayPhrase);
					fastReplayArray.push(data.result.replayPhrase);
					dataHtml = template('fastReplayTempData', {
						list:list
					});
					$("#fastReplay-c .fastReplayList").append(dataHtml);
				}else{
					Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
				}
			});
        },
        cancel:function(){}
    }).showModal();
});

var menu = {
	rawMenuData: {
		name: "",
		type: "",
		// key: "",
		url: ""
	},
	host : location.protocol+"//"+location.host,
	// data:{"button":[]},
	data:$("#defaultMenuData").val() ? JSON.parse($("#defaultMenuData").val()) : {"button":[]},
	specialPromotionList:"",
	//新菜单数据
	newMenuData: function (conf) {
		return $.extend({}, menu.rawMenuData, conf);
	},
	init:function(){
		var menuHtml = '';
		$.each(menu.data.button,function(i,e){
			menuHtml += '<div class="menu-item">\
						<div class="item parent">\
							<span>'+e.name+'</span>\
							<div class="edit">\
								<a class="modify"></a>\
								<a class="del"></a>\
							</div>\
						</div>\
						<div class="sub-menuList">';
			if(e.sub_button){
				$.each(e.sub_button,function(j,t){
					menuHtml += '<div class="sub item">\
									<span>'+t.name+'</span>\
									<div class="edit">\
										<a class="modify"></a>\
										<a class="del"></a>\
									</div>\
								</div>';
				});
			}
			menuHtml += '<div class="sub subItem">\
								<a href="javascript:;" class="new-menu"> + 添加子菜单</a>\
							</div>\
						</div>\
					</div>';
		});
		menuHtml += '<div class="menu-item">\
						<div class="newItem parent">\
							<a href="javascript:;"  class="new-menu parent">添加菜单</a>\
						</div>\
					</div>';
		$(".menuList").html(menuHtml);
	},
	//新增菜单
	insert: function (obj, parentIdx,type) {
		var newMenuDataItem;
		if (parentIdx === null || parentIdx === undefined) {
			newMenuDataItem = menu.newMenuData({
				"name": obj.name,
				"url":obj.url,
				"type":type ? type : "view"
			});
			if(type=="click"){
				newMenuDataItem.key="customer_service";
			}
			menu.data.button.push(newMenuDataItem);
		} else {
			newMenuDataItem = menu.newMenuData({
				"name": obj.name,
				"url":obj.url,
				"type":type ? type : "view"
			});
			if(type=="click"){
				newMenuDataItem.key="customer_service";
			}
			if(menu.data.button[parentIdx].sub_button === undefined){
				menu.data.button[parentIdx].sub_button=[];
			}
			menu.data.button[parentIdx].sub_button.push(newMenuDataItem);
			if(typeof menu.data.button[parentIdx].type !== undefined){
				delete menu.data.button[parentIdx].type;
				delete menu.data.button[parentIdx].key;
				delete menu.data.button[parentIdx].url;
			}
		}
	},
	//修改菜单
	modify: function (obj, index, parentIdx,type) {
		if (parentIdx === null || parentIdx === undefined) {
			$(".menuList .menu-item:eq("+index+") .parent span").html(obj.name);
			menu.data.button[index].name = obj.name;
			if(obj.url){
				menu.data.button[index].url = obj.url;
				menu.data.button[index].type = type ? type : "view";
				if(type=="click"){
					menu.data.button[index].key="customer_service";
				}else{
					delete menu.data.button[index].key;
				}
			}
		} else {
			$(".menuList .menu-item:eq("+parentIdx+") .sub-menuList .item:eq("+index+") span").html(obj.name);
			menu.data.button[parentIdx].sub_button[index].name = obj.name;
			menu.data.button[parentIdx].sub_button[index].url = obj.url;
			menu.data.button[parentIdx].sub_button[index].type =  type ? type : "view";
			if(type=="click"){
				menu.data.button[parentIdx].sub_button[index].key="customer_service";
			}else{
				delete menu.data.button[parentIdx].sub_button[index].key;
			}
		}
	},
	//删除菜单
	del: function (index, parentIdx) {
		if (parentIdx === null || parentIdx === undefined) {
			menu.data.button.splice(index, 1);
			$(".menuList .menu-item:eq("+index+")").remove();
		} else {
			menu.data.button[parentIdx].sub_button.splice(index, 1);
			$(".menuList .menu-item:eq("+parentIdx+") .sub-menuList .item:eq("+index+")").remove();
			if(menu.data.button[parentIdx].sub_button.length === 0){
				delete menu.data.button[parentIdx].sub_button;
			}
		}
	}
}
menu.init();

$(".menuSetting").on("click",".new-menu",function(){
	var _t = $(this).parent(),isSub = _t.hasClass("sub") ? true : false;
	// $(".menuList .editing").removeClass("editing");
	// _t.addClass("editing");
	if(isSub && _t.index() >= 5){
		Util.alert("二级菜单最多5个");
		return false; 
	}else if(!isSub && _t.parent().index() >= 3){
		Util.alert("一级菜单最多3个");
		return false; 
	}
	var tempData={
		data:{
			name:"",
			type:3,
			url:"http://",
			editType : isSub ? ("new-"+_t.closest(".menu-item").index()) : "new",
			editOpt : "0"
		}
	}
	var editHtml = template('tempData', tempData);
	$(".editMenuData .menuWrap").empty().append(editHtml);
	$(".editMenuData .name").focus();
}).on("click",".item",function(){
	var _t = $(this),isSub = _t.hasClass("sub") ? true : false;
	$(".menuSetting .item").removeClass("ac");
	_t.addClass("ac");
	var idx = isSub ? _t.index() : _t.parent().index(),
		parentIdx = isSub ? _t.closest(".menu-item").index() : null;
	var dataItem = parentIdx === null ? menu.data.button[idx] : menu.data.button[parentIdx].sub_button[idx];
	var tempData={
		data:{
			name:dataItem.name,
			type:dataItem.type=="click" ? "99" : "3",
			url:dataItem.url,
			editType : isSub ? ("edit-"+idx+"-"+parentIdx) : ("edit-"+idx),
			editOpt : (isSub || (!isSub && _t.parent().find(".sub-menuList .sub.item").length==0)) ? "0" : "1"
		}
	}
	var editHtml = template('tempData', tempData);
	$(".editMenuData .menuWrap").empty().append(editHtml);
	if(dataItem.type=="click"){
		$(".menuWrap").find(".url").parent().hide();
		$(".menuWrap").find(".multiUrl").parent().show();
	}
}).on("click",".del",function(e){
	e.stopPropagation();
	var _t = $(this).closest(".item"),isSub = _t.hasClass("sub") ? true : false;
	var idx = isSub ? _t.index() : _t.parent().index(),
		parentIdx = isSub ? _t.closest(".menu-item").index() : null;
	if(!isSub && _t.closest(".menu-item").find(".sub-menuList .sub.item").length>0){
		Util.confirm("删除一级菜单后相应的二级菜单也会删除，<br />是否确定？",function(){
			menu.del(idx,parentIdx);
		},function(){});
	}else{
		menu.del(idx,parentIdx);
	}
});
$(".editMenuData").on("click",".saveBtn",function(){
	var wrap = $(".editMenuData .menuWrap");
	var menuObj = {
		name:wrap.find(".name").val(),
		type:wrap.find(".type").val(),
		url:wrap.find(".url").val()
	}
	if($.trim(menuObj.name)==""){
		Util.alert("名称不能为空");
		return false;
	}
	if(menuObj.type=="99"){
		menuObj.url = wrap.find(".multiUrl").val();
		if($.trim(menuObj.url)==""){
			Util.alert("请填写回复短语");
			return false;
		}
	}else{
		if(wrap.find(".url").length > 0 && ($.trim(menuObj.url)=="" || $.trim(menuObj.url)=="http://")){
			if(wrap.find(".specialList").length > 0){
				Util.alert("请选择商品专题");
			}else{
				Util.alert("链接地址不能为空");
			}
			return false;
		}
		if(wrap.find(".url").length > 0){
			if($.trim(menuObj.url).indexOf("http://") <0 && $.trim(menuObj.url).indexOf("https://") <0){
				Util.alert("链接地址必须加上http://或者https://");
				return false;
			}
		}
		if(Util.getByteLen(menuObj.url) > 256){
			Util.alert("链接地址不能超过256个字节");
			return false;
		}
	}
	var typeArr = $(".editMenuData .editType").val().split("-");
	if(typeArr[0] == "new"){
		if(typeArr[1]){
			if(Util.getByteLen(menuObj.name) > 14){
				Util.alert("二级菜单名不能超过7个汉字(14个英文/数字)");
				return false;
			}
			var menuHtml = '<div class="sub item">\
								<span>'+menuObj.name+'</span>\
								<div class="edit">\
									<a class="modify"></a>\
									<a class="del"></a>\
								</div>\
							</div>';
			$(".menuList .menu-item:eq("+typeArr[1]+") .sub-menuList").find(".sub:last").before(menuHtml);
			menu.insert(menuObj,typeArr[1],menuObj.type == "99" ? "click" : "view" );
		}else{
			if(Util.getByteLen(menuObj.name) > 8){
				Util.alert("一级菜单名不能超过4个汉字(8个英文/数字)");
				return false;
			}
			var menuHtml = '<div class="menu-item">\
						<div class="item parent">\
							<span>'+menuObj.name+'</span>\
							<div class="edit">\
								<a class="modify"></a>\
								<a class="del"></a>\
							</div>\
						</div>\
						<div class="sub-menuList">\
							<div class="sub newItem">\
								<a href="javascript:;" class="new-menu"> + 添加子菜单</a>\
							</div>\
						</div>\
					</div>';
			$(".menuList .menu-item:last").before(menuHtml);
			menu.insert(menuObj,null,menuObj.type == "99" ? "click" : "view");
		}
	}else{
		if(typeArr[2]){
			if(Util.getByteLen(menuObj.name) > 14){
				Util.alert("二级菜单名不能超过7个汉字(14个英文/数字)");
				return false;
			}
		}else{
			if(Util.getByteLen(menuObj.name) > 8){
				Util.alert("一级菜单名不能超过4个汉字(8个英文/数字)");
				return false;
			}
		}
		menu.modify(menuObj,typeArr[1],typeArr[2],menuObj.type == "99" ? "click" : "view");
	}
	wrap.empty().html('<p class="fn-tip text-center">选择左侧菜单项进行编辑</p>');
}).on("change",".type",function(){
	var wrap = $(".editMenuData .menuWrap"),
		_type = $(this).val(),
		urlInput = wrap.find(".url"),
		urlInputValue = menu.host;
	urlInput.parent().hide();
	wrap.find(".multiUrl").parent().hide();
	wrap.find(".specialList, .discountList").remove();
	switch(_type){
		case "1" : 
		urlInputValue += "/store.htm?suid="+$("#supplierIdInput").val();
		break;
		case "2" : 
		urlInputValue += "/customer.htm?suid="+$("#supplierIdInput").val();
		break;
		case "3" : 
		urlInputValue = "http://";
		break;
		case "4" : 
		urlInputValue += "/mall/mySalesList.htm?suid="+$("#supplierIdInput").val();
		break;
		case "5" : 
		urlInputValue += "/mall/getOrderListOfCustomer.htm?suid="+$("#supplierIdInput").val();
		break;
		case "6" : 
		urlInputValue += "/mall/getShoppingCart.htm?suid="+$("#supplierIdInput").val();
		break;
		case "7" : 
		urlInputValue += "/mall/getCustomerFavoriteStockList.htm?suid="+$("#supplierIdInput").val();
		break;
		case "8" : 
		urlInputValue += "/mall/myCouponList.htm?suid="+$("#supplierIdInput").val();
		break;
		case "10" : 
		urlInputValue += "/mall/shareStockListForCustomer.htm?tags=特价&index=0&length=100&suid="+$("#supplierIdInput").val();
		break;
		case "11" : 
		urlInputValue += "/mall/activityOfSeckill.htm?suid="+$("#supplierIdInput").val();
		break;
		case "12" : 
		urlInputValue += "/mall/qiangHongBao.htm?suid="+$("#supplierIdInput").val();
		break;
		case "14" : 
		urlInputValue += "/mall/contactSales.htm?supplierId="+$("#supplierIdInput").val();
		break;
		case "15" : 
		urlInputValue += "/mall/storeAllList.htm?supplierId="+$("#supplierIdInput").val()+"&type=select&redirect=appointmentSalesList.htm";
		break;
		case "9" : 
			// 选择商品专题
			if(menu.specialPromotionList){
				wrap.find("ul li:last").before(menu.specialPromotionList);
				urlInputValue = menu.host + '/mall/getSpecialPromotion.htm?id='+wrap.find(".specialSelect option:first").val()+'&suid='+$("#supplierIdInput").val();
			}else{
				var specialPromotionList = '';
				$.getJSON("getSpecialPromotionList.json?index=0&length=100",function(data){
					specialPromotionList += '<li class="specialList"><span class="tit">选择专题：</span>';
					if(data.result.count==0){
						specialPromotionList += '<a href="createSpecialPromotion.htm" target="_blank">暂无专题，点击去创建</a>';
					}else{
						specialPromotionList += '<select class="specialSelect">';
						$.each(data.result.specialPromotionList,function(i,e){
							specialPromotionList += '<option value="'+e.id+'">'+e.name+'</option>';
						});
						specialPromotionList += '</select>';
					}
					specialPromotionList += '</li>';
					menu.specialPromotionList = specialPromotionList;
					wrap.find("ul li:last").before(specialPromotionList);
					urlInputValue = menu.host + '/mall/getSpecialPromotion.htm?id='+wrap.find(".specialSelect option:first").val()+'&suid='+$("#supplierIdInput").val();
					urlInput.val(urlInputValue);
				});
			}
		break;
		case "13" : 
			// 选择满减满折活动
			if(menu.discountPromotionList){
				wrap.find("ul li:last").before(menu.discountPromotionList);
				urlInputValue = menu.host + '/mall/storeAllList.htm?supplierId='+$("#supplierIdInput").val()+'&type=select&redirect='+encodeURIComponent('discountPromotionDetail.htm?id='+wrap.find(".discountSelect option:first").val());
			}else{
				var discountPromotionList = '';
				$.getJSON("getDiscountPromotionVoList.json?processing=3&index=0&length=100",function(data){
					discountPromotionList += '<li class="discountList"><span class="tit">选择活动：</span>';
					if(data.result.count==0){
						discountPromotionList += '<a href="createDiscount.htm" target="_blank">暂无活动，点击去创建</a>';
					}else{
						discountPromotionList += '<select class="discountSelect">';
						$.each(data.result.discountPromotionVoList,function(i,e){
							discountPromotionList += '<option value="'+e.id+'">'+e.promotionName+'</option>';
						});
						discountPromotionList += '</select>';
					}
					discountPromotionList += '</li>';
					menu.discountPromotionList = discountPromotionList;
					wrap.find("ul li:last").before(discountPromotionList);
					urlInputValue = menu.host + '/mall/storeAllList.htm?supplierId='+$("#supplierIdInput").val()+'&type=select&redirect='+encodeURIComponent('discountPromotionDetail.htm?id='+wrap.find(".discountSelect option:first").val());
					urlInput.val(urlInputValue);
				});
			}
		break;
	}
	urlInput.val(urlInputValue);
	if(_type == "3"){
		urlInput.parent().show();
	}else if(_type=="99"){
		wrap.find(".multiUrl").val("").parent().show();
	}
}).on("change",".specialSelect",function(){
	var promotionId = $(this).val();
	if(promotionId){
		$(".editMenuData .url").val(menu.host + '/mall/getSpecialPromotion.htm?id='+promotionId+'&suid='+$("#supplierIdInput").val());
	}else{
		$(".editMenuData .url").val('');
	}
}).on("change",".discountSelect",function(){
	var id = $(this).val();
	$(".editMenuData .url").val(menu.host + '/mall/storeAllList.htm?supplierId='+$("#supplierIdInput").val()+'&redirect='+encodeURIComponent('discountPromotionDetail.htm?id='+id));
});

$("#saveMenu").on("click",function(){
	// console.log(menu.data)
	$.ajax({
		url:"createWechatMenu.json",
		data:{
			menuJson:JSON.stringify(menu.data)
		},
		success:function(data){
			if(data.status=="0"){
				Util.alert("发布成功");
			}else{
				Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
			}
		}
	})
});

$("#resetMenu").on("click",function(){
	menu.data={
		"button":[
		{
			"name":"微商城",
			"sub_button":[
				{
					"name":"联系导购",
					"type":"view",
					"url":menu.host+"/mall/contactSales.htm?supplierId="+$("#supplierIdInput").val()
				},
				{
					"name":"进入商城",
					"type":"view",
					"url":menu.host+"/store.htm?suid="+$("#supplierIdInput").val()
				}
			]
		},
		{
		"name":"会员中心",
		"sub_button":[
			{
				"name":"订单查询",
				"type":"view",
				"url":menu.host+"/mall/getOrderListOfCustomer.htm?suid="+$("#supplierIdInput").val()
			},
			{
				"name":"商品收藏",
				"type":"view",
				"url":menu.host+"/mall/getCustomerFavoriteStockList.htm?suid="+$("#supplierIdInput").val()
			},
			{
				"name":"购物车",
				"type":"view",
				"url":menu.host+"/mall/getShoppingCart.htm?suid="+$("#supplierIdInput").val()
			},
			{
				"name":"优惠券",
				"type":"view",
				"url":menu.host+"/mall/myCouponList.htm?suid="+$("#supplierIdInput").val()
			},
			{
				"name":"个人中心",
				"type":"view",
				"url":menu.host+"/customer.htm?suid="+$("#supplierIdInput").val()
			}
		]
		},
		{
		"name":"会员福利",
		"sub_button":[
			{
				"name":"天天闪购",
				"type":"view",
				"url":menu.host+"/mall/activityOfSeckill.htm?suid="+$("#supplierIdInput").val()
			},
			{
				"name":"抢红包",
				"type":"view",
				"url":menu.host+"/mall/qiangHongBao.htm?suid="+$("#supplierIdInput").val()
			}
		]
		}
	]};
	menu.init();
});