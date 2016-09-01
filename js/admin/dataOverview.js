/**
 * [模块 数据概览]
 */
define(['echarts','daterangepicker','colVis','AppCard'],function(){
  var CONFIG = {
    getSupplierDataPreview: '../admin/getSupplierDataPreview.json',
    getSupplierDataBetween: '../admin/getSupplierDataBetween.json',
    getSupplierDataStatList: '../admin/getSupplierDataStatList.json',
    defaultstart: Util.getUnixTime(moment().subtract('days', 30).format('YYYY-M-D')), //最近30天
    defaultend : Util.getUnixTime(moment().format('YYYY-M-D')),
    supplierId : $("#supplierId").val(),
    overviewChartOpt: {
        tooltip : {
            trigger: 'axis'
        },
        grid:{
          x:50,
          y:80,
          x2:50,
          y2:80
        },
        legend: {
            y:'360px',
            selected: {},
            data:["绑定会员数","关注会员数", "订单数", "订单额"]
        },
        toolbox: {
            show : true,
            feature : {
                saveAsImage : {show: false}
            }
        },
        calculable : false,
        xAxis : {
          type : 'category',
           boundaryGap: false, 
          splitLine:{
            show:false
          },
          data : []
        },
        yAxis : [{
            type : 'value',
            splitLine:{
              lineStyle:{
                width:1,
                color:"#eee",
                type:"dashed"
              }
            }
        },{
            type : 'value',
            position:'right',
            splitLine : {show : false}
        }],
        series :[
          {
            name:'绑定会员数', 
            type:'line', 
            data:[],
            markPoint : {
                  data : [
                      {type : 'max', name: '最大值'},
                      {type : 'min', name: '最小值'}
                  ]
              },
              markLine : {
                  data : [
                      {type : 'average', name: '平均值'}
                  ]
              }
          },{
            name:'关注会员数', 
            type:'line', 
            data:[],
            markPoint : {
                  data : [
                      {type : 'max', name: '最大值'},
                      {type : 'min', name: '最小值'}
                  ]
              },
              markLine : {
                  data : [
                      {type : 'average', name: '平均值'}
                  ]
              }
          },{
            name:'订单数', 
            type:'line', 
            data:[],
            markPoint : {
                  data : [
                      {type : 'max', name: '最大值'},
                      {type : 'min', name: '最小值'}
                  ]
              },
              markLine : {
                  data : [ {type : 'average', name: '平均值'} ]
              }
          },{
            name:'订单额', 
            type:'line', 
            data:[],
            markPoint : {
                  data : [
                      {type : 'max', name: '最大值'},
                      {type : 'min', name: '最小值'}
                  ]
              },
              markLine : {
                  data : [
                      {type : 'average', name: '平均值'}
                  ]
              }
          }
        ]
    }
  };
  var preview_VM, 
      total_VM,
      core_VM,
      list_VM,
      p_overview,
      overview_Chart;

  preview_VM = avalon.define({
    $id:'zhibiaoCtr',
    customerSubAndBandingCount:0, //newCustomerStatCount.customerSubAndBandingCount
    orderCount:0,
    orderPayment:0,
    shoppingCount:0,
    waitForProcessOrderCount:0,
    activeCustomerCount:0
  });
  total_VM = avalon.define({
    $id:'totalCtr',
    startTime:CONFIG.defaultstart,
    endTime:CONFIG.defaultend,
    orderPayment:0,
    orderCount:0,
    activeCustomerCount:0,
    shoppingCount:0,
    salesCount:0,
    storeCount:0,
    productCount:0,
    customerSubAndBandingCount:0,
    customerSubscribeCount:0,
    customerBandingCount:0,
  });
  core_VM = avalon.define({
    $id:'coreCtr',
    startTime: CONFIG.defaultstart,
    endTime: CONFIG.defaultend,
    perOrderPayment:0,
    activeProductCount:0,
    activeSalesCount:0,
    activeStoreCount:0,
    jointRate:0,
    customerSubAndBandingCount:0,
    customerSubscribeCount:0,
    customerBandingCount:0,
    activeCustomerCount:0,
    orderCount:0,
    shoppingCount:0,
    orderPayment:0,
    search:function(){
      p_overview.initListData();
    }
  });

  list_VM = avalon.define({
    $id:'SJWDCtr',
    startTime: CONFIG.defaultstart,
    endTime: CONFIG.defaultend,
    customerCountTotal: 0,
    customerSubscribeCount:0,
    customerBandingCount:0,
    orderCountTotal: 0,
    orderPaymentTotal: 0,
    search:function(){
      p_overview.initChartData();
    }
  });

  p_overview = {
    init:function(){
      this.initDateRange();
      this.initCharts();

      this.initPreviewData();
      this.initTotalData();
      this.initListData();
      this.initChartData();
    },
    initDateRange:function(){
      // 配置,API http://www.daterangepicker.com/#options
      var self = this;
      // 设置默认值
      $('#overviewDateRange span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));

      // 初始化日期选择
      $('#overviewDateRange').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
          var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
          var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
          if(Math.floor((ET-ST)/(24*3600*1000))>90){
            toastr.warning('请选择少于90天的时间！');
            return false;
          }
          $('#overviewDateRange span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
          core_VM.startTime = ST;
          core_VM.endTime = ET;
      });

      // 设置默认值
      $('#sjwdDaterange span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));

      // 初始化日期选择
      $('#sjwdDaterange').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
          var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
          var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
          if(Math.floor((ET-ST)/(24*3600*1000))>90){
            toastr.warning('请选择少于90天的时间！');
            return false;
          }
          
          $('#sjwdDaterange span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
          list_VM.startTime = ST;
          list_VM.endTime = ET;
      });
    },
    initCharts:function(){
      overview_Chart = echarts.init($('#overviewChart')[0]);
    },
    initPreviewData: function(){
      var dateToday = {
        startTime:Util.getUnixTime(moment().format('YYYY-M-D')),
        endTime:Util.getUnixTime(moment().add('days', 1).format('YYYY-M-D'))
      };
     var todayData;
     $.post(CONFIG.getSupplierDataBetween, dateToday)
      .done(function(data){
        if(data.status === '0'){
          todayData = data.result;
          preview_VM.customerSubAndBandingCount =  todayData.newCustomerStatCount.customerSubAndBandingCount;         //今日新增会员数
          preview_VM.orderCount = todayData.orderStatVo.orderCount;      //今日订单数
          preview_VM.orderPayment = todayData.orderStatVo.orderPayment;  //今日销售额
          preview_VM.shoppingCount = todayData.orderStatItemVo.shoppingCount;//今日销售商品数
          preview_VM.waitForProcessOrderCount= todayData.orderStatVo.waitForProcessOrderCount; //今日待处理订单
          preview_VM.activeCustomerCount =  todayData.orderStatItemVo.activeCustomerCount;    //今日购买会员数
        }else{
          toastr.error('服务器繁忙，请稍候再试！');
        }
      }).fail(function(){
        toastr.error('服务器繁忙，请稍候再试！');
      });
    },
    initTotalData:function(){
      $.when($.post(CONFIG.getSupplierDataPreview), $.post(CONFIG.getSupplierDataBetween))
      .done(function(d1, d2){
        d1 = d1[0]; d2 = d2[0];
        if(d1.status==='0'){
          var totalData = d1.result;
          var viewData = d2.result;
          total_VM.salesCount= totalData.salesCount; //总导购数量
          total_VM.storeCount= totalData.storeCount; //总门店数量
          total_VM.productCount = totalData.productCount; //总商品数

          total_VM.customerSubAndBandingCount =  viewData.newCustomerStatCount.customerSubAndBandingCount;  
          total_VM.customerSubscribeCount = viewData.newCustomerStatCount.customerSubscribeCount;
          total_VM.customerBandingCount = viewData.newCustomerStatCount.customerBandingCount;
          total_VM.orderPayment= viewData.orderStatVo.orderPayment; 
          total_VM.orderCount= viewData.orderStatVo.orderCount;
          total_VM.activeCustomerCount= viewData.orderStatVo.activeCustomerCount; 
          total_VM.shoppingCount= viewData.orderStatItemVo.shoppingCount; 
        }else{
          toastr.error('服务器繁忙，请稍候再试！');
        }
      })
      .fail(function(){
        toastr.error('服务器繁忙，请稍候再试！');
      });
    },
    initListData:function(){
      var oCardBox = $('#ovlistCard');
      materialadmin.AppCard.addCardLoader(oCardBox);

      var pms = {
        startTime:core_VM.$model.startTime,
        endTime:core_VM.$model.endTime
      };
      $.post(CONFIG.getSupplierDataBetween, pms)
      .done(function(data){
        if(data.status==='0'){
          var viewData = data.result;

          core_VM.customerSubAndBandingCount =  viewData.newCustomerStatCount.customerSubAndBandingCount; 
          core_VM.customerSubscribeCount = viewData.newCustomerStatCount.customerSubscribeCount;
          core_VM.customerBandingCount = viewData.newCustomerStatCount.customerBandingCount;

          core_VM.activeCustomerCount = viewData.orderStatVo.activeCustomerCount;
          core_VM.orderCount = viewData.orderStatVo.orderCount;
          core_VM.shoppingCount = viewData.orderStatItemVo.shoppingCount;
          core_VM.orderPayment = viewData.orderStatVo.orderPayment;

          core_VM.perOrderPayment= viewData.orderStatVo.perOrderPayment;   //客单价
          core_VM.activeProductCount= viewData.orderStatItemVo.activeProductCount; //动销商品数
          core_VM.activeSalesCount= viewData.orderStatVo.activeSalesCount; //动销导购数
          core_VM.activeStoreCount= viewData.orderStatVo.activeStoreCount; //动销门店数
          core_VM.jointRate= viewData.orderStatItemVo.jointRate;           //平均连带率
        }else{
          toastr.error('服务器繁忙，请稍候再试！');
        }
        materialadmin.AppCard.removeCardLoader(oCardBox);
      })
      .fail(function(){
        toastr.error('服务器繁忙，请稍候再试！');
        materialadmin.AppCard.removeCardLoader(oCardBox);
      });
    },
    initChartData:function(){
      var oCardBox = $('#SJWDCard');
      materialadmin.AppCard.addCardLoader(oCardBox);
      var pms = {
        startTime:list_VM.$model.startTime,
        endTime:list_VM.$model.endTime,
        // 这个是标记位，用来跳过防重复提交
        design:1
      };
      $.post(CONFIG.getSupplierDataStatList, pms).done(function(data){
        if(data.status === '0'){
          var detailData= data.result.statYmdVoList;
          if(!detailData.length){
            // 清空数据表
            CONFIG.overviewChartOpt.xAxis.data = [0];
            CONFIG.overviewChartOpt.series[0].data = [0];
            CONFIG.overviewChartOpt.series[1].data = [0];
            CONFIG.overviewChartOpt.series[2].data = [0];
            CONFIG.overviewChartOpt.series[3].data = [0];
          }else{
            // 行转列 - > 图表 
            var chartsData = Util.chartsDataFormat(detailData);
            CONFIG.overviewChartOpt.xAxis.data = chartsData.ymd.map(function(v,i){ 
              return avalon.filters.date(v,'MM.dd');
            });

            CONFIG.overviewChartOpt.series[0].data = chartsData.customerBandingCount;
            CONFIG.overviewChartOpt.series[1].data = chartsData.customerSubscribeCount;
            CONFIG.overviewChartOpt.series[2].data = chartsData.orderCount;
            CONFIG.overviewChartOpt.series[3].data = chartsData.orderPayment;
          }
          overview_Chart.clear().setOption(CONFIG.overviewChartOpt);
        }else{
          toastr.error('服务器繁忙，请稍候再试！');
        }
        materialadmin.AppCard.removeCardLoader(oCardBox);
      }).fail(function(){
        toastr.error('服务器繁忙，请稍候再试！');
        materialadmin.AppCard.removeCardLoader(oCardBox);
      });
      $.post(CONFIG.getSupplierDataBetween, pms)
      .done(function(data){
        if(data.status==='0'){
          var viewData = data.result;
          list_VM.customerCountTotal = viewData.newCustomerStatCount.customerSubAndBandingCount;
          list_VM.customerSubscribeCount = viewData.newCustomerStatCount.customerSubscribeCount;
          list_VM.customerBandingCount = viewData.newCustomerStatCount.customerBandingCount;

          list_VM.orderCountTotal =  viewData.orderStatVo.orderCount;
          list_VM.orderPaymentTotal =  viewData.orderStatVo.orderPayment;

        }else{
          toastr.error('服务器繁忙，请稍候再试！');
        }
          materialadmin.AppCard.removeCardLoader(oCardBox);
      }).fail(function(){
        toastr.error('服务器繁忙，请稍候再试！');
        materialadmin.AppCard.removeCardLoader(oCardBox);
      });
    }
  };

  return {
    init:function(){
      p_overview.init();
      avalon.scan($('#viewContentBox')[0]);
    }
  };

});


