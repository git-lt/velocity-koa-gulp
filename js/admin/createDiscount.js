document.title="洽客-满减满折";
$.createSecondMenu("promotion_manage","满减满折");

$("#bannerUpload").singleImgUploader({
    resultInput : $("#bannerUrl"),
    width:640,
    height:340
});

var createPromotion = {
    init:function(){
        this.timeInit();
        this.limitStore();
        this.promotionTypeEv();
        this.promotionLevelEv();
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
    promotionTypeEv:function(){
    	$("input[name=promotionType]").change(function(){
    		var type = $(this).val();
    		if(type==1){
    			$("#reachPayment").show();
    			$("#reachCount").hide();
    		}else{
    			$("#reachPayment").hide();
    			$("#reachCount").show();
    		}
    	});
    },
    promotionLevelEv:function(){
    	$("#newDiscountPromotion").on("click",".removeLev",function(e){
    		e.preventDefault();
    		var _t = $(this);
    		if(_t.parent().siblings(".item").length == 0){
    			Util.alert("至少保留一个优惠层级");
    		}else{
    			_t.parent().fadeOut(300,function(){
	    			_t.parent().remove();
	    		});
    		}
    	}).on("click",".addLev",function(){
    		var _p = $(this).parent();
    		if(_p.siblings(".item").length>=5){
    			Util.alert("最多支持5级优惠");
    			return false;
    		}
    		var html = _p.siblings(".item:last").clone();
    		_p.before(html);
    		_p.siblings(".item:last").find("input").val("");
    	}).on("blur","input.price",function(){
    		$(this).val((parseFloat($(this).val())||0).toFixed(2));
    	}).on("blur","input.count",function(){
            var _t = $(this);
            var val = ~~(_t.val());
            $(this).val(Math.ceil(val));
        }).on("blur","input.off",function(){
    		var _t = $(this);
    		_t.val(parseFloat(_t.val()));
            if(!_t.val()||_t.val()=='NaN'){
                _t.val("");
                return false;
            }
    		if(_t.val()>10 || _t.val()<1){
    			Util.alert("请输入1-10之间的数",function(){
    				_t.val("").focus();
    			});
    		}
    	});
    },
    limitStore:function(){
    	$("#limitStore").on("change",function(){
	        if($(this).val()=="1"){
	            // console.log(stockIdList);
	            $.popupStoreSelect({
	                title:"选择门店",
	                type:"multiple",
	                okCallback:function(list){
	                    console.log(list);
	                    var storeIdList = [],storeNameStr='';
	                    if(list.length==0){
	                        Util.alert("请选择门店");
	                        return false;
	                    }
	                    $.each(list,function(i,e){
	                        storeIdList.push(e.id);
	                        storeNameStr+='<p>'+e.name+'</p>';
	                    });
                        $("#changeProStore").show().off().on("click",function(){
                            $("#limitStore").trigger("change");
                        });
	                    $("#limitStoreCon").html(storeNameStr);
	                    $("#limitStoreIds").val(storeIdList.join("_"));
	                }
	            });
	        }else{
	            $("#limitStoreIds").val("");
	            $("#limitStoreCon").empty();
	        }
	    });
    }
}
createPromotion.init();

$("#newDiscountPromotion").validate({
    rules: {
        promotionName: {
            required: true,
            maxlength: 20
        },
        startTime:"required",
        endTime:"required"
    },
    messages: {
        promotionName: {
            required: "请填写活动名称",
            maxlength: "最长20个字"
        },
        startTime:"请选择生效时间",
        endTime:"请选择过期时间"
    },
    submitHandler:function(form){
        var legal=true;
    	$(".borderBtm:visible").find("input").each(function(i,e){
    		if($(e).val()==""){
                legal=false;
    			Util.alert("请填写完整的优惠内容",function(){
    				$(e).focus();
    			});
    			return false;	
    		}
            if( $(e).val()==0){
                legal=false;
                Util.alert("请填写不为0的正数",function(){
                    $(e).focus();
                });
                return false;   
            }
    	});
        if(!legal){
            return false;
        }
        if($("#promotionId").val()){//更新
            var createParam = $(form).serializeObject();
            $.ajax({
                url:"updateDiscountPromotion.json",
                data:createParam,
                success:function(data){
                    if(data.status=="0"){
                    	Util.alert("保存成功",function(){
                        	location.href="activityOfDiscount.htm";
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }else{//保存
            var createParam = $(form).serializeObject();
            if(createParam.limitType != 0 && createParam.limitIds==''){
                Util.alert('商品/品类/品牌限制不能为空！');
                return false;
            }
            if(createParam.limitType != 0 && createParam.limitIds==''){
                Util.alert('商品/品类/品牌限制不能为空！');
                return false;
            }
            createParam.startTime = Util.getUnixTime(createParam.startTime);
            createParam.endTime = Util.getUnixTime(createParam.endTime);
            var discountJson = [],discountSort = true;
            $(".borderBtm:visible").find(".item").each(function(i,e){
            	discountJson.push({
            		achievedValue:$(e).find(".achievedValue").val(),
            		discountValue:$(e).find(".discountValue").val()
            	});
            });
            discountJson.sort(function(a,b){
            	var achieved_a = parseFloat(a.achievedValue),
            		achieved_b = parseFloat(b.achievedValue),
            		discount_a = parseFloat(a.discountValue),
            		discount_b = parseFloat(b.discountValue);
            	if(createParam.promotionType=="1"){
                    if(achieved_a == achieved_b || discount_a == discount_b){
                        Util.alert("不同层级间请设置不同金额");
                        discountSort=false;
                    }
            		if((achieved_a > achieved_b && discount_a < discount_b) || (achieved_a < achieved_b && discount_a > discount_b)){
	            		Util.alert("层级关系错误,应该金额越多优惠越大");
	            		discountSort=false;
	            	}
                    if(achieved_a==discount_a || achieved_b==discount_b){
                        Util.alert("订单金额数必须大于优惠金额数");
                        discountSort=false;
                    }
            	}else{
                    if(achieved_a == achieved_b || discount_a == discount_b){
                        Util.alert("不同层级间请设置不同件数和折扣");
                        discountSort=false;
                    }
            		if((achieved_a > achieved_b && discount_a > discount_b) || (achieved_a < achieved_b && discount_a < discount_b)){
	            		Util.alert("层级关系错误,应该件数越多折扣越小");
	            		discountSort=false;
	            	}
            	}
            });
            if(!discountSort){
            	return false;
            }
            createParam.discountListJson = JSON.stringify(discountJson);
            createParam.description = createParam.description.replace(/[\n]/g,"<br>");
            $.ajax({
                url:"createDiscountPromotion.json",
                data:createParam,
                success:function(data){
                    if(data.status=="0"){
                        Util.alert("创建成功",function(){
                        	location.href="activityOfDiscount.htm";
                        });
                    }else{
                        Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                    }
                }
            });
        }
    }
});


// 获取品牌列表
// 获取第一个品牌下的子类
// 事件：
// 点击品牌获取子类，并缓存子类数据
// 点击类别切换active, 获取父类
MOD_SelectProsDia.o.getProListUrl = 'queryAllocatedSupplierStock.json';
var brandDia = MOD_SelectBrandDia.init();
var proDia = MOD_SelectProsDia.init();

var createCoupon = {
    o:{
        getBrandListUrl:'getAllCategoryFamily.json',
        getBrandLeafUrl:'getCategoryListByFamilyId.json',
        getProListUrl:'querySupplierStock.json',
        PLDataCache:[],
        PLCurrChkId:'',
        PLLeafDataCache:[],
        PLLeafTplCache:[],
        chkPLData:[],
        chkPLResIds:''
    },
    init:function(){
        this.limitSltEv();
        this.initPLList();
        this.chkPLEv();
        this.chkPLLeafEv();
    },
    limitSltEv:function(){
        var self = this;
        $('#limitStock').on("change", function (e) {
            $('#editPromotionLimit').fadeIn();
            var v = $(this).val();
            if(v ==='1'){
                self.openPL();
            }else if(v ==='3'){
                proDia.show(function(spRes){
                    var seled = $.grep(spRes,function(e,i){return e!=undefined});
                    if(seled.length==0){
                        Util.alert("请选择商品");
                        return false;
                    }
                    var proHtml='',spChkIds=[];
                    $.each(seled,function(i,e){
                        spChkIds.push(e.id);
                        proHtml += '<p>'+e.name+'</p> ';
                    });
                    $('#limitStockIds').val(spChkIds.join('_'));
                    $('#limitStockCon').html(proHtml);
                });
            }else if(v === '2'){
                brandDia.show(function(brands){
                    if(brands.length>0){
                        var brandStr ='', chkIds = [];

                        for(var i in brands){
                            chkIds.push(brands[i].brandId);
                            brandStr += '<p>'+brands[i].brandName+'</p> ';
                        }
                        $('#limitStockIds').val(chkIds.join('_'));
                        $('#limitStockCon').html(brandStr);
                    }else{
                        Util.alert('至少选择1个品牌！');
                        return false;
                    }
                });
            }else{
                $('#editPromotionLimit').fadeOut();
                $('#limitStockCon').html('');
                $('#limitStockIds').val('');
            }
        });

        $('#editPromotionLimit').on('click', function(){
            $('#limitStock').trigger('change');
        });
    },
    openPL:function(){
        var self = this, o = this.o;
            dialog({
                title: '选择品类',
                padding:0,
                content:$('#limitPL')[0],
                okValue: '确定',
                ok: function () {
                    // alert('确定');
                    // 将选择结果显示在指定区域
                    if(!o.chkPLResIds){
                        dialog({
                            title:'提示',
                            content:'请选择需要限制的品类！'
                        }).show();
                        return false;
                    }else{
                        $('#limitStockCon').html($('#limitResBox').children().clone());
                        $('#limitStockIds').val(o.chkPLResIds);
                        return true;
                    }
                },
                cancelValue: '取消',
                cancel: function () {
                    return true;
                }
            }).width(720).showModal();

            $('#plListNav a:first').trigger('click');
    },
    initPLList:function(){
        var self = this,o = this.o;
        $.ajax({
            url:this.o.getBrandListUrl,
            method:'POST',
            type:'JOSN'
        }).done(function(data){
            if(typeof data !== 'string'){
                if(data.status==='0'){
                    // 成功
                    var res = data.result.categoryFamilyList;
                    if(!$.isArray(res)){
                        res = [res];
                    }

                    if(res.length){
                        // {id:10, familyName:男装, familyPriority:1}
                        $('#plListNav').html(template('PLTpl', {res:res}));
                        for(var i in res){
                            o.PLDataCache[res[i].id] = res[i].familyName;
                        }
                        
                    }else{
                        // 数据为空
                        $('#plListNav').html('暂无数据！');
                    }
                }else{
                    // 1或者401 未登录
                    dialog({
                        title:'提示',
                        content:'未知错误，请联系客服！'
                    }).show();
                }
            }else{
                // 1或者401 未登录
                dialog({
                    title:'提示',
                    content:'未知错误，请联系客服！'
                }).show();
            }
        });
    },
    getPLChildren:function(PLId, $parentBox){
        var self = this, o = this.o;
        // 先从缓存中取，如果缓存中没有，则异步请求
        // var $leafListBox = $('#PLLeaf-'+PLId).length ? $('#PLLeaf-'+PLId): $('<div>',{'id',PLId}).appendTo('#plListLeaf');

        if(o.PLLeafTplCache[PLId]){
            // {id:10, familyName:男装, familyPriority:1}
            $parentBox.show().siblings().hide();

            // 判断当前子类是否全部选中
            var currLeafBox = $('#PLLeaf-'+PLId);
            if(currLeafBox.find('.active').length === currLeafBox.children().length){
                $('#chkAllPL').addClass('active');
            }else{
                $('#chkAllPL').removeClass('active');
            }
        }else{
            if(PLId){
                $.ajax({
                    url:o.getBrandLeafUrl,
                    data:{familyId:PLId},
                    method:'GET',
                    type:'JSON'
                }).done(function(data){
                    if(typeof data !== 'string'){
                        if(data.status==='0'){
                            // 成功
                            var res = data.result.categoryList;
                            if(!$.isArray(res)){
                                res = [res];
                            }
                            if(res.length){
                                // {id:10, familyName:男装, familyPriority:1}
                                $parentBox.html(template('PLLeafTpl', {res:res}));
                                for(var j in res){
                                    o.PLLeafTplCache[PLId] = res;
                                    o.PLLeafDataCache[res[j].id]= res[j].name;
                                }

                                $('#chkAllPL').removeClass('active');
                            }else{
                                // 数据为空
                                $parentBox.html('<p class="c-8 f12">暂无数据！</p>');
                            }
                        }
                    }else{
                        // 未知错误
                        dialog({
                            title:'提示',
                            content:'未知错误，请联系客服！'
                        }).show();
                    }
                });
            }
        }
    },
    chkPLEv:function(){
        var self = this, o = this.o;
        $('#plListNav').on('click','a',function(){
            var $this = $(this), $thisPrt =$this.parent(),
                currInd = $thisPrt.data('curr') ? $thisPrt.data('curr') : 0,
                targetInd = $this.index();
                familyId = $this.data('id');
            if(targetInd !== currInd){
                $this.addClass('active').siblings().andSelf().eq(currInd).removeClass('active');
                $thisPrt.data('curr',targetInd);
            }else{
                $this.addClass('active');
            }

            var $leafListBox = $('#PLLeaf-'+familyId).length ? $('#PLLeaf-'+familyId): $('<div>',{'id': 'PLLeaf-'+familyId}).appendTo('#plListLeaf');
            self.getPLChildren(familyId,$leafListBox);
            $leafListBox.show().siblings().hide();
            o.PLCurrChkId = familyId;
        });
    },
    chkPLLeafEv:function(){
        var self = this, o = this.o;
        $('#plListLeaf').on('click','a',function(){
            var $this = $(this),
                currInd = $this.data('curr')?$this.data('curr'):0,
                targetInd = $this.index(),
                leafId = $this.data('id').split('-');

            $this.data('curr',targetInd);
            $this.toggleClass('active');

            if(!$.isArray(o.chkPLData[leafId[0]])){
                o.chkPLData[''+leafId[0]]=[];
            }

            var tI = (o.chkPLData[leafId[0]]).indexOf(leafId[1]);

            if($this.hasClass('active') && tI<0){
                // 添加
                o.chkPLData[leafId[0]].push(leafId[1]);
            }else{
                // 删除
                o.chkPLData[leafId[0]].splice(tI,1);
                $('#chkAllPL').removeClass('active');
            }

            // 更新选择结果
            self.showChkPLRes();
        });

        // 全选：
        $('#chkAllPL').on('click', function(){
            var $this = $(this);
            $this.toggleClass('active');

            if($this.hasClass('active')){
                $('#PLLeaf-'+o.PLCurrChkId).children().addClass('active');
                var t = [];
                for(var x in o.PLLeafTplCache[o.PLCurrChkId]){
                    t.push(o.PLLeafTplCache[o.PLCurrChkId][x].id);
                }
                o.chkPLData[o.PLCurrChkId]=t;
            }else{
                $('#PLLeaf-'+o.PLCurrChkId).children().removeClass('active');
                o.chkPLData[o.PLCurrChkId]=[];
            }

            self.showChkPLRes();
        });
    },
    showChkPLRes:function(){
        var self = this, o= this.o, resHtml='', isFirst=true, resArr=[];
        if(o.chkPLData.length){
            for(var i in o.chkPLData){
                if(o.chkPLData[i].length){
                    resArr = resArr.concat(o.chkPLData[i]);
                    resHtml +='<p><b>' + o.PLDataCache[i] + "</b>：";
                    for(var k in o.chkPLData[i]){
                        resHtml += o.PLLeafDataCache[o.chkPLData[i][k]]+'/';
                    }
                    resHtml = resHtml.substring(0,resHtml.length-1)+'</p>';
                }
            }
            $('#limitResBox').html(resHtml);
            // console.log(resArr);
            o.chkPLResIds= resArr.join('_');
        }else{
            $('#limitResBox').html('请选择需要限制的品类。');
        }
    }
} 
createCoupon.init();

