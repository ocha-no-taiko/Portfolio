/* ============================================================
   collection.js — renders Opus / Project grids from JSON
   Usage in HTML:
     <div class="collection"
          data-src="data/works.json"
          data-kind="opus"></div>
   Each page also needs the shared modal markup (#modal).
   ============================================================ */

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---- embed builders ---- */
function youtubeId(url = "") {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : url.length === 11 ? url : null;
}
function vimeoId(url = "") {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : /^\d+$/.test(url) ? url : null;
}

function buildEmbed(embed) {
  if (!embed || !embed.type) return "";
  const t = embed.type.toLowerCase();

  if (t === "youtube") {
    const id = youtubeId(embed.url || embed.id || "");
    if (!id) return "";
    return `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}"
      title="YouTube video" loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe></div>`;
  }
  if (t === "vimeo") {
    const id = vimeoId(embed.url || embed.id || "");
    if (!id) return "";
    return `<div class="embed"><iframe src="https://player.vimeo.com/video/${id}"
      title="Vimeo video" loading="lazy" allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen></iframe></div>`;
  }
  if (t === "soundcloud") {
    const u = encodeURIComponent(embed.url || "");
    if (!u) return "";
    return `<div class="embed embed--audio"><iframe loading="lazy"
      src="https://w.soundcloud.com/player/?url=${u}&color=%23999999&inverse=false&auto_play=false&show_user=true"
      title="SoundCloud player"></iframe></div>`;
  }
  if (t === "spotify") {
    const u = embed.url || "";
    const path = u.replace(/^https?:\/\/open\.spotify\.com\//, "");
    if (!path) return "";
    return `<div class="embed embed--audio"><iframe loading="lazy" style="height:152px"
      src="https://open.spotify.com/embed/${path}"
      title="Spotify player" allow="encrypted-media"></iframe></div>`;
  }
  if (t === "iframe" && embed.url) {
    return `<div class="embed"><iframe src="${esc(embed.url)}" title="Embedded media"
      loading="lazy" allowfullscreen></iframe></div>`;
  }
  return "";
}

/* statuses that mean "no longer active" → shown as a muted gray badge */
const INACTIVE_STATUS = [
  "done", "disbanded", "解散", "終了", "完了", "休止",
  "indefinitely suspended", "suspended", "finished", "ended",
];
function isInactiveStatus(status = "") {
  const s = status.toLowerCase();
  return INACTIVE_STATUS.some((kw) => s.includes(kw));
}

/* ---- updates (project activity log: upcoming exhibitions/talks/etc.) ---- */
function isUpcomingUpdate(status = "") {
  return status.trim().toLowerCase() === "upcoming";
}

function nextUpdateHTML(updates) {
  if (!Array.isArray(updates)) return "";
  const next = updates.find((u) => isUpcomingUpdate(u.status));
  if (!next) return "";
  return `
    <div class="card__next">
      <span class="card__next-dot"></span>
      <span class="card__next-date">${esc(next.date || "")}</span>
      <span>${esc(next.label || "")}</span>
    </div>`;
}

function buildUpdatesTimeline(updates) {
  if (!Array.isArray(updates) || !updates.length) return "";
  const items = updates
    .map((u) => {
      const upcoming = isUpcomingUpdate(u.status);
      const badge = `<span class="update-badge ${upcoming ? "update-badge--upcoming" : "update-badge--done"}">${upcoming ? "予定" : "開催済み"}</span>`;
      const label = u.url
        ? `<a href="${esc(u.url)}" target="_blank" rel="noopener noreferrer">${esc(u.label || "")}</a>`
        : esc(u.label || "");
      return `
      <li class="timeline__item">
        <span class="timeline__year">${esc(u.date || "")}</span>
        <div>
          <div class="timeline__title">${label}${badge}</div>
          ${u.detail ? `<div class="timeline__detail">${esc(u.detail)}</div>` : ""}
        </div>
      </li>`;
    })
    .join("");
  return `
    <p class="section-head">Updates</p>
    <ol class="timeline timeline--updates" style="margin-bottom:1.6em">${items}</ol>`;
}

/* ---- card ---- */
function cardHTML(item, index) {
  const status =
    item.status && !["released", "公開"].includes(item.status.toLowerCase())
      ? `<span class="card__status${isInactiveStatus(item.status) ? " card__status--inactive" : ""}">${esc(item.status)}</span>`
      : "";

  const inner = item.cover
    ? `<img src="${esc(item.cover)}" alt="${esc(item.title)}" loading="lazy" />`
    : `<span>${esc((item.title || "·")[0])}</span>`;

  const mediaClass = item.cover ? "card__media" : "card__media card__media--empty";

  return `
  <button class="card reveal" data-index="${index}" aria-haspopup="dialog">
    <div class="${mediaClass}">${status}${inner}</div>
    <div class="card__head">
      <span class="card__title">${esc(item.title || "Untitled")}</span>
      ${item.year ? `<span class="card__year">${esc(item.year)}</span>` : ""}
    </div>
    ${item.type ? `<span class="card__meta">${esc(item.type)}</span>` : ""}
    ${nextUpdateHTML(item.updates)}
  </button>`;
}

/* ---- modal ---- */
let lastFocused = null;

function openModal(item) {
  const modal = document.getElementById("modal");
  if (!modal) return;
  const panel = modal.querySelector(".modal__body");

  const cover = item.cover
    ? `<img class="modal__cover" src="${esc(item.cover)}" alt="${esc(item.title)}" />`
    : "";
  const embed = buildEmbed(item.embed);
  const tags =
    Array.isArray(item.tags) && item.tags.length
      ? `<div class="tags">${item.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`
      : "";
  const links =
    Array.isArray(item.links) && item.links.length
      ? `<div class="links">${item.links
          .map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} <span>↗</span></a>`)
          .join("")}</div>`
      : "";

  const metaBits = [item.year, item.type, item.role, item.status].filter(Boolean).map(esc).join(" · ");
  const updates = buildUpdatesTimeline(item.updates);

  panel.innerHTML = `
    <h2 class="modal__title">${esc(item.title || "Untitled")}</h2>
    ${metaBits ? `<p class="modal__meta">${metaBits}</p>` : ""}
    ${embed || cover}
    ${item.description ? `<div class="modal__desc">${esc(item.description).replace(/\n/g, "<br>")}</div>` : ""}
    ${updates}
    ${tags}
    ${links}
  `;

  lastFocused = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal__close")?.focus();
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modal.querySelector(".modal__body").innerHTML = "";
  document.body.style.overflow = "";
  lastFocused?.focus();
}

function initModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  modal.querySelector(".modal__backdrop")?.addEventListener("click", closeModal);
  modal.querySelector(".modal__close")?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

/* ---- main ---- */
async function renderCollection(container) {
  const src = container.dataset.src;
  const empty = container.dataset.empty || "まだ項目がありません。";
  container.innerHTML = `<p class="state">Loading…</p>`;

  let items = [];
  try {
    const res = await fetch(src, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    items = await res.json();
  } catch (err) {
    container.innerHTML = `<p class="state">読み込みに失敗しました（${esc(src)}）。<br>ローカルで開く場合は簡易サーバー経由でご確認ください。</p>`;
    console.error(err);
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `<p class="state">${esc(empty)}</p>`;
    return;
  }

  container.innerHTML = items.map(cardHTML).join("");

  // re-run reveal observer for freshly-injected cards
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    container.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    container.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  container.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const item = items[Number(card.dataset.index)];
    if (item) openModal(item);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initModal();
  document.querySelectorAll(".collection[data-src]").forEach(renderCollection);
});
