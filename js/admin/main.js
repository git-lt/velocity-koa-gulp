$.createSecondMenu("m_home","洽客首页");
document.title="洽客-首页";

if($(".dataList").length>0){
	$.getJSON("getSupplierHomeStat.json",function(data){
		if(data.status=="0"){
			$(".dataList .saleroomToday").html("￥"+data.result.saleroomToday.toFixed(2));
			// $(".dataList .allCustomerCount").html(data.result.allCustomerCount);
			$(".dataList .salesCount").html(data.result.salesCount);
			$(".dataList .storeCount").html(data.result.storeCount);
			// $(".dataList .todayCustomerCount").html(data.result.todayCustomerCount);
			$(".dataList .todayOrderCount").html(data.result.todayOrderCount);
		}
	});
	$.getJSON("getCustomerStatCount.json",function(data){
		if (data.status=== "0"){
			$(".dataList .todayCustomerCount").html(data.result.customerStatCount.customerSubscribeCount);
			$(".dataList .allCustomerCount").html(data.result.customerStatCount.customerBandingCount);
		}
	});
}

$(function(){
	$('#showPDF').click(function(){
		$("#tanConFrame").attr("src","https://qncdn.qiakr.com/pdf/index.html");
		var d = dialog({
			fixed: true,
			padding: 0,
			content:$('#tanCon')[0]
    	}).height(window.innerHeight).width(window.innerWidth-20).show();

    	$('#pdfClose').off().click(function(){
    		d.close();
    	});
	});
});

// 显示用户反馈
// $('#createFeedbackBtn,#feedbackMinBtn').on('click', function(){
// 	$('#feedbackFrm').toggleClass('active');
// });

// user tips
$(window).load(function(){
	var body = $('body'),
    ulOffsetLeft = $('#mainMenusBox').offset().left,
    liOffsetTop = $('#sidebar-menu li[name="m_home_overview"]').offset().top,
    noticeOffset = $('#mainMenusBox').offset(),
    setMenuOffset = $('#setMenu').offset().left,
    $tipsFN = {
    	background: function(){
    		if ($('#tipsBG').length=== 0){
    			body.append('<div id="tipsBG"></div>').css({
			    	'height': '100%',
			    	'overflow': 'hidden'
			    });
    		}
    	},
    	buttonA: function(){
    		if ($('.tips-btna').length=== 0){
    			body.append('<b class="dn abs tips-img tips-btna"></b>');
    		}
    	},
    	buttonB: function(){
    		if ($('.tips-btnb').length=== 0){
    			body.append('<b class="dn abs tips-img tips-btnb"></b>');
    		}
    	},
    	buttonC: function(){
    		if ($('.tips-btnc').length=== 0){
    			body.append('<b class="dn abs tips-img tips-btnc"></b>');
    		}
    	},
    	buttonD: function(){
    		if ($('.tips-btnd').length=== 0){
    			body.append('<b class="dn abs tips-img tips-btnd"></b>');
    		}
    	},
    	stageA: function(){
    		this.background();
    		body.append('<b class="dn abs tips-img tips-aa"></b>');
		    $('.tips-aa').css({
		    	'top': '235px',
		    	'left': (ulOffsetLeft+5)+ 'px'
		    }).fadeIn();
		    body.append('<b class="dn abs tips-img tips-ab"></b>');
		    $('.tips-ab').css({
		    	'top': '315px',
		    	'left': (ulOffsetLeft+192)+ 'px'
		    }).fadeIn();
		    this.buttonA();
		    $('.tips-btna').css({
		    	'top': '550px',
		    	'left': (ulOffsetLeft+502)+ 'px'
		    }).fadeIn().on('click', function(){
		    	var ele = $('.tips-aa,.tips-ab,.tips-btna');
		    	ele.fadeOut(200);
		    	setTimeout(function(){ ele.remove(); }, 600);
		    	$(this).unbind();
		    	$tipsFN.stageB();
		    });
    	},
    	stageB: function(){
    		body.append('<b class="dn abs tips-img tips-ba"></b>');
		    $('.tips-ba').css({
		    	'top': '-5px',
		    	'left': (ulOffsetLeft+12)+ 'px'
		    }).fadeIn();
		    body.append('<b class="dn abs tips-img tips-bb"></b>');
		    $('.tips-bb').css({
		    	'top': (liOffsetTop-10)+ 'px',
		    	'left': '360px'
		    }).fadeIn();
		    this.buttonB();
		    $('.tips-btnb').css({
		    	'top': (liOffsetTop+245)+ 'px',
		    	'left': '700px'
		    }).fadeIn().on('click', function(){
		    	var ele = $('.tips-ba,.tips-bb,.tips-btnb');
		    	ele.fadeOut(200);
		    	setTimeout(function(){ ele.remove(); }, 600);
		    	$(this).unbind();
		    	$tipsFN.stageC();
		    	
		    });
    	},
    	stageC: function(){
    		body.append('<b class="dn abs tips-img tips-ca"></b>');
		    $('.tips-ca').css({
		    	// 'top': (noticeOffset.top+38)+ 'px',
		    	'top': (noticeOffset.top+132)+ 'px',
		    	'left': (noticeOffset.left-240)+ 'px'
		    }).fadeIn();
		    body.append('<b class="dn abs tips-img tips-cb"></b>');
		    $('.tips-cb').css({
		    	// 'top': (noticeOffset.top+115)+ 'px',
		    	'top': (noticeOffset.top+182)+ 'px',
		    	'left': (noticeOffset.left-40)+ 'px'
		    }).fadeIn();
		    this.buttonC();
		    $('.tips-btnc').css({
		    	'top': (noticeOffset.top+436)+ 'px',
		    	'left': (noticeOffset.left+315)+ 'px'
		    }).fadeIn().on('click', function(){
		    	var ele = $('.tips-ca,.tips-cb,.tips-btnc');
		    	ele.fadeOut(200);
		    	setTimeout(function(){ ele.remove(); }, 600);
		    	$(this).unbind();
		    	$tipsFN.stageD();
		    });
    	},
    	stageD: function(){
    		body.append('<b class="dn abs tips-img tips-da"></b>');
		    $('.tips-da').css({
		    	'top': (liOffsetTop-101)+ 'px',
		    	'left': setMenuOffset+ 'px'
		    }).fadeIn();
		    body.append('<b class="dn abs tips-img tips-db"></b>');
		    $('.tips-db').css({
		    	'top': '94px',
		    	'left': (setMenuOffset-452)+ 'px'
		    }).fadeIn();
		    this.buttonD();
		    $('.tips-btnd').css({
		    	'top': '352px',
		    	'left': (setMenuOffset-105)+ 'px'
		    }).fadeIn().on('click', function(){
		    	var ele = $('.tips-da,.tips-db,.tips-btnd');
		    	ele.fadeOut(200);
		    	$('.tips-btn,#tipsBG').fadeOut(200);
		    	setTimeout(function(){ ele.remove();$('.tips-btn,#tipsBG').remove(); }, 600);
		    	body.css({
		    		'height': 'auto',
		    		'overflow': 'auto'
		    	});
		    	$.post("updateBossGuide.json",{guide:'{"homeStepped":"1"}'});
		    	$.cookie("guide",'{"homeStepped":"1"}',{expires:200});
		    });
    	}
    };
    var showStage = setTimeout(function(){
    	if($.cookie("guide")){
    		clearTimeout(showStage);
    		var guide = JSON.parse($.cookie("guide"));
    		if(guide.homeStepped=="0"){
    			$tipsFN.stageA();
    		}
    	}
    },300);
});