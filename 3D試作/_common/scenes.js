// 3案（A本格3D／B写真疑似3D／C断面イラスト）で共通の「順路」と文面、スクロール制御。
// 文面を直すときはここだけ直せば3案すべてに反映される。

const SITE = '../../mockup/案3_攻め/'; // 詳しいページへのリンク先（今の案3）
const IMG = '../../素材/画像/';

// まごころサポートのコルクボードに貼る「これまでのお手伝い」。
// 今は仮の写真。実際の案件写真・チラシに差し替える（ボードに貼られ、タップで拡大）。
// [画像, ひとこと, 'flyer'（チラシのときだけ）]。写真は最大6枚、チラシは最大2枚
export const BOARD = [
  [IMG + 'magokoro_light.jpg',    '電球の交換'],
  [IMG + 'magokoro_garden.jpg',   'お庭の草取り'],
  [IMG + 'magokoro_shopping.jpg', '買い物のお届け'],
  [IMG + 'mimamori_greet.jpg',    '毎朝の見守り'],
];

// ボードの貼り位置（A・C・Geminiの絵で共通）。ボードを 16:9 として、左上からの割合 [x, y, 幅, 高さ, 傾き(度)]
// 左3列×2段＝写真6枚（横長）、右端の列＝チラシ2枚（縦長）
export const SLOTS = {
  photo: [[.04, .09, .21, .34, -3], [.275, .07, .21, .34, 2], [.51, .10, .21, .34, -2],
          [.05, .55, .21, .34, 2], [.285, .57, .21, .34, -2], [.515, .54, .21, .34, 3]],
  flyer: [[.77, .07, .19, .41, -4], [.775, .53, .19, .41, 3]],
};
// BOARD を貼り位置に割り当てる → [{ src, cap, i(BOARDの番号), slot:[x,y,w,h,r], flyer }]（空きの所は src なし）
export function boardLayout() {
  const out = [], ph = [], fl = [];
  BOARD.forEach(([src, cap, kind], i) => (kind === 'flyer' ? fl : ph).push({ src, cap, i, flyer: kind === 'flyer' }));
  SLOTS.photo.forEach((slot, k) => out.push({ ...(ph[k] || {}), slot, flyer: false }));
  SLOTS.flyer.forEach((slot, k) => out.push({ ...(fl[k] || {}), slot, flyer: true }));
  return out;
}

// おいらせ店のメンバーの等身大パネル（Aの3Dで、各事業部の場面に立てる）。
// 写真は「背景を消した全身のPNG（縦長）」を ../素材/スタッフ/ に置く。src が空の間は「写真待ち」の仮パネルが立つ
export const STAFF = [
  { scene: 'orikomi',  src: '', name: '', role: '新聞・折込事業部' },
  { scene: 'garage',   src: '', name: '', role: '宅配・物流事業部' },
  { scene: 'magokoro', src: '', name: '', role: 'まごころサポート事業部' },
  { scene: 'ai',       src: '', name: '', role: 'AI事業部' },
];

export const SCENES = [
  { id: 'gaikan',   kicker: 'WHAT WE DO', floor: '会社',
    title: '毎朝この町をまわる、<br>私たちの仕事。',
    body: 'スクロールして、会社の中をのぞいてみてください。' },
  { id: 'orikomi',  kicker: 'NEWSPAPER', floor: '新聞・折込',
    title: '新聞・折込事業部', catch: '毎朝の新聞は、ここから。',
    body: '届いた新聞にチラシを1部ずつ組み込み、おいらせ町・八戸市市川町のご家庭へ、デーリー東北を毎朝お届けしています。',
    link: ['新聞のご購読', 'newspaper.html'] },
  { id: 'garage',   kicker: 'DELIVERY', floor: '宅配・物流',
    title: '宅配・物流事業部', catch: '毎朝の配達網を、貴社の配送に。',
    body: '郵便局の業務委託や運送会社の協力会社として培った配達力で、荷物を一軒一軒お届けします。折込広告のご相談も承ります。',
    link: ['企業の方へ', 'business.html'] },
  { id: 'magokoro', kicker: 'LIFE SUPPORT', floor: 'まごころ',
    title: 'まごころサポート事業部', catch: '暮らしの「ちょっと困った」に。',
    body: '電球交換から買い物、見守りまで。毎朝この町をまわるスタッフが、暮らしのお手伝いをしています。' },
  // まごころの部屋から、コルクボードに寄って画面いっぱいに映す（カードは小さく）
  { id: 'board',    kicker: 'LIFE SUPPORT', floor: 'ボード', mini: true,
    title: 'これまでのお手伝い',
    body: '写真をタップすると大きく見られます。',
    link: ['まごころサポート', 'magokoro.html'] },
  { id: 'ai',       kicker: 'AI DIVISION', floor: 'AI',
    title: 'AI事業部', catch: '企業のAI導入を、現場の目線で。',
    body: '紙の記録や手作業を、アプリとAIに。まず自分たちの現場で試し、役立ったものを地域の会社へお届けします。',
    link: ['AI事業部', 'ai.html'] },
  // 屋上：会社の想い（採用は締めに移したので、いったんこの役にしている。不要なら外す）
  { id: 'okujo',    kicker: 'OUR VISION', floor: '想い',
    title: '青森の毎朝を、<br>止めない。',
    body: '雨の日も雪の日も、朝は必ずやってきます。だから私たちは、毎朝この町をまわり続けます。' },
  { id: 'menu',     kicker: 'RECRUIT', floor: '採用',
    title: '毎朝の町を、<br>一緒にまわろう。',
    body: 'まだ暗いうちから、この町の1日を動かす仕事です。一緒に働く仲間を探しています。',
    link: ['採用情報', 'recruit.html'],
    menu: [['企業の方へ', 'business.html'], ['新聞のご購読', 'newspaper.html'], ['まごころサポート', 'magokoro.html'],
           ['AI事業部', 'ai.html'], ['会社概要', 'company.html'], ['お問い合わせ', 'contact.html']] },
];

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
// 各シーンで少し「止まる」ようにする（区間の前後20%は動かない）
export const dwell = t => { const x = clamp((t - 0.2) / 0.6); return x * x * (3 - 2 * x); };

// 写真を大きく見るための窓（コルクボードの写真・スタッフのパネルをクリックしたとき）
export function openImage(src, caption) {
  openPhoto(-1);
  const lb = document.getElementById('xlb');
  lb.querySelector('img').src = src;
  lb.querySelector('p').textContent = caption;
}
export function openPhoto(i) {
  let lb = document.getElementById('xlb');
  if (!lb) {
    document.body.insertAdjacentHTML('beforeend', '<div class="x-lb" id="xlb" role="dialog" aria-modal="true"><button class="x" aria-label="閉じる">×</button><img alt=""><p></p></div>');
    lb = document.getElementById('xlb');
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('x')) lb.classList.remove('on'); });
    addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });
  }
  if (i >= 0) {
    lb.querySelector('img').src = BOARD[i][0];
    lb.querySelector('p').textContent = BOARD[i][1] + '（仮の写真）';
  }
  lb.classList.add('on');
}

// 最初の画面：写真＋キャッチ（今の案3トップと同じ構図）。スクロールすると消えて、建物が現れる
const HERO = `
  <section class="x-hero" id="xhero">
    <img src="${IMG}hero_dawn.jpg" alt="夜明け前の住宅街を走る配達バイク">
    <div class="x-hero-in">
      <p class="kk">DAILY TOHOKU OIRASE</p>
      <p class="pre">新聞を届ける会社から、</p>
      <h1>地域を<br><span>毎朝</span>まわる<br>会社へ</h1>
      <p class="sub">青森の毎朝を止めない<small>EVERY MORNING, EVERY DOOR.</small></p>
      <div class="cta"><a href="${SITE}business.html" class="o">企業の方へ<span>→</span></a><a href="${SITE}contact.html">お問い合わせ<span>→</span></a></div>
    </div>
  </section>`;

// 画面の枠（ヘッダー・最初の写真・文面カード・右の目次・スクロール用の余白）を作り、
// スクロールのたびに onProgress(p) を呼ぶ。p は 0〜(シーン数-1) の小数。
export function setupScroll({ label, onProgress }) {
  const N = SCENES.length;
  document.body.insertAdjacentHTML('beforeend', `
    ${HERO}
    <header class="x-hd">
      <a class="x-logo" href="../index.html"><span class="x-mark"></span><b>OIRASE<i>.</i></b><small>${label}</small></a>
      <nav class="x-sw"><a href="../A_本格3D/index.html">A</a><a href="../B_写真疑似3D/index.html">B</a><a href="../C_断面イラスト/index.html">C</a></nav>
    </header>
    <div class="x-card" id="xcard"></div>
    <nav class="x-dots" id="xdots">${SCENES.map((s, i) => `<button data-i="${i}" aria-label="${s.floor}へ"><span>${s.floor}</span></button>`).join('')}</nav>
    <p class="x-hint" id="xhint">SCROLL</p>
    <div class="x-spacer" style="height:${(N + 1) * 100}svh"></div>
  `);
  for (const a of document.querySelectorAll('.x-sw a')) if (location.pathname.includes(encodeURI(a.getAttribute('href').split('/')[1]))) a.classList.add('on');

  const hero = document.getElementById('xhero');
  const card = document.getElementById('xcard');
  const dots = [...document.querySelectorAll('#xdots button')];
  dots.forEach(b => b.addEventListener('click', () => scrollTo({ top: (+b.dataset.i + 1) * innerHeight, behavior: 'smooth' })));
  card.addEventListener('click', e => { const t = e.target.closest('[data-ph]'); if (t) openPhoto(+t.dataset.ph); });

  let cur = -1;
  const show = i => {
    const s = SCENES[i];
    card.classList.remove('in');
    card.classList.toggle('mini', !!s.mini);
    setTimeout(() => {
      card.innerHTML = `<p class="k">${s.kicker}</p><h2>${s.title}</h2>`
        + (s.catch ? `<p class="c">${s.catch}</p>` : '')
        + (s.body ? `<p class="b">${s.body}</p>` : '')
        + (s.gallery ? `<div class="gl">${s.gallery.map((g, j) => `<button data-ph="${j}" aria-label="${g[1]}の写真を見る"><img src="${g[0]}" alt=""><span>${g[1]}</span></button>`).join('')}</div>` : '')
        + (s.link ? `<a class="go" href="${SITE}${s.link[1]}">${s.link[0]}を詳しく<span>→</span></a>` : '')
        + (s.menu ? `<div class="m">${s.menu.map(m => `<a href="${SITE}${m[1]}">${m[0]}<span>→</span></a>`).join('')}</div>` : '');
      card.classList.add('in');
    }, cur === -1 ? 0 : 180);
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
    cur = i;
  };

  const tick = () => {
    if (!innerHeight) return;                        // 画面が開ききる前（高さ0）は計算しない
    const h = scrollY / innerHeight;                 // 0〜1 が最初の写真、その先が建物
    const heroT = clamp(h);
    hero.style.opacity = 1 - clamp((heroT - .15) / .7);
    hero.style.transform = `scale(${1 + heroT * .15})`;
    hero.style.visibility = heroT >= 1 ? 'hidden' : 'visible';
    document.body.classList.toggle('hero-on', heroT < .6);
    const p = clamp(h - 1, 0, N - 1);
    const i = Math.min(N - 1, Math.floor(p + 0.5));
    if (i !== cur) show(i);
    document.getElementById('xhint').style.opacity = h < .15 ? 1 : 0;
    onProgress(p);
  };
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  tick();
  return { N };
}
