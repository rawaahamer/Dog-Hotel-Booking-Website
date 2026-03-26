/* =============================================
   LIVING HOMES — nav.js
   Shared across ALL pages (loaded alongside main.js)
   ============================================= */
'use strict';

/* ─── ACTIVE NAV LINK ────────────────────────── */
(function markActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  // Mark dropdown items
  document.querySelectorAll('.nav-dd-item').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().split('#')[0] || 'index.html';
    if (href === page) a.classList.add('active');
  });
  // Mark top nav links
  document.querySelectorAll('.nav-links a:not(.nav-cta), .nav-mobile-sublinks a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().split('#')[0] || 'index.html';
    if (href === page) a.classList.add('nav-active');
  });
})();

/* ─── PAGES DROPDOWN TOGGLE ──────────────────── */
const pagesWrap   = document.querySelector('.nav-pages-wrap');
const pagesToggle = document.querySelector('.nav-pages-toggle');
if (pagesWrap && pagesToggle) {
  pagesToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    pagesWrap.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!pagesWrap.contains(e.target)) pagesWrap.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') pagesWrap.classList.remove('open');
  });
}
