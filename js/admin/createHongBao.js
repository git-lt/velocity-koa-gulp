$.createSecondMenu("promotion_manage","抢红包");

// 初始化 选择商品对话框
MOD_SelectProsDia.o.getProListUrl = 'queryAllocatedSupplierStock.json';
proDia = MOD_SelectProsDia.init();

var p_dvdCp={
	o:{
		getBrandListUrl:'getAllCategoryFamily.json',
		getBrandLeafUrl:'getCategoryListByFamilyId.json',
		PLDataCache:[],
		PLCurrChkId:'',
		PLLeafDataCache:[],
		PLLeafTplCache:[],
		chkPLData:[],
		chkPLResIds:'',
		startTime:new Date().getTime(),
		endTime:new Date().getTime(),
		hbStartTime:null,
		hbEndTime:null,
		hbEditCPId:null, //编辑的优惠券id, 点击编辑时获取
		cpDataCache:[],
		useSelfCouponCode: false
	},
	init:function(){
		this.setupValidate();
		this.initCPTime();
		this.limitSltEv();
		this.initPLList();
		this.chkPLEv();
		this.chkPLLeafEv();
		this.chkSalesEv();
		this.editCouponLimitEv();

		this.hb_Init();
		
		this.editeCPEv();
		this.initComs();
		this.hb_initTime();  	
		this.hb_saveEv(); 	//红包 保存
		this.hb_DelCPEv(); 	//红包 删除
		this.hb_EditCPEv(); //编辑 红包
		this.couponCodeListen();
		this.couponCodeTip();
	},
	couponCodeListen:function(){
		var self = this, o = this.o;
		if(Util.getUrlParam("id")){
			$("#couponCodeTypeTr").hide();
		}
        $("input[name=couponCodeType]").on("change",function(){
            if($(this).val()==1){
                o.useSelfCouponCode = true;
                self.hb_CPListRender();
                $("input[name=couponCodeType][value=0]").prop("disabled",true);
            }else{
                o.useSelfCouponCode = false;
                self.hb_CPListRender();
            }
        });
    },
    couponCodeTip:function(){
        var html = '1. 导入券码的优惠券类型请于您新建的保持一致。<br>\
            若您新建的券为满100减10元，则券码必须也为该种类型券。<br>\
            2.导入列项，第一列为券码，首行即为券码，无需添加列项名称。<br>\
            3. 单次上传csv最大条目（行数）为10万条。<br>\
            4. <a target="_blank" href="https://qncdn.qiakr.com/file/洽客自有券码模板.csv">下载模板示例</a><br>\
            5. 上传前请检查csv文件内券码是否正常。';
        $(".qk2-container").on("click",".codeUploadTip",function(){
            dialog({
                align: "right top",
                quickClose: true,
                content:html
            }).show(this);
        });
    },
	couponOpen:function(){
		var o = this.o, self = this, cpDia;
		cpDia = dialog({
			title:'需发放的优惠券类型',
			// cancel: false,
			content:$('#clippingBox')[0],
			okValue: '确定',
		   	ok: function () {
		   		var $cpFrm= $('#newCouponForm');
		   		if(!$('#newCouponForm').valid()) return false;
		   		if(!$('#cpStartTime').val() || !$('#cpEndTime').val()) {
		   			Util.alert('请选择优惠券生效时间段！')
		   			return false;
		   		}

		   		if(~~$cpFrm.find('[name="couponValue"]').val()>=$cpFrm.find('[name="orderLimitValue"]').val()-0) {
		   			Util.alert('优惠金额必须小于订单金额！')
		   			return false;
		   		}

		   		// 获取数据，创建优惠券
		   		var $CPFrm = $('#clippingBox');
		   		var pms = {
		   			couponName: $CPFrm.find('input[name="couponName"]').val(),
		   			couponValue: $CPFrm.find('input[name="couponValue"]').val(),
		   			orderLimitValue: $CPFrm.find('input[name="orderLimitValue"]').val(),
		   			limitType: $CPFrm.find('[name="limitType"]').val(),
		   			limitIds: $CPFrm.find('input[name="limitIds"]').val(),
		   			// limitStoreString: $CPFrm.find('input[name="limitStoreString"]').val(),
		   			startTime: o.startTime,
		   			endTime: o.endTime,
		   			couponDescription: $.trim($CPFrm.find('textarea[name="couponDescription"]').val()),
		   			color: $('#cpColor').val()
		   		};
		   		if(o.hbEditCPId){//如果有优惠券id，则为编辑，否则为创建
		   			var ePms = {
		   				couponId:$('#clippingBox').data('cid'),
		   				couponName: $CPFrm.find('input[name="couponName"]').val(),
		   				couponDescription: $.trim($CPFrm.find('textarea[name="couponDescription"]').val()),
		   				color: $('#cpColor').val()
		   			};
		   		 	$.ajax({
		   		 	    url:"updateCoupon.json",
		   		 	    data:ePms,
		   		 	    success:function(data){
		   		 	        if(data.status=="0"){
		   		 	            cpDia.close();
		 						pms.couponId = o.hbEditCPId;
		 						o.cpDataCache['c'+o.hbEditCPId].couponName=ePms.couponName;
		 						o.cpDataCache['c'+o.hbEditCPId].couponDescription=ePms.couponDescription;
		 						o.cpDataCache['c'+o.hbEditCPId].color=ePms.color;
		   		 	            self.hb_CPListRender();
		   		 	        }else{
		   		 	        	Util.alert('系统繁忙，请稍后再试');
		   		 	        }
		   		 	    }
		   		 	});
		   		 }else{
		   		 	$.ajax({
		   		 	    url:"insertCoupon.json",
		   		 	    data:pms,
		   		 	    success:function(data){
		   		 	        if(data.status=="0"){
		   		 	            cpDia.close();
		   		 	   			// 添加数据到
		   		 	   			pms.couponId = data.couponId;
		   		 	            o.cpDataCache['c'+data.couponId]=pms;
		   		 	            self.hb_CPListRender();
		   		 	        }else{
		   		 	        	Util.alert('服务器繁忙，请稍候重试！');
		   		 	        }
		   		 	    }
		   		 	});
		   		 }
		   	}
		}).width(700).height(400).showModal();
	},
	initComs:function(){
		if(Util.getUrlParam("id")){
		    $('.couponWrap .couponstart').html(Util.getLocalTime(new Date($("#dateStart").val()).getTime()).substring(0,10).replace(/-/g,"."));
		    $('.couponWrap .couponend').html(Util.getLocalTime(new Date($("#dateEnd").val()).getTime()).substring(0,10).replace(/-/g,"."));
		}

		$("#clippingBox .couponColor").on("click",'a',function(e){
		    if($(this).hasClass("active")) return false;
		    $(this).addClass("active").siblings().removeClass("active");
		    var color = $(this).data('color');
		    $('#cpColor').val(color);
		    $("#clippingBox .couponWrap").css("background-color",color);
		});
		$('input[name=couponName],input[name=couponValue],input[name=orderLimitValue]').on('input propertychange blur', function() {
		    var name = this.name;
		    $('#clippingBox .couponWrap .'+name).html($(this).val());
		    $(this).parent().find("#couponValue-error-my").remove();
		});

		$('input[name=couponValue],input[name=orderLimitValue]').blur(function(e){
		    var _val = $(this).val();
		    if(parseFloat(_val).toString() == "NaN") return false;
		    $(this).val(_val);
		    $(this).trigger("propertychange");
		    $(this).trigger("input");
		});

		$('#spinner1,#spinner2').spinner();
	},
	setupValidate:function(){
		var o = this.o;
		$("#newCouponForm").validate({
			debug: true,
		    rules: {
		        couponName: {
		            required: true,
		            maxlength: 16
		        },
		        couponValue:{
		            required: true,
		            min: 1
		        },
		        totalLimitCount: {
		            required: true,
		            min: 1
		        },
		        dayLimitCount: {
		            required: true,
		            min: 0
		        },
		        personLimitCount: {
		            required: true,
		            min: 0
		        },
		        orderLimitValue:{
		            required: true,
		            min: 1
		        }
		    },
		    messages: {
		        couponName: {
		            required: "请填写优惠券名称",
		            maxlength: "最长16字"
		        },
		        couponValue:{
		            required: "请填写面值",
		            min: "最小1元"
		        },
		        totalLimitCount: {
		            required: "请填写发放总量",
		            min: "最少1张"
		        },
		        dayLimitCount:{
		            required: "请填写每日限领张数",
		            min: "不能为负"
		        },
		        personLimitCount:{
		            required: "请填写每人限领张数",
		            min: "不能为负"
		        },
		        orderLimitValue:{
		            required: "请填写使用条件",
		            min: "最小1元"
		        }
		    }
		});
	},
	limitSltEv:function(){
	    var self = this;
	    $('#editCouponLimit').fadeOut();
	    $('#couponLimit').on("change", function (e) { 
	        var v = $(this).val();
	        if(v ==='1'){
	            self.openPL();
	            $('#editCouponLimit').fadeIn();
	        }else if(v ==='2'){
	            proDia.show(function(spRes){
	                var spChkIds = [];
	                for(var i in spRes){
	                    spChkIds.push(i);
	                }
	                if(spChkIds.length){
	                    var res = $('#SPChkResBox').clone().find('i').hide().end();
	                    $('#couponLimitCon').addClass('hasChkRes').html(res);
	                    $('#hid_limitIds').val(spChkIds.join('_'));
	                    return true;
	                }else{
	                    Util.alert('请选择需要限制的商品');
	                    return false;
	                }
	            }, function(){
	                $('#couponLimitCon').removeClass('hasChkRes').html('');
	                $('#hid_limitIds').val('');
	                $('#couponLimit').val(0).trigger('change');
	            });

	            $('#editCouponLimit').fadeIn();
	        }else{
	            $('#couponLimitCon').removeClass('hasChkRes').html('');
	            $('#hid_limitIds').val('');
	            $('#editCouponLimit').fadeOut();
	        }
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
	                // 将选择结果显示在指定区域
	                if(!o.chkPLResIds){
	                    dialog({
	                        title:'提示',
	                        content:'请选择需要限制的品类！'
	                    }).show();
	                    return false;
	                }else{
	                    $('#couponLimitCon').addClass('hasChkRes').html($('#limitResBox').children().clone());
	                    $('#hid_limitIds').val(o.chkPLResIds);
	                    return true;
	                }
	            },
	            cancelValue: '取消',
	            cancel: function () {
	                $('#couponLimitCon').removeClass('hasChkRes').html('');
	                $('#hid_limitIds').val('');
	                $('#couponLimit').val(0).trigger('change');
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
	                    $('#plListNav').html('暂无数据');
	                }
	            }else{
	                Util.alert('系统繁忙，请稍后再试');
	            }
	        }else{
	            Util.alert('系统繁忙，请稍后再试');
	        }
	    });
	},
	getPLChildren:function(PLId, $parentBox){
	    var self = this, o = this.o;
	    // 先从缓存中取，如果缓存中没有，则异步请求
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
	                            $parentBox.html('<p class="c-8 f12">暂无数据</p>');
	                        }
	                    }
	                }else{
	                    Util.alert('未知错误，请联系客服');
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
	},
	editCouponLimitEv:function(){
	    $('#editCouponLimit').on('click', function(){
	        $('#couponLimit').trigger('change');
	    });
	},
	initCPTime:function(){
		var self = this, o = this.o;
		$('#clippingBox .couponWrap .couponstart, #clippingBox .couponWrap .couponend').html(moment().format("YYYY.MM.DD"));

		$("#cpStartTime").on("click",function(){
		    WdatePicker({
		        startDate:'%y-%M-%d 00:00:00',
		        dateFmt:'yyyy-MM-dd HH:mm:ss',
		        qsEnabled:false,
		        maxDate:'#F{$dp.$D(\'cpEndTime\');}',
		        onpicking:function(dp){
		            $('#clippingBox .couponstart').html(dp.cal.getNewDateStr().split(' ')[0].replace(/-/g,"."));
		            o.startTime = Util.getUnixTime(dp.cal.getNewDateStr());
                }
		    });
		});
		$("#cpEndTime").on("click",function(){
		    WdatePicker({
		        startDate:'%y-%M-%d 23:59:59',
		        dateFmt:'yyyy-MM-dd HH:mm:ss',
		        qsEnabled:false,
		        minDate:'#F{$dp.$D(\'cpStartTime\');}',
		        onpicking:function(dp){
		            $('#clippingBox .couponend').html(dp.cal.getNewDateStr().split(' ')[0].replace(/-/g,"."));
		            o.endTime =  Util.getUnixTime(dp.cal.getNewDateStr());
                }
		    });
		});
	},
	chkSalesEv:function(){
		$('#chkSalesSlt').on('change', function(){
			$this = $(this), v = $this.val();
			if(v === '1'){//指定门店导购
				salesDia.show(function(res){
					console.log('门店选择结果');
					console.log(res);
					var salesTotal =0, cpNum = $('#divideCPNum').val();
					for(var i in res){
						salesTotal += ~~res[i]['salesCount'];
					}
					$('#chkSalesTip').html('共'+salesTotal+'名导购，每个导购'+cpNum+'张，总计发放 <span class="c-rd b">'+salesTotal*cpNum+'</span> 张优惠券').fadeIn();
				});
				// 显示编辑
				$('#salesEditLink').fadeIn();
			}else{
				$('#chkSalesTip').hide();
				$('#salesEditLink').hide();
			}	
		});
	},
	editeCPEv:function(){
		var self = this,o = this.o;
		$('#addCpForHB').on('click', function(){
			self.CPSetData(null,false);
			o.hbEditCPId = '';
			self.couponOpen();
		});
	},
	CPSetData:function(cData,isDisabled){
		var $cpDia = $('#clippingBox'), o = this.o, self = this;

		var defautl = {
			couponName:'',
			couponValue:"",
			orderLimitValue:'',
			limitType:0,
			limitIds:'',
			couponId:'',
			startTime:'',
			endTime:'',
			couponDescription:'1. 必须在订单金额满足时才能使用；\r2. 一张店铺优惠券仅限于单笔订单消费抵用；\r3. 优惠券过期则作废;\r4. 活动商品，如闪购秒杀不可使用优惠券；',
			color:'#F44336'
		};
		cData = cData || defautl;
		o.startTime = cData.startTime; o.endTime = cData.endTime;
		var sT = Util.getLocalTime(cData.startTime);
		var eT = Util.getLocalTime(cData.endTime);

		$cpDia.data('cpid',cData.couponId);

		$cpDia.find('.orderLimitValue').text(cData.orderLimitValue);
		$cpDia.find('.couponValue').text(cData.couponValue);
		$cpDia.find('.couponName').text(cData.couponName);
		$cpDia.find('.bottom .couponstart').text(sT.split(' ')[0]);
		$cpDia.find('.bottom .couponend').text(eT.split(' ')[0]);
		$cpDia.find('[name="couponName"]').val(cData.couponName);
		$('#cpColor').val(cData.color);
		$cpDia.find('[data-color="'+cData.color+'"]').addClass('active').siblings().removeClass('active');
		$cpDia.find('[name="couponValue"]').prop('disabled', isDisabled).val(cData.couponValue);
		$cpDia.find('[name="orderLimitValue"]').prop('disabled', isDisabled).val(cData.orderLimitValue);

		$('#couponLimit').val(cData.limitType);
		if(cData.limitType==0){
			$('#couponLimit').trigger('change');
			$('#limitCPBox').show();
			$('#limitCPTypesTxt').html('').hide();
		}else{
			$('#limitCPBox').hide();
			// 获取优惠券限制的商品或品类 并显示  异步获取
			$('#limitCPTypesTxt').show();
			$.post('getCouponInfo.json?couponId='+cData.couponId).done(function(data){
				if(data.status === '0'){
					var newLimitBox = [], limitTxt = cData.limitType == 1?'限品类':'限商品';
					newLimitBox.push('<p class="b">'+limitTxt+'</p><div class="hasChkRes">');
					var tD = cData.limitType == 1?data.result.couponLimitVo.categoryList:data.result.couponLimitVo.productList;
					for (var i in tD){
						newLimitBox.push('<p>'+tD[i].name+'</p>');
					}
					newLimitBox.push('</div>');
					$('#limitCPTypesTxt').html(newLimitBox.join(''));
				}
			}).fail()
		}
		if(cData.limitStoreIds){
			$("#limitStore").val("1").trigger("change")
		}
			
		$('#couponLimitCon').html('').removeClass('hasChkRes');

		$('#cpStartTime').prop('disabled', isDisabled).val(sT);
		$('#cpEndTime').prop('disabled', isDisabled).val(eT);

		$cpDia.find('[name="limitType"]').prop('disabled', isDisabled).val(cData.limitType);
		// $cpDia.find('[name="limitStore"]').prop('disabled', isDisabled).val(cData.limitStoreString?"1":"");
		$('#couponDescription').val(cData.couponDescription);
	},
	hb_Init:function(){
		var o = this.o, self = this, hbid=Util.getUrlParam("id");
		if(hbid){//编辑
			// 展示列表
			$.getJSON('queryCouponPackPromotionByPromotionId.json',{couponPromotionId:hbid}, function(data){
				if(data.status==='0'){
					var cpInfo = data.result.couponPackPromotion, cp, cpHb, tplData=[];

					// o.cpDataCache[]
					for(var i in cpInfo.couponPackDetailVoList){
						cp = cpInfo.couponPackDetailVoList[i].coupon;
						cpHb = cpInfo.couponPackDetailVoList[i].couponPackDetail;
						o.cpDataCache['c'+cpInfo.couponPackDetailVoList[i].coupon.id]={
							id:cpInfo.couponPackDetailVoList[i].id,
							color: cp.color,
							couponDescription: cp.couponDescription,
							couponId: cp.id,
							couponName: cp.couponName,
							couponValue: cp.couponValue,
							endTime: cp.endTime,
							limitIds: cp.couponName,
							limitType: cp.limitType,
							orderLimitValue: cp.orderLimitValue,
							startTime: cp.startTime,
							limitCount:cpHb.limitCount,
							probability:cpHb.probability
						};
					}
					for(var i in o.cpDataCache){
						tplData.push(o.cpDataCache[i]);
					}
					$('#btnCreateHb').data('cpid',cpInfo.id)
					$('#hbComment').val(cpInfo.couponPromotion.comment);
					$('#hbStartTime').prop('disabled',true).val(Util.getLocalTime(cpInfo.couponPromotion.startTime));
					$('#hbEndTime').prop('disabled',true).val(Util.getLocalTime(cpInfo.couponPromotion.endTime));
					self.hbStartTime = cpInfo.couponPromotion.startTime;
					self.hbEndTime = cpInfo.couponPromotion.endTime;
					$('#hbContainsEmpty').hide();

					$('#hbListCp').html(template('CPListTpl',{list:tplData}));
				}
			});
		}else{//新建
			self.couponOpen();
		}
	},
	hb_CPListRender:function(){
		var o = this.o, self = this, tplData=[];

		o.cpDataCache = Util.refreshStringArr(o.cpDataCache);
		for(var i in o.cpDataCache){
			tplData.push(o.cpDataCache[i]);
		}
		if(tplData.length){
			$('#hbListCp').html(template('CPListTpl',{
				list:tplData,
				ueseSelfCode:o.useSelfCouponCode
			}));
			$(".codeFileUpload").couponCodeUploader();
			// 判断当前优惠券个数是否为三个，是则隐藏添加优惠券按钮
			if(this.o.cpDataCache.length===3){
				$('#hbContainsEmpty').hide();
			}
		}
	},
	hb_DelCPEv:function(){ //删除红包内的优惠券
		var o = this.o, self = this;
		$('#hbListCp').on('click','.cp-del', function(){
			o.hbEditCPId = null;
			var $this  = $(this),cId, box;
			cId = $this.parent().data('cpid');
			box = $this.parents('.contains-list-item').fadeOut('400', function() {
				$(this).remove();
				// 更新数据
				o.cpDataCache['c'+cId]=null;
				o.cpDataCache = Util.refreshStringArr(o.cpDataCache);
				// 显示添加红包探钮
				$('#hbContainsEmpty').fadeIn();
			});
		});
	},
	hb_EditCPEv:function(){ //删除红包内的优惠券
		var o = this.o, self = this;
		$('#hbListCp').on('click','.cp-edit', function(){
			var $this  = $(this),cId, box;
			cId = $this.parent().data('cpid');
			o.hbEditCPId = cId;
			// 设置值和状态
			// 打开对话框
			self.CPSetData(o.cpDataCache['c'+cId],true);
			self.couponOpen();
		});
	},
	hb_initTime:function(){
		var self = this, o = this.o;
		
		$("#hbStartTime").on("click",function(){
		    WdatePicker({
		        startDate:'%y-%M-%d 00:00:00',
		        dateFmt:'yyyy-MM-dd HH:mm:ss',
		        qsEnabled:false,
		        minDate:'%y-%M-%d %H:%m:%s',
		        maxDate:'#F{$dp.$D(\'hbEndTime\');}',
		        onpicking:function(dp){
		            o.hbStartTime = Util.getUnixTime(dp.cal.getNewDateStr());
                }
		    });
		});
		$("#hbEndTime").on("click",function(){
		    WdatePicker({
		        startDate:'%y-%M-%d 23:59:59',
		        dateFmt:'yyyy-MM-dd HH:mm:ss',
		        qsEnabled:false,
		        minDate:'#F{$dp.$D(\'hbStartTime\');}',
		        onpicking:function(dp){
		            o.hbEndTime =  Util.getUnixTime(dp.cal.getNewDateStr());
                }
		    });
		});
	},
	hb_saveEv:function(){
		var  o = this.o, self = this;

		$('#btnCreateHb').on('click', function(){
			// 请填写红包发放时间段
			var ST = $('#hbStartTime').val();
			var ET = $('#hbEndTime').val();
			if(!ST || !ET){
				Util.alert('请填写红包发放时间段');
				return false;
			}
				
			// 红包内至少需要一张优惠券！
			o.cpDataCache = Util.refreshStringArr(o.cpDataCache);
			if(o.cpDataCache.length===0){
				Util.alert('红包内至少需要一张优惠券！');
				return false;
			}
			var $cpListInfo = $('#hbListCp .hb-cp-setting');
			var couponPackListJson=[],startTime,endTime, pms;
			$cpListInfo.each(function(){
				var $this = $(this);
				couponPackListJson.push({
					id:$this.data('cpid'),
					couponId: $this.find('[name="couponId"]').val(),
					limitCount: $this.find('[name="limitCount"]').val(),
					probability: $this.find('[name="probability"]').val()
				});
			});

			function isRepeat(arr){
				var hash = {};
				for(var i in arr) {
					if(hash[arr[i]])
						return true;
						hash[arr[i]] = true;
					}
				return false;
			}

			var pblArr = [];
			if(couponPackListJson.length>1){
				for(var k=0; k<couponPackListJson.length; k++){
						pblArr.push(couponPackListJson[k].probability);
				}
				if(isRepeat(pblArr)){
					Util.alert('请选择不同的中奖概率！');
					return false;
				}
			}

			// 请填写红包发放数量
			for(var t in couponPackListJson){
				if(!couponPackListJson[t].limitCount){
					Util.alert('请填写优惠券发放数量!');
					return false;
				}
			}

			if($(".webuploader-pick").length > 0 && $("input[name=couponCodeType]:checked").val() == "1"){
                Util.alert("请上传自有券码");
                return false;
            }

			pms = {
				startTime: Util.getUnixTime((ST)),
				endTime: Util.getUnixTime((ET)),
				couponPackListJson: JSON.stringify(couponPackListJson),
				comment: $('#hbComment').val()
			}

			var hbCpId = Util.getUrlParam("id");
			if(hbCpId){//红包编辑保存
				// Long couponPromotionId,  String comment, String couponPackListJson
				pms.couponPromotionId = hbCpId;
				$.post('updateCouponPackPromotion.json', pms, function(res){
					if(res.status==='0'){
						Util.alert('编辑红包成功:)',function(){
							window.location.href = "qiangHongBao.htm";
						});
					}else{
						Util.alert('编辑红包失败，请重试:(');
					}
				});

			}else{
				$.ajax({
					url:'insertCouponPackPromotion.json',
					data:pms,
					success:function(data){
						if(data.status === '0'){
							Util.alert('红包创建成功！',function(){
								window.location.href = "qiangHongBao.htm";
							});
						}else{
							if(data.errmsg){
								Util.alert('该时间段已经有红包活动，请重新设置红包发放的时间段！');
								return;
							}
							// 该时间段已经有红包，请重新设置红包活动时间段！
							Util.alert('创建红包失败！');
						}
					}
				});
			}
		});
	}
};

$.fn.couponCodeUploader = function(options){
    Util.loadUploadScript();
    var _this = this;
    var setIntervalCon = setInterval(function(){
        if(typeof WebUploader != "undefined"){
            clearInterval(setIntervalCon);
            _this.each(function(){
			    var _t = $(this);
	            var uploader = WebUploader.create({
	                auto: true,
	                swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
	                server: Util.uploadServer,
	                // runtimeOrder : "flash",
	                pick:{
	                    id:_t[0],
	                    multiple : false
	                },
	                duplicate : true,
	                accept: {
	                    title: 'File',
	                    extensions : 'csv',
	                    mimeTypes: 'text/csv'
	                },
	                formData : {
	                    'token' : $('#uptokenPrivate').val()
	                }
	            });
	            uploader.on("uploadStart",function(file){
	                dialog({
	                    id:"util-uploading",
	                    fixed: true,
	                    content: '<img class="loading-sm" src="../images/admin/loading-sm.gif"/>&emsp;优惠券码正在导入中，请勿离开页面',
	                    width:300,
	                    backdropOpacity:"0"
	                }).showModal();
	            }).on("uploadSuccess",function(file,response){
	                var url = Util.cdnPrivate+response.hash;
	                $.getJSON("createBatchFileTask.json?fileUrl="+url+"&fileType=4",function(data){
		                var getLastTask = setInterval(function(){
	                        $.getJSON("getLastBatchFileTask.json?taskId="+data.result.batchFileTask.id,function(data2){
	                            var status = data2.result.batchFileTask ? data2.result.batchFileTask.status : "empty";
	                            if(status == 20){
	                            	clearInterval(getLastTask);
		                            var taskId = data2.result.batchFileTask.id;
		                            $.getJSON("getBatchFileTaskCouponCodeList.json?taskId="+taskId,function(result){
		                                dialog({ id:"util-uploading" }).close();
		                                if(result.status=="0"){
		                                	var couponId = _t.closest(".contains-list-item").find("input[name=couponId]").val();
		                                	var previewItem = result.result.previewList.length>0 ? result.result.previewList : result.result.errorList;
		                                	var html = '<p>文件内共含有'+result.result.total+'个券码</p>';
									        html += '<p>首条券码预览：'+(previewItem[0].code ? previewItem[0].code : "没有券码")+'</p>';
									        html += '<p class="fn-red">若券码个数不正确，或券码预览显示异常，请检查CSV文件后重新上传</p>';
									        html += template('codeTpl', {list:result.result.errorList})
									        dialog({
									            title:"自有券码导入预览",
									            id:"util-previewCodeUpload",
									            fixed: true,
									            content:html,
									            width:600,
									            okValue: '确认导入',
									            cancelValue:'重新上传',
									            backdropOpacity:"0.6",
									            ok: function () {
									                var _this = this;
									                if(result.result.errorList.length>0){
									                    Util.alert("券码中存在错误，请核对后重新上传");
									                    return false;
									                }
									                var params = {
									                    taskId: taskId,
									                    couponId: couponId
									                }
									                $.getJSON("commitBatchFileTaskCouponCode.json",params,function(data2){
									                    if(data2.status=="0"){
									                        _t.closest(".contains-list-item").find(".codeFileUpload").html("券码已上传");
									                        _t.closest(".contains-list-item").find("input[name=limitCount]").prop("readonly",true).val(result.result.total);
									                        var id = "c"+couponId;
	                                						p_dvdCp.o.cpDataCache[id].codeUploaded=true;
	                                						p_dvdCp.o.cpDataCache[id].limitCount=result.result.total;
									                    }
									                })
									            },
									            cancel:function(){}
									        }).showModal();
		                                }else{
		                                    Util.alert(result.errmsg ? result.errmsg : "系统繁忙，请稍后再试")
		                                }
		                            });
	                            }else if(status == 4){
	                                clearInterval(getLastTask);
	                                dialog({ id:"util-uploading" }).close();
	                                Util.alert(data2.result.batchFileTask.msg ? data2.result.batchFileTask.msg : "导入出错，请检查格式或稍后重试");
	                            }
	                        });
	                    },2000);
	                });
	            }).on("uploadError",function(file, reason,result){
	                Util.alert("上传失败，请稍后再试或刷新页面重试");
	            }).on("error",function(msg){
	                Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确，请上传.csv文件" : msg);
	            });
	        });
        }
    },100);
}

p_dvdCp.init();

