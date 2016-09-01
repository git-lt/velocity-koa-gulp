define(['utils','webuploader','WdatePicker','powerSeleteDia'],function(utils,webuploader){
	var CONFIG, page;
	$('#sidebar-menu .active').removeClass('active');
	$('#sidebar-menu').find('[href*=customerExchange]').addClass('active');
	$.fn.multiImgUploader = function(options){
        var _this = $(this);
        var uploader = webuploader.create({
            auto: true,
            swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
            server: utils.uploadServer,
            pick: _this[0],
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
                quality: 100,
                allowMagnify: false,
                crop: false,
                preserveHeaders: true,
                noCompressIfLarger: true,
                compressSize: 300*1024
            }
        });
        var uploaderBtn = $(uploader.option('pick'));
        uploader.on("uploadStart",function(file){
            if(options.length){
                var fileLength = uploaderBtn.siblings(".loaded").length;
                if(fileLength >= ~~options.length){
                    utils.alert("上传数量超过限制，不能超过"+options.length+"张");
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
            var url = utils.cdn+response.hash;
            $("#"+file.id).data("url",url).css("background-image","url("+url+"?imageView2/2/w/80/h/80)").find(".webuploader-pick").remove();
            if(options.resultInput){
                options.resultInput.val(response.hash);
            }
            if(options.callback){
                options.callback(url);
            }
        }).on("uploadError",function(){
            utils.alert("上传失败，请稍后再试或刷新页面重试");
        }).on("error",function(msg){
            utils.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
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
    };
	CONFIG = {
		apigetVip:'getVipLevels.json',         //查询等级详情
        apiGetStoreList: 'getStoreList.json',  //获取门店列表
        apiaddExchange:'addExchangeActionForLucky.json',  //保存兑换商品-抽奖
	};

	page={
		init:function(){
			this.initElement();   //信息初始化
	        this.initTimePiker(); //日期初始化
	        this.cancelEv();    //取消返回

	        this.tableList();  //表单验证
	        this.inputYZ();   //限制验证
            this.inputXZ();   //限制不限制的验证
            this.selectGroup();  //获取会员等级
            this.sltStoreEv(); //门店选择
        },
        initElement:function(){
            var _this=this;
            $(".select2").select2({minimumResultsForSearch: -1});
            //上传图片
            $("#previewUpload").multiImgUploader({
                length:5,
                resultInput : $("#productPicUrl"),
                callback: function(){
                    $("#productPicUrl").removeClass("error").next(".error").addClass("hide");
                },
                removeCallback: function(){
                    if(!$("#previewUploadBakWrap .loaded").length){
                        $("#productPicUrl").addClass("error").next(".error").removeClass("hide");
                    }
                }
            });
            $("select").on("change",function(){
                _this.inputYZ();
            })
            // 选择门店
            storeSltDia =  $.powerSelectDia({
                apiGetData: CONFIG.apiGetStoreList,
                title: '选择门店',
                listDataName: 'storeVoList',
                selectMulti: true,
                searchTpl: '<div class="form-group text-right"><div class="input-group"> <input type="text" class="form-control input-sm w150 j-sales-name" name="storeName" placeholder="店铺名称"> <span class="input-group-btn"> <button type="button" class="btn btn-primary btn-sm j-dia-search">筛选</button> </span> </div> </div>',
                getSearchPms: function($searchWrap) {
                    var storeName = $.trim($searchWrap.find('[name="storeName"]').val());

                    if (storeName.length > 80) {
                        toastr.warning('输入信息过长');
                        return false;
                    }

                    return { storeName: storeName};
                },
                getItemsDataFn: function(data) {
                    return data.map(function(v) {
                        return { id: v.store.id, text: v.store.name || 'xxx' };
                    })
                },
                okFn: function(chkRes) {
                    console.log(chkRes);

                    $('#tiHuoType').data('limit',chkRes).val(chkRes.map(function(v){
                        return v.text;
                    }).join(' / '));
                }
             });
        },
		initTimePiker:function(){
			$.initDatePicker([
					{ST:'#happyStart', ET:'#happyEnd'},
					{ST:'#drawnStart', ET:'#drawnEnd'}
				]);
		},
        selectGroup:function(){
            $.post(CONFIG.apigetVip,function(data){
                var levels = data.result.levels;
                var huiYuan=$("#huiYuan");
                for(var i=0;i<levels.length;i++){
                    name="<option value="+levels[i].vipLevel+">"+levels[i].levelName+"</option>";
                    $(name).appendTo(huiYuan);              
                };
            });
        },
        //保存兑换商品-抽奖
        addExchange:function(){
            var huiYuan=$("#huiYuan").val();
            if(huiYuan!=null){
                $("#huiYuan").val().join("_");
            }
            var jsonRewardArray=[];
            var TiHuoType=$('#tiHuoType').data('limit');
            var iptSltStores=[];
            for(var i=0;i<TiHuoType.length;i++){
                iptSltStores.push(TiHuoType[i].id);
            }
            var storeLimit=iptSltStores.join("_");

            var prizeType=$("#prizeType").val();
            if(prizeType=="1"){
                jsonRewardArray={
                    "rewardType":$("#prizeType").val(),
                    "rewardLimit":$("zhonJiangNum").val(),
                    "winningProbability":$("#surplusBility").val(),
                    "productName":$("#shopName").val(),
                    "productCode":$("#shopBianMa").val(),
                    "productSku":$("#shopTiaoMa").val(),
                    "picUrl":$("#productPicUrl").val(),
                    "timeLimit":$("#zhongJaingTime").val(), 
                    "startRewardTime":utils.getUnixTime($("#drawnStart").val()),
                    "endRewardTime":utils.getUnixTime($("#drawnEnd").val()),
                    "productNumber":$("#shopKuanHao").val(),
                    "customerLevelLimitList":huiYuan||'',
                    "rewardCount":$("#spoilSurplus").val(), 
                    "deliveryLimit":$("#wuLiuType").val(), 
                    "storeId":storeLimit, 
                }
            }else{
                jsonRewardArray={
                    "timeLimit":$("#zhongJaingTime").val(), 
                    "endRewardTime":utils.getUnixTime($("#drawnEnd").val()),
                    "startRewardTime":utils.getUnixTime($("#drawnStart").val()),
                    "rewardCount":$("#spoilSurplus").val(), 
                    "rewardLimit":$("zhonJiangNum").val(),
                    "customerLevelLimitList":huiYuan||'',
                    "rewardType":$("#prizeType").val(),
                    "winningProbability":$("#surplusBility").val(),
                }
            }
            var myobj=eval(jsonRewardArray); 
            var options={
                startTime:utils.getUnixTime($("#happyStart").val()),
                endTime:utils.getUnixTime($("#happyEnd").val()),
                consumePoints:$("#everyExpend").val(),
                totalDrawLimit:$("#allDraw").val(),
                dayDrawLimit:$("#everyDraw").val(),
                needMembershipCard:$("#openMember").val(),
                jsonRewardArray:myobj,
                actionRule:$("#descriptionArea").val(),
            }
            return $.post(CONFIG.apiaddExchange,options)
        },
        //验证日期
        checkData:function(){
            var zhongJaingTime=$("#zhongJaingTime").val();
            var drawnStart=$("#drawnStart").val();
            var drawnEnd=$("#drawnEnd").val();

            var DataStart=new Date(drawnStart.replace(/\-/g,'/'));
            var DataEnd=new Date(drawnEnd.replace(/\-/g,'/'));

            if(zhongJaingTime=="1"){
                if(drawnStart==''&&drawnEnd==''){
                    toastr.error("兑换结束时间与开始时间不能为空"); 
                    return false;    
                }
            }
            if (DataStart >DataEnd) {            
                utils.alert("兑换结束时间不能大于开始时间"); 
                return false;    
            }else{
                return true;
            }
        },
		tableList:function(){
            var _this=this;
			$("#NewLottery").validate({
				rules: {
					happyStart:'required',
					happyEnd:'required',
					everyExpend:{
						required: true,
						isNum:true
					},
					allDraw:{
						required: true,
						isNum:true
					},
					everyDraw:{
						required: true,
						isNum:true
					},
					spoilSurplus:{
						required: true,
						isNum:true
					},
					surplusBility:{
						required: true,
						isNum:true
					},
					shopName:{
						required: true,
						maxlength: 20
					},
					productPicUrl:"required",
                    tiHuoType:"required",
                    zhonJiangNum:{
						required: true,
						isNum:true,
					},
                    couponId:"required",
				},
				messages:{
					happyStart:"点击选择开始时间",
					happyEnd:"点击选择结束时间",
					everyExpend:{
						required:"请输入消耗积分数",
						isNum:"只能包含数字"
					},
					allDraw:{
						required:"请输入总抽奖次数限制",
						isNum:"只能包含数字"
					},
					everyDraw:{
						required:"请输入每天抽奖次数限制",
						isNum:"只能包含数字"
					},
					spoilSurplus:{
						required:"请输入奖品剩余数",
						isNum:"只能包含数字"
					},
					surplusBility:{
						required:"请输入中奖概率",
						isNum:"只能包含数字"
					},
					shopName:{
						required: "请输入商品名称",
						maxlength: "最长20个字"
					},
					productPicUrl:"请上传商品图片",
                    tiHuoType:"请点击选择门店",
                    zhonJiangNum:{
                    	required:"请输入中奖次数限制",
						isNum:"只能包含数字"
                    },
                    couponId:"请编辑优惠卷信息",
				},
				submitHandler:function(){
					_this.checkData();
                    _this.addExchange()
                        .done(function(data){
                            if(data.status=="0"){
                                utils.alert("保存成功");
                            }else{
                                toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
                            }
                        })
                        .fail(function(data){
                            toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
                        })
				},
			})
		},
		inputYZ:function(){
			var _this=this;
            var zNumXian=$("#zNumXian").val();
            var Div=$("#zNumXian").parent().siblings("div");
            var everyCiType=$("#everyCiType").val();
            var PDiv=$("#everyCiType").parent().siblings("div");
            var personXian=$("#personXian").val();
            var dataDiv=$("#personXian").parent().siblings("div");
            var zhongJaingTime=$("#zhongJaingTime").val();
            if(zNumXian=="0"){
                Div.hide();
            }else{
                Div.show();
            }
            if(everyCiType=="0"){
                PDiv.hide();
            }else{
                PDiv.show();
            }
            if(personXian=="0"){
                dataDiv.hide();
            }else{
                dataDiv.show();
            }
            if(zhongJaingTime=="fasle"){
                $("#drawnTimeType").hide();
                $(".memberNosee").hide();
            }else if(zhongJaingTime=="true"){
                $("#drawnTimeType").show();
                $(".memberNosee").show();
            }
			$("#keepOrderBtn").on("click",function(){
                $("input").attr("placeholder","");
                $("input[name=happyStart]").attr("placeholder","开始时间");
                $("input[name=happyEnd]").attr("placeholder","结束时间");
                $("input[name=drawnStart]").attr("placeholder","开始时间");
                $("input[name=drawnEnd]").attr("placeholder","结束时间");
                $("input[name=shopKuanHao]").attr("placeholder","选填，款号");
                $("input[name=shopTiaoMa]").attr("placeholder","选填，sku编码");
                $("input[name=shopBianMa]").attr("placeholder","选填，若系统对接洽客可填写用于系统同步");
            });
            var prizeType=$("#prizeType").val();
            if(prizeType=="3"){
                $("#prizeCoupon").hide();
                $("#shopJiMess").show();
            }else if(prizeType=="2"){
                $("#shopJiMess").hide();
                $("#prizeCoupon").show();
            }
		},
        //限制不限制的验证
        inputXZ:function(){
            // 总抽奖次数限制
            var zNumXian=$("#zNumXian").val();
            if(zNumXian=="0"){
                $("#allDraw").val(0);
            }else{
                $("#allDraw").val();
            }
            //每天抽奖次数限制
            var everyCiType=$("#everyCiType").val();
            if(everyCiType=="0"){
                $("#everyDraw").val(0);
            }else{
                $("#everyDraw").val();
            }
            //中奖次数限制
            var personXian=$("#personXian").val();
            if(personXian=="0"){
                $("#zhonJiangNum").val(0);
            }else{
                $("#zhonJiangNum").val();
            }
        },
        sltStoreEv:function(){
            $('#tiHuoType').on('click', function(){
                storeSltDia.show($('#tiHuoType').data('limit'));
            })
        },
        cancelEv:function(){
            $("#cancelReturnBtn").on("click",function(){
                utils.confirm("是否确定取消返回",function(){
                    history.go(-1);
                })
            })
        }
	}
			

	return {
		init:function(){
			page.init();
		}
	}
});