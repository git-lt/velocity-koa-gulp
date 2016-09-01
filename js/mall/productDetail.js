var productDetail = function(){
	
}

productDetail.prototype={
	init:function(){
		this.exchangeSuccess();
	},
	lotterySuccess:function(){
		$.offcanvas({
		    content:$(".success"),
		    contentStyle:{ 
		        width:'300px', 
		        top: '20%', 
		        left: '50%', 
		        'margin-left': '-150px', 
		        'border-radius': '12px', 
		        padding: '15px', 
		        'text-align': 'center' 
		    }
		})
	},
	lotteryFail:function(){
		$.offcanvas({
		    content:$(".fail"),
		    contentStyle:{ 
		        width:'300px', 
		        top: '20%', 
		        left: '50%', 
		        'margin-left': '-150px', 
		        'border-radius': '12px', 
		        'padding': '15px', 
		        'text-align': 'center' 
		    }
		})
	},
	lotteryLoading:function(){
		$.offcanvas({
		    content:$(".loading"),
		    contentStyle:{ 
		        width:'300px', 
		        top: '20%', 
		        left: '50%', 
		        'margin-left': '-150px', 
		        'border-radius': '12px', 
		        'padding': '15px', 
		        'text-align': 'center' 
		    }
		})
	},
	exchangeSuccess:function(){
		var _this = this;
		$.offcanvas({
		    content:$(".changeSuccess"),
		    contentStyle:{ 
		        width:'300px', 
		        top: '20%', 
		        left: '50%', 
		        'margin-left': '-150px', 
		        'border-radius': '12px', 
		        'padding': '15px 15px 40px 15px', 
		        'text-align': 'center' 
		    }
		});
		_this.countEv();
	},
	exchangeFail:function(){
		var _this = this;
		$.offcanvas({
		    content:$(".changeFail"),
		    contentStyle:{ 
		        width:'300px', 
		        top: '20%', 
		        left: '50%', 
		        'margin-left': '-150px', 
		        'border-radius': '12px', 
		        'padding': '15px 15px 40px 15px', 
		        'text-align': 'center' 
		    }
		});
	},
	countEv:function(){
		var _this = this;
		var count = $(".count").text();
		// setInterval(function(){
		// 	if (count>0) {
		// 	count--;
		// 	$(".count").text(count)
		// 	}
		// },1000)
		var fn = function(){
			count--;
			console.log(count);
			$(".count").text(count)
			if (count>0) {
				setTimeout(fn,1000);
				/*fn() function(){fn()}*/
			}
		}
		fn();
	}
}
var d = new productDetail();
d.init();