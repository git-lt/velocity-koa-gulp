require(["select2_3",'zclip',"qrcode","qiakr/base_old",'twbsPagination'],function(select2, zclip){
	document.title="邀请码管理";
	var menuCurrent = "check";

	Util.createSecondMenu([
		{"name":"财务审核","url":"checkEnter.htm"},
		{"name":"运营标签","url":"javascript:;"},
		{"name":"邀请码管理","url":"inviteCodeList.htm"},
	],"邀请码管理");

	template.helper('getInviteType', function (type, typeString) {
		var types= {'1':'朋友介绍','2':'渠道服务商','3':'新闻文章','4':'市场活动','5':'展会', '6':'商户推荐'};
       	return types[type] || '--';
   });

	var CONF = {
		getInviteCodeByType: 'getInviteCodeByType.json', //根据类型获取商户来源信息
		getInvitedSupplier: 'getInvitedSupplier.json',
		searchInviteCodeByType: 'searchInviteCodeByType.json', //根据类型检索商户来源信息
		updateInviteCodeChannel: 'updateInviteCodeChannel.json', //更新商户来源名称
		addChannelInviteCode: 'addChannelInviteCode.json' //新增商户来源
	}
	var $btnCreateNewInvite = $('#createNewInvite');
	var $btnSearch = $('#searchInvite');
	var sortUnit = 'gmt_create';
	var sortType =  1;

	var page = {
		init:function(){
			this.getInviteData();
			this.searchInviteListEv();
			this.createInviteCodeEv();
			this.changeTypeEv();
			this.editInviteInfoEv();
			this.getInviteDetailEv();
			this.getRegisterUrlEv();
			this.sortEv();
		},
		changeTypeEv:function(){
			$('#inviteType').on('change', function(){
				$(this).val() !=6 ? $btnCreateNewInvite.show(): $btnCreateNewInvite.hide();
			}).trigger('change');

			$('#inviteCodeIpt,#supplierNameIpt').on('focus', function(){
				$(this).css('borderColor','#ccc');
				$('#msgTip').fadeOut();			
			})
		},
		getInviteData:function(){
			var self = this;
			var pms = {
				type: $('#inviteType').val(),
				keywords: $.trim($('#keywords').val()),
				unit: sortUnit,
				sort: sortType,
				index: 0,
				length: 30
			};
			$.post(CONF.searchInviteCodeByType, pms, function(data){
				if(data.status==='0'){
					var listData = data.result.inviteCodeVoList;
					if(!listData.length){
						$('#inviteTbd').html('<tr id="tableLoading"><td colspan="10" class="tc c-8">暂无数据</td></tr>');
						$('#navPagesNumBox').empty();
						return;
					}
					$('#inviteTbd').html(template('inviteListTpl',{data:listData}));

					var totalP = Math.ceil(data.result.count/pms.length);
					if(totalP>1){
						$('#navPagesNumBox').data({'opt':pms, 'url':CONF.searchInviteCodeByType});
						// 初始化页码选择事件
						$('#navPagesNumBox').data('twbs-pagination','').off().empty().twbsPagination({
						    totalPages: totalP,
						    startPage: 1,
						    visiblePages: 10,
						    onPageClick:function(e, num){
						        // 异步获取数据并渲染 
						        var info = $('#navPagesNumBox').data(),
						            opt = info.opt,
						            postUrl = info.url;
						        opt.index = (num-1)*opt.length;

						        $.ajax({
						            url:postUrl,
						            data:opt,
						            dataType:'json',
						            method:'POST'
						        }).done(function(data){
						        	var listData = data.result.inviteCodeVoList;
						            $('#inviteTbd').html(template('inviteListTpl',{data:listData}));
						        });
						    }
						});
					}else{
						$('#navPagesNumBox').empty();
					}
				}else{
					Util.alert('服务器繁忙');
				}
			});
		},
		searchInviteListEv:function(){
			var self = this;
			$('#searchInvite').on('click', function(){
				$.proxy(self.getInviteData(), self);
			});
		},
		createInviteCodeEv:function(){
			$btnCreateNewInvite.on('click', function(){
				$('#inviteCodeIpt').val('').prop('disabled',false);
				$('#supplierNameIpt').val('');

				var cDia = dialog({
					title:'新建',
					width:500,
					content:$('#createInviteCodeDia')[0],
					okValue: '确定',
					statusbar: '<label id="msgTip" class="c-rd" style="display:none;"></label>',
				    ok: function () {
				        var pms = {
				        	channel: $.trim($('#supplierNameIpt').val()),
				        	code: $.trim($('#inviteCodeIpt').val()),
				        	type: $('#inviteType').val()
				        };

				        if(pms.channel=='' || pms.code==''){
				        	$('#msgTip').text('输入不能为空').fadeIn();
				        	(pms.code=='' ? $('#inviteCodeIpt'):$('#supplierNameIpt')).css('borderColor','red');
				        	return false;
				        }

				        if(pms.channel.length>50 || pms.code.length>50){
				        	$('#msgTip').text('输入字符过长').fadeIn();
				        	(pms.code.length>50 ? $('#inviteCodeIpt'):$('#supplierNameIpt')).css('borderColor','red');
				        	return false;
				        }
				        $.post(CONF.addChannelInviteCode, pms, function(data){
				        	if(data.status === '0'){
				        		$('#searchInvite').trigger('click');
								Util.alert('创建成功');
				        		cDia.close();
				        	}else{
								Util.alert(data.errmsg || '服务器繁忙');
				        	}
				        });
				    },
				    cancelValue: '取消',
				    cancel: function () {}
				}).showModal();
			})
		},
		editInviteInfoEv:function(){
			$('#inviteTbd').on('click','.edit', function(){
				var ivData = $(this).parent().data();
				// ivData.id
				$('#inviteCodeIpt').val(ivData.code).prop('disabled',true);
				$('#supplierNameIpt').val(ivData.channel);
				var editDia = dialog({
					title:'编辑',
					width:500,
					content:$('#createInviteCodeDia')[0],
					okValue: '确定',
					statusbar: '<label id="msgTip" class="c-rd" style="display:none;"></label>',
				    ok: function () {
				        var pms = {
				        	channel: $.trim($('#supplierNameIpt').val()),
				        	inviteCodeId:ivData.id
				        };
				        if(pms.channel==''){
				        	$('#msgTip').text('输入不能为空').fadeIn();
				        	pms.channel=='' && $('#supplierNameIpt').css('borderColor','red');
				        	return false;
				        }

				        if(pms.channel.length>50){
				        	$('#msgTip').text('输入字符过长').fadeIn();
				        	pms.channel.length>50 && $('#supplierNameIpt').css('borderColor','red');
				        	return false;
				        }
				        $.post(CONF.updateInviteCodeChannel, pms, function(data){
				        	if(data.status === '0'){
				        		$('#searchInvite').trigger('click');
								Util.alert('编辑成功');
				        		editDia.close();
				        	}else{
								Util.alert('服务器繁忙');
				        	}
				        });
				    },
				    cancelValue: '取消',
				    cancel: function () {}
				}).showModal();
			});
		},
		getRegisterUrlEv:function(){
			$('#inviteTbd').on('click','.getUrl', function(){
				$("#copyHBLink").val('复制链接');
				var link ='http://www.qiakr.com/registerForSupplier.htm?inviteCode='+$(this).parent().data('code');

				$('#rwmImg').empty();
			     var qrcode = new QRCode(document.getElementById("rwmImg"), {
			         width : 200,
			         height : 200
			     });
			     qrcode.makeCode(link);
				$('#hbLinkIpt').val(link);
				
				dialog({
					title:'获取活动链接',
					content:$('#copyCPLink'),
	            	backdropOpacity:"0.5",
	            	width:500
				}).showModal();

				setTimeout(function(){
					$("#copyHBLink").zclip({
					    path: "//res.qiakr.com/plugins/zclip/zclip.swf",
					    copy: function(){
					    	return $('#hbLinkIpt').val();
					    },
					    setCSSEffects:false,
					    beforeCopy:function(){
							$(this).css('background','#449d44');
						},
					    afterCopy:function(){/* 复制成功后的操作 */
					    	$(this).val('复制成功');
					    }
					});
				},500);
			});
		},
		getInviteDetailEv:function(){
			$('#inviteTbd').on('click','.getDetail', function(){
				var iId = $(this).parent().data('id');
				var pms = {
					inviteCodeId:iId,
					index:0,
					length:10
				};

				var rgtDia = dialog({
					title:'邀请的商家列表',
					content:$('#rgListBox')[0],
					okValue: '确定',
					width:500,
					onshow: function () {
				        $.post(CONF.getInvitedSupplier, pms, function(data){
				        	if(data.status==='0'){
				        		var tplData = data.result.supplierList;
				        		if(!tplData.length){
				        			$('#registerListTbd').html('<tr><td colspan="10" class="tc c-8">暂无数据</td></tr>');
				        			$('#registerListPagesNumBox').empty();
				        			return;
				        		}
				        		$('#registerListTbd').html(template('regiterListTpl',{data:tplData}));
				        		var totalP = Math.ceil(data.result.count/pms.length);
				        		if(totalP>1){
				        			$('#registerListPagesNumBox').data({'opt':pms, 'url':CONF.getInvitedSupplier});
				        			$('#registerListPagesNumBox').data('twbs-pagination','').off().empty().twbsPagination({
				        			    totalPages: totalP,
				        			    startPage: 1,
				        			    visiblePages: 5,
				        			    onPageClick:function(e, num){
				        			        var info = $('#registerListPagesNumBox').data(),
				        			            opt = info.opt,
				        			            postUrl = info.url;
				        			        opt.index = (num-1)*opt.length;

				        			        $.ajax({
				        			            url:postUrl,
				        			            data:opt,
				        			            dataType:'json',
				        			            method:'POST'
				        			        }).done(function(data){
				        			        	var tplData = data.result.supplierList;
				        			            $('#registerListTbd').html(template('regiterListTpl',{data:tplData}));
				        			        });
				        			    }
				        			});
				        		}else{
				        			$('#registerListPagesNumBox').empty();
				        		}

				        	}
				        })
				    },
				    ok: function () {
				        return true;
				    }
				}).showModal();
				
			});		
		},
		renderSingle:function(data){
			$('#inviteTbd tr').first().before('');
			$('#tableLoading').remove();
		},
		sortEv:function(){
			var self = this;
			$('#inviteListThd').on('click','.sortItem', function(){
				var _this = $(this);
				sortUnit = _this.data('name');

				if(_this.hasClass('sorting') || _this.hasClass('sorting_asc')){
					_this.attr('class','sorting_desc sortItem');
					sortType = 1;
				}else{
					_this.attr('class','sorting_asc sortItem');
					sortType = 0;
				}
				_this.siblings('[class^="sorting_"]').attr('class','sorting sortItem');

				// 获取数据
				self.getInviteData.bind(self)();
			})
		}
	}

	page.init();
});



