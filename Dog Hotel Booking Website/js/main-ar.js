/* =============================================
   LIVING HOMES – فندق الكلاب الفاخر
   main-ar.js  —  النسخة العربية
   ============================================= */
'use strict';

function debounce(fn, ms) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}

function onVisible(el, fn, options) {
  if (!el) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { fn(e.target); obs.unobserve(e.target); } });
  }, options || { threshold: 0.1 });
  obs.observe(el);
}

/* 1. شاشة التحميل */
window.addEventListener('load', () => {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) ls.classList.add('hidden');
  }, 1800);
}, { once: true });

/* 2. شريط التنقل */
const navbar       = document.getElementById('navbar');
const hamburger    = document.getElementById('hamburger');
const mobileNav    = document.getElementById('mobile-nav');
const mobileClose  = document.getElementById('mobile-close');
const floatingBook = document.getElementById('floating-book');

let lastScrollY = 0, ticking = false;
function updateNavbar() {
  navbar.classList.toggle('scrolled', lastScrollY > 60);
  if (floatingBook) floatingBook.classList.toggle('show', lastScrollY > 400);
  ticking = false;
}
window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!ticking) { requestAnimationFrame(updateNavbar); ticking = true; }
}, { passive: true });

if (hamburger) hamburger.addEventListener('click', () => { mobileNav.classList.add('open'); hamburger.setAttribute('aria-expanded', 'true'); });
if (mobileClose) mobileClose.addEventListener('click', () => { mobileNav.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); });
document.querySelectorAll('#mobile-nav a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

/* 3. عرض الشرائح */
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots   = document.querySelectorAll('.hero-dot');
let heroIdx = 0, heroTimer;
function goToSlide(n) {
  heroSlides[heroIdx].classList.remove('active');
  heroDots[heroIdx].classList.remove('active');
  heroIdx = (n + heroSlides.length) % heroSlides.length;
  heroSlides[heroIdx].classList.add('active');
  heroDots[heroIdx].classList.add('active');
  heroSlides.forEach((s, i) => { s.style.willChange = i === heroIdx ? 'opacity, transform' : 'auto'; });
}
if (heroSlides.length) {
  heroSlides[0].classList.add('active');
  heroDots[0].classList.add('active');
  heroDots.forEach((dot, i) => dot.addEventListener('click', () => { clearInterval(heroTimer); goToSlide(i); heroTimer = setInterval(() => goToSlide(heroIdx + 1), 5500); }));
  heroTimer = setInterval(() => goToSlide(heroIdx + 1), 5500);
}

/* 4. عدادات الأرقام */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const p = Math.min((ts - startTime) / duration, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString('ar') + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-counter]').forEach(el => counterObs.observe(el));

/* 5. الظهور عند التمرير */
const revealQueue = [];
let revealScheduled = false;
function flushReveal() {
  revealQueue.splice(0).forEach(([el, delay]) => {
    if (delay) setTimeout(() => el.classList.add('revealed'), delay);
    else el.classList.add('revealed');
  });
  revealScheduled = false;
}
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      revealQueue.push([entry.target, parseInt(entry.target.dataset.delay || 0)]);
      revealObs.unobserve(entry.target);
      if (!revealScheduled) { revealScheduled = true; requestAnimationFrame(flushReveal); }
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

/* 6. متتبع النشاط */
const trackerGrid = document.querySelector('.tracker-grid');
if (trackerGrid) {
  onVisible(trackerGrid, () => {
    setTimeout(() => {
      trackerGrid.querySelectorAll('.tracker-fill').forEach(bar => { bar.style.width = bar.dataset.target + '%'; });
    }, 300);
  }, { threshold: 0.3 });
}

/* 7. Flatpickr للتاريخ */
const MIN_DATE = '2026-03-01';
function initFlatpickr() {
  if (typeof flatpickr === 'undefined') return;
  let checkoutPicker;
  flatpickr('#checkin', {
    minDate: MIN_DATE, dateFormat: 'd / m / Y', disableMobile: false,
    onClose(dates) { if (dates[0] && checkoutPicker) checkoutPicker.set('minDate', dates[0]); }
  });
  checkoutPicker = flatpickr('#checkout', { minDate: MIN_DATE, dateFormat: 'd / m / Y', disableMobile: false });
}
const bookingSection = document.getElementById('booking');
if (bookingSection) {
  onVisible(bookingSection, () => {
    let attempts = 0;
    const poll = setInterval(() => {
      if (typeof flatpickr !== 'undefined') { initFlatpickr(); clearInterval(poll); }
      if (++attempts > 20) clearInterval(poll);
    }, 100);
  }, { threshold: 0.05 });
}

/* 8. معرض الصور */
const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=75', alt: 'كلب سعيد يلعب' },
  { src: 'https://images.unsplash.com/photo-1601758124277-3fa74ac18ede?w=1200&q=75', alt: 'كلاب تتفاعل' },
  { src: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1200&q=75', alt: 'كلب في الهواء الطلق' },
  { src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=75', alt: 'كلاب معاً' },
  { src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&q=75', alt: 'تزيين الكلب' },
  { src: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=1200&q=75', alt: 'كلب يرتاح' },
];
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');
let lbIdx = 0;
function openLightbox(idx) { lbIdx = idx; lightboxImg.src = galleryImages[idx].src; lightboxImg.alt = galleryImages[idx].alt; lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLightbox() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
function lightboxNav(dir) {
  lbIdx = (lbIdx + dir + galleryImages.length) % galleryImages.length;
  lightboxImg.style.opacity = '0';
  const img = new Image();
  img.src = galleryImages[lbIdx].src;
  img.onload = () => { lightboxImg.src = galleryImages[lbIdx].src; lightboxImg.style.opacity = '1'; };
}
if (lightboxImg) lightboxImg.style.transition = 'opacity 0.15s ease';
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev)  lightboxPrev.addEventListener('click', () => lightboxNav(1));
if (lightboxNext)  lightboxNext.addEventListener('click', () => lightboxNav(-1));
if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'ArrowLeft')  lightboxNav(-1);
});
document.querySelectorAll('.gallery-item').forEach((item, i) => {
  item.addEventListener('click',   () => openLightbox(i));
  item.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(i); });
});

/* 9. شرائح التقييمات */
const track     = document.querySelector('.testimonials-track');
const tCards    = document.querySelectorAll('.testimonial-card');
const testiDots = document.querySelectorAll('.testi-dot');
const prevBtn   = document.getElementById('testi-prev');
const nextBtn   = document.getElementById('testi-next');
let testiIdx = 0;
function getVisible() { return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3; }
function updateTestimonials() {
  if (!track || !tCards.length) return;
  const max = Math.max(0, tCards.length - getVisible());
  testiIdx = Math.min(testiIdx, max);
  const cardW = tCards[0].offsetWidth + 24;
  requestAnimationFrame(() => { track.style.transform = `translateX(${testiIdx * cardW}px)`; });
  testiDots.forEach((d, i) => d.classList.toggle('active', i === testiIdx));
}
// RTL: prev/next directions are swapped
if (prevBtn) prevBtn.addEventListener('click', () => { testiIdx = Math.min(Math.max(0, tCards.length - getVisible()), testiIdx + 1); updateTestimonials(); });
if (nextBtn) nextBtn.addEventListener('click', () => { testiIdx = Math.max(0, testiIdx - 1); updateTestimonials(); });
testiDots.forEach((dot, i) => dot.addEventListener('click', () => { testiIdx = i; updateTestimonials(); }));
window.addEventListener('resize', debounce(updateTestimonials, 150), { passive: true });
updateTestimonials();
if (track) {
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) prevBtn && prevBtn.click(); else nextBtn && nextBtn.click(); }
  }, { passive: true });
}
let testiAuto = setInterval(() => {
  if (!track) return;
  testiIdx = testiIdx >= Math.max(0, tCards.length - getVisible()) ? 0 : testiIdx + 1;
  updateTestimonials();
}, 6500);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearInterval(testiAuto);
  else testiAuto = setInterval(() => { testiIdx = testiIdx >= Math.max(0, tCards.length - getVisible()) ? 0 : testiIdx + 1; updateTestimonials(); }, 6500);
});
if (track) {
  track.addEventListener('mouseenter', () => clearInterval(testiAuto), { passive: true });
  track.addEventListener('mouseleave', () => { testiAuto = setInterval(() => { testiIdx = testiIdx >= Math.max(0, tCards.length - getVisible()) ? 0 : testiIdx + 1; updateTestimonials(); }, 6500); }, { passive: true });
}

/* 10. النماذج */
const bookingForm = document.getElementById('booking-form');
if (bookingForm) bookingForm.addEventListener('submit', e => { e.preventDefault(); showNotification('🐾 تم التحقق من التوفر! سنتصل بك قريباً.'); bookingForm.reset(); });
const contactForm = document.getElementById('contact-form');
if (contactForm) contactForm.addEventListener('submit', e => { e.preventDefault(); showNotification('✉️ تم إرسال الرسالة! سنرد خلال 24 ساعة.'); contactForm.reset(); });

/* 11. إشعار منبثق */
let toastEl = null, toastTimer = null;
function showNotification(msg) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'notification'; document.body.appendChild(toastEl); }
  toastEl.innerHTML = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

/* 12. زر الحجز العائم */
if (floatingBook) floatingBook.addEventListener('click', () => { document.getElementById('booking').scrollIntoView({ behavior: 'smooth' }); });

/* 13. اختيار الباقة */
document.querySelectorAll('.btn-package').forEach(btn => {
  btn.addEventListener('click', function() {
    const name = this.closest('.package-card').querySelector('.package-name').textContent;
    showNotification('✅ تم اختيار "' + name + '"!');
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });
});

/* 14. التمرير السلس */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* 15. مشغل الفيديو */
const videoThumb      = document.getElementById('video-thumb');
const videoIframeWrap = document.getElementById('video-iframe-wrap');
const ytIframe        = document.getElementById('yt-iframe');
const YT_VIDEO_ID     = 'oqJfzj_DxM8';
function playVideo() {
  if (!ytIframe) return;
  ytIframe.src = 'https://www.youtube.com/embed/' + YT_VIDEO_ID + '?autoplay=1&rel=0&modestbranding=1&color=white&playsinline=1';
  if (videoThumb) { videoThumb.style.transition = 'opacity 0.35s ease'; videoThumb.style.opacity = '0'; videoThumb.style.pointerEvents = 'none'; setTimeout(() => { videoThumb.style.display = 'none'; }, 380); }
  if (videoIframeWrap) videoIframeWrap.classList.add('active');
}
if (videoThumb) {
  videoThumb.addEventListener('click', playVideo);
  videoThumb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideo(); } });
}

/* 16. شريط الإتاحة */
let fontSize = 16;
const accIncrease = document.getElementById('acc-increase');
const accDecrease = document.getElementById('acc-decrease');
const accContrast = document.getElementById('acc-contrast');
const accDark     = document.getElementById('acc-dark');
const accTts      = document.getElementById('acc-tts');
if (accIncrease) accIncrease.addEventListener('click', () => { fontSize = Math.min(22, fontSize + 1); document.documentElement.style.fontSize = fontSize + 'px'; showNotification('🔠 حجم النص: ' + fontSize + 'px'); });
if (accDecrease) accDecrease.addEventListener('click', () => { fontSize = Math.max(12, fontSize - 1); document.documentElement.style.fontSize = fontSize + 'px'; showNotification('🔡 حجم النص: ' + fontSize + 'px'); });
let highContrast = false;
if (accContrast) accContrast.addEventListener('click', function() { highContrast = !highContrast; document.body.classList.toggle('high-contrast', highContrast); this.classList.toggle('active', highContrast); showNotification(highContrast ? '🔆 تباين عالي مُفعَّل' : '🔅 تباين عالي مُعطَّل'); });
let darkMode = false;
if (accDark) accDark.addEventListener('click', function() { darkMode = !darkMode; document.body.classList.toggle('dark-mode', darkMode); this.classList.toggle('active', darkMode); this.textContent = darkMode ? '☀️' : '🌙'; showNotification(darkMode ? '🌙 الوضع الداكن مُفعَّل' : '☀️ الوضع الداكن مُعطَّل'); });
let ttsActive = false;
if (accTts) accTts.addEventListener('click', function() {
  if (ttsActive) { window.speechSynthesis.cancel(); ttsActive = false; this.classList.remove('active'); showNotification('🔇 تم الإيقاف'); return; }
  if (!window.speechSynthesis) { showNotification('⚠️ غير مدعوم.'); return; }
  const u = new SpeechSynthesisUtterance((document.querySelector('main') || document.body).innerText.substring(0, 3000));
  u.rate = 0.9; u.pitch = 1; u.lang = 'ar-SA';
  u.onend = () => { ttsActive = false; this.classList.remove('active'); };
  window.speechSynthesis.speak(u);
  ttsActive = true; this.classList.add('active');
  showNotification('🔊 جارٍ القراءة...');
});

/* 17. كلب اليوم */
const DOTD_DOGS = [
  { name:'بادي', age:'3 سنوات', breed:'ريتريفر ذهبي',
    desc:'بادي هو أكثر ضيف مبهج استضفناه على الإطلاق! يحب الاستحمام في حمام السباحة الخارجي ويصادق كل كلب يلتقيه. ذيله لا يتوقف عن الاهتزاز أبداً.',
    traits:['🎾 مرح','💛 لطيف','🏊 يحب الماء','😄 اجتماعي'],
    img:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=75' },
  { name:'لونا', age:'سنتان', breed:'هاسكي سيبيري',
    desc:'وصلت لونا بعيونها الزرقاء الثاقبة وسرقت قلوب الجميع. روح مغامِرة تستمتع بالمشي الصباحي والنوم في جناح دافئ ومريح.',
    traits:['🌙 مغامِرة','❄️ تحب الجو البارد','👀 فضولية','🌿 نشيطة'],
    img:'https://images.unsplash.com/photo-1601758124277-3fa74ac18ede?w=600&q=75' },
  { name:'ماكس', age:'5 سنوات', breed:'لابرادور',
    desc:'ماكس هو ساحرنا الكبير المقيم — هادئ وحكيم ودائماً مستعد للتمشية اللطيفة. الأخ الأكبر غير الرسمي للفندق والمفضل لدى الطاقم.',
    traits:['🧘 هادئ','🤝 جدير بالثقة','🍂 ناضج','💤 يحب القيلولة'],
    img:'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&q=75' },
  { name:'كوكو', age:'سنة واحدة', breed:'بولدوغ فرنسي',
    desc:'كوكو عاصفة صغيرة من الطاقة! هذا البولدوغ الفرنسي ابن السنة يحوّل كل غرفة إلى مسرح كوميدي. حركته المميزة؟ سرقة فرشاة المزيّن والركض.',
    traits:['😂 مضحك','⚡ نشيط','🐾 شقي','🎀 رائع'],
    img:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=75' },
  { name:'روكي', age:'4 سنوات', breed:'بيغل',
    desc:'أنف روكي يقوده في مغامرات رائعة حول مرافقنا كل يوم. محقق روائح اكتشف كل مكافأة مخفية في الحديقة.',
    traits:['👃 مستكشف','🌸 لطيف','🎵 صوته عالٍ','🍖 محب للطعام'],
    img:'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=75' },
];
let dotdIdx = 0;
function renderDotd(dog) {
  const imgEl = document.getElementById('dotd-img');
  if (!imgEl) return;
  imgEl.style.opacity = '0';
  const tmp = new Image();
  tmp.src = dog.img;
  tmp.onload = () => {
    imgEl.src = dog.img; imgEl.alt = dog.name + ' الـ' + dog.breed;
    document.getElementById('dotd-name').textContent  = dog.name;
    document.getElementById('dotd-age').textContent   = '🗓️ ' + dog.age;
    document.getElementById('dotd-breed').textContent = '🐕 ' + dog.breed;
    document.getElementById('dotd-desc').textContent  = dog.desc;
    document.getElementById('dotd-traits').innerHTML  = dog.traits.map(t => '<span class="dotd-trait">' + t + '</span>').join('');
    requestAnimationFrame(() => { imgEl.style.opacity = '1'; });
  };
}
const dotdNext = document.getElementById('dotd-next');
if (dotdNext) dotdNext.addEventListener('click', () => { dotdIdx = (dotdIdx + 1) % DOTD_DOGS.length; renderDotd(DOTD_DOGS[dotdIdx]); showNotification('🐾 تعرّف على ' + DOTD_DOGS[dotdIdx].name + '!'); });
let dotdAuto = setInterval(() => { dotdIdx = (dotdIdx + 1) % DOTD_DOGS.length; renderDotd(DOTD_DOGS[dotdIdx]); }, 35000);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(dotdAuto); else dotdAuto = setInterval(() => { dotdIdx = (dotdIdx + 1) % DOTD_DOGS.length; renderDotd(DOTD_DOGS[dotdIdx]); }, 35000); });

/* 18. محقق المزاج */
const MOOD_DATA = {
  happy:     { emoji:'😄', title:'كلبك سعيد!',          sub:'الكلب السعيد مستعد للمرح والمغامرات الاجتماعية. إليك ما نوصي به:', activities:[{icon:'🎾',label:'جلسة لعب جماعية'},{icon:'🌿',label:'تفاعل اجتماعي خارجي'},{icon:'🚶',label:'تمشية مع الأصدقاء'},{icon:'📸',label:'جلسة تصوير'}] },
  energetic: { emoji:'⚡', title:'كلبك مليء بالطاقة!', sub:'وجّه هذه الطاقة نحو شيء رائع. أنشطة مثالية لتفريغها:', activities:[{icon:'🏃',label:'تدريب رياضي'},{icon:'💦',label:'متعة حمام السباحة'},{icon:'🐕',label:'ركض حر ممتد'},{icon:'🎯',label:'ألعاب الجلب والاسترداد'}] },
  calm:      { emoji:'😌', title:'كلبك يشعر بالهدوء',   sub:'المزاج الهادئ مثالي للاسترخاء والتواصل اللطيف:', activities:[{icon:'🛁',label:'جلسة سبا وتزيين'},{icon:'💆',label:'تدليك استرخائي'},{icon:'☀️',label:'أخذ حمام شمس في الحديقة'},{icon:'📖',label:'وقت هادئ للتلاطف'}] },
  hungry:    { emoji:'🍖', title:'كلبك جائع!',           sub:'حان وقت إطعام ذلك الشهية! طاهينا لديه خيارات لذيذة:', activities:[{icon:'🥩',label:'تحضير وجبة فاخرة'},{icon:'🦴',label:'مجموعة مكافآت مميزة'},{icon:'🥦',label:'وجبة خفيفة صحية'},{icon:'💧',label:'ماء نقي وترطيب'}] },
};
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.mood-btn').forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed','false'); });
    this.classList.add('selected'); this.setAttribute('aria-pressed','true');
    const data = MOOD_DATA[this.dataset.mood];
    const result = document.getElementById('mood-result');
    document.getElementById('mood-emoji').textContent = data.emoji;
    document.getElementById('mood-title').textContent = data.title;
    document.getElementById('mood-sub').textContent   = data.sub;
    document.getElementById('mood-activities').innerHTML = data.activities.map(a => '<div class="mood-activity">' + a.icon + ' ' + a.label + '</div>').join('');
    result.style.display = 'block';
    setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    showNotification(data.emoji + ' الأنشطة جاهزة!');
  });
});

/* 19. نصائح العناية */
const CARE_TIPS = [
  {icon:'💧', text:'تأكد دائماً من حصول كلبك على مياه نظيفة وعذبة — خاصةً بعد التمرين. الجفاف يمكن أن يصبح خطيراً بسرعة حتى في الطقس المعتدل.', cat:'الترطيب'},
  {icon:'🦷', text:'نظّف أسنان كلبك 3 مرات على الأقل أسبوعياً باستخدام معجون أسنان آمن للكلاب. تؤثر أمراض الأسنان على أكثر من 80% من الكلاب بحلول سن 3 سنوات.', cat:'العناية بالأسنان'},
  {icon:'🎾', text:'درّب عقل كلبك بقدر ما تدرّب جسده. الألعاب الذكية وتمارين التدريب تمنع الملل وتقلل السلوكيات المدمرة بشكل ملحوظ.', cat:'التحفيز العقلي'},
  {icon:'🛁', text:'معظم الكلاب تحتاج الاستحمام كل 4-6 أسابيع فقط. الاستحمام المفرط يزيل الزيوت الطبيعية من الشعر والجلد مما يؤدي للجفاف والتهيج.', cat:'العناية'},
  {icon:'🥩', text:'يجب أن تكون المكوّن الأول في طعام كلبك دائماً لحماً حقيقياً مُسمّى — وليس مواد حشو كشراب الذرة أو مخلفات اللحوم.', cat:'التغذية'},
  {icon:'🏥', text:'لا تتخطَّ الفحوصات البيطرية السنوية أبداً حتى لو بدا كلبك بصحة جيدة. كثير من الحالات الخطيرة يُكتشف مبكراً عبر تحليل الدم الروتيني.', cat:'الرعاية البيطرية'},
  {icon:'🌡️', text:'تسخن الكلاب بسرعة. امشِ معها في الصباح الباكر أو المساء في الأيام الدافئة، ولا تتركها أبداً في سيارة متوقفة.', cat:'السلامة من الحرارة'},
  {icon:'🐾', text:'اعمل على التنشئة الاجتماعية لكلبك بانتظام من صغره. الكلاب المتنشئة اجتماعياً أهدأ وأكثر ثقة بنفسها وأقل عرضة لتطوير القلق.', cat:'التنشئة الاجتماعية'},
  {icon:'💤', text:'تحتاج الكلاب البالغة 12-14 ساعة من النوم يومياً. وفّر مكاناً مريحاً وهادئاً يمكنها فيه الراحة دون إزعاج.', cat:'الراحة والتعافي'},
  {icon:'🎓', text:'استخدم التعزيز الإيجابي دائماً. مكافأة السلوك الجيد بالحلوى والثناء تبني الثقة وتخلق كلاباً أسعد وأكثر تصرفاً صحيحاً.', cat:'التدريب'},
  {icon:'🦟', text:'واصل برامج الوقاية الشهرية من البراغيث والقراد والديدان القلبية. هذه الطفيليات أسهل في الوقاية منها من العلاج.', cat:'مكافحة الطفيليات'},
  {icon:'❤️', text:'اقضِ وقتاً نوعياً غير منقسم مع كلبك كل يوم — هذا يعزز الرابطة بينكما بشكل حقيقي ويقلل مستويات توتره.', cat:'التواصل العاطفي'},
];
let lastTipIdx = -1;
const btnTip  = document.getElementById('btn-tip');
const tipCard = document.getElementById('tip-card');
if (btnTip && tipCard) {
  const tipIcon = document.getElementById('tip-icon');
  const tipText = document.getElementById('tip-text');
  const tipCat  = document.getElementById('tip-category');
  btnTip.addEventListener('click', () => {
    let idx;
    do { idx = Math.floor(Math.random() * CARE_TIPS.length); } while (idx === lastTipIdx);
    lastTipIdx = idx;
    const tip = CARE_TIPS[idx];
    tipCard.style.opacity = '0'; tipCard.style.transform = 'scale(0.97)';
    setTimeout(() => {
      if (tipIcon) tipIcon.textContent = tip.icon;
      if (tipText) tipText.textContent = tip.text;
      if (tipCat)  tipCat.textContent  = tip.cat;
      tipCard.style.opacity = '1'; tipCard.style.transform = 'scale(1)';
    }, 220);
  });
}
