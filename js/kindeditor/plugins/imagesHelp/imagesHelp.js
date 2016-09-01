KindEditor.plugin('imagesHelp', function(K) {
    var editor = this, name = 'imagesHelp';
    // 点击图标时执行
    editor.clickToolbar(name, function() {
        dialog({
	        title:"如何上传图片？",
	        id:"util-help",
	        fixed: true,
	        content: '<div class="imagesHelpCont"><img src="https://qncdn.qiakr.com/admin/helpOfImages2.png" /></div>',
	        width:700,
	        cancel: false,
	        okValue: '确定',
	        backdropOpacity:"0",
	        ok: function () {}
	    }).showModal();
    });
});