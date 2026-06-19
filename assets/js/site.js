/* ============================================================
   site.js — shared chrome (header / footer) + small enhancements
   The nav is defined ONCE here, then injected into every page.
   Add a page → edit NAV below only.
   ============================================================ */

const NAV = [
  { href: "index.html", label: "Home" },
  { href: "biography.html", label: "Biography" },
  { href: "opus.html", label: "Opus" },
  { href: "project.html", label: "Project" },
  { href: "organization.html", label: "Organization" },
  { href: "contact.html", label: "Contact" },
];

const SITE = {
  name: "Tusq",
  logo: "assets/img/Tusq_B_Logo.png",
};

/* ---------- theme: fonts + colors from data/theme.json ----------
   Single source of truth for typography and palette.
   Edit data/theme.json — no need to touch CSS. */

function injectFontImports(urls) {
  if (!Array.isArray(urls)) return;
  urls.forEach((href) => {
    if (!href || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
}

function injectFontFaces(faces) {
  if (!Array.isArray(faces) || !faces.length) return;
  const css = faces
    .map((f) => `
@font-face {
  font-family: "${f.family}";
  src: url("${f.src}") format("${f.format || "woff2"}");
  font-weight: ${f.weight || "400"};
  font-style: ${f.style || "normal"};
  font-display: ${f.display || "swap"};
}`)
    .join("\n");
  const style = document.createElement("style");
  style.id = "theme-fonts";
  style.textContent = css;
  document.head.appendChild(style);
}

function applyColors(colors) {
  if (!colors) return;
  const root = document.documentElement;
  const set = (vars) => {
    if (!vars) return;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  };
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const paint = () => set(mq.matches && colors.dark ? colors.dark : colors.light);
  paint();
  mq.addEventListener?.("change", paint);
}

/* ----- accent (user-selectable, persisted in localStorage) ----- */
let THEME = null;
const ACCENT_KEY = "tusq-accent";

function accentOptions() {
  return THEME?.accents?.options || [];
}
function savedAccentId() {
  let saved = null;
  try { saved = localStorage.getItem(ACCENT_KEY); } catch (e) {}
  const opts = accentOptions();
  if (saved && opts.some((o) => o.id === saved)) return saved;
  return THEME?.accents?.default || opts[0]?.id;
}
function applyAccent(id) {
  const opts = accentOptions();
  const opt = opts.find((o) => o.id === id) || opts[0];
  if (!opt) return;
  const root = document.documentElement;
  root.style.setProperty("--accent", opt.value);
  root.style.setProperty("--on-accent", opt.on || "#fff");
  try { localStorage.setItem(ACCENT_KEY, opt.id); } catch (e) {}
  document.querySelectorAll(".swatch").forEach((s) =>
    s.setAttribute("aria-pressed", String(s.dataset.id === opt.id))
  );
}
function renderAccentPicker() {
  const host = document.getElementById("accent-picker");
  if (!host || !accentOptions().length) return;
  const current = savedAccentId();
  host.innerHTML =
    `<span class="accent-picker__label">Accent</span>` +
    accentOptions()
      .map(
        (o) =>
          `<button type="button" class="swatch" data-id="${o.id}" title="${o.label}" aria-label="アクセントカラー: ${o.label}" aria-pressed="${o.id === current}" style="background:${o.value}"></button>`
      )
      .join("");
  host.addEventListener("click", (e) => {
    const btn = e.target.closest(".swatch");
    if (btn) applyAccent(btn.dataset.id);
  });
}

async function applyTheme() {
  try {
    const res = await fetch("data/theme.json", { cache: "no-cache" });
    if (!res.ok) return;
    THEME = await res.json();
    if (THEME.fonts) {
      injectFontImports(THEME.fonts.imports);
      injectFontFaces(THEME.fonts.faces);
      const root = document.documentElement;
      if (THEME.fonts.serif) root.style.setProperty("--serif", THEME.fonts.serif);
      if (THEME.fonts.sans) root.style.setProperty("--sans", THEME.fonts.sans);
      if (THEME.fonts.label) root.style.setProperty("--label", THEME.fonts.label);
      if (THEME.fonts.script) root.style.setProperty("--script", THEME.fonts.script);
    }
    applyColors(THEME.colors);
    applyAccent(savedAccentId());
    renderAccentPicker();
  } catch (err) {
    console.warn("theme.json not loaded — using CSS defaults.", err);
  }
}

/* kick off ASAP (deferred script already runs after parse) */
applyTheme();

/* current file name, e.g. "opus.html" (default index.html) */
function currentPage() {
  const path = location.pathname.split("/").pop();
  return path && path.length ? path : "index.html";
}

function renderHeader() {
  const here = currentPage();
  const links = NAV.map((item) => {
    const cur = item.href === here ? ' aria-current="page"' : "";
    return `<a href="${item.href}"${cur}>${item.label}</a>`;
  }).join("");

  return `
  <div class="wrap site-header__inner">
    <a class="brand" href="index.html" aria-label="${SITE.name} — Home">
      <img src="${SITE.logo}" alt="" />
      <span>${SITE.name}</span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">Menu</button>
    <nav class="nav" id="primary-nav" aria-label="Primary">${links}</nav>
  </div>`;
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <div class="wrap site-footer__inner">
    <span>© ${year} ${SITE.name}</span>
    <div class="accent-picker" id="accent-picker"></div>
    <span>Composer / Instrumentalist</span>
  </div>`;
}

function mountChrome() {
  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = renderHeader();

    const toggle = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav?.addEventListener("click", (e) => {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = renderFooter();
    renderAccentPicker();
  }
}

/* reveal-on-scroll */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px" }
  );
  items.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  mountChrome();
  initReveal();
});
