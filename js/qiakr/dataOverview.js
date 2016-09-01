/**
 * [模块 数据概览]
 */
define(['daterangepicker','echarts','domReady!'],function(){

  var dataOverview = {
    chartsOption:{
      detailChartOpt:{
          tooltip : {
              trigger: 'axis'
          },
          grid:{
            x:50,
            y:40,
            x2:50,
            y2:80
          },
          legend: {
              y:'350px',
              selected: {
                '动销商户':false,
                '动销门店' : false,
                '复购率(总)' : false,
                '连带率(总)' : false,
                '绑定手机用户数' : false,
                '公众号':false,
                '商品SKU':false,
                '商品SPU':false,
                '商品SPU(新增动销)':false,
                '商品SKU(新增动销)':false,
                '关注用户数':false,
                '客单价':false,
                '动销导购':false,
              },
              data:["商户", "门店", "导购", "动销商户", "动销门店", "动销导购", "公众号", "商品SKU", "商品SPU", "商品SPU(新增动销)", "商品SKU(新增动销)", "用户数", "关注用户数", "绑定手机用户数", "消费会员数", "订单数", "订单额", "客单价", "连带率(总)", "复购率(总)"]
          },
          toolbox: {
              show : true,
              feature : {
                  saveAsImage : {show: true}
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
              axisLabel : {
                formatter: '{value}元'
              },
              splitLine : {show : false}
          }],
          series : [
              
          ]
        },
      mapChartOpt:{
        title : {
            text: '洽客地理位置分布图',
            subtext: '纯属虚构',
            x:'center'
        },
        tooltip : {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            x:'left',
            selected: {
                '订单数' : false
              },
            data:['订单数','动销门店']
        },
        dataRange: {
            min: 0,
            max: 2500,
            x: 'left',
            y: 'bottom',
            text:['高','低'], 
            calculable : true
        },
        toolbox: {
            show: true,
            x: 'right',
            y: 'top',
            feature : {
              restore : {show: true},
              saveAsImage : {show: true}
            }
        },
         roamController: {
            show: false
            // x: 'left',
            // y: 'bottom',
            // mapTypeControl: {
            //     'china': true
            // }
        },
        series : [
            {
                name: '订单数',
                type: 'map',
                mapType: 'china',
                roam: true,
                itemStyle:{
                    normal:{label:{show:true}},
                    emphasis:{label:{show:true}}
                },
                data:[
                    {name: '北京',value: Math.round(Math.random()*1000)},
                    {name: '天津',value: Math.round(Math.random()*1000)},
                    {name: '上海',value: Math.round(Math.random()*1000)},
                    {name: '重庆',value: Math.round(Math.random()*1000)},
                    {name: '河北',value: Math.round(Math.random()*1000)},
                    {name: '河南',value: Math.round(Math.random()*1000)},
                    {name: '云南',value: Math.round(Math.random()*1000)},
                    {name: '辽宁',value: Math.round(Math.random()*1000)},
                    {name: '黑龙江',value: Math.round(Math.random()*1000)},
                    {name: '湖南',value: Math.round(Math.random()*1000)},
                    {name: '安徽',value: Math.round(Math.random()*1000)},
                    {name: '山东',value: Math.round(Math.random()*1000)},
                    {name: '新疆',value: Math.round(Math.random()*1000)},
                    {name: '江苏',value: Math.round(Math.random()*1000)},
                    {name: '浙江',value: Math.round(Math.random()*1000)},
                    {name: '江西',value: Math.round(Math.random()*1000)},
                    {name: '湖北',value: Math.round(Math.random()*1000)},
                    {name: '广西',value: Math.round(Math.random()*1000)},
                    {name: '甘肃',value: Math.round(Math.random()*1000)},
                    {name: '山西',value: Math.round(Math.random()*1000)},
                    {name: '内蒙古',value: Math.round(Math.random()*1000)},
                    {name: '陕西',value: Math.round(Math.random()*1000)},
                    {name: '吉林',value: Math.round(Math.random()*1000)},
                    {name: '福建',value: Math.round(Math.random()*1000)},
                    {name: '贵州',value: Math.round(Math.random()*1000)},
                    {name: '广东',value: Math.round(Math.random()*1000)},
                    {name: '青海',value: Math.round(Math.random()*1000)},
                    {name: '西藏',value: Math.round(Math.random()*1000)},
                    {name: '四川',value: Math.round(Math.random()*1000)},
                    {name: '宁夏',value: Math.round(Math.random()*1000)},
                    {name: '海南',value: Math.round(Math.random()*1000)},
                    {name: '台湾',value: Math.round(Math.random()*1000)},
                    {name: '香港',value: Math.round(Math.random()*1000)},
                    {name: '澳门',value: Math.round(Math.random()*1000)}
                ]
            },
            {
                name: '动销门店',
                type: 'map',
                mapType: 'china',
                roam: true,
                itemStyle:{
                    normal:{label:{show:true}},
                    emphasis:{label:{show:true}}
                },
                data:[
                    {name: '北京',value: Math.round(Math.random()*1000)},
                    {name: '天津',value: Math.round(Math.random()*1000)},
                    {name: '上海',value: Math.round(Math.random()*1000)},
                    {name: '重庆',value: Math.round(Math.random()*1000)},
                    {name: '河北',value: Math.round(Math.random()*1000)},
                    {name: '河南',value: Math.round(Math.random()*1000)},
                    {name: '云南',value: Math.round(Math.random()*1000)},
                    {name: '辽宁',value: Math.round(Math.random()*1000)},
                    {name: '黑龙江',value: Math.round(Math.random()*1000)},
                    {name: '湖南',value: Math.round(Math.random()*1000)},
                    {name: '安徽',value: Math.round(Math.random()*1000)},
                    {name: '山东',value: Math.round(Math.random()*1000)},
                    {name: '新疆',value: Math.round(Math.random()*1000)},
                    {name: '江苏',value: Math.round(Math.random()*1000)},
                    {name: '浙江',value: Math.round(Math.random()*1000)},
                    {name: '江西',value: Math.round(Math.random()*1000)},
                    {name: '湖北',value: Math.round(Math.random()*1000)},
                    {name: '广西',value: Math.round(Math.random()*1000)},
                    {name: '甘肃',value: Math.round(Math.random()*1000)},
                    {name: '山西',value: Math.round(Math.random()*1000)},
                    {name: '内蒙古',value: Math.round(Math.random()*1000)},
                    {name: '陕西',value: Math.round(Math.random()*1000)},
                    {name: '吉林',value: Math.round(Math.random()*1000)},
                    {name: '福建',value: Math.round(Math.random()*1000)},
                    {name: '贵州',value: Math.round(Math.random()*1000)},
                    {name: '广东',value: Math.round(Math.random()*1000)},
                    {name: '青海',value: Math.round(Math.random()*1000)},
                    {name: '西藏',value: Math.round(Math.random()*1000)},
                    {name: '四川',value: Math.round(Math.random()*1000)},
                    {name: '宁夏',value: Math.round(Math.random()*1000)},
                    {name: '海南',value: Math.round(Math.random()*1000)},
                    {name: '台湾',value: Math.round(Math.random()*1000)},
                    {name: '香港',value: Math.round(Math.random()*1000)},
                    {name: '澳门',value: Math.round(Math.random()*1000)}
                ]
            }
        ]
      }
    },
    init: function(){
      this.initDateRange(); //初始化日期选择
      this.initCharts();
    },
    initDateRange:function(){
      // 配置,API http://www.daterangepicker.com/#options
      var drpOpt = {
        timePicker: true,
        timePickerIncrement: 5,
        timePicker12Hour:false,
        timePickerSeconds:true,
        startDate: moment().subtract('days', 7).format('YYYY-M-D 00:00:00'),
        endDate: moment().subtract('days', 1).format('YYYY-M-D 23:59:59'),
        opens: 'right',
        ranges: {
           '今日': [moment().subtract('days').format('YYYY-M-D 00:00:00'), moment()],
           '昨日': [moment().subtract('days', 1).format('YYYY-M-D 00:00:00') , moment().subtract('days', 1).format('YYYY-M-D 23:59:59')],
           '最近 7 天': [moment().subtract('days', 7).format('YYYY-M-D 00:00:00'), moment().subtract('days', 1).format('YYYY-M-D 23:59:59')],
           '最近 30 天': [moment().subtract('days', 30).format('YYYY-M-D 00:00:00'), moment().subtract('days', 1).format('YYYY-M-D 23:59:59') ],
        }
      };

      // 设置默认值
      $('#reportrange2 span').html(moment().subtract('days', 7).format('YYYY-M-D 00:00:00') + ' - ' + moment().subtract('days', 1).format('YYYY-M-D 23:59:59'));

      // 初始化日期选择
      $('#reportrange2').daterangepicker(drpOpt, function(start, end, label) {
          $('#reportrange2 span').html(start.format('YYYY-M-D HH:mm:mm') + ' - ' + end.format('YYYY-M-D HH:mm:mm'));
          $("#detailDataStart").val(start.toDate().getTime());
          $("#detailDataEnd").val(end.toDate().getTime());
      });
    },
    getLineChartsData:function(start,end,condition){
      var self = this;
      var detailChart = echarts.init($('#vipTRDesCharts')[0]);
      detailChart.showLoading({text: '正在努力的读取数据中...'});
      
      
      var param={
          startTime: start,
          endTime: end,
          condition:condition
      }
      $.getJSON("platformListOverview.json",param,function(data){
          var list = data.platformDataListVo;
          console.log(data)
          self.chartsOption.detailChartOpt.xAxis.data = list.dateList;
          self.chartsOption.detailChartOpt.series=[
            {
                name:'商户',
                type:'line',
                data:list.supplierCountList
            },{
                name:'门店',
                type:'line',
                data:list.storeCountList
            },{
                name:'导购',
                type:'line',
                data:list.salesCountList
            },{
                name:'动销商户',
                type:'line',
                data:list.supplierDynamicCountList
            },{
                name:'动销门店',
                type:'line',
                data:list.storeDynamicCountList
            },{
                name:'动销导购',
                type:'line',
                data:list.salesDynamicCountList
            },{
                name:'公众号',
                type:'line',
                data:list.wechatAuthsupplierCountList
            },{
                name:'商品SKU',
                type:'line',
                data:list.productSkuCountList
            },{
                name:'商品SPU',
                type:'line',
                data:list.productSpuCountList
            // },{
            //     name:'门店(营业)',
            //     type:'line',
            //     data:list.storeOpenCountList
            // },{
            //     name:'门店(暂停)',
            //     type:'line',
            //     data:list.storeCloseCountList
            // },{
            //     name:'导购(在职)',
            //     type:'line',
            //     data:list.salesAtJobCountList
            // },{
            //     name:'导购(离职)',
            //     type:'line',
            //     data:list.salesOffJobCountList
            },{
                name:'商品SPU(新增动销)',
                type:'line',
                data:list.productSpuDynamicCountList
            },{
                name:'商品SKU(新增动销)',
                type:'line',
                data:list.productSkuDynamicCountList
            },{
                name:'用户数',
                type:'line',
                data:list.accountCountList
            },{
                name:'关注用户数',
                type:'line',
                data:list.accountWeixinCountList
            },{
                name:'绑定手机用户数',
                type:'line',
                data:list.bindingMobileAccountCountList
            },{
                name:'消费会员数',
                type:'line',
                data:list.consumerCountList
            },{
                name:'订单数',
                type:'line',
                data:list.orderPayedCountList
            },{
                name:'订单额',
                type:'line',
                yAxisIndex:1,
                data:list.sumOrderPayedList
            },{
                name:'客单价',
                type:'line',
                yAxisIndex:1,
                data:list.perOrderPriceList
            },{
                name:'连带率(总)',
                type:'line',
                data:list.associatePurchaseRateList
            },{
                name:'复购率(总)',
                type:'line',
                data:list.repurchaseRateList
            }
          ];
          detailChart.setOption(self.chartsOption.detailChartOpt);
          detailChart.hideLoading();
      });
    },
    initCharts:function(){
      var self = this;
      // this.getLineChartsData((new Date().getTime()-86400000*7),new Date().getTime(),0);
      this.getLineChartsData(1423639200000,1424511900000,0);

      var mapChart = echarts.init($('#locationMap')[0]);
      mapChart.showLoading({text: '正在努力的读取数据中...'});
      mapChart.setOption(self.chartsOption.mapChartOpt);
      mapChart.hideLoading();
    }
  };

  return dataOverview;

});


