/* Echo OS — interaction layer. No dependencies. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  var toast = document.querySelector("[data-toast]");
  var toastTimer;
  var lastFocused;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }

  /* ---------------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------------- */
  function closeMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.style.removeProperty("overflow");
    if (lastFocused) { lastFocused.focus(); lastFocused = null; }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var open = menuToggle.getAttribute("aria-expanded") === "true";
      if (open) { closeMenu(); return; }
      lastFocused = document.activeElement;
      mobileMenu.hidden = false;
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
      document.body.style.setProperty("overflow", "hidden");
      var first = mobileMenu.querySelector("a, button");
      if (first) first.focus();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") closeMenu();
    });

    mobileMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Countdown to the next release target (2026-11-24T00:00:00Z)
     --------------------------------------------------------------------- */
  var countdownEl = document.querySelector("[data-countdown]");
  if (countdownEl) {
    var target = Date.UTC(2026, 10, 24, 0, 0, 0);
    var cdDays = countdownEl.querySelector('[data-cd="days"]');
    var cdHours = countdownEl.querySelector('[data-cd="hours"]');
    var cdMinutes = countdownEl.querySelector('[data-cd="minutes"]');
    var cdSeconds = countdownEl.querySelector('[data-cd="seconds"]');
    function pad(n) { return String(n).padStart(2, "0"); }
    function tickCountdown() {
      var diff = target - Date.now();
      if (diff <= 0) {
        [cdDays, cdHours, cdMinutes, cdSeconds].forEach(function (el) { if (el) el.textContent = "--"; });
        return;
      }
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400);
      var h = Math.floor((s % 86400) / 3600);
      var m = Math.floor((s % 3600) / 60);
      if (cdDays) cdDays.textContent = pad(d);
      if (cdHours) cdHours.textContent = pad(h);
      if (cdMinutes) cdMinutes.textContent = pad(m);
      if (cdSeconds) cdSeconds.textContent = pad(s % 60);
      setTimeout(tickCountdown, 1000);
    }
    tickCountdown();
  }

  /* ---------------------------------------------------------------------
     Ticker: ink marquee with pause control
     --------------------------------------------------------------------- */
  var ticker = document.querySelector("[data-ticker]");
  var tickerToggle = document.querySelector("[data-ticker-toggle]");
  if (ticker && tickerToggle) {
    var tickerWrap = ticker.closest(".ticker");
    if (reduceMotion) {
      tickerWrap.classList.add("is-paused");
      tickerToggle.hidden = true;
    } else {
      tickerToggle.addEventListener("click", function () {
        var paused = tickerWrap.classList.toggle("is-paused");
        tickerToggle.setAttribute("aria-label", paused ? "Resume ticker animation" : "Pause ticker animation");
      });
    }
  }

  /* ---------------------------------------------------------------------
     Hero wordmark: auto-typing "echo os" with block cursor
     --------------------------------------------------------------------- */
  var typeGroups = document.querySelectorAll("[data-type-text]");
  var typeMark = document.querySelector("[data-type-mark]");
  if (typeGroups.length && !reduceMotion) {
    var letters = [];
    var firstGroupCount = 0;
    Array.prototype.forEach.call(typeGroups, function (group, gi) {
      var text = group.textContent;
      group.textContent = "";
      group.setAttribute("aria-hidden", "true");
      text.split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "type-letter";
        s.textContent = ch;
        group.appendChild(s);
        letters.push(s);
      });
      if (gi === 0) firstGroupCount = group.childNodes.length;
    });
    letters.forEach(function (s, idx) {
      setTimeout(function () { s.classList.add("is-on"); }, 450 + 120 * idx);
    });
    if (typeMark) {
      typeMark.classList.add("is-hidden");
      setTimeout(function () {
        typeMark.classList.remove("is-hidden");
        typeMark.classList.add("is-revealed");
      }, 450 + 120 * firstGroupCount);
    }
  }

  /* ---------------------------------------------------------------------
     Cursor trail: grid-snapped glyph blocks that pop in and shrink away
     --------------------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    var TRAIL_COLORS = ["#ae85ff", "#f73678", "#c05200", "#583af7", "#5fed83", "#bba00a"];
    var TRAIL_GLYPHS = ["-", "/", ")", ".", "+", "=", ">", "<", "*", "&", "("];
    var TRAIL_POOL = 40;
    var trailCells = [];
    var trailTimers = new Array(TRAIL_POOL);
    var trailSlot = 0;
    var lastCellX = -1;
    var lastCellY = -1;

    for (var tn = 0; tn < TRAIL_POOL; tn++) {
      var block = document.createElement("div");
      block.className = "trail-block";
      block.setAttribute("aria-hidden", "true");
      var face = document.createElement("span");
      face.className = "trail-face";
      block.appendChild(face);
      document.body.appendChild(block);
      trailCells.push({ el: block, face: face, active: false, x: 0, y: 0, size: 0 });
    }

    var gridEl = document.querySelector(".boot__screen");

    function trailMetrics() {
      var rect = gridEl ? gridEl.getBoundingClientRect() : { left: 0, top: 0, width: Math.min(window.innerWidth, 1600) };
      var divisions = window.innerWidth >= 1012 ? 94 : 67;
      return { rect: rect, w: rect.width / divisions };
    }

    window.addEventListener("mousemove", function (e) {
      var t = e.target;
      if (t instanceof Element && t.closest("button, a, input, textarea, select, dialog")) return;
      if (t instanceof Element && t.closest(".hero__wordmark, .footer__wordmark")) return;
      var m = trailMetrics();
      var cx = m.rect.left + Math.floor((e.clientX - m.rect.left) / m.w) * m.w;
      var cy = m.rect.top + Math.floor((e.clientY - m.rect.top) / m.w) * m.w;
      if (cx === lastCellX && cy === lastCellY) return;
      lastCellX = cx;
      lastCellY = cy;
      for (var i = 0; i < TRAIL_POOL; i++) {
        var c = trailCells[i];
        if (c.active && c.x === cx && c.y === cy && c.size === m.w) return;
      }
      trailSlot = (trailSlot + 1) % TRAIL_POOL;
      var cell = trailCells[trailSlot];
      clearTimeout(trailTimers[trailSlot]);
      cell.active = true;
      cell.x = cx;
      cell.y = cy;
      cell.size = m.w;
      cell.el.style.transform = "translate(" + cx + "px," + cy + "px)";
      cell.el.style.width = m.w + "px";
      cell.el.style.height = m.w + "px";
      cell.el.style.fontSize = Math.round(m.w * 0.45) + "px";
      cell.face.style.backgroundColor = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
      cell.face.textContent = Math.random() < 0.3 ? " " : TRAIL_GLYPHS[Math.floor(Math.random() * TRAIL_GLYPHS.length)];
      cell.el.classList.add("is-active");
      trailTimers[trailSlot] = setTimeout(function () {
        cell.active = false;
        cell.el.classList.remove("is-active");
      }, 100 + 300 * Math.random());
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Boot sequence (hero interactive, original)
     --------------------------------------------------------------------- */
  var boot = document.querySelector("[data-boot]");
  if (boot) {
    var linesHost = boot.querySelector("[data-boot-lines]");
    var desktop = boot.querySelector("[data-boot-desktop]");
    var shotsHost = boot.querySelector("[data-boot-shots]");
    var shotEls = shotsHost ? Array.prototype.slice.call(shotsHost.querySelectorAll(".boot__shot")) : [];
    var badge = boot.querySelector("[data-boot-badge]");
    var hud = document.querySelector("[data-boot-hud]");
    var playBtn = document.querySelector("[data-boot-play]");
    var steps = [
      { k: "echo-boot", t: "bios + uefi paths", ok: "ok" },
      { k: "echo-boot", t: "loading initramfs", ok: "ok" },
      { k: "echo-core", t: "xfce live session up", ok: "ok" },
      { k: "echo-install", t: "calamares offline installer", ok: "ready" },
      { k: "aira", t: "system intelligence layer", ok: "planned", warn: true }
    ];
    var timers = [];
    var playing = false;
    var done = false;
    var shotIdx = 0;

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function renderStep(i) {
      var s = steps[i];
      var li = document.createElement("li");
      li.innerHTML =
        '<span class="k">' + s.k + "</span><span>" + s.t + '</span><span class="dots"></span><span class="' + (s.warn ? "warn" : "ok") + '">' + s.ok + "</span>";
      linesHost.appendChild(li);
      requestAnimationFrame(function () { li.classList.add("is-in"); });
      if (hud) hud.textContent = "stage " + (i + 1) + "/" + steps.length;
    }

    function showShot(n) {
      shotIdx = (n + shotEls.length) % shotEls.length;
      shotEls.forEach(function (f, i) { f.classList.toggle("is-active", i === shotIdx); });
    }

    function startShots() {
      if (!shotsHost || !shotEls.length) return;
      if (desktop) desktop.classList.remove("is-in");
      shotsHost.classList.add("is-in");
      showShot(0);
      timers.push(setInterval(function () { showShot(shotIdx + 1); }, 3200));
    }

    function finish() {
      playing = false;
      done = true;
      if (badge) { badge.textContent = "up/"; badge.classList.remove("is-busy"); }
      if (desktop) desktop.classList.add("is-in");
      if (hud) hud.textContent = "stage " + steps.length + "/" + steps.length + " \u00b7 verified in vm";
      if (playBtn) playBtn.textContent = "Replay";
      if (!reduceMotion) timers.push(setTimeout(startShots, 1600));
    }

    function reset() {
      clearTimers();
      linesHost.innerHTML = "";
      if (desktop) desktop.classList.remove("is-in");
      if (shotsHost) shotsHost.classList.remove("is-in");
      shotEls.forEach(function (f) { f.classList.remove("is-active"); });
      done = false;
    }

    function play() {
      if (playing) return;
      reset();
      playing = true;
      if (badge) { badge.textContent = "booting/"; badge.classList.add("is-busy"); }
      if (playBtn) playBtn.textContent = "\u2026";
      steps.forEach(function (s, i) {
        timers.push(setTimeout(function () {
          renderStep(i);
          if (i === steps.length - 1) timers.push(setTimeout(finish, 500));
        }, reduceMotion ? 0 : 620 * i));
      });
      if (reduceMotion) { clearTimers(); steps.forEach(function (s, i) { renderStep(i); }); finish(); }
    }

    if (playBtn) playBtn.addEventListener("click", play);
    if (reduceMotion) {
      // static final state, no animation
      reset();
      steps.forEach(function (s, i) { renderStep(i); });
      finish();
    } else {
      // autoplay once the wordmark has finished typing
      setTimeout(function () { if (!playing && !done) play(); }, 1500);
    }
  }

  /* ---------------------------------------------------------------------
     Tabs (get the iso)
     --------------------------------------------------------------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
    });
  });

  /* ---------------------------------------------------------------------
     Receipts carousel
     --------------------------------------------------------------------- */
  var receiptsHost = document.querySelector("[data-receipts]");
  if (receiptsHost) {
    var receipts = Array.prototype.slice.call(receiptsHost.querySelectorAll(".receipt"));
    var countEl = document.querySelector("[data-receipt-count]");
    var idx = 0;
    function showReceipt(n) {
      idx = (n + receipts.length) % receipts.length;
      receipts.forEach(function (r, i) { r.classList.toggle("is-active", i === idx); });
      if (countEl) countEl.textContent = (idx + 1) + " / " + receipts.length;
    }
    var prevBtn = document.querySelector("[data-receipt-prev]");
    var nextBtn = document.querySelector("[data-receipt-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { showReceipt(idx - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showReceipt(idx + 1); });
    document.addEventListener("keydown", function (e) {
      var rect = receiptsHost.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
        if (e.key === "ArrowLeft") showReceipt(idx - 1);
        if (e.key === "ArrowRight") showReceipt(idx + 1);
      }
    });
  }

  /* ---------------------------------------------------------------------
     Proof: real screenshot detection + playlist switching
     --------------------------------------------------------------------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  shots.forEach(function (shot) {
    var img = shot.querySelector(".shot__img");
    var fallback = shot.querySelector(".shot__fallback");
    if (!img) return;
    function hideImg() {
      img.remove();
      if (fallback) fallback.style.display = "";
      var item = document.querySelector('[data-playlist="' + shot.getAttribute("data-shot-name") + '"] [data-playlist-meta]');
      if (item) item.textContent = item.textContent.replace("captured", "pending capture");
    }
    if (img.complete) {
      if (img.naturalWidth === 0) hideImg();
    } else {
      img.addEventListener("error", hideImg);
    }
    if (fallback) fallback.style.display = "none";
  });

  var playlistBtns = Array.prototype.slice.call(document.querySelectorAll("[data-playlist]"));
  playlistBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-playlist");
      playlistBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      shots.forEach(function (s) {
        s.classList.toggle("is-active", s.getAttribute("data-shot-name") === name);
      });
    });
  });

  /* ---------------------------------------------------------------------
     Component detail dialogs (tile grid)
     --------------------------------------------------------------------- */
  var compDialog = document.querySelector("[data-comp-dialog]");
  if (compDialog) {
    var COMP_DATA = {
      "echo-boot": {
        title: "echo-boot/",
        status: "in preview",
        desc: "The first signal. Everything that happens before the kernel is owned here.",
        facts: [
          "BIOS Syslinux and UEFI systemd-boot live boot paths",
          "Live and accessibility boot entries",
          "Initramfs and loader assets owned as one component"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV/tree/main/components/echo-boot"
      },
      "echo-core": {
        title: "echo-core/",
        status: "in preview",
        desc: "The body of the system \u2014 and the future home of the Aira layer.",
        facts: [
          "Arch Linux base and the XFCE live session with LightDM",
          "Live/target boundary and package configuration",
          "KDE Plasma is the planned desktop \u2014 not in the box today"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV/tree/main/components/echo-core"
      },
      "echo-install": {
        title: "echo-install/",
        status: "in preview",
        desc: "The handoff from live USB to installed system \u2014 entirely offline.",
        facts: [
          "Calamares 3.4.2 full-disk install",
          "Offline squashfs copy \u2014 no mirrors, no network calls",
          "GRUB target bootloader; stock Calamares branding today"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV/tree/main/components/echo-install"
      },
      "aira": {
        title: "aira/",
        status: "planned \u2014 not shipped",
        desc: "The AI-on-OS layer: intelligence as a first-class system service, not a chat app bolted onto a desktop.",
        facts: [
          "Local-first: prefer on-device context",
          "Consent by default: clear boundaries and an obvious off switch",
          "Inspectable: every action visible, attributable, reversible",
          "Nothing in the current ISO \u2014 it ships when it can be inspected"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV"
      },
      "profile": {
        title: "profile/",
        status: "in preview",
        desc: "The active ArchISO profile the ISO is assembled from.",
        facts: [
          "archiso 91 build profile",
          "Package list and live-session configuration",
          "Assembled by the build component into the published ISO"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV/tree/main/profile"
      },
      "build": {
        title: "build/",
        status: "in preview",
        desc: "Assembly and validation scripts that turn the profile and components into an ISO.",
        facts: [
          "./build.sh assembles and validates the image",
          "Requires an Arch host with archiso, base-devel, squashfs-tools",
          "Build notes live alongside the scripts"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV/tree/main/build"
      },
      "docs": {
        title: "docs/",
        status: "public",
        desc: "Every decision is written down, including the unfinished parts.",
        facts: [
          "Phase-1 architecture report",
          "Component maps and parity checks",
          "Build and validation notes"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV/tree/main/docs"
      },
      "you": {
        title: "you/",
        status: "open",
        desc: "The eighth component is whoever shows up.",
        facts: [
          "Bugs, broken claims, rough edges \u2014 all welcome in the tracker",
          "No contribution agreement; the license is still being decided",
          "Read the docs first, then open an issue"
        ],
        link: "https://github.com/HomieTal/EchoOS-DEV/issues"
      }
    };

    var dialogTitle = compDialog.querySelector(".comp-dialog__title");
    var dialogStatus = compDialog.querySelector(".comp-dialog__status");
    var dialogDesc = compDialog.querySelector(".comp-dialog__desc");
    var dialogFacts = compDialog.querySelector(".comp-dialog__facts");
    var dialogLink = compDialog.querySelector(".comp-dialog__link");

    document.querySelectorAll("[data-comp]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var data = COMP_DATA[btn.getAttribute("data-comp")];
        if (!data) return;
        dialogTitle.textContent = data.title;
        dialogStatus.textContent = data.status;
        dialogDesc.textContent = data.desc;
        dialogFacts.innerHTML = "";
        data.facts.forEach(function (fact) {
          var li = document.createElement("li");
          li.textContent = fact;
          dialogFacts.appendChild(li);
        });
        dialogLink.href = data.link;
        compDialog.showModal();
      });
    });

    compDialog.querySelector("[data-comp-close]").addEventListener("click", function () {
      compDialog.close();
    });
    compDialog.addEventListener("click", function (e) {
      if (e.target === compDialog) compDialog.close();
    });
  }

  /* ---------------------------------------------------------------------
     Category filters (get-started page)
     --------------------------------------------------------------------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  if (filterBtns.length) {
    var entries = Array.prototype.slice.call(document.querySelectorAll("[data-cat]"));
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        filterBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        entries.forEach(function (en) {
          en.classList.toggle("is-hidden", f !== "all" && en.getAttribute("data-cat") !== f);
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Copy buttons
     --------------------------------------------------------------------- */
  Array.prototype.slice.call(document.querySelectorAll("[data-copy-target]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-copy-target"));
      if (!el) return;
      var text = el.textContent.trim();
      function flash() {
        showToast("Copied to clipboard");
        btn.classList.add("is-copied");
        setTimeout(function () { btn.classList.remove("is-copied"); }, 1200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(flash, function () { fallbackCopy(text, flash); });
      } else {
        fallbackCopy(text, flash);
      }
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { showToast("Copy failed \u2014 select the text manually"); }
    document.body.removeChild(ta);
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".rv"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();

/* ---------------------------------------------------------------------
   Release sync: refresh version data from downloads/latest-release.json.
   The JSON is regenerated by .github/workflows/sync-release.yml whenever a
   new EchoOS-DEV release is published (checked daily). The markup stays as
   the static fallback, so the page remains correct with JS off.
   --------------------------------------------------------------------- */
(function () {
  var wired = document.querySelector("[data-release-link],[data-release-tag],[data-release-sha]");
  if (!wired || !window.fetch) return;
  fetch("downloads/latest-release.json", { cache: "no-store" })
    .then(function (r) { return r && r.ok ? r.json() : null; })
    .then(function (rel) {
      if (!rel || !rel.tag) return;
      var iso = rel.iso || {};
      var sizeText = iso.size || "";
      if (iso.parts && iso.parts > 1) sizeText += " in " + iso.parts + " parts";
      if (rel.downloadUrl) {
        Array.prototype.forEach.call(document.querySelectorAll("a[data-release-link]"), function (a) {
          a.href = rel.downloadUrl;
        });
      }
      setText("[data-release-tag]", rel.tag);
      setText("[data-release-date]", rel.published);
      setText("[data-release-iso]", iso.file);
      setText("[data-release-iso-date]", iso.date);
      setText("[data-release-size]", sizeText);
      setText("[data-release-sha]", iso.checksum);
      setText("[data-release-verify]", "sha256sum -c " + (iso.checksumFile || "SHA256SUMS"));
      if (iso.file && iso.parts > 1) {
        setText("[data-release-join-cmd]", "cat " + iso.file + ".part-* > " + iso.file);
      }
    })
    .catch(function () { /* static fallback stays */ });

  function setText(sel, val) {
    if (!val) return;
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (node) {
      node.textContent = val;
    });
  }
})();
