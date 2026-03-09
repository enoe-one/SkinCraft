/* =====================================================
   SKINCRAFT v3.0 — app.js
   - Three.js pré-chargé (instantané)
   - Mode édition globale skin entier
   - Animations: Mine (pioche diamant) + Bouclier
   ===================================================== */
'use strict';

const UV={head:{base:{front:{x:8,y:8,w:8,h:8},back:{x:24,y:8,w:8,h:8},right:{x:0,y:8,w:8,h:8},left:{x:16,y:8,w:8,h:8},top:{x:8,y:0,w:8,h:8},bottom:{x:16,y:0,w:8,h:8}},overlay:{front:{x:40,y:8,w:8,h:8},back:{x:56,y:8,w:8,h:8},right:{x:32,y:8,w:8,h:8},left:{x:48,y:8,w:8,h:8},top:{x:40,y:0,w:8,h:8},bottom:{x:48,y:0,w:8,h:8}}},body:{base:{front:{x:20,y:20,w:8,h:12},back:{x:32,y:20,w:8,h:12},right:{x:16,y:20,w:4,h:12},left:{x:28,y:20,w:4,h:12},top:{x:20,y:16,w:8,h:4},bottom:{x:28,y:16,w:8,h:4}},overlay:{front:{x:20,y:36,w:8,h:12},back:{x:32,y:36,w:8,h:12},right:{x:16,y:36,w:4,h:12},left:{x:28,y:36,w:4,h:12}}},arm_right:{base:{front:{x:44,y:20,w:4,h:12},back:{x:52,y:20,w:4,h:12},right:{x:40,y:20,w:4,h:12},left:{x:48,y:20,w:4,h:12},top:{x:44,y:16,w:4,h:4},bottom:{x:48,y:16,w:4,h:4}},overlay:{front:{x:44,y:36,w:4,h:12},back:{x:52,y:36,w:4,h:12},right:{x:40,y:36,w:4,h:12},left:{x:48,y:36,w:4,h:12}}},arm_left:{base:{front:{x:28,y:52,w:4,h:12},back:{x:36,y:52,w:4,h:12},right:{x:24,y:52,w:4,h:12},left:{x:32,y:52,w:4,h:12},top:{x:28,y:48,w:4,h:4},bottom:{x:32,y:48,w:4,h:4}},overlay:{front:{x:44,y:52,w:4,h:12},back:{x:52,y:52,w:4,h:12},right:{x:40,y:52,w:4,h:12},left:{x:48,y:52,w:4,h:12}}},leg_right:{base:{front:{x:4,y:20,w:4,h:12},back:{x:12,y:20,w:4,h:12},right:{x:0,y:20,w:4,h:12},left:{x:8,y:20,w:4,h:12},top:{x:4,y:16,w:4,h:4},bottom:{x:8,y:16,w:4,h:4}},overlay:{front:{x:4,y:36,w:4,h:12},back:{x:12,y:36,w:4,h:12},right:{x:0,y:36,w:4,h:12},left:{x:8,y:36,w:4,h:12}}},leg_left:{base:{front:{x:20,y:52,w:4,h:12},back:{x:28,y:52,w:4,h:12},right:{x:16,y:52,w:4,h:12},left:{x:24,y:52,w:4,h:12},top:{x:20,y:48,w:4,h:4},bottom:{x:24,y:48,w:4,h:4}},overlay:{front:{x:4,y:52,w:4,h:12},back:{x:12,y:52,w:4,h:12},right:{x:0,y:52,w:4,h:12},left:{x:8,y:52,w:4,h:12}}}};
const PART_LABELS={head:'Tête',body:'Corps',arm_right:'Bras D',arm_left:'Bras G',leg_right:'Jambe D',leg_left:'Jambe G',full:'Skin Entier'};
const FACE_ORDER=['front','back','right','left','top','bottom'];
const PALETTE=['#000000','#161616','#3a3a3a','#5e5e5e','#888888','#b5b5b5','#dedede','#ffffff','#ffcfc7','#ff8c80','#ff3333','#cc0000','#800000','#4d1010','#350000','#ff6622','#ffd97a','#ffc200','#ff9900','#cc6600','#884400','#553300','#331a00','#ffe033','#d4ff99','#99ff33','#55cc00','#2e8800','#1a5200','#0d2b00','#ccffcc','#00ff55','#88ffee','#00ffcc','#00cc99','#008866','#004433','#002218','#ccffff','#00ffff','#88ccff','#3388ff','#0055ee','#0033aa','#001a77','#000e40','#aa88ff','#6600cc','#e0bbff','#aa00ff','#7700ff','#440099','#ff88cc','#ff0088','#cc0055','#880033','#8B4513','#A0522D','#CD853F','#DEB887','#F5DEB3','#FAEBD7','#FFFACD','#FFF5E1'];

const S={tool:'pencil',primary:'#a8ff3e',secondary:'#1e232e',brushSize:1,opacity:1,part:'head',layer:'base',face:'front',zoom:8,showGrid:true,skinType:'steve',previewFace:'front',drawing:false,lastCoord:null,lineStart:null,preSnap:null,history:[],histIdx:-1,view:'edit'};
const offscreen=document.createElement('canvas');offscreen.width=64;offscreen.height=64;const off=offscreen.getContext('2d');
const editCanvas=document.getElementById('editCanvas'),editCtx=editCanvas.getContext('2d');
const prevCanvas=document.getElementById('prevCanvas'),prevCtx=prevCanvas.getContext('2d');

function initSkin(){const c=off;c.fillStyle='#FDBCB4';c.fillRect(8,8,8,8);c.fillRect(0,8,8,8);c.fillRect(16,8,8,8);c.fillRect(24,8,8,8);c.fillRect(8,0,8,8);c.fillRect(16,0,8,8);c.fillStyle='#5c3317';c.fillRect(8,8,8,2);c.fillRect(8,0,8,8);c.fillRect(16,0,8,8);c.fillRect(0,8,8,3);c.fillRect(24,8,8,3);c.fillStyle='#ffffff';c.fillRect(9,10,2,2);c.fillRect(13,10,2,2);c.fillStyle='#3d2b1f';c.fillRect(10,11,1,1);c.fillRect(14,11,1,1);c.fillStyle='#1a0e08';c.fillRect(10,10,1,1);c.fillRect(14,10,1,1);c.fillStyle='#2563eb';c.fillRect(20,20,8,12);c.fillRect(16,20,4,12);c.fillRect(28,20,4,12);c.fillRect(32,20,8,12);c.fillRect(20,16,8,4);c.fillRect(28,16,8,4);c.fillStyle='#FDBCB4';c.fillRect(40,20,12,12);c.fillRect(52,20,4,12);c.fillRect(24,52,12,12);c.fillRect(36,52,4,12);c.fillStyle='#1d4ed8';c.fillRect(40,20,4,12);c.fillRect(48,20,4,12);c.fillRect(24,52,4,12);c.fillRect(32,52,4,12);c.fillStyle='#1e3a5f';c.fillRect(0,20,12,12);c.fillRect(12,20,4,12);c.fillRect(16,52,12,12);c.fillRect(28,52,4,12);c.fillRect(4,16,4,4);c.fillRect(8,16,4,4);c.fillRect(20,48,4,4);c.fillRect(24,48,4,4);c.fillStyle='#111111';c.fillRect(4,28,4,4);c.fillRect(20,60,4,4);c.fillRect(0,20,4,4);c.fillRect(16,52,4,4);}

function buildPalette(){const el=document.getElementById('palette');el.innerHTML='';PALETTE.forEach(col=>{const d=document.createElement('div');d.className='pal-swatch';d.style.background=col;d.title=col;d.addEventListener('click',e=>e.shiftKey?setSecondary(col):setPrimary(col));d.addEventListener('contextmenu',e=>{e.preventDefault();setSecondary(col);});el.appendChild(d);});}
function setPrimary(c){S.primary=c;document.getElementById('swatchPrimary').style.background=c;document.getElementById('inputPrimary').value=c;}
function setSecondary(c){S.secondary=c;document.getElementById('swatchSecondary').style.background=c;document.getElementById('inputSecondary').value=c;}

function activeUV(){if(S.part==='full')return{x:0,y:0,w:64,h:64};const p=UV[S.part];if(!p)return null;const l=p[S.layer];if(!l)return null;return l[S.face]||l[FACE_ORDER.find(f=>l[f])];}
function canvasToSkin(cx,cy){const uv=activeUV();if(!uv)return null;const z=S.zoom,px=Math.floor(cx/z),py=Math.floor(cy/z);if(px<0||py<0||px>=uv.w||py>=uv.h)return null;return{sx:uv.x+px,sy:uv.y+py,lx:px,ly:py};}
function hexToRGBA(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return[r,g,b,Math.round(a*255)];}
function paintPx(sx,sy,col,alpha=1){if(sx<0||sx>=64||sy<0||sy>=64)return;if(col==='erase'){off.clearRect(sx,sy,1,1);return;}const[r,g,b,a]=hexToRGBA(col,alpha);off.fillStyle=`rgba(${r},${g},${b},${a/255})`;off.fillRect(sx,sy,1,1);}
function getColorAt(sx,sy){const d=off.getImageData(sx,sy,1,1).data;if(d[3]===0)return null;return'#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');}
function floodFill(sx,sy,fillCol){const img=off.getImageData(0,0,64,64),data=img.data,idx=(x,y)=>(y*64+x)*4,i=idx(sx,sy);const[tr,tg,tb,ta]=[data[i],data[i+1],data[i+2],data[i+3]];const[fr,fg,fb,fa]=hexToRGBA(fillCol,S.opacity);if(tr===fr&&tg===fg&&tb===fb)return;const uv=activeUV();if(!uv)return;const stack=[[sx,sy]],visited=new Set();while(stack.length){const[x,y]=stack.pop();const key=`${x},${y}`;if(visited.has(key)||x<uv.x||x>=uv.x+uv.w||y<uv.y||y>=uv.y+uv.h)continue;const j=idx(x,y);if(data[j]!==tr||data[j+1]!==tg||data[j+2]!==tb||data[j+3]!==ta)continue;visited.add(key);data[j]=fr;data[j+1]=fg;data[j+2]=fb;data[j+3]=fa;stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}off.putImageData(img,0,0);}
function bresenham(x0,y0,x1,y1,col,alpha){let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;const uv=activeUV();if(!uv)return;while(true){if(x0>=uv.x&&x0<uv.x+uv.w&&y0>=uv.y&&y0<uv.y+uv.h)paintPx(x0,y0,col,alpha);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}}

// ── FONCTIONS ÉDITION GLOBALE ─────────────────────────
function getRegion(){if(S.part==='full')return{x:0,y:0,w:64,h:64};return activeUV()||{x:0,y:0,w:64,h:64};}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;if(max===min)return[0,0,l];const d=max-min,s=l>0.5?d/(2-max-min):d/(max+min);let h;if(max===r)h=(g-b)/d+(g<b?6:0);else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;return[h/6,s,l];}
function hslToRgb(h,s,l){if(s===0){const v=Math.round(l*255);return[v,v,v];}const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q,h2r=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};return[Math.round(h2r(p,q,h+1/3)*255),Math.round(h2r(p,q,h)*255),Math.round(h2r(p,q,h-1/3)*255)];}
function applyHueShift(deg){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h),d=img.data;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;const[h,s,l]=rgbToHsl(d[i],d[i+1],d[i+2]);const[r,g,b]=hslToRgb((h+deg/360+1)%1,s,l);d[i]=r;d[i+1]=g;d[i+2]=b;}off.putImageData(img,uv.x,uv.y);}
function applySaturation(factor){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h),d=img.data;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;const[h,s,l]=rgbToHsl(d[i],d[i+1],d[i+2]);const[r,g,b]=hslToRgb(h,Math.min(1,Math.max(0,s*factor)),l);d[i]=r;d[i+1]=g;d[i+2]=b;}off.putImageData(img,uv.x,uv.y);}
function applyBrightness(factor){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h),d=img.data;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;d[i]=Math.min(255,d[i]*factor);d[i+1]=Math.min(255,d[i+1]*factor);d[i+2]=Math.min(255,d[i+2]*factor);}off.putImageData(img,uv.x,uv.y);}
function applyContrast(val){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h),d=img.data,f=(259*(val+255))/(255*(259-val));for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;d[i]=Math.min(255,Math.max(0,f*(d[i]-128)+128));d[i+1]=Math.min(255,Math.max(0,f*(d[i+1]-128)+128));d[i+2]=Math.min(255,Math.max(0,f*(d[i+2]-128)+128));}off.putImageData(img,uv.x,uv.y);}
function applyFlipH(){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h);const t=document.createElement('canvas');t.width=uv.w;t.height=uv.h;const tc=t.getContext('2d');tc.putImageData(img,0,0);const o=document.createElement('canvas');o.width=uv.w;o.height=uv.h;const oc=o.getContext('2d');oc.translate(uv.w,0);oc.scale(-1,1);oc.drawImage(t,0,0);off.putImageData(oc.getImageData(0,0,uv.w,uv.h),uv.x,uv.y);}
function applyFlipV(){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h);const t=document.createElement('canvas');t.width=uv.w;t.height=uv.h;const tc=t.getContext('2d');tc.putImageData(img,0,0);const o=document.createElement('canvas');o.width=uv.w;o.height=uv.h;const oc=o.getContext('2d');oc.translate(0,uv.h);oc.scale(1,-1);oc.drawImage(t,0,0);off.putImageData(oc.getImageData(0,0,uv.w,uv.h),uv.x,uv.y);}
function replaceColor(from,to){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h),d=img.data;const[fr,fg,fb]=hexToRGBA(from,1),[tr,tg,tb]=hexToRGBA(to,1);const tol=parseInt(document.getElementById('colorTolerance')?.value||'15')*3;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;if(Math.abs(d[i]-fr)+Math.abs(d[i+1]-fg)+Math.abs(d[i+2]-fb)<=tol){d[i]=tr;d[i+1]=tg;d[i+2]=tb;}}off.putImageData(img,uv.x,uv.y);}
function colorize(col){const uv=getRegion(),img=off.getImageData(uv.x,uv.y,uv.w,uv.h),d=img.data;const[cr,cg,cb]=hexToRGBA(col,1);for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;const gray=(d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114)/255;d[i]=Math.min(255,cr*gray*1.5);d[i+1]=Math.min(255,cg*gray*1.5);d[i+2]=Math.min(255,cb*gray*1.5);}off.putImageData(img,uv.x,uv.y);}
function clearRegion(){const uv=getRegion();off.clearRect(uv.x,uv.y,uv.w,uv.h);}

// ── HISTORY ───────────────────────────────────────────
function saveHistory(label='Action'){if(S.histIdx<S.history.length-1)S.history.splice(S.histIdx+1);S.history.push({label,data:off.getImageData(0,0,64,64)});if(S.history.length>60)S.history.shift();S.histIdx=S.history.length-1;refreshHistoryUI();}
function undo(){if(S.histIdx<=0)return;S.histIdx--;off.putImageData(S.history[S.histIdx].data,0,0);renderAll();refreshHistoryUI();notify('◄ Annulé');}
function redo(){if(S.histIdx>=S.history.length-1)return;S.histIdx++;off.putImageData(S.history[S.histIdx].data,0,0);renderAll();refreshHistoryUI();notify('► Refait');}
function refreshHistoryUI(){const list=document.getElementById('historyList');list.innerHTML='';S.history.slice(Math.max(0,S.history.length-8)).forEach((h,i)=>{const ri=Math.max(0,S.history.length-8)+i;const d=document.createElement('div');d.className='hist-item'+(ri===S.histIdx?' active':'');d.innerHTML=`<div class="hist-dot"></div>${h.label}`;d.addEventListener('click',()=>{S.histIdx=ri;off.putImageData(S.history[ri].data,0,0);renderAll();refreshHistoryUI();});list.appendChild(d);});}

// ── RENDER ────────────────────────────────────────────
function renderEdit(){const uv=activeUV();if(!uv)return;const z=S.zoom;editCanvas.width=uv.w*z;editCanvas.height=uv.h*z;editCtx.imageSmoothingEnabled=false;for(let y=0;y<uv.h;y++)for(let x=0;x<uv.w;x++){editCtx.fillStyle=(x+y)%2===0?'#13161c':'#191d26';editCtx.fillRect(x*z,y*z,z,z);}const imgData=off.getImageData(uv.x,uv.y,uv.w,uv.h).data;for(let y=0;y<uv.h;y++)for(let x=0;x<uv.w;x++){const idx=(y*uv.w+x)*4;if(imgData[idx+3]>0){editCtx.fillStyle=`rgba(${imgData[idx]},${imgData[idx+1]},${imgData[idx+2]},${imgData[idx+3]/255})`;editCtx.fillRect(x*z,y*z,z,z);}}if(S.showGrid&&z>=3){editCtx.strokeStyle='rgba(255,255,255,0.07)';editCtx.lineWidth=0.5;for(let x=0;x<=uv.w;x++){editCtx.beginPath();editCtx.moveTo(x*z,0);editCtx.lineTo(x*z,uv.h*z);editCtx.stroke();}for(let y=0;y<=uv.h;y++){editCtx.beginPath();editCtx.moveTo(0,y*z);editCtx.lineTo(uv.w*z,y*z);editCtx.stroke();}}document.getElementById('coordsBadge').innerHTML=`<span>${uv.w}×${uv.h}</span> &nbsp;·&nbsp; ×${z}`;}
function renderFull(){const z=S.zoom;editCanvas.width=64*z;editCanvas.height=64*z;editCtx.imageSmoothingEnabled=false;for(let y=0;y<64;y++)for(let x=0;x<64;x++){editCtx.fillStyle=(x+y)%2===0?'#13161c':'#191d26';editCtx.fillRect(x*z,y*z,z,z);}editCtx.drawImage(offscreen,0,0,64,64,0,0,64*z,64*z);if(S.showGrid&&z>=4){editCtx.strokeStyle='rgba(255,255,255,0.05)';editCtx.lineWidth=0.5;for(let x=0;x<=64;x++){editCtx.beginPath();editCtx.moveTo(x*z,0);editCtx.lineTo(x*z,64*z);editCtx.stroke();}for(let y=0;y<=64;y++){editCtx.beginPath();editCtx.moveTo(0,y*z);editCtx.lineTo(64*z,y*z);editCtx.stroke();}}document.getElementById('coordsBadge').innerHTML=`<span>64×64</span> &nbsp;·&nbsp; ×${z}`;}
function renderPreview(){const W=160,H=200,sc=3;prevCanvas.width=W;prevCanvas.height=H;prevCtx.imageSmoothingEnabled=false;prevCtx.fillStyle='#191d26';prevCtx.fillRect(0,0,W,H);for(let x=0;x<W;x+=8){prevCtx.fillStyle='rgba(255,255,255,0.02)';prevCtx.fillRect(x,0,1,H);}for(let y=0;y<H;y+=8){prevCtx.fillStyle='rgba(255,255,255,0.02)';prevCtx.fillRect(0,y,W,1);}const v=S.previewFace,cx=W/2;function dp(partKey,dx,dy,scX=sc){const prt=UV[partKey];if(!prt)return;const buv=prt.base[v]||prt.base.front;if(!buv)return;prevCtx.drawImage(offscreen,buv.x,buv.y,buv.w,buv.h,dx,dy,buv.w*scX,buv.h*scX);const ouv=prt.overlay&&(prt.overlay[v]||prt.overlay.front);if(ouv)prevCtx.drawImage(offscreen,ouv.x,ouv.y,ouv.w,ouv.h,dx,dy,ouv.w*scX,ouv.h*scX);}const armW=S.skinType==='alex'?3:4,hY=4,bY=hY+8*sc+1;dp('head',cx-4*sc,hY);dp('body',cx-4*sc,bY);dp('arm_right',cx-4*sc-armW*sc-1,bY);dp('arm_left',cx+4*sc+1,bY);dp('leg_right',cx-4*sc,bY+12*sc+1);dp('leg_left',cx,bY+12*sc+1);}
function renderAll(){if(S.view==='edit')renderEdit();else if(S.view==='full')renderFull();renderPreview();if(threeReady)updateSkinTexture();}

// ── CANVAS EVENTS ─────────────────────────────────────
editCanvas.addEventListener('mousedown',onDown);editCanvas.addEventListener('mousemove',onMove);editCanvas.addEventListener('mouseup',onUp);editCanvas.addEventListener('contextmenu',e=>e.preventDefault());editCanvas.addEventListener('wheel',e=>{e.preventDefault();e.deltaY<0?zoomIn():zoomOut();},{passive:false});editCanvas.addEventListener('mouseleave',()=>{document.getElementById('statusCoords').textContent='X: — Y: —';});
function getCC(e){const r=editCanvas.getBoundingClientRect();return canvasToSkin((e.clientX-r.left)*(editCanvas.width/r.width),(e.clientY-r.top)*(editCanvas.height/r.height));}
function onDown(e){const coord=getCC(e);if(!coord)return;const col=e.button===2?S.secondary:S.primary;if(S.tool==='eyedropper'){const c=getColorAt(coord.sx,coord.sy);if(c)e.button===2?setSecondary(c):setPrimary(c);return;}if(S.tool==='fill'){saveHistory('Remplissage');floodFill(coord.sx,coord.sy,col);renderAll();return;}if(S.tool==='line'||S.tool==='rect'){S.lineStart={sx:coord.sx,sy:coord.sy,col};S.preSnap=off.getImageData(0,0,64,64);S.drawing=true;return;}S.drawing=true;S.lastCoord=coord;saveHistory(S.tool==='eraser'?'Gomme':'Dessin');paintBrush(coord,col);renderAll();}
function onMove(e){const coord=getCC(e);if(coord)document.getElementById('statusCoords').textContent=`X: ${coord.lx} Y: ${coord.ly}`;if(!S.drawing||!coord)return;const col=e.buttons===2?S.secondary:S.primary;if(S.tool==='line'&&S.lineStart&&S.preSnap){off.putImageData(S.preSnap,0,0);bresenham(S.lineStart.sx,S.lineStart.sy,coord.sx,coord.sy,S.lineStart.col,S.opacity);renderAll();return;}if(S.tool==='rect'&&S.lineStart&&S.preSnap){off.putImageData(S.preSnap,0,0);const uv=activeUV();if(!uv)return;const[x0,y0,x1,y1]=[S.lineStart.sx,S.lineStart.sy,coord.sx,coord.sy],[mnX,mxX]=[Math.min(x0,x1),Math.max(x0,x1)],[mnY,mxY]=[Math.min(y0,y1),Math.max(y0,y1)];for(let y=mnY;y<=mxY;y++)for(let x=mnX;x<=mxX;x++)if(x>=uv.x&&x<uv.x+uv.w&&y>=uv.y&&y<uv.y+uv.h)if(y===mnY||y===mxY||x===mnX||x===mxX)paintPx(x,y,S.lineStart.col,S.opacity);renderAll();return;}if(S.tool==='pencil'||S.tool==='eraser'){if(S.lastCoord)bresenham(S.lastCoord.sx,S.lastCoord.sy,coord.sx,coord.sy,S.tool==='eraser'?'erase':col,S.opacity);paintBrush(coord,S.tool==='eraser'?'erase':col);S.lastCoord=coord;renderAll();}}
function onUp(){if(S.drawing&&(S.tool==='line'||S.tool==='rect'))saveHistory(S.tool==='line'?'Ligne':'Rectangle');S.drawing=false;S.lineStart=null;S.preSnap=null;S.lastCoord=null;}
function paintBrush(coord,col){const sz=S.brushSize;for(let dy=0;dy<sz;dy++)for(let dx=0;dx<sz;dx++)paintPx(coord.sx+dx,coord.sy+dy,col,S.opacity);}

// ── ZOOM ──────────────────────────────────────────────
function zoomIn(){S.zoom=Math.min(24,S.zoom+(S.zoom<8?1:2));renderAll();}
function zoomOut(){S.zoom=Math.max(2,S.zoom-(S.zoom<=8?1:2));renderAll();}
document.getElementById('zoomIn').addEventListener('click',zoomIn);
document.getElementById('zoomOut').addEventListener('click',zoomOut);
document.getElementById('zoomReset').addEventListener('click',()=>{S.zoom=8;renderAll();});

// ── IMPORT/EXPORT ─────────────────────────────────────
const importZone=document.getElementById('importZone'),fileInput=document.getElementById('fileInput');
importZone.addEventListener('click',()=>fileInput.click());
importZone.addEventListener('dragover',e=>{e.preventDefault();importZone.classList.add('drag-over');});
importZone.addEventListener('dragleave',()=>importZone.classList.remove('drag-over'));
importZone.addEventListener('drop',e=>{e.preventDefault();importZone.classList.remove('drag-over');if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0]);});
fileInput.addEventListener('change',e=>{if(e.target.files[0])loadFile(e.target.files[0]);});
function loadFile(file){const r=new FileReader();r.onload=ev=>{const img=new Image();img.onload=()=>{if(img.width!==64||(img.height!==64&&img.height!==32)){notify(`✗ Taille invalide: ${img.width}×${img.height}`);return;}off.clearRect(0,0,64,64);off.drawImage(img,0,0);saveHistory('Import');renderAll();notify(`✓ Skin importé (${img.width}×${img.height})`);};img.src=ev.target.result;};r.readAsDataURL(file);}
document.getElementById('exportBtn').addEventListener('click',()=>{const a=document.createElement('a');a.download='skin_minecraft.png';a.href=offscreen.toDataURL('image/png');a.click();notify('✓ Skin exporté !');});

// ── UI BINDINGS ───────────────────────────────────────
document.querySelectorAll('.part-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.part-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');S.part=btn.dataset.part;document.getElementById('statusPart').textContent=PART_LABELS[S.part]||S.part;if(S.part==='full'){S.view='full';document.querySelectorAll('.ctab').forEach(t=>t.classList.toggle('active',t.dataset.view==='full'));}else{S.view='edit';document.querySelectorAll('.ctab').forEach(t=>t.classList.toggle('active',t.dataset.view==='edit'));buildFaceTabs();}renderAll();});});
function buildFaceTabs(){const el=document.getElementById('faceTabs');el.innerHTML='';if(S.part==='full'){el.innerHTML='<span style="font-size:10px;color:var(--lime);font-family:var(--font-mono)">✦ Édition complète du skin 64×64</span>';return;}const prt=UV[S.part];if(!prt)return;const lyr=prt[S.layer]||prt.base,faces=Object.keys(lyr);const labels={front:'↑ Avant',back:'↓ Arrière',right:'→ Droit',left:'← Gauche',top:'⬆ Dessus',bottom:'⬇ Dessous'};faces.forEach(f=>{const b=document.createElement('button');b.className='face-tab'+(f===S.face?' active':'');b.textContent=labels[f]||f;b.addEventListener('click',()=>{S.face=f;document.querySelectorAll('.face-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderEdit();});el.appendChild(b);});if(!faces.includes(S.face))S.face=faces[0];}
document.querySelectorAll('.tool-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.tool-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');S.tool=btn.dataset.tool;const names={pencil:'Crayon',eraser:'Gomme',fill:'Remplir',eyedropper:'Pipette',line:'Ligne',rect:'Rectangle'};document.getElementById('statusTool').textContent=names[S.tool]||S.tool;});});
document.querySelectorAll('.layer-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.layer-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');S.layer=btn.dataset.layer;buildFaceTabs();renderAll();});});
document.getElementById('inputPrimary').addEventListener('input',e=>setPrimary(e.target.value));
document.getElementById('inputSecondary').addEventListener('input',e=>setSecondary(e.target.value));
document.getElementById('swapBtn').addEventListener('click',()=>{const t=S.primary;setPrimary(S.secondary);setSecondary(t);});
document.getElementById('brushSize').addEventListener('input',e=>{S.brushSize=+e.target.value;document.getElementById('brushSizeVal').textContent=e.target.value;});
document.getElementById('opacitySlider').addEventListener('input',e=>{S.opacity=+e.target.value/100;document.getElementById('opacityVal').textContent=e.target.value;});
document.getElementById('showGrid').addEventListener('change',e=>{S.showGrid=e.target.checked;renderAll();});
document.querySelectorAll('.stype-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.stype-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');S.skinType=btn.dataset.type;renderPreview();if(threeReady)rebuildCharacter();});});
document.querySelectorAll('.view-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.view-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');S.previewFace=btn.dataset.face;renderPreview();});});
document.querySelectorAll('.ctab').forEach(tab=>{tab.addEventListener('click',()=>{document.querySelectorAll('.ctab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');S.view=tab.dataset.view;if(S.view==='edit')renderEdit();else if(S.view==='full')renderFull();});});
document.getElementById('undoBtn').addEventListener('click',undo);
document.getElementById('redoBtn').addEventListener('click',redo);
document.getElementById('clearBtn').addEventListener('click',()=>{if(!confirm('Vider la zone ?'))return;saveHistory('Vider zone');clearRegion();renderAll();notify('✓ Zone vidée');});

// Édition globale
document.getElementById('btnFlipH').addEventListener('click',()=>{saveHistory('Miroir H');applyFlipH();renderAll();notify('✓ Miroir H');});
document.getElementById('btnFlipV').addEventListener('click',()=>{saveHistory('Miroir V');applyFlipV();renderAll();notify('✓ Miroir V');});
document.getElementById('btnColorize').addEventListener('click',()=>{saveHistory('Coloriser');colorize(S.primary);renderAll();notify('✓ Colorisé');});
document.getElementById('btnReplaceColor').addEventListener('click',()=>{saveHistory('Remplacer couleur');replaceColor(S.secondary,S.primary);renderAll();notify('✓ Couleur remplacée');});
document.getElementById('hueShiftSlider').addEventListener('input',e=>{document.getElementById('hueShiftVal').textContent=e.target.value+'°';});
document.getElementById('btnHueApply').addEventListener('click',()=>{const v=parseInt(document.getElementById('hueShiftSlider').value);saveHistory('Teinte +'+v);applyHueShift(v);renderAll();notify('✓ Teinte');});
document.getElementById('brightnessSlider').addEventListener('input',e=>{document.getElementById('brightnessVal').textContent=e.target.value;});
document.getElementById('btnBrightnessApply').addEventListener('click',()=>{saveHistory('Luminosité');applyBrightness(parseFloat(document.getElementById('brightnessSlider').value));renderAll();notify('✓ Luminosité');});
document.getElementById('saturationSlider').addEventListener('input',e=>{document.getElementById('saturationVal').textContent=e.target.value;});
document.getElementById('btnSaturationApply').addEventListener('click',()=>{saveHistory('Saturation');applySaturation(parseFloat(document.getElementById('saturationSlider').value));renderAll();notify('✓ Saturation');});
document.getElementById('contrastSlider').addEventListener('input',e=>{document.getElementById('contrastVal').textContent=e.target.value;});
document.getElementById('btnContrastApply').addEventListener('click',()=>{saveHistory('Contraste');applyContrast(parseInt(document.getElementById('contrastSlider').value));renderAll();notify('✓ Contraste');});

document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const map={p:'pencil',e:'eraser',f:'fill',i:'eyedropper',l:'line',r:'rect'};if(map[e.key?.toLowerCase()]){const t=map[e.key.toLowerCase()];S.tool=t;document.querySelectorAll('.tool-btn').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));const names={pencil:'Crayon',eraser:'Gomme',fill:'Remplir',eyedropper:'Pipette',line:'Ligne',rect:'Rectangle'};document.getElementById('statusTool').textContent=names[t]||t;}if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){e.preventDefault();redo();}if(e.key==='+')zoomIn();if(e.key==='-')zoomOut();});

let notifTimer;
function notify(msg){document.getElementById('notifText').textContent=msg;document.getElementById('notif').classList.add('show');clearTimeout(notifTimer);notifTimer=setTimeout(()=>document.getElementById('notif').classList.remove('show'),2400);}

// ══════════════════════════════════════════════════════
// THREE.JS 3D
// ══════════════════════════════════════════════════════
let threeReady=false,threeScene,threeCamera,threeRenderer,character={},skinTex=null,animFrame=null,currentAnim='idle',animTime=0,animClock=null;
let spherical={theta:0.3,phi:1.1,r:6};

// Pré-chargement immédiat en background dès le chargement de la page
let THREE=null;
(function preloadThree(){const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.async=true;s.onload=()=>{THREE=window.THREE;console.log('%c THREE.JS prêt ','background:#38f7d7;color:#000;font-size:11px');};document.head.appendChild(s);})();

document.getElementById('btn3D').addEventListener('click',open3D);
document.getElementById('close3DBtn').addEventListener('click',close3D);
function open3D(){document.getElementById('view3d').classList.add('open');if(threeReady){updateSkinTexture();startAnimLoop();return;}if(THREE){buildScene();return;}const wait=setInterval(()=>{if(window.THREE){THREE=window.THREE;clearInterval(wait);buildScene();}},30);}
function close3D(){document.getElementById('view3d').classList.remove('open');stopAnimLoop();}

function buildScene(){
  const mount=document.getElementById('threejs-mount');
  const W=mount.clientWidth||800,H=mount.clientHeight||500;
  threeScene=new THREE.Scene();threeScene.background=new THREE.Color(0x0a0b0d);threeScene.fog=new THREE.FogExp2(0x0a0b0d,0.035);
  threeScene.add(new THREE.GridHelper(20,20,0x252b38,0x1a1e28)).position.y=-2;
  threeScene.add(new THREE.AmbientLight(0xffffff,0.65));
  const dL=new THREE.DirectionalLight(0xb8ffa0,1.0);dL.position.set(5,8,5);threeScene.add(dL);
  const rL=new THREE.DirectionalLight(0x40e0d0,0.35);rL.position.set(-4,2,-4);threeScene.add(rL);
  threeCamera=new THREE.PerspectiveCamera(40,W/H,0.1,100);
  updateCamera();
  threeRenderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  threeRenderer.setSize(W,H);threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  mount.innerHTML='';mount.appendChild(threeRenderer.domElement);
  setupOrbit(mount);buildCharacter();
  animClock={last:performance.now()};threeReady=true;
  window.addEventListener('resize',()=>{const W2=mount.clientWidth,H2=mount.clientHeight;threeCamera.aspect=W2/H2;threeCamera.updateProjectionMatrix();threeRenderer.setSize(W2,H2);});
  startAnimLoop();
}

function mkMesh(w,h,d,uvs,mat){const geo=new THREE.BoxGeometry(w,h,d);setBoxUV(geo,uvs);return new THREE.Mesh(geo,mat);}

function buildCharacter(){
  skinTex=new THREE.CanvasTexture(offscreen);skinTex.magFilter=THREE.NearestFilter;skinTex.minFilter=THREE.NearestFilter;
  const mat=new THREE.MeshLambertMaterial({map:skinTex,transparent:true,alphaTest:0.1});
  const armW=S.skinType==='alex'?0.375:0.5;
  const group=new THREE.Group();group.position.y=-1.5;threeScene.add(group);
  
  const head=mkMesh(1,1,1,{front:{x:8,y:8,w:8,h:8},back:{x:24,y:8,w:8,h:8},right:{x:0,y:8,w:8,h:8},left:{x:16,y:8,w:8,h:8},top:{x:8,y:0,w:8,h:8},bottom:{x:16,y:0,w:8,h:8}},mat);head.position.y=2.25;group.add(head);
  const headOv=mkMesh(1.12,1.12,1.12,{front:{x:40,y:8,w:8,h:8},back:{x:56,y:8,w:8,h:8},right:{x:32,y:8,w:8,h:8},left:{x:48,y:8,w:8,h:8},top:{x:40,y:0,w:8,h:8},bottom:{x:48,y:0,w:8,h:8}},mat);headOv.position.y=2.25;group.add(headOv);
  const body=mkMesh(1,1.5,0.5,{front:{x:20,y:20,w:8,h:12},back:{x:32,y:20,w:8,h:12},right:{x:16,y:20,w:4,h:12},left:{x:28,y:20,w:4,h:12},top:{x:20,y:16,w:8,h:4},bottom:{x:28,y:16,w:8,h:4}},mat);body.position.y=1.25;group.add(body);
  
  const armRPivot=new THREE.Group();armRPivot.position.set(-(0.5+armW/2+0.06),2.0,0);group.add(armRPivot);
  const armR=mkMesh(armW,1.5,0.5,{front:{x:44,y:20,w:4,h:12},back:{x:52,y:20,w:4,h:12},right:{x:40,y:20,w:4,h:12},left:{x:48,y:20,w:4,h:12},top:{x:44,y:16,w:4,h:4},bottom:{x:48,y:16,w:4,h:4}},mat);armR.position.y=-0.75;armRPivot.add(armR);
  const armLPivot=new THREE.Group();armLPivot.position.set(0.5+armW/2+0.06,2.0,0);group.add(armLPivot);
  const armL=mkMesh(armW,1.5,0.5,{front:{x:28,y:52,w:4,h:12},back:{x:36,y:52,w:4,h:12},right:{x:24,y:52,w:4,h:12},left:{x:32,y:52,w:4,h:12},top:{x:28,y:48,w:4,h:4},bottom:{x:32,y:48,w:4,h:4}},mat);armL.position.y=-0.75;armLPivot.add(armL);
  const legRPivot=new THREE.Group();legRPivot.position.set(-0.26,0.5,0);group.add(legRPivot);
  const legR=mkMesh(0.5,1.5,0.5,{front:{x:4,y:20,w:4,h:12},back:{x:12,y:20,w:4,h:12},right:{x:0,y:20,w:4,h:12},left:{x:8,y:20,w:4,h:12},top:{x:4,y:16,w:4,h:4},bottom:{x:8,y:16,w:4,h:4}},mat);legR.position.y=-0.75;legRPivot.add(legR);
  const legLPivot=new THREE.Group();legLPivot.position.set(0.26,0.5,0);group.add(legLPivot);
  const legL=mkMesh(0.5,1.5,0.5,{front:{x:20,y:52,w:4,h:12},back:{x:28,y:52,w:4,h:12},right:{x:16,y:52,w:4,h:12},left:{x:24,y:52,w:4,h:12},top:{x:20,y:48,w:4,h:4},bottom:{x:24,y:48,w:4,h:4}},mat);legL.position.y=-0.75;legLPivot.add(legL);

  // ── PIOCHE DIAMANT ────────────────────────────────────
  const pGroup=new THREE.Group();
  const hMat=new THREE.MeshLambertMaterial({color:0x7B4A2D});
  const hGeo=new THREE.BoxGeometry(0.07,0.85,0.07);pGroup.add(Object.assign(new THREE.Mesh(hGeo,hMat),{position:{x:0,y:-0.05,z:0}}));
  const dMat=new THREE.MeshLambertMaterial({color:0x4dd0e1,emissive:0x0a5560,emissiveIntensity:0.5});
  const dGeo=new THREE.BoxGeometry(0.58,0.1,0.1);const ph=new THREE.Mesh(dGeo,dMat);ph.position.set(0.05,0.37,0);ph.rotation.z=0.35;pGroup.add(ph);
  const tipMat=new THREE.MeshLambertMaterial({color:0x80deea,emissive:0x1a8a9a,emissiveIntensity:0.7});
  const tg=new THREE.BoxGeometry(0.09,0.22,0.08);const tL=new THREE.Mesh(tg,tipMat);tL.position.set(-0.22,0.44,0);tL.rotation.z=0.55;pGroup.add(tL);const tR=new THREE.Mesh(tg,tipMat);tR.position.set(0.28,0.44,0);tR.rotation.z=-0.25;pGroup.add(tR);
  pGroup.position.set(0.2,-0.55,0.35);pGroup.rotation.set(-0.2,0,0.75);pGroup.visible=false;armRPivot.add(pGroup);

  // ── BOUCLIER ──────────────────────────────────────────
  const sGroup=new THREE.Group();
  const sbMat=new THREE.MeshLambertMaterial({color:0x6B3A1F});
  sGroup.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.72,0.95,0.07),sbMat),{}));
  const borderMat=new THREE.MeshLambertMaterial({color:0xbbbbbb});
  [[0,-0.46,0.05,0.72,0.06,0.06],[0,0.46,0.05,0.72,0.06,0.06],[-0.4,0,0.05,0.06,0.95,0.06],[0.4,0,0.05,0.06,0.95,0.06]].forEach(([x,y,z,w,h,d])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),borderMat);b.position.set(x,y,z);sGroup.add(b);});
  const eMat=new THREE.MeshLambertMaterial({color:0xcc2000,emissive:0x330000,emissiveIntensity:0.4});
  const emb=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.32,0.07),eMat);emb.position.set(0,0,0.07);sGroup.add(emb);
  sGroup.position.set(0.16,-0.48,-0.42);sGroup.rotation.set(0,-0.28,0);sGroup.visible=false;armLPivot.add(sGroup);

  // ── BLOC DE PIERRE ────────────────────────────────────
  const bGroup=new THREE.Group();
  const stoneMat=new THREE.MeshLambertMaterial({color:0x888888});
  bGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.85,0.85,0.85),stoneMat));
  const cMat=new THREE.MeshLambertMaterial({color:0x444444});
  [[0,0,0.43,0.4,0.055,0.02],[-0.1,-0.15,0.43,0.055,0.38,0.02],[0.15,0.1,0.43,0.055,0.2,0.02]].forEach(([x,y,z,w,h,d])=>{const c=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),cMat);c.position.set(x,y,z);bGroup.add(c);});
  bGroup.position.set(-0.3,-1.85,0.9);bGroup.visible=false;group.add(bGroup);

  character={group,head,headOv,body,armR,armL,armRPivot,armLPivot,legR,legL,legRPivot,legLPivot,pickaxeGroup:pGroup,shieldGroup:sGroup,blockGroup:bGroup,mat};
}

function setBoxUV(geo,uvMap){const uv=geo.attributes.uv,S64=1/64;const faceUVs=[uvMap.right,uvMap.left,uvMap.top,uvMap.bottom,uvMap.front,uvMap.back];faceUVs.forEach((f,fi)=>{if(!f)return;const u0=f.x*S64,v1=1-f.y*S64,u1=(f.x+f.w)*S64,v0=1-(f.y+f.h)*S64,base=fi*4;uv.setXY(base+0,u0,v1);uv.setXY(base+1,u1,v1);uv.setXY(base+2,u0,v0);uv.setXY(base+3,u1,v0);});uv.needsUpdate=true;}
function rebuildCharacter(){if(!threeScene||!character.group)return;threeScene.remove(character.group);character={};buildCharacter();}
function updateSkinTexture(){if(skinTex)skinTex.needsUpdate=true;}

document.querySelectorAll('.anim-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.anim-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');currentAnim=btn.dataset.anim;animTime=0;if(character.pickaxeGroup)character.pickaxeGroup.visible=(currentAnim==='mine');if(character.shieldGroup)character.shieldGroup.visible=(currentAnim==='shield');if(character.blockGroup)character.blockGroup.visible=(currentAnim==='mine');if(character.group)character.group.rotation.set(0,0,0);});});

function applyAnimation(dt){
  if(!character.head)return;animTime+=dt;const t=animTime;
  const{group,head,headOv,body,armRPivot,armLPivot,legRPivot,legLPivot,blockGroup}=character;
  armRPivot.rotation.set(0,0,0);armLPivot.rotation.set(0,0,0);legRPivot.rotation.set(0,0,0);legLPivot.rotation.set(0,0,0);
  head.rotation.set(0,0,0);body.rotation.set(0,0,0);group.position.y=-1.5;
  switch(currentAnim){
    case'idle':group.position.y=-1.5+Math.sin(t*1.2)*0.04;armRPivot.rotation.z=0.06+Math.sin(t*0.8)*0.02;armLPivot.rotation.z=-0.06-Math.sin(t*0.8)*0.02;head.rotation.y=Math.sin(t*0.5)*0.08;break;
    case'walk':{const sw=Math.sin(t*3)*0.6;armRPivot.rotation.x=sw;armLPivot.rotation.x=-sw;legRPivot.rotation.x=-sw*0.8;legLPivot.rotation.x=sw*0.8;group.position.y=-1.5+Math.abs(Math.sin(t*6))*0.06;head.rotation.y=Math.sin(t*1.5)*0.06;break;}
    case'run':{const sw=Math.sin(t*6)*1.1;armRPivot.rotation.x=sw;armLPivot.rotation.x=-sw;legRPivot.rotation.x=-sw;legLPivot.rotation.x=sw;body.rotation.x=0.15+Math.sin(t*12)*0.04;group.position.y=-1.5+Math.abs(Math.sin(t*12))*0.14;head.rotation.x=-0.12;armRPivot.rotation.z=0.15;armLPivot.rotation.z=-0.15;break;}
    case'jump':{const ph=(t%1.2)/1.2;group.position.y=-1.5+(ph<0.5?Math.sin(ph*Math.PI*2)*1.2:0);armRPivot.rotation.x=-1.0;armLPivot.rotation.x=-1.0;armRPivot.rotation.z=0.5;armLPivot.rotation.z=-0.5;legRPivot.rotation.x=-0.5;legLPivot.rotation.x=-0.5;break;}
    case'sneak':group.position.y=-1.85;body.rotation.x=0.42;head.rotation.x=-0.42;armRPivot.rotation.x=0.4+Math.sin(t*2)*0.15;armRPivot.rotation.z=0.3;armLPivot.rotation.x=0.4-Math.sin(t*2)*0.15;armLPivot.rotation.z=-0.3;legRPivot.rotation.x=-0.3+Math.sin(t*2)*0.2;legLPivot.rotation.x=-0.3-Math.sin(t*2)*0.2;break;
    case'swim':group.rotation.x=1.3;group.position.y=-1.0+Math.sin(t*1.5)*0.1;head.rotation.x=-1.3;armRPivot.rotation.x=-Math.PI/2+Math.sin(t*3)*0.3;armRPivot.rotation.z=Math.sin(t*3)*0.3;armLPivot.rotation.x=-Math.PI/2-Math.sin(t*3)*0.3;armLPivot.rotation.z=-Math.sin(t*3)*0.3;legRPivot.rotation.x=Math.sin(t*4)*0.4;legLPivot.rotation.x=-Math.sin(t*4)*0.4;break;
    case'dance':group.rotation.y+=dt*1.5;group.position.y=-1.5+Math.sin(t*4)*0.15;armRPivot.rotation.x=Math.sin(t*4)*0.8;armRPivot.rotation.z=0.3+Math.cos(t*4)*0.4;armLPivot.rotation.x=-Math.sin(t*4)*0.8;armLPivot.rotation.z=-(0.3+Math.cos(t*4)*0.4);legRPivot.rotation.x=Math.sin(t*4)*0.3;legLPivot.rotation.x=-Math.sin(t*4)*0.3;head.rotation.z=Math.sin(t*2)*0.2;break;
    case'attack':{const ph=(t%0.8)/0.8;armRPivot.rotation.x=Math.sin(ph*Math.PI*2)*-1.8;armRPivot.rotation.z=0.2+Math.sin(ph*Math.PI)*0.3;body.rotation.y=Math.sin(ph*Math.PI)*0.25;head.rotation.y=Math.sin(ph*Math.PI)*0.2;break;}
    case'mine':{const ph=(t%0.65)/0.65,sw=Math.sin(ph*Math.PI*2);armRPivot.rotation.x=-0.4+sw*-1.5;armRPivot.rotation.z=-0.15;armRPivot.rotation.y=0.1+Math.sin(ph*Math.PI)*0.08;body.rotation.x=0.1+sw*0.18;body.rotation.y=-0.18+Math.sin(ph*Math.PI)*0.1;head.rotation.x=-0.18-sw*0.08;legRPivot.rotation.x=0.18;legLPivot.rotation.x=-0.18;group.position.y=-1.5+Math.abs(sw)*0.06;if(blockGroup){if(sw>0.75){blockGroup.rotation.x=Math.random()*0.06;blockGroup.rotation.z=Math.random()*0.06;}else blockGroup.rotation.set(0,0,0);}break;}
    case'shield':armLPivot.rotation.x=-0.18;armLPivot.rotation.z=-0.52;armLPivot.rotation.y=0.38;armLPivot.rotation.x+=Math.sin(t*2)*0.04;armRPivot.rotation.x=-0.38;armRPivot.rotation.z=0.12;body.rotation.y=Math.sin(t*0.8)*0.06;head.rotation.y=Math.sin(t*0.8)*0.06+0.14;group.position.y=-1.5+Math.sin(t*1.5)*0.03;break;
  }
  headOv.rotation.x=head.rotation.x;headOv.rotation.y=head.rotation.y;headOv.rotation.z=head.rotation.z;
}

function setupOrbit(mount){let drag=false,lx=0,ly=0;mount.addEventListener('mousedown',e=>{drag=true;lx=e.clientX;ly=e.clientY;});window.addEventListener('mouseup',()=>drag=false);window.addEventListener('mousemove',e=>{if(!drag)return;spherical.theta-=(e.clientX-lx)*0.008;spherical.phi=Math.max(0.1,Math.min(Math.PI*0.88,spherical.phi+(e.clientY-ly)*0.008));lx=e.clientX;ly=e.clientY;updateCamera();});mount.addEventListener('wheel',e=>{spherical.r=Math.max(2,Math.min(12,spherical.r+e.deltaY*0.01));updateCamera();e.preventDefault();},{passive:false});}
function updateCamera(){const{theta,phi,r}=spherical;threeCamera.position.set(r*Math.sin(phi)*Math.sin(theta),r*Math.cos(phi)+1,r*Math.sin(phi)*Math.cos(theta));threeCamera.lookAt(0,1,0);}
function startAnimLoop(){stopAnimLoop();function loop(now){animFrame=requestAnimationFrame(loop);const dt=Math.min((now-animClock.last)/1000,0.05);animClock.last=now;applyAnimation(dt);threeRenderer.render(threeScene,threeCamera);}animFrame=requestAnimationFrame(loop);}
function stopAnimLoop(){if(animFrame){cancelAnimationFrame(animFrame);animFrame=null;}}

// ── INIT ──────────────────────────────────────────────
initSkin();buildPalette();buildFaceTabs();setPrimary('#a8ff3e');setSecondary('#1e232e');saveHistory('Nouveau skin');renderAll();
document.querySelector('[data-anim="idle"]')?.classList.add('active');
console.log('%c SKINCRAFT v3.0 ','background:#a8ff3e;color:#0a0b0d;font-weight:bold;font-size:14px;padding:4px 10px;border-radius:3px');
