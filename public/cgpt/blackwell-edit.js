/* Injects a Blackwell-powered shopping result INTO the real ChatGPT page using
   ChatGPT's own product-carousel markup + styling. Multiple recommendations, no
   match score, embedded videos (no external links), tap-to-reveal raw data, a
   12-foundation narrowing funnel. Does not refute ChatGPT's earlier pick. */
(function () {
  // --- recommendations: each "best for X", ordered, all genuine fits ---
  var RECS = [
    { alt: "fenty", name: "Fenty Beauty Pro Filt’r Soft Matte Longwear Foundation", price: "41.00",
      blurb: "No breakout or oxidation complaints from oily, acne-prone reviewers.", badge: "Best for acne-prone skin" },
    { alt: "infallible", name: "L’Oréal Paris Infallible Fresh Wear Foundation", price: "15.89",
      blurb: "Top oil control and 32-hour wear of all 12. Patch-test for breakouts.", badge: "Best value" },
    { alt: "mac studio fix", name: "MAC Studio Fix Fluid SPF 15 24HR Matte Foundation", price: "39.00",
      blurb: "Fullest coverage and the closest warm-olive shade match.", badge: "Best coverage" },
    { alt: "super stay", name: "Maybelline Super Stay Lumi-Matte Foundation", price: "14.99",
      blurb: "Strongest matte oil control on a budget; can warm a shade by evening.", badge: "Most oil control" },
  ];

  var pick = {
    criteria: [
      { label: "Stays matte all day", n: 3, channel: "Its EmmaRose",
        quote: "I did not put on a primer or a setting spray and I also did not powder whilst I was out. So this is five hours of nothing… my makeup has not budged." },
      { label: "Lasts a 10-hour day", n: 2, channel: "Sasha Stockwell",
        quote: "The foundation itself stood its ground. It still looks pretty good for 11 hours of wear." },
      { label: "Covers acne & redness", n: 3, channel: "Sasha Stockwell",
        quote: "It doesn’t feel like I’m wearing a lot of makeup, yet I have full coverage over all my old pigment and a couple zits." },
    ],
    proof: [
      { vid: "edV6zH-ncps", channel: "Its EmmaRose", skin: "Oily, sensitive, acne-prone" },
      { vid: "bBNpfqw4fWI", channel: "Sasha Stockwell", skin: "Oily, acne-prone" },
      { vid: "I_7cZdn5FSM", channel: "Simply Kee Samone", skin: "Acne-prone" },
      { vid: "SgZOeolR-90", channel: "Makeup By Allie Ann", skin: "Combination, oily" },
    ],
  };
  var funnel = [
    { label: "12 foundations, scored on real wear tests from oily, acne-prone reviewers", kept: true },
    { out: "Turn orange on warm skin", who: "Dior Forever, Maybelline Fit Me, NARS" },
    { out: "Over budget", who: "Charlotte Tilbury $49, Double Wear $48" },
    { out: "A breakout report on acne-prone skin", who: "L’Oréal Infallible — still your best value, just patch-test" },
    { label: "Top match: strong wear, full coverage, zero breakout or oxidation complaints", kept: true, win: true },
  ];

  var CHECK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#5db075" style="flex:none"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/></svg>';
  function imgFor(sub) {
    var im = Array.prototype.find.call(document.querySelectorAll("img"), function (i) { return i.alt && i.alt.toLowerCase().indexOf(sub) !== -1; });
    return im ? im.getAttribute("src") : "";
  }

  // --- native ChatGPT product card ---
  function card(r) {
    return '<div class="shrink-0 snap-start basis-[calc((100%-2rem)/3)]"><div class="h-full w-full cursor-pointer group"><div class="group h-full"><div class="flex pb-2 flex-col gap-2">' +
      '<div class="relative aspect-[13/16] w-full overflow-clip rounded-xl bg-[#F3F3F3] dark:bg-[#F3F3F3]" style="background-color:rgb(239,239,239)">' +
      '<div class="h-full w-full" style="display:flex;align-items:center;justify-content:center;mix-blend-mode:darken">' +
      '<img class="m-0 block select-none" style="max-width:86%;max-height:86%;object-fit:contain;mix-blend-mode:darken" alt="' + r.name + '" src="' + imgFor(r.alt) + '"></div></div>' +
      '<div class="flex flex-col gap-1 px-1">' +
      '<div class="line-clamp-2 font-medium text-ellipsis text-sm"><span>' + r.name + '</span></div>' +
      '<div class="text-token-text-secondary flex flex-col text-sm"><div><div><div class="line-clamp-4 leading-5 md:line-clamp-3">' +
      '<span>$' + r.price + '</span><span class="mx-0.5">•</span><span>' + r.blurb + '</span></div></div></div></div>' +
      '<span class="text-sm flex flex-row items-center gap-1" style="color:#5db075;font-weight:500">' + CHECK + r.badge + '</span>' +
      '</div></div></div></div></div>';
  }

  function rebuildCarousel() {
    var w = document.querySelector('[data-testid="products-widget"]');
    if (!w) return false;
    var row = w.querySelector(".overflow-x-scroll") || w.querySelector('[class*="overflow-x"]');
    if (!row) { var a = w.firstElementChild; row = a && a.firstElementChild; }
    if (!row) return false;
    row.innerHTML = RECS.map(card).join("");
    return true;
  }

  // --- the evidence answer (native ChatGPT prose styling) ---
  function answerHTML() {
    var crit = pick.criteria.map(function (c, i) {
      return '<li style="margin:0;padding:4px 0">' +
        '<div style="display:flex;align-items:center;gap:8px">' + CHECK +
        '<span>' + c.label + ' <span class="text-token-text-tertiary">· ' + c.n + ' wear tests</span></span>' +
        '<button data-data="' + i + '" style="margin-inline-start:auto;background:none;border:none;color:#7fae90;font-size:13px;cursor:pointer">see the data</button></div>' +
        '<div data-panel="' + i + '" style="display:none;margin-top:6px;border:1px solid var(--border-light,#ffffff1a);border-radius:10px;background:#0000001f;padding:10px;font-size:12.5px" class="text-token-text-secondary">' +
        '<div style="font-family:ui-monospace,monospace;color:#7fae90;margin-bottom:6px">dimension: ' + c.label.toLowerCase() + '  ·  n=' + c.n + '  ·  source: ' + c.channel + '</div>' +
        '<div style="font-style:italic" class="text-token-text-primary">“' + c.quote + '”</div></div></li>';
    }).join("");

    var vids = pick.proof.map(function (v) {
      return '<div style="width:232px;flex:none"><div data-video="' + v.vid + '" style="position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;cursor:pointer">' +
        '<img src="https://img.youtube.com/vi/' + v.vid + '/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover" alt="">' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="width:42px;height:42px;border-radius:999px;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div></div></div>' +
        '<div class="text-sm" style="margin-top:6px">' + v.channel + '</div><div class="text-token-text-tertiary" style="font-size:12px">' + v.skin + '</div></div>';
    }).join("");

    var funn = funnel.map(function (f) {
      if (f.out) return '<li style="display:flex;gap:8px;padding:3px 0" class="text-token-text-secondary"><span style="color:#b86a5b">✕</span><span><span class="text-token-text-primary">' + f.out + ':</span> ' + f.who + '</span></li>';
      return '<li style="display:flex;gap:8px;padding:3px 0;' + (f.win ? 'color:#7fae90' : '') + '" class="' + (f.win ? '' : 'text-token-text-secondary') + '"><span style="color:' + (f.win ? '#5db075' : '#8f8f8f') + '">' + (f.win ? '★' : '•') + '</span><span>' + f.label + '</span></li>';
    }).join("");

    return '<p>I scored all 12 on what you asked for using real wear tests from people with your exact skin. The cards above are ranked for you. Your top match is <strong>Fenty Pro Filt’r Soft Matte</strong> — here is what people with oily, acne-prone skin found.</p>' +
      '<ul style="list-style:none;padding:0;margin:8px 0 4px">' + crit +
      '<li style="display:flex;align-items:center;gap:8px;padding:4px 0">' + CHECK + '<span>0 breakout and 0 oxidation complaints <span class="text-token-text-tertiary">· 4 same-skin wear tests · 8 sponsored excluded</span></span></li></ul>' +
      '<p class="text-token-text-secondary" style="margin:14px 0 8px">Watch people with your skin wear it. Distilled into the data above, so you don’t have to.</p>' +
      '<div style="display:flex;gap:14px;overflow-x:auto;padding-bottom:6px">' + vids + '</div>' +
      '<details style="margin-top:14px"><summary style="cursor:pointer" class="text-token-text-secondary">How we narrowed 12 foundations down to this</summary>' +
      '<ul style="list-style:none;padding:8px 0 0;margin:0">' + funn + '</ul></details>';
  }

  function wire(root) {
    root.querySelectorAll("[data-data]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = root.querySelector('[data-panel="' + b.getAttribute("data-data") + '"]');
        p.style.display = p.style.display === "none" ? "block" : "none";
        b.textContent = p.style.display === "none" ? "see the data" : "hide";
      });
    });
    root.querySelectorAll("[data-video]").forEach(function (box) {
      box.addEventListener("click", function () {
        var id = box.getAttribute("data-video");
        box.outerHTML = '<div style="position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute;inset:0"></iframe></div>';
      });
    });
  }

  function inject() {
    // preamble (positive, no refutation)
    document.querySelectorAll("p").forEach(function (pp) {
      var t = pp.textContent.trim();
      if (t.indexOf("narrow this to foundations") !== -1)
        pp.innerHTML = "Reading real wear tests from people with your exact skin (oily, acne-prone, warm-olive ~NC42) and scoring every foundation on what you asked for.";
      else if (t.indexOf("found one clear") !== -1) pp.remove();
    });
    document.querySelectorAll("button, span, div").forEach(function (e) {
      e.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && /Thought for 1m 19s/.test(n.textContent)) n.textContent = "Analyzed 45 wear tests from oily, acne-prone reviewers";
      });
    });
    var getp = Array.prototype.find.call(document.querySelectorAll("p"), function (x) { return x.textContent.trim().indexOf("Get the") === 0; });
    if (!getp) return false;
    rebuildCarousel(); // carousel is a sibling BEFORE getp, so it survives the answer swap
    var holder = document.createElement("div");
    holder.className = "bw-ans";
    holder.innerHTML = answerHTML();
    getp.parentElement.insertBefore(holder, getp);
    var n = getp, rm = [];
    while (n) { rm.push(n); n = n.nextElementSibling; }
    rm.forEach(function (e) { e.remove(); });
    wire(holder);
    return true;
  }

  if (!inject()) { var n = 0, iv = setInterval(function () { if (inject() || ++n > 40) clearInterval(iv); }, 100); }
})();
