define(function(){
    var categoryVM, categroyView, CONF;

    var categoryDiaWrapTpl = '<div id="limitPL" class="limit-pl fix fn-hide">\
                        <div class="inner mb20">\
                            <div class="ovh">\
                                <p class="ovh pl-list-nav" id="plListNav"></p>\
                                <div class="ovh pl-list-leaf bdr-e4-t" >\
                                    <a href="javascript:;" id="chkAllPL" class="dib l mr10">全选</a>\
                                    <div id="plListLeaf"></div>\
                                </div>\
                            </div>\
                            <div class="pl-chk-res pl15">\
                                <h5 class="limit-h5 m0">已选择如下品类:</h5>\
                                <div class="limit-res-box f12 c-8" id="limitResBox">\
                                    <p>请选择需要限制的品类。</p>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';

    var PLTpl = '{{each res as d i}}<a href="javascript:;" data-id="{{d.id}}">{{d.familyName}}</a>{{/each}}';
    var PLLeafTpl = '{{each res as d i}}<a href="javascript:;" class="fadeIn {{if (checkedArr.indexOf(d.id)>-1)}}active{{/if}}" style="-webkit-animation-delay:{{i*30}}ms;animation-delay:{{i*30}}ms;" data-id="{{d.familyId}}-{{d.id}}">{{d.name}}</a>{{/each}}';

    CONF = {
        apiGetCategoryList: 'getAllCategoryFamily.json',
        apiGetCategoryLeaf: 'getCategoryListByFamilyId.json',
    }

    categoryView = {
        o:{
            PLDataCache: [],
            PLCurrChkId: '',
            PLLeafDataCache: [],
            PLLeafTplCache: [],
            chkPLData: [],
            chkPLResIds: ''
        },
        initPLList:function(){
            var self = this,o = this.o;
            return $.post(CONF.apiGetCategoryList).done(function(data){
                if(data.status==='0'){
                    // 成功
                    var res = data.result.categoryFamilyList;
                    if(res && res.length){
                        // {id:10, familyName:男装, familyPriority:1}
                        $('#plListNav').html(template.compile(PLTpl)({ res:res }));

                        for(var i in res){
                            o.PLDataCache[res[i].id] = res[i].familyName;
                        }
                        
                    }else{
                        // 数据为空
                        $('#plListNav').html('暂无数据！');
                    }
                }else{
                    toastr.error(data.errmsg || ERRMSG['100']);
                }
            });
        },
        show:function(initData, okFn, cancelFn){
            var _this = this, o = this.o;
            dialog({
                title: '选择品类',
                padding:0,
                content:categoryDiaWrapTpl,
                okValue: '确定',
                onshow:function(){
                    _this.initPLList().done(function(){
                        _this.chkPLEv();
                        _this.chkPLLeafEv();
                        _this.checkAllEv();
                        $('#plListNav a:first').trigger('click');
                        _this.showChkPLRes();
                    });
                },
                ok: function () {
                    console.log(o.chkPLResIds);
                    return okFn && okFn(o.chkPLResIds);
                },
                cancelValue: '取消',
                cancel: function () {
                    cancelFn && cancelFn();
                    return true;
                }
            }).width(720).showModal();
        },
        getPLChildren:function(PLId, _parentBox){
            var self = this, o = this.o, checkedArr = o.chkPLResIds.split('_').map(function(v){ return Number(v)});

            if(o.PLLeafTplCache[PLId]){
                _parentBox.show().siblings().hide();
                _parentBox.html(template.compile(PLLeafTpl)({ res:o.PLLeafTplCache[PLId], checkedArr: checkedArr }));
            }else{
                if(PLId){
                    $.post(CONF.apiGetCategoryLeaf, {familyId:PLId})
                    .done(function(data){
                        if(data.status==='0'){
                            // 成功
                            var res = data.result.categoryList;
                            if(!$.isArray(res)){
                                res = [res];
                            }
                            if(res.length){
                                // {id:10, familyName:男装, familyPriority:1}
                                _parentBox.html(template.compile(PLLeafTpl)({ res:res, checkedArr: checkedArr }));
                                for(var j in res){
                                    o.PLLeafTplCache[PLId] = res;
                                    o.PLLeafDataCache[res[j].id]= res[j].name;
                                }

                                $('#chkAllPL').removeClass('active');
                            }else{
                                _parentBox.html('<p class="c-8 f12">暂无数据！</p>');
                            }
                        }else{
                            toastr.error(data.errmsg || ERRMSG['100']);
                        }
                    });
                }
            }
        },
        chkPLEv:function(){
            var self = this, o = this.o;
            $('#plListNav').on('click','a',function(){
                var _this = $(this), _thisPrt =_this.parent(),
                    currInd = _thisPrt.data('curr') ? _thisPrt.data('curr') : 0,
                    targetInd = _this.index();
                    familyId = _this.data('id');

                if(targetInd !== currInd){
                    _this.addClass('active').siblings().andSelf().eq(currInd).removeClass('active');
                    _thisPrt.data('curr',targetInd);
                }else{
                    _this.addClass('active');
                }

                var _leafListBox = $('#PLLeaf-'+familyId).length ? $('#PLLeaf-'+familyId): $('<div>',{'id': 'PLLeaf-'+familyId}).appendTo('#plListLeaf');
                self.getPLChildren(familyId,_leafListBox);
                _leafListBox.show().siblings().hide();
                o.PLCurrChkId = familyId;
            });
        },
        chkPLLeafEv:function(){
            var self = this, o = this.o;
            $('#plListLeaf').on('click','a',function(){
                var _this = $(this),
                    currInd = _this.data('curr')?_this.data('curr'):0,
                    targetInd = _this.index(),
                    leafId = _this.data('id').split('-');

                _this.data('curr',targetInd);
                _this.toggleClass('active');

                if(!$.isArray(o.chkPLData[leafId[0]])){
                    o.chkPLData[''+leafId[0]]=[];
                }

                var tI = (o.chkPLData[leafId[0]]).indexOf(leafId[1]);

                if(_this.hasClass('active') && tI<0){
                    // 添加
                    o.chkPLData[leafId[0]].push(leafId[1]);
                }else{
                    // 删除
                    o.chkPLData[leafId[0]].splice(tI,1);
                    $('#chkAllPL').removeClass('active');
                }

                // 更新选择结果
                self.showChkPLRes();
            });
        },
        showChkPLRes:function(){
            var self = this, o= this.o, resHtml='', isFirst=true, resArr=[];
            if(o.chkPLData.length){
                for(var i in o.chkPLData){
                    if(o.chkPLData[i].length){
                        resArr = resArr.concat(o.chkPLData[i]);
                        resHtml +='<div><b>' + o.PLDataCache[i] + "</b>：";
                        for(var k in o.chkPLData[i]){
                            resHtml += o.PLLeafDataCache[o.chkPLData[i][k]]+'/';
                        }
                        resHtml = resHtml.substring(0,resHtml.length-1)+'</div>';
                    }
                }
                $('#limitResBox').html(resHtml);
                o.chkPLResIds= resArr.join('_');
            }else{
                $('#limitResBox').html('请选择需要限制的品类');
            }
        },
        checkAllEv: function(){
            var self = this, o = this.o;
            $('#chkAllPL').on('click', function(){
                var _this = $(this);
                _this.toggleClass('active');

                if(_this.hasClass('active')){
                    $('#PLLeaf-'+o.PLCurrChkId).children().addClass('active');
                    var t = [];
                    for(var x in o.PLLeafTplCache[o.PLCurrChkId]){
                        t.push(o.PLLeafTplCache[o.PLCurrChkId][x].id);
                    }
                    o.chkPLData[o.PLCurrChkId]=t;
                }else{
                    $('#PLLeaf-'+o.PLCurrChkId).children().removeClass('active');
                    o.chkPLData[o.PLCurrChkId]=[];
                }

                self.showChkPLRes();
            });
        }
    }

    return $.categoryDia = categoryView;
})



