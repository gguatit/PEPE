const pepeUrl = 'https://tse4.mm.bing.net/th/id/OIP.4IJOrxinLh2oMCHkquIV7AHaHl?rs=1&pid=ImgDetMain&o=7&rm=3';

setInterval(()=>{
    // img 태그 변경
    let imgs = document.querySelectorAll('img');
    imgs.forEach((img)=>{
        img.src = pepeUrl;
    });

    // 배경 이미지 변경
    let allElements = document.querySelectorAll('*');
    allElements.forEach((element)=>{
        let bgImage = window.getComputedStyle(element).backgroundImage;
        if (bgImage && bgImage !== 'none') {
            element.style.backgroundImage = `url(${pepeUrl})`;
        }
    });

    // CSS 변수로 설정된 배경 이미지도 변경
    document.querySelectorAll('[style*="background"]').forEach((element)=>{
        if (element.style.background || element.style.backgroundImage) {
            element.style.backgroundImage = `url(${pepeUrl})`;
        }
    });
}, 500);