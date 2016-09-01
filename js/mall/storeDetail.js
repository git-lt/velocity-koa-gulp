var latitude = parseFloat($("#latitude").val()),longitude = parseFloat($("#longitude").val()),inStoreClickTime=0;
if(navigator.geolocation && longitude && latitude){
    navigator.geolocation.getCurrentPosition(updateLocation);
}

$(".storeSales .appProgress").each(function(i,e){
    var stars = parseFloat($(e).find(".val").data("stars"));
    $(e).find(".val").width((stars*20).toFixed(1)+"%");
    $(e).siblings(".grade").html((stars*2).toFixed(1));
});

$(".storeSales .talk a").on("click",function(e){
    e.preventDefault();
    var id=$(this).data("id");
    if(sessionStorage.isLogin=="true"){
        location.href="../webim/chat.htm?salesId="+id;
    }else{
        showMPLoginBox(function(){
            location.reload();
        });
    }
});

function updateLocation(position) {
    var latitudeU = position.coords.latitude;
    var longitudeU = position.coords.longitude;
    if (!latitudeU || !longitudeU) {
        return;
    }
    var mileDistance = getFlatternDistance(latitudeU,longitudeU,latitude,longitude);
    var Distance = mileDistance>1000 ?　((mileDistance/1000).toFixed(2)+"千米") : (mileDistance.toFixed(0)+"米")
    document.getElementById("distance").innerHTML = "距离您大约"+Distance;
}

function getRad(d){
  return d*Math.PI/180.0;
}
function getFlatternDistance(lat1,lng1,lat2,lng2){
    var f = getRad((lat1 + lat2)/2);
    var g = getRad((lat1 - lat2)/2);
    var l = getRad((lng1 - lng2)/2);
    
    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);
    
    var s,c,w,r,d,h1,h2;
    var a = 6378137.0;
    var fl = 1/298.257;
    
    sg = sg*sg;
    sl = sl*sl;
    sf = sf*sf;
    
    s = sg*(1-sl) + (1-sf)*sl;
    c = (1-sg)*(1-sl) + sf*sl;
    
    w = Math.atan(Math.sqrt(s/c));
    r = Math.sqrt(s*c)/w;
    d = 2*w*a;
    h1 = (3*r -1)/2/c;
    h2 = (3*r +1)/2/s;
    
    return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
}

var inStoreTime;
$(".storeMsg").on("click",function(){clearTimeout(inStoreTime);if(++inStoreClickTime==10){inStoreTime=setTimeout(function(){location.href='getStoreHomePage.htm?storeId='+getUrlParam("storeId")},3000)}});
