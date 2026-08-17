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
  const LIGHT_TEX_ALPHA = 0.16; // must track --paper-texture's light alpha
  const DARK_TEX_ALPHA = 0.05; //  "        "        "      dark alpha
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

  // CSS `background-blend-mode: multiply` composited at alpha over bg —
  // mirrors the light-theme --paper-texture-blend exactly.
  function multiplyWorst(bgHex, alpha) {
    return rgbToHex(hexToRgb(bgHex).map((c) => c * (1 - alpha)));
  }

  // Mirrors the dark-theme `screen` blend.
  function screenWorst(bgHex, alpha) {
    return rgbToHex(hexToRgb(bgHex).map((c) => c + (255 - c) * alpha));
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
      const bgs = [DARK_PAPER, DARK_SUBTLE, screenWorst(DARK_PAPER, DARK_TEX_ALPHA)];
      const lAccent = findLUp(h, sWork, bgs, 4.6);
      if (lAccent === null) return DEFAULT_DARK;
      const accent = hslToHex(h, sWork, lAccent);
      let lHover = findLUp(h, sWork, bgs, 7.0);
      if (lHover === null || lHover < lAccent) lHover = Math.min(1, lAccent + 0.1);
      const hover = hslToHex(h, sWork, lHover);
      return { accent, hover, on: chooseOn(accent), tint: deriveTint(accent, DARK_PAPER, 0.16) };
    }

    const bgs = [PARCHMENT, WARM_SAND, multiplyWorst(PARCHMENT, LIGHT_TEX_ALPHA)];
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
})();
