document.title="洽客-用户注册"; 

if(!sessionStorage.regDia){
    Util.alert("hi，这里是公司注册洽客入口，如果您是导购，请联系贵司洽客项目负责人，在洽客管理后台可以创建导购登录帐号。",function(){
        sessionStorage.regDia="true";
    });
}

var ivCode = Util.getUrlParam('inviteCode');
if(ivCode) $('[name="inviteCode"]').val(ivCode).closest('tr').hide();

// 公司地址初始化
(function(){
    var loc = new Location();
    var title   = ['省份' , '地级市'];
    $.each(title , function(k , v) {
        title[k]    = '<option value="">'+v+'</option>';
    });
    $('#loc_province').append(title[0]);
    $('#loc_city').append(title[1]);
    loc.fillOption('loc_province' , '0');
    $("#loc_province,#loc_city").select2();

    $('#loc_province').change(function() {
        $('#loc_city').empty();
        if($(this).val()){
            loc.fillOption('loc_city' , '0,'+$('#loc_province').val());
            $('input[name=province]').val($(this).find("option:selected").text());
            $('#loc_city').change();
        }else{
            $('input[name=province],input[name=city]').val("");
            $('#loc_city').html(title[1]).change();
        }
    });
    $('#loc_city').change(function() {
        $('input[name=city]').val($(this).find("option:selected").text());
    });
})();


$("#openForm").validate({
    rules: {
        companyName:"required",
        linkmanName:"required",
        linkmanPosition:"required",
        district:"required",
        // detail:"required",
        phone: {
            required: true,
            isMobile:true
        },
        code:"required",
        password:{
            required: true,
            isPwd:true,
        },
        password2:{
            required: true,
            equalTo:"#password"
        }
    },
    messages: {
        phone: {
            isMobile:"手机号码错误"
        },
        password:{
            isPwd:"以字母开头，6-12之间的字符、数字和下划线",
        },
        password2:{
            equalTo:"两次填写的密码不一致"
        }
    },
    submitHandler:function(form){
        var createParam = $(form).serializeObject();
        if (createParam.city== '地级市'){
            return false;
        }
        $.getJSON("../user/supplierRegister_new.json",createParam,function(data){
            if(data.status=="0"){
                Util.alert("账号注册成功!",function(){
                    location.href="index.htm";
                });
            }else{
                Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
            }
        });
    }
});

var kinerCode = new KinerCode({
    len: 4,//需要产生的验证码长度
    question: false,//若给定词典为算数题，则此项必须选择true,程序将自动计算出结果进行校验【若选择此项，则可不配置len属性】,若选择经典模式，必须选择false
    copy: false,//是否允许复制产生的验证码
    randomBg: true,//若选true则采用随机背景颜色，此时设置的bgImg和bgColor将失效
    inputArea: $("#KinerCodeIpt")[0],//输入验证码的input对象绑定【 HTMLInputElement 】
    codeArea: $("#KinerCodeBtn")[0],//验证码放置的区域【HTMLDivElement 】
    click2refresh: true,//是否点击验证码刷新验证码
    false2refresh: false,//在填错验证码后是否刷新验证码
    validateEven: "blur",//触发验证的方法名，如click，blur等
    validateFn: function (result, code) {//验证回调函数
        if (result) {
             $("#KinerCodeIpt").removeClass("error").siblings("#KinerCode-error").remove();
        } else {
            // console.log('验证失败:' + code.strCode);
            $("#KinerCodeIpt").addClass("error");
            if($("#KinerCode-error").length === 0){
                $("#KinerCodeIpt").parent().append('<label id="KinerCode-error" class="error">验证码错误</label>');
            }
        }
    }
});


$("#getCode,#getCodeByVoice").on("click",function(){
    var timeEnd = 59;
    var tel = $("input[name='phone']").val();
    if(tel.length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(tel)){
        if($("#KinerCode-error").length > 0 || $("#KinerCodeIpt").val()===""){
            $("#KinerCodeIpt").focus();
            return false;
        }
        $("#getCode,#getCodeByVoice").removeClass("disabled");
        $("#phone-error").remove();
        if(this.id === 'getCode'){
            $.getJSON("../user/getRegisterCodeToSupplier.json?phone="+tel,function(data){
                if(data.status=="0"){
                    Util.alert("验证码已发送，请注意查收手机短信");
                    $("#getCode").addClass("disabled").text(timeEnd);
                    $('#getCodeByVoice').addClass("disabled");

                    var getCodeCount = setInterval(function(){
                        if(timeEnd>0){
                            timeEnd--;
                            $("#getCode").text(timeEnd+'s');
                        }else{
                            clearInterval(getCodeCount);
                             $("#getCode").removeClass("disabled").text("重新获取");
                             $('#getCodeByVoice').removeClass("disabled");
                        }
                    },1000);
                }
            });
        }else{
            $.post('../getVoiceVerifyCode.json', {phone:tel})
            .done(function(data){

                if(data.status==='0'){
                    Util.alert("语音验证码已发送，请注意接听来电");
                    $("#getCode,#getCodeByVoice").addClass('disabled');
                    var t=60;
                    (function(){
                        if(t===0){
                            $('#getCodeByVoice').text('重新获取').removeClass('disabled');
                            $('#getCode').removeClass('disabled');
                            return;
                        }
                        $('#getCodeByVoice').text(t+'s');
                        t--;
                        setTimeout(arguments.callee,1000);
                    })();
                }else{
                    Util.alert("系统繁忙，请稍后再试！");
                    $('#getCode,#getCodeByVoice').removeClass('disabled');
                }
            })
            .fail(function(){
                Util.alert("系统繁忙，请稍后再试！");
                $('#getCode,#getCodeByVoice').removeClass('disabled');
            });
        }
    }else{
        if($("#phone-error").length === 0){
            $("input[name='phone']").after('<label id="phone-error" class="error" for="phone">请填写正确的手机号码</label>');
        }
        $('#getCode,#getCodeByVoice').removeClass('disabled');
    }
});
$("input[name=phone]").blur(function(){
    var phone = $(this).val();
    if(/^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(phone)){
        $.getJSON("regCheck.json?phone="+phone,function(data){
            if(data.reg){
                if(data.role == "supplier"){
                    Util.alert("该账号已经注册，请直接登录",function(){
                        location.href="index.htm";
                    });
                }else if(data.role == "sales"){
                    Util.alert("<p>账号更新成功：</p><p>检测到该手机号同时为洽客导购账号，继续注册将为您做账号同步，导购版请以该新密码进行登录。</p>");
                }
            }
        });
    }
});
$("#agreement").on("click",function(){
    if($(this).prop("checked")){
        $("#submit").removeAttr("disabled");
    }else{
        $("#submit").attr("disabled","disabled");
    }
});

