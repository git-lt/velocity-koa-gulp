var menuCurrent = "notice";
document.title="洽客-小秘书"; 
require(["qiakr/base_old","tool/uploader"],function(){
	Util.createSecondMenu([
		{"name":"小秘书","url":"notice.htm"},
		{"name":"通知中心","url":"notificate.htm"},
		{"name":"导购咨询","url":"consult.htm"},
		{"name":"官网动态","url":"qiakrNews.htm"},
		{"name":"启动屏设置","url":"bootScreen.htm"},
		{"name":"客户反馈","url":"feedback.htm"},
		{"name":"首页弹窗设置","url":"appHomeSet.htm"}
	],"小秘书");

	getAjaxData(0);

	function getAjaxData(idx){
		$(".table tbody").empty().html('<tr><td colspan="99" class="loading"><img src="../images/admin/loading.gif" alt="" /></td></tr>');
		var param = {
			index:idx,
			notifyType:"1",
			length:Util.listLength
		}
		jQuery.getJSON("getNoticeList.json",param,function(data){
			var tempData={
				list:data.result.noticeList
			}
			var dataHtml = template('tempData', tempData);
			$(".table tbody").empty().append(dataHtml);
			Util.createPagination(data.result.count,idx,$(".pagination"),function(_i){
				getAjaxData(_i);
			});
		});
	}

	$(".table").on("click",".sendBtn",function(e){
		var id = $(this).closest("tr").data("id");
		$.getJSON("sendNotice.json?id="+id,function(data){
			if(data.status=="0"){
				Util.alert("发送成功");
				setTimeout(function(){
					location.reload();
				},1000);
			}else{
				Util.alert(data.errMsg ? data.errMsg : "发送失败，请稍后重试");
			}
		});
	}).on("click",".delete",function(e){
		var id = $(this).closest("tr").data("id"),_t = $(this);
		$.getJSON("delNotice.json?id="+id,function(data){
			if(data.status=="0"){
				Util.alert("删除成功");
				_t.closest("tr").fadeOut("300",function(){
					_t.remove();
				});
			}else{
				Util.alert(data.errMsg ? data.errMsg : "发送失败，请稍后重试");
			}
		});
	}).on("click",".preview",function(e){
		var id = $(this).closest("tr").data("id");
		$.getJSON("sendNoticePreview.json?id="+id,function(data){
			if(data.status=="0"){
				Util.alert("预览成功，已发送给尖椒和bincat的导购端");
			}else{
				Util.alert(data.errMsg ? data.errMsg : "发送失败，请稍后重试");
			}
		});
	});

	$("#imageUpload").singleImgUploader({
		resultInput:$("#imageUploadUrl")
	});
	$("#imageTextUpload").singleImgUploader({
		resultInput:$("#imageTextUploadUrl")
	});
	$("#firstTalkBtn").on("click",function(){
		dialog({
	        title:"编辑首访回复",
	        id:"util-firstTalk",
	        fixed: true,
	        content: $("#firstTalkBox"),
	        width:580,
	        okValue: '确定',
	        backdropOpacity:"0",
	        ok: function () {}
	    }).showModal();
	});

	$("#newMsgBtn").on("click",function(){
		var editBox = dialog({
	        title:"新建/编辑群发通知",
	        id:"util-newMsg",
	        fixed: true,
	        content: $("#newMsgBox"),
	        width:580,
	        okValue: '确定',
	        backdropOpacity:"0",
	        ok: function () {
	        	var _type=$("#msgTypeSelection").val(),
	        		_title=$("#msgTitle").val(),
	        		_content = {};
	        	if($.trim(_title)==""){
	        		Util.alert("请填写标题");
	        		return false;
	        	}
	        	if(_type=="0"){
					var _text = $("#textMsg").val();
					if($.trim(_text)==""){
						Util.alert("请填写文本内容");
	        			return false;
					}
					_content = _text;
				}else if(_type=="1"){
					var _img = $("#imageUploadUrl").val();
					if(_img==""){
						Util.alert("请上传图片");
	        			return false;
					}
					_content = '{"name":"fusu","url":"'+_img+'"}';
				}else if(_type=="7"){
					var _img = $("#imageTextUploadUrl").val(),_url = $("#urlMsg").val(),_text = $("#textMsg").val();
					if(_img==""){
						Util.alert("请上传图片");
	        			return false;
					}
					if(_url==""){
						Util.alert("请填写URL地址");
	        			return false;
					}
					if(_text==""){
						Util.alert("请填写文本内容");
	        			return false;
					}
					_content = '{"PicUrl":"'+_img+'","Title":"'+_title+'","Url":"'+_url+'","Content":"'+_text+'","ContentType":"2"}';
				}
				var param = {
					type:_type,
					content:_content,
					notifyType:"1",
					title:_title
				};
				$.ajax({
					url:"createNotice.json",
					data:param,
					success:function(data){
						if(data.status=="0"){
							editBox.close();
							location.reload();
						}
					}
				});
				return false;
	        }
	    }).showModal();
	});

	$("#msgTypeSelection").change(function(){
		$("#newMsgBox").find(".msgCon").hide();
		var _type=$(this).val();
		if(_type=="0"){
			$("#newMsgBox").find(".forT").show();
		}else if(_type=="1"){
			$("#newMsgBox").find(".forI").show();
		}else if(_type=="7"){
			$("#newMsgBox").find(".forIL, .forT").show();
		}
	});
});