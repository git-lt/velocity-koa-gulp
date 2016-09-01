$.createSecondMenu("m_settings","微信自动回复");

var defaultAutoReply = '[{"title":"欢迎来到[导购所属门店名称]","pic":"0","url":"'+location.host+'/mall/getStoreHomePage.htm?storeId={storeId}"},{"title":"导购名称","pic":"0","url":"'+location.host+'/mall/salesProfile.htm?salesId={salesId}"},{"title":"查看本店最新促销新品","pic":"0","url":"'+location.host+'/mall/getStoreHomePage.htm?storeId={storeId}"}]'
	autoReplayJson = $("#bindSalesWords").val() || defaultAutoReply,
	autoReplay = JSON.parse(autoReplayJson);

var edittingIdx = 0,
	maxMsgLength = 8, 
	msgLength = autoReplay.length;

	editDia = dialog({
	id:"msg-edit",
	align: 'right',
	content: $("#editMsgBox"),
	okValue:"确定",
	ok:function(){this.close();return false;}
});
var page = {
	host:location.host,
	moveStartIndex:0,
	moveStopIndex:0,
	init:function(){
		this.changeTag();
		this.listenWelcomeWords();
		this.saveWelcomeWords();
		this.initMsgList()
		this.listenEdit();
		this.msgSort();
		this.editEvent();
		this.addNewMsg();
		this.deleteEvent();
		this.imageTypeChange();
		this.resetEv();
		this.save();
		this.chkWechat();
		$("#msgImageUpload").singleImgUploader({
		    resultInput : $("#msgImageUrl"),
		    callback:function(url){
		    	$(".msg-item:eq("+edittingIdx+")").find(".image").attr("src",url);
		    	autoReplay[edittingIdx].pic = url;
		    }
		});
	},
	chkWechat:function(){
		$.post('getSupplierWechatInfo.json', function(data){
			var hasWechatAuth = data.wechatAuth==0;
			var service = data.supplierWechat ? data.supplierWechat.serviceTypeInfo : "",
				verify = data.supplierWechat ? data.supplierWechat.verifyTypeInfo : "";
			if(hasWechatAuth){
				$('#needWechatAuthBox').hide();
				$('#autoReplayBox').show();
				if(service!=2 || $.inArray(verify,[0,3,4,5]) < 0){
					$(".wechatMessageContainer").html('<p class="tl">该功能只有绑定已认证的微信服务号才可使用</p>')
				}
			}else{
				$('#needWechatAuthBox').show();
				$('#autoReplayBox').hide();
			}
		});
	},
	initMsgList:function(){
		$("#msgList").html(template('msgListTemp', {list:autoReplay}));
		msgLength = autoReplay.length;
		$("#leftMsgCount").text(maxMsgLength - msgLength);
		if(maxMsgLength == msgLength){
			$("#addNewMsg").hide();
		}
	},
	initEditMsg:function(msg,idx){
		$("#editMsgBox .title").val(msg.title);
		if(msg.pic=="0"){
			$("#msgImageType").val("0").trigger("change");
			$("#msgImageUpload").css("background-image","url(https://qncdn.qiakr.com/mall/defaultImg.png)");
		}else{
			$("#msgImageType").val("1").trigger("change");
			$("#msgImageUpload").css("background-image","url("+msg.pic+")");
		}
		if(idx==0){
			$("#msgImageUpload").width(162).css("background-size","160px 80px");
			$("#msgImageUpload .webuploader-pick").width(160);
			$("#msgImageUpload .webuploader-pick").siblings().width(160);
			$("#msgImageSize").text("900*500");
			$("#editMsgBox .title").prop("readonly",true);
			$("#linkType").val("1").trigger("change").attr("disabled","disabled");
		}else{
			$("#msgImageUpload").width(82).css("background-size","80px 80px");
			$("#msgImageUpload .webuploader-pick").width(80);
			$("#msgImageUpload .webuploader-pick").siblings().width(80);
			$("#msgImageSize").text("200*200");
			$("#editMsgBox .title").prop("readonly",false);
			$("#editMsgBox").find(".link").show();
			$("#linkType").val("3").removeAttr("disabled");
		}
		$("#editMsgBox .link").val(msg.url);
	},
	changeTag:function(){
		$(".filterTitle a").on("click",function(){
			var _t = $(this);
			if(_t.hasClass("current")) return false;
			_t.addClass("current").siblings().removeClass("current");
			if(_t.index()==0){
				$(".welcomeSet").show();
				$(".wechatMessageContainer").hide();
				location.href="#";
			}else{
				$(".welcomeSet").hide();
				$(".wechatMessageContainer").show();
				location.href="#message";
			}
		});
		if(location.hash=="#message"){
			$(".filterTitle a:eq(1)").trigger("click");
		}else{
			$(".welcomeSet").show();
		}
	},
	listenWelcomeWords:function(){
		$("#welcomeWordsArea").on("input propertychange",function(){
			var words = $(this).val().replace(/\n/g,"<br>");
			$(".supplierMsg .cont").html(words);
		});
		$(".insertLink").on("click",function(){
			dialog({
				id:"msg-welcomeLink",
				width:'465',
				content: '<div class="pb10">文字：<input type="text" class="long name" /></div><div>链接：<input class="long link" placeholder="http://" type="text" /></div><div id="linkError" class="c-rd pt5"></div>',
				okValue:"确定",
				cancelValue:"取消",
				ok:function(){
					var name = $('.name',"[id='content:msg-welcomeLink']"),
						link = $('.link',"[id='content:msg-welcomeLink']");
						if(!name.val().trim()){
							name.focus();
							$("#linkError").html("请填写链接名称");
							return false;
						}
						if(!link.val().trim()){
							link.focus();
							$("#linkError").html("请填写链接地址");
							return false;
						}
						if(link.val().indexOf("http://") <0 && link.val().indexOf("https://") <0){
							$("#linkError").html("请填写正确的链接地址,以\"http://\"或者\"https://\"开头");
							return false;
						}
						var linkHtml = '<a href="'+link.val().trim()+'">'+name.val().trim()+'</a>';
						$("#welcomeWordsArea").val($("#welcomeWordsArea").val()+linkHtml).trigger("input");
				},
				cancel:function(){
					this.close();return false;
				}
			}).show();
		})
	},
	saveWelcomeWords:function(){
		// 欢迎语设置
		$("#setWelcomeBtn").on("click",function(){
			var words = $("#welcomeWordsArea").val();
			$.ajax({
				url:"updateWelcomeWords.json",
				data:{
					welcomeWords:words
				},
				success:function(data){
					if(data.status=="0"){
						Util.alert('<div class="tc">设置成功</div><div class="qrcodeDia"><img src="'+(data.qrcode ? data.qrcode.qrcode_url : '')+'" /><div class="welcomeSetedTip"><p class="fn-red">取消关注公众号后</p><p>扫描左侧二维码</p><p>预览效果</p></div></div>');
					}else{
						Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
					}
				}
			});
		});
	},
	initEdit:function(obj){
		var follow = $(obj).closest(".msg-item");
		edittingIdx = follow.index();
		page.initEditMsg(autoReplay[edittingIdx],edittingIdx);
		editDia.show(follow[0]);
		$("#editMsgBox").find(".specialList, .discountList").remove();
	},
	editEvent:function(){
		$(".show-cont").on("click",".edit",function(){
			page.initEdit(this);
		});
		$(".show-cont").on("click",".actionCover",function(){
			page.initEdit(this);
		});
	},
	deleteEvent:function(){
		$(".show-cont").on("click",".delete",function(e){
			e.stopPropagation();
			var follow = $(this).closest(".msg-item");
			if(edittingIdx == follow.index()){
				editDia && editDia.close();
			}
			edittingIdx = follow.index();
			follow.fadeOut("fast",function(){
				follow.remove();
				autoReplay.splice(edittingIdx,1);
				msgLength--;
				$("#leftMsgCount").text(maxMsgLength - msgLength);
				if(maxMsgLength > msgLength && $("#addNewMsg").is(":hidden")){
					$("#addNewMsg").show();
				}
			});
		});
	},
	imageTypeChange:function(){
		$("#msgImageType").on("change",function(){
			if($(this).val()=="0"){
	    		$(".selfMsgImage").hide();
	    		$("#msgImageUpload").css("background-image","url(https://qncdn.qiakr.com/mall/defaultImg.png)");
	    		if(edittingIdx==0){
	    			$(".msg-item:eq("+edittingIdx+")").find(".image").attr("src","https://qncdn.qiakr.com/admin/defaultStoreImg.jpg");
	    		}else{
	    			$(".msg-item:eq("+edittingIdx+")").find(".image").attr("src","https://qncdn.qiakr.com/mall/defaultImg.png");
	    		}
	    		autoReplay[edittingIdx].pic = "0";
	    	}else{
	    		$(".selfMsgImage").show();
	    	}
		});
	},
	listenEdit:function(){
		$("#editMsgBox .title").on("input propertychange",function(){
			var val = $(this).val();
			$(".msg-item:eq("+edittingIdx+")").find(".title").text(val);
			autoReplay[edittingIdx].title = val;
		});
		$("#editMsgBox .link").on("input propertychange",function(){
			var val = $(this).val();
			autoReplay[edittingIdx].url = val;
		});
		$("#linkType").on("change",function(){
			var _type = $(this).val(),
				urlInput = $("#editMsgBox").find(".link"),
				urlInputValue = page.host;
			urlInput.hide();
			$("#editMsgBox").find(".specialList, .discountList").remove();
			switch(_type){
				case "1" : 
				urlInputValue += "/mall/getStoreHomePage.htm?storeId={storeId}";
				break;
				case "2" : 
				urlInputValue += "/customer.htm?suid="+$("#supplierIdInput").val();
				break;
				case "3" : 
				urlInputValue = "http://";
				urlInput.show();
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
				case "11" : 
				urlInputValue += "/mall/activityOfSeckill.htm?suid="+$("#supplierIdInput").val();
				break;
				case "12" : 
				urlInputValue += "/mall/qiangHongBao.htm?suid="+$("#supplierIdInput").val();
				break;
				break;
				case "15" : 
				urlInputValue += "/mall/storeAllList.htm?supplierId="+$("#supplierIdInput").val()+"&type=select&redirect=appointmentSalesList.htm";
				break;
				case "9" : 
					// 选择商品专题
					if(page.specialPromotionList){
						$("#editMsgBox").append(page.specialPromotionList);
						urlInputValue = page.host + '/mall/getSpecialPromotion.htm?id='+$(".specialSelect option:first").val()+'&suid='+$("#supplierIdInput").val();
					}else{
						var specialPromotionList = '';
						$.getJSON("getSpecialPromotionList.json?index=0&length=100",function(data){
							specialPromotionList += '<div class="item specialList">专题：';
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
							page.specialPromotionList = specialPromotionList;
							$("#editMsgBox").append(specialPromotionList);
							urlInputValue = page.host + '/mall/getSpecialPromotion.htm?id='+$("#editMsgBox .specialSelect option:first").val()+'&suid='+$("#supplierIdInput").val();
							autoReplay[edittingIdx].url = urlInputValue;
						});
					}
				break;
				case "13" : 
					// 选择满减满折活动
					if(page.discountPromotionList){
						$("#editMsgBox").append(page.discountPromotionList);
						urlInputValue = page.host + '/mall/storeAllList.htm?supplierId='+$("#supplierIdInput").val()+'&type=select&redirect='+encodeURIComponent('discountPromotionDetail.htm?id='+$(".discountSelect option:first").val());
					}else{
						var discountPromotionList = '';
						$.getJSON("getDiscountPromotionVoList.json?processing=3&index=0&length=100",function(data){
							discountPromotionList += '<div class="item discountList">活动：';
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
							page.discountPromotionList = discountPromotionList;
							$("#editMsgBox").append(discountPromotionList);
							urlInputValue = page.host + '/mall/storeAllList.htm?supplierId='+$("#supplierIdInput").val()+'&type=select&redirect='+encodeURIComponent('discountPromotionDetail.htm?id='+$(".discountSelect option:first").val());
							autoReplay[edittingIdx].url = urlInputValue;
						});
					}
				break;
			}
			autoReplay[edittingIdx].url = urlInputValue;
		});

		$("#editMsgBox").on("change",".specialSelect",function(){
			var promotionId = $(this).val();
			autoReplay[edittingIdx].url = page.host + '/mall/getSpecialPromotion.htm?id='+promotionId+'&suid='+$("#supplierIdInput").val();
		}).on("change",".discountSelect",function(){
			var id = $(this).val();
			autoReplay[edittingIdx].url = page.host + '/mall/storeAllList.htm?supplierId='+$("#supplierIdInput").val()+'&redirect='+encodeURIComponent('discountPromotionDetail.htm?id='+id);
		});
	},
	msgSort:function(){
		$( "#msgList").sortable({
			items:"li:gt(1)",
			handle:".sortHander",
			placeholder:"ui-sortable-placeholder",
			start:function(e,ui){
				editDia && editDia.close();
				page.moveStartIndex = ui.item.index();
			},
			stop:function(e,ui){
				// ui.item.find(".edit").trigger("click");
			},
			update:function(e,ui){
				page.moveStopIndex = ui.item.index();
				var moveItemArr = autoReplay.splice(page.moveStartIndex,1);
				autoReplay.splice(page.moveStopIndex,0,moveItemArr[0]);
			}
		});
	},
	addNewMsg:function(){
		$("#addNewMsg").on("click",function(){
			var newAutoReply = [{
				title:"",
				pic:"0",
				url:"http://"
			}]
			$("#msgList").append(template('msgListTemp', {list:newAutoReply}));
			msgLength++;
			$("#leftMsgCount").text(maxMsgLength - msgLength);
			if(maxMsgLength == msgLength){
				$("#addNewMsg").hide();
			}
			autoReplay.push(newAutoReply[0]);
			$(".msg-item:eq("+(msgLength-1)+")").find(".edit").trigger("click");
		});
	},
	resetEv:function(){
		$("#resetAutoReplay").on("click",function(){
			autoReplay = JSON.parse(defaultAutoReply);
			page.initMsgList();
		})
	},
	save:function(){
		$("#saveAutoReplay").on("click",function(){
			var legal=true;
			$.each(autoReplay,function(i,e){
				if($.trim(e.title)==""){
					legal = false;
					$(".msg-item:eq("+i+")").find(".edit").trigger("click");
					Util.alert("请填写消息标题");
					return false;
				}
				if($.trim(e.title)=="" || $.trim(e.url)=="http://"){
					legal = false;
					$(".msg-item:eq("+i+")").find(".edit").trigger("click");
					Util.alert("请填写链接地址");
					return false;
				}
			});
			if(!legal) return false;
			$.ajax({
				url:"updateBindSalesWords.json",
				data:{
					bindSalesWords:JSON.stringify(autoReplay)
				},
				success:function(data){
					if(data.status=="0"){
						Util.alert('<div class="tc">设置成功</div><div class="qrcodeDia"><img src="'+(data.qrcode ? data.qrcode.qrcode_url : '')+'" /><div class="welcomeSetedTip"><p>扫描左侧二维码</p><p>预览效果</p></div></div>');
					}else{
						Util.alert(data.errmsg?data.errmsg:"系统繁忙，请稍后再试");
					}
				}
			});
		})
	}
}
page.init();
