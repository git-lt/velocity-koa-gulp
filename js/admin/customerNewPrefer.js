define(['utils','webuploader','WdatePicker','clockpicker','powerSeleteDia'],function(utils,webuploader){
    $('#mainMenusBox').find('[name=customer_manage]').addClass('active');
    $('#sidebar-menu .active').removeClass('active');
    $('#sidebar-menu').find('[href*=customerExchange]').addClass('active');
    var CONFIG, page;
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
        apiaddExchange:'addExchangeActionForCoupon.json',  //保存兑换商品-优惠券
        apigetVip:'getVipLevels.json',         //查询等级详情
    };

    page={
        init:function(){
            this.initElement();  //信息初始化
            this.editBoxShowEv(); //优惠卷编辑

            this.tableList(); //表单验证
            this.inputYZ();   //限制验证

            this.selectGroup();  //获取会员等级
            this.cancelEv();  //取消返回
        },
        initElement:function(){
            var _this=this;
            //上传图片
            $("#previewUpload").multiImgUploader({
                length:5,
                resultInput : $("#productPicUrl"),
                callback: function(){
                    $("#productPicUrl").removeClass("error").next(".error").addClass("hide");
                },
                removeCallback: function(){
                    if (!$("#previewUploadBakWrap .loaded").length){
                        $("#productPicUrl").addClass("error").next(".error").removeClass("hide");
                    }
                }
            });
            $(".select2").select2({minimumResultsForSearch: -1});
            //年月日初始
            _this.timeInit();
            //时间初始
            $("#timeStart").clockpicker();
            $("#timeEnd").clockpicker();
            $("select").on("change",function(){
                _this.inputYZ();
            })
        },
        timeInit:function(){
            $("#dateStart").on("click",function(){
                WdatePicker({
                    startDate:'%y-%M-%d 00:00:00',
                    dateFmt:'yyyy-MM-dd HH:mm:ss',
                    qsEnabled:false,
                    maxDate:'#F{$dp.$D(\'dateEnd\');}'
                });
            });
            $("#dateEnd").on("click",function(){
                WdatePicker({
                    startDate:'%y-%M-%d 23:59:59',
                    dateFmt:'yyyy-MM-dd HH:mm:ss',
                    qsEnabled:false,
                    minDate:'#F{$dp.$D(\'dateStart\');}'
                });
            });
        },
        //保存兑换商品-优惠券
        addExchange:function(){
            var huiYuan=$("#huiYuan").val();
                if(huiYuan!=null){
                    $("#huiYuan").val().join("_")
                }
            var options={
                exchangeTypeId:$("#couponId").val(),
                exchangePoint:$("#needFen").val(),
                exchangePicList:$("#productPicUrl").val(),
                stockCount:$("#shopNum").val(),
                todayLimit:$("#everyNum").val(),
                personLimit:$("#personNum").val(),
                memberLevelLimit:huiYuan||"",
                dayLimitStart:utils.getUnixTime($("#dateStart").val()),
                dayLimitEnd:utils.getUnixTime($("#dateEnd").val()),
                timeLimitStart:utils.getUnixTime($("#timeStart").val()),
                timeLimitEnd:utils.getUnixTime($("#timeEnd").val()),
            }
            return $.post(CONFIG.apiaddExchange,options)
        },
        //限制不限制的验证
        inputXZ:function(){
            // 每日兑换限制
            var everyXian=$("#everyXian").val();
            if(everyXian=="0"){
                $("#everyNum").val(0);
            }else{
                $("#everyNum").val();
            }
            //每人兑换限制
            var personXian=$("#personXian").val();
            if(personXian=="0"){
                $("#personNum").val(0);
            }else{
                $("#personNum").val();
            }
            //兑换日期限制
            var dataType=$("#dataType").val();
            if(dataType=="0"){
                $("#dateStart").val(0);
                $("#dateEnd").val(0);
            }else{
                $("#dateStart").val();
                $("#dateEnd").val();
            }
            //每日兑换限制
            var timeType=$("#timeType").val();
            if(timeType=="0"){
                $("#timeStart").val(0);
                $("#timeEnd").val(0);
            }else{
                $("#timeStart").val();
                $("#timeEnd").val();
            }
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
        //验证时间
        checkTime:function(){
            var timeStart=$("#timeStart").val();
            var timeEnd=$("#timeEnd").val();

            var TimeStart=timeStart.split(":");
            var TimeEnd=timeEnd.split(":");

            var sj1 = parseInt(TimeStart[0])*12 + parseInt(TimeStart[1]);
            var sj2 = parseInt(TimeEnd[0])*12 + parseInt(TimeEnd[1]);
            if(timeStart==''&&timeEnd==''){
                Util.alert("每日结束时间与开始时间不能为空"); 
                return false;    
            }
            if (sj1 >=sj2) {            
                Util.alert("每日结束时间不能大于或等于开始时间"); 
                return false;    
            }else{
                return true;
            }
        },
        //验证日期
        checkData:function(){
            var dateStart=$("#dateStart").val();
            var dateEnd=$("#dateEnd").val();

            var DataStart=new Date(dateStart.replace(/\-/g,'/'));
            var DataEnd=new Date(dateEnd.replace(/\-/g,'/'));

            if(dateStart==''&&dateEnd==''){
                Util.alert("兑换结束时间与开始时间不能为空"); 
                return false;    
            }
            if (DataStart >=DataEnd) {            
                Util.alert("兑换结束时间不能大于或等于开始时间"); 
                return false;    
            }else{
                return true;
            }
        },
        editBoxShowEv:function(){
            $("#editCoupon").on("click",function(){
                dialog({
                    title:"发放的优惠券",
                    id:"util-coupon",
                    width:560,
                    content: $("#diaCouponEditTpl"),
                    cancelValue:'取消',
                    oklValue:'确定',
                    backdropOpacity:"0.2",
                    cancel:function(){
                        this.close();return false;
                    },
                    ok:function(){
                        $("#newCouponForm").submit();
                        return false;
                    }
                }).showModal();
            });
        },
        tableList:function(){
            var _this=this;
            $("#privilegeCurly").validate({
                rules: {
                    //基础信息
                    couponId:"required",
                    needFen:{
                        required: true,
                        isNum: true
                    },
                    productPicUrl:"required",
                    //兑换数量限制
                    shopNum:{
                        required: true,
                        isNum: true
                    },
                    everyNum:{
                        required: true,
                        isNum: true
                    },
                    personNum:{
                        required: true,
                        isNum: true
                    },
                    //兑换时间限制
                    dateStart:"required",
                    dateEnd:"required",
                    timeStart:"required",
                    timeEnd:"required",
                },
                messages: {
                    //基础信息
                    couponId:"请编辑优惠卷信息",
                    needFen:{
                        required: "请输入兑换所需积分",
                        isNum: "只能包含数字"
                    },
                    productPicUrl:"请上传优惠券展示图",
                    //兑换数量限制
                    shopNum:{
                        required: "请输入库存数量",
                        isNum: "只能包含数字"
                    },
                    everyNum:{
                        required: "请输入每日兑换限制数量",
                        isNum: "只能包含数字"
                    },
                    personNum:{
                        required: "请输入每人兑换限制数量",
                        isNum: "只能包含数字"
                    },
                    //兑换时间限制
                    dateStart:"请选择开始时间",
                    dateEnd:"请选择结束时间",
                    timeStart:"请选择开始时间",
                    timeEnd:"请选择结束时间",
                },
                submitHandler:function(form){
                    _this.checkTime();
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
                }
            })
        },
        inputYZ:function(){
            var _this=this;
            var everyXian=$("#everyXian").val();
            var Div=$("#everyXian").parent().siblings("div");
            var personXian=$("#personXian").val();
            var PDiv=$("#personXian").parent().siblings("div");
            var dataType=$("#dataType").val();
            var dataDiv=$("#dataType").parent().siblings("div");
            var timeType=$("#timeType").val();
            var timeDiv=$("#timeType").parent().siblings("div");
            if(everyXian=="0"){
                Div.hide();
            }else{
                Div.show();
            }
            if(personXian=="0"){
                PDiv.hide();
            }else{
                PDiv.show();
            }
            if(dataType=="0"){
                dataDiv.hide();
            }else{
                dataDiv.show();
            }
            if(timeType=="0"){
                timeDiv.hide();
            }else{
                timeDiv.show();
            }
            $("#keepOrderBtn").on("click",function(){
                $("input").attr("placeholder","");
                $("input[name=huiYuan]").attr("placeholder","请选择");
                $("input[name=dateStart]").attr("placeholder","开始时间");
                $("input[name=dateEnd]").attr("placeholder","结束时间");
                $("input[name=timeStart]").attr("placeholder","开始时间");
                $("input[name=timeEnd]").attr("placeholder","结束时间");
            })
        },
        cancelEv:function(){
            $("#cancelReturnBtn").on("click",function(){
                Util.confirm("是否确定取消返回",function(){
                    history.go(-1);
                })
            })
        }
    }

    return {
        init: function(){
            page.init();
        }
    }

});