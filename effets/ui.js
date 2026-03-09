'use strict';

let _toastTimer = null;
function toast(msg) {
  const el  = document.getElementById('toast');
  const txt = document.getElementById('toastMsg');
  if (!el||!txt) return;
  txt.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}
window.toast = toast;  

function setC1(c) { S.c1=c; document.getElementById('sw1').style.background=c; document.getElementById('ic1').value=c; }
function setC2(c) { S.c2=c; document.getElementById('sw2').style.background=c; document.getElementById('ic2').value=c; }
window.setC1 = setC1; window.setC2 = setC2;

function buildPalette() {
  const el = document.getElementById('palette');
  el.innerHTML = '';
  PALETTE.forEach(col => {
    const d = document.createElement('div');
    d.className = 'pal-dot';
    d.style.background = col;
    d.title = col;
    d.onclick = e => e.shiftKey ? setC2(col) : setC1(col);
    d.oncontextmenu = e => { e.preventDefault(); setC2(col); };
    el.appendChild(d);
  });
}

function buildFaceTabs() {
  const el = document.getElementById('faceTabs');
  el.innerHTML = '';
  if (S.part === 'full') {
    el.innerHTML = '<span style="font-size:10px;color:var(--lime);font-family:var(--mono)">✦ Édition complète 64×64</span>';
    return;
  }
  const p = UV[S.part]; if (!p) return;
  const l = p[S.layer] || p.base;
  const faces = Object.keys(l);
  faces.forEach(f => {
    const b = document.createElement('button');
    b.className = 'face-tab' + (f===S.face?' active':'');
    b.textContent = FACE_LABELS[f] || f;
    b.onclick = () => {
      S.face = f;
      el.querySelectorAll('.face-tab').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      renderEdit();
    };
    el.appendChild(b);
  });
  if (!faces.includes(S.face)) S.face = faces[0];
}

function updateStatus() {
  const sp = document.getElementById('sbPart');
  const st = document.getElementById('sbTool');
  if (sp) sp.textContent = PART_LABELS[S.part] || S.part;
  if (st) st.textContent = TOOL_LABELS[S.tool] || S.tool;
}

function initUI() {
  document.getElementById('undoBtn').onclick  = undo;
  document.getElementById('redoBtn').onclick  = redo;
  document.getElementById('clearBtn').onclick = () => {
    if (!confirm('Vider la zone active ?')) return;
    pushHistory('Vider');
    const uv = getRgn();
    offCtx.clearRect(uv.x,uv.y,uv.w,uv.h);
    renderAll(); toast('✓ Zone vidée');
  };

  document.getElementById('exportBtn').onclick = () => {
    const a = document.createElement('a');
    a.download = 'skin_minecraft.png';
    a.href = off.toDataURL('image/png');
    a.click();
    toast('✓ Skin exporté en PNG !');
  };

  const dz = document.getElementById('dropZone');
  const fi = document.getElementById('fileInput');
  dz.onclick   = () => fi.click();
  dz.onkeydown = e => (e.key==='Enter'||e.key===' ') && fi.click();
  dz.ondragover  = e => { e.preventDefault(); dz.classList.add('over'); };
  dz.ondragleave = () => dz.classList.remove('over');
  dz.ondrop = e => {
    e.preventDefault(); dz.classList.remove('over');
    if (e.dataTransfer.files[0]) loadSkinFile(e.dataTransfer.files[0]);
  };
  fi.onchange = e => { if (e.target.files[0]) loadSkinFile(e.target.files[0]); };

  document.getElementById('partsGrid').querySelectorAll('.part-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.part-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.part = btn.dataset.part;
      updateStatus();
      if (S.part==='full') {
        S.view='full';
        document.querySelectorAll('.ctab').forEach(t=>t.classList.toggle('active',t.dataset.view==='full'));
        renderFull();
      } else {
        S.view='edit';
        document.querySelectorAll('.ctab').forEach(t=>t.classList.toggle('active',t.dataset.view==='edit'));
        buildFaceTabs(); renderEdit();
      }
      renderPreview();
    };
  });

  document.querySelectorAll('.tgl[data-type]').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tgl[data-type]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.skinType = btn.dataset.type;
      window.SC_skinType = S.skinType;
      renderPreview();
      if (window.SC_renderer3d) window.SC_renderer3d.skinDirty = true;
    };
  });

  document.querySelectorAll('.tgl[data-layer]').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tgl[data-layer]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.layer = btn.dataset.layer;
      buildFaceTabs(); renderAll();
    };
  });

  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tool-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.tool = btn.dataset.tool;
      updateStatus();
    };
  });

  document.getElementById('brushSize').oninput = e => {
    S.brush = +e.target.value;
    document.getElementById('bsv').textContent = e.target.value;
  };
  document.getElementById('opacitySlider').oninput = e => {
    S.opacity = +e.target.value/100;
    document.getElementById('opv').textContent = e.target.value;
  };

  document.getElementById('ic1').oninput = e => setC1(e.target.value);
  document.getElementById('ic2').oninput = e => setC2(e.target.value);
  document.getElementById('swapBtn').onclick = () => { const t=S.c1; setC1(S.c2); setC2(t); };

  document.getElementById('gridToggle').onchange = e => { S.grid=e.target.checked; renderAll(); };

  document.querySelectorAll('.ctab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.ctab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      S.view = tab.dataset.view;
      if (S.view==='edit') renderEdit(); else renderFull();
    };
  });

  document.querySelectorAll('.pv-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.pv-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.pvFace = btn.dataset.face;
      renderPreview();
    };
  });

  document.getElementById('zoomIn').onclick    = () => { S.zoom=Math.min(24,S.zoom+(S.zoom<8?1:2)); renderAll(); };
  document.getElementById('zoomOut').onclick   = () => { S.zoom=Math.max(2,S.zoom-(S.zoom<=8?1:2)); renderAll(); };
  document.getElementById('zoomReset').onclick = () => { S.zoom=8; renderAll(); };

  document.getElementById('hueSlider').oninput  = e => document.getElementById('hv').textContent  = e.target.value+'°';
  document.getElementById('brSlider').oninput   = e => document.getElementById('brv').textContent  = parseFloat(e.target.value).toFixed(2);
  document.getElementById('satSlider').oninput  = e => document.getElementById('satv').textContent = parseFloat(e.target.value).toFixed(2);
  document.getElementById('ctSlider').oninput   = e => document.getElementById('ctv').textContent  = e.target.value;
  document.getElementById('tolSlider').oninput  = e => document.getElementById('tolv').textContent = e.target.value;

  document.getElementById('hueApply').onclick   = () => { pushHistory('Teinte'); applyHue(+document.getElementById('hueSlider').value); renderAll(); toast('✓ Teinte appliquée'); };
  document.getElementById('brApply').onclick    = () => { pushHistory('Luminosité'); applyBrightness(+document.getElementById('brSlider').value); renderAll(); toast('✓ Luminosité appliquée'); };
  document.getElementById('satApply').onclick   = () => { pushHistory('Saturation'); applySaturation(+document.getElementById('satSlider').value); renderAll(); toast('✓ Saturation appliquée'); };
  document.getElementById('ctApply').onclick    = () => { pushHistory('Contraste'); applyContrast(+document.getElementById('ctSlider').value); renderAll(); toast('✓ Contraste appliqué'); };
  document.getElementById('flipH').onclick      = () => { pushHistory('Miroir H'); applyFlip('h'); renderAll(); toast('✓ Miroir horizontal'); };
  document.getElementById('flipV').onclick      = () => { pushHistory('Miroir V'); applyFlip('v'); renderAll(); toast('✓ Miroir vertical'); };
  document.getElementById('colorizeBtn').onclick= () => { pushHistory('Coloriser'); applyColorize(S.c1); renderAll(); toast('✓ Colorisé'); };
  document.getElementById('replaceBtn').onclick = () => {
    pushHistory('Remplacer couleur');
    applyReplace(+document.getElementById('tolSlider').value);
    renderAll(); toast('✓ Couleur remplacée');
  };

  const zoneTag = document.getElementById('zoneTag');
  function updateZoneTag() {
    if (!zoneTag) return;
    zoneTag.textContent = S.part==='full' ? '(skin entier)' : `(${PART_LABELS[S.part]||S.part})`;
  }
  document.querySelectorAll('.part-btn').forEach(b => b.addEventListener('click', updateZoneTag));
  updateZoneTag();

  document.addEventListener('keydown', e => {
    if (e.target.tagName==='INPUT') return;
    const toolMap = {p:'pencil',e:'eraser',f:'fill',i:'eyedropper',l:'line',r:'rect'};
    const key = e.key?.toLowerCase();
    if (toolMap[key]) {
      const t = toolMap[key];
      S.tool = t;
      document.querySelectorAll('.tool-btn').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));
      updateStatus();
    }
    if ((e.ctrlKey||e.metaKey)&&e.key==='z') { e.preventDefault(); undo(); }
    if ((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))) { e.preventDefault(); redo(); }
    if (e.key==='+') { S.zoom=Math.min(24,S.zoom+(S.zoom<8?1:2)); renderAll(); }
    if (e.key==='-') { S.zoom=Math.max(2,S.zoom-(S.zoom<=8?1:2)); renderAll(); }
  });
}

function loadSkinFile(file) {
  const r = new FileReader();
  r.onload = ev => {
    const img = new Image();
    img.onload = () => {
      if (img.width!==64||(img.height!==64&&img.height!==32)) {
        toast('✗ Format invalide — PNG 64×64 requis'); return;
      }
      offCtx.clearRect(0,0,64,64);
      offCtx.drawImage(img,0,0);
      pushHistory('Import skin');
      renderAll();
      toast(`✓ Skin importé (${img.width}×${img.height})`);
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(file);
}

function initCanvasEvents() {
  const getCoord = e => {
    const r = ec.getBoundingClientRect();
    return canvas2skin(
      (e.clientX - r.left) * (ec.width  / r.width),
      (e.clientY - r.top)  * (ec.height / r.height)
    );
  };

  ec.addEventListener('mousedown', e => {
    const coord = getCoord(e); if (!coord) return;
    const col = e.button===2 ? S.c2 : S.c1;
    if (S.tool==='eyedropper') {
      const c = getPixelHex(coord.sx, coord.sy);
      if (c) { e.button===2 ? setC2(c) : setC1(c); toast(`💧 ${c}`); }
      return;
    }
    if (S.tool==='fill') {
      pushHistory('Remplissage');
      floodFill(coord.sx, coord.sy, col);
      renderAll(); return;
    }
    if (S.tool==='line'||S.tool==='rect') {
      S.lStart = { sx:coord.sx, sy:coord.sy, col };
      S.snap   = offCtx.getImageData(0,0,64,64);
      S.drawing = true; return;
    }
    S.drawing=true; S.lc=coord;
    pushHistory(S.tool==='eraser'?'Gomme':'Dessin');
    paintBrush(coord, col); renderAll();
  });

  ec.addEventListener('mousemove', e => {
    const coord = getCoord(e);
    const xy = document.getElementById('badgeXY');
    if (xy) xy.textContent = coord ? `X:${coord.lx} Y:${coord.ly}` : '—';

    if (!S.drawing||!coord) return;
    const col = e.buttons===2 ? S.c2 : S.c1;

    if (S.tool==='line'&&S.lStart&&S.snap) {
      offCtx.putImageData(S.snap,0,0);
      bresenham(S.lStart.sx,S.lStart.sy,coord.sx,coord.sy,S.lStart.col,S.opacity);
      renderAll(); return;
    }
    if (S.tool==='rect'&&S.lStart&&S.snap) {
      offCtx.putImageData(S.snap,0,0);
      const uv=activeUV(); if(!uv) return;
      const [x0,y0,x1,y1]=[S.lStart.sx,S.lStart.sy,coord.sx,coord.sy];
      const [mX,MX]=[Math.min(x0,x1),Math.max(x0,x1)];
      const [mY,MY]=[Math.min(y0,y1),Math.max(y0,y1)];
      for (let y=mY;y<=MY;y++) for (let x=mX;x<=MX;x++)
        if (x>=uv.x&&x<uv.x+uv.w&&y>=uv.y&&y<uv.y+uv.h)
          if (y===mY||y===MY||x===mX||x===MX)
            putPixel(x,y,S.lStart.col,S.opacity);
      renderAll(); return;
    }
    if (S.tool==='pencil'||S.tool==='eraser') {
      if (S.lc) bresenham(S.lc.sx,S.lc.sy,coord.sx,coord.sy,S.tool==='eraser'?'erase':col,S.opacity);
      paintBrush(coord,S.tool==='eraser'?'erase':col);
      S.lc = coord; renderAll();
    }
  });

  ec.addEventListener('mouseup', () => {
    if (S.drawing&&(S.tool==='line'||S.tool==='rect'))
      pushHistory(S.tool==='line'?'Ligne':'Rectangle');
    S.drawing=false; S.lStart=null; S.snap=null; S.lc=null;
  });

  ec.addEventListener('mouseleave', () => {
    const xy = document.getElementById('badgeXY');
    if (xy) xy.textContent = '—';
  });

  ec.addEventListener('contextmenu', e => e.preventDefault());
  ec.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.deltaY<0) { S.zoom=Math.min(24,S.zoom+(S.zoom<8?1:2)); }
    else            { S.zoom=Math.max(2,S.zoom-(S.zoom<=8?1:2));  }
    renderAll();
  }, { passive: false });
}
