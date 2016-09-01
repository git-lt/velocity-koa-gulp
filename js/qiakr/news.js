define(function(){
  var CONF, pageVM, page;

  CONF={
    apiGetList:'getArticlesList.json',
    apiDelete:'delArticles.json',
    apiUpdateStatus: 'updateArticlesStatus.json'
  }

  page = {
    init:function(){
      this.tabEv();
      this.delEv();
      this.updateStatusEv();

      this.getListData();
    },
    tabEv:function(){
      var _this = this;
      $('#newsTypeBox').on('click', 'a', function(){
        var $this = $(this);
        if(!$this.hasClass('current')){
          $this.addClass('current').siblings().removeClass('current');
          _this.getListData();
        }
      })
    },
    getListData:function(){
      var pms = {
        index: 0,
        length: 20,
        tag:$('#newsTypeBox a.current').data('tag')+'',
      }

      var $tbdBox = $('#newsListTbd'),
          $pageBox = $('#newsPagesBox'),
          $tblBox = $('#newsTbl'),
          tplId = 'newsTblListTpl',
          $total = $('#newsTblTotal'),
          url = CONF.apiGetList;

      $tblBox.uiLoading('lg');

      $.post(url, pms)
        .done(function(data){
          if(data.status==='0'){
            var listData = data.result.articlesList,
                count = data.result.count;

            $total.text(count);

            if(count>0){
              $tbdBox.html(template(tplId, {data: listData}));

              if(count >= pms.length){
                $pageBox.pagination({
                  totalData:count,
                  showData:30,
                  coping:true,
                  callback:function(i){
                    pms.index = (i-1)*pms.length;
                    $tbl.uiLoading('lg');

                    $.post(url, pms)
                      .done(function(data){
                        $tbdBox.html(template(tplId, {data: data.result.articlesList}));
                        $tbl.uiLoading('lg');
                      });
                  }
                });
              }
            }else{
              $tbdBox.html('<tr><td colspan="7"><p class="p20 c-8 text-center"> 未查询到相关数据 </p></td></tr>');
              $pageBox.html('');
            }
          }
        })
        .always(function(){
          $tblBox.uiLoading('lg');
        })
    },
    delEv:function(){
      var _this = this;
      $('#newsListTbd').on('click', '.delete', function(){
        var id = $(this).data('id');
        var $tr = $(this).closest('tr');

        Utils.confirm("是否确认删除？",function(){
          $.post(CONF.apiDelete, {id:id})
            .done(function(data){
              if(data.status === '0'){
                toastr.success('操作成功');
                _this.getListData();
              }else{
                toastr.error(data.errmsg || ERRMSG['100']);
              }
            })
        });

      })
    },
    updateStatusEv:function(){
      $('#newsListTbd').on('click', '.publish', function(){
        var $this = $(this);
        var id = $this.data('id');
        var isPub = $this.text()=='发布上线';
        status = isPub ? 0 :  1;
        $.post(CONF.apiUpdateStatus, {id:id, status:status+''})
          .done(function(data){
            if(data.status === '0'){
              toastr.success('操作成功');
              $this.text(isPub ? '取消发布': '发布上线');
            }else{
              toastr.error(data.errmsg || ERRMSG['100']);
            }
          })
      })
    }
  }

  return {
    init: function(){
      page.init();
    }
  }
})


