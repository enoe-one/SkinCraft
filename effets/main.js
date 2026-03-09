'use strict';

(function init() {
  initDefaultSkin();
  window.SC_skinType = S.skinType;

  buildPalette();
  buildFaceTabs();
  setC1('#a8ff3e');
  setC2('#1e232e');
  pushHistory('Nouveau skin');

  renderAll();

  initUI();
  initCanvasEvents();

  let renderer3d = null;
  window.SC_renderer3d = null;

  document.getElementById('btn3D').onclick = () => {
    const overlay = document.getElementById('v3d');
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');

    if (!renderer3d) {
      renderer3d = new Renderer3D(document.getElementById('v3d-mount'));
      window.SC_renderer3d = renderer3d;
      const loading = document.getElementById('v3dLoading');
      if (loading) setTimeout(() => loading.remove(), 200);
    }
    renderer3d.skinDirty = true;
    renderer3d.start();
  };

  document.getElementById('close3DBtn').onclick = () => {
    document.getElementById('v3d').classList.remove('open');
    document.getElementById('v3d').setAttribute('aria-hidden','true');
    if (renderer3d) renderer3d.stop();
  };

  document.querySelectorAll('.anim-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.anim-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      if (renderer3d) {
        renderer3d.anim     = btn.dataset.anim;
        renderer3d.animTime = 0;
      }
    };
  });

  console.log(
    '%c SKINCRAFT v3 %c Multi-fichiers · Canvas 2D pur · 0 dépendance ',
    'background:#a8ff3e;color:#0a0b0d;font-weight:bold;font-size:12px;padding:4px 8px',
    'background:#13161c;color:#a8ff3e;font-size:12px;padding:4px 8px'
  );
  console.log('Structure : index.html · css/main.css · js/data.js · js/renderer3d.js · js/editor.js · js/ui.js · js/main.js');
  console.log('GitHub : https://github.com/ | Licence : MIT');
})();
