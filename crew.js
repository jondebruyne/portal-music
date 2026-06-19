/* PORTAL — perfiles de Portal Crew en pestaña nueva
   Sin dependencias. Lee los datos que ya existen en index.html.
   - Modo lista (sin ?member): agrega un botón "Ver perfil" a cada miembro.
   - Modo perfil (?member=slug): arma una página limpia con foto, bio, links, sets y videos.
*/
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function norm(s) {
    return (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function slugOf(card) {
    var h = card.querySelector("h4");
    var name = h ? h.textContent : "";
    return norm(name).split(/\s+/)[0] || norm(name).replace(/\s+/g, "-");
  }

  function injectStyles() {
    if (document.getElementById("crew-profile-styles")) return;
    var css = [
      ".crew-profile-link{display:block;margin-top:14px;padding:10px 14px;text-align:center;",
      "border:1px solid var(--accent,#7C3AED);border-radius:10px;color:var(--accent2,#a78bfa);",
      "font-weight:700;font-size:.82rem;letter-spacing:.02em;text-decoration:none;",
      "transition:background .15s ease,color .15s ease}",
      ".crew-profile-link:hover{background:var(--accent,#7C3AED);color:#fff}",

      "#crew-profile-view{max-width:860px;margin:0 auto;padding:28px 18px 90px;color:var(--txt,#fff)}",
      ".crew-back{display:inline-block;margin-bottom:26px;color:var(--accent2,#a78bfa);",
      "text-decoration:none;font-weight:600;font-size:.9rem}",
      ".crew-back:hover{text-decoration:underline}",
      ".crew-prof-head{display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin-bottom:8px}",
      ".crew-prof-head img.crew-photo{width:160px;height:160px;border-radius:18px;object-fit:cover;",
      "border:1px solid var(--line,#232328);flex:0 0 auto;margin:0}",
      ".crew-prof-meta{flex:1 1 240px;min-width:240px}",
      ".crew-prof-meta h1{font-size:1.8rem;line-height:1.15;margin:0 0 6px}",
      ".crew-prof-meta .role{color:var(--accent2,#a78bfa);font-weight:600;font-size:.95rem;margin:0 0 12px}",
      ".crew-prof-bio{color:var(--muted,#9b9ba3);font-size:.95rem;line-height:1.6;margin:14px 0 18px}",
      ".crew-prof-links{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px}",
      ".crew-prof-links a{padding:8px 14px;border:1px solid var(--line,#232328);border-radius:999px;",
      "color:var(--txt,#fff);text-decoration:none;font-size:.82rem;font-weight:600}",
      ".crew-prof-links a:hover{border-color:var(--accent,#7C3AED);color:var(--accent2,#a78bfa)}",
      ".crew-prof-section{margin-top:38px}",
      ".crew-prof-section h2{font-size:1.15rem;margin:0 0 16px;padding-bottom:8px;",
      "border-bottom:1px solid var(--line,#232328)}",
      ".crew-prof-video{margin-bottom:26px}",
      ".crew-prof-video .vid{position:relative;width:100%;padding-bottom:56.25%;height:0;",
      "border-radius:12px;overflow:hidden;background:#000;border:1px solid var(--line,#232328)}",
      ".crew-prof-video .vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}",
      ".crew-prof-video .cap{color:var(--muted,#9b9ba3);font-size:.85rem;margin:8px 2px 0}",
      ".crew-prof-sets iframe{width:100%;border:0;border-radius:12px}",
      "@media(max-width:560px){.crew-prof-head{justify-content:center;text-align:center}",
      ".crew-prof-meta{text-align:center}.crew-prof-links{justify-content:center}}",

      /* === Arreglos UX móvil para el sitio === */
      /* nav: que las 6 pestañas no desborden la pantalla, scroll horizontal */
      "@media(max-width:640px){",
      ".nav-inner{min-width:0}",
      ".tabs{min-width:0;max-width:100%;overflow-x:auto;flex-wrap:nowrap;",
      "-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}",
      ".tabs::-webkit-scrollbar{display:none}",
      ".tab-btn{flex:0 0 auto;white-space:nowrap}",
      "}",
      /* fallback de video para navegadores sin aspect-ratio (iOS Safari < 15) */
      "@supports not (aspect-ratio: 16 / 9){",
      ".video-wrap{position:relative;height:0;padding-bottom:56.25%}",
      ".video-wrap>iframe{position:absolute;top:0;left:0;width:100%;height:100%}",
      "}"
    ].join("");
    var st = document.createElement("style");
    st.id = "crew-profile-styles";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function getCards() {
    return [].slice.call(document.querySelectorAll("#panel-crew .card"));
  }

  function listMode(cards) {
    cards.forEach(function (card) {
      if (card.querySelector(".crew-profile-link")) return;
      var slug = slugOf(card);
      if (!slug) return;
      var body = card.querySelector(".body") || card;
      var a = document.createElement("a");
      a.className = "crew-profile-link";
      a.href = "?member=" + encodeURIComponent(slug);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Ver perfil completo →";
      body.appendChild(a);
    });
  }

  function buildProfile(card) {
    var name = (card.querySelector("h4") || {}).textContent || "PORTAL";
    name = name.trim();
    var ps = card.querySelectorAll(".body > p.muted");
    var role = ps[0] ? ps[0].innerHTML : "";
    var bio = ps[1] ? ps[1].innerHTML : "";

    var view = document.createElement("div");
    view.id = "crew-profile-view";

    var back = document.createElement("a");
    back.className = "crew-back";
    back.href = (location.pathname || "./") + "#crew";
    back.textContent = "← Volver a Portal Crew";
    view.appendChild(back);

    // Cabecera: foto + nombre + rol
    var head = document.createElement("div");
    head.className = "crew-prof-head";
    var photo = card.querySelector("img.crew-photo");
    if (photo) head.appendChild(photo.cloneNode(true));
    var meta = document.createElement("div");
    meta.className = "crew-prof-meta";
    meta.innerHTML =
      "<h1>" + name + "</h1>" + (role ? '<p class="role">' + role + "</p>" : "");
    head.appendChild(meta);
    view.appendChild(head);

    if (bio) {
      var bioEl = document.createElement("p");
      bioEl.className = "crew-prof-bio";
      bioEl.innerHTML = bio;
      view.appendChild(bioEl);
    }

    // Links sociales
    var links = card.querySelectorAll(".mini-row a.mini-btn");
    if (links.length) {
      var lwrap = document.createElement("div");
      lwrap.className = "crew-prof-links";
      [].slice.call(links).forEach(function (l) {
        var a = l.cloneNode(true);
        a.className = "";
        a.target = "_blank";
        a.rel = "noopener";
        lwrap.appendChild(a);
      });
      view.appendChild(lwrap);
    }

    // Sets (SoundCloud)
    var setsPanel = card.querySelector('[id$="-sets"].crew-expand');
    if (setsPanel) {
      var setIframes = setsPanel.querySelectorAll("iframe");
      if (setIframes.length) {
        var sSec = document.createElement("div");
        sSec.className = "crew-prof-section crew-prof-sets";
        sSec.innerHTML = "<h2>Sets</h2>";
        [].slice.call(setIframes).forEach(function (f) {
          var nf = f.cloneNode(true);
          var src = nf.getAttribute("src") || nf.getAttribute("data-src");
          if (src) nf.setAttribute("src", src);
          nf.removeAttribute("data-src");
          if (!nf.getAttribute("height")) nf.setAttribute("height", "320");
          sSec.appendChild(nf);
        });
        view.appendChild(sSec);
      }
    }

    // Videos (YouTube)
    var vidPanel = card.querySelector('[id$="-videos"].crew-expand');
    if (vidPanel) {
      var wraps = vidPanel.querySelectorAll(".video-wrap");
      if (wraps.length) {
        var vSec = document.createElement("div");
        vSec.className = "crew-prof-section";
        vSec.innerHTML = "<h2>Videos</h2>";
        [].slice.call(wraps).forEach(function (w) {
          var iframe = w.querySelector("iframe");
          if (!iframe) return;
          // caption: el <p class="muted"> que sigue al wrap
          var cap = "";
          var sib = w.nextElementSibling;
          if (sib && sib.tagName === "P") cap = sib.textContent.trim();
          if (!cap) cap = iframe.getAttribute("title") || "";

          var item = document.createElement("div");
          item.className = "crew-prof-video";
          var vid = document.createElement("div");
          vid.className = "vid";
          var nf = iframe.cloneNode(true);
          var src = nf.getAttribute("src") || nf.getAttribute("data-src");
          if (src) nf.setAttribute("src", src);
          nf.removeAttribute("data-src");
          nf.setAttribute("allowfullscreen", "");
          vid.appendChild(nf);
          item.appendChild(vid);
          if (cap) {
            var c = document.createElement("p");
            c.className = "cap";
            c.textContent = cap;
            item.appendChild(c);
          }
          vSec.appendChild(item);
        });
        view.appendChild(vSec);
      }
    }

    return { view: view, name: name };
  }

  function profileMode(cards, member) {
    var target = null;
    var want = norm(member);
    for (var i = 0; i < cards.length; i++) {
      if (slugOf(cards[i]) === want) {
        target = cards[i];
        break;
      }
    }
    if (!target) {
      // miembro no encontrado: dejar la página normal
      return false;
    }
    var built = buildProfile(target);
    // ocultar el contenido normal
    [].slice.call(document.body.children).forEach(function (ch) {
      ch.style.display = "none";
    });
    document.body.appendChild(built.view);
    document.body.style.background = "var(--bg,#000)";
    if (built.name) document.title = "PORTAL · " + built.name;
    window.scrollTo(0, 0);
    return true;
  }

  function openCrewTab() {
    var nav = document.querySelector('a[href="#crew"]');
    if (nav) {
      try {
        nav.click();
      } catch (e) {}
    }
    var panel = document.getElementById("panel-crew");
    if (panel) {
      setTimeout(function () {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }

  ready(function () {
    if (!document.getElementById("panel-crew")) return;
    injectStyles();
    var cards = getCards();
    if (!cards.length) return;
    var member = new URLSearchParams(location.search).get("member");
    if (member) {
      profileMode(cards, member);
    } else {
      listMode(cards);
      if (location.hash === "#crew") {
        setTimeout(openCrewTab, 60);
      }
    }
  });
})();
