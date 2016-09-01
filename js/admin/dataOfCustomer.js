/**
 * [会员 模块]
 */
define(['toastr','daterangepicker','echarts','colVis','select2','twbsPagination','AppCard'],function(toastr){

  //===页面配置
  var CONFIG={
    getCustomerDataBetween: 'getCustomerDataBetween.json',
    getCustomerFlashsaleDataBetween: 'getCustomerFlashsaleDataBetween.json',
    geCustomerFlashsaleDataStatList: 'geCustomerFlashsaleDataStatList.json',
    groupCustomerByOrderCount: 'groupCustomerByOrderCount.json',
    defaultstart: Util.getUnixTime(moment().subtract('days', 30).format('YYYY-M-D')), //最近30天
    defaultend: Util.getUnixTime(moment().format('YYYY-M-D')),
    listChartOpt:{
      tooltip : { trigger: 'axis' },
        grid:{
          x:50,
          y:40,
          x2:50,
          y2:80
        },
        legend: {
            data:["会员数", "订单数", "订单额"]
        },
        toolbox: {
            show : false,
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
            name:'会员数', 
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
                  data : [
                      {type : 'average', name: '平均值'}
                  ]
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
    },
    orderChartOpt:{
      title : {
        text: '购买会员数',
        subtext: '',
        x:'center'
      },
      tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
          orient : 'vertical',
          x : 'left',
          data:['无购买的会员数','购买1次的会员数','购买2次的会员数','购买3次的会员数','购买4次及以上的会员数']
      },
      toolbox: {
          show : false
      },
      calculable : true,
      series : [
          {
              name:'会员数',
              type:'pie',
              radius : '55%',
              center: ['50%', '60%'],
              data:[
                  {value:0, name:'无购买的会员数'},
                  {value:0, name:'购买1次的会员数'},
                  {value:0, name:'购买2次的会员数'},
                  {value:0, name:'购买3次的会员数'},
                  {value:0, name:'购买4次及以上的会员数'}
              ]
          }
      ]
    }
  };

  var cus_previewVM,  //概览
      cus_listVM,     //列表
      cus_orderVM,    //排行
      cusListChart,   //列表图
      cusOrderChart;  //排行饼图

  //===ViewModal
  cus_previewVM= avalon.define({
    $id:'custPreviewCtrl',
    startTime:CONFIG.defaultstart,
    endTime:CONFIG.defaultend,
    activeCustomerCount:0,
    shoppingCount:0,
    orderPayment:0,
    jointRate:0,
    perOrderPayment:0,
    searchEv:function(){
      p_customer.getPreviewData.bind(p_customer)();
    }
  });
  // cus_listVM = avalon.define({
    // $id:'custFlashsaleCtrl',
    // startTime:CONFIG.defaultstart,
    // endTime:CONFIG.defaultend,
    // orderCount:0,
    // orderPayment:0,
    // activeCustomerCount:0,
    // pvCount:0,
    // uvCount:0,
    // searchEv:function(){
    //   p_customer.getListData.bind(p_customer)();
    // }
  // });
  cus_orderVM = avalon.define({
    $id:'custOrderCtrl',
    startTime:CONFIG.defaultstart,
    endTime:CONFIG.defaultend,
    searchEv:function(){
      p_customer.getOrderData.bind(p_customer)();
    }
  });

  //===页面逻辑
  p_customer = {
    init: function(){
      this.initDateRange(); //初始化日期选择
      this.initCharts(); //初始化图表

      this.getPreviewData();
      this.getListData();
      this.getOrderData(); 
    },
    initDateRange:function(){
      var self = this;
      // 概览
      $('#custRange1 span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));
      $('#custRange1').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
        var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
        var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
        if(Math.floor((ET-ST)/(24*3600*1000))>90){
          toastr.warning('请选择少于90天的时间！');
          return fales;
        }

        $('#custRange1 span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
        cus_previewVM.startTime =  ST;
        cus_previewVM.endTime = ET;

        // self.getPreviewData();
      });

      // 列表
      // $('#custRange2 span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));
      // $('#custRange2').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
      //   var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
      //   var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
      //   if(Math.floor((ET-ST)/(24*3600*1000))>90){
      //     toastr.warning('请选择少于90天的时间！');
      //     return fales;
      //   }

      //   $('#custRange2 span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
      //   cus_listVM.startTime =  ST;
      //   cus_listVM.endTime = ET;
      // });

      // 饼图
      $('#custRange3 span').html(moment().subtract('days', 30).format('YYYY-M-D') + ' — ' + moment().subtract('days', 1).format('YYYY-M-D'));
      $('#custRange3').daterangepicker(mainVM.$model.datepickerOpt, function(start, end, label) {
        var ST = Util.getUnixTime(start.format('YYYY-M-D 00:00:00'));
        var ET = Util.getUnixTime(end.format('YYYY-M-D 23:59:59'))+1000;
        if(Math.floor((ET-ST)/(24*3600*1000))>90){
          toastr.warning('请选择少于90天的时间！');
          return fales;
        }

        $('#custRange3 span').html(start.format('YYYY-M-D') + ' — ' + end.format('YYYY-M-D'));
        cus_orderVM.startTime =  ST;
        cus_orderVM.endTime = ET;

        // self.getOrderData();
      });
    },
    initCharts:function(){
      // cusListChart = echarts.init($('#cusListChart')[0]);
      cusOrderChart = echarts.init($('#cusOrderChart')[0]);
    },
    getPreviewData:function(){
      var self = this;
      var oCardBox = $('#cusPreviewCard');
      materialadmin.AppCard.addCardLoader(oCardBox);

      var pms = {
        startTime:cus_previewVM.startTime,
        endTime:cus_previewVM.endTime
      };
      $.post(CONFIG.getCustomerDataBetween, pms).done(function(data){
        if(data.status==='0'){
          cus_previewVM.activeCustomerCount = data.result.orderStatVo.activeCustomerCount;
          cus_previewVM.shoppingCount = data.result.orderStatItemVo.shoppingCount;
          cus_previewVM.orderPayment = data.result.orderStatItemVo.orderPayment;
          cus_previewVM.jointRate = data.result.orderStatItemVo.jointRate;
          cus_previewVM.perOrderPayment = data.result.orderStatItemVo.perOrderPayment;
        }
        materialadmin.AppCard.removeCardLoader(oCardBox);
      }).fail(function(){
        materialadmin.AppCard.removeCardLoader(oCardBox);
      });
    },
    getListData:function(){
      // var self = this;
      // var oCardBox = $('#custListCard');
      // materialadmin.AppCard.addCardLoader(oCardBox);
      // var pms = {
      //   startTime:cus_listVM.$model.startTime,
      //   endTime:cus_listVM.$model.endTime
      // };

      // $.when($.post(CONFIG.getCustomerFlashsaleDataBetween, pms), $.post(CONFIG.geCustomerFlashsaleDataStatList, pms))
      // $.post(CONFIG.geCustomerFlashsaleDataStatList, pms)
      // .done(function(data){
      //   // d1 = d1[0]; d2 = d2[0];
      //   if(data.status==='0'){
      //     // cus_listVM.orderCount = d1.result.flashSaleOrderStatVo.orderCount;
      //     // cus_listVM.orderPayment = d1.result.flashSaleOrderStatVo.orderPayment;
      //     // cus_listVM.activeCustomerCount = d1.result.flashSaleOrderStatVo.activeCustomerCount;
      //     // cus_listVM.pvCount = d1.result.flashSaleStatPageViewVo.pvCount;
      //     // cus_listVM.uvCount = d1.result.flashSaleStatPageViewVo.uvCount;

      //     var listData = data.result.statYmdVoList;
      //     if(!listData.length){
      //       // 清空数据表
      //       CONFIG.listChartOpt.xAxis.data = [0];
      //       CONFIG.listChartOpt.series[0].data = [0];
      //       CONFIG.listChartOpt.series[1].data = [0];
      //       CONFIG.listChartOpt.series[2].data = [0];
      //     }else{
      //       // 行转列 - > 图表 
      //       var chartsData = Util.chartsDataFormat(listData);
      //       CONFIG.listChartOpt.xAxis.data = chartsData.ymd.map(function(v,i){ 
      //               return avalon.filters.date(v,'MM.dd')
      //             }); 
      //       CONFIG.listChartOpt.series[0].data = chartsData.customerCount;
      //       CONFIG.listChartOpt.series[1].data = chartsData.orderCount;
      //       CONFIG.listChartOpt.series[2].data = chartsData.orderPayment;
      //     }
      //   }
      //   cusListChart.clear().setOption(CONFIG.listChartOpt);
      //   materialadmin.AppCard.removeCardLoader(oCardBox);
      //   })
      //   .fail(function(){
      //     materialadmin.AppCard.removeCardLoader(oCardBox);
      //   });
    },
    getOrderData:function(){
      var self = this;
      var oCardBox = $('#custOrderCard');
      materialadmin.AppCard.addCardLoader(oCardBox);

      var pms = {
        startTime:cus_orderVM.startTime,
        endTime:cus_orderVM.endTime
      };
      $.post(CONFIG.groupCustomerByOrderCount, pms)
      .done(function(data){
        if(data.status==='0'){
          var res = data.result.groupCustomerByOrderCount;
          var c0 = res.filter(function(v, i){ if(v.orderCount==0) return true; })[0];
          c0 = c0 ? c0.customerCount:0;

          var c1 = res.filter(function(v, i){ if(v.orderCount==1) return true; })[0];
          c1 = c1 ? c1.customerCount:0;

          var c2 = res.filter(function(v, i){ if(v.orderCount==2) return true; })[0];
          c2 = c2 ? c2.customerCount:0;

          var c3 = res.filter(function(v, i){ if(v.orderCount==3) return true; })[0];
          c3 = c3 ? c3.customerCount:0;

          var c4 = res.filter(function(v, i){ if(v.orderCount==4) return true; })[0];
          c4 = c4 ? c4.customerCount:0;

          CONFIG.orderChartOpt.series[0].data[0].value = c0;
          CONFIG.orderChartOpt.series[0].data[1].value = c1;
          CONFIG.orderChartOpt.series[0].data[2].value = c2;
          CONFIG.orderChartOpt.series[0].data[3].value = c3;
          CONFIG.orderChartOpt.series[0].data[4].value = c4;
        }
          cusOrderChart.clear().setOption(CONFIG.orderChartOpt);
          materialadmin.AppCard.removeCardLoader(oCardBox);
      })
      .fail(function(){
        materialadmin.AppCard.removeCardLoader(oCardBox);
      });
    }
  };

  //===页面初始化
  return {
    init:function(){
      p_customer.init();
      avalon.scan($('#viewContentBox')[0]);
    }
  };
});

