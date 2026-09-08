#!/usr/bin/env python3
"""Check that the shared chrome blocks (anti-FOUC head script, header,
footer, surface picker) haven't silently diverged across pages.

Run by hand before committing a chrome change (CLEANUP-PLAN item 3.1).
No build step, nothing auto-rewritten -- it only reports drift and exits
non-zero if it finds any, the same way a linter would. If it flags a real,
intentional difference, that's a sign the difference should be justified in
a comment, not that this script is wrong.

Why a checker and not an auto-rewriter: the plan's "lazier interim" option.
Two of the pages (index.html, 404.html) legitimately use a different site
logo than the six case studies (a self-link with the face icon, vs. the
case studies' back-arrow), so a blind rewrite-from-one-canonical-page tool
would need real template logic to avoid clobbering that intentional
difference. A checker sidesteps that: it only compares the group of pages
that SHOULD be byte-identical, and leaves the two legitimately-different
pages out of that one comparison.

Usage: python tools/check-chrome.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Pages whose header, footer, surface picker, and head script should all be
# byte-identical to each other (case studies + the 404 fallback share one
# subpage-chrome template). index.html is checked separately below --
# its header is legitimately different (homepage self-link, no back-arrow).
SUBPAGES = [
    "work/blueprint-design-system.html",
    "work/ai-design-to-code.html",
    "work/ai-process-framework.html",
    "work/hub-modernization.html",
    "work/incridea-2022-branding.html",
    "work/speery-health.html",
]

# 404.html shares the head script, footer, and surface picker with the
# subpages above, but -- like index.html -- uses the homepage-style logo
# (no "go back" link makes sense on an error page), so its header is
# checked separately, not against SUBPAGES.
HEADER_ONLY_EXTRA = []
ALL_PAGES = SUBPAGES + ["404.html"]
ALL_PAGES_WITH_INDEX = ALL_PAGES + ["index.html"]

BLOCK_PATTERNS = {
    "head-script": r'<script>\s*\(function \(\) \{.*?\}\)\(\);\s*</script>',
    "header": r'<header class="site-header">.*?</header>',
    "footer": r'<footer class="site-footer">.*?</footer>',
}


def extract(path, pattern):
    text = (ROOT / path).read_text(encoding="utf-8")
    m = re.search(pattern, text, re.S)
    if not m:
        return None
    return m.group(0)


def extract_picker(path):
    text = (ROOT / path).read_text(encoding="utf-8")
    i = text.find('<div class="surface-picker">')
    j = text.rfind("</html>")
    if i == -1 or j == -1:
        return None
    return text[i:j]


def normalize_prefix(html, page):
    """Strip the '../' path prefix that work/*.html pages need and index.html/
    404.html don't, so the same block compares equal regardless of folder
    depth -- that prefix difference is expected, not drift."""
    if page.startswith("work/"):
        html = html.replace('href="../', 'href="').replace('src="../', 'src="')
    return html


def diff_group(label, pages, extractor):
    blocks = {}
    for p in pages:
        raw = extractor(p)
        if raw is None:
            print(f"  [{label}] {p}: block not found at all (structural miss)")
            continue
        blocks[p] = normalize_prefix(raw, p)
    if not blocks:
        return True
    reference_page = pages[0]
    reference = blocks.get(reference_page)
    ok = True
    for p, block in blocks.items():
        if p == reference_page:
            continue
        if block != reference:
            ok = False
            print(f"  [{label}] {p} differs from {reference_page}")
    return ok


def main():
    all_ok = True
    for label, pattern in BLOCK_PATTERNS.items():
        pages = ALL_PAGES if label != "header" else SUBPAGES
        ok = diff_group(label, pages, lambda p, pat=pattern: extract(p, pat))
        all_ok = all_ok and ok

    all_ok = diff_group("surface-picker", ALL_PAGES_WITH_INDEX, extract_picker) and all_ok
    # footer and head-script are also identical on index.html -- check it too.
    for label in ("head-script", "footer"):
        pattern = BLOCK_PATTERNS[label]
        ok = diff_group(label + " (incl. index)", ALL_PAGES_WITH_INDEX,
                         lambda p, pat=pattern: extract(p, pat))
        all_ok = all_ok and ok

    if all_ok:
        print("OK: chrome blocks match across all pages (index.html and "
              "404.html's header excluded from the header check by design).")
        return 0
    print("\nFAIL: chrome has diverged. Either fix the odd page out, or if "
          "the difference is deliberate, note why in a comment and add an "
          "exception here.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
