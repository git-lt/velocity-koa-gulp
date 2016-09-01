
	$(".btn2").on('click',function(){
			$(this).addClass("btn_on").siblings().removeClass("btn_on");
		})

	$(".selectVal").on('click', '.selValue',function(e){
		$(this).remove();
	})	

/*左侧导航*/
	require(["base","uploader","validate"],function(base,uploader,validate){
		Util.createSecondMenu([
			{"name":"小秘书","url":"notice.htm"},
			{"name":"通知中心","url":"notificate.htm"},
			{"name":"导购咨询","url":"consult.htm"},
			{"name":"官网动态","url":"qiakrNews.htm"},
			{"name":"启动屏设置","url":"bootScreen.htm"},
        	{"name":"客户反馈","url":"feedback.htm"},
        	{"name":"首页弹窗设置","url":"appHomeSet.htm"}
		],"首页弹窗设置");
		
		appHome.init();
	});
	var appHome = {
		init: function(){
			this.pluginInit();
			this.imgUpload();
		},
		pluginInit: function(){
			var _this = this;
			/*日期选择*/
			$("#dateStart").on("click",function(){
				WdatePicker({
			        startDate:'%y-%M-%d 00:00:00',
					dateFmt:'yyyy-MM-dd HH:mm:ss',
					qsEnabled:false					
				});
			});
			$("#dateEnd").on("click",function(){
				WdatePicker({
			        startDate:'%y-%M-%d 23:59:59',
					dateFmt:'yyyy-MM-dd HH:mm:ss',
					qsEnabled:false					
				});
			});
			/*获取token*/
		/*$.post("/xmall/qiniu/getUpToken.json").done(function(res){
			alert(JSON.stringify(res));
			var token = res.uptoken;
			$("#uptoken").val(token);
		})*/
			/*商家搜索*/
			$("#selEvt").on("click",function(){
				dialog({
					id:"supplierList-dia",
					width:700,
					title:'选择商户',
					content:$('#supplierListDiaBox')[0],
					okValue: '确定',
		            cancelValue:'取消',
		            backdropOpacity:"0.5",
		            ok: function(){
		            	var id = $("#supplierListContainer").find("input[name=supplier]:checked").data("id");
		            	var name = $("#supplierListContainer").find("input[name=supplier]:checked").parent().text();
		            	$("input[name=supplierId]").val(id);
		            	if (name!="") {
		            		$(".selectVal").append(" <div class='selValue'>" + name + "<span class='selClose'>x</span></div>");
		            	}		            	
		            },
		            cancel:function(){}
				}).showModal();
				$(".ui-dialog").find("input[name=supplierId]").on("input",function(){
					var id = $(this).val();
					if(!/^\d*$/.test(id)){
						$(this).val(id.substr(0,id.length-1))
					}
				});
			});
			$("#btnSearchSupplier").on("click",function(){
				_this.showSupplierList(0);
			});
		},
		showSupplierList:function(idx){
			var pms = $("#seupplierSearchForm").serializeObject(),
			$tbl = $('#supplierListDiaBox'),
			$tbdBox = $('#supplierListContainer'),
			$pageBox = $('#pageNumBox2');
			pms.index=idx;
			pms.length=20;
			//$tbl.uiLoading('lg');
			$.post("getSupplierByIdAndName.json", pms).done(function(data){
				if(data.status==='0'){
					var listData = data.result.supplierList,
						count = listData.length;
					$('#dataTotal2').text(count);
					if(count>0){
						$tbdBox.html(template('supplierListTpl', {data: listData}));
					}else{
						$tbdBox.html('<p class="p20 c-8 text-center">未查询到相关数据</p>');
						$pageBox.html('');
					}
				}else{
					$tbdBox.html('<p class="p20 text-danger text-center">'+ data.errmsg || '服务器繁忙！'+'</p>');
				}
			})
			.always(function(){
				 //$tbl.uiLoading('lg');
			});    
		},
		imgUpload:function() {
			$("#filePicker").singleImgUploader({
		    resultInput : $("#resultSLoad"),
		    width:1150,
		    height:1920
		});	
		}
	};