$.createSecondMenu("promotion_manage","抢红包");
function getDateDiff(startTimeUnix, endTimeUnix){
    var dataSpan = endTimeUnix - startTimeUnix;

    //计算出相差天数
    var days=Math.floor(dataSpan/(24*3600*1000))
     
    //计算出小时数
    var leave1=dataSpan%(24*3600*1000)    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000))
    //计算相差分钟数
    var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000))
    //计算相差秒数
    var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000)

   return {
    d:days,
    h:hours,
    m:minutes,
    s:seconds
   };
}

var p_qhb={
	o:{
		hasActivityHB:false,
		status:0 //0：无活动，1：未开始 2：活动中
	},
	init:function(){
		this.initHBData();
		this.hbCloseEv();
		this.getLinkEv();
	},
	initHBData:function(){
		var o = this.o, self = this;
		var pms = {
			index:0,
			length:100,
			promotionType:4
		};
		var dataUrl = 'queryCouponPackPromotionBySupplierId.json';
		// 获取当前红包活动数据
		$.getJSON(dataUrl,pms,function(data){
			if(data.status==='0'){
				var hbList = data.result.couponPackPromotionList || [];
				o.status = 0; //没有活动
				if(hbList.length){
					o.status = 1;
					// 判断当前时间是否在活动中
					var dateNow = new Date().getTime(), currHB = {};
					for(var i in hbList){
						if(hbList[i].couponPromotion.startTime<=dateNow && dateNow<=hbList[i].couponPromotion.endTime){
							hbList[i].todyTxt = '今日'; 
							currHB = hbList[i];
							o.status = 2;
							break;
						}
					}
					$('#hbListBox').html(template('hbCPListTpl',{list:hbList}));

					switch(o.status){
						case 0: $('#hbEnd').show(); break;//没有红包活动
						case 1: //活动未开始
							var t, tStr, $tBox = $('#hbNotBeginTime');
							(function(){
							    t= getDateDiff(new Date().getTime(),hbList[0].couponPromotion.startTime);
							    if(t.d+t.h+t.m+t.s==0){
							        // 隐藏当前面页面，显示活动中
							        $('#hbNotBegin').hide();
							        $('#hbIng').fadeIn();
							    }else{
							        t.h = t.h<10?'0'+t.h:t.h;
							        t.m = t.m<10?'0'+t.m:t.m;
							        t.s = t.s<10?'0'+t.s:t.s;
							        tStr = '<b>'+t.d+'</b>天<b>'+t.h+'</b>小时<b>'+t.m+'</b>分<b>'+t.s+'</b>秒';
							        $tBox.html(tStr);
							        setTimeout(arguments.callee,1000);
							    }
							})();
							$('#hbNotBegin').show(); 
							break;
						case 2: 
							// 获取最大红包的金额
							var bigHB=0;
							for(var x in currHB.couponPackDetailVoList){
							    if(currHB.couponPackDetailVoList[x].coupon.couponValue>bigHB)
							        bigHB = currHB.couponPackDetailVoList[x].coupon.couponValue;
							}
							$('#bigHBVal').text(bigHB);
							$('#hbIng').show();
							break; //活动中
					}

					// 后台没有分页，暂隐
					// var totalP = Math.ceil(hbList.length/pms.length);
					// if(totalP>1){
					// 	$('#navPagesNumBox').data({'opt':pms, 'url':dataUrl});
					// 	$('#navPagesNumBox').data('twbs-pagination','').off().empty().twbsPagination({
					// 	    totalPages: totalP,
					// 	    startPage: 1,
					// 	    visiblePages: 10,
					// 	    onPageClick:function(e, num){
					// 	        var info = $('#navPagesNumBox').data(),
					// 	            opt = info.opt,
					// 	            postUrl = info.url;
					// 	        opt.index = (num-1)*opt.length;
					// 	        $.ajax({
					// 	            url:postUrl,
					// 	            data:opt,
					// 	            dataType:'json',
					// 	            method:'POST'
					// 	        }).done(function(data){
					// 	        	var hbList = data.result.couponPackPromotionList || [];
					// 				var dateNow = new Date().getTime(), currHB = {};
					// 				for(var i in hbList){
					// 					if(hbList[i].couponPromotion.startTime<=dateNow && dateNow<=hbList[i].couponPromotion.endTime){
					// 						hbList[i].todyTxt = '今日'; 
					// 						currHB = hbList[i];
					// 						o.status = 2;
					// 						break;
					// 					}
					// 				}
					// 				$('#hbListBox').html(template('hbCPListTpl',{list:hbList}));
					// 	        });
					// 	    }
					// 	});
					// }
				}else{
					$('#hbEnd').show();
					$('#hbListBox').html('<p class="c-8">暂无红包活动！</p>');
					// $('#navPagesNumBox').empty();

				}
			}
		});
	},
	hbCloseEv:function(){
		$('#hbListBox').on('click','.hb-close',function(){
			var $this = $(this), hbid = $this.parent().data('hbid');
			if(!hbid) return;
			Util.confirm('是否确定要删除此红包活动！？', function(){
				// 获取hbid
				$.post('closeCouponPromotion.json',{couponPromotionId:hbid}, function(data){
					if(data.status==='0'){
						$this.parents('.hb-list-item').fadeIn(400, function(){
							$(this).remove();
							if($('#hbListBox').children().length===0){
								$('#hbListBox').html('<p class="c-8">暂无红包活动！</p>');
							}
						});
					}
				});
			})	
		});
	},
	getLinkEv:function(){
		// 拼接活动链接，设置到input
		// 用成二维码
		var link ='http://www.qiakr.com/mall/qiangHongBao.htm?suid='+$('#suid').val();
	    var qrcode = new QRCode(document.getElementById("rwmImg"), {
	         width : 200,
	         height : 200
	    });
	    qrcode.makeCode(link);
		$('#hbLinkIpt').val(link);
		
		$('#getHBLinkBtn').on('click', function(){
			dialog({
				title:'获取活动链接',
				content:$('#copyHBDia'),
            	backdropOpacity:"0.5",
            	width:500
			}).showModal();

			$("#copyHBLink").zclip({
			    path: "//res.qiakr.com/plugins/zclip/zclip.swf",
			    copy: function(){
			    	return $('#hbLinkIpt').val();
			    },
			    setCSSEffects:false,
			    beforeCopy:function(){
					$(this).css('background','#449d44');
				},
			    afterCopy:function(){/* 复制成功后的操作 */
			    	$(this).val('复制成功');
			    }
			});
		});
	}
};

p_qhb.init();
