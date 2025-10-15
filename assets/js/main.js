// ====== SETTINGS ======
// ВРЕМЯ ДР Насти. Формат ISO с часовым поясом Европы/Амстердам (или вашим).
const BIRTHDAY_ISO = '2025-12-28T00:00:00+01:00'; // TODO: поменяй дату/часовой пояс при необходимости
const PHOTOS_COUNT = 59; // сколько фото 1.jpg ... N.jpg в /photos

// ====== REVEAL ON SCROLL ======
const io = new IntersectionObserver((entries)=>{
  for(const e of entries){
    if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
  }
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ====== COUNTDOWN ======
function updateCountdown(){
  const now = new Date();
  let target = new Date(BIRTHDAY_ISO);
  // если день в этом году прошел — берем следующий год
  if(now > target){
    target.setFullYear(now.getFullYear() + 1);
  }
  const diff = target - now;
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  const pad = (n)=>String(n).padStart(2,'0');
  document.getElementById('d').textContent = pad(d);
  document.getElementById('h').textContent = pad(h);
  document.getElementById('m').textContent = pad(m);
  document.getElementById('s').textContent = pad(s);
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ====== GALLERY (auto-load /photos/1.jpg..N.jpg) ======
const grid = document.getElementById('grid');
const images = Array.from({length: PHOTOS_COUNT}, (_,i)=> i+1);

images.forEach((n, idx)=>{
  const a = document.createElement('a');
  a.href = `photos/${n}.jpg`;
  a.className = 'ph';
  a.setAttribute('data-index', idx);

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = `Фото ${n}`;
  img.src = `photos/${n}.jpg`;

  a.appendChild(img);
  grid.appendChild(a);
});

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const btnPrev = document.getElementById('lbPrev');
const btnNext = document.getElementById('lbNext');
const btnClose = document.getElementById('lbClose');

let currentIndex = 0;
function openLB(i){
  currentIndex = i;
  lbImg.src = images[currentIndex] ? `photos/${images[currentIndex]}.jpg` : '';
  lb.classList.add('open');
  lb.setAttribute('aria-hidden','false');
}
function closeLB(){
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden','true');
  lbImg.src = '';
}
function prev(){ currentIndex = (currentIndex - 1 + images.length) % images.length; openLB(currentIndex); }
function next(){ currentIndex = (currentIndex + 1) % images.length; openLB(currentIndex); }

grid.addEventListener('click', (e)=>{
  const a = e.target.closest('a.ph');
  if(!a) return;
  e.preventDefault();
  openLB(parseInt(a.dataset.index,10));
});
btnPrev.addEventListener('click', prev);
btnNext.addEventListener('click', next);
btnClose.addEventListener('click', closeLB);
lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLB(); });
document.addEventListener('keydown',(e)=>{
  if(!lb.classList.contains('open')) return;
  if(e.key==='Escape') closeLB();
  if(e.key==='ArrowLeft') prev();
  if(e.key==='ArrowRight') next();
});
