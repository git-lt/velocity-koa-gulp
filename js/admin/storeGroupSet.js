define(['utils'],function(utils){
	var CONFIG, page, suid = $("#g_supplierId").val();

	CONFIG = {
		apiGetStore: 'getStoreInsulate.json',
		apiSaveStore: 'saveStoreInsulate.json'
	};

	page={
		init:function(){
			$(".select2").select2();
			$(".select2s").select2({
			    minimumResultsForSearch: -1
			});
			this.tipEv();  //帮助说明
			this.openEv(); //门店隔离开启
			this.saveEv(); //保存

			this.getStore();
		},
		tipEv:function(){
			$("#tipOne").on("click",function(){
				var d = dialog({
					title: '区域门店隔离说明',
					content: '开启后，若顾客绑定了某门店导购，用户进入“所有门店”页面时，只会看到该门店所属区域的门店列表，不会看到其他区域。<br>使用该功能前，请先建立区域分组，所有门店必须有一个所在分组。<br><br>示例：<br>1. 顾客绑定了门店A的导购A，门店F的导购B；<br>门店A所属区域下门店为门店A、门店B、门店C；<br>门店F所属区域下门店为门店F、门店G、门店H；<br>则该消费者进入“所有门店”，看到的门店为门店A、门店B、门店C、门店F、门店G、门店H，无法看到其他门店。<br>2. 顾客未绑定任何导购，则根据当前离消费者最近的门店，显示该门店所有的区域门店列表。<br>示例：<br>消费者未绑定任何导购，进入“所有门店”列表，距离最近门店为A，门店A所属区域下门店为门店A、门店B、门店C；<br>则消费者看到的门店为门店A、门店B、门店C；',
					okValue: '确定',
					ok:function(){}
				});
				d.showModal();
			})
			$("#tipTwo").on("click",function(){
				var d = dialog({
					title: '什么是门店隔离半径',
					content: '示例：<br>根据当前用户位置，3公里内有一家门店区域分组A门店，5公里内有一家门店区域分组B门店。<br>若设置未绑定导购用户选项为“门店隔离半径内，最近一个门店所属的区域门店；无则不显示”<br>当设置隔离半径为2公里时，该未绑定用户无法看到任何门店当设置隔离半径为4公里时，该未绑定用户可看到区域分组A下所有门店。<br>当设置隔离半径为6公里时，该未绑定用户可看到区域分组A和区域分组B下所有门店。',
					okValue: '确定',
					ok:function(){}
				});
				d.showModal();
			})
			$("#tipThr").on("click",function(){
				var d = dialog({
					title: '如何设置直营店/旗舰店',
					content: '进入“门店管理”，编辑门店选择“门店类型”。',
					okValue: '确定',
					ok:function(){}
				});
				d.showModal();
			})
		},
		openEv:function(){
			$("#freeType").on("change",function(){
				var open = $(this).val();
				if(open=="1"){
					$(".mainUlLi").removeClass("hide");
				}else{
					$(".mainUlLi").addClass("hide");
				}
			});
		},
		saveEv:function(){
			var _this=this;
			$("#save").on("click",function(){
				var open = $("#freeType").val();
				if(open=='0'){
					_this.saveStore()
						.done(function(data){
							if(data.status=="0"){
								utils.alert('保存成功',function(){
									location.reload()
								});
							}else{
								toastr.error(data.errmsg || "系统繁忙，请稍后再试");
							}
						})
						.fail(function(){
							toastr.error("系统繁忙，请稍后再试");
						});
				} else {
					var radius=$("#radius").val();
					if(radius>1000){
						$("#radius").val(1000);
					}
					if(radius!=0){
						var reg=/^\d+$/;
				        if(reg.test(radius)==true){
				        	_this.saveStore()
								.done(function(data){
									if(data.status=="0"){
										utils.alert('保存成功');
									}else{
										toastr.error(data.errmsg || "系统繁忙，请稍后再试");
									}
								})
								.fail(function(){
									toastr.error("系统繁忙，请稍后再试");
								});
				        }else{
				        	utils.alert("请输入整数")
				        }
					}else{
						utils.alert("请输入门店隔离半径")
					}
				}	
			})
		},
		saveStore:function(){
			var pms = {
				id: $("#radius").data("id"),
				open: $("#freeType").val(),
				radius: $("#radius").val(),
				supplierId: suid,
				unbindStrategy: $("#unbindStrategy").val()
			}

			return $.post(CONFIG.apiSaveStore, pms);
		},
		getStore:function(){
			var _this=this;
			var options = {
				supplierId: suid
	    	};
			$.post(CONFIG.apiGetStore, options, function(data){
	    		if (data.status==='0'){
	    			if(data.result.storeInsulate!=null&&data.result.storeInsulate!=''){
	    				var id=data.result.storeInsulate.id;
	    				var radius=data.result.storeInsulate.radius;
	    				var open=data.result.storeInsulate.open;
	    				var unbindStrategy=data.result.storeInsulate.unbindStrategy;
	    				$("#radius").val(radius)
		    			$("#radius").data("id",id);
		    			if(open=="1"){
							$(".mainUlLi").removeClass("hide");
							$("#freeType").val(open).trigger('change');
							$("#unbindStrategy").val(unbindStrategy).trigger('change');
						}else if(open=="0"){
							$(".mainUlLi").addClass("hide");
						}
	    			}
	    		}else {
	    			toastr.error(data.errmsg || '服务器繁忙，请稍后重试。')
	    		};	
	    	})
		}
	}


	return {
		init:function(){
			page.init();
		}
	}
});
