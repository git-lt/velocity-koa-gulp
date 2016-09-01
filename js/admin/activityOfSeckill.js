document.title="洽客-天天闪购"; 
$.createSecondMenu("promotion_manage","天天闪购");
Util.createHelpTip("天天闪购相关问题",[
	{"title":"天天闪购场景说明","link":"https://qiakr.kf5.com/posts/view/39416/"},
	{"title":"天天闪购活动设置","link":"https://qiakr.kf5.com/posts/view/39776/"},
	{"title":"如何推广闪购活动","link":"https://qiakr.kf5.com/posts/view/39904/"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);

template.helper('timeFormat', function (date, format) {
	date = Number(date);
    format = new Date(date).getHours()+":"+new Date(date).getMinutes()+":"+new Date(date).getSeconds();
    return format;
});

var p_createSpProm = {
	o:{
		promProList:{},
		promotionId:$("#promotionId").val()
	},
	init:function(){
		// $("#description").val($("#description").val().replace(/<br>/g,""));
		this.createPromotion();
		this.switchPromTab(); /*tab 切换事件*/
		this.switchTheme();
		this.listenEvent();
		this.initPromInfo(); /*加载初始信息[编辑]*/
		this.savePromotion();
		this.nextEv(); /*下一步*/
		this.stopPromotion();
		this.getLinkEv();
	},
	createPromotion:function(){
		var self = this;
		if(!self.o.promotionId && $("#promSettingBox").length>0){
			var param = $("#promotionInfoForm").serializeObject();
			param.description = param.description.replace(/[\n]/g,"<br>");
			$.ajax({
				url:"createFlashsalePromotion.json",
				data:param,
				success:function(data){
					if(data.status=="0"){
						$("#promotionId").val(data.result.promotionId);
						$("#selectPro").attr("href","activityOfSeckillStock.htm?promotionId="+data.result.promotionId)
						self.o.promotionId = data.result.promotionId;
						$('#promSettingBox .filterTitle a').last().trigger('click');
					}
				}
			});
		}
	},
	switchPromTab:function(){
		var self = this;
		$('#promSettingBox .filterTitle').on('click','a',function(){
			var $this = $(this),i=$this.index();
			$this.addClass('current').siblings().removeClass('current');
			$('#promTabConBox').children().removeClass('active').eq(i).addClass('active');
			if(i==0 && $(".webuploader-pick").length==0){
				self.initUploadImg(); /*上传组件初始化*/
			}
		});
		if(this.o.promotionId){
			$('#promSettingBox .filterTitle a').last().trigger('click');
		}
	},
	switchTheme:function(){
		$(".theme label").on("click",function(){
			var color=$(this).data("color");
			$(this).addClass("ac").siblings().removeClass("ac");
			$("#themeInput").val(color);
			$(".pv-device-bd").css("background-color",'#'+color);
			if(color=="fff"){
				$(".pv-device-bd").addClass("white");
			}else{
				$(".pv-device-bd").removeClass("white");
			}
		});
	},
	initUploadImg:function(){
		$("#previewUpload").singleImgUploader({
		    resultInput : $("#productPicUrl"),
		    width:640,
		    height:320,
		    callback:function(url){
		    	$(".pv-device-bd .pv-prom-banner").css("background-image","url("+url+"?imageView2/1/w/640/h/320)");
		    }
		});
	},
	listenEvent:function(){
		$("#promName").on("input propertychange",function(){
			$(".pv-device-hd .tit").html($(this).val());
		});
		$("#description").on("input propertychange",function(){
			$(".pv-device-bd .csp-list-box").html($(this).val().replace(/[\n\r]/g,"<br>"));
		});
	},
	savePromotion:function(){
		var self = this;
		$("#savePromotion").on("click",function(){
			var param = $("#promotionInfoForm").serializeObject();
			param.description = param.description.replace(/[\n]/g,"<br>");
			// console.log(param)
			if(self.checkBaseInfo()){
				$.ajax({
					url:"updateFlashsalePromotion.json",
					data:param,
					success:function(data){
						if(data.status=="0"){
							Util.alert("保存成功");
						}else{
							Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
						}
					}
				});
			}
		});
	},
	compare:function(key) { 
		return function (o1, o2) { 
			var value1 = o1[key]; 
			var value2 = o2[key]; 
			return value2 > value1 ? -1 : 1;
		}
	},
	initPromInfo:function(){
		var self=this,o = this.o;
		if(!o.promotionId) return false;
		$.getJSON("getFlashsaleBySupplier.json?promotionId="+this.o.promotionId,function(data){
			if(data.status === '0'){
				var time = data.result.nowtime,
					today = Util.getLocalTime(time,true);
				o.promProList["0"]=[];
				if(data.result.flashsaleVoList.length==0){
					$("#viewStockList").prepend('<div class="empty">暂无闪购活动<br>敬请关注</div>');
				}else{
					$.each(data.result.flashsaleVoList,function(i,e){
						var startTime = e.flashsaleStock.startTime,
							startDate = Util.getLocalTime(e.flashsaleStock.startTime,true),
							endTime = e.flashsaleStock.endTime,
							endDate = Util.getLocalTime(e.flashsaleStock.endTime,true);
						if((startTime < time && endTime>time) || startDate==today){
							o.promProList["0"].push(e);
						}else{
							if(!o.promProList[startTime]){
								o.promProList[startTime]=[];
							}
							o.promProList[startTime].push(e);
						}
					});
					var listArray=[];
					for(var item in o.promProList){
						listArray.push({
							time:item,
							now:time,
							data:o.promProList[item]
						});
					}
					listArray = listArray.sort(self.compare("time"));
					console.log(listArray);
					var stockHtml = template("stockTemp",{list:listArray});
					$(".pv-setting-two .stockList").prepend(stockHtml);
					var stockView = template("viewTemp",{list:listArray,now:time});
					$("#viewStockList").prepend(stockView);
				}
			}
		});
	},
	stopPromotion:function(){
		$(".pv-setting-two").on("click",".stop",function(e){
			var id = $(this).data("id");
			Util.confirm("确定要中途停止该商品的闪购活动？",function(){
				$.getJSON("stopFlashsalePromotion.json?promotionStockId="+id,function(data){
					if(data.status=="0"){
						Util.alert("已停止该活动",function(){
							location.reload();
						});
						setTimeout(function(){
							location.reload();
						},5000);
					}
				})
			},function(){})
		});
	},
	checkBaseInfo:function(){
		if($.trim($("#promName").val()) == ''){
			Util.alert('闪购标题不能为空');
			return false;
		}
		if($("#productPicUrl").val()==""){
			Util.alert('活动主图不能为空');
			return false;
		}
		if($.trim($("#description").val()).replace(/[\n\r]/g,"") == ''){
			Util.alert('活动说明不能为空！');
			return false;
		}
		return true;
	},
	nextEv:function(){
		var self = this;
		$('#promSettingNext').on('click', function(e){
			e.preventDefault();
			if(self.checkBaseInfo()){
				$('.filterTitle>a','#promSettingBox').last().trigger('click');
				return false;
			}
		});
	},
	getLinkEv:function(){
		// 拼接活动链接，设置到input
		// 用成二维码
		var link ='http://'+window.location.host+'/mall/activityOfSeckill.htm?suid='+$('#supplierId').val();

	     var qrcode = new QRCode(document.getElementById("rwmImg"), {
	         width : 200,
	         height : 200
	     });
	     qrcode.makeCode(link);
		$('#skLinkIpt').val(link);

		$('#getSKLinkBtn').on('click', function(){
			dialog({
				title:'获取活动链接',
				content:$('#copySKDia'),
            	backdropOpacity:"0.5",
            	width:500
			}).showModal();
			setTimeout(function(){
				$("#copyHBLink").zclip({
				    path: "//res.qiakr.com/plugins/zclip/zclip.swf",
				    copy: function(){
				    	return $('#skLinkIpt').val();
				    },
				    beforeCopy:function(){
						$(this).css('background','#449d44');
					},
				    afterCopy:function(){/* 复制成功后的操作 */
				    	$(this).val('复制成功');
				    }
				});
			},500);
			
		});
	}
};
p_createSpProm.init();


