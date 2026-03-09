'use strict';

const off    = document.createElement('canvas'); off.width = 64; off.height = 64;
const offCtx = off.getContext('2d');
window.SC_offCanvas = off;  
const ec    = document.getElementById('editCanvas');
const ectx  = ec.getContext('2d');
const pvc   = document.getElementById('previewCanvas');
const pvctx = pvc.getContext('2d');

const S = {
  tool: 'pencil', c1: '#a8ff3e', c2: '#1e232e',
  brush: 1, opacity: 1,
  part: 'head', layer: 'base', face: 'front',
  zoom: 8, grid: true, skinType: 'steve', pvFace: 'front',
  drawing: false, lc: null, lStart: null, snap: null,
  hist: [], hi: -1,
  view: 'edit',
};

function hex2rgba(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r, g, b, Math.round(a*255)];
}
function rgb2hsl(r,g,b) {
  r/=255; g/=255; b/=255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2;
  if (mx===mn) return [0,0,l];
  const d=mx-mn, s=l>.5?d/(2-mx-mn):d/(mx+mn);
  let h;
  if (mx===r) h=(g-b)/d+(g<b?6:0);
  else if (mx===g) h=(b-r)/d+2;
  else h=(r-g)/d+4;
  return [h/6, s, l];
}
function hsl2rgb(h,s,l) {
  if (s===0) { const v=Math.round(l*255); return [v,v,v]; }
  const q=l<.5?l*(1+s):l+s-l*s, p=2*l-q;
  const f=(p,q,t)=>{
    if (t<0) t+=1; if (t>1) t-=1;
    if (t<1/6) return p+(q-p)*6*t;
    if (t<.5)  return q;
    if (t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  };
  return [Math.round(f(p,q,h+1/3)*255), Math.round(f(p,q,h)*255), Math.round(f(p,q,h-1/3)*255)];
}

function activeUV() {
  if (S.part === 'full') return { x:0, y:0, w:64, h:64 };
  const p = UV[S.part]; if (!p) return null;
  const l = p[S.layer]; if (!l) return null;
  return l[S.face] || l[FACE_ORDER.find(f => l[f])];
}
function getRgn() {
  if (S.part === 'full') return { x:0, y:0, w:64, h:64 };
  return activeUV() || { x:0, y:0, w:64, h:64 };
}
function canvas2skin(cx, cy) {
  const uv = activeUV(); if (!uv) return null;
  const z = S.zoom;
  const px = Math.floor(cx/z), py = Math.floor(cy/z);
  if (px<0||py<0||px>=uv.w||py>=uv.h) return null;
  return { sx: uv.x+px, sy: uv.y+py, lx:px, ly:py };
}

function putPixel(sx, sy, col, alpha=1) {
  if (sx<0||sx>=64||sy<0||sy>=64) return;
  if (col === 'erase') { offCtx.clearRect(sx,sy,1,1); return; }
  const [r,g,b,a] = hex2rgba(col, alpha);
  offCtx.fillStyle = `rgba(${r},${g},${b},${a/255})`;
  offCtx.fillRect(sx, sy, 1, 1);
}
function getPixelHex(sx, sy) {
  const d = offCtx.getImageData(sx,sy,1,1).data;
  if (d[3]===0) return null;
  return '#' + [d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function paintBrush(c, col) {
  const sz = S.brush;
  for (let dy=0; dy<sz; dy++)
    for (let dx=0; dx<sz; dx++)
      putPixel(c.sx+dx, c.sy+dy, col, S.opacity);
}

function bresenham(x0,y0,x1,y1,col,al) {
  let dx=Math.abs(x1-x0), sx=x0<x1?1:-1;
  let dy=-Math.abs(y1-y0),sy=y0<y1?1:-1, err=dx+dy;
  const uv=activeUV(); if (!uv) return;
  while(true) {
    if (x0>=uv.x&&x0<uv.x+uv.w&&y0>=uv.y&&y0<uv.y+uv.h) putPixel(x0,y0,col,al);
    if (x0===x1&&y0===y1) break;
    const e2=2*err;
    if (e2>=dy){err+=dy;x0+=sx;}
    if (e2<=dx){err+=dx;y0+=sy;}
  }
}

function floodFill(sx, sy, fc) {
  const img = offCtx.getImageData(0,0,64,64), d = img.data;
  const idx = (x,y) => (y*64+x)*4;
  const i = idx(sx,sy);
  const [tr,tg,tb,ta] = [d[i],d[i+1],d[i+2],d[i+3]];
  const [fr,fg,fb,fa] = hex2rgba(fc, S.opacity);
  if (tr===fr&&tg===fg&&tb===fb&&ta===fa) return;
  const uv = activeUV(); if (!uv) return;
  const stack = [[sx,sy]], vis = new Set();
  while (stack.length) {
    const [x,y] = stack.pop(), k=`${x},${y}`;
    if (vis.has(k)||x<uv.x||x>=uv.x+uv.w||y<uv.y||y>=uv.y+uv.h) continue;
    const j=idx(x,y);
    if (d[j]!==tr||d[j+1]!==tg||d[j+2]!==tb||d[j+3]!==ta) continue;
    vis.add(k);
    d[j]=fr; d[j+1]=fg; d[j+2]=fb; d[j+3]=fa;
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  offCtx.putImageData(img,0,0);
}

function applyHue(deg) {
  const uv=getRgn(), img=offCtx.getImageData(uv.x,uv.y,uv.w,uv.h), d=img.data;
  for (let i=0;i<d.length;i+=4) {
    if (!d[i+3]) continue;
    const [h,s,l]=rgb2hsl(d[i],d[i+1],d[i+2]);
    const [r,g,b]=hsl2rgb((h+deg/360+1)%1,s,l);
    d[i]=r; d[i+1]=g; d[i+2]=b;
  }
  offCtx.putImageData(img,uv.x,uv.y);
}
function applyBrightness(f) {
  const uv=getRgn(), img=offCtx.getImageData(uv.x,uv.y,uv.w,uv.h), d=img.data;
  for (let i=0;i<d.length;i+=4) {
    if (!d[i+3]) continue;
    d[i]=Math.min(255,d[i]*f); d[i+1]=Math.min(255,d[i+1]*f); d[i+2]=Math.min(255,d[i+2]*f);
  }
  offCtx.putImageData(img,uv.x,uv.y);
}
function applySaturation(f) {
  const uv=getRgn(), img=offCtx.getImageData(uv.x,uv.y,uv.w,uv.h), d=img.data;
  for (let i=0;i<d.length;i+=4) {
    if (!d[i+3]) continue;
    const [h,s,l]=rgb2hsl(d[i],d[i+1],d[i+2]);
    const [r,g,b]=hsl2rgb(h,Math.min(1,Math.max(0,s*f)),l);
    d[i]=r; d[i+1]=g; d[i+2]=b;
  }
  offCtx.putImageData(img,uv.x,uv.y);
}
function applyContrast(v) {
  const uv=getRgn(), img=offCtx.getImageData(uv.x,uv.y,uv.w,uv.h), d=img.data;
  const f=(259*(v+255))/(255*(259-v));
  for (let i=0;i<d.length;i+=4) {
    if (!d[i+3]) continue;
    d[i]=Math.min(255,Math.max(0,f*(d[i]-128)+128));
    d[i+1]=Math.min(255,Math.max(0,f*(d[i+1]-128)+128));
    d[i+2]=Math.min(255,Math.max(0,f*(d[i+2]-128)+128));
  }
  offCtx.putImageData(img,uv.x,uv.y);
}
function applyFlip(axis) {
  const uv=getRgn(), img=offCtx.getImageData(uv.x,uv.y,uv.w,uv.h);
  const t=document.createElement('canvas'); t.width=uv.w; t.height=uv.h;
  t.getContext('2d').putImageData(img,0,0);
  const o=document.createElement('canvas'); o.width=uv.w; o.height=uv.h;
  const oc=o.getContext('2d');
  if (axis==='h') { oc.translate(uv.w,0); oc.scale(-1,1); }
  else            { oc.translate(0,uv.h); oc.scale(1,-1); }
  oc.drawImage(t,0,0);
  offCtx.putImageData(oc.getImageData(0,0,uv.w,uv.h),uv.x,uv.y);
}
function applyColorize(col) {
  const uv=getRgn(), img=offCtx.getImageData(uv.x,uv.y,uv.w,uv.h), d=img.data;
  const [cr,cg,cb]=hex2rgba(col,1);
  for (let i=0;i<d.length;i+=4) {
    if (!d[i+3]) continue;
    const gr=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;
    d[i]=Math.min(255,cr*gr*1.5); d[i+1]=Math.min(255,cg*gr*1.5); d[i+2]=Math.min(255,cb*gr*1.5);
  }
  offCtx.putImageData(img,uv.x,uv.y);
}
function applyReplace(tol) {
  const uv=getRgn(), img=offCtx.getImageData(uv.x,uv.y,uv.w,uv.h), d=img.data;
  const [fr,fg,fb]=hex2rgba(S.c2,1), [tr2,tg2,tb2]=hex2rgba(S.c1,1);
  const t=tol*3;
  for (let i=0;i<d.length;i+=4) {
    if (!d[i+3]) continue;
    if (Math.abs(d[i]-fr)+Math.abs(d[i+1]-fg)+Math.abs(d[i+2]-fb)<=t) {
      d[i]=tr2; d[i+1]=tg2; d[i+2]=tb2;
    }
  }
  offCtx.putImageData(img,uv.x,uv.y);
}

function pushHistory(label='Action') {
  if (S.hi < S.hist.length-1) S.hist.splice(S.hi+1);
  S.hist.push({ label, data: offCtx.getImageData(0,0,64,64) });
  if (S.hist.length > 60) S.hist.shift();
  S.hi = S.hist.length-1;
  renderHistoryUI();
}
function undo() {
  if (S.hi <= 0) return;
  S.hi--;
  offCtx.putImageData(S.hist[S.hi].data, 0, 0);
  renderAll(); renderHistoryUI(); toast('◄ Annulé');
}
function redo() {
  if (S.hi >= S.hist.length-1) return;
  S.hi++;
  offCtx.putImageData(S.hist[S.hi].data, 0, 0);
  renderAll(); renderHistoryUI(); toast('► Refait');
}
function renderHistoryUI() {
  const el = document.getElementById('histList');
  const count = document.getElementById('histCount');
  if (count) count.textContent = `(${S.hist.length})`;
  el.innerHTML = '';
  const start = Math.max(0, S.hist.length-10);
  S.hist.slice(start).forEach((h, i) => {
    const ri = start+i;
    const d = document.createElement('div');
    d.className = 'hist-item' + (ri===S.hi?' active':'');
    d.innerHTML = `<span class="hist-dot"></span>${h.label}`;
    d.onclick = () => {
      S.hi = ri;
      offCtx.putImageData(S.hist[ri].data, 0, 0);
      renderAll(); renderHistoryUI();
    };
    el.appendChild(d);
  });
  el.scrollTop = el.scrollHeight;
}

function renderEdit() {
  const uv = activeUV(); if (!uv) return;
  const z = S.zoom;
  ec.width  = uv.w * z;
  ec.height = uv.h * z;
  ectx.imageSmoothingEnabled = false;

  for (let y=0;y<uv.h;y++) for (let x=0;x<uv.w;x++) {
    ectx.fillStyle = (x+y)%2===0 ? '#13161c' : '#191d26';
    ectx.fillRect(x*z,y*z,z,z);
  }
  
  const id = offCtx.getImageData(uv.x,uv.y,uv.w,uv.h).data;
  for (let y=0;y<uv.h;y++) for (let x=0;x<uv.w;x++) {
    const i=(y*uv.w+x)*4;
    if (id[i+3]>0) {
      ectx.fillStyle = `rgba(${id[i]},${id[i+1]},${id[i+2]},${id[i+3]/255})`;
      ectx.fillRect(x*z,y*z,z,z);
    }
  }
  if (S.grid && z>=3) {
    ectx.strokeStyle='rgba(255,255,255,.07)'; ectx.lineWidth=.5;
    for (let x=0;x<=uv.w;x++){ectx.beginPath();ectx.moveTo(x*z,0);ectx.lineTo(x*z,uv.h*z);ectx.stroke();}
    for (let y=0;y<=uv.h;y++){ectx.beginPath();ectx.moveTo(0,y*z);ectx.lineTo(uv.w*z,y*z);ectx.stroke();}
  }
  const bd = document.getElementById('infoBadge');
  if (bd) {
    document.getElementById('badgeDim').textContent = `${uv.w}×${uv.h}`;
    document.getElementById('badgeZoom').textContent = z;
  }
}

function renderFull() {
  const z = S.zoom;
  ec.width  = 64*z; ec.height = 64*z;
  ectx.imageSmoothingEnabled = false;
  for (let y=0;y<64;y++) for (let x=0;x<64;x++) {
    ectx.fillStyle = (x+y)%2===0 ? '#13161c' : '#191d26';
    ectx.fillRect(x*z,y*z,z,z);
  }
  ectx.drawImage(off, 0,0,64,64, 0,0,64*z,64*z);
  if (S.grid && z>=4) {
    ectx.strokeStyle='rgba(255,255,255,.05)'; ectx.lineWidth=.5;
    for (let x=0;x<=64;x++){ectx.beginPath();ectx.moveTo(x*z,0);ectx.lineTo(x*z,64*z);ectx.stroke();}
    for (let y=0;y<=64;y++){ectx.beginPath();ectx.moveTo(0,y*z);ectx.lineTo(64*z,y*z);ectx.stroke();}
  }
  const bd = document.getElementById('infoBadge');
  if (bd) { document.getElementById('badgeDim').textContent='64×64'; document.getElementById('badgeZoom').textContent=z; }
}

function renderPreview() {
  const W=158,H=198,sc=3;
  pvc.width=W; pvc.height=H;
  pvctx.imageSmoothingEnabled=false;
  pvctx.fillStyle='#191d26'; pvctx.fillRect(0,0,W,H);
  const v=S.pvFace, cx=W/2;
  const dp=(pk,dx,dy,s=sc)=>{
    const p=UV[pk]; if(!p) return;
    const b=p.base[v]||p.base.front; if(!b) return;
    pvctx.drawImage(off,b.x,b.y,b.w,b.h,dx,dy,b.w*s,b.h*s);
    const ov=p.overlay&&(p.overlay[v]||p.overlay.front);
    if(ov) pvctx.drawImage(off,ov.x,ov.y,ov.w,ov.h,dx,dy,ov.w*s,ov.h*s);
  };
  const aw=S.skinType==='alex'?3:4;
  const hY=4, bY=hY+8*sc+1;
  dp('head',cx-4*sc,hY);
  dp('body',cx-4*sc,bY);
  dp('arm_right',cx-4*sc-aw*sc-1,bY);
  dp('arm_left', cx+4*sc+1,bY);
  dp('leg_right',cx-4*sc,bY+12*sc+1);
  dp('leg_left', cx,      bY+12*sc+1);
}

function renderAll() {
  if (S.view==='edit') renderEdit();
  else renderFull();
  renderPreview();
  if (window.SC_renderer3d) window.SC_renderer3d.skinDirty = true;
}

function initDefaultSkin() {
  const c = offCtx;
  c.fillStyle='#FDBCB4';
  c.fillRect(8,8,8,8); c.fillRect(0,8,8,8); c.fillRect(16,8,8,8); c.fillRect(24,8,8,8);
  c.fillRect(8,0,8,8); c.fillRect(16,0,8,8);
  c.fillStyle='#5c3317';
  c.fillRect(8,8,8,2); c.fillRect(8,0,8,8); c.fillRect(16,0,8,8);
  c.fillRect(0,8,8,3); c.fillRect(24,8,8,3);
  c.fillStyle='#fff';  c.fillRect(9,10,2,2); c.fillRect(13,10,2,2);
  c.fillStyle='#3d2b1f'; c.fillRect(10,11,1,1); c.fillRect(14,11,1,1);
  c.fillStyle='#1a0e08'; c.fillRect(10,10,1,1); c.fillRect(14,10,1,1);
  c.fillStyle='#2563eb';
  c.fillRect(20,20,8,12); c.fillRect(16,20,4,12); c.fillRect(28,20,4,12); c.fillRect(32,20,8,12);
  c.fillRect(20,16,8,4); c.fillRect(28,16,8,4);
  c.fillStyle='#FDBCB4';
  c.fillRect(40,20,12,12); c.fillRect(52,20,4,12);
  c.fillRect(24,52,12,12); c.fillRect(36,52,4,12);
  c.fillStyle='#1d4ed8';
  c.fillRect(40,20,4,12); c.fillRect(48,20,4,12);
  c.fillRect(24,52,4,12); c.fillRect(32,52,4,12);
  c.fillStyle='#1e3a5f';
  c.fillRect(0,20,12,12); c.fillRect(12,20,4,12);
  c.fillRect(16,52,12,12); c.fillRect(28,52,4,12);
  c.fillRect(4,16,4,4); c.fillRect(8,16,4,4);
  c.fillRect(20,48,4,4); c.fillRect(24,48,4,4);
  c.fillStyle='#111';
  c.fillRect(4,28,4,4); c.fillRect(20,60,4,4);
  c.fillRect(0,20,4,4); c.fillRect(16,52,4,4);
}
