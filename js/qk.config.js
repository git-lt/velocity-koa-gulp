require.config({
    // urlArgs:{
    //    jquery:"?v=1.4.4" 
    // }
  baseUrl:"../js",
  paths: {
    utils:'qk.utils',
    momentPicker:'datePicker',
    WdatePicker:"//res.qiakr.com/plugins/My97DatePicker/WdatePicker",
    jquery: "//res.qiakr.com/plugins/jquery/jquery-2.0.0.min",
    mmRouter:"//res.qiakr.com/plugins/avalon/mmRouter.min",
    mmHistory:"//res.qiakr.com/plugins/avalon/mmHistory.min",
    cookie: "//res.qiakr.com/plugins/jquery/jquery.cookie.min",
    common:'//res.qiakr.com/plugins/admin/qk.common-1.0.0.min',
    jquery_1_9:'//res.qiakr.com/plugins/jquery/jquery-1.9.1.min',
    bootstrap: "//res.qiakr.com/plugins/bootstrap/bootstrap3.0.3.min",
    select2:'//res.qiakr.com/plugins/select2/select2-4.0.3.min',
    select2_3:'//res.qiakr.com/plugins/select2/select2-3.5.2.min',
    AppNavigation:'//res.qiakr.com/plugins/app/AppNavigation',
    App:'//res.qiakr.com/plugins/app/App',
    avalon:"//res.qiakr.com/plugins/avalon/avalon.shim.min",
    moment:'//res.qiakr.com/plugins/moment/moment-2.10.6.min',
    maxlength:"//res.qiakr.com/plugins/bootstrap/bootstrap-maxlength.min",
    tagsinput:"//res.qiakr.com/plugins/bootstrap/bootstrap-tagsinput.min",
    webuploader: "//res.qiakr.com/plugins/webuploader/webuploader-0.1.5.min",
    daterangepicker: "//res.qiakr.com/plugins/daterangepicker/daterangepicker.min",
    niceV:'//res.qiakr.com/plugins/validator/jquery.validator-0.7.3.min',
    validate:'//res.qiakr.com/plugins/validate/jquery.validate.min',
    io: "//res.qiakr.com/plugins/socket/socket.io.min",
    location:'//res.qiakr.com/plugins/location/location',
    toastr : "//res.qiakr.com/plugins/toastr/toastr",
    swiper:'//res.qiakr.com/plugins/swiper/swiper-3.0.7.min',
    charcount:'//res.qiakr.com/plugins/charcount/jquery.charcount.min',
    qrcode:'//res.qiakr.com/plugins/qrcode/qrcode.min',
    jqueryui:'//res.qiakr.com/plugins/jquery-ui/jquery-ui-1.8.22.min',
    kindeditor:'//res.qiakr.com/plugins/kindeditor/kindeditor-full.min',
    dialog: "//res.qiakr.com/plugins/dialog/dialog-6.0.5.min",
    template: "//res.qiakr.com/plugins/artTemplate/artTemplate.min",
    echarts: '//res.qiakr.com/plugins/echarts/echarts-all.min',
    datatables: "//res.qiakr.com/plugins/dataTables/jquery.dataTables.min",
    colVis : "//res.qiakr.com/plugins/dataTables/dataTables.colVis.min",
    fixedColumns : "//res.qiakr.com/plugins/dataTables/dataTables.fixedColumns.min",
    scroller : "//res.qiakr.com/plugins/dataTables/dataTables.scroller.min",
    twbsPagination:'//res.qiakr.com/plugins/twbsPagination/jquery.twbsPagination-1.0.0.min',
    AppCard:'//res.qiakr.com/plugins/app/AppCard',
    spin : "//res.qiakr.com/plugins/spin/spin.min",
    datePicker:'//res.qiakr.com/plugins/datePicker/jquery.datePicker.min',
    xss:'//res.qiakr.com/plugins/xss/xss.min',
    app:"//res.qiakr.com/plugins/app/jquery.app.min",
    sweetalert:'//res.qiakr.com/plugins/sweetalert/sweetalert.min',
    summernote:"//res.qiakr.com/plugins/summernote/summernote.min",
    slimscroll:'//res.qiakr.com/plugins/slimscroll/jquery.slimscroll.min',
    zclip:'//res.qiakr.com/plugins/zclip/jquery.zclip.min',
    fancybox: 'http://cdn.bootcss.com/fancybox/2.1.5/jquery.fancybox',
    clockpicker: '//res.qiakr.com/plugins/clockpicker/jquery-clockpicker.min',
    sortable:'//res.qiakr.com/plugins/sortable/sortable-1.10.4.min',
    m_decoration:'admin/m_decoration',
    m_uploader:'admin/m_uploder',
    mod_decorationMods:'admin/mod_decorationMods',
    fileUploader: 'qiakr/fileUploaderWeb',
    powerSeleteDia:'admin/mod_powerSelectDia',
    categorySelectDia:'admin/mod_categorySelectDia',
    couponDia:'admin/mod_couponEditDia'
  },
  shim:{
    bootstrap: {deps:['jquery']},
    common:{deps:['jquery']},
    cookie:{deps:['jquery']},
    select2:{deps:['jquery']},
    select2_3:{deps:['jquery']},
    niceV:{deps:['jquery']},
    validate:{deps:['jquery']},
    maxlength:{deps:['jquery']},
    tagsinput:{deps:['jquery']},
    summernote:{deps:['jquery']},
    jqueryui:{deps:['jquery']},
    charcount:{deps:['jquery']},
    kindeditor:{deps:['webuploader']},
    daterangepicker:{deps:['jquery']},
    App: {deps:['jquery']},
    AppNavigation: {deps:['App']},
    AppCard: {deps:['App']},
    echarts: {deps:['avalon']},
    slimscroll: {deps:['jquery']},
    dialog: {deps:['jquery']},
    app:{deps:['jquery','bootstrap','slimscroll']},
    clockpicker: {deps:['jquery']},
    datePicker: {deps:['jquery']},
    twbsPagination: {deps:['jquery']}
  },
  debug:true,
  charset: 'utf-8'
});


/**
 * GLOBAL CONFIG
 */
var GLOBAL_CONFIG={
  host:location.hostname.indexOf("qiakr") >-1 ? "http://"+location.hostname+"/" : "http://"+location.hostname+"/xmall/",
  cdn:"https://qncdn.qiakr.com/",
  cdnPrivate:"http://export.qiakr.com/",
  uploadServer:location.protocol==="https:" ? 'https://up.qbox.me/' : 'http://up.qiniu.com/',
  defaultAavatar:'https://qncdn.qiakr.com/mall/default-photo.png',
  defaultProduct:'https://qncdn.qiakr.com/admin/placeholer_300x300.gif',
  defaultVideo:'https://qncdn.qiakr.com/website/video_pic_ph.jpg',
  kuaichaId:"108386",
  kuaichaSecret:"e5f4bb052cc515e85f217f7fc9d7d580",
};

var ERRMSG={
  '100':'服务器繁忙，请稍候再试!'
};



