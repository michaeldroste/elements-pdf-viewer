# PDF Viewer for RapidWeaver Elements

A PDF reader you drop onto a page: a titled frame with the document inside, and
an optional toolbar underneath for printing, downloading, and emailing a link.

No PHP required — the page can be plain `.html`. Free, MIT licensed.

Install: **Elements → Settings → Addons → Add Pack**. The component appears in
the **Media** group, and a ready-made layout ships with it under
Templates → **PDF Viewer**.

---

## Two renderers, chosen automatically

This is the part worth understanding, because it explains everything else.

**On a computer**, the document is handed to the browser's own built-in PDF
viewer in a frame. That is the right tool on a desktop: it is fast, it is the
reader people already know, and it costs no download.

**On phones and tablets**, that viewer is either missing or hijacks the whole
screen, so the component renders the document itself — page by page, on a canvas,
with its own pager and zoom controls. Nothing to configure; the viewer detects
the device and picks.

## Where you host the PDF matters

**Drop the PDF into your project as a resource and this section does not apply.**
It publishes alongside the page and everything works everywhere, with no
configuration.

It only matters when you point the component at a PDF on **another domain** — a
media subdomain, an S3 or R2 bucket, a CDN. The two renderers above do not have
the same permissions:

| Renderer               | Used on         | Reads the file by | Needs CORS? |
| ---------------------- | --------------- | ----------------- | ----------- |
| Browser's own viewer   | desktop         | a navigation      | **no**      |
| Built-in page renderer | phones, tablets | a `fetch`         | **yes**     |

So a cross-origin PDF whose server sends no `Access-Control-Allow-Origin` header
**looks perfect on your Mac and cannot be displayed inline on a phone.** Testing
on a desktop cannot prove the mobile path works. No component can work around
this — the browser refuses to hand over the bytes.

There are exactly two fixes:

1. **Add the PDF to your project as a resource** (simplest, always works), or
2. **Send `Access-Control-Allow-Origin` from the host serving the PDF.** Add
   `Access-Control-Expose-Headers: Accept-Ranges, Content-Range, Content-Length`
   too, or the renderer cannot use range requests and pulls the whole file before
   showing page one.

**If neither is available, it degrades rather than breaks.** Phones and tablets
get a panel reading *Preview isn't available* above a large **Open PDF** button,
which hands the file to the system viewer — Quick Look on iOS, where it
pinch-zooms, pages through the whole document, prints and shares. The component
tells *you* about it too: a note on the component in the editor, and an
explanation in the browser console on the published page. Visitors see neither.

The component also checks the file is readable before pulling in the renderer, so
a document that cannot be shown says so in about a round-trip rather than after a
long download on a phone connection.

## Settings

**Document** — the PDF file and the title shown in the header.

**Loading** — *Lazy Loading* defers the document until it scrolls into view.
*Title Screen* replaces the viewer with a cover panel and a **View PDF** button,
so a long document costs nothing until a visitor asks for it.

**Style** — Background, header colour and text, header title size, border colour
and width, corner radius, and the viewer's height.

*Background* is any colour in your theme's palette, at any brightness — one
choice, used everywhere, with no separate light and dark values to keep in step.
Pick a dark colour and the whole frame follows, including the page controls the
phone and tablet renderer draws for itself: those flip to a light bar with dark
text so they stay readable.

**What Background cannot reach is the document itself.** On a computer the pages
are drawn inside the browser's own viewer, and no setting on the page can style
what is in there — Chrome and Firefox surround the pages with their own dark
grey, Safari with a light one, and the pages stay whatever colour the document
was written in. On a dark site, expect a dark frame around a white sheet of
paper. The fix for that is in the PDF rather than here.

**Toolbar** — Print, Download and Email buttons, the subject line Email uses, and
the button colours. Turn all three off and the toolbar disappears.

## Built to Elements conventions

Standard Inspector controls, Theme Studio colours and type throughout, and the
Resources workflow like any built-in component. Every geometric value comes from
a theme control, so the component tracks your theme rather than overriding it,
and its class names are chosen to mean the same thing under **Tailwind 3 and
Tailwind 4** — a 2.4.x site and a 3.x site both render it correctly.

## What's bundled

**pdf.js 3.11.174 ships inside the pack** — both the library and its worker,
about 1.4 MB, served from your own site under `assets/page/`. That is a
deliberate trade: it costs pack size and buys you no CDN entry to allow in a
Content Security Policy, no third party able to change what runs in your origin,
and no offline failure. The eval-backed font path is disabled
(`isEvalSupported: false`), which is the mitigation for CVE-2024-4367 in this
build — set at call time, so the library itself is unmodified.

pdf.js is Mozilla's, under the **Apache License 2.0**, and is included as
distributed. The attribution is in [LICENSE](LICENSE); the MIT terms there cover
this component's own code and not pdf.js.

**No inline event handlers.** Every control is bound from the portalled script
and reads its data from attributes, so a filename containing an apostrophe cannot
break a button, and a CSP that allows scripts by nonce or hash does not block
them.

## Accessibility

The pager and zoom buttons carry spoken labels distinct from their glyphs, so a
screen reader announces "Previous page" rather than the name of a punctuation
mark. Activating **View PDF** moves focus to the viewer that replaces the button
rather than dropping it to the top of the page.

## Notes

- **Print keeps its frame alive.** Safari aborts a print job whose frame is
  removed while the dialog is open, so the hidden frame is cleaned up on a delay.
- **A viewer injected after page load needs one call.** The document comes from
  the PDF File resource, which cannot be bound to a collection item, so a **CMS
  Load More** batch can never bring a new viewer with it. Anything else that adds
  one after load — a lightbox, a tab built on demand — is not picked up on its
  own. Call `window.rwPdfViewer.initAll()` from whatever injected it. Safe to
  call at any time, and free on viewers that are already working.
- **Hover styling is desktop-only on an Elements 3.x site.** Tailwind 4 compiles
  every `hover:` utility inside `@media (hover: hover)`, so the fade on the
  toolbar buttons does not appear on touch, where Tailwind 3 used to fire it on
  tap. Nothing becomes unreachable — every button behaves identically. The old
  behaviour is a site-wide switch: **Project Settings → Advanced**, the legacy
  tap-to-hover option added in Elements 3.0.7.

## Requirements

RapidWeaver Elements. No PHP, no server configuration, no build step, no external
services. Cross-origin PDFs need CORS headers on the host for inline display on
phones and tablets — see above.

## License

MIT. See [LICENSE](LICENSE) inside the pack.
