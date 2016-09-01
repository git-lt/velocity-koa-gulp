/*******************************************************************************
* KindEditor - WYSIWYG HTML Editor for Internet
* Copyright (C) 2006-2011 kindsoft.net
*
* @author Roddy <luolonghao@gmail.com>
* @site http://www.kindsoft.net/
* @licence http://www.kindsoft.net/license.php
*******************************************************************************/

KindEditor.plugin('preview', function(K) {
	var self = this, name = 'preview', undefined;
	self.clickToolbar(name, function() {
		var lang = self.lang(name + '.'),
			html = '<div style="padding:10px 20px;">' +
				'<iframe class="ke-textarea" frameborder="0" style="width:320px;height:400px;"></iframe>' +
				'</div>',
			dialog = self.createDialog({
				name : name,
				width : 362,
				title : self.lang(name),
				body : html
			}),
			iframe = K('iframe', dialog.div),
			doc = K.iframeDoc(iframe);
		doc.open();
		doc.write(self.fullHtml());
		doc.close();
		// K(doc.body).css('background-color', '#FFF');
		K(doc.head).append('<style>body{background-color:#fff}img{max-width:100%;}</style>');
		iframe[0].contentWindow.focus();
	});
});
