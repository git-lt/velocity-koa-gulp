define(['utils','mmRouter'], function(){
	Utils.mainMenuChk('store_manage');
	var CONF, pageVM, page;
	mainVM = avalon.define({
	  $id: "rootCtr",
	  oldPage: '',
	  currPage: 'storeGroupSet',
	  subPage:'',
	  params: {}, //Url参数
	  renderedFn: function(){
	  	  // $('#wrapper').uiLoading();
	      if(mainVM.$model.oldPage!= mainVM.$model.currPage ){
	        mainVM.$model.oldPage = mainVM.$model.currPage;

	        // 加载相应的模块
	        require(['./admin/'+mainVM.$model.currPage], function(pageModel){
	            pageModel && pageModel['init'] && pageModel['init']();
	        });

	        //选中对应的菜单
	        $('#sidebar-menu .active').removeClass('active');
	        $('#sidebar-menu').find('[href*=storeGroup]').addClass('active');
	      }
	  }
	});

	page = {
		init:function(){
			this.initRouter();
			this.logoutEv();
			this.initTab();
		},
		initRouter:function(){
			function callback() {
				// $('#wrapper').uiLoading();
			    this.params.page && (mainVM.currPage = this.params.page);
			    mainVM.params = this.query;
			    mainVM.subPage = this.query.subPage || '';
			}
			avalon.router.get('/', function(){
				avalon.router.navigate('/storeGroupSet');
			});
			avalon.router.get('/:page', callback);
			avalon.history.start({ basepath: "/"});
			avalon.scan();
		},
		initTab:function(){
			$('#decTabBox').navTab();
			var url=window.location.hash;
			if(url=='#!/storeGroupSet'){
				$('#decTabBox li:first a').trigger('click');
			}else if(url=='#!/storeGroupClassify'){
				$('#decTabBox li:eq(1) a').trigger('click');
			}else if(url=='#!/storeGroupList'){
				$('#decTabBox li:eq(2) a').trigger('click');
			}
		},
		logoutEv:function(){
			$('#qkLogout').on('click',function(){
				$.post(GLOBAL_CONFIG.host+'logout.json',function(data){
					if(data.status==='0'){
						window.location.href="index.htm";
					}
				});
			});
		}
	};

	return {
		init:function(){
			page.init();
		}
	}
});