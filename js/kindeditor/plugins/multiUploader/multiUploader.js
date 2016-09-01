KindEditor.plugin('multiUploader', function(K) {
    var editor = this, name = 'multiUploader';
    // 点击图标时执行
    editor.clickToolbar(name, function() {
        dialog({
	        title:"批量上传图片",
	        id:"util-multiUploader",
	        fixed: true,
	        content: '<div class="filterTitle" id="insertType" style="margin-top:0;padding-top:0;"><a href="javascript:;" class="current">本地上传</a><a href="javascript:;">网络图片</a></div>\
	        		<div class="webUploaderWrap pt15 localImage" id="KEUploadWrap">\
                        <div id="KEUploadBtn" class="webuploader-container">点击上传</div>\
                    </div>\
                    <div class="netImageWrap fn-hide">\
						<div class="pt10">请输入图片地址：<input type="text" class="long newUrl" /><a href="javascript:;" class="pl10 removeNetImage">删除</a></div><a href="javascript:;" class="newRow pt10">添加一张图片</a>\
                    </div>',
	        width:700,
	        cancel: false,
	        cancelValue:'取消',
	        okValue: '插入所有图片',
	        backdropOpacity:"0",
	        cancel:function(){},
	        ok: function () {
	        	var html = "";
	        	if($("#insertType a.current").index()==0){
		        	$("#KEUploadWrap .loaded").each(function(i,e){
		        		html += '<img src="'+$(e).data("url")+'" />';
		        	});
	        	}else{
	        		$(".netImageWrap .newUrl").each(function(i,e){
	        			if($(e).val()!=''){
	        				html += '<img src="'+$(e).val()+'" />';
	        			}
		        	});
	        	}
	        	KindEditor.instances[0].appendHtml(html);
	        }
	    }).showModal();
        $("#insertType a").on("click",function(e){
        	if($(this).hasClass("current")) return false;
        	$(this).addClass("current").siblings().removeClass("current");
        	if($(this).index()==0){
        		$(".localImage").show();
        		$(".netImageWrap").hide();
        	}else{
        		$(".localImage").hide();
        		$(".netImageWrap").show();
        	}
        });
        $(".netImageWrap").on("click",".newRow",function(){
        	$(this).before('<div class="pt10">请输入图片地址：<input type="text" class="long newUrl" /><a href="javascript:;" class="pl10 removeNetImage">删除</a></div>');
        }).on("click",".removeNetImage",function(){
        	$(this).parent().fadeOut();
        });
        $("#KEUploadBtn").multiImgUploader({});
    });
});