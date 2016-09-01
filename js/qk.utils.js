/**
 * Utils / Filters / Components Config
 */
define(['common','cookie','validate','avalon'],function(){
	/**
	 * Utils
	 */
	var Utils={
		cdn:"https://qncdn.qiakr.com/",
		uploadServer:location.protocol==="https:" ? 'https://up.qbox.me/' : 'http://up.qiniu.com/',
	    chartsDataFormat:function(list){
	        var res = {};
	        for(var i in list[0]){
	            res[i] = [];
	        }
	        $.each(list,function(i,e){
	            for(var i in e){
	                res[i].push(e[i]);
	            }
	        });
	        return res;
	    },
	    obj2UrlPms:function(obj){
	        var str=[];
	        for(var i in obj){
	            str.push(i+'='+obj[i]);
	        }
	        return str.join('&');
	    },
	    getLocalTime:function(ms,day){
	        if(!ms){
	            return "";
	        }
	        ms = Number(ms);
	        var _date = new Date(ms);
	        var year=_date.getFullYear(),
	            month=_date.getMonth()+1,
	            date=_date.getDate(),
	            hour=_date.getHours(),
	            minute=_date.getMinutes(),
	            second=_date.getSeconds();
	        return year+"-"+(month<10 ? ("0"+month) : month)+"-"+(date<10 ? ("0"+date) : date)+ 
	            (!day ? (" "+(hour<10 ? ("0"+hour) : hour)+":"+(minute<10?("0"+minute):minute)+":"+(second<10?("0"+second):second)) : ""); 
	    },
	    obj2Array:function(obj){
	    	if(!obj) return [];
	    	var arr=[];
	    	for(var i in obj){
	    		arr[i] = obj[i];
	    	}
	    	return arr;
	    },
	    getUnixTime:function(localTime){
	        return !localTime ? "" : new Date(localTime.replace(/-/g,'/')).getTime();
	    },
	    getUrlParam: function(key){
	        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
	        var r = window.location.search.substr(1).match(reg);
	        return r ? decodeURIComponent(r[2]) : "";
	    },
	    QNCropSuffix:function(url, width, height, type){
	      if(!url || url.length<5 || url.indexOf('imageView2')>-1 || !width) return url;
	      var qnSuffix = 'imageView2/'+(type?type:1)+'/w/'+width;
	      if(height) qnSuffix += '/h/'+height;

	      return url.indexOf('?')>-1?url+'&'+qnSuffix:url+'?'+qnSuffix;
	    },
	    alert:function(con,_callback){
	        var d = dialog({
	            title:"系统提示",
	            id:"util-alert",
	            fixed: true,
	            content: con,
	            width:300,
	            cancel: false,
	            okValue: '确定',
	            backdropOpacity:"0.3",
	            ok: function () {
	                if(_callback){
	                    _callback(d);
	                }
	            }
	        }).showModal();
	    },
	    confirm:function(con,okCallback,cancelCallback, okValue, cancelValue){
	        var d = dialog({
	            title:"系统提示",
	            id:"util-confirm",
	            fixed: true,
	            content: con,
	            width:300,
	            okValue: okValue || '确定',
	            cancelValue: cancelValue || '取消',
	            backdropOpacity:"0.3",
	            ok: okCallback,
	            cancel:cancelCallback ? cancelCallback : function(){}
	        }).showModal();
	    },
	    getCookie:function(name){
	    	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
		    if(arr=document.cookie.match(reg))
	        return decodeURI(arr[2]); 
		    else 
	        return null; 
	    },
	    setCookie:function(name, value, days){
	    	var Days = days || 30; 
		    var exp = new Date(); 
		    exp.setTime(exp.getTime() + Days*24*60*60*1000); 
		    document.cookie = name + "="+ encodeURI(value) + ";expires=" + exp.toGMTString(); 
	    },
	    delCookie:function(name){
	    	var exp = new Date(); 
		    exp.setTime(exp.getTime() - 1); 
		    var cval=this.getCookie(name); 
		    if(cval!==null){
		    	document.cookie= name + "="+cval+";expires="+exp.toGMTString();
		    } 
	    },
	    getStrLen:function(str){
			return (str && str.length>0)?str.replace(/[^\x00-\xff]/g,"**").length/2:0;
		},
		mainMenuChk:function(m){
			$("#bs-navbar .nav li[name="+m+"]").addClass("active");
		}
	};
	
	Utils.listLength=parseInt(Utils.getCookie("settingOfPageLimit")) || 30;// 所有列表每页显示的数量
	
	// avalon过滤器扩展
	(function(){
	 	avalon.filters.parseNumber= function(v, num){
		    num = typeof(num)=='undefined'? 0 : num;
		    return /^[+-]?\d+(\.\d+)?$/.test(v)? (num===0?parseInt(v):parseFloat(v).toFixed(num)) : Number(0).toFixed(num);
		};
		avalon.filters.gender= function(v){
		    if(v==='0') return '未知';
		    return v==='1'?'男':'女';
		};
		avalon.filters.formatTime= function(v){
		    return Utils.getLocalTime(v);
		};
		avalon.filters.avatar = function(url, width){
		    width = width || 80;
		    if(!url || url.length<5) return GLOBAL_CONFIG.defaultAavatar;
		    return Utils.QNCropSuffix(url.split('?')[0], width);
		};
		avalon.filters.placeholderImg= function(url, type, width, height){
			// 统一处理一下图片：空则使用占位图，使用七牛后缀 type: product / avatar / video
		    width = width || 80;
		    var placeholderImg = '';
		    switch(type){
		        case 'product': placeholderImg = GLOBAL_CONFIG.defaultProduct; break;
		        case 'avatar': placeholderImg = GLOBAL_CONFIG.defaultAavatar; break;
		        case 'video': placeholderImg = GLOBAL_CONFIG.defaultVideo; break;
		        default: placeholderImg = GLOBAL_CONFIG.defaultProduct; break;
		    }

		    if(!url || url.length<5) return placeholderImg;
		    return Utils.QNCropSuffix(url.split('?')[0], width, height);
		};
		avalon.filters.createTags = function(tags){
		    var colors = ['default','primary','success','info','warning','danger','purple','inverse','pink'];
		    tags = tags.split(',').map(function(v){
		        var i = Math.floor(Math.random()*(8+1));
		        return '<span class="label label-'+colors[i]+'">'+v+'</span>';
		    });
		    return tags.join(' ');
		};
		avalon.filters.getOrderStatus= function(v){
		    var  status = {
		        's1':'待付款',
		        's2':'已发货',
		        's10':'待发货',
		        's3':'待评价',
		        's4':'已评价',
		        's5':'已关闭',
		    };
		   return status['s'+v] || '--';
		};
	})();

	// artTemplate模板扩展
	(function(){
		template.helper('dateFormat', function (date, format) {
		    if(!date) return '';
		    format = Utils.getLocalTime(date);
		    return format;
		});
		template.helper('dayFormat', function (date, format) {
		    if(date){
		        format = Utils.getLocalTime(date,true);
		        return format;
		    }
		    return '';
		});
		template.helper('toFixed2', function (data, format) {
		    if(data){
		        format = data.toFixed(2);
		        return format;
		    }
		    return '0.00';
		});
		template.helper('toFixed1', function (data, format) {
		    if(data){
		        format = data.toFixed(1);
		        return format;
		    }
		    return '0.0';
		});
		template.helper('stringify', function (data, format) {
		    format = JSON.stringify(data);
		    return format;
		});
		template.helper('placeholderImg', function (data, format) {
		    var placeholderImg = '';
		    switch(format){
		        case 'product': placeholderImg = GLOBAL_CONFIG.defaultProduct; break;
		        case 'avatar': placeholderImg = GLOBAL_CONFIG.defaultAavatar; break;
		        case 'video': placeholderImg = GLOBAL_CONFIG.defaultVideo; break;
		        default: placeholderImg = GLOBAL_CONFIG.defaultProduct; break;
		    }
		    if(!data || data.length<5) return placeholderImg;
		    return data;
		});
		template.helper('orderStatus', function (data, status) {
		    switch(data){
		        case 1 : 
		        status="待付款";
		        break;
		        case 2 :
		        status="已发货";
		        break;
		        case 10 :
		        status="待发货";
		        break;
		        case 3 :
		        status="待评价";
		        break;
		        case 4 :
		        status="已评价";
		        break;
		        case 5 :
		        status="已关闭";
		        break;
		    }
		    return status;
		});
		template.helper('getHBGN', function (data, probability) {
		    switch(data){
		        case 5 : probability="最小概率[很难中奖]";break;
		        case 50 : probability="一般概率[有机率中奖]";break;
		        case 100 : probability="最大概率[人人有奖]";break;
		    }
		    return probability;
		});
		// 装修-显示品牌的中文名
		template.helper('getCNName', function (data, format) {
			return data.indexOf('/')>0 ? data.split('')[1] : data;
		});
		// 装修-显示品类的中文名
		template.helper('categorySeleted', function (data, v) {
			return $.inArray((v+''), (data+'').split('_'))>-1 ? 'selected':'';
		});
		// 装修-获取模板类型 0为默认模板，1为自定义模板，2为其它类型
		template.helper('getTplTpye', function (v) {
			var t = {'t0':'默认模板', 't1':'自定义装修', 't2':'装修模板'};
			return t['t'+v] || '默认模板';
		});
		// 文本截取以...表示
		template.helper('truncate', function(data, len){
			if(!data || Utils.getStrLen(data)<=len) return data;
			return data.substring(0,len)+'...';
		});

		// 添加七牛的图片截取后缀
		template.helper('img7N', function(data, w, h){
			if(!data || data.length<10 || (!w && !h)) return data;
			if(!h) h = w;
			if(data.indexOf('?')>-1){
				return data.split('?')[0]+'?imageView2/1/w/'+w+'/h/'+h;
			}
			return data+'?imageView2/1/w/'+w+'/h/'+h;
		})

		template.helper('getNewsTag', function(data){
			var t = ['资讯','案例','活动'];
			return t[data] ? t[data] : t;
		})
	})();
	
	// jquery扩展
	(function(){
		$.fn.navTab = $.fn.tabs=function(callback){
			return this.each(function(){
				$(this).children('li').on('click', 'a', function(){
					var _this = $(this);
					_this.parent().siblings('li').removeClass('active').end().addClass('active');
					(typeof callback === 'function') && callback(_this);
				});
			});
		};

		$.fn.setTheadFixed = function(options){
		    var o = $.extend({},options);
		    var s = $(this);
		    var tableTop = s.offset().top-(o.leaveTop ? o.leaveTop : 60),tableLeft = s.offset().left,tableWidth = s.width();
		    var h = '<table class="fixedTable table" style="left:'+tableLeft+'px;width:'+tableWidth+'px;top:'+(o.leaveTop ? o.leaveTop : 60)+'px;display:none;"><thead><tr>';
		    s.find("thead:first").find("th:visible").each(function(i,e){
		        h += '<th style="width:'+($(e).width()+16)+'px" class="'+($(e).attr("class")||"")+'">'+$(e).html()+'</th>';
		    });
		    h += '</tr></thead></table>';
		    $(".fixedTable.table").remove();
		    s.parent().append(h);
		    $(document).on("scroll",function(){
		        if($(document).scrollTop()>=tableTop){
		            $(".fixedTable.table").show();
		            if(o.fixedFn){
		                o.fixedFn();
		            }
		        }else{
		            $(".fixedTable.table").hide();
		            if(o.unfixedFn){
		                o.unfixedFn();
		            }
		        }
		    });
		};

		$.fn.singleImgUploader = function(options){
		    var _this = $(this);
		    require(["webuploader"],function(WebUploader){
		        var imgW = options.width || "160",
		            imgH = options.height || "160";

		        var uploader = WebUploader.create({
		            auto: true,
		            swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
		            server: GLOBAL_CONFIG.uploadServer,
		            pick:{
		                id:_this[0],
		                multiple : false
		            },
		            // runtimeOrder : "flash",
		            duplicate : true,
		            accept: {
		                title: 'Images',
		                extensions: 'gif,jpg,jpeg,png',
		                mimeTypes: 'image/*'
		            },
		            formData : {
		                'token' : $('#uptoken').val()
		            },
		            compress : {
		                width: options.limitLarger ? 1600 : 800,
		                height: options.limitLarger ? 1600 : 800,
		                quality: 90,
		                allowMagnify: true,
		                crop: false,
		                preserveHeaders: true,
		                noCompressIfLarger: true,
		                // 单位字节，如果图片大小小于此值，不会采用压缩。
		                compressSize: options.limitLarger ? 1024*1024 : 300*1024
		            }
		        });
		        uploader.on("uploadStart",function(file){
		            _this.find(".webuploader-pick").addClass("uploading").append('<div class="progressBar"><div class="progress" style="width:0%"></div></div>');
		        }).on("uploadProgress",function(file,percentage){
		            _this.find(".progress").css("width",percentage*100+'%');
		        }).on("uploadSuccess",function(file,response){
		            var url = GLOBAL_CONFIG.cdn+response.hash+"?imageView2/1/w/"+imgW+"/h/"+imgH;
		            _this.css("background-image","url("+url+")").find(".webuploader-pick").removeClass("uploading").find(".progressBar").remove();
		            if(options.resultInput){
		                options.resultInput.val(GLOBAL_CONFIG.cdn+response.hash);
		            }
		            if(options.callback){
		                options.callback(GLOBAL_CONFIG.cdn+response.hash);
		            }
		        }).on("uploadError",function(){
		            Utils.alert("上传失败，请稍后再试或刷新页面重试");
		        }).on("error",function(msg){
		            Utils.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
		        });
		    });
		};

		$.fn.singleFileUploader = function(options){
		    var _this = $(this);
		    require(["webuploader"],function(WebUploader){
		    	var uploader = WebUploader.create({
			        auto: true,
			        swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
			        server: GLOBAL_CONFIG.uploadServer,
			        // runtimeOrder : "flash",
			        pick:{
			            id:_this[0],
			            multiple : false
			        },
			        duplicate : true,
			        accept: {
			            title: 'File',
			            extensions : 'csv',
			            mimeTypes: 'text/csv'
			        },
			        // formData : {"json":'{"type":3,"ext":"csv"}'}
			        formData : {
			            'token' : $('#uptokenPrivate').val()
			        }
			    });
			    uploader.on("uploadStart",function(){
			        _this.find(".webuploader-pick").addClass("uploading").append('<div class="progressBar"><div class="progress" style="width:0%"></div></div>');
			    }).on("uploadProgress",function(file,percentage){
			        _this.find(".progress").css("width",percentage*100+'%');
			    }).on("uploadSuccess",function(file,response){
			        _this.find(".webuploader-pick").removeClass("uploading").find(".progressBar").remove();
			        var url = GLOBAL_CONFIG.cdnPrivate+response.hash;
			        $("#fileUrl").val(url);
			        $("#loadedFileName").html(file.name);
			        $(".submit").removeClass("disabled");
			    }).on("uploadError",function(){
			        Utils.alert("上传失败，请稍后再试或刷新页面重试");
			    }).on("error",function(msg){
			        Utils.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确，请上传.csv文件" : msg);
			    });
		    });
		};

		$.fn.serializeObject=function(){var result={};var extend=function(i,element){var node=result[element.name];if('undefined'!==typeof node&&node!==null){if($.isArray(node)){node.push(element.value)}else{result[element.name]=[node,element.value]}}else{result[element.name]=element.value}};$.each(this.serializeArray(),extend);return result};
		
		$.initDatePicker = function(pickers, options){
			pickers.forEach(function(v){
				var ST = v.ST, ET = v.ET, onpicked = v.onpicked || new Function, oncleared = v.oncleared || new Function;
				var st = ST.substring(1);
				var et = ET.substring(1);

				$(ST).on("click",function(){
					var $this = $(this);
					WdatePicker({
						startDate:'%y-%M-%d 00:00:00',
						dateFmt:'yyyy-MM-dd HH:mm:ss',
						qsEnabled:false,
						maxDate:'%y-%M-%d',
						minDate:'#F{$dp.$D('+et+',{M:-3});}',
						onpicked: function(){ onpicked($this);},
                    	oncleared: function(){ oncleared($this)}
					});
				});

				$(ET).on("click",function(){
					var $this = $(this);
					WdatePicker({
			      		startDate:'%y-%M-%d 23:59:59',
						dateFmt:'yyyy-MM-dd HH:mm:ss',
						qsEnabled:false,
						maxDate: $(ST).val() ? '#F{$dp.$D('+st+',{M:3})}' : '%y-%M-%d',
						minDate:'#F{$dp.$D('+st+');}',
						onpicked: function(){ onpicked($this);},
                    	oncleared: function(){ oncleared($this)}
					});
				});
			})
		}
	})();

	// validator 扩展
	(function(){
		$.validator.setDefaults({
			submitHandler: function(form){
				form.submit();
			},
			errorPlacement: function(error, element) {
			    if ( element.is(":radio") )
			        error.css({"display":"block","padding":"0"}).appendTo( element.parent().parent());
			    else if ( element.is(":checkbox") )
			        error.css({"display":"block","padding":"0"}).appendTo (element.parent().parent());
			    else if(element.hasClass("error-after"))
			    	element.after(error);
			    else
			        error.appendTo( element.parent() );
			}
		});

		$.validator.addMethod("isEnglish", function(value, element) {       
		     return this.optional(element) || /^[A-Za-z]+$/.test(value);       
		}, "只能包含英文字符。");

		$.validator.addMethod("isMobile", function(value, element) {
		  	var length = value.length;    
		  	return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value));    
		}, "请正确填写您的手机号码。");

		$.validator.addMethod("isPwd", function(value, element) {
		     return this.optional(element) || /^[a-zA-Z]\w{5,12}$/.test(value);
		}, "以字母开头，6-12之间的字符、数字和下划线。"); 

		// 身份证号码验证
		$.validator.addMethod("isIdCardNo", function(value, element) {
		  return this.optional(element) || validateIsIdCardNo(value);
		}, "请输入正确的身份证号码。");

		// 字符验证，只能包含中文、英文、数字、下划线等字符。    
		$.validator.addMethod("stringCheck", function(value, element) { 
		     return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5-_]+$/.test(value);
		}, "不要输入特殊字符");

		// 字符验证，只能包含数字、空格、冒号。    
		$.validator.addMethod("timeCheck", function(value, element) {
		     return this.optional(element) || /^[0-9-:\s]+$/.test(value);
		}, "请输入格式如 9:00 - 21:00");

		$.validator.addMethod("isNum", function(value, element) {       
		     return this.optional(element) || /^\d+$/.test(value);       
		}, "只能包含数字。");

		$.validator.addMethod("isSec", function(value, element) {       
		     return this.optional(element) ||/^\d*\.(\d{2})$/.test(value);       
		}, "只能包含两位小数。");

		$.validator.addMethod("isMoreSec", function(value, element) {       
		     return this.optional(element) ||/^\d*\.(\d{0,2})$/.test(value);       
		}, "最多包含两位小数。");

		$.validator.addMethod("isMoreSec", function(value, element) {       
		     return this.optional(element) ||/^1$|0\.[0-9]{0,2}$/.test(value);       
		}, "只能输入0-1的最多包含两位小数的数字。");

		function validateIsIdCardNo(num) {
		    var factorArr = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
		    var parityBit = new Array("1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2");
		    var varArray = new Array();
		    var intValue;
		    var lngProduct = 0;
		    var intCheckDigit;
		    var intStrLen = num.length;
		    var idNumber = num;
		    // initialize
		    if (intStrLen != 18) {
		        return false;
		    }
		    for (i = 0; i < intStrLen; i++) {
		        varArray[i] = idNumber.charAt(i);
		        if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
		            return false;
		        } else if (i < 17) {
		            varArray[i] = varArray[i] * factorArr[i];
		        }
		    }
		    var date8 = idNumber.substring(6, 14);
		    if (validateIsDate8(date8) == false) {
		        return false;
		    }
		    for (i = 0; i < 17; i++) {
		        lngProduct = lngProduct + varArray[i];
		    }
		    intCheckDigit = parityBit[lngProduct % 11];
		    if (varArray[17].toUpperCase() != intCheckDigit) {
		        return false;
		    }
		    return true;
		}
		function validateIsDate8(sDate) {
		    if (!/^[0-9]{8}$/.test(sDate)) {
		        return false;
		    }
		    var year, month, day;
		    year = sDate.substring(0, 4);
		    month = sDate.substring(4, 6);
		    day = sDate.substring(6, 8);
		    var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		    if (year < 1700 || year > 2500) return false;
		    if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) iaMonthDays[1] = 29;
		    if (month < 1 || month > 12) return false;
		    if (day < 1 || day > iaMonthDays[month - 1]) return false;
		    return true;
		}
	})();

	var tableList = dialog({
	    title:"列表个数设置",
	    id:"util-tableList",
	    fixed: true,
	    backdropOpacity:"0",
	    content: $('#settingContent'),
	    statusbar:"默认30条",
	    okValue: '确定',
	    cancelValue:'取消',
	    ok: function(){
	        var limit = $('#settingContent input[name=limit]').val();
	        if(~~limit < 10){
	            Utils.alert("至少每页10条");
	            return false;
	        }else if(~~limit > 100){
	            Utils.alert("最多每页100条");
	            return false;
	        }else{
	            Utils.setCookie("settingOfPageLimit",limit,{expires: 300});
	            location.reload();
	        }
	    },
	    cancel:function(){
	        this.close();
	        return false;
	    }
	});
	 $(".dropdown-menu").on("click",".tableList",function(e){
	    tableList.showModal();
	    $('#settingContent input[name=limit]').val(Utils.listLength);
	});

	$("#qkLogout").on("click",function(e){
	    e.preventDefault();
	    $.getJSON("../logout.json",function(data){
	        location.href="index.htm";
	    });
	});

	// ajax全局设置
	jQuery.ajaxSetup({
	    type: "POST",
	    dataType: 'json',
	    timeout: 60000,
	    beforeSend:function(request){
	        var urlSp = this.url.split("/"),url=urlSp[urlSp.length-1].split(".")[0];
	        var params = this.type==="GET"?this.url.split("?")[1]:this.data;
	        if(window["ajax-"+url] && window["ajax-"+url]==params){
	            request.abort();
	        }else{
	            window["ajax-"+url] = params;
	        }
	    },
	    //检验登陆超时
	    dataFilter: function (data, type) {
	        if (type === "json") {
	            data = JSON.parse(data);
	            if(data.status == "401") {
	                Utils.alert("登录已超时，请重新登录",function(){
	                    top.location.href = "index.htm";
	                });
	            }else if(data.status == "403"){
	                Utils.alert("抱歉，您没有权限进行此项操作");
	            }else{
	                return JSON.stringify(data);
	            }
	        }else{
	            return data;
	        }
	    },
	    complete:function(){
	        var urlSp = this.url.split("/"),url=urlSp[urlSp.length-1].split(".")[0];
	        window["ajax-"+url] = undefined;
	    },
	    error: function () {
	        Utils.alert("系统繁忙，请稍后再试");
	    }
	});
	jQuery.browser={};(function(){jQuery.browser.msie=false; jQuery.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)./)){ jQuery.browser.msie=true;jQuery.browser.version=RegExp.$1;}})();

	window.Utils = Utils;
	return Utils;
});