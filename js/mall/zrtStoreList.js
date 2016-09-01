var page={
	o:{
    latitude:"",
    longitude:"",
    open:"0",
    supplierId:getUrlParam("supplierId"),
    keywords:"",
    province:"",
    city:"",
    localTown:"",
    localCity:"",
    localProvince:"",
    district:""
  },
  listIndex:"0",
	init:function(){
		this.initLocat();
		this.initSearch();
	},
	initLocat:function(){
		var _this = this,o = _this.o;
    $.loading("正在为您查找<br>附近的门店");
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        o.latitude = position.coords.latitude;
        o.longitude = position.coords.longitude;
        var lnglatXY=[o.longitude,o.latitude];
        _this.initAmap(lnglatXY);
      },function(){
        _this.initAmap();
      });
    }else{
      _this.initAmap();
    }
	},
  initAmap:function(lnglatXY){
    var _this = this;
    if(!lnglatXY){
      _this.getStoreList(_this.o);
      _this.initLocation();
      return false;
    }
    AMap.service('AMap.Geocoder',function(){//回调函数
        //实例化Geocoder
        var geocoder = new AMap.Geocoder();
        geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
              var component = result.regeocode.addressComponent;
              var city = component.city.length>0 ? component.city : component.province,
                  district = component.district,
                  province = component.province;
              _this.o.localCity = city;
              _this.o.localProvince = province;
              _this.o.localTown = district;
              _this.o.district = district;
              _this.o.city = city;
              $("#addressPicker").val(province+" "+city+" "+district);
              _this.getStoreList(_this.o);
              _this.initLocation();
            }else{
              _this.getStoreList(_this.o);
            }
        });  
    });
  },
	initLocation:function(){
		var _this = this,myApp = new Framework7(),loc = new mLocation();
    var existVaule = loc.refind($("#addressPicker").val());
    var locPicker = myApp.picker({
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
        $("#storeAround").closest(".weui_cell").hide();
        if($("#select-type").hasClass("open")){
          $("#select-type").trigger("touchend");
        }
      },
      onClose:function(){
        $("#storeAround").closest(".weui_cell").show();
      }
    });
    $("body").on("click",".close-picker",function(){
    	_this.listIndex="0";
    	var addr = $("#addressPicker").val().split(" ");
      _this.o.keywords="";
    	_this.o.province = "";
    	_this.o.city = addr[1];
    	_this.o.district = addr[2];
      $.loading("正在为您查找门店");
    	_this.getStoreList(_this.o);
    });
	},
	initSearch:function(){
		var _this = this;
    setTimeout(function(){
      $(".select-type-list").width($("#select-type").parent().width()-1);
    },500);
    $("#select-type").on("touchend",function(){
      var $t = $(this);
      if($t.hasClass("open")){
        $(".select-type-list").hide();
        $t.removeClass("open");
        $t.parent().removeClass("up");
      }else{
        $(".select-type-list").show().off().on("click","a",function(){
          if($(this).text()=="区域"){
            $(this).text("店名");
            $("#select-type").text("区域");
            $("#search_bar").addClass("dn");
            $("#search_local_bar").removeClass("dn");
          }else{
            $("#select-type").text("店名");
            $(this).text("区域");
            $("#search_bar").removeClass("dn");
            $("#search_local_bar").addClass("dn");
          }
          $(".select-type-list").hide();
          $("#select-type").removeClass("open");
          $("#select-type").parent().removeClass("up");
        });
        $t.addClass("open");
        $t.parent().addClass("up");
      }
    });
    $("#search_input").on("focus",function(){
      $("#search_button").css("display","inline-table");
      if($("#select-type").hasClass("open")){
        $("#select-type").trigger("touchend");
      }
    }).on("blur",function(){
      $("#search_button").css("display","none");
    });
		$('#search_button').on('touchend', function () {
      $("#search_bar form").submit();
    });

    $("#search_bar form").on("submit",function(){
      $("#addressPicker").val("");
    	_this.o.keywords=$("#search_input").val();
      _this.o.province="";
      _this.o.city = "";
      _this.o.district="";
      $.loading("正在为您查找门店");
    	_this.getStoreList(_this.o);
    	return false;
    });

    $("#storeAround").on("click",function(){
    	_this.listIndex="0";
    	_this.o.keywords="";
	    _this.o.province="";
      _this.o.city = _this.o.localCity;
	    _this.o.district=_this.o.localTown;
      $.loading("正在为您查找<br>附近的门店");
	    _this.getStoreList(_this.o);
      if($("#select-type").hasClass("open")){
        $("#select-type").trigger("touchend");
      }
      if(_this.o.localProvince && _this.o.localCity){
        $("#addressPicker").val(_this.o.localProvince+" "+_this.o.localCity+" "+_this.o.localTown);
      }else{
        $("#addressPicker").val("");
      }
      
    });
	},
	getStoreList:function(params,type){
    if(page.listIndex=="0"){
      $("#zyStoreList").hide().prev(".weui_cells_title").hide();
      $(".loadingBox a").hide();
    }
    var scList=[],zyList=[],zyListAll=false;

    function loadScStore(){
      if(!type){
        $("#scStoreList").hide().prev(".weui_cells_title").hide();
        var dfdSc = $.Deferred(); 
        var scParams = $.extend({},params,{storeType:"0"});
        $.getJSON("getZRTStoreList.json",scParams,function(data){
          if(data.status=="0"){
            scList = data.result.storeSearchVoList;
            dfdSc.resolve();
          }else{
            $.alert(data.errmsg||"系统繁忙，请稍后再试");
          }
        });
        return dfdSc.promise();
      }
    }
    function loadZyStore(){
      var dfdZy = $.Deferred(); 
      var zyParams = $.extend({},params,{storeType:"1",index:page.listIndex,length:"20"});
      $.getJSON("getZRTStoreList.json",zyParams,function(data){
        if(data.status=="0"){
            zyList = data.result.storeSearchVoList;
            zyListAll = data.result.all;
            dfdZy.resolve();
          }else{
            $.alert(data.errmsg||"系统繁忙，请稍后再试");
          }
      });
      return dfdZy.promise();
    }

    $.when(loadScStore(), loadZyStore()).done(function(){
      $.loading();
      if(scList.length>0){
        $("#scStoreList").html(template("storeListTemp",{
            list:scList
        })).show().prev(".weui_cells_title").show();
      }
      if(zyList.length > 0){
        $("#zyStoreList").show().prev(".weui_cells_title").show();
        var listStr = template("storeListTemp",{
            list:zyList
        });
        if(page.listIndex=="0"){
          $("#zyStoreList").html(listStr);
        }else{
          $("#zyStoreList").append(listStr);
        }
        if(zyListAll===true){
          $(".loadingBox a").show().html("没有更多了").off();
        }else{
          $(".loadingBox a").show().html("点击加载更多").off().on("click",function(){
            $.loading("正在为您查找门店");
            page.listIndex = (parseInt(page.listIndex)+20).toString();
            page.getStoreList(page.o,true);
          });
        }
      }
      if(zyList.length===0 && scList.length===0){
        $("#zyStoreList").show().html('<div class="noResult"><span class="store">没有找到相关门店</span></div>');
      }
    });
	}
};

template.helper('getDistance', function (d) {
    if(!d || d == 999999999){
        return "";
    }else if(d<833.3){
        return (~~d*1.2).toFixed()+"m";
    }else if(d<83333.3){
        return (d*1.2/1000).toFixed(2)+"km";
    }else{
        return ">100km";
    }
});
page.init();