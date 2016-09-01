document.title="洽客-财务结账信息登记"; 
$("#registerBank,#primaryBusiness").select2();
$("#primaryBusiness").val($("#primaryBusinessName").val()).trigger("change");

/*开户银行处理start*/
if($("#registerBankName").val()){
    var oldBank = $("#registerBankName").val();
    if($("#registerBank").find('option[value='+oldBank+']').length > 0){
        $("#registerBank").val(oldBank).trigger("change");
    }else{
        $("#registerBank").val("0");
        $("#s2id_registerBank .select2-chosen").text(oldBank);
    }
}
$("#registerBank").on("change",function(){
    var _val = $(this).val();
    if(_val == "0"){
        dialog({
            title:"其它银行",
            id:"util-otherBank",
            fixed: true,
            content: '<input type="text" name="otherBank" id="otherBank" /><p class="fn-tip">请填写银行全称，而不是缩写</p>',
            width:300,
            cancel: true,
            okValue: '确定',
            cancelValue: '取消',
            backdropOpacity:"0.5",
            ok: function () {
                var bank = $("#otherBank").val();
                if($.trim(bank) == ""){
                    return false;
                }else{
                    $("#s2id_registerBank .select2-chosen").text(bank);
                }
            },
            cancel:function(){
                $("#registerBank").val("中国工商银行").trigger("change");
            }
        }).showModal();
    }
});
/*开户银行处理end*/

var companyTypeArr = $("#companyType").val().split("_");
$("input[name=companyType]").each(function(i,e){
    if(companyTypeArr.indexOf(this.value)>-1){
        $(this).prop("checked",true);
    }
});
$("input[name=companyName]").blur(function(){
    var name = $(this).val();
    $("#companyNameConfirm").val(name);
});

var loc = new Location();
var title   = ['省份' , '地级市' , '市、县、区'];
$.each(title , function(k , v) {
    title[k]    = '<option value="">'+v+'</option>';
});
$('#loc_province').append(title[0]);
$('#loc_city').append(title[1]);
$('#loc_town').append(title[2]);
$("#loc_province,#loc_city,#loc_town").select2();
if($("input[name=openProvince]").val()){
    $("#s2id_loc_province").find(".select2-chosen").text($("input[name=openProvince]").val());
    $("#s2id_loc_city").find(".select2-chosen").text($("input[name=openCity]").val());
    $("#s2id_loc_town").find(".select2-chosen").text($("input[name=openDistrict]").val());
}
$('#loc_province').change(function() {
    $('#loc_city').empty();
    if($(this).val()){
        loc.fillOption('loc_city' , '0,'+$('#loc_province').val());
        $('input[name=openProvince]').val($(this).find("option:selected").text());
        $('#loc_city').change();
    }else{
        $('input[name=openProvince],input[name=openCity],input[name=openDistrict]').val("");
        $('#loc_city').html(title[1]).change();
        $('#loc_town').html(title[2]).change();
    }
})
$('#loc_city').change(function() {
    $('#loc_town').empty();
    if($(this).val()){
        loc.fillOption('loc_town' , '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
        $('input[name=openCity]').val($(this).find("option:selected").text());
    }
    $('#loc_town').change();
})
$('#loc_town').change(function() {
    $('input[name=openDistrict]').val($(this).find("option:selected").text());
})
loc.fillOption('loc_province' , '0');

var loc2 = new Location();
$('#loc_province2').change(function() {
    $('#loc_city2').empty();
    $('#loc_city2').append(title[1]);
    loc2.fillOption('loc_city2' , '0,'+$('#loc_province2').val());
    $('#loc_city2').change();
    $('input[name=openProvince]').val($(this).find("option:selected").text());
    $('input[name=openCity]').val("");
})
$('#loc_city2').change(function() {
    $('#loc_town2').empty();
    $('#loc_town2').append(title[2]);
    loc2.fillOption('loc_town2' , '0,' + $('#loc_province2').val() + ',' + $('#loc_city2').val());
    $('#loc_town2').change();
    $('input[name=openCity]').val($(this).find("option:selected").text());
    $('input[name=openDistrict]').val("");
})
$('#loc_town2').change(function() {
    $('input[name=openDistrict]').val($(this).find("option:selected").text());
})
loc2.fillOption('loc_province2' , '0');

$("#licenseUrl").singleImgUploader({
    resultInput : $("#uploaded-licenseUrl"),
    limitLarger : true
});
$("#taxRegPicUrl").singleImgUploader({
    resultInput : $("#uploaded-taxRegPicUrl"),
    limitLarger : true
});
$("#contract").singleImgUploader({
    resultInput : $("#uploaded-contract"),
    limitLarger : true
});
$("#financeContract").singleImgUploader({
    resultInput : $("#uploaded-financeContract"),
    limitLarger : true
});
$("#idCardFront").singleImgUploader({
    resultInput : $("#uploaded-idCardFront"),
    limitLarger : true
});
$("#idCardBack").singleImgUploader({
    resultInput : $("#uploaded-idCardBack"),
    limitLarger : true
});

$("#financeType").on("change",function(){
    if($(this).val() == "2"){
        $("tr.forPub").show().removeClass("ignore");
        $("tr.forPri").hide().addClass("ignore");
        $("#cardType").text("公司账户");
    }else{
        $("tr.forPub").hide().addClass("ignore");
        $("tr.forPri").show().removeClass("ignore");
        $("#cardType").text("银行账号");
    }
});
$("#financeType").trigger("change");

template.helper('formatCompanyType', function (data, format) {
    return data.replace(/_/g,"，").replace("4","厂商/生产商").replace("2","品牌商").replace("5","批发商").replace("6","区域代理商").replace("7","加盟零售商").replace("8","自采零售商");
});
var applyParams;
$("#applyForm").validate({
    rules: {
        companyName:"required",
        licenseId:"required",
        licenseUrl:"required",
        // taxRegCode:"required",
        // taxRegPic:"required",
        district:"required",
        detail:"required",
        contract:"required",
        financeContract:"required",
        directStoreCnt:{
            number:true,
            required:true
        },
        scale:{
            number:true,
            required:true
        },
        brand:"required",
        cardNo:"required",
        accountName:"required",
        companyType:"required",
        subbranchName:"required",
        openDistrict:"required",
        idCardFront:"required",
        idCardBack:"required"
    },
    messages:{
        licenseUrl:"请上传营业执照扫描件",
        contract:"请上传运营授权书扫描件",
        // taxRegPic:"请上传税务登记证扫描件",
        financeContract:"请上传财务授权书扫描件",
        idCardFront:"请上传身份证正面",
        idCardBack:"请上传身份证反面",
        companyType:"请选择公司类型",
        directStoreCnt:{
            number: "填写数字即可"
        },
        scale:{
            number: "填写数字即可"
        }
    },
    ignore : ".ignore input",
    submitHandler:function(form){
        applyParams = $(form).serializeObject();
        applyParams.companyType=applyParams.companyType.length > 1 ? applyParams.companyType.join("_") : applyParams.companyType;
        if(applyParams.bank == "0"){
            var bank = $("#s2id_registerBank .select2-chosen").text();
            if(bank == "其它银行"){
                Util.alert("请选择开户银行或者填写其它银行");
                $("#registerBank").val("中国工商银行").trigger("change");
                return false;
            }else{
                applyParams.bank = bank;
            }
        }
        // console.log(params);
        var tempData={
            data:applyParams
        }
        var dataHtml = template('tempData', tempData);
        $("#applyTable").hide();
        $("#applyForm").append(dataHtml);
        $(window).scrollTop(250);
        return false;
    }
});

$("#applyForm").on("click","#applyCancel",function(e){
    e.preventDefault();
    $("#applyTable").show();
    $("#applyInfo").remove();
}).on("click","#applyConfirm",function(e){
    e.preventDefault();
    console.log(applyParams);
    $.ajax({
        url:"insertSupplierAuthAndFinance.json",
        data:applyParams,
        success:function(data){
            if(data.status=="0"){
                Util.alert("提交成功",function(){
                    location.href="open_info.htm";
                });
            }else{
                Util.alert(data.errmsg|| "系统繁忙，请稍后再试");
            }
        }
    })
});