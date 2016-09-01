define(['utils'],function(utils){
	document.title = "自定义标签";
	template.helper('codeIsNull', function(date){
		return !/^null$/.test(date)? date: '/';
	});
	var ajaxURL = {
		list: 'querySelfGroupList.json',
		add: 'addSelfGroup.json',
		edit: 'updateSelfGroup.json',
		del: 'deleteSelfGroup.json',
		move: 'moveGroup.json',
		querySupplier: 'querySupplierStock.json',
		changeGroup: 'updateProductGroup.json',
		changeAllGroup: 'batchUpdateProductGroup.json',
		queryGroup: 'queryGroupOfProduct.json',
		setConfig: 'updateSupplierDisplayType.json',
		getConfig: 'getSupplierDisplayType.json'
	},
	p_cusCategory = {
		init: function(){
			$('select[name="categoryFilter"]').select2({ minimumResultsForSearch: -1 });
			this.tabsContentSwitch();
			this.groupListRender();
			this.allViewSwitch();
			this.getGroupSelect();
		},
		tabsContentSwitch: function(){
			$("ul.tabs").tabs(function(el){
				var a_id = el.data("id"),
				selor = {
					custom: '#custom',
					category: '#category,#categoryCot',
					cateSet: '#cateSet'
				};
				selor.all = selor.custom+','+selor.category+','+selor.cateSet;
				$(selor.all).addClass('dn');
				$(selor[a_id]).removeClass('dn');
			});
			// set up mobile webpage display configuration
			var selectSetConfig = $('#cateSet select:eq(0)');
			$('#cateSet .btn:eq(0)').on('click',function(){
				var type = selectSetConfig.find('option:selected').val();
				$.post(ajaxURL.setConfig, {displayType: type}, function(data){
					if (data.status=== "0"){
						p_cusCategory.ajaxError('设置成功');
					}else toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
				});
			});
			$.post(ajaxURL.getConfig, function(data){
				if(data.status=== "0") selectSetConfig.find('option[value="'+ data.displayType+ '"]').prop('selected', true);
				selectSetConfig.select2({ minimumResultsForSearch: -1 });
			});
		},
		groupListRender: function(){
			var _this = this;
			$.post(ajaxURL.list, function(data,status){
				status== 'success'&& data.status=== "0"? _this.htmlRender(data.result.groupList): (
					!/^undefined|null$/.test(data.errmsg)? _this.ajaxError(data.errmsg): _this.ajaxError()
				);
			});
		},
		htmlRender: function(data){
			if (data.length=== 0) $('#listIsNone').removeClass('dn');
			var html = template("treeClassify", {data:data});
			$("#treeClassifyList").html(html);
			this.moveFn();
			this.addCategory();
			this.viewSwitch();
			this.keyupSave();
			this.deleteFoo();
		},
		ajaxError: function(text){
			var d = dialog({
			    content: text=== undefined? '网络连接失败，请刷新或稍后重试。': text
			});
			d.show();
			setTimeout(function () {
				d.close().remove();
			}, 2000);
		},
		tipsBox: function(text){
			var d = dialog({
			    title: '提示',
			    content: text,
			    cancel: false,
			    ok: function(){}
			});
			d.show();
		},
		moveFn: function(){
			$('div.move-btn a').on('click', function(){
				var _this = $(this),
				tbody = $('#treeClassifyList'),
				tr = $('#treeClassifyList tr'),
				parent_tr = _this.parent().parent().parent(),
				index = _this.index(),
				len = _this.parent().children().length,
				childrenArr = [parent_tr],
				current = childrenArr[0],
				p_level = current.data('level'),
				num = 1;
				if (current.data('gid')=== undefined){
					p_cusCategory.tipsBox('请先对标签进行编辑保存后，再进行排序操作。');
					return false;
				}
				// current element and all child element array
				for (var i= 0; i< num; i++){
					var n_level = childrenArr[i].next().data('level');
					if (n_level> p_level|| n_level=== undefined){
						childrenArr.push(childrenArr[i].next());
						num++;
					}else num= 1;
				}
				switch(index){
					case 0:
					if (len== 4&& childrenArr[0].index()!== 0){
						$.each(childrenArr, function(a){
							tr.eq(0).before(childrenArr[a]);
							if (a=== 0){
								p_cusCategory.ajaxMove({
									groupId: current.data('gid'),
									topGroupId: tr.eq(0).data('gid')|| childrenArr[0].data('gid'),
									bottomGroupId: ''
								});
							}
						});
						break;
					}
					case 1:
					if (len=== 4|| (len=== 2&& index=== 0)){
						var curr_id = current.data('gid'), idArr = [];
						current.prevAll().each(function(){
							var __level = $(this).data('level'),
							__gid = $(this).data('gid');
							if (__level< p_level|| idArr.length== 2){
								return false;
							}else {
								__level== p_level? idArr.push(__gid): null;
							}
						});
						p_level== 3&& current.prev().data('level')== p_level? current.prev().before(current): current.prevAll().each(function(){
							var __this = $(this);
							if (__this.data('level')< p_level){
								return false;
							}else if (__this.data('level')== p_level){
								$.each(childrenArr, function(a){
									__this.before(childrenArr[a]);
								});
								return false;
							}
						});
						if (idArr.length> 0){
							if (idArr[1]=== undefined) p_cusCategory.ajaxMove({
								groupId: curr_id,
								topGroupId: idArr[0],
								bottomGroupId: ''
							}); else p_cusCategory.ajaxMove({
								groupId: curr_id,
								topGroupId: idArr[1],
								bottomGroupId: idArr[0]
							});
						}
						break;
					}
					case 2:
					var curr_id = current.data('gid'), idArr = []; num = 1;
					current.nextAll().each(function(){
						var __level = $(this).data('level'),
						__gid = $(this).data('gid');
						if (__level< p_level|| idArr.length== 2){
							return false;
						}else {
							__level== p_level? idArr.push(__gid): null;
						}
					});
					p_level== 3&& current.next().data('level')== p_level? current.next().after(current): current.nextAll().each(function(){
						var __this = $(this);
						if (__this.data('level')< p_level&& __this.data('level')!= 0){
							return false;
						}else if (__this.data('level')== p_level|| __this.data('level')== 0){
							if (num=== 1) num++;
							else {
								$.each(childrenArr, function(a){
									__this.before(childrenArr[a]);
								});
								return false;
							}
						}
					});
					if (idArr.length> 0){
						if (idArr[1]=== undefined) p_cusCategory.ajaxMove({
							groupId: curr_id,
							topGroupId: '',
							bottomGroupId: idArr[0]
						}); else p_cusCategory.ajaxMove({
							groupId: curr_id,
							topGroupId: idArr[0],
							bottomGroupId: idArr[1]
						});
					}
					break;
					case 3:
					$.each(childrenArr, function(a){
						var b_id;
						tr.eq(tr.length-1).prevAll().each(function(){
							if ($(this).data('level')== 1){
								b_id = $(this).data('gid');
								return false;
							}
						});
						tr.eq(tr.length-1).before(childrenArr[a]);
						if (a=== 0){
							p_cusCategory.ajaxMove({
								groupId: current.data('gid'),
								topGroupId: '',
								bottomGroupId: b_id
							});
						}
					});
				}
			});
		},
		ajaxMove: function(datas){
			var _this = this;
			$.post(ajaxURL.move, datas, function(data,status){
				var msg = data.errmsg;
				msg = msg== null|| msg== 'null'|| msg== undefined? null: msg;
				if (status== 'success'&& data.status== 0){
					// 排序成功coding
					// 静默无提示
				}else if (msg!= null){
					_this.ajaxError(data.errmsg);
				}else _this.ajaxError();
			});
		},
		addCategory: function(){
			var _this = this,
			$fn = {
				init: function(){
					this.addFirst();
					this.addSecond();
					this.addThird();
				},
				addFirst: function(){
					$('#addFirstLevel td:eq(0) button').on('click', function(){
						var html = template('addFirstClassify', {})+ template('addSecondClassifyBtn', {});
						$('#addFirstLevel').before(html);
						$('.second-level>button,i.show-switch').unbind();
						_this.viewSwitch();
						$fn.unbind_bind_fn();
						$fn.addSecond();
					});
				},
				addSecond: function(){
					$('.second-level>button').on('click', function(){
						var tr = $(this).parent().parent(), pid, html;
						tr.prevAll().each(function(){
							if ($(this).data('level')== 1){
								pid = $(this).data('gid');
								return false;
							}
						});
						html = template('addSecondClassify', {pid: pid})+ template('addThirdClassifyBtn', {});
						tr.before(html);
						$('.third-level>button,i.show-switch').unbind();
						_this.viewSwitch();
						$fn.unbind_bind_fn();
						$fn.addThird();
					});
				},
				addThird: function(){
					$('.third-level>button').on('click', function(){
						var tr = $(this).parent().parent(), pid, html;
						tr.prevAll().each(function(){
							if ($(this).data('level')== 2){
								pid = $(this).data('gid');
								return false;
							}
						});
						html = template('addThirdClassify', {pid: pid});
						tr.before(html);
						$fn.unbind_bind_fn();
					});
				},
				unbind_bind_fn: function(){
					$('#listIsNone').addClass('dn');
					$('div.move-btn a,#treeClassifyList input,a.del-btn,a.view-btn').unbind();
					_this.moveFn();
					_this.keyupSave();
					_this.deleteFoo();
				}
			};
			$fn.init();
		},
		viewSwitch: function(){
			$('i.show-switch').on('click', function(){
				var _this = $(this),
				tr = _this.parent().parent(),
				level = tr.data('level');
				if (tr.next().hasClass('dn')){
					_this.html('&#xe60c;');
					tr.nextAll().each(function(){
						if ($(this).data('level')== (level+1)) $(this).removeClass('dn');
						else if ($(this).data('level')== level){ return false; }
					});
				}else {
					_this.html('&#xe6ca;');
					tr.nextAll().each(function(){
						if ($(this).data('level')> level) $(this).addClass('dn').find('i.show-switch').html('&#xe6ca;');
						else if ($(this).data('level')== level){ return false; }
					});
				}
			});
		},
		allViewSwitch: function(){
			$('#allShow').click(function(){
				$('i.show-switch').html('&#xe60c;');
				$('#treeClassifyList tr').removeClass('dn');
			});
			$('#allHide').click(function(){
				$('i.show-switch').html('&#xe6ca;');
				$('#treeClassifyList tr').each(function(){
					if ($(this).data('level')> 1) $(this).addClass('dn');
				});
			});
		},
		keyupSave: function(){
			$('#treeClassifyList input').on('focus', function(){
				var _this = $(this), val = _this.val();
				_this.on('keyup', function(){
					var K_val = _this.val(),
					btn = _this.next('button');
					if (val.length=== 0&& K_val.length!= 0){
						btn.length=== 0? _this.after(template('saveBtn', {})): null;
						_this.next('button').unbind();
						p_cusCategory.save_fn(_this.next('button'));
					}else if (K_val!= val){
						btn.length=== 0? _this.after(template('saveBtn', {})): null;
						_this.next('button').unbind();
						p_cusCategory.save_fn(_this.next('button'));
					}else {
						btn.remove();
					}
				})
			});
		},
		save_fn: function(ele,id){
			ele.on('click', function(){
				var name = ele.prev('input').val(),
				tr = ele.parent().parent(),
				gid = tr.data('gid'),
				level = tr.data('level'),
				pid = id|| tr.data('pid');
				if (pid=== undefined|| pid.length=== 0){
					var d = dialog({
					    content: '请先对上级标签进行编辑，然后保存。'
					});
					d.show();
					setTimeout(function () {
						d.close().remove();
					}, 2000);
					return false;
				}
				if (/\s/.test(name)){
					toastr.error('标签名称不能包含空格');
					return false;
				}
				if (name.length>12){
					toastr.error('标签名称不能超过12个字符');
					return false;
				}
				gid== undefined? p_cusCategory.ajaxSave('add', $(this), {
					groupName: name,
					rootId: pid,
					groupLevel: level,
					checkBeforeAdd: true
				}): p_cusCategory.ajaxSave('edit', $(this), {
					groupId: gid,
					rootId: pid,
					groupName: name,
					groupLevel: level
				})
			});
		},
		ajaxSave: function(ops,obj,datas){
			var _this = this;
			$.post(ajaxURL[ops], datas, function(data,status){
				var msg = data.errmsg;
				msg = msg== null|| msg== 'null'|| msg== undefined? null: msg;
				if (status== 'success'&& data.status== 0){
					toastr.success(ops== 'add'? '标签添加成功': '标签编辑成功');
					var tr = obj.parent().parent();
					data.result!= undefined? tr.attr('data-gid', data.result.groupId): null;
					tr.nextAll().each(function(){
						if ($(this).data('level')> tr.data('level')){
							var input = $(this).find('td').eq(0).find('input').eq(0),
							button = input.next('button');
							$(this).attr('data-pid', tr.data('gid'));
							button.unbind();
							_this.save_fn(button, tr.data('gid'));
						}
						else {
							return false;
						}
					});
					obj.remove();
				}else if (msg!= null){
					msg== '上级标签已包含商品'? _this.ajaxConfirm('上级标签已包含部分商品，若继续添加下级标签，上级标签下商品将被移出上级标签；添加后您可以在商品标签里筛选“无标签”商品进行批量修改标签，是否确认？','添加',obj,datas): _this.ajaxError(msg);
				}else _this.ajaxError();
			})
		},
		ajaxConfirm: function(text,okVal,obj,datas){
			var _this = this,
			d = dialog({
				title: '温馨提示',
				width: 460,
				content: text,
				okValue: okVal,
				ok: function () {
					this.title('提交中…');
					if (datas.checkBeforeAdd== true){
						datas.checkBeforeAdd = false;
						_this.ajaxSave('add', obj, datas);
					}else if (datas.checkBeforeDelete== true){
						datas.checkBeforeDelete = false;
						_this.deleteFoo(datas, obj);
					}
					d.close().remove();
					return false;
				},
				cancelValue: '取消',
				cancel: function(){}
			});
			d.show();
		},
		deleteFoo: function(a,b){
			var _this = this,
			fn = {
				init: function(){
					this.clickBtn();
				},
				clickBtn: function(){
					$('a.del-btn').on('click', function(){
						var tr = $(this).parent().parent(),
						gid = tr.data('gid'),
						level = tr.data('level'),
						childArr = [tr];
						tr.nextAll().each(function(){
							if ($(this).data('level')> level) childArr.push($(this));
							else if ($(this).data('level')<= level){
								return false;
							}
						});
						if (gid== undefined){
							$.each(childArr, function(a){
								childArr[a].remove();
							})
						}else utils.confirm('确定要删除这个标签吗？', function(){fn.ajaxDelete({
							groupId: gid,
							checkBeforeDelete: true
						}, childArr)})
					});
					$('a.view-btn').on('click', function(){
						var tr = $(this).parent().parent(),
						select = $('select[name="categoryFilter"]'),
						gid = tr.data('gid');
						if (gid== undefined){
							_this.ajaxError('标签还未创建成功');
						}else {
							_this.getSelectOption(select,gid);
							$('.tabs a[data-id="category"]').click();
							$('#supplierList').html('');
							_this.getSupplierList({
								groupId: gid,
								index: 0,
								length: utils.listLength
							});
							try{
								$('#category span.select2-chosen').html(option.html().replace(/\s|&nbsp;/g, ''))
							}catch(e){}
						}
					});
				},
				ajaxDelete: function(datas,Arr){
					$.post(ajaxURL.del, datas, function(data,status){
						var msg = data.errmsg;
						msg = msg== null|| msg== 'null'|| msg== undefined? null: msg;
						if (status== 'success'&& data.status== 0){
							$.each(Arr, function(a){
								Arr[a].remove();
							})
						} else if (msg!= null){
							msg== '该标签下已包含商品'? _this.ajaxConfirm('该标签下已包含部分商品，若删除标签，该标签下商品将被移出标签；删除后您可以在商品标签里筛选“无标签”商品进行批量修改标签，是否确认？','删除',Arr,datas): _this.ajaxError(msg);
						}
						else _this.ajaxError();
					})
				}
			};
			if (a!= undefined&& b!= undefined){
				fn.ajaxDelete(a,b);
				return false;
			}
			fn.init();
		},
		getGroupSelect: function(){
			var _this = this;
			_this.getSupplierList({
				groupId: -1,
				index: 0,
				length: utils.listLength
			});
			$('.tabs a[data-id="category"]').click(function(){
				var select = $('select[name="categoryFilter"]'),
				gid = select.find('option:selected').data('gid');
				if (select.find('option').eq(2).attr('disabled')== 'disabled'){
					_this.getSelectOption(select,gid)
				}
			});
			$('#allSelect').click(function(){
				if ($(this).html()== '全选该页商品'){
					$('#supplierList').find('input[type="checkbox"]').prop('checked', true);
					$(this).html('取消全选商品');
				}else {
					$('#supplierList').find('input[type="checkbox"]').prop('checked', false);
					$(this).html('全选该页商品');
				}
			});
			$('#searchSupplier').click(function(){
				var name = $('#category input[name="searchKeywords"]').val(),
				gid = $('select[name="categoryFilter"]').find('option:selected').data('gid');
				$('#allSelect').html('全选该页商品');
				name== ''? _this.getSupplierList({
					groupId: gid,
					index: 0,
					length: utils.listLength
				}): _this.getSupplierList({
					groupId: gid,
					index: 0,
					fuzzyName: name,
					length: utils.listLength
				});
			});
			$('#allChange').click(function(){
				var checked = $('#supplierList').find('input[type="checkbox"]:checked'),
				arr = [];
				if (checked.length== 0) utils.alert('请先选择需要批量修改标签的商品');
				else {
					checked.each(function(){
						arr.push($(this).parent().parent().data('productid'))
					});
					p_cusCategory.treeSelect({ productList: arr }, 'changeAllGroup');
				}
			});
		},
		getSelectOption: function(obj,gid){
			$.post(ajaxURL.list, function(data,status){
				if (status== 'success'&& data.status== 0){
					data.result.groupList.length== 0? null: obj.html(template('selectGroup', {o: data.result.groupList}));
					obj.find('option').removeAttr('selected');
					obj.find('option[data-gid="'+ gid+ '"]').attr('selected', true);
					obj.select2({ minimumResultsForSearch: -1 });
					obj.unbind('change').on('change', function(){
						$('#category span.select2-chosen').html($(this).find('option:selected').html().replace(/\s|&nbsp;/g, ''));
					})
				}else {
					!/^undefined|null$/.test(data.errmsg)? _this.ajaxError(data.errmsg): _this.ajaxError();
				}
			})
		},
		getSupplierList: function(datas){
			var _this = this,
			len = utils.listLength,
			table = $('#supListTable');
			table.uiLoading('lg');
			datas.status="0";
			$.post(ajaxURL.querySupplier, datas, function(data){
				if (table.hasClass('ui-loading-lg')) table.uiLoading('lg');
				if (data.status==='0'){
					var count = data.result.count;
					if (count> 0){
						$('#supplierListNone').addClass('dn');
						$('#supplierList').html(template('itemList', data.result));
						$('#supplierList tr').click(function(){
							var checkbox = $(this).find('input[type="checkbox"]').eq(0);
							checkbox.is(':checked')? checkbox.prop('checked', false): checkbox.prop('checked', true);
						});
						$('#supplierList input[type="checkbox"]').click(function(e){
							e.stopPropagation();
						});
						$('#supplierList a.edit-cate').click(function(e){
							e.stopPropagation();
							var id = $(this).parent().parent().data('productid');
							p_cusCategory.treeSelect({ productId: id }, 'changeGroup', '修改商品标签');
							$.post(ajaxURL.queryGroup, { productId: id }, function(data){
								if (data.status== 0){
									$.each(data.result.groupList, function(a){
										var o = data.result.groupList[a],
										lv3 = o.thirdLevel, lv2 = o.secondLevel, lv1 = o.firstLevel,
										id = lv3!= undefined? lv3.id: (lv2!= undefined? lv2.id: (lv1!= undefined? lv1.id: '/'));
										var checked = setTimeout(function(){
											if ($('div[aria-labelledby="title:changeConfirm"]').length== 0) checked();
											else $('div[aria-labelledby="title:changeConfirm"] label[data-id="'+ id+ '"]').find('input[type="checkbox"]').prop('checked', true);
										}, 50);
									});
								}else toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
							})
						});
						if ($('#pageBox').find('li').length> 0&& datas.index!= 0){
							return false;
						}
						$('#pageBox').pagination({
							totalData: count,
							showData: len,
							callback: function(i){
								_this.getSupplierList({
									groupId: datas.groupId,
									index: (i-1)*len,
									length: len
								})
							}
						})
					}else if (count== 0){
						$('#supplierListNone').removeClass('dn');
						$('#supplierList,#pageBox').html('');
					}
				}else{
					toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
				}
			})
		},
		treeSelect: function(datas,op,txt){
			var _this = this;
			$.post(ajaxURL.list, function(data){
				if (data.status== 0){
					dialog({
						title: txt|| "批量修改商品标签",
						id: "changeConfirm",
						fixed: false,
						content: template('treeSelect', {o: data.result.groupList}),
						width: 560,
						okValue: '确定',
						cancelValue: '取消',
						backdropOpacity: "0.3",
						ok: function(){
							var checkbox = $('div[aria-labelledby="title:changeConfirm"]').find('input[type="checkbox"]:checked'),
							idArr = [];
							if (checkbox.length== 0){
								if (op== 'changeGroup'){
									datas.groups = 0;
								}else {
									datas.groupList = '';
									if (typeof datas.productList== 'string'){
										datas.productList = datas.productList.split(',');
									}
									$.each(datas.productList, function(){
										datas.groupList += '0'+ ',';
									});
									datas.groupList = datas.groupList.substring(0, datas.groupList.length-1);
									datas.productList = datas.productList.join();
								}
							}else {
								checkbox.each(function(){
									idArr.push($(this).parent().data('id'));
								});
								if (op== 'changeGroup'){
									datas.groups = idArr.join('_');
								}else {
									datas.groupList = '';
									if (typeof datas.productList== 'string'){
										datas.productList = datas.productList.split(',');
									}
									$.each(datas.productList, function(){
										datas.groupList += idArr.join('_')+ ',';
									});
									datas.groupList = datas.groupList.substring(0, datas.groupList.length-1);
									datas.productList = datas.productList.join();
								}
							}
							$.post(ajaxURL[op], datas, function(r){
								if (r.status== 0){
									var gid = $('select[name="categoryFilter"]').find('option:selected').data('gid'),
									name = $('#category input[name="searchKeywords"]').val(),
									index = $('#pageBox').find('.active').eq(0).find('a').html();
									index = parseInt(index);
									$('#allSelect').html('取消全选商品');
									name== ''? _this.getSupplierList({
										groupId: gid,
										index: (index-1)*utils.listLength,
										length: utils.listLength
									}): _this.getSupplierList({
										groupId: gid,
										index: (index-1)*utils.listLength,
										fuzzyName: name,
										length: utils.listLength
									});
								}else toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
							})
						},
						cancel: function(){}
					}).showModal();
					$('.ui-dialog-body>.ui-dialog-content').css({
						'height': '500px',
						'overflow-y': 'auto'
					})
					$('div[aria-labelledby="title:changeConfirm"]').find('dt').each(function(){
						var dd = $(this).next();
						if (dd.children().length== 0&& $(this).find('input').length== 0){
							$(this).find('label').eq(0).prepend('<input type="checkbox">');
						}
					});
					$('#treeSelectAll').click(function(){
						var checkbox = $(this).next().find('input[type="checkbox"]')
						if ($(this).html()== '全部选择'){
							checkbox.prop('checked', true);
							$(this).html('取消全选');
						}else {
							checkbox.prop('checked', false);
							$(this).html('全部选择');
						}
					});
				}else toastr.error(data.errmsg || '服务器繁忙，请稍后重试。');
			});
		}
	};

	return {
		init:function(){
			p_cusCategory.init();
		}
	};
});