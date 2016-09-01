require(["base"],function(){
    var menuCurrent = "main";
    document.title="洽客-导购数据"; 
    Util.createSecondMenu([
        {"name":"平台数据","url":"main.htm"},
        {"name":"零售商","url":"dataListOfSupplier.htm"},
        {"name":"导购","url":"dataListOfSales.htm"}
    ],"导购");
    // getAjaxData((new Date().getTime()-86400000*30),new Date().getTime(),0);
    getAjaxData("","",0);

    function getAjaxData(start,end,idx){
    	// p_customerList.o.cacheVipSalesData.length=0;
    	$(".table tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
    	var param={
    		startTime:start,
    		endTime:end,
    		index:idx,
    		length:Util.listLength
    	};
    	jQuery.getJSON("salesOverview.json",param,function(data){
    		var tempData={
    			list:data.accumulatedSalesDataVos
    		};
    		var dataHtml = template('tempData', tempData);
    		$(".table tbody").html(dataHtml);
            showColumn();
    		Util.createPagination(data.countTotoal,idx,$(".pagination"),function(_i){
                getAjaxData(start,end,_i);
    		});
    	});
    }
    function showColumn(){
        $("#supplierList tr").find("td,th").hide();
        $("#overviewBox input[type=checkbox]:checked").each(function(i,e){
            var column = $(this).data("col");
            var col = $("#supplierList").find("th[data-col="+column+"]").show().index();
            $("#supplierList tr").find("td:eq("+col+")").show();
        });
    }

    $("#selectData").on("click",function(e){
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
            ok: showColumn
        }).showModal();
    });
    $("#overviewBox .inline").on("click",function(e){
        e.preventDefault();
        var seled = $("#overviewBox input[type=checkbox]:checked").length;
        // var column = $(this).find("input").data("col");
        if(!$(this).find("input").prop("checked")){
            if(seled > 9){
                Util.alert("最多同时选择10个");
                return false;
            }
            $(this).find("input").prop("checked",true);
        }else{
            $(this).find("input").prop("checked",false);
            
        }
    });

    $(document).on("click","#checkAll-dialog",function(e){
        e.preventDefault();
        $("#overviewBox input[type=checkbox]").prop("checked",false);
    });

    $("#dateStart").on("click",function(){
    	WdatePicker({
            startDate:'%y-%M-%d 00:00:00',
    		dateFmt:'yyyy-MM-dd HH:mm:ss',
    		qsEnabled:false,
    		maxDate:'%y-%M-%d',
    		minDate:'#F{$dp.$D(\'dateEnd\',{M:-3});}'
    	});
    });
    $("#dateEnd").on("click",function(){
    	WdatePicker({
            startDate:'%y-%M-%d 23:59:59',
    		dateFmt:'yyyy-MM-dd HH:mm:ss',
    		qsEnabled:false,
    		maxDate: $("#dateStart").val() ? '#F{$dp.$D(\'dateStart\',{M:3})}' : '%y-%M-%d',
    		minDate:'#F{$dp.$D(\'dateStart\');}'
    	});
    });

    $(".supplierFilter .timeSel").on("click",function(e){
        $(this).addClass("current").siblings().removeClass("current");
        var startTime = getQsTime(this),endTime = getQsTime(this,"end");
        getAjaxData(startTime,endTime,0);
    });
    $("#searchData").on("click",function(e){
        var startTime = Util.getUnixTime($("#dateStart").val()),endTime = Util.getUnixTime($("#dateEnd").val());
        getAjaxData(startTime,endTime,0);
    });
});