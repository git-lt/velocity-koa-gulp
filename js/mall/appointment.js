var Q = Zepto;
if(Q(document).height() < window.screen.height){
    Q(".btn.full").addClass("fixed");
}
Q(".btn.full").css("opacity","1");
// 获取验证码
Q('#getMsgCode').on('click', function(){
    var phone = Q('#phone').val();
    if(!(/^1[3-9]\d{9}$/.test(phone))){
        mobileAlert("请输入正确的手机号码");
        return false;
    }
    Q.ajax({
        url:'getAppointmentVerifyCodeByPhone.json',
        method:'post',
        dataType:"json",
        data:{'customerPhone':phone, supplierId:$('#suid').val()},
        success:function(data){
            if(data.status === '0'){ // 成功 进入倒计时
                Q('#getMsgCode').addClass('disabled');
                var t=60;
                (function(){
                    if(t===0){
                        Q('#getMsgCode').text('重新获取').removeClass('disabled');
                        return;
                    }
                    Q('#getMsgCode').text(t+'s');
                    t--;
                    setTimeout(arguments.callee,1000);
                })();
            }else if(data.status === '1'){
                mobileAlert(data.errmsg ? data.errmsg : '您请求过于频繁，请稍后再试');
            }else{
                Q('#getMsgCode').text('重新获取').removeClass('disabled');
            }
        },
        error:function(){
             mobileAlert(data.errmsg ? data.errmsg : '您请求过于频繁，请稍后再试');
        }
    });
});

$("#appoint").on("click",function(e){
    e.preventDefault();
    var params=$("#subscribeForm").serializeArray(),validate = true;
    $.each(params,function(i,e){
        if(e.name=="arriveTime"){
            if(e.value==""){
                mobileAlert("请选择到店时间");
                validate=false;
                return false;
            }
            params[i].value=getUnixTime(e.value);
        }
        if(e.name=="customerPhone" && !(/^1[3-9]\d{9}$/.test(e.value))){
            mobileAlert("请输入正确的手机号码");
            validate=false;
            return false;
        }
        if(e.name=="verifyCode" && e.value==""){
            mobileAlert("请输入短信验证码");
            validate=false;
            return false;
        }
        if(e.name=="customerName" && e.value==""){
            mobileAlert("请输入联系人姓名");
            validate=false;
            return false;
        }
    });
    console.log(params);
    if(!validate) return false;
    $("#appoint").addClass("disabled");
    $.post("orderAppointment.json",params,function(data){
        $("#appoint").removeClass("disabled");
        if(data.status === '0'){
            location.href="appointmentResult.htm?id="+data.result.appointmentId;
        }else{
            mobileAlert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
        }
    })
});

// 初始化预约时间

var myApp = new Framework7();
var today = new Date(),now = today.getTime(),oneDay = 24*3600000;
var weekArr = ["(周日)","(周一)","(周二)","(周三)","(周四)","(周五)","(周六)"];
var days = {
    day0:today,
    day1:new Date(now+oneDay*1),
    day2:new Date(now+oneDay*2),
    day3:new Date(now+oneDay*3),
    day4:new Date(now+oneDay*4),
    day5:new Date(now+oneDay*5),
    day6:new Date(now+oneDay*6)
};
var pickerInline = myApp.picker({
    input: '#timePicker',
    rotateEffect: true,
    value: [today.getHours() >= 23 ? (days.day1.getFullYear()+"-"+(days.day1.getMonth()+1)+"-"+days.day1.getDate()) : (days.day0.getFullYear()+"-"+(days.day0.getMonth()+1)+"-"+days.day0.getDate()), today.getHours() == 23 ? 0 : today.getHours()+1, (today.getMinutes()-today.getMinutes()%10)],
    formatValue: function (p, values, displayValues) {
        return values[0] + ' ' +(values[1]>9 ? values[1] : ('0'+values[1])) + ':' + (values[2]>9 ? values[2] : ('0'+values[2]));
    },
    cols: [
        {   
            textAlign: 'left',
            values:(function(){
                var arr = [];
                arr.push(days.day0.getFullYear()+"-"+(days.day0.getMonth()+1)+"-"+days.day0.getDate());
                arr.push(days.day1.getFullYear()+"-"+(days.day1.getMonth()+1)+"-"+days.day1.getDate());
                arr.push(days.day2.getFullYear()+"-"+(days.day2.getMonth()+1)+"-"+days.day2.getDate());
                arr.push(days.day3.getFullYear()+"-"+(days.day3.getMonth()+1)+"-"+days.day3.getDate());
                arr.push(days.day4.getFullYear()+"-"+(days.day4.getMonth()+1)+"-"+days.day4.getDate());
                arr.push(days.day5.getFullYear()+"-"+(days.day5.getMonth()+1)+"-"+days.day5.getDate());
                arr.push(days.day6.getFullYear()+"-"+(days.day6.getMonth()+1)+"-"+days.day6.getDate());
                return arr;
            })(),
            displayValues: (function(){
                var arr = ["今天","明天","后天"];
                arr.push((days.day3.getMonth()+1)+"月"+days.day3.getDate()+"日"+weekArr[days.day3.getDay()]);
                arr.push((days.day4.getMonth()+1)+"月"+days.day4.getDate()+"日"+weekArr[days.day4.getDay()]);
                arr.push((days.day5.getMonth()+1)+"月"+days.day5.getDate()+"日"+weekArr[days.day5.getDay()]);
                arr.push((days.day6.getMonth()+1)+"月"+days.day6.getDate()+"日"+weekArr[days.day6.getDay()]);
                return arr;
            })()
        },
        // Space divider
        // {
        //     divider: true,
        //     content: '  '
        // },
        // Hours
        {
            values: (function () {
                var arr = [];
                for (var i = 0; i <= 23; i++) { arr.push(i); }
                return arr;
            })(),
            displayValues: (function () {
                var arr = [];
                for (var i = 0; i <= 23; i++) { arr.push((i < 10 ? ('0' + i) : i.toString())+"点"); }
                return arr;
            })()
        },
        // Minutes
        {
            values: [0,10,20,30,40,50],
            displayValues: ["00分","10分","20分","30分","40分","50分"],
        }
    ],
    onChange: function (picker, values, displayValues) {
        // 不能早于当前时间+2小时
        var scrollTime = new Date(~~values[0].split("-")[0],~~values[0].split("-")[1]-1,~~values[0].split("-")[2],~~values[1],~~values[2]).getTime(),
            deadTime = now + 7200000;
            if(scrollTime < deadTime){
                picker.cols[0].setValue(new Date(deadTime).getFullYear()+"-"+(new Date(deadTime).getMonth()+1)+"-"+new Date(deadTime).getDate());
                picker.cols[1].setValue(new Date(deadTime).getHours());
                picker.cols[2].setValue(new Date(deadTime).getMinutes() - new Date(deadTime).getMinutes()%10);
            }
    },
});            
