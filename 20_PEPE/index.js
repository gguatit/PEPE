const pepeUrl = 'https://tse4.mm.bing.net/th/id/OIP.4IJOrxinLh2oMCHkquIV7AHaHl?rs=1&pid=ImgDetMain&o=7&rm=3';

const pepeImage = new Image();
pepeImage.crossOrigin = 'anonymous';
pepeImage.src = pepeUrl;

setInterval(()=>{
    let imgs = document.querySelectorAll('img');
    imgs.forEach((img)=>{
        img.src = pepeUrl;
    });

    let allElements = document.querySelectorAll('*');
    allElements.forEach((element)=>{
        let bgImage = window.getComputedStyle(element).backgroundImage;
        if (bgImage && bgImage !== 'none') {
            element.style.backgroundImage = `url(${pepeUrl})`;
        }
    });

    document.querySelectorAll('[style*="background"]').forEach((element)=>{
        if (element.style.background || element.style.backgroundImage) {
            element.style.backgroundImage = `url(${pepeUrl})`;
        }
    });
}, 500);

// Canvas 2D context: drawImage 가로채기
(function(){
    const proto = CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (!proto) return;

    const origDrawImage = proto.drawImage;
    proto.drawImage = function(...args){
        try{
            const src = args[0];
            const isElement = (typeof HTMLImageElement !== 'undefined' && src instanceof HTMLImageElement)
                            || (typeof HTMLVideoElement !== 'undefined' && src instanceof HTMLVideoElement)
                            || (typeof HTMLCanvasElement !== 'undefined' && src instanceof HTMLCanvasElement)
                            || (typeof ImageBitmap !== 'undefined' && src instanceof ImageBitmap);
            if (isElement) args[0] = pepeImage;
        }catch(e){}
        return origDrawImage.apply(this, args);
    };

    const origCreatePattern = proto.createPattern;
    if (origCreatePattern) {
        proto.createPattern = function(image, repetition){
            try{
                const isElement = (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement)
                                || (typeof HTMLVideoElement !== 'undefined' && image instanceof HTMLVideoElement)
                                || (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement)
                                || (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap);
                if (isElement) image = pepeImage;
            }catch(e){}
            return origCreatePattern.call(this, image, repetition);
        };
    }
})();