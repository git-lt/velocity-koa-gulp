document.title="洽客-新手教学"; 
$.createSecondMenu("m_home","新手教学");
getAjaxData(0,"false");
function getAjaxData(taskName,complete){
	var type = taskName;
	if(taskName==99){
		taskName='';
	}else{
		taskName=$(".filterTitle a[data-type="+taskName+"]").text();
	}
	jQuery.ajax({
		url:"getNewmanMissionList.json",
		data:{
			taskName:taskName,
			complete:complete
		},
		success:function(data){
			var tempData={
				list:data.result.newmanMissionList,
				complete:complete=="true" ? true : false
			}
			var dataHtml = template('tempData', tempData);
			if(!dataHtml){
				if(taskName==''){
					dataHtml='<div class="pt10"><p>您还没有已完成的任务，快去完成吧！</p></div>'
				}else{
					dataHtml='<div class="pt10"><p>真棒，您已完成了所有当前类型的任务</p></div>'
				}
			}
			if (complete== "false"){
				$("#missionItems").html(dataHtml);
				setTimeout(function(){ getAjaxData(type,"true") }, 100)
			}
			else $("#missionItems").append(dataHtml);
		}
	});
}
$(".filterTitle>a").on("click",function(e){
	e.preventDefault();
	if($(this).hasClass("current")) return false;
	$(this).addClass("current").siblings().removeClass("current");
	var _i = $(this).data("type");
	if(_i == 99){
		getAjaxData(_i,"true");
	}else{
		getAjaxData(_i,"false");
	}
});

$(document).on("click",".complete",function(){
	var id = $(this).data("id"),item = $(this).closest(".missItem"),wrap = item.parent();
	$.getJSON("setMissionComplete.json?missionId="+id,function(data){
		if(data.status=="0"){
			item.fadeOut(function(){
				// item.remove();
				// if(wrap.find(".missItem").length==0){
				// 	wrap.html('<div class="pt10"><p>真棒，您已完成了所有当前类型的任务</p></div>');
				// }
				getAjaxData($(".filterTitle .current").data("type"),"false")
			});
		}else{
			dialog({
	            // title:"系统提示",
	            id:"util-confirm",
	            fixed: true,
	            content: '<p class="tc pb10"><img src="https://qncdn.qiakr.com/admin/missionUncomp.png" /></p><p class="tc">'+(data.errmsg ? data.errmsg : '您还未完成该技能哦')+'</p>',
	            width:300,
	            okValue: '确定',
	            cancelValue:'查看技能教程',
	            backdropOpacity:"0.5",
	            ok: function(){},
	            cancel: function(){
	            	window.open("missionCourse.htm?id="+id);
	            }
	        }).showModal();
		}
	});
})