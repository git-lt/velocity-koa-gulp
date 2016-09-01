
var LotyCreate = {
	URLS: {

	},
	data: {
		tab1: null,
		tab2: null,
		tab3: null,
	},
	params: {},
	init: function(){

		this.render();

		this.eventInit();
	},
	render: function(){

		$.createSecondMenu("promotion_manage","签到"); //选中左侧菜单

		$.initDatePicker([ //初始化日期
			{ST:'#startTime', ET:'#endTime', onpicked: LotyCreate.inputAreaCheck, oncleared: LotyCreate.inputAreaCheck},
			{ST:'#limStartTime', ET:'#limEndTime', onpicked: LotyCreate.inputAreaCheck, oncleared: LotyCreate.inputAreaCheck}
		]);

		$("#previewUpload").multiImgUploader({ //多图上传
		    length : 5,
		    resultInput : $("#productPicUrl"),
		    callback: function(){
		    	$("#previewUploadWrap").next(".error").addClass("fn-hide");
		    },
		    removeCallback: function(){
		    	if ($("#previewUploadWrap .loaded").length == 0)
					$("#previewUploadWrap").next(".error").removeClass("fn-hide");
		    }
		});
	 	$("#previewUploadWrap").sortable({ //拖动排序
            cursor: "move",
            items : ".loaded",
            placeholder:"ui-sortable-placeholder",
            revert:true
        });

		this.loadData();

	},
	loadData: function(){
		//to do..  load page data
	},
	eventInit: function(){
		$(".lotyCteaTab>li").on("click", function(){//tab切换  测试用
			var index = $(this).index();
			$(".lotyCteaTab>li:eq(" + index + "), .lotyCteaCon:eq(" + index + ")").addClass("active").siblings().removeClass("active");
		});

		$(".nextEvt").on("click", function(){ //切换tab
			var nextIdx = $(this).attr("data-next");

			LotyCreate.tabCheck(nextIdx);
		});

		$("input, textarea").on("keyup", function(){ //全局校验
			LotyCreate.inputAreaCheck($(this));
		});

		$("input[type='number']").on("change", function(){
			LotyCreate.inputAreaCheck($(this));
		});

		/**** tab1 ****/
		$(".selEvt").on("change", function(){ //是否限制select
			var $this = $(this), val = $this.val(), $desc = $this.next(".descEvt");
			
			$desc[val == 2 ? 'addClass' : 'removeClass']("hide");
		}); 

		/**** tab2 ****/
		$("#addPrizeBtn").on("click", function(){ //点击添加奖品按钮
			$("#createList").slideUp(400);
			$("#createDetail").slideDown(400);
		});

		$("select[name='prizeTypeSel']").on("change", function(){ //选择奖品类型
			var val = $(this).val();
			$(".prizeTypeConEvt").hide(300);
			$(".prizeTypeCon_" + val).show(400);
		});

		$(".cancelCreateBtn").on("click", function(){ //取消返回按钮
			$("#createDetail").slideUp(400);
			$("#createList").slideDown(300);
		});

		$(".saveCreateBtn").on("click", function(){ //保存添加的奖品
			var checkFn = function(){  //校验
				var type = $("select[name='prizeTypeSel']").val(),flag = LotyCreate.checkFn($(".prizeDataEvt"));

				switch(parseInt(type)){
					case 1:  //优惠券
						if (!LotyCreate.checkFn($("textarea[name='couponDesc']")))
							flag = false;
						break;
					case 2: //积分
						if (!LotyCreate.checkFn($("input[name='prizeScore']")))
							flag = false;
						break;
					case 3: //实物商品
						if (!LotyCreate.checkFn($(".prizeTypeCon_3 input[name='prizeName']")))
							flag = false;
						if ($("#previewUploadWrap .loaded").length == 0){
							$("#previewUploadWrap").next(".error").removeClass("fn-hide");
							flag = false;
						} else 
							$("#previewUploadWrap").next(".error").addClass("fn-hide");
						break;
				}
				return flag;
			}
			if (!checkFn())
				return;
			$("#createDetail").slideUp(400);
			$("#createList").slideDown(300);
		});
	},
	tabCheck: function(index){

		switch(parseInt(index)){ //根据tab切换校验规则
			case 0: 
				break;
			case 1: 
				if (LotyCreate.checkFn($(".tabEvt0 input, .tabEvt0 textarea"))) //jump tab1页 校验
					break;
				else
					return;
			case 2: 
				break;		
		}

		$(".lotyCteaTab>li:eq(" + index + "), .lotyCteaCon:eq(" + index + ")").addClass("active").siblings().removeClass("active");
	},
	checkFn: function($dom){
		var flag = true;
		$dom.each(function(i){
			var $this = $(this);
			if ($this.val() == "" && !$this.parent(".descEvt").hasClass("hide")){
				$this.addClass("error").next(".error").removeClass("fn-hide");
				flag = false;
			} else
				$this.removeClass("error").next(".error").addClass("fn-hide");
		});

		return flag;
	},
	inputAreaCheck: function($this){
		if ($this.val() == "")
			$this.addClass("error").next(".error").removeClass("fn-hide");
		else
			$this.removeClass("error").next(".error").addClass("fn-hide");
	}
}


$.fn.multiImgUploader = function(options){ //多图上传
    if($("#uploadScript").length === 0){
        $("body").append('<input type="hidden" id="uploadScript" />');
        jQuery.ajax({
            url: "//res.qiakr.com/plugins/webuploader/webuploader-0.1.5.min.js",
            dataType: "script",
            cache: true
        });
    }
    var _this = $(this);
    var setIntervalCon = setInterval(function(){
        if(typeof WebUploader != "undefined"){
            clearInterval(setIntervalCon);
            var uploader = WebUploader.create({
                auto: true,
                swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
                server: Util.uploadServer,
                pick: _this[0],
                // runtimeOrder : "flash",
                duplicate : true,
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,png',
                    mimeTypes: 'image/*'
                },
                formData : {
                    'token' : $('#uptoken').val()
                },
                compress : {
                    width: 828,
                    // height: 800,
                    quality: 100,
                    allowMagnify: false,
                    crop: false,
                    preserveHeaders: true,
                    noCompressIfLarger: true,
                    // 单位字节，如果图片大小小于此值，不会采用压缩。
                    compressSize: 300*1024
                }
            });
            var uploaderBtn = $(uploader.option('pick'));
            uploader.on("uploadStart",function(file){
                if(options.length){
                    var fileLength = uploaderBtn.siblings(".loaded").length;
                    if(fileLength >= ~~options.length){
                        Util.alert("上传数量超过限制，不能超过"+options.length+"张");
                        return false;
                    }
                    if(fileLength == ~~options.length-1){
                        uploaderBtn.hide();
                    }
                }
                uploaderBtn.before('<div id="'+file.id+'" class="webuploader-container loaded"><span class="cancel">×</span><div class="webuploader-pick uploading"><div class="progressBar"><div class="progress" style="width:0%"></div></div></div></div>');
            }).on("uploadProgress",function(file,percentage){
                $("#"+file.id).find(".progress").css("width",percentage*100+'%');
            }).on("uploadSuccess",function(file,response){
                var url = Util.cdn+response.hash;
                $("#"+file.id).data("url",url).css("background-image","url("+url+"?imageView2/2/w/80/h/80)").find(".webuploader-pick").remove();
                if(options.resultInput){
                    options.resultInput.val(response.hash);
                }
                if(options.callback){
                    options.callback(url);
                }
            }).on("uploadError",function(){
                Util.alert("上传失败，请稍后再试或刷新页面重试");
            }).on("error",function(msg){
                Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
            });

            _this.parent().on("click",".cancel",function(){
                $(this).parent().fadeOut(300, function() {
                    $(this).remove();
                    if(options.removeCallback){
                        options.removeCallback();
                    }
                    if(options.length){
                        uploaderBtn.show();
                    }
                });
            });
        }
    },100);
};


LotyCreate.init();


