/* INTALENT Mobile — core runtime (router, API client, UI helpers).
   Shared by the web mobile version (/m/) and the Android APK (WebView shell). */
(function () {
  const TOKEN_KEY = "intalent_m_token";
  const M = (window.M = {
    state: { user: null, boot: null, favorites: [], unreadNotifs: 0, unreadMsgs: 0 },
    screens: {},
    isApp: /IntalentAndroid/i.test(navigator.userAgent)
  });

  /* ---------------- helpers ---------------- */
  M.esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  M.dzd = (n) => Number(n || 0).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ") + " DZD";
  M.icon = (name, cls = "", fill = false) => `<span class="material-symbols-outlined ${fill ? "ms-fill" : ""} ${cls}">${name}</span>`;
  M.initials = (name) => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  M.avatar = (url, name, size = "w-11 h-11") =>
    url
      ? `<img src="${M.esc(url)}" alt="${M.esc(name)}" class="${size} rounded-full object-cover border-2 border-white shadow-sm bg-slate-200" loading="lazy" onerror="this.onerror=null;this.src='/assets/logos/logo-white-purple.png'"/>`
      : `<div class="${size} rounded-full bg-brand-purple text-brand-neon flex items-center justify-center font-bold text-xs">${M.esc(M.initials(name))}</div>`;
  M.date = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d) ? String(iso).slice(0, 10) : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };
  M.ago = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
    if (s < 60) return "à l'instant";
    if (s < 3600) return Math.floor(s / 60) + " min";
    if (s < 86400) return Math.floor(s / 3600) + " h";
    return Math.floor(s / 86400) + " j";
  };
  M.parseList = (v) => {
    if (Array.isArray(v)) return v;
    if (!v) return [];
    try { const x = JSON.parse(v); return Array.isArray(x) ? x : []; } catch (e) { return String(v).split(",").map((s) => s.trim()).filter(Boolean); }
  };
  M.role = () => (M.state.user ? M.state.user.active_role || M.state.user.role : null);
  M.statusBadge = (status) => {
    const map = {
      in_progress: ["En cours", "bg-blue-50 text-blue-700"], delivered: ["Livré", "bg-amber-50 text-amber-700"],
      revision_requested: ["Révision", "bg-orange-50 text-orange-700"], completed: ["Terminé", "bg-emerald-50 text-emerald-700"],
      cancelled: ["Annulé", "bg-rose-50 text-rose-700"], pending_payment: ["Paiement en attente", "bg-slate-100 text-slate-600"],
      open: ["Ouvert", "bg-emerald-50 text-emerald-700"], awarded: ["Attribué", "bg-violet-50 text-violet-700"],
      pending: ["En attente", "bg-amber-50 text-amber-700"], accepted: ["Acceptée", "bg-emerald-50 text-emerald-700"],
      rejected: ["Refusée", "bg-rose-50 text-rose-700"], processed: ["Traité", "bg-emerald-50 text-emerald-700"],
      approved: ["Approuvé", "bg-emerald-50 text-emerald-700"], active: ["Actif", "bg-emerald-50 text-emerald-700"],
      suspended: ["Suspendu", "bg-rose-50 text-rose-700"], pending_review: ["En revue", "bg-amber-50 text-amber-700"]
    };
    const [label, cls] = map[status] || [status || "—", "bg-slate-100 text-slate-600"];
    return `<span class="m-badge ${cls}">${M.esc(label)}</span>`;
  };

  /* ---------------- API ---------------- */
  M.token = () => localStorage.getItem(TOKEN_KEY) || "";
  M.setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
  M.api = async (path, opts = {}) => {
    const headers = { Accept: "application/json" };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    const tok = M.token();
    if (tok) headers.Authorization = "Bearer " + tok;
    let res;
    try {
      res = await fetch(path, { method: opts.method || (opts.body !== undefined ? "POST" : "GET"), headers, credentials: "same-origin", body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined });
    } catch (e) {
      throw new Error("Connexion au serveur impossible. Vérifiez votre réseau.");
    }
    let data = {};
    try { data = await res.json(); } catch (e) { data = {}; }
    if (res.status === 401 && !opts.allow401) {
      M.setToken("");
      M.state.user = null;
      if (!opts.silent) M.go("login");
      throw new Error(data.error || "Veuillez vous connecter.");
    }
    if (!res.ok) throw new Error(data.error || `Erreur serveur (${res.status})`);
    return data;
  };
  M.refresh = async () => {
    const b = await M.api("/api/bootstrap", { allow401: true });
    M.state.boot = b;
    M.state.user = b.user || null;
    M.state.favorites = b.favorites || [];
    M.state.unreadNotifs = b.unread_notifications || 0;
    M.state.unreadMsgs = b.unread_messages || 0;
    return b;
  };
  M.isFav = (type, id) => (M.state.favorites || []).some((f) => f.target_type === type && Number(f.target_id) === Number(id));
  M.toggleFav = async (type, id, btn) => {
    if (!M.state.user) return M.go("login");
    try {
      const r = await M.api("/api/favorites/toggle", { body: { target_type: type, target_id: Number(id) } });
      M.state.favorites = r.favorites || [];
      if (btn) btn.innerHTML = M.icon("favorite", r.saved ? "text-rose-500" : "text-slate-500", r.saved);
      M.toast(r.saved ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch (e) { M.toast(e.message, true); }
  };

  /* ---------------- UI primitives ---------------- */
  M.toast = (msg, isError = false) => {
    const el = document.getElementById("m-toast");
    el.innerHTML = `<div class="m-toast ${isError ? "bg-rose-600 text-white" : "bg-brand-dark text-brand-neon"}">${M.esc(msg)}</div>`;
    el.classList.remove("hidden");
    clearTimeout(M._tt);
    M._tt = setTimeout(() => el.classList.add("hidden"), 3200);
  };
  M.sheet = (html) => {
    const s = document.getElementById("m-sheet");
    const b = document.getElementById("m-sheet-backdrop");
    s.innerHTML = `<div class="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>` + html;
    s.classList.remove("hidden");
    b.classList.remove("hidden");
    b.onclick = M.closeSheet;
    return s;
  };
  M.closeSheet = () => {
    document.getElementById("m-sheet").classList.add("hidden");
    document.getElementById("m-sheet-backdrop").classList.add("hidden");
  };
  M.formData = (form) => {
    const o = {};
    new FormData(form).forEach((v, k) => (o[k] = typeof v === "string" ? v.trim() : v));
    return o;
  };
  M.busy = async (btn, fn) => {
    if (!btn) return fn();
    const old = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span>`;
    try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = old; }
  };
  M.topbar = (title, opts = {}) => `
    <header class="flex items-center justify-between mb-4 pt-1">
      <button class="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center" onclick="M.back()" aria-label="Retour">${M.icon("arrow_back")}</button>
      <div class="text-center flex-1 px-2"><h1 class="text-sm font-extrabold text-slate-900 truncate">${M.esc(title)}</h1>${opts.sub ? `<p class="text-[11px] text-slate-500 truncate">${M.esc(opts.sub)}</p>` : ""}</div>
      ${opts.right || `<div class="w-10 h-10"></div>`}
    </header>`;
  M.section = (title, actionLabel, actionRoute) => `
    <div class="flex items-center justify-between mb-3 mt-6 px-1">
      <h2 class="text-sm font-bold text-slate-900 tracking-tight">${M.esc(title)}</h2>
      ${actionLabel ? `<button class="text-xs font-semibold text-brand-purple flex items-center gap-0.5" onclick="M.go('${actionRoute}')">${M.esc(actionLabel)} ${M.icon("chevron_right", "!text-[16px]")}</button>` : ""}
    </div>`;
  M.empty = (icon, text, ctaLabel, ctaRoute) => `
    <div class="m-card p-6 text-center">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">${M.icon(icon)}</div>
      <p class="text-xs text-slate-500">${M.esc(text)}</p>
      ${ctaLabel ? `<button class="m-btn-neon mt-4" onclick="M.go('${ctaRoute}')">${M.esc(ctaLabel)}</button>` : ""}
    </div>`;
  M.skeleton = (n = 3) => Array.from({ length: n }, () => `<div class="m-skel h-24 mb-3"></div>`).join("");
  M.sandboxNote = (text) => `<div class="flex gap-2 items-start bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-3 text-[11px] leading-relaxed">${M.icon("science", "!text-[18px]")}<span>${M.esc(text)}</span></div>`;

  M.serviceCard = (s) => `
    <button class="m-card overflow-hidden text-left w-full active:scale-[.99] transition" onclick="M.go('service/${s.id}')">
      <div class="relative h-32 bg-slate-200">
        ${s.cover_image ? `<img src="${M.esc(s.cover_image)}" class="w-full h-full object-cover" loading="lazy" alt=""/>` : ""}
        ${s.is_pro_listing || s.freelancer_is_pro ? `<span class="absolute top-2 left-2 m-badge bg-brand-dark text-brand-neon">PRO</span>` : ""}
      </div>
      <div class="p-3">
        <div class="flex items-center gap-2 mb-1.5">${M.avatar(s.freelancer_avatar, s.freelancer_name, "w-6 h-6")}<span class="text-[11px] font-semibold text-slate-600 truncate">${M.esc(s.freelancer_name || "")}</span></div>
        <p class="text-xs font-bold text-slate-900 line-clamp-2 min-h-[32px]">${M.esc(s.title)}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">${M.icon("star", "!text-[14px]", true)} ${Number(s.rating_avg || 5).toFixed(1)} <span class="text-slate-400 font-medium">(${s.review_count || 0})</span></span>
          <span class="text-[11px] font-extrabold text-brand-purple">dès ${M.dzd(s.starting_price_dzd)}</span>
        </div>
      </div>
    </button>`;
  M.freelancerRow = (f) => `
    <button class="m-card p-3.5 flex items-center gap-3 w-full text-left active:scale-[.99] transition" onclick="M.go('freelancer/${f.id}')">
      ${M.avatar(f.avatar_url, f.full_name, "w-12 h-12")}
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1"><p class="text-sm font-bold text-slate-900 truncate">${M.esc(f.full_name)}</p>${f.is_verified ? M.icon("verified", "!text-[16px] text-brand-accent", true) : ""}</div>
        <p class="text-[11px] text-slate-500 truncate">${M.esc(f.headline || "Freelance")}</p>
        <p class="text-[10px] text-slate-400 mt-0.5">${M.icon("location_on", "!text-[12px]")} ${M.esc(f.wilaya || "Algérie")} · ${M.icon("star", "!text-[12px] text-amber-500", true)} ${Number(f.rating_avg || 5).toFixed(1)}</p>
      </div>
      <div class="text-right"><p class="text-xs font-extrabold text-brand-purple">${M.dzd(f.hourly_rate_dzd)}</p><p class="text-[10px] text-slate-400">/ heure</p>${f.is_pro ? `<span class="m-badge bg-brand-neon text-brand-dark mt-1">PRO</span>` : ""}</div>
    </button>`;

  /* ---------------- navigation ---------------- */
  const PUBLIC = new Set(["login", "register", "home", "explore", "service", "freelancer", "portfolio", "missions", "server"]);
  M.go = (route) => { const h = "#/" + String(route).replace(/^#?\/?/, ""); if (location.hash === h) M.render(); else location.hash = h; };
  M.back = () => { if (history.length > 1) history.back(); else M.go("home"); };
  M.current = () => {
    const raw = (location.hash || "#/home").replace(/^#\/?/, "");
    const [path, query] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    return { name: parts[0] || "home", arg: parts[1] ? decodeURIComponent(parts[1]) : null, query: new URLSearchParams(query || "") };
  };

  const NAV = [
    { key: "home", icon: "home", label: "Accueil" },
    { key: "missions", icon: "work", label: "Missions" },
    { key: "favorites", icon: "bookmark", label: "Favoris" },
    { key: "wallet", icon: "account_balance_wallet", label: "Wallet" },
    { key: "account", icon: "person", label: "Compte" }
  ];
  M.renderNav = (active) => {
    const nav = document.getElementById("m-nav");
    if (["login", "register", "server", "chat"].includes(active)) { nav.className = "hidden"; return; }
    nav.className = "fixed bottom-0 inset-x-0 mx-auto max-w-[440px] bg-white/95 backdrop-blur border-t border-slate-100 shadow-nav z-50 px-3 pt-2";
    nav.innerHTML = `<div class="flex items-end justify-between">${NAV.map((n) => {
      const on = n.key === active;
      return `<button class="flex-1 flex flex-col items-center gap-0.5 py-1" onclick="M.go('${n.key}')" aria-label="${n.label}">
        <span class="w-11 h-8 rounded-2xl flex items-center justify-center ${on ? "bg-brand-neon text-brand-dark" : "text-slate-400"}">${M.icon(n.icon, "", on)}</span>
        <span class="text-[10px] font-${on ? "extrabold text-brand-dark" : "semibold text-slate-400"}">${n.label}</span></button>`;
    }).join("")}</div>`;
  };

  M.render = async () => {
    const r = M.current();
    const view = document.getElementById("m-view");
    const screen = M.screens[r.name] || M.screens.home;
    if (!PUBLIC.has(r.name) && !M.state.user) { M.go("login"); return; }
    M.closeSheet();
    M.renderNav(r.name);
    view.innerHTML = M.skeleton(4);
    window.scrollTo(0, 0);
    try {
      await screen(view, r);
    } catch (e) {
      view.innerHTML = `${M.topbar("Erreur")}<div class="m-card p-5 text-center"><p class="text-sm font-bold text-rose-600 mb-1">Impossible de charger cet écran</p><p class="text-xs text-slate-500">${M.esc(e.message)}</p><button class="m-btn-neon mt-4" onclick="M.render()">Réessayer</button></div>`;
    }
  };

  window.addEventListener("hashchange", M.render);
  window.addEventListener("DOMContentLoaded", async () => {
    try { await M.refresh(); } catch (e) { /* offline: screens show their own errors */ }
    if (!location.hash) location.hash = M.state.user ? "#/home" : "#/login";
    else M.render();
  });
})();
