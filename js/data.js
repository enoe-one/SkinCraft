'use strict';

const UV = {
  head: {
    base: {
      front:  {x:8,  y:8,  w:8, h:8},
      back:   {x:24, y:8,  w:8, h:8},
      right:  {x:0,  y:8,  w:8, h:8},
      left:   {x:16, y:8,  w:8, h:8},
      top:    {x:8,  y:0,  w:8, h:8},
      bottom: {x:16, y:0,  w:8, h:8},
    },
    overlay: {
      front:  {x:40, y:8,  w:8, h:8},
      back:   {x:56, y:8,  w:8, h:8},
      right:  {x:32, y:8,  w:8, h:8},
      left:   {x:48, y:8,  w:8, h:8},
      top:    {x:40, y:0,  w:8, h:8},
      bottom: {x:48, y:0,  w:8, h:8},
    },
  },
  body: {
    base: {
      front:  {x:20, y:20, w:8, h:12},
      back:   {x:32, y:20, w:8, h:12},
      right:  {x:16, y:20, w:4, h:12},
      left:   {x:28, y:20, w:4, h:12},
      top:    {x:20, y:16, w:8, h:4},
      bottom: {x:28, y:16, w:8, h:4},
    },
    overlay: {
      front:  {x:20, y:36, w:8, h:12},
      back:   {x:32, y:36, w:8, h:12},
      right:  {x:16, y:36, w:4, h:12},
      left:   {x:28, y:36, w:4, h:12},
    },
  },
  arm_right: {
    base: {
      front:  {x:44, y:20, w:4, h:12},
      back:   {x:52, y:20, w:4, h:12},
      right:  {x:40, y:20, w:4, h:12},
      left:   {x:48, y:20, w:4, h:12},
      top:    {x:44, y:16, w:4, h:4},
      bottom: {x:48, y:16, w:4, h:4},
    },
    overlay: {
      front:  {x:44, y:36, w:4, h:12},
      back:   {x:52, y:36, w:4, h:12},
      right:  {x:40, y:36, w:4, h:12},
      left:   {x:48, y:36, w:4, h:12},
    },
  },
  arm_left: {
    base: {
      front:  {x:28, y:52, w:4, h:12},
      back:   {x:36, y:52, w:4, h:12},
      right:  {x:24, y:52, w:4, h:12},
      left:   {x:32, y:52, w:4, h:12},
      top:    {x:28, y:48, w:4, h:4},
      bottom: {x:32, y:48, w:4, h:4},
    },
    overlay: {
      front:  {x:44, y:52, w:4, h:12},
      back:   {x:52, y:52, w:4, h:12},
      right:  {x:40, y:52, w:4, h:12},
      left:   {x:48, y:52, w:4, h:12},
    },
  },
  leg_right: {
    base: {
      front:  {x:4,  y:20, w:4, h:12},
      back:   {x:12, y:20, w:4, h:12},
      right:  {x:0,  y:20, w:4, h:12},
      left:   {x:8,  y:20, w:4, h:12},
      top:    {x:4,  y:16, w:4, h:4},
      bottom: {x:8,  y:16, w:4, h:4},
    },
    overlay: {
      front:  {x:4,  y:36, w:4, h:12},
      back:   {x:12, y:36, w:4, h:12},
      right:  {x:0,  y:36, w:4, h:12},
      left:   {x:8,  y:36, w:4, h:12},
    },
  },
  leg_left: {
    base: {
      front:  {x:20, y:52, w:4, h:12},
      back:   {x:28, y:52, w:4, h:12},
      right:  {x:16, y:52, w:4, h:12},
      left:   {x:24, y:52, w:4, h:12},
      top:    {x:20, y:48, w:4, h:4},
      bottom: {x:24, y:48, w:4, h:4},
    },
    overlay: {
      front:  {x:4,  y:52, w:4, h:12},
      back:   {x:12, y:52, w:4, h:12},
      right:  {x:0,  y:52, w:4, h:12},
      left:   {x:8,  y:52, w:4, h:12},
    },
  },
};

const PART_LABELS = {
  head: 'Tête', body: 'Corps',
  arm_right: 'Bras D.', arm_left: 'Bras G.',
  leg_right: 'Jambe D.', leg_left: 'Jambe G.',
  full: 'Skin entier',
};
const FACE_ORDER  = ['front','back','right','left','top','bottom'];
const FACE_LABELS = {
  front:'↑ Avant', back:'↓ Arrière',
  right:'→ Droit', left:'← Gauche',
  top:'⬆ Dessus', bottom:'⬇ Dessous',
};
const TOOL_LABELS = {
  pencil:'Crayon', eraser:'Gomme', fill:'Remplir',
  eyedropper:'Pipette', line:'Ligne', rect:'Rectangle',
};

const PALETTE = [
  '#000000','#222222','#444444','#666666','#888888','#aaaaaa','#cccccc','#ffffff',
  '#ffcfc7','#ff8c80','#ff3333','#cc0000','#800000','#4d1010','#330000','#ff6622',
  '#ffd97a','#ffc200','#ff9900','#cc6600','#884400','#553300','#331a00','#ffe033',
  '#d4ff99','#99ff33','#55cc00','#2e8800','#1a5200','#0d2b00','#ccffcc','#00ff55',
  '#88ffee','#00ffcc','#00cc99','#008866','#004433','#002218','#ccffff','#00ffff',
  '#88ccff','#3388ff','#0055ee','#0033aa','#001a77','#000e40','#aa88ff','#6600cc',
  '#e0bbff','#aa00ff','#7700ff','#440099','#ff88cc','#ff0088','#cc0055','#880033',
  '#8B4513','#A0522D','#CD853F','#DEB887','#F5DEB3','#FAEBD7','#FFFACD','#FFF5E1',
];
