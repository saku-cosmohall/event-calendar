// ============================================================
// ★ 設定欄 ★  ここだけ編集してください
// ============================================================
const CONFIG = {
  SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQvnIwcKJEakt21FcLiSqXgz0mr44_w7t-kr_9HnfoYTUOzxFRn1emhZoOUFgqK5SQb9JIuWRGp2QpE/pub?gid=0&single=true&output=csv',
  HALL_NAME: '穂の香ホール',
  CATEGORIES: ['音楽', '演劇・ダンス', '講座・WS', '展示・その他'],
};
// ============================================================

const COL = { NAME:0, START:1, END:2, TIME:3, PLACE:4, DESC:5, URL:8, CAT:9, IMG:10, PUB:11 };
const CAT_COLORS = ['var(--cat0)','var(--cat1)','var(--cat2)','var(--cat3)'];
const DAYS_JA = ['日','月','火','水','木','金','土'];

let events = [];

// ---- ヘッダー注入 ----
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  header.innerHTML = `
    <div class="header-inner">
      <a class="header-brand" href="index.html">
        <img class="header-cat-icon" src="images/header-cat.png" alt="">
        <div class="header-texts">
          <span class="header-sub">佐久市交流文化館浅科</span>
          <span class="header-name">穂の香ホール</span>
        </div>
      </a>
      <a class="header-btn" href="calendar.html">イベントカレンダー &rsaquo;</a>
    </div>
  `;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ---- フッター注入 ----
function initFooter() {
  const footer = document.getElementById('siteFooter');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <img class="footer-plant" src="images/honoka-icon.png" alt="">
          <p class="footer-sub">佐久市交流文化館浅科</p>
          <p class="footer-name">穂の香ホール</p>
        </div>
        <p class="footer-slippers-note">＼入るときはスリッパをはきます！／</p>
        <div class="footer-cat-wrap">
          <div class="footer-cat-line"></div>
          <img class="footer-cat-img" src="images/かわいいタビー猫とピンクのスリッパ.png" alt="">
          <div class="footer-cat-line"></div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-info">
          <span>〒385-0000 長野県佐久市○○1-2-3</span>
          <span>0267-00-0000</span>
          <span><a href="mailto:example@example.com">example@example.com</a></span>
          <span>開館時間 9:00〜21:00</span>
          <span>休館日：毎週月曜日・祝日の翌日</span>
        </div>
        <div class="footer-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3228.0!2d138.5!3d36.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDEyJzAwLjAiTiAxMzjCsDMwJzAwLjAiRQ!5e0!3m2!1sja!2sjp!4v0"
            allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            title="穂の香ホール 地図">
          </iframe>
        </div>
      </div>
      <p class="footer-copy">&copy; 穂の香ホール</p>
    </div>
  `;
}

// ---- モーダル注入 ----
function initModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modalOverlay';
  overlay.innerHTML = `
    <div class="modal" id="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <button class="modal-close" id="modalClose" aria-label="閉じる">✕</button>
      </div>
      <div id="modalContent"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function handleFlyerError(el) {
  el.parentElement.innerHTML = '<div class="modal-flyer-placeholder"><span>🎪</span><p>チラシ画像を準備中</p></div>';
}

function openModal(idx) {
  const ev = events[idx];
  const fileId = ev.imgId.trim();
  const imgUrl = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200` : null;
  const dateStr = (ev.end && ev.end !== ev.start) ? `${ev.start}　〜　${ev.end}` : ev.start;
  const catName  = CONFIG.CATEGORIES[ev.cat] || '';
  const catColor = CAT_COLORS[ev.cat] || CAT_COLORS[0];
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-flyer-wrap">
      ${imgUrl
        ? `<img class="modal-flyer" src="${imgUrl}" alt="${ev.name}のチラシ" onerror="handleFlyerError(this)">`
        : `<div class="modal-flyer-placeholder"><span>🎪</span><p>チラシなし</p></div>`}
    </div>
    <div class="modal-cat-badge" style="background:${catColor}">${catName}</div>
    <h2 class="modal-title">${ev.name}</h2>
    <div class="modal-info-list">
      ${dateStr ? `<div class="modal-info-row"><span class="modal-label">📅 日程</span><span class="modal-value">${dateStr}</span></div>` : ''}
      ${ev.time  ? `<div class="modal-info-row"><span class="modal-label">🕐 時間</span><span class="modal-value">${ev.time}</span></div>` : ''}
      ${ev.place ? `<div class="modal-info-row"><span class="modal-label">📍 会場</span><span class="modal-value">${ev.place}</span></div>` : ''}
    </div>
    ${ev.desc ? `<div class="modal-divider"></div><p class="modal-desc">${ev.desc}</p>` : ''}
    ${ev.url && ev.url !== '#' ? `
      <div class="modal-actions">
        <a class="btn-primary" href="${ev.url}" target="_blank" rel="noopener">主催者HPはこちら &rsaquo;</a>
      </div>` : '<div style="height:1.4rem"></div>'}
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modal').scrollTop = 0;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ---- データ取得 ----
async function loadFromSheet(onLoad) {
  if (CONFIG.SHEET_CSV_URL) {
    try {
      const res = await fetch(CONFIG.SHEET_CSV_URL);
      if (!res.ok) throw new Error();
      events = parseCSV(await res.text());
    } catch {
      events = [];
    }
  }
  onLoad();
}

function parseCSV(text) {
  const result = [];
  const lines = text.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (!cols[COL.NAME]) continue;
    if ((cols[COL.PUB] || '').toUpperCase() !== 'TRUE') continue;
    result.push({
      name:  cols[COL.NAME]  || '',
      start: cols[COL.START] || '',
      end:   cols[COL.END]   || cols[COL.START] || '',
      time:  cols[COL.TIME]  || '',
      place: cols[COL.PLACE] || '',
      desc:  cols[COL.DESC]  || '',
      imgId: cols[COL.IMG]   || '',
      url:   cols[COL.URL]   || '',
      cat:   Math.min(3, Math.max(0, parseInt(cols[COL.CAT] || '0') || 0)),
    });
  }
  return result;
}

function parseCSVLine(line) {
  const cols = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQ = !inQ; continue; }
    if (line[i] === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
    cur += line[i];
  }
  cols.push(cur.trim());
  return cols;
}

function toDate(str) {
  if (!str) return null;
  return new Date(str.replace(/\//g, '-') + 'T00:00:00');
}

function getEventsForDay(y, m, d) {
  const target = new Date(y, m, d);
  return events.filter(ev => {
    const s = toDate(ev.start);
    const e = toDate(ev.end) || s;
    return s && target >= s && target <= e;
  });
}
