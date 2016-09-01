define(['utils','WdatePicker','validate'],function(Util){
	var Sign = {
		URLS: {
			RENDER_RULE_URL: "getSignRule.json",
			SET_SWITCH_URL: "setSwitch.json",
			SUBMIT_URL: "updateSignRule.json"
		},
		params: {},
		init: function(){
			this.loadData();
			this.eventInit();
		},
		loadData: function(){
			//to do..  load page data
			Sign.renderRuleData();
		},
		renderRuleData: function(){
			$.ajax({
				url: Sign.URLS.RENDER_RULE_URL,
				success: function(res){
					res = res.result;

					$("#signCon").attr("data-id", res.switch.id);
					if (res.switch.disabled != 0)
						$(".slideBtn").removeClass("on").addClass("off");
					$("input[name='useSign']").val(res.switch.disabled);

				 	$("textarea[name='signRuletxa']").val(res.switch.caption || "");


					if (res.signRuleList.length){
						 $.each(res.signRuleList, function(i, item){
						 	$("#signCon").append(Sign.getRuleHtml(item));
						 });
					} else 
						$("#signCon").append(Sign.getRuleHtml); //默认添加一个规则

					$(".giveCouponSel").change();
				}	
			});
		},
		setSwitch: function(_t){
			$.ajax({
				url: Sign.URLS.SET_SWITCH_URL + "?disabled=" + (_t.hasClass("on") ? 1 : 0),
				success: function(res){
					_t.replaceClass("on","off");
					if(_t.hasClass("on")){
						$("input[name='useSign']").val("0");
					}else{
						$("input[name='useSign']").val("1");
					}
					Util.alert("开关设置成功");
				}
			});
		},
		eventInit: function(){
			$(".slideBtn").on("click",function(e){ //开关按钮
				e.preventDefault();

				Sign.setSwitch($(this));
			});
			$("#ruleAddBtn").on("click", function(){ //添加规则
				$("#signCon").append(Sign.getRuleHtml);
				$("body").animate({"scrollTop": 9999}, 1000);
			});
			$("#signCon").on("click", ".ruleDelBtn", function(){ //删除规则
				$(this).parent(".card-box").remove();
			});
			$("#signCon").on("change", ".giveCouponSel", function(){ //选择是否赠送优惠券操作
				var $giveCouponDom = $(this).parents(".simpleTable").find(".giveCouponHide");
				if ($(this).val() == 1)
					$giveCouponDom.removeClass("fn-hide");
				else
					$giveCouponDom.addClass("fn-hide");
			});
			$("#signCon").on("click", ".editCouponEvt",function(e){//编辑优惠券
		        if(_couponDialog){
		            _couponDialog.showModal();
		        }else{
		            _couponDialog = dialog({
		                title:"发放的优惠券",
		                id:"util-coupon",
		                // fixed: true,
		                width:560,
		                // height:450,
		                content: $("#couponDialog"),
		                cancelValue:'取消',
		                oklValue:'确定',
		                backdropOpacity:"0.2",
		                cancel:function(){
		                    this.close();return false;
		                },
		                ok:function(){
		                    $("#newCouponForm").submit();
		                    return false
		                }
		            });
		            _couponDialog.showModal();
		        }
		    });
		    $("#exOrderBtn").on("click", function(){ //点击保存
		    	if ($("input[name='useSign']").val() == 1)
		    		return Util.alert("请先启用签到");
		    	var flag = true;
		    	$("#signCon textarea[name='signRuletxa'], #signCon input[name='signDates'], #signCon input[name='signScore']").each(function(i){
		    		if ($(this).val() == ""){
		    			$(this).addClass("error").next(".error").removeClass("fn-hide");
		    			flag = false;
		    		} else
		    			$(this).removeClass("error").next(".error").addClass("fn-hide");
		    	});
		    	if (~~$("#signCon input[name='signDates']").val() > 200)
		    		return Util.alert("连续签到天数不能大于200天");
		    	if (flag)
		    		Sign.submit();
		    });
		},
		submit: function(){
			var params = new Object();
			params.signRuleSwitch = new Object();
			params.signRuleSwitch.id = $("#signCon").attr("data-id");
			params.signRuleSwitch.disabled = $("input[name='useSign']").val();
			params.signRuleSwitch.caption = $("textarea[name='signRuletxa']").val();
			params.signRuleArray = new Array();
			$("#signCon .ruleConEvt").each(function(i){
				var $tableDom = $(this);
				params.signRuleArray[i] = new Object();
				params.signRuleArray[i].consecutiveDays = $tableDom.find("input[name='signDates']").val();
				params.signRuleArray[i].rewardPoints = $tableDom.find("input[name='signScore']").val();
				params.signRuleArray[i].rewardCoupon = $tableDom.find(".giveCouponSel").val();
				params.signRuleArray[i].rewardLimit = $tableDom.find(".giveCouponLimit").val();
				// if (params.signRuleArray[i].rewardCoupon == 1){
				// 	params.signRuleArray[i].rewardCouponId = $tableDom.find(".giveCouponContent").text();
				// }
			});
			Sign.params = params;
			// console.log(JSON.stringify(params));
			$.ajax({
				url: Sign.URLS.SUBMIT_URL,
				dataType: "json",
				contentType: "application/json",
				type: "post",
				data: JSON.stringify(params),
				success: function(res){
					if (res.status != 0)
						return;
					Util.alert("设置成功");
				}
			});
		},
		getRuleHtml: function(item){ //获取规则html
			var rule = item || "";
			return 	'<div class="card-box ruleConEvt" data-id="' + (rule.id || "") + '">' + 
			    	'	<table class="simpleTable">' + 
			        '		<tbody>' + 
			        '			<tr>' + 
				    '    			<td>连续签到：　</td>' + 
				    '    			<td>' + 
				    '    				<input name="signDates" class="min tc" value="' + (rule.consecutiveDays || "") + '" type="number">　天' +
				    ' 					<label class="error fn-hide">请填写天数</label>' + 
				    '    			</td>' + 
				    '    		</tr>' + 
				    '    		<tr>' + 
				    '    			<td>赠送积分：　</td>' + 
				    '    			<td>' + 
				    '    				<input name="signScore" class="min tc" value="' + (rule.rewardPoints || "") + '" type="number">　积分' + 
				    ' 					<label class="error fn-hide">请填写积分数</label>' + 
				    '    				<p class="mt10">填写0则不赠送</p>' + 
				    '    			</td>' + 
				    '    		</tr>' + 
				    '    		<tr>' + 
				    '    			<td>赠送优惠券：　</td>' + 
				    '    			<td>' + 
				    '    				<select class="min giveCouponSel" value="' + (rule.rewardCoupon || 0) + '">' + 
					'						<option value="0" ' + (!rule.rewardCoupon&&"selected") + '>不赠送</option>' + 
					'						<option value="1" ' + (rule.rewardCoupon&&"selected") + '>赠送</option>' + 
					'					</select>' + 
				    '    			</td>' + 
				    '    		</tr>' + 
				    '    		<tr class="fn-hide giveCouponHide">' + 
				    '    			<td>赠送限制：　</td>' + 
				    '    			<td>' + 
				    '    				<select class="min giveCouponLimit" value="' + (rule.rewardLimit || 0) + '">' + 
					'						<option value="0" ' + (!rule.rewardLimit&&"selected") + '>不限制</option>' + 
					'						<option value="1" ' + (rule.rewardLimit&&"selected") + '>每人限赠送一次</option>' + 
					'					</select>' + 
				    '    			</td>' + 
				    '    		</tr>' + 
				    '    		<tr class="fn-hide giveCouponHide">' + 
				    '    			<td>优惠券信息：　</td>' + 
				    '    			<td class="giveCouponContent">优惠券信息content</td>' + 
				    '    		</tr>' + 
			        '		</tbody>' + 
			        '	</table>' +　
			        '	<div class="bdr-e4-t tc mt20 pt20 ruleDelBtn"><a href="javascript:void(0)">删除该条件</a></div>' + 
			    	'</div>';
		}
	};
	$.fn.replaceClass=function(a,b){
        var _t = $(this);
        if(_t.hasClass(a)){
            _t.removeClass(a).addClass(b);
        }else{
            _t.removeClass(b).addClass(a);
        }
    };
	return {
		init:function(data){
			Sign.init();
		}
	};
});
