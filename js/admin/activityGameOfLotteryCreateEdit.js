define(['utils','webuploader','sortable','WdatePicker','validate'],function(util, WebUploader){
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
	                server: util.uploadServer,
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
	                        util.alert("上传数量超过限制，不能超过"+options.length+"张");
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
	                var url = util.cdn+response.hash;
	                $("#"+file.id).data("url",url).css("background-image","url("+url+"?imageView2/2/w/80/h/80)").find(".webuploader-pick").remove();
	                if(options.resultInput){
	                    options.resultInput.val(response.hash);
	                }
	                if(options.callback){
	                    options.callback(url);
	                }
	            }).on("uploadError",function(){
	                util.alert("上传失败，请稍后再试或刷新页面重试");
	            }).on("error",function(msg){
	                util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
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

	var LotyCreate = {
		URLS: {

		},
		data: {
			jsonRewardArray: new Array()
		},
		init: function(){

			LotyCreate.render();

			LotyCreate.eventInit();
		},
		render: function(){
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

		 	if (mainVM.$model.params.flag != 'create')
				LotyCreate.loadData();

		},
		loadData: function(){
			var tab1 = '{"jsonRewardArray":[{"id":1111111,"allNum":30,"exceptNum":15,"chances":90,"prizeType":1,"couponContent":"优惠券信息啊啊啊","dateLimit":1,"startTime":"2016-07-07 00:00:00","endTime":"2016-07-15 23:59:59","timeLimit":1,"timeLimitTimes":10,"prizeLimit":2},{"id":22222222,"prizeScore":"10000","allNum":100,"exceptNum":10,"chances":10,"prizeType":2,"prizeScore":"999","dateLimit":2,"timeLimit":2,"prizeLimit":2},{"id":33333333,"prizeName":"大衣","allNum":99,"exceptNum":99,"chances":50,"prizeType":3,"dateLimit":1,"startTime":"2016-07-07 00:00:00","endTime":"2016-07-15 23:59:59","timeLimit":1,"timeLimitTimes":10,"prizeLimit":2,"prizeNumber": "2016111122220254","prizeLongCode":"ashdjk123dijfidsjf122","prizeCode":"2654861513215456153232","imgArr":["http://static.qiakr.com/FnO2L1fe3Oai7pp8yQxuTrM8-xd8?imageView2/1/w/50/h/50","http://static.qiakr.com/993-8E42D3E5-28FE-4168-A4B0-1F28D53F6FD7?imageView2/1/w/50/h/50"],"logistics":2,"store":3}],"name":"活动名称啊啊啊 阿阿","startTime":"2016-07-07 00:00:00","endTime":"2016-07-15 23:59:59","onceScore":"5","allLimit":"2","dateLimit":"1","dateLimitTimes":"10","needCard":"2","activityRule":"规则啊 阿阿阿"}';
			tab1 = JSON.parse(tab1);
			
			//to do..  load page data
			// $.ajax({ //获取
			// 	url: "",
			// 	success: function(res){
					LotyCreate.data = $.extend(LotyCreate.data, tab1);
					// console.log(LotyCreate.data);
					LotyCreate.backFillFn($(".tabEvt0 input, .tabEvt0 select, .tabEvt0 textarea"), LotyCreate.data);

					LotyCreate.reloadPrizeList();
			// 	}
			// });
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

			/**** tab1 ****/
			$(".selEvt").on("change", function(){ //是否限制select
				var $this = $(this), val = $this.val(), $desc = $this.next(".descEvt"), $hideDescDom = $this.find(".hideDescEvt");
				
				$desc[val == $hideDescDom.val() ? 'addClass' : 'removeClass']("hide");
			}); 
			/**** tab2 ****/
			$("#addPrizeBtn").on("click", function(){ //点击添加奖品按钮
				$("#createDetail").attr("data-i", "");
				$("#createList").slideUp(400);
				$("#createDetail").slideDown(400);
			});

			$("#prizeTypeSel").on("change", function(){ //选择奖品类型
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
					var type = $("#prizeTypeSel").val(),flag = LotyCreate.checkFn($(".prizeDataEvt"));

					switch(parseInt(type)){
						case 1:  //优惠券
							if (!LotyCreate.checkFn($("#couponDesc")))
								flag = false;
							break;
						case 2: //积分
							if (!LotyCreate.checkFn($("#prizeScore")))
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
				LotyCreate.savePrizeForm(); //将奖品信息保存至内存
				$("#createDetail").slideUp(400);
				$("#createList").slideDown(300);

				LotyCreate.clearPrizeForm();
			});
			$("#prizeList").on("click", ".editPrizeBtn", function(){ //奖品列表-编辑奖品按钮
				var i = $(this).parent("td").attr("data-i");
				var sinPrizeData = LotyCreate.data.jsonRewardArray[i];
				console.log(sinPrizeData);

				$("#createDetail").attr("data-i", i); //回填奖品下标
				LotyCreate.backFillFn($("#createDetail input, #createDetail select, #createDetail textarea"), sinPrizeData);

				$("#createList").slideUp(400);
				$("#createDetail").slideDown(400);
			});
			$("#prizeList").on("click", ".delPrizeBtn", function(){ //奖品列表-删除奖品按钮
				var i = $(this).parent("td").attr("data-i");

				LotyCreate.data.jsonRewardArray.splice(i, 1);
				
				console.log(LotyCreate.data.jsonRewardArray);
				$(this).parents("tr").remove();
			});
			$("#prizeList").on("click", ".setPrizeNumBtn", function(){ //实物商品增减库存按钮
				var i = $(this).parent("td").attr("data-i"), sinPrizeData = LotyCreate.data.jsonRewardArray[i];
				var name = '';
				switch(parseInt(sinPrizeData.prizeType)){
					case 1:
						name = sinPrizeData.couponContent;
						break;
					case 2:
						name = sinPrizeData.prizeScore + "积分";
						break;
					case 3:
						name = sinPrizeData.prizeName;
						break;		
				}
				LotyCreate.d = dialog({
				    title: '调整奖品库存',
				    content:'<table class="simpleTable">' + 
				        	'	<tbody>' + 
				        	'		<tr>' + 
					        '			<td>奖品名称：　</td>' + 
					        '			<td>' + name + '</td>' + 
					        '		</tr>' + 
					        '		<tr>' + 
					        '			<td>当前剩余数：　</td>' + 
					        '			<td class="pt13">' + sinPrizeData.exceptNum + '</td>' + 
					        '		</tr>' + 
					        '		<tr>' + 
					        '			<td>*选择操作：　</td>' + 
					        '			<td class="pt13">' + 
					        '				<select class="min setNumSel" value="1">' + 
							'					<option value="1">增加数量</option>' + 
							'					<option value="2">减少数量</option>' + 
							'				</select>' + 
							'				<span>' + 
							'					<input class="min tc setNumInput" placeholder="请输入数量" type="number">' + 
							'					<label class="error fn-hide">请填写数量</label><br>' + 
							'					<p class="mt10">进行中的活动，剩余数仅供参考，当前若有人中奖剩余数会随时变化</p>' + 
							'				</span>' + 
					        '			</td>' + 
					        '		</tr>' + 
					        '		<tr>' + 
					        '			<td>调整后剩余数：　</td>' + 
					        '			<td class="exceptNum" data-exceptNum="' + sinPrizeData.exceptNum + '">' + sinPrizeData.exceptNum + '</td>' + 
					        '		</tr>' + 
					        '		<tr>' + 
					        '			<td></td>' + 
					        '			<td class="pt20">' + 
					        '				<span class="btn btn-default w-xs cancalDialog">取消</span>' + 
					        '				<span class="btn btn-default w-xs ml20 submitDialog" data-i="' + i + '">确定</span>' + 
					        '			</td>' + 
					        '		</tr>' + 
				        	'	</tbody>' + 
				        	'</table>'
				});
				LotyCreate.d.showModal();
			});
			$("body").on("click", ".cancalDialog", function(){ //dialog 取消
				LotyCreate.d.close().remove();
			});
			$("body").on("click", ".submitDialog", function(){ //dialog 确定
				var i = $(this).attr("data-i");
				if ($(".setNumInput").val() == "")
					return $(".setNumInput").addClass("error").next(".error").removeClass("fn-hide");
				else
					$(".setNumInput").removeClass("error").next(".error").addClass("fn-hide");

				LotyCreate.data.jsonRewardArray[i].exceptNum = $(".exceptNum").text();
				LotyCreate.reloadPrizeList();
				LotyCreate.d.close().remove();
			});
			$("body").on("change", ".setNumInput, .setNumSel", function(){
				var $parentDom = $(this).parents(".simpleTable")
				, $exceptDom = $parentDom.find(".exceptNum")
				, $inputDom = $parentDom.find(".setNumInput")
				, setNumSel = $parentDom.find(".setNumSel").val()
				if (setNumSel == 1){
					$exceptDom.text(~~$exceptDom.attr("data-exceptNum") + ~~$inputDom.val());
				} else {
					if (~~$exceptDom.attr("data-exceptNum") >= ~~$inputDom.val())
						$exceptDom.text(~~$exceptDom.attr("data-exceptNum") - ~~$inputDom.val());
					else{
						$inputDom.val("");
						return alert("减少数量不能大于库存数量");
					}
				}
			});
		},
		tabCheck: function(index){

			switch(parseInt(index)){ //根据tab切换校验规则
				case 0: 
					break;
				case 1: 
					if (LotyCreate.checkFn($(".tabEvt0 input, .tabEvt0 textarea"))){ //jump tab1页 校验
						LotyCreate.saveTab1();  //将tab1数据 存入内存
						break;
					} else
						return;
				case 2: 
					if ($("#prizeList").children("tr").length == 0)
						return alert("至少要有一个奖品");	
					else
						LotyCreate.saveAllData();
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
		backFillFn: function($dom, data){
			$dom.each(function(i){
				var $this = $(this);

				$this.val(data[$this.attr("name")]);

				if ($this.hasClass("selEvt") && $this.val() == $this.find(".hideDescEvt").val())
					$this.next(".descEvt").addClass("hide");

				if ($this.attr("id") == "prizeTypeSel"){
					$(".prizeTypeConEvt").hide();
					$(".prizeTypeCon_" + $this.val()).show();

					if ($this.val() == $("#prizeTypeThg").val()){
						var imgHtml = '';
						$.each(data.imgArr, function(i, img){
							imgHtml += '<div class="webuploader-container loaded" data-url="' + img + '" style="background-image: url(' + img + ');"><span class="cancel">×</span></div>';
						});
						$("#previewUpload").before(imgHtml);
					}
				}
			});
		},
		reloadPrizeList: function(){
			console.log(LotyCreate.data.jsonRewardArray);
			var listHtml = '';
			$.each( LotyCreate.data.jsonRewardArray, function(i, item){
				listHtml += LotyCreate.getPrizeListSin(i, item);
			});
			$("#prizeList").html(listHtml);
		},
		getPrizeListSin: function(i, item){ //获取奖品列表单项html
			var name = '', typeName = ''
			, lastBtn = mainVM.$model.params.flag == 'create' ? '<a href="javascript:void(0)" class="delPrizeBtn">删除奖品</a>' : '<a href="javascript:void(0)" class="setPrizeNumBtn">增减库存</a>';
			switch(parseInt(item.prizeType)){
				case 1:
					name = item.couponContent, typeName = "优惠券";
					break;
				case 2:
					name = item.prizeScore + "积分", typeName = "积分";
					break;
				case 3:
					name = item.prizeName, typeName = "实物商品";
					break;		
			}
			return  '<tr>' + 
	          		'	<td>' + name + '</td>' + 
	          		'	<td>' + typeName + '</td>' + 
	          		'	<td>' + item.allNum + '/' + item.exceptNum + '</td>' + 
	          		'	<td>' + item.chances + '%</td>' + 
	          		'	<td data-i="' + i + '"><a href="javascript:void(0)" class="editPrizeBtn">编辑奖品</a> - ' + lastBtn + '</td>' + 
	          		'</tr>';
		},
		inputAreaCheck: function($this){
			if ($this.val() == "")
				$this.addClass("error").next(".error").removeClass("fn-hide");
			else
				$this.removeClass("error").next(".error").addClass("fn-hide");
		},
		saveTab1: function(){
			$(".tabEvt0 input, .tabEvt0 textarea, .tabEvt0 select").each(function(){
				var $this = $(this);
				if (!$this.parent(".descEvt").hasClass("hide")){
					LotyCreate.data[$this.attr("name")] = $this.val();
				}
			});
			console.log(JSON.stringify(LotyCreate.data));
		},
		savePrizeForm: function(){
			var data = new Object();
			var type = $("#prizeTypeSel").val();

			switch(parseInt(type)){
				case 1:  //优惠券
					data[$(".prizeTData_1").attr("name")] = $(".prizeTData_1").val();
					break;
				case 2: //积分
					data[$(".prizeTData_2").attr("name")] = $(".prizeTData_2").val();
					break;
				case 3: //实物商品
					$(".prizeTData_3").each(function(){
						data[$(this).attr("name")] = $(this).val();
					});
					data.imgArr = new Array();
					$("#previewUploadWrap .loaded").each(function(){
						data.imgArr.push($(this).attr("data-url"));
					});
					break;
			}
			$("#createDetail input[type='text'], #createDetail input[type='number'], #createDetail textarea, #createDetail select").each(function(){
				if (!$(this).hasClass("prizeTData") && !$(this).parent(".descEvt").hasClass("hide"))
					data[$(this).attr("name")] = $(this).val();
			});
			
			var i = $("#createDetail").attr("data-i");
			if (i != "" && i != undefined){
				// data.id = LotyCreate.data.jsonRewardArray[i].id;
				LotyCreate.data.jsonRewardArray[i] = $.extend(LotyCreate.data.jsonRewardArray[i], data);
			}
			else
				LotyCreate.data.jsonRewardArray.push(data);

			LotyCreate.reloadPrizeList();
			// console.log(data);
		},
		saveAllData: function(){
			LotyCreate.data.jsonRewardArray = JSON.stringify(LotyCreate.data.jsonRewardArray);
			console.log(LotyCreate.data);
		},
		clearPrizeForm: function(){
			$("#createDetail input, #createDetail textarea").each(function(){
				$(this).val("");
			});
			$("#createDetail select").each(function(){
				$(this).val($(this).find("option:eq(0)").val()).change();
			});
			$("#previewUploadWrap .loaded").remove();
			$("#prizeTypeSel").change(); //设置默认类型
		}
	};

	return {
		init: LotyCreate.init
	}
});