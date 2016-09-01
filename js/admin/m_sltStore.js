/**
 * [选择门店模块]
 * deps: dialog toastr 
 */
define(['utils'], function(){
	var CONF = {
		apiGetStoreList:'getStoreListOfSupplier.json',
		diaStoresTplId:'diaSltStore_tpl',
		itemChekboxTplId:'sltStoreListChk_tpl',
		itemRadioTplId:'sltStoreListRad_tpl',
		resItemsTplId:'sltStoreRes_tpl'
	};

	var SltStore = function(opt){
		this.apiGetStoreList = opt.apiGetStoreList;
		this.storeData = null;
		this.chkData = null;
		this.dia = null;
		this.$wrap = null;
		this.$chkAll=null;
		this.$listBox=null;
		this.$pageNav = null;
		this.$resBox=null;
		this.o = opt;
		this.boxid = Math.random().toString(16).substring(5);

		this.init();
	}
	SltStore.prototype = {
		constructor:SltStore,
		init:function(){
			this.createWrap();
			this.getStoreData();
			this.bindEvs();
		},
		createWrap:function(){
			this.$wrap = $(template(CONF['diaStoresTplId'], {boxid:this.boxid})).appendTo('body');
			this.$chkAll = $('#all-'+this.boxid);
			this.$listBox = $('#list-'+this.boxid);
			this.$pageNav = $('#page-'+this.boxid);
			this.$resBox = $('#res-'+this.boxid);
		},
		getStoreData:function(){
			var opt = this.o, self = this;
			var pms = {
				index:0,
				length:opt.pageCount,
				open:0,
				keywords:$.trim($('').val()),
			};

			$.post(CONF.apiGetStoreList, pms)
			.done(function(data){
				if(data.status==='0'){
					var count = data.result.count;
					var listData = data.result.storeAdminVoList;
					if(count>0){
						self.$listBox.html(template(CONF['itemChekboxTplId'], {data:listData}));
					}else{
						self.$listBox.html('<p class="p15 text-right text-muted">暂无数据</p>');
					}
				}else{
					toastr.error(data.errmsg || ERRMSG['100']);
				}
			})
			.fail(function(){

			});
		},
		getData:function(){
			return this.chkData;
		},
		getChkData:function(){
			return this.chkData;
		},
		bindEvs:function(){
			// searchEv
			// pageEv
			// chkEv
			// chkAllEv
		},
		show:function(){
			var o = this.o, self = this;

			this.dia = dialog({
				title:o.diaTit,
				padding:0,
				content:self.$wrap[0],
				okValue:'确定',
				ok:function(){},
				cancelValue:'取消',
				cancel:function(){ },
				onshow:function(){ }
			}).width(750).showModal();
		},
		hide:function(){
			this.dia && this.dia.close();
		}
	}

	$.sltStore = function(opt){
		opt = $.extend({},$.sltStore.defaults, opt || {});
		return new SltStore(opt);
	}

	$.sltStore.defaults = {
		itemTpl:'',
		diaTit:'选择门店',
		pageCount:30, //每页显示30条
		multi:true, 	//是否是多选
		chkBefore:function(){},
		chkAfter:function(){},
		okFn:function(){},
		cancelFn:function(){}
	};

});