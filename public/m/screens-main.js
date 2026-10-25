/* INTALENT Mobile — public & marketplace screens
   Stitch refs: Connexion & Authentification, Page d'accueil, Discovery & Explore,
   Freelancer Profile, Portfolio Freelance, Mode de Paiement & Ajout Carte CIB. */
(function () {
  const S = M.screens;
  const esc = M.esc;

  /* ---------- LOGIN ---------- */
  S.login = async (view) => {
    if (M.state.user) return M.go("home");
    const oauth = (M.state.boot && M.state.boot.oauth_status) || {};
    view.innerHTML = `
      <div class="pt-4">
        <div class="flex items-center justify-between mb-6">
          <div class="w-11 h-11 rounded-2xl bg-brand-neon flex items-center justify-center">${M.icon("auto_awesome", "text-brand-dark", true)}</div>
          <span class="m-badge bg-white border border-slate-200 text-slate-600"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> FREELANCE DZ</span>
        </div>
        <img src="/assets/logos/logo-dark.png" alt="Intalent" class="h-7 mb-4" onerror="this.remove()"/>
        <h1 class="text-[26px] leading-tight font-extrabold text-brand-dark tracking-tight">Bon retour sur Intalent !</h1>
        <p class="text-xs text-slate-500 mt-2 mb-6">Connectez-vous pour accéder à vos missions et opportunités freelance en Algérie.</p>
        <form id="f-login" class="space-y-4">
          <div><label class="m-label">Adresse Email</label>
            <div class="relative"><span class="absolute left-3.5 top-3 text-slate-400">${M.icon("mail", "!text-[20px]")}</span>
            <input name="email" type="email" required autocomplete="email" class="m-input !pl-11" placeholder="vous@exemple.dz"/></div></div>
          <div><div class="flex justify-between"><label class="m-label">Mot de passe</label><button type="button" id="b-forgot" class="text-[11px] font-bold text-brand-purple mb-1.5">Mot de passe oublié ?</button></div>
            <div class="relative"><span class="absolute left-3.5 top-3 text-slate-400">${M.icon("lock", "!text-[20px]")}</span>
            <input name="password" id="i-pass" type="password" required autocomplete="current-password" class="m-input !pl-11 !pr-11" placeholder="••••••••"/>
            <button type="button" id="b-eye" class="absolute right-3 top-2.5 text-slate-400" aria-label="Afficher">${M.icon("visibility")}</button></div></div>
          <button class="m-btn-neon w-full !py-4 !text-sm" type="submit">Se connecter ${M.icon("arrow_forward", "!text-[18px]")}</button>
        </form>
        <div class="flex items-center gap-3 my-6"><div class="h-px bg-slate-200 flex-1"></div><span class="text-[10px] font-bold text-slate-400 tracking-wider">OU CONTINUER AVEC</span><div class="h-px bg-slate-200 flex-1"></div></div>
        <div class="space-y-2.5">
          ${[["google", "Continuer avec Google", oauth.google_configured], ["credit_card", "Carte Edahabia • Compte CCP", false], ["phone_iphone", "Continuer avec Apple", false]].map(([ic, label, ok]) =>
            `<button type="button" class="m-btn-dark w-full !py-3.5 b-social" data-ok="${ok ? 1 : 0}">${M.icon(ic, "!text-[18px] text-brand-neon")} ${label}</button>`).join("")}
        </div>
        <p class="text-center text-xs text-slate-500 mt-7 mb-4">Pas encore de compte ? <button class="font-extrabold text-brand-purple underline" onclick="M.go('register')">Créer un compte</button></p>
      </div>`;
    view.querySelector("#b-eye").onclick = () => { const i = view.querySelector("#i-pass"); i.type = i.type === "password" ? "text" : "password"; };
    view.querySelectorAll(".b-social").forEach((b) => (b.onclick = () => M.toast(b.dataset.ok === "1" ? "Connexion sociale : utilisez la version web pour le moment." : "Cette méthode de connexion n'est pas encore activée sur Intalent.", b.dataset.ok !== "1")));
    view.querySelector("#b-forgot").onclick = async () => {
      const email = view.querySelector("[name=email]").value.trim();
      if (!email) return M.toast("Saisissez d'abord votre email.", true);
      try { const r = await M.api("/api/auth/forgot-password", { body: { email } }); M.toast(r.message || "Si ce compte existe, un email de réinitialisation a été préparé."); } catch (e) { M.toast(e.message, true); }
    };
    view.querySelector("#f-login").onsubmit = async (ev) => {
      ev.preventDefault();
      const btn = ev.target.querySelector("[type=submit]");
      await M.busy(btn, async () => {
        try {
          const r = await M.api("/api/auth/login", { body: M.formData(ev.target), allow401: true });
          M.setToken(r.token);
          await M.refresh();
          M.toast("Salam " + (M.state.user.full_name || "") + " 👋");
          M.go("home");
        } catch (e) { M.toast(e.message === "Invalid credentials" ? "Email ou mot de passe incorrect." : e.message, true); }
      });
    };
  };

  /* ---------- REGISTER ---------- */
  S.register = async (view) => {
    const wilayas = (M.state.boot && M.state.boot.wilayas) || ["16 - Alger"];
    view.innerHTML = `
      ${M.topbar("Créer un compte", { sub: "Rejoignez la communauté Intalent" })}
      <form id="f-reg" class="space-y-4">
        <div><label class="m-label">Je suis</label>
          <div class="grid grid-cols-3 gap-2" id="role-pick">
            ${[["client", "person_search", "Client"], ["freelancer", "laptop_mac", "Freelance"], ["business", "apartment", "Entreprise"]].map(([v, ic, l], i) =>
              `<label class="m-card p-3 text-center cursor-pointer ${i === 0 ? "ring-2 ring-brand-purple" : ""}"><input type="radio" name="role" value="${v}" class="hidden" ${i === 0 ? "checked" : ""}/>${M.icon(ic, "text-brand-purple")}<p class="text-[11px] font-bold mt-1">${l}</p></label>`).join("")}
          </div></div>
        <div><label class="m-label">Nom complet</label><input name="full_name" required class="m-input" placeholder="Karim Benali"/></div>
        <div><label class="m-label">Nom d'utilisateur</label><input name="username" required class="m-input" placeholder="karim_dz"/></div>
        <div><label class="m-label">Email</label><input name="email" type="email" required class="m-input" placeholder="vous@exemple.dz"/></div>
        <div><label class="m-label">Mot de passe (8 caractères min.)</label><input name="password" type="password" minlength="8" required class="m-input"/></div>
        <div><label class="m-label">Wilaya</label><select name="wilaya" class="m-input">${wilayas.map((w) => `<option ${w.startsWith("16") ? "selected" : ""}>${esc(w)}</option>`).join("")}</select></div>
        <div id="biz-field" class="hidden"><label class="m-label">Nom de l'entreprise</label><input name="company_name" class="m-input" placeholder="SARL Tech DZ"/></div>
        <button class="m-btn-neon w-full !py-4" type="submit">Créer mon compte ${M.icon("arrow_forward", "!text-[18px]")}</button>
        <p class="text-center text-xs text-slate-500">Déjà inscrit ? <button type="button" class="font-extrabold text-brand-purple underline" onclick="M.go('login')">Se connecter</button></p>
      </form>`;
    const pick = view.querySelector("#role-pick");
    pick.querySelectorAll("label").forEach((lab) => (lab.onclick = () => {
      pick.querySelectorAll("label").forEach((l) => l.classList.remove("ring-2", "ring-brand-purple"));
      lab.classList.add("ring-2", "ring-brand-purple");
      lab.querySelector("input").checked = true;
      view.querySelector("#biz-field").classList.toggle("hidden", lab.querySelector("input").value !== "business");
    }));
    view.querySelector("#f-reg").onsubmit = async (ev) => {
      ev.preventDefault();
      await M.busy(ev.target.querySelector("[type=submit]"), async () => {
        try {
          const r = await M.api("/api/auth/register", { body: M.formData(ev.target), allow401: true });
          M.setToken(r.token);
          await M.refresh();
          M.toast("Bienvenue sur Intalent !");
          M.go("home");
        } catch (e) { M.toast(e.message, true); }
      });
    };
  };

  /* ---------- HOME ---------- */
  const CAT_ICONS = ["code", "palette", "campaign", "shield", "translate", "edit_note", "movie", "query_stats", "school"];
  S.home = async (view) => {
    const u = M.state.user;
    const cats = (M.state.boot && M.state.boot.categories) || [];
    const [svc, proj] = await Promise.all([
      M.api("/api/services?per_page=6&sort=rating"),
      M.api("/api/projects").catch(() => ({ projects: [] }))
    ]);
    const open = (proj.projects || []).filter((p) => p.status === "open").slice(0, 6);
    view.innerHTML = `
      <section class="flex items-center justify-between pt-1">
        <div class="flex items-center gap-3">
          <div class="relative">${u ? M.avatar(u.avatar_url, u.full_name) : `<div class="w-11 h-11 rounded-full bg-brand-dark flex items-center justify-center">${M.icon("person", "text-brand-neon")}</div>`}<span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span></div>
          <div><h1 class="text-sm font-bold text-slate-900">Salam, ${esc(u ? u.full_name.split(" ")[0] : "invité")} 🇩🇿</h1>
          <p class="text-xs text-slate-500">${M.icon("location_on", "!text-[13px] text-emerald-600")} ${esc(u ? (u.wilaya || "Algérie").replace(/^\d+\s*-\s*/, "") : "Algérie")} · ${u ? "Disponible" : "Non connecté"}</p></div>
        </div>
        <div class="flex gap-2">
          <button class="relative w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-600" onclick="M.go('messages')" aria-label="Messages">${M.icon("chat")}${M.state.unreadMsgs ? `<span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>` : ""}</button>
          <button class="relative w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-600" onclick="M.go('notifications')" aria-label="Notifications">${M.icon("notifications")}${M.state.unreadNotifs ? `<span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>` : ""}</button>
        </div>
      </section>
      <form id="f-search" class="flex items-center gap-2 mt-5">
        <div class="relative flex-1"><span class="absolute left-3.5 top-3 text-slate-400">${M.icon("search", "!text-[20px]")}</span>
        <input name="q" class="m-input !pl-11 !py-3 !text-xs" placeholder="Rechercher un service, talent ou mission..."/></div>
        <button type="button" class="w-11 h-11 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-neon" onclick="M.go('explore?tab=services')" aria-label="Filtres">${M.icon("tune")}</button>
      </form>
      <section class="m-hero p-5 mt-5">
        <div class="relative z-10">
          <div class="flex items-center justify-between"><img src="/assets/logos/logo-transparent-white.png" class="h-6" alt="Intalent" onerror="this.remove()"/><span class="m-badge bg-white/10 text-brand-neon border border-white/10">⚡ BaridiMob & CIB (sandbox)</span></div>
          <h2 class="text-base font-extrabold mt-3">Trouvez un talent certifié en 24h</h2>
          <p class="text-xs text-slate-300 mt-1 max-w-[260px]">Paiement sous séquestre DZD jusqu'à validation de vos livrables.</p>
          <div class="mt-4 flex items-center justify-between">
            <button class="m-btn-neon !py-2 !px-4 !text-xs !rounded-xl" onclick="M.go('${u ? "post-job" : "login"}')">Publier une mission ${M.icon("arrow_forward", "!text-[16px]")}</button>
            <div class="flex gap-1.5"><span class="w-4 h-1.5 bg-brand-neon rounded-full"></span><span class="w-1.5 h-1.5 bg-white/40 rounded-full"></span><span class="w-1.5 h-1.5 bg-white/40 rounded-full"></span></div>
          </div>
        </div>
      </section>
      ${M.section("Services Populaires", "Voir tout", "explore?tab=services")}
      <div class="grid grid-cols-3 gap-2.5">
        ${cats.slice(0, 5).map((c, i) => `<button class="m-card p-3 flex flex-col items-center gap-2 text-center" onclick="M.go('explore?tab=services&category=${esc(c.slug)}')">
          <span class="w-10 h-10 rounded-2xl bg-violet-50 text-brand-purple flex items-center justify-center">${M.icon(CAT_ICONS[i % CAT_ICONS.length])}</span><span class="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2">${esc(c.name_fr || c.name)}</span></button>`).join("")}
        <button class="m-card p-3 flex flex-col items-center gap-2" onclick="M.go('explore?tab=services')"><span class="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">${M.icon("apps")}</span><span class="text-[11px] font-bold text-slate-700">Tous (${cats.length})</span></button>
      </div>
      ${M.section("Missions en Vedette", "Voir tout", "missions")}
      <p class="text-[11px] text-slate-500 -mt-2 mb-3 px-1">Projets publiés par des clients et entreprises</p>
      <div class="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        ${open.length ? open.map((p, i) => `<button class="shrink-0 w-64 text-left rounded-3xl p-4 ${i % 2 ? "bg-white border border-slate-200" : "bg-brand-dark text-white"}" onclick="M.go('mission/${p.id}')">
          <span class="m-badge ${i % 2 ? "bg-violet-50 text-brand-purple" : "bg-rose-500 text-white"}">${i % 2 ? "RECRUTEMENT" : "URGENT DZ"}</span>
          <p class="text-sm font-bold mt-3 line-clamp-2 min-h-[40px]">${esc(p.title)}</p>
          <p class="text-[11px] ${i % 2 ? "text-slate-500" : "text-slate-300"} mt-1">${esc(p.client_name)} · ${esc(p.category_name)}</p>
          <div class="flex justify-between items-center mt-3"><span class="text-xs font-extrabold ${i % 2 ? "text-brand-purple" : "text-brand-neon"}">${M.dzd(p.budget_min_dzd)} – ${M.dzd(p.budget_max_dzd)}</span><span class="text-[10px] ${i % 2 ? "text-slate-400" : "text-slate-300"}">${p.proposal_count} offres</span></div>
        </button>`).join("") : `<div class="w-full">${M.empty("work_off", "Aucune mission ouverte pour le moment.")}</div>`}
      </div>
      ${M.section("Services les mieux notés", "Explorer", "explore?tab=services")}
      <div class="grid grid-cols-2 gap-3">${(svc.services || []).map(M.serviceCard).join("")}</div>
      ${M.section("Talents recommandés", "Voir tout", "explore?tab=freelancers")}
      <div id="home-talents" class="space-y-2.5">${M.skeleton(2)}</div>`;
    view.querySelector("#f-search").onsubmit = (ev) => { ev.preventDefault(); M.go("explore?tab=services&q=" + encodeURIComponent(ev.target.q.value.trim())); };
    M.api("/api/freelancers?pro_only=true").then((r) => {
      const box = view.querySelector("#home-talents");
      if (box) box.innerHTML = (r.freelancers || []).slice(0, 4).map(M.freelancerRow).join("") || M.empty("group", "Aucun talent pour le moment.");
    }).catch(() => {});
  };

  /* ---------- EXPLORE ---------- */
  S.explore = async (view, r) => {
    const tab = r.query.get("tab") || "freelancers";
    const q = r.query.get("q") || "";
    const cat = r.query.get("category") || "";
    const sort = r.query.get("sort") || "recommended";
    const cats = (M.state.boot && M.state.boot.categories) || [];
    const link = (o) => { const p = new URLSearchParams({ tab, q, category: cat, sort, ...o }); return "explore?" + p.toString(); };
    view.innerHTML = `
      <header class="flex items-center justify-between pt-1 mb-4">
        <div><img src="/assets/logos/logo-dark.png" class="h-5" alt="Intalent" onerror="this.outerHTML='<b>Intalent</b>'"/><p class="text-[10px] text-slate-400 mt-0.5">Discovery Explorer</p></div>
        <button class="w-10 h-10 rounded-full bg-brand-neon flex items-center justify-center" onclick="M.go('${M.state.user ? "post-job" : "login"}')" aria-label="Publier">${M.icon("add")}</button>
      </header>
      <h1 class="text-2xl font-extrabold text-brand-dark tracking-tight">${tab === "services" ? "Explorer les Services" : "Explore Top Freelancers"}</h1>
      <form id="f-ex" class="relative mt-4"><span class="absolute left-3.5 top-3 text-slate-400">${M.icon("search", "!text-[20px]")}</span>
        <input name="q" value="${esc(q)}" class="m-input !pl-11" placeholder="${tab === "services" ? "Logo, site web, traduction..." : "Search elite creators, skills..."}"/></form>
      <div class="flex gap-2 mt-4">
        <button class="m-chip ${tab === "freelancers" ? "on" : ""}" onclick="M.go('${link({ tab: "freelancers" })}')">${M.icon("group", "!text-[16px]")} Freelances</button>
        <button class="m-chip ${tab === "services" ? "on" : ""}" onclick="M.go('${link({ tab: "services" })}')">${M.icon("storefront", "!text-[16px]")} Services</button>
        ${tab === "services" ? `<select id="s-sort" class="m-chip !py-1.5 ml-auto"><option value="recommended">Recommandés</option><option value="rating">Mieux notés</option><option value="price_asc">Prix ↑</option><option value="price_desc">Prix ↓</option><option value="newest">Récents</option></select>` : ""}
      </div>
      ${tab === "services" ? `<div class="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mt-3">
        <button class="m-chip ${!cat ? "on" : ""}" onclick="M.go('${link({ category: "" })}')">All Fields</button>
        ${cats.map((c) => `<button class="m-chip ${cat === c.slug ? "on" : ""}" onclick="M.go('${link({ category: c.slug })}')">${esc(c.name_fr || c.name)}</button>`).join("")}</div>` : ""}
      <div id="ex-res" class="mt-4">${M.skeleton(4)}</div>`;
    const sortSel = view.querySelector("#s-sort");
    if (sortSel) { sortSel.value = sort; sortSel.onchange = () => M.go(link({ sort: sortSel.value })); }
    view.querySelector("#f-ex").onsubmit = (ev) => { ev.preventDefault(); M.go(link({ q: ev.target.q.value.trim() })); };
    const box = view.querySelector("#ex-res");
    if (tab === "services") {
      const d = await M.api(`/api/services?per_page=60&q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}&sort=${sort}`);
      box.innerHTML = `<p class="text-[11px] text-slate-500 mb-3 px-1">${d.total} services trouvés</p>` + (d.services.length ? `<div class="grid grid-cols-2 gap-3">${d.services.map(M.serviceCard).join("")}</div>` : M.empty("search_off", "Aucun service ne correspond à votre recherche."));
    } else {
      const d = await M.api(`/api/freelancers?q=${encodeURIComponent(q)}`);
      const list = d.freelancers || [];
      const top = list[0];
      box.innerHTML = `<p class="text-[11px] text-slate-500 mb-3 px-1">${list.length} talents disponibles</p>` + (top && !q ? `
        <div class="m-hero p-5 mb-4"><div class="relative z-10">
          <span class="m-badge bg-brand-neon text-brand-dark">● AVAILABLE NOW</span>
          <div class="flex items-center gap-3 mt-3">${M.avatar(top.avatar_url, top.full_name, "w-14 h-14")}<div class="min-w-0"><p class="font-extrabold truncate">${esc(top.full_name)}</p><p class="text-[11px] text-slate-300 truncate">${esc(top.headline || "")}</p><p class="text-[11px] text-brand-neon">★ ${Number(top.rating_avg || 5).toFixed(1)} (${top.review_count} avis)</p></div></div>
          <div class="grid grid-cols-3 gap-2 mt-4 text-center">${[[M.dzd(top.hourly_rate_dzd), "/ heure"], [top.review_count, "Avis"], [esc((top.wilaya || "").replace(/^\d+\s*-\s*/, "")), "Wilaya"]].map(([a, b]) => `<div class="bg-white/10 rounded-2xl py-2"><p class="text-xs font-extrabold">${a}</p><p class="text-[10px] text-slate-300">${b}</p></div>`).join("")}</div>
          <button class="m-btn-neon w-full mt-4 !py-3" onclick="M.go('freelancer/${top.id}')">Voir le profil ${M.icon("arrow_forward", "!text-[16px]")}</button>
        </div></div>` : "") + (list.length ? `<div class="space-y-2.5">${list.slice(top && !q ? 1 : 0, 60).map(M.freelancerRow).join("")}</div>` : M.empty("person_search", "Aucun freelance trouvé."));
    }
  };

  /* ---------- FREELANCER PROFILE ---------- */
  M.contact = (userId, name) => {
    if (!M.state.user) return M.go("login");
    if (Number(userId) === Number(M.state.user.id)) return M.toast("C'est votre propre profil.", true);
    const s = M.sheet(`<h3 class="text-base font-extrabold text-brand-dark">Contacter ${esc(name)}</h3><p class="text-xs text-slate-500 mb-4">Votre message sera envoyé dans la messagerie Intalent.</p>
      <form id="f-contact" class="space-y-3"><textarea name="body" rows="4" required class="m-input" placeholder="Bonjour, je souhaite discuter de mon projet..."></textarea>
      <button class="m-btn-neon w-full" type="submit">Envoyer ${M.icon("send", "!text-[18px]")}</button></form>`);
    s.querySelector("#f-contact").onsubmit = async (ev) => {
      ev.preventDefault();
      await M.busy(ev.target.querySelector("button"), async () => {
        try {
          const r = await M.api("/api/messages", { body: { recipient_id: Number(userId), body: ev.target.body.value.trim() } });
          M.closeSheet(); M.toast("Message envoyé"); M.go("chat/" + r.conversation_id);
        } catch (e) { M.toast(e.message, true); }
      });
    };
  };
  S.freelancer = async (view, r) => {
    const { freelancer: f } = await M.api("/api/freelancers/" + encodeURIComponent(r.arg));
    const fav = M.isFav("freelancer", f.id);
    const langs = M.parseList(f.languages);
    view.innerHTML = `
      ${M.topbar("Profil Freelance", { right: `<button class="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center" onclick="M.toggleFav('freelancer', ${f.id}, this)" aria-label="Favori">${M.icon("favorite", fav ? "text-rose-500" : "text-slate-500", fav)}</button>` })}
      <section class="m-hero p-5"><div class="relative z-10 text-center">
        <div class="inline-block relative">${M.avatar(f.avatar_url, f.full_name, "w-24 h-24")}${f.availability === "available" ? `<span class="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>` : ""}</div>
        <h1 class="text-lg font-extrabold mt-3 flex items-center justify-center gap-1">${esc(f.full_name)} ${f.is_verified ? M.icon("verified", "text-brand-neon", true) : ""}</h1>
        <p class="text-xs text-slate-300">${esc(f.headline || "Freelance")}</p>
        <div class="flex justify-center gap-2 mt-2">${f.is_pro ? `<span class="m-badge bg-brand-neon text-brand-dark">PRO</span>` : ""}<span class="m-badge bg-white/10 text-white">${M.icon("location_on", "!text-[12px]")} ${esc(f.wilaya || "Algérie")}</span></div>
        <div class="grid grid-cols-3 gap-2 mt-4">${[[M.dzd(f.hourly_rate_dzd), "/ heure"], [(f.reviews || []).length, "Avis"], [(f.services || []).length, "Services"]].map(([a, b]) => `<div class="bg-white/10 rounded-2xl py-2.5"><p class="text-xs font-extrabold">${a}</p><p class="text-[10px] text-slate-300">${b}</p></div>`).join("")}</div>
        <div class="grid grid-cols-2 gap-2 mt-4">
          <button class="m-btn-neon !py-3" onclick="M.contact(${f.id}, '${esc(f.full_name).replace(/'/g, "\\'")}')">${M.icon("chat", "!text-[18px]")} Contacter</button>
          <button class="m-btn-ghost !py-3" onclick="M.go('portfolio/${f.id}')">${M.icon("collections", "!text-[18px]")} Portfolio</button>
        </div>
      </div></section>
      ${M.section("À propos")}
      <div class="m-card p-4"><p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${esc(f.bio || "Ce freelance n'a pas encore rédigé de présentation.")}</p>
        ${langs.length ? `<p class="text-[11px] text-slate-500 mt-3">${M.icon("translate", "!text-[14px]")} ${langs.map(esc).join(" · ")}</p>` : ""}</div>
      ${(f.skills || []).length ? `${M.section("Compétences")}<div class="flex flex-wrap gap-2">${f.skills.map((s) => `<span class="m-chip">${esc(s.skill_name)}${s.level ? ` · <span class="text-brand-purple">${esc(s.level)}</span>` : ""}</span>`).join("")}</div>` : ""}
      ${M.section(`Services (${(f.services || []).length})`)}
      ${(f.services || []).length ? `<div class="grid grid-cols-2 gap-3">${f.services.map((s) => M.serviceCard({ ...s, freelancer_name: f.full_name, freelancer_avatar: f.avatar_url, freelancer_is_pro: f.is_pro })).join("")}</div>` : M.empty("storefront", "Aucun service publié.")}
      ${M.section(`Avis clients (${(f.reviews || []).length})`)}
      <div class="space-y-2.5">${(f.reviews || []).slice(0, 8).map((rv) => `<div class="m-card p-3.5"><div class="flex items-center gap-2">${M.avatar(rv.client_avatar, rv.client_name, "w-8 h-8")}<div class="flex-1"><p class="text-xs font-bold">${esc(rv.client_name)}</p><p class="text-[10px] text-slate-400">${esc(rv.service_title || "")}</p></div><span class="text-[11px] font-bold text-amber-600">★ ${rv.rating}</span></div><p class="text-xs text-slate-600 mt-2">${esc(rv.comment || "")}</p></div>`).join("") || M.empty("reviews", "Pas encore d'avis.")}</div>`;
  };

  /* ---------- PORTFOLIO ---------- */
  S.portfolio = async (view, r) => {
    const id = r.arg || (M.state.user && M.state.user.id);
    if (!id) return M.go("login");
    const { freelancer: f } = await M.api("/api/freelancers/" + encodeURIComponent(id));
    const mine = M.state.user && Number(M.state.user.id) === Number(f.id);
    const items = f.portfolio || [];
    view.innerHTML = `
      ${M.topbar("Portfolio & Réalisations", { sub: f.full_name })}
      <section class="m-hero p-5"><div class="relative z-10 flex items-center gap-3">${M.avatar(f.avatar_url, f.full_name, "w-14 h-14")}
        <div><p class="font-extrabold">${esc(f.full_name)}</p><p class="text-[11px] text-slate-300">${items.length} réalisations · ${(f.services || []).length} services</p></div></div></section>
      ${mine ? `<button class="m-btn-neon w-full mt-4" id="b-add-pf">${M.icon("add_photo_alternate", "!text-[18px]")} Ajouter une réalisation</button>` : ""}
      <div class="grid grid-cols-1 gap-3 mt-4">
        ${items.map((p) => `<article class="m-card overflow-hidden">
          ${p.image_url ? `<img src="${esc(p.image_url)}" class="w-full h-44 object-cover bg-slate-200" loading="lazy" alt=""/>` : ""}
          <div class="p-4"><span class="m-badge bg-violet-50 text-brand-purple">${esc(p.category || "Projet")}</span>
          <h3 class="text-sm font-bold mt-2">${esc(p.title)}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">${esc(p.description || "")}</p>
          ${p.project_url ? `<a href="${esc(p.project_url)}" target="_blank" rel="noopener" class="text-[11px] font-bold text-brand-purple mt-2 inline-flex items-center gap-1">${M.icon("open_in_new", "!text-[14px]")} Voir le projet</a>` : ""}</div></article>`).join("") || M.empty("collections", mine ? "Ajoutez votre première réalisation pour rassurer vos clients." : "Aucune réalisation publiée.")}
      </div>`;
    const add = view.querySelector("#b-add-pf");
    if (add) add.onclick = () => {
      const s = M.sheet(`<h3 class="text-base font-extrabold mb-4">Nouvelle réalisation</h3>
        <form id="f-pf" class="space-y-3">
          <input name="title" required class="m-input" placeholder="Titre du projet"/>
          <input name="category" class="m-input" placeholder="Catégorie (ex: UI/UX Design)"/>
          <textarea name="description" rows="3" class="m-input" placeholder="Description"></textarea>
          <label class="m-label">Image (optionnelle)</label><input type="file" accept="image/*" id="pf-file" class="text-xs"/>
          <input name="project_url" class="m-input" placeholder="Lien (https://...)"/>
          <button class="m-btn-neon w-full" type="submit">Publier</button></form>`);
      s.querySelector("#f-pf").onsubmit = async (ev) => {
        ev.preventDefault();
        await M.busy(ev.target.querySelector("[type=submit]"), async () => {
          try {
            const body = M.formData(ev.target);
            delete body[""];
            const file = s.querySelector("#pf-file").files[0];
            if (file) body.image_url = await M.upload(file);
            await M.api("/api/portfolio", { body });
            M.closeSheet(); M.toast("Réalisation ajoutée"); M.render();
          } catch (e) { M.toast(e.message, true); }
        });
      };
    };
  };
  M.upload = (file) => new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) return reject(new Error("Fichier trop volumineux (5 Mo max)."));
    const rd = new FileReader();
    rd.onload = async () => { try { const r = await M.api("/api/upload", { body: { filename: file.name, data_url: rd.result } }); resolve(r.url); } catch (e) { reject(e); } };
    rd.onerror = () => reject(new Error("Lecture du fichier impossible."));
    rd.readAsDataURL(file);
  });

  /* ---------- SERVICE DETAIL ---------- */
  S.service = async (view, r) => {
    const { service: s } = await M.api("/api/services/" + encodeURIComponent(r.arg));
    const fav = M.isFav("service", s.id);
    const pk = s.packages || [];
    view.innerHTML = `
      ${M.topbar("Détail du service", { right: `<button class="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center" onclick="M.toggleFav('service', ${s.id}, this)" aria-label="Favori">${M.icon("favorite", fav ? "text-rose-500" : "text-slate-500", fav)}</button>` })}
      <div class="rounded-3xl overflow-hidden h-48 bg-slate-200">${s.cover_image ? `<img src="${esc(s.cover_image)}" class="w-full h-full object-cover" alt=""/>` : ""}</div>
      <span class="m-badge bg-violet-50 text-brand-purple mt-4">${esc(s.category_name)}${s.subcategory_name ? " · " + esc(s.subcategory_name) : ""}</span>
      <h1 class="text-lg font-extrabold text-brand-dark mt-2 leading-snug">${esc(s.title)}</h1>
      <p class="text-xs text-amber-600 font-bold mt-1">★ ${Number(s.rating_avg || 5).toFixed(1)} <span class="text-slate-400 font-medium">(${s.review_count || 0} avis) · ${s.delivery_days} j de livraison</span></p>
      <button class="m-card p-3 flex items-center gap-3 w-full mt-4 text-left" onclick="M.go('freelancer/${s.freelancer_id}')">${M.avatar(s.freelancer_avatar, s.freelancer_name)}<div class="flex-1 min-w-0"><p class="text-sm font-bold truncate">${esc(s.freelancer_name)}</p><p class="text-[11px] text-slate-500 truncate">${esc(s.freelancer_headline || "")}</p></div>${M.icon("chevron_right", "text-slate-400")}</button>
      ${M.section("Description")}
      <div class="m-card p-4"><p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${esc(s.description)}</p></div>
      ${M.section("Formules")}
      <div class="flex gap-2 mb-3" id="pk-tabs">${pk.map((p, i) => `<button class="m-chip ${i === 0 ? "on" : ""}" data-i="${i}">${esc(p.name || p.tier)}</button>`).join("")}</div>
      <div id="pk-box"></div>
      ${(s.extras || []).length ? `${M.section("Options")}<div class="space-y-2">${s.extras.map((x) => `<div class="m-card p-3 flex justify-between text-xs"><span class="font-semibold">${esc(x.title || x.name)}</span><span class="font-extrabold text-brand-purple">+${M.dzd(x.price_dzd)}</span></div>`).join("")}</div>` : ""}
      ${M.section(`Avis (${(s.reviews || []).length})`)}
      <div class="space-y-2.5">${(s.reviews || []).slice(0, 6).map((rv) => `<div class="m-card p-3.5"><div class="flex items-center gap-2">${M.avatar(rv.client_avatar, rv.client_name, "w-8 h-8")}<p class="text-xs font-bold flex-1">${esc(rv.client_name)}</p><span class="text-[11px] font-bold text-amber-600">★ ${rv.rating}</span></div><p class="text-xs text-slate-600 mt-2">${esc(rv.comment || "")}</p></div>`).join("") || M.empty("reviews", "Pas encore d'avis.")}</div>
      <div class="h-20"></div>
      <div class="fixed bottom-[76px] inset-x-0 mx-auto max-w-[440px] px-4 z-40"><div class="bg-brand-dark rounded-3xl p-3 flex items-center gap-3 shadow-2xl">
        <div class="flex-1 pl-2"><p class="text-[10px] text-slate-400">Total formule</p><p class="text-sm font-extrabold text-brand-neon" id="pk-price">—</p></div>
        <button class="m-btn-dark !bg-white/10" onclick="M.contact(${s.freelancer_id}, '${esc(s.freelancer_name).replace(/'/g, "\\'")}')" aria-label="Contacter">${M.icon("chat")}</button>
        <button class="m-btn-neon" id="b-order">Commander ${M.icon("arrow_forward", "!text-[16px]")}</button></div></div>`;
    let cur = 0;
    const show = () => {
      const p = pk[cur];
      view.querySelectorAll("#pk-tabs .m-chip").forEach((b) => b.classList.toggle("on", Number(b.dataset.i) === cur));
      view.querySelector("#pk-box").innerHTML = p ? `<div class="m-card p-4"><div class="flex justify-between items-start"><p class="text-sm font-extrabold">${esc(p.name)}</p><p class="text-sm font-extrabold text-brand-purple">${M.dzd(p.price_dzd)}</p></div>
        <p class="text-xs text-slate-500 mt-1">${esc(p.description || "")}</p>
        <p class="text-[11px] text-slate-600 mt-3">${M.icon("schedule", "!text-[14px]")} ${p.delivery_days} jours · ${M.icon("autorenew", "!text-[14px]")} ${p.revisions} révisions</p>
        <ul class="mt-2 space-y-1">${M.parseList(p.features).map((f) => `<li class="text-[11px] text-slate-600 flex gap-1">${M.icon("check_circle", "!text-[14px] text-emerald-600", true)} ${esc(f)}</li>`).join("")}</ul></div>` : M.empty("inventory_2", "Aucune formule configurée.");
      view.querySelector("#pk-price").textContent = p ? M.dzd(p.price_dzd) : "—";
    };
    view.querySelectorAll("#pk-tabs .m-chip").forEach((b) => (b.onclick = () => { cur = Number(b.dataset.i); show(); }));
    show();
    view.querySelector("#b-order").onclick = () => {
      if (!M.state.user) return M.go("login");
      if (Number(M.state.user.id) === Number(s.freelancer_id)) return M.toast("Vous ne pouvez pas acheter votre propre service.", true);
      M.go(`checkout/${s.id}?tier=${pk[cur] ? pk[cur].tier : "basic"}`);
    };
  };

  /* ---------- CHECKOUT (Mode de Paiement & Carte CIB) ---------- */
  S.checkout = async (view, r) => {
    const { service: s } = await M.api("/api/services/" + encodeURIComponent(r.arg));
    const pk = s.packages || [];
    let tier = r.query.get("tier") || (pk[0] && pk[0].tier) || "basic";
    const settings = (M.state.boot && M.state.boot.settings) || {};
    const rate = Number(settings.commission_rate_pct || settings.platform_commission_pct || 10);
    view.innerHTML = `
      ${M.topbar("Mode de Paiement", { sub: "Paiement sous séquestre DZD" })}
      <div class="m-hero p-5"><div class="relative z-10">
        <div class="flex justify-between items-center"><span class="text-[11px] font-bold tracking-wider text-slate-300">CARTE CIB / EDAHABIA</span>${M.icon("contactless", "text-brand-neon")}</div>
        <p class="font-mono text-lg tracking-[.2em] mt-6">•••• •••• •••• ••••</p>
        <div class="flex justify-between mt-4 text-[11px] text-slate-300"><span>${esc(M.state.user.full_name.toUpperCase())}</span><span>SATIM · SANDBOX</span></div>
      </div></div>
      <div class="mt-4">${M.sandboxNote("Mode démonstration : le paiement SATIM CIB / Edahabia / BaridiMob n'est pas encore branché à une banque. Aucune carte n'est demandée ni débitée ; la commande est enregistrée avec un paiement « sandbox ».")}</div>
      <form id="f-co" class="space-y-4 mt-4">
        <div><label class="m-label">Service</label><div class="m-card p-3 flex gap-3 items-center">${s.cover_image ? `<img src="${esc(s.cover_image)}" class="w-14 h-14 rounded-2xl object-cover" alt=""/>` : ""}<div class="min-w-0"><p class="text-xs font-bold line-clamp-2">${esc(s.title)}</p><p class="text-[11px] text-slate-500">${esc(s.freelancer_name)}</p></div></div></div>
        <div><label class="m-label">Formule</label><div class="space-y-2">${pk.map((p) => `<label class="m-card p-3 flex items-center gap-3 cursor-pointer"><input type="radio" name="package_tier" value="${esc(p.tier)}" ${p.tier === tier ? "checked" : ""} class="text-brand-purple"/><div class="flex-1"><p class="text-xs font-bold">${esc(p.name)}</p><p class="text-[10px] text-slate-500">${p.delivery_days} j · ${p.revisions} révisions</p></div><span class="text-xs font-extrabold text-brand-purple">${M.dzd(p.price_dzd)}</span></label>`).join("")}</div></div>
        ${(s.extras || []).length ? `<div><label class="m-label">Options</label><div class="space-y-2">${s.extras.map((x) => `<label class="m-card p-3 flex items-center gap-3"><input type="checkbox" name="extra" value="${x.id}" data-price="${x.price_dzd}" class="rounded text-brand-purple"/><span class="text-xs font-semibold flex-1">${esc(x.title || x.name)}</span><span class="text-xs font-bold">+${M.dzd(x.price_dzd)}</span></label>`).join("")}</div></div>` : ""}
        <div><label class="m-label">Méthode de paiement</label><div class="grid grid-cols-3 gap-2">${[["SATIM CIB Sandbox", "credit_card", "CIB"], ["Edahabia Sandbox", "account_balance", "Edahabia"], ["BaridiMob Sandbox", "smartphone", "BaridiMob"]].map(([v, ic, l], i) => `<label class="m-card p-3 text-center cursor-pointer"><input type="radio" name="payment_method" value="${v}" ${i === 0 ? "checked" : ""} class="mb-1 text-brand-purple"/><div>${M.icon(ic, "text-brand-purple")}</div><p class="text-[10px] font-bold">${l}</p></label>`).join("")}</div></div>
        <div><label class="m-label">Brief du projet (obligatoire)</label><textarea name="requirements" rows="4" required class="m-input" placeholder="${esc(s.requirements_prompt || "Décrivez votre besoin...")}"></textarea></div>
        <div class="m-card p-4 space-y-2 text-xs" id="co-sum"></div>
        <button class="m-btn-neon w-full !py-4" type="submit">${M.icon("lock", "!text-[18px]")} Confirmer la commande</button>
      </form>`;
    const form = view.querySelector("#f-co");
    const sum = () => {
      const t = (form.querySelector("[name=package_tier]:checked") || {}).value;
      const p = pk.find((x) => x.tier === t) || pk[0] || { price_dzd: 0 };
      const ex = [...form.querySelectorAll("[name=extra]:checked")].reduce((a, c) => a + Number(c.dataset.price || 0), 0);
      const sub = Number(p.price_dzd) + ex;
      const fee = Math.round((sub * rate) / 100);
      view.querySelector("#co-sum").innerHTML = `<div class="flex justify-between"><span class="text-slate-500">Sous-total</span><b>${M.dzd(sub)}</b></div><div class="flex justify-between"><span class="text-slate-500">Frais de service (estim. ${rate}%)</span><b>${M.dzd(fee)}</b></div><div class="h-px bg-slate-100"></div><div class="flex justify-between text-sm"><b>Total estimé</b><b class="text-brand-purple">${M.dzd(sub + fee)}</b></div><p class="text-[10px] text-slate-400">Le montant final est recalculé par le serveur.</p>`;
    };
    form.addEventListener("change", sum);
    sum();
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      await M.busy(form.querySelector("[type=submit]"), async () => {
        try {
          const body = {
            service_id: s.id,
            package_tier: (form.querySelector("[name=package_tier]:checked") || {}).value || tier,
            extra_ids: [...form.querySelectorAll("[name=extra]:checked")].map((c) => Number(c.value)),
            requirements: form.requirements.value.trim(),
            payment_method: form.querySelector("[name=payment_method]:checked").value
          };
          const res = await M.api("/api/orders", { body });
          M.toast("Commande " + res.order_number + " créée (" + M.dzd(res.total_dzd) + ")");
          M.go("order/" + res.order_id);
        } catch (e) { M.toast(e.message, true); }
      });
    };
  };
})();
