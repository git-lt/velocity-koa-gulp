/**
 * [大数据选择对话框组件 - 商家版]
 * 支持：商品、品牌、门店、商户、导购的单选和多选
 * 支持自定义查询、分页、显示选择条数、限制选择数量
 * 支持自定义列表项模板
 * deps: dialog/toast/jquery/bootstrap
 * author: LT
 */
define(['slimscroll'],function() {
    var DEBUG = true,
        SEARCHING = false;

    var PowerSelectDia = function(opt) {
        this.o = opt;
        this.itemsData = [];
        this.ajaxData = [];
        this.chkData = [];

        this.dia = null;
    };

    PowerSelectDia.prototype = {
        constructor: PowerSelectDia,
        init: function(chkedResData) {
            var o = this.o;
            var _this = this;

            // 设置默认数据
            if (chkedResData) _this.chkData = chkedResData;

            var options = {
                title: o.title,
                padding: 10,
                content: o.contentTpl,
                width: o.width,
                height: o.height,
                okValue: o.okValue,
                fixed: true,
                ok: function() {
                    if (o.okFn(_this.chkData) === false) {
                        return false;
                    } else {
                        _this.dia.close(_this.chkData);
                    }
                },
                cancelValue: o.cancelValue,
                cancel: function() {
                    o.cancelFn(_this.chkData);
                    _this.dia.close(_this.chkData);
                },
                onshow: function() {
                    var oThis = this;
                    var $wrap = $(this.node).find('.ui-dialog-grid');
                    var $searchWrap = $wrap.find('.j-dia-searchbox');
                    $wrap.find('.j-dia-list').slimscroll({height:_this.o.itemsBoxHeight});

                    o.searchTpl ? $searchWrap.html(o.searchTpl) : $searchWrap.remove();
                    o.shownAfterFn && o.shownAfterFn($(this.node).find('.ui-dialog-grid'));

                    _this._setSltNum.call(_this, $(_this.dia.node).find('.j-slt-num'));
                    _this.getListData.call(_this);
                }
            };

            o.selectMulti && (options.statusbar = '<div class="checkbox"><input class="j-dia-chkall" type="checkbox" id="J-dia-chkall"> <label for="J-dia-chkall">全选</label>&emsp;&emsp;<span>已选择 <span class="text-primary f14 j-slt-num">0</span> 项</span> </div> ');
            this.dia = dialog(options);
            this.bindEvents.bind(this)();

            return this.dia;
        },
        bindEvents: function() {
            $(this.dia.node)
                .on('click', '.j-dia-item', this._chkEv.bind(this))
                .on('click', '.j-dia-search', this._searchEv.bind(this))
                .on('click', '.j-dia-chkall', this._chkAllEv.bind(this));
        },
        show: function(chkedResData) {
            this.init(chkedResData).showModal();
        },
        _chkDefault: function() {
            var $dia = $(this.dia.node);
            var chkResIds = this.chkData.map(function(v) {
                return '#d-' + v.id;
            }).join(',');

            $(chkResIds).prop('checked', true);

            $dia.find('.j-dia-chkall').prop('checked', $dia.find('.j-dia-list input:checked').length == this.o.itemsNum);
        },
        getListData: function($btn) {
            var _this = this;
            var o = this.o;
            var oThis = this.dia;

            var $wrap = $(oThis.node).find('.ui-dialog-grid'),
                $itemList = $wrap.find('.j-dia-list').empty(),
                $pageBox = $wrap.find('.j-dia-page'),
                $total = $wrap.find('.j-dia-total');

            var $searchWrap = $wrap.find('.j-dia-searchbox');

            var pms = $.extend({}, { index: 0, length: o.itemsNum }, o.getSearchPms($searchWrap));
            var apiUrl = o.apiGetData;
            SEARCHING && $btn.length && $btn.uiLoading('sm');
            $itemList.uiLoading('lg');
            $.post(apiUrl, pms).done(function(data) {
                if (data.status === '0') {
                    var listData = data.result[o.listDataName];
                    if (!listData) { throw new Error('返回的数据有误，应返回：' + o.listDataName) }

                    var itemData = o.getItemsDataFn(listData);
                    var count = data.result.count;

                    _this.ajaxData = listData;
                    _this.itemsData = itemData;

                    var tplStr = o.selectMulti ? o.checkboxTpl : o.radioTpl;
                    var itemStr = '';

                    $total.text(count);
                    if (itemData.length > 0) {
                        itemStr = template.compile(tplStr)({ data: itemData });

                        if(itemData.length >= o.itemsNum){
                            $pageBox.pagination({
                                totalData: count,
                                showData: pms.length,
                                coping: true,
                                callback: function(i) {
                                    pms.index = (i - 1) * pms.length;
                                    $.post(apiUrl, pms)
                                        .done(function(data) {
                                            var listData = data.result[o.listDataName];
                                            var itemData = o.getItemsDataFn(listData);
                                            $(template.compile(tplStr)({ data: itemData })).appendTo($itemList.empty()).css(o.itemsStyle);

                                            _this.ajaxData = listData;
                                            _this.itemsData = itemData;
                                            _this._chkDefault.call(_this);
                                        });
                                }
                            });
                        }
                    } else {
                        $pageBox.empty();
                        itemStr = '<div class="p20 c-8">暂无相关数据</div>';
                    }

                    $(itemStr).appendTo($itemList).css(o.itemsStyle);
                    _this._chkDefault.call(_this);
                } else {
                    toastr.error(data.errmsg || '服务器繁忙，请稍候重试！');
                }
            }).always(function() {
                SEARCHING && $btn.length && $btn.uiLoading('sm');
                SEARCHING = false;
                $itemList.uiLoading('lg');
            });
        },
        _chkEv: function(e) {
            var o = this.o,
                _this = this;

            $target = $(e.target);
            var isChked = $target.prop('checked');

            var id = $target.data('id'),
                idx = null,
                currData;

            if (!_this.chkData.some(function(v, i) { v.id === id;
                    idx = i; }) && isChked) {
                currData = _this.itemsData.filter(function(v) {
                    if (v.id == id) return v; })[0];
                o.selectMulti ? _this.chkData.push(currData) : (_this.chkData = [currData]);
            } else {
                if (idx !== null && o.selectMulti) {
                    _this.chkData.splice(idx, 1);
                }
            }

            _this._setSltNum.call(_this, $(_this.dia.node).find('.j-slt-num'));
            DEBUG && console.log(_this.chkData);
        },
        _searchEv: function(e) {
            SEARCHING = true;
            this.getListData.call(this, $(e.target));
        },
        _setSltNum: function($numWrap) {
            $numWrap.text(this.chkData.length);
        },
        _chkAllEv: function(e) {
            var $target = $(e.target);
            var $iptChk = $(this.dia.node).find('.j-dia-item');
            var isChked = $target.prop('checked');

            if (isChked) {
                this.chkData = [].concat(this.itemsData);
                $iptChk.prop('checked', true);
            } else {
                this.chkData.length = 0;
                $iptChk.prop('checked', false);
            }
            this._setSltNum.call(this, $(this.dia.node).find('.j-slt-num'));
            DEBUG && console.log(this.chkData);
        }
    }

    PowerSelectDia.defaults = {
        title: '请选择', //对话框标题
        itemsNum: 30, //【必填】每页显示的数据条数
        itemsStyle:{ width: '230px', display:'inline-block' }, //列表项的样式
        itemsBoxHeight: 210, //列表项盒子的高度
        width: 750, //弹出层的宽度
        height: 300, //弹出层的高度
        apiGetData: '', //【必填】获取数据的url
        searchTpl: '', // 搜索区域的art模板的id
        searchBtnSlt: '.j-dia-search', //搜索按钮选择器
        radioTpl: '{{each data as item i}}<div class="radio sltdia-item radio-primary"><input type="radio" class="j-dia-item" name="radio" id="d-{{item.id}}" data-id="{{item.id}}" value="{{item.id}}"> <label for="d-{{item.id}}" title="{{item.text}}">[{{item.id}}]{{item.text | truncate:9}} </label></div>{{/each}}',
        checkboxTpl: '{{each data as item i}}<div class="checkbox sltdia-item checkbox-primary"><input id="d-{{item.id}}" class="j-dia-item"  data-id="{{item.id}}" type="checkbox" value="{{item.id}}"> <label for="d-{{item.id}}" title="{{item.text}}">[{{item.id}}]{{item.text | truncate:9}}</label> </div>{{/each}}',
        resInputSlt: '.j-dia-result', //保存选择结果的隐藏域
        getSearchPms: $.noop, //【必填】返回查询参数的json对象 { keywrods: '', code:'' }
        listDataName: '', //【必填】返回的数据对象名称
        getItemsDataFn: $.noop, //【必填】返回列表项目数组，格式：[{id:1, text:'1号店'}, {id:2, text:'2号店'}]
        shownAfterFn: null, //对话框显示之后的回调，可以注册一些事件
        selectMulti: false, //是否多选

        okValue: '确定', //【必填】确认按钮文字
        cancelValue: '取消', //【必填】取消按钮文字
        okFn: function() {}, //确定的回调
        cancelFn: function() {}, //取消的回调

        contentTpl: '<div class="sltdia-inner"><form class="sltdia-search form-inline j-dia-searchbox text-right mb10"></form><div class="sltdia-items j-dia-list"></div><div class="sltdia-page"><div class="text-right">' +
            '<div class="c-8 l mt20">共有 <span class="j-dia-total">0</span> 项记录</div><nav><ul class="pagination mt10 j-dia-page"></ul></nav></div></div></div>'
    };

    $.powerSelectDia = function(options){ 
        var option = $.extend({}, PowerSelectDia.defaults, typeof options == 'object' && options);
        return new PowerSelectDia(option)
    };
});
