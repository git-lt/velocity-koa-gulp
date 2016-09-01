template.helper('stringify', function (data, format) {
  if(!data) return "";
  return JSON.stringify(data);
});

$.getJSON("getCustomerAddressList.json?index=0&length=20",function(data){
	var htmlStr = template("tempData",{list:data.result.addressList});
    $('.addr-list').append(htmlStr);
    $(".loading-bottom").remove();
    var defaultAddrHtm = $(".addr-list dl.default").remove();
    $(".addr-list").prepend(defaultAddrHtm);
});

$('.addr-list').on("click","a.addr",function(e){
  e.preventDefault();
  $(this).parent().find("a.edit").click();
}).on("click","a.edit",function(e){
   e.preventDefault();
   sessionStorage.receiveAddressJson = $(this).attr('data-addrjson');
   location.href="setCustomerAddress.htm?from="+getUrlParam('from');
});

$(".newAddress").on("click",function(e){
  e.preventDefault();
  if(sessionStorage.receiveAddressJson){
    sessionStorage.removeItem('receiveAddressJson');
  }
  location.href="setCustomerAddress.htm?from="+getUrlParam('from');
});