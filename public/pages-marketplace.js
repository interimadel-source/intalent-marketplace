(function () {
  const App = () => window.IntalentApp;

  // =========================================================================
  // 7. FREELANCER DIRECTORY (100 REAL ALGERIAN FREELANCERS — BENTO 3D)
  // =========================================================================
  async function renderFreelancerDirectory(main, state, proOnlyDefault = false) {
    const { escapeHtml, api } = App();
    const proOnly = proOnlyDefault || state.params.pro_only === "true";
    const wilaya = state.params.wilaya || "";
    const q = state.params.q || "";

    const qs = new URLSearchParams();
    if (proOnly) qs.set("pro_only", "true");
    if (wilaya) qs.set("wilaya", wilaya);
    if (q) qs.set("q", q);

    const { freelancers } = await api("/api/freelancers?" + qs.toString());

    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-gutter py-space-xl">
        <!-- Bento Header Banner -->
        <div class="bg-primary-container text-on-primary rounded-[36px] p-space-xl mb-space-xl relative overflow-hidden shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
          <div class="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-secondary/40 rounded-full blur-3xl"></div>
          <div class="relative z-10 max-w-2xl space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold uppercase tracking-wider">
              <span class="material-symbols-outlined text-[14px]">verified</span>
              <span>${freelancers.length} Prestataires Algériens Vérifiés (CNI &amp; ANA)</span>
            </div>
            <h1 class="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-white font-extrabold">
              ${proOnly ? "Annuaire Officiel INTALENT Pro (Top 3%)" : "Découvrez nos 100 Freelances & Experts Tech en Algérie"}
            </h1>
            <p class="font-body-md text-outline-variant">
              Profils réels audités avec portfolios vérifiés, services publiés et paiement séquestre SATIM / Edahabia sur les 58 Wilayas.
            </p>
          </div>
          <div class="relative z-10 flex flex-wrap gap-3">
            <button type="button" onclick="window.IntalentApp.navigate('pro-upgrade')" class="px-6 py-3.5 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-extrabold shadow-lg hover:scale-105 transition-all">
              Devenir Intalent Pro (dès 2,500 DA) →
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-label-lg font-bold transition-all">
              Publier un Projet
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <form id="fl-filter-form" class="bg-surface-container-lowest p-space-md rounded-[28px] shadow-sm mb-space-xl flex flex-col md:flex-row items-center gap-space-sm">
          <div class="flex items-center gap-2 bg-surface-container-low px-space-md py-3 rounded-full flex-1 w-full">
            <span class="material-symbols-outlined text-secondary">person_search</span>
            <input type="text" name="q" value="${escapeHtml(q)}" class="w-full bg-transparent text-on-surface font-body-md outline-none" placeholder="Rechercher par nom, titre ou compétence (ex: Flutter, UI/UX, DevOps, Yacine)...">
          </div>
          <select name="wilaya" class="bg-surface-container-low px-space-md py-3 rounded-full font-label-md text-on-surface outline-none cursor-pointer w-full md:w-64">
            <option value="">Toutes les 58 Wilayas</option>
            ${state.wilayas.map(w => `<option value="${escapeHtml(w.name)}" ${wilaya === w.name ? 'selected' : ''}>${w.code} — ${escapeHtml(w.name)}</option>`).join("")}
          </select>
          <div class="flex items-center gap-2 w-full md:w-auto">
            <button type="submit" class="px-6 py-3 rounded-full bg-primary-container text-tertiary-fixed font-label-lg font-bold shadow-sm hover:bg-secondary hover:text-white transition-all">
              Filtrer (${freelancers.length})
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('${proOnly ? 'pro-talent' : 'freelancers'}')" class="px-4 py-3 rounded-full bg-surface-container-high text-on-surface font-label-md font-bold">
              Reset
            </button>
          </div>
        </form>

        <!-- 4-Column Bento Grid of 100 Freelancers -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          ${freelancers.map(f => {
            const dailyRate = Number(f.hourly_rate_dzd || 3500) * 6;
            const skills = (f.skills || []).slice(0, 3);
            return `
              <div class="bg-surface-container-lowest rounded-[28px] p-space-md shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
                <div>
                  <div class="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container mb-space-sm cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${escapeHtml(f.avatar_url)}" alt="${escapeHtml(f.full_name)}" loading="lazy" onerror="this.src='/assets/logos/logo-dark.png'">
                    <div class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md font-label-xs text-label-xs font-bold text-on-surface flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${escapeHtml(f.wilaya || "Alger")}
                    </div>
                    ${f.is_pro ? `
                      <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-[10px] font-extrabold">
                        PRO ✦
                      </div>
                    ` : ""}
                    <div class="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-primary-container/90 text-tertiary-fixed font-label-xs text-label-xs font-bold">
                      ★ ${Number(f.rating_avg || 4.9).toFixed(1)} (${f.review_count || 18})
                    </div>
                  </div>
                  <div class="cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">
                    <h3 class="font-title-md text-title-md font-bold text-on-surface group-hover:text-secondary transition-colors flex items-center gap-1">
                      <span class="truncate">${escapeHtml(f.full_name)}</span>
                      ${f.is_verified ? `<span class="material-symbols-outlined text-secondary text-sm material-fill">verified</span>` : ""}
                    </h3>
                    <p class="font-body-sm text-body-sm text-secondary font-semibold truncate">${escapeHtml(f.headline)}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">${escapeHtml(f.bio)}</p>
                  </div>
                  <div class="flex flex-wrap gap-1 mt-space-sm">
                    ${skills.map(s => `<span class="px-2 py-0.5 rounded bg-surface-container-low text-on-surface font-label-xs text-label-xs">${escapeHtml(s.skill_name)}</span>`).join("")}
                  </div>
                </div>
                <div class="mt-space-md pt-space-sm border-t border-surface-container-high/60 flex items-center justify-between">
                  <div>
                    <span class="font-label-xs text-label-xs text-on-surface-variant block">TJM Indicatif</span>
                    <span class="font-title-md text-title-md font-extrabold text-on-surface">${dailyRate.toLocaleString("fr-DZ")} <span class="font-label-xs text-secondary">DZD</span></span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="window.IntalentApp.openContactModal(${f.id}, '${escapeHtml(f.full_name)}', 'Opportunité de mission')" class="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors" title="Contacter">
                      <span class="material-symbols-outlined text-[17px]">chat</span>
                    </button>
                    <button type="button" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')" class="px-space-md py-2 rounded-full bg-tertiary-fixed text-primary-container font-label-md text-label-md font-bold shadow-sm hover:scale-105 transition-all">
                      Portfolio
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    document.getElementById("fl-filter-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const next = new URLSearchParams();
      if (proOnly) next.set("pro_only", "true");
      if (fd.get("q")) next.set("q", fd.get("q"));
      if (fd.get("wilaya")) next.set("wilaya", fd.get("wilaya"));
      App().navigate((proOnly ? "pro-talent?" : "freelancers?") + next.toString());
    });
  }

  window.IntalentPages["freelancers"] = (main, state) => renderFreelancerDirectory(main, state, false);
  window.IntalentPages["pro-talent"] = (main, state) => renderFreelancerDirectory(main, state, true);

  // =========================================================================
  // 8. INDIVIDUAL FREELANCER PROFILE & PORTFOLIO (STITCH SCREEN 3ed61d23a43a49a69882200aadd9467a)
  // =========================================================================
  window.IntalentPages["freelancer"] = async function (main, state) {
    const { escapeHtml, formatDZD, renderServiceCard, api } = App();
    const ident = state.params.username || state.params.id || "yacine_benali";
    const { freelancer: f } = await api("/api/freelancers/" + encodeURIComponent(ident));
    let langs = [];
    try { langs = JSON.parse(f.languages || "[]"); } catch (_) {}
    const dailyRate = Number(f.hourly_rate_dzd || 4000) * 6;

    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-gutter py-space-xl space-y-space-xl">
        <!-- Bento Profile Header Card -->
        <div class="bg-surface-container-lowest rounded-[36px] p-space-xl shadow-[0_20px_50px_-15px_rgba(37,8,63,0.08)] relative overflow-hidden border border-surface-container-high">
          <div class="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-tertiary-fixed/25 rounded-full blur-3xl"></div>
          <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
              <div class="relative">
                <img src="${escapeHtml(f.avatar_url)}" alt="${escapeHtml(f.full_name)}" class="w-28 h-28 rounded-[28px] object-cover ring-4 ring-tertiary-fixed shadow-lg" onerror="this.src='/assets/logos/logo-dark.png'">
                <span class="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-primary-container text-tertiary-fixed font-label-xs text-[10px] font-extrabold shadow">CNI VÉRIFIÉ</span>
              </div>
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="font-headline-xl text-headline-lg lg:text-headline-xl text-on-surface font-extrabold">${escapeHtml(f.full_name)}</h1>
                  ${f.is_pro ? `<span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold">INTALENT PRO ✦</span>` : ""}
                  <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-bold">Auto-Entrepreneur ANA</span>
                </div>
                <p class="font-title-md text-secondary font-bold">${escapeHtml(f.headline)}</p>
                <div class="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant pt-1">
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-secondary">location_on</span> ${escapeHtml(f.wilaya || "Alger (16)")}</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-amber-500 material-fill">star</span> <strong>${Number(f.rating_avg || 4.95).toFixed(2)}</strong> (${f.review_count || 28} avis Escrow)</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-emerald-600">translate</span> ${escapeHtml(langs.join(" • ") || "Français • Arabe • Anglais")}</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
              <div class="bg-surface-container-low px-5 py-3 rounded-2xl text-right">
                <span class="font-label-xs text-on-surface-variant uppercase block">Taux Journalier Moyen (TJM)</span>
                <span class="font-headline-md text-on-surface font-extrabold">${dailyRate.toLocaleString("fr-DZ")} <span class="text-secondary text-sm">DZD / jour</span></span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" onclick="window.IntalentApp.openContactModal(${f.id}, '${escapeHtml(f.full_name)}', 'Proposition de mission directe')" class="px-6 py-3.5 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-extrabold shadow-md hover:scale-105 transition-all flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">chat</span>
                  <span>Contacter en direct</span>
                </button>
                <button type="button" onclick="window.IntalentApp.toggleFavorite('freelancer', ${f.id}, this)" class="w-12 h-12 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors" title="Sauvegarder">
                  <span class="material-symbols-outlined">favorite</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <!-- Left 8 cols: Services, Portfolio & Reviews -->
          <div class="lg:col-span-8 space-y-space-xl">
            <!-- Bio & Skills -->
            <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm space-y-4">
              <h2 class="font-headline-md text-on-surface font-bold">Présentation &amp; Expertise Technique</h2>
              <p class="font-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">${escapeHtml(f.bio)}</p>
              <div class="pt-2">
                <span class="font-label-xs text-on-surface-variant uppercase font-bold block mb-2">Compétences Auditées</span>
                <div class="flex flex-wrap gap-2">
                  ${(f.skills || []).map(s => `<span class="px-3.5 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-xs font-bold">${escapeHtml(s.skill_name)} • <span class="text-secondary">${escapeHtml(s.level)}</span></span>`).join("")}
                </div>
              </div>
            </div>

            <!-- Active Services -->
            <div class="space-y-space-md">
              <div class="flex items-center justify-between">
                <h2 class="font-headline-md text-on-surface font-bold">Packs de Services Clés en Main (${(f.services || []).length})</h2>
                <span class="font-label-xs text-secondary font-bold uppercase">Paiement Séquestre SATIM</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                ${(f.services || []).map(s => renderServiceCard(Object.assign({}, s, {
                  freelancer_id: f.id,
                  freelancer_name: f.full_name,
                  freelancer_username: f.username,
                  freelancer_avatar: f.avatar_url,
                  freelancer_wilaya: f.wilaya,
                  freelancer_is_pro: f.is_pro,
                  freelancer_is_verified: f.is_verified
                }))).join("")}
              </div>
            </div>

            <!-- Portfolio Case Studies -->
            <div class="space-y-space-md">
              <h2 class="font-headline-md text-on-surface font-bold">Réalisations &amp; Études de Cas (${(f.portfolio || []).length})</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                ${(f.portfolio || []).map(p => `
                  <div class="bg-surface-container-lowest rounded-[28px] overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" class="w-full h-48 object-cover">
                    <div class="p-space-lg">
                      <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-[10px] font-bold uppercase">${escapeHtml(p.category)}</span>
                      <h4 class="font-title-md text-on-surface font-bold mt-2">${escapeHtml(p.title)}</h4>
                      <p class="font-body-sm text-on-surface-variant mt-1">${escapeHtml(p.description)}</p>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Right 4 cols: Verification & Reviews -->
          <div class="lg:col-span-4 space-y-space-lg lg:sticky lg:top-28">
            <div class="bg-primary-container text-on-primary rounded-[28px] p-space-lg shadow-lg space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-label-xs text-tertiary-fixed uppercase font-bold">Conformité &amp; KYC Algérie</span>
                <span class="material-symbols-outlined text-tertiary-fixed">verified_user</span>
              </div>
              <ul class="space-y-2 font-body-sm text-white/90">
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm text-tertiary-fixed">check_circle</span> Pièce d'identité CNI biométrique vérifiée</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm text-tertiary-fixed">check_circle</span> Carte Auto-Entrepreneur ANA active</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm text-tertiary-fixed">check_circle</span> RIB / CCP Algérie Poste validé</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm text-tertiary-fixed">check_circle</span> Contrat NDA &amp; Cession IP automatique</li>
              </ul>
            </div>

            <div class="bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm space-y-4">
              <h3 class="font-title-md text-on-surface font-bold">Avis Clients Vérifiés (${(f.reviews || []).length})</h3>
              ${(f.reviews || []).length === 0 ? `<p class="font-body-sm text-on-surface-variant">Aucun avis publié.</p>` :
                f.reviews.map(r => `
                  <div class="p-space-sm rounded-2xl bg-surface-container-low space-y-1">
                    <div class="flex items-center justify-between">
                      <strong class="font-label-md text-on-surface">${escapeHtml(r.client_name)}</strong>
                      <span class="text-amber-500 text-xs font-bold">${"★".repeat(r.rating)}</span>
                    </div>
                    <p class="font-body-sm text-on-surface-variant">${escapeHtml(r.comment)}</p>
                  </div>
                `).join("")
              }
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // =========================================================================
  // 9. OPEN PROJECTS & POST A PROJECT (STITCH SCREEN dce06f2ca84e43adb9586b6e43dd8049)
  // =========================================================================
  window.IntalentPages["projects"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, openModal, closeModal } = App();
    const { projects } = await api("/api/projects");

    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-gutter py-space-xl">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div>
            <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-bold uppercase">Appels d'Offres &amp; Missions B2B</span>
            <h1 class="font-headline-xl text-headline-xl text-on-surface mt-2">Projets Clients &amp; Entreprises Ouverts</h1>
            <p class="font-body-md text-on-surface-variant">Soumettez votre proposition chiffrée en DZD ou publiez votre cahier des charges.</p>
          </div>
          <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="px-space-xl py-3.5 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-extrabold shadow-md hover:scale-105 transition-all">
            + Publier un Projet Client / Entreprise
          </button>
        </div>

        <div class="flex flex-col gap-space-md">
          ${projects.map(p => {
            let skills = [];
            try { skills = JSON.parse(p.skills_required || "[]"); } catch (_) {}
            const isOwner = state.user && (state.user.id === p.client_id || state.user.role === "admin");

            return `
              <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm hover:shadow-md transition-all">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                  <div class="space-y-2 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-3 py-0.5 rounded-full bg-primary-container text-tertiary-fixed font-label-xs text-label-xs font-bold">${escapeHtml(p.project_code)}</span>
                      <span class="px-3 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-xs text-label-xs font-bold">${escapeHtml(p.category_name)}</span>
                      <span class="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-xs text-label-xs font-bold uppercase">${escapeHtml(p.status)}</span>
                    </div>
                    <h3 class="font-headline-sm text-on-surface font-extrabold">${escapeHtml(p.title)}</h3>
                    <p class="font-body-md text-on-surface-variant">${escapeHtml(p.description)}</p>
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      ${skills.map(sk => `<span class="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface font-label-xs text-label-xs font-bold">${escapeHtml(sk)}</span>`).join("")}
                    </div>
                    <div class="font-body-sm text-on-surface-variant pt-1">
                      Publié par <strong>${escapeHtml(p.client_name)}</strong> (${escapeHtml(p.client_wilaya)}) • Délai : <strong>${p.deadline_days} jours</strong> • Niveau : <strong>${escapeHtml(p.experience_level)}</strong> • Offres reçues : <strong>${p.proposal_count}</strong>
                    </div>
                  </div>
                  <div class="bg-surface-container-low p-space-lg rounded-2xl min-w-[250px] text-right flex flex-col justify-between gap-3">
                    <div>
                      <span class="font-label-xs text-on-surface-variant uppercase font-bold block">Enveloppe Budgétaire Séquestre</span>
                      <div class="font-headline-sm text-secondary font-extrabold mt-0.5">
                        ${formatDZD(p.budget_min_dzd)} – ${formatDZD(p.budget_max_dzd)}
                      </div>
                    </div>
                    ${p.status === "open" && !isOwner ? `
                      <button type="button" class="submit-proposal-trigger px-5 py-2.5 rounded-full bg-tertiary-fixed text-primary-container font-label-md font-extrabold shadow-sm hover:scale-105 transition-all" data-pid="${p.id}" data-title="${escapeHtml(p.title)}">
                        ${p.my_proposal ? "Offre Déjà Envoyée ✓" : "Soumettre un Devis DZD →"}
                      </button>
                    ` : ""}
                  </div>
                </div>

                ${isOwner && (p.proposals || []).length > 0 ? `
                  <div class="mt-space-lg pt-space-md border-t border-surface-container-high space-y-2">
                    <h4 class="font-title-md text-on-surface font-bold">Propositions des Freelances (${p.proposals.length})</h4>
                    ${p.proposals.map(pr => `
                      <div class="flex flex-wrap items-center justify-between p-space-md rounded-2xl bg-surface-container-low gap-3">
                        <div>
                          <strong class="text-on-surface">${escapeHtml(pr.freelancer_name)}</strong> — Offre : <strong class="text-secondary">${formatDZD(pr.bid_amount_dzd)}</strong> (${pr.delivery_days} jours)
                          <p class="font-body-sm text-on-surface-variant mt-0.5">${escapeHtml(pr.cover_letter)}</p>
                        </div>
                        ${p.status === "open" && pr.status === "pending" ? `
                          <button type="button" class="accept-proposal-btn px-4 py-2 rounded-full bg-primary-container text-tertiary-fixed font-label-md font-bold" data-propid="${pr.id}">Accepter &amp; Créer Contrat →</button>
                        ` : `<span class="px-3 py-1 rounded-full bg-surface-container-high font-label-xs font-bold uppercase">${escapeHtml(pr.status)}</span>`}
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    main.querySelectorAll(".submit-proposal-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!state.user) {
          showToast("Veuillez vous connecter pour envoyer une proposition.", true);
          App().navigate("login");
          return;
        }
        const pid = btn.getAttribute("data-pid");
        const ptitle = btn.getAttribute("data-title");
        openModal(`
          <h3 class="font-headline-sm text-on-surface font-bold mb-1">Envoyer une proposition commerciale</h3>
          <p class="font-body-sm text-on-surface-variant mb-4">Projet : <strong>${escapeHtml(ptitle)}</strong></p>
          <form id="proposal-modal-form" class="space-y-3">
            <div>
              <label class="font-label-md text-on-surface block mb-1">Montant de votre devis (DZD)</label>
              <input type="number" name="bid_amount_dzd" class="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface" value="85000" required>
            </div>
            <div>
              <label class="font-label-md text-on-surface block mb-1">Délai de réalisation (Jours)</label>
              <input type="number" name="delivery_days" class="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface" value="10" required>
            </div>
            <div>
              <label class="font-label-md text-on-surface block mb-1">Note méthodologique &amp; Livrables</label>
              <textarea name="cover_letter" rows="4" class="w-full p-3 rounded-xl bg-surface-container-low text-on-surface" placeholder="Détaillez votre approche technique et les jalons..." required></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md font-bold" onclick="window.IntalentApp.closeModal()">Annuler</button>
              <button type="submit" class="px-6 py-2.5 rounded-full bg-tertiary-fixed text-primary-container font-label-md font-extrabold">Transmettre le devis</button>
            </div>
          </form>
        `);
        document.getElementById("proposal-modal-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await api(`/api/projects/${pid}/proposals`, {
              method: "POST",
              body: JSON.stringify({
                bid_amount_dzd: Number(fd.get("bid_amount_dzd")),
                delivery_days: Number(fd.get("delivery_days")),
                cover_letter: fd.get("cover_letter")
              })
            });
            closeModal();
            showToast("Proposition transmise avec succès !");
            window.IntalentPages["projects"](main, state);
          } catch (err) {
            showToast(err.message, true);
          }
        });
      });
    });

    main.querySelectorAll(".accept-proposal-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const propId = btn.getAttribute("data-propid");
        try {
          const res = await api(`/api/proposals/${propId}/accept`, { method: "POST", body: "{}" });
          showToast(`Proposition acceptée ! Contrat #${res.order_number} créé.`);
          App().navigate(`order-detail?id=${res.order_id}`);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  };

  // STITCH SCREEN dce06f2ca84e43adb9586b6e43dd8049 — Publier un Projet Client & Entreprise
  window.IntalentPages["post-project"] = async function (main, state) {
    const { escapeHtml, api, showToast } = App();
    const defaultBudget = Number(state.params.budget || 180000);
    let selectedMode = "Freelance Unique";

    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-gutter py-space-xl">
        <div class="mb-space-xl">
          <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold uppercase">Brief Projet &amp; Appel d'Offres Sécurisé</span>
          <h1 class="font-headline-xl text-headline-xl text-on-surface mt-2">Publier un Projet Client &amp; Entreprise</h1>
          <p class="font-body-md text-on-surface-variant">Définissez votre besoin pour recevoir des devis qualifiés sous 2 heures avec protection séquestre SATIM.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <form id="post-project-form" class="lg:col-span-8 bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm space-y-space-lg">
            <!-- Format d'accompagnement selector from Stitch dce06f2ca84e43adb9586b6e43dd8049 -->
            <div>
              <label class="font-title-md text-on-surface font-bold block mb-3">1. Format d'accompagnement souhaité</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button type="button" class="proj-mode-card p-4 rounded-2xl border-2 border-secondary bg-secondary-fixed/20 text-left transition-all" data-mode="Freelance Unique">
                  <span class="material-symbols-outlined text-secondary">person</span>
                  <div class="font-label-lg font-bold text-on-surface mt-1">Freelance Unique</div>
                  <div class="font-label-xs text-on-surface-variant">Expert dédié sur mission précise</div>
                </button>
                <button type="button" class="proj-mode-card p-4 rounded-2xl border-2 border-transparent bg-surface-container-low text-left transition-all" data-mode="Multi-Indépendants">
                  <span class="material-symbols-outlined text-secondary">group</span>
                  <div class="font-label-lg font-bold text-on-surface mt-1">Multi-Indépendants</div>
                  <div class="font-label-xs text-on-surface-variant">2 à 3 profils complémentaires</div>
                </button>
                <button type="button" class="proj-mode-card p-4 rounded-2xl border-2 border-transparent bg-surface-container-low text-left transition-all" data-mode="Squad Clé en Main">
                  <span class="material-symbols-outlined text-secondary">rocket_launch</span>
                  <div class="font-label-lg font-bold text-on-surface mt-1">Squad Clé en Main</div>
                  <div class="font-label-xs text-on-surface-variant">Équipe complète + Chef de projet</div>
                </button>
              </div>
            </div>

            <div>
              <label class="font-label-md text-on-surface font-bold block mb-1.5">2. Titre de la mission</label>
              <input type="text" name="title" id="proj-title-input" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-secondary/30" placeholder="Ex: Refonte Application Mobile E-Commerce Flutter + Passerelle SATIM CIB" required>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div>
                <label class="font-label-md text-on-surface font-bold block mb-1.5">Domaine principal</label>
                <select name="category_id" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-sm outline-none">
                  ${state.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name_fr || c.name)}</option>`).join("")}
                </select>
              </div>
              <div>
                <label class="font-label-md text-on-surface font-bold block mb-1.5">Niveau d'expertise requis</label>
                <select name="experience_level" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-sm outline-none">
                  <option value="Expert">Expert Certifié Intalent Pro</option>
                  <option value="Intermediate">Confirmé (3+ ans)</option>
                  <option value="Entry">Junior / Spécialisé</option>
                </select>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="font-label-md text-on-surface font-bold">3. Cahier des charges &amp; Livrables attendus</label>
                <button type="button" id="ai-write-project-btn" class="px-3.5 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs font-extrabold hover:bg-secondary hover:text-white transition-colors">
                  ✨ Structurer le Brief avec Gemini AI
                </button>
              </div>
              <textarea name="description" id="project-desc-textarea" rows="5" class="w-full p-4 rounded-2xl bg-surface-container-low text-on-surface font-body-md outline-none" placeholder="Précisez le périmètre fonctionnel, la stack technique souhaitée et les critères d'acceptation..." required></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              <div>
                <label class="font-label-md text-on-surface font-bold block mb-1.5">Budget Min (DZD)</label>
                <input type="number" name="budget_min_dzd" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-md" value="${Math.round(defaultBudget * 0.7)}" required>
              </div>
              <div>
                <label class="font-label-md text-on-surface font-bold block mb-1.5">Budget Max (DZD)</label>
                <input type="number" name="budget_max_dzd" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-md" value="${defaultBudget}" required>
              </div>
              <div>
                <label class="font-label-md text-on-surface font-bold block mb-1.5">Délai cible (Jours)</label>
                <input type="number" name="deadline_days" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-md" value="21" required>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div>
                <label class="font-label-md text-on-surface font-bold block mb-1.5">Compétences clés (séparées par virgule)</label>
                <input type="text" name="skills_csv" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-sm" value="Flutter, API SATIM, UI/UX Figma, PostgreSQL">
              </div>
              <div>
                <label class="font-label-md text-on-surface font-bold block mb-1.5">Wilaya ou Télétravail</label>
                <select name="wilaya_pref" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface font-body-sm">
                  <option value="Toutes Wilayas (Télétravail)">Toutes Wilayas (100% Télétravail)</option>
                  ${state.wilayas.slice(0, 25).map(w => `<option value="${w.code} - ${escapeHtml(w.name)}">${w.code} — ${escapeHtml(w.name)}</option>`).join("")}
                </select>
              </div>
            </div>

            <button type="submit" class="w-full py-4 rounded-full bg-tertiary-fixed text-primary-container font-label-lg text-label-lg font-extrabold shadow-[0_12px_28px_-6px_rgba(202,243,0,0.5)] hover:scale-[1.01] transition-all">
              Publier l'Appel d'Offres &amp; Recevoir des Devis →
            </button>
          </form>

          <!-- Live Bento Preview Sidebar -->
          <div class="lg:col-span-4 space-y-space-md lg:sticky lg:top-28">
            <div class="bg-primary-container text-on-primary rounded-[28px] p-space-xl shadow-xl space-y-4">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs font-extrabold">
                GARANTIE ENTREPRISE DZ
              </div>
              <h3 class="font-headline-sm text-white font-bold">Protection Intégrale du Donneur d'Ordre</h3>
              <ul class="space-y-2.5 font-body-sm text-outline-variant">
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-tertiary-fixed text-base">verified</span> <span>Matching instantané avec nos 100 freelances certifiés</span></li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-tertiary-fixed text-base">lock</span> <span>Fonds séquestrés et débloqués uniquement par jalon validé</span></li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-tertiary-fixed text-base">description</span> <span>Facturation fiscale algérienne (NIF, NIS, RC, Auto-entrepreneur)</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    main.querySelectorAll(".proj-mode-card").forEach(card => {
      card.addEventListener("click", () => {
        selectedMode = card.getAttribute("data-mode");
        main.querySelectorAll(".proj-mode-card").forEach(c => {
          c.classList.remove("border-secondary", "bg-secondary-fixed/20");
          c.classList.add("border-transparent", "bg-surface-container-low");
        });
        card.classList.remove("border-transparent", "bg-surface-container-low");
        card.classList.add("border-secondary", "bg-secondary-fixed/20");
      });
    });

    const aiBtn = document.getElementById("ai-write-project-btn");
    if (aiBtn) {
      aiBtn.addEventListener("click", async () => {
        const titleVal = document.getElementById("proj-title-input").value.trim() || "Application Mobile & Paiement SATIM";
        aiBtn.textContent = "✨ Génération Gemini 3.8 Flash...";
        try {
          const res = await api("/api/ai/assist", {
            method: "POST",
            body: JSON.stringify({ mode: "project_brief", prompt: `${selectedMode}: ${titleVal}` })
          });
          document.getElementById("project-desc-textarea").value = res.output_text || "";
          showToast("Cahier des charges généré avec succès !");
        } catch (err) {
          showToast(err.message, true);
        } finally {
          aiBtn.textContent = "✨ Structurer le Brief avec Gemini AI";
        }
      });
    }

    document.getElementById("post-project-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!state.user) {
        showToast("Veuillez vous connecter avec un compte Client ou Entreprise pour publier.", true);
        App().navigate("login");
        return;
      }
      const fd = new FormData(e.target);
      const skills = String(fd.get("skills_csv") || "").split(",").map(s => s.trim()).filter(Boolean);
      try {
        const res = await api("/api/projects", {
          method: "POST",
          body: JSON.stringify({
            title: `[${selectedMode}] ` + fd.get("title"),
            category_id: Number(fd.get("category_id")),
            experience_level: fd.get("experience_level"),
            description: fd.get("description"),
            budget_min_dzd: Number(fd.get("budget_min_dzd")),
            budget_max_dzd: Number(fd.get("budget_max_dzd")),
            deadline_days: Number(fd.get("deadline_days")),
            skills_required: skills,
            wilaya_pref: fd.get("wilaya_pref")
          })
        });
        showToast(`Projet ${res.project_code} publié avec succès !`);
        App().navigate("projects");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  // =========================================================================
  // 10. SIGN IN & CHOIX DE PROFIL — BENTO 3D (STITCH SCREEN d85e277c6c6840379c4b69587d50039e)
  // =========================================================================
  window.IntalentPages["login"] = async function (main, state) {
    const { api, showToast, getDashboardRouteForUser } = App();

    main.innerHTML = `
      <div class="relative w-full min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
        <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] rounded-full bg-tertiary-fixed/15 blur-3xl pointer-events-none"></div>

        <!-- Main Split Container from Stitch d85e277c6c6840379c4b69587d50039e -->
        <div class="relative w-full max-w-6xl bg-surface-container-lowest rounded-[28px] shadow-[0_24px_60px_-15px_rgba(40,12,66,0.12)] overflow-hidden flex flex-col lg:flex-row">
          <!-- LEFT PANEL: Brand Visual Showcase & Bento Steps -->
          <div class="relative lg:w-5/12 bg-primary-container text-on-primary p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-primary-container via-secondary/60 to-primary-container opacity-95"></div>
            <div class="relative z-10 flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <img src="/assets/logos/logo-transparent-white.png" alt="INTALENT" class="h-10 w-auto object-contain">
                <div class="flex items-center gap-1.5 text-tertiary-fixed">
                  <span class="material-symbols-outlined text-sm material-fill">shield</span>
                  <span class="font-label-xs text-label-xs font-bold text-white">SATIM Ready</span>
                </div>
              </div>

              <div class="space-y-3 mt-2">
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-tertiary-fixed font-label-md text-label-md">
                  <span>🚀 Espace Sécurisé</span>
                  <span class="text-on-primary">•</span>
                  <span class="text-white font-normal">Écosystème Tech Algérie</span>
                </span>
                <h1 class="font-headline-lg text-headline-lg font-bold text-on-primary tracking-tight leading-snug">
                  Révélez votre potentiel avec <span class="text-tertiary-fixed">INTALENT</span>.
                </h1>
                <p class="font-body-md text-body-md text-white/80 leading-relaxed">
                  La passerelle d'excellence pour recruter, contracter et percevoir des honoraires en dinars algériens (DZD) sur les 58 Wilayas.
                </p>
              </div>

              <div class="p-3 rounded-2xl bg-surface-container-lowest/10 backdrop-blur-md flex items-center justify-between gap-3 shadow-sm">
                <div class="flex items-center -space-x-2.5">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container" alt="">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" class="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container" alt="">
                  <img src="https://randomuser.me/api/portraits/men/11.jpg" class="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container" alt="">
                  <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-primary-container font-bold text-label-xs flex items-center justify-center shadow-sm">100</div>
                </div>
                <div class="text-right">
                  <p class="font-label-md text-label-md font-bold text-on-primary leading-tight">100 Freelances Actifs</p>
                  <p class="font-label-xs text-label-xs text-white/70">Alger • Oran • Constantine • Sétif</p>
                </div>
              </div>
            </div>

            <!-- Bottom Feature Steps (1, 2, 3) -->
            <div class="relative z-10 grid grid-cols-3 gap-2 pt-8">
              <div class="p-3 rounded-2xl bg-surface-container-lowest text-on-surface shadow-lg flex flex-col justify-between">
                <div class="w-6 h-6 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center font-label-md text-label-md font-bold mb-2">1</div>
                <div>
                  <p class="font-label-xs text-label-xs font-bold leading-tight">Paiement Garanti</p>
                  <p class="font-label-xs text-[9px] text-on-surface-variant mt-0.5">SATIM &amp; Edahabia</p>
                </div>
              </div>
              <div class="p-3 rounded-2xl bg-surface-container-lowest/20 backdrop-blur-md text-on-primary flex flex-col justify-between">
                <div class="w-6 h-6 rounded-full bg-surface-container-lowest/30 text-on-primary flex items-center justify-center font-label-md text-label-md font-bold mb-2">2</div>
                <div>
                  <p class="font-label-xs text-label-xs font-bold leading-tight">Talents Certifiés</p>
                  <p class="font-label-xs text-[9px] text-white/80 mt-0.5">Profils validés</p>
                </div>
              </div>
              <div class="p-3 rounded-2xl bg-surface-container-lowest/20 backdrop-blur-md text-on-primary flex flex-col justify-between">
                <div class="w-6 h-6 rounded-full bg-surface-container-lowest/30 text-on-primary flex items-center justify-center font-label-md text-label-md font-bold mb-2">3</div>
                <div>
                  <p class="font-label-xs text-label-xs font-bold leading-tight">Contrats ANA</p>
                  <p class="font-label-xs text-[9px] text-white/80 mt-0.5">100% Légaux</p>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL: Sign In Form & 3 Account Types Selector -->
          <div class="lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-surface-container-lowest">
            <div>
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-secondary"></span>
                  <span class="font-label-md text-label-md font-bold text-on-surface-variant tracking-widest uppercase">Connexion Sécurisée</span>
                </div>
                <button type="button" onclick="window.IntalentApp.navigate('register')" class="font-label-md text-label-md text-secondary hover:text-primary-container font-bold transition-colors flex items-center gap-1">
                  <span>Créer un compte →</span>
                </button>
              </div>

              <div class="space-y-1.5 mb-6">
                <h2 class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Bon retour parmi nous
                </h2>
                <p class="font-body-md text-body-md text-on-surface-variant">
                  Sélectionnez votre profil d'activité (1-clic pré-rempli avec données réelles) pour ouvrir votre tableau de bord :
                </p>
              </div>

              <!-- THE 3 ACCOUNT TYPES SELECTOR (Stitch d85e277c6c6840379c4b69587d50039e) -->
              <div class="mb-6">
                <label class="block font-label-md text-label-md font-bold text-on-surface mb-2">
                  Type de compte <span class="text-error">*</span>
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" id="roleSelector">
                  <button type="button" class="role-btn text-left p-3.5 rounded-2xl bg-surface-container-low text-on-surface transition-all flex flex-col justify-between shadow-sm ring-2 ring-secondary" data-email="amine@intalent.dz" data-pass="Password123!">
                    <div class="flex items-center justify-between w-full mb-2">
                      <div class="w-8 h-8 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                        <span class="material-symbols-outlined text-sm">terminal</span>
                      </div>
                      <span class="role-check w-4 h-4 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center text-[10px]">✓</span>
                    </div>
                    <div>
                      <h3 class="font-title-md text-sm font-bold text-on-surface">Freelance Pro</h3>
                      <p class="font-label-xs text-[11px] text-on-surface-variant mt-0.5">amine@intalent.dz</p>
                    </div>
                  </button>

                  <button type="button" class="role-btn text-left p-3.5 rounded-2xl bg-surface-container-lowest text-on-surface transition-all flex flex-col justify-between shadow-sm hover:bg-surface-container-low" data-email="business@intalent.dz" data-pass="Password123!">
                    <div class="flex items-center justify-between w-full mb-2">
                      <div class="w-8 h-8 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm">business_center</span>
                      </div>
                      <span class="role-check hidden w-4 h-4 rounded-full bg-primary-container text-tertiary-fixed items-center justify-center text-[10px]">✓</span>
                    </div>
                    <div>
                      <h3 class="font-title-md text-sm font-bold text-on-surface">Entreprise / Client</h3>
                      <p class="font-label-xs text-[11px] text-on-surface-variant mt-0.5">business@intalent.dz</p>
                    </div>
                  </button>

                  <button type="button" class="role-btn text-left p-3.5 rounded-2xl bg-surface-container-lowest text-on-surface transition-all flex flex-col justify-between shadow-sm hover:bg-surface-container-low" data-email="admin@intalent.dz" data-pass="AdminPassword123!">
                    <div class="flex items-center justify-between w-full mb-2">
                      <div class="w-8 h-8 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm">verified_user</span>
                      </div>
                      <span class="role-check hidden w-4 h-4 rounded-full bg-primary-container text-tertiary-fixed items-center justify-center text-[10px]">✓</span>
                    </div>
                    <div>
                      <h3 class="font-title-md text-sm font-bold text-on-surface">Admin / KYC Interne</h3>
                      <p class="font-label-xs text-[11px] text-on-surface-variant mt-0.5">admin@intalent.dz</p>
                    </div>
                  </button>
                </div>

                <!-- Extra Quick Demo Pills -->
                <div class="flex flex-wrap items-center gap-2 mt-3">
                  <span class="font-label-xs text-on-surface-variant">Autres comptes pré-remplis :</span>
                  <button type="button" class="quick-demo-pill px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-tertiary-fixed text-on-surface font-label-xs font-bold" data-email="yacine@intalent.dz" data-pass="Password123!">Yacine Benali (Freelance Star)</button>
                  <button type="button" class="quick-demo-pill px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-tertiary-fixed text-on-surface font-label-xs font-bold" data-email="client@intalent.dz" data-pass="Password123!">Selma Mansouri (Espace Client)</button>
                </div>
              </div>

              <!-- Main Input Form -->
              <form id="login-form" class="space-y-4">
                <div class="space-y-1.5">
                  <label class="block font-label-md text-label-md font-bold text-on-surface">Adresse e-mail professionnelle</label>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg">alternate_email</span>
                    <input class="w-full pl-10 pr-10 py-3 rounded-2xl bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:outline-none shadow-inner" id="login-email" name="email" type="text" value="amine@intalent.dz" required>
                    <span class="material-symbols-outlined absolute right-3.5 text-secondary text-lg">check_circle</span>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label class="block font-label-md text-label-md font-bold text-on-surface">Mot de passe</label>
                    <a onclick="window.IntalentApp.navigate('forgot-password')" class="cursor-pointer font-label-xs text-label-xs text-secondary hover:underline font-semibold">Mot de passe oublié ?</a>
                  </div>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg">lock</span>
                    <input class="w-full pl-10 pr-10 py-3 rounded-2xl bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:outline-none shadow-inner" id="login-password" name="password" type="password" value="Password123!" required>
                  </div>
                </div>

                <div class="pt-2">
                  <button class="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-secondary text-on-primary font-title-md text-title-md font-bold shadow-lg transition-all flex items-center justify-center gap-3 group" type="submit">
                    <span>Se connecter à mon Espace</span>
                    <div class="w-6 h-6 rounded-full bg-tertiary-fixed text-primary-container flex items-center justify-center transition-transform group-hover:translate-x-1">
                      <span class="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>

            <div class="pt-6 mt-6 flex flex-col gap-3">
              <div class="p-2.5 rounded-xl bg-surface-container flex items-center justify-center gap-4 text-on-surface-variant text-center flex-wrap">
                <span class="flex items-center gap-1 font-label-xs text-label-xs"><span class="material-symbols-outlined text-xs text-secondary">verified</span> Chiffrement 256-bit</span>
                <span>•</span>
                <span class="flex items-center gap-1 font-label-xs text-label-xs"><span class="material-symbols-outlined text-xs text-secondary">account_balance</span> GIE Monétique &amp; SATIM</span>
                <span>•</span>
                <span class="flex items-center gap-1 font-label-xs text-label-xs"><span class="material-symbols-outlined text-xs text-secondary">domain</span> Serveurs Certifiés Algérie</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    main.querySelectorAll(".role-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        main.querySelectorAll(".role-btn").forEach(b => {
          b.classList.remove("bg-surface-container-low", "ring-2", "ring-secondary");
          b.classList.add("bg-surface-container-lowest");
          b.querySelector(".role-check")?.classList.add("hidden");
        });
        btn.classList.remove("bg-surface-container-lowest");
        btn.classList.add("bg-surface-container-low", "ring-2", "ring-secondary");
        btn.querySelector(".role-check")?.classList.remove("hidden");
        document.getElementById("login-email").value = btn.getAttribute("data-email");
        document.getElementById("login-password").value = btn.getAttribute("data-pass");
      });
    });

    main.querySelectorAll(".quick-demo-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.getElementById("login-email").value = pill.getAttribute("data-email");
        document.getElementById("login-password").value = pill.getAttribute("data-pass");
      });
    });

    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") })
        });
        localStorage.setItem("intalent_token", res.token);
        await App().refreshBootstrap();
        showToast(`Bienvenue sur votre espace, ${res.user.full_name} !`);
        App().navigate(getDashboardRouteForUser());
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  window.IntalentPages["register"] = async function (main, state) {
    const { escapeHtml, api, showToast, getDashboardRouteForUser } = App();
    let selectedRole = "freelancer";

    main.innerHTML = `
      <div class="max-w-3xl mx-auto px-gutter py-space-xl">
        <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-xl space-y-6">
          <div class="text-center space-y-2">
            <img src="/assets/logos/logo-dark.png" alt="INTALENT" class="h-10 mx-auto object-contain">
            <h1 class="font-headline-lg text-on-surface font-extrabold">Créer votre compte INTALENT Algérie</h1>
            <p class="font-body-sm text-on-surface-variant">Choisissez votre profil principal pour activer votre portefeuille séquestre DZD.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button type="button" class="reg-role-card p-4 rounded-2xl border-2 border-secondary bg-secondary-fixed/20 text-left" data-role="freelancer">
              <div class="font-title-md text-on-surface font-bold">Freelance</div>
              <div class="font-body-sm text-xs text-on-surface-variant">Vendre mes services en DZD</div>
            </button>
            <button type="button" class="reg-role-card p-4 rounded-2xl border-2 border-transparent bg-surface-container-low text-left" data-role="client">
              <div class="font-title-md text-on-surface font-bold">Client</div>
              <div class="font-body-sm text-xs text-on-surface-variant">Commander des prestations</div>
            </button>
            <button type="button" class="reg-role-card p-4 rounded-2xl border-2 border-transparent bg-surface-container-low text-left" data-role="business">
              <div class="font-title-md text-on-surface font-bold">Entreprise B2B</div>
              <div class="font-body-sm text-xs text-on-surface-variant">Squads &amp; Facturation NIF</div>
            </button>
          </div>

          <form id="register-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="full_name" class="h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Nom &amp; Prénom complet" required>
              <input type="text" name="username" class="h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Nom d'utilisateur (@pseudo)" required>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="email" name="email" class="h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Email professionnel" required>
              <select name="wilaya" class="h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface">
                ${state.wilayas.slice(0, 30).map(w => `<option value="${escapeHtml(w.name)} (${w.code})">${w.code} — ${escapeHtml(w.name)}</option>`).join("")}
              </select>
            </div>
            <input type="text" name="headline" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Titre professionnel ou Raison sociale (ex: Ingénieur Fullstack Next.js)" required>
            <input type="password" name="password" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Mot de passe sécurisé (min 6 caractères)" required>
            <button type="submit" class="w-full py-4 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-extrabold shadow-lg">
              Créer mon compte maintenant →
            </button>
          </form>
        </div>
      </div>
    `;

    main.querySelectorAll(".reg-role-card").forEach(c => {
      c.addEventListener("click", () => {
        selectedRole = c.getAttribute("data-role");
        main.querySelectorAll(".reg-role-card").forEach(x => {
          x.classList.remove("border-secondary", "bg-secondary-fixed/20");
          x.classList.add("border-transparent", "bg-surface-container-low");
        });
        c.classList.remove("border-transparent", "bg-surface-container-low");
        c.classList.add("border-secondary", "bg-secondary-fixed/20");
      });
    });

    document.getElementById("register-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            full_name: fd.get("full_name"),
            username: fd.get("username"),
            email: fd.get("email"),
            wilaya: fd.get("wilaya"),
            headline: fd.get("headline"),
            password: fd.get("password"),
            role: selectedRole
          })
        });
        localStorage.setItem("intalent_token", res.token);
        await App().refreshBootstrap();
        showToast("Compte créé avec succès !");
        App().navigate(getDashboardRouteForUser());
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  window.IntalentPages["forgot-password"] = async function (main) {
    const { api, showToast } = App();
    main.innerHTML = `
      <div class="max-w-md mx-auto px-gutter py-space-xl">
        <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-md space-y-4">
          <h2 class="font-headline-sm text-on-surface font-bold">Réinitialiser votre mot de passe</h2>
          <p class="font-body-sm text-on-surface-variant">Saisissez votre adresse e-mail pour recevoir un lien sécurisé.</p>
          <form id="forgot-form" class="space-y-3">
            <input type="email" name="email" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="vous@intalent.dz" required>
            <button type="submit" class="w-full py-3.5 rounded-full bg-primary-container text-tertiary-fixed font-label-lg font-bold">Envoyer le lien</button>
          </form>
        </div>
      </div>
    `;
    document.getElementById("forgot-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: fd.get("email") }) });
      showToast(res.message);
    });
  };

  // =========================================================================
  // 11. INTALENT PRO v3.0 — 3 SUBSCRIPTION TIERS (STITCH SCREEN 3589971871ea445fbbf0f0766d62d984)
  // =========================================================================
  window.IntalentPages["pro-upgrade"] = async function (main, state) {
    const { api, showToast } = App();

    main.innerHTML = `
      <div class="relative w-full overflow-hidden">
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-secondary-fixed/35 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        <!-- 1. HERO SECTION -->
        <section class="max-w-7xl mx-auto px-gutter pt-space-xl pb-space-xl w-full">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            <div class="lg:col-span-7 flex flex-col gap-space-md">
              <div class="flex items-center gap-space-xs flex-wrap">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold uppercase tracking-wider shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>Programme Accélérateur Freelance DZ</span>
                </span>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary-container font-label-md text-label-md font-extrabold uppercase tracking-wider">
                  Intalent Pro v3.0
                </span>
              </div>
              <h1 class="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight">
                Multipliez vos opportunités clients et dominez votre marché avec <span class="text-secondary">INTALENT Pro</span>
              </h1>
              <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Gagnez en autorité immédiate auprès des entreprises et scale-ups algériennes. Badge vérifié officiel KYC, mise en avant prioritaire sur le moteur d’exploration et campagnes sponsorisées dédiées à votre expertise.
              </p>
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm pt-space-sm">
                <a href="#plans-pricing" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-label-lg text-label-lg font-bold bg-tertiary-fixed text-primary-container shadow-lg hover:scale-[1.02] transition-all">
                  <span>Découvrir les 3 offres Pro</span>
                  <span class="material-symbols-outlined text-[20px]">arrow_downward</span>
                </a>
                <button type="button" onclick="window.IntalentApp.navigate('pro-talent')" class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-label-lg text-label-lg font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all">
                  <span class="material-symbols-outlined text-[20px] text-secondary">workspace_premium</span>
                  <span>Voir l'annuaire des membres Pro</span>
                </button>
              </div>
            </div>

            <!-- Right Column: 3D Layered Bento Mockup Preview -->
            <div class="lg:col-span-5 relative">
              <div class="relative bg-surface-container-lowest rounded-3xl p-space-lg shadow-xl">
                <div class="flex items-center justify-between pb-space-sm">
                  <div class="flex items-center gap-space-xs">
                    <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span class="font-label-xs text-label-xs font-bold text-on-surface uppercase tracking-wider">Top Profil de la Semaine</span>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-extrabold uppercase">Alger (16)</span>
                </div>
                <div class="flex items-center gap-space-md pt-space-xs">
                  <div class="relative">
                    <img class="w-16 h-16 rounded-2xl object-cover shadow-md" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Yacine Benali">
                    <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tertiary-fixed text-primary-container flex items-center justify-center font-bold text-xs shadow-sm">✓</span>
                  </div>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1.5">
                      <span class="font-headline-sm text-headline-sm font-bold text-on-surface">Yacine Benali</span>
                      <span class="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-xs text-label-xs font-bold">PRO VÉRIFIÉ</span>
                    </div>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Lead Fullstack Flutter &amp; React • 7 ans exp.</span>
                    <span class="font-label-xs text-label-xs font-semibold text-secondary-container mt-0.5">Statut Auto-entrepreneur ANA Validé</span>
                  </div>
                </div>
                <div class="mt-space-md p-space-sm rounded-2xl bg-surface-container-low flex items-center justify-between">
                  <div>
                    <span class="font-label-xs text-label-xs text-on-surface-variant block">TJM Référent</span>
                    <span class="font-title-md text-title-md font-extrabold text-on-surface">42,000 DA <span class="font-body-sm text-body-sm font-normal text-on-surface-variant">/ jour</span></span>
                  </div>
                  <div class="text-right">
                    <span class="font-label-xs text-label-xs text-on-surface-variant block">Leads générés</span>
                    <span class="font-title-md text-title-md font-bold text-emerald-600">+340% / mois</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. SUBSCRIPTION PLANS & PRICING (2,500 DA / 7,000 DA / 10,000 DA) -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl w-full" id="plans-pricing">
          <div class="text-center max-w-2xl mx-auto mb-space-xl">
            <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary-container font-label-md text-label-md font-bold uppercase tracking-wider inline-block mb-space-xs">
              Tarification Transparente DZD
            </span>
            <h2 class="font-headline-xl text-headline-xl font-extrabold text-on-surface tracking-tight">
              Investissez dans votre succès
            </h2>
            <p class="font-body-md text-body-md text-on-surface-variant mt-2">
              Facturation claire en Dinars Algériens (DZD) via carte Edahabia ou CIB. Aucun frais caché.
            </p>
            <div class="mt-space-md inline-flex items-center bg-surface-container-high p-1.5 rounded-full shadow-inner">
              <button type="button" id="btn-monthly" class="px-5 py-2 rounded-full font-label-md text-label-md font-bold bg-surface-container-lowest text-on-surface shadow-sm transition-all">
                Facturation Mensuelle
              </button>
              <button type="button" id="btn-quarterly" class="px-5 py-2 rounded-full font-label-md text-label-md font-semibold text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1.5">
                <span>Trimestriel</span>
                <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold uppercase">-15%</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
            <!-- PLAN 1: VISIBILITÉ (2,500 DA) -->
            <div class="bg-surface-container-lowest rounded-3xl p-space-xl shadow-md flex flex-col justify-between transition-all hover:shadow-xl">
              <div>
                <div class="flex items-center justify-between mb-space-sm">
                  <span class="font-headline-sm text-headline-sm font-extrabold text-on-surface">Visibilité</span>
                  <span class="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs font-bold uppercase">Starter</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  Idéal pour les freelances souhaitant asseoir leur crédibilité et obtenir le badge vérifié officiel.
                </p>
                <div class="py-space-sm mb-space-md">
                  <div class="flex items-baseline gap-1">
                    <span class="font-display-lg text-headline-xl font-extrabold text-on-surface" id="price-visibilite">2,500</span>
                    <span class="font-title-md text-title-md font-bold text-on-surface">DA</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant" id="cycle-visibilite">/ mois</span>
                  </div>
                </div>
                <div class="space-y-2.5">
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span><span class="font-body-sm">Adhésion certifiée au réseau INTALENT Pro</span></div>
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span><span class="font-body-sm">Badge profil vérifié (validation CNI + ANA)</span></div>
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span><span class="font-body-sm">Présentation améliorée du portfolio</span></div>
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span><span class="font-body-sm">Boost de visibilité standard dans la recherche</span></div>
                </div>
              </div>
              <div class="pt-space-lg">
                <button type="button" class="select-pro-plan-btn w-full py-3.5 rounded-full font-label-lg text-label-lg font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all shadow-sm" data-plan="Visibilité" data-price="2,500 DA">
                  Choisir Visibilité (2,500 DA)
                </button>
              </div>
            </div>

            <!-- PLAN 2: VISIBILITÉ PLUS (7,000 DA — RECOMMANDÉ) -->
            <div class="relative bg-surface-container-lowest rounded-3xl p-space-xl shadow-2xl flex flex-col justify-between -mt-2 lg:-mt-4 border-2 border-secondary">
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span class="px-4 py-1.5 rounded-full bg-secondary text-on-secondary font-label-xs text-label-xs font-extrabold tracking-wide uppercase shadow-md flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-tertiary-fixed">star</span>
                  <span>Formule Recommandée</span>
                </span>
              </div>
              <div>
                <div class="flex items-center justify-between mb-space-sm pt-2">
                  <span class="font-headline-sm text-headline-sm font-extrabold text-on-surface">Visibilité Plus</span>
                  <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-extrabold uppercase">Top Croissance</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  Pour les prestataires visant un flux constant de missions qualifiées et un accompagnement garanti.
                </p>
                <div class="py-space-sm mb-space-md">
                  <div class="flex items-baseline gap-1">
                    <span class="font-display-lg text-display-lg font-extrabold text-secondary" id="price-plus">7,000</span>
                    <span class="font-title-md text-title-md font-bold text-on-surface">DA</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant" id="cycle-plus">/ mois</span>
                  </div>
                </div>
                <div class="space-y-2.5">
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-secondary">check_circle</span><span class="font-body-sm font-bold">Encart vedette rotatif sur l'accueil Intalent.dz</span></div>
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-secondary">check_circle</span><span class="font-body-sm">Présence prioritaire absolue dans l'explorateur Wilayas</span></div>
                  <div class="flex items-start gap-2.5 bg-secondary-fixed/30 p-2.5 rounded-xl">
                    <span class="material-symbols-outlined text-[20px] text-secondary">verified</span>
                    <div>
                      <span class="font-label-xs font-extrabold text-on-secondary-fixed uppercase block">Garantie Contractuelle :</span>
                      <span class="font-body-sm font-semibold text-on-surface">Contact direct avec jusqu'à 3 clients ciblés sous 30 jours</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pt-space-lg">
                <button type="button" class="select-pro-plan-btn w-full py-4 rounded-full font-label-lg text-label-lg font-extrabold bg-tertiary-fixed text-primary-container shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2" data-plan="Visibilité Plus" data-price="7,000 DA">
                  <span>Choisir Visibilité Plus (7,000 DA)</span>
                  <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <!-- PLAN 3: GROWTH PARTNER (10,000 DA) -->
            <div class="bg-surface-container-lowest rounded-3xl p-space-xl shadow-md flex flex-col justify-between transition-all hover:shadow-xl">
              <div>
                <div class="flex items-center justify-between mb-space-sm">
                  <span class="font-headline-sm text-headline-sm font-extrabold text-on-surface">Growth</span>
                  <span class="px-3 py-1 rounded-full bg-primary-container text-tertiary-fixed font-label-xs text-label-xs font-bold uppercase">Agence &amp; Élite</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  Pour les ingénieurs seniors et collectifs cherchant une véritable force de frappe publicitaire externe.
                </p>
                <div class="py-space-sm mb-space-md">
                  <div class="flex items-baseline gap-1">
                    <span class="font-display-lg text-headline-xl font-extrabold text-on-surface" id="price-growth">10,000</span>
                    <span class="font-title-md text-title-md font-bold text-on-surface">DA</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant" id="cycle-growth">/ mois</span>
                  </div>
                </div>
                <div class="space-y-2.5">
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-primary-container">check_circle</span><span class="font-body-sm font-bold">Campagnes LinkedIn Ads &amp; Meta DZ dédiées</span></div>
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-primary-container">check_circle</span><span class="font-body-sm">Diffusion dans la newsletter B2B (12,000 décideurs)</span></div>
                  <div class="flex items-start gap-2.5"><span class="material-symbols-outlined text-[20px] text-primary-container">check_circle</span><span class="font-body-sm">Account Manager Intalent dédié + Relecture devis</span></div>
                </div>
              </div>
              <div class="pt-space-lg">
                <button type="button" class="select-pro-plan-btn w-full py-3.5 rounded-full font-label-lg text-label-lg font-bold bg-primary-container text-on-primary hover:bg-secondary transition-all shadow-md" data-plan="Growth Partner" data-price="10,000 DA">
                  Activer le Pack Growth (10,000 DA)
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. INTERACTIVE SATIM SUBSCRIPTION CHECKOUT CARD -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl w-full" id="pro-checkout-section">
          <div class="bg-surface-container-high rounded-3xl p-space-lg sm:p-space-xl shadow-md">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
              <div class="lg:col-span-6 space-y-3">
                <span class="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold uppercase tracking-wider inline-block">
                  Paiement 100% Local Sécurisé
                </span>
                <h3 class="font-headline-lg text-headline-lg font-extrabold text-on-surface">
                  Souscription instantanée via Edahabia ou CIB
                </h3>
                <p class="font-body-md text-on-surface-variant">
                  Effectuez votre règlement directement avec vos cartes bancaires algériennes. Votre badge Pro et votre dossier KYC sont soumis immédiatement après validation.
                </p>
              </div>

              <div class="lg:col-span-6 bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl space-y-4">
                <div class="flex items-center justify-between">
                  <span class="font-title-md font-bold text-on-surface">Récapitulatif d'Abonnement</span>
                  <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs font-extrabold uppercase" id="checkout-plan-tag">Visibilité Plus</span>
                </div>
                <div class="space-y-2 font-body-sm">
                  <div class="flex justify-between"><span>Formule choisie</span><strong id="checkout-plan-name">Intalent Pro — Visibilité Plus</strong></div>
                  <div class="flex justify-between"><span>Frais d'audit KYC &amp; CNI</span><strong class="text-emerald-600">Offerts (0 DA)</strong></div>
                  <div class="flex justify-between pt-2 border-t border-surface-container-high font-headline-sm font-extrabold">
                    <span>Montant à régler</span>
                    <span class="text-secondary" id="checkout-total">7,000 DA</span>
                  </div>
                </div>
                <button type="button" id="btn-pay-pro-trigger" class="w-full py-4 rounded-full font-label-lg font-extrabold bg-tertiary-fixed text-primary-container shadow-md hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[20px]">lock</span>
                  <span id="pay-btn-label">Confirmer &amp; Activer mon Abonnement Pro</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    // Wire Monthly / Quarterly Toggle
    const btnM = document.getElementById("btn-monthly");
    const btnQ = document.getElementById("btn-quarterly");
    if (btnM && btnQ) {
      btnM.addEventListener("click", () => {
        document.getElementById("price-visibilite").textContent = "2,500";
        document.getElementById("price-plus").textContent = "7,000";
        document.getElementById("price-growth").textContent = "10,000";
        btnM.className = "px-5 py-2 rounded-full font-label-md text-label-md font-bold bg-surface-container-lowest text-on-surface shadow-sm transition-all";
        btnQ.className = "px-5 py-2 rounded-full font-label-md text-label-md font-semibold text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1.5";
      });
      btnQ.addEventListener("click", () => {
        document.getElementById("price-visibilite").textContent = "2,125";
        document.getElementById("price-plus").textContent = "5,950";
        document.getElementById("price-growth").textContent = "8,500";
        btnQ.className = "px-5 py-2 rounded-full font-label-md text-label-md font-bold bg-surface-container-lowest text-on-surface shadow-sm transition-all flex items-center gap-1.5";
        btnM.className = "px-5 py-2 rounded-full font-label-md text-label-md font-semibold text-on-surface-variant hover:text-on-surface transition-all";
      });
    }

    main.querySelectorAll(".select-pro-plan-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const plan = btn.getAttribute("data-plan");
        const price = btn.getAttribute("data-price");
        document.getElementById("checkout-plan-tag").textContent = plan;
        document.getElementById("checkout-plan-name").textContent = "Intalent Pro — " + plan;
        document.getElementById("checkout-total").textContent = price;
        document.getElementById("pro-checkout-section").scrollIntoView({ behavior: "smooth" });
      });
    });

    const payBtn = document.getElementById("btn-pay-pro-trigger");
    if (payBtn) {
      payBtn.addEventListener("click", async () => {
        const plan = document.getElementById("checkout-plan-tag").textContent;
        if (state.user) {
          try {
            await api("/api/pro-apply", {
              method: "POST",
              body: JSON.stringify({
                specialty: `Abonnement ${plan}`,
                years_experience: 5,
                portfolio_links: "https://intalent.dz",
                motivation: `Souscription directe au plan ${plan} via SATIM.`
              })
            });
          } catch (_) {}
        }
        showToast(`Souscription à l'offre Intalent Pro (${plan}) validée via SATIM Sandbox !`);
      });
    }
  };

  // =========================================================================
  // 12. INTALENT BUSINESS B2B — SQUADS DÉDIÉES (STITCH SCREEN d8a4c2b6e5874dad855525f1fa4ed482)
  // =========================================================================
  window.IntalentPages["business-solutions"] = async function (main) {
    const { showToast } = App();

    main.innerHTML = `
      <div class="relative w-full overflow-hidden">
        <!-- 1. HERO SECTION -->
        <section class="max-w-7xl mx-auto px-gutter pt-10 pb-20">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 flex flex-col gap-6">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-container text-tertiary-fixed font-label-md text-label-md font-bold tracking-wide shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
                  <span>INTALENT BUSINESS B2B</span>
                </span>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-secondary font-label-md text-label-md font-semibold">
                  <span class="material-symbols-outlined text-sm">hub</span>
                  <span>Accélérateur de Projets &amp; Équipes Dédiées en Algérie</span>
                </span>
              </div>
              <h1 class="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface font-extrabold tracking-tight">
                Les bons talents.<br>
                <span class="text-secondary">La bonne équipe.</span><br>
                Pour chaque projet.
              </h1>
              <p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Dites-nous vos objectifs, vos délais et vos besoins. INTALENT identifie les meilleurs spécialistes d'élite, compose votre squad sur-mesure et sécurise vos livrables sans aucune lourdeur de recrutement permanent.
              </p>
              <div class="flex flex-wrap items-center gap-4 pt-2">
                <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-label-lg font-bold shadow-[0_16px_32px_-8px_rgba(202,243,0,0.5)] hover:scale-105 transition-all">
                  <span>Composer mon équipe</span>
                  <span class="w-7 h-7 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center">
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>
                <button type="button" onclick="window.IntalentApp.navigate('business-dashboard')" class="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg font-semibold shadow-md hover:bg-surface-container-high transition-all">
                  <span class="material-symbols-outlined text-secondary text-lg">dashboard</span>
                  <span>Ouvrir le Cockpit Entreprise B2B</span>
                </button>
              </div>
            </div>

            <!-- Hero Right Column: Bento Squad Showcase Card (Squad FinTech E-Pay) -->
            <div class="lg:col-span-5 relative">
              <div class="relative bg-surface-container-lowest rounded-[28px] p-6 lg:p-7 shadow-[0_24px_48px_-12px_rgba(37,8,63,0.08)]">
                <div class="flex items-center justify-between pb-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-primary-container text-tertiary-fixed flex items-center justify-center font-bold">SQ</div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-title-md text-title-md font-bold text-on-surface">Squad FinTech E-Pay</h3>
                        <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed font-label-xs text-label-xs font-bold uppercase">Active</span>
                      </div>
                      <p class="font-body-sm text-body-sm text-on-surface-variant">4 experts assemblés en 48 heures</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-secondary font-label-xs text-label-xs font-bold">Sprint #3</span>
                </div>

                <div class="flex flex-col gap-3 py-2">
                  <div onclick="window.IntalentApp.navigate('freelancer?username=yacine_benali')" class="cursor-pointer flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div class="flex items-center gap-3">
                      <img class="w-11 h-11 rounded-xl object-cover shadow-sm" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Yacine B.">
                      <div>
                        <h4 class="font-label-lg text-label-lg font-bold text-on-surface">Yacine B.</h4>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Lead Fullstack &amp; IA • Alger</p>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-secondary font-label-xs text-label-xs font-bold">Next.js &amp; SATIM</span>
                  </div>
                  <div onclick="window.IntalentApp.navigate('freelancers')" class="cursor-pointer flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div class="flex items-center gap-3">
                      <img class="w-11 h-11 rounded-xl object-cover shadow-sm" src="https://randomuser.me/api/portraits/women/44.jpg" alt="Amira K.">
                      <div>
                        <h4 class="font-label-lg text-label-lg font-bold text-on-surface">Amira K.</h4>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">UI/UX &amp; Design System • Oran</p>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-secondary font-label-xs text-label-xs font-bold">Figma / Mobile</span>
                  </div>
                  <div onclick="window.IntalentApp.navigate('freelancers')" class="cursor-pointer flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div class="flex items-center gap-3">
                      <img class="w-11 h-11 rounded-xl object-cover shadow-sm" src="https://randomuser.me/api/portraits/men/46.jpg" alt="Walid K.">
                      <div>
                        <h4 class="font-label-lg text-label-lg font-bold text-on-surface">Walid K.</h4>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">DevOps &amp; Cloud • Constantine</p>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-secondary font-label-xs text-label-xs font-bold">Kubernetes DZ</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-4">
                  <div class="p-3.5 rounded-2xl bg-surface-container-high flex flex-col">
                    <span class="font-headline-md text-headline-md font-extrabold text-secondary">+240%</span>
                    <span class="font-label-xs text-label-xs text-on-surface-variant font-medium">Vélocité d'exécution projet</span>
                  </div>
                  <div class="p-3.5 rounded-2xl bg-tertiary-fixed/30 flex flex-col">
                    <span class="font-headline-md text-headline-md font-extrabold text-on-surface">0 DZD</span>
                    <span class="font-label-xs text-label-xs text-on-surface-variant font-medium">Frais fixes RH ou d'embauche</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. READY-TO-DEPLOY B2B SQUADS -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl">
          <div class="mb-space-lg">
            <span class="font-label-md text-secondary font-bold uppercase">Escouades Pré-configurées</span>
            <h2 class="font-headline-xl text-on-surface font-extrabold mt-1">Déployez une Squad B2B en 48 heures</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm flex flex-col justify-between">
              <div>
                <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs font-bold uppercase">Acquisition &amp; ROI</span>
                <h3 class="font-headline-sm text-on-surface font-bold mt-3">Squad Marketing &amp; Growth DZ</h3>
                <p class="font-body-sm text-on-surface-variant mt-2">1 Growth Manager + 1 Media Buyer Meta/TikTok + 1 Designer Créatif pour accélérer vos ventes e-commerce.</p>
              </div>
              <button type="button" onclick="window.IntalentApp.navigate('post-project?budget=320000')" class="mt-6 w-full py-3 rounded-full bg-tertiary-fixed text-primary-container font-label-md font-extrabold">Réserver cette Squad →</button>
            </div>
            <div class="bg-primary-container text-on-primary rounded-[28px] p-space-xl shadow-xl flex flex-col justify-between">
              <div>
                <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs font-extrabold uppercase">Produit &amp; Ingénierie</span>
                <h3 class="font-headline-sm text-white font-bold mt-3">Squad Produit Web, Mobile &amp; SATIM</h3>
                <p class="font-body-sm text-outline-variant mt-2">1 Lead Fullstack + 1 Ingénieur Mobile Flutter + 1 Product Designer Figma pour livrer votre MVP bancaire ou SaaS.</p>
              </div>
              <button type="button" onclick="window.IntalentApp.navigate('post-project?budget=650000')" class="mt-6 w-full py-3 rounded-full bg-tertiary-fixed text-primary-container font-label-md font-extrabold">Réserver cette Squad →</button>
            </div>
            <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm flex flex-col justify-between">
              <div>
                <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs font-bold uppercase">TikTok &amp; Reels Derja</span>
                <h3 class="font-headline-sm text-on-surface font-bold mt-3">Squad Contenu &amp; UGC Algérie</h3>
                <p class="font-body-sm text-on-surface-variant mt-2">3 Créateurs UGC algériens + 1 Monteur Motion Design pour produire 20 vidéos courtes par mois.</p>
              </div>
              <button type="button" onclick="window.IntalentApp.navigate('post-project?budget=240000')" class="mt-6 w-full py-3 rounded-full bg-tertiary-fixed text-primary-container font-label-md font-extrabold">Réserver cette Squad →</button>
            </div>
          </div>
        </section>
      </div>
    `;
  };

  // =========================================================================
  // 13. INFORMATIONAL & LEGAL PAGES (BENTO 3D)
  // =========================================================================
  window.IntalentPages["how-it-works"] = async function (main) {
    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-gutter py-space-xl space-y-space-xl">
        <div class="text-center max-w-2xl mx-auto">
          <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs font-extrabold uppercase">Guide de la Plateforme</span>
          <h1 class="font-headline-xl text-on-surface mt-2">Comment fonctionne INTALENT Algérie ?</h1>
          <p class="font-body-md text-on-surface-variant mt-2">Un protocole simple en 3 étapes qui protège à 100% le client et le freelance grâce au séquestre SATIM.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm">
            <div class="w-12 h-12 rounded-2xl bg-secondary-fixed text-secondary font-headline-sm font-extrabold flex items-center justify-center mb-4">01</div>
            <h3 class="font-headline-sm text-on-surface font-bold">Sélection ou Appel d'Offres</h3>
            <p class="font-body-sm text-on-surface-variant mt-2">Choisissez un pack de service parmi nos 100 freelances vérifiés ou publiez gratuitement votre besoin sur-mesure.</p>
          </div>
          <div class="bg-primary-container text-white rounded-[28px] p-space-xl shadow-xl">
            <div class="w-12 h-12 rounded-2xl bg-tertiary-fixed text-primary-container font-headline-sm font-extrabold flex items-center justify-center mb-4">02</div>
            <h3 class="font-headline-sm text-white font-bold">Dépôt Séquestre DZD</h3>
            <p class="font-body-sm text-outline-variant mt-2">Le montant est consigné par carte CIB, Edahabia ou virement bancaire. Le freelance démarre la mission en toute confiance.</p>
          </div>
          <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm">
            <div class="w-12 h-12 rounded-2xl bg-tertiary-fixed text-primary-container font-headline-sm font-extrabold flex items-center justify-center mb-4">03</div>
            <h3 class="font-headline-sm text-on-surface font-bold">Validation &amp; Virement</h3>
            <p class="font-body-sm text-on-surface-variant mt-2">Dès votre approbation des livrables, les fonds sont immédiatement versés au freelance avec facture conforme.</p>
          </div>
        </div>
      </div>
    `;
  };

  window.IntalentPages["about"] = async function (main) {
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-gutter py-space-xl">
        <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm space-y-4">
          <img src="/assets/logos/logo-dark.png" alt="INTALENT" class="h-12 w-auto object-contain">
          <h1 class="font-headline-xl text-on-surface font-extrabold">À propos d'INTALENT Algérie</h1>
          <p class="font-body-lg text-on-surface-variant leading-relaxed">
            INTALENT est la première marketplace algérienne de freelancing et de squads B2B combinant vérification d'identité (CNI/ANA), facturation légale en Dinars Algériens (DZD) et protection séquestre adossée au réseau monétique national (CIB &amp; Edahabia).
          </p>
        </div>
      </div>
    `;
  };

  window.IntalentPages["pricing-fees"] = async function (main, state) {
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-gutter py-space-xl">
        <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm space-y-4">
          <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs font-extrabold uppercase">Fiscalité &amp; Commissions DZD</span>
          <h1 class="font-headline-xl text-on-surface font-extrabold">Tarifs, Commissions &amp; Statut Auto-Entrepreneur</h1>
          <ul class="space-y-3 font-body-md text-on-surface">
            <li>• <strong>Inscription &amp; Publication de services :</strong> 0 DZD (100% Gratuit)</li>
            <li>• <strong>Commission Standard :</strong> ${state.settings.commission_rate_pct || 10}% sur les missions complétées</li>
            <li>• <strong>Commission Membres Intalent Pro :</strong> ${state.settings.pro_commission_rate_pct || 5}% seulement</li>
            <li>• <strong>Abonnements Intalent Pro :</strong> Visibilité (2,500 DA/mois), Visibilité Plus (7,000 DA/mois), Growth (10,000 DA/mois)</li>
          </ul>
          <button type="button" onclick="window.IntalentApp.navigate('pro-upgrade')" class="px-6 py-3 rounded-full bg-primary-container text-tertiary-fixed font-label-lg font-bold">Voir les offres Intalent Pro →</button>
        </div>
      </div>
    `;
  };

  window.IntalentPages["trust-safety"] = async function (main) {
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-gutter py-space-xl">
        <div class="bg-primary-container text-white rounded-[36px] p-space-xl shadow-xl space-y-4">
          <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs font-extrabold uppercase">Sécurité Bancaire SATIM</span>
          <h1 class="font-headline-xl text-white font-extrabold">Garantie Séquestre &amp; Protection des Fonds en DZD</h1>
          <p class="font-body-lg text-outline-variant leading-relaxed">
            Chaque transaction sur INTALENT est protégée par notre compte séquestre. Les fonds payés par CIB, Edahabia ou virement bancaire restent bloqués jusqu'à la livraison et la validation finale du travail par le client.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-6 py-3 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-extrabold">Explorer les services garantis →</button>
          </div>
        </div>
      </div>
    `;
  };

  window.IntalentPages["help-faq"] = async function (main) {
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-gutter py-space-xl space-y-4">
        <h1 class="font-headline-xl text-on-surface font-extrabold">Centre d'Aide &amp; FAQ</h1>
        <div class="bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm space-y-3">
          <h3 class="font-title-md text-on-surface font-bold">Comment fonctionnent les paiements CIB et Edahabia ?</h3>
          <p class="font-body-sm text-on-surface-variant">Vous réglez votre commande en DZD via la passerelle monétique SATIM. Les fonds sont conservés sous séquestre jusqu'à validation du livrable.</p>
          <h3 class="font-title-md text-on-surface font-bold pt-2">Puis-je basculer entre Freelance, Client, Entreprise et Admin ?</h3>
          <p class="font-body-sm text-on-surface-variant">Oui, utilisez le sélecteur de profil dans la barre de navigation supérieure pour tester instantanément chaque espace.</p>
        </div>
      </div>
    `;
  };

  window.IntalentPages["contact"] = async function (main, state) {
    const { escapeHtml, api, showToast } = App();
    main.innerHTML = `
      <div class="max-w-2xl mx-auto px-gutter py-space-xl">
        <div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm space-y-4">
          <h1 class="font-headline-lg text-on-surface font-extrabold">Contacter le Support INTALENT 7j/7</h1>
          <form id="contact-support-form" class="space-y-3">
            <input type="text" name="name" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Votre nom complet" value="${escapeHtml(state.user?.full_name || '')}" required>
            <input type="email" name="email" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Votre email" value="${escapeHtml(state.user?.email || '')}" required>
            <select name="category" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface">
              <option value="Support Commande & Séquestre">Support Commande &amp; Séquestre SATIM</option>
              <option value="Abonnement Intalent Pro">Abonnement Intalent Pro</option>
              <option value="Intalent Business B2B">Intalent Business B2B</option>
            </select>
            <input type="text" name="subject" class="w-full h-12 px-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Objet de votre demande" required>
            <textarea name="message" rows="4" class="w-full p-4 rounded-2xl bg-surface-container-low text-on-surface" placeholder="Comment pouvons-nous vous aider ?" required></textarea>
            <button type="submit" class="w-full py-4 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-extrabold">Envoyer au Support</button>
          </form>
        </div>
      </div>
    `;
    document.getElementById("contact-support-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await api("/api/support", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(fd.entries()))
        });
        showToast(`Ticket support #${res.ticket_id} enregistré !`);
        e.target.reset();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  window.IntalentPages["terms"] = async function (main) {
    main.innerHTML = `<div class="max-w-4xl mx-auto px-gutter py-space-xl"><div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm"><h1 class="font-headline-lg text-on-surface font-bold">Conditions Générales d'Utilisation (CGU)</h1><p class="font-body-md text-on-surface-variant mt-3">En utilisant INTALENT Algérie, chaque utilisateur s'engage à respecter les règles de transparence contractuelle, la législation algérienne sur le commerce électronique et le statut de l'auto-entrepreneur (Loi 22-23).</p></div></div>`;
  };

  window.IntalentPages["privacy"] = async function (main) {
    main.innerHTML = `<div class="max-w-4xl mx-auto px-gutter py-space-xl"><div class="bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm"><h1 class="font-headline-lg text-on-surface font-bold">Politique de Confidentialité (Loi 18-07)</h1><p class="font-body-md text-on-surface-variant mt-3">INTALENT protège vos données personnelles et professionnelles conformément à la Loi algérienne n° 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.</p></div></div>`;
  };
})();
