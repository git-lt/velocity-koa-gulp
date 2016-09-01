var p_customer = {
    init:function(){
        this.getVipInfo();
    },
    getVipInfo:function(){
        var suid = $('#suid').val();
        $.post('getCustomerCard.json',{supplierId:suid},function(data){
            if(data.status==='0'){
                var cusCard = data.result.customerCard;
                if(!cusCard || !cusCard.cardNo) {
                    $('#vipCardBox').html('<div class="user"><h4 class="name"></h4><span class="address">点击获取会员卡</span></div><strong class="number n tc"></strong>');
                    p_customer.regVip(suid,data.result.external);
                }else{
                    var card = cusCard.extCardNo ? cusCard.extCardNo : cusCard.cardNo;
                    var str = card.substring(0,5)+' '+card.substring(5,10)+' '+card.substring(10,20);
                    $('#vipCardBox').html('<div class="user"><h4 class="name">'+data.result.customer.name+'<span class="diamonds fs16">&emsp;<i class="iconfont">&#xe634;</i> '+data.result.stars+'</span></h4><span class="address">'+$('#supplierName').val()+'</span></div>\
                      <strong class="number n tc">'+str+'</strong><a href="javascript:;" class="edit fs12"><i class="iconfont">&#xe63d;</i>编辑</a>');
                    p_customer.vipInfo(suid,data.result.customer.name,data.result.customer.gender);
                }
            }
        });
    },
    regVip:function(suid,external){
        require(["../js/mall/regVip.js"],function(Vip){
            $('#vipCardBox').off('click').on('click', function(){
                Vip.regVip({
                    external: external,
                    suid:suid,
                    successFn:function(){
                        location.href="centerCard.htm?suid="+$('#suid').val();
                    }
                });
            });
        });
    },
    vipInfo:function(suid,name,gender){
       // 跳转到会员卡详情页
        $('#vipCardBox').click(function(e){
            if($(e.target).hasClass("edit")){
                $.msg.actions({
                    title:'修改会员信息',
                    content:$("#editCard"),
                    closeByMask: true,
                    cacheIns:true,
                    onOpened:function(dia){
                        $("#editCard input[name='name']").val(name);
                        $("#editCard input[name='gender'][value='"+gender+"']").prop("checked",true);
                        $("#btnSaveVipChange").on("click",function(){
                            var params={
                                name:$("#editCard input[name='name']").val(),
                                gender:$("#editCard input[name='gender']:checked").val()
                            };
                            $.post("updateCustomerInfo.json",params,function(data){
                                if(data.status=="0"){
                                    location.reload();
                                }else{
                                    mobileToast(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
                                }
                            })
                        })
                    }
                });
            }else{
                window.location.href="centerCard.htm?suid="+suid;
            }
        });
    }
};
p_customer.init();
