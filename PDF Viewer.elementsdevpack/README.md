# PDF Viewer

A PDF reader for RapidWeaver Elements. A titled frame with the document inside
and an optional toolbar underneath for printing, downloading and emailing a link
to the page.

On desktop it hands the file to the browser's own PDF viewer. On phones and
tablets — where that viewer is either missing or hijacks the whole screen — it
renders the document itself, page by page, with its own pager and zoom.

No PHP required; the page can be plain `.html`.

Free and MIT licensed. See [LICENSE](LICENSE).

**Works with Elements AI and the Elements MCP server.** Every setting carries the
description Elements AI reads, so the built-in Assistant, or an AI tool connected
through the MCP server, can find and change it from a plain-language request.

## Installing

Elements → Settings → Addons → **Add Pack** → choose
`PDF Viewer.elementsdevpack`. The component appears in the **Media** group of the
component palette.

A ready-made layout also ships with the pack, under Templates → **PDF Viewer**.

## Quick start

1. Drag **PDF Viewer** onto the page.
2. Drop a PDF onto the component, or set **Document → PDF File**.
3. Type a name into **Document → Title**. It appears in the header bar and as the
   frame's accessible title.

Everything else is optional.

## Controls

**Document** — the PDF file and the title shown in the header.

**Loading** — Lazy Loading defers the document until it scrolls into view, on
phones and tablets as well as on a computer (see
[On phones and tablets](#on-phones-and-tablets)). Title Screen replaces the
viewer with a cover panel and a **View PDF** button, so a long document costs
nothing until a visitor asks for it; Name, Screen Title Size and Screen Title
Color style that panel.

**Style** — Background, header colour and text, header title size, border colour
and width, corner radius, and the viewer's height.

**Background** is any colour in your theme's palette, at any brightness — pick
the one you want and that is the colour that renders. There is no separate
light-mode and dark-mode value to keep in step: one choice, used everywhere, on
every visitor's screen. It fills the component body, the area around the
document and the cover screen, and it defaults to the near-white the component
used before, so nothing you have already placed changes appearance.

Pick a dark colour and the whole frame follows, including the page controls the
phone and tablet viewer draws for itself: those flip to a light bar with dark
text so they stay readable, and the **Open PDF** card does the same. The cover
screen's second line follows Screen Title Color rather than a fixed grey, for
the same reason.

**What Background cannot reach is the document itself.** On a computer the pages
are drawn by the browser's own built-in PDF viewer inside a frame, and no
setting on the page — in this component or any other — can style what is inside
it. Chrome and Firefox surround the pages with their own dark grey, Safari with
a light one, and the pages stay the colour the document was written in, which is
usually white. So on a dark site expect a dark frame around a document that is
still a white sheet of paper. If that contrast is the problem, the fix is in the
PDF rather than here: export it with a dark page colour, or turn on Title Screen
so the viewer only opens when someone asks for it.

**Toolbar** — Print, Download and Email buttons, the subject line the Email
button uses, and the button colours. Turning all three off removes the toolbar
entirely. Download and Print behave differently for a PDF on another site; see
[Download and Print with a file on another site](#download-and-print-with-a-file-on-another-site).

## Where you host the PDF matters

**Drop the PDF into your project and this section does not apply.** A file added
as a resource publishes alongside the page, and everything works everywhere with
no configuration.

It only matters if you point the component at a PDF on **another domain** — a
remote resource, a media subdomain, an S3 or R2 bucket, a CDN. The component has
two rendering paths and they do not have the same permissions:

| Path | Used on | How it reads the file | Needs CORS? |
|---|---|---|---|
| Browser's own viewer | desktop | `<iframe src>` — a navigation | no |
| Built-in page renderer | phones, tablets | a `fetch` | **yes** |

So a PDF on another domain whose server sends no
`Access-Control-Allow-Origin` header looks perfect on your Mac and cannot be
displayed inline on a phone. No component can work around this — the browser
refuses to hand over the bytes — so there are exactly two fixes:

1. **Add the PDF to your project as a resource** (simplest, always works), or
2. **Send `Access-Control-Allow-Origin` from the server hosting the PDF.** Add
   `Access-Control-Expose-Headers: Accept-Ranges, Content-Range, Content-Length`
   as well. Without it the browser hides those headers from the renderer, which
   then cannot ask for parts of the file and downloads the whole document before
   showing page one. With it, a phone fetches only the pages it shows — see
   [How much of the file a phone downloads](#how-much-of-the-file-a-phone-downloads).

The component tells you when this applies: the editor shows a note on the
component, and the browser console explains it on the published page. Nothing is
shown to visitors.

**If neither fix is available,** the component still degrades sensibly rather
than breaking. Every phone and tablet gets a panel reading *Preview isn't
available* above a large **Open PDF** button, which hands the file to the system
viewer — Quick Look on iOS, where it pinch-zooms, pages through the whole
document, prints and shares. The panel does not repeat the document title, since
the component's own header is showing it directly above.

Up to build 14 Safari was given the document in an iframe instead, on the
reasoning that a browser with its own PDF viewer should keep the file in the
page. That reasoning was wrong about iOS: inside an iframe WebKit paints page
one, cropped, with no way to scroll or reach page two. The button is the better
reader of the two, not a consolation prize.

Build 15 also checks the file is readable before loading the 1.4 MB renderer, so
a document that cannot be shown says so in about a round-trip instead of after a
long download on a phone connection.

### Download and Print with a file on another site

Browsers only honour a real download for a file served from the same site as
the page. Point the component at a PDF anywhere else — a CDN, a media subdomain,
a bucket — and the browser ignores the request and navigates away to the bare
file instead, which is not what a Download button appears to offer. "Anywhere
else" is strict: `http` and `https` on the same host count as different sites,
and so does a different port.

So from build 23, where the address is off-site the **Download** button becomes
**Open**, opens the file in a new tab and says so to screen readers, and the
page stays where it was. **Print** cannot reach into a file on another site
either: it used to load the whole document into a hidden frame and then fail
without a word. For an off-site file it now opens the document in a new tab,
where the browser's own viewer prints it. Drop the file into your project
instead and both work in place. This is a browser rule, not a setting: no header
on the other server changes it.

## On phones and tablets

### How much of the file a phone downloads

The phone and tablet renderer asks for the document in pieces, using HTTP range
requests: the few parts that describe the file, then the page in view. Turning
to a page it has not shown yet costs one more short request.

Up to build 22 it also read the entire file in the background, from start to
finish, even when ranges were available, so a phone visitor downloaded the whole
document to look at one page of it. Measured on a live 79 MB method book with
every header above in place: **79,099,641 bytes to show page one, against
915,193 bytes from build 23** — about 86 times less.

Range requests need nothing from you when the PDF is a resource in your project;
almost all web hosting answers them for static files. For a PDF on another site
they are what the `Access-Control-Expose-Headers` line above buys. A server that
cannot answer them still works: the document is downloaded once, in full, and
shown, exactly as before.

### Lazy Loading, hidden viewers and zoom

- **Lazy Loading now works on phones and tablets.** It used to reach the desktop
  path only: every viewer without a Title Screen loaded the 1.4 MB renderer and
  its document the moment the page opened, wherever it sat on the page. Now a
  viewer with Lazy Loading on waits until it comes within about 200px of the
  screen. With Lazy Loading off it starts when the page loads, as before, and a
  Title Screen viewer still waits for **View PDF**. A browser too old for this
  starts every viewer at once, as before. From build 26 a viewer that starts at
  once also stops the browser's own frame from downloading the whole file
  alongside the renderer, which was fetching it too.
- **A viewer in a closed tab, accordion or modal waits until it is shown**, then
  draws at its real width, in any current browser. It used to be drawn at no
  width at all and stay blank until somebody tapped one of its buttons.
- **Scrolling does not redraw the page.** iOS resizes the window as its toolbar
  slides in and out, and every redraw blanks the page for a moment; only a real
  change of width redraws it now.
- **Zooming in stays sharp up to a point, then just gets bigger.** iPhones and
  iPads refuse a drawing surface larger than about 16.7 million pixels, and the
  top zoom steps used to cross that and leave a blank page. The renderer now
  lowers the resolution once that budget is spent, so every zoom step still
  enlarges the page and none of them blanks it.

## Notes

- **pdf.js is bundled, not fetched.** Both the library and its worker are served
  from your own site under `assets/page/`. There is no CDN entry to allow in a
  Content Security Policy, no third party able to change what runs in your
  origin, and no offline failure. It costs about 1.4 MB of pack size. pdf.js is
  Mozilla's, under the Apache License 2.0, and is included unmodified — the
  attribution is in [LICENSE](LICENSE). The MIT terms there cover this
  component's own code and not pdf.js.
- **One pdf.js worker per page, however many viewers.** On phones and tablets
  every viewer used to start a worker of its own, so a page with seven PDFs ran
  seven background threads, each parsing the same megabyte of script. From
  build 27 they share one.
- **The eval-backed font path is disabled** (`isEvalSupported: false`), which is
  the mitigation for CVE-2024-4367 in the bundled build.
- **Print keeps its frame alive.** For a PDF on your own site, Print loads it
  into a hidden frame and prints from there. Safari aborts a print job whose
  iframe is removed while the dialog is open, so the frame is cleaned up on a
  delay rather than immediately. A PDF on another site opens in a new tab
  instead, as described above.
- **No inline handlers.** Every control is bound from the portalled script and
  reads its data from attributes, so a filename containing an apostrophe cannot
  break a button, and a CSP that allows scripts by nonce or hash does not block
  them.
- **A viewer injected after the page loads needs one call.** The document comes
  from the PDF File resource, which cannot be bound to a collection item, so a
  **CMS Load More** batch can never bring a new viewer with it and the component
  does not watch a published page for one. Anything else that adds a viewer after
  load — a lightbox, a tab built on demand, a script of your own — is not picked
  up on its own: its **View PDF**, **Print** and **Email** buttons will not
  respond, an off-site **Download** is not switched to **Open**, and on a phone
  the document stays in the browser's frame instead of the built-in renderer. Call `window.rwPdfViewer.initAll()` from whatever
  injected it and the new viewer wires itself up. It is safe to call at any time
  and costs nothing on viewers that are already working. Up to build 22 this
  call was documented here but missing from the component, so it threw an error
  instead; it works from build 23.
- **On a Tailwind 4 theme, hover styling is desktop-only, and that is Tailwind
  rather than this component.** Tailwind 4 compiles every `hover:` utility inside
  `@media (hover: hover)`, so the fade on the Print, Download, Email and View
  PDF buttons does not appear on a phone or tablet — where Tailwind 3 fires it
  on tap. Elements 3 runs both: a theme is on Tailwind 4 only when it declares
  it, and a site whose theme is still on Tailwind 3 keeps the tap behaviour. No
  component can override it, because the rule is written by the theme's own
  compiler. If you want the old behaviour back on a Tailwind 4 theme it is a
  site-wide switch, not a component one: **Project Settings → Advanced**, the
  legacy tap-to-hover option added in Elements 3.0.7. Nothing is unreachable
  either way — every button does exactly what it did, without the hover dim.

### Upgrading pdf.js

Replace both files under
`components/com.trumpetstudio.pdfviewer/assets/page/` and keep the
`isEvalSupported: false`, `disableStream: true` and `disableAutoFetch: true`
options in `templates/script.html`. The first is the CVE-2024-4367
mitigation; the other two are what keep a phone from downloading the whole
document. The bundled build is 3.11.174. Note that pdf.js 4.x changed
`page.render()` to require an explicit `canvas` property alongside
`canvasContext`, so the mobile renderer needs checking after any major-version
jump.

## Accessibility

The pager and zoom buttons carry spoken labels distinct from their glyphs, so a
screen reader announces "Previous page" rather than the name of a punctuation
mark. Activating **View PDF** moves focus to the viewer that replaces the
button, rather than dropping it to the top of the page.

On phones and tablets the page is drawn as a picture, which says nothing to a
screen reader by itself. So the picture is named for the page it shows, as
"Page 3 of 12" followed by the document title, and the page counter is
announced when Next or Previous moves on. The pager also carries an **Open
PDF** link, shortened to an arrow on very narrow screens, which hands the file
to the system viewer: Quick Look on iOS, where a screen reader can reach the
words of any PDF that has real text in it, which a drawing never offers.

The Print, Download and Email buttons keep their spoken names on a phone, where
the words beside their icons are hidden to save room.
