// ==== Config ===
const PHOTOS_COUNT = 59;
const BIRTHDAY_N = '2011-12-09T00:00:00+03:00';
const BIRTHDAY_E = '2011-12-28T00:00:00+03:00';
const $ = (s)=>document.querySelector(s); const $$=(s)=>document.querySelectorAll(s);

// hint
const tapHint = $('#tapHint'); setTimeout(()=> tapHint && (tapHint.style.opacity='0.3'), 2000); setTimeout(()=> tapHint && (tapHint.style.display='none'), 7000);

// starfields
function starfield(canvas, count, speed=0.15){
  const ctx = canvas.getContext('2d'); let w,h,DPR=Math.min(devicePixelRatio||1,2);
  function resize(){ const rect=canvas.getBoundingClientRect(); w=rect.width; h=rect.height; canvas.width=w*DPR; canvas.height=h*DPR; ctx.setTransform(1,0,0,1,0,0); ctx.scale(DPR,DPR); }
  resize(); addEventListener('resize', resize);
  const stars = Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.6+.3,t:Math.random()*6.28}));
  let tiltX=0, tiltY=0;
  function draw(){
    ctx.clearRect(0,0,w,h); ctx.fillStyle='rgba(255,255,255,.95)';
    for(const s of stars){ s.t+=0.01; const a=(Math.sin(s.t)*.5+.5)*.7+.3; ctx.globalAlpha=a;
      const px=s.x+tiltX*speed, py=s.y+tiltY*speed; ctx.beginPath(); ctx.arc(px,py,s.r,0,6.28); ctx.fill();
    } ctx.globalAlpha=1; requestAnimationFrame(draw);
  } draw();
  addEventListener('mousemove',e=>{ const cx=w/2, cy=h/2; tiltX=(e.clientX-cx)/30; tiltY=(e.clientY-cy)/30; },{passive:true});
  addEventListener('deviceorientation',e=>{ if(!e.gamma&&!e.beta) return; tiltX=(e.gamma||0); tiltY=(e.beta||0); },{passive:true});
}
['layer-back','layer-mid','layer-front'].forEach((id,i)=>{
  const c=document.getElementById(id); if(!c) return; starfield(c, [60,80,40][i], [0.06,0.12,0.2][i]);
});

// reveal
const io=new IntersectionObserver((entries)=>{ for(const e of entries){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} } },{threshold:.18});
$$('.section, .section-title, .card, .grid .ph').forEach(el=> io.observe(el));

// gallery
const grid=$('#grid');
if(grid){
  const images=Array.from({length:PHOTOS_COUNT},(_,i)=>i+1);
  images.forEach((n,idx)=>{
    const a=document.createElement('a'); a.href=`photos/${n}.jpg`; a.className='ph'; a.dataset.index=idx;
    const img=document.createElement('img'); img.loading='lazy'; img.alt=`Фото ${n}`; img.src=`photos/${n}.jpg`;
    a.appendChild(img); grid.appendChild(a);
  });
  const lb=$('#lightbox'), lbImg=$('#lbImg'), p=$('#lbPrev'), n=$('#lbNext'), c=$('#lbClose'); let ci=0;
  function openLB(i){ ci=i; lbImg.src=`photos/${images[ci]}.jpg`; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); }
  function closeLB(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); lbImg.src=''; }
  function prev(){ ci=(ci-1+images.length)%images.length; openLB(ci); }
  function next(){ ci=(ci+1)%images.length; openLB(ci); }
  grid.addEventListener('click',e=>{ const a=e.target.closest('a.ph'); if(!a) return; e.preventDefault(); openLB(parseInt(a.dataset.index,10)); });
  p.addEventListener('click',prev); n.addEventListener('click',next); c.addEventListener('click',closeLB);
  lb.addEventListener('click',e=>{ if(e.target===lb) closeLB(); });
  document.addEventListener('keydown',e=>{ if(!lb.classList.contains('open')) return; if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });
}

// countdown
function nextOcc(iso){ const now=new Date(); const t=new Date(iso); t.setFullYear(now.getFullYear()); if(t<now) t.setFullYear(now.getFullYear()+1); return t; }
function timer(prefix, iso){
  const d=$(`#${prefix}d`), h=$(`#${prefix}h`), m=$(`#${prefix}m`), s=$(`#${prefix}s`);
  function up(){ const now=new Date(), tgt=nextOcc(iso); const diff=tgt-now;
    const pad=n=>String(n).padStart(2,'0'); const dd=Math.floor(diff/86400000), hh=Math.floor((diff/3600000)%24), mm=Math.floor((diff/60000)%60), ss=Math.floor((diff/1000)%60);
    d.textContent=pad(dd); h.textContent=pad(hh); m.textContent=pad(mm); s.textContent=pad(ss);
  } up(); return setInterval(up,1000);
}
timer('N', BIRTHDAY_N); timer('E', BIRTHDAY_E);

// celebration + vibration
const heroTitle=$('#heroTitle'), celebrate=$('#celebrate');
function vibrate20s(){ if(!('vibrate' in navigator)) return; const pattern=[]; let total=0; while(total<20000){ pattern.push(200,150); total+=350;} navigator.vibrate(pattern); }
function startCelebration(){
  celebrate.classList.add('open'); celebrate.setAttribute('aria-hidden','false'); vibrate20s();
  const box=$('#sparkles'); box.innerHTML=''; const n=100;
  for(let i=0;i<n;i++){ const s=document.createElement('span'); const x=Math.random()*100, y=Math.random()*100;
    Object.assign(s.style,{position:'absolute',left:x+'%',top:y+'%',width:(Math.random()*4+1)+'px',height:(Math.random()*4+1)+'px',background:'white',borderRadius:'50%',opacity:'0',boxShadow:'0 0 12px rgba(255,255,255,.85)'});
    s.animate([{transform:'scale(.6)',opacity:0},{transform:'scale(1)',opacity:1,offset:.2},{transform:'scale(1.2)',opacity:0}],{duration:1300+Math.random()*1000,delay:Math.random()*1000,iterations:12});
    box.appendChild(s);
  }
  setTimeout(()=>{ celebrate.classList.remove('open'); celebrate.setAttribute('aria-hidden','true'); navigator.vibrate(0); },20000);
}
heroTitle && heroTitle.addEventListener('click', startCelebration);

// falling star easter egg
let lastTap=0;
function fallingStar(x=innerWidth*Math.random()){
  const star=document.createElement('div'); Object.assign(star.style,{position:'fixed',left:x+'px',top:'-10px',width:'3px',height:'3px',background:'white',borderRadius:'50%',boxShadow:'0 0 18px rgba(255,255,255,.9)',zIndex:200});
  document.body.appendChild(star);
  star.animate([{transform:'translateY(-10px)',opacity:1},{transform:`translateY(${innerHeight+20}px)`,opacity:0}],{duration:1200,easing:'ease-out'}).onfinish=()=>star.remove();
}
addEventListener('dblclick',()=>fallingStar());
addEventListener('touchend',()=>{ const t=Date.now(); if(t-lastTap<300) fallingStar(); lastTap=t; },{passive:true});

// PWA sw
if('serviceWorker' in navigator){ addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{})); }
