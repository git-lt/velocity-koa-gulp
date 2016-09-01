define(['utils'],function(utils){
	var CONFIG, page, suid = $("#g_supplierId").val();
	CONFIG = {
		apiAddGroup: 'addStoreInsulateGroup.json',
		apilistStore: 'listStoreInsulateGroupBySupplierId.json',
		apideleteStore: 'deleteStoreInsulateGroup.json',
		apiupdataStore: 'updateStoreInsulateGroup.json'
	};

	page={
		init:function(){
			this.newZengEv(); //新增区域分组
			this.DeleteEv();  //删除分组
			this.EditEv();    //编辑分组

			this.getGroupList(); //
		},
		newZengEv:function(){
			var _this = this;
	    	$("#addNewStock").on("click",function(){
	    		dialog({
				    title: '新增区域分组',
			        fixed: true,
				    content: template('addNewStockBox'),
			        width:400,
				    okValue: '确定',
			        backdropOpacity:"0.4",
				    ok: function (e) {
				    	var addName=$(".add").val();
					    _this.saveGroup()
						    .done(function(data){
						    	if(data.status==='0'){
						    		var tr='<tr><td>'+addName+'</td><td>0</td><td><a href="javascript:;" class="edit-group">编辑</a>&nbsp;-&nbsp;<a href="javascript:;" class="del-group">删除</a></td></tr>';
						    		$('#mainTable').append(tr);
						    		toastr.success("添加成功");
						    	}else{
						    		toastr.error(data.errmsg || "系统繁忙，请稍后再试")
						    	}
						    })
						    .fail(function(){
						    	toastr.error("系统繁忙，请稍后再试");
						    });
				    },
				    cancelValue: '取消',
				    cancel: function () {}
				}).showModal();
		    });
	    },
	    DeleteEv:function(){
	    	$("#mainTable").on("click",".del-group",function(){
	    		var that=this;
	    		var id = $(that).data('id');
	    		dialog({
	    			fixed: true,
	    			content: '<div style="text-align:center;font-size:16px;font-weight:bold">是否确认删除？</div>',
	    			width:200,
	    			okValue: '确定',
	    			cancelValue:'取消',
	    			backdropOpacity:"0.3",
	    			ok: function (data) {
	    				$.getJSON("deleteStoreInsulateGroup.json?groupId="+id,function(data){
	    					if(data.status=="0"){
	    						var val=$(that).closest("tr").children("td[class=groupNum]").text();
	    						if(val!=0){
	    							utils.alert('<strong style="font-size:14px">无法删除</strong><br>当前区域分组已经包含了门店，请将门店修改为其它区域分组后，再删除。');
	    						}else{
	    							$(that).closest("tr").remove();
	    							toastr.success(data.errmsg ? data.errmsg : "删除成功");
	    						}
	    					}else{
	    						toastr.error(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
	    					}
	    				});
	    			},
	    			cancel: function () {}
	    		}).showModal();
			});
	    },
	    EditEv:function(){
	    	var _this = this;
	    	$("#mainTable").on("click",".add-group",function(){
	    		var id = $(this).data('id');
	    		var nameTd = $(this).closest("tr").children("td[class=groupName]");
	    		var con=nameTd.text();

	    		dialog({
	    			title: '编辑区域分组',
			        fixed: true,
				    content: template('addNewStockBox1'),
			        width:400,
				    okValue: '确定',
			        backdropOpacity:"0.3",
			        onshow:function(){
			        	$(".add1").val(con);
			        },
	    			ok: function () {
	    				var options = {
				    		id: id,
							name: $(".add1").val(),
							supplierId: suid
				    	};
	    				$.post(CONFIG.apiupdataStore, options, function(data){
	    					if(data.status=="0"){
	    						toastr.success(data.errmsg ? data.errmsg : "修改成功");
	    						nameTd.html(options.name);
	    					}else{
	    						toastr.error(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
	    					}
	    				});
	    			},
				    cancelValue: '取消',
	    			cancel: function () {}
	    		}).showModal(); 
			});
	    },
	    saveGroup:function(){
	    	var pms = {
    			name: $(".add").val(),
    			supplierId: suid
	    	}

	    	return $.post(CONFIG.apiAddGroup, pms);
	    },
	    getGroupList:function(index, length, supplierId){
	    	var options = {
	    		index: 0,
				length: utils.listLength,
				supplierId: suid
	    	}
	    	$.post(CONFIG.apilistStore, options, function(data){
	    		if (data.status==='0'){
	    			var count=data.result.count;
	    			if(count>0){
	    				$('#supplierList').html(template('add', data.result));
	    				$('#pagination').pagination({
	    					totalData:data.result.count,
	    					showData:utils.listLength,
	    					callback:function(i){
	    						options.index=(i-1)*options.length;
	    						$.post(CONFIG.apilistStore, options, function(data){
	    							$('#supplierList').html(template('add', data.result));
	    						})
	    					}
	    				});
	    			}
	    		}else {
	    			toastr.error(data.errmsg || '服务器繁忙，请稍后重试。')
	    		};	
	    	})
	    }
	};

	return {
		init:function(){
			page.init();
		}
	}
});

