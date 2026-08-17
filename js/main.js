/* main.js — theme toggle, direction/language toggle, motion-safe reveals.
   No dependencies. Runs after DOM parse (script tag uses `defer`). */

(() => {
  "use strict";

  const root = document.documentElement;

  /* Reassigned by section 6 (only when the page has zoomable images) so
     section 2's language toggle can keep the lightbox's per-image labels
     in sync without section 2 needing to know section 6 exists. */
  let refreshLightboxLabels = () => {};

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

  function applyMatColor(hex, { persist = true } = {}) {
    root.style.setProperty("--color-mat", hex);
    root.style.setProperty("--mat-image", matImageValue(hex));
    if (persist) {
      localStorage.setItem("matColor", hex);
    }
  }

  function resetMat() {
    root.style.removeProperty("--color-mat");
    root.style.removeProperty("--mat-image");
    localStorage.removeItem("matColor");
  }

  /* The anti-FOUC <head> script already set --color-mat (so there's no
     wrong-color flash), but it didn't build the full --mat-image (the
     textured grid) — that's this deferred script's job. Do it before
     wiring the picker UI. */
  const savedMatColor = localStorage.getItem("matColor");
  if (savedMatColor) applyMatColor(savedMatColor, { persist: false });

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
})();
