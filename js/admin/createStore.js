document.title="新建门店";
$.createSecondMenu("store_manage","门店管理");
// 服务区域初始化
// var loc = new Location({
//     backfill: true
// });
// console.log(loc.getValue());


var loc = new Location();
var title   = ['省份' , '地级市' , '市、县、区'];
$.each(title , function(k , v) {
    title[k]    = '<option value="">'+v+'</option>';
});
$('#loc_province').append(title[0]);
$('#loc_city').append(title[1]);
$('#loc_town').append(title[2]);
loc.fillOption('loc_province' , '0');
$("#loc_province,#loc_city,#loc_town").select2();

if($("input[name=district]").val()){
    // 编辑地址，填充以前已有的地址
    $("#s2id_loc_province").find(".select2-chosen").text($("input[name=province]").val());
    $("#s2id_loc_city").find(".select2-chosen").text($("input[name=city]").val());
    $("#s2id_loc_town").find(".select2-chosen").text($("input[name=district]").val());
    $('#loc_city').empty();
    $('#loc_town').empty();

    var province=$('#loc_province option').filter(function(i,v){
        return v.innerText==$("input[name=province]").val();
    });
    if(province.length>0){
        $('#loc_province').val(province[0].value);
        loc.fillOption('loc_city' , '0,'+province[0].value);

        var city=$('#loc_city option').filter(function(i,v){
            return v.innerText==$("input[name=city]").val();
        });
        if(city.length>0){
            $('#loc_city').val(city[0].value);
            loc.fillOption('loc_town' , '0,'+province[0].value+','+city[0].value);
        }
    }
}

$('#loc_province').change(function() {
    $('#loc_city').empty();
    if($(this).val()){
        loc.fillOption('loc_city' , '0,'+$('#loc_province').val());
        $('input[name=province]').val($(this).find("option:selected").text());
        $('#loc_city').change();
    }else{
        $('input[name=province],input[name=city],input[name=district]').val("");
        $('#loc_city').html(title[1]).change();
        $('#loc_town').html(title[2]).change();
    }
});
$('#loc_city').change(function() {
    $('#loc_town').empty();
    if($(this).val()){
        loc.fillOption('loc_town' , '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
        $('input[name=city]').val($(this).find("option:selected").text());
    }
    $('#loc_town').change();
});
$('#loc_town').change(function() {
    if($(this).val()){
        $('input[name=district]').val($(this).find("option:selected").text());
    }
});

$(".select2").select2();
$(".select2s").select2({
    minimumResultsForSearch: -1
});

$("#createStoreForm").validate({
    rules: {
        name: {
            required: true,
            maxlength: 20
        },
        district: "required",
        detail:"required",
        phone:{
            required:true,
            number:true
        },
        brandN:'required',
        logo:"required",
        picture:"required",
        businessHours:{
            timeCheck:true,
            maxlength: 20
        },
        insulateGroupId:'required'
    },
    messages: {
        name: {
            required: "请输入店铺名称",
            maxlength: "最长20个字"
        },
        district:"请选择联系地址",
        detail:"请填写详细地址",
        brandN:'请选择品牌名称',
        phone:{
            required:"请填写联系电话",
            number:"只能包含数字"
        },
        logo:"请上传门店logo",
        picture:"请上传门店店招",
        businessHours:{
            maxlength: "不要超过20字符"
        },
        insulateGroupId:'在编辑中选择门店分组'
    },
    submitHandler:function(form){
        var createParam = $(form).serializeObject();
        createParam.name = $.trim(createParam.name);
        var preview=[];
        $(".uploadifyBox.preview").find(".uploadify-queue-item .loaded img").each(function(i,e){
            preview.push($(e).attr("src"));
        });
        createParam.entityPicture=preview.join(",");
        createParam.storeId=$("#storeId").val();
        createParam.storeType=$("#typeAllStore").val();
        $.ajax({
            url:"updateStoreOfSupplier.json",
            data:createParam,
            success:function(data){
                if(data.status=="0"){
                    Util.alert("保存成功");
                }else{
                    Util.alert(data.errmsg ? data.errmsg : '系统繁忙，请稍后再试');
                }
            }
        });
    }
});

$("#imageUpload").singleImgUploader({
    resultInput : $("#storeImageUrl"),
    width:320,
    height:130
});
$("#logoUpload").singleImgUploader({
    resultInput : $("#storeLogoUrl")
});

var lngX=$("#lngX").val(),
    latY=$("#latY").val();
var mapObj = new AMap.Map('mapContainer',{
    resizeEnable: true,
    view: new AMap.View2D({
        center:(lngX && latY) ? new AMap.LngLat(lngX,latY) : "",
        zoom: 15
    })
}); 
if(!lngX || !latY){
    $("#lngX").val(mapObj.getCenter().lng);
    $("#latY").val(mapObj.getCenter().lat);
}
var marker = new AMap.Marker({
    position:mapObj.getCenter()
});
marker.setMap(mapObj);
AMap.event.addListener(mapObj,'click',function(e){
    lngX = e.lnglat.getLng();
    latY = e.lnglat.getLat(); 
    marker.setPosition(new AMap.LngLat(lngX,latY));
    $("#lngX").val(lngX);
    $("#latY").val(latY);
});
$("#searchOnMap").on("click",function(e){
    e.preventDefault();
    var addr = $("#addressKeyword").val();
    geocoder(addr);
});
function geocoder(addr) {
    var MGeocoder;
    //加载地理编码插件
    AMap.service(["AMap.Geocoder"], function() {        
        MGeocoder = new AMap.Geocoder({ 
            radius:1000 //范围，默认：500
        });
        //返回地理编码结果 
        //地理编码
        MGeocoder.getLocation(addr, function(status, result){
            if(status === 'complete' && result.info === 'OK'){
                var geocode = [];
                geocode = result.geocodes;  
                lngX = geocode[0].location.getLng();
                latY = geocode[0].location.getLat(); 
                marker.setPosition(new AMap.LngLat(lngX,latY));
                $("#lngX").val(lngX);
                $("#latY").val(latY);
                mapObj.setFitView();
            }
        });
    });
}
$("input[name=detail]").blur(function(){
    var address = $("#s2id_loc_province").find(".select2-chosen").text()+
                  $("#s2id_loc_city").find(".select2-chosen").text()+
                  $("#s2id_loc_town").find(".select2-chosen").text()+
                  $(this).val();
     $("#addressKeyword").val(address);
     $("#searchOnMap").trigger("click");
});

var suid = $("#g_supplierId").val();
function selectGroup(){
    var options = {
        index: 0,
        length: 10,
        supplierId: suid
    }
    $.post('listStoreInsulateGroupBySupplierId.json', options, function(data){
        var list = data.result.list;
        var editAllStore=$("#editAllStore");
        for(var i=0;i<list.length;i++){
            name="<option value="+list[i].storeInsulateGroup.id+">"+list[i].storeInsulateGroup.name+"</option>";
            $(name).appendTo(editAllStore);
        };
        var va=$("#insulateGroupIdIpt").val();
        $("#editAllStore").val(va).trigger('change');
    })
}
selectGroup();

