$(function(){
    var addr="";
    if(sessionStorage.receiveAddressJson){
       addr = JSON.parse(sessionStorage.receiveAddressJson);
       $(".rName").val(addr.personName);
       $(".rMobile").val(addr.mobile);
       $(".addrDetail").val(addr.detail);
       $("#remove").data("id",addr.id);
       if(addr.province||addr.city||addr.district){
         $("#addressPicker").val(addr.province+" "+addr.city+" "+addr.district);
       }
       if(addr.defaultAddr == 1){
        $("#setDefault").prop("checked",true);
       }
    }else{
      $("#remove").hide();
    }

    $("#submit").on("click",function(){
      var pickerData = $("#addressPicker").val() ? $("#addressPicker").val().split(" ") : ["","",""],
      addressData = {
        personName:$.trim($(".rName").val()),
        mobile:$.trim($(".rMobile").val()),
        country:"中国",
        province:pickerData[0],
        city:pickerData[1],
        district:pickerData[2],
        detail:$.trim($(".addrDetail").val()),
        defaultAddr:$("#setDefault").prop("checked") ? 1 : 0
      };
      if(!addressData.personName){
        mobileAlert("请填写收货人姓名");
        return false;
      }
      if(!addressData.mobile){
        mobileAlert("请填写收货人手机");
        return false;
      }
      if(!/^1[34578][0-9]{1}\d{8}$/.test(addressData.mobile)){
          mobileAlert("请输入正确的手机号码");
          return false;
      }
      if(sessionStorage.receiveAddressJson){ //有sessionStorage说明为修改
        Zepto.ajax({
          type:"post",
          url:"updateCustomerAddress.json",
          dataType:"json",
          data: $.extend(addressData,{id:addr.id}),
          success:function(data){
            updateAddress(data);
          }
        });
      }else{
        Zepto.ajax({
          type:"post",
          url:"insertCustomerAddress.json",
          dataType:"json",
          data:addressData,
          success:function(data){
            updateAddress(data);
          }
        });
      }
    });
    $("#giveup").on("click",function(){
      if(confirm("确认不保存退出？")){
        history.go(-1);
      }
    });
    $("#remove").on("click",function(){
      if(confirm("确认删除该地址？")){
        var id = $(this).data("id");
        $.getJSON("deleteCustomerAddress.json?id="+id,function(data){
          if(data.status=="0"){
            updateAddress(data);
          }
        })
      }
    });
    function updateAddress(data){
      location.href="getCustomerAddressList.htm";
    }

    $("#addrDetailArea").sizeTextarea();
    var locPicker,setIntervalJs = setInterval(function(){
        if(typeof Framework7 != "undefined" && typeof mLocation != "undefined"){
            clearInterval(setIntervalJs);
            var myApp = new Framework7();
      var loc = new mLocation();
      var existVaule = loc.refind($("#addressPicker").val());
      // console.log(existVaule)
      locPicker = myApp.picker({
        input: '#addressPicker',
          // rotateEffect: true, //3D效果
          formatValue: function (picker, values, displayValues) {
              return displayValues[0]+" "+displayValues[1]+" "+displayValues[2];
          },
          cols: [
              {
                  textAlign: 'left',
                  values: loc.find("0").key,
                  displayValues: loc.find("0").val,
                  width:"25%",
                  onChange: function (picker, v) {
                    if(picker.cols[1].replaceValues){
                      var arr = loc.find("0,"+v);
                        picker.cols[1].replaceValues(arr.key,arr.val);
                      }
                      if(picker.cols[2].replaceValues){
                        var town = loc.find("0,"+v,'key').key,
                          arr2 = loc.find("0,"+v+","+town[0]);
                          picker.cols[2].replaceValues(arr2.key,arr2.val);
                      }
                  }
              },
              {
                textAlign: 'left',
                  values: loc.find('0,1').key,
                  displayValues: loc.find("0,1").val,
                  width:"35%",
                  onChange: function (picker, v) {
                      if(picker.cols[2].replaceValues){
                        var arr = loc.find("0,"+picker.cols[0].value+","+v);
                          picker.cols[2].replaceValues(arr.key,arr.val);
                      }
                  }
              },
              {
                textAlign: 'left',
                  values: loc.find('0,1,2').key,
                  displayValues: loc.find("0,1,2").val,
                  width:"40%"
              }
          ],
          onOpen:function(){
            $("#addressPicker").focus();
            locPicker.setValue(existVaule);
            existVaule="";
          }
      })
        }
    },100);
});