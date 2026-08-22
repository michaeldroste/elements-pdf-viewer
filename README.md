# elements-pdf-viewer

## PDF Viewer for RapidWeaver Elements

A native PDF component for RapidWeaver Elements that displays documents inline on your page, with no third-party embeds, no iframe hacks, and no reliance on external viewer services.

Drop the component onto a page, point it at a PDF in your Resources folder or at a remote URL, and it renders directly in the browser. Visitors read your document where it lives instead of downloading a file and leaving your site.

## Cross-origin aware

PDFs hosted on a separate domain or CDN — Cloudflare R2, Amazon S3, or any external host — frequently fail to render because of browser security policy. Rather than showing a broken frame or an empty box, the component detects the cross-origin condition and presents a clean fallback card offering a direct link to open the PDF. A console warning explains the cause so you can correct the CORS configuration on your bucket if you want inline rendering.

The fallback is designed to look intentional rather than broken, and it has been tested at small viewport widths so it holds up on phones.

## Responsive by default

Sizing is viewport-detected and automatic. There is no manual mobile toggle to remember, no separate breakpoint settings to configure, and no per-page adjustment. The viewer adapts to the container it is placed in.

## Built to Elements conventions

The component uses the standard Elements Inspector, respects Theme Studio settings, and works with the Resources workflow like any built-in component. No external JavaScript libraries are bundled and no build step is required.

## Requirements

RapidWeaver Elements. PDFs served cross-origin need appropriate CORS headers on the host for inline display; otherwise the fallback card is shown.

## Installation

Download the pack from Releases, open Elements Settings, select the Addons panel, and click Add Pack.
