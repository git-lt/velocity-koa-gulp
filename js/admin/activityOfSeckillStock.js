document.title="洽客-天天闪购"; 
$.createSecondMenu("promotion_manage","天天闪购");
Util.createHelpTip("天天闪购相关问题",[
	{"title":"天天闪购场景说明","link":"https://qiakr.kf5.com/posts/view/39416/"},
	{"title":"天天闪购活动设置","link":"https://qiakr.kf5.com/posts/view/39776/"},
	{"title":"如何推广闪购活动","link":"https://qiakr.kf5.com/posts/view/39904/"},
	{"title":"查看更多帮助","link":"https://qiakr.kf5.com/home/"}
]);
// 设置获取上架商品的链接
var chkProDia = MOD_SelectProsDia.init({
	sourceType:0
});

var STOCKID = Util.getUrlParam("stockId");

var editSeckillStock = {
	init:function(){
		this.addProEv(); /*选择商品*/
		this.saveSeckillStock(); /*保存*/
		this.timeSelect();
		this.initSkuPrice();
		this.selStoreEv();
		this.selDdelivery();
		if(!STOCKID){
			$('#selectPro').trigger("click");
			$('#deliveryWay').trigger("change");
		}
	},
	addProEv:function(){
		$('#selectPro').on('click',function(){
			var _self = $(this);
			chkProDia.show(function(res){
				var seled = $.grep(res,function(e,i){return e!=undefined});
				if(seled.length > 1){
					Util.alert('只能选择1件商品');
					return false;
				}
				var stock = seled[0];
				if(!stock.picUrl){
					Util.alert('该商品没有上传图片，请先上传商品图片');
					return false;
				}

				_self.val(stock.name);

				$("input[name=productName]").val(stock.name).trigger('validate');
				$("input[name=productId]").val(stock.id);
				$("input[name=stockId]").val(stock.stockId);
				$("#skuPriceTxt").html(stock.tagPrice.toFixed(2));
				$("input[name=tagPrice]").val(stock.tagPrice);
				$(".innerTable tbody").html( template('tempData', {list:stock.skulist}));
				$.getJSON("getStoreByProductId.json?productId="+stock.id,function(data){
					if(data.status=="0"){
						var storeIdList=[],storeNameList='';
						for(var i=0;i<data.result.storeList.length;i++){
							storeIdList.push(data.result.storeList[i].id);
							storeNameList+=data.result.storeList[i].name+'/';
						}

						$("#selStoreBtn").val(storeNameList);
						$("input[name=storeIdList]").val(storeIdList.join("_")).trigger('validate');
						$('#skuListBox,#skuPriceSpan').fadeIn();
					}
				});
			});
		});
	},
	saveSeckillStock:function(){
		$("#createSeckillFrom").validator({
			focusCleanup:true
		}).on('valid.form', function(e){
				var createParam = $(e.target).serializeObject();
		        createParam.gmtCreateStart = Util.getUnixTime(createParam.gmtCreateStart);
		        createParam.gmtCreateEnd = Util.getUnixTime(createParam.gmtCreateEnd);
		        var flashsaleSkuListJson=[];
		        var skuPriceFull = true;
		        $(".innerTable tbody tr").each(function(){
		        	var count = $(this).find(".count-limit").val(),
		        		price = $(this).find(".sku-price").val(),
		        		id = $(this).data("id");
		        	if(!count || !price){
		        		skuPriceFull = false;
		        	}
		        	flashsaleSkuListJson.push({
		        		"skuCount":count,
		        		"skuPrice":price,
		        		"skuId":id
		        	});
		        });
		        
		        createParam.flashsaleSkuListJson = JSON.stringify(flashsaleSkuListJson);
		        if(STOCKID){
		        	createParam.flashSaleStockId = STOCKID;
		        }
		        $.ajax({
		            url:STOCKID ? "updateFlashsaleStock.json" :"createFlashsaleStock.json",
		            data:createParam,
		            success:function(data){
		                if(data.status=="0"){
		                    Util.alert("保存成功",function(){
		                    	location.href="activityOfSeckill.htm";
		                    });
		                }else{
		                	Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
		                }
		            }
		        });

			return false;
		});
	},
	timeSelect:function(){
		$("#dateStart").on("click",function(){
			WdatePicker({
		        startDate:'%y-%M-%d',
				dateFmt:'yyyy-MM-dd HH:mm:ss',
				qsEnabled:false,
				minDate:'%y-%M-%d'
			});
		});
		$("#dateEnd").on("click",function(){
			WdatePicker({
		        startDate:'%y-%M-%d 23:59:59',
				dateFmt:'yyyy-MM-dd HH:mm:ss',
				qsEnabled:false,
				minDate:'#F{$dp.$D(\'dateStart\');}'
			});
		});
	},
	initSkuPrice:function(){
		$("input[name=marketPrice]").blur(function(){
			var val = $(this).val();
			var price = val!=='' ? parseFloat(val).toFixed(2):0;
			if(price === 0){
				$(".innerTable .sku-price").val('').trigger('validate');
			}else{
				$(this).val(price);
				$(".innerTable .sku-price").val(price).trigger('validate');
			}
		});
	},
	selStoreEv:function(){
		$("#selStoreBtn").on("click",function(){
			 $.popupStoreSelect({
                title:"选择门店",
                type:"multiple",
                okCallback:function(list){
                    var storeIdList = [],seledName="";
                    $.each(list,function(i,e){
                        storeIdList.push(e.id);
                        seledName+=e.name+"/";
                    });
                    if(storeIdList.length===0){
                        Util.alert("请选择门店");
                        return false;
                    }else{
                    	$("#selStoreBtn").val(seledName);
                    	$("input[name=storeIdList]").val(storeIdList.join("_")).trigger('validate');
                    }
                }
            });
		});
	},
	selDdelivery:function(){
		$("#deliveryWay").on("change",function(){
			var way=$(this).val();
			if(way=="1"){
				$('#createSeckillFrom').validator('setField', {postFee: null});
			}else{
				$('#createSeckillFrom').validator('setField', {postFee: '运费: required;range[0~];'});
			}

			if(way=="2"){
				$("#postFeeTr").fadeIn();
				$('#sltStoreLab').text('业绩归属门店');
			}else{
				$("#selStoreTr").fadeIn();
				if(way=="1"){
					$("#postFeeTr").fadeOut();
					$('#postFeeInput input').val('');
				}else{
					$("#postFeeTr").fadeIn();
				}
				$('#sltStoreLab').text('自提门店');
			}
		});
		$("#postFeeSelect").on("change",function(){
			if($(this).val()=="0") {
				$('#postFeeInput input').val('');
				$('#postFeeInput').fadeOut();
				$('#createSeckillFrom').validator('setField', {postFee: null});
			}else{
				$('#postFeeInput').fadeIn();
				$('#createSeckillFrom').validator('setField', {postFee: '运费: required;range[0~];'});
			} 
		});
	}
};

editSeckillStock.init();