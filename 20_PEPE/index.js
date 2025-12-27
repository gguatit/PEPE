// Use an embedded data-URI image to avoid external network requests
const pepeUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23F0F0F0"/><text x="50%" y="50%" font-size="36" text-anchor="middle" alignment-baseline="middle" fill="%23006400">PEPE</text></svg>';

const pepeImage = new Image();
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

// WebGL 텍스처 업로드 가로채기 (tetr.io 같은 사이트 지원)
(function(){
    const pepe = pepeImage;
    const glProtos = [];
    if (typeof WebGLRenderingContext !== 'undefined') glProtos.push(WebGLRenderingContext.prototype);
    if (typeof WebGL2RenderingContext !== 'undefined') glProtos.push(WebGL2RenderingContext.prototype);
    if (glProtos.length === 0) return;

    const wrap = (proto, name) => {
        const orig = proto[name];
        if (!orig) return;
        proto[name] = function(...args){
            try{
                // 보통 source 객체는 마지막 인자 또는 마지막에서 두번째 인자일 수 있음
                for (let i = args.length-1; i >= 0; i--) {
                    const a = args[i];
                    if (!a) continue;
                    const isElement = (typeof HTMLImageElement !== 'undefined' && a instanceof HTMLImageElement)
                                    || (typeof HTMLVideoElement !== 'undefined' && a instanceof HTMLVideoElement)
                                    || (typeof HTMLCanvasElement !== 'undefined' && a instanceof HTMLCanvasElement)
                                    || (typeof ImageBitmap !== 'undefined' && a instanceof ImageBitmap);
                    if (isElement) {
                        args[i] = pepe;
                        break;
                    }
                }
            }catch(e){}
            return orig.apply(this, args);
        };
    };

    const names = [
        'texImage2D', 'texSubImage2D', 'compressedTexImage2D', 'compressedTexSubImage2D',
        'texImage3D', 'texSubImage3D'
    ];
    glProtos.forEach(proto => names.forEach(name => wrap(proto, name)));
})();

// 모든 요소에 적용되도록 추가 보강: 글로벌 CSS 주입, 속성 가로채기, 스타일시트 치환, MutationObserver
(function(){
    try{
        // 글로벌 스타일 강제 적용
        const css = `
        *, *::before, *::after {
            background-image: url(${pepeUrl}) !important;
            background: url(${pepeUrl}) !important;
            background-size: cover !important;
            background-repeat: no-repeat !important;
            list-style-image: url(${pepeUrl}) !important;
            -webkit-mask-image: none !important;
            mask-image: none !important;
            cursor: url(${pepeUrl}), auto !important;
        }
        img, video, object, embed, input[type="image"], svg image {
            background-image: none !important;
        }
        `;
        const styleTag = document.createElement('style');
        styleTag.setAttribute('data-pepe-global','true');
        styleTag.textContent = css;
        document.documentElement.appendChild(styleTag);
    }catch(e){}

    // 요소 교체 도우미
    function replaceElement(el){
        if(!el || el.nodeType !== 1) return;
        try{
            const tag = (el.tagName||'').toUpperCase();
            if(tag === 'IMG') el.src = pepeUrl;
            if(tag === 'VIDEO' && el.poster) el.poster = pepeUrl;
            if(tag === 'INPUT' && el.type === 'image') el.src = pepeUrl;
            if(tag === 'OBJECT' || tag === 'EMBED') el.data = pepeUrl;
            if(tag === 'SOURCE' && el.src) el.src = pepeUrl;
            // svg <image>
            if(el.namespaceURI === 'http://www.w3.org/2000/svg'){
                if(tag === 'IMAGE'){
                    try{ el.setAttribute('href', pepeUrl); }catch(e){}
                    try{ el.setAttribute('xlink:href', pepeUrl); }catch(e){}
                }
            }

            // 속성 기반 교체
            ['src','srcset','poster','data','href','style','data-src','data-background'].forEach(attr=>{
                try{
                    if(el.hasAttribute && el.hasAttribute(attr)){
                        if(attr === 'style'){
                            el.style.backgroundImage = `url(${pepeUrl})`;
                            el.style.background = `url(${pepeUrl})`;
                        } else if(attr === 'srcset'){
                            el.setAttribute(attr, pepeUrl);
                        } else {
                            el.setAttribute(attr, pepeUrl);
                        }
                    }
                }catch(e){}
            });

            // inline style 보정
            if(el.style){
                try{ el.style.backgroundImage = `url(${pepeUrl})`; }catch(e){}
                try{ el.style.background = `url(${pepeUrl})`; }catch(e){}
            }
        }catch(e){}
    }

    // 초기 DOM 패스
    try{
        document.querySelectorAll('img,video,source,input[type="image"],object,embed,iframe,svg image,*').forEach(node=>{
            replaceElement(node);
        });
    }catch(e){}

    // HTMLImageElement.src와 setAttribute 가로채기
    try{
        if(typeof HTMLImageElement !== 'undefined'){
            const imgProto = HTMLImageElement.prototype;
            const desc = Object.getOwnPropertyDescriptor(imgProto, 'src');
            if(desc && desc.set){
                const origSet = desc.set;
                Object.defineProperty(imgProto, 'src', {
                    set: function(v){ try{ origSet.call(this, pepeUrl); }catch(e){} },
                    get: desc.get,
                    configurable: true
                });
            }
        }
    }catch(e){}

    try{
        const origSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value){
            try{
                const tag = (this && this.tagName) ? this.tagName.toUpperCase() : '';
                // Don't override script src or modify SCRIPT elements (CSP 안전성)
                if(tag === 'SCRIPT') return origSetAttribute.call(this, name, value);
                // Otherwise avoid replacing src/href for potentially sensitive elements
                if(name === 'src' || name === 'poster' || name === 'data' || name === 'href' || name === 'srcset'){
                    // Skip replacement for scripts, links, iframes to avoid CSP and functionality breakage
                    if(tag === 'LINK' || tag === 'IFRAME' || tag === 'OBJECT' || tag === 'EMBED') return origSetAttribute.call(this, name, value);
                    value = pepeUrl;
                }
            }catch(e){}
            return origSetAttribute.call(this, name, value);
        };
    }catch(e){}

    // 스타일시트 내의 url(...) 치환
    function replaceStylesheets(){
        for(const ss of Array.from(document.styleSheets || [])){
            try{
                const rules = ss.cssRules;
                if(!rules) continue;
                for(const r of Array.from(rules)){
                    try{
                        if(r.style){
                            if(r.style.backgroundImage) r.style.backgroundImage = `url(${pepeUrl})`;
                            if(r.style.listStyleImage) r.style.listStyleImage = `url(${pepeUrl})`;
                            if(r.style.cursor && r.style.cursor.indexOf('url(') >= 0) r.style.cursor = `url(${pepeUrl}), auto`;
                            if(r.style.maskImage) r.style.maskImage = 'none';
                        }
                    }catch(e){}
                }
            }catch(e){}
        }
    }
    try{ replaceStylesheets(); }catch(e){}

    // MutationObserver로 동적 생성 요소 및 속성 변경 감시
    try{
        const mo = new MutationObserver(muts => {
            for(const m of muts){
                if(m.type === 'childList'){
                    m.addedNodes.forEach(n => {
                        if(n.nodeType === 1){
                            replaceElement(n);
                            try{ n.querySelectorAll && n.querySelectorAll('img,video,source,input[type="image"],object,embed,iframe,svg image,*').forEach(replaceElement); }catch(e){}
                        }
                    });
                } else if(m.type === 'attributes'){
                    replaceElement(m.target);
                }
            }
        });
        mo.observe(document.documentElement || document, { childList: true, subtree: true, attributes: true, attributeFilter: ['src','srcset','poster','data','style','href'] });
    }catch(e){}
})();

// Shadow DOM, DOM 삽입 훅, CSS setProperty, innerHTML/outerHTML 가로채기
(function(){
    try{
        // attachShadow 가로채기: 생성되는 shadow root에도 교체 로직 적용
        const origAttach = Element.prototype.attachShadow;
        if(origAttach){
            Element.prototype.attachShadow = function(init){
                const sr = origAttach.call(this, init);
                try{ // style 추가 및 observer 설치
                    const s = document.createElement('style');
                    s.setAttribute('data-pepe-global','true');
                    s.textContent = `*{background-image:url(${pepeUrl}) !important;background: url(${pepeUrl}) !important;}`;
                    sr.appendChild(s);
                }catch(e){}
                try{ sr.querySelectorAll && sr.querySelectorAll('img,video,source,input[type="image"],object,embed,svg image,*').forEach(node=>{ try{ node.src && (node.src = pepeUrl); }catch(e){} }); }catch(e){}
                return sr;
            };
        }

        // document.createElement 가로채기: React 등에서 요소 생성 시 기본 속성 적용
        const origCreate = Document.prototype.createElement;
        Document.prototype.createElement = function(tagName, options){
            const el = origCreate.call(this, tagName, options);
            try{ replaceElement(el); }catch(e){}
            return el;
        };

        // Node 삽입 시점에 교체
        const wrapInsert = (proto, name) => {
            const orig = proto[name];
            if(!orig) return;
            proto[name] = function(node){
                try{
                    if(node && node.nodeType === 1){
                        replaceElement(node);
                        try{ node.querySelectorAll && node.querySelectorAll('img,video,source,input[type="image"],object,embed,iframe,svg image,*').forEach(replaceElement); }catch(e){}
                    }
                }catch(e){}
                return orig.apply(this, arguments);
            };
        };
        wrapInsert(Node.prototype, 'appendChild');
        wrapInsert(Node.prototype, 'insertBefore');
        wrapInsert(Node.prototype, 'replaceChild');

        // CSSStyleDeclaration.setProperty 가로채기: background 관련 값이 url()이면 치환
        if(typeof CSSStyleDeclaration !== 'undefined'){
            const cssProto = CSSStyleDeclaration.prototype;
            const origSetProp = cssProto.setProperty;
            if(origSetProp){
                cssProto.setProperty = function(prop, value, priority){
                    try{
                        if(value && typeof value === 'string' && value.indexOf('url(') >= 0){
                            value = `url(${pepeUrl})`;
                        }
                    }catch(e){}
                    return origSetProp.call(this, prop, value, priority);
                };
            }
        }

        // NOTE: avoid global innerHTML/outerHTML string replacements because
        // they may modify <script> content or inject data-URIs that violate CSP.
        // Therefore this interception has been intentionally removed.
        // document.write 가로채기
        if(document && document.write){
            const origWrite = document.write;
            document.write = function(str){
                try{ if(typeof str === 'string') str = str.replace(/url\((.*?)\)/gi, `url(${pepeUrl})`).replace(/src=("|')(.*?)("|')/gi, `src="${pepeUrl}"`); }catch(e){}
                return origWrite.call(this, str);
            };
        }
    }catch(e){}
})();

// WebGL 프레임버퍼 복사 가로채기만 유지 (서버 요청 없음)
(function(){
    try{
        const glProtos = [];
        if(typeof WebGLRenderingContext !== 'undefined') glProtos.push(WebGLRenderingContext.prototype);
        if(typeof WebGL2RenderingContext !== 'undefined') glProtos.push(WebGL2RenderingContext.prototype);
        if(glProtos.length === 0) return;

        glProtos.forEach(proto => {
            const origCopy = proto.copyTexImage2D;
            if(origCopy){
                proto.copyTexImage2D = function(target, level, internalformat, x, y, width, height, border){
                    try{
                        if(pepeImage && pepeImage.complete){
                            try{ this.texImage2D(target, level, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, pepeImage); return; }catch(e){}
                        }
                    }catch(e){}
                    return origCopy.apply(this, arguments);
                };
            }

            const origCopySub = proto.copyTexSubImage2D;
            if(origCopySub){
                proto.copyTexSubImage2D = function(target, level, xoffset, yoffset, x, y, width, height){
                    try{
                        if(pepeImage && pepeImage.complete){
                            try{ this.texImage2D(target, level, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, pepeImage); return; }catch(e){}
                        }
                    }catch(e){}
                    return origCopySub.apply(this, arguments);
                };
            }
        });
    }catch(e){}
})();