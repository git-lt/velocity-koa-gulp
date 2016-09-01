$.createSecondMenu("product_manage","总库商品");
var savedStockId = "",
    savedProductId = "",
    idBox = $("#idBox"), 
    iBoxTarget,
    _stockId = Util.getUrlParam("stockId"),
    previewUploadLimit = 5, 
    detailUploadLimit=10,
    Keditor,
    _syncStorePrice=false,
    useStoreStock = $("#useStoreStock").val()=="0" ? true : false;

var editSupplierStock = {
    o:{
        categoryList:[],
        categoryListSearch:[],
        familyCateId:"",
        secondCateId:"",
        familyCateName:"",
        secondCateName:""
    },
    init:function(){
        $('#selectBrand').select2();
        if($("#formatBox .format").length < 2){
            $("#formatListContainer").select2({placeholder:"请先选择商品类目"});
        }
        this.getCategoryList();  //获取类目列表
        this.selectCategoryShow();  //显示类目信息
        this.searchCategory();
        this.uploadedPreviewImage(); // 回显已上传商品图片
        this.formateMsgEvents(); // SKU相关操作
        this.imageSortable(); //图片排序
        this.listenEditor();
        // 价格格式化
        $("input[name=tagPrice]").blur(function(e){
            if($(this).val()){
                var val=parseFloat($(this).val());
                $(this).val(val.toFixed(2));
            }
        });
        // get custom category list
        $.getJSON('querySelfGroupList.json',function(data){
            if (data.status === "0"){
                $('select[name="groups"]').html(template("selectGroup", {o:data.result.groupList}));
                $.getJSON('queryGroupOfProduct.json',{productId: Util.getUrlParam('productId')},function(r){
                    if (r.status=== "0"){
                        var d = $('select[name="groups"]').select2(),
                        o = r.result.groupList,
                        arr = [],
                        i;
                        for (i= 0; i< o.length; i++){
                            var id = o[i].thirdLevel? o[i].thirdLevel.id: (o[i].secondLevel? o[i].secondLevel.id: o[i].firstLevel.id);
                            arr.push(id);
                        }
                        d.val(arr).select2();
                    }else {
                        $('select[name="groups"]').select2();
                        Util.alert('获取商品分类失败。');
                    }
                });
            }
        });
    },
    listenEditor:function(){
        $("input[name=productName]").on("input propertychange",function(){
            var val = $(this).val();
            $("#promInfoView .productName").html(val);
        });
        $("input[name=tagPrice]").on("input propertychange",function(){
            var val = $(this).val();
            $("#promInfoView .tagPrice").html('¥'+val);
        });
    },
    getCategoryList:function(){
        var self = this;
        $.getJSON('getCategoryFamilyVoList.json',function(data){
            var listSrc = data.result.categoryFamilyVoList,list={}, familyCategory="";
            $.each(listSrc,function(i,e){
                list[e.categoryFamily.id]={
                    "name":e.categoryFamily.familyName,
                    "children":e.categoryVoList
                };
                familyCategory += '<li data-id="'+e.categoryFamily.id+'">'+e.categoryFamily.familyName+'</li>';
            });
            self.o.categoryList = list;
            $("#categoryBox .family ul").html(familyCategory);
            var familyId,secondId,familyName,secondName;
            // 初始化原始类目信息
            if($("input[name=familyId]").val() && $("input[name=categoryId]").val()){
                familyId = $("input[name=familyId]").val();
                secondId=$("input[name=categoryId]").val();
                self.getModelIdByCategoryId(familyId,false);
                familyName = list[familyId].name;
                $.each(list[familyId].children,function(i,e){
                    if(e.id == secondId){
                        secondName = e.category.name;
                        return false;
                    }
                });
                $("#selectedCategory").html(familyName+' > '+secondName);
            }else if(localStorage.editStockDefaultFamilyId && localStorage.editStockDefaultSecondId){
                familyId = localStorage.editStockDefaultFamilyId;
                secondId=localStorage.editStockDefaultSecondId;
                $("input[name=familyId]").val(familyId);
                $("input[name=categoryId]").val(secondId);
                self.getModelIdByCategoryId(familyId,false);
                familyName = list[familyId].name;
                $.each(list[familyId].children,function(i,e){
                    if(e.id == secondId){
                        secondName = e.category.name;
                        return false;
                    }
                });
                $("#selectedCategory").html(familyName+' > '+secondName);
                $.post('getBrandListByCategoryFamilyId.json',{categoryFamilyId:familyId}, function(data){
                    if(data.status==='0'){
                        var d = data.result.productBrandList, str=[];
                        if(d.length){
                            for(var s in d){
                                str.push('<option value="'+d[s].id+'">'+d[s].brandName+'</option>');
                            }
                        }else{
                            str.push('<option value="">该类目下暂无品牌</option>');
                        }
                        $('#selectBrand').html(str.join('')).trigger('change');
                        if(!_stockId && localStorage.editStockDefaultBrand){
                            $('#selectBrand').val(localStorage.editStockDefaultBrand).trigger("change");
                        }
                    }
                });
            }
        });
        $("#categoryBox").on("click",".family li",function(){
            $(this).addClass("ac").siblings().removeClass("ac");
            var id = $(this).data("id"),secondList = self.o.categoryList[id],secondListHtml = "";
            self.o.familyCateId = id;
            self.o.familyCateName = $(this).text();
            self.o.secondCateId="";
            $.each(secondList.children,function(i,e){
                secondListHtml += '<li data-id="'+e.id+'">'+e.category.name+'</li>';
            });
            $("#categoryBox .second").scrollTop(0).find("ul").html(secondListHtml);
        });
        $("#categoryBox").on("click",".second li",function(){
            $(this).addClass("ac").siblings().removeClass("ac");
            var id = $(this).data("id");
            self.o.secondCateId = id;
            self.o.secondCateName = $(this).text();
        });
    },
    selectCategoryShow:function(){
        var self = this;
        $("#seltCategory").on("click",function(){
            // self.o.familyCateId="";
            // self.o.secondCateId="";
            dialog({
                title:"选择类目",
                id:"util-category",
                fixed: true,
                content: $("#categoryBox"),
                width:405,
                okValue: '确定',
                cancelValue:'取消',
                backdropOpacity:"0.5",
                ok: function(){
                    var familyId = self.o.familyCateId,
                        secondId = self.o.secondCateId;
                    if(!familyId){
                        $("#categoryBox .familyError").html("请选择一级类目");
                        return false;
                    }else{
                        $("#categoryBox .familyError").empty();
                    }
                    if(!secondId){
                        $("#categoryBox .secondError").html("请选择二级类目");
                        return false;
                    }else{
                        $("#categoryBox .secondError").empty();
                    }
                    $("input[name=familyId]").val(familyId);
                    $("input[name=categoryId]").val(secondId);
                    $("#selectedCategory").html(self.o.familyCateName + ' > ' + self.o.secondCateName);
                    localStorage.editStockDefaultFamilyId = familyId;
                    localStorage.editStockDefaultSecondId = secondId;
                    self.getModelIdByCategoryId(secondId,true);

                    // 根据familyId 获取相关品牌，重新设置select的数据
                    $.post('getBrandListByCategoryFamilyId.json',{categoryFamilyId:familyId}, function(data){
                        if(data.status==='0'){
                            var d = data.result.productBrandList, str=[];
                            if(d.length){
                                for(var s in d){
                                    str.push('<option value="'+d[s].id+'">'+d[s].brandName+'</option>');
                                }
                            }else{
                                str.push('<option value="">该类目下暂无品牌</option>');
                            }
                            $('#selectBrand').html(str.join('')).trigger('change');
                        }
                    });
                },
                cancel:function(){}
            }).showModal();
        });
    },
    searchCategory:function(){
        var self = this;
        $("#categoryFilter").on("click",function(){
            $.ajax({
                url:'getCategoryFamilyVoList.json',
                data:{
                    fuzzyKeyword:$("#fuzzyCategoryName").val()
                },
                success:function(data){
                    var listSrc = data.result.categoryFamilyVoList,list={}, familyCategory="";
                    $.each(listSrc,function(i,e){
                        list[e.categoryFamily.id]={
                            "name":e.categoryFamily.familyName,
                            "children":e.categoryVoList
                        };
                        familyCategory += '<li data-id="'+e.categoryFamily.id+'">'+e.categoryFamily.familyName+'</li>';
                    });
                    self.o.categoryList = list;
                    $("#categoryBox .family ul").html(familyCategory);
                    $("#categoryBox .second ul").empty();
                }
            });
        });
        $("#fuzzyCategoryName").on("keydown",function(e){
            if(e.keyCode == 13){
                $("#categoryFilter").click();
            }
        });
    },
    imageSortable:function(){
         $("#previewUploadWrap").sortable({
            cursor: "move",
            items : ".loaded",
            placeholder:"ui-sortable-placeholder",
            revert:true
        });
        $("#previewUploadBakWrap").sortable({
            cursor: "move",
            items : ".loaded",
            placeholder:"ui-sortable-placeholder",
            revert:true,
            update:function(){
                var url = $("#previewUploadBakWrap .loaded:first").data("url");
                $(".preview-box-phone .csp-pro-img").css("background-image","url("+url+")");
            }
        });
    },
    uploadedPreviewImage:function(){
        var _previewJsonStr = "";
        $.each(_previewJson,function(i,e){
            _previewJsonStr += '<div class="webuploader-container loaded" data-url="'+e+'" style="background-image: url('+e+'?imageView2/2/w/80/h/80);"><span class="cancel">×</span></div>';
        });
        // 删除旧商品图片的处理
        $(".previewUploadWrap").prepend(_previewJsonStr);
    },
    getModelIdByCategoryId: function(id,clear){
        $.getJSON("getDefaultNormsByCategoryId.json?categoryId="+id,function(data){
            if(clear){
                $("#formatBox .format").remove();
                $(".innerTable tbody").empty();
                 var skuStr ='<tr><td><input class="min sku-count" placeholder="库存" type="text"></td>\
                    <td><input class="min sku-code" placeholder="条码号" type="text"></td>'
                    +(useStoreStock ? '<td><input class="min skuExternalSid" placeholder="外部条码" type="text"></td>' : '')+
                    '<td><input class="min sku-price" placeholder="价格" type="text"></td></tr>';
                $(".innerTable tbody").append(skuStr);
                $(".innerTable thead .move").remove();
                updateTotalCount();
            }
            var list=data.result.productNormsList,optionStr='<option value="">请选择规格</option>';
            $.each(list,function(i,e){
                optionStr += '<option value="'+e.id+'">'+e.normsName+'</option>';
            });
            $("#formatListContainer").empty().append(optionStr).select2({minimumResultsForSearch: -1});
        });
    },
    formateMsgEvents:function(){
        $("#formatListContainer").change(function(){
            var val = $(this).val(),text=$("#s2id_formatListContainer .select2-chosen").text();
            var modelStr ='<div class="format" data-id="'+val+'">'+
                    '<div class="formatName">'+text+'</div>'+
                    '<div class="formatCon">'+
                    '<span class="skuBox newSku">+</span></div>'+
                    '<a href="javascript:;" class="removeFormat">删除</a></div>';
            if($("#formatBox .format").length > 0){
                if($("#formatBox .format .formatName:first").text() == text){
                    Util.alert("请选择两个不同的规格信息");
                }else{
                    $("#formatBox .format:last").after(modelStr);
                }
            }else{
                $("#formatBox").prepend(modelStr);
            }

            $("#formatListContainer").find("option:selected").remove().end().val("").select2();
            if($("#formatBox .format").length == 2){
                $("#s2id_formatListContainer").hide();
            }
        });

        $("#formatBox").on("click",".skuBox",function(e){
            var target = e.target;
            if($(this).hasClass("newSku")){
                iBoxTarget = $(this);
                var left = $(this).offset().left,top = $(this).offset().top;
                idBox.css({"left":left-20,"top":top-20}).show();
                $("#newSkuInput").val("").focus();
                return false;
            }
            var formatCountOld = $(".skuBox.sel").parent().length;
            $(this).toggleClass("sel");
            if(formatCountOld != $(".skuBox.sel").parent().length){
                $(".innerTable tbody").empty();
                $(".innerTable thead .move").remove();
                var newHead = '';
                $(".skuBox.sel").parent().siblings(".formatName").each(function(i,e){
                    newHead+='<th class="move">'+$(e).text()+'</th>';
                });
                $(".innerTable thead tr").prepend(newHead);
            }
            var seld = $(this).text(),idx = $(this).closest(".format").index();
            // var size = $(this).text(),storedStr;
            var skuStr = "";
            if($(this).hasClass("sel")){// 新增SKU
                if($(".skuBox.sel").parent().length == 2){
                    $(this).closest(".format").siblings().find(".skuBox.sel").each(function(i,e){
                        skuStr +="<tr>";
                        if(idx == 1){
                            skuStr += '<td>'+$(e).text()+'</td><td>'+seld+'</td>';
                        }else{
                            skuStr += '<td>'+seld+'</td><td>'+$(e).text()+'</td>';
                        }
                        skuStr +='<td><input class="min sku-count" placeholder="库存" type="text"></td>\
                                    <td><input class="min sku-code" placeholder="条码号" type="text"></td>'
                                    +(useStoreStock ? '<td><input class="min skuExternalSid" placeholder="外部条码" type="text"></td>' : '')+
                                    '<td><input class="min sku-price" placeholder="价格" type="text"></td></tr>';
                    });
                    $(".innerTable tbody").append(skuStr);
                }else if($(".skuBox.sel").parent().length == 1){
                    skuStr +='<tr><td>'+seld+'</td>';
                    skuStr +='<td><input class="min sku-count" placeholder="库存" type="text"></td>\
                        <td><input class="min sku-code" placeholder="条码号" type="text"></td>'
                        +(useStoreStock ? '<td><input class="min skuExternalSid" placeholder="外部条码" type="text"></td>' : '')+
                        '<td><input class="min sku-price" placeholder="价格" type="text"></td></tr>';
                    $(".innerTable tbody").append(skuStr);
                }
            }else{ //取消SKU
                if($(".skuBox.sel").parent().length == 1){
                    idx = 0;
                    if($(this).closest(".format").siblings().find(".skuBox.sel").length > 0){
                        $(this).closest(".format").siblings().find(".skuBox.sel").each(function(i,e){
                            skuStr +='<tr><td>'+$(e).text()+'</td>';
                            skuStr +='<td><input class="min sku-count" placeholder="库存" type="text"></td>\
                                <td><input class="min sku-code" placeholder="条码号" type="text"></td>'
                                +(useStoreStock ? '<td><input class="min skuExternalSid" placeholder="外部条码" type="text"></td>' : '')+
                                '<td><input class="min sku-price" placeholder="价格" type="text"></td></tr>';
                        });
                        $(".innerTable tbody").append(skuStr);
                        return false;
                    }
                }
                $(".innerTable tr").each(function(i,e){
                    var tableSku = $(e).find('td:eq('+idx+')').text();
                    if(tableSku == seld){
                        $(e).remove();
                        updateTotalCount();
                    }
                });
                if($(".skuBox.sel").parent().length === 0){
                    $(".innerTable tbody").append('<tr><td><input class="min sku-count" placeholder="库存" type="text"></td><td><input class="min sku-code" placeholder="条码号" type="text"></td><td><input class="min sku-price" placeholder="价格" type="text"></td></tr>');
                }
            }
        }).on("click",".skuBox .close",function(e){
            var box = $(this).parent();
            if(box.hasClass("sel")){
                box.trigger("click");
            }
            box.fadeOut("fast",function(){box.remove();});
            return false;
        }).on("click",".removeFormat",function(e){
            var text = $(this).parent().find(".formatName").text(),
                id = $(this).parent().data("id"),
                listExisted = false;
            $.each($("#formatListContainer option"),function(i,e){
                if($(e).attr("value") == id){
                    listExisted = true;
                    return;
                }
            });
            if(!listExisted){
                $("#formatListContainer").append('<option value="'+id+'">'+text+'</option>');
            }
            $(this).parent().find(".skuBox.sel").trigger("click");
            $(this).parent().remove();
            $("#s2id_formatListContainer").show();
            if($(".skuBox.sel").parent().length == 0){
                var skuStr ='<tr><td><input class="min sku-count" placeholder="库存" type="text"></td>\
                    <td><input class="min sku-code" placeholder="条码号" type="text"></td>'
                    +(useStoreStock ? '<td><input class="min skuExternalSid" placeholder="外部条码" type="text"></td>' : '')+
                    '<td><input class="min sku-price" placeholder="价格" type="text"></td></tr>';
                $(".innerTable tbody").empty().append(skuStr);
            }
        });
        $("#idBoxCancel").click(function(){
            idBox.hide();
        });
        $("#idBoxSub").click(function(){
            var newSku = $.trim($("#newSkuInput").val()).replace(/'/g,'"');
            if(newSku !== ""){
                var existed=false;
                iBoxTarget.siblings(".skuBox").each(function(i,e){
                    if($(e).text()==newSku){
                        existed=true;
                        return false;
                    }
                });
                if(!existed){
                    iBoxTarget.before('<span class="skuBox">'+newSku+'<i class="close"></i></span>');
                    iBoxTarget.prev(".skuBox").trigger("click");
                    idBox.hide();
                }else{
                    Util.alert("请勿重复添加");
                    return false;
                }
                
            }
            idBox.hide();
        });
        $("#newSkuInput").on("keydown",function(e){
            if(e.keyCode == 13){
                $("#idBoxSub").click();
            }
        });
        $(".innerTable").on("blur",".sku-count",function(e){
            updateTotalCount();
        });
        $("#editPriceBatchBtn").on("click",function(){
            var price = parseFloat($("#editPriceBatchIpt").val()).toFixed(2);
            if(price == "NaN" || price<=0) {
                Util.alert("请输入正确的价格");
                return false;
            }
            $(".innerTable .sku-price").val(price);
        });
    }
}
editSupplierStock.init();

$("#commissionSelect").on("change",function(){
    var _t = $(this).val();
    switch (_t){
        case "1" : 
        $(".commissionValSet").empty();
        break;
        case "2" : 
        $(".commissionValSet").html('<input name="commissionRate" type="text" class="min" /> %');
        break;
        case "3" : 
        $(".commissionValSet").html('<input name="commissionValue" type="text" class="min" />');
        break;
    }
});

function updateTotalCount(){
    var totalCount = 0;
    $(".sku-count").each(function(i,e){
        totalCount = totalCount + ~~$(e).val();
    });
    $("#totalCount").val(totalCount);
}

// 检查条形码是否已存在
var productCode = $("#productCode").val(), productCodeExisted=false;
$("#productCode").blur(function(){
    var val = $(this).val();
    if(productCode == val || val == ""){
        productCodeExisted=false;
        $("#productCode-error").hide();
        $("#productCode").removeClass("error");
        return false;
    }
    $.getJSON("isProductOrShapeCodeExist.json?productCode="+val,function(data){
        if(data.status=="0"){
            if(data.result.exist != "0"){
                $("#productCode-error").show();
                $("#productCode").addClass("error");
                productCodeExisted=true;
            }else{
                $("#productCode-error").hide();
                $("#productCode").removeClass("error");
                productCodeExisted=false;
            }
        }
    });
});
$(".innerTable").on("blur",".sku-code",function(e){
    if(!_stockId){
        var _t = $(this),val = _t.val();
        if(val){
            $.getJSON("isProductOrShapeCodeExist.json?shapeCode="+val,function(data){
                if(data.status=="0"){
                    if(data.result.exist != "0"){
                        Util.alert("该条码号已存在，请重新输入");
                        _t.addClass("error");
                    }else{
                        _t.removeClass("error");
                    }
                }
            });
        }
    }
});

$("#newStocForm").validate({
    rules: {
        productName: {
            required: true,
            maxlength: 100
        },
        tagPrice:{
            required: true,
            number: true
        },
        commissionRate:{
            required: true,
            number: true
        },
        commissionValue:{
            required: true,
            number: true
        },
        categoryId:"required"
    },
    messages: {
        productName: {
            required: "请输入商品名称",
            maxlength: "最长100个字"
        },
        tagPrice:{
            required:"请填写吊牌价",
            number:"请填写正确的价格"
        },
        commissionRate:{
            required: "请填写导购提成",
            number: "请填写数字"
        },
        commissionValue:{
            required: "请填写导购提成",
            number: "请填写数字"
        },
        categoryId:"请选择类目"
    },
    submitHandler:function(form){
        if(productCodeExisted){
            Util.alert("商品款号已存在，请重新输入");
            return false;
        }
        if($(".simpleTable .sku-code.error").length > 0){
            Util.alert("存在重复的商品条码号，请重新输入");
            return false;
        }
        $("#productPicUrl").val($("#previewUploadWrap").find(".loaded:first").data("url"));
        var createParam = $(form).serializeObject();
        createParam.productName = createParam.productName.replace(/"|'/g,"");
        if(parseFloat(createParam.commissionRate) > 70 || parseFloat(createParam.commissionRate) < 0){
            Util.alert("提成范围0~70%");
            return false;
        }
        var preview=[],skuList = [];
        $("#previewUploadWrap").find(".loaded").each(function(i,e){
            preview.push($(e).data("url"));
        });
        createParam.previewJson=preview.join(",");
        createParam.limitCount = Math.max(~~$("input[name=limitCount]").val(),0);
        var skuPriceEdit = true;
        $(".innerTable tbody tr").each(function(i,e){
            var sku;
            if($('.innerTable th.move').length == 2){
                sku = {
                    "color":$(e).find("td:eq(0)").text(),
                    "size":$(e).find("td:eq(1)").text()
                };
            }else if($('.innerTable th.move').length == 1){
                sku = {
                    "color":$(e).find("td:eq(0)").text(),
                    "size":"默认"
                };
            }else{
                sku = {
                    "color":"默认",
                    "size":"默认"
                };
            }
            sku.skuCount = ~~$(e).find(".sku-count").val();
            sku.shapeCode = $(e).find(".sku-code").val();
            sku.skuPrice = $(e).find(".sku-price").val();
            if(useStoreStock){
                sku.skuExternalSid = $(e).find(".skuExternalSid").val();
            }
            if($.trim(sku.skuPrice)==="" || parseFloat(sku.skuPrice) <= 0 || isNaN(sku.skuPrice)){
                $(this).find(".sku-price").focus().addClass("error");
                skuPriceEdit = false;
                return false;
            }else{
                $(this).find(".sku-price").removeClass("error");
                sku.skuPrice = parseFloat(sku.skuPrice).toFixed(2);
            }
            if(_stockId){
                sku.skuId = $(e).data("id") ? $(e).data("id") : "";
            }
            skuList.push(sku);
        });
        if(!skuPriceEdit){
            Util.alert("请填写正确的价格");
            return false;
        }

        // 检查数据
        for(var i in skuList){
            if(skuList[i].skuCount<0){
                Util.alert('库存不能小于0');
                return false;
            }
        }

        createParam.stockSkuListJson = JSON.stringify(skuList);
        if($("#formatBox .format:eq(0) .skuBox.sel").length > 0){
            createParam.norms1Id = $("#formatBox .format:eq(0)").data("id");
        }
        if($("#formatBox .format:eq(1) .skuBox.sel").length > 0){
            createParam.norms2Id = $("#formatBox .format:eq(1)").data("id");
        }

        saveProduct($("#saveBaseInfo"),createParam,function(){
            Util.confirm("保存成功，是否编辑商品描述？",function(){
                $(".filterTitle a").toggleClass("current");
                $(".newProStep1").hide();
                $(".newProStep2").show();
                $("body").scrollTop(0);
            },function(){
                location.href="querySupplierStock.htm";
            });
        });
        // 商品描述编辑预览预处理
        $("#productTitle").html(createParam.productName);
        $(".preview-box-phone .csp-pro-img").css("background-image","url("+createParam.productPicUrl+")");
        $("#previewUploadBak").siblings(".loaded").remove();
        var _previewJsonStr2 = "";
        jQuery.each(preview,function(i,e){
            _previewJsonStr2 += '<div class="webuploader-container loaded" data-url="'+e+'" style="background-image: url('+e+'?imageView2/2/w/80/h/80);"><span class="cancel">×</span></div>';
        });
        $("#previewUploadBakWrap").prepend(_previewJsonStr2);
    }
});

$(".filterTitle a").on("click",function(e){
    e.preventDefault();
    if($(this).hasClass("current") || !$('input[name=stockId]').val()){
        return false;
    }
    $(".filterTitle a").toggleClass("current");
    $(".newProStep1, .newProStep2").toggle();
});
$("#editDespStep").on("click",function(){
    $(".filterTitle a").toggleClass("current");
    $(".newProStep1, .newProStep2").toggle();
    $("body").scrollTop(0);
});

function saveDescription(){
    $("#productPicUrl").val($("#previewUploadBakWrap").find(".loaded:first").data("url"));
    var createParam = $("#newStocForm").serializeObject();
    var preview=[],skuList = [];
    $("#previewUploadBakWrap").find(".loaded").each(function(i,e){
        preview.push($(e).data("url"));
    });
    createParam.previewJson=preview.join(",");
    createParam.limitCount = Math.max(~~$("input[name=limitCount]").val(),0);
    $(".innerTable tbody tr").each(function(i,e){
        var sku;
        if($('.innerTable th.move').length == 2){
            sku = {
                "color":$(e).find("td:eq(0)").text(),
                "size":$(e).find("td:eq(1)").text(),
                "skuCount":~~$(e).find(".sku-count").val(),
                "shapeCode":$(e).find(".sku-code").val(),
                "skuPrice":$(e).find(".sku-price").val()
            };
        }else if($('.innerTable th.move').length == 1){
            sku = {
                "color":$(e).find("td:eq(0)").text(),
                "size":"默认",
                "skuCount":~~$(e).find(".sku-count").val(),
                "shapeCode":$(e).find(".sku-code").val(),
                "skuPrice":$(e).find(".sku-price").val()
            };
        }else{
            sku = {
                "color":"默认",
                "size":"默认",
                "skuCount":~~$(e).find(".sku-count").val(),
                "shapeCode":$(e).find(".sku-code").val(),
                "skuPrice":$(e).find(".sku-price").val()
            };
        }
        
        if($.trim(sku.skuPrice)==="" || parseFloat(sku.skuPrice) <= 0 || isNaN(sku.skuPrice)){
            Util.alert('商品现售价不能为空！');
            skuPriceEdit = false;
            return false;
        }else{
            sku.skuPrice = parseFloat(sku.skuPrice).toFixed(2);
        }
        if(_stockId){
            sku.skuId = $(e).data("id") ? $(e).data("id") : "";
        }
        if(useStoreStock){
            sku.skuExternalSid = $(e).find(".skuExternalSid").val();
        }
        skuList.push(sku);
    });
    createParam.stockSkuListJson = JSON.stringify(skuList);
    if($("#formatBox .format:eq(0) .skuBox.sel").length > 0){
        createParam.norms1Id = $("#formatBox .format:eq(0)").data("id");
    }
    if($("#formatBox .format:eq(1) .skuBox.sel").length > 0){
        createParam.norms2Id = $("#formatBox .format:eq(1)").data("id");
    }
    console.log(createParam);
    return createParam;
}
function ajaxProductInfo(obj,createParam,callback){
    createParam.syncStorePrice=_syncStorePrice;
    createParam.groups = $('select[name="groups"]').val();
    createParam.groups = createParam.groups== null? '': createParam.groups.join('_');
    jQuery.ajax({
        url: _stockId ? "updateSupplierStock.json" : "createSupplierStock.json",
        data:createParam,
        success:function(data){
            if(data.status=="0"){
                $("input[name=stockId]").val(data.result.stock.id);
                _stockId = data.result.stock.id;
                obj.removeClass("disabled");
                savedStockId = data.result.stockId;
                savedProductId = data.result.stock.productId;
                callback();
            }else{
                Util.alert(data.errmsg ? data.errmsg : "系统繁忙，请稍后再试");
                obj.removeClass("disabled");
            }
        }
    });
}

function saveProduct(btn,param,callback){
    var _t = btn,createParam = param;
    if(_t.hasClass("disabled")){
        return false;
    }
    _t.addClass("disabled");
    createParam.description=Keditor.html();
    if(_stockId && _t[0].id=="saveBaseInfo"){
        dialog({
            title:"系统提示",
            id:"util-confirm",
            fixed: true,
            content: '正在保存商品信息，是否同步该商品总库价格至所有门店？',
            width:400,
            button:[
                {
                    id:'notSyncStorePrice',
                    className:'btn-primary',
                    value: '仅修改总库价格',
                    callback: function () {
                        _syncStorePrice = false;
                        ajaxProductInfo(_t,createParam,callback);
                    }
                },
                {
                    id:'syncStorePrice',
                    className:'btn-primary',
                    value: '价格同步到所有门店',
                    callback: function () {
                        _syncStorePrice = true;
                        ajaxProductInfo(_t,createParam,callback);
                    }
                }
            ],
            backdropOpacity:"0.5"
        }).showModal();
    }else{
        ajaxProductInfo(_t,createParam,callback);
    }
    localStorage.editStockDefaultBrand = createParam.brandId;
}
$("#publish").on("click",function(e){
    var createParam = saveDescription();
    saveProduct($("#publish"),createParam,function(){
        $.popupStoreSelect({
            title:"上架微商城",
            type:"multiple",
            url : 'getStoreListOfProduct.json',
            productId:savedProductId,
            resultName : 'otherStoreList',
            clear:true,
            okCallback:function(list){
                var storeIdList = [];
                $.each(list,function(i,e){
                    storeIdList.push(e.id);
                });
                $.ajax({
                    url:"allocateProductToStore.json",
                    data:"stockIdList="+ savedStockId +"&storeIdList="+storeIdList.join("_")+"&off=0",
                    timeout:30000,
                    success:function(data){
                        if(data.status=="0"){
                            Util.alert("上架成功");
                        }
                    }
                });
            }
        });
    });
});
$("#saveAndReturn").on("click",function(){
    var createParam = saveDescription();
    saveProduct($("#saveAndReturn"),createParam,function(){
        location.href="querySupplierStock.htm";
    });
});

$.fn.multiImgUploader = function(options){
    if($("#uploadScript").length === 0){
        $("body").append('<input type="hidden" id="uploadScript" />');
        jQuery.ajax({
            url: "//res.qiakr.com/plugins/webuploader/webuploader-0.1.5.min.js",
            dataType: "script",
            cache: true
        });
    }
    var _this = $(this);
    var setIntervalCon = setInterval(function(){
        if(typeof WebUploader != "undefined"){
            clearInterval(setIntervalCon);
            var uploader = WebUploader.create({
                auto: true,
                swf: '//res.qiakr.com/plugins/webuploader/Uploader.swf',
                server: Util.uploadServer,
                pick: _this[0],
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
                    width: 828,
                    // height: 800,
                    quality: 100,
                    allowMagnify: false,
                    crop: false,
                    preserveHeaders: true,
                    noCompressIfLarger: true,
                    // 单位字节，如果图片大小小于此值，不会采用压缩。
                    compressSize: 300*1024
                }
            });
            var uploaderBtn = $(uploader.option('pick'));
            uploader.on("uploadStart",function(file){
                if(options.length){
                    var fileLength = uploaderBtn.siblings(".loaded").length;
                    if(fileLength >= ~~options.length){
                        Util.alert("上传数量超过限制，不能超过"+options.length+"张");
                        return false;
                    }
                    if(fileLength == ~~options.length-1){
                        uploaderBtn.hide();
                    }
                }
                uploaderBtn.before('<div id="'+file.id+'" class="webuploader-container loaded"><span class="cancel">×</span><div class="webuploader-pick uploading"><div class="progressBar"><div class="progress" style="width:0%"></div></div></div></div>');
            }).on("uploadProgress",function(file,percentage){
                $("#"+file.id).find(".progress").css("width",percentage*100+'%');
            }).on("uploadSuccess",function(file,response){
                var url = Util.cdn+response.hash;
                $("#"+file.id).data("url",url).css("background-image","url("+url+"?imageView2/2/w/80/h/80)").find(".webuploader-pick").remove();
                if(options.resultInput){
                    options.resultInput.val(response.hash);
                }
                if(options.callback){
                    options.callback(url);
                }
            }).on("uploadError",function(){
                Util.alert("上传失败，请稍后再试或刷新页面重试");
            }).on("error",function(msg){
                Util.alert(msg=="Q_TYPE_DENIED" ? "文件格式不正确" : msg);
            });

            _this.parent().on("click",".cancel",function(){
                $(this).parent().fadeOut(300, function() {
                    $(this).remove();
                    if(options.removeCallback){
                        options.removeCallback();
                    }
                    if(options.length){
                        uploaderBtn.show();
                    }
                });
            });
        }
    },100);
};

$("#previewUpload").multiImgUploader({
    length : 5,
    resultInput : $("#productPicUrl")
});
$("#previewUploadBak").multiImgUploader({
    length : 5,
    resultInput : $("#productPicUrlBak"),
    callback:function(){
        var url = $("#previewUploadBakWrap .loaded:first").data("url");
        $(".preview-box-phone .csp-pro-img").css("background-image","url("+url+")");
    },
    removeCallback:function(){
        var url = $("#previewUploadBakWrap .loaded:first").data("url");
        $(".preview-box-phone .csp-pro-img").css("background-image","url("+url+")");
    }
});

// 富文本编辑
KindEditor.ready(function(K){
    Keditor = K.create('textarea[name="description"]', {
        width:555,
        height:525,
        items:['fontsize', 'forecolor', 'hilitecolor', 'bold','italic', 'underline', 'strikethrough', 'lineheight','fontname',  '|','multiUploader','table', 'hr', 'emoticons', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', '|', 'preview'],
        resizeType:1,
        afterChange:function(){
            var html = this.html();
            $("#descriptionView").html(html);
        }
    });
});
