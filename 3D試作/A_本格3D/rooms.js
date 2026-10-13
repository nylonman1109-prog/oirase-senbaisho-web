// 焼き付けた部屋（Blender で作った glb＋ライトマップ）を、3Dの建物の各部屋にはめ込む。
// 部屋が読み込めたら、その部屋の範囲にある建物側の家具・壁などを隠し、カメラ位置・パネル位置・コルクボードを部屋に合わせる。
// 読み込めなかった部屋は、建物側の簡単な部屋のまま表示される。
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// offset … 部屋の床の中心を置く場所（建物の座標）。y は床の高さ＋少し（建物の床と重なってちらつかないように）
// hide   … この箱の中にある建物側の物を隠す [最小, 最大]
// 使った Sketchfab モデル（CC-BY）の作者名。ページの「3D素材のクレジット」に出す
export const CREDITS = new Map();

const ROOMS = [
  { id: 'orikomi', name: 'office', offset: [-5, .204, .38], hide: [[-8.95, .15, -4.95], [-1.05, 4.0, 5.08]] },
  { id: 'garage', name: 'garage', offset: [5, .204, 0], hide: [[1.05, .15, -4.95], [8.95, 4.0, 5.08]] },
  { id: 'magokoro', name: 'magokoro', offset: [-5, 4.204, 0], hide: [[-8.95, 4.15, -4.95], [-1.05, 8.0, 5.08]] },
  { id: 'ai', name: 'ai', offset: [5, 4.204, 0], hide: [[1.05, 4.15, -4.95], [8.95, 8.0, 5.08]] },
];

export async function loadRooms({ THREE, renderer, scene, group, anchors, panels, clickables, boardLayout, onRoom }) {
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const draco = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
  const gltf = new GLTFLoader().setDRACOLoader(draco);
  const tex = new THREE.TextureLoader();
  const add = (a, o) => [a[0] + o[0], a[1] + o[1], a[2] + o[2]];
  group.updateMatrixWorld(true);

  // 建物側の物のうち、箱の中にあるものを隠す（InstancedMesh は1つずつ）
  function hideInside([lo, hi]) {
    const inBox = p => p.x > lo[0] && p.x < hi[0] && p.y > lo[1] && p.y < hi[1] && p.z > lo[2] && p.z < hi[2];
    const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), b = new THREE.Box3();
    group.traverse(o => {
      if (!o.isMesh || !o.visible) return;
      if (o.isInstancedMesh) {
        let changed = false;
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, m); p.setFromMatrixPosition(m.clone().premultiply(o.matrixWorld));
          if (inBox(p)) { m.decompose(p, q, s); m.compose(p, q, s.set(0, 0, 0)); o.setMatrixAt(i, m); changed = true; }
        }
        if (changed) o.instanceMatrix.needsUpdate = true;
      } else if (inBox(b.setFromObject(o).getCenter(p))) o.visible = false;
    });
  }

  // ライトマップを当てる（模様 × 光）。Display_ の付く画面は対象外
  async function applyLightmaps(root, dir, meta) {
    const maps = {};
    await Promise.all(Object.entries(meta.lightmaps).map(([name, file]) => new Promise(ok => tex.load(dir + file, t => {
      t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.channel = 1; maps[name] = t; ok();
    }, undefined, ok))));
    root.traverse(o => {
      if (!o.isMesh) return;
      let n = o, key = null;
      while (n && !key) { key = Object.keys(maps).find(k => n.name === k || n.name.startsWith(k + '_')); n = n.parent; }
      for (const mat of [].concat(o.material)) {
        if (mat.map) mat.map.anisotropy = aniso;               // 斜めから見た床のちらつきを抑える
        if (key && !/^Display_/.test(mat.name)) { mat.lightMap = maps[key]; mat.lightMapIntensity = meta.lightmapIntensity; mat.needsUpdate = true; }
      }
    });
  }

  // まごころのコルクボードに写真・チラシを貼る（貼り位置は _common/scenes.js の SLOTS）
  function pinBoard(b, off) {
    const c = new THREE.Vector3(...add(b.center, off)), R = new THREE.Vector3(...b.right), U = new THREE.Vector3(...b.up), N = new THREE.Vector3(...b.normal);
    const [W, H] = b.size;
    for (const it of boardLayout()) {
      const [x, y, w, h, r] = it.slot;
      const pos = c.clone().addScaledVector(R, (x + w / 2 - .5) * W).addScaledVector(U, (.5 - (y + h / 2)) * H).addScaledVector(N, .012);
      const g = new THREE.Group(); g.position.copy(pos); g.lookAt(pos.clone().add(N)); g.rotateZ(-r * Math.PI / 180);
      const pw = w * W, ph = h * H;
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(pw * 1.06, ph * 1.08), new THREE.MeshBasicMaterial({ color: it.src ? 0xf4f1ea : (it.flyer ? 0xd9772e : 0xf1e3c8) }));
      g.add(frame);
      if (it.src) {
        const pm = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        const photo = new THREE.Mesh(new THREE.PlaneGeometry(pw * .94, ph * .9), pm); photo.position.z = .003; g.add(photo);
        tex.load(it.src, t => { t.colorSpace = THREE.SRGBColorSpace; pm.map = t; pm.color.set(0xd8d4cc); pm.needsUpdate = true; });
        photo.userData.photo = it.i; clickables.push(photo);
      }
      const pin = new THREE.Mesh(new THREE.SphereGeometry(.025, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc8382a }));
      pin.position.set(0, ph * .46, .02); g.add(pin);
      scene.add(g);
    }
  }

  for (const r of ROOMS) {                     // 1部屋ずつ順に読む（最初の部屋から見られるように）
    const dir = `rooms/${r.name}/`;
    try {
      const meta = await (await fetch(dir + r.name + '_meta.json')).json();
      const g = await gltf.loadAsync(dir + r.name + '.glb');
      await applyLightmaps(g.scene, dir, meta);
      g.scene.position.set(...r.offset);
      hideInside(r.hide);
      scene.add(g.scene);
      // カメラの止まる位置を部屋に合わせる
      Object.assign(anchors[r.id], { pos: add(meta.camera.pos, r.offset), look: add(meta.camera.look, r.offset), fov: meta.camera.fov });
      // スタッフのパネルを部屋の中に立て直す
      const spot = add(meta.panelSpot, r.offset);
      panels.filter(p => p.userData.scene === r.id).forEach((p, i) => p.position.set(spot[0] + i * .9, spot[1], spot[2]));
      if (meta.board) {
        const b = meta.board, c = add(b.center, r.offset);
        Object.assign(anchors.board, { look: c, pos: c.map((v, k) => v + b.normal[k] * 3), fill: b.fill, normal: b.normal, fov: 48 });
        pinBoard(b, r.offset);
      }
      try { (await (await fetch(dir + r.name + '_credits.json')).json()).forEach(c => CREDITS.set(c.url, c)); } catch {}
      onRoom?.(r.id, meta);
    } catch (e) { console.warn('部屋を読み込めませんでした', r.name, e); }
  }
}

// クリック判定用：親まで含めて表示されているか
export const shown = o => { for (let n = o; n; n = n.parent) if (!n.visible) return false; return true; };
