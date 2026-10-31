/* The Elements language inserts {{ }} verbatim, so a value carrying a double
 * quote closes the attribute it lands in and everything after it is parsed as
 * more attributes — the document title reaches two iframe title attributes, and
 * the email subject reaches a data attribute. Component Templates.md states the
 * rule and puts the encoding here, in hooks, rather than in the template.
 *
 * The HTML parser decodes attribute values again on the way out, so the script's
 * getAttribute('data-email-subject') still receives the author's literal text
 * before it is handed to encodeURIComponent. */
const attr = (v) =>
    String(v === null || v === undefined ? "" : v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

/* Host out of an absolute http(s) URL, or "" for anything else — which includes
 * the relative path a resource dropped into the project produces, and that is
 * precisely the case that is always safe.
 *
 * String-matched rather than parsed because hooks run in a closed sandbox and
 * this needs no more than the authority segment. */
const hostOf = (u) => {
    const m = /^https?:\/\/([^/?#]+)/i.exec(
        String(u === null || u === undefined ? "" : u)
    );
    return m ? m[1].toLowerCase() : "";
};

const transformHook = (rw) => {
    const { showPrint, showDownload, showEmail, docTitle, screenName, emailSubject, pdf, viewerBg } = rw.props;
    /* String() first: the Inspector only ever stores text in these three, but
       Elements AI and an MCP client write JSON, and a bare number made .trim()
       throw, which leaves no component on the page at all. */
    const title = String(docTitle || "").trim();

    /* pdf.js is bundled under assets/page/ and served from this site rather than
       from a CDN, so script.html needs the published asset path. Only rw.node is
       automatically available in templates — everything else has to be passed. */
    const { assetPath } = rw.component;

    /* The touch viewer reads the file with a fetch, so a PDF on another origin
       is unreadable unless that server sends an Access-Control-Allow-Origin
       header — see the long note in script.html. Nothing the component can do
       works around a server that does not send one, so the next best thing is
       to say so while the author is still editing, rather than let them ship a
       page that looks perfect on the Mac in front of them and degrades on every
       phone. The template shows this only inside @if(edit); it never reaches a
       visitor.

       A missing siteUrl leaves siteHost empty, so an absolute URL is flagged.
       That is the right way round: the warning is advisory, and a false positive
       costs a sentence the author can ignore, where a false negative costs the
       silent breakage this exists to prevent. */
    const pdfHost = hostOf(pdf && pdf.path);

    rw.setProps({
        assetPath,
        crossOriginPdf: !!pdfHost && pdfHost !== hostOf((rw.project || {}).siteUrl),
        docTitle: attr(title.length ? title : "PDF Document"),
        /* Both are free-text controls the template reads straight into markup, so
           they are re-emitted here encoded. Empty stays empty, so the template's
           @if(screenName) branch behaves exactly as before.

           emailSubject is deliberately NOT refilled with its control default when
           it is absent: script.html already falls back to that same string, and
           duplicating the default here would give two places to keep in step. An
           empty data attribute and a missing one both end up at the same subject
           line. */
        screenName: attr(String(screenName || "").trim()),
        emailSubject: attr(String(emailSubject || "").trim()),
        /* Background arrived in build 17. An instance placed before it stored
           nothing for a control that did not exist yet, so the control resolves
           to empty — and left empty the component body, the stage, the cover
           screen and the frame all lose their background at once and the page
           shows through, a visible change to a page nobody edited. This is the
           control's own declared default, so an untouched instance and a fresh
           drop render alike.

           It is a *second* class rather than a value substituted for viewerBg,
           and the difference matters. Nothing here reads what a theme control
           holds: across all six packs, 61 theme controls and not one is touched
           by a hook, and the rw.props type table in Hooks.js.md stops at
           `color` without reaching any of the eight theme* controls. So whether
           a hook receives the finished `bg-surface-50` or the token behind it
           is genuinely unknown, and writing viewerBg back through setProps
           would put whichever one it is into the markup verbatim. Asking only
           whether the author picked *anything* has the same answer either way.

           No dark-mode half, deliberately: the control is in `single` mode, so
           one colour is chosen and that colour is what renders. */
        viewerBgFallback: viewerBg ? "" : "bg-surface-50",
        showToolbar: !!(showPrint || showDownload || showEmail)
    });
};

exports.transformHook = transformHook;
