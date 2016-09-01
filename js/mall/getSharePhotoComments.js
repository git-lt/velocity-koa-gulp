// pullRefresh 下拉刷新，上拉加载
// ==============================
	var PullRefresh=function(ele,options){
		this.$ele = $(ele);
		this.options = options;
		this.$upTips = this.$ele.find(options.pullUpCls).children();
		this.$downTips = this.$ele.find(options.pullDownCls).children();
		this.iScrollObj=null;
		this.upNum= 0;
		this.downNum= 0;
		this.isPullUp= false;
		this.loadingStep= 0;
		this.init();
	};

	PullRefresh.prototype={
		constructor:PullRefresh,
		init:function(){
			var self = this;
			this.iScrollObj = new IScroll(this.$ele[0],{
				probeType:2,
				scrollbars:false,		//有滚动条
				fadeScrollbars:false, 	//停止滚动时隐藏滚动条
				bounce:true,		 	//边界反弹
				interactiveScrollbars:true, //滚动条可以拖动
				shrinkScrollbars:'scale',// 当滚动的收缩效果
				click:self.options.click,				 // 允许点击事件
				momentum:true 			 // 有惯性滑动
			});
			!this.options.canPullDown && this.$downTips.parent().remove();
			!this.options.canPullUp && this.$upTips.parent().remove();
			this.addEvents(this);
			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		},
		addEvents:function(){
			var self = this;
			self.iScrollObj.on('scroll',function(){
				self.scrollEv.bind(this)(self);
			});
			self.iScrollObj.on('scrollEnd', function(){
				self.scrollEndEv.bind(this)(self);
			});
		},
		scrollEv:function(oThis){
			if(oThis.loadingStep===0){
				var $refreshTip,$icon;
				if(this.y > 35 && oThis.options.canPullDown){ //下拉刷新
					$refreshTip = oThis.$downTips.eq(1);
					$icon = $refreshTip.find('i');

					oThis.$downTips.eq(0).addClass('hide');
					$refreshTip.removeClass('hide');

					$icon.attr('style','');
					setTimeout(function(){
						$icon.css({
							'-webkit-transform':'rotateZ(-180deg)',
							'transform':'rotateZ(-180deg)'
						});
					},0);

					//显示 释放可以刷新
					oThis.isPullUp = false;
					oThis.loadingStep = 1;
					oThis.$downTips.parent().css({'margin-top':'0','position':'static'});
					oThis.iScrollObj.refresh();
				}else if(this.y < (this.maxScrollY-35) && oThis.options.canPullUp){//上拉刷新
					var isDisPullUp = oThis.$upTips.filter(':visible').hasClass('no-more');
					if(isDisPullUp) return false;

					$refreshTip = oThis.$upTips.eq(1);
					$icon = $refreshTip.find('i');
					
					oThis.$upTips.eq(0).addClass('hide');
					oThis.$upTips.eq(3).addClass('hide');
					$refreshTip.removeClass('hide');
					$icon.attr('style','').offset();
					setTimeout(function(){
						$icon.css({
							'-webkit-transform':'rotateZ(0deg)',
							'transform':'rotateZ(0deg)'
						});
					},0);


					oThis.isPullUp = true;
					oThis.loadingStep = 1;

					oThis.$upTips.parent().css({'margin-bottom':'0','position':'static'});
					oThis.iScrollObj.refresh();
				}
			}
		},
		scrollEndEv:function(oThis){
			if(oThis.loadingStep === 1){
				if(oThis.isPullUp &&  oThis.options.canPullUp){
					oThis.$upTips.eq(1).addClass('hide');
					oThis.$upTips.eq(2).removeClass('hide'); //显示 加载中...
					oThis.loadingStep=2;
					oThis.pullUpFn(oThis);
				}else if(oThis.options.canPullDown){
					oThis.$downTips.eq(1).addClass('hide');
					oThis.$downTips.eq(2).removeClass('hide');
					oThis.loadingStep=2;
					oThis.pullDownFn(oThis);
				}
			}
		},
		pullUpFn:function(oThis){
			setTimeout(function(){
				var hasData = oThis.options.onPullUp(oThis), $upTipWrap = oThis.$upTips.parent();
				// 隐藏loading, 显示上拉加载 或者 显示没有更多了
				oThis.$upTips.filter(':visible').addClass('hide');//隐藏 loading
				if(hasData===true){
					oThis.$upTips.eq(0).removeClass('hide'); //显示 上拉加载
				}else{
					oThis.$upTips.eq(3).removeClass('hide').addClass('no-more'); //显示 没有更多了
				}
				oThis.loadingStep = 0;

				$upTipWrap.addClass('trans').css({'margin-bottom':'-40px'});
				setTimeout(function(){
					$upTipWrap.removeClass('trans').css('position','absolute');
					oThis.iScrollObj.refresh();
				},400);
				// oThis.iScrollObj.refresh();
			}, 1000);
		},
		pullDownFn:function(oThis, handlerFn){
			setTimeout(function(){
				oThis.options.onPullDown(oThis);

				// 隐藏loading, 显示成功，隐藏成功，显示下拉加载
				oThis.$downTips.eq(2).addClass('hide');//隐藏 loading
				oThis.$downTips.eq(3).removeClass('hide');//显示加载成功
				setTimeout(function(){
					oThis.$downTips.filter(':visible').addClass('hide');//隐藏 加载成功或者失败

					oThis.$downTips.eq(0).removeClass('hide');//显示下拉加载
					oThis.loadingStep = 0;
					oThis.$downTips.parent().addClass('trans').css({'margin-top':'-40px'});
					setTimeout(function(){
						oThis.$downTips.parent().removeClass('trans').css('position','absolute');
						oThis.iScrollObj.refresh();
					},500);
				},800);
			}, 1000);
		}
	}
	$.fn.pullRefresh = function(option){
		return this.each(function(){
			var $this = $(this);
			var options = $.extend({}, $.fn.pullRefresh.DEFAULTS, typeof option == 'object' && option);
			var data = $(this).data('lt.pullRefresh');

			!data && $this.data('lt.pullRefresh', data=new PullRefresh(this,options));
			typeof option == 'string' && data[option]();
		});
	}
	$.fn.pullRefresh.DEFAULTS={
		pullUpCls:'.pullUp',
		pullDownCls:'.pullDown',
		canPullUp:true,
		canPullDown:true,
		click:true,
		onPullDown:function(oThis){/*下拉刷新数据*/
			console.log('刷新数据...');
		},
		onPullUp:function(oThis){ /*上拉加载数据， 需要返回true或false true:还有数据， false：没有数据了*/
			console.log('加载数据....');
		}
	};
// ================================

var commentsVM, cmtsConf;

cmtsConf = {
	getSharePhotoCommentList: 'getSharePhotoCommentList.json', 	//查询评论
	deleteSharePhotoComment: 'deleteSharePhotoComment.json', 	//删除评论
	insertSharePhotoComment: 'insertSharePhotoComment.json', 	//添加评论
	sharePhotoId: getUrlParam('sharePhotoId'),
	currentIndex:0,
	pageLength:20,
	totalDataNum:0,
	userId : $("#userId").val(),
};

//JavaScript函数：
avalon.filters.getCloseDate=function(dateNum){
	var minute = 1000 * 60,
		hour = minute * 60,
		day = hour * 24,
		halfamonth = day * 15,
		month = day * 30;

	var now = new Date().getTime(),
		diffValue = now - dateNum,
		monthC = diffValue / month,
		weekC = diffValue / (7 * day),
		dayC = diffValue / day,
		hourC = diffValue / hour,
		minC = diffValue / minute,
		result = "";

	if (monthC >= 1) {
	    result = parseInt(monthC) + "个月前";
	} else if (weekC >= 1) {
	    result = parseInt(weekC) + "周前";
	} else if (dayC >= 1) {
	    result = parseInt(dayC) + "天前";
	} else if (hourC >= 1) {
	    result = parseInt(hourC) + "个小时前";
	} else if (minC >= 1) {
	    result = parseInt(minC) + "分钟前";
	} else
	    result = "刚刚";

	return result;
};

var p_shareCmts = {
	init:function(){
		this.hideHelper();
		this.getShareComments();
	},
	hideHelper:function(){ 
		$(function(){ 
			$('#gotoTalk,.linkNeedLogin').hide();
		});
	},
	getShareComments:function(){
		var pms = {
			index:'0',
			length:cmtsConf.pageLength+'',
			sharePhotoId:cmtsConf.sharePhotoId+''
		},self = this;
		$.post(cmtsConf.getSharePhotoCommentList, pms, function(data){
			if(data.status === '0'){
				var d  = data.result.sharePhotoCommentVoList;
				cmtsConf.totalDataNum = data.result.count;
				cmtsConf.currentIndex += cmtsConf.pageLength;
				self.initCmtsVM(d);
			}
		});
	},
	initCmtsVM:function(commentsData){
		if(!commentsVM){ /* 首次初始化VM */
			avalon.filters.getReplyName=function(item){
				if(item.toCustomer || item.toSales){
					return '@'+(item.toCustomer || item.toSales).name+'：';
				}
				return '';
			}
			commentsVM = avalon.define({
				$id:'commentsCtr',
				data:commentsData,
				userId:cmtsConf.userId,
				toRole:"",
				toRoleId:"",
				insertCommentEv:function(e){
					if(!cmtsConf.userId){
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
						sharePhotoId:cmtsConf.sharePhotoId
					}
					if(comment=="") return false;
					if(r.test(comment)){
						comment = comment.replace(r,"");
						if(commentsVM.$model.toRole=="customer"){
							data.toCustomerId = commentsVM.$model.toRoleId
						}else{
							data.toSalesId = commentsVM.$model.toRoleId
						}
						if(comment=="") return false;
					}
					data.commentContent = comment;
					$.post(cmtsConf.insertSharePhotoComment,data,function(data){
						if(data.status=="0"){
							mobileAlert("评论成功",1000);
							var commentHtml = '<li class="item ovh" data-id="'+cmtsConf.userId+'" ms-click="replyComment">\
								<span class="avator-img fl mr10 mt10" style="background-image: url('+$("#userAvatar").val()+');"></span>\
								<div class="cmts-info bde4-b">\
									<div class="tit mb5 ell"><span class="name">'+$("#userName").val()+'</span></div>\
									<span class="block c-8 fs12">'+commentInfact+'</span>\
									<div class="tool tr">\
										<small>刚刚</small>\
									</div>\
								</div>\
							</li>';
							$("#cmtsItemWrap").prepend(commentHtml);
							$("#scrollContainer").css("transform","translate(0px, 0px)");
							avalon.scan($('#cmtsListBox')[0]);
							$("#commentInput").val("");
						}
					});
				},
				replyComment:function(){
					var _t = $(this);
					var role = _t.data("role"),id = _t.data("id"),name = _t.find(".name").text();
					if(id == cmtsConf.userId) return false;
					commentsVM.toRole = role;
					commentsVM.toRoleId = id;
					$("#commentInput").val("@"+name+"：").focus();
				},
				deleteCommentEv:function(e){
					var pms = {
						sharePhotoId: cmtsConf.sharePhotoId+'',
						sharePhotoCommentId:$(e.target).closest('.item').data('id')
					};
					$.post(cmtsConf.deleteSharePhotoComment, pms, function(data){
						if(data.status === '0'){
							mobileAlert('删除评论成功！');
							// 将评论从列表中删除
						}
					});
				}
			});
			avalon.scan($('#cmtsListBox')[0]);

			if(cmtsConf.totalDataNum>20){
				$('.c-pull-refresh').addClass('abs ovh');
				$('#pullUp .loadtip').first().removeClass('hide');
				$('#pullUp .loadtip').eq(3).addClass('hide');

				$('#cmtsIScrollWrap').pullRefresh({
					click:false,
					canPullDown:false,
					onPullUp:function(){
						if(cmtsConf.currentIndex < cmtsConf.totalDataNum){
							var pms ={
								index:cmtsConf.currentIndex+'',
								length:cmtsConf.pageLength+'',
								sharePhotoId:cmtsConf.sharePhotoId+''
							};
							$.ajax({
								url:cmtsConf.getSharePhotoCommentList,
								async:false,
								data:pms,
								type:'POST',
								success:function(data){
									if(data.status==='0'){
										cmtsConf.currentIndex += cmtsConf.pageLength;
										var d  = data.result.sharePhotoCommentVoList;
										for(var i in d){
											commentsVM.data.push(d[i]);
										}
									}
								},
								error:function(){
									mobileAlert('系统繁忙，请稍候重试。');
								}
							});
						}

						// 如果没有数据了，就return false, 结束加载
						return cmtsConf.currentIndex < cmtsConf.totalDataNum;
					}
				});
			}
		}else{/* 已经初始化VM， 更新数据对象 */
			commentsVM.data.clear();
			commentsVM.data = commentsData;
		}
	}
}

p_shareCmts.init();

