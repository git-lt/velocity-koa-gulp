var p_sharePhoto,sharPhotoConf,sharePhotoVM, commentsVM;

sharPhotoConf = {
	getSharePhotoInfoUrl: 'getSharePhotoInfo.json', 			//获取晒搭配信息
	getSharePhotoPraiseList: 'getSharePhotoPraiseList.json',	//查询点赞列表
	deleteSharePhotoPraise:  'deleteSharePhotoPraise.json', 	//取消点赞
	insertSharePhotoPraise: 'insertSharePhotoPraise.json', 		//点赞
	getSharePhotoCommentList: 'getSharePhotoCommentList.json', 	//查询评论
	deleteSharePhotoComment: 'deleteSharePhotoComment.json', 	//删除评论
	insertSharePhotoComment: 'insertSharePhotoComment.json', 	//添加评论
	sharePhotoId: getUrlParam('sharePhotoId') || '11',
	userId : $("#userId").val(),
	delivery : "0"
};
if(getUrlParam("salesId")||getUrlParam("owner")){
    sessionStorage.salesId = getUrlParam("salesId")||getUrlParam("owner");
}

p_sharePhoto= {
	init:function(){
		if(sharPhotoConf.sharePhotoId===''){ return; }
		this.getSharePhotoInfo();
		this.getCommentList();
		this.confirmSkuInfo($("#confirmSkuInfo"));
	},
	getSharePhotoInfo:function(){ //搭配详情
		var self= this, 
			pms = {
				sharePhotoId:sharPhotoConf.sharePhotoId
			};

		$.post(sharPhotoConf.getSharePhotoInfoUrl, pms, function(data){
			if(data.status==='0'){
				var d = data.result.sharePhotoVo;
				if(!d.recentPraiseList){
					// 未获取到晒搭配信息
					return;
				}
				var stockVoList = data.result.stockVoList; //商品列表
				d.sharePhoto.photoUrl =JSON.parse(d.sharePhoto.photoUrl); //图片
				d.sharePhoto.propertyJson=JSON.parse(d.sharePhoto.propertyJson); //标签
				sharPhotoConf.delivery = d.sharePhoto.shareLimitDelivery;
				self.initSharePhotoVM(d,stockVoList);
				self.processSKU(stockVoList);
				$.mggScrollImg('.main_image ul',{
			        loop : true,//循环切换
			        auto : true//自动切换
			    });
			}
		});
	},
	getCommentList:function(){ //评论列表
		var pms = {
			sharePhotoId:sharPhotoConf.sharePhotoId,
			index:'0',
			length:'3'
		}, self = this;
		$.getJSON(sharPhotoConf.getSharePhotoCommentList,pms, function(data){
			if(data.status==='0'){
				var d  = data.result.sharePhotoCommentVoList;
				$(".inter-comment .cnt b").html(data.result.count);
				self.initCommentsVM(data.result.count,d);
			}
		});
	},
	initSharePhotoVM:function(d,stockList){
		sharePhotoVM = avalon.define({
			$id:'sharePhotoCtr',
			photoData:{
				content: d.sharePhoto.content,
				id: d.sharePhoto.id,
				photoUrl:d.sharePhoto.photoUrl,
				propertyJson: d.sharePhoto.propertyJson,
				totalPrice: d.sharePhoto.totalPrice,
				praiseCustomer : d.praiseCustomer,
				allPraiseCount : d.allPraiseCount,
				sales : d.sales,
				createTime : d.sharePhoto.gmtCreate,
				picArray : JSON.parse(d.sharePhoto.picArray),
				width:document.body.clientWidth
			},
			recentPraiseData:d.recentPraiseList,
			stokeListData:stockList,
			givePraise:function(){
				if(!sharPhotoConf.userId){
					showMPLoginBox(function(){
						location.reload();
					});
					return false;
				}
				var obj = $(this);
				if(obj.hasClass("active")){
					$.getJSON("deleteSharePhotoPraise.json?sharePhotoId="+sharPhotoConf.sharePhotoId,function(data){
						if(data.status==0){
							obj.removeClass("active").html('<i class="iconfont fs18">&#xe622;</i> <span class="cnt">赞</span>');
							$(".clc-zan-avators .zan-num").html(Number($(".clc-zan-avators .zan-num").text())-1);
							$(".clc-zan-avators .avator").each(function(i,e){
								if($(e).data("id")==sharPhotoConf.userId){
									$(e).remove();
									return false;
								}
							});
						}
					});
				}else{
					$.getJSON("insertSharePhotoPraise.json?sharePhotoId="+sharPhotoConf.sharePhotoId,function(data){
						if(data.status==0){
							$(".clc-zan-avators .zan-num").html(Number($(".clc-zan-avators .zan-num").text())+1);
							obj.addClass("active").html('<i class="iconfont fs18">&#xe621;</i> <span class="cnt">已赞</span>')
							$(".clc-zan-avators").prepend('<a href="javascript:;" class="avator fl dib" data-id="'+sharPhotoConf.userId+'" data-role="customer" style="background-image: url('+$("#userAvatar").val()+');"></a>')
						}
					});
				}
			},
			preViewComment:function(){
				$("body").scrollTop(10000);
			},
			getSharePhotoList:function(){
				var role = $(this).data("role"),id = $(this).data("id");
				if(role=="sales"){
					location.href="getSharePhotoList.htm?salesId="+id;
				}else if(role=="customer"){
					location.href="getSharePhotoList.htm?customerId="+id;
				}else{

				}
			},
			buySharePhoto:function(){
				$.msg.popup({
					title:"请选择商品规格信息",
					content:$("#skuListWrap").show().remove()[0],
					cacheIns:true,
					onOpened:function(){
						avalon.scan($("#selectSkuList")[0]);
						setTimeout(function(){
							$("#selectSkuList>.item").each(function(i,e){
								$(e).find(".colorBox b:first").click();
								$(e).find(".colorBox b:first").trigger("click");
								$(e).find(".sizeBox b").not(".disable").eq(0).trigger("click");
							});
						},100);
					}
				});
				if($("#selectSkuList").height() > $(window).height()-84){
					$("#confirmSkuInfo").css("position","static");
				}
			},
			viewStock:function(){
				location.href="getStockInfoForCustomer.htm?stockId="+$(this).data("id")+"&salesId="+sessionStorage.salesId;
			}
		});
		avalon.scan();
	},
	initCommentsVM:function(count,commentsData){
		avalon.filters.getReplyName=function(item){
			if(item.toCustomer || item.toSales){
				return '@'+(item.toCustomer || item.toSales).name+'：';
			}
			return '';
		}
		commentsVM = avalon.define({
			$id:'commentsCtr',
			count:count,
			data:commentsData,
			sharePhotoId:sharPhotoConf.sharePhotoId,
			toRole:"",
			toRoleId:"",
			addComment:function(){
				if(!sharPhotoConf.userId){
					showMPLoginBox(function(){
						location.reload();
					});
					return false;
				}
				var comment = commentInfact = $.trim($("#commentInput").val()), r = new RegExp(/@.*：/);
				if(comment == ""){
					$("#commentInput").focus();
					return false;
				}
				var data = {
					sharePhotoId:sharPhotoConf.sharePhotoId
				}
				if(r.test(comment)){
					comment = comment.replace(r,"");
					if(commentsVM.$model.toRole=="customer"){
						data.toCustomerId = commentsVM.$model.toRoleId
					}else{
						data.toSalesId = commentsVM.$model.toRoleId
					}
				}
				data.commentContent = comment;

				$.post(sharPhotoConf.insertSharePhotoComment,data,function(data){
					if(data.status=="0"){
						mobileAlert("评论成功",1000);
						var commentHtml = '<li class="p10 item ovh bde4-t" data-id="'+sharPhotoConf.userId+'" data-role="customer">\
							<span class="avator-img fl mr10" style="background-image: url('+$("#userAvatar").val()+');"></span>\
							<div class="cmts-info ovh">\
								<span class="tit block mb5">'+$("#userName").val()+'</span>\
								<span class="block c-8 fs13">'+commentInfact+'</span>\
							</div>\
						</li>';
						$(".clc-comments-list ul").prepend(commentHtml);
						var newCount = Number($(".inter-comment .cnt b").text())+1;
						$(".inter-comment .cnt b").html(newCount);
						$(".clc-comments-list .cmtCount").html("评论"+newCount);
						$("#commentInput").val("");
						$("#commentEmpty").html("评论1")
					}
				});
			},
			replyComment:function(obj){
				var _t = $(obj);
				var role = _t.data("role"),id = _t.data("id"),name = _t.find(".tit").text();
				if(id == sharPhotoConf.userId){
					return false;
				}
				commentsVM.$model.toRole = role;
				commentsVM.$model.toRoleId = id;
				$("#commentInput").val("@"+name+"：").focus();
			}
		});
		avalon.scan($('#cmtsListBox')[0]);
	},
	processSKU:function(stockVoList){
    	var normsNameList = ["","颜色","尺码","重量","版本","材质","尺寸","其它","段位","网络制式","类型","容量","型号","日期","大小","座垫套件数量","钻石重量","钻石颜色","钻石净度","组合","自定义项","种类","纸张规格","珍珠直径","珍珠颜色","遮阳挡件数","长度","圆床尺寸","雨刷尺寸","有效期","邮轮房型","绣布CT数","胸围尺码","胸垫尺码","鞋码（内长）","鞋码","镶嵌材质","香味","线长","线号","线材长度","系列","洗车机容量","袜子尺码","娃娃尺寸","套餐","手镯内径","适用年龄","适用户外项目","适用规格","适用范围","适用床尺寸","适用","剩余保质期","上市时间","色温","伞面尺寸","撒的发","入住时段","皮带长度","内裤尺码","内存","奶嘴规格","帽围","毛色","链子长度","类型（例如实体票,电子票）","款式","口味","克重","开本","镜子尺寸","镜片适合度数","净含量","金重","戒圈","介质","建议身高（尺码）","吉祥图案","机芯","画框尺寸","画布尺寸","花束直径","花盆规格","户外手套尺码","户外帽尺码","锅身直径尺寸","锅具尺寸","贵金属成色","规格尺寸","规格（粒/袋/ml/g）","规格","功率","佛珠尺寸","粉粉份量","房型","防潮垫大小","方形地毯规格","儿童/青少年床尺寸","钓钩尺寸","蛋糕尺寸","大小描述","瓷砖尺寸（平方毫米）","床品尺寸","床垫厚度","床垫规格","床尺寸","窗帘尺寸（宽X高)","出行日期","出行人群","出发日期","宠物适用尺码","乘客类型","车用香水香味","产地","布尿裤尺码","笔芯颜色","包装","安全套规格","类别","次数","服务类型","金额","木杆","铁杆","推杆","分类"];
		var items=[],seldSkuArr = [];
		$.each(stockVoList,function(i,e){
			var item = {
				id : e.stock.id,
				name : e.stock.productName,
				img : e.stock.productPicUrl,
				code : e.product.productCode,
				tagPrice : e.stock.tagPrice,
				count : e.stock.count,
				skuList : e.stockSkuVoList,
				norms1Id : e.productSupplier.norms1Id,
				norms2Id : e.productSupplier.norms2Id,
				norms1Name : normsNameList[e.productSupplier.norms1Id],
				norms2Name : normsNameList[e.productSupplier.norms2Id],
				norms1List : [],
				norms2List : []
			}
			$.each(e.stockSkuVoList,function(j,t){
				if($.inArray(t.productSku.color,item.norms1List) < 0){
					if(item.norms2Id){
						item.norms1List.push(t.productSku.color);
					}else{
						if(t.stockSku.skuCount > 0){
							item.norms1List.push(t.productSku.color);
						}
					}
				}
				if($.inArray(t.productSku.size,item.norms2List) < 0){
					item.norms2List.push(t.productSku.size);
				}
			});
			items.push(item);
			seldSkuArr.push({
				id: e.stock.id,
				name : e.stock.productName,
				img : e.stock.productPicUrl,
				code : e.product.productCode,
				price : e.stock.marketPrice,
				count : "1",
				color:"默认",
				size:"默认",
				skuId: (!item.norms2Id && !item.norms1Id) ? item.skuList[0].stockSku.skuId : ""
			});
		});
		console.log(items)
		sharePhotoSkuVM = avalon.define({
			$id:'sharePhotoSkuCtr',
			stokeSkuData : items,
			selectSkuData : seldSkuArr,
			colorSelectEv:function(a,e){
				var _t = $(this),item = $(this).closest(".item");
				if(_t.hasClass("ac") || _t.hasClass("disable")) return false;
				var  _idx = _t.closest(".item").index(), 
					size = sharePhotoSkuVM.$model.selectSkuData[_idx].size,
					color = _t.text(),
					skuList = items[_idx].skuList;
				sharePhotoSkuVM.$model.selectSkuData[_idx].color = color;
	
				_t.addClass("ac").siblings().removeClass("ac");

				// 解决微信浏览器，改变class不重新渲染的BUG
				$('.ui-msg-hd .title').text($('.ui-msg-hd .title').text());
				
				if(_t.closest(".skuMsg").find(".sizeBox b").length > 0){
					_t.closest(".skuMsg").find(".sizeBox b").removeClass("disable").each(function(i,e){
						var _b = $(this), val = _b.text();
						$.map(skuList,function(s){
							if(s.productSku.color == color && s.productSku.size == val && s.stockSku.skuCount < 1){
								_b.addClass("disable");
							}
							if(s.productSku.color == color && s.productSku.size == size){
								sharePhotoSkuVM.$model.selectSkuData[_idx].skuId = s.stockSku.skuId;
							}
						});
					});
				}else{
					$.map(skuList,function(s){
						if(s.productSku.color == color && s.productSku.size == size){
							sharePhotoSkuVM.$model.selectSkuData[_idx].skuId = s.stockSku.skuId;
						}
					});
				}
				// console.log("color="+color+" && size="+size+" && skuId="+sharePhotoSkuVM.$model.selectSkuData[_idx].skuId)
			},
			sizeSelectEv:function(a,e){
				var _t = $(this),item = $(this).closest(".item");
				if(_t.hasClass("ac") || _t.hasClass("disable")) return false;
				var  _idx = _t.closest(".item").index(), 
					color = sharePhotoSkuVM.$model.selectSkuData[_idx].color,
					size = _t.text(),
					skuList = items[_idx].skuList;
				sharePhotoSkuVM.$model.selectSkuData[_idx].size = size;
				$('.ui-msg-hd .title').text($('.ui-msg-hd .title').text());
				_t.addClass("ac").siblings().removeClass("ac");
				_t.closest(".skuMsg").find(".colorBox b").removeClass("disable").each(function(i,e){
					var _b = $(this), val = _b.text();
					$.map(skuList,function(s){
						if(s.productSku.size == size && s.productSku.color == val && s.stockSku.skuCount < 1){
							_b.addClass("disable");
						}
						if(s.productSku.color == color && s.productSku.size == size){
							sharePhotoSkuVM.$model.selectSkuData[_idx].skuId = s.stockSku.skuId;
						}
					});
				});
			}
		});
	},
	confirmSkuInfo:function(obj){
		obj.on("click",function(){
			var suid = sharePhotoVM.$model.stokeListData[0] ? sharePhotoVM.$model.stokeListData[0].productSupplier.supplierId : "";
			var sharePhotoInfo = {
				delivery:sharPhotoConf.delivery,
				storeId: $("#storeId").val(),
				totalPrice : sharePhotoVM.$model.photoData.totalPrice,
		        supplierId : suid,
		        sharePhotoId : sharPhotoConf.sharePhotoId,
		        stockList : sharePhotoSkuVM.$model.selectSkuData
			}
		    if(sessionStorage.isLogin == "false" || !sharPhotoConf.userId){
		        showMPLoginBox(function(){
		          	obj.trigger("click");
		        },sharePhotoInfo.supplierId);
		        return false;
		    }
			$.post('getCustomerCard.json',{supplierId:suid},function(data){
	            if(data.status==='0'){
	                if(!data.result.customerCard || !data.result.customerCard.cardNo) {
	                    require(["../js/mall/regVip.js"],function(Vip){
	                        Vip.regVip({
	                            quickClose:false,
	                            external: data.result.external,
	                            suid:suid,
	                            successFn:function(){
	                            	sessionStorage.sharePhotoInfo = JSON.stringify(sharePhotoInfo);
								    window.location.href="confirmOrderOfSharePhoto.htm?suid="+sharePhotoInfo.supplierId;
	                            }
	                        });
	                    });
	                }else{
	                	sessionStorage.sharePhotoInfo = JSON.stringify(sharePhotoInfo);
						window.location.href="confirmOrderOfSharePhoto.htm?suid="+sharePhotoInfo.supplierId;
	            	}
	            }
	        });
		});
	}

};

p_sharePhoto.init();
