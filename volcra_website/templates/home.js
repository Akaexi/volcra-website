// ============================================================
// VOLCRA.LAB — home.js
//   1. DROPDOWN LOGO (navbar)
//   2. CHIP CANVAS ANIMATION
//   3. CIRCUIT SVG ANIMATION  (mode klik)
//   4. CLICK CARDS ANIMATION  (mode klik)
//   5. SCROLL CARDS ANIMATION (IntersectionObserver — normal scroll)
// ============================================================


// ------------------------------------------------------------
// SECTION 1: DROPDOWN LOGO (navbar)
// ------------------------------------------------------------
const logoWrapper  = document.getElementById('logo-wrapper');
const logoDropdown = document.getElementById('logo-dropdown');

logoWrapper.addEventListener('click', () => {
    const isVisible = logoDropdown.style.display === 'block';
    logoDropdown.style.display = isVisible ? 'none' : 'block';
});

document.addEventListener('click', (e) => {
    if (!logoWrapper.contains(e.target)) {
        logoDropdown.style.display = 'none';
    }
});


// ------------------------------------------------------------
// SECTION 2: CHIP CANVAS ANIMATION
// Logo diambil dari <img id="chipLogoImg"> di HTML.
// Ganti logo: cukup ubah src di HTML saja.
// ------------------------------------------------------------
const canvas       = document.getElementById('chipCanvas');
const ctx          = canvas.getContext('2d');
const chipLogoImg  = document.getElementById('chipLogoImg');

const W = 140, H = 140, CX = 70, CY = 70;
const ACCENT  = '#4A9CC7';
const CHIP_BG = '#0d0d0d';

let chipProgress = 0;
let animating    = false;
let chipOpened   = false;
let scanY        = 0;
let scanDir      = 1;
let scanRaf;

function lerp(a, b, t)  { return a + (b - a) * t; }
function easeIO(t)       { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }

function drawRR(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r);
    c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r);
    c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y);
    c.closePath();
}

function drawChip(p) {
    ctx.clearRect(0, 0, W, H);
    const e  = easeIO(Math.min(p, 1));
    const sz = lerp(48, 52, e);
    const rx = lerp(48, 8, e);

    if (p > 0.05) { ctx.shadowColor = ACCENT; ctx.shadowBlur = lerp(0,20,e); }

    // Body
    drawRR(ctx, CX-sz, CY-sz, sz*2, sz*2, rx);
    ctx.fillStyle   = CHIP_BG; ctx.fill();
    ctx.strokeStyle = p < 0.05 ? '#252525' : ACCENT;
    ctx.lineWidth   = lerp(1.5, 2, e); ctx.stroke();
    ctx.shadowBlur  = 0;

    // Logo img
    if (chipLogoImg.complete && chipLogoImg.naturalWidth > 0) {
        ctx.save();
        drawRR(ctx, CX-sz+3, CY-sz+3, (sz-3)*2, (sz-3)*2, Math.max(2,rx-3));
        ctx.clip();
        const s = (sz-3)*2;
        ctx.drawImage(chipLogoImg, CX-s/2, CY-s/2, s, s);
        ctx.restore();
    }

    // Inner border
    if (p > 0.3) {
        const a = easeIO((p-0.3)/0.7), pad = lerp(0,10,a);
        drawRR(ctx, CX-sz+pad, CY-sz+pad, (sz-pad)*2, (sz-pad)*2, Math.max(2,rx-6));
        ctx.strokeStyle = `rgba(74,156,199,${.15*a})`; ctx.lineWidth=1; ctx.stroke();
    }

    // Wild circuit traces
    if (p > 0.4) {
        const a = easeIO((p-0.4)/0.6);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = `rgba(74,156,199,${.6*a})`;
        ctx.beginPath(); ctx.moveTo(CX-20,CY-sz); ctx.lineTo(CX-20,CY-sz-8); ctx.lineTo(CX-12,CY-sz-8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX+10,CY-sz); ctx.lineTo(CX+10,CY-sz-6); ctx.lineTo(CX+20,CY-sz-6); ctx.lineTo(CX+20,CY-sz-10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX-15,CY+sz); ctx.lineTo(CX-15,CY+sz+8); ctx.lineTo(CX-24,CY+sz+8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX+5, CY+sz); ctx.lineTo(CX+5, CY+sz+6); ctx.lineTo(CX+16,CY+sz+6); ctx.lineTo(CX+16,CY+sz+12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX-sz,CY-18); ctx.lineTo(CX-sz-8,CY-18); ctx.lineTo(CX-sz-8,CY-8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX-sz,CY+10); ctx.lineTo(CX-sz-10,CY+10); ctx.stroke();
        ctx.strokeStyle = `rgba(74,156,199,${a})`;
        ctx.beginPath(); ctx.moveTo(CX+sz,CY-20); ctx.lineTo(CX+sz+10,CY-20); ctx.lineTo(CX+sz+10,CY-12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX+sz,CY);    ctx.lineTo(CX+sz+12,CY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX+sz,CY+20); ctx.lineTo(CX+sz+10,CY+20); ctx.lineTo(CX+sz+10,CY+12); ctx.stroke();
        const dots = [[CX-12,CY-sz-8],[CX+20,CY-sz-10],[CX-24,CY+sz+8],[CX+16,CY+sz+12],[CX-sz-8,CY-8],[CX-sz-10,CY+10],[CX+sz+12,CY]];
        ctx.fillStyle = `rgba(74,156,199,${a})`;
        dots.forEach(([x,y])=>{ ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); });
    }

    // Corner brackets
    if (p > 0.5) {
        const a = easeIO((p-0.5)/0.5), off=sz-5, bl=lerp(0,13,a);
        ctx.strokeStyle=`rgba(74,156,199,${a})`; ctx.lineWidth=1.5;
        [[CX-off,CY-off,1,1],[CX+off,CY-off,-1,1],[CX-off,CY+off,1,-1],[CX+off,CY+off,-1,-1]]
        .forEach(([x,y,dx,dy])=>{ ctx.beginPath(); ctx.moveTo(x+dx*bl,y); ctx.lineTo(x,y); ctx.lineTo(x,y+dy*bl); ctx.stroke(); });
    }

    // Pins
    if (p > 0.55) {
        const a=easeIO((p-0.55)/0.45), pl=lerp(0,13,a);
        ctx.lineWidth=1.5;
        [-22,-6,10].forEach(o=>{
            ctx.strokeStyle=`rgba(74,156,199,${a*.45})`;
            ctx.beginPath(); ctx.moveTo(CX-sz,CY+o); ctx.lineTo(CX-sz-pl,CY+o); ctx.stroke();
            ctx.strokeStyle=`rgba(74,156,199,${a})`;
            ctx.beginPath(); ctx.moveTo(CX+sz,CY+o); ctx.lineTo(CX+sz+pl,CY+o); ctx.stroke();
            if(a>.75){ ctx.beginPath(); ctx.arc(CX+sz+pl,CY+o,2,0,Math.PI*2); ctx.fillStyle=`rgba(74,156,199,${(a-.75)/.25})`; ctx.fill(); }
        });
        [-20,0,20].forEach(o=>{
            ctx.strokeStyle=`rgba(74,156,199,${a*.55})`;
            ctx.beginPath(); ctx.moveTo(CX+o,CY-sz); ctx.lineTo(CX+o,CY-sz-pl); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(CX+o,CY+sz); ctx.lineTo(CX+o,CY+sz+pl); ctx.stroke();
        });
    }

    // Scan line
    if (p >= 1) {
        scanY += 0.7*scanDir;
        if (scanY > sz*2-4) scanDir=-1;
        if (scanY < 2)      scanDir= 1;
        ctx.fillStyle='rgba(74,156,199,0.07)';
        ctx.fillRect(CX-sz+2, CY-sz+scanY, sz*2-4, 2);
    }
}

function initDraw() { drawChip(0); }
if (chipLogoImg.complete) initDraw();
else chipLogoImg.addEventListener('load', initDraw);

function startScanLoop() {
    if (!chipOpened) return;
    drawChip(1);
    scanRaf = requestAnimationFrame(startScanLoop);
}

function animateChipTo(target) {
    if (animating) return;
    animating = true;
    cancelAnimationFrame(scanRaf);
    const sv=chipProgress, dur=900, t0=performance.now();
    function step(now) {
        const t=Math.min((now-t0)/dur,1);
        chipProgress=lerp(sv,target,easeIO(t)); drawChip(chipProgress);
        if(t<1) requestAnimationFrame(step);
        else { chipProgress=target; animating=false; if(target===1) startScanLoop(); }
    }
    requestAnimationFrame(step);
}


// ------------------------------------------------------------
// SECTION 3: CIRCUIT SVG (mode klik)
// ------------------------------------------------------------
const pathGroups = [
    { ids:['cp1','cp1b','cp1c'], dots:['dot1','dot1b','dot1c'], lens:[400,100,50], delays:[0,150,250] },
    { ids:['cp2','cp2b','cp2c'], dots:['dot2','dot2b','dot2c'], lens:[300,80,80],  delays:[80,220,300] },
    { ids:['cp3','cp3b','cp3c'], dots:['dot3','dot3b','dot3c'], lens:[400,100,50], delays:[160,300,400] },
];

function animateCircuit() {
    pathGroups.forEach(g => {
        g.ids.forEach((id,j) => {
            const el=document.getElementById(id), dur=[500,350,300][j];
            setTimeout(()=>{
                el.style.transition=`stroke-dashoffset ${dur}ms cubic-bezier(.4,0,.2,1)`;
                el.style.strokeDashoffset='0';
                setTimeout(()=>{ document.getElementById(g.dots[j]).style.opacity='1'; }, dur+50);
            }, 200+g.delays[j]);
        });
    });
}

function resetCircuit() {
    pathGroups.forEach(g => {
        g.ids.forEach((id,j)=>{ const el=document.getElementById(id); el.style.transition='none'; el.style.strokeDashoffset=g.lens[j]; });
        g.dots.forEach(d=>{ document.getElementById(d).style.opacity='0'; });
    });
}


// ------------------------------------------------------------
// SECTION 4: CLICK MODE — logo geser kiri + circuit + cards
// ------------------------------------------------------------
const logoZone  = document.getElementById('logoZone');
const rightZone = document.getElementById('rightZone');
let   clickMode = false;

function openClickMode() {
    clickMode = true;
    logoZone.classList.add('moved');
    animateChipTo(1);
    setTimeout(() => {
        rightZone.classList.add('visible');
        animateCircuit();
        document.querySelectorAll('#cardsCol .vcard').forEach((c,i) => {
            setTimeout(() => c.classList.add('visible'), 700 + i*200);
        });
    }, 450);
}

function closeClickMode() {
    clickMode = false;
    cancelAnimationFrame(scanRaf);
    logoZone.classList.remove('moved');
    animateChipTo(0);
    rightZone.classList.remove('visible');
    resetCircuit();
    document.querySelectorAll('#cardsCol .vcard').forEach(c => c.classList.remove('visible'));
}

logoZone.addEventListener('click', () => {
    if (!clickMode) openClickMode();
    else closeClickMode();
});


// ------------------------------------------------------------
// SECTION 5: SCROLL MODE — IntersectionObserver
// Cards di section bawah muncul dari bawah saat masuk viewport.
// Ini cara yang benar — halaman punya tinggi 2x viewport,
// pengunjung scroll normal, observer trigger animasi.
// Urutan: sc-card--1 (kiri), sc-card--2 (kanan), sc-card--3 (tengah)
// ------------------------------------------------------------
const scrollCardOrder = ['sc-card--1', 'sc-card--2', 'sc-card--3'];
let   scrollAnimDone  = false;

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !scrollAnimDone) {
            scrollAnimDone = true;
            // Animasi berurutan: kiri → kanan → tengah
            scrollCardOrder.forEach((cls, i) => {
                const card = document.querySelector('.' + cls);
                if (card) setTimeout(() => card.classList.add('visible'), i * 200);
            });
        }
    });
}, {
    threshold: 0.2   // trigger saat 20% section terlihat
});

const cardsSection = document.getElementById('cardsSection');
if (cardsSection) cardObserver.observe(cardsSection);