/* TabrikUZ animated icons — glossy 3D-style SVGs that replace emoji.
   TabrikIcons.svg(name, extraClass) returns inline markup; shared gradients
   are injected once. Motion lives in icons.css (transform/opacity only). */
(()=>{'use strict';
const DEFS='<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'+
 g('tiPink',['#ffb3d6','#f0609f','#b8327f'])+g('tiPurple',['#d6a8ff','#9a4fd8','#5e2a96'])+g('tiGoldV',['#fff4c4','#ffd166','#c98a1c'])+
 g('tiCream',['#fffaf0','#fbe7cf','#e8c7a6'])+g('tiBlue',['#c9f1ff','#6cc8f0','#2f86c0'])+g('tiRed',['#ff9aa8','#ff4f6d','#c2244a'])+
 g('tiMint',['#c8ffe9','#5fd8a8','#2e9c78'])+g('tiDark',['#7c5a9e','#4b2d6b','#2c1842'])+g('tiFlame',['#fffbe0','#ffd54f','#ff8a3d'])+
 '<radialGradient id="tiGloss" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".4" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
 '</defs></svg>';
function g(id,c){return '<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset=".55" stop-color="'+c[1]+'"/><stop offset="1" stop-color="'+c[2]+'"/></linearGradient>'}
const shadow=(cx=32,w=20)=>'<ellipse class="ti-shadow" cx="'+cx+'" cy="60" rx="'+w+'" ry="2.6" fill="#5b2a5a" opacity=".2"/>';
const star=(x,y,s,c,cls)=>{const k=s*.28,P=[[x,y-s],[x+k,y-k],[x+s,y],[x+k,y+k],[x,y+s],[x-k,y+k],[x-s,y],[x-k,y-k]];return '<path class="'+cls+'" d="M'+P.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L')+'Z" fill="'+c+'"/>'};
const ICONS={
 cake:shadow(32,22)+'<g class="ti-bob">'+
  '<rect x="10" y="38" width="44" height="19" rx="5" fill="url(#tiPink)"/><path d="M10 43c4 0 4 5 8 5s4-5 8-5 4 6 8 6 4-6 8-6 4 5 8 5 4-5 4-5v-2a5 5 0 0 0-5-3H15a5 5 0 0 0-5 3Z" fill="url(#tiCream)"/>'+
  '<rect x="17" y="24" width="30" height="16" rx="4" fill="url(#tiPurple)"/><path d="M17 28c3 0 3 4 6 4s3-4 6-4 3 5 6 5 3-5 6-5 3 4 6 4v-2a4 4 0 0 0-4-4H21a4 4 0 0 0-4 2Z" fill="url(#tiCream)"/>'+
  '<rect x="30" y="13" width="4" height="12" rx="1.5" fill="url(#tiBlue)"/><g class="ti-flame"><path d="M32 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8Z" fill="url(#tiFlame)"/></g>'+
  '<circle cx="22" cy="50" r="2" fill="#fff6"/><circle cx="42" cy="51" r="1.6" fill="#fff6"/><ellipse cx="18" cy="42" rx="5" ry="2" fill="url(#tiGloss)"/></g>'+
  star(52,14,4,'#ffd34d','ti-twinkle')+star(11,20,3,'#fff','ti-twinkle t2'),
 ring:shadow(32,16)+'<g class="ti-tilt"><ellipse cx="32" cy="42" rx="16" ry="12" fill="none" stroke="url(#tiGoldV)" stroke-width="6"/>'+
  '<ellipse cx="32" cy="42" rx="16" ry="12" fill="none" stroke="#fff8" stroke-width="1.4" stroke-dasharray="12 60" stroke-linecap="round"/>'+
  '<path d="M24 26 32 12 40 26 32 33Z" fill="url(#tiBlue)"/><path d="M24 26h16l-8 7Z" fill="#9fe0ff"/><path d="M28 19 32 12 34 20Z" fill="#fff" opacity=".8"/><rect x="28" y="27" width="8" height="5" rx="1.5" fill="url(#tiGoldV)"/></g>'+
  star(46,12,5,'#fff','ti-twinkle')+star(16,18,3.5,'#ffe9a3','ti-twinkle t2'),
 letter:shadow(32,22)+'<g class="ti-heart-rise"><path d="M32 30C22 22 24 12 32 18 40 12 42 22 32 30Z" fill="url(#tiRed)"/><ellipse cx="28" cy="18" rx="3" ry="2" fill="#fff9"/></g>'+
  '<g class="ti-bob"><rect x="8" y="26" width="48" height="32" rx="5" fill="url(#tiCream)"/><path d="M8 30 32 46 56 30V56H8Z" fill="#f7dcc2"/><path d="M8 56 26 41M56 56 38 41" stroke="#e0b893" stroke-width="1.6"/>'+
  '<path class="ti-flap" d="M8 30Q8 26 13 26H51Q56 26 56 30L32 44Z" fill="url(#tiPink)"/><circle cx="32" cy="42" r="4.5" fill="url(#tiRed)" stroke="#fff6" stroke-width="1"/></g>',
 cap:shadow(32,18)+'<g class="ti-hop"><path d="M18 30v12c0 5 28 5 28 0V30Z" fill="url(#tiDark)"/><path d="M4 26 32 14 60 26 32 38Z" fill="url(#tiPurple)"/><path d="M4 26 32 38 60 26 32 34Z" fill="#3a2156"/>'+
  '<circle cx="32" cy="26" r="2.6" fill="url(#tiGoldV)"/><g class="ti-tassel"><path d="M32 26 50 31V44" stroke="url(#tiGoldV)" stroke-width="2" fill="none"/><path d="M47 43h6l-1 9h-4Z" fill="url(#tiGoldV)"/></g><path d="M12 25 32 17" stroke="#fff7" stroke-width="2" stroke-linecap="round"/></g>'+
  star(10,12,3.5,'#ffd34d','ti-twinkle')+star(55,10,3,'#fff','ti-twinkle t2'),
 party:shadow(24,14)+'<g class="ti-pop"><path d="M10 58 22 22 42 42Z" fill="url(#tiGoldV)"/><path d="M14 46 30 30M17 52 36 37" stroke="#e05a9f" stroke-width="3"/><path d="M22 22 42 42" stroke="#fff6" stroke-width="2"/></g>'+
  '<g class="ti-burst"><circle class="b1" cx="40" cy="20" r="3" fill="#ff5fa2"/><rect class="b2" x="46" y="26" width="4" height="7" rx="1" fill="#7ad7ff"/><path class="b3" d="M34 10 36 14 40 15 36 16 34 20 32 16 28 15 32 14Z" fill="#ffd34d"/><circle class="b4" cx="52" cy="14" r="2.4" fill="#b07cff"/><rect class="b5" x="44" y="6" width="3.4" height="6" rx="1" fill="#5fe0b0"/></g>',
 gift:shadow(28,20)+'<g class="ti-gift-shake"><use href="#lgBox" x="0" y="4" width="56" height="56"/><g class="ti-lid"><use href="#lgCap" x="0" y="4" width="56" height="56"/></g></g>'+
  '<g class="ti-burst"><circle class="b1" cx="30" cy="10" r="2.4" fill="#ff5fa2"/><path class="b3" d="M44 6 45.6 9.4 49 11 45.6 12.6 44 16 42.4 12.6 39 11 42.4 9.4Z" fill="#ffd34d"/><circle class="b4" cx="16" cy="8" r="2" fill="#7ad7ff"/></g>',
 pin:'<ellipse class="ti-shadow" cx="32" cy="59" rx="10" ry="2.6" fill="#5b2a5a" opacity=".25"/><g class="ti-drop"><path d="M32 58C20 42 14 34 14 24a18 18 0 0 1 36 0c0 10-6 18-18 34Z" fill="url(#tiRed)"/><circle cx="32" cy="24" r="7" fill="#fff"/><circle cx="32" cy="24" r="3.5" fill="url(#tiPink)"/><ellipse cx="24" cy="16" rx="5" ry="3" fill="url(#tiGloss)"/></g>',
 heart:'<g class="ti-beat"><path d="M32 56C10 40 6 26 14 18c6-6 14-4 18 3 4-7 12-9 18-3 8 8 4 22-18 38Z" fill="url(#tiRed)"/><ellipse cx="22" cy="22" rx="6" ry="4" fill="url(#tiGloss)"/></g>'+star(52,12,4,'#ffd34d','ti-twinkle'),
 balloon:'<g class="ti-float"><path d="M24 44q-2 8 2 18" stroke="#c9a66b" stroke-width="1.2" fill="none"/><ellipse cx="24" cy="26" rx="13" ry="16" fill="url(#tiPink)"/><path d="M22 41h4l-2 4Z" fill="#b8327f"/><ellipse cx="19" cy="19" rx="4" ry="6" fill="url(#tiGloss)"/></g>'+
  '<g class="ti-float f2"><path d="M42 40q3 8-1 20" stroke="#c9a66b" stroke-width="1.2" fill="none"/><ellipse cx="42" cy="24" rx="12" ry="15" fill="url(#tiPurple)"/><path d="M40 38h4l-2 4Z" fill="#5e2a96"/><ellipse cx="37" cy="17" rx="3.6" ry="5.4" fill="url(#tiGloss)"/></g>',
 cupcake:shadow(32,16)+'<g class="ti-squash"><path d="M16 36h32l-5 22H21Z" fill="url(#tiPurple)"/><path d="M22 36l2 22M30 36v22M38 36l-2 22" stroke="#fff5" stroke-width="2"/>'+
  '<path d="M13 37c-2-8 6-12 10-12 0-7 8-10 12-7 6-3 13 2 11 8 6 1 8 7 5 11Z" fill="url(#tiPink)"/><path d="M20 30c4 2 8 2 12 0M30 22c3 2 7 2 10 0" stroke="#fff8" stroke-width="2" fill="none" stroke-linecap="round"/>'+
  '<g class="ti-cherry"><path d="M34 15q2-6 8-8" stroke="#3f8f5a" stroke-width="1.6" fill="none"/><circle cx="33" cy="16" r="4.4" fill="url(#tiRed)"/><circle cx="31.5" cy="14.6" r="1.4" fill="#fff"/></g>'+
  '<rect x="22" y="31" width="3" height="1.4" rx=".7" fill="#ffd34d" transform="rotate(30 23 31)"/><rect x="39" y="31" width="3" height="1.4" rx=".7" fill="#7ad7ff" transform="rotate(-30 40 31)"/><rect x="31" y="27" width="3" height="1.4" rx=".7" fill="#5fe0b0"/></g>',
 lollipop:'<g class="ti-sway"><rect x="30" y="34" width="4" height="26" rx="2" fill="url(#tiCream)"/><g class="ti-swirl"><circle cx="32" cy="22" r="16" fill="url(#tiPink)"/>'+
  '<path d="M32 22m0-2a2 2 0 1 1-2 2 4 4 0 0 1 4-4 6 6 0 0 1 6 6 8 8 0 0 1-8 8 10 10 0 0 1-10-10 12 12 0 0 1 12-12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g><ellipse cx="25" cy="14" rx="5" ry="3" fill="url(#tiGloss)"/></g>',
 candy:'<g class="ti-spin"><path d="M14 32 3 22v20Z" fill="url(#tiGoldV)"/><path d="M50 32l11-10v20Z" fill="url(#tiGoldV)"/><ellipse cx="32" cy="32" rx="19" ry="13" fill="url(#tiMint)"/>'+
  '<path d="M20 24q6 8 0 16M30 20q6 12 0 24M40 21q6 11 0 22" stroke="#fff9" stroke-width="3" fill="none"/><ellipse cx="25" cy="25" rx="6" ry="3" fill="url(#tiGloss)"/></g>',
 champagne:'<g class="ti-clink-l"><path d="M14 8h14l-2 16a5 5 0 0 1-10 0Z" fill="url(#tiGoldV)"/><rect x="20" y="28" width="2.4" height="22" fill="#e8d6b0"/><rect x="14" y="50" width="14" height="3" rx="1.5" fill="#e8d6b0"/></g>'+
  '<g class="ti-clink-r"><path d="M36 8h14l-2 16a5 5 0 0 1-10 0Z" fill="url(#tiGoldV)"/><rect x="42" y="28" width="2.4" height="22" fill="#e8d6b0"/><rect x="36" y="50" width="14" height="3" rx="1.5" fill="#e8d6b0"/></g>'+
  '<g class="ti-bubbles"><circle cx="21" cy="14" r="1.4" fill="#fff"/><circle cx="43" cy="16" r="1.2" fill="#fff"/><circle cx="24" cy="18" r="1" fill="#fff"/></g>'+star(32,6,4,'#fff','ti-twinkle')
};
function svg(name,cls){return '<svg class="ti ti-'+name+(cls?' '+cls:'')+'" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+(ICONS[name]||ICONS.heart)+'</svg>'}
if(!document.getElementById('tiDefs')){const d=document.createElement('div');d.id='tiDefs';d.setAttribute('aria-hidden','true');d.innerHTML=DEFS;document.body.prepend(d)}
window.TabrikIcons={svg,names:Object.keys(ICONS)};
})();
