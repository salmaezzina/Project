var compteurImg=1;
var totalimage=5;

function slider(x) {

    var image=document.getElementById('imaagee');
    compteurImg=compteurImg + x;
    image.src="public/img/Ecosystem/imge" + compteurImg + ".jpg";

    if (compteurImg>=totalimage)
    {
        compteurImg=1;
    }

    if (compteurImg<1) {compteurImg=totalimage;} 
    
}

function sliderAuto() {

    var image=document.getElementById('imaagee');
    compteurImg=compteurImg + 1;
    image.src="public/img/Ecosystem/imge" + compteurImg + ".jpg";

    if (compteurImg>=totalimage)
    {
        compteurImg=1;
    }

    if (compteurImg<1) {compteurImg=totalimage;} 
}

window.setInterval(sliderAuto,3000);

