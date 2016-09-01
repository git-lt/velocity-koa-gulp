// 页面基础模块 base.js
// AMD & Router CONFIG
require(["mmRouter","avalon"], function() {
    var mainVM = avalon.define({
        $id: "pageRoot",
        oldPage:'',
        currPage: 'dataOverview',
        params: {}, //Url参数
        renderedFn: function(){
            if(mainVM.$model.oldPage!= mainVM.$model.currPage ){
                mainVM.$model.oldPage = mainVM.$model.currPage;

                // 加载相应的模块
                require(['../qiakr/'+mainVM.$model.currPage], function(pageModel){
                    pageModel && pageModel['init'] && pageModel['init']();
                });

                // 选中对应的菜单
            }
        }
    })

    function callback() {
        this.params.page && (mainVM.currPage = this.params.page);
        mainVM.params = this.query;
    }
    avalon.router.get('/:page', callback);
    avalon.history.start({ basepath: "/"});

    avalon.scan();
});

