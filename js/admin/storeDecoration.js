define(['utils','mmRouter'], function(){
	var CONF, pageVM, page;
	mainVM = avalon.define({
		$id: "rootCtr",
	  oldPage: '',
	  currPage: 'decoration_main',
	  subPage:'',
	  params: {}, //Url参数
	  renderedFn: function(){
	      if(mainVM.$model.oldPage!= mainVM.$model.currPage ){
	        mainVM.$model.oldPage = mainVM.$model.currPage;

	        // 加载相应的模块
	        require(['./admin/'+mainVM.$model.currPage], function(pageModel){
	            pageModel && pageModel['init'] && pageModel['init']();
	        });

	        //选中对应的菜单
	        $('#sidebar-menu .active').removeClass('active');
	        p = mainVM.$model.currPage;
	        if(mainVM.$model.currPage.indexOf('_')!=-1) p = p.split('_')[0];
	        $('#sidebar-menu').find('[href*='+p+']').addClass('active');
	      }
	  }
	});

	page = {
		init:function(){
			this.initRouter();
			this.logoutEv();
		},
		initRouter:function(){
			function callback() {
		    this.params.page && (mainVM.currPage = this.params.page);
		    mainVM.params = this.query;
		    mainVM.subPage = this.query.subPage || '';
			}
			avalon.router.get('/', function(){
				avalon.router.navigate('/decoration_main');
			});
			avalon.router.get('/:page', callback);
			avalon.history.start({ basepath: "/"});
			avalon.scan();
		},
		logoutEv:function(){
			$('#qkLogout').on('click',function(){
				$.post(GLOBAL_CONFIG.host+'logout.json',function(data){
					if(data.status==='0'){
						window.location.href="index.htm";
					}
				});
			})
		}
	};

	return {
		init:function(){
			page.init();
		}
	}
});