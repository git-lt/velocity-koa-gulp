define(['utils'],function(utils){
	var CONFIG, page;
	$.fn.replaceClass=function(a,b){
		var _t = $(this);
		if(_t.hasClass(a)){
			_t.removeClass(a).addClass(b);
		}else{
			_t.removeClass(b).addClass(a);
		}
	}
	CONFIG = {
		apisetLevel:'setLevelSwitch.json',  //会员等级配置总开关
		apigetVip:'getVipLevels.json',		//获取会员信息
		apisetVip:'setVipLevel.json',		//保存会员信息
	};

	page={
		init:function(){
			this.getVip();   //查询等级详情
			this.showmesEv(); //滑动按钮

			this.allSlideBtnEv(); //会员等级配置总开关
			this.editEv();  //编辑
			this.saveEv();  //保存
		},
		setLevel:function(){
			var options={
					disabled:$("input[name=allSlideBtn]").val()
				}
			return $.post(CONFIG.apisetLevel, options);
		},
		allSlideBtnEv:function(){
			var _this=this;
			var memberShip=$("#allSlideBtn").find("input[name=allSlideBtn]");
			$("#allSlideBtn").on("click",function(e){
				e.preventDefault();
				var _t = $(this);
				_t.replaceClass("on","off");
				if(_t.hasClass("on")){
					$("input[name=allSlideBtn]").val("0");
					$("#memberForm").removeClass("fn-hide");
					_this.setLevel()
						.done(function(data){
							if(data.status=="0"){
								toastr.success(data.errmsg || "会员等级配置已开启，请配置会员信息");
								_this.getVip();
							}else{
								toastr.error(data.errmsg || "系统繁忙，请稍后再试");
							}
						})
						.fail(function(){
							toastr.error(data.errmsg || "系统繁忙，请稍后再试");
						});
				}else{
					$("input[name=allSlideBtn]").val("1");
					$("#memberForm").addClass("fn-hide");
					dialog({
						title: '关闭确认',
						content: "<p>若关闭会员等级功能<br>1. 自动升级功能将失效；<br>2. 会员详情不显示等级相关内容；<br>3. 用户无法使用会员折扣。</p>",
						okValue: '确定',
						width: 400,
						ok: function () {
							_this.setLevel()
								.done(function(data){
									if(data.status=="0"){
										utils.alert('保存成功');
									}else{
										toastr.error(data.errmsg || "系统繁忙，请稍后再试");
									}
								})
								.fail(function(){
									toastr.error(data.errmsg || "系统繁忙，请稍后再试");
								});
						},
						cancelValue: '取消',
						cancel: function () {
							$("#allSlideBtn").addClass("on");
							$("#memberForm").removeClass("fn-hide");
						}
					}).showModal();
				}
			})
		},
		getVip:function(){
			$.post(CONFIG.apigetVip,function(data){
				if(data.status=='0'){
					var disabled=data.result.disabled;
					var levels=data.result.levels;
					if(!disabled){
						$("#allSlideBtn").addClass("on");
						$("#memberForm").removeClass("fn-hide");
						if(levels!=''){
							for(var i=0;i<levels.length;i++){
								var levelsNum=levels[i].vipLevel;
								var tempArr=[];
								if(levelsNum===1){
									tempArr.push(levels[i]);
									$("#vipLevelOne").empty().html(template('memberList',{levels:tempArr}));
								}else if(levelsNum===2){
									tempArr.push(levels[i]);
									var name=levels[i].levelName;
									$("#vipLevelTwo").empty().html(template('memberList',{levels:tempArr}));
								}else if(levelsNum===3){
									tempArr.push(levels[i]);
									$("#vipLevelTre").empty().html(template('memberList',{levels:tempArr}));
								}else if(levelsNum===4){
									tempArr.push(levels[i]);
									$("#vipLevelFour").empty().html(template('memberList',{levels:tempArr}));
								}
							}
						}
					}else{
						$("#allSlideBtn").addClass("off");
						$("#memberForm").addClass("fn-hide");
					}
				}else {
					toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
				};
			})
		},
		showmesEv:function(){
			var _this=this;
			$("body").on("click",".otherBtn",function(e){
				e.preventDefault();
				var _t = $(this);
				_t.replaceClass("on","off");
				if(_t.hasClass("on")){
					$("input[name=useMemberVip]").val("0");

					var table=_t.closest('table')
					table.find(".qiYongType span").text('已启用');
					table.find(".meberEdit input:eq(0)").prop("disabled",false);
					table.find(".jiaoYiEdit input").prop("disabled",false);
					table.find(".zheKouEdit input").prop("disabled",false);
				}else{
					$("input[name=useMemberVip]").val("1");

					var table=_t.closest('table');
					table.find(".qiYongType span").text('未启用');
					table.find(".meberEdit input:eq(0)").prop("disabled",true);
					table.find(".jiaoYiEdit input").prop("disabled",true);
					table.find(".zheKouEdit input").prop("disabled",true);
				}
			});
		},
		editEv:function(){
			$("body").on("click",".editSave",function(e){
				var index=$(".editSave").index(this);
				e.preventDefault();
				var _this=$(this);
				_this.addClass("fn-hide");
				_this.siblings("td.saveEdit").removeClass("fn-hide");

				var table=_this.closest("table");
				table.find('tr.jiaoYi').addClass('fn-hide');
				table.find('tr.jiaoYiEdit').removeClass('fn-hide');
				table.find('tr.zheKou').addClass('fn-hide');
				table.find('tr.zheKouEdit').removeClass('fn-hide');
				_this.closest("form").find('label.member').addClass('fn-hide');
				table.find('tr.meberEdit').removeClass('fn-hide');
				var otherDis=$("input[name=useMemberVip]").eq(index).val();
				if(otherDis=="0"){
					$(".otherBtn").eq(index).addClass("on");
				}else{
					$(".otherBtn").eq(index).addClass("off");
					table.find("input[name=levelName]").attr("disabled",true);
					table.find("input[name=yiEdu]").attr("disabled",true);
					table.find("input[name=ciNum]").attr("disabled",true);
					table.find("input[name=zhekou]").attr("disabled",true);
				}
				var member=_this.closest("form").find(".member span:eq(0)").text();
				var jiaoYiEdu=table.find(".jiaoYi span").text();
				var jiaoYiNum=table.find(".jiaoYi p").text();
				var zheKouVal=table.find(".zheKou span").text();
				table.find('input[name=levelName]').val(member);
				table.find('input[name=yiEdu]').val(jiaoYiEdu);
				table.find('input[name=ciNum]').val(jiaoYiNum);
				table.find('input[name=zhekou]').val(zheKouVal);
			})
		},
		saveEv:function(){
			var _this=this;
			$("body").on("click",".saveEdit",function(e){
				e.preventDefault();
				var that=$(this);
				var table=that.closest("table");
				var slideBtn=table.find("input[name=useMemberVip]").val();
				var meberEdit=table.find("input[name=levelName]").val();
				var jiaoEdu=table.find("input[name=yiEdu]").val();
				var jiaoNum=table.find("input[name=ciNum]").val();
				var zheVal=table.find(".zheKouEdit input").val();
				var levelName='';
				var vipText=that.closest("form").find('.meberEdit strong span').text();
				if(vipText=="1"){
					levelName='普通会员';
				}else if(vipText=="2"){
					levelName='黄金会员';
				}else if(vipText=="3"){
					levelName='铂金会员';
				}else if(vipText=="4"){
					levelName='钻石会员';
				};
				var regSecNum= /^\d*\.(\d{0,2})$/; //判断是不是最多只能输入两位小数的数字
				var regNum=/^\d+$/;	//判断是不是整数
				var regLO=/^10$|[0-9]\.[0-9]{0,1}$/;
				if(slideBtn=="0"){
					/*交易额度判断*/
					if(jiaoEdu!=''){
						if(regSecNum.test(jiaoEdu)||regNum.test(jiaoEdu)){
							table.find('.jiaoYi span').text(jiaoEdu);
						}else{
							toastr.error("交易额最多包含两位小数");
							return false;
						}
					}else{
						toastr.error("交易额不能为空");
						return false;
					}
					/*交易次数判断*/
					if(jiaoNum!=''){
						if(regNum.test(jiaoNum)){
							table.find('.jiaoYi p').text(jiaoNum);
						}else{
							toastr.error("交易次数只能输入整数");
							return false;
						}
					}else{
						toastr.error("交易次数不能为空");
						return false;
					}
					/*折扣判断*/
					if(zheVal!=''){
						if(regLO.test(zheVal)||regNum.test(zheVal)){
							if(zheVal>10){
								toastr.error("折扣最大为10");
								return false;
							}else{
								table.find('.zheKou span').text(zheVal);
							}
						}else{
							toastr.error("折扣最大为10,最多包含一位小数");
							return false;
						}
					}else{
						toastr.error("折扣不能为空");
						return false;
					}
					meberEdit=meberEdit==''?levelName:meberEdit;
					var options={
						disabled:slideBtn,
						levelName:meberEdit,
						transactionAmountReached:jiaoEdu,
						transactionCountReached:jiaoNum,
						transactionDiscount:(zheVal/10).toFixed(1),
						vipLevel:vipText
					};
					$.post(CONFIG.apisetVip,options,function(data){
						if(data.status=='0'){
							toastr.success("保存成功");
							table.find('tr.jiaoYi').removeClass('fn-hide');
							table.find('tr.jiaoYiEdit').addClass('fn-hide');
							table.find('tr.zheKou').removeClass('fn-hide');
							table.find('tr.zheKouEdit').addClass('fn-hide');
							that.closest("form").find('label.member').removeClass('fn-hide');
							table.find('tr.meberEdit').addClass('fn-hide');
							that.addClass('fn-hide');
							that.siblings("td.editSave").removeClass("fn-hide");
						}else {
							toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
						};
					})
				}else if(slideBtn=="1"){
					dialog({
						title: '关闭确认',
						content: "<p>若关闭当前会员等级<br>1. 该会员自动升级功能将失效；<br>2. 会员卡权益列表不显示该等级<br>3. <span style='color:#FF0000'>已升级该等级会员不变，不会自动升级和降级，您可以前往会员列表手动修改。</span><br>4. 已升级会员不再享受该等级相关权益。</p>",
						okValue: '确定',
						width: 400,
						ok: function () {
							var options={
								disabled:1,
								levelName:levelName,
								transactionAmountReached:0,
								transactionCountReached:0,
								transactionDiscount:0,
								vipLevel:vipText
							};
							$.post(CONFIG.apisetVip,options,function(data){
								if(data.status=='0'){
									toastr.success("保存成功");
									table.find('tr.jiaoYi').removeClass('fn-hide');
									table.find('tr.jiaoYiEdit').addClass('fn-hide');
									table.find('tr.zheKou').removeClass('fn-hide');
									table.find('tr.zheKouEdit').addClass('fn-hide');
									that.closest("form").find('label.member').removeClass('fn-hide');
									table.find('tr.meberEdit').addClass('fn-hide');
									that.addClass('fn-hide');
									that.siblings("td.editSave").removeClass("fn-hide");
								}else {
									toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
								};
							})
						},
						cancelValue: '取消',
						cancel: function () {}
					}).showModal();
				}
			})
		}
	}
			

	return {
		init:function(){
			page.init();
		}
	}
});