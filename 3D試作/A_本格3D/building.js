// 2階建ての会社を巡るジオラマ。three.js は表示側から受け取る。
export function createBuilding(THREE, opts = {}) {
  const group = new THREE.Group();
  group.name = 'company-diorama';
  const materials = new Map();
  const mat = (color, extra = {}) => {
    const key = color + JSON.stringify(extra);
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .86, ...extra }));
    return materials.get(key);
  };
  const C = {
    navy: mat('#0B2545'), orange: mat('#F4903C'), cream: mat('#F5EFE4'),
    wood: mat('#A9825A'), white: mat('#FFFFFF'), cork: mat('#B7895A'), pin: mat('#E04A3A'),
    steel: mat('#737B7D', { metalness: .4 }), dark: mat('#253342'), leaf: mat('#657C59'), grass: mat('#879478'),
    field: mat('#A3AA76'), road: mat('#555D62'), stone: mat('#B9B9AC'),
    concrete: mat('#B3AEA1'), carpet: mat('#827E74'), cardboard: mat('#B89361'),
    green: mat('#94BC79', { emissive: '#719C61', emissiveIntensity: .6 }),
    glass: mat('#AFC7D4', { transparent: true, opacity: .045, depthWrite: false, roughness: .2, side: THREE.DoubleSide }),
    window: mat('#27465B', { roughness: .3 }),
    warm: mat('#F5EFE4', { emissive: '#F4903C', emissiveIntensity: .55 }),
    screen: mat('#416F99', { emissive: '#649FE1', emissiveIntensity: .8 }),
    pixels: mat('#B9D9EE', { emissive: '#649FE1', emissiveIntensity: .7 })
  };
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const sphere = new THREE.SphereGeometry(1, 10, 6);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 10);
  const mesh = (geo, material, x, y, z, parent = group, shadow = false) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
  };
  const box = (w, h, d, x, y, z, material, parent = group, shadow = false) => {
    const m = mesh(cube, material, x, y, z, parent, shadow); m.scale.set(w, h, d); return m;
  };
  const ball = (r, x, y, z, material, parent = group) => {
    const m = mesh(sphere, material, x, y, z, parent); m.scale.setScalar(r); return m;
  };
  const rod = (a, b, r, material, parent = group) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.sub(start);
    const m = mesh(cylinder, material, ...start.addScaledVector(delta, .5).toArray(), parent);
    m.scale.set(r, delta.length(), r); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return m;
  };
  const node = (name, x, y, z, parent = group) => {
    const n = new THREE.Group(); n.name = name; n.position.set(x, y, z); parent.add(n); return n;
  };

  function parcel(x, y, z, size = .55, parent = group) {
    const p = node('parcel', x, y, z, parent);
    box(size, size * .8, size * .85, 0, size * .4, 0, C.cardboard, p);
    box(.085, .009, size * .86, 0, size * .805, 0, C.cream, p);
    box(.085, size * .8, .009, 0, size * .4, size * .43, C.cream, p);
    box(size * .27, size * .17, .011, -size * .23, size * .53, size * .435, C.white, p);
    return p;
  }
  const leafGeo = new THREE.SphereGeometry(1, 6, 4);
  function plant(x, y, z, scale = 1, narrow = false) {
    const p = node('plant', x, y, z); p.scale.setScalar(scale);
    const pot=mesh(cylinder,C.cream,0,.22,0,p);pot.scale.set(.25,.44,.25);
    const soil=mesh(cylinder,C.dark,0,.445,0,p);soil.scale.set(.225,.012,.225);
    for (let i = 0; i < (narrow ? 16 : 32); i++) {
      const a=i*2.399, level=i%5, h=.65+level*.18;
      const ex=Math.cos(a)*(.19+level*.038),ez=Math.sin(a)*(.19+level*.038);
      if(i<12) rod([0,.43,0],[ex,h,ez],.009,C.wood,p);
      const leaf=mesh(leafGeo,C.leaf,ex,h,ez,p);
      leaf.scale.set(narrow?.045:.10,narrow?.58:.27,.018); leaf.rotation.set(Math.cos(a)*.55,a,Math.sin(a)*.85);
    }
    return p;
  }

  box(150, .12, 150, 0, -.08, 0, C.grass);
  box(140, .025, 7, 0, .005, 12, C.road);
  box(6, .025, 85, 19, .006, -23, C.road);
  for (let x = -62; x < 67; x += 7) box(2.8, .012, .12, x, .027, 12, C.cream);
  box(23, .12, 2.2, 0, .06, 7.2, C.stone);
  box(21, .09, .17, 0, .08, 8.35, C.cream);
  for (const [x, z] of [[-21, -21], [-38, -23], [31, -25], [46, -25], [30, -43], [-21, -43]]) {
    box(13.5, .06, 14, x, .015, z, C.field);
    for (let i = 0; i < 10; i++) box(.16, .09, 13, x - 5.8 + i * 1.28, .09, z, C.leaf);
    box(14, .13, .35, x, .065, z + 7, C.wood);
  }
  function house(x, z, s, turn) {
    const p = node('house', x, 0, z); p.scale.setScalar(s); p.rotation.y = turn;
    box(4.6, 3.2, 4, 0, 1.6, 0, C.cream, p, true);
    const roof = mesh(new THREE.ConeGeometry(3.55, 1.7, 4), C.navy, 0, 4.02, 0, p, true); roof.rotation.y = Math.PI / 4;
    box(.85, 1.65, .04, .9, .825, 2.02, C.wood, p);
    for (const wx of [-1.3, .85]) {
      box(1, .75, .045, wx, 2.32, 2.025, C.warm, p);
      box(.055, .8, .06, wx, 2.32, 2.05, C.wood, p);
    }
  }
  [[-19, 2, 1], [-29, 3, .8], [-18, 24, .95], [-31, 25, 1.1], [27, 1, 1], [36, 3, .85], [29, 24, 1.05], [43, 23, .8], [-5, -20, .8], [8, -24, .9]].forEach(([x, z, s], i) => house(x, z, s, i % 2 ? .12 : -.08));
  for (const [x, z, s] of [[-12, 5, 1], [12, 6, 1], [-14, -9, 1.3], [11, -12, 1.2], [-24, 18, 1], [24, 19, 1], [39, -9, 1.3]]) {
    rod([x, 0, z], [x, 2.5 * s, z], .19 * s, C.wood);
    const crown = mesh(new THREE.IcosahedronGeometry(1.6 * s, 0), C.leaf, x, 3.3 * s, z, group, true); crown.scale.y = 1.25;
  }


  // 木目・織り目・コンクリート・コルクはコードから小さな反復模様を作る。
  let seed = 9127;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function canvasMap(size, draw, repeat = [1, 1]) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d'); draw(ctx, size);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(...repeat); map.anisotropy = 4;
    return map;
  }
  function surface(material, kind, repeat) {
    const map = canvasMap(512, (c, n) => {
      c.fillStyle = { wood: '#c19c69', carpet: '#87847d', concrete: '#aaa79d', cork: '#b38345', wall: '#e7dfcd', steel: '#8a9296', mesh: '#26292c' }[kind]; c.fillRect(0, 0, n, n);
      for (let i = 0; i < 38000; i++) {
        const x = random() * n, y = random() * n, v = random();
        c.fillStyle = v > .5 ? 'rgba(255,248,221,.09)' : 'rgba(26,24,20,.10)';
        c.fillRect(x, y, kind === 'wood' ? .6 : 1.5, kind === 'wood' ? 12 + v * 50 : 1.5);
      }
      if (kind === 'wood') {
        for (let i = 0; i < 200; i++) {
          c.strokeStyle = `rgba(65,38,14,${.03 + random() * .13})`; c.lineWidth = .5 + random(); c.beginPath();
          const x = random() * n;
          for (let y = 0; y <= n; y += 4) { const xx = x + Math.sin(y * .018 + i) * (2 + 3 * Math.sin(x)); if (!y) c.moveTo(xx, y); else c.lineTo(xx, y); } c.stroke();
        }
      } else if (kind === 'carpet') {
        for (let y = 0; y < n; y += 4) for (let x = 0; x < n; x += 3) {
          c.strokeStyle = (x + y) % 7 ? 'rgba(42,39,33,.28)' : 'rgba(238,226,203,.25)';
          c.beginPath(); c.ellipse(x, y, 1, 2, 0, 0, Math.PI * 2); c.stroke();
        }
        c.strokeStyle = 'rgba(35,34,30,.18)'; c.strokeRect(0, 0, n, n);
      } else if (kind === 'concrete') {
        for (let i = 0; i < 50; i++) {
          const x = random() * n, y = random() * n, r = 20 + random() * 90;
          const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(65,58,45,.07)'); g.addColorStop(1, 'rgba(65,58,45,0)'); c.fillStyle = g; c.fillRect(x-r,y-r,r*2,r*2);
        }
        c.strokeStyle = 'rgba(49,45,37,.25)'; c.lineWidth = 2; c.strokeRect(1, 1, 510, 254); c.strokeRect(1, 257, 510, 254);
        for (const x of [34, 478]) for (const y of [34, 222, 290, 478]) { c.fillStyle = '#77776f'; c.beginPath(); c.arc(x,y,3,0,7); c.fill(); }
      } else if (kind === 'cork') {
        for (let i=0;i<6000;i++) { c.fillStyle = random()>.5 ? '#956933' : '#c79a59'; c.fillRect(random()*n,random()*n,random()*4+1,random()*3+1); }
      } else if (kind === 'wall') {
        const g = c.createLinearGradient(0,0,0,n); g.addColorStop(0,'rgba(255,244,215,.15)'); g.addColorStop(1,'rgba(100,87,64,.10)'); c.fillStyle=g; c.fillRect(0,0,n,n);
      } else if (kind === 'steel') {
        for(let y=12;y<n;y+=32) { c.fillStyle='#293239'; c.fillRect(230,y,52,12); c.fillStyle='#b4b8b7'; c.fillRect(230,y+12,52,2); }
      } else if (kind === 'mesh') {
        c.fillStyle='#626669'; for(let y=0;y<n;y+=8) for(let x=0;x<n;x+=8) c.fillRect(x,y,2,3);
      }
    }, repeat);
    material.color.set('#ffffff'); material.map = map; material.bumpMap = map;
    material.bumpScale = kind === 'carpet' ? .025 : .008; material.needsUpdate = true;
  }
  surface(C.wood, 'wood', [2, 1]); surface(C.carpet, 'carpet', [10, 12]);
  surface(C.concrete, 'concrete', [3, 2]); surface(C.cork, 'cork', [3, 2]);
  const wall = mat('#e6dfd1'); surface(wall, 'wall', [1,1]);
  const perforated = mat('#919a9d'); surface(perforated, 'steel', [1,3]);
  const chairFabric = mat('#292c2f'); surface(chairFabric, 'mesh', [2,2]);
  const screens = [0, 1].map(kind => {
    const map = canvasMap(512, (c, n) => {
      c.fillStyle='#111d2b'; c.fillRect(0,0,n,n); c.fillStyle='#263445'; c.fillRect(0,0,n,26); c.fillRect(0,26,42,n);
      for(let i=0;i<17;i++) { c.fillStyle='#687b89'; c.fillRect(8,42+i*26,20,2); }
      if(kind) {
        for(let i=0;i<48;i++) for(let j=0;j<3;j++) {
          c.fillStyle=['#b0b977','#6c9eb4','#c59670','#687d89'][(i+j)%4];
          c.fillRect(60+(i%4)*9+j*105,42+i*9,20+random()*75,2);
        }
      } else {
        c.strokeStyle='#354352'; c.lineWidth=1;
        for(let i=0;i<10;i++) { c.beginPath(); c.moveTo(52,50+i*40); c.lineTo(490,50+i*40); c.stroke(); }
        const points=[]; for(let i=0;i<70;i++) points.push([54+i*6.2,300-i*2.8-random()*43]);
        const g=c.createLinearGradient(0,90,0,310); g.addColorStop(0,'rgba(216,188,78,.8)'); g.addColorStop(1,'rgba(39,126,124,.05)');
        c.beginPath(); c.moveTo(54,320); points.forEach(p=>c.lineTo(...p)); c.lineTo(482,320); c.closePath(); c.fillStyle=g; c.fill();
        c.beginPath(); points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p)); c.strokeStyle='#d4b44f'; c.lineWidth=2; c.stroke();
        for(let i=0;i<54;i++) { c.fillStyle=i%3?'#458eaa':'#c2ab55'; const h=15+random()*80; c.fillRect(56+i*8,455-h,4,h); }
      }
    });
    return new THREE.MeshStandardMaterial({map, emissiveMap:map, emissive:'#ffffff', emissiveIntensity:.42, roughness:.65});
  });
  const contactMap = canvasMap(128,(c,n)=> { const g=c.createRadialGradient(n/2,n/2,3,n/2,n/2,n/2); g.addColorStop(0,'rgba(20,15,9,.48)'); g.addColorStop(.55,'rgba(20,15,9,.25)'); g.addColorStop(1,'rgba(20,15,9,0)'); c.fillStyle=g;c.fillRect(0,0,n,n); });
  const contactMaterial = new THREE.MeshBasicMaterial({map:contactMap, transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-1});
  const flat = new THREE.PlaneGeometry(1,1);
  function contact(x,y,z,w,d) { const m=mesh(flat,contactMaterial,x,y+.006,z);m.rotation.x=-Math.PI/2;m.scale.set(w,d,1); }

  const G = .2, F = 4.2, R = 8.2;
  box(18.4, .2, 10.4, 0, .1, 0, C.concrete, group, true);
  box(18, 8, .18, 0, 4.2, -5, wall, group, true);
  box(7.9, 3.78, .035, 4.95, 2.09, -4.895, C.concrete);
  box(.16, 3.78, 10, 9, 2.09, 0, C.concrete, group, true);
  for (const x of [-4.95, 4.95]) {
    box(8.1, .24, 10, x, F - .12, 0, C.concrete, group, true);
    box(8.05, .025, 9.95, x, F - .0125, 0, C.carpet);
  }
  box(8.05, .025, 9.95, -4.95, G - .0125, 0, C.carpet);
  box(1.8, .24, 1.4, 0, F - .12, -4.3, C.wood);
  box(18.4, .24, 10.3, 0, R - .12, 0, C.concrete, group, true);
  for (const base of [G, F]) {
    box(.16, 3.75, 10, -9, base + 1.875, 0, wall, group, true);
    // 右側は床から天井までの窓。中央側も階段越しに奥行きが見える。
    for (const x of [-1, 9]) {
      box(.018, 3.72, 9.8, x, base + 1.86, 0, C.glass);
      for (const z of [-4.9, -2.4, .1, 2.5, 4.95]) box(.08, 3.75, .08, x, base + 1.875, z, C.navy);
    }
    for (const x of [-9, -1, 1, 9]) box(.12, 3.8, .12, x, base + 1.9, 5, C.navy);
    for (const x of base === G ? [-5] : [-5, 5]) {
      box(7.85, 3.75, .015, x, base + 1.875, 5, C.glass);
      for (const dx of base === G ? [-1.9, 1.3] : [-2.65, 2.65]) box(.085, 3.75, .10, x + dx, base + 1.875, 5, C.navy);
    }
  }
  for (const y of [.26, F, R - .15]) box(18.35, .16, .16, 0, y, 5.05, C.navy);
  for (let i = 0; i < 16; i++) {
    const z = 4.05 - i * .49, y = G + (F - G) * (i + 1) / 16;
    box(1.65, .12, .51, 0, y - .06, z, C.wood);
    if (i % 3 === 0) for (const x of [-.78, .78]) rod([x, y, z], [x, y + .85, z], .023, C.navy);
  }
  for (const x of [-.78, .78]) rod([x, 1.3, 4.05], [x, F + .85, -3.3], .035, C.navy);
  // 線形照明とダウンライト。実際の光源は表示側の2灯を利用する。
  for (const base of [G, F]) for (const x of [-5.2, 4.8]) {
    const y = base + 3.42;
    box(3.4, .085, .20, x, y, -.3, C.navy);
    box(3.3, .025, .16, x, y - .055, -.3, C.warm);
    for (const dx of [-1.3, 1.3]) rod([x + dx, y, -.3], [x + dx, base + 3.75, -.3], .012, C.dark);
    for (const dx of [-2.6, 2.6]) for (const z of [-3.2, 2.5]) {
      const light = mesh(cylinder, C.warm, x + dx, base + 3.735, z); light.scale.set(.105, .018, .105);
    }
  }
  for (const z of [-3, 1.5]) for (const x of [2.6, 6.6]) {
    box(.22, .07, 1.75, x, 3.91, z, C.steel);
    for (const dx of [-.06, .06]) box(.035, .035, 1.65, x + dx, 3.86, z, C.warm);
  }

  // 家具の共通部品。木の天板と幕板、引き出し、肘掛け・キャスター付き椅子。
  function desk(x, base, z, w = 2.4, d = 1.05) {
    box(w, .10, d, x, base + .79, z, C.wood, group, true);
    for (const dx of [-w / 2 + .09, w / 2 - .09]) box(.12, .74, d - .08, x + dx, base + .37, z, C.wood);
    box(w - .2, .60, .09, x, base + .42, z - d / 2 + .14, C.wood);
  }
  function cabinet(x, base, z, w, parent = group) {
    box(w, .85, .57, x, base + .425, z, C.wood, parent, true);
    for (let i = 0; i < 3; i++) {
      box(w - .045, .018, .012, x, base + .12 + i * .25, z + .29, C.cardboard, parent);
      box(.18, .025, .028, x + w * .23, base + .25 + i * .25, z + .31, C.dark, parent);
    }
  }
  function chair(x, base, z, angle = 0) {
    const p = node('office-chair', x, base, z); p.rotation.y = angle;
    box(.56, .10, .56, 0, .49, 0, C.dark, p);
    const back = box(.57, .64, .065, 0, .86, .27, chairFabric, p); back.rotation.x = -.10;
    rod([0, .12, 0], [0, .47, 0], .045, C.steel, p);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5, x1 = Math.cos(a) * .36, z1 = Math.sin(a) * .36;
      rod([0, .16, 0], [x1, .085, z1], .025, C.dark, p); box(.08, .085, .10, x1, .06, z1, C.dark, p);
    }
    for (const x1 of [-.33, .33]) {
      rod([x1, .48, .1], [x1, .70, .1], .025, C.dark, p); box(.075, .05, .36, x1, .72, 0, C.dark, p);
    }
  }
  function papers(x, y, z, count = 4, parent = group) {
    for (let i = 0; i < count; i++) box(.42, .012, .30, x + (i % 2) * .01, y + i * .015, z, C.cream, parent);
    for (let i = 0; i < 4; i++) box(.25, .002, .008, x, y + count * .015, z - .08 + i * .04, C.stone, parent);
  }
  function trays(x, y, z) {
    for (let i = 0; i < 3; i++) {
      const h = y + i * .12; box(.53, .025, .36, x, h, z, C.dark);
      for (const dx of [-.25, .25]) box(.025, .10, .36, x + dx, h + .04, z, C.dark);
      papers(x, h + .022, z, 3);
    }
  }
  function printer(x, y, z, s = 1) {
    const p = node('printer', x, y, z); p.scale.setScalar(s);
    box(.68, .49, .60, 0, .245, 0, C.white, p); box(.62, .07, .55, 0, .53, -.02, C.cream, p);
    box(.44, .065, .025, 0, .35, .311, C.dark, p); box(.35, .025, .25, 0, .29, .36, C.white, p);
    for (const h of [.08, .18]) box(.52, .014, .012, 0, h, .31, C.stone, p);
    box(.16, .018, .13, .20, .575, .13, C.window, p);
  }
  function monitor(x, y, z, w = .8, h = .48, kind = 0, stand = true) {
    const p = node('monitor', x, y, z);
    box(w + .055, h + .055, .07, 0, 0, 0, C.dark, p); box(w, h, .012, 0, 0, .043, screens[kind % 2], p);
    if (stand) {
      rod([0, -h / 2, 0], [0, -h / 2 - .16, 0], .027, C.dark, p);
      box(.30, .028, .22, 0, -h / 2 - .17, .03, C.dark, p);
    }
    return p;
  }
  function laptop(x, y, z, angle = 0) {
    const p = node('laptop', x, y, z); p.rotation.y = angle;
    box(.48, .025, .34, 0, 0, 0, C.steel, p);
    const lid = node('laptop-lid', 0, .015, -.16, p); lid.rotation.x = -.18;
    box(.48, .31, .025, 0, .155, 0, C.dark, lid); box(.43, .26, .006, 0, .155, .017, screens[1], lid);
    for (let i = 0; i < 4; i++) box(.34, .005, .018, 0, .018, -.08 + i * .045, C.dark, p);
  }
  function shelving(x, base, z, w, metal = false, angle = 0) {
    const p = node(metal ? 'steel-shelving' : 'file-shelving', x, base, z); p.rotation.y = angle;
    const m = metal ? C.steel : C.wood, levels = metal ? 4 : 5, step = metal ? .72 : .57;
    if (!metal) box(w, 3, .045, 0, 1.5, -.30, C.wood, p);
    for (const sx of [-w / 2, 0, w / 2]) for (const sz of metal ? [-.29, .29] : [0]) box(.055, 3.08, metal ? .055 : .64, sx, 1.54, sz, metal ? perforated : m, p);
    for (let row = 0; row <= levels; row++) box(w, .045, .66, 0, .07 + row * step, 0, m, p);
    for (let row = 0; row < levels; row++) {
      const y = .095 + row * step;
      if (metal) {
        for (let i = 0; i < 5; i++) parcel(-w / 2 + .35 + i * (w - .7) / 4, y, 0, .47 + (i + row) % 3 * .055, p);
      } else {
        for (let i = 0; i < 32; i++) {
          const sx = -w / 2 + .16 + i * (w - .32) / 31, h = .39 + (i % 3) * .035;
          box(.12, h, .38, sx, y + h / 2, .04, i % 7 === 0 ? C.navy : C.white, p);
          box(.075, .12, .006, sx, y + h * .68, .235, C.cream, p); box(.027, .035, .008, sx, y + .085, .241, C.dark, p);
        }
      }
    }
  }

  // 1階左：木の机の島、ノートPCと書類トレー、白いファイルの壁面収納。
  shelving(-5.35, G, -4.48, 6.4); shelving(-8.50, G, -1.30, 4.7, false, Math.PI / 2);
  for (const x of [-6.35, -5.05, -3.75]) {
    box(.85, .34, .48, x, G + 3.02, -4.48, C.white);
    box(.90, .045, .52, x, G + 3.20, -4.48, C.cream);
    box(.17, .055, .009, x, G + 3.06, -4.233, C.dark);
  }
  const officeIslandStart = group.children.length;
  desk(-5.65, G, -.55, 3.7, 1.8); box(3.48, .68, .08, -5.65, G + .40, .25, C.wood, group, true);
  desk(-5.5, G, -2.85, 2.8, .8);
  for (const [x, z, a] of [[-7.65, -.65, Math.PI / 2], [-3.65, -.7, -Math.PI / 2], [-5.4, -1.95, Math.PI], [-5.2, -3.6, Math.PI]]) chair(x, G, z, a);
  laptop(-6.55, G + .855, -.55, .25); laptop(-4.65, G + .855, -.65, -.25); laptop(-5.4, G + .855, -2.85);
  trays(-5.55, G + .86, -.15); papers(-6.8, G + .86, .02); papers(-4.5, G + .86, .08);
  for (const part of group.children.slice(officeIslandStart)) part.position.z += 2.2;
  cabinet(-2.05, G, -3.9, 1.25); printer(-2.05, G + .86, -3.9, 1.25); printer(-7.3, G + 3.0, -4.45, .72);
  plant(-8.1, G, 3.15, 1.3); plant(-1.65, G, -2.75, 1.15);

  // 1階右：棚が詰まったコンクリートのガレージ。荷室の開口は正面 +z。
  function van(x, y, z, open = false, scale = 1) {
    const p = node(open ? 'loading-van' : 'street-van', x, y, z); p.scale.setScalar(scale);
    box(3.85, .17, 1.62, 0, .48, 0, C.white, p, true);
    box(2.58, .13, 1.64, -.56, 2.05, 0, C.white, p, true);
    box(2.58, 1.49, .075, -.56, 1.27, -.78, C.white, p, true);
    box(2.58, 1.49, .075, -.56, 1.27, .78, C.white, p, true);
    box(1.05, .63, 1.62, 1.28, .84, 0, C.white, p, true);
    box(1.07, .10, 1.65, 1.28, 1.98, 0, C.white, p);
    box(.035, .70, 1.45, 1.82, 1.58, 0, C.window, p);
    for (const sz of [-.79, .79]) {
      box(.96, .64, .035, 1.26, 1.59, sz, C.window, p);
      for (const sx of [-1.14, -.04]) box(.95, .62, .018, sx, 1.58, sz * 1.05, C.window, p);
      for (const sx of [.76, 1.80]) box(.06, .83, .07, sx, 1.56, sz, C.white, p);
      box(3.5, .045, .017, -.08, .98, sz * 1.05, C.dark, p);
      box(.19, .04, .03, .9, 1.15, sz * 1.04, C.navy, p);
      box(.14, .22, .14, 1.77, 1.42, sz * 1.16, C.navy, p);
    }
    for (const sx of [-1.15, 1.23]) for (const sz of [-.83, .83]) {
      const wheel = mesh(cylinder, C.dark, sx, .35, sz, p); wheel.scale.set(.34, .20, .34); wheel.rotation.x = Math.PI / 2;
      const hub = mesh(cylinder, C.stone, sx, .35, sz * 1.14, p); hub.scale.set(.16, .025, .16); hub.rotation.x = Math.PI / 2;
    }
    for (const sz of [-.57, .57]) {
      box(.025, .23, .31, 1.82, 1.02, sz, C.warm, p);
      box(.035, .46, .14, -1.90, 1.05, sz, C.pin, p);
      box(.038,.13,.14,-1.91,.93,sz,C.cream,p);
    }
    box(.11, .15, 1.7, 1.87, .55, 0, C.navy, p);
    box(.12, .13, 1.7, -1.91, .50, 0, C.navy, p);
    box(.015,.19,.34,-1.978,.63,0,mat('#d6af39'),p);
    box(.10, 1.5, 1.46, .68, 1.25, 0, C.stone, p);
    if (open) {
      const door = node('raised-tailgate', -1.88, 2.03, 0, p);
      door.rotation.z = -Math.PI / 2 + .14;
      box(.07, 1.48, 1.61, 0, -.74, 0, C.white, door);
      box(.08, .59, 1.24, -.005, -.45, 0, C.window, door);
      for (const sz of [-.72, .72]) rod([-1.84, 1.34, sz], [-2.82, 2.08, sz], .024, C.navy, p);
      parcel(-.5, .57, -.35, .60, p); parcel(.14, .57, .25, .52, p);
    } else box(.08, 1.5, 1.61, -1.88, 1.27, 0, C.white, p);
    return p;
  }

  const loadingVan = van(5.5, G, -.65, true); loadingVan.rotation.y = Math.PI / 2 + .24;
  parcel(-1.20, .57, .22, .57, loadingVan); parcel(-.55, 1.06, -.28, .47, loadingVan);
  shelving(5.0, G, -4.45, 6.7, true); shelving(1.40, G, -1.65, 5.2, true, Math.PI / 2);
  const cart = node('parcel-trolley', 2.3, G, 2.05);
  box(.95, .09, 1.15, 0, .18, 0, C.navy, cart);
  for (const x of [-.39, .39]) {
    rod([x, .2, -.48], [x, 1.10, -.48], .03, C.navy, cart);
    for (const z of [-.43, .43]) box(.12, .15, .13, x, .075, z, C.dark, cart);
  }
  rod([-.39, 1.1, -.48], [.39, 1.1, -.48], .04, C.orange, cart);
  parcel(0, .24, .12, .66, cart); parcel(0, .77, .12, .50, cart);
  const cage = node('cage-trolley', 8.1, G, -2.25);
  box(1.05, .10, .9, 0, .20, 0, C.navy, cage);
  for (const x of [-.49, .49]) for (const z of [-.4, .4]) {
    box(.10, .15, .12, x, .075, z, C.dark, cage); rod([x, .25, z], [x, 1.8, z], .026, C.navy, cage);
  }
  for (let i = 0; i < 6; i++) {
    const y = .30 + i * .30; rod([-.49, y, -.4], [.49, y, -.4], .012, C.steel, cage);
    for (const x of [-.49, .49]) rod([x, y, -.4], [x, y, .4], .012, C.steel, cage);
    const x = -.4 + i * .16; rod([x, .25, -.4], [x, 1.8, -.4], .011, C.steel, cage);
  }
  parcel(0, .25, 0, .65, cage); parcel(0, .78, 0, .57, cage);
  for (const [x, y, z] of [[7.55, G, -3.65], [8.25, G, -3.65], [7.55, G + .57, -3.65], [8.25, G + .57, -3.65]]) parcel(x, y, z, .7);
  const streetVan = van(6.5, .03, 11, false, .9); streetVan.rotation.y = .1;
  // 配達バイク：二輪、フレーム、ハンドル、後ろの新聞ボックス。
  const bike = node('delivery-bike', -5.6, .03, 9.5); bike.rotation.y = -.2;
  for (const x of [-.66, .68]) {
    const w = mesh(cylinder, C.dark, x, .29, 0, bike); w.scale.set(.29, .14, .29); w.rotation.x = Math.PI / 2;
    rod([x, .3, 0], [x * .55, .83, 0], .047, C.navy, bike);
  }
  rod([-.66, .3, 0], [.4, .72, 0], .08, C.orange, bike);
  box(.57, .28, .34, 0, .62, 0, C.orange, bike);
  box(.62, .10, .37, -.2, .9, 0, C.navy, bike);
  rod([.45, .67, 0], [.48, 1.19, 0], .04, C.navy, bike);
  rod([.48, 1.19, -.29], [.48, 1.19, .29], .035, C.navy, bike);
  box(.52, .46, .50, -.64, 1.12, 0, C.cream, bike);
  ball(.12, .57, 1.02, 0, C.warm, bike);


  // 2階左：16:9のコルク面。slot の左上基準と時計回りの角度を保つ。
  const clickables = [];
  const BW = 4.8, BH = 2.7, BX = -5.65, BY = F + 2.0, BZ = -4.72;
  const OW = 5.04, OH = 2.835;
  box(OW, OH, .12, BX, BY, BZ - .04, C.wood); box(BW, BH, .028, BX, BY, BZ + .035, C.cork);
  const loader = new THREE.TextureLoader();
  for (const it of opts.board || []) {
    if (!Array.isArray(it.slot) || it.slot.length < 4) continue;
    const [x, y, w, h, angle = 0] = it.slot;
    const sheet = node('board-sheet', BX - BW / 2 + (x + w / 2) * BW, BY + BH / 2 - (y + h / 2) * BH, BZ + .075);
    sheet.rotation.z = -angle * Math.PI / 180;
    box(w * BW + .035, h * BH + .035, .012, 0, 0, -.009, C.cream, sheet);
    let material = it.flyer ? C.orange : C.cream;
    if (it.src) {
      const texture = loader.load(it.src); texture.colorSpace = THREE.SRGBColorSpace;
      material = new THREE.MeshStandardMaterial({ map: texture, roughness: .9 });
    }
    const pic = mesh(new THREE.PlaneGeometry(w * BW, h * BH), material, 0, 0, .002, sheet);
    pic.name = it.flyer ? 'board-flyer' : 'board-photo'; ball(.025, 0, h * BH / 2 - .025, .024, C.pin, sheet);
    if (!it.flyer) { pic.userData.photo = it.i; clickables.push(pic); }
  }
  const sideBoard = node('side-cork-board', -8.87, F + 2.1, -2.0); sideBoard.rotation.y = Math.PI / 2;
  box(1.65, 2.25, .09, 0, 0, 0, C.wood, sideBoard); box(1.52, 2.12, .015, 0, 0, .052, C.cork, sideBoard);
  for (let i = 0; i < 6; i++) {
    const paper = box(.40, .48, .009, -.40 + (i % 2) * .80, .70 - Math.floor(i / 2) * .70, .065, i % 2 ? C.orange : C.cream, sideBoard);
    paper.rotation.z = (i % 3 - 1) * .045;
  }
  // 机はボードの視線より低く、ボードカメラより手前に置く。
  desk(-5.1, F, -.45, 2.5, 1.5); box(2.3,.70,.08,-5.1,F+.39,.25,C.wood); chair(-4.45, F, -1.5, Math.PI); chair(-6.0, F, .75, .20);
  papers(-5.65, F + .86, -.15); trays(-5.65, F + .86, -.90); plant(-4.65, F + .85, -.50, .42);
  const leftStorage = node('reception-left-storage', -8.50, F, -.60); leftStorage.rotation.y = Math.PI / 2;
  cabinet(0, 0, 0, 2.7, leftStorage); printer(-8.3, F + .86, -.6);
  cabinet(-1.6, F, -3.7, 1.05); printer(-1.6, F + .86, -3.7, .7);
  plant(-8.05, F, 3.5, 1.25); plant(-1.65, F, -2.55, 1.0);

  // 2階右：壁の大画面3枚、机2台と各3画面。右の窓際にパネル用の空間。
  for (let i = 0; i < 3; i++) monitor(2.25 + i * 2.12, F + 2.67, -4.76, 1.95, 1.12, i, false);
  for (const [i, x] of [3.05, 5.65].entries()) {
    desk(x, F, -3.15, 2.42, 1.0); cabinet(x + .79, F, -3.13, .57);
    for (let k = 0; k < 3; k++) monitor(x - .73 + k * .73, F + 1.31, -3.43, .66, .43, k + i);
    box(.65, .025, .22, x, F + .855, -2.88, C.dark); box(.10, .035, .15, x + .48, F + .86, -2.88, C.dark);
    box(.22, .50, .46, x - .93, F + .25, -3.25, C.dark); box(.025, .018, .005, x - .93, F + .44, -3.014, C.pixels);
    const phone = box(.22, .07, .24, x - .94, F + .88, -2.91, C.dark); phone.rotation.x = .13;
    box(.24, .055, .075, x - .94, F + .95, -2.98, C.dark); chair(x, F, -1.98, .05);
  }
  plant(8.15, F, -3.2, 1.25); plant(1.65, F, 1.9, 1.0);

  // 屋上の手すりと、固定端を動かさずにはためくオレンジの旗。
  for (const z of [-4.95, 4.95]) {
    for (const h of [.4, .92]) rod([-9, R + h, z], [9, R + h, z], .027, C.navy);
    for (let x = -9; x <= 9; x += 1.5) rod([x, R, z], [x, R + .92, z], .026, C.navy);
  }
  for (const x of [-9, 9]) {
    for (const h of [.4, .92]) rod([x, R + h, -4.95], [x, R + h, 4.95], .027, C.navy);
    for (let z = -3.5; z < 5; z += 1.5) rod([x, R, z], [x, R + .92, z], .026, C.navy);
  }
  rod([-6.8, R, -3], [-6.8, R + 3.1, -3], .04, C.navy);
  const flagGeo = new THREE.PlaneGeometry(1.8, .93, 12, 4);
  const flag = mesh(flagGeo, mat('#F4903C', { side: THREE.DoubleSide }), -5.9, R + 2.55, -3); flag.name = 'orange-flag';
  const flagPosition = flagGeo.attributes.position, flagRest = Float32Array.from(flagPosition.array);

  // 通常のカメラは正面より外。ボード出入りだけ室内を通り、床・天井を横断しない。
  // Warm practical lights: four here plus two in the host page, no extra shadow maps.
  for (const [x,y,z,power] of [[-5,3.45,-.4,42],[5,3.55,-.7,48],[-5.2,7.48,-1.8,38],[5.1,7.45,-2.3,36]]) {
    const light = new THREE.PointLight(0xffdfac,power,13,2); light.position.set(x,y,z); group.add(light);
  }
  C.warm.emissive.set('#fff0c8'); C.warm.emissiveIntensity=2.3;
  C.leaf.color.set('#385725'); C.navy.color.set('#101f2d'); C.window.color.set('#23303b');
  // Ceiling finishes, skirtings and air-conditioning cassettes.
  for (const base of [G,F]) for (const x of [-5,5]) {
    box(7.8,.045,9.8,x,base+3.72,0,base===G&&x>0?C.concrete:wall);
    box(7.9,.09,.035,x,base+.045,-4.87,C.wood);
    if(base===F || x<0) {
      box(1.1,.065,.90,x+1,base+3.65,1.0,C.cream);
      box(.78,.02,.62,x+1,base+3.61,1.0,C.dark);
      for(let i=0;i<12;i++) box(.78,.018,.025,x+1,base+3.59,.73+i*.049,C.stone);
    }
  }
  // Garage conduit, opening tracks, threshold drain, pallet stack.
  for(const x of [1.15,8.8]) {
    rod([x,G+.1,-4.7],[x,3.8,-4.7],.024,C.steel);
    rod([x,3.8,-4.7],[x,3.8,4.85],.024,C.steel);
    box(.14,3.8,.22,x,2.1,4.85,C.navy);
  }
  box(7.8,.20,.24,5,3.89,4.85,C.navy);
  box(7.8,.018,.25,5,G+.003,4.75,C.dark);
  for(let i=0;i<82;i++) box(.035,.021,.24,1.15+i*.095,G+.014,4.75,C.steel);
  for(let row=0;row<2;row++) {
    for(let i=0;i<6;i++) box(1.30,.045,.13,7.7,G+.10+row*.14,-3.8+i*.15,C.wood);
    for(const x of [7.15,8.25]) box(.12,.11,1,x,G+.055+row*.14,-3.4,C.wood);
  }
  // Desktop accessories, mugs with open rims, pens, telephones and copier details.
  function accessories(x,y,z) {
    const mug=mesh(cylinder,C.steel,x,y+.09,z);mug.scale.set(.07,.18,.07);
    const coffee=mesh(cylinder,C.dark,x,y+.182,z);coffee.scale.set(.061,.004,.061);
    rod([x+.07,y+.04,z],[x+.11,y+.12,z],.013,C.steel);
    const cup=mesh(cylinder,C.dark,x+.25,y+.08,z);cup.scale.set(.055,.16,.055);
    for(let i=0;i<7;i++) rod([x+.23+(i%3)*.016,y+.1,z],[x+.22+(i%3)*.028,y+.25+(i%2)*.035,z+(i%2)*.015],.006,i%2?C.wood:C.dark);
  }
  for(const [x,y,z] of [[-4.4,G+.85,2.1],[-6.4,G+.85,1.4],[-5.2,G+.85,-.6],[-5.2,F+.85,-.8],[2.5,F+.85,-2.9],[5.5,F+.85,-2.9]]) accessories(x,y,z);
  cabinet(-2.2,G,1.5,1.6); printer(-2.2,G+.86,1.5,1.1);
  desk(-2.3,G,-1.1,1.6,.9); laptop(-2.3,G+.85,-1.1); chair(-2.3,G,-.05);
  cabinet(-7.95,G,1.0,1.15); printer(-7.95,G+.86,1.0,1.1);
  plant(-8.5,G,5.7,.95); plant(-8.0,G,6.1,.7); plant(-1.55,F,-1.6,.95,true);
  plant(-2.0,F+.86,-3.6,.48); plant(7.2,F+.85,-3.2,.35);
  // Grounding shadows are shared transparent decals, independent of shadow-map count.
  for(const [x,y,z,w,d] of [[-5.65,G,1.65,4.8,3],[-5.5,G,-.65,3.6,1.8],[5.5,G,-.5,3.6,5.5],[-5.1,F,-.45,3.8,2.7],[3.05,F,-3.15,3.1,1.8],[5.65,F,-3.15,3.1,1.8]]) contact(x,y,z,w,d);
  for(const [x,y,z] of [[-7.65,G,1.55],[-3.65,G,1.5],[-6,F,.75],[-4.45,F,-1.5],[3.05,F,-1.98],[5.65,F,-1.98]]) contact(x,y,z,1.3,1.3);
  // Procedural dusk panorama: roofs, lit windows, trees, utility poles and sagging wires.
  const townMap=canvasMap(1024,(c,n)=> {
    const g=c.createLinearGradient(0,0,0,n);g.addColorStop(0,'#203c65');g.addColorStop(.42,'#7b879d');g.addColorStop(.60,'#d8a07d');g.addColorStop(.72,'#616d7b');g.addColorStop(1,'#233042');c.fillStyle=g;c.fillRect(0,0,n,n);
    for(let layer=0;layer<3;layer++) for(let i=0;i<22;i++) {
      const x=i*52+random()*18-20,y=610+layer*100+random()*60,w=38+random()*45,h=45+random()*60;
      c.fillStyle=['#64707c','#596472','#485364'][layer];c.fillRect(x,y,w,h);
      c.fillStyle=['#414f65','#334356','#293a4d'][layer];c.beginPath();c.moveTo(x-7,y);c.lineTo(x+w*.5,y-28);c.lineTo(x+w+7,y);c.closePath();c.fill();
      for(let j=0;j<4;j++){c.fillStyle=random()>.55?'#d6b57a':'#2d4157';c.fillRect(x+7+(j%2)*w*.48,y+12+Math.floor(j/2)*25,8,13);}
    }
    for(const x of [110,390,750,970]) {
      c.fillStyle='#293b50';c.fillRect(x,420,5,580);c.fillRect(x-27,458,59,5);c.fillRect(x-20,483,48,4);
      c.strokeStyle='#27384c';c.lineWidth=1.5;
      for(let j=0;j<4;j++){c.beginPath();c.moveTo(x-340,420+j*12);c.quadraticCurveTo(x-160,510+j*12,x,448+j*12);c.stroke();}
    }
    for(let i=0;i<40;i++){const x=random()*n,y=860+random()*160;c.fillStyle='#293e3c';c.beginPath();c.arc(x,y,12+random()*24,0,7);c.fill();}
  });
  const townMaterial=new THREE.MeshBasicMaterial({map:townMap,side:THREE.DoubleSide});
  for(const x of [-48,48]) {const m=mesh(flat,townMaterial,x,14,-4);m.scale.set(115,35,1);m.rotation.y=x>0?-Math.PI/2:Math.PI/2;m.name='window-town';} // 窓の外の町並み（部屋の中の場面だけ表示側が見せる）
  for(const [x,z] of [[14,2],[18,-13],[-15,5]]) {
    rod([x,0,z],[x,8,z],.07,C.steel);rod([x-.8,7.1,z],[x+.8,7.1,z],.04,C.dark);
    for(const dx of [-.6,0,.6]) for(let i=0;i<12;i++) {
      const z1=z+i*1.5,z2=z+(i+1)*1.5;
      rod([x+dx,7.2-Math.sin(i/12*Math.PI)*.6,z1],[x+dx,7.2-Math.sin((i+1)/12*Math.PI)*.6,z2],.008,C.dark);
    }
  }
  // Batch static repeated parts in world coordinates; keep photos and animated flag independent.
  group.updateMatrixWorld(true);
  const batches=new Map();
  group.traverse(o=> {
    if(!o.isMesh || o.name || o.material.transparent || o.geometry===flagGeo) return;
    const key=o.geometry.uuid+o.material.uuid+o.castShadow;
    if(!batches.has(key)) batches.set(key,[]);batches.get(key).push(o);
  });
  for(const objects of batches.values()) {
    if(objects.length<3) continue;
    const first=objects[0], instances=new THREE.InstancedMesh(first.geometry,first.material,objects.length);
    instances.name='static-detail-batch';instances.castShadow=first.castShadow;instances.receiveShadow=true;
    objects.forEach((o,i)=>{instances.setMatrixAt(i,o.matrixWorld);o.parent.remove(o);});
    instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();group.add(instances);
  }

  const anchors = {
    gaikan:   { pos: [19, 11, 28], look: [0, 3.7, 0], fov: 46 },
    orikomi:  { pos: [-5.8, 1.85, 8.3], look: [-4.9, 1.45, -1.8], fov: 45 },
    garage:   { pos: [7.5, 2.05, 7.1], look: [4.8, 1.45, -1.25], fov: 49 },
    magokoro: { pos: [-6.7, 6.15, 3.9], look: [-4.9, 5.70, -2.2], fov: 52 },
    board:    { pos: [BX, BY, -.7], look: [BX, BY, BZ + .049], fill: [OW, OH], fov: 48 },
    ai:       { pos: [2.0, 6.20, 2.3], look: [5.0, 5.90, -3.2], fov: 53 },
    okujo:    { pos: [-5.8, 11.3, 9.2], look: [6, 8.7, -15], fov: 50 },
    menu:     { pos: [28, 23, 37], look: [0, -2.4, 2], fov: 46 }
  };
  const panelSpots = {
    orikomi: [[-3.5, G, .7]], garage: [[7.6, G, 2.2]],
    magokoro: [[-3.0, F, -2.8]], ai: [[7.25, F, -4.0]]
  };
  function update(t) {
    screens.forEach((m,i) => { m.emissiveIntensity = .42 + Math.sin(t * 1.1 + i) * .015; });
    for (let i = 0; i < flagPosition.count; i++) {
      const offset = i * 3, u = (flagRest[offset] + .9) / 1.8;
      flagPosition.setZ(i, Math.sin(u * 7 - t * 2.3 + flagRest[offset + 1] * 1.4) * .13 * u);
    }
    flagPosition.needsUpdate = true; flagGeo.computeVertexNormals();
  }
  update(0);
  return { group, anchors, update, clickables, panelSpots };
}
