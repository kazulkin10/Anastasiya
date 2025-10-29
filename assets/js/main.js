// Настройки
const PHOTOS_COUNT = 59;
const TZ_OFFSET_MINUTES = 180; // UTC+3
const BIRTHDAY_N = { month: 12, day: 9 };
const BIRTHDAY_E = { month: 12, day: 28 };
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

// Мягкий фон: частицы + градиентный «туман»
(function bg(){
  const c = document.getElementById('bg'); const x = c.getContext('2d');
  let w,h,DPR=Math.min(devicePixelRatio||1,2);
  function resize(){ w=c.clientWidth=c.parentElement.clientWidth; h=c.clientHeight=c.parentElement.clientHeight;
    c.width=w*DPR; c.height=h*DPR; x.setTransform(1,0,0,1,0,0); x.scale(DPR,DPR); }
  resize(); addEventListener('resize', resize);
  const pts = Array.from({length:60},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,r:Math.random()*1.5+0.6}));
  (function tick(){
    x.clearRect(0,0,w,h);
    const g = x.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'rgba(124,92,255,.08)'); g.addColorStop(1,'rgba(0,212,255,.06)');
    x.fillStyle=g; x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.9)';
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy; if(p.x<-10||p.x>w+10) p.vx*=-1; if(p.y<-10||p.y>h+10) p.vy*=-1;
      x.globalAlpha=.25+.75*Math.random()*0.2; x.beginPath(); x.arc(p.x,p.y,p.r,0,6.28); x.fill();
    }
    x.globalAlpha=1; requestAnimationFrame(tick);
  })();
})();

// Галерея: фильтры + лайтбокс
(function gallery(){
  const grid = document.getElementById('grid'); if(!grid) return;
  const images = Array.from({length:PHOTOS_COUNT},(_,i)=>i+1)
    .map(n=>({n, tag:(n%3===0?'спорт': n%2===0?'прогулки':'школа')}));
  let current='all';
  function render(){
    grid.innerHTML='';
    images.filter(it=> current==='all' || it.tag===current).forEach((it,idx)=>{
      const a=document.createElement('a'); a.href=`./photos/${it.n}.jpg`; a.className='ph'; a.dataset.index=idx;
      const img=document.createElement('img'); img.loading='lazy'; img.alt=`Фото ${it.n}`; img.src=`./photos/${it.n}.jpg`;
      a.appendChild(img); grid.appendChild(a);
    });
  }
  render();
  $$('.chip').forEach(b=> b.addEventListener('click', ()=>{
    $$('.chip').forEach(c=>c.classList.remove('active')); b.classList.add('active');
    current=b.dataset.tag; render();
  }));
  const lb=$('#lightbox'), lbImg=$('#lbImg'), p=$('#lbPrev'), n=$('#lbNext'), c=$('#lbClose'); let idx=0;
  function openLB(i){ idx=i; const list=[...grid.querySelectorAll('a.ph')]; lbImg.src=list[idx].href; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); }
  function closeLB(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); lbImg.src=''; }
  function prev(){ const list=[...grid.querySelectorAll('a.ph')]; idx=(idx-1+list.length)%list.length; lbImg.src=list[idx].href; }
  function next(){ const list=[...grid.querySelectorAll('a.ph')]; idx=(idx+1)%list.length; lbImg.src=list[idx].href; }
  grid.addEventListener('click',e=>{ const a=e.target.closest('a.ph'); if(!a) return; e.preventDefault(); const list=[...grid.querySelectorAll('a.ph')]; idx=list.indexOf(a); openLB(idx); });
  p.addEventListener('click',prev); n.addEventListener('click',next); c.addEventListener('click',closeLB); lb.addEventListener('click',e=>{ if(e.target===lb) closeLB(); });
  document.addEventListener('keydown',e=>{ if(!lb.classList.contains('open'))return; if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });
})();

// Дни рождения (UTC+3, корректно уезжает на следующий год)
function nextBirthday({month, day}){
  const now = new Date();
  function makeY(y){ return new Date(Date.UTC(y, month-1, day, 0, -TZ_OFFSET_MINUTES, 0)); }
  let t = makeY(now.getFullYear());
  if (t < now) t = makeY(now.getFullYear()+1);
  return t;
}
function timer(prefix, dateObj){
  const d=$(`#${prefix}d`), h=$(`#${prefix}h`), m=$(`#${prefix}m`), s=$(`#${prefix}s`);
  function up(){
    const diff = nextBirthday(dateObj) - new Date();
    const pad = n=>String(n).padStart(2,'0');
    d.textContent=pad(Math.floor(diff/86400000));
    h.textContent=pad(Math.floor((diff/3600000)%24));
    m.textContent=pad(Math.floor((diff/60000)%60));
    s.textContent=pad(Math.floor((diff/1000)%60));
  }
  up(); setInterval(up, 1000);
}
timer('N', BIRTHDAY_N); timer('E', BIRTHDAY_E);

// Записка дня (localStorage)
(function notes(){
  const key='stuha-egor-note';
  const area=$('#note'); if(!area) return;
  area.value = localStorage.getItem(key) || '';
  $('#saveNote').addEventListener('click', ()=>{ localStorage.setItem(key, area.value); area.classList.add('saved'); setTimeout(()=>area.classList.remove('saved'),600); });
  $('#clearNote').addEventListener('click', ()=>{ area.value=''; localStorage.removeItem(key); });
})();
