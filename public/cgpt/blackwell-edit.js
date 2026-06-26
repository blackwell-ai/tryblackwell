/* Blackwell-powered shopping result injected INTO the real ChatGPT page.
   Centered on the wedge ChatGPT + star ratings can't do: outcomes for people
   with the shopper's EXACT skin. Native chrome/styling, embedded videos, no
   external links, no refutation of ChatGPT's pick. Data from bw-cohort.json
   (a wide, unbiased 28-foundation / 246 wear-test corpus). */
(function () {
  var GREEN = "#5db075", G2 = "#7cd49a";
  function CHK(c) { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="' + (c || GREEN) + '" style="flex:none"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/></svg>'; }
  function imgFor(sub) { var i = Array.prototype.find.call(document.querySelectorAll("img"), function (x) { return x.alt && x.alt.toLowerCase().indexOf(sub) !== -1; }); return i ? i.getAttribute("src") : ""; }
  function thumb(v) { return "https://img.youtube.com/vi/" + v + "/mqdefault.jpg"; } // clean 16:9, no black bars

  function card(r, badge) {
    var key = (r.brand + " " + r.title).toLowerCase();
    var sub = key.indexOf("super stay") + 1 ? "super stay" : key.indexOf("infallible") + 1 ? "infallible" : key.indexOf("revlon") + 1 ? "revlon" : key.indexOf("fenty") + 1 ? "fenty" : "mac studio fix";
    return '<div class="shrink-0 snap-start basis-[calc((100%-2rem)/3)]"><div class="h-full w-full cursor-pointer group"><div class="group h-full"><div class="flex pb-2 flex-col gap-2">' +
      '<div class="relative aspect-[13/16] w-full overflow-clip rounded-xl bg-[#F3F3F3] dark:bg-[#F3F3F3]" style="background-color:rgb(239,239,239)">' +
      '<div class="h-full w-full" style="display:flex;align-items:center;justify-content:center;mix-blend-mode:darken"><img class="m-0 block" style="max-width:86%;max-height:86%;object-fit:contain;mix-blend-mode:darken" alt="' + r.brand + '" src="' + imgFor(sub) + '"></div></div>' +
      '<div class="flex flex-col gap-1 px-1">' +
      '<div class="line-clamp-2 font-medium text-ellipsis text-sm"><span>' + r.brand + " " + r.title + '</span></div>' +
      '<div class="text-token-text-secondary flex flex-col text-sm"><div><div><div class="line-clamp-4 leading-5 md:line-clamp-3">' +
      '<span>$' + r.price + '</span><span class="mx-0.5">•</span><span>' + r.cohort.n + ' people with your skin · ' + r.cohort.broke + ' broke out · ' + r.cohort.matte + ' stayed matte</span></div></div></div></div>' +
      '<span class="text-sm flex flex-row items-center gap-1" style="color:' + GREEN + ';font-weight:500">' + CHK() + badge + '</span>' +
      '</div></div></div></div></div>';
  }

  function stat(num, label, good) {
    return '<div style="flex:1;min-width:120px;border:1px solid #2b2b2b;border-radius:12px;background:#1c1c1c;padding:11px 13px">' +
      '<div style="font-size:22px;font-weight:600;color:' + (good ? G2 : "#fff") + ';line-height:1.1">' + num + '</div>' +
      '<div class="text-token-text-secondary" style="font-size:12px;margin-top:3px">' + label + '</div></div>';
  }

  function build(D) {
    var w = D.winner, co = w.cohort;
    // 1) preamble + thinking
    document.querySelectorAll("p").forEach(function (pp) {
      var t = pp.textContent.trim();
      if (t.indexOf("narrow this to foundations") !== -1) pp.innerHTML = "Reading wear tests from people with your exact skin (oily, acne-prone, warm-olive ~NC42) and tracking what actually happened to their skin over the day.";
      else if (t.indexOf("found one clear") !== -1) pp.remove();
    });
    document.querySelectorAll("button, span, div").forEach(function (e) {
      e.childNodes.forEach(function (n) { if (n.nodeType === 3 && /Thought for 1m 19s/.test(n.textContent)) n.textContent = "Analyzed " + D.corpus.videos + " wear tests across " + D.corpus.products + " foundations"; });
    });

    // 2) carousel = the in-budget winners (cards with images)
    var widget = document.querySelector('[data-testid="products-widget"]');
    if (widget) {
      var row = widget.querySelector(".overflow-x-scroll") || widget.querySelector('[class*="overflow-x"]');
      if (row) {
        var inBudget = [w].concat(D.runner_ups.filter(function (r) { return r.image; }));
        var badges = ["Best for your skin", "Best wear time", "Best on a budget", "Also strong"];
        row.innerHTML = inBudget.slice(0, 3).map(function (r, i) { return card(r, badges[i]); }).join("");
      }
    }

    // 3) the answer = the cohort experience
    var getp = Array.prototype.find.call(document.querySelectorAll("p"), function (x) { return x.textContent.trim().indexOf("Get the") === 0; });
    if (!getp) return false;

    var profile = '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:2px 0 14px">' +
      '<span class="text-token-text-secondary" style="font-size:12px">From your profile</span>' +
      D.profile.attrs.map(function (a) { return '<span style="border:1px solid #333;background:#262626;border-radius:999px;padding:2px 9px;font-size:11.5px;color:#cfcfcf">' + a + '</span>'; }).join("") + '</div>';

    var hero = '<p style="font-size:16px;line-height:26px">For your exact skin, I found <strong>' + co.n + ' people with oily, acne-prone skin like yours</strong> who wear-tested <strong>' + w.brand + " " + w.title + '</strong> ($' + w.price + '). Here is what actually happened to them, not what the brand or star average claims:</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 6px">' +
      stat(co.broke + " of " + co.n, "broke out", true) +
      stat(co.matte + " of " + co.n, "stayed matte all day", true) +
      stat(co.pos + " of " + co.n, "rated it positively", true) +
      stat("~" + co.avg_hrs + "h", "average wear before breakdown", false) +
      stat(co.rep_pct + "%", "would buy it again", true) + '</div>' +
      (co.oxid ? '<p class="text-token-text-secondary" style="font-size:12.5px;margin:6px 0 0">Honest flag: ' + co.oxid + ' of ' + co.n + ' noted slight oxidation in heat. ' + D.corpus.sponsored_excluded + ' sponsored reviews were flagged and excluded.</p>'
        : '<p class="text-token-text-secondary" style="font-size:12.5px;margin:6px 0 0">' + D.corpus.sponsored_excluded + ' sponsored reviews were flagged and excluded.</p>');

    var grid = '<p style="margin:18px 0 4px"><strong>These are the ' + co.n + '.</strong> Real people with your skin. Tap any to watch their full day.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:8px">' +
      w.videos.map(function (v) {
        return '<div data-video="' + v.vid + '"><div style="position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#000;cursor:pointer">' +
          '<img src="' + thumb(v.vid) + '" style="width:100%;height:100%;object-fit:cover" alt="">' +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="width:34px;height:34px;border-radius:999px;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div></div>' +
          (v.hrs ? '<div style="position:absolute;bottom:5px;right:5px;background:rgba(0,0,0,.7);color:#fff;font-size:10px;padding:1px 5px;border-radius:5px">' + v.hrs + 'h test</div>' : '') + '</div>' +
          '<div class="text-token-text-secondary" style="font-size:11px;margin-top:4px;line-height:1.3"><span class="text-token-text-primary">' + v.channel + '</span><br>' + v.skin + (v.acne ? ', acne-prone' : '') + '</div></div>';
      }).join("") + '</div>';

    var narrow = '<details style="margin-top:18px"><summary style="cursor:pointer" class="text-token-text-secondary">How this beat ' + (D.corpus.products - 1) + ' other foundations for your skin</summary>' +
      '<div style="padding-top:8px" class="text-token-text-secondary">' +
      '<p style="margin:0 0 8px">We scored every foundation only on the reviewers who share your skin, across ' + D.corpus.videos + ' wear tests. The in-budget options that held up:</p>' +
      '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px">' +
      [w].concat(D.runner_ups).map(function (r) {
        return '<li style="display:flex;gap:8px;align-items:center"><span style="color:' + (r.rank === 1 ? G2 : "#8f8f8f") + '">' + (r.rank === 1 ? "★" : "•") + '</span><span class="text-token-text-primary">' + r.brand + " " + r.title + '</span> <span>· $' + r.price + (r.price > 45 ? ' (over budget)' : '') + ' · cohort ' + r.cohort.n + ' · ' + r.cohort.matte + '/' + r.cohort.n + ' matte · ' + r.cohort.broke + ' broke out</span></li>';
      }).join("") + '</ul></div></details>';

    var checkout = '<div style="border:1px solid #2f2f2f;border-radius:14px;background:#191919;padding:12px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px">' +
      '<div style="display:flex;align-items:center;gap:8px"><span class="text-token-text-secondary" style="font-size:12px">Shade</span>' +
      '<select style="background:#262626;border:1px solid #3a3a3a;border-radius:8px;color:#fff;font-size:13px;padding:6px 8px"><option>Warm Sun 332</option><option selected>Warm Honey 340</option><option>Caramel 355</option></select></div>' +
      '<div style="margin-left:auto;text-align:right"><div class="text-token-text-secondary" style="font-size:11px">Free shipping · arrives Tue</div><div style="font-size:15px;font-weight:600;color:#fff">$' + w.price + '.00</div></div>' +
      '<button style="display:flex;align-items:center;gap:6px;background:#fff;color:#0d0d0d;font-weight:600;font-size:14px;border:none;border-radius:999px;padding:9px 22px;cursor:pointer">' + CHK("#1a7f44") + 'Buy now</button></div>';

    var holder = document.createElement("div");
    holder.className = "bw-ans";
    holder.innerHTML = profile + hero + grid + narrow + checkout;
    getp.parentElement.insertBefore(holder, getp);
    var n = getp, rm = []; while (n) { rm.push(n); n = n.nextElementSibling; } rm.forEach(function (e) { e.remove(); });

    holder.querySelectorAll("[data-video]").forEach(function (box) {
      box.addEventListener("click", function () {
        var id = box.getAttribute("data-video"), inner = box.firstElementChild;
        inner.innerHTML = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute;inset:0"></iframe>';
      });
    });
    return true;
  }

  function go(D) { if (!build(D)) { var n = 0, iv = setInterval(function () { if (build(D) || ++n > 40) clearInterval(iv); }, 100); } }
  fetch("bw-cohort.json").then(function (r) { return r.json(); }).then(go).catch(function (e) { console.error("blackwell cohort load failed", e); });
})();
