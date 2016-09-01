define(['utils','momentPicker'],function(utils,datePicker){
	var page = {
		init:function(){
			$("select.select").select2({
				minimumResultsForSearch: -1
			});
			datePicker.init();
			this.searchEv(); //筛选
			this.chkStoreEv(); //选择门店
			this.tabSwitchEv(); 
			this.getStoreList();
			this.showDetail();
			this.getAppointmentList({pagination:true});
			$('#sltStore').on('change',function(){
				page.getSalesListById($(this).val());
			});
		},
		getStoreList:function(){
			$.ajax({
				url:'getStoreList.json'
			}).done(function(data){
				if(data.status && data.status==='0'){
	        		var tArr = [], tData = data.result.storeVoList;
	        		if(tData.length){
	        		    tArr.push({id:'', text:'所有门店'});
	        		    for(i in tData){
	        		        tArr.push({id:tData[i].store.id, text:tData[i].store.name});
	        		    }

	        		    $("#sltStore").select2({
	        		        placeholder: "选择门店",
	        		        data:tArr
	        		    });
	        		    $("#sltSales").select2({
	        		        placeholder: "选择导购",
	        		        data:[]
	        		    });
	        		    
	        		}else{
						$("#sltStore").select2({
						    placeholder: "选择门店",
						    data:[{id:'',text:'暂无数据'}]
						});
						$("#sltSales").select2({
						    placeholder: "选择导购",
						    data:[{id:'',text:'暂无数据'}]
						});
						console.log('门店列表为空');
	        		}
				}else{
					utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
				}
			});
		},
		getSalesListById:function(storeId){
			$.ajax({
				url:'getSalesListOfStore.json',
				data:{storeId:storeId}
			}).done(function(data){
				if(data.status==='0'){
	        		var tArr = [], tData = data.result.salesAdminVoList;
	        		if(tData.length){
	        			tArr.push({id:'', text:'全部'});
	        		    for(i in tData){
	        		        if(tData[i].name){
	        		    		tArr.push({id:tData[i].salesId, text:tData[i].name});
	        		    	}
	        		    }

	        		    $("#sltSales").select2({
	        		        placeholder: "选择导购",
	        		        data:tArr
	        		    });
	        		}else{
						console.log('暂无数据');
	        		}
				}else{
					utils.alert('系统繁忙，请稍后再试');
				}
			});
		},
		chkStoreEv:function(){
			var self = this;
			$('#sltStore').on('change',function(){
				self.getSalesListById($(this).val());
			});
		},
		getAppointmentList:function(options){
			var self = this;
			$("#appointmentListTbd").html('<tr><td colspan="99" class="text-center"><img src="../images/admin/loading.gif" /></td></tr>');
			options = options||{};
			options.index = options.index||0;
			options.length = options.length||utils.listLength;
			$.post('getAppointmentListBySupplierId.json', options,function(data){
				if(data.status === '0'){
					var tplData={
						list:data.result.appointmentList,
						supplierId:$("#supplierId").val()
					}
					if(!tplData.list.length){
						$("#appointmentListTbd").html('<tr><td colspan="99" class="text-center">暂无数据</td></tr>');
						$(".tabs .active .count").html('(0)');
						$('#pagination').pagination({
							totalData:1,
							showData:1
						});
						return;
					}
					var dataHtml = template('appointmentListTpl', tplData);
					$("#appointmentListTbd").empty().append(dataHtml);
					$("#fixedTable").setTheadFixed();
					if(options.pagination){
						$(".tabs .active .count").html('('+data.result.count+')');
						$('#pagination').pagination({
							totalData:data.result.count,
							showData:options.length,
							callback:function(i){
								options.pagination=false;
								options.index=(i-1)*options.length;
								page.getAppointmentList(options);
							}
						});
					}
				}else{
					utils.alert(data.errmsg || '系统繁忙，请稍候重试！');
				}
			});
		},
		searchEv:function(){
			var self = this;
			$('#appointmentlistFilter').on('click', function(){
				var options = $(".search-form-wrap").serializeObject();
				options.arriveTimeFrom = utils.getUnixTime($("#dateStart").val());
				options.arriveTimeTo = utils.getUnixTime($("#dateEnd").val());
				options.pagination = true;
				self.getAppointmentList(options);
			})
		},
		tabSwitchEv:function(){
			$("ul.tabs").tabs(function(el){
				var status = el.data("status");
				$("#orderStatus").val(status).trigger("change");
				page.getAppointmentList({
					status:status,
					pagination:true
				});
			});
		},
		showDetail:function(){
			$("#appointmentListTbd").on("click",".detail",function(e){
				e.preventDefault();
				var detail = $(this).closest("tr").next(".itemDetail");
				if(detail.is(":visible")){
					detail.hide();
					$(this).text("查看详情");
				}else{
					detail.show();
					$(this).text("收起");
				}
			}).on("click",".viewRemark",function(){
				var remark = $(this).data("remark");
				dialog({
			        title:"预约备注",
			        id:"util-remark",
			        fixed: true,
			        content: remark,
			        width:300,
			        cancel: false,
			        okValue: '确定',
			        backdropOpacity:"0.5",
			        ok: function () {
			            
			        }
			    }).showModal();
			});
		}
	}
	return {
		init:function(){
			page.init();
		}
	};

});
