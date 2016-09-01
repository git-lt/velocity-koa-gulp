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

var praiseListVM, praiseListConf;

praiseListConf = {
	getSharePhotoPraiseList: 'getSharePhotoPraiseList.json',	//查询点赞列表
	sharePhotoId: getUrlParam('sharePhotoId'),
	currentIndex:0,
	pageLength:20,
	totalDataNum:0
};

var p_praiseList = {
	init:function(){
		this.getPraiseList();
	},
	getPraiseList:function(){ //点赞列表
		var pms = {
			sharePhotoId:praiseListConf.sharePhotoId,
			index:'0',
			length:'20'
		}, self = this;

		$.post(praiseListConf.getSharePhotoPraiseList, pms, function(data){
			if(data.status==='0'){
				var d = data.result.sharePhotoCommentVoList;

				praiseListConf.totalDataNum = data.result.count;
				praiseListConf.currentIndex += praiseListConf.pageLength;

				self.initPraiseListVM(d);
			}
		});
	},
	initPraiseListVM:function(praiseListData){
		praiseListVM = avalon.define({
			$id:'praiseListCtr',
			data:praiseListData,
			getSharePhotoList:function(){
				var role = $(this).data("role"),id = $(this).data("id");
				if(role=="sales"){
					location.href="getSharePhotoList.htm?salesId="+id;
				}else if(role=="customer"){
					location.href="getSharePhotoList.htm?customerId="+id;
				}else{

				}
			}
		});
		avalon.scan($('#cmtsListBox')[0]);

		if(praiseListConf.totalDataNum>praiseListConf.pageLength){
			$('.c-pull-refresh').addClass('abs ovh');
			$('#zanIscroll').pullRefresh({
				onPullUp:function(){
					if(praiseListConf.currentIndex < praiseListConf.totalDataNum){
						var pms ={
							index:praiseListConf.currentIndex+'',
							length:praiseListConf.pageLength+'',
							sharePhotoId:praiseListConf.sharePhotoId+''
						};
						$.ajax({
							url:praiseListConf.getSharePhotoPraiseList,
							async:false,
							data:pms,
							type:'POST',
							success:function(data){
								if(data.status==='0'){
									praiseListConf.currentIndex += praiseListConf.pageLength;
									var d  = data.result.sharePhotoCommentVoList;
									for(var i in d){
										praiseListVM.data.push(d[i]);
									}
								}
							},
							error:function(){
								mobileAlert('系统繁忙，请稍候重试。');
							}
						});
					}

					// 如果没有数据了，就return false, 结束加载
					return praiseListConf.currentIndex < praiseListConf.totalDataNum;
				}
			});
		}
	}
}

p_praiseList.init();