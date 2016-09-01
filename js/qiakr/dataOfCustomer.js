require(['echarts','echarts/chart/pie','echarts/chart/line','avalon','moment','daterangepicker'],function(echarts){
  //===页面配置
  var CONFIG={
    getVipXFZHUrl:'',
    getVipZHXQUrl:'',
    vipXFChartOpt:{
      tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
          orient : 'vertical',
          x : 'left',
          data:['商品浏览量','对话会员数','消费会员数','复购会员数']
      },
      toolbox: {
          show : true,
          feature : {
              saveAsImage : {show: true}
          }
      },
      // calculable : false,
      series : [
          {
              name:'会员转化',
              type:'pie',
              radius : ['50%', '70%'],
              itemStyle : {
                  normal : {
                      label : {
                          show : false
                      },
                      labelLine : {
                          show : false
                      }
                  },
                  emphasis : {
                      label : {
                          show : true,
                          position : 'center',
                          textStyle : {
                              fontSize : '30',
                              fontWeight : 'bold'
                          }
                      }
                  }
              },
              data:[
                  {value:335, name:'商品浏览量'},
                  {value:310, name:'对话会员数'},
                  {value:234, name:'消费会员数'},
                  {value:135, name:'复购会员数'}
              ]
          }
      ]
    },
    vipXQChartQpt:{
      tooltip : {
          trigger: 'axis'
      },
      legend: {
          y:'bottom',
          data:['新用户送券领取数','新用户送券使用数','买后送券领取数','买后送券使用数','导购送券领取数','导购送券使用数']
      },
      toolbox: {
          show : true,
          feature : {
              saveAsImage : {show: true}
          }
      },
      calculable : false,
      xAxis : [
          {
              type : 'category',
              boundaryGap : false,
              data : ['12.1','12.2','12.3','12.5','12.5','.12.6','12.8']
          }
      ],
      yAxis : [
          {
              type : 'value'
          }
      ],
      series : [
          {
              name:'新用户送券领取数',
              type:'line',
              stack: '总量',
              data:[120, 132, 101, 134, 90, 230, 210]
          },
          {
              name:'新用户送券使用数',
              type:'line',
              stack: '总量',
              data:[220, 182, 191, 234, 290, 330, 310]
          },
          {
              name:'买后送券领取数',
              type:'line',
              stack: '总量',
              data:[150, 232, 201, 154, 190, 330, 410]
          },
          {
              name:'买后送券使用数',
              type:'line',
              stack: '总量',
              data:[320, 332, 301, 334, 390, 330, 320]
          },
          {
              name:'导购送券领取数',
              type:'line',
              stack: '总量',
              data:[820, 932, 901, 934, 1290, 1330, 1320]
          },
          {
              name:'导购送券使用数',
              type:'line',
              stack: '总量',
              data:[820, 932, 901, 934, 1290, 1330, 1320]
          }
      ]
    }
  };

  var vipXF_VM,   //会员消费VM
      vipXQ_VM,   //会员详情VM
      vipXFChart, //消费图表
      vipXQChart; //详情图表

  //===ViewModal
  vipXF_VM= avalon.define({
    $id:'vipXFCtr',
    title:'会员消费转化',
    searchSettings:{
      startTime:'',
      endTime:''
    },
    table1Data:{
      
    },
    table2Data:{},
    searchEv:function(){
      // vipXF_VM.$model.title

      // 从VM中拿到数据
      // 异步请求数据
      // 更新VM中table的数据
      // 更新chart中data的数据
      alert('搜索');
    },
    exportEv:function(){
      // 获取参数
      // 异步请求
      // 提示成功或失败
      alert('导出');
    }
  });
  vipXQ_VM = avalon.define({
    $id:'vipXQCtr',
    title:'会员消费转化',
    searchSettings:{
      startTime:'',
      endTime:'',
      table1Data:{},
      table2Data:{}
    },
    searchEv:function(){

    },
    exportEv:function(){

    }
  });


  // 图表显示loading
  // myChart.showLoading({text: '正在努力的读取数据中...'});
  // myChart.hideLoading();
  // option.series=[];
  // myChart.setOption(option);

  //===页面逻辑
  var p_sales = {
    init: function(){
      this.initDateRange(); //初始化日期选择
      this.initVipCharts(); //初始化图表
      this.initVipData();   //加载数据
    },
    initDateRange:function(){
      // 配置
      var drpOpt = {
        timePicker: true,
        timePickerIncrement: 30,
        startDate: moment().subtract('days', 7),
        endDate: moment(),
        opens: 'right',
        ranges: {
           '今日': [moment(), moment()],
           '昨日': [moment().subtract('days', 1), moment().subtract('days', 1)],
           '最近 7 天': [moment().subtract('days', 6), moment()],
           '最近 30 天': [moment().subtract('days', 29), moment()],
           '这个月': [moment().startOf('month'), moment().endOf('month')],
           '上个月': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        }
      };

      // 设置默认值
      $('#reportrange1 span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

      // 初始化日期选择
      $('#reportrange1').daterangepicker(drpOpt, function(start, end, label) {
          $('#reportrange1 span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      });

      // 设置默认值
      $('#reportrange2 span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

      // 初始化日期选择
      $('#reportrange2').daterangepicker(drpOpt, function(start, end, label) {
          $('#reportrange2 span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      });
    },
    initVipData:function(){
      var self = this;
      // 消费
      
      // 详情

      vipXFChart.showLoading({text: '正在努力的读取数据中...'});
      vipXQChart.showLoading({text: '正在努力的读取数据中...'});

      setTimeout(function(){
        self.showVipXFChart();
      }, 500)

      setTimeout(function(){
        self.showVipXQChart();
      }, 500)

    },
    initVipCharts:function(){
      vipXFChart = echarts.init($('#vipTRView')[0]);
      vipXQChart = echarts.init($('#vipTRDesCharts')[0]);
    },
    showVipXFChart:function(){
      vipXFChart.setOption(CONFIG.vipXFChartOpt);
      vipXFChart.hideLoading();
    },
    showVipXQChart:function(){
      vipXQChart.setOption(CONFIG.vipXQChartQpt);
      vipXQChart.hideLoading();
    }
  };

  //===页面初始化
  p_sales.init();
});

