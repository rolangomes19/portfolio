/* main.js — theme toggle, direction/language toggle, motion-safe reveals.
   No dependencies. Runs after DOM parse (script tag uses `defer`). */

(() => {
  "use strict";

  const root = document.documentElement;

  /* Reassigned by section 6 (only when the page has zoomable images) so
     section 2's language toggle can keep the lightbox's per-image labels
     in sync without section 2 needing to know section 6 exists. */
  let refreshLightboxLabels = () => {};

  /* Populated by section 4 the first time the mat colour is anything other
     than each theme's own plain default (i.e. a swatch was picked, a custom
     colour was typed, or a saved one was restored on load) — {light, dark}
     accent sets for whatever the mat currently is. Read by setTheme() below
     so a theme toggle re-applies the CORRECT half of an already-customised
     mat's accent pair instantly, with no recomputation. Left null in the
     plain-default case: --color-accent's own per-theme values in tokens.css
     already track each theme's own default mat with no JS involved, so
     there is nothing for a toggle to do. */
  let currentMatAccentSets = null;

  /* ------------------------------------------------------------------
     1. Theme toggle
     Order of truth: saved choice > OS preference > light.
     (An inline script in <head> applies the saved theme before paint
     to avoid a flash — this section only wires the button.)
  ------------------------------------------------------------------ */
  const themeBtn = document.querySelector("[data-theme-toggle]");

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
    }
    // The mat itself doesn't change with the theme, so if it's currently
    // driving a non-default accent, that accent needs to be re-solved for
    // the theme just switched TO — a hue that clears 4.5:1 on light parchment
    // is not the same lightness that clears 4.5:1 on dark paper.
    if (currentMatAccentSets) applyAccentSets(currentMatAccentSets);
  };

  if (themeBtn) {
    themeBtn.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    themeBtn.addEventListener("click", () => {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  /* ------------------------------------------------------------------
     2. Direction / language toggle (en-LTR <-> ar-RTL)
     Layout mirrors automatically because the CSS uses logical
     properties. UI chrome strings swap via data-i18n keys below.
     Long-form content stays English in v1 (see docs/CONTENT-GUIDE.md).
  ------------------------------------------------------------------ */
  const STRINGS = {
    en: {
      skip: "Skip to main content",
      "nav.work": "Works",
      "nav.about": "About",
      "nav.writing": "Writing",
      "nav.morework": "More work",
      "nav.contact": "Contact",
      "nav.toggle": "Menu",
      "toggle.theme": "Toggle dark mode",
      "toggle.lang": "العربية", // button shows the OTHER language
      "actions.work": "View my work",
      "actions.cv": "Download my Resume",
      "footer.contact": "Contact",
      "footer.explore": "Explore",
      "footer.elsewhere": "Elsewhere",
      "lightbox.expand": "View full-screen",
      "lightbox.close": "Close",
    },
    ar: {
      skip: "تخطَّ إلى المحتوى الرئيسي",
      "nav.work": "الأعمال",
      "nav.about": "نبذة عني",
      "nav.writing": "الكتابة",
      "nav.morework": "أعمال أخرى",
      "nav.contact": "تواصل",
      "nav.toggle": "القائمة",
      "toggle.theme": "تبديل الوضع الداكن",
      "toggle.lang": "English",
      "actions.work": "عرض أعمالي",
      "actions.cv": "تحميل سيرتي الذاتية",
      "footer.contact": "تواصل",
      "footer.explore": "استكشف",
      "footer.elsewhere": "أماكن أخرى",
      "lightbox.expand": "عرض بملء الشاشة",
      "lightbox.close": "إغلاق",
    },
  };

  const langBtn = document.querySelector("[data-lang-toggle]");

  const applyLang = (lang) => {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);

    const dict = STRINGS[lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => {
      const key = el.dataset.i18nLabel;
      if (dict[key]) el.setAttribute("aria-label", dict[key]);
    });
    if (langBtn) {
      langBtn.setAttribute("aria-pressed", String(lang === "ar"));
    }
  };

  const savedLang = localStorage.getItem("lang");
  if (savedLang === "ar") applyLang("ar");

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      applyLang(root.lang === "ar" ? "en" : "ar");
      refreshLightboxLabels();
    });
  }

  /* ------------------------------------------------------------------
     3. Scroll reveal — motion-safe.
     Elements with [data-reveal] fade/rise once. If the user prefers
     reduced motion, we never add the class, so nothing moves. Nothing is
     hidden by CSS alone, so with JS off all content is visible.

     Siblings that reveal together are staggered by --reveal-stagger, so a
     row of cards arrives as a sequence rather than a single block. The
     stagger is capped so a long list never leaves the last item waiting.
  ------------------------------------------------------------------ */
  const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");

  /* [data-reveal-children] is shorthand: it opts every direct child in, so a
     card grid or a long article body can stagger without tagging each node in
     the markup. Expand it before collecting, so the two are indistinguishable
     from here on. */
  document.querySelectorAll("[data-reveal-children]").forEach((parent) => {
    Array.prototype.forEach.call(parent.children, (child) =>
      child.setAttribute("data-reveal", "")
    );
  });

  const revealEls = document.querySelectorAll("[data-reveal]");

  const MAX_STAGGER_STEPS = 5;

  /* Position among the siblings that also reveal — the visual row/list the
     element belongs to, which is what the eye reads as a sequence. */
  function staggerIndex(el) {
    if (!el.parentElement) return 0;
    const peers = Array.prototype.filter.call(
      el.parentElement.children,
      (child) => child.hasAttribute("data-reveal")
    );
    return Math.min(peers.indexOf(el), MAX_STAGGER_STEPS);
  }

  function show(el) {
    el.style.setProperty(
      "--reveal-delay",
      `calc(var(--reveal-stagger) * ${staggerIndex(el)})`
    );
    el.classList.add("is-visible");
  }

  if (motionQuery.matches && "IntersectionObserver" in window && revealEls.length) {
    revealEls.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      /* The negative block-end margin holds the reveal until the element is a
         little way onto the page, so it eases in rather than popping at the
         very edge of the viewport. */
      { threshold: 0.1, rootMargin: "0px 0px -12% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* The hero's load choreography (DESIGN-GUIDELINES §8) is deliberately NOT
     handled here. Above-the-fold content must never depend on JS running to
     become visible, so it is a pure CSS animation on [data-reveal-intro].
     Driving it from JS meant a backgrounded tab — where rAF is paused — could
     leave the hero at opacity 0. */

  /* If the user turns reduced motion ON mid-session, stop hiding anything. */
  motionQuery.addEventListener("change", (e) => {
    if (!e.matches) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("is-visible"));
    }
  });

  /* ------------------------------------------------------------------
     4. Surface picker — recolor the cutting mat.
     The default mat (per theme) is pure CSS — see tokens.css, including
     the fixed --mat-texture grain this script never touches — so it
     renders correctly with this script absent. Everything below only
     overrides --mat-image/--color-mat when a visitor actually customizes
     the mat's color.

     The SVG template here is byte-for-byte the same shape as the one baked
     into tokens.css: a single ruled-mat panel — 50x25-unit grid at 24px
     pitch, axis numbers along the top and right edges, a corner protractor
     anchored bottom-left — parameterized only by the base color. It is
     rendered once per page (`background-repeat: no-repeat`) and scaled to
     cover the viewport (`background-size: cover`, `background-position:
     left bottom`, see styles.css), not tiled, so the protractor's origin
     always sits at the actual bottom-left corner of the screen regardless
     of viewport size. color-mix() inside the SVG's own stroke/fill values
     resolves at paint time in the image itself, so no CSS custom-property
     inheritance is needed for it to work inside a data URI.

     The anti-FOUC <head> script on every page (see index.html:17-27 and its
     counterparts) only sets --color-mat, not the full --mat-image — that
     rebuild happens here instead. Duplicating this generator's loops/trig in
     13 pre-paint <head> scripts wasn't worth it for a background layer: the
     flat mat color is already correct instantly (no wrong-color flash), and
     this deferred script fills in the detailed grid moments later.
  ------------------------------------------------------------------ */
  const MAT_UNIT = 24;
  const MAT_MAJOR_EVERY = 5;
  const MAT_MARGIN = 40;
  const MAT_UNITS_W = 50;
  const MAT_UNITS_H = 25;
  const MAT_GRID_W = MAT_UNITS_W * MAT_UNIT;
  const MAT_GRID_H = MAT_UNITS_H * MAT_UNIT;
  const MAT_GX0 = MAT_MARGIN;
  const MAT_GY0 = MAT_MARGIN;
  const MAT_GX1 = MAT_GX0 + MAT_GRID_W;
  const MAT_GY1 = MAT_GY0 + MAT_GRID_H;
  const MAT_CANVAS_W = MAT_GRID_W + 2 * MAT_MARGIN;
  const MAT_CANVAS_H = MAT_GRID_H + 2 * MAT_MARGIN;

  function matSvg(base) {
    const minor = `color-mix(in oklch, ${base} 100%, white 16%)`;
    const major = `color-mix(in oklch, ${base} 100%, white 32%)`;
    const guide = `color-mix(in oklch, ${base} 100%, white 48%)`;
    const FONT = "font-size='15' font-family='ui-monospace,monospace'";

    let s = `<svg xmlns='http://www.w3.org/2000/svg' width='${MAT_CANVAS_W}' height='${MAT_CANVAS_H}' viewBox='0 0 ${MAT_CANVAS_W} ${MAT_CANVAS_H}'>`;
    s += `<rect width='${MAT_CANVAS_W}' height='${MAT_CANVAS_H}' fill='${base}'/>`;
    s += `<defs><clipPath id='g'><rect x='${MAT_GX0}' y='${MAT_GY0}' width='${MAT_GRID_W}' height='${MAT_GRID_H}'/></clipPath></defs>`;

    // grid, clipped to the ruled area
    s += `<g clip-path='url(#g)'>`;
    for (let i = 0; i <= MAT_UNITS_W; i++) {
      const x = MAT_GX0 + i * MAT_UNIT;
      const isMajor = i % MAT_MAJOR_EVERY === 0;
      s += `<line x1='${x}' y1='${MAT_GY0}' x2='${x}' y2='${MAT_GY1}' stroke='${isMajor ? major : minor}' stroke-width='${isMajor ? 1 : 0.5}'/>`;
    }
    for (let j = 0; j <= MAT_UNITS_H; j++) {
      const y = MAT_GY0 + j * MAT_UNIT;
      const isMajor = j % MAT_MAJOR_EVERY === 0;
      s += `<line x1='${MAT_GX0}' y1='${y}' x2='${MAT_GX1}' y2='${y}' stroke='${isMajor ? major : minor}' stroke-width='${isMajor ? 1 : 0.5}'/>`;
    }
    s += `</g>`;

    // rulers: major ticks + numbers only (the grid already shows the fine
    // subdivisions, so per-unit ticks would just be redundant clutter).
    // Numbers run along the top edge and down the right edge only — the
    // left edge and bottom edge keep their tick marks (they still read as
    // "this is a ruled mat") but drop the digits, which just duplicated
    // the top/right numbers at this single-instance, cover-scaled size.
    const tickLen = 8;
    for (let i = 0; i <= MAT_UNITS_W; i += MAT_MAJOR_EVERY) {
      const x = MAT_GX0 + i * MAT_UNIT;
      s += `<line x1='${x}' y1='${MAT_GY0 - tickLen}' x2='${x}' y2='${MAT_GY0}' stroke='${guide}' stroke-width='1'/>`;
      s += `<line x1='${x}' y1='${MAT_GY1}' x2='${x}' y2='${MAT_GY1 + tickLen}' stroke='${guide}' stroke-width='1'/>`;
      s += `<text x='${x}' y='${MAT_GY0 - tickLen - 4}' text-anchor='middle' ${FONT} fill='${guide}'>${i}</text>`;
    }
    for (let j = 0; j <= MAT_UNITS_H; j += MAT_MAJOR_EVERY) {
      const y = MAT_GY0 + j * MAT_UNIT;
      const label = MAT_UNITS_H - j; // 25 at top -> 0 at bottom, matches the reference mat
      s += `<line x1='${MAT_GX0 - tickLen}' y1='${y}' x2='${MAT_GX0}' y2='${y}' stroke='${guide}' stroke-width='1'/>`;
      s += `<line x1='${MAT_GX1}' y1='${y}' x2='${MAT_GX1 + tickLen}' y2='${y}' stroke='${guide}' stroke-width='1'/>`;
      s += `<text x='${MAT_GX1 + tickLen + 6}' y='${y + 5}' text-anchor='start' ${FONT} fill='${guide}'>${label}</text>`;
    }

    // protractor: quarter-circle fanning from the grid's bottom-left origin
    const ox = MAT_GX0;
    const oy = MAT_GY1;
    s += `<path d='M ${ox} ${oy - 70} A 70 70 0 0 1 ${ox + 70} ${oy}' fill='none' stroke='${major}' stroke-width='1'/>`;
    s += `<path d='M ${ox} ${oy - 140} A 140 140 0 0 1 ${ox + 140} ${oy}' fill='none' stroke='${minor}' stroke-width='1'/>`;

    const shortLen = 220;
    const longLen = { 15: 900, 45: 620 };
    const labelR = 170;
    [15, 30, 45, 60].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const cx = Math.cos(rad);
      const cy = Math.sin(rad);
      const ex = ox + shortLen * cx;
      const ey = oy - shortLen * cy;
      s += `<line x1='${ox}' y1='${oy}' x2='${ex.toFixed(1)}' y2='${ey.toFixed(1)}' stroke='${guide}' stroke-width='1' stroke-dasharray='5 4'/>`;
      if (longLen[deg]) {
        const L = longLen[deg];
        const lx = Math.min(ox + L * cx, MAT_CANVAS_W + 40);
        const ly = oy - ((lx - ox) / cx) * cy;
        s += `<line x1='${ex.toFixed(1)}' y1='${ey.toFixed(1)}' x2='${lx.toFixed(1)}' y2='${ly.toFixed(1)}' stroke='${guide}' stroke-width='0.75' stroke-dasharray='5 4'/>`;
      }
      const lx2 = ox + labelR * cx;
      const ly2 = oy - labelR * cy;
      s += `<text x='${lx2.toFixed(1)}' y='${ly2.toFixed(1)}' ${FONT} fill='${guide}'>${deg}°</text>`;
    });

    s += `</svg>`;
    return s;
  }

  const matImageValue = (hex) =>
    `url("data:image/svg+xml,${encodeURIComponent(matSvg(hex))}")`;

  const colorSwatches = Array.prototype.slice.call(
    document.querySelectorAll(".surface-picker-swatch[data-color]")
  );

  /* ------------------------------------------------------------------
     4b. Mat-driven accent.
     "Let the cutting mat colour dictate the main accent — green mat gets
     green accent, blue gets blue." Every token this derives (--color-accent,
     --color-accent-hover, --color-on-accent, --color-tint-brand) is a plain
     CSS custom property, and --color-concept / --color-tag-bg / --color-focus
     (light theme) are declared in tokens.css as `var(--color-accent)` /
     `var(--color-tint-brand)` aliases — so overriding these four here is
     enough to re-theme the underlines, work-card tag pills, cert/writing
     status chips, the ghost-button hover fill, and inline code, all at once,
     with no per-component JS.

     Two paths produce a set:
     - MAT_ACCENT_TABLE: the picker's 11 built-in swatches, pre-solved and
       contrast-verified offline (see docs/DESIGN-GUIDELINES.md for the
       worked numbers) — used whenever the mat colour matches one exactly.
     - deriveAccentSet(): the SAME solve, run live, for a custom colour typed
       into the native <input type="color">. It binary-searches lightness at
       the picked hue for the lightness that clears 4.5:1 against every
       background that colour of text can land on — including the worst
       single pixel the paper's own grain can produce — the identical method
       used to solve the fixed palette by hand in earlier passes.

     A mat with no real hue (the grayscale swatches, or a near-neutral custom
     pick — saturation under 15%) has nothing to derive a colour FROM, and
     falls back to the site's own ink-blue identity pair.
  ------------------------------------------------------------------ */
  const PARCHMENT = "#f5f4ed";
  const WARM_SAND = "#e8e6dc";
  const DARK_PAPER = "#26231e";
  const DARK_SUBTLE = "#302c26";
  const LIGHT_TEX_ALPHA = 0.20; // must track --paper-texture's light alpha
  const DARK_TEX_ALPHA = 0.04; //  "        "        "      dark alpha
  const DEFAULT_LIGHT = { accent: "#1B365D", hover: "#12253F", on: "#faf9f5", tint: "#EEF2F7" };
  // Amber/bronze, not ink-blue — see the matching comment in tokens.css for
  // why: a cool blue was the one thing breaking this palette's warm
  // monochromatic logic on a genuinely hueless (black/grey) mat. Solved with
  // the exact same binary-search method every mat-derived accent uses below,
  // just fixed at an amber hue (36deg) instead of a mat's own, since a
  // neutral mat has no hue to derive one from.
  const DEFAULT_DARK = { accent: "#c48c39", hover: "#dab57e", on: "#141413", tint: "#362e21" };

  // Pre-solved, contrast-verified light+dark accent pairs for every built-in
  // swatch (see docs/DESIGN-GUIDELINES.md "Mat-driven accent" for the numbers
  // behind each one). Keyed by lowercase hex so lookup is a simple match.
  const MAT_ACCENT_TABLE = {
    "#095848": { // Green (default light mat)
      light: { accent: "#116151", hover: "#0c4338", on: "#faf9f5", tint: "#e0e7df" },
      dark: { accent: "#1eaa8d", hover: "#25d2af", on: "#141413", tint: "#25332b" },
    },
    "#141414": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Charcoal — neutral
    "#0b3556": { // Navy
      light: { accent: "#19598c", hover: "#113e60", on: "#faf9f5", tint: "#e1e6e4" },
      dark: { accent: "#489ddf", hover: "#8bc1eb", on: "#141413", tint: "#2a3033" },
    },
    "#7a3418": { // Rust
      light: { accent: "#8f3d1c", hover: "#632a14", on: "#faf9f5", tint: "#ece4da" },
      dark: { accent: "#de7d56", hover: "#eaad94", on: "#141413", tint: "#3a2d24" },
    },
    "#4a2545": { // Plum
      light: { accent: "#85397a", hover: "#5c2755", on: "#faf9f5", tint: "#ebe3e3" },
      dark: { accent: "#c87ebe", hover: "#dcacd5", on: "#141413", tint: "#382d30" },
    },
    "#0d4f4a": { // Teal
      light: { accent: "#11605a", hover: "#0c423e", on: "#faf9f5", tint: "#e0e7e0" },
      dark: { accent: "#1ea89e", hover: "#25d0c3", on: "#141413", tint: "#25322c" },
    },
    "#1b365d": { // Ink blue
      light: { accent: "#2b5694", hover: "#1e3b66", on: "#faf9f5", tint: "#e3e6e5" },
      dark: { accent: "#6f99d5", hover: "#a1bde4", on: "#141413", tint: "#2e3032" },
    },
    "#30302e": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Graphite — neutral
    "#3d3d3a": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Slate — neutral
    "#504e49": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Olive — neutral
    "#6b6a64": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Smoke grey — neutral
  };

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }

  function rgbToHex(rgb) {
    return (
      "#" +
      rgb
        .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function hexToHsl(hex) {
    let [r, g, b] = hexToRgb(hex).map((c) => c / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  function hueToRgbChannel(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function hslToHex(h, s, l) {
    if (s === 0) {
      const v = l * 255;
      return rgbToHex([v, v, v]);
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return rgbToHex([
      hueToRgbChannel(p, q, h + 1 / 3) * 255,
      hueToRgbChannel(p, q, h) * 255,
      hueToRgbChannel(p, q, h - 1 / 3) * 255,
    ]);
  }

  function srgbToLin(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function relLum(hex) {
    const [r, g, b] = hexToRgb(hex);
    return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
  }

  function contrastRatio(a, b) {
    const la = relLum(a);
    const lb = relLum(b);
    const hi = Math.max(la, lb);
    const lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  function mixHex(a, b, t) {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return rgbToHex(ca.map((c, i) => c + (cb[i] - c) * t));
  }

  // CSS `background-blend-mode: normal` compositing --paper-texture's own
  // per-pixel alpha over bg — same mechanism in both themes now (see the
  // tokens.css comment on --paper-texture for why normal replaced the old
  // multiply/screen split). A lit-relief texture has a bright peak AND a
  // dark valley in the same image, unlike the old flat grain, so there are
  // two worst cases instead of one — this returns both, and callers add
  // both to the background set findLDown/findLUp must clear. LIT_MIN/MAX
  // are --paper-texture's actual measured output range (sampled from a
  // live canvas render of the real filter at these settings, not
  // estimated) and are shared by both themes since it's the identical
  // feTurbulence/feDiffuseLighting recipe in each — only the alpha differs.
  const LIT_MIN = 155;
  const LIT_MAX = 255;
  function litWorstPair(bgHex, alpha) {
    const bg = hexToRgb(bgHex);
    const mix = (v) => rgbToHex(bg.map((c) => c * (1 - alpha) + v * alpha));
    return [mix(LIT_MAX), mix(LIT_MIN)];
  }

  // Largest L (walking up from 0) at which hsl(h,s,L) still clears `target`
  // contrast against every background in bgs — i.e. the lightest colour that
  // is still dark enough to read on a light surface. Returns null only if
  // even pure black (L=0) can't clear the target against these backgrounds.
  function findLDown(h, s, bgs, target) {
    const ok = (l) => bgs.every((bg) => contrastRatio(hslToHex(h, s, l), bg) >= target);
    if (!ok(0)) return null;
    let lo = 0, hi = 1, best = 0;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (ok(mid)) { best = mid; lo = mid; } else { hi = mid; }
    }
    return best;
  }

  // Smallest L (walking down from 1) that still clears `target` — the
  // darkest colour still light enough to read on a dark surface.
  function findLUp(h, s, bgs, target) {
    const ok = (l) => bgs.every((bg) => contrastRatio(hslToHex(h, s, l), bg) >= target);
    if (!ok(1)) return null;
    let lo = 0, hi = 1, best = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (ok(mid)) { best = mid; hi = mid; } else { lo = mid; }
    }
    return best;
  }

  function chooseOn(accent) {
    const ivory = "#faf9f5";
    const nearBlack = "#141413";
    return contrastRatio(accent, ivory) >= contrastRatio(accent, nearBlack) ? ivory : nearBlack;
  }

  // kami wants tints barely-there ("lightest solid wins most of the time"),
  // so start from a fixed cosmetic mix ratio rather than the strongest tint
  // contrast would allow, and only back off toward the paper (never toward
  // the accent) if that cosmetic ratio doesn't clear 4.5:1.
  function deriveTint(accent, paperHex, cosmeticT) {
    let t = cosmeticT;
    while (t > 0) {
      const tint = mixHex(paperHex, accent, t);
      if (contrastRatio(accent, tint) >= 4.5) return tint;
      t -= 0.01;
    }
    return paperHex;
  }

  function deriveAccentSet(hex, theme) {
    const [h, s] = hexToHsl(hex);
    if (s < 0.15) return theme === "dark" ? DEFAULT_DARK : DEFAULT_LIGHT;
    const sWork = clamp(s, 0.4, 0.7);

    if (theme === "dark") {
      const bgs = [DARK_PAPER, DARK_SUBTLE, ...litWorstPair(DARK_PAPER, DARK_TEX_ALPHA)];
      const lAccent = findLUp(h, sWork, bgs, 4.6);
      if (lAccent === null) return DEFAULT_DARK;
      const accent = hslToHex(h, sWork, lAccent);
      let lHover = findLUp(h, sWork, bgs, 7.0);
      if (lHover === null || lHover < lAccent) lHover = Math.min(1, lAccent + 0.1);
      const hover = hslToHex(h, sWork, lHover);
      return { accent, hover, on: chooseOn(accent), tint: deriveTint(accent, DARK_PAPER, 0.16) };
    }

    const bgs = [PARCHMENT, WARM_SAND, ...litWorstPair(PARCHMENT, LIGHT_TEX_ALPHA)];
    const lAccent = findLDown(h, sWork, bgs, 4.6);
    if (lAccent === null) return DEFAULT_LIGHT;
    const accent = hslToHex(h, sWork, lAccent);
    let lHover = findLDown(h, sWork, bgs, 7.0);
    if (lHover === null || lHover > lAccent) lHover = Math.max(0, lAccent - 0.1);
    const hover = hslToHex(h, sWork, lHover);
    return { accent, hover, on: chooseOn(accent), tint: deriveTint(accent, PARCHMENT, 0.09) };
  }

  function computeAccentSets(matHex) {
    const known = MAT_ACCENT_TABLE[matHex.toLowerCase()];
    if (known) return known;
    return { light: deriveAccentSet(matHex, "light"), dark: deriveAccentSet(matHex, "dark") };
  }

  // Declared with `function` (hoisted) so setTheme(), defined earlier in the
  // file, can reference it safely — by the time either can actually run
  // (a click), every top-level declaration in this IIFE has already executed.
  function applyAccentSets(sets) {
    const theme = root.dataset.theme === "dark" ? "dark" : "light";
    const set = sets[theme];
    root.style.setProperty("--color-accent", set.accent);
    root.style.setProperty("--color-accent-hover", set.hover);
    root.style.setProperty("--color-on-accent", set.on);
    root.style.setProperty("--color-tint-brand", set.tint);
  }

  function applyMatColor(hex, { persist = true } = {}) {
    root.style.setProperty("--color-mat", hex);
    root.style.setProperty("--mat-image", matImageValue(hex));

    const sets = computeAccentSets(hex);
    currentMatAccentSets = sets;
    applyAccentSets(sets);

    if (persist) {
      localStorage.setItem("matColor", hex);
      localStorage.setItem("accentTokens", JSON.stringify(sets));
    }
  }

  function resetMat() {
    root.style.removeProperty("--color-mat");
    root.style.removeProperty("--mat-image");
    root.style.removeProperty("--color-accent");
    root.style.removeProperty("--color-accent-hover");
    root.style.removeProperty("--color-on-accent");
    root.style.removeProperty("--color-tint-brand");
    currentMatAccentSets = null;
    localStorage.removeItem("matColor");
    localStorage.removeItem("accentTokens");
  }

  /* The anti-FOUC <head> script already set --color-mat AND (when a visitor
     has customised it before) the four accent tokens, straight from the
     cached accentTokens blob — so there's no wrong-colour flash on repeat
     visits. It didn't build the full --mat-image (the textured grid) though
     — that's this deferred script's job. Re-deriving and re-persisting the
     accent set here too (not just trusting the head script's cache) is
     deliberate self-healing: a visitor whose last visit predates this
     feature has a matColor but no accentTokens yet. */
  const savedMatColor = localStorage.getItem("matColor");
  if (savedMatColor) applyMatColor(savedMatColor, { persist: true });

  const picker = document.querySelector(".surface-picker");
  if (picker) {
    const trigger = picker.querySelector(".surface-picker-trigger");
    const panel = picker.querySelector(".surface-picker-panel");
    const colorInput = picker.querySelector('input[type="color"]');
    const resetBtn = picker.querySelector("[data-surface-reset]");

    const currentMat = () =>
      getComputedStyle(root).getPropertyValue("--color-mat").trim();

    /* Reflect the active selection across the swatch radiogroup and the
       native color input, without touching --mat-image (used on init, and
       after every change). */
    function syncPickerUI(selection) {
      let colorMatched = false;
      colorSwatches.forEach((sw) => {
        const isMatch =
          selection.mode === "color" &&
          sw.dataset.color.toLowerCase() === selection.value.toLowerCase();
        sw.setAttribute("aria-checked", String(isMatch));
        sw.tabIndex = isMatch ? 0 : -1;
        if (isMatch) colorMatched = true;
      });
      if (!colorMatched && colorSwatches.length) colorSwatches[0].tabIndex = 0;

      if (colorInput && selection.mode === "color") colorInput.value = selection.value;
    }

    function openPanel() {
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const target = colorSwatches.find((sw) => sw.getAttribute("aria-checked") === "true");
      (target || colorSwatches[0]).focus();
    }

    function closePanel({ returnFocus = true } = {}) {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) trigger.focus();
    }

    trigger.addEventListener("click", () => {
      if (panel.hidden) openPanel();
      else closePanel({ returnFocus: false });
    });

    document.addEventListener("click", (e) => {
      if (!panel.hidden && !picker.contains(e.target)) closePanel({ returnFocus: false });
    });

    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePanel();
      }
    });

    // Roving-tabindex radiogroup: arrow keys move focus AND select,
    // matching native <input type="radio"> behavior.
    colorSwatches.forEach((sw, i) => {
      sw.addEventListener("click", () => {
        applyMatColor(sw.dataset.color);
        syncPickerUI({ mode: "color", value: sw.dataset.color });
      });
      sw.addEventListener("keydown", (e) => {
        const dirs = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        let nextIndex = null;
        if (e.key in dirs) nextIndex = (i + dirs[e.key] + colorSwatches.length) % colorSwatches.length;
        else if (e.key === "Home") nextIndex = 0;
        else if (e.key === "End") nextIndex = colorSwatches.length - 1;
        if (nextIndex === null) return;
        e.preventDefault();
        const next = colorSwatches[nextIndex];
        applyMatColor(next.dataset.color);
        syncPickerUI({ mode: "color", value: next.dataset.color });
        next.focus();
      });
    });

    if (colorInput) {
      colorInput.addEventListener("input", () => {
        applyMatColor(colorInput.value);
        syncPickerUI({ mode: "color", value: colorInput.value });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resetMat();
        syncPickerUI({ mode: "color", value: currentMat() });
        closePanel();
      });
    }

    syncPickerUI({ mode: "color", value: currentMat() });
  }

  /* ------------------------------------------------------------------
     6. Case-study image lightbox
     Every image inside a case study's prose body (`.prose figure img`)
     becomes a zoom trigger, opening a single shared <dialog> full-screen
     over a scrim. Native <dialog>.showModal() supplies focus trapping,
     Escape-to-close, and top-layer stacking for free, so there's no
     hand-rolled focus trap here — just the open/close wiring and the
     bilingual labels. This is purely additive: with this script absent
     (or before it runs), the images render exactly as they always have,
     inline at full size, so the base reading experience never depends
     on it — nothing is hidden by CSS alone.
  ------------------------------------------------------------------ */
  const zoomImages = Array.prototype.slice.call(
    document.querySelectorAll(".prose figure img")
  );

  if (zoomImages.length && "HTMLDialogElement" in window) {
    const lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";

    const figure = document.createElement("figure");
    figure.className = "lightbox-figure";
    const lbImg = document.createElement("img");
    lbImg.className = "lightbox-image";
    const caption = document.createElement("figcaption");
    caption.className = "lightbox-caption";
    figure.append(lbImg, caption);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "lightbox-close";
    // Decorative X — the button's accessible name comes from aria-label
    // (set/refreshed below), not from this icon.
    closeBtn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M2 2 L16 16 M16 2 L2 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    lightbox.append(figure, closeBtn);
    document.body.appendChild(lightbox);

    let trigger = null; // the .figure-zoom button that opened the dialog

    function currentLang() {
      return root.lang === "ar" ? "ar" : "en";
    }

    function openLightbox(btn, img) {
      trigger = btn;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      const sourceFigcaption = img.closest("figure").querySelector("figcaption");
      caption.textContent = sourceFigcaption ? sourceFigcaption.textContent : "";
      // The image's own (English, per docs/CONTENT-GUIDE.md) alt text is a
      // fine dialog name as-is — it doesn't need the "view full-screen"
      // framing that the trigger button's label carries.
      lightbox.setAttribute("aria-label", img.alt);
      lightbox.showModal();
      closeBtn.focus();
    }

    function handleDialogClosed() {
      lbImg.src = "";
      if (trigger) trigger.focus();
    }

    // The single explicit-close path (close button, scrim click, our own
    // Escape handler below) — always cleans up immediately rather than
    // waiting on the dialog's "close" event, which not every environment
    // fires promptly for every closure method. Idempotent, so it's safe
    // if "close" *also* fires afterward (see the listener right below).
    function closeLightbox() {
      if (lightbox.hasAttribute("open")) lightbox.close();
      handleDialogClosed();
    }

    // Belt-and-braces alongside <dialog>'s native Escape handling: showModal()
    // is supposed to close on Escape on its own, but that shouldn't be the
    // *only* path — matches the surface picker's own manual Escape handler
    // a few sections up for the same "don't solely trust the platform"
    // reason.
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });

    // Covers any native closure path that doesn't go through
    // closeLightbox() above (i.e. <dialog>'s own Escape/cancel handling,
    // where it fires promptly).
    lightbox.addEventListener("close", handleDialogClosed);

    // A click lands on the dialog element itself only when it isn't on a
    // descendant (the figure or close button) — i.e. the scrim.
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    closeBtn.addEventListener("click", closeLightbox);

    const zoomButtons = [];
    zoomImages.forEach((img) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "figure-zoom";
      img.parentNode.insertBefore(btn, img);
      btn.appendChild(img);
      btn.addEventListener("click", () => openLightbox(btn, img));
      zoomButtons.push({ btn, img });
    });

    refreshLightboxLabels = () => {
      const lang = currentLang();
      closeBtn.setAttribute("aria-label", STRINGS[lang]["lightbox.close"]);
      const expandLabel = STRINGS[lang]["lightbox.expand"];
      zoomButtons.forEach(({ btn, img }) => {
        btn.setAttribute("aria-label", `${expandLabel}: ${img.alt}`);
      });
    };
    refreshLightboxLabels();
  }

  /* ------------------------------------------------------------------
     7. Footer year
  ------------------------------------------------------------------ */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     8. Sticky header — hides on scroll-down, reveals on scroll-up.
     Pinned via CSS `position: sticky`; this section only toggles two
     classes plus `inert`, driven by scroll direction. Above one viewport
     height ("the first fold") the header just stays put — no hide/show
     jitter from small scroll adjustments near the top of the page. Past
     that point, ANY upward scroll reveals it immediately (no distance
     threshold — an upward scroll reads as "take me back to nav"), and
     continued downward scroll hides it.
  ------------------------------------------------------------------ */
  const header = document.querySelector(".site-header");
  if (header) {
    const supportsInert = "inert" in HTMLElement.prototype;
    let lastY = window.scrollY;
    let ticking = false;

    function setHidden(hidden) {
      header.classList.toggle("is-header-hidden", hidden);
      // A visually off-screen header must not still be in the tab order —
      // otherwise a keyboard user tabbing through mid-page content can land
      // on controls they can't see. Mirrors this codebase's existing
      // dialog/modal focus-containment convention.
      if (supportsInert) header.inert = hidden;
    }

    function updateHeader() {
      const y = window.scrollY;
      const fold = window.innerHeight;

      header.classList.toggle("is-header-stuck", y > 0);

      if (y <= fold) {
        setHidden(false);
      } else if (y > lastY) {
        setHidden(true);
      } else if (y < lastY) {
        setHidden(false);
      }

      lastY = y;
      ticking = false;
    }

    // Correct state immediately on load — a visitor arriving via an anchor
    // link or a restored scroll position shouldn't need to scroll first.
    updateHeader();

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------
     9. Drag-anywhere — About photos + Tools stickers.
     Pointer Events (not HTML5 drag-and-drop, which is built for
     reorder/dropzone patterns and fights free-form dragging).

     .about-photo stays purely decorative — dragging it is mouse/touch/pen
     only, nothing added to the tab order, exactly as before. .tool-sticker
     is different: it's a real <button> (index.html) that opens the tool
     info popover (§11) on click/tap/Enter/Space, so IT needs the standard
     "was this a click or a drag" threshold every drag-and-drop library
     uses — a plain tap has to keep working as a click and reach keyboard
     users too, while an actual drag must not also pop the popover open.
     makeDraggable(el, { onClick }) takes an optional callback for this;
     .about-photo's call site passes none and is completely unaffected.

     `position: absolute` against the initial containing block, NOT
     `position: fixed` — deliberately. None of .about-photo's or
     .tool-sticker's ancestors are themselves positioned (see the
     "Draggable objects" comment in styles.css), so an absolutely
     positioned one resolves against the same viewport-sized initial
     containing block a fixed element would — which is what still lets a
     dropped item bleed past the paper onto the mat — but, unlike fixed,
     it SCROLLS WITH THE PAGE instead of staying glued to the viewport.
     Fixed positioning was tried first and was wrong: a dropped item
     stayed pinned to wherever it was on SCREEN as the page scrolled
     underneath it, so it looked like it had vanished the moment you
     scrolled away from where you dropped it.

     Pickup converts the current rendered position to `left`/`top` (a
     fresh getBoundingClientRect() at that instant, converted from
     viewport-relative to document-relative by adding the current
     scroll offset — captured once per drag, since touch-action: none
     and preventDefault() keep the page from scrolling mid-drag) and then
     moves purely via the --dx/--dy custom properties that feed each
     component's own `transform` (see "Draggable objects" in styles.css)
     — never by rewriting left/top every frame, which would be layout
     work instead of a compositor-only transform update. The viewport
     clamp (below) still reasons in viewport space, since that's what's
     actually meant to stay on screen during the gesture; it's the same
     math either way, just measured against the position at drag start
     rather than an ever-moving document offset.

     `.is-dragging` (transition: none, set in the SAME synchronous update
     as the position/--dx/--dy reset) is what keeps pickup instant with no
     animated jump; removing it afterward is safe precisely because nothing
     else changes in that same moment, so no transition fires
     retroactively. There is no "bake into left/top on drop" step: the next
     pickup just reads a fresh rect again, which already accounts for
     whatever --dx/--dy currently is.

     pointermove/pointerup listen on `document`, not `el` — even with
     pointer capture requested below, relying on it alone left a real gap:
     once the element leaves its own (now tiny, now-elsewhere) bounds,
     events could stop reaching an el-scoped listener, and the drag would
     visibly lag behind the cursor/finger until they crossed back over it.
     Document-level listeners always receive the event regardless of
     where the pointer physically is, filtered by pointerId so multiple
     simultaneous drags (two-finger touch) don't cross-talk.

     Click vs. drag: pointerdown alone no longer starts a drag — it only
     records the start position. The actual pickup (measure, reparent,
     detach) runs lazily, the first time pointermove crosses
     DRAG_THRESHOLD px, so a plain tap never touches the DOM at all and
     the browser's own `click` fires normally afterward (this is also how
     a keyboard Enter/Space activates onClick: no pointer events are
     involved in that path at all, so none of this logic is even in play).
     If the threshold WAS crossed, `justDragged` flags the next `click`
     event to be swallowed — browsers still fire one right after a real
     drag's pointerup, and onClick must not fire for that.

     Positions are never persisted (no localStorage) — a refresh is the
     reset, by design.
  ------------------------------------------------------------------ */
  if ("PointerEvent" in window) {
    const DRAG_THRESHOLD = 8; // px of movement before a pointerdown counts as a drag, not a click

    function makeDraggable(el, options) {
      const onClick = options && options.onClick;
      el.classList.add("draggable");
      el.setAttribute("draggable", "false"); // no native image drag-ghost fighting pointer capture

      let baseViewportLeft = 0;
      let baseViewportTop = 0;
      let elWidth = 0;
      let elHeight = 0;
      let padX = 0;
      let padY = 0;
      let startX = 0;
      let startY = 0;
      let dragScrollX = 0;
      let dragScrollY = 0;
      let activePointerId = null;
      let isDragging = false; // true only once DRAG_THRESHOLD has been crossed this gesture
      let justDragged = false; // consumed by the very next `click` to suppress it

      // The actual pickup — everything pointerdown used to do unconditionally,
      // now deferred until movement proves this is a drag, not a click.
      function beginDrag(e) {
        isDragging = true;

        const rect = el.getBoundingClientRect();
        elWidth = el.offsetWidth;
        elHeight = el.offsetHeight;
        // Anchor from the rendered box's CENTER, not its top-left.
        // getBoundingClientRect() on a rotated element returns the rotated
        // bounding box — rotation happens around the element's own center
        // (the default transform-origin), so the center is the only point
        // that stays put; reconstructing left/top from the bbox corner
        // instead would re-apply the same rotation around a shifted point
        // and visibly jump on pickup.
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        baseViewportLeft = centerX - elWidth / 2;
        baseViewportTop = centerY - elHeight / 2;
        // Half the extra width/height the RENDERED (rotated) box has over
        // the unrotated one (0 for an unrotated element) — the viewport
        // clamp needs this on top of elWidth/elHeight or a tilted element
        // could clamp a few px past the edge, since the clamp constrains
        // what's actually painted, not the smaller unrotated box.
        padX = (rect.width - elWidth) / 2;
        padY = (rect.height - elHeight) / 2;
        dragScrollX = window.scrollX;
        dragScrollY = window.scrollY;

        // Reparent to <body> — AFTER measuring, BEFORE repositioning, so
        // nothing visually jumps. .tool-sticker's own parent (.sticker-board)
        // is `position: relative` (it has to be, for the base scatter
        // layout's percentage left/top), which would make it — not the
        // document — the containing block for `position: absolute` below.
        // <body> itself is unpositioned, so reparenting there guarantees
        // the same document-relative containing block for every draggable
        // regardless of where it started, without special-casing stickers.
        if (el.parentElement !== document.body) {
          document.body.appendChild(el);
        }

        el.classList.add("is-dragging", "is-detached");
        // Freeze the measured width before leaving flow — the About photos
        // get their width from flex-stretching inside .about-photos, so
        // without this they'd collapse to a shrink-to-fit sliver the
        // instant `position: absolute` pulls them out of that layout.
        el.style.inlineSize = elWidth + "px";
        el.style.position = "absolute";
        el.style.margin = "0";
        el.style.left = baseViewportLeft + dragScrollX + "px";
        el.style.top = baseViewportTop + dragScrollY + "px";
        el.style.setProperty("--dx", "0px");
        el.style.setProperty("--dy", "0px");

        // Best-effort: capture is a secondary aid alongside the
        // document-level listeners above, not a requirement for them —
        // don't let a rare capture failure (already-released pointer, OS
        // quirk) throw past preventDefault().
        try {
          el.setPointerCapture(e.pointerId);
        } catch (err) {}
      }

      function onPointerMove(e) {
        if (e.pointerId !== activePointerId) return;

        if (!isDragging) {
          const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
          if (moved < DRAG_THRESHOLD) return;
          beginDrag(e);
        }

        e.preventDefault();
        const dx = clamp(e.clientX - startX, -baseViewportLeft + padX, window.innerWidth - elWidth - baseViewportLeft - padX);
        const dy = clamp(e.clientY - startY, -baseViewportTop + padY, window.innerHeight - elHeight - baseViewportTop - padY);
        el.style.setProperty("--dx", dx + "px");
        el.style.setProperty("--dy", dy + "px");
      }

      function onPointerUp(e) {
        if (e.pointerId !== activePointerId) return;
        activePointerId = null;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        if (el.hasPointerCapture(e.pointerId)) {
          try {
            el.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
        if (isDragging) {
          el.classList.remove("is-dragging");
          justDragged = true;
        }
        isDragging = false;
      }

      el.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (activePointerId !== null) return; // already mid-drag from another pointer

        startX = e.clientX;
        startY = e.clientY;
        activePointerId = e.pointerId;

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("pointercancel", onPointerUp);
      });

      // The single source of truth for "open the popover": fires naturally
      // for a real click/tap AND for keyboard Enter/Space (which produces a
      // click with no pointer events at all), so there's nothing keyboard-
      // specific to wire up separately. The one thing it has to filter out
      // is the trailing click a browser still fires right after a real
      // drag's pointerup.
      if (onClick) {
        el.addEventListener("click", (e) => {
          if (justDragged) {
            justDragged = false;
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick(el);
        });
      }
    }

    /* Scatter the tool stickers on load: a loose N-cell grid sized to the
       sticker count, jittered so it doesn't look like a grid — cheap
       collision-avoidance without real physics. Cell assignment is
       shuffled so the DOM's category order doesn't leak into a
       left-to-right visual order. Re-run fresh on every load (see the
       no-persistence note above), so this needs no seed.

       Placement accounts for each sticker's OWN rendered footprint
       (wPct/hPct below), not just its cell — at the 2x size pass this
       stopped being optional: a sticker placed near a cell's far edge
       with no regard for its own width could render partly outside
       .sticker-board, which below 48em means partly clipped by body's
       overflow: clip (measured: a sticker's right edge landing 66px past
       a 375px viewport, invisibly cut off, with no scrollbar to reveal
       it).

       That footprint also has to account for the random ±12deg rotation
       (--base-rot, set below) each sticker gets: a rotated box's bounding
       box is bigger than the unrotated one — the same "rendered vs
       unrotated size" distinction the drag engine's own padX/padY handles
       (see the "Draggable objects" pickup comment) — so growthX/growthY
       here is the worst case at a full 12deg, split evenly since rotation
       grows the box symmetrically around its own center. The final
       clamp() is a hard backstop regardless of the cell math, so a
       sticker's rendered edge can never exceed the board's. */
    function scatterStickers(board) {
      const stickers = Array.prototype.slice.call(board.querySelectorAll(".tool-sticker"));
      const count = stickers.length;
      if (!count) return;

      const boardWidth = board.offsetWidth;
      const boardHeight = board.offsetHeight;

      const cols = Math.max(1, Math.ceil(Math.sqrt(count * 1.6)));
      const rows = Math.ceil(count / cols);
      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) cells.push({ c, r });
      }
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = cells[i];
        cells[i] = cells[j];
        cells[j] = tmp;
      }

      const cellW = 100 / cols;
      const cellH = 100 / rows;
      const pad = 0.15; // small margin off the cell's own edge, when there's room to spare
      const MAX_ROT = (12 * Math.PI) / 180;
      const cosMax = Math.cos(MAX_ROT);
      const sinMax = Math.sin(MAX_ROT);

      stickers.forEach((el, i) => {
        const cell = cells[i];
        const wPx = el.offsetWidth;
        const hPx = el.offsetHeight;
        const wPct = (wPx / boardWidth) * 100;
        const hPct = (hPx / boardHeight) * 100;
        // Half the worst-case bounding-box growth from rotation, per axis
        // — computed in PIXELS first (wPx/hPx share one scale; wPct/hPct
        // don't, since one's relative to boardWidth and the other to
        // boardHeight, and this board is rarely square) and only
        // converted to each axis's own percentage at the end.
        const growthX = (Math.max(0, wPx * cosMax + hPx * sinMax - wPx) / 2 / boardWidth) * 100;
        const growthY = (Math.max(0, hPx * cosMax + wPx * sinMax - hPx) / 2 / boardHeight) * 100;
        const cellLeft = cell.c * cellW;
        const cellTop = cell.r * cellH;
        // Room left in the cell once the sticker's own (rotation-grown)
        // footprint is reserved — floors at 0 rather than going negative
        // if the sticker is bigger than its cell (only possible at very
        // cramped widths).
        const roomX = Math.max(0, cellW - wPct - 2 * growthX);
        const roomY = Math.max(0, cellH - hPct - 2 * growthY);
        const x = clamp(cellLeft + growthX + roomX * (pad + Math.random() * (1 - 2 * pad)), growthX, 100 - wPct - growthX);
        const y = clamp(cellTop + growthY + roomY * (pad + Math.random() * (1 - 2 * pad)), growthY, 100 - hPct - growthY);
        el.style.left = x + "%";
        el.style.top = y + "%";
        el.style.setProperty("--base-rot", (Math.random() * 24 - 12).toFixed(1) + "deg");
      });
    }

    document.querySelectorAll(".about-photo").forEach((el) => makeDraggable(el));

    const stickerBoard = document.querySelector(".sticker-board");
    if (stickerBoard) {
      // Below 48em (matching styles.css's own breakpoint for this
      // component), the scatter grid's own math no longer guarantees
      // non-overlapping cells, so the CSS falls back to a plain grid
      // instead and scattering is skipped entirely rather than fighting
      // that layout with inline left/top percentages. Click-to-open-popover
      // still gets wired up either way — only the scatter/rotation is
      // viewport-gated, not the sticker's actual functionality.
      if (window.matchMedia("(min-width: 48em)").matches) {
        scatterStickers(stickerBoard);
      }
      // openToolPopover is declared later, in §11 — safe to reference here
      // because `function` declarations hoist, and this callback only
      // ever actually RUNS later, from a click, by which point §11's
      // setup has already finished (everything in this file runs
      // synchronously, top to bottom, well before any user interaction).
      stickerBoard.querySelectorAll(".tool-sticker").forEach((el) => makeDraggable(el, { onClick: openToolPopover }));
    }

    // A viewport resize/rotation shouldn't be able to strand a dropped item
    // off-screen — nudge left/top (not --dx/--dy, which is session-local to
    // an active drag) back inside bounds for anything currently detached.
    let resizeQueued = false;
    function reclampDetached() {
      document.querySelectorAll(".is-detached").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const clampedLeft = clamp(rect.left, 0, window.innerWidth - rect.width);
        const clampedTop = clamp(rect.top, 0, window.innerHeight - rect.height);
        if (clampedLeft !== rect.left) {
          el.style.left = (parseFloat(el.style.left) || 0) + (clampedLeft - rect.left) + "px";
        }
        if (clampedTop !== rect.top) {
          el.style.top = (parseFloat(el.style.top) || 0) + (clampedTop - rect.top) + "px";
        }
      });
      resizeQueued = false;
    }
    window.addEventListener("resize", () => {
      if (!resizeQueued) {
        resizeQueued = true;
        requestAnimationFrame(reclampDetached);
      }
    });
  }

  /* ------------------------------------------------------------------
     10. Play hint (sticky-note--tip)
     One-time dismissible tip introducing §9's drag-anywhere feature and
     the surface picker (section 4) — a contextual note sitting right
     before the sticker board (normal document flow, not position: fixed,
     not appended to <body>), so it needs its OWN IntersectionObserver
     watching the sticker board itself rather than reusing §3's reveal
     machinery — the note exists in the DOM from the moment it's built
     (inserted ahead of the board it's about to explain), so watching
     itself would just fire immediately rather than waiting for the
     visitor to actually scroll to the stickers.

     Unlike a decorative reveal, "hidden until the sticker board is
     reached" is this component's actual function, not an animation
     nicety — so styles.css hides it (opacity/visibility) unconditionally,
     not gated behind reduced-motion, and only the FADE transition itself
     is motion-gated. A reduced-motion visitor still only sees it appear
     at the right scroll position, just without the fade.

     Purely additive chrome either way: with this script absent, or once
     already dismissed, there's simply no tip — nothing else depends on it.
  ------------------------------------------------------------------ */
  if (!localStorage.getItem("hintDismissed") && "IntersectionObserver" in window) {
    const stickerBoardEl = document.querySelector("#skills .sticker-board");
    if (stickerBoardEl) {
      const hint = document.createElement("div");
      hint.className = "sticky-note sticky-note--tip";

      const text = document.createElement("p");
      text.textContent =
        "Photos and tool stickers can be dragged anywhere on the page, even past the paper, onto the mat. The mat's own color is yours to change too, from the swatch in the bottom corner.";

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "sticky-note--tip-close";
      closeBtn.setAttribute("aria-label", "Dismiss tip");
      closeBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
      closeBtn.addEventListener("click", () => {
        localStorage.setItem("hintDismissed", "1");
        hint.remove();
      });

      hint.append(text, closeBtn);
      stickerBoardEl.before(hint);

      const hintIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              hint.classList.add("is-visible");
              hintIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      hintIo.observe(stickerBoardEl);
    }
  }

  /* ------------------------------------------------------------------
     11. Tool info popover
     One shared <dialog> (built lazily, on first use, and appended to
     <body> — same "purely additive, no build cost if never opened"
     shape as the case-study lightbox in §6, whose open/close mechanics
     this copies one-for-one: showModal(), a manual Escape handler
     alongside the native one, backdrop-click-to-close, focus returned to
     the trigger button on close). Declared as plain top-level functions
     (not nested inside an `if`) specifically so `openToolPopover` stays
     accessible from §9's sticker wiring above, which runs earlier in the
     file but only actually CALLS it later, from a click.
  ------------------------------------------------------------------ */
  let toolPopoverEl = null;
  let toolPopoverTrigger = null;
  let toolPopoverParts = null;

  function buildToolPopover() {
    if (toolPopoverEl || !("HTMLDialogElement" in window)) return;

    const popover = document.createElement("dialog");
    popover.className = "tool-popover";

    const card = document.createElement("div");
    card.className = "tool-popover-card";

    // Decorative repeat of the sticker's own image — the heading right
    // below it already carries the tool's name as real text, so a screen
    // reader doesn't need this image announced too.
    const icon = document.createElement("img");
    icon.className = "tool-popover-icon";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");

    const name = document.createElement("h3");
    name.className = "tool-popover-name";
    name.id = "tool-popover-name";

    // Reuses .tag-pill as-is (styles.css "Concept tags") — the same
    // shape/fill every other badge on this site uses, not a new component.
    const proficiency = document.createElement("span");
    proficiency.className = "tool-popover-proficiency tag-pill";

    const description = document.createElement("p");
    description.className = "tool-popover-description";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "tool-popover-close";
    closeBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

    card.append(icon, name, proficiency, description);
    popover.append(card, closeBtn);
    document.body.appendChild(popover);

    // aria-labelledby, not aria-label — the dialog already has a visible
    // heading (the tool name), so the accessible name should point at it
    // rather than duplicate its text in an attribute (WAI-ARIA APG's
    // recommended pattern for a dialog with a visible title).
    popover.setAttribute("aria-labelledby", "tool-popover-name");

    function handleClosed() {
      if (toolPopoverTrigger) toolPopoverTrigger.focus();
    }
    // Single explicit-close path (close button, backdrop click, the
    // Escape handler below) — same reasoning as the lightbox's
    // closeLightbox(): don't wait on the dialog's own "close" event,
    // which isn't guaranteed to fire promptly for every closure method
    // in every environment. Idempotent, so it's safe if "close" also
    // fires afterward.
    function closePopover() {
      if (popover.hasAttribute("open")) popover.close();
      handleClosed();
    }
    popover.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopover();
    });
    popover.addEventListener("close", handleClosed);
    // A click lands on the dialog element itself only when it isn't on a
    // descendant (the card or close button) — i.e. the backdrop.
    popover.addEventListener("click", (e) => {
      if (e.target === popover) closePopover();
    });
    closeBtn.addEventListener("click", closePopover);

    toolPopoverEl = popover;
    toolPopoverParts = { icon, name, proficiency, description, closeBtn };
  }

  function openToolPopover(sticker) {
    buildToolPopover();
    if (!toolPopoverEl) return; // no <dialog> support — degrades silently, same as the lightbox

    toolPopoverTrigger = sticker;
    const img = sticker.querySelector(".tool-sticker-img");
    toolPopoverParts.icon.src = img.src;
    toolPopoverParts.name.textContent = img.alt;
    toolPopoverParts.proficiency.textContent = sticker.dataset.proficiency || "";
    toolPopoverParts.description.textContent = sticker.dataset.description || "";
    toolPopoverParts.closeBtn.setAttribute(
      "aria-label",
      STRINGS[root.lang === "ar" ? "ar" : "en"]["lightbox.close"]
    );
    toolPopoverEl.showModal();
    toolPopoverParts.closeBtn.focus();
  }

  /* ------------------------------------------------------------------
     12. Mobile/tablet nav toggle
     Purely additive — see the long comment on .nav-toggle/.site-nav-panel
     in styles.css for the full "why": without this, .site-nav-panel's
     `display: contents` default means the header behaves exactly as it
     always has at every width. Only once this runs does .site-header
     gain .nav-js-ready, which is what actually turns the hamburger
     button on and the panel into a toggleable dropdown below 64em (both
     gated behind that class in CSS). Open/close mechanics mirror the
     surface picker (§4) — roving trigger/panel, outside-click and
     Escape both close it, aria-expanded is the single source of truth
     the icon's hamburger→X animation reads too, so there's nothing to
     keep in sync separately.
  ------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.getElementById("site-nav-panel");
  const siteHeaderEl = document.querySelector(".site-header");
  if (navToggle && navPanel && siteHeaderEl) {
    navPanel.hidden = true;
    siteHeaderEl.classList.add("nav-js-ready");

    function openNav() {
      navPanel.hidden = false;
      navToggle.setAttribute("aria-expanded", "true");
    }
    function closeNav({ returnFocus = false } = {}) {
      navPanel.hidden = true;
      navToggle.setAttribute("aria-expanded", "false");
      if (returnFocus) navToggle.focus();
    }

    navToggle.addEventListener("click", () => {
      if (navPanel.hidden) openNav();
      else closeNav();
    });

    document.addEventListener("click", (e) => {
      if (!navPanel.hidden && !siteHeaderEl.contains(e.target)) closeNav();
    });

    navPanel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeNav({ returnFocus: true });
      }
    });

    // Anchor links inside the panel scroll the page to a section — leaving
    // the panel open over the destination would just be in the way.
    navPanel.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeNav());
    });

    // A resize that crosses into desktop width must never strand the
    // panel open (or aria-expanded stuck true) — CSS already forces the
    // nav visible there regardless (see the min-width: 64em rule in
    // styles.css), but the trigger's own state should still reflect
    // reality if the visitor resizes back down again later.
    const desktopQuery = window.matchMedia("(min-width: 64em)");
    // Reads the live desktopQuery.matches rather than the change event's
    // own .matches — real browsers populate that on a MediaQueryListEvent,
    // but reading the list itself is correct regardless of how the event
    // was constructed, and doesn't depend on that detail holding.
    desktopQuery.addEventListener("change", () => {
      if (desktopQuery.matches) closeNav();
    });
  }
})();
