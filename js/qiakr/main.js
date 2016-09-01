
getChartsData((new Date().getTime()-86400000*7),new Date().getTime(),0);
// getChartsData(1423839200000,1424511900000,0);
function getChartsData(start,end,condition){
    $("#line-highcharts").empty().html('<div class="text-center"><img src="../images/admin/loading.gif" /></div>');
    var param={
        startTime: start,
        endTime: end,
        condition:condition
    }
    $.getJSON("platformListOverview.json",param,function(data){
        var list = data.platformDataListVo;
        console.log(data)
        overviewHighcharts(list.dateList,list.supplierCountList,list.storeCountList,list.salesCountList,list.supplierDynamicCountList,list.storeDynamicCountList,list.salesDynamicCountList,list.wechatAuthsupplierCountList,list.productSkuCountList,list.productSpuCountList,list.storeOpenCountList,list.storeCloseCountList,list.salesAtJobCountList,list.salesOffJobCountList,list.productSpuDynamicCountList,list.productSkuDynamicCountList,list.accountCountList,list.accountWeixinCountList,list.bindingMobileAccountCountList,list.consumerCountList,list.orderPayedCountList,list.sumOrderPayedList,list.perOrderPriceList,list.associatePurchaseRateList,list.repurchaseRateList);    
    });
}

function overviewHighcharts(timeArr,supplierCount,storeCount,salesCount,supplierDynamicCount,storeDynamicCount,salesDynamicCount,wechatAuthsupplierCount,productSkuCount,productSpuCount,storeOpenCount,storeCloseCount,salesAtJobCount,salesOffJobCount,productSpuDynamicCount,productSkuDynamicCount,accountCount,accountWeixinCount,bindingMobileAccountCount,consumerCount,orderPayedCount,sumOrderPayed,perOrderPrice,associatePurchaseRate,repurchaseRate){
    $('#line-highcharts').highcharts({
        title: {
            text: '',
        },
        xAxis: {
            categories: timeArr
        },
        yAxis: [{
            labels: {
                style: {
                    color: '#89A54E'
                }
            },
            title: {
                text: '',
                style: {
                    color: '#89A54E'
                }
            },
            min:0
        },{
            gridLineWidth: 0,
            title: {
                text: '',
                style: {
                    color: '#AA4643'
                }
            },
            labels: {
                formatter: function() {
                    return this.value.toFixed(2) +'元';
                },
                style: {
                    color: '#AA4643'
                }
            },
            opposite: true,
            min:0
        }],
        tooltip: {
            shared: true
        },
        legend: {
            align: 'center',
            borderWidth: 0
        },
        series: [{
            name: '商户',
            data: supplierCount
        }, {
            name: '门店',
            data: storeCount
        }, {
            name: '导购',
            data: salesCount
        }, {
            name: '动销商户',
            visible:false,
            data: supplierDynamicCount
        }, {
            name: '动销门店',
            visible:false,
            data: storeDynamicCount
        }, {
            name: '动销导购',
            visible:false,
            data: salesDynamicCount
        }, {
            name: '公众号',
            visible:false,
            data: wechatAuthsupplierCount
        }, {
            name: '商品SKU',
            visible:false,
            data: productSkuCount
        }, {
            name: '商品SPU',
            visible:false,
            data: productSpuCount
        }, {
            name: '门店(营业)',
            data: storeOpenCount,
            visible:false
        }, {
            name: '门店(暂停)',
            data: storeCloseCount,
            visible:false
        }, {
            name: '导购(在职)',
            data: salesAtJobCount,
            visible:false
        }, {
            name: '导购(离职)',
            data: salesOffJobCount,
            visible:false
        }, {
            name: '商品SPU(新增动销)',
            data: productSpuDynamicCount,
            visible:false
        }, {
            name: '商品SKU(新增动销)',
            data: productSkuDynamicCount,
            visible:false
        }, {
            name: '用户数',
            data: accountCount,
            visible:false
        }, {
            name: '关注用户数',
            data: accountWeixinCount,
            visible:false
        }, {
            name: '绑定手机用户数',
            data: bindingMobileAccountCount,
            visible:false
        }, {
            name: '消费会员数',
            data: consumerCount,
            visible:false
        }, {
            name: '订单数',
            data: orderPayedCount,
            visible:false
        }, {
            name: '订单额',
            type: 'spline',
            yAxis: 1,
            data: sumOrderPayed,
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: '元'
            }
        }, {
            name: '客单价',
            type: 'spline',
            yAxis: 1,
            data: perOrderPrice,
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: '元'
            },
            visible:false
        }, {
            name: '连带率(总)',
            visible:false,
            data: associatePurchaseRate
        }, {
            name: '复购率(总)',
            visible:false,
            data: repurchaseRate
        }]
    });
}

$('#bar-highcharts').highcharts({
		chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ["交易1笔","交易2笔","交易3笔","交易4比","交易5笔及以上"]
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        series: [{
            name: '人数',
            data: [490, 171, 106, 129, 44]
        }]
});

$("#overviewSet").on("click",function(){
    dialog({
        title:"选择指标",
        id:"util-overviewSet",
        fixed: true,
        content: $("#overviewBox"),
        width:500,
        okValue: '确定',
        cancelValue:'取消',
        backdropOpacity:"0",
        statusbar: '<label class="inline"><input type="checkbox" id="checkAll-dialog" />全部取消</label>',
        ok: function () {}
    }).showModal();
});

$("#overviewBox .inline").on("click",function(e){
    e.preventDefault();
    var seled = $("#overviewBox input[type=checkbox]:checked").length;
    var column = $(this).find("input").data("col");
    if(!$(this).find("input").prop("checked")){
        if(seled > 9){
            Util.alert("最多同时选择10个");
            return false;
        }
        $(this).find("input").prop("checked",true);
        $(".tableMain").find(".col-"+column).css("display","table-cell");
    }else{
        $(this).find("input").prop("checked",false);
        $(".tableMain").find(".col-"+column).hide();
    }
});

$(document).on("click","#checkAll-dialog",function(e){
    e.preventDefault();
    $("#overviewBox input[type=checkbox]").prop("checked",false);
    $(".tableMain .table-column:gt(0)").hide();
});

$(".highcharts .timeSel").on("click",function(e){
    e.preventDefault();
    var startTime = getQsTime(this),endTime = getQsTime(this,"end"),condition = $("#conditionSel").val();
    getChartsData(startTime,endTime,condition);
});

$("#listFilter").on("click",function(){
    var startTime = Util.getUnixTime($("#dateStart").val()),
    endTime = Util.getUnixTime($("#dateEnd").val()),
    condition = $("#conditionSel").val();
    getChartsData(startTime,endTime,condition);
});