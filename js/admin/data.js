define(['toastr', 'moment', "utils","mmRouter"], function(toastr,moment) {
    document.title="洽客-数据";
    avalon.filters.rate = function(v){
        if(v === null) return '0.0%';
        if(v === 1) return '100%';
        var num= avalon.filters.number(v)*100;
        return avalon.filters.number(num, 1)+'%';
    }

    var mainVM = avalon.define({
        $id: "pageRoot",
        oldPage:'',
        currPage: 'dataOverview',
        tabName:'',
        params: {}, //Url参数
        datepickerOpt:{
            timePickerIncrement: 1,
            timePicker12Hour:false,
            startDate: moment().subtract(30,'days').format('YYYY-M-D'),
            endDate: moment().subtract(1,'days').format('YYYY-M-D 23:59:59'),
            opens: 'right',
            ranges: {
               '今日': [moment().format('YYYY-M-D 00:00:00'), moment().format('YYYY-M-D HH:mm:ss')],
               '昨日': [moment().subtract(1,'days').format('YYYY-M-D 00:00:00'), moment().subtract(1,'days').format('YYYY-M-D 23:59:59')],
               '最近 7 天': [moment().subtract(7,'days').format('YYYY-M-D 00:00:00'), moment().subtract(1,'days').format('YYYY-M-D 23:59:59')],
               '最近 30 天': [moment().subtract(30,'days').format('YYYY-M-D 00:00:00'), moment().subtract(1,'days').format('YYYY-M-D 23:59:59')]
            }
        },
        renderedFn: function(){
            if(mainVM.$model.oldPage!= mainVM.$model.currPage ){
                mainVM.$model.oldPage = mainVM.$model.currPage;
                if(mainVM.$model.currPage == "dataOfSupplier"){
                    $("#supplierSelectBar").hide();
                }else{
                    $("#supplierSelectBar").show().find("#supplierSelect").val("").trigger("change");
                }

                // 加载相应的模块
                require(['../js/admin/'+mainVM.$model.currPage], function(pageModel){
                    pageModel && pageModel['init'] && pageModel['init']();
                    $('[data-toggle="tooltip"]').tooltip();
                });

                //选中对应的菜单
                $('#main-menu').find('[href*='+mainVM.$model.currPage+']').parent().addClass('active').siblings().removeClass('active');
            }
        }
    })

//=== Router CONFIG
    function callback() {
        this.params.page && (mainVM.currPage = this.params.page);
        mainVM.params = this.query;
        mainVM.tabName = this.query.tab || '';
    }
    avalon.router.get('/:page', callback);
    avalon.history.start({ basepath: "/"});
    window.mainVM = mainVM;

    toastr.options=global_conf.toastrOpt;

//=== PageInit
    mainPage = {
        init:function(){
            this.ajaxSetup();
            this.getZhimaInfo();
            this.logoutEv();
            this.bindEv();
        },
        ajaxSetup:function(){
            $.ajaxSetup({
        　　　　error: function (xhr, status, e) { //请求失败遇到异常触发
                    toastr.warning('请求数据失败，服务器繁忙 :('); 
                }
            });
        },
        getZhimaInfo: function(){
            $.post('getZhimaGroupList.json?index=0&length=999').done(function(data){
                if(data.status==='0'){
                    if(data.result.count){
                        var d = data.result.zhimaGroupList;
                        global_conf.zhimaGroupInfo = data.result.zhimaGroupList;
                        $('.menuZhima').show();
                    }
                }else{
                    // toastr.warning(data.errmsg || '获取芝麻设备信息失败！');
                }
            });
        },
        logoutEv:function(){
            $("#qkLogout").on("click",function(e){
                $.getJSON("../logout.json",function(data){
                    location.href="index.htm";
                });
                e.preventDefault();
            });
        },
        bindEv:function(){
            $("#bs-navbar .nav li[name=data_view]").addClass("active");
    
            if($('.setList').length > 0){
                $(".tableList").parent().remove();
                $("#commonSetting").click(function(e){
                    $(this).toggleClass("ac");
                    $(".setList").slideToggle(150);
                });
                $(document).on("click",function(e){
                    if(!$(e.target).hasClass("setting")){
                        $(".setList").hide();
                    }
                })
                $(".header .out").on("click",function(e){
                    e.preventDefault();
                    $.getJSON("../logout.json",function(data){
                        location.href="index.htm";
                    });
                });
            }
        }
    };

    return {
        init:function(){
            mainPage.init();
            avalon.scan();
        }
    }
});