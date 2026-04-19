// ============================================================
// VOLCRA.LAB — home.js
// Mengatur interaksi di halaman utama Volcralab.html
// ============================================================

// ------------------------------------------------------------
// DROPDOWN LOGO
// Klik logo → muncul dropdown menu
// Klik di luar → dropdown hilang
// ------------------------------------------------------------
const logoWrapper  = document.getElementById('logo-wrapper');
const logoDropdown = document.getElementById('logo-dropdown');

// Klik logo → toggle dropdown
logoWrapper.addEventListener('click', () => {
    const isVisible = logoDropdown.style.display === 'block';
    logoDropdown.style.display = isVisible ? 'none' : 'block';
});

// Klik di luar → tutup dropdown
document.addEventListener('click', (e) => {
    if (!logoWrapper.contains(e.target)) {
        logoDropdown.style.display = 'none';
    }
});