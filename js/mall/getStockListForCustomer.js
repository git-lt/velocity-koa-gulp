var _order=getUrlParam('orderName'),_type=getUrlParam('orderType');
var defaultTag = $('.s-items a[data-order="'+_order+'"]');
defaultTag.addClass("curr");
if(_type=="asc"){
    defaultTag.addClass("up");
}else{
    defaultTag.addClass("down");
}
if(getUrlParam('fuzzyName') || getUrlParam('categoryName') || getUrlParam('tags')){
    $("#keyWords").html(getUrlParam('fuzzyName') || getUrlParam('categoryName') || getUrlParam('tags'));
}else{
    $("#keyWords").html('全部商品');
}

$(".s-items li a").click(function(e){
    e.preventDefault();
    _order=$(this).data("order");
    if(!_order) return false;
    if($(this).hasClass("curr")){
        if($(this).hasClass("down")){
            _type = "asc";
        }else{
            _type = "desc";
        }
    }else{
        _type="desc";
    }
    location.href="getStockListForCustomer.htm?fuzzyName="+getUrlParam('fuzzyName')+"&tags="+getUrlParam('tags')+"&categoryFamilyIds="+getUrlParam('categoryFamilyIds')+"&categoryIds="+getUrlParam('categoryIds')+"&categoryName="+getUrlParam('categoryName')+"&storeId="+getUrlParam('storeId')+"&orderName="+_order+"&orderType="+_type+"&supplyTypeList=1&index=0&length=20&brandId="+getUrlParam('brandId');
});

// 进入页面，优先获取浏览记录
if(getUrlHash("hLength") && getUrlHash("hTop") && getUrlHash("hLength")>20){
    getAjaxData(_order,_type,20,false,getUrlHash("hLength")-20);
}

function getAjaxData(order,type,idx,clear,length){
    if(clear){
        $(".stockList ul").empty();
    }
    var param = {
        storeId: getUrlParam('storeId'),
        fuzzyName: getUrlParam('fuzzyName'),
        categoryIds: getUrlParam('categoryIds'),
        categoryFamilyIds: getUrlParam('categoryFamilyIds'),
        categoryName: getUrlParam('categoryName'),
        tags: getUrlParam('tags'),
        brandId: getUrlParam('brandId'),
        groupId: getUrlParam('groupId'),
        orderName: order,
        orderType: type,
        supplyTypeList:"1",
        index: idx,
        length: length ? length.toString() : baseOption.pageSize
    }
    $.getJSON("getStockListForCustomer.json",param,function(data){
        if(data.status ==='1') return;
        var tempData={
            list : data.result.stockList
        }
        var htmlStr = template('tempData', tempData);
        $('.stockList ul').append(htmlStr);
        if(length){
            $("body").scrollTop(getUrlHash("hTop"));
        }
    });
}


$("body").on("click",".cover",function(e){
    e.stopPropagation();
    if(e.target == this){
        $(this).hide();
    }
    return false;
}).on("click",".stockList li",function(){
    var scTop = $("body").scrollTop(),length = $(".stockList li").length;
    location.href="#hLength="+length+"&hTop="+scTop;
});


// 无限加载
var LoadDataByScroll = function(o){
    this.timer = null;
    this.loadH = o.loadH || 50;
    this.innerH = window.innerHeight;
    this.pageNum = o.pageNum || 1;
    this.pageTotal = o.pageTotal || 10;
    this.loadFn = o.loadFn;
    this.endFn = o.endFn;

    this.init();
};
LoadDataByScroll.prototype={
    init:function(){
        this.addScrollEv();
    },
    loadStart:function(){
        var pageNum = this.pageNum;
        var pageTotal = this.pageTotal;
        var loadFn = this.loadFn;
        var endFn = this.endFn;
        var self = this;
        var dis = 0;
        var _body = window.document.body;

        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(function(){
            dis = _body.scrollHeight - _body.scrollTop - self.innerH;
            console.log(dis);
            if(dis<=self.loadH){
                if(self.pageNum >= self.pageTotal){
                    // console.log('over');
                $(window).off('scroll');
                    endFn && endFn();
                }else{
                    self.pageNum++;
                    console.log(self.pageNum);
                    loadFn && loadFn(self.pageNum);
                }
            }
        }, 100);
    },
    addScrollEv:function(){
        $(window).on('scroll', this.loadStart.bind(this));
    }
}
define(['iscroll'], function(iScroll){
  var p_getStockList;

  // 函数防抖
  function debounce(fn, delay) {
    var timer;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }
  p_getStockList = {
      o:{
          getBrandsUrl:'getBrandListByStoreId.json',
          storeId:$('#storeId').val()
      },
      init:function(){
          this.ajaxGetBrands();
          this.switchBrandsEv();
          this.initScrollGetPages();
          this.loadClassAndSearch();//加载筛选类目和搜索
      },
      ajaxGetBrands:function(){
        var self = this, o = this.o;
        $.ajax({
            url: o.getBrandsUrl,
            data: {storeId:o.storeId},
            method:'POST',
            success:function(data){
                if(data.status==='0'){
                    var tData = data.result.brandList, res=[];
                    if(tData.length){
                        res.push('<ul class="sl_brand_box hide" id="brandItems">');
                        res.push('<li class="ui-list-item"><a href="getStockListForCustomer.htm?storeId='+o.storeId+'&orderName=market_price&orderType=asc&index=0&length=20" class="ui-list-nav" >全部品牌</a></li>');

                        for(var i=0, len=tData.length; i<len; i++){
                            res.push('<li class="ui-list-item" data-brandId="'+tData[i]['id']+'" data-brandName="'+tData[i]['brandName']+'"><a href="getStockListForCustomer.htm?storeId='+o.storeId+'&orderName=market_price&orderType=asc&index=0&length=20&brandId='+tData[i]['id']+'" class="ui-list-nav" >'+tData[i]['brandName']+'</a></li>');
                        }
                        res.push('</ul>');
                    }
                    res.length && $('#stockListNavTool').append(res.join(''));

                }else{

                }
            }
        });
      },
      switchBrandsEv:function(){
          $('#selectBrand').on('click', function(){
              var oBrands = $('#brandItems'), state = $(this).data('state');
              if(oBrands.length){
                  if(state=='hide'){
                      $.mask.show();
                      oBrands.show();
                      $(this).data('state','show').addClass('active');
                  }else{
                      oBrands.hide();
                      $.mask.hide();
                      $(this).data('state','hide').removeClass('active');
                  }
                  
              }
          });
      },
      initScrollGetPages:function(){
        var pms = {
            storeId: getUrlParam('storeId'),
            fuzzyName: getUrlParam('fuzzyName'),
            categoryIds: getUrlParam('categoryIds'),
            categoryFamilyIds: getUrlParam('categoryFamilyIds'),
            categoryName: getUrlParam('categoryName'),
            tags: getUrlParam('tags'),
            brandId: getUrlParam('brandId'),
            groupId: getUrlParam('groupId'),
            orderName: _order,
            orderType: _type,
            supplyTypeList:"1",
            index: '20',
            length: '20'
        };

        var count = ~~$('#totalCount').val();

        if((count-20)<=0){
          $('#loadingWrap').html('<div class="tc p20 c-8">没有更多了</div>');
          return;
        }
        $('#loadingWrap').html('<div class="tc p20 c-8"><img src="https://qncdn.qiakr.com/loading32x32.gif" width="25"></div>');
        var pageTotal = Math.ceil(count/20);
        if(pageTotal>1){
            new LoadDataByScroll({
                pageTotal:pageTotal,
                loadFn:function(pageNum){
                    pms.index = (pageNum-1)*20+'';
                    $.post("getStockListForCustomer.json", pms, function(data){
                        if(data.status ==='1') return;
                        var tempData={
                            list : data.result.stockList
                        }
                        var htmlStr = template('tempData', tempData);
                        $('.stockList ul').append(htmlStr);
                    })
                },
                endFn:function(){
                    $('#loadingWrap').html('<div class="tc p20 c-8">没有更多了</div>');
                }
            })
        }
      },
      initSidebarMenu:function(){
        
        var menusList=[], ajaxNum = 0, hasBrands=false;

        var pms1 = {
          storeId: getUrlParam('storeId'),
          orderName: 'off_time',
          orderType: 'desc',
          index: '0',
          length: '20',
          salesId: $("input[name='salesId']").val(),
        };
        var pms = {storeId: pms1.storeId},
          link = 'getStockListForCustomer.htm?storeId='+pms1.storeId+'&orderName=off_time&orderType=desc&index=0&length=20&salesId='+pms1.salesId;

        var PRO_LIST_LINK = 'getStockListForCustomer.htm?storeId='+pms1.storeId+'&orderName=off_time&orderType=desc&index=0&length=20&salesId='+pms1.salesId;
        // 默认三个菜单
        var menuData = [
          {text:'全部商品',link:PRO_LIST_LINK},
          {text:'新品上市',link:PRO_LIST_LINK+'&tags=新品'},
          {text:'特价促销',link:PRO_LIST_LINK+'&tags=特价'},
        ];

        var menu1 = [],menu2 = [],menu3 =[];
        menu1 = menuData.concat(menu1);

        // 品牌
        menu1.push({text:'品牌', id:'PP', type:'brand'});
        menu2.push(PAGE_CONF.brands.map(function(v){
          return {text:v.brandName, link:PRO_LIST_LINK+'&brandId='+v.id, rootid:'PP', type:'brand'};
        }) || []);
        console.log(PAGE_CONF);
        if(PAGE_CONF.supplier.displayType === 1 && PAGE_CONF.groups && PAGE_CONF.groups.length){
          // 分类
          PAGE_CONF.groups.forEach(function(gv){
            gv.firstLevel && gv.firstLevel.length && gv.firstLevel.forEach(function(v){
              menu1.push({text:v.groupName, link:PRO_LIST_LINK+'&groupId='+v.groupId, id:v.groupId, type:'group'});
            });

            if(gv.secondLevel && gv.secondLevel.length && gv.secondLevel.length){

              gv.secondLevel.unshift({groupName: "全部", link:PRO_LIST_LINK, rootId: gv.secondLevel[0].rootId,groupId: gv.secondLevel[0].rootId, type:"group"});

              menu2.push(gv.secondLevel.map(function(v){
                return {text:v.groupName, link:PRO_LIST_LINK+'&groupId='+v.groupId, rootid:v.rootId, id:v.groupId, type:"group"};
              }));
            }
            if(gv.thirdLevel && gv.thirdLevel.length && gv.thirdLevel.length){

              gv.thirdLevel.unshift({groupName: "全部", link:PRO_LIST_LINK, rootId: gv.thirdLevel[0].rootId,groupId: gv.thirdLevel[0].rootId, type:"group"});

              menu3.push(gv.thirdLevel.map(function(v){
                return {text:v.groupName, link:PRO_LIST_LINK+'&groupId='+v.groupId, rootid:v.rootId, id:v.groupId, type:'group'};
              }));
            }
          });
        }else{
          // 类目
          PAGE_CONF.categorys.forEach(function(v){
            menu1.push({text:v.categoryFamily.familyName, id:v.categoryFamily.id, link:'', type:'category'});
            menu2.push(v.categoryVoList.map(function(item){ 
              return {text:item.category.name, type:'category', rootid:item.category.familyId, link:PRO_LIST_LINK+'&categoryIds='+item.category.id+'&categoryName='+item.category.name};
            }));
          });
        }

        $('#menu1Box').html(template('sidebarMenuTpl', {data:menu1, isMenu1:true}));

        menu2.length && $('#m2ScrollView').html(template('sidebarMenuTpl', {data:menu2, isMenu1:false}));
        menu3.length ? $('#m3ScrollView').html(template('sidebarMenuTpl', {data:menu3, isMenu1:false})):$('#menu3Box').remove();
      },
      loadClassAndSearch: function(){
        $('#searchWrap').html(template("m_search", {show:true,orderNum:-10,}));
          $('body').on('click', '.search_input', function(){ 
          var $searchBox = $(".searchBox.stock");
          $searchBox.show();
          $searchBox.find("input[type=search]").focus();
          $searchBox.find(".s-cancel").on('click', function(){
            $searchBox.hide();
          });
        });

        this.initSidebarMenu();
        this.chkSidebarMenuEv();//判断是否有2级
        $('#categoryMenu').on('click', function() {
            $.msg.actions({
              content: $('#sidebarMenusBox'),
              position: 'left',
              clsIn: 'slideInLeft',
              clsOut: 'slideOutLeft',
              width: '100%',
              bodyStyle: 'position: absolute; z-index: 500; top: 0;right: 0;bottom: 0;left: 0; background-color:#fff; padding:0; overflow:hidden;',
              onOpened: function(oThis) {
                scrollM1 = new iScroll('#menu1Box',{click:true, snap:'li'});
                $('#menu2Box .sidebar-ul').length && (scrollM2 = new iScroll('#menu2Box',{click:true, snap:'li'}));
                $('#menu3Box .sidebar-ul').length && (scrollM3 = new iScroll('#menu3Box',{click:true, snap:'li'}));

                $('#btnSidebarClose').off().on('click', function(){ $.msg.actions(); });

                $('#menu1Box .sidebar-li').removeClass('active').eq(3).addClass('active');
                var $firstM2 = $('#menu2Box .sidebar-ul').hide().eq(0).show();

                debounce(function(){scrollM2 && scrollM2.refresh();}, 200)();
              },
              hasCloseBtn: false,
              cacheIns: true
            });
        });
        $('.hasClass').on('click', function(){ 
          $('#categoryMenu').trigger('click'); 
        })
      },
      chkSidebarMenuEv:function(){
        var centerYOffset = Math.floor(((window.document.documentElement.clientHeight-40)/44-1)/2)*44;
        var m2Timmer = null;

        $('#menu1Box').on('click', '.sidebar-li', function(e){
          var $el = $(this), i = $el.index();
          var mid = $el.data('id'), type = mid.split('_')[0];

          // 判断是否有二级
          var $m2items = $('#menu2Box').find('[data-id="'+mid+'"]');
          if(!$m2items.length){
            return true;
          }else{
            e.preventDefault();
          }

          // 调整宽度
          if(type == 'group'){
            $('#menu2Box').css('width','1.0666rem');
          }else{
            $('#menu2Box').css('width','2.1333rem');
          }

          var allCount = $('#menu1Box .sidebar-li').length;
          var scrollY = scrollM1.y;
          var offsetA = i*44;
          var offsetB = Math.abs(scrollY)+centerYOffset;

          $('#menu1Box .sidebar-li').removeClass('active');
          $el.addClass('active');
          $('#menu2Box .sidebar-ul').hide();

          $m2items.parent().show();

          if(allCount - (i+1)<=6){
            scrollM1.scrollToElement($('#menu1Box .sidebar-li').last()[0],500);
          }else if(i+1<=6){
            scrollM1.scrollTo(0, 0, 500);
          }else{
            scrollM1.scrollTo(0, (offsetB-offsetA+scrollY), 500);
          }

          debounce(function(){scrollM2 && scrollM2.refresh()}, 200)();
        })


        $('#menu2Box').on('click', '.sidebar-li', function(e){
          var $el = $(this), i = $el.index();
          var $m3lis = $('#menu3Box').find('[data-id="group_'+$el.data('cid')+'"]');
          if(!$m3lis.length){
            return true;
          }else{
            e.preventDefault();
          }

          $('#menu2Box .sidebar-li').removeClass('active');
          $el.addClass('active');
          $('#menu3Box .sidebar-li').hide();
          $m3lis.show();

          debounce(function(){scrollM3 && scrollM3.refresh()}, 200)();
        })
      },
  };

  return { init: function(){  p_getStockList.init(); }};
});