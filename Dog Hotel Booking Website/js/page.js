/* =============================================
   LIVING HOMES — page.js
   Interactive features for standalone section pages.
   Every block is safely guarded — no-ops if elements absent.
   ============================================= */
'use strict';

/* ─── UTILITIES ──────────────────────────────── */
function debounce(fn, ms) { let t; return function(...a){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a),ms); }; }
function onVisible(el, fn, opts) {
  if (!el) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { fn(e.target); obs.unobserve(e.target); } });
  }, opts||{threshold:0.1});
  obs.observe(el);
}

/* ─── LOADING SCREEN ─────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => { const ls=document.getElementById('loading-screen'); if(ls) ls.classList.add('hidden'); }, 1400);
}, {once:true});

/* ─── NAVBAR SCROLL ──────────────────────────── */
const navbar       = document.getElementById('navbar');
const hamburger    = document.getElementById('hamburger');
const mobileNav    = document.getElementById('mobile-nav');
const mobileClose  = document.getElementById('mobile-close');
const floatingBook = document.getElementById('floating-book');
let lastScrollY=0, ticking=false;
function updateNavbar() {
  if(navbar) navbar.classList.toggle('scrolled', lastScrollY>60);
  if(floatingBook) floatingBook.classList.toggle('show', lastScrollY>400);
  ticking=false;
}
window.addEventListener('scroll', ()=>{ lastScrollY=window.scrollY; if(!ticking){requestAnimationFrame(updateNavbar);ticking=true;} },{passive:true});
updateNavbar();

/* ─── HAMBURGER ──────────────────────────────── */
if(hamburger) hamburger.addEventListener('click', ()=>{ mobileNav.classList.add('open'); hamburger.setAttribute('aria-expanded','true'); });
if(mobileClose) mobileClose.addEventListener('click', ()=>{ mobileNav.classList.remove('open'); hamburger.setAttribute('aria-expanded','false'); });
document.querySelectorAll('#mobile-nav a').forEach(a => a.addEventListener('click', ()=> mobileNav.classList.remove('open')));

/* ─── SCROLL REVEAL ──────────────────────────── */
const revealQ=[]; let revealSched=false;
function flushReveal(){ revealQ.splice(0).forEach(([el,d])=>{ if(d) setTimeout(()=>el.classList.add('revealed'),d); else el.classList.add('revealed'); }); revealSched=false; }
const revObs = new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ revealQ.push([e.target,parseInt(e.target.dataset.delay||0)]); revObs.unobserve(e.target); if(!revealSched){revealSched=true;requestAnimationFrame(flushReveal);} } }); },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('[data-reveal]').forEach(el=>revObs.observe(el));

/* ─── ANIMATED COUNTERS ──────────────────────── */
function animateCounter(el){ const target=parseInt(el.dataset.target,10),suffix=el.dataset.suffix||'',dur=1800; let start=null; function step(ts){if(!start)start=ts;const p=Math.min((ts-start)/dur,1);el.textContent=Math.floor((1-Math.pow(1-p,3))*target).toLocaleString()+suffix;if(p<1)requestAnimationFrame(step);} requestAnimationFrame(step); }
const cntObs = new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting&&!e.target.dataset.counted){e.target.dataset.counted='1';animateCounter(e.target);cntObs.unobserve(e.target);} }); },{threshold:0.5});
document.querySelectorAll('[data-counter]').forEach(el=>cntObs.observe(el));

/* ─── NOTIFICATION TOAST ─────────────────────── */
let toastEl=null, toastTimer=null;
function showNotification(msg){
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='notification';document.body.appendChild(toastEl);}
  toastEl.innerHTML=msg; toastEl.classList.add('show'); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toastEl.classList.remove('show'),3200);
}
window.showNotification=showNotification;

/* ─── ACCESSIBILITY TOOLBAR ──────────────────── */
let fontSize=16;
const accInc=document.getElementById('acc-increase'), accDec=document.getElementById('acc-decrease');
const accCon=document.getElementById('acc-contrast'), accDrk=document.getElementById('acc-dark'), accTts=document.getElementById('acc-tts');
if(accInc) accInc.addEventListener('click',()=>{ fontSize=Math.min(22,fontSize+1); document.documentElement.style.fontSize=fontSize+'px'; showNotification('🔠 Text size: '+fontSize+'px'); });
if(accDec) accDec.addEventListener('click',()=>{ fontSize=Math.max(12,fontSize-1); document.documentElement.style.fontSize=fontSize+'px'; showNotification('🔡 Text size: '+fontSize+'px'); });
let hc=false; if(accCon) accCon.addEventListener('click',function(){ hc=!hc; document.body.classList.toggle('high-contrast',hc); this.classList.toggle('active',hc); showNotification(hc?'🔆 High contrast ON':'🔅 High contrast OFF'); });
let dm=false; if(accDrk) accDrk.addEventListener('click',function(){ dm=!dm; document.body.classList.toggle('dark-mode',dm); this.classList.toggle('active',dm); this.textContent=dm?'☀️':'🌙'; showNotification(dm?'🌙 Dark mode ON':'☀️ Dark mode OFF'); });
let ttsA=false;
if(accTts) accTts.addEventListener('click',function(){ if(ttsA){window.speechSynthesis.cancel();ttsA=false;this.classList.remove('active');showNotification('🔇 Stopped');return;} if(!window.speechSynthesis){showNotification('⚠️ Not supported.');return;} const u=new SpeechSynthesisUtterance((document.querySelector('main')||document.body).innerText.substring(0,3000)); u.rate=0.9;u.pitch=1;u.lang='en-US'; u.onend=()=>{ttsA=false;this.classList.remove('active');}; window.speechSynthesis.speak(u); ttsA=true;this.classList.add('active'); showNotification('🔊 Reading page...'); });

/* ─── FLATPICKR (booking page) ───────────────── */
const bookingSection=document.getElementById('booking');
if(bookingSection){ onVisible(bookingSection,()=>{ let att=0; const poll=setInterval(()=>{ if(typeof flatpickr!=='undefined'){ let cp; flatpickr('#checkin',{minDate:'2026-03-01',dateFormat:'d / m / Y',disableMobile:false,onClose(d){if(d[0]&&cp)cp.set('minDate',d[0]);}}); cp=flatpickr('#checkout',{minDate:'2026-03-01',dateFormat:'d / m / Y',disableMobile:false}); clearInterval(poll); } if(++att>20)clearInterval(poll); },100); },{threshold:0.05}); }

/* ─── BOOKING FORM ───────────────────────────── */
const bookingForm=document.getElementById('booking-form');
if(bookingForm) bookingForm.addEventListener('submit',e=>{ e.preventDefault(); showNotification("🐾 Availability checked! We'll contact you shortly."); bookingForm.reset(); });

/* ─── CONTACT FORM ───────────────────────────── */
const contactForm=document.getElementById('contact-form');
if(contactForm) contactForm.addEventListener('submit',e=>{ e.preventDefault(); showNotification("✉️ Message sent! We'll get back to you within 24 hours."); contactForm.reset(); });

/* ─── PACKAGE SELECT ─────────────────────────── */
document.querySelectorAll('.btn-package').forEach(btn=>{ btn.addEventListener('click',function(){ const name=this.closest('.package-card').querySelector('.package-name').textContent; showNotification(`✅ "${name}" selected!`); setTimeout(()=>window.location.href='booking.html',800); }); });

/* ─── FLOATING BOOK BUTTON ───────────────────── */
if(floatingBook) floatingBook.addEventListener('click',()=>{ window.location.href='booking.html'; });

/* ─── GALLERY LIGHTBOX ───────────────────────── */
const galleryImages=[
  {src:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=75',alt:'Happy dog playing'},
  {src:'https://images.unsplash.com/photo-1601758124277-3fa74ac18ede?w=1200&q=75',alt:'Dogs socializing'},
  {src:'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1200&q=75',alt:'Dog outdoors'},
  {src:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=75',alt:'Dogs together'},
  {src:'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&q=75',alt:'Dog grooming'},
  {src:'https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=1200&q=75',alt:'Dog resting'},
];
const lightbox=document.getElementById('lightbox'),lightboxImg=document.getElementById('lightbox-img'),lightboxClose=document.getElementById('lightbox-close'),lightboxPrev=document.getElementById('lightbox-prev'),lightboxNext=document.getElementById('lightbox-next');
let lbIdx=0;
function openLightbox(i){lbIdx=i;lightboxImg.src=galleryImages[i].src;lightboxImg.alt=galleryImages[i].alt;lightbox.classList.add('open');document.body.style.overflow='hidden';}
function closeLightbox(){lightbox.classList.remove('open');document.body.style.overflow='';}
function lightboxNav(d){lbIdx=(lbIdx+d+galleryImages.length)%galleryImages.length;lightboxImg.style.opacity='0';const img=new Image();img.src=galleryImages[lbIdx].src;img.onload=()=>{lightboxImg.src=galleryImages[lbIdx].src;lightboxImg.style.opacity='1';};}
if(lightboxImg) lightboxImg.style.transition='opacity 0.15s ease';
if(lightboxClose) lightboxClose.addEventListener('click',closeLightbox);
if(lightboxPrev) lightboxPrev.addEventListener('click',()=>lightboxNav(-1));
if(lightboxNext) lightboxNext.addEventListener('click',()=>lightboxNav(1));
if(lightbox) lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});
document.addEventListener('keydown',e=>{if(!lightbox||!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')lightboxNav(-1);if(e.key==='ArrowRight')lightboxNav(1);});
document.querySelectorAll('.gallery-item').forEach((item,i)=>{ item.addEventListener('click',()=>openLightbox(i)); item.addEventListener('keydown',e=>{if(e.key==='Enter')openLightbox(i);}); });

/* ─── TESTIMONIALS SLIDER ────────────────────── */
const track=document.querySelector('.testimonials-track'),tCards=document.querySelectorAll('.testimonial-card'),testiDots=document.querySelectorAll('.testi-dot'),prevBtn=document.getElementById('testi-prev'),nextBtn=document.getElementById('testi-next');
let testiIdx=0;
function getVisible(){return window.innerWidth<=768?1:window.innerWidth<=1024?2:3;}
function updateTesti(){if(!track||!tCards.length)return;const max=Math.max(0,tCards.length-getVisible());testiIdx=Math.min(testiIdx,max);const cw=tCards[0].offsetWidth+24;requestAnimationFrame(()=>{track.style.transform=`translateX(-${testiIdx*cw}px)`;});testiDots.forEach((d,i)=>d.classList.toggle('active',i===testiIdx));}
if(prevBtn) prevBtn.addEventListener('click',()=>{testiIdx=Math.max(0,testiIdx-1);updateTesti();});
if(nextBtn) nextBtn.addEventListener('click',()=>{testiIdx=Math.min(Math.max(0,tCards.length-getVisible()),testiIdx+1);updateTesti();});
testiDots.forEach((d,i)=>d.addEventListener('click',()=>{testiIdx=i;updateTesti();}));
window.addEventListener('resize',debounce(updateTesti,150),{passive:true});
updateTesti();
if(track){let tx=0;track.addEventListener('touchstart',e=>{tx=e.changedTouches[0].clientX;},{passive:true});track.addEventListener('touchend',e=>{const d=tx-e.changedTouches[0].clientX;if(Math.abs(d)>40){if(d>0)nextBtn&&nextBtn.click();else prevBtn&&prevBtn.click();}},{passive:true});}
let tAuto=setInterval(()=>{if(!track)return;testiIdx=testiIdx>=Math.max(0,tCards.length-getVisible())?0:testiIdx+1;updateTesti();},6500);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(tAuto);else tAuto=setInterval(()=>{testiIdx=testiIdx>=Math.max(0,tCards.length-getVisible())?0:testiIdx+1;updateTesti();},6500);});
if(track){track.addEventListener('mouseenter',()=>clearInterval(tAuto),{passive:true});track.addEventListener('mouseleave',()=>{tAuto=setInterval(()=>{testiIdx=testiIdx>=Math.max(0,tCards.length-getVisible())?0:testiIdx+1;updateTesti();},6500);},{passive:true});}

/* ─── ACTIVITY TRACKER BARS ──────────────────── */
const trackerGrid=document.querySelector('.tracker-grid');
if(trackerGrid){onVisible(trackerGrid,()=>{ setTimeout(()=>{ trackerGrid.querySelectorAll('.tracker-fill').forEach(b=>{b.style.width=b.dataset.target+'%';}); },300); },{threshold:0.3});}

/* ─── MOOD CHECKER ───────────────────────────── */
const MOOD_DATA={
  happy:    {emoji:'😄',title:'Your Dog is Happy!',sub:"A happy dog is ready for fun and social adventures. Here's what we recommend:",activities:[{icon:'🎾',label:'Group Play Session'},{icon:'🌿',label:'Outdoor Socialising'},{icon:'🚶',label:'Trail Walk with Friends'},{icon:'📸',label:'Photo Session'}]},
  energetic:{emoji:'⚡',title:'Your Dog is Full of Energy!',sub:'Channel that energy into something amazing. Perfect activities to burn it off:',activities:[{icon:'🏃',label:'Agility Training'},{icon:'💦',label:'Splash Pool Fun'},{icon:'🐕',label:'Extended Off-Lead Run'},{icon:'🎯',label:'Fetch & Retrieve Games'}]},
  calm:     {emoji:'😌',title:'Your Dog is Feeling Calm',sub:'A calm mood is perfect for relaxation and gentle bonding activities:',activities:[{icon:'🛁',label:'Spa & Grooming Session'},{icon:'💆',label:'Relaxation Massage'},{icon:'☀️',label:'Sunbathing in the Garden'},{icon:'📖',label:'Quiet Cuddle Time'}]},
  hungry:   {emoji:'🍖',title:'Your Dog is Hungry!',sub:"Time to treat that appetite! Our chef has some delicious options ready:",activities:[{icon:'🥩',label:'Gourmet Meal Preparation'},{icon:'🦴',label:'Premium Treat Selection'},{icon:'🥦',label:'Healthy Snack Time'},{icon:'💧',label:'Fresh Water & Hydration'}]},
};
document.querySelectorAll('.mood-btn').forEach(btn=>{btn.addEventListener('click',function(){document.querySelectorAll('.mood-btn').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});this.classList.add('selected');this.setAttribute('aria-pressed','true');const data=MOOD_DATA[this.dataset.mood];const result=document.getElementById('mood-result');document.getElementById('mood-emoji').textContent=data.emoji;document.getElementById('mood-title').textContent=data.title;document.getElementById('mood-sub').textContent=data.sub;document.getElementById('mood-activities').innerHTML=data.activities.map(a=>'<div class="mood-activity">'+a.icon+' '+a.label+'</div>').join('');result.style.display='block';setTimeout(()=>result.scrollIntoView({behavior:'smooth',block:'nearest'}),50);showNotification(data.emoji+' Activities ready!');});});

/* ─── CARE TIP GENERATOR ─────────────────────── */
const CARE_TIPS=[
  {icon:'💧',text:"Always ensure your dog has access to fresh, clean water — especially after exercise. Dehydration can quickly become dangerous, even in mild weather.",cat:'Hydration'},
  {icon:'🦷',text:"Brush your dog's teeth at least 3 times per week using dog-safe toothpaste. Dental disease affects over 80% of dogs by age 3.",cat:'Dental Care'},
  {icon:'🎾',text:"Exercise your dog's mind as much as their body. Puzzle toys and training games prevent boredom and reduce destructive behaviours significantly.",cat:'Mental Stimulation'},
  {icon:'🛁',text:"Most dogs only need a bath every 4–6 weeks. Over-bathing strips natural oils from their coat and skin, leading to dryness and irritation.",cat:'Grooming'},
  {icon:'🥩',text:"The first ingredient in your dog's food should always be a real, named meat — not fillers like corn syrup or meat by-products.",cat:'Nutrition'},
  {icon:'🏥',text:"Never skip annual vet check-ups, even if your dog seems healthy. Many serious conditions are caught early through routine bloodwork.",cat:'Veterinary Care'},
  {icon:'🌡️',text:"Dogs can overheat quickly. Walk them in the early morning or late evening on warm days, and never leave them in a parked car.",cat:'Heat Safety'},
  {icon:'🐾',text:"Socialise your dog regularly from a young age. Well-socialised dogs are calmer, more confident, and far less likely to develop anxiety.",cat:'Socialisation'},
  {icon:'💤',text:"Adult dogs need 12–14 hours of sleep per day. Provide a comfortable, quiet space where they can rest undisturbed.",cat:'Rest & Recovery'},
  {icon:'🎓',text:"Use positive reinforcement — always. Rewarding good behaviour with treats and praise builds trust and creates happier, better-behaved dogs.",cat:'Training'},
  {icon:'🦟',text:"Keep up with monthly flea, tick, and heartworm prevention. These parasites are far easier to prevent than treat.",cat:'Parasite Control'},
  {icon:'❤️',text:"Spend quality, undivided time with your dog every single day — it genuinely strengthens the bond and reduces their stress levels.",cat:'Bonding'},
];
let lastTipIdx=-1;
const btnTip=document.getElementById('btn-tip'),tipCard=document.getElementById('tip-card');
if(btnTip&&tipCard){const tipIcon=document.getElementById('tip-icon'),tipText=document.getElementById('tip-text'),tipCat=document.getElementById('tip-category');btnTip.addEventListener('click',()=>{let idx;do{idx=Math.floor(Math.random()*CARE_TIPS.length);}while(idx===lastTipIdx);lastTipIdx=idx;const tip=CARE_TIPS[idx];tipCard.style.opacity='0';tipCard.style.transform='scale(0.97)';setTimeout(()=>{if(tipIcon)tipIcon.textContent=tip.icon;if(tipText)tipText.textContent=tip.text;if(tipCat)tipCat.textContent=tip.cat;tipCard.style.opacity='1';tipCard.style.transform='scale(1)';},220);});}

/* ─── DOG OF THE DAY ─────────────────────────── */
const DOTD_DOGS=[
  {name:'Buddy',age:'3 years',breed:'Golden Retriever',desc:"Buddy is the most cheerful guest we've ever had! He loves splashing in the outdoor pool and makes friends with every dog he meets. His tail never stops wagging.",traits:['🎾 Playful','💛 Gentle','🏊 Loves Water','😄 Social'],img:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=75'},
  {name:'Luna',age:'2 years',breed:'Siberian Husky',desc:"Luna arrived with those piercing blue eyes and stole everyone's heart. She's an adventurous spirit who enjoys morning hikes and sleeping in a warm, cosy suite.",traits:['🌙 Adventurous','❄️ Loves Cool Air','👀 Curious','🌿 Energetic'],img:'https://images.unsplash.com/photo-1601758124277-3fa74ac18ede?w=600&q=75'},
  {name:'Max',age:'5 years',breed:'Labrador',desc:"Max is our resident senior charmer — calm, wise, and always up for a gentle walk. He's the unofficial big brother of the hotel and the staff's absolute favourite.",traits:['🧘 Calm','🤝 Trustworthy','🍂 Mature','💤 Loves Naps'],img:'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&q=75'},
  {name:'Coco',age:'1 year',breed:'French Bulldog',desc:"Coco is a tiny tornado of energy! This one-year-old Frenchie turns every room into a comedy show. Her signature move? Stealing the groomer's brush and running.",traits:['😂 Funny','⚡ Energetic','🐾 Mischievous','🎀 Adorable'],img:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=75'},
  {name:'Rocky',age:'4 years',breed:'Beagle',desc:"Rocky's nose leads him on grand adventures around our grounds every single day. He's a scent detective who has discovered every hidden treat in the garden.",traits:['👃 Explorer','🌸 Gentle','🎵 Vocal','🍖 Foodie'],img:'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=75'},
];
let dotdIdx=0;
function renderDotd(dog){const i=document.getElementById('dotd-img'),n=document.getElementById('dotd-name'),a=document.getElementById('dotd-age'),b=document.getElementById('dotd-breed'),d=document.getElementById('dotd-desc'),t=document.getElementById('dotd-traits');if(!i)return;i.style.opacity='0';const tmp=new Image();tmp.src=dog.img;tmp.onload=()=>{i.src=dog.img;i.alt=dog.name+' the '+dog.breed;n.textContent=dog.name;a.textContent='🗓️ '+dog.age;b.textContent='🐕 '+dog.breed;d.textContent=dog.desc;t.innerHTML=dog.traits.map(x=>'<span class="dotd-trait">'+x+'</span>').join('');requestAnimationFrame(()=>{i.style.opacity='1';});};}
const dotdNext=document.getElementById('dotd-next');
if(dotdNext) dotdNext.addEventListener('click',()=>{dotdIdx=(dotdIdx+1)%DOTD_DOGS.length;renderDotd(DOTD_DOGS[dotdIdx]);showNotification('🐾 Meet '+DOTD_DOGS[dotdIdx].name+'!');});
let dotdAuto=setInterval(()=>{dotdIdx=(dotdIdx+1)%DOTD_DOGS.length;renderDotd(DOTD_DOGS[dotdIdx]);},35000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(dotdAuto);else dotdAuto=setInterval(()=>{dotdIdx=(dotdIdx+1)%DOTD_DOGS.length;renderDotd(DOTD_DOGS[dotdIdx]);},35000);});
