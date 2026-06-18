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
  { href: "contact.html", label: "Contact" },
];

const SITE = {
  name: "Tusq",
  logo: "assets/img/Tusq_B_Logo.png",
};

/* ---------- theme: fonts + colors from data/theme.json ----------
   Single source of truth for typography and palette.
   Edit data/theme.json — no need to touch CSS. */

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

async function applyTheme() {
  try {
    const res = await fetch("data/theme.json", { cache: "no-cache" });
    if (!res.ok) return;
    const theme = await res.json();
    if (theme.fonts) {
      injectFontFaces(theme.fonts.faces);
      const root = document.documentElement;
      if (theme.fonts.serif) root.style.setProperty("--serif", theme.fonts.serif);
      if (theme.fonts.sans) root.style.setProperty("--sans", theme.fonts.sans);
    }
    applyColors(theme.colors);
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
