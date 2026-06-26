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
      '<div class="flex flex-col px-1" style="height:104px">' +
      '<div class="line-clamp-3 font-medium text-sm leading-[1.25]">' + r.brand + " " + r.title + '</div>' +
      '<div class="text-token-text-secondary text-[13px]" style="margin-top:3px">$' + r.price + ' · ' + r.cohort.n + ' tested for your skin</div>' +
      '<span class="text-[13px] flex flex-row items-center gap-1" style="color:' + GREEN + ';font-weight:500;margin-top:auto">' + CHK() + badge + '</span>' +
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

    function li(num, rest) {
      return '<li style="display:flex;align-items:baseline;gap:9px;font-size:15px;line-height:1.5">' +
        '<span style="position:relative;top:2px;flex:none">' + CHK() + '</span>' +
        '<span><strong style="color:#ececec">' + num + '</strong> ' + rest + '</span></li>';
    }
    var repTot = co.rep_yes + co.rep_n;
    var hero = '<p style="font-size:16px;line-height:26px">For your exact skin, I found <strong>' + co.n + ' people with oily, acne-prone skin like yours</strong> who wear-tested <strong>' + w.brand + " " + w.title + '</strong> ($' + w.price + '). Here is what actually happened to them, not what the brand or star average claims:</p>' +
      '<ul style="list-style:none;padding:0;margin:10px 0 4px;display:flex;flex-direction:column;gap:7px">' +
      li(co.broke + " of " + co.n, "broke out") +
      li(co.matte + " of " + co.n, "stayed matte all day") +
      li(co.pos + " of " + co.n, "rated it positively") +
      li("~" + co.avg_hrs + " hours", "average wear before it broke down") +
      li(co.rep_yes + " of " + repTot, "who mentioned repurchasing said they would buy it again") +
      '</ul>' +
      '<p class="text-token-text-secondary" style="font-size:12.5px;margin:8px 0 0">' +
      (co.oxid ? "Honest flag: " + co.oxid + " of " + co.n + " noted slight oxidation in heat. " : "") +
      D.corpus.sponsored_excluded + " sponsored reviews were flagged and excluded.</p>";

    function relScore(v) { return (/oily/i.test(v.skin) ? 2 : 1) + (v.acne ? 2 : 0) + ((v.matte === "mostly" || v.matte === "yes") ? 1 : 0) + (v.hrs ? Math.min(v.hrs, 12) / 12 : 0); }
    var best = w.videos.slice().sort(function (a, b) { return relScore(b) - relScore(a); })[0];
    var grid = '<p style="margin:18px 0 8px">Watch one with your exact skin — <strong>' + best.channel + '</strong>, ' + best.skin + (best.acne ? ", acne-prone" : "") + (best.hrs ? ", " + best.hrs + "-hour wear test" : "") + ':</p>' +
      '<div data-video="' + best.vid + '" style="position:relative;max-width:520px;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;cursor:pointer">' +
      '<img src="https://img.youtube.com/vi/' + best.vid + '/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover" alt="">' +
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="width:56px;height:56px;border-radius:999px;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div></div></div>';

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
        var id = box.getAttribute("data-video");
        box.innerHTML = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute;inset:0"></iframe>';
      });
    });
    return true;
  }

  function go(D) { if (!build(D)) { var n = 0, iv = setInterval(function () { if (build(D) || ++n > 40) clearInterval(iv); }, 100); } }
  fetch("bw-cohort.json").then(function (r) { return r.json(); }).then(go).catch(function (e) { console.error("blackwell cohort load failed", e); });
})();
