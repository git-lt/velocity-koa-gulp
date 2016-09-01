/******BOSS端 任务详情 START******/ 
var Task = function(){
	this.GETTASK_URL = "../boss/getTaskInfo.json";
	this.DELETETASK_URL = "../boss/deleteTask.json";
	this.param = {
		token: getUrlParam("token") || "",
		taskId: getUrlParam("taskId") || ""
	};
};
Task.prototype = {
	isLoadObj: {},
	init: function(event){
		var _this = this;
		$.ajax({
			url : _this.GETTASK_URL,
			type: "post",
			data: _this.param,
			success: function(res){
				if (!res.result) return;
				_this.initCallback(res.result);
			}
		});
		if (event){
			window.onload = function(){
				$("#content").on("click", ".tkd_des_img", function(){
					var urlStr = $(this).data("url");
					new ShowImgs(urlStr.split(","), $(this).index(), _this.isImgLoaded(urlStr));
				});
				$("#content").on("click", ".tkdImgEvt", function(){
					var urlStr = $(this).data("url");
					new ShowImgs(urlStr.split(","), $(this).index(), _this.isImgLoaded(urlStr));
				});
			}
			$("#content").on("click", "#editTaskBtn", function(){
				if(window.WebViewJavascriptBridge){
					window.WebViewJavascriptBridge.callHandler('editTaskUrl',{
						taskId: _this.param.taskId
					});
				}
			});
			$("#content").on("click", "#deleteTaskBtn", function(){
				$.confirm('确认删除任务吗？','提示', function(){
				    $.ajax({
						url: _this.DELETETASK_URL,
						type: "post",
						data: _this.param,
						success: function(res){
							if (res.status!=="0") return $.toast(res.errmsg ? res.errmsg : "系统繁忙");
							//to do jump list
							if(window.WebViewJavascriptBridge){
								window.WebViewJavascriptBridge.callHandler('deleteTaskUrl',{
									taskId: _this.param.taskId
								});
							}	
						}
					});
				});
			});
		}
	},
	initCallback: function(result){
		result.token = this.param.token,result.taskId = this.param.taskId;
		result.numDone = result.doneSalesTaskList.length;

		var html = template('task', result||'');
		$("#content").html(html);

		$(".tkd_des_img").height($(".tkd_des_img").width());
	},
	isImgLoaded: function(urlStr){
		var isImgLoaded = false;
		if (this.isLoadObj[urlStr]) 
			isImgLoaded = true;
		else 
			this.isLoadObj[urlStr] = true;

		return isImgLoaded;
	}
}
/******BOSS端 任务详情 END******/ 
/******导购端 任务详情 START******/ 
var GTask = function(){
	this.GETTASK_URL = "../sales/getTaskInfo.json";
	this.SUBTASK_URL = "";
	this.param = {
		salesTaskId: getUrlParam("salesTaskId") || "",
		token: getUrlParam("token") || ""
	};
	this.statusClass = "unfinshed";//unfinshed or deleted or finshed
};
GTask.prototype = new Task();
GTask.prototype.guideInit = function(){
	this.init();
};
GTask.prototype.initCallback = function(result){
	var _this = this;
	switch(parseInt(result.taskInfo.status)){
		case 2: //已完成
		case 5: //超时已完成
			this.statusClass = "finshed";
			break;
		case 3:
			this.statusClass = "deleted";
			break;	
		default:
			this.statusClass = "unfinshed";
			break;
	}
	// result.taskInfo.taskCode = 'activity_flashsale_share';
	// result.taskInfo.customerId = 123;
	
	this.param.taskId = result.taskInfo.taskId;
	result.taskInfo.statusClass = this.statusClass;
	var html = template('gtask', result.taskInfo||{});
	$("#content").html(html);

	if (result.taskInfo.picUrl){
		$(function(){
			$(".tkdImgEvt").on("click", function(){
				var urlStr = result.taskInfo.picUrl;
				new ShowImgs(urlStr.split(","), $(this).index(), _this.isImgLoaded(urlStr));
			});
		});
	}	
	$("#content").on("click", "#contHim", function(){
		if(window.WebViewJavascriptBridge){
			window.WebViewJavascriptBridge.callHandler('contactHimUrl',{
				taskId: _this.param.taskId,
				salesTaskId: _this.param.salesTaskId,
				customerId: result.taskInfo.customerId
			});
		}	
	});
	$("#content").on("click", "#gTaskSub", function(){
		$.confirm('确认完成任务吗？','提示', function(){
			if(window.WebViewJavascriptBridge){
			    window.WebViewJavascriptBridge.callHandler('submitTaskUrl',{
					taskId: _this.param.taskId,
					salesTaskId: _this.param.salesTaskId,
					uploadPic: result.taskInfo.uploadPic,
					callbackUrl: "/sales/confirmComplete.htm" + location.search
				});
			}	
		});
	});
};
GTask.prototype.jump = function(action, id, suid){
	var param = {}, _this = this;
	var hostName = location.href.substring(0,location.href.indexOf('/sales/'));
	switch(action){
		case 'jumpCustomerInfoAction': 
			param.customerId = id; break;
		case 'contactHimUrl':	
			param.taskId = _this.param.taskId,
			param.salesTaskId = _this.param.salesTaskId,
			param.customerId = id; break;
		case 'shareActivityAction':	
			var supplierId = suid || "";
			param.flashsaleStockId = id;
			param.shareUrl = hostName + "/mall/getStockInfoForSeckill.htm?flashsaleStockId=" + id + "&stockId=" + id + "&supplierId=" + supplierId + "&suid=" + supplierId; 
			break;
		case 'gotoOrderDetail':	
			param.orderId = id; break;	
		// case 'jumpActivityDetailAction':
		// 	var supplierId = suid || "";
		// 	var url = hostName + "/mall/getStockInfoForSeckill.htm?flashsaleStockId=" + id + "&stockId=" + id + "&supplierId=" + supplierId + "&suid=" + supplierId + "&i=" +　Math.random();
		// 	window.location.href = url;
		// 	break;		
	}
	// console.log(action);
	// console.log(param);
	if(window.WebViewJavascriptBridge)
		window.WebViewJavascriptBridge.callHandler(action, param);
}
/******导购端 任务详情 END******/ 
var Exc = function(){
	this.GETTASK_URL = "../boss/getTaskInfo.json";
	this.GETSTORELIST_URL = "../boss/getStoreListOfTask.json";
	this.param = {
		token: getUrlParam("token") || "",
		taskId: getUrlParam("taskId") || ""
	};
};
Exc.prototype = {
	init: function(){
		var _this = this;

		_this.storeListInit();
		_this.loadData();
		$("#exc_filter").on("click", function(){
			$("#excFilterContent").addClass("on");
			$("#content").addClass("hide");
		});
		$("#excFilterContent").on("click", ".filter_sin", function(){
			_this.loadData($(this).data("id"), $(this).data("name"));
		});
	},
	loadData: function(storeId, title){
		var _this = this;
		_this.param.storeId = storeId;
		$.ajax({
			url : _this.GETTASK_URL,
			type: "post",
			data: _this.param,
			success: function(res){
				if (!res.result) return;
				var tmpId = "";
				if (res.result.taskInfo.taskType == 0){
					tmpId = "task";
				} else if (res.result.taskInfo.taskType == 1){
					tmpId = "systask";
					res.result.doList = _this.getComList(res.result);
				}

				$(".f_ico").text(title||"筛选");
				var html = template(tmpId, res.result ||'');
				$("#content").html(html);
				$("#content").removeClass("hide");
				$("#excFilterContent").removeClass("on");
			}
		});
	},
	storeListInit: function(){
		var _this = this;
		$.ajax({
			url: _this.GETSTORELIST_URL,
			type: "post",
			data: this.param,
			success: function(res){
				if (res.status != 0)return $.toast(res.errmsg ? res.errmsg : "获取门店失败");
				var html = template("excfilter", res.result||"");
				$("#excFilterContent").html(html);
			}
		});
	},
	getComList: function(result){
		var list = result.doneSalesTaskList.concat(result.notDoneSalesTaskList);
		var arrObj = {}, obj1 = {}, obj2 = {}, arrList = [];
		$.each(list, function(i, item){
			for (var key in result.allSalesTaskNumMap){
				if (key == item.salesId && !obj1[key]){
					item.allNum = result.allSalesTaskNumMap[key];
					// arr.push(item);
					arrObj[key] = item;
					obj1[key] = 1;
					continue;
				}
			}
			for (var key in result.doneSalesTaskNumMap){
				if (key == item.salesId && !obj2[key]){
					arrObj[key].doneNum = result.doneSalesTaskNumMap[key];
					// arr.push(item);
					obj2[key] = 1;
					continue;
				}
			}
		});
		for (var key in arrObj){
			arrList.push(arrObj[key]);
		}
		return arrList;
	}
};

!function ($, window, undefined) {
	/**
	 *模拟点击看大图
	 *@param Array  传入图片url数组 index: 当前下标 isImgLoaded: 图片是否已缓存
	*/
	var ShowImgs = function(arr, index, isImgLoaded){
		this.arr = arr;
		this.length = arr.length;
		this.W = 100/this.length;
		this.index = index || 0;
		this.isImgLoaded = isImgLoaded;
		this.mask = $('<div class="img_show_mask" style="width:' + 100*this.length + '%;"></div>');
		this.loading = $('<div id="loading" class="loading"><span></span><span></span><span></span><span></span><span></span></div>');

		this.init();
	}
	ShowImgs.prototype = {
		init: function(){
			!this.isImgLoaded && this.loadImage(this.arr);
			var html = '';
			for (var i = 0; i < this.length; i ++){
				html += '<div class="img_show_sin" style="width:' + this.W + '%;background-image:url(' + this.arr[i] + ')"></div>';
			}	

			this.mask.css("-webkit-transform","translate3d(-" + this.W * this.index +"%,0,0)");

			$('body').append(this.mask.append(html)).addClass("oh");
			$(".img_show_mask").addClass("opc1");
			
			this.eventInit();
		},
		eventInit: function(){
			var _this = this;
			$('.img_show_mask').off().on("click", function(){
				$('body').removeClass("oh");
				_this.hideLoading();
				$(this).remove();
			});
			if (this.length>1){
				this.mask.swipeLeft(function(){
					if (_this.index < _this.length-1){
						_this.index++;
						$(".img_show_mask").css("-webkit-transform","translate3d(-" + _this.W * _this.index +"%,0,0)");
					}	
				}).swipeRight(function(){
					if (_this.index){
						_this.index--;
						$(".img_show_mask").css("-webkit-transform","translate3d(-" + _this.W * _this.index +"%,0,0)");
					}	
				}).on("touchstart",function(){
					event.preventDefault();
				}).singleTap(function(){
					$('body').removeClass("oh");
					_this.hideLoading();
					$(this).remove();
				});
			}
		},
		loadImage: function(arr){var _this = this;
			this.showLoading();
			var newimages = [];
			var count = 1; 
	        for (var i = 0; i < arr.length; i++) {
	        	count ++;
	            newimages[i] = new Image();
	            newimages[i].src = arr[i];
	            newimages[i].onload = function(){
	            	if (count > arr.length){
	            		setTimeout(function(){
	            			_this.hideLoading();
	            		}, 800);
	            	}
	            }
	        }
		},
		showLoading: function(){
			$("#loading").length ? $("#loading").removeClass("hide") : this.loading.appendTo($("body")[0]);
		},
		hideLoading: function(){
			$("#loading").addClass("hide");
		}
	}
	window.ShowImgs = ShowImgs;
}(Zepto, window);
/**
 * ******
 * @滑动
 */
;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {

          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)

        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        else if ('last' in touch)

          if (deltaX < 30 && deltaY < 30) {

            tapTimeout = setTimeout(function() {

              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)
