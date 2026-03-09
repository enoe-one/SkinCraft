'use strict';

function getSkinCanvas() { return window.SC_offCanvas; }

class Renderer3D {
  constructor(mountEl) {
    this.mount = mountEl;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.mount.innerHTML = '';
    this.mount.appendChild(this.canvas);

    this.anim     = 'idle';
    this.animTime = 0;
    this.lastTS   = null;
    this.raf      = null;

    
    this.camTheta = 0.4;  
    this.camPhi   = 0.9;  
    this.camDist  = 5;
    this.dragging = false;
    this.lastMX   = 0;
    this.lastMY   = 0;

    this.skinDirty = true;
    this._skinData = null;

    this._bindEvents();
    this._resize();
  }

  _resize() {
    const r = this.mount.getBoundingClientRect();
    this.W = r.width  || 800;
    this.H = r.height || 500;
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
  }

  _bindEvents() {
    const c = this.canvas;
    c.addEventListener('mousedown', e => { this.dragging = true; this.lastMX = e.clientX; this.lastMY = e.clientY; });
    c.addEventListener('mousemove', e => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastMX;
      const dy = e.clientY - this.lastMY;
      this.camTheta += dx * 0.008;
      this.camPhi    = Math.max(0.2, Math.min(1.5, this.camPhi + dy * 0.006));
      this.lastMX = e.clientX; this.lastMY = e.clientY;
    });
    c.addEventListener('mouseup',   () => this.dragging = false);
    c.addEventListener('mouseleave',() => this.dragging = false);
    c.addEventListener('wheel', e => {
      e.preventDefault();
      this.camDist = Math.max(2.5, Math.min(9, this.camDist + e.deltaY * 0.01));
    }, { passive: false });

    let lastTX, lastTY;
    c.addEventListener('touchstart', e => { lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY; });
    c.addEventListener('touchmove', e => {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastTX;
      const dy = e.touches[0].clientY - lastTY;
      this.camTheta += dx * 0.01;
      this.camPhi = Math.max(0.2, Math.min(1.5, this.camPhi + dy * 0.008));
      lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY;
    }, { passive: false });
  }

  start() {
    if (this.raf) return;
    this.lastTS = null;
    const loop = (ts) => {
      if (this.lastTS !== null) {
        const dt = Math.min((ts - this.lastTS) / 1000, 0.05);
        this.animTime += dt;
      }
      this.lastTS = ts;
      this._resize();
      if (this.skinDirty) { this._skinData = null; }
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }

  project(x, y, z) {
    const ct = Math.cos(this.camTheta), st = Math.sin(this.camTheta);
    const cp = Math.cos(this.camPhi),   sp = Math.sin(this.camPhi);
    const d  = this.camDist;

    const cx = d * sp * st;
    const cy = d * cp;
    const cz = d * sp * ct;

    const fx = -sp * st, fy = -cp, fz = -sp * ct;
    const len = Math.sqrt(fx*fx+fy*fy+fz*fz) || 1;
    const fd = [fx/len, fy/len, fz/len];
    const ux = 0, uy = 1, uz = 0;
    const rx = uy*fd[2]-uz*fd[1], ry = uz*fd[0]-ux*fd[2], rz = ux*fd[1]-uy*fd[0];
    const rl = Math.sqrt(rx*rx+ry*ry+rz*rz) || 1;
    const right = [rx/rl, ry/rl, rz/rl];
    const upx = fd[1]*right[2]-fd[2]*right[1];
    const upy = fd[2]*right[0]-fd[0]*right[2];
    const upz = fd[0]*right[1]-fd[1]*right[0];

    const dx = x-cx, dy = y-cy, dz = z-cz;
    const pd  = dx*fd[0]+dy*fd[1]+dz*fd[2];
    if (pd <= 0.01) return null;
    const fov = (this.H / 2) / Math.tan(22 * Math.PI / 180);
    const px  = (dx*right[0]+dy*right[1]+dz*right[2]) / pd * fov + this.W/2;
    const py  = -(dx*upx+dy*upy+dz*upz) / pd * fov + this.H/2;
    return [px, py, pd];
  }

  getPixel(tx, ty) {
    if (!this._skinData) {
      const sc = getSkinCanvas();
      if (!sc) return 'rgba(0,0,0,0)';
      this._skinData = sc.getContext('2d').getImageData(0, 0, 64, 64).data;
      this.skinDirty = false;
    }
    const tx2 = Math.max(0, Math.min(63, tx));
    const ty2 = Math.max(0, Math.min(63, ty));
    const i = (ty2 * 64 + tx2) * 4;
    const d = this._skinData;
    return `rgba(${d[i]},${d[i+1]},${d[i+2]},${d[i+3]/255})`;
  }

  drawFaceSimple(corners, uvRect, light) {
    const ctx = this.ctx, uv = uvRect;
    if (!uv || uv.w === 0) return;
    const proj = corners.map(c => this.project(c[0], c[1], c[2]) || [0,0,0]);
    const [tl, tr, br, bl] = proj;

    const sc = getSkinCanvas();
    if (!sc) return;
    const tc = document.createElement('canvas');
    tc.width = uv.w; tc.height = uv.h;
    const tctx = tc.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    tctx.drawImage(sc, uv.x, uv.y, uv.w, uv.h, 0, 0, uv.w, uv.h);
    if (light < 1) { tctx.fillStyle = `rgba(0,0,0,${(1-light).toFixed(2)})`; tctx.fillRect(0,0,uv.w,uv.h); }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tl[0],tl[1]); ctx.lineTo(tr[0],tr[1]);
    ctx.lineTo(br[0],br[1]); ctx.lineTo(bl[0],bl[1]);
    ctx.closePath(); ctx.clip();

    const dx1=tr[0]-tl[0], dx2=bl[0]-tl[0];
    const dy1=tr[1]-tl[1], dy2=bl[1]-tl[1];
    ctx.transform(dx1/uv.w, dy1/uv.w, dx2/uv.h, dy2/uv.h, tl[0], tl[1]);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tc, 0, 0);
    ctx.restore();
  }

  drawBox({ pos, size, uvs, rx=0, ry=0, rz=0, piv }) {
    const [cx,cy,cz] = pos, [W,H,D] = size;
    const raw = [
      [-W/2,-H/2,-D/2],[W/2,-H/2,-D/2],[W/2,H/2,-D/2],[-W/2,H/2,-D/2],
      [-W/2,-H/2,D/2], [W/2,-H/2,D/2], [W/2,H/2,D/2], [-W/2,H/2,D/2],
    ];

    const rotPt = ([x,y,z]) => {
      let rx2=x-piv[0]+cx, ry2=y-piv[1]+cy, rz2=z-piv[2]+cz;
      if (rz) { const c=Math.cos(rz),s=Math.sin(rz); [rx2,ry2]=[rx2*c-ry2*s,rx2*s+ry2*c]; }
      let lx=rx2-piv[0], ly=ry2-piv[1], lz=rz2-piv[2];
      if (rx) { const c=Math.cos(rx),s=Math.sin(rx); [ly,lz]=[ly*c-lz*s,ly*s+lz*c]; }
      if (ry) { const c=Math.cos(ry),s=Math.sin(ry); [lx,lz]=[lx*c+lz*s,-lx*s+lz*c]; }
      return [lx+piv[0], ly+piv[1], lz+piv[2]];
    };

    const pts = raw.map(rotPt);
    const faces = [
      { idx:[3,2,1,0], uv:uvs.front,  l:.95 },
      { idx:[4,5,6,7], uv:uvs.back,   l:.50 },
      { idx:[7,6,2,3], uv:uvs.top,    l:1.0 },
      { idx:[0,1,5,4], uv:uvs.bottom, l:.25 },
      { idx:[4,0,3,7], uv:uvs.right,  l:.75 },
      { idx:[1,5,6,2], uv:uvs.left,   l:.68 },
    ];

    const sorted = faces.filter(f => f.uv).map(f => {
      const ctr = f.idx.reduce((a,i) => [a[0]+pts[i][0]/4, a[1]+pts[i][1]/4, a[2]+pts[i][2]/4], [0,0,0]);
      const p = this.project(ctr[0], ctr[1], ctr[2]);
      return { ...f, depth: p ? p[2] : 0 };
    }).sort((a,b) => b.depth - a.depth);

    sorted.forEach(f => this.drawFaceSimple(f.idx.map(i => pts[i]), f.uv, f.l));
  }

  getAnims() {
    const t = this.animTime, a = this.anim;
    let headRX=0, headRY=0, headRZ=0;
    let bodyRX=0, bodyRY=0;
    let armRX=0,  armRZ=.06;
    let armLX=0,  armLZ=-.06;
    let legRX=0,  legLX=0;
    let yOff=0;

    switch (a) {
      case 'walk': {
        const sw = Math.sin(t*3)*.6;
        armRX=sw; armLX=-sw; legRX=-sw*.8; legLX=sw*.8;
        yOff=Math.abs(Math.sin(t*6))*.08; headRY=Math.sin(t*1.5)*.06;
        break;
      }
      case 'run': {
        const sw = Math.sin(t*6)*1.1;
        armRX=sw; armLX=-sw; armRZ=.15; armLZ=-.15;
        legRX=-sw; legLX=sw; bodyRX=.15; headRX=-.12;
        yOff=Math.abs(Math.sin(t*12))*.14;
        break;
      }
      case 'jump': {
        const ph = (t%1.2)/1.2;
        yOff = ph<.5 ? Math.sin(ph*Math.PI*2)*1.2 : 0;
        armRX=-1; armLX=-1; armRZ=.5; armLZ=-.5; legRX=-.5; legLX=-.5;
        break;
      }
      case 'sneak': {
        yOff=-.35; bodyRX=.42; headRX=-.42;
        armRX=.4+Math.sin(t*2)*.15; armRZ=.3;
        armLX=.4-Math.sin(t*2)*.15; armLZ=-.3;
        legRX=-.3+Math.sin(t*2)*.2; legLX=-.3-Math.sin(t*2)*.2;
        break;
      }
      case 'swim': {
        bodyRX=1.3; headRX=-1.3;
        armRX=-1.57+Math.sin(t*3)*.3; armLX=-1.57-Math.sin(t*3)*.3;
        armRZ=Math.sin(t*3)*.3; armLZ=-Math.sin(t*3)*.3;
        legRX=Math.sin(t*4)*.4; legLX=-Math.sin(t*4)*.4;
        yOff=Math.sin(t*1.5)*.1;
        break;
      }
      case 'dance': {
        bodyRY=Math.sin(t*2)*.3; yOff=Math.sin(t*4)*.15;
        armRX=Math.sin(t*4)*.8; armLX=-Math.sin(t*4)*.8;
        armRZ=.3+Math.cos(t*4)*.4; armLZ=-(.3+Math.cos(t*4)*.4);
        legRX=Math.sin(t*4)*.3; legLX=-Math.sin(t*4)*.3;
        headRZ=Math.sin(t*2)*.2;
        break;
      }
      case 'attack': {
        const ph = (t%.8)/.8;
        armRX=Math.sin(ph*Math.PI*2)*-1.8; armRZ=.2+Math.sin(ph*Math.PI)*.3;
        bodyRY=Math.sin(ph*Math.PI)*.25; headRY=Math.sin(ph*Math.PI)*.2;
        break;
      }
      case 'mine': {
        const ph = (t%.65)/.65, sw = Math.sin(ph*Math.PI*2);
        armRX=-.4+sw*-1.5; armRZ=-.15;
        bodyRX=.1+sw*.18; bodyRY=-.18+Math.sin(ph*Math.PI)*.1;
        headRX=-.18-sw*.08; legRX=.18; legLX=-.18;
        yOff=Math.abs(sw)*.06;
        break;
      }
      case 'shield': {
        armLX=-.18; armLZ=-.52; armRX=-.38; armRZ=.12; headRY=.14;
        bodyRY=Math.sin(t*.8)*.06; yOff=Math.sin(t*1.5)*.03;
        break;
      }
      default: {
        yOff=Math.sin(t*1.2)*.04;
        armRZ=.06+Math.sin(t*.8)*.02; armLZ=-.06-Math.sin(t*.8)*.02;
        headRY=Math.sin(t*.5)*.08;
      }
    }
    return { headRX, headRY, headRZ, bodyRX, bodyRY, armRX, armRZ, armLX, armLZ, legRX, legLX, yOff };
  }

  draw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.clearRect(0,0,W,H);

    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0a0b0d'); bg.addColorStop(1,'#0f1318');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = '#1a1e28'; ctx.lineWidth = 1;
    for (let i=-8; i<=8; i++) {
      const p1=this.project(i*.55,-1.8,-4), p2=this.project(i*.55,-1.8,4);
      const p3=this.project(-4,-1.8,i*.55), p4=this.project(4,-1.8,i*.55);
      if (p1&&p2) { ctx.beginPath(); ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.stroke(); }
      if (p3&&p4) { ctx.beginPath(); ctx.moveTo(p3[0],p3[1]); ctx.lineTo(p4[0],p4[1]); ctx.stroke(); }
    }

    const gp = this.project(0,-1.8,0);
    if (gp) {
      const gr = ctx.createRadialGradient(gp[0],gp[1],0,gp[0],gp[1],90);
      gr.addColorStop(0,'rgba(168,255,62,.07)'); gr.addColorStop(1,'transparent');
      ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);
    }

    const a = this.getAnims();
    const yB = -1.5 + a.yOff;
    const aw = (window.SC_skinType === 'alex') ? .375 : .5;
    const bodyTop = yB + 1.25 + .75;
    const armOff  = .5 + aw/2 + .06;

    const sp = this.project(0,-1.78,0);
    if (sp) {
      ctx.save(); ctx.globalAlpha=.22; ctx.fillStyle='#000';
      ctx.beginPath(); ctx.ellipse(sp[0],sp[1],32,11,0,0,Math.PI*2);
      ctx.fill(); ctx.restore();
    }

    const armRPiv = [-armOff, bodyTop, 0];
    const armLPiv = [ armOff, bodyTop, 0];
    const legRPiv = [-0.26, yB+.5, 0];
    const legLPiv = [ 0.26, yB+.5, 0];

    const boxes = [
      { pos:[0,yB+1.25,0], size:[1,1.5,.5],    uvs:UV.body.base,     rx:a.bodyRX, ry:a.bodyRY, rz:0,        piv:[0,yB+1.25,0] },
      { pos:armRPiv.map((v,i)=>[v,-armOff===v?v-0.75:v,armRPiv[2]][i]||v), /* calcul inline ci-dessous */
        ...0 },
    ];
    const allBoxes = [
      { pos:[0,yB+1.25,0], size:[1,1.5,.5], uvs:UV.body.base, rx:a.bodyRX, ry:a.bodyRY, rz:0, piv:[0,yB+1.25,0] },
      { pos:[-armOff, bodyTop-.75, 0], size:[aw,1.5,.5], uvs:UV.arm_right.base, rx:a.armRX, ry:0, rz:a.armRZ, piv:armRPiv },
      { pos:[ armOff, bodyTop-.75, 0], size:[aw,1.5,.5], uvs:UV.arm_left.base,  rx:a.armLX, ry:0, rz:a.armLZ, piv:armLPiv },
      { pos:[-0.26, yB+.5-.75, 0], size:[.5,1.5,.5], uvs:UV.leg_right.base, rx:a.legRX, ry:0, rz:0, piv:legRPiv },
      { pos:[ 0.26, yB+.5-.75, 0], size:[.5,1.5,.5], uvs:UV.leg_left.base,  rx:a.legLX, ry:0, rz:0, piv:legLPiv },
      { pos:[0,yB+2.25,0], size:[1,1,1], uvs:UV.head.base,    rx:a.headRX, ry:a.headRY, rz:a.headRZ, piv:[0,yB+2.25,0] },
      { pos:[0,yB+2.25,0], size:[1.12,1.12,1.12], uvs:UV.head.overlay, rx:a.headRX, ry:a.headRY, rz:a.headRZ, piv:[0,yB+2.25,0] },
    ];

    allBoxes.sort((a,b) => {
      const pa = this.project(a.pos[0],a.pos[1],a.pos[2]);
      const pb = this.project(b.pos[0],b.pos[1],b.pos[2]);
      return (pa?-pa[2]:0) - (pb?-pb[2]:0);
    });
    allBoxes.forEach(b => this.drawBox(b));

    if (this.anim === 'mine')   { this.drawPickaxe(armRPiv, a.armRX, a.armRZ); this.drawStoneBlock(a.yOff); }
    if (this.anim === 'shield') { this.drawShield(armLPiv, a.armLX, a.armLZ); }

    ctx.fillStyle = 'rgba(168,255,62,.45)';
    ctx.font = '10px Consolas, monospace';
    ctx.fillText(`${this.anim.toUpperCase()} · 🖱 drag & rotate · scroll zoom`, 12, H-12);
  }

  rotateArmPt([x,y,z], pivot, rx, rz) {
    let lx=x, ly=y, lz=z;
    if (rz) { const c=Math.cos(rz),s=Math.sin(rz); [lx,ly]=[lx*c-ly*s, lx*s+ly*c]; }
    if (rx) { const c=Math.cos(rx),s=Math.sin(rx); [ly,lz]=[ly*c-lz*s, ly*s+lz*c]; }
    return [lx, ly, lz];
  }

  drawPickaxe(pivot, rx, rz) {
    const ctx = this.ctx;
    for (let i=0; i<10; i++) {
      const y = -.05 - i/10*.85;
      const rot = this.rotateArmPt([pivot[0]-.02, y, -.05], pivot, rx, rz);
      const p = this.project(rot[0]+pivot[0], rot[1]+pivot[1], rot[2]+pivot[2]);
      if (!p) continue;
      ctx.fillStyle = `rgb(${100+i*5},${70+i*2},40)`;
      ctx.fillRect(p[0]-2, p[1]-2, 4, 4);
    }
    const colors = ['#4dd0e1','#26c6da','#80deea','#b2ebf2','#4dd0e1'];
    for (let i=0; i<5; i++) {
      const u = i/5-.5;
      const rot = this.rotateArmPt([u*.55, .37, 0], pivot, rx, rz);
      const p = this.project(rot[0]+pivot[0], rot[1]+pivot[1], rot[2]+pivot[2]);
      if (!p) continue;
      ctx.fillStyle = colors[i];
      ctx.shadowColor = '#4dd0e1'; ctx.shadowBlur = 5;
      ctx.fillRect(p[0]-3, p[1]-3, 6, 6);
      ctx.shadowBlur = 0;
    }
  }

  
  drawShield(pivot, rx, rz) {
    const ctx = this.ctx;
    const pts = [[-0.35,-.4,-.3],[.35,-.4,-.3],[.35,.45,-.3],[-0.35,.45,-.3]];
    const proj = pts.map(([x,y,z]) => {
      const rot = this.rotateArmPt([x,y,z], pivot, rx, rz);
      return this.project(rot[0]+pivot[0], rot[1]+pivot[1], rot[2]+pivot[2]);
    });
    if (proj.some(p=>!p)) return;
    const [tl,tr,br,bl] = proj;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(tl[0],tl[1]); ctx.lineTo(tr[0],tr[1]); ctx.lineTo(br[0],br[1]); ctx.lineTo(bl[0],bl[1]); ctx.closePath();
    ctx.fillStyle = '#6B3A1F'; ctx.fill();
    ctx.strokeStyle = '#999'; ctx.lineWidth = 2; ctx.stroke();
    const cx2=(tl[0]+tr[0]+br[0]+bl[0])/4, cy2=(tl[1]+tr[1]+br[1]+bl[1])/4;
    ctx.fillStyle = '#cc2000'; ctx.fillRect(cx2-5,cy2-8,10,16);
    ctx.fillStyle = '#aa1500'; ctx.fillRect(cx2-8,cy2-2,16,5);
    ctx.restore();
  }

 
  drawStoneBlock(yOff) {
    const ctx = this.ctx;
    const bPos = [-0.3, -1.85+yOff*.3, 0.9];
    const corners = [
      [bPos[0]-.4,bPos[1]-.4,bPos[2]-.4],[bPos[0]+.4,bPos[1]-.4,bPos[2]-.4],
      [bPos[0]+.4,bPos[1]+.4,bPos[2]-.4],[bPos[0]-.4,bPos[1]+.4,bPos[2]-.4],
      [bPos[0]-.4,bPos[1]-.4,bPos[2]+.4],[bPos[0]+.4,bPos[1]-.4,bPos[2]+.4],
      [bPos[0]+.4,bPos[1]+.4,bPos[2]+.4],[bPos[0]-.4,bPos[1]+.4,bPos[2]+.4],
    ].map(p => this.project(p[0],p[1],p[2]));

    const facesDef = [
      { idx:[3,2,1,0], col:'rgba(136,136,136,.9)', crack:true },
      { idx:[7,6,2,3], col:'rgba(165,165,165,.9)' },
      { idx:[4,0,3,7], col:'rgba(110,110,110,.9)' },
    ];
    facesDef.forEach(({ idx, col, crack }) => {
      const ps = idx.map(i => corners[i]);
      if (ps.some(p=>!p)) return;
      ctx.save();
      ctx.beginPath(); ps.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = 'rgba(50,50,50,.5)'; ctx.lineWidth = 1; ctx.stroke();
      if (crack) {
        ctx.strokeStyle = 'rgba(60,60,60,.7)'; ctx.lineWidth = 1;
        const mx=(ps[0][0]+ps[1][0]+ps[2][0]+ps[3][0])/4;
        const my=(ps[0][1]+ps[1][1]+ps[2][1]+ps[3][1])/4;
        ctx.beginPath();
        ctx.moveTo(ps[0][0]+(ps[1][0]-ps[0][0])*.2, ps[0][1]+(ps[1][1]-ps[0][1])*.3);
        ctx.lineTo(mx, my); ctx.stroke();
      }
      ctx.restore();
    });
  }
}
