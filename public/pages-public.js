window.IntalentPages = window.IntalentPages || {};

(function () {
  const App = () => window.IntalentApp;

  const CATEGORY_META = {
    "programming-tech": { icon: "terminal", bg: "bg-primary-fixed text-primary-container", talents: "840+ talents", minPrice: "12,000 DZD" },
    "graphics-design": { icon: "draw", bg: "bg-secondary-fixed text-secondary", talents: "620+ talents", minPrice: "8,000 DZD" },
    "digital-marketing": { icon: "campaign", bg: "bg-surface-container-highest text-secondary", talents: "490+ talents", minPrice: "15,000 DZD" },
    "writing-translation": { icon: "edit_note", bg: "bg-primary-fixed-dim text-primary-container", talents: "380+ talents", minPrice: "4,000 DZD" },
    "video-animation": { icon: "movie_filter", bg: "bg-secondary-fixed-dim text-primary-container", talents: "510+ talents", minPrice: "7,500 DZD" },
    "ai-data-services": { icon: "neurology", bg: "bg-primary-fixed text-secondary", talents: "290+ talents", minPrice: "25,000 DZD" },
    "business-consulting": { icon: "balance", bg: "bg-surface-container-highest text-primary-container", talents: "170+ experts", minPrice: "10,000 DZD" }
  };

  // =========================================================================
  // 1. HOMEPAGE (STITCH PROJECT 1 — SCREEN 1)
  // =========================================================================
  window.IntalentPages["home"] = async function (main, state) {
    const { t, escapeHtml, formatDZD, renderServiceCard, api } = App();
    const [svcRes, flRes] = await Promise.all([
      api("/api/services?per_page=9"),
      api("/api/freelancers")
    ]);

    const catCardsHtml = state.categories.map(c => {
      const cname = state.lang === "fr" ? c.name_fr : (state.lang === "ar" ? c.name_ar : c.name);
      const meta = CATEGORY_META[c.slug] || { icon: "hub", bg: "bg-primary-fixed text-primary-container", talents: "250+ talents", minPrice: "10,000 DZD" };
      return `
        <a onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')" class="cursor-pointer group block p-space-lg rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 border border-surface-container-highest/50">
          <div class="w-14 h-14 rounded-xl ${meta.bg} flex items-center justify-center mb-space-md group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
            <span class="material-symbols-outlined text-2xl">${meta.icon}</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-secondary transition-colors">${escapeHtml(cname)}</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">${escapeHtml(c.description)}</p>
          <div class="mt-space-lg pt-space-sm flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
            <span class="bg-surface-container px-2 py-1 rounded font-medium">${meta.talents}</span>
            <span class="font-currency-stat text-body-sm text-primary-container">Dès ${meta.minPrice}</span>
          </div>
        </a>
      `;
    }).join("");

    // Add 8th Architecture & 3D card from Stitch design to make the exact 8-card 4x2 grid
    const archCardHtml = `
      <a onclick="window.IntalentApp.navigate('explore?category=graphics-design')" class="cursor-pointer group block p-space-lg rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 border border-surface-container-highest/50">
        <div class="w-14 h-14 rounded-xl bg-secondary-fixed flex items-center justify-center text-primary-container mb-space-md group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
          <span class="material-symbols-outlined text-2xl">view_in_ar</span>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-secondary transition-colors">Architecture & Rendu 3D</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">Plans de permis, 3ds Max, Lumion, modélisation & aménagement intérieur</p>
        <div class="mt-space-lg pt-space-sm flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
          <span class="bg-surface-container px-2 py-1 rounded font-medium">210+ talents</span>
          <span class="font-currency-stat text-body-sm text-primary-container">Dès 18,000 DZD</span>
        </div>
      </a>
    `;

    const featuredFreelancersHtml = (flRes.freelancers || []).slice(0, 4).map((f, idx) => {
      const badges = ["Top 1% Alger", "Top Designer", "Expert IA & Data", "Growth Pro"];
      const badgeLabel = f.is_pro ? (badges[idx % badges.length]) : "Prestataire Vérifié";
      return `
        <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-surface-container-highest/50">
          <div>
            <div class="flex items-center justify-between mb-space-md">
              <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-primary-container font-label-md text-label-md font-bold">${escapeHtml(badgeLabel)}</span>
              <div class="flex items-center gap-1 text-secondary font-label-md text-label-md">
                <span class="material-symbols-outlined text-sm material-fill">star</span>
                <span class="font-bold">${Number(f.rating_avg || 5.0).toFixed(1)}</span>
              </div>
            </div>
            <div class="flex flex-col items-center text-center mb-space-md cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">
              <div class="relative w-20 h-20 mb-space-sm">
                <img class="w-full h-full rounded-full object-cover ring-2 ring-secondary/30" src="${escapeHtml(f.avatar_url)}" alt="${escapeHtml(f.full_name)}" onerror="this.src='/assets/logos/logo-dark.png'">
                <span class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-secondary transition-colors flex items-center gap-1">
                <span>${escapeHtml(f.full_name)}</span>
                ${f.is_verified ? `<span class="material-symbols-outlined text-secondary text-sm material-fill">verified</span>` : ""}
              </h4>
              <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">${escapeHtml(f.headline)}</p>
              <p class="font-label-md text-label-md text-outline mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs text-secondary">location_on</span>
                <span>${escapeHtml(f.wilaya)} • ${f.review_count || 12} avis</span>
              </p>
            </div>
            <div class="flex flex-wrap gap-1 justify-center mb-space-md">
              ${(f.skills || []).slice(0, 3).map(sk => `<span class="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-md text-[11px]">${escapeHtml(sk.skill_name)}</span>`).join("")}
            </div>
          </div>
          <div class="pt-space-md border-t border-surface-container-highest flex items-center justify-between">
            <div>
              <span class="font-body-sm text-xs text-on-surface-variant block">Tarif indicatif</span>
              <span class="font-currency-stat text-body-md text-primary-container font-extrabold">${formatDZD(f.hourly_rate_dzd || 3500)} /h</span>
            </div>
            <button type="button" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')" class="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-secondary hover:text-white text-primary-container font-label-md text-label-md transition-colors">
              Voir profil
            </button>
          </div>
        </div>
      `;
    }).join("");

    main.innerHTML = `
      <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
        <div class="flex flex-col w-full">

          <!-- HERO SECTION (STITCH SCREEN 1) -->
          <section class="relative w-full rounded-2xl bg-gradient-to-b from-surface-container-low via-surface to-background px-margin-mobile lg:px-space-2xl py-space-xl overflow-hidden shadow-sm border border-surface-container-highest/60">
            <!-- Atmospheric Ambient Glows -->
            <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"></div>
            <div class="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>

            <div class="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
              <!-- Tag / Badge -->
              <div class="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-highest/70 text-secondary font-label-md text-label-md shadow-sm mb-space-md">
                <span class="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                <span class="font-bold">N°1 du Freelance Certifié en Algérie</span>
                <span class="text-outline">|</span>
                <span class="text-on-surface-variant font-medium">58 Wilayas & Diaspora</span>
              </div>

              <!-- Main Headline -->
              <h1 class="font-display-hero text-headline-xl lg:text-display-hero text-primary-container tracking-tight max-w-3xl leading-tight">
                Trouvez les meilleurs talents freelances en Algérie pour vos projets d'entreprise
              </h1>

              <!-- Subheadline -->
              <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-md mb-space-xl">
                Des milliers de spécialistes vérifiés en développement, design, marketing digital et intelligence artificielle. Paiement sécurisé et garanti en <span class="text-secondary font-bold">DZD</span> via CIB, Edahabia ou virement bancaire.
              </p>

              <!-- Unified Hero Search Omnibox -->
              <form class="w-full max-w-3xl bg-surface-container-lowest p-2 rounded-full shadow-xl shadow-primary-container/10 border border-surface-container-highest flex flex-col md:flex-row items-center gap-2" onsubmit="event.preventDefault(); window.IntalentApp.navigate('explore?q=' + encodeURIComponent(this.q.value) + (this.wilaya.value ? '&wilaya=' + encodeURIComponent(this.wilaya.value) : ''))">
                <div class="flex items-center flex-1 w-full px-space-md py-1 gap-space-sm">
                  <span class="material-symbols-outlined text-secondary text-xl">search</span>
                  <input name="q" id="hero-search-input" class="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder-on-surface-variant outline-none" placeholder="Quel talent recherchez-vous ? (ex: Développeur Flutter, UI Designer, Odoo...)" type="text">
                </div>
                <div class="hidden md:flex items-center gap-2 px-space-md py-1.5 bg-surface-container rounded-full text-on-surface-variant font-label-md text-label-md">
                  <span class="material-symbols-outlined text-sm text-secondary">location_on</span>
                  <select name="wilaya" class="bg-transparent outline-none cursor-pointer text-on-surface font-semibold pr-2">
                    <option value="">Toutes les Wilayas (58)</option>
                    ${state.wilayas.slice(0, 20).map(w => `<option value="${escapeHtml(w.name)}">${w.code} - ${escapeHtml(w.name)}</option>`).join("")}
                  </select>
                </div>
                <button type="submit" class="w-full md:w-auto px-space-xl py-3 rounded-full bg-primary-container text-on-primary hover:bg-secondary font-label-lg text-label-lg transition-all flex items-center justify-center gap-space-xs shadow-md shadow-primary-container/20">
                  <span>Rechercher</span>
                  <span class="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </form>

              <!-- Popular Pill Tags -->
              <div class="mt-space-md flex flex-wrap items-center justify-center gap-space-xs">
                <span class="font-label-md text-label-md text-on-surface-variant font-bold mr-1">Populaires :</span>
                <a onclick="window.IntalentApp.navigate('explore?q=CIB')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-secondary-fixed text-on-surface font-label-md text-label-md transition-colors">Intégration CIB & Edahabia</a>
                <a onclick="window.IntalentApp.navigate('explore?category=graphics-design')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-secondary-fixed text-on-surface font-label-md text-label-md transition-colors">Logo & Charte Graphique</a>
                <a onclick="window.IntalentApp.navigate('explore?category=programming-tech')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-secondary-fixed text-on-surface font-label-md text-label-md transition-colors">Application Mobile Flutter</a>
                <a onclick="window.IntalentApp.navigate('explore?category=ai-data-services')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-secondary-fixed text-on-surface font-label-md text-label-md transition-colors">Chatbot IA Darija</a>
                <a onclick="window.IntalentApp.navigate('explore?q=Odoo')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-secondary-fixed text-on-surface font-label-md text-label-md transition-colors">ERP Odoo Algérie</a>
              </div>

              <!-- Trust Badges & Local Metrics -->
              <div class="mt-space-2xl pt-space-lg w-full flex flex-col sm:flex-row items-center justify-around gap-space-lg bg-surface-container-lowest/90 rounded-xl p-space-lg shadow-sm border border-surface-container-highest/60">
                <div class="flex items-center gap-space-md">
                  <div class="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined text-2xl material-fill">verified</span>
                  </div>
                  <div class="text-left">
                    <div class="font-headline-sm text-headline-sm text-primary-container font-extrabold">15,000+</div>
                    <div class="font-body-sm text-body-sm text-on-surface-variant">Missions validées avec succès</div>
                  </div>
                </div>
                <div class="flex items-center gap-space-md">
                  <div class="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary-container">
                    <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
                  </div>
                  <div class="text-left">
                    <div class="font-headline-sm text-headline-sm text-primary-container font-extrabold">100% Garanti</div>
                    <div class="font-body-sm text-body-sm text-on-surface-variant">Fonds bloqués via Escrow DZD</div>
                  </div>
                </div>
                <div class="flex items-center gap-space-md">
                  <div class="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined text-2xl">credit_card</span>
                  </div>
                  <div class="text-left">
                    <div class="font-headline-sm text-headline-sm text-primary-container font-extrabold">CIB & Edahabia</div>
                    <div class="font-body-sm text-body-sm text-on-surface-variant">Paiement instantané sans frais cachés</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- POPULAR SERVICE CATEGORIES (8 Cards Grid) -->
          <section class="mt-space-2xl w-full">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-sm">
              <div>
                <div class="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold mb-1">Expertises à la Demande</div>
                <h2 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container">Explorez nos Catégories Phares</h2>
              </div>
              <a onclick="window.IntalentApp.navigate('categories')" class="cursor-pointer font-label-lg text-label-lg text-secondary hover:text-primary-container flex items-center gap-1 transition-colors">
                <span>Toutes les expertises</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              ${catCardsHtml}
              ${state.categories.length === 7 ? archCardHtml : ""}
            </div>
          </section>

          <!-- FEATURED SERVICES GRID -->
          <section class="mt-space-2xl w-full" id="services">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-sm">
              <div>
                <div class="flex items-center gap-space-xs mb-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span class="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold">Sélection de la Semaine</span>
                </div>
                <h2 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container">Services Recommandés avec Badge de Confiance</h2>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-space-md py-1.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md">Tous (${svcRes.total || (svcRes.services || []).length})</button>
                <button type="button" onclick="window.IntalentApp.navigate('explore?min_rating=4.8')" class="px-space-md py-1.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors">Top Notés ★ 4.9+</button>
                <button type="button" onclick="window.IntalentApp.navigate('explore?max_days=2')" class="px-space-md py-1.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors">Livraison Express 48h</button>
                <button type="button" onclick="window.IntalentApp.navigate('explore?pro_only=true')" class="px-space-md py-1.5 rounded-full bg-secondary-fixed text-primary-container font-label-md text-label-md hover:opacity-90 transition-colors">✦ Intalent Pro</button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              ${(svcRes.services || []).slice(0, 6).map(renderServiceCard).join("")}
            </div>
          </section>

          <!-- INTALENT BUSINESS (Enterprise Solutions Luxe Banner from Stitch Screen 1) -->
          <section class="mt-space-2xl w-full rounded-3xl bg-primary-container text-on-secondary-container p-space-xl lg:p-space-2xl relative overflow-hidden shadow-2xl">
            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute bottom-0 left-1/4 w-72 h-72 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>

            <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
              <div class="lg:col-span-7 space-y-space-md">
                <div class="inline-flex items-center gap-2 px-space-md py-1 rounded-full bg-surface-container-highest/15 text-secondary-fixed font-label-md text-label-md">
                  <span class="material-symbols-outlined text-sm text-secondary-fixed">workspace_premium</span>
                  <span>INTALENT BUSINESS POUR ENTREPRISES</span>
                </div>
                <h2 class="font-headline-xl text-headline-lg lg:text-headline-xl text-white font-extrabold leading-tight">
                  Passez à la vitesse supérieure avec des équipes dédiées et facturation légale en Algérie
                </h2>
                <p class="font-body-lg text-body-lg text-on-primary-container leading-relaxed">
                  Nous accompagnons les PME, startups en hypercroissance et grands comptes avec un vivier rigoureusement qualifié (top 3% des freelances algériens).
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-sm">
                  <div class="flex items-start gap-space-sm">
                    <span class="material-symbols-outlined text-secondary-fixed text-xl">shield_person</span>
                    <div>
                      <h4 class="font-label-lg text-label-lg text-white">Chef de projet dédié</h4>
                      <p class="font-body-sm text-body-sm text-on-primary-container">Un interlocuteur unique pour coordonner vos livrables.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-space-sm">
                    <span class="material-symbols-outlined text-secondary-fixed text-xl">receipt_long</span>
                    <div>
                      <h4 class="font-label-lg text-label-lg text-white">Facturation d'entreprise DZD</h4>
                      <p class="font-body-sm text-body-sm text-on-primary-container">Factures conformes avec NIF, NIS, RC et déductibilité fiscale.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-space-sm">
                    <span class="material-symbols-outlined text-secondary-fixed text-xl">lock</span>
                    <div>
                      <h4 class="font-label-lg text-label-lg text-white">NDA & IP Garanti</h4>
                      <p class="font-body-sm text-body-sm text-on-primary-container">Cession intégrale des droits d'auteur et accord de confidentialité.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-space-sm">
                    <span class="material-symbols-outlined text-secondary-fixed text-xl">groups</span>
                    <div>
                      <h4 class="font-label-lg text-label-lg text-white">Équipes Agiles à l'Échelle</h4>
                      <p class="font-body-sm text-body-sm text-on-primary-container">Constituez une équipe pluridisciplinaire en moins de 48 heures.</p>
                    </div>
                  </div>
                </div>

                <div class="pt-space-md flex flex-wrap items-center gap-space-md">
                  <button type="button" onclick="window.IntalentApp.navigate('business-solutions')" class="px-space-xl py-3 rounded-full bg-secondary text-on-secondary hover:bg-secondary-container font-label-lg text-label-lg transition-all shadow-lg shadow-secondary/30">
                    Découvrir Intalent Business
                  </button>
                  <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="px-space-xl py-3 rounded-full bg-surface-container-highest/15 text-white hover:bg-surface-container-highest/25 font-label-lg text-label-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">post_add</span>
                    <span>Publier un appel d'offres</span>
                  </button>
                </div>
              </div>

              <!-- Enterprise Visual Metric Box -->
              <div class="lg:col-span-5 bg-surface-container-highest/10 backdrop-blur-md rounded-2xl p-space-xl space-y-space-lg shadow-inner border border-white/10">
                <div class="flex items-center justify-between">
                  <span class="font-label-lg text-label-lg text-secondary-fixed">Performance Marché B2B</span>
                  <span class="px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-fixed font-label-md text-label-md">Algérie 2026</span>
                </div>
                <div class="w-full bg-surface-container-highest/10 rounded-xl p-space-md">
                  <div class="flex justify-between font-label-md text-label-md text-on-primary-container mb-2">
                    <span>Délai moyen de staffing</span>
                    <span class="text-white font-bold">36 Heures</span>
                  </div>
                  <svg class="w-full h-16 text-secondary-fixed" fill="none" stroke="currentColor" viewBox="0 0 200 60">
                    <path d="M 0 50 Q 30 45, 60 30 T 120 20 T 160 10 T 200 5" stroke-linecap="round" stroke-width="3"></path>
                    <circle cx="200" cy="5" fill="currentColor" r="4"></circle>
                  </svg>
                </div>
                <div class="grid grid-cols-2 gap-space-md text-center">
                  <div class="p-space-md rounded-xl bg-surface-container-highest/10">
                    <div class="font-headline-sm text-headline-sm text-white font-extrabold">99.4%</div>
                    <div class="font-body-sm text-body-sm text-on-primary-container mt-0.5">Satisfaction Clientèle</div>
                  </div>
                  <div class="p-space-md rounded-xl bg-surface-container-highest/10">
                    <div class="font-headline-sm text-headline-sm text-white font-extrabold">&gt; 350 M</div>
                    <div class="font-body-sm text-body-sm text-on-primary-container mt-0.5">DZD Transigés</div>
                  </div>
                </div>
                <div class="flex items-center gap-space-sm pt-space-xs text-on-primary-container font-body-sm text-body-sm">
                  <span class="material-symbols-outlined text-secondary-fixed text-base">support_agent</span>
                  <span>Assistance premium prioritaire 24/7 par chat et téléphone</span>
                </div>
              </div>
            </div>
          </section>

          <!-- INTALENT ANDROID MOBILE APP BANNER (APK DOWNLOAD + 3 LANGUAGES FR / AR / EN) -->
          <section class="mt-space-2xl w-full rounded-3xl bg-gradient-to-r from-[#25083F] via-[#2B0B45] to-[#8B43F5] text-white p-space-xl lg:p-space-2xl relative overflow-hidden shadow-xl">
            <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-xl">
              <div class="max-w-2xl space-y-4">
                <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-secondary-fixed font-label-md text-xs font-extrabold uppercase tracking-wider">
                  <span class="material-symbols-outlined text-base">android</span>
                  <span>APPLICATION MOBILE ANDROID OFFICIELLE • FR | العربية | EN</span>
                </div>
                <h2 class="font-headline-xl text-2xl lg:text-4xl font-extrabold leading-tight">
                  Téléchargez l'Application Intalent APK sur votre Smartphone Android
                </h2>
                <p class="text-white/85 text-sm lg:text-base leading-relaxed">
                  Commandez des services, suivez vos livraisons Escrow en DZD, discutez en direct avec vos clients et retirez vos gains BaridiMob / CCP où que vous soyez à travers les 58 Wilayas — disponible en <strong>Français, العربية et English</strong>.
                </p>
                <div class="flex flex-wrap items-center gap-3 pt-2">
                  <a href="/downloads/intalent-algeria.apk" download="intalent-algeria.apk" class="px-6 py-3.5 rounded-full bg-white text-[#25083F] hover:bg-secondary-fixed font-headline font-extrabold text-sm shadow-lg transition-all inline-flex items-center gap-2">
                    <span class="material-symbols-outlined text-xl text-[#8B43F5]">download</span>
                    <span>Télécharger l'APK Android (v2.4.0)</span>
                  </a>
                  <button type="button" onclick="window.IntalentApp.navigate('mobile-app')" class="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 font-headline font-bold text-sm transition-all inline-flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">smartphone</span>
                    <span>Tester l'App Mobile en Direct (FR / AR / EN)</span>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15">
                <img src="/assets/logos/logo-white-purple.png" alt="Intalent Mobile" class="w-20 h-20 rounded-2xl object-contain bg-[#25083F] p-2 border border-[#C879F5]/40">
                <div class="space-y-1">
                  <div class="font-headline font-extrabold text-base text-white">Intalent Algérie APK</div>
                  <div class="text-xs text-secondary-fixed">Version 2.4.0 • Android 7.0+</div>
                  <div class="text-xs text-white/80">✓ Français • ✓ العربية • ✓ English</div>
                  <div class="text-xs text-emerald-300 font-bold">✓ Certifié Sécurisé • 58 Wilayas</div>
                </div>
              </div>
            </div>
          </section>

          <!-- HOW IT WORKS ("Comment fonctionne Intalent") -->
          <section class="mt-space-2xl w-full">
            <div class="text-center max-w-2xl mx-auto mb-space-2xl">
              <div class="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold mb-1">Processus Simple & Sécurisé</div>
              <h2 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container">Comment fonctionne la plateforme ?</h2>
              <p class="font-body-md text-body-md text-on-surface-variant mt-space-sm">Conçu spécifiquement pour garantir l'équité, la rapidité et la confiance mutuelle entre clients et talents en Algérie.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container-highest/50">
                <div>
                  <div class="w-12 h-12 rounded-xl bg-primary-fixed text-primary-container font-headline-sm font-extrabold flex items-center justify-center mb-space-md">01</div>
                  <h3 class="font-headline-sm text-headline-sm text-primary-container mb-space-xs">Explorez ou Publiez</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Trouvez le service clé en main idéal ou déposez votre cahier des charges gratuitement pour recevoir des devis sur-mesure.
                  </p>
                </div>
                <div class="mt-space-lg flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold cursor-pointer" onclick="window.IntalentApp.navigate('explore')">
                  <span>Découverte instantanée</span>
                  <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container-highest/50">
                <div>
                  <div class="w-12 h-12 rounded-xl bg-secondary-fixed text-secondary font-headline-sm font-extrabold flex items-center justify-center mb-space-md">02</div>
                  <h3 class="font-headline-sm text-headline-sm text-primary-container mb-space-xs">Paiement Escrow</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Provisionnez les fonds via carte CIB, Edahabia ou virement. Vos dinars sont gardés en séquestre jusqu'à votre entière satisfaction.
                  </p>
                </div>
                <div class="mt-space-lg flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
                  <span>100% protégé</span>
                  <span class="material-symbols-outlined text-xs">verified_user</span>
                </div>
              </div>
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container-highest/50">
                <div>
                  <div class="w-12 h-12 rounded-xl bg-surface-container-highest text-primary-container font-headline-sm font-extrabold flex items-center justify-center mb-space-md">03</div>
                  <h3 class="font-headline-sm text-headline-sm text-primary-container mb-space-xs">Collaboration Étroite</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Échangez via notre espace de messagerie en direct, partagez vos fichiers et suivez les jalons d'avancement en temps réel.
                  </p>
                </div>
                <div class="mt-space-lg flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
                  <span>Outils collaboratifs</span>
                  <span class="material-symbols-outlined text-xs">chat</span>
                </div>
              </div>
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container-highest/50">
                <div>
                  <div class="w-12 h-12 rounded-xl bg-primary-fixed-dim text-primary-container font-headline-sm font-extrabold flex items-center justify-center mb-space-md">04</div>
                  <h3 class="font-headline-sm text-headline-sm text-primary-container mb-space-xs">Validez & Libérez</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Examinez le travail livré, demandez des révisions si besoin. Dès approbation, le freelance perçoit immédiatement ses gains.
                  </p>
                </div>
                <div class="mt-space-lg flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
                  <span>Facture automatique</span>
                  <span class="material-symbols-outlined text-xs">check_circle</span>
                </div>
              </div>
            </div>
          </section>

          <!-- TOP FREELANCERS OF THE MONTH -->
          <section class="mt-space-2xl w-full">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-sm">
              <div>
                <div class="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold mb-1">Réseau d'Élite Vetted</div>
                <h2 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container">Top Prestataires du Mois</h2>
              </div>
              <a onclick="window.IntalentApp.navigate('freelancers')" class="cursor-pointer font-label-lg text-label-lg text-secondary hover:text-primary-container flex items-center gap-1">
                <span>Voir tous les prestataires</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              ${featuredFreelancersHtml}
            </div>
          </section>

          <!-- TRUST & SECURITY IN ALGERIA -->
          <section class="mt-space-2xl w-full bg-surface-container-low rounded-3xl p-space-xl lg:p-space-2xl shadow-sm border border-surface-container-highest/60">
            <div class="max-w-4xl mx-auto text-center mb-space-xl">
              <div class="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold mb-1">Confiance & Paiements Locaux</div>
              <h2 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container">Une Sécurité Totale Conçue pour l'Algérie</h2>
              <p class="font-body-lg text-body-lg text-on-surface-variant mt-2">Plus de risques liés aux transactions informelles. Intalent normalise les paiements en dinars avec reçu officiel.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary-container mb-space-md">
                  <span class="material-symbols-outlined text-3xl">lock_clock</span>
                </div>
                <h4 class="font-headline-sm text-headline-sm text-primary-container mb-2">Escrow DZ Garanti</h4>
                <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Le montant de la prestation est séquestré sur notre compte de garantie tiers jusqu'à la validation définitive de votre commande.
                </p>
              </div>
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary mb-space-md">
                  <span class="material-symbols-outlined text-3xl">credit_card</span>
                </div>
                <h4 class="font-headline-sm text-headline-sm text-primary-container mb-2">CIB, Edahabia & Virements</h4>
                <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Payez en Dinar via la passerelle monétique certifiée SATIM. Virements bancaires et règlements d'entreprise supportés.
                </p>
              </div>
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary-container mb-space-md">
                  <span class="material-symbols-outlined text-3xl material-fill">verified</span>
                </div>
                <h4 class="font-headline-sm text-headline-sm text-primary-container mb-2">Statut Légal & Facturation</h4>
                <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Conformité avec la loi algérienne sur l'auto-entrepreneuriat et le commerce électronique. Factures téléchargeables.
                </p>
              </div>
            </div>
            <div class="mt-space-xl pt-space-lg flex flex-wrap items-center justify-center gap-space-md text-on-surface-variant font-label-md text-label-md">
              <span class="font-bold text-on-surface">Moyens acceptés :</span>
              <span class="px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm font-bold text-primary-container flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-secondary">payment</span> Carte CIB
              </span>
              <span class="px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm font-bold text-primary-container flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-secondary">credit_card</span> Carte Edahabia (Algérie Poste)
              </span>
              <span class="px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm font-bold text-primary-container flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-secondary">account_balance</span> Virement BNA / CPA / BEA
              </span>
            </div>
          </section>

          <!-- FINAL CONVERSION BANNER -->
          <section class="mt-space-2xl w-full rounded-3xl bg-primary-container p-space-xl lg:p-space-2xl relative overflow-hidden shadow-xl text-center">
            <div class="absolute -top-20 -left-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>
            <div class="max-w-2xl mx-auto space-y-space-md relative z-10">
              <span class="px-space-md py-1 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-bold">Commencez dès aujourd'hui</span>
              <h2 class="font-headline-xl text-headline-lg lg:text-headline-xl text-white font-extrabold leading-tight">
                Prêt à concrétiser votre prochain projet digital ?
              </h2>
              <p class="font-body-md text-body-md text-on-primary-container leading-relaxed">
                Rejoignez des milliers d'entreprises, startups et créateurs de contenu qui accélèrent leur croissance grâce aux meilleurs indépendants d'Algérie.
              </p>
              <div class="pt-space-md flex flex-col sm:flex-row items-center justify-center gap-space-md">
                <button type="button" onclick="window.IntalentApp.navigate('explore')" class="w-full sm:w-auto px-space-2xl py-3.5 rounded-full bg-secondary text-on-secondary hover:bg-secondary-container font-label-lg text-label-lg transition-all shadow-lg shadow-secondary/30">
                  Trouver un Freelance
                </button>
                <button type="button" onclick="window.IntalentApp.navigate('register')" class="w-full sm:w-auto px-space-2xl py-3.5 rounded-full bg-white text-primary-container hover:bg-surface-container font-label-lg text-label-lg transition-all shadow-sm">
                  Devenir Prestataire sur Intalent
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    `;
  };

  // =========================================================================
  // 2. EXPLORE SERVICES & SEARCH RESULTS (STITCH PROJECT 1 — SCREEN 2)
  // =========================================================================
  window.IntalentPages["explore"] = async function (main, state) {
    const { escapeHtml, renderServiceCard, api } = App();
    const p = state.params;

    const qs = new URLSearchParams();
    ["q", "category", "subcategory", "skill", "wilaya", "language", "min_price", "max_price", "max_days", "min_rating", "pro_only", "sort", "page"].forEach(k => {
      if (p[k]) qs.set(k, p[k]);
    });

    const data = await api("/api/services?" + qs.toString());
    const activeCat = state.categories.find(c => c.slug === p.category);
    const catTitle = activeCat ? (state.lang === "fr" ? activeCat.name_fr : (state.lang === "ar" ? activeCat.name_ar : activeCat.name)) : (p.q ? `Résultats pour « ${p.q} »` : "Explorer les Services & Freelances en Algérie");

    const subPillsHtml = activeCat && activeCat.subcategories ? `
      <div class="flex items-center gap-2 overflow-x-auto py-2">
        <button type="button" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(activeCat.slug)}')" class="px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${!p.subcategory ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">
          Tous (${data.total})
        </button>
        ${activeCat.subcategories.map(sc => `
          <button type="button" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(activeCat.slug)}&subcategory=${encodeURIComponent(sc.slug)}')" class="px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${p.subcategory === sc.slug ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">
            ${escapeHtml(state.lang === 'fr' ? (sc.name_fr || sc.name) : sc.name)}
          </button>
        `).join("")}
      </div>
    ` : "";

    main.innerHTML = `
      <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
        <!-- Breadcrumbs & Category Hero Bar -->
        <section class="w-full mb-space-lg">
          <nav aria-label="Fil d'Ariane" class="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant mb-space-sm">
            <a onclick="window.IntalentApp.navigate('home')" class="cursor-pointer hover:text-secondary transition-colors">Accueil</a>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <a onclick="window.IntalentApp.navigate('categories')" class="cursor-pointer hover:text-secondary transition-colors">Catégories</a>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-primary-container font-semibold">${escapeHtml(catTitle)}</span>
          </nav>

          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-md">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md mb-2">
                <span class="w-2 h-2 rounded-full bg-secondary"></span>
                Écosystème Tech & Créatif Algérie • 58 Wilayas
              </div>
              <h1 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container font-extrabold tracking-tight">
                ${escapeHtml(catTitle)}
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant mt-1">
                ${escapeHtml(activeCat ? activeCat.description : "Confiez vos projets digitaux aux prestataires d'élite certifiés à Alger, Oran, Constantine et partout en Algérie.")}
              </p>
            </div>
            <div class="flex items-center gap-space-md self-start md:self-auto bg-surface-container-low px-space-md py-2.5 rounded-xl shadow-sm border border-surface-container-highest">
              <div class="text-right">
                <div class="font-headline-sm text-headline-sm font-bold text-primary-container">${data.total}</div>
                <div class="font-label-md text-label-md text-on-surface-variant">Services vérifiés</div>
              </div>
              <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
                <span class="material-symbols-outlined material-fill">verified_user</span>
              </div>
            </div>
          </div>

          ${subPillsHtml}
        </section>

        <!-- Main Grid Layout (Left Sidebar Filters 3 cols + Marketplace Stream 9 cols) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <!-- LEFT SIDEBAR: ADVANCED SEARCH FILTERS (lg:col-span-3) -->
          <form id="explore-filter-form" class="lg:col-span-3 w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-lg border border-surface-container-highest/60">
            <div class="flex items-center justify-between pb-space-xs border-b border-surface-container-highest">
              <div class="flex items-center gap-2 text-primary-container">
                <span class="material-symbols-outlined text-secondary">tune</span>
                <span class="font-headline-sm text-headline-sm font-bold">Filtres</span>
              </div>
              <button type="button" onclick="window.IntalentApp.navigate('explore')" class="font-label-md text-label-md text-secondary hover:underline cursor-pointer">
                Réinitialiser
              </button>
            </div>

            <!-- Keyword & Category -->
            <div class="space-y-3">
              <div>
                <label class="font-label-md text-label-md text-primary-container font-bold block mb-1">Mot-clé ou compétence</label>
                <input type="text" name="q" value="${escapeHtml(p.q || "")}" placeholder="Ex: React, Logo, Satim..." class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant/60 focus:border-secondary">
              </div>
              <div>
                <label class="font-label-md text-label-md text-primary-container font-bold block mb-1">Catégorie</label>
                <select name="category" class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant/60">
                  <option value="">Toutes les catégories</option>
                  ${state.categories.map(c => `<option value="${escapeHtml(c.slug)}" ${p.category === c.slug ? 'selected' : ''}>${escapeHtml(state.lang === 'fr' ? c.name_fr : c.name)}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Pro & Online Switch -->
            <div class="p-3 bg-surface-container-low rounded-xl space-y-3">
              <label class="flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <span class="px-1.5 py-0.5 rounded bg-primary-container text-white font-label-md text-[10px]">PRO</span>
                  <span class="font-label-md text-label-md text-on-surface font-semibold">Intalent Pro Vetted</span>
                </div>
                <input type="checkbox" name="pro_only" value="true" ${p.pro_only === 'true' ? 'checked' : ''} class="w-4 h-4 rounded accent-secondary">
              </label>
            </div>

            <!-- Wilaya -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-label-lg text-label-lg text-primary-container font-bold flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base text-secondary">location_on</span>
                  Wilaya
                </h3>
                <span class="font-label-md text-label-md text-on-surface-variant">58 Wilayas</span>
              </div>
              <select name="wilaya" class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant/60">
                <option value="">Toutes les 58 Wilayas</option>
                ${state.wilayas.map(w => `<option value="${escapeHtml(w.name)}" ${p.wilaya === w.name ? 'selected' : ''}>${w.code} - ${escapeHtml(w.name)}</option>`).join("")}
              </select>
            </div>

            <!-- Budget (DZD) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-label-lg text-label-lg text-primary-container font-bold flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base text-secondary">payments</span>
                  Budget (DZD د.ج)
                </h3>
              </div>
              <div class="grid grid-cols-2 gap-2 mb-2">
                <div class="bg-surface-container-low p-2 rounded-lg border border-outline-variant/40">
                  <span class="block font-label-md text-[11px] text-on-surface-variant">Min (DZD)</span>
                  <input type="number" name="min_price" value="${escapeHtml(p.min_price || "")}" placeholder="4000" class="w-full bg-transparent font-currency-stat text-body-sm text-on-surface outline-none">
                </div>
                <div class="bg-surface-container-low p-2 rounded-lg border border-outline-variant/40">
                  <span class="block font-label-md text-[11px] text-on-surface-variant">Max (DZD)</span>
                  <input type="number" name="max_price" value="${escapeHtml(p.max_price || "")}" placeholder="150000" class="w-full bg-transparent font-currency-stat text-body-sm text-on-surface outline-none">
                </div>
              </div>
            </div>

            <!-- Délai de livraison -->
            <div>
              <h3 class="font-label-lg text-label-lg text-primary-container font-bold mb-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-base text-secondary">bolt</span>
                Délai d'exécution
              </h3>
              <select name="max_days" class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant/60">
                <option value="">Tous les délais</option>
                <option value="2" ${p.max_days === '2' ? 'selected' : ''}>⚡ Express 48 heures</option>
                <option value="5" ${p.max_days === '5' ? 'selected' : ''}>Jusqu'à 5 jours</option>
                <option value="10" ${p.max_days === '10' ? 'selected' : ''}>Jusqu'à 10 jours</option>
              </select>
            </div>

            <!-- Langues & Note -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="font-label-md text-xs text-primary-container font-bold block mb-1">Langue</label>
                <select name="language" class="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant/60">
                  <option value="">Toutes</option>
                  <option value="Français" ${p.language === 'Français' ? 'selected' : ''}>Français</option>
                  <option value="العربية" ${p.language === 'العربية' ? 'selected' : ''}>العربية</option>
                  <option value="English" ${p.language === 'English' ? 'selected' : ''}>English</option>
                </select>
              </div>
              <div>
                <label class="font-label-md text-xs text-primary-container font-bold block mb-1">Note min.</label>
                <select name="min_rating" class="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant/60">
                  <option value="">Toutes</option>
                  <option value="4.8" ${p.min_rating === '4.8' ? 'selected' : ''}>★ 4.8+</option>
                  <option value="4.5" ${p.min_rating === '4.5' ? 'selected' : ''}>★ 4.5+</option>
                </select>
              </div>
            </div>

            <input type="hidden" name="sort" id="explore-sort-hidden" value="${escapeHtml(p.sort || 'recommended')}">

            <button type="submit" class="w-full py-3 rounded-full bg-primary-container hover:bg-secondary text-white font-label-lg text-label-lg transition-all shadow-md">
              Appliquer les filtres
            </button>

            <!-- Payment Assurance Card -->
            <div class="p-3.5 rounded-xl bg-surface-container-high space-y-2">
              <div class="flex items-center gap-2 text-primary-container">
                <span class="material-symbols-outlined text-secondary text-sm">lock</span>
                <span class="font-label-md text-label-md font-bold uppercase tracking-wide">Paiement Garanti</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                Fonds sécurisés sur séquestre Intalent jusqu'à validation de votre livraison.
              </p>
              <div class="flex items-center gap-1.5 pt-1 font-label-md text-[11px] font-semibold text-primary-container flex-wrap">
                <span class="px-2 py-0.5 rounded bg-surface-container-lowest">CIB</span>
                <span class="px-2 py-0.5 rounded bg-surface-container-lowest">Edahabia</span>
                <span class="px-2 py-0.5 rounded bg-surface-container-lowest">Facture Fiscale</span>
              </div>
            </div>
          </form>

          <!-- RIGHT COLUMN: RESULTS STREAM & TOOLBAR (lg:col-span-9) -->
          <div class="lg:col-span-9 flex flex-col space-y-space-md">
            <!-- Sort, Active Chips & View Controls Toolbar -->
            <div class="w-full bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-highest/60 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-label-md text-label-md text-on-surface-variant">Affichage de <strong class="text-primary-container">${data.services.length}</strong> sur <strong class="text-primary-container">${data.total}</strong> services</span>
                ${p.q ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-md text-xs text-primary-container">« ${escapeHtml(p.q)} »</span>` : ""}
                ${p.wilaya ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-md text-xs text-primary-container">📍 ${escapeHtml(p.wilaya)}</span>` : ""}
                ${p.pro_only === 'true' ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed font-label-md text-xs text-primary-container">✦ Intalent Pro</span>` : ""}
              </div>
              <div class="flex items-center gap-2 self-end sm:self-auto">
                <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/40">
                  <span class="font-label-md text-label-md text-on-surface-variant">Trier par :</span>
                  <select id="explore-sort-select" class="bg-transparent font-label-md text-label-md text-primary-container font-bold outline-none cursor-pointer">
                    <option value="recommended" ${p.sort === 'recommended' ? 'selected' : ''}>Pertinence Intalent</option>
                    <option value="rating" ${p.sort === 'rating' ? 'selected' : ''}>Meilleures Évaluations (★)</option>
                    <option value="price_asc" ${p.sort === 'price_asc' ? 'selected' : ''}>Prix : Croissant</option>
                    <option value="price_desc" ${p.sort === 'price_desc' ? 'selected' : ''}>Prix : Décroissant</option>
                    <option value="newest" ${p.sort === 'newest' ? 'selected' : ''}>Nouveautés</option>
                  </select>
                </div>
              </div>
            </div>

            ${data.services.length === 0 ? `
              <div class="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-surface-container-highest">
                <span class="material-symbols-outlined text-5xl text-secondary mb-3">search_off</span>
                <h3 class="font-headline-sm text-primary-container mb-2">Aucun service ne correspond exactement à ces filtres</h3>
                <p class="font-body-md text-on-surface-variant mb-6 max-w-lg mx-auto">Essayez d'élargir votre budget en DZD, de sélectionner toutes les wilayas, ou publiez directement un appel d'offres sur-mesure.</p>
                <div class="flex justify-center gap-3">
                  <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-6 py-2.5 rounded-full bg-primary-container text-white font-label-md">Réinitialiser les filtres</button>
                  <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="px-6 py-2.5 rounded-full bg-surface-container text-primary-container font-label-md">Publier un projet</button>
                </div>
              </div>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                ${data.services.map(renderServiceCard).join("")}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById("explore-filter-form");
    const sortSel = document.getElementById("explore-sort-select");
    if (sortSel) {
      sortSel.addEventListener("change", () => {
        document.getElementById("explore-sort-hidden").value = sortSel.value;
        form.requestSubmit();
      });
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const next = new URLSearchParams();
      for (const [k, v] of fd.entries()) {
        if (String(v).trim() !== "") next.set(k, String(v).trim());
      }
      window.IntalentApp.navigate("explore?" + next.toString());
    });
  };

  // =========================================================================
  // 3. ALL CATEGORIES & SUBCATEGORIES DIRECTORY
  // =========================================================================
  window.IntalentPages["categories"] = async function (main, state) {
    const { escapeHtml } = App();
    main.innerHTML = `
      <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
        <div class="mb-space-xl">
          <span class="font-label-md text-secondary uppercase tracking-widest font-extrabold">Catalogue Complet</span>
          <h1 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container mt-1">Toutes les Catégories & Spécialités</h1>
          <p class="font-body-md text-on-surface-variant mt-1">Parcourez les domaines d'expertise vérifiés disponibles sur Intalent Algérie.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          ${state.categories.map(c => {
            const meta = CATEGORY_META[c.slug] || { icon: "hub", bg: "bg-primary-fixed text-primary-container" };
            return `
              <div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-highest/60 flex flex-col justify-between">
                <div>
                  <div class="relative h-40 rounded-xl overflow-hidden mb-space-md cursor-pointer" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">
                    <img src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.name)}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-3 left-3 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shadow-sm">
                      <span class="material-symbols-outlined">${meta.icon}</span>
                    </div>
                  </div>
                  <h3 class="font-headline-sm text-primary-container font-bold cursor-pointer hover:text-secondary" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">${escapeHtml(c.name_fr || c.name)}</h3>
                  <div class="font-label-md text-xs text-secondary mt-0.5 mb-2">${escapeHtml(c.name)} • ${escapeHtml(c.name_ar)}</div>
                  <p class="font-body-sm text-on-surface-variant mb-4">${escapeHtml(c.description)}</p>
                </div>
                <div class="border-t border-surface-container-highest pt-3 space-y-2">
                  ${(c.subcategories || []).map(sc => `
                    <a onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}')" class="cursor-pointer flex items-center justify-between py-1 px-2 rounded-lg hover:bg-surface-container-low font-body-sm text-on-surface hover:text-secondary transition-colors">
                      <span>${escapeHtml(sc.name_fr || sc.name)}</span>
                      <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    </a>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  };

  // =========================================================================
  // 4. SERVICE DETAILS & PACKAGE COMPARISON (STITCH PROJECT 1 — SCREEN 3)
  // =========================================================================
  window.IntalentPages["service"] = async function (main, state) {
    const { escapeHtml, formatDZD, renderServiceCard, api, isFavorite } = App();
    const ident = state.params.slug || state.params.id;
    const { service: s } = await api("/api/services/" + encodeURIComponent(ident));

    const gallery = (() => {
      try {
        const arr = JSON.parse(s.gallery_images || "[]");
        return arr.length ? arr : [s.cover_image];
      } catch (_) { return [s.cover_image]; }
    })();
    const skills = (() => {
      try { return JSON.parse(s.skills_tags || "[]"); } catch (_) { return []; }
    })();
    const faqs = (() => {
      try { return JSON.parse(s.faqs || "[]"); } catch (_) { return []; }
    })();
    const packages = s.packages && s.packages.length ? s.packages : [
      { tier: "basic", name: "Pack Essentiel", description: s.description, price_dzd: s.starting_price_dzd, delivery_days: s.delivery_days, revisions: 2, features: "[]" }
    ];

    let selectedTier = packages.find(p => p.tier === "standard")?.tier || packages[0].tier;

    function getPkgByTier(tName) {
      return packages.find(p => p.tier === tName) || packages[0];
    }

    function renderView() {
      const pkg = getPkgByTier(selectedTier);
      const basicPkg = getPkgByTier("basic");
      const stdPkg = getPkgByTier("standard");
      const premPkg = getPkgByTier("premium");

      let pkgFeats = [];
      try { pkgFeats = JSON.parse(pkg.features || "[]"); } catch (_) {}
      if (!pkgFeats.length) {
        pkgFeats = ["Fichiers sources livrés", "Cession des droits commerciaux", "Support prioritaire inclus"];
      }

      const favSaved = isFavorite("service", s.id);
      const highlightReview = (s.reviews && s.reviews[0]) || {
        client_name: "Karim M. (Casbah Tech)",
        client_wilaya: "Alger (16)",
        rating: 5,
        comment: "Travail exceptionnel, livraison avant le délai convenu. Les livrables sont impeccables et conformes au cahier des charges !"
      };

      main.innerHTML = `
        <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
          <!-- Top Breadcrumb & Action Metas -->
          <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-md text-on-surface-variant font-label-md text-label-md">
            <div class="flex items-center gap-2">
              <a onclick="window.IntalentApp.navigate('home')" class="cursor-pointer hover:text-secondary transition-colors">Accueil</a>
              <span>/</span>
              <a onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(s.category_slug)}')" class="cursor-pointer hover:text-secondary transition-colors">${escapeHtml(s.category_name)}</a>
              ${s.subcategory_name ? `<span>/</span><span>${escapeHtml(s.subcategory_name)}</span>` : ""}
              <span>/</span>
              <span class="text-on-surface font-semibold">Détails du service</span>
            </div>
            <div class="flex items-center gap-space-sm">
              <button type="button" onclick="window.IntalentApp.toggleFavorite('service', ${s.id}, this)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors ${favSaved ? 'text-error' : 'text-on-surface'} text-label-md">
                <span class="material-symbols-outlined text-base ${favSaved ? 'material-fill' : ''}">favorite</span>
                <span>Sauvegarder</span>
              </button>
              <button type="button" onclick="window.IntalentApp.openReportModal('service', ${s.id}, 'Service: ${escapeHtml(s.title)}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface text-label-md">
                <span class="material-symbols-outlined text-base">flag</span>
                <span>Signaler</span>
              </button>
            </div>
          </div>

          <!-- Page Core Grid: 65% Main Content (8/12) / 35% Sticky Sidebar (4/12) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <!-- LEFT COLUMN: 8/12 -->
            <div class="lg:col-span-8 flex flex-col gap-space-xl">
              <!-- Gig Title & Quick Freelancer Bar -->
              <div class="flex flex-col gap-space-sm">
                <h1 class="font-headline-xl text-headline-lg lg:text-headline-xl text-primary-container tracking-tight leading-tight">
                  ${escapeHtml(s.title)}
                </h1>
                <div class="flex flex-wrap items-center gap-space-md pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <div class="flex items-center gap-2 cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username)}')">
                    <div class="relative w-10 h-10 rounded-full overflow-hidden shadow-sm">
                      <img class="w-full h-full object-cover" src="${escapeHtml(s.freelancer_avatar)}" alt="${escapeHtml(s.freelancer_name)}" onerror="this.src='/assets/logos/logo-dark.png'">
                      <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                    </div>
                    <div>
                      <div class="flex items-center gap-1 font-headline-sm text-label-lg text-primary-container">
                        <span>${escapeHtml(s.freelancer_name)}</span>
                        <span class="material-symbols-outlined text-secondary text-sm material-fill">verified</span>
                      </div>
                      <span class="text-xs text-on-surface-variant">@${escapeHtml(s.freelancer_username)} • ${escapeHtml(s.freelancer_wilaya)}</span>
                    </div>
                  </div>
                  <span class="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
                  ${s.is_pro_listing || s.freelancer_is_pro ? `
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md">
                      <span class="material-symbols-outlined text-xs">workspace_premium</span>
                      Top Prestataire Pro
                    </span>
                    <span class="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
                  ` : ""}
                  <div class="flex items-center gap-1 font-label-md text-label-md text-on-surface">
                    <span class="material-symbols-outlined text-amber-500 text-sm material-fill">star</span>
                    <span class="font-bold">${Number(s.rating_avg || 5.0).toFixed(2)}</span>
                    <span class="text-on-surface-variant font-normal">(${s.review_count || 0} avis clients)</span>
                  </div>
                  <span class="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
                  <span class="text-secondary font-label-md text-label-md bg-secondary-fixed/50 px-2.5 py-0.5 rounded-full">
                    Protection Escrow DZD Active
                  </span>
                </div>
              </div>

              <!-- Media Gallery & Hero Visual Showcase -->
              <div class="flex flex-col gap-space-sm">
                <div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-md bg-surface-container-high group">
                  <img id="main-gallery-view" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(s.title)}">
                  <div class="absolute bottom-4 right-4 bg-primary-container/85 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-label-md text-label-md flex items-center gap-1 shadow-md">
                    <span class="material-symbols-outlined text-sm">photo_library</span>
                    <span>1 / ${gallery.length}</span>
                  </div>
                </div>
                ${gallery.length > 1 ? `
                  <div class="grid grid-cols-4 gap-space-sm">
                    ${gallery.map((imgUrl, idx) => `
                      <div class="aspect-[16/10] rounded-lg overflow-hidden cursor-pointer shadow-sm hover:opacity-100 transition-all ${idx === 0 ? 'ring-2 ring-secondary opacity-100' : 'opacity-75'}" onclick="document.getElementById('main-gallery-view').src='${escapeHtml(imgUrl)}'">
                        <img class="w-full h-full object-cover" src="${escapeHtml(imgUrl)}" alt="">
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>

              <!-- Verified Highlight Client Testimonial Snippet -->
              <div class="bg-surface-container-low p-space-lg rounded-xl shadow-sm flex items-start gap-space-md border border-surface-container-highest">
                <div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                  <span class="material-symbols-outlined text-xl">format_quote</span>
                </div>
                <div class="flex flex-col gap-1">
                  <p class="font-body-md text-body-md text-on-surface italic">
                    « ${escapeHtml(highlightReview.comment)} »
                  </p>
                  <div class="flex items-center gap-2 text-xs font-label-md text-on-surface-variant mt-1">
                    <span class="font-bold text-on-surface">${escapeHtml(highlightReview.client_name)}</span>
                    <span>—</span>
                    <span>${escapeHtml(highlightReview.client_wilaya || "Algérie")}</span>
                    <span class="text-emerald-600 flex items-center gap-0.5"><span class="material-symbols-outlined text-xs material-fill">verified</span> Achat Vérifié Intalent</span>
                  </div>
                </div>
              </div>

              <!-- Service Description & Methodology -->
              <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg border border-surface-container-highest/60">
                <div class="flex flex-col gap-1">
                  <span class="font-label-md text-label-md uppercase tracking-wider text-secondary">Aperçu Complet</span>
                  <h2 class="font-headline-lg text-headline-sm lg:text-headline-lg text-primary-container">À propos de cette prestation</h2>
                </div>
                <div class="font-body-md text-body-md text-on-surface whitespace-pre-line leading-relaxed">${escapeHtml(s.description)}</div>

                <!-- 4 Methodology Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md my-space-xs">
                  <div class="p-space-md rounded-lg bg-surface-container flex gap-space-sm items-start">
                    <span class="material-symbols-outlined text-secondary text-2xl shrink-0">verified</span>
                    <div>
                      <h4 class="font-headline-sm text-label-lg text-primary-container mb-1">Travail 100% Sur-Mesure</h4>
                      <p class="text-body-sm text-on-surface-variant">Conception originale adaptée aux standards du marché algérien et international.</p>
                    </div>
                  </div>
                  <div class="p-space-md rounded-lg bg-surface-container flex gap-space-sm items-start">
                    <span class="material-symbols-outlined text-secondary text-2xl shrink-0">inventory_2</span>
                    <div>
                      <h4 class="font-headline-sm text-label-lg text-primary-container mb-1">Livrables & Sources Complets</h4>
                      <p class="text-body-sm text-on-surface-variant">Fichiers sources organisés, documentation et livrables prêts pour la production.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-label-md text-xs uppercase text-on-surface-variant mb-2">Compétences & Technologies</h4>
                  <div class="flex flex-wrap gap-2">
                    ${skills.map(sk => `<span onclick="window.IntalentApp.navigate('explore?skill=${encodeURIComponent(sk)}')" class="cursor-pointer px-3 py-1 rounded-full bg-surface-container hover:bg-secondary-fixed text-primary-container font-label-md text-label-md transition-colors">${escapeHtml(sk)}</span>`).join("")}
                  </div>
                </div>
              </div>

              <!-- Compare Packages Matrix Table (STITCH SCREEN 3) -->
              <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg overflow-hidden border border-surface-container-highest/60">
                <div>
                  <span class="font-label-md text-label-md uppercase tracking-wider text-secondary">Grille Comparative</span>
                  <h2 class="font-headline-lg text-headline-sm lg:text-headline-lg text-primary-container">Comparez les formules disponibles</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left font-body-sm text-body-sm">
                    <thead>
                      <tr class="bg-surface-container-low text-primary-container font-headline-sm text-label-lg">
                        <th class="p-4 rounded-l-lg">Prestations</th>
                        <th class="p-4 text-center">
                          <div class="text-xs text-on-surface-variant font-normal">Basic</div>
                          <div class="font-bold">${escapeHtml(basicPkg.name)}</div>
                          <div class="text-secondary font-currency-stat mt-1">${formatDZD(basicPkg.price_dzd)}</div>
                        </th>
                        <th class="p-4 text-center bg-secondary-fixed/30 relative">
                          <div class="inline-block bg-secondary text-white font-label-md text-[10px] uppercase px-2 py-0.5 rounded-full mb-1">Populaire</div>
                          <div class="font-bold text-primary-container">${escapeHtml(stdPkg.name)}</div>
                          <div class="text-secondary font-currency-stat mt-1">${formatDZD(stdPkg.price_dzd)}</div>
                        </th>
                        <th class="p-4 text-center rounded-r-lg">
                          <div class="text-xs text-on-surface-variant font-normal">Premium</div>
                          <div class="font-bold">${escapeHtml(premPkg.name)}</div>
                          <div class="text-secondary font-currency-stat mt-1">${formatDZD(premPkg.price_dzd)}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-container-highest text-on-surface">
                      <tr>
                        <td class="p-4 font-semibold text-primary-container">Description</td>
                        <td class="p-4 text-center text-xs">${escapeHtml(basicPkg.description)}</td>
                        <td class="p-4 text-center bg-secondary-fixed/15 text-xs font-medium">${escapeHtml(stdPkg.description)}</td>
                        <td class="p-4 text-center text-xs">${escapeHtml(premPkg.description)}</td>
                      </tr>
                      <tr>
                        <td class="p-4 font-semibold text-primary-container">Délai d'exécution</td>
                        <td class="p-4 text-center">${basicPkg.delivery_days} jours</td>
                        <td class="p-4 text-center bg-secondary-fixed/15 font-semibold text-secondary">${stdPkg.delivery_days} jours</td>
                        <td class="p-4 text-center font-bold">${premPkg.delivery_days} jours</td>
                      </tr>
                      <tr>
                        <td class="p-4 font-semibold text-primary-container">Révisions incluses</td>
                        <td class="p-4 text-center">${basicPkg.revisions} révisions</td>
                        <td class="p-4 text-center bg-secondary-fixed/15 font-semibold">${stdPkg.revisions} révisions</td>
                        <td class="p-4 text-center font-bold text-emerald-600">${premPkg.revisions >= 50 ? 'Illimitées' : premPkg.revisions + ' révisions'}</td>
                      </tr>
                      <tr class="bg-surface-container-low/50">
                        <td class="p-4 font-semibold text-primary-container">Sélectionner</td>
                        <td class="p-4 text-center">
                          <button type="button" class="pkg-select-matrix px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary-container font-label-md text-xs transition-colors" data-tier="basic">Choisir Basic</button>
                        </td>
                        <td class="p-4 text-center bg-secondary-fixed/20">
                          <button type="button" class="pkg-select-matrix px-4 py-1.5 rounded-full bg-secondary hover:bg-secondary-container text-white font-label-md text-xs transition-colors shadow-sm" data-tier="standard">Choisir Standard</button>
                        </td>
                        <td class="p-4 text-center">
                          <button type="button" class="pkg-select-matrix px-3 py-1.5 rounded-full bg-primary-container hover:opacity-90 text-white font-label-md text-xs transition-colors" data-tier="premium">Choisir Premium</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- About the Freelancer Card -->
              <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg border border-surface-container-highest/60">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                  <div class="flex items-center gap-space-md cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username)}')">
                    <img class="w-16 h-16 rounded-full object-cover shadow-sm shrink-0" src="${escapeHtml(s.freelancer_avatar)}" alt="">
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-headline-lg text-headline-sm text-primary-container">${escapeHtml(s.freelancer_name)}</h3>
                        <span class="material-symbols-outlined text-secondary text-base material-fill">verified</span>
                      </div>
                      <p class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(s.freelancer_headline || "")}</p>
                    </div>
                  </div>
                  <button type="button" onclick="window.IntalentApp.openContactModal(${s.freelancer_id}, '${escapeHtml(s.freelancer_name)}', 'Question: ${escapeHtml(s.title)}')" class="px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary-container font-label-md text-label-md transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">chat</span>
                    <span>Envoyer un message</span>
                  </button>
                </div>
                <p class="font-body-md text-body-md text-on-surface leading-relaxed">${escapeHtml(s.freelancer_bio || "")}</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-md p-space-md rounded-lg bg-surface-container-low text-center">
                  <div>
                    <span class="block text-xs uppercase font-label-md text-on-surface-variant">Localisation</span>
                    <span class="font-headline-sm text-label-lg text-primary-container">${escapeHtml(s.freelancer_wilaya)}</span>
                  </div>
                  <div>
                    <span class="block text-xs uppercase font-label-md text-on-surface-variant">Temps de réponse</span>
                    <span class="font-headline-sm text-label-lg text-emerald-600 font-bold">&lt; 1 heure</span>
                  </div>
                  <div>
                    <span class="block text-xs uppercase font-label-md text-on-surface-variant">Évaluation</span>
                    <span class="font-headline-sm text-label-lg text-primary-container">★ ${Number(s.rating_avg || 5.0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span class="block text-xs uppercase font-label-md text-on-surface-variant">Profil complet</span>
                    <a onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username)}')" class="cursor-pointer font-headline-sm text-label-lg text-secondary hover:underline">Voir Portfolio →</a>
                  </div>
                </div>
              </div>

              <!-- Client Reviews & Detailed Ratings Section -->
              <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg border border-surface-container-highest/60">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                  <div>
                    <span class="font-label-md text-label-md uppercase tracking-wider text-secondary">Avis Certifiés</span>
                    <h2 class="font-headline-lg text-headline-sm lg:text-headline-lg text-primary-container">Retours d'expérience clients (${(s.reviews || []).length})</h2>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-lg material-fill">verified_user</span>
                    <span class="text-xs font-label-md text-on-surface-variant">100% d'avis issus de commandes réelles complétées</span>
                  </div>
                </div>

                <!-- Rating Summary Bar + Graphic Breakdown -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-space-lg p-space-lg rounded-xl bg-surface-container-low items-center">
                  <div class="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-surface-container-highest pb-4 md:pb-0 md:pr-4">
                    <span class="font-display-hero text-display-hero text-primary-container leading-none">${Number(s.rating_avg || 5.0).toFixed(2)}</span>
                    <div class="flex items-center text-amber-500 my-2">
                      <span class="material-symbols-outlined text-xl material-fill">star</span>
                      <span class="material-symbols-outlined text-xl material-fill">star</span>
                      <span class="material-symbols-outlined text-xl material-fill">star</span>
                      <span class="material-symbols-outlined text-xl material-fill">star</span>
                      <span class="material-symbols-outlined text-xl material-fill">star</span>
                    </div>
                    <span class="text-body-sm text-on-surface-variant font-medium">Note globale certifiée</span>
                  </div>
                  <div class="md:col-span-8 flex flex-col gap-2">
                    <div class="flex items-center gap-3 text-body-sm">
                      <span class="w-16 text-on-surface font-semibold shrink-0">5 étoiles</span>
                      <div class="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden"><div class="bg-secondary h-2.5 rounded-full" style="width: 94%"></div></div>
                      <span class="w-10 text-right text-on-surface-variant text-xs">94%</span>
                    </div>
                    <div class="flex items-center gap-3 text-body-sm">
                      <span class="w-16 text-on-surface font-semibold shrink-0">4 étoiles</span>
                      <div class="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden"><div class="bg-secondary h-2.5 rounded-full" style="width: 6%"></div></div>
                      <span class="w-10 text-right text-on-surface-variant text-xs">6%</span>
                    </div>
                    <div class="flex items-center gap-3 text-body-sm">
                      <span class="w-16 text-on-surface font-semibold shrink-0">3 étoiles</span>
                      <div class="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden"><div class="bg-secondary h-2.5 rounded-full" style="width: 0%"></div></div>
                      <span class="w-10 text-right text-on-surface-variant text-xs">0%</span>
                    </div>
                  </div>
                </div>

                <!-- Individual Reviews List -->
                <div class="flex flex-col gap-space-lg divide-y divide-surface-container-highest">
                  ${(s.reviews || []).length === 0 ? `<p class="text-on-surface-variant py-4">Aucun avis pour le moment.</p>` :
                    s.reviews.map(r => `
                      <div class="pt-space-md flex flex-col gap-space-xs">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-space-sm">
                            <img src="${escapeHtml(r.client_avatar || '/assets/logos/logo-dark.png')}" class="w-10 h-10 rounded-full object-cover">
                            <div>
                              <div class="font-headline-sm text-label-lg text-primary-container">${escapeHtml(r.client_name)}</div>
                              <div class="text-xs text-on-surface-variant">${escapeHtml(r.client_wilaya || 'Algérie')} • Commande vérifiée</div>
                            </div>
                          </div>
                          <div class="flex items-center text-amber-500">
                            ${'<span class="material-symbols-outlined text-sm material-fill">star</span>'.repeat(r.rating)}
                          </div>
                        </div>
                        <p class="font-body-md text-body-md text-on-surface mt-1">${escapeHtml(r.comment)}</p>
                      </div>
                    `).join("")
                  }
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: 35% (4/12 Desktop) STICKY ORDER BOX -->
            <div class="lg:col-span-4 sticky top-28 flex flex-col gap-space-md">
              <div class="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden p-space-lg flex flex-col gap-space-md border border-surface-container-highest">
                <!-- Tab Selector: Basic / Standard / Premium -->
                <div class="grid grid-cols-3 bg-surface-container rounded-lg p-1 text-center font-label-md text-xs">
                  ${packages.map(p => `
                    <button type="button" class="package-tab py-2 rounded-md font-semibold transition-all ${p.tier === selectedTier ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}" data-tier="${escapeHtml(p.tier)}">
                      ${escapeHtml(p.tier.toUpperCase())}
                    </button>
                  `).join("")}
                </div>

                <!-- Dynamic Package Content Display -->
                <div class="flex flex-col gap-space-sm pt-space-xs">
                  <div class="flex items-baseline justify-between gap-2">
                    <span class="font-headline-sm text-headline-sm text-primary-container font-bold">${escapeHtml(pkg.name)}</span>
                    <span class="font-currency-stat text-2xl font-extrabold text-secondary shrink-0">${formatDZD(pkg.price_dzd)}</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    ${escapeHtml(pkg.description)}
                  </p>
                  <div class="flex items-center justify-between py-2 text-on-surface font-label-md text-label-md bg-surface-container-low px-3 rounded-lg">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-secondary text-base">schedule</span>
                      <span>${pkg.delivery_days} jours de livraison</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-secondary text-base">replay</span>
                      <span>${pkg.revisions >= 50 ? 'Illimitées' : pkg.revisions + ' Révisions'}</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2 py-2 text-body-sm text-on-surface">
                    ${pkgFeats.map(f => `
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-emerald-600 text-sm">check</span>
                        <span>${escapeHtml(f)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>

                <!-- Optional Add-ons section -->
                ${(s.extras || []).length > 0 ? `
                  <div class="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-2.5">
                    <span class="font-label-md text-label-md text-primary-container font-semibold">Options & Suppléments :</span>
                    ${s.extras.map(ex => `
                      <label class="flex items-center justify-between text-body-sm text-on-surface cursor-pointer select-none">
                        <div class="flex items-center gap-2">
                          <input type="checkbox" class="extra-checkbox w-4 h-4 rounded text-secondary accent-secondary" value="${ex.id}" data-price="${ex.price_dzd}">
                          <span>${escapeHtml(ex.title)}</span>
                        </div>
                        <span class="font-currency-stat text-xs font-bold text-secondary">+${formatDZD(ex.price_dzd)}</span>
                      </label>
                    `).join("")}
                  </div>
                ` : ""}

                <!-- High-Conversion Action Buttons -->
                <div class="flex flex-col gap-space-sm">
                  <button type="button" id="proceed-checkout-btn" class="w-full py-3.5 rounded-full bg-primary-container hover:bg-secondary text-white font-label-lg text-label-lg transition-all shadow-md flex items-center justify-center gap-2 group">
                    <span class="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">shopping_cart_checkout</span>
                    <span id="proceed-checkout-text">Commander (${formatDZD(pkg.price_dzd)})</span>
                  </button>
                  <button type="button" onclick="window.IntalentApp.openContactModal(${s.freelancer_id}, '${escapeHtml(s.freelancer_name)}', 'Devis sur-mesure: ${escapeHtml(s.title)}')" class="w-full py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary-container font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">forum</span>
                    <span>Contacter ${escapeHtml(s.freelancer_name.split(' ')[0])} d'abord</span>
                  </button>
                </div>

                <!-- Escrow and Payment Safety Shield -->
                <div class="pt-space-xs flex flex-col gap-2 text-center">
                  <div class="flex items-center justify-center gap-2 py-1">
                    <span class="font-bold text-xs bg-surface-container px-2.5 py-1 rounded text-emerald-700">💳 CIB</span>
                    <span class="font-bold text-xs bg-surface-container px-2.5 py-1 rounded text-amber-700">📮 Edahabia</span>
                    <span class="font-bold text-xs bg-surface-container px-2.5 py-1 rounded text-primary-container">🏦 Virement DZ</span>
                  </div>
                  <div class="flex items-start justify-center gap-1.5 text-xs text-on-surface-variant text-center">
                    <span class="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5 material-fill">verified_user</span>
                    <span>Garantie Intalent Séquestre : vos fonds sont bloqués et reversés uniquement après validation de la livraison.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          ${(s.related_services || []).length ? `
            <div class="mt-space-2xl">
              <h2 class="font-headline-lg text-headline-sm lg:text-headline-lg text-primary-container mb-space-lg">Services similaires dans ${escapeHtml(s.category_name)}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">${s.related_services.slice(0, 3).map(renderServiceCard).join("")}</div>
            </div>
          ` : ""}
        </div>
      `;

      main.querySelectorAll(".package-tab, .pkg-select-matrix").forEach(tab => {
        tab.addEventListener("click", () => {
          selectedTier = tab.getAttribute("data-tier");
          renderView();
        });
      });

      const checkboxes = main.querySelectorAll(".extra-checkbox");
      const btn = document.getElementById("proceed-checkout-btn");
      const btnText = document.getElementById("proceed-checkout-text");
      function updateButtonTotal() {
        let sum = Number(pkg.price_dzd);
        checkboxes.forEach(cb => {
          if (cb.checked) sum += Number(cb.getAttribute("data-price") || 0);
        });
        btnText.textContent = `Commander (${formatDZD(sum)})`;
      }
      checkboxes.forEach(cb => cb.addEventListener("change", updateButtonTotal));

      btn.addEventListener("click", () => {
        if (!state.user) {
          App().showToast("Veuillez vous connecter ou créer un compte pour passer commande.", true);
          App().navigate("login");
          return;
        }
        const selectedExtras = [];
        checkboxes.forEach(cb => { if (cb.checked) selectedExtras.push(cb.value); });
        App().navigate(`checkout?service_id=${s.id}&tier=${encodeURIComponent(selectedTier)}&extras=${selectedExtras.join(",")}`);
      });
    }

    renderView();
  };

  // =========================================================================
  // 5. CHECKOUT & ORDER CREATION (SERVER PRICE CALCULATION + SANDBOX GATEWAY)
  // =========================================================================
  window.IntalentPages["checkout"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }
    const serviceId = state.params.service_id;
    const tier = state.params.tier || "basic";
    const extraIds = (state.params.extras || "").split(",").filter(Boolean).map(Number);

    const { service: s } = await api("/api/services/" + encodeURIComponent(serviceId));
    const pkg = (s.packages || []).find(p => p.tier === tier) || s.packages[0];
    const chosenExtras = (s.extras || []).filter(e => extraIds.includes(Number(e.id)));

    const subtotal = Number(pkg.price_dzd) + chosenExtras.reduce((acc, e) => acc + Number(e.price_dzd), 0);
    const commPct = Number(state.settings.commission_rate_pct || 10);
    const fee = Math.round(subtotal * (commPct / 100));
    const total = subtotal + fee;

    main.innerHTML = `
      <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
        <div class="mb-space-lg">
          <div class="inline-flex items-center gap-1.5 text-secondary font-label-md mb-1">
            <span class="material-symbols-outlined text-sm material-fill">lock</span>
            <span>Paiement Séquestre Garanti • SATIM CIB / Edahabia</span>
          </div>
          <h1 class="font-headline-xl text-headline-lg text-primary-container">Validation & Paiement Sécurisé de la Commande</h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <form id="checkout-order-form" class="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm space-y-space-lg border border-surface-container-highest">
            <div class="p-space-md rounded-xl bg-surface-container-low border border-secondary/30 flex items-start gap-3">
              <span class="material-symbols-outlined text-secondary">verified_user</span>
              <div class="font-body-sm text-on-surface">
                <strong>Architecture Monétique :</strong> Mode actif <strong>${escapeHtml(state.settings.payment_provider_label || "SATIM CIB / Edahabia Sandbox")}</strong>. Tous les montants et commissions sont calculés et vérifiés côté serveur.
              </div>
            </div>

            <div>
              <h3 class="font-headline-sm text-primary-container mb-1">1. Cahier des charges & Instructions pour ${escapeHtml(s.freelancer_name)}</h3>
              <p class="font-body-sm text-on-surface-variant mb-3">${escapeHtml(s.requirements_prompt)}</p>
              <textarea name="requirements" rows="4" class="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none border border-outline-variant focus:border-secondary" placeholder="Décrivez vos objectifs, délais souhaités, charte graphique et livrables attendus..." required></textarea>
            </div>

            <div>
              <label class="font-label-md text-on-surface block mb-1.5">Pièce jointe / Brief PDF ou Archive (Optionnel)</label>
              <input type="file" id="checkout-ref-file" class="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm border border-outline-variant">
            </div>

            <div>
              <h3 class="font-headline-sm text-primary-container mb-3">2. Mode de règlement (Séquestre Algérie)</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <label class="p-space-md rounded-xl border-2 border-secondary bg-surface-container-low cursor-pointer flex items-center gap-3">
                  <input type="radio" name="payment_method" value="SATIM CIB / Edahabia (Sandbox)" checked class="accent-secondary">
                  <div>
                    <div class="font-label-lg text-primary-container">💳 Carte CIB / Edahabia</div>
                    <div class="font-body-sm text-xs text-on-surface-variant">Validation instantanée SATIM</div>
                  </div>
                </label>
                <label class="p-space-md rounded-xl border border-outline-variant bg-surface-container-lowest cursor-pointer flex items-center gap-3">
                  <input type="radio" name="payment_method" value="Corporate Bank Wire / CCP (Sandbox)" class="accent-secondary">
                  <div>
                    <div class="font-label-lg text-primary-container">🏦 Virement RIB / CCP Entreprise</div>
                    <div class="font-body-sm text-xs text-on-surface-variant">Avec facture proforma fiscale</div>
                  </div>
                </label>
              </div>
            </div>

            <label class="flex items-center gap-2 font-body-sm text-on-surface-variant cursor-pointer">
              <input type="checkbox" name="simulate_failure" value="1" class="rounded accent-secondary">
              Simuler un refus monétique (pour test QA de gestion d'erreur)
            </label>

            <button type="submit" class="w-full py-4 rounded-full bg-primary-container hover:bg-secondary text-white font-headline-sm text-headline-sm transition-all shadow-lg flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">lock</span>
              <span>Confirmer et Séquestrer ${formatDZD(total)}</span>
            </button>
          </form>

          <div class="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-space-xl shadow-md space-y-space-md border border-surface-container-highest">
            <h3 class="font-headline-sm text-primary-container">Récapitulatif du Contrat</h3>
            <div class="flex gap-3 pb-space-md border-b border-surface-container-highest">
              <img src="${escapeHtml(s.cover_image)}" class="w-20 h-14 object-cover rounded-lg shrink-0">
              <div>
                <div class="font-label-lg text-primary-container line-clamp-2">${escapeHtml(s.title)}</div>
                <div class="font-body-sm text-xs text-on-surface-variant mt-0.5">Par ${escapeHtml(s.freelancer_name)}</div>
              </div>
            </div>
            <div class="space-y-2 font-body-sm">
              <div class="flex justify-between">
                <span>Formule (${escapeHtml(pkg.tier.toUpperCase())} — ${escapeHtml(pkg.name)})</span>
                <strong class="font-currency-stat">${formatDZD(pkg.price_dzd)}</strong>
              </div>
              ${chosenExtras.map(e => `
                <div class="flex justify-between text-on-surface-variant">
                  <span>+ Option : ${escapeHtml(e.title)}</span>
                  <strong class="font-currency-stat">${formatDZD(e.price_dzd)}</strong>
                </div>
              `).join("")}
              <div class="flex justify-between text-on-surface-variant">
                <span>Frais de protection Escrow (${commPct}%)</span>
                <strong class="font-currency-stat">${formatDZD(fee)}</strong>
              </div>
              <div class="flex justify-between pt-3 border-t border-surface-container-highest font-headline-sm text-primary-container">
                <span>Total Vérifié</span>
                <span class="font-currency-stat text-secondary">${formatDZD(total)}</span>
              </div>
            </div>
            <div class="p-3 rounded-xl bg-surface-container-low font-body-sm text-xs text-on-surface-variant flex items-center justify-between">
              <span>⏱ Délai : <strong>${pkg.delivery_days} jours</strong></span>
              <span>↻ Révisions : <strong>${pkg.revisions}</strong></span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("checkout-order-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const refFiles = [];
        const fileInput = document.getElementById("checkout-ref-file");
        if (fileInput && fileInput.files.length > 0) {
          const uploadedUrl = await uploadFileInput(fileInput);
          if (uploadedUrl) refFiles.push(uploadedUrl);
        }
        const res = await api("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            service_id: Number(s.id),
            package_tier: pkg.tier,
            extra_ids: extraIds,
            requirements: fd.get("requirements"),
            reference_files: refFiles,
            payment_method: fd.get("payment_method"),
            simulate_payment_failure: Boolean(fd.get("simulate_failure"))
          })
        });
        showToast(`Commande #${res.order_number} confirmée et séquestrée !`);
        await App().refreshBootstrap();
        App().navigate(`order-detail?id=${res.order_id}`);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  // =========================================================================
  // 6. ORDER MANAGEMENT & SECURE DELIVERY (STITCH PROJECT 1 — SCREEN 6)
  // =========================================================================
  window.IntalentPages["order-detail"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    const oid = state.params.id;
    const { order: o } = await api("/api/orders/" + encodeURIComponent(oid));
    const isClient = state.user && state.user.id === o.client_id;
    const isFreelancer = state.user && state.user.id === o.freelancer_id;

    const stepIdx = o.status === "completed" ? 5 : (o.status === "revision_requested" ? 4 : (o.status === "delivered" ? 3 : 2));
    const progressPct = stepIdx === 5 ? 100 : (stepIdx === 4 ? 75 : (stepIdx === 3 ? 65 : 35));

    main.innerHTML = `
      <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
        <!-- Top Bar: Context Title & Global Statistics -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-space-xs text-secondary font-label-md">
              <span class="material-symbols-outlined text-sm material-fill">verified_user</span>
              <span>Séquestre Protégé • Garantie Bancaire Algérie Poste & CIB</span>
            </div>
            <h1 class="font-headline-lg text-headline-lg text-on-surface">Gestion de la Commande #${escapeHtml(o.order_number)}</h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Supervisez l'exécution du contrat, livrez vos jalons et débloquez vos paiements en dinars algériens.</p>
          </div>
          <div class="flex items-center gap-space-sm">
            <button type="button" onclick="window.IntalentApp.openContactModal(${isClient ? o.freelancer_id : o.client_id}, '${escapeHtml(isClient ? o.freelancer_name : o.client_name)}', 'Commande #${escapeHtml(o.order_number)}')" class="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary-container font-label-md flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">chat</span>
              <span>Messagerie Directe</span>
            </button>
            <button type="button" onclick="window.IntalentApp.openReportModal('order_dispute', ${o.id}, 'Litige Commande #${escapeHtml(o.order_number)}')" class="px-4 py-2 rounded-full bg-error-container text-on-error-container font-label-md flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">gavel</span>
              <span>Ouvrir un litige</span>
            </button>
          </div>
        </div>

        <!-- Primary Workbench Layout (12-Column Grid from Stitch Screen 6) -->
        <div class="grid grid-cols-12 gap-gutter items-start">
          <!-- Left Column: Primary Order Deep-Dive Workbench (8 Cols) -->
          <div class="col-span-12 lg:col-span-8 flex flex-col gap-space-lg min-w-0">
            <!-- Card: Order Header & Counterparty Dossier -->
            <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-highest/60">
              <div class="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm">
                <div class="flex items-center gap-space-sm flex-wrap">
                  <span class="px-3 py-1 rounded-full bg-surface-container font-currency-stat text-currency-stat text-primary-container">#${escapeHtml(o.order_number)}</span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
                    <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    ${escapeHtml(o.status.toUpperCase())}
                  </span>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Délai contractuel : <strong class="text-on-surface">${o.delivery_days} jours</strong></span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface shadow-sm">
                  <span class="material-symbols-outlined text-secondary text-lg">lock</span>
                  <div class="flex flex-col text-right">
                    <span class="font-label-md text-[11px] text-secondary">Fonds Séquestrés (${escapeHtml(o.payment_method)})</span>
                    <span class="font-currency-stat text-currency-stat text-on-surface">${formatDZD(o.total_dzd)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 class="font-headline-lg text-headline-sm lg:text-headline-lg text-on-surface cursor-pointer hover:text-secondary" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(o.service_slug)}')">${escapeHtml(o.service_title)}</h2>
              </div>

              <!-- Package & Escrow Detail Strip -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                <div class="p-space-sm rounded-lg bg-surface-container-high/60 flex flex-col">
                  <span class="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">Formule choisie</span>
                  <span class="font-label-lg text-label-lg text-on-surface font-bold">Pack ${escapeHtml(o.package_tier.toUpperCase())}</span>
                  <span class="font-body-sm text-xs text-on-surface-variant">Client : ${escapeHtml(o.client_name)}</span>
                </div>
                <div class="p-space-sm rounded-lg bg-surface-container-high/60 flex flex-col">
                  <span class="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">Rétention Séquestre</span>
                  <span class="font-label-lg text-label-lg text-secondary font-bold">${o.status === 'completed' ? 'Libéré au Freelance' : '100% Déposé'}</span>
                  <span class="font-body-sm text-xs text-on-surface-variant">Net Freelance : ${formatDZD(o.freelancer_net_dzd)}</span>
                </div>
                <div class="p-space-sm rounded-lg bg-surface-container-high/60 flex flex-col">
                  <span class="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">Prestataire</span>
                  <span class="font-label-lg text-label-lg text-on-surface font-bold">${escapeHtml(o.freelancer_name)}</span>
                  <span class="font-body-sm text-xs text-on-surface-variant">${o.revisions_used || 0} révision(s) utilisée(s)</span>
                </div>
              </div>
            </div>

            <!-- Card: Visual Dynamic Timeline Stepper (STITCH SCREEN 6) -->
            <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-highest/60">
              <div class="flex items-center justify-between">
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Progression du Cycle de Commande</h3>
                <span class="font-label-md text-label-md text-secondary bg-surface-container-high px-3 py-1 rounded-full">Étape ${stepIdx} sur 5</span>
              </div>
              <div class="relative py-space-sm">
                <div class="hidden md:block absolute top-1/2 left-6 right-6 h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
                <div class="hidden md:block absolute top-1/2 left-6 h-1 bg-secondary -translate-y-1/2 z-0" style="width:${progressPct}%;"></div>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-space-md relative z-10">
                  <div class="flex md:flex-col items-center gap-space-sm text-left md:text-center">
                    <div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                      <span class="material-symbols-outlined text-lg">check</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-md text-label-md text-on-surface font-bold">1. Brief Validé</span>
                      <span class="font-body-sm text-xs text-on-surface-variant">Escrow confirmé</span>
                    </div>
                  </div>
                  <div class="flex md:flex-col items-center gap-space-sm text-left md:text-center">
                    <div class="w-10 h-10 rounded-full ${stepIdx >= 2 ? 'bg-primary-container text-on-primary ring-4 ring-secondary/20' : 'bg-surface-container-high text-on-surface-variant'} flex items-center justify-center shadow-md">
                      <span class="material-symbols-outlined text-lg">code</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-md text-label-md text-secondary font-bold">2. Exécution</span>
                      <span class="font-body-sm text-xs text-on-surface-variant">Développement</span>
                    </div>
                  </div>
                  <div class="flex md:flex-col items-center gap-space-sm text-left md:text-center ${stepIdx >= 3 ? '' : 'opacity-60'}">
                    <div class="w-10 h-10 rounded-full ${stepIdx >= 3 ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant'} flex items-center justify-center">
                      <span class="material-symbols-outlined text-lg">local_shipping</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-md text-label-md text-on-surface font-medium">3. Livraison</span>
                      <span class="font-body-sm text-xs text-on-surface-variant">${(o.deliveries || []).length} soumise(s)</span>
                    </div>
                  </div>
                  <div class="flex md:flex-col items-center gap-space-sm text-left md:text-center ${stepIdx === 4 ? '' : 'opacity-60'}">
                    <div class="w-10 h-10 rounded-full ${stepIdx === 4 ? 'bg-amber-500 text-white' : 'bg-surface-container-high text-on-surface-variant'} flex items-center justify-center">
                      <span class="material-symbols-outlined text-lg">history_edu</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-md text-label-md text-on-surface font-medium">4. Révision</span>
                      <span class="font-body-sm text-xs text-on-surface-variant">Si requis</span>
                    </div>
                  </div>
                  <div class="flex md:flex-col items-center gap-space-sm text-left md:text-center ${stepIdx === 5 ? '' : 'opacity-60'}">
                    <div class="w-10 h-10 rounded-full ${stepIdx === 5 ? 'bg-emerald-600 text-white' : 'bg-surface-container-high text-on-surface-variant'} flex items-center justify-center">
                      <span class="material-symbols-outlined text-lg">payments</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-md text-label-md text-on-surface font-medium">5. Déblocage DZD</span>
                      <span class="font-body-sm text-xs text-on-surface-variant">${formatDZD(o.freelancer_net_dzd)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card: Submitted Buyer Requirements -->
            <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm border border-surface-container-highest/60">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary">task_alt</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Cahier des Charges & Instructions du Client</h3>
              </div>
              <div class="p-space-md rounded-xl bg-surface-container-low font-body-md text-on-surface whitespace-pre-line">${escapeHtml(o.requirements_submitted)}</div>
            </div>

            <!-- Card: Deliveries & Stitch Delivery Submission Box -->
            <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-highest/60">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-space-sm">
                  <div class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-on-secondary">
                    <span class="material-symbols-outlined text-lg">unarchive</span>
                  </div>
                  <div>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface">Livrables Soumis (${(o.deliveries || []).length})</h3>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">Historique des versions et fichiers transmis pour cette commande.</p>
                  </div>
                </div>
              </div>

              ${(o.deliveries || []).length === 0 ? `<p class="font-body-sm text-on-surface-variant p-4 rounded-xl bg-surface-container-low">Aucune livraison soumise pour l'instant. Le prestataire travaille sur votre commande.</p>` :
                o.deliveries.map(d => `
                  <div class="p-space-md rounded-xl bg-surface-container-low border-l-4 border-secondary space-y-1">
                    <div class="font-label-md text-xs text-secondary">Livré le ${escapeHtml(d.created_at)}</div>
                    <p class="font-body-md text-on-surface whitespace-pre-line">${escapeHtml(d.message)}</p>
                  </div>
                `).join("")
              }

              ${isFreelancer && ["in_progress", "revision_requested", "delivered"].includes(o.status) ? `
                <form id="submit-delivery-form" class="flex flex-col gap-space-md pt-space-md border-t border-surface-container-highest">
                  <h4 class="font-headline-sm text-primary-container">Soumettre la Livraison Démo / Finale</h4>
                  <textarea name="message" rows="3" class="w-full p-space-sm rounded-xl bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" placeholder="Détaillez les étapes d'installation, liens de prévisualisation et livrables joints..." required></textarea>
                  <div>
                    <label class="font-label-md text-xs text-on-surface block mb-1">Joindre une archive ou livrable (.ZIP, .PDF, .PNG)</label>
                    <input type="file" id="delivery-file-input" class="w-full p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm border border-outline-variant">
                  </div>
                  <div class="flex items-start gap-2 p-3 rounded-lg bg-surface-container-low text-xs text-on-surface">
                    <input type="checkbox" checked required class="mt-0.5 accent-secondary">
                    <span><strong>Transfert de propriété intellectuelle :</strong> Je certifie que ces livrables sont originaux et transfèrent la pleine propriété au client dès validation.</span>
                  </div>
                  <div class="flex justify-end">
                    <button type="submit" class="px-space-lg py-2.5 rounded-full bg-primary-container hover:bg-secondary text-on-primary font-label-lg shadow-md transition-all flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">send</span>
                      <span>Soumettre la livraison</span>
                    </button>
                  </div>
                </form>
              ` : ""}

              ${isClient && o.status === "delivered" ? `
                <div class="pt-space-md border-t border-surface-container-highest space-y-3">
                  <div class="p-space-md rounded-xl bg-secondary-fixed/40 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div class="font-label-lg text-primary-container">Le prestataire a soumis sa livraison !</div>
                      <div class="font-body-sm text-xs text-on-surface-variant">Validez la livraison pour débloquer les fonds séquestrés ou demandez une révision.</div>
                    </div>
                    <button type="button" id="accept-delivery-btn" class="px-6 py-2.5 rounded-full bg-secondary hover:bg-primary-container text-white font-label-lg shadow-md transition-all flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base">check_circle</span>
                      <span>Valider & Débloquer le Paiement</span>
                    </button>
                  </div>
                  <form id="request-revision-form" class="flex gap-2">
                    <input type="text" name="reason" class="flex-1 h-11 px-4 rounded-full bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" placeholder="Besoin d'ajustements ? Décrivez votre demande de révision..." required>
                    <button type="submit" class="px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary-container font-label-md">Demander une révision</button>
                  </form>
                </div>
              ` : ""}
            </div>

            <!-- Eligible Verified Review Form -->
            ${o.status === "completed" ? `
              <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-highest/60">
                <h3 class="font-headline-sm text-primary-container mb-3">Évaluation Certifiée de la Mission</h3>
                ${o.review ? `
                  <div class="p-space-md rounded-xl bg-surface-container-low">
                    <div class="text-amber-500 font-bold mb-1">${"★".repeat(o.review.rating)} (${o.review.rating}/5)</div>
                    <p class="font-body-md text-on-surface">${escapeHtml(o.review.comment)}</p>
                  </div>
                ` : (isClient ? `
                  <form id="leave-review-form" class="space-y-3">
                    <div>
                      <label class="font-label-md text-xs text-on-surface block mb-1">Note globale (1 à 5 étoiles)</label>
                      <select name="rating" class="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm border border-outline-variant">
                        <option value="5">★★★★★ (5/5 — Excellent)</option>
                        <option value="4">★★★★☆ (4/5 — Très bien)</option>
                        <option value="3">★★★☆☆ (3/5 — Correct)</option>
                        <option value="2">★★☆☆☆ (2/5 — Insuffisant)</option>
                        <option value="1">★☆☆☆☆ (1/5 — Mauvais)</option>
                      </select>
                    </div>
                    <textarea name="comment" rows="3" class="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm border border-outline-variant" placeholder="Partagez votre retour d'expérience avec ${escapeHtml(o.freelancer_name)}..." required></textarea>
                    <button type="submit" class="px-6 py-2.5 rounded-full bg-secondary text-white font-label-lg shadow-md">Publier l'avis vérifié</button>
                  </form>
                ` : `<p class="font-body-sm text-on-surface-variant">En attente de l'avis du client.</p>`)}
              </div>
            ` : ""}
          </div>

          <!-- Right Column: Escrow Overview & Timeline History (4 Cols) -->
          <div class="col-span-12 lg:col-span-4 flex flex-col gap-space-lg">
            <!-- Card: Escrow Safety & Algeria Payment Guarantee -->
            <div class="bg-primary-container text-on-primary rounded-xl p-space-lg shadow-md flex flex-col gap-space-sm relative overflow-hidden">
              <div class="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-secondary-container/20 blur-xl pointer-events-none"></div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary-fixed-dim text-xl">security</span>
                  <span class="font-label-md text-label-md uppercase tracking-wider text-secondary-fixed-dim">Garantie Séquestre</span>
                </div>
                <span class="text-xs bg-surface-container-lowest/20 px-2 py-0.5 rounded-full font-label-md">100% Conforme</span>
              </div>
              <div class="mt-1">
                <span class="font-display-hero-mobile text-display-hero-mobile font-extrabold text-on-primary leading-tight">${formatDZD(o.total_dzd)}</span>
              </div>
              <p class="font-body-sm text-body-sm text-surface-container-highest">
                Sous-total prestation : <strong>${formatDZD(o.subtotal_dzd)}</strong> • Commission plateforme (${o.commission_rate_pct}%) : <strong>${formatDZD(o.platform_fee_dzd)}</strong> • Net prestataire : <strong>${formatDZD(o.freelancer_net_dzd)}</strong>.
              </p>
              <div class="pt-space-xs flex items-center justify-between text-xs text-secondary-fixed-dim">
                <span>Passerelle : SATIM / BNA</span>
                <span>Réf : #${escapeHtml(o.order_number)}</span>
              </div>
            </div>

            <!-- Status History Log -->
            <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-highest/60">
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Journal d'Activité & Statuts</h3>
              <div class="space-y-3 pt-1">
                ${(o.history || []).map(h => `
                  <div class="border-l-2 border-secondary pl-3 py-0.5">
                    <div class="font-label-md text-xs text-primary-container font-bold">${escapeHtml(h.status.toUpperCase())}</div>
                    <div class="font-body-sm text-xs text-on-surface">${escapeHtml(h.note)}</div>
                    <div class="font-label-md text-[10px] text-outline">${escapeHtml(h.created_at)}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const delForm = document.getElementById("submit-delivery-form");
    if (delForm) {
      delForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          const files = [];
          const fi = document.getElementById("delivery-file-input");
          if (fi && fi.files.length > 0) {
            const url = await uploadFileInput(fi);
            if (url) files.push(url);
          }
          await api(`/api/orders/${o.id}/deliver`, {
            method: "POST",
            body: JSON.stringify({ message: fd.get("message"), files })
          });
          showToast("Livraison soumise avec succès !");
          window.IntalentPages["order-detail"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const acceptBtn = document.getElementById("accept-delivery-btn");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", async () => {
        try {
          await api(`/api/orders/${o.id}/complete`, { method: "POST", body: "{}" });
          showToast("Commande validée et fonds débloqués vers le portefeuille du freelance !");
          window.IntalentPages["order-detail"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const revForm = document.getElementById("request-revision-form");
    if (revForm) {
      revForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await api(`/api/orders/${o.id}/revision`, {
            method: "POST",
            body: JSON.stringify({ reason: fd.get("reason") })
          });
          showToast("Demande de révision transmise au freelance.");
          window.IntalentPages["order-detail"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const reviewForm = document.getElementById("leave-review-form");
    if (reviewForm) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await api(`/api/orders/${o.id}/review`, {
            method: "POST",
            body: JSON.stringify({ rating: Number(fd.get("rating")), comment: fd.get("comment") })
          });
          showToast("Merci ! Votre avis certifié est maintenant publié.");
          window.IntalentPages["order-detail"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }
  };

  // =========================================================================
  // 7. DEDICATED MOBILE APP DOWNLOAD & INTERACTIVE SIMULATOR PAGE (#mobile-app)
  // =========================================================================
  window.IntalentPages["mobile-app"] = async function (main) {
    main.innerHTML = `
      <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <!-- LEFT COLUMN: DOWNLOAD APK & FEATURES (FR / AR / EN) -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-fixed text-primary-container font-label-md text-xs font-extrabold uppercase tracking-wider">
              <span class="material-symbols-outlined text-secondary text-base">android</span>
              <span>APPLICATION OFFICIELLE INTALENT ANDROID • v2.4.0</span>
            </div>

            <div class="flex items-center gap-4">
              <img src="/assets/logos/logo-dark.png" alt="Intalent" class="h-12 w-auto object-contain">
              <span class="px-3 py-1 rounded-full bg-[#25083F] text-[#C879F5] text-xs font-extrabold">FR • العربية • EN</span>
            </div>

            <h1 class="font-headline text-3xl sm:text-4xl font-extrabold text-primary-container leading-tight">
              Téléchargez l'Application Mobile Intalent Algérie (APK)
            </h1>

            <p class="text-on-surface-variant text-base leading-relaxed">
              Emportez tout l'écosystème <strong>Intalent</strong> dans votre poche. Conçue avec l'identité visuelle officielle Intalent (<code>#25083F</code> & <code>#8B43F5</code>), l'application mobile supporte intégralement les <strong>3 langues (Français, العربية RTL, English)</strong>, les paiements Escrow en <strong>DZD (CIB, Edahabia, BaridiMob / CCP)</strong> et la messagerie temps réel.
            </p>

            <!-- DOWNLOAD BUTTONS -->
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="/downloads/intalent-algeria.apk" download="intalent-algeria.apk" class="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#25083F] to-[#8B43F5] text-white font-headline font-extrabold text-sm shadow-lg hover:opacity-95 transition-all inline-flex items-center gap-3">
                <span class="material-symbols-outlined text-2xl">download</span>
                <div class="text-left">
                  <div class="text-[11px] uppercase tracking-wider text-[#C879F5]">Téléchargement Direct</div>
                  <div class="text-base">Télécharger intalent-algeria.apk</div>
                </div>
              </a>

              <a href="/mobile.html" target="_blank" class="px-6 py-4 rounded-2xl bg-surface-container-lowest border-2 border-[#8B43F5] text-[#25083F] hover:bg-secondary-fixed/40 font-headline font-bold text-sm transition-all inline-flex items-center gap-2.5">
                <span class="material-symbols-outlined text-xl text-[#8B43F5]">open_in_new</span>
                <span>Ouvrir l'App Plein Écran (PWA)</span>
              </a>
            </div>

            <!-- 3 LANGUAGE FEATURE CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
                <div class="font-headline font-extrabold text-sm text-[#25083F] mb-1">🇫🇷 Interface Française</div>
                <p class="text-xs text-on-surface-variant">Catalogue complet, filtres par Wilaya, suivi de commandes et facturation DZD.</p>
              </div>
              <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs" dir="rtl">
                <div class="font-headline font-extrabold text-sm text-[#25083F] mb-1">🇩🇿 واجهة عربية كاملة</div>
                <p class="text-xs text-on-surface-variant">دعم كامل للغة العربية (RTL)، الدفع بالدينار الجزائري، والرسائل الفورية.</p>
              </div>
              <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
                <div class="font-headline font-extrabold text-sm text-[#25083F] mb-1">🇬🇧 English Interface</div>
                <p class="text-xs text-on-surface-variant">Full English mode for international clients and enterprise teams in Algeria.</p>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: LIVE INTERACTIVE ANDROID PHONE SIMULATOR -->
          <div class="lg:col-span-5 flex flex-col items-center">
            <div class="w-full max-w-[390px] rounded-[42px] bg-[#25083F] p-3.5 shadow-[0_24px_60px_rgba(37,8,63,0.35)] border-4 border-[#C879F5]/40">
              <div class="w-28 h-5 bg-black/50 rounded-full mx-auto mb-2.5 flex items-center justify-center">
                <span class="w-2.5 h-2.5 rounded-full bg-[#8B43F5]/60"></span>
              </div>
              <div class="rounded-[30px] overflow-hidden bg-white h-[680px] border border-white/10">
                <iframe src="/mobile.html" title="Aperçu Interactif Intalent APK" class="w-full h-full border-0"></iframe>
              </div>
            </div>
            <p class="text-xs text-on-surface-variant mt-3 text-center">
              👆 <strong>Simulateur Interactif en Direct :</strong> Testez l'application et changez la langue (<code>FR | العربية | EN</code>) directement ci-dessus !
            </p>
          </div>

        </div>
      </div>
    `;
  };
})();
