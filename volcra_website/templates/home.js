// ============================================================
// VOLCRA.LAB — home.js
// Semua interaksi halaman utama dalam satu file:
//   1. DROPDOWN LOGO (navbar)
//   2. CHIP CANVAS ANIMATION (logo dari <img> tag)
//   3. CIRCUIT SVG ANIMATION
//   4. CARDS ANIMATION
//   5. TRIGGER (klik logo / scroll)
// ============================================================


// ------------------------------------------------------------
// SECTION 1: DROPDOWN LOGO (navbar)
// Klik logo navbar → muncul dropdown menu
// Klik di luar → dropdown hilang
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
//
// Logo gambar diambil dari <img id="chipLogoImg"> di HTML.
// Untuk mengganti logo: cukup ubah src di HTML, JS otomatis pakai.
//
// Alur animasi:
//   p=0 → lingkaran polos dengan logo di dalamnya
//   p=1 → chip penuh: border, pin, trace sirkuit, scan line
// ------------------------------------------------------------
const canvas     = document.getElementById('chipCanvas');
const ctx        = canvas.getContext('2d');
const chipLogoImg = document.getElementById('chipLogoImg'); // ← sumber logo dari HTML

const W = 140, H = 140, CX = 70, CY = 70;
const ACCENT  = '#4A9CC7';
const CHIP_BG = '#0d0d0d';

let chipProgress = 0;
let animating    = false;
let chipOpened   = false;
let scanY        = 0;
let scanDir      = 1;
let scanRaf;

function lerp(a, b, t) { return a + (b - a) * t; }

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function drawRoundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);        c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
}

function drawChip(p) {
    ctx.clearRect(0, 0, W, H);
    const e  = easeInOut(Math.min(p, 1));
    const sz = lerp(48, 52, e);
    const rx = lerp(48, 8, e); // 48 = lingkaran sempurna → 8 = rounded square chip

    // --- Glow ---
    if (p > 0.05) {
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur  = lerp(0, 20, e);
    }

    // --- Body chip (lingkaran → persegi) ---
    drawRoundRect(ctx, CX - sz, CY - sz, sz * 2, sz * 2, rx);
    ctx.fillStyle   = CHIP_BG;
    ctx.fill();
    ctx.strokeStyle = p < 0.05 ? '#252525' : ACCENT;
    ctx.lineWidth   = lerp(1.5, 2, e);
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // --- Logo gambar dari <img> tag di HTML ---
    // Gambar di-clip mengikuti bentuk body (lingkaran → chip)
    if (chipLogoImg.complete && chipLogoImg.naturalWidth > 0) {
        ctx.save();
        drawRoundRect(ctx, CX - sz + 3, CY - sz + 3, (sz - 3) * 2, (sz - 3) * 2, Math.max(2, rx - 3));
        ctx.clip();
        const imgSz = (sz - 3) * 2;
        ctx.drawImage(chipLogoImg, CX - imgSz / 2, CY - imgSz / 2, imgSz, imgSz);
        ctx.restore();
    }

    // --- Inner border (muncul saat chip terbentuk) ---
    if (p > 0.3) {
        const a   = easeInOut((p - 0.3) / 0.7);
        const pad = lerp(0, 10, a);
        drawRoundRect(ctx, CX - sz + pad, CY - sz + pad, (sz - pad) * 2, (sz - pad) * 2, Math.max(2, rx - 6));
        ctx.strokeStyle = `rgba(74,156,199,${0.15 * a})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
    }

    // --- Wild circuit traces di pinggiran chip ---
    if (p > 0.4) {
        const a = easeInOut((p - 0.4) / 0.6);
        ctx.lineWidth = 1.2;

        // TOP edge
        ctx.strokeStyle = `rgba(74,156,199,${0.6 * a})`;
        ctx.beginPath(); ctx.moveTo(CX - 20, CY - sz); ctx.lineTo(CX - 20, CY - sz - 8); ctx.lineTo(CX - 12, CY - sz - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX + 10, CY - sz); ctx.lineTo(CX + 10, CY - sz - 6); ctx.lineTo(CX + 20, CY - sz - 6); ctx.lineTo(CX + 20, CY - sz - 10); ctx.stroke();

        // BOTTOM edge
        ctx.beginPath(); ctx.moveTo(CX - 15, CY + sz); ctx.lineTo(CX - 15, CY + sz + 8); ctx.lineTo(CX - 24, CY + sz + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX + 5,  CY + sz); ctx.lineTo(CX + 5,  CY + sz + 6); ctx.lineTo(CX + 16, CY + sz + 6); ctx.lineTo(CX + 16, CY + sz + 12); ctx.stroke();

        // LEFT edge (input — redup)
        ctx.beginPath(); ctx.moveTo(CX - sz, CY - 18); ctx.lineTo(CX - sz - 8,  CY - 18); ctx.lineTo(CX - sz - 8,  CY - 8);  ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX - sz, CY + 10); ctx.lineTo(CX - sz - 10, CY + 10); ctx.stroke();

        // RIGHT edge (output — terang)
        ctx.strokeStyle = `rgba(74,156,199,${a})`;
        ctx.beginPath(); ctx.moveTo(CX + sz, CY - 20); ctx.lineTo(CX + sz + 10, CY - 20); ctx.lineTo(CX + sz + 10, CY - 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX + sz, CY);      ctx.lineTo(CX + sz + 12, CY);       ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX + sz, CY + 20); ctx.lineTo(CX + sz + 10, CY + 20); ctx.lineTo(CX + sz + 10, CY + 12); ctx.stroke();

        // Dots di ujung trace
        const traceDots = [
            [CX - 12,    CY - sz - 8],  [CX + 20,    CY - sz - 10],
            [CX - 24,    CY + sz + 8],  [CX + 16,    CY + sz + 12],
            [CX - sz - 8, CY - 8],      [CX - sz - 10, CY + 10],
            [CX + sz + 12, CY]
        ];
        ctx.fillStyle = `rgba(74,156,199,${a})`;
        traceDots.forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        });
    }

    // --- Corner brackets ---
    if (p > 0.5) {
        const a   = easeInOut((p - 0.5) / 0.5);
        const off = sz - 5;
        const bl  = lerp(0, 13, a);
        ctx.strokeStyle = `rgba(74,156,199,${a})`;
        ctx.lineWidth   = 1.5;
        [
            [CX - off, CY - off,  1,  1],
            [CX + off, CY - off, -1,  1],
            [CX - off, CY + off,  1, -1],
            [CX + off, CY + off, -1, -1]
        ].forEach(([x, y, dx, dy]) => {
            ctx.beginPath();
            ctx.moveTo(x + dx * bl, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * bl);
            ctx.stroke();
        });
    }

    // --- Pins ---
    if (p > 0.55) {
        const a  = easeInOut((p - 0.55) / 0.45);
        const pl = lerp(0, 13, a);
        ctx.lineWidth = 1.5;

        // Kiri & kanan
        [-22, -6, 10].forEach(o => {
            ctx.strokeStyle = `rgba(74,156,199,${a * 0.45})`;
            ctx.beginPath(); ctx.moveTo(CX - sz, CY + o); ctx.lineTo(CX - sz - pl, CY + o); ctx.stroke();

            ctx.strokeStyle = `rgba(74,156,199,${a})`;
            ctx.beginPath(); ctx.moveTo(CX + sz, CY + o); ctx.lineTo(CX + sz + pl, CY + o); ctx.stroke();
            if (a > 0.75) {
                ctx.beginPath(); ctx.arc(CX + sz + pl, CY + o, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(74,156,199,${(a - 0.75) / 0.25})`;
                ctx.fill();
            }
        });

        // Atas & bawah
        [-20, 0, 20].forEach(o => {
            ctx.strokeStyle = `rgba(74,156,199,${a * 0.55})`;
            ctx.beginPath(); ctx.moveTo(CX + o, CY - sz); ctx.lineTo(CX + o, CY - sz - pl); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(CX + o, CY + sz); ctx.lineTo(CX + o, CY + sz + pl); ctx.stroke();
        });
    }

    // --- Scan line (hanya saat chip fully active) ---
    if (p >= 1) {
        scanY += 0.7 * scanDir;
        if (scanY > sz * 2 - 4) scanDir = -1;
        if (scanY < 2)          scanDir =  1;
        ctx.fillStyle = 'rgba(74,156,199,0.07)';
        ctx.fillRect(CX - sz + 2, CY - sz + scanY, sz * 2 - 4, 2);
    }
}

// Draw awal setelah img siap
function initDraw() { drawChip(0); }
if (chipLogoImg.complete) {
    initDraw();
} else {
    chipLogoImg.addEventListener('load', initDraw);
}

function startScanLoop() {
    if (!chipOpened) return;
    drawChip(1);
    scanRaf = requestAnimationFrame(startScanLoop);
}

function animateChipTo(target) {
    if (animating) return;
    animating = true;
    cancelAnimationFrame(scanRaf);
    const startVal = chipProgress;
    const dur      = 900;
    const t0       = performance.now();

    function step(now) {
        const t      = Math.min((now - t0) / dur, 1);
        chipProgress = lerp(startVal, target, easeInOut(t));
        drawChip(chipProgress);
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            chipProgress = target;
            animating    = false;
            if (target === 1) startScanLoop();
        }
    }
    requestAnimationFrame(step);
}


// ------------------------------------------------------------
// SECTION 3: CIRCUIT SVG ANIMATION
// Jalur sirkuit tumbuh dari chip ke card satu per satu
// ------------------------------------------------------------
const pathGroups = [
    {
        ids:    ['cp1',  'cp1b', 'cp1c'],
        dots:   ['dot1', 'dot1b','dot1c'],
        lens:   [400, 100, 50],
        delays: [0,   150, 250]
    },
    {
        ids:    ['cp2',  'cp2b', 'cp2c'],
        dots:   ['dot2', 'dot2b','dot2c'],
        lens:   [300, 80,  80],
        delays: [80,  220, 300]
    },
    {
        ids:    ['cp3',  'cp3b', 'cp3c'],
        dots:   ['dot3', 'dot3b','dot3c'],
        lens:   [400, 100, 50],
        delays: [160, 300, 400]
    },
];

function animateCircuit() {
    pathGroups.forEach(group => {
        group.ids.forEach((id, j) => {
            const el  = document.getElementById(id);
            const dur = [500, 350, 300][j];
            setTimeout(() => {
                el.style.transition       = `stroke-dashoffset ${dur}ms cubic-bezier(0.4,0,0.2,1)`;
                el.style.strokeDashoffset = '0';
                setTimeout(() => {
                    document.getElementById(group.dots[j]).style.opacity = '1';
                }, dur + 50);
            }, 200 + group.delays[j]);
        });
    });
}

function resetCircuit() {
    pathGroups.forEach(group => {
        group.ids.forEach((id, j) => {
            const el = document.getElementById(id);
            el.style.transition       = 'none';
            el.style.strokeDashoffset = group.lens[j];
        });
        group.dots.forEach(dotId => {
            document.getElementById(dotId).style.opacity = '0';
        });
    });
}


// ------------------------------------------------------------
// SECTION 4: CARDS ANIMATION
// Card muncul berurutan dengan delay setelah sirkuit tumbuh
// ------------------------------------------------------------
function showCards() {
    document.querySelectorAll('.vcard').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), 700 + i * 200);
    });
}

function hideCards() {
    document.querySelectorAll('.vcard').forEach(card => card.classList.remove('visible'));
}


// ------------------------------------------------------------
// SECTION 5: MAIN TRIGGER
// Klik logo ATAU scroll ke bawah → animasi chip + geser ke kiri
// ------------------------------------------------------------
const logoZone  = document.getElementById('logoZone');
const rightZone = document.getElementById('rightZone');
const clickHint = document.getElementById('clickHint');

function openChip() {
    chipOpened = true;

    // Sembunyikan hint
    clickHint.classList.add('gone');

    // Geser logo ke kiri
    logoZone.classList.add('moved');

    // Animasi chip: lingkaran → chip
    animateChipTo(1);

    // Setelah logo mulai bergerak, tampilkan circuit + cards
    setTimeout(() => {
        rightZone.classList.add('visible');
        animateCircuit();
        showCards();
    }, 450);
}

function closeChip() {
    chipOpened = false;
    cancelAnimationFrame(scanRaf);

    // Kembalikan logo ke tengah
    logoZone.classList.remove('moved');

    // Reset chip ke lingkaran
    animateChipTo(0);

    // Sembunyikan circuit + cards
    rightZone.classList.remove('visible');
    resetCircuit();
    hideCards();

    // Tampilkan hint lagi
    setTimeout(() => clickHint.classList.remove('gone'), 500);
}

// Klik logo chip
logoZone.addEventListener('click', () => {
    if (!chipOpened) openChip();
    else closeChip();
});

// Scroll ke bawah → sama seperti klik (hanya trigger sekali)
let scrollTriggered = false;
window.addEventListener('scroll', () => {
    if (!scrollTriggered && window.scrollY > 20) {
        scrollTriggered = true;
        if (!chipOpened) openChip();
    }
}, { passive: true });