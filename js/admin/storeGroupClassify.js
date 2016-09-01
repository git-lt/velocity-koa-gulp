define(['utils','location'],function(utils){
	var CONFIG, page, suid = $("#g_supplierId").val();

	CONFIG = {
		apiEditList: 'insulateStoreList.json',
		apilistStore: 'listStoreInsulateGroupBySupplierId.json',
		apiupdate: 'updateStoreInsulateGroupId.json'
	};

	page={
		init:function(){
			$("#groupId").select2({minimumResultsForSearch: -1});
			this.location();
			this.editGroupEv();     //编辑
			this.checkAllEv(); 		//批量选择
			this.searchEv();   		//搜索

			this.getStoreList();
			this.selectGroup();
		},
		location:function(){
			Location.prototype.fillOptionAll	= function(el_id , loc_id , selected_id) {
				var el	= $('#'+el_id); 
				var json	= this.find(loc_id); 
				if (json) {
					var option='<option value="">全部</option>';
					$.each(json , function(k , v) {
						option	+= '<option value="'+k+'">'+v+'</option>';
					});
					el.append(option);
				}else{
					var idArr = loc_id.split(",");
					var townId = idArr[2];
					idArr.length=2;
					var cityId = idArr.join(",");
					var townName = this.items[cityId][townId];
					el.append('<option value="'+townId+'">'+townName+'</option>');
				}
			};
			var loc = new Location();
			var title   = ['省份' , '地级市' , '市、县、区'];
			$.each(title , function(k , v) {
				title[k]    = '<option value="">'+v+'</option>';
			});
			$('#loc_province').append(title[0]);
			$('#loc_city').append(title[1]);
			$('#loc_town').append(title[2]);
			loc.fillOption('loc_province' , '0');
			$("#loc_province,#loc_city,#loc_town").select2();


			$('#loc_province').change(function() {
				$('#loc_city').empty();
				if($(this).val()){
					loc.fillOptionAll('loc_city' , '0,'+$('#loc_province').val());
					$('input[name=province]').val($(this).find("option:selected").text());
					$('#loc_city').change();
				}else{
					$('input[name=province],input[name=city],input[name=district]').val("");
					$('#loc_city').html(title[1]).change();
					$('#loc_town').html(title[2]).change();
				}
			});
			$('#loc_city').change(function() {
				$('#loc_town').empty();
				if($(this).val()){
					loc.fillOptionAll('loc_town' , '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
					$('input[name=city]').val($(this).find("option:selected").text());
				}else{
					$('#loc_town').html(title[2]);
				}
				$('#loc_town').change();
			});
			$('#loc_town').change(function() {
				$('input[name=district]').val($(this).find("option:selected").text());
			});
		},
		editGroupEv:function(){
			var _this=this;
			//编辑门店区域分组
			$("#editList").on("click",".editGroup",function(data){
				$("body").find("input").prop("checked",false);
				$('#editList tr').toggleClass('active', false);
				var that=this;
				var _t=$(that).closest("tr");
				_t.find("input").prop("checked",true);
				_t.find("input").toggleClass('active', true);
				var con=_t.find("span[class=editStoreName]").text();
				var editGroupeName=_t.find("span[class=editGroupeName]").data('id');
		
				var d = dialog({
					title: '编辑门店区域分组',
					content: template('pop'),
				    okValue: '确定',
				    onshow:function(){
						$("#storeNameId").select2({minimumResultsForSearch: -1});
						$("#con").text(con);

						var options = {
				    		index: 0,
							length: utils.listLength,
							supplierId: suid
				    	};
				    	$.post(CONFIG.apilistStore, options, function(data){
				    		var list = data.result.list;
				    		var storeId=$("#storeNameId");
							for(var i=0;i<list.length;i++){
								name="<option value="+list[i].storeInsulateGroup.id+">"+list[i].storeInsulateGroup.name+"</option>";
								$(name).appendTo(storeId);
							};
							$("#storeNameId").val(editGroupeName).trigger('change');
				    	});
				    },
					ok: function () {
						var insulateGroupId=$("#storeNameId").val();
						var storeIdArray=_t.find("span[class=editGroupeName]").data('sid');
						var storeNameId=$("#storeNameId").select2('data').text;

						var options = {
							insulateGroupId: insulateGroupId,
							storeIdArray: storeIdArray
						};
						$.post(CONFIG.apiupdate, options, function(data){
							if(data.status=="0"){
								toastr.success(data.errmsg ? data.errmsg : "编辑成功");
								_t.find("span[class=editGroupeName]").text(storeNameId).data('id',insulateGroupId);
							}else {
				    			toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
				    		};
						});
						_t.find("input").prop("checked",false);
					},
					cancelValue: '取消',
					cancel: function () {
						_t.find("input").prop("checked",false);
					}
				});
				d.showModal();
			});
			//批量编辑
			$("#set").on("click",function(){
				var check = $("#editList").find("input[type='checkbox']:checked");
				var that=$("#editList .editGroup");
				if(check.length === 0){
					utils.alert("请至少选择一个门店");
				}else{
					var d = dialog({
						title: '批量编辑门店区域分组',
						content: template('popTow'),
						okValue: '确定',
						onshow: function(){
							var count= $("#editList").find("input[type='checkbox']:checked").length;
							$("#count").text(count);
							$("#editId").select2({minimumResultsForSearch: -1});
							var options = {
								index: 0,
								length: utils.listLength,
								supplierId: suid
							};
							$.post(CONFIG.apilistStore, options, function(data){
								var list = data.result.list;
								var editId=$("#editId");
								for(var i=0;i<list.length;i++){
									name="<option value="+list[i].storeInsulateGroup.id+">"+list[i].storeInsulateGroup.name+"</option>";
									$(name).appendTo(editId);
								};
								var a=$(".editGroup").closest("tr").find("span[class=editGroupeName]").data('id');
								$("#editId").val(a).trigger('change');
							});
						},
						ok: function () {
							var insulateGroupId=$("#editId").val();
							var tr=$(".editGroupeName");
							var sid=[];
							for (var i = 0; i < tr.length; i++) {
								var checkok=tr.eq(i).closest("tr").find("input[name=select]");
								if(checkok.is(':checked')){
									sid.push(tr.eq(i).data('sid'));
								}
							}
							var storeIdArray = sid.join(',');
							var options = {
								insulateGroupId: insulateGroupId,
								storeIdArray: storeIdArray
							};

							var a=$("#editId").select2('data').text;

							$.post(CONFIG.apiupdate, options, function(data){
								if(data.status=="0"){
									toastr.success(data.errmsg ? data.errmsg : "编辑成功");
									var checkone=$("#editList tr").find("input[name=select]");
									if(checkone.is(':checked')){
										$("#editList tr").find("span[class=editGroupeName]").text(a);
									}
									_this.getStoreList();
								}else {
									toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
								};
							});
							$(that).closest("tr").find("input").prop("checked",false);
						},
						cancelValue: '取消',
						cancel: function () {
							$(that).closest("tr").find("input").prop("checked",false);
						}
					});
					d.showModal();
				}
			});
		},
		checkAllEv:function(){
			$("#checkAll").on("click",function(){
				var checkedList = $("#editList").find("input[name=select]");
				if(checkedList.not(":checked").length > 0){
					checkedList.prop("checked",true);
					$('#editList tr').toggleClass('active', true);
				}else{
					checkedList.prop("checked",false);
					$('#editList tr').toggleClass('active', false);
				}
			});
			$("#editList").on("click","tr",function(){
				var _this=$(this);
				_this.toggleClass('active');
				_this.find("input[name=select]").prop("checked",_this.hasClass('active'));
			});
		},
		getStoreList:function(){
			var _this=this;
			var province= $("#loc_province").select2('data').text;
			var city= $("#loc_city").select2('data').text;
			var district= $("#loc_town").select2('data').text;

			province = province ==='省份'?'':province;
			city = (city==='地级市'||city==='全部')?'':city;
			district = (district==='市、县、区'||district==='全部')?'':district;

	    	var options = {
	    		province:province,
				city: city,
				district: district,
				groupId: $("#groupId").val(),
				storeName: $("#storeName").val(),
				supplierId: suid,
				index:0,
				length:utils.listLength
	    	};
	    	
	    	$.post(CONFIG.apiEditList, options, function(data){
	    		if (data.status==='0'){
	    			var count=data.result.count;
	    			$('#editList').html(template('edit', data.result));
	    			if(count===0){
	    				$("#editList").html(template('no'));
		    			$('#pagination').pagination({
		    				totalData:0,
		    				showData:0
		    			});
	    			}else{
	    				$('#pagination').pagination({
	    				totalData:data.result.count,
	    				showData:utils.listLength,
	    				callback:function(i){
	    					options.index=(i-1)*options.length;
	    					$.post(CONFIG.apiEditList, options, function(data){
	    						$('#editList').html(template('edit', data.result));
	    					});
	    				}
	    			});
	    			}
	    		}else {
	    			toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
	    		};
	    		if(!data.result.list.length){
	    			$("#editList").html(template('no'));
	    			$('#pagination').pagination({
	    				totalData:0,
	    				showData:0
	    			});
	    		}
	    	})
	    },
	    searchEv:function(){
	    	var _this=this;
	    	$("#searchBtn").on("click",function(e){
	    		e.preventDefault();
	    		_this.getStoreList();
	    	});
	    },
		selectGroup:function(){
			var options = {
	    		index: 0,
				length: utils.listLength,
				supplierId: suid
	    	};
	    	$.post(CONFIG.apilistStore, options, function(data){
	    		var list = data.result.list;
	    		var groupId=$("#groupId");
				for(var i=0;i<list.length;i++){
					name="<option value="+list[i].storeInsulateGroup.id+">"+list[i].storeInsulateGroup.name+"</option>";
					$(name).appendTo(groupId);				
				};
	    	});
		}
	};
	return {
		init:function(){
			page.init();
		}
	}
});