/* ============================================================
   content.js — renders Biography & Contact from JSON
   Usage:
     <div id="biography" data-src="data/biography.json"></div>
     <div id="contact"   data-src="data/contact.json"></div>
   ============================================================ */

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadJSON(src) {
  const res = await fetch(src, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function observeReveal(scope) {
  const items = scope.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Biography ---------- */
function renderBiography(el, data) {
  const reading = data.reading
    ? ` <span style="font-size:.5em;color:var(--fg-muted)">${esc(data.reading)}</span>`
    : "";

  const intro = (data.intro || [])
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");

  const facts = (data.facts || [])
    .map(
      (f) =>
        `<li><dt class="k">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></li>`
    )
    .join("");

  const portrait = data.portrait
    ? `<div class="reveal"><img class="bio-portrait" src="${esc(
        data.portrait
      )}" alt="${esc(data.name || "")} portrait" loading="lazy" /></div>`
    : "";

  const timeline = (data.timeline || [])
    .map(
      (t) => `
      <li class="timeline__item reveal">
        <span class="timeline__year">${esc(t.year || "")}</span>
        <div>
          <div class="timeline__title">${esc(t.title || "")}</div>
          ${t.detail ? `<div class="timeline__detail">${esc(t.detail)}</div>` : ""}
        </div>
      </li>`
    )
    .join("");

  const timelineBlock = timeline
    ? `
    <div style="margin-top:clamp(64px,10vw,120px)">
      <p class="section-head reveal">History</p>
      <ol class="timeline">${timeline}</ol>
    </div>`
    : "";

  el.innerHTML = `
    <p class="eyebrow reveal">Biography</p>
    <h1 class="page-title reveal">${esc(data.name || "")}${reading}</h1>

    <div class="bio-grid" style="margin-top:clamp(40px,7vw,72px)">
      ${portrait}
      <div class="bio-body reveal">
        ${intro}
        ${facts ? `<dl class="facts">${facts}</dl>` : ""}
      </div>
    </div>
    ${timelineBlock}
  `;
  observeReveal(el);
}

/* ---------- Contact ---------- */
function renderContact(el, data) {
  const links = (data.links || [])
    .map((l) => {
      const ext = l.url && !l.url.startsWith("mailto:")
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      const arrow = ext ? " ↗" : "";
      return `<li><a href="${esc(l.url || "#")}"${ext}><span class="label">${esc(
        l.label
      )}</span><span class="value">${esc(l.value || "")}${arrow}</span></a></li>`;
    })
    .join("");

  el.innerHTML = `
    <p class="eyebrow reveal">Contact</p>
    <h1 class="page-title reveal">お問い合わせ</h1>
    ${data.intro ? `<p class="lead reveal">${esc(data.intro)}</p>` : ""}
    <ul class="contact-list reveal" style="margin-top:clamp(40px,6vw,64px)">${links}</ul>
  `;
  observeReveal(el);
}

/* ---------- boot ---------- */
async function mount(id, renderer) {
  const el = document.getElementById(id);
  if (!el) return;
  const src = el.dataset.src;
  try {
    const data = await loadJSON(src);
    renderer(el, data);
  } catch (err) {
    el.innerHTML = `<p class="state">読み込みに失敗しました（${esc(
      src
    )}）。<br>ローカルで開く場合は簡易サーバー経由でご確認ください。</p>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  mount("biography", renderBiography);
  mount("contact", renderContact);
});
