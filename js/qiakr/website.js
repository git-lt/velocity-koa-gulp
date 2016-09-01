/**
 * [项目启动文件]
 */
define(['toastr','webuploader','bootstrap','app','mmRouter','select2_3','niceV','sweetalert','summernote','tagsinput','maxlength'],function(toastr, WebUploader){
var siteMap, p_main, CONFIG, subPageName, mainVM;
subPageName = {
  'list':'教程列表',
  'edit':'编辑教程',
  'create':'创建教程'
}

CONFIG={
  apiFileUp: '../admin/fileUpload.json',
  apiFilesUp: '../admin/filesUpload.json',
  apiCreate: 'createQiakrVideo.json',
  apiUpdate: 'updateQiakrVideo.json',
  apiDelete: 'deleteQiakrVideo.json',
  apiGetDetail: 'getQiakrVideoById.json',
  apiGetList: 'getQiakrVideoList.json',
  apiPublish: 'publishQiakrVideo.json',
}

avalon.filters.getPageName = function(v){
  return subPageName[v] || '';
};

avalon.filters.splitLevel = function(levels){
  return levels.split('_').join('<br>');
}
avalon.filters.leveljoin = function(levels){
  return levels.split('_').join('、');
}

/**
 * Loading
 */
;(function($) {
    "use strict";
    /**
    Loading Widget
    */
    var QKLoading = function(el) {
        this.$el = $(el);
    };
    QKLoading.prototype.show = function() {
        this.$el.append('<div class="panel-disabled"><div class="loader-1"></div></div>');
    };
    QKLoading.prototype.hide = function() {
        var $pd = this.$el.find('.panel-disabled');
        $pd.fadeOut('fast', function () {
            $pd.remove();
        });
    };

    $.fn.qkLoading =function(action){
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function(){
            var $this = $(this),
                data = $this.data('qkLoading');
            if(!data) $this.data('qkLoading',(data = new QKLoading(this)));
            if(typeof action === 'string')
                data[action].apply(data,args);
        });
    }
})(jQuery);

/**
* 文件上传组件
*/
;(function($, WebUploader){
  'use strict';
  function FileUploader(ele, opt){
    this.$el = $(ele);
    this.$pick = this.$el.find(opt.pickCls);
    this.o = opt;
    this.uploader=null;
    this.init();
  };

  // 可以是图片，也可以是文件, 可以是单个，也可以是多个
  FileUploader.DEFAULTS = {
    token: $('#uptoken').val(),
    swfPath:'//res.qiakr.com/plugins/webuploader/Uploader.swf',
    serverPath:CONFIG.apiFileUp,
    resultInput:'#vidoePic',
    fileSingleSizeLimit:1000*100,
    pickCls:'#filePicker',
    multipleable:false,
    extensions:'gif,jpg,jpeg,png',
    mimeTypes:'image/*',
    thumbW:260,
    thumbH:160,
    compressW:100,
    compressH:100,
    compressSize:1000*100,
    fileQueuedEv:function(file){
      // 预览
      var oThis = this, $img = this.$el.find('.ui_image_preview');

      oThis.uploader.makeThumb(file, function( error, src ) {
       if ( error ) {
        $img.replaceWith('<span>不能预览</span>');
        return;
       }
       $img.attr( 'src', src );
      }, oThis.o.thumbW,  oThis.o.thumbH);
    },
    uploadStartEv:function(){
      var oThis = this, $imgWrap = this.$el.find('.ui-webuploader-imgwrap');

      var $progress = $imgWrap.find('.progress-bar');

      if(!$progress.length){
        $imgWrap.append('<div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><span>0%</span> </div>'); 
      }
    },
    uploadProgressEv:function(file, percentage){
      var $progerssBar = this.$el.find('.progress-bar');
      $progerssBar.css('width', percentage * 100 + '%').find('span').text(percentage * 100 + '%');
    },
    uploadSuccessEv:function(file, response){
      var oThis = this;
      setTimeout(function(){
        oThis.$el.find('.progress-bar').fadeOut('slow',function(){ $(this).remove()});
      }, 1000)
      if(response.status==='0'){
        this.$el.find(oThis.o.resultInput).val(response.result.url);
        toastr.success('图片上传成功');
      }else{
        toastr.error('图片上上传失败，请重试！')
      }
    },
    uploadErrorEv:function(file, reason){
      toastr.warning('上传出错：'+reason);
    },
    uploadCompleteEv:function(file){
      this.uploader.reset();
    },
    errorEv:function(type){
      var msg = '';
      switch(type){
        case 'Q_EXCEED_NUM_LIMIT':
          msg = '文件个数超限，请重试！';
          break;
        case 'F_EXCEED_SIZE': 
        case 'Q_EXCEED_SIZE_LIMIT':
          msg = '文件大小超限，请重试！';
          break;
        case 'Q_TYPE_DENIED':
          msg = '文件类型不符，请重试！';
          break;
        case 'F_DUPLICATE':
          msg = '请勿重复上传！';
          break;
      }
      if(msg){
        toastr.warning(msg); 
      }else{
        toastr.warning('文件上传失败:( '+type); 
      }
    }
  };

  FileUploader.prototype={
    constructor:FileUploader,
    init:function(){
      this.uploader = WebUploader.create(this.getConfig());
      this.addEvents(this.uploader);
    },
    getConfig:function(){
      var o = this.o, config;
      config = {
        auto:true,
        swf: o.swfPath,
        server: o.serverPath,
        prepareNextFile:true,
        disableGlobalDnd:true,
        fileNumLimit: o.fileNumLimit,
        fileSizeLimit: o.fileSizeLimit,
        fileSingleSizeLimit: o.fileSingleSizeLimit,
          pick:{
              id:this.$pick[0],
              multiple : o.multipleable
          },
          formData : {
              'token': o.token
          },
        accept:{
          title: 'limitTypes',
          extensions: o.extensions,
          mimeTypes: o.mimeTypes
        },
        thumb:{
          crop: true,
          type: 'image/png'
        },
        compress:{
              width: o.compressW,
              height: o.compressH,
              quality: 90,
              compressSize: o.compressSize
        }
      };
      return config;
    },
    addEvents:function(uploader){
      var o = this.o; 
      o.fileQueuedEv && typeof o.fileQueuedEv === 'function' && uploader.on('fileQueued', o.fileQueuedEv.bind(this));
      o.uploadStartEv && typeof o.uploadStartEv === 'function' && uploader.on('uploadStart', o.uploadStartEv.bind(this));
      o.uploadProgressEv && typeof o.uploadProgressEv === 'function' && uploader.on('uploadProgress', o.uploadProgressEv.bind(this));
      o.uploadErrorEv && typeof o.uploadErrorEv === 'function' && uploader.on('uploadError', o.uploadErrorEv.bind(this));
      o.uploadSuccessEv && typeof o.uploadSuccessEv === 'function' && uploader.on('uploadSuccess', o.uploadSuccessEv.bind(this));
      o.uploadCompleteEv && typeof o.uploadCompleteEv === 'function' && uploader.on('uploadComplete', o.uploadCompleteEv.bind(this));
      o.errorEv && typeof o.errorEv === 'function' && uploader.on('error', o.errorEv.bind(this));
    }
  };

  $.fn.fileUploader = function(option){
    return this.each(function(){
      var $this = $(this);
      var data = $this.data('baidu-fileUploader');
      var options = $.extend({}, FileUploader.DEFAULTS, typeof option === 'object' && option);

      if (!data) $this.data('baidu-fileUploader', (data = new FileUploader(this, options) ));
      if (typeof option === 'string') data[ option ].apply(data, arguments);
    });
  }
})(jQuery, WebUploader)


mainVM = avalon.define({
  $id:'mainCtr',
  params:{},
  query:{},
  currPage:'video',
  subPage:'',
  breadcrumb:'',
  createData:{
    videoPic:'https://qncdn.qiakr.com/website/video_default_face.png',
    videoUrl:'',
    mainTitle:'',
    viceTitle:'',
    courseTag:'',
    teacher:'',
    duringTime:'',
    supplierLevel:'',
    courseFee:'',
    courseDescription:'',
    type:1,
    status:'2',
    id:'',
    gmtCreate:'',
    gmtUpdate:'',
    sort:0,
  },
  renderedFn:function(){
    p_main.initVideo();
  },
  listData: [],
  tblTotal:'',
  searchPms: {
    index:0,
    lenght:30,
    status:'',
    type:'',
    fuzzyName:''
  },
  previewData:{},
  changeStatusEv:function(type){
    mainVM.searchPms.type = type;
  },
  createEv:function(e,id){/* 新增 或 修改 */
    var _this = $(this);
    $('#videoFrm').trigger("validate");
    e.preventDefault();
  },
  previewEv:function(e, id){/*预览*/
    var preData = mainVM.listData.filter(function(v){
      if(v.id == id)
        return v;
    })[0];

    mainVM.previewData = $.extend({}, preData.$model);
    e.preventDefault();
  },
  publishEv:function(e, id){/*发布*/
    $.post(CONFIG.apiPublish, {qiakrVideoId:id, status:'2'})
    .done(function(data){
      if(data.status==='0'){
        toastr.success('发布成功');
        mainVM.listData.forEach(function(v){
          if(v.id == id) v.status = 2;
        })
      }else{
        toastr.success('发布失败');
      }
    })
    .fail(function(data){
      toastr.error('发布失败');
    });
    e.preventDefault();
  },
  unPublishEv:function(e, id){/*取消发布*/
    $.post(CONFIG.apiPublish, {qiakrVideoId:id, status:'1'})
    .done(function(data){
      if(data.status==='0'){
        toastr.success('成功取消发布');
        mainVM.listData.forEach(function(v){
          if(v.id == id) v.status = 1;
        })
      }else{
        toastr.success('取消发布失败');
      }
    })
    .fail(function(data){
      toastr.error('取消发布失败');
    });
    e.preventDefault();
  },
  deleteEv:function(e, id){/*删除*/
    swal({   
        title: "你确定？！",   
        text: "是否确定删除这条内容，删除后将无法恢复！",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        cancelButtonText: "暂不删除", 
        confirmButtonText: "删除",  
        closeOnConfirm: false,   
        closeOnCancel: true,
    }, function(isConfirm){ 
        if(isConfirm){
           // swal("成功！", "该记录已经删除了", "success"); 
          $.post(CONFIG.apiDelete, {qiakrVideoId:id})
          .done(function(data){
            if(data.status==='0'){
              swal({   
                  title: "成功！",   
                  text: "该记录已经删除了!",   
                  type: "success",   
                  closeOnConfirm: true 
              }, function(){   
                  $('#tr'+id).fadeOut('slow',function(){ $(this).remove() });
              });
            }else{
              swal({   
                  title: "失败！",   
                  text: "数据删除失败，请重试!",   
                  type: "error",   
                  closeOnConfirm: true 
              });
            }
          })
          .fail(function(data){
            swal("失败！", "数据删除失败，请重试!", "error"); 
          })
        }
    });
  },
  searchEv:function(e){/*搜索*/
    e.preventDefault();
    p_main.getListData();
  },
  searchEnterEv:function(e){/*回车搜索*/
    if(e.keyCode==13){
      e.preventDefault();
      p_main.getListData();
    }
  },
  editEv:function(e, id){/*编辑*/
    e.preventDefault();
    var editData = mainVM.listData.filter(function(v){
      if(v.id == id)
        return v;
    })[0];

    mainVM.createData = $.extend({}, editData.$model);

    // 设置slt的值 
    $('[name="type"]').val(mainVM.$model.createData.type).trigger('change');
    var levels = mainVM.$model.createData.supplierLevel.split('_');

    $('[name="supplierLevel"]').val(levels).trigger('change');

    // 设置summernote的值
    $('#summernote').summernote('code',mainVM.$model.createData.courseDescription);
    $('#courseTag').tagsinput('add',mainVM.$model.createData.courseTag.split('_').join(','));

    avalon.router.navigate('/video/edit/'+id);
  },
  sortEv:function(e){}
});

mainVM.$watch('subPage', function(page){
  if(page=='create'){
    p_main && p_main.frmReset && p_main.frmReset();
  }else if(page == 'list'){
    p_main && p_main.getListData && p_main.getListData();
  }
});

var oldPage = '';
function callback(){
  oldPage = mainVM.currPage;
  mainVM.params = this.params;
  mainVM.path = this.path;
  mainVM.query = this.query;

  var pathArr = this.path.substring(1).split('/');
  mainVM.currPage = pathArr[0];
  if(pathArr.length>=2){
    mainVM.subPage = pathArr[1];
  }
}

function goHome(){ avalon.router.navigate('/video/list');}

avalon.router.get("/", goHome);
avalon.router.get("/video/list", callback);
avalon.router.get("/video/create", callback);
avalon.router.get("/video/edit/:id", callback);

//启动路由
avalon.history.start();
avalon.scan();

p_main = {
  init:function(){
  },
  initVideo:function(){
    this.initComs();
    this.sltChangeEv();
    this.frmValiEv();

    this.typeChangeEv();
    this.getListData();
    this.initUploader();
  },
  typeChangeEv:function(){
    var self = this;
    $('#supplierLevelBox a').on('click',function(e){
      mainVM.searchPms.type = $(this).data('filter');
      $(this).addClass('current').siblings().removeClass('current');
      self.getListData();
    })
  },
  frmValiEv:function(){/*注册表单验证事件*/
    var self = this;
    $('#videoFrm').on('valid.form', function(e, form){
      //这里判断，是否有id，有则为修改， 没有则为新增
      // 判断是 新增 还是 更新
      // 保存至服务器
      var pms = $.extend({},mainVM.$model.createData), isCreate = typeof mainVM.$model.params.id === 'undefined';

      // 处理一下标签连接符 courseTag supplierLevel
      pms.courseTag = pms.courseTag ? pms.courseTag.split(',').join('_'):'';
      pms.supplierLevel = $.isArray(pms.supplierLevel) ? pms.supplierLevel.join('_'):pms.supplierLevel;
      //xss过滤
      pms.courseDescription = avalon.filters.sanitize(pms.courseDescription);
      var api = isCreate ? CONFIG.apiCreate : CONFIG.apiUpdate;
      // 添加 更新ID
      if(!isCreate) pms.qiakrVideoId = pms.id;
      // 去掉七牛后缀
      pms.videoPic = pms.videoPic.split('?')[0];
     
      $.post(api,pms).done(function(data){
        if(data.status==='0'){
          swal({   
            title: "干的漂亮！",   
            text: isCreate ? "添加教程成功 :)":'修改教程成功 :)',   
            type: "success",   
            showCancelButton: true,   
            confirmButtonColor: "#DD6B55",   
            confirmButtonText: "去列表看看",   
            cancelButtonText: isCreate ? "继续添加":'取消',   
            closeOnConfirm: true,   
            closeOnCancel: true 
            }, function(isConfirm){   
              if (isConfirm) {     
                avalon.router.navigate('/video/list');
                p_main.getListData();
              } else {     
                isCreate && p_main.frmReset();  
              } 
          });
        }
      }).fail(function(data){
        toastr.error(data.message || '服务器繁忙，请尝试重新提交！');
      });

    });
  },
  frmReset:function(){
    mainVM.createData.videoPic='https://qncdn.qiakr.com/website/video_default_face.png';
    mainVM.createData.videoUrl='';
    mainVM.createData.mainTitle='';
    mainVM.createData.viceTitle='';
    mainVM.createData.courseTag='';
    mainVM.createData.teacher='';
    mainVM.createData.duringTime='';
    mainVM.createData.supplierLevel='';
    mainVM.createData.courseFee='';
    mainVM.createData.courseDescription='';
    mainVM.createData.type=1;
    mainVM.createData.status='2';
    mainVM.createData.id='';
    mainVM.createData.gmtCreate='';
    mainVM.createData.gmtUpdate='';
    $('#summernote').summernote('code','');
    $('#courseTag').tagsinput('removeAll');
    $('[name="supplierLevel"]').val([]).trigger('change');
  },
  uploadImg4sum:function(files, editor){
      var data = new FormData(),filesArr=[],$sum=$('#summernote');

      data.append("file", files[0]);
      $.ajax({
          data: data,
          type: "POST",
          url: CONFIG.apiFileUp,
          cache: false,
          contentType: false,
          processData: false,
          success: function(data) {
            console.log(data);
            if(data.status==='0'){
              $sum.summernote('insertImage', data.result.url);
            }else{
              toastr('上传图片失败！');
            }
          }
      });
  },
  initComs:function(){
    var self = this;
    $(".select2").select2();
    $('.limit-num').maxlength({ threshold: 20 });
    $('#courseTag').tagsinput();
    $('#summernote').summernote({
      lang: 'zh-CN',
      placeholder: '视频详情内容...',
      minHeight: 350,
      maxHeight: 800,
      focus: false,
      callbacks: {
        onImageUpload: function(files) {
          self.uploadImg4sum(files);
        },
        onChange:function(contents, $editable){
          if(contents.lenght>2000){
            toastr.warning('描述信息输入过长，请小于2千个字符！');
          }
          mainVM.createData.courseDescription = avalon.filters.sanitize(contents).substring(0, 2001);
        }
      }
    });
  },
  sltChangeEv:function(){
    $('[name="type"]').on('change', function(){
      mainVM.createData.type=$(this).val();
    })

    $('[name="supplierLevel"]').on('change', function(){
      mainVM.createData.supplierLevel=$(this).val();
    })
  },
  initUploader:function(){
    setTimeout(function(){
      $('#videoPicUploaderWrap').fileUploader({
        thumbW:320,
        thumbH:180,
      });
    }, 200);
  },
  getListData:function(){/*获取数据列表*/
    var pms = mainVM.$model.searchPms;
    $.post(CONFIG.apiGetList, pms)
    .done(function(data){
      if(data.status==='0'){
        console.log(data);
        mainVM.tblTotal = data.result.count;
        mainVM.listData.clear();
        data.result.qiakrVideoList.map(function(v){
          // v.videoPic = avalon.filters.processImg(v.videoPic, 'video', 320, 180);
          mainVM.listData.push(v);
        });

        var totalP = Math.ceil(data.result.count/pms.length);
        if(totalP>1){
          $('#navPagesNumBox').data({'opt':pms, 'url':CONFIG.apiGetList});

          $('#navPagesNumBox').data('twbs-pagination','').off().empty().twbsPagination({
              totalPages: totalP,
              startPage: 1,
              visiblePages: 10,
              onPageClick:function(e, num){
                var info = $('#navPagesNumBox').data(),
                    opt = info.opt,
                    postUrl = info.url;
                opt.index = (num-1)*opt.length;

                $('#videosTbl').qkLoading('show');
                $.post(postUrl,opt).done(function(data){
                  mainVM.listData.clear();
                  data.result.qiakrVideoList.map(function(v){
                    v.videoPic = avalon.filters.processImg(v.videoPic, 'video', 320, 180);
                    mainVM.listData.push(v);
                  });
                  $('#videosTbl').qkLoading('hide');
                }).fail(function(){
                  $('#videosTbl').qkLoading('hide');
                });
              }
          });
        }else{
          $('#navPagesNumBox').html('');
        } 
      }else{
        toastr.error('获取教程列表失败');
      }
      $('[data-toggle="tooltip"]').tooltip();
    });
  }
}

return {
  init:function(){
    p_main.init();
  }
};

});






