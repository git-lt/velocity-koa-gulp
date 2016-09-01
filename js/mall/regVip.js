define(function(){
    var htmlTpl = {
    	vipFrmDia : '<form action="" class="vip-info-frm" id="vipInfoFrm">\
		    <div class="error">手机号格式不正确</div>\
		    <input type="hidden" name="supplierId" id="vipSuidIpt" value="">\
		    <div class="form-group" id="nameAndSex">\
		      <input type="text" class="form-control pct60 mr10" id="useName" name="name" placeholder="请输入姓名">\
		      <label><input type="radio" name="gender" value="1" checked> 男</label>\
		      <label><input type="radio" name="gender" value="2"> 女</label>\
		    </div>\
		    <div class="form-group">\
		      <input class="form-control" placeholder="请输入手机号码" maxLength="11" type="number" name="mobile" required maxLength="13" id="vipPhone">\
		    </div>\
		    <div class="form-group fn-hide" id="vCodeIpt">\
		      <input type="text" class="form-control pct30 mr10" maxLength="6" placeholder="验证码" id="vipVCode" name="verifyCode">\
		      <a href="javascript:;" class="btn btn-red" id="vipGetVCodeBtn">获取验证码</a>\
		      <a href="javascript:;" class="btn btn-red" id="vipGetVVoiceBtn">语音获取</a>\
		    </div>\
		    <div class="form-group form-action">\
		      <a href="javascript:;" class="btn btn-block tc vip-save-btn btn-red" id="btnSaveVipInfo">确定</a>\
		      <a href="javascript:;" class="btn btn-block tc vip-save-btn mt10" id="btnCancelVipInfo">取消</a>\
		    </div>\
		  </form>',
		vipFrmBSD:'<form action="" class="vip-info-frm" id="vipInfoFrmBSD">\
		    <div class="error">手机号格式不正确</div>\
		    <input type="hidden" name="supplierId" id="vipSuidIpt" value="">\
		    <div class="BSDVipWrap bde4">\
		      <div class="item bde4-b wbox">\
		        <div class="name bde4-r">手机号</div>\
		        <div class="wbox-1">\
		          <input type="text" id="vipPhoneBSD" maxLength="11" name="mobile" placeholder="请输入您的手机号" style="width:100%;">\
		        </div>\
		      </div>\
		      <div class="item wbox">\
		        <div class="name bde4-r">验证码</div>\
		        <div class="wbox-1">\
			        <div class="wbox">\
			          <input type="text" id="vipVCodeBSD" maxLength="6" name="verifyCode" placeholder="验证码" class="wbox-1 phoneCode">\
			          <div class="getPhoneCode" id="getPhoneCodeBSD">获取验证码</div>\
			          <div class="getPhoneCode ml5" id="getPhoneVoiceBSD">语音获取</div>\
		          	</div>\
		        </div>\
		      </div>\
		    </div>\
		    <div class="form-group form-action mt20">\
		      <a href="javascript:;" class="btn btn-block tc vip-save-btn btn-red" id="saveVipInfoBSD">确定</a>\
		    </div>\
		  </form>',
		 vipDetailBSD:'<form action="" class="vip-info-frm" id="vipDetailForBSD">\
		    <div class="error">姓名不能为空</div>\
		    <div class="BSDVipWrap bde4">\
		      <div class="item bde4-b wbox">\
		        <div class="name bde4-r">姓&nbsp;&nbsp;名</div>\
		        <div class="wbox-1">\
		          <input type="text" id="vipDetailName" placeholder="请输入您的姓名">\
		        </div>\
		      </div>\
		      <div class="item bde4-b wbox">\
		        <div class="name bde4-r">性&nbsp;&nbsp;别</div>\
		        <div class="wbox-1">\
		          <select class="sexSelect" id="vipDetailSex">\
		            <option value="1">男</option>\
		            <option value="2">女</option>\
		          </select>\
		        </div>\
		      </div>\
		      <div class="item wbox">\
		        <div class="name bde4-r">生&nbsp;&nbsp;日</div>\
		        <div class="wbox-1">\
		          <input type="date" id="vipBirthday" placeholder="选择年/月/日" value="1990-06-06" style="width:100%;">\
		        </div>\
		      </div>\
		    </div>\
		    <div class="form-group form-action mt20">\
		      <a href="javascript:;" class="btn btn-block tc vip-save-btn btn-red" id="saveVipDetailBSD">确定</a>\
		    </div>\
		  </form>'
    }
	var Mod_VipLogin = {
	    regVip:function(options){
	        var self = this;
	        $.msg.actions({
	            title:'请补充会员信息',
	            content:htmlTpl.vipFrmDia,
	            closeByMask: options.quickClose==false ? false : true,
	            cacheIns:true,
	            onOpened:function(dia){
	                $('#vipSuidIpt').val(options.suid);
	                $('#btnSaveVipInfo').on('click', self.submitEv.bind(self,options.suid,dia,options.successFn));
	                $("#btnCancelVipInfo").on('click',function(){dia.close();})
	                self.onFocusEv();
	                self.getVcodeEv();
	            }
	        });
	    },
	    submitEv:function(suid, dia, successFn){
	        var self = this;
	        var p = $("#vipPhone").val();
	        var $msg = $('#vipInfoFrm').find('.error');
	        if($("#useName").val()==''){
	            $msg.text('请填写姓名').addClass('in');
	            return false;
	        }
	        if(p===''){
	            $msg.text('手机号不能为空').addClass('in');
	            return false;
	        }
	        if(!(/^1[3-9]\d{9}$/.test(p))){
	            $msg.text('手机号格式不正确').addClass('in');
	            return false;
	        }
	        if(!$('#vCodeIpt').is(":hidden")){
	            var v= $('#vipVCode').val().trim();
	            if(v === ''){
	                $msg.text('验证码不能为空').addClass('in');
	                return false;
	            }
	        }

	        if($('#vCodeIpt').is(":hidden")){
	            // 2.不加验证码更新手机号接口
	            $.post('updateMobile.json', $('#vipInfoFrm').serialize(), function(res){
	                if(res.status === '0'){
	                    // res.result.i === 2 表示需要验证码
	                    successFn && successFn(res.result);
	                    dia.close();
	                }else if(res.status === '302'){
	                    $msg.text(res.errmsg).addClass('in');
	                    $('#vCodeIpt').show();
	                    self.getRegisterCode(p);
	                    self.getVVoice();
	                }
	            });
	        }else{
	            // 3.若接2返回失败，调用加验证码更新手机号接口
	            $.post('updateMobileAndVerifyCode.json', $('#vipInfoFrm').serialize(), function(vRes){
	                if(vRes.status === '0'){
	                    successFn && successFn(vRes.result);
	                    dia.close();
	                }else{
	                   $msg.text(vRes.errmsg).addClass('in');
	                }
	            });
	        }
	    },
	    getRegisterCode: function(phone){
	    	$("#vipGetVVoiceBtn").addClass("disabled");
	        $.ajax({
	            url:'../user/getRegisterCode.json',
	            method:'POST',
	            data:{'phone':phone},
	            success:function(data){
	                if(data.status === '0'){ // 成功 进入倒计时
	                    $('#vipGetVCodeBtn').addClass('disabled');
	                    var t=60;
	                    (function(){
	                        if(t===0){
	                            $('#vipGetVCodeBtn').text('重新获取').removeClass('disabled');
	                            $("#vipGetVVoiceBtn").removeClass("disabled");
	                            return;
	                        }
	                        $('#vipGetVCodeBtn').text(t+'s');
	                        t--;
	                        setTimeout(arguments.callee,1000);
	                    })();
	                }else if(data.status === '1'){
	                    $('#vipGetVCodeBtn').addClass('disabled');
	                    mobileAlert(data.errmsg ? data.errmsg : '您请求过于频繁，请稍后再试');
	                }else{
	                    $('#vipGetVCodeBtn').text('重新获取').removeClass('disabled');
	                }
	            },
	            error:function(){
	                mobileAlert('获取验证码失败，请检查网络连接或刷新重试');
	            }
	        });
	    },
	    getVcodeEv:function(){
	        var self = this;
	        $('#vipGetVCodeBtn').on('click', function(){
	            self.getRegisterCode($('#vipPhone').val().trim());
	        });
	    },
	    getVVoice:function(){
	    	var self = this;
	    	$("#vipGetVVoiceBtn").on("click",function(){
	    	$('#vipGetVCodeBtn').addClass('disabled');
	    		$.ajax({
		            url:'../getVoiceVerifyCode.json',
		            method:'POST',
		            data:{'phone':$('#vipPhone').val().trim()},
		            success:function(data){
		                if(data.status === '0'){ // 成功 进入倒计时
		                    $('#vipGetVVoiceBtn').addClass('disabled');
		                    var t=60;
		                    (function(){
		                        if(t===0){
		                            $('#vipGetVVoiceBtn').text('语音获取').removeClass('disabled');
		                            $('#vipGetVCodeBtn').removeClass('disabled');
		                            return;
		                        }
		                        $('#vipGetVVoiceBtn').text(t+'s');
		                        t--;
		                        setTimeout(arguments.callee,1000);
		                    })();
		                }else if(data.status === '1'){
		                    $('#vipGetVVoiceBtn').addClass('disabled');
		                    mobileAlert(data.errmsg ? data.errmsg : '您请求过于频繁，请稍后再试');
		                }else{
		                    $('#vipGetVVoiceBtn').text('语音获取').removeClass('disabled');
		                }
		            },
		            error:function(){
		                mobileAlert('获取验证码失败，请检查网络连接或刷新重试');
		            }
		        });
			});
	    },
	    onFocusEv:function(){
	        var o = this.o;
	        $('#vipInfoFrm').on('focus', 'input', function(){
	            $('#vipInfoFrm').find('.error').removeClass('in').text('');
	        });
	    }
	};

	var Mod_VipLogin_Shangpin = {
	    regVip:function(options){
	        var self = this;
	        $.msg.actions({
	            title:'请补充会员信息',
	            content:htmlTpl.vipFrmDia,
	            closeByMask: options.quickClose==false ? false : true,
	            cacheIns:true,
	            onOpened:function(dia){
	            	$('#vCodeIpt').show().find("#vipVCode").removeClass("pct30").addClass("pct60");
	            	$("#vipGetVVoiceBtn").hide();
	            	$("#nameAndSex label").hide();
	                $('#vipSuidIpt').val(options.suid);
	                $('#btnSaveVipInfo').on('click', self.submitEv.bind(self,options.suid,dia,options.successFn));
	                self.onFocusEv();
	                self.getVcodeEv();
	            }
	        });
	    },
	    submitEv:function(suid, dia, successFn){
	        var self = this;
	        var p = $('#vipPhone').val().trim(), v= $('#vipVCode').val().trim();
	        var $msg = $('#vipInfoFrm').find('.error');
	        if(p===''){
	            $msg.text('手机号不能为空').addClass('in');
	            return false;
	        }

	        if(!(/^1[3-9]\d{9}$/.test(p))){
	            $msg.text('手机号格式不正确').addClass('in');
	            return false;
	        }

            if(v === ''){
                $msg.text('验证码不能为空').addClass('in');
                return false;
            }

            $.post('regCustomerToShopin.json', $('#vipInfoFrm').serialize(), function(res){
                if(res.status == '0'){
                    successFn && successFn(res.result);
                    dia.close();
                }else{
                    $msg.text(res.errmsg ? res.errmsg : "系统繁忙，请稍后再试").addClass('in');
                }
            });
	    },
	    getVcodeEv:function(){
	        var self = this;
	        $('#vipGetVCodeBtn').on('click', function(){
	            $.ajax({
		            url:'../user/getRegisterCode.json',
		            method:'POST',
		            data:{
		            	'phone':$('#vipPhone').val().trim(),
		            	external : "2"
		            },
		            success:function(data){
		                if(data.status === '0'){ // 成功 进入倒计时
		                    $('#vipGetVCodeBtn').addClass('disabled');
		                    var t=60;
		                    (function(){
		                        if(t===0){
		                            $('#vipGetVCodeBtn').text('重新获取').removeClass('disabled');
		                            return;
		                        }
		                        $('#vipGetVCodeBtn').text(t+'s');
		                        t--;
		                        setTimeout(arguments.callee,1000);
		                    })();
		                }else if(data.status === '1'){
		                    $('#vipGetVCodeBtn').addClass('disabled');
		                    mobileAlert(data.errmsg ? data.errmsg : '您请求过于频繁，请稍后再试');
		                }else{
		                    $('#vipGetVCodeBtn').text('重新获取').removeClass('disabled');
		                }
		            },
		            error:function(){
		                mobileAlert('获取验证码失败，请检查网络连接或刷新重试');
		            }
		        });
	        });
	    },
	    onFocusEv:function(){
	        var o = this.o;
	        $('#vipInfoFrm').on('focus', 'input', function(){
	            $('#vipInfoFrm').find('.error').removeClass('in').text('');
	        });
	    }
	};

	var Mod_VipLogin_Third = {
	    o:{
	        $msg:null,
	        suid:"",
	        quickClose : true,
	        successFn:function(){}
	    },
	    regVip:function(options){
	        var o = this.o, self = this;
	        o.suid = options.suid;
	        o.successFn = options.successFn;
	        o.quickClose = options.quickClose==false ? false : true;
	        $.msg.actions({
	            title:'请验证您的手机号',
	            content:htmlTpl.vipFrmBSD,
	            closeByMask: options.quickClose==false ? false : true,
	            cacheIns:true,
	            onOpened:function(dia){
	            	$('#vipSuidIpt').val(options.suid);
	                $('#saveVipInfoBSD').on('click', self.submitEv.bind(self,dia));
	                o.$msg = $('#vipInfoFrmBSD').find('.error');
	                self.onFocusEv();
	                self.getVcodeEv();
	                if(options.external==2){
	                	$("#getPhoneVoiceBSD").hide();
	                }else{
	                	self.getVvoiceEv();
	                }
	            }
	        });
	    },
	    submitEv:function(dia){
	        var o = this.o, self = this;
	        var p = $('#vipPhoneBSD').val().trim(), v= $('#vipVCodeBSD').val().trim();
	        if(!(/^1[3-9]\d{9}$/.test(p))){
	            o.$msg.text('请填写正确的手机号码').addClass('in');
	            return false;
	        }
	        if(!v){
	            o.$msg.text('请填写验证码').addClass('in');
	            return false;
	        }

	        $.post('checkCustomerInfo.json', $('#vipInfoFrmBSD').serialize(), function(data){
	            if(data.status == "0"){
	            	o.successFn && o.successFn(data.result);
	            	dia.close();
	            }else if(data.status=="10"){
	                dia.close();
	                setTimeout(function(){
	                    self.showDetailBox(p);
	                },600);
	            }else{
	                o.$msg.text(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试").addClass('in');
	            }
	        });
	    },
	    showDetailBox:function(mobile){
	        var self = this;
	        $.msg.actions({
	            title:'请补充会员信息',
	            content:htmlTpl.vipDetailBSD,
	            closeByMask: self.o.quickClose,
	            cacheIns:true,
	            onOpened:function(dia){
	                $('#saveVipDetailBSD').on('click', self.submitDetailEv.bind(self,dia,mobile));
	                self.o.$msg = $('#vipInfoFrmBSD').find('.error');
	            }
	        });
	    },
	    submitDetailEv:function(dia,mobile){
	        var self = this,o = self.o;
	        var params = {
	            supplierId : o.suid,
	            mobile : mobile,
	            name : $('#vipDetailName').val().trim(),
	            gender : sex= $('#vipDetailSex').val(),
	            birthday : getUnixTime($("#vipBirthday").val())
	        }
	        if(params.name===''){
	            $("#vipDetailForBSD .error").html("请填写用户姓名").addClass('in');
	            $('#vipDetailForBSD').on('focus', 'input', function(){
	                $("#vipDetailForBSD .error").removeClass('in');
	            });
	            return false;
	        }
	        if(params.birthday===''){
	            $("#vipDetailForBSD .error").html("请选择用户生日").addClass('in');
	            $('#vipDetailForBSD').on('focus', 'input', function(){
	                $("#vipDetailForBSD .error").removeClass('in');
	            });
	            return false;
	        }
	        $.post('addCustomerCard.json', params, function(data){
	            if(data.status=="0"){
	                mobileAlert("注册会员成功");
	                setTimeout(function(){
	                	o.successFn && o.successFn(data.result);
		            	dia.close();
	                },1500);
	            }else{
	                mobileAlert("系统繁忙，请稍后再试");
	            }
	        });
	    },
	    getVcodeEv:function(){
	        var self = this;
	        $('#getPhoneCodeBSD').on('click', function(){
	            var phone = $('#vipPhoneBSD').val().trim();
	            if(!(/^1[3-9]\d{9}$/.test(phone))){
	                self.o.$msg.text('请填写正确的手机号码').addClass('in');
	                return false;
	            }
	            $("#getPhoneVoiceBSD").addClass("disabled");
	            $.ajax({
	                url:'../user/getRegisterCode.json',
	                method:'POST',
	                data:{'phone':phone},
	                success:function(data){
	                    if(data.status === '0'){ // 成功 进入倒计时
	                        $('#getPhoneCodeBSD').addClass('disabled');
	                        var t=60;
	                        (function(){
	                            if(t===0){
	                                $('#getPhoneCodeBSD').text('重新获取').removeClass('disabled');
	                                $("#getPhoneVoiceBSD").removeClass("disabled");
	                                return;
	                            }
	                            t--;
	                            $('#getPhoneCodeBSD').text(t+'s后可重发');
	                            setTimeout(arguments.callee,1000);
	                        })();
	                    }else if(data.status === '1'){
	                        $('#getPhoneCodeBSD').addClass('disabled');
	                        mobileAlert('您请求过于频繁，请稍后再试');
	                    }else{
	                        $('#getPhoneCodeBSD').text('重新获取').removeClass('disabled');
	                    }
	                },
	                error:function(){
	                    mobileAlert('获取验证码失败，请检查网络连接或刷新重试');
	                }
	            });
	        });
	    },
	    getVvoiceEv:function(){
	        var self = this;
	        $('#getPhoneVoiceBSD').on('click', function(){
	            var phone = $('#vipPhoneBSD').val().trim();
	            if(!(/^1[3-9]\d{9}$/.test(phone))){
	                self.o.$msg.text('请填写正确的手机号码').addClass('in');
	                return false;
	            }
	        	$("#getPhoneCodeBSD").addClass("disabled");
	            $.ajax({
	                url:'../getVoiceVerifyCode.json',
	                method:'POST',
	                data:{'phone':phone},
	                success:function(data){
	                    if(data.status === '0'){ // 成功 进入倒计时
		                    $('#getPhoneVoiceBSD').addClass('disabled');
		                    var t=60;
		                    (function(){
		                        if(t===0){
		                            $('#getPhoneVoiceBSD').text('语音获取').removeClass('disabled');
		                            $('#getPhoneCodeBSD').removeClass('disabled');
		                            return;
		                        }
		                        $('#getPhoneVoiceBSD').text(t+'s');
		                        t--;
		                        setTimeout(arguments.callee,1000);
		                    })();
		                }else if(data.status === '1'){
		                    $('#getPhoneVoiceBSD').addClass('disabled');
		                    mobileAlert(data.errmsg ? data.errmsg : '您请求过于频繁，请稍后再试');
		                }else{
		                    $('#getPhoneVoiceBSD').text('语音获取').removeClass('disabled');
		                }
	                },
	                error:function(){
	                    mobileAlert('获取验证码失败，请检查网络连接或刷新重试');
	                }
	            });
	        });
	    },
	    onFocusEv:function(){
	        var o = this.o;
	        $('#vipInfoFrmBSD').on('focus', 'input', function(){
	            o.$msg.removeClass('in').text('');
	        });
	    }
	};

	var regVip = function (options){
		if(options.external==0){
			Mod_VipLogin.regVip(options)
		}else if(options.external==1){
			Mod_VipLogin_Third.regVip(options)
		}else if(options.external==2){
			Mod_VipLogin_Shangpin.regVip(options)
		}
　　};
	return {
		regVip : regVip
	};
});