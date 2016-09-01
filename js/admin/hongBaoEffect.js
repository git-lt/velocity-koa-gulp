var HBInfo=function(){
	this.winNum=0; 					//获奖数
	this.cpNams=''; 				//名称
	this.orderCount=0; 				//总的订单名称
	this.orderAmount=0; 			//总的订单金额
	this.activityStatus='已关闭'; 	//红包状态
	this.dp = ''; 					//点评
};

// 修复小数相加的bug
function numAdd(num1, num2){
	var baseNum, baseNum1, baseNum2;

	try{
		baseNum1 = num1.split('.')[1].length;
	}catch(e){
		baseNum1 = 0;
	}

	try{
		baseNum2 = num2.split('.')[1].length;
	}catch(e){
		baseNum2 = 0;
	}

	baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));

	return (num1 * baseNum + num2 * baseNum)/baseNum;
}

var p_HBEffect={
	o:{},
	init:function(){
		this.getHBData();
		this.showDetailEv();
	},
	getHBData:function(){
		var self = this;
		$.post('queryExecutedCouponPackPromotionBySupplierId.json', {index:0, length:30}, function(data){
			if(data.result.count>0){
				$.proxy(self.processHBData, self, data)();
				var pms = {index:0, length:20};
				// 初始化分页控件
				$('#navPage').data({'opt':pms, 'url':'queryExecutedCouponPackPromotionBySupplierId.json'});

				var totalP = Math.ceil(data.result.count/20);
				if(totalP<=1) return false;
				$('#navPage').data('twbs-pagination','').off().empty().twbsPagination({
				    totalPages: totalP,
				    startPage: 1,
				    visiblePages: 5,
				    onPageClick:function(e, num){
				        // 异步获取数据并渲染 
				        var info = $('#navPage').data(),
				            opt = info.opt,
				            postUrl = info.url;
				        opt.index = (num-1)*opt.length;

				        $.ajax({
				            url:postUrl,
				            data:opt,
				            method:'POST'
				        }).done(function(data){
				            $.proxy(self.processHBData, self, data)();
				        });
				    }
				});
			}
		});
	},
	processHBData:function(ajaxRes){
		var self = this;
		var hbData = ajaxRes.result.couponPackPromotionList,
			hbComment='', //点评
			useageRate=0; //使用率
		for(var i in hbData){
			var thbInfo = new HBInfo(), nowD = new Date().getTime(), lqRate=0, syRate=0;

			// 处理状态
			if(hbData[i].couponPromotion.promotionStatus===0){
				var st = hbData[i].couponPromotion.startTime, et = hbData[i].couponPromotion.endTime;
				if(st<=nowD && nowD<=et){
					thbInfo.activityStatus = '活动中';
				}else{
					thbInfo.activityStatus = '已结束';
				}
			}

			// 处理统计
			for(var k in hbData[i].couponPackDetailVoList){
				thbInfo.winNum +=(~~hbData[i].couponPackDetailVoList[k].couponPackDetail.winingCount);
				thbInfo.cpNams += '满'+hbData[i].couponPackDetailVoList[k].coupon.orderLimitValue+'元减'+hbData[i].couponPackDetailVoList[k].coupon.couponValue+'元<br/>';
				thbInfo.orderCount = (~~hbData[i].couponPackDetailVoList[k].coupon.orderCount);
				thbInfo.orderAmount = (hbData[i].couponPackDetailVoList[k].coupon.orderPayment|| '0.00');
			}

			if(!(~~thbInfo.winNum)){
				thbInfo.usageRate = '0.00%';
			}else{
				thbInfo.usageRate = ((thbInfo.orderCount / thbInfo.winNum) * 100).toFixed(2)+'%';
			}

			// 【领取率点评】领取率=领取数/发放数量
			if(!(~~hbData[i].couponPromotion.totalLimitCount)){
				lqRate =0;
			}else{
				lqRate = (thbInfo.winNum / hbData[i].couponPromotion.totalLimitCount *100).toFixed(2);
			}
			
			lqRateStr = self.getReceiveRateMsg(~~lqRate);

			// 【使用率点评】使用率=已使用优惠券/已发放优惠券
			if(thbInfo.winNum==0){
				syRate = 0.00;
			}else{
				syRate = (thbInfo.orderCount / thbInfo.winNum *100).toFixed(2)-0;
			}
			syRateStr = self.getUsageRateMsg(syRate);
			
			var dp = '本次抢红包活动中，总计发放 '+hbData[i].couponPromotion.totalLimitCount+' 个红包，共有 '+hbData[i].couponPromotion.totalReceiveCount+' 人参与活动， '+thbInfo.winNum+' 人抽中了红包。'+lqRateStr+'优惠券使用率为 '+syRate+'% ，'+syRateStr;
			thbInfo.dp = dp;
			hbData[i].hbInfo = thbInfo;
		}
		template.config('escape', false);
		$('#hbefctTbody').html(template('hbEfTPl', {list:ajaxRes.result.couponPackPromotionList}));
	},
	getReceiveRateMsg:function(receiveRate){
		var msg = '';
		if(receiveRate == 100){
			msg="活动效果很不错，下次建议增加红包内优惠券数量。";
		}
		else if(30<receiveRate&&receiveRate<100){
			msg = "活动效果较好，下一轮红包建议参考此红包设置。";
		}
		else if(15<receiveRate&&receiveRate<30){
			msg = '活动效果尚可，建议增加公众号群发通知、线下活动推广吸引更多会员<a href="https://qiakr.kf5.com/posts/view/39901/" target="_blank">[如何提高红包领取率]</a>。';
		}
		else{
			msg = '还有很多红包没发完呢，建议增加公众号群发通知、线下活动推广<a href="https://qiakr.kf5.com/posts/view/39901/" target="_blank">[如何提高红包领取率]</a>。'
		}
		return msg;
	},
	getUsageRateMsg:function(usageRate){
		var msg = '';
		if(usageRate>5){
			msg = '优惠券比较有吸引力，持续保持。';
		}
		else if(1.5<=usageRate&&usageRate<=5){
			msg = '使用率尚可。';
		}
		else{
			msg = '使用率偏低，建议增加增加促销活动，如商品专题刺激用户提高优惠券使用率<a href="https://qiakr.kf5.com/posts/view/39902/" target="_blank">[如何提高优惠券使用率]</a>。';
		}
		return msg;
	},
	showDetailEv:function(){
		$('#hbefctTbody').on('click','.show-detail', function(){
			$('#hbDetail'+$(this).data('hbid')).toggle();
		});
	}
};

p_HBEffect.init();

