define(['utils'],function(utils){
    document.title="批量修改会员积分"; 
    var taskId = utils.getUrlParam("taskId");
    var page={
        init:function(){
            this.getOkList();  //获取成功或者失败的列表
            this.submitEv();   //确认提交增减积分
        },
        getOkList:function(){
            $.getJSON("getBatchFileItemList.json?taskId="+taskId,function(data){
                var allowCommit=data.result.allowCommit;
                if(allowCommit){
                    var list=data.result.okItemList;
                    if(list!=''){
                        $("#errorList").hide();
                        $("#okList").show();
                        var tempData={lists:data.result.okItemList}
                        var okItemList = template('okItemList', tempData);
                        $("#okTable tbody").html(okItemList);
                    }else{
                        $("#errorList").hide();
                        $("#okList").show();
                        $("#okTable tbody").html(template('no'));
                        $("#submit").hide();
                    }
                }else{
                    var errorList=data.result.errorItemList,errorDataHtml = "";
                    if(errorList.length > 0){
                        $.each(errorList,function(i,e){
                            errorDataHtml+='<tr>\
                            <td>'+e.line+'</td>\
                            <td>'+e.error+'</td>\
                            </tr>';
                        });
                        $("#errorTable tbody").empty().append(errorDataHtml);
                        $("#errorList").show();
                        $("#okList").hide();
                        $("#submit").hide();
                    }
                }
            });
        },
        submitEv:function(){
            $("#submit").on("click",function(e){
                var _this=$(this);
                _this.uiLoading("sm");
                e.preventDefault();
                $.getJSON("batchFileCommit.json?taskId="+taskId,function(data){
                    if(data.status=="0"){
                        _this.uiLoading("sm");
                        utils.alert("批量增减积分成功",function(){
                            location.href="customerExchange.htm#!/customerExchangeImport";
                        });
                    }else{
                        utils.alert(data.errmsg);
                    }
                });
            });
        }
    }

    return {
        init:function(){
            page.init();
        }
    }
});