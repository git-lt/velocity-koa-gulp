FAST_CLICK && $.bindFastClick();
var $addTagsBtn = $('#addNewTag'),
	G_orderId = getUrlParam("orderId"),
	G_salesId = $('#salesId').val() || getUrlParam('salesId'),
	G_appointmentId = getUrlParam("appointmentId");
// 索引数组去重
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}
// 索引数组中随机取n个不重复的值
function random4Arr(arr, count){
	var num = count || 1;
	var tObj={}, resArr=[], x=0;
	do{
		var rVal = arr[Math.floor(Math.random()*arr.length)];
		if(!tObj[rVal]){
			tObj[rVal] = true;
			resArr.push(rVal);
			x++;
		}
	}while(x<count);
	return resArr;
}

var p_addSalesTag = {
	init:function(){
		this.initDiamondsNum();
		this.getTags();
		this.addNewTagEv();
		this.chkTagEv();
		this.markedEv();
		this.saveAppraiseEv();
	},
	initDiamondsNum:function(){
		// if(formPayOrder){
		// 	$('#appraiseNone').hide();
		// 	$('#appraiseYes').show();
		// 	// $('#pjWrap .iconfont').slice(0,G_num).addClass('active');
		// 	$('#diamondsNum').text('0');
		// }else{
			$('#appraiseNone').show();
			$('#appraiseYes').hide();
		// }
	},
	createQRCode:function(){
		var qrCodeTxt = $('#salesQRcode').val();
		if(qrCodeTxt){
			var qrcode = new QRCode(document.getElementById("salesQRcodeBox"), {
			     width: 120,
			     height: 120
			 });
			qrcode.makeCode(qrCodeTxt);
		}
	},
	getTags:function(){
		var t = 0, tagArr = [], self = this;
		$.post('getRandomTagListBySaleId.json',{salesId:G_salesId, length:6+''},function(data){
			if(data.status==='0'){
				var tagList = data.result.randomTagList;
				if(tagList && tagList.length){
					tagArr = tagArr.concat(tagList);
				}
				++t===2 && self.renderTags(tagArr);
			}
		});
		$.post('getSalesTagCountList.json',{salesId:G_salesId, length:6+''},function(data){
			if(data.status==='0'){
				var tagList = data.result.salesTagCountList;
				if(tagList && tagList.length){
					for(var x in tagList){
						tagArr.push(tagList[x]['tag']);
					}
				}
				++t===2 && self.renderTags(tagArr);
			}else{
				console.log('获取标签失败！')
			}
		});
	},
	renderTags:function(tagArr){
		if(!tagArr.length) return;
		tagArr = unique(tagArr);
		var tagHtml = tagArr.map(function(v, i){
			return '<li class="btn tag">'+v+'</li>';
		}).join('');

		$addTagsBtn.before(tagHtml);
	},
	saveAppraiseEv:function(){
		if(G_appointmentId=='' &&  G_orderId==''){
			mobileAlert('请求地址错误');
			return false;
		};

		$('#saveAppraise').on('click', function(){
			var n = $('#pjWrap .iconfont.active').length;
			var tags = [];
			$('#tagList .active').each(function(i,v){
				tags.push($(v).text());
			});
	  		
	  		if(G_appointmentId!=''){
	  			var apms = {
	  				appointmentId:G_appointmentId,
	  				tagListJson:JSON.stringify(tags),
	  				type:1,
	  				comment:'',
	  				salesId:G_salesId
	  			};
	  			$.post('insertAppraiseAppointment.json', apms, function(data){
	  				if(data.status === '0'){
	  					mobileAlert('评价成功！','',function(){
	  						window.location.href="appointmentDetail.htm?id="+G_appointmentId
	  					});
	  				}else{
	  					mobileAlert(data.errmsg || '服务器繁忙，请稍候重试！');
	  				}
	  			});
	  		}else{
			  	var param = {
				    stars : n,
				    type : n>=3 ? "1" : (n == 2 ? "5" : "9"),
				    salesId : G_salesId,
				    orderId : G_orderId,
				    comment:'',
				    tagListJson:JSON.stringify(tags)
		  		};
	  			$.post('insertAppraise.json', param, function(data){
	  				if(data.status === '0'){
	  					mobileAlert('评价成功！','',function(){
	  						window.location.href="getOrderInfoOfCustomer.htm?orderId="+G_orderId
	  					});
	  				}else{
	  					mobileAlert(data.errmsg || '服务器繁忙，请稍候重试！');
	  				}
	  			});
	  		}
		})
	},
	markedEv:function(){
		var $c = $('#pjWrap').children(), cI, t=true;
		$('#pjWrap').on('click', '.iconfont', function(){
			if(t){
				$('#appraiseNone').hide();
				$('#appraiseYes').show();
				t = false;
			}
			cI = $(this).index()+1;
			$c.removeClass('active').slice(0, cI).addClass('active');
			// 更新分数
			$('#diamondsNum').text(cI);
		})
	},
	chkTagEv:function(){
		$('#tagList').on('click', '.tag', function(){
			$(this).toggleClass('active');
		})
	},
	addNewTagEv:function(){
		$addTagsBtn.on('click', function(){
			$.msg.prompt('请描述您对TA的印象','服务超赞', function(oThis, v){
				var vStr = v.trim();
				var vLen=vStr.length;
				if(vLen===0){
					oThis.close();
					return true;
				} else if(vLen>9){
					mobileAlert('输入过长，请输入1到9个字符！');
					oThis.$body.find('input').focus();
					return false;
				}else{
					var allTags = [];
					$('#tagList li.tag').each(function(i, v){
						allTags.push($(v).text());
					});
					
					if(allTags.indexOf(vStr)>-1){
						$("#tagList li.tag:contains('"+vStr+"')").addClass('active');
					}else{
						$addTagsBtn.before('<li class="btn mb10 tag active">'+vStr+'</li>');
					}
					oThis.close();
					return true;
				}
			});
		})
	}
};

p_addSalesTag.init();