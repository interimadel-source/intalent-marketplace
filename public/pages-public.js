window.IntalentPages = window.IntalentPages || {};

(function () {
  const App = () => window.IntalentApp;

  const CATEGORY_META = {
    "programming-tech": { icon: "terminal", bg: "bg-primary-fixed text-primary-container", talents: "840+ talents", minPrice: "18,000 DZD" },
    "graphics-design": { icon: "draw", bg: "bg-tertiary-fixed text-primary-container", talents: "620+ talents", minPrice: "12,000 DZD" },
    "digital-marketing": { icon: "campaign", bg: "bg-surface-container-highest text-secondary", talents: "310+ talents", minPrice: "9,500 DZD" },
    "writing-translation": { icon: "translate", bg: "bg-secondary-fixed text-primary-container", talents: "190+ talents", minPrice: "5,000 DZD" },
    "video-animation": { icon: "movie_filter", bg: "bg-secondary-fixed-dim text-primary-container", talents: "510+ talents", minPrice: "7,500 DZD" },
    "ai-data": { icon: "neurology", bg: "bg-primary-fixed text-secondary", talents: "290+ talents", minPrice: "25,000 DZD" },
    "ai-data-services": { icon: "neurology", bg: "bg-primary-fixed text-secondary", talents: "290+ talents", minPrice: "25,000 DZD" },
    "business-consulting": { icon: "account_balance", bg: "bg-primary-container text-tertiary-fixed", talents: "170+ experts", minPrice: "10,000 DZD" }
  };

  // =========================================================================
  // 1. HOMEPAGE — BENTO 3D (STITCH SCREEN c75e2cfaaf304826ba062663587f01f6)
  // =========================================================================
  window.IntalentPages["home"] = async function (main, state) {
    const { escapeHtml, formatDZD, renderServiceCard, api } = App();
    const [svcRes, flRes] = await Promise.all([
      api("/api/services?per_page=12"),
      api("/api/freelancers")
    ]);

    const allFreelancers = flRes.freelancers || [];
    let proSlideIndex = 0;

    function renderProFreelancerCards(startIdx) {
      const slice = [];
      for (let i = 0; i < 4; i++) {
        if (allFreelancers.length > 0) {
          slice.push(allFreelancers[(startIdx + i) % allFreelancers.length]);
        }
      }
      return slice.map(f => {
        const skills = (f.skills || []).map(s => s.skill_name || s).slice(0, 3);
        const dailyRate = Number(f.hourly_rate_dzd || 3500) * 6;
        return `
          <div class="bg-surface-container-lowest rounded-[28px] p-space-md shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
            <div>
              <div class="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container mb-space-sm cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">
                <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${escapeHtml(f.avatar_url)}" alt="${escapeHtml(f.full_name)}" onerror="this.src='/assets/logos/logo-dark.png'">
                <div class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md font-label-xs text-label-xs font-bold text-on-surface flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${escapeHtml(f.wilaya || "Alger (16)")}
                </div>
                <div class="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-primary-container text-tertiary-fixed font-label-xs text-label-xs font-bold">
                  ★ ${Number(f.rating_avg || 4.95).toFixed(1)} (${f.review_count || 42} avis)
                </div>
              </div>
              <div class="flex flex-col gap-0.5 cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">
                <h4 class="font-title-md text-title-md font-bold text-on-surface flex items-center gap-1 group-hover:text-secondary transition-colors">
                  <span>${escapeHtml(f.full_name)}</span>
                  <span class="material-symbols-outlined text-secondary text-sm material-fill">verified</span>
                </h4>
                <p class="font-body-sm text-body-sm text-secondary font-semibold truncate">${escapeHtml(f.headline)}</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">${escapeHtml(f.bio || "Expert certifié Intalent Pro avec contrat conforme et paiement séquestre SATIM.")}</p>
              </div>
              <div class="flex flex-wrap gap-1 mt-space-sm">
                ${skills.map(sk => `<span class="px-2 py-0.5 rounded bg-surface-container-low text-on-surface font-label-xs text-label-xs">${escapeHtml(sk)}</span>`).join("")}
              </div>
            </div>
            <div class="mt-space-md pt-space-sm border-t border-surface-container-high/50 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="font-label-xs text-label-xs text-on-surface-variant">Taux Journalier</span>
                <span class="font-title-md text-title-md font-extrabold text-on-surface">${dailyRate.toLocaleString("fr-DZ")} <span class="font-label-xs text-label-xs font-bold text-secondary">DZD</span></span>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')" class="px-3 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-xs text-label-xs font-bold transition-all">
                  Profil
                </button>
                <button type="button" onclick="window.IntalentApp.openContactModal(${f.id}, '${escapeHtml(f.full_name)}', 'Demande de mission')" class="px-space-md py-2 rounded-full bg-tertiary-fixed text-primary-container font-label-md text-label-md font-bold shadow-sm hover:scale-105 transition-all">
                  Contacter
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    main.innerHTML = `
      <div class="flex flex-col w-full relative overflow-hidden">
        <!-- AMBIENT CANVAS GLOWS -->
        <div class="pointer-events-none absolute -top-40 -left-20 w-[550px] h-[550px] bg-secondary/15 rounded-full blur-[140px] -z-10"></div>
        <div class="pointer-events-none absolute top-60 right-0 w-[620px] h-[620px] bg-tertiary-fixed/20 rounded-full blur-[160px] -z-10"></div>
        <div class="pointer-events-none absolute top-[900px] left-1/3 w-[450px] h-[450px] bg-secondary-container/10 rounded-full blur-[130px] -z-10"></div>

        <!-- 1. HERO SECTION: HIGH CONTRAST ASYMMETRIC BENTO COMPOSITION -->
        <section class="max-w-7xl mx-auto px-gutter pt-space-xl pb-space-xl relative">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            <!-- Left Column: Impactful Typography & Instant Matching Engine -->
            <div class="lg:col-span-7 flex flex-col gap-space-md">
              <!-- Live Status Overline -->
              <div class="inline-flex items-center gap-space-xs self-start px-space-md py-1.5 rounded-full bg-surface-container-high shadow-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-label-md text-label-md font-bold text-on-surface">Écosystème Tech N°1 en Algérie (${allFreelancers.length} Freelances Actifs)</span>
                <span class="text-outline-variant">•</span>
                <span class="font-label-md text-label-md text-secondary font-bold">Paiement Garanti SATIM &amp; Edahabia</span>
              </div>

              <!-- Master Headline -->
              <h1 class="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight">
                L'élite des freelances &amp; experts tech en <span class="text-secondary underline decoration-tertiary-fixed decoration-8 underline-offset-4">Algérie</span>.
              </h1>

              <p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Recrutez les 3% meilleurs ingénieurs, designers UI/UX et spécialistes cloud algériens. Contrats conformes, facturation auto-entrepreneur et compte séquestre DZD protégé jusqu'à validation finale.
              </p>

              <!-- Interactive Search Bento Input Bar -->
              <form class="p-space-xs bg-surface-container-lowest rounded-full shadow-[0_16px_36px_-12px_rgba(37,8,63,0.12)] flex flex-col md:flex-row items-center gap-space-xs border border-surface-container-high" onsubmit="event.preventDefault(); window.IntalentApp.navigate('explore?q=' + encodeURIComponent(this.q.value) + (this.wilaya.value ? '&wilaya=' + encodeURIComponent(this.wilaya.value) : ''))">
                <div class="flex items-center gap-space-xs px-space-md py-2 w-full md:w-5/12">
                  <span class="material-symbols-outlined text-secondary text-[22px]">terminal</span>
                  <input name="q" class="w-full bg-transparent font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none" placeholder="Développeur Flutter, React, IA..." type="text">
                </div>
                <div class="hidden md:block w-px h-8 bg-surface-container-high"></div>
                <div class="flex items-center gap-space-xs px-space-md py-2 w-full md:w-4/12">
                  <span class="material-symbols-outlined text-on-surface-variant text-[20px]">location_on</span>
                  <select name="wilaya" class="w-full bg-transparent font-body-sm text-on-surface focus:outline-none cursor-pointer">
                    <option value="">Toutes les Wilayas (58)</option>
                    <option value="Alger">Alger (16) — Cyberparc</option>
                    <option value="Oran">Oran (31) — Pôle USTO</option>
                    <option value="Constantine">Constantine (25)</option>
                    <option value="Sétif">Sétif (19)</option>
                    <option value="Annaba">Annaba (23)</option>
                    <option value="Tlemcen">Tlemcen (13)</option>
                  </select>
                </div>
                <button type="submit" class="w-full md:w-auto px-space-lg py-3.5 rounded-full bg-tertiary-fixed text-primary-container font-label-lg text-label-lg font-bold shadow-[0_8px_20px_-4px_rgba(202,243,0,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 flex-shrink-0">
                  <span>Trouver un talent</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              <!-- Quick Discovery Chips -->
              <div class="flex items-center gap-space-xs flex-wrap pt-space-xs">
                <span class="font-label-xs text-label-xs text-on-surface-variant uppercase font-bold tracking-wider">Tendances DZ:</span>
                <a onclick="window.IntalentApp.navigate('explore?q=Next.js')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">Next.js 15</a>
                <a onclick="window.IntalentApp.navigate('explore?q=SATIM')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">API SATIM</a>
                <a onclick="window.IntalentApp.navigate('explore?q=Flutter')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">Mobile Flutter</a>
                <a onclick="window.IntalentApp.navigate('explore?category=graphics-design')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">Figma Prototyping</a>
                <a onclick="window.IntalentApp.navigate('explore?category=ai-data')" class="cursor-pointer px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">Python LLM</a>
              </div>

              <!-- Social Proof Micro-row -->
              <div class="flex items-center gap-space-md pt-space-sm">
                <div class="flex -space-x-3 cursor-pointer" onclick="window.IntalentApp.navigate('freelancers')">
                  <img class="w-10 h-10 rounded-full object-cover ring-2 ring-surface shadow-md" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Talent DZ">
                  <img class="w-10 h-10 rounded-full object-cover ring-2 ring-surface shadow-md" src="https://randomuser.me/api/portraits/women/44.jpg" alt="Talent DZ">
                  <img class="w-10 h-10 rounded-full object-cover ring-2 ring-surface shadow-md" src="https://randomuser.me/api/portraits/men/46.jpg" alt="Talent DZ">
                  <div class="w-10 h-10 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center font-label-xs text-label-xs font-bold ring-2 ring-surface shadow-md">+${allFreelancers.length}</div>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-1 text-amber-500">
                    <span class="material-symbols-outlined text-[18px] material-fill">star</span>
                    <span class="material-symbols-outlined text-[18px] material-fill">star</span>
                    <span class="material-symbols-outlined text-[18px] material-fill">star</span>
                    <span class="material-symbols-outlined text-[18px] material-fill">star</span>
                    <span class="material-symbols-outlined text-[18px] material-fill">star</span>
                    <span class="font-label-md text-label-md font-bold text-on-surface ml-1">4.96/5</span>
                  </div>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Plus de 14,200 missions livrées sans litige</span>
                </div>
              </div>
            </div>

            <!-- Right Column: Visual Composite Card Composition (Bento 3D Glass Showcase) -->
            <div class="lg:col-span-5 relative flex justify-center">
              <div class="absolute w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] rounded-full bg-surface-container-high/60 -z-10 animate-spin" style="animation-duration: 40s;"></div>
              <div class="absolute w-[300px] h-[300px] rounded-full bg-surface-container-lowest/80 shadow-inner -z-10"></div>

              <!-- Central Talent Showcase Main Card -->
              <div class="w-full max-w-[390px] bg-surface-container-lowest rounded-[28px] p-space-md shadow-[0_24px_50px_-12px_rgba(37,8,63,0.14)] relative">
                <div class="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=yacine_benali')">
                  <img class="w-full h-full object-cover" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Yacine Benali">
                  <div class="absolute inset-0 bg-gradient-to-t from-primary-container/85 via-transparent to-transparent"></div>
                  <div class="absolute top-3 left-3 px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="font-label-xs text-label-xs font-bold text-on-surface">Disponible sous 24h</span>
                  </div>
                  <div class="absolute top-3 right-3 px-space-sm py-1 rounded-full bg-primary-container text-tertiary-fixed flex items-center gap-1 shadow-sm">
                    <span class="material-symbols-outlined text-[14px]">verified</span>
                    <span class="font-label-xs text-label-xs font-bold">Top Prestataire DZ</span>
                  </div>
                  <div class="absolute bottom-3 left-3 text-on-primary">
                    <p class="font-headline-sm text-headline-sm font-bold leading-tight">Yacine Benali</p>
                    <p class="font-body-sm text-body-sm text-secondary-fixed">Lead Fullstack &amp; IA • Alger</p>
                  </div>
                </div>

                <!-- Escrow Secured Milestone Box -->
                <div class="mt-space-md p-space-md rounded-2xl bg-surface-container-low flex flex-col gap-space-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-label-xs text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">Séquestre SATIM Garanti</span>
                    <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold">FONDS SÉCURISÉS</span>
                  </div>
                  <div class="flex items-baseline justify-between pt-1">
                    <span class="font-headline-md text-headline-md font-extrabold text-on-surface">185 000 <span class="font-label-md text-label-md font-bold text-secondary">DZD</span></span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">≈ 1 240 €</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mt-1">
                    <div class="h-full bg-secondary w-3/4 rounded-full"></div>
                  </div>
                  <div class="flex justify-between items-center text-on-surface-variant font-label-xs text-label-xs">
                    <span>Jalon 2/3 : Intégration CIB API</span>
                    <span class="text-secondary font-bold">75% validé</span>
                  </div>
                </div>

                <!-- Action buttons inside Card -->
                <div class="mt-space-sm grid grid-cols-2 gap-space-xs">
                  <button type="button" onclick="window.IntalentApp.navigate('freelancer?username=yacine_benali')" class="py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Voir Portfolio</span>
                  </button>
                  <button type="button" onclick="window.IntalentApp.navigate('service?slug=developpement-application-mobile-flutter-api-satim-cib')" class="py-2.5 px-3 rounded-full bg-primary-container text-tertiary-fixed font-label-md text-label-md font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">lock</span>
                    <span>Bloquer Fonds</span>
                  </button>
                </div>
              </div>

              <!-- Floating Satellite 1: Live Bank Card Mockup (Top Right Offset) -->
              <div onclick="window.IntalentApp.navigate('trust-safety')" class="cursor-pointer absolute -top-6 -right-4 sm:-right-8 p-space-md rounded-2xl bg-primary-container text-on-primary shadow-[0_20px_35px_-8px_rgba(40,12,66,0.35)] w-52 hidden sm:flex flex-col gap-2 rotate-3 hover:rotate-0 transition-transform">
                <div class="flex justify-between items-center">
                  <span class="font-label-xs text-label-xs font-bold text-tertiary-fixed uppercase">SATIM Pay</span>
                  <span class="material-symbols-outlined text-tertiary-fixed text-[18px]">contactless</span>
                </div>
                <p class="font-label-xs text-label-xs tracking-widest text-outline-variant mt-1">•••• •••• •••• 9014</p>
                <div class="flex justify-between items-end">
                  <div>
                    <p class="text-[9px] text-outline-variant uppercase">Carte CIB / Edahabia</p>
                    <p class="font-label-xs text-label-xs font-bold">YACINE B.</p>
                  </div>
                  <span class="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-xs text-[10px] font-bold">Instantané</span>
                </div>
              </div>

              <!-- Floating Satellite 2: Metric Chip (Bottom Left Offset) -->
              <div onclick="window.IntalentApp.navigate('trust-safety')" class="cursor-pointer absolute -bottom-6 -left-4 sm:-left-6 p-space-sm rounded-2xl bg-surface-container-lowest shadow-[0_16px_30px_-6px_rgba(37,8,63,0.14)] flex items-center gap-space-sm pr-space-md -rotate-3 hover:rotate-0 transition-transform">
                <div class="w-11 h-11 rounded-xl bg-tertiary-fixed text-primary-container flex items-center justify-center">
                  <span class="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <div>
                  <p class="font-label-xs text-label-xs font-bold uppercase tracking-wider text-secondary">Zéro Risque Client</p>
                  <p class="font-headline-sm text-headline-sm font-extrabold text-on-surface">100% Garanti</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TRUSTED ECOSYSTEM & PARTNER MARQUEE -->
        <section class="w-full bg-surface-container-low/70 py-space-lg">
          <div class="max-w-7xl mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-space-md">
            <span class="font-label-xs text-label-xs font-bold uppercase tracking-widest text-on-surface-variant flex-shrink-0">
              Intégré &amp; Agréé avec l'écosystème :
            </span>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-space-lg items-center opacity-75 w-full md:w-auto">
              <div class="flex items-center justify-center gap-1 text-on-surface font-title-md text-title-md font-black tracking-tighter cursor-pointer" onclick="window.IntalentApp.navigate('trust-safety')">
                <span class="w-3 h-3 rounded-sm bg-secondary"></span>SATIM
              </div>
              <div class="flex items-center justify-center gap-1 text-on-surface font-title-md text-title-md font-bold cursor-pointer" onclick="window.IntalentApp.navigate('trust-safety')">
                <span class="text-tertiary-fixed-dim">★</span>Edahabia
              </div>
              <div class="flex items-center justify-center text-on-surface font-title-md text-title-md font-extrabold tracking-wider cursor-pointer" onclick="window.IntalentApp.navigate('business-solutions')">
                YASSIR
              </div>
              <div class="flex items-center justify-center text-on-surface font-title-md text-title-md font-bold cursor-pointer" onclick="window.IntalentApp.navigate('business-solutions')">
                DJEZZY
              </div>
              <div class="flex items-center justify-center text-on-surface font-title-md text-title-md font-bold cursor-pointer" onclick="window.IntalentApp.navigate('business-solutions')">
                OOREDOO
              </div>
              <div class="flex items-center justify-center text-on-surface font-title-md text-title-md font-black cursor-pointer" onclick="window.IntalentApp.navigate('trust-safety')">
                BNA.DZ
              </div>
            </div>
          </div>
        </section>

        <!-- 2. BENTO GRID OF FLAGSHIP TECH CATEGORIES -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl w-full">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div class="flex flex-col gap-space-xs">
              <div class="inline-flex items-center gap-1.5 self-start px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-bold uppercase tracking-wider">
                Savoir-faire Spécialisé
              </div>
              <h2 class="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-on-surface">
                Les compétences qui propulsent vos projets
              </h2>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Du script backend haute performance aux campagnes TikTok à fort impact local, découvrez nos pôles d'excellence vérifiés.
              </p>
            </div>
            <a onclick="window.IntalentApp.navigate('categories')" class="cursor-pointer inline-flex items-center gap-2 font-label-lg text-label-lg font-bold text-secondary hover:text-primary-container transition-colors">
              <span>Voir tous les pôles &amp; sous-catégories</span>
              <span class="material-symbols-outlined text-[18px]">north_east</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-space-md">
            <!-- Bento Tile 1: Grande vedette Dev Web & Mobile (Col 8) -->
            <div class="lg:col-span-8 bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer" onclick="window.IntalentApp.navigate('explore?category=programming-tech')">
              <div class="flex justify-between items-start z-10">
                <div class="flex flex-col gap-1">
                  <span class="px-space-sm py-0.5 rounded-full bg-secondary/10 text-secondary font-label-xs text-label-xs font-bold uppercase tracking-wider self-start">
                    Pôle Dominant
                  </span>
                  <h3 class="font-headline-md text-headline-md text-on-surface pt-2">Développement Web, Mobile &amp; IA</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant max-w-md">Applications Next.js, API microservices en Go/Node, apps iOS/Android en Flutter et intégrations LLM sur mesure.</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-surface-container-low group-hover:bg-tertiary-fixed text-primary-container flex items-center justify-center transition-colors">
                  <span class="material-symbols-outlined text-[26px]">code</span>
                </div>
              </div>
              <div class="my-space-md bg-surface-container-low rounded-2xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md z-10">
                <div class="flex items-center gap-space-md">
                  <div class="w-14 h-14 rounded-xl bg-primary-container text-tertiary-fixed flex flex-col items-center justify-center font-bold">
                    <span class="text-xl leading-none">840+</span>
                    <span class="text-[9px] uppercase tracking-wider text-outline-variant">Devs</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-label-lg text-label-lg font-bold text-on-surface">Tarif médian : 18 000 DZD / j</span>
                    <div class="flex gap-1.5 pt-1 flex-wrap">
                      <span class="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-xs text-label-xs">Next.js 15</span>
                      <span class="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-xs text-label-xs">FastAPI</span>
                      <span class="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-xs text-label-xs">PostgreSQL</span>
                    </div>
                  </div>
                </div>
                <button type="button" onclick="event.stopPropagation(); window.IntalentApp.navigate('explore?category=programming-tech')" class="px-space-md py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold group-hover:scale-105 transition-all flex items-center gap-1.5 self-stretch sm:self-auto justify-center">
                  <span>Voir les profils</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
              <div class="flex items-center justify-between text-on-surface-variant font-label-xs text-label-xs z-10">
                <span>Délai moyen de contractualisation : <strong>3 heures</strong></span>
                <span class="text-secondary font-bold">100% Code Source Propriétaire Garanti</span>
              </div>
            </div>

            <!-- Bento Tile 2: UI/UX & 3D Branding (Col 4) -->
            <div class="lg:col-span-4 bg-tertiary-fixed rounded-[28px] p-space-lg shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer" onclick="window.IntalentApp.navigate('explore?category=graphics-design')">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="px-space-sm py-0.5 rounded-full bg-primary-container text-tertiary-fixed font-label-xs text-label-xs font-bold uppercase tracking-wider self-start">
                    Design Studio
                  </span>
                  <h3 class="font-headline-sm text-headline-sm text-primary-container font-extrabold pt-2">UI/UX &amp; 3D Identity</h3>
                </div>
                <div class="w-10 h-10 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px]">draw</span>
                </div>
              </div>
              <div class="py-space-md">
                <p class="font-body-md text-body-md text-on-tertiary-fixed font-semibold mb-space-sm">
                  Identités visuelles, interfaces SaaS complexes et prototypes interactifs Figma adoptés par des startups maghrébines.
                </p>
                <div class="p-space-sm rounded-xl bg-primary-container/10 flex items-center justify-between">
                  <span class="font-label-md text-label-md font-bold text-primary-container">620+ Designers actifs</span>
                  <span class="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-xs text-label-xs font-bold">Dès 12 000 DZD</span>
                </div>
              </div>
              <span class="inline-flex items-center gap-1 font-label-md text-label-md font-extrabold text-primary-container group-hover:translate-x-1 transition-transform">
                <span>Explorer les portfolios Figma</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>

            <!-- Bento Tile 3: Marketing Digital & Ads DZ (Col 4) -->
            <div class="lg:col-span-4 bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer" onclick="window.IntalentApp.navigate('explore?category=digital-marketing')">
              <div class="flex justify-between items-start">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center">
                  <span class="material-symbols-outlined text-[22px]">campaign</span>
                </div>
                <span class="font-label-xs text-label-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ROAS Moyen x4.2</span>
              </div>
              <div class="py-space-sm">
                <h3 class="font-title-md text-title-md text-on-surface font-bold">Marketing Digital &amp; TikTok DZ</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Acquisition Meta Ads, TikTok Shop &amp; stratégie de contenu adaptée aux 58 wilayas d'Algérie.</p>
              </div>
              <div class="pt-space-xs flex items-center justify-between">
                <span class="font-headline-sm text-headline-sm font-bold text-on-surface">310+ <span class="font-body-sm text-body-sm text-on-surface-variant font-normal">experts</span></span>
                <span class="font-label-md text-label-md text-secondary font-bold">Dès 9 500 DZD →</span>
              </div>
            </div>

            <!-- Bento Tile 4: Traduction & Contrats Juridiques certifiés (Col 4) -->
            <div class="lg:col-span-4 bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer" onclick="window.IntalentApp.navigate('explore?category=writing-translation')">
              <div class="flex justify-between items-start">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center">
                  <span class="material-symbols-outlined text-[22px]">translate</span>
                </div>
                <span class="font-label-xs text-label-xs font-bold text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full">Arabe / Français / Anglais</span>
              </div>
              <div class="py-space-sm">
                <h3 class="font-title-md text-title-md text-on-surface font-bold">Traduction &amp; Rédaction Juridique</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Traducteurs assermentés, conformité RGPD &amp; Loi 18-07 sur la protection des données personnelles.</p>
              </div>
              <div class="pt-space-xs flex items-center justify-between">
                <span class="font-headline-sm text-headline-sm font-bold text-on-surface">190+ <span class="font-body-sm text-body-sm text-on-surface-variant font-normal">linguistes</span></span>
                <span class="font-label-md text-label-md text-secondary font-bold">Dès 5 000 DZD →</span>
              </div>
            </div>

            <!-- Bento Tile 5: Statut Auto-Entrepreneur & Fiscalité DZ (Col 4) -->
            <div class="lg:col-span-4 bg-primary-container text-on-primary rounded-[28px] p-space-lg shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer" onclick="window.IntalentApp.navigate('explore?category=business-consulting')">
              <div class="flex justify-between items-start">
                <div class="w-10 h-10 rounded-xl bg-surface-container-low/10 text-tertiary-fixed flex items-center justify-center">
                  <span class="material-symbols-outlined text-[22px]">account_balance</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-bold">Conforme Loi 22-23</span>
              </div>
              <div class="py-space-sm">
                <h3 class="font-title-md text-title-md text-on-primary font-bold">Comptabilité &amp; Auto-Entrepreneur</h3>
                <p class="font-body-sm text-body-sm text-outline-variant mt-1">Assistance carte d'auto-entrepreneur (ANA), déclaration fiscale 0.5% IFU et tenue de comptes conforme au SCF algérien.</p>
              </div>
              <div class="pt-space-xs flex items-center justify-between">
                <span class="font-label-md text-label-md font-bold text-tertiary-fixed">Service Clé en Main</span>
                <span class="material-symbols-outlined text-tertiary-fixed text-[20px]">arrow_circle_right</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. TOP PRESTATAIRES CERTIFIÉS INTALENT PRO (100 REAL FREELANCERS CAROUSEL) -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl w-full">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <span class="font-label-xs text-label-xs font-bold uppercase tracking-wider text-secondary">Sélection du mois • ${allFreelancers.length} Talents Vérifiés</span>
              <h2 class="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-on-surface">Prestataires certifiés Intalent Pro</h2>
              <p class="font-body-md text-body-md text-on-surface-variant">Profils audités avec identité vérifiée (CNI/Passeport), tests techniques validés et paiements séquestrés.</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="pro-prev-btn" aria-label="Précédent" class="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface transition-colors">
                <span class="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button type="button" id="pro-next-btn" aria-label="Suivant" class="w-10 h-10 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center shadow-md hover:scale-105 transition-all">
                <span class="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
              <button type="button" onclick="window.IntalentApp.navigate('freelancers')" class="ml-2 px-space-md py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold transition-all">
                Voir les ${allFreelancers.length} profils →
              </button>
            </div>
          </div>

          <div id="home-pro-freelancers-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            ${renderProFreelancerCards(0)}
          </div>
        </section>

        <!-- 3B. FEATURED SERVICES CATALOG PREVIEW -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl w-full">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <span class="font-label-xs text-label-xs font-bold uppercase tracking-wider text-secondary">Catalogue Services Clés en Main</span>
              <h2 class="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-on-surface">Prestations prêtes à commander en DZD</h2>
              <p class="font-body-md text-body-md text-on-surface-variant">Plus de ${svcRes.total || 104} offres publiées par nos freelances algériens avec livrables et délais garantis.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-space-md py-2 rounded-full bg-tertiary-fixed text-primary-container font-label-md text-label-md font-bold shadow-sm">Tout explorer (${svcRes.total || 104})</button>
              <button type="button" onclick="window.IntalentApp.navigate('explore?pro_only=true')" class="px-space-md py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold">✦ Offres Pro</button>
              <button type="button" onclick="window.IntalentApp.navigate('explore?max_days=3')" class="px-space-md py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold">⚡ Express 72h</button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            ${(svcRes.services || []).slice(0, 6).map(renderServiceCard).join("")}
          </div>
        </section>

        <!-- 4. COMMENT ÇA MARCHE : 3-STEP ESCROW & EXECUTION BENTO -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl w-full">
          <div class="p-space-xl rounded-[36px] bg-surface-container-low relative overflow-hidden">
            <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-secondary-fixed/50 blur-3xl pointer-events-none"></div>
            <div class="max-w-2xl mb-space-xl">
              <div class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-xs text-label-xs font-bold uppercase tracking-wider mb-space-xs">
                Sécurité Totale &amp; Traçabilité
              </div>
              <h2 class="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-on-surface">
                Comment fonctionne le paiement garanti en 3 étapes
              </h2>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Fini les acomptes perdus et le travail non rémunéré. Notre contrat séquestre adossé aux réseaux CIB &amp; Edahabia garantit l'équité pour chaque partie.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <!-- Step 01 -->
              <div onclick="window.IntalentApp.navigate('post-project')" class="cursor-pointer bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm flex flex-col justify-between relative group hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-space-md">
                  <span class="font-display-lg text-display-lg text-secondary-container/20 group-hover:text-secondary/40 transition-colors">01</span>
                  <div class="w-12 h-12 rounded-2xl bg-surface-container-low text-secondary flex items-center justify-center">
                    <span class="material-symbols-outlined text-[24px]">post_add</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Sélectionnez ou Publiez</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant mt-2">
                    Choisissez directement un profil parmi nos ${allFreelancers.length} talents certifiés ou diffusez un appel d'offres privé. Définissez les livrables précis et l'échéancier des jalons.
                  </p>
                </div>
                <div class="mt-space-md pt-space-sm flex items-center gap-1.5 text-secondary font-label-md text-label-md font-bold">
                  <span>Cahier des charges standardisé</span>
                  <span class="material-symbols-outlined text-[16px]">check_circle</span>
                </div>
              </div>

              <!-- Step 02 (Hero Highlighted Tile) -->
              <div onclick="window.IntalentApp.navigate('trust-safety')" class="cursor-pointer bg-primary-container text-on-primary rounded-[28px] p-space-lg shadow-xl flex flex-col justify-between relative group">
                <div class="flex items-center justify-between mb-space-md">
                  <span class="font-display-lg text-display-lg text-tertiary-fixed/30 group-hover:text-tertiary-fixed/50 transition-colors">02</span>
                  <div class="w-12 h-12 rounded-2xl bg-tertiary-fixed text-primary-container flex items-center justify-center shadow-md">
                    <span class="material-symbols-outlined text-[24px]">lock_clock</span>
                  </div>
                </div>
                <div>
                  <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-bold mb-2">
                    SÉQUESTRE BLOQUÉ
                  </div>
                  <h3 class="font-headline-sm text-headline-sm text-on-primary font-bold">Fonds consignés en DZD</h3>
                  <p class="font-body-md text-body-md text-outline-variant mt-2">
                    Le client dépose le montant du jalon via sa carte CIB ou Edahabia. L'argent reste gelé sur un compte tiers agréé. Le freelance commence l'esprit tranquille.
                  </p>
                </div>
                <div class="mt-space-md pt-space-sm flex items-center gap-1.5 text-tertiary-fixed font-label-md text-label-md font-bold">
                  <span>Zéro avance à l'aveugle</span>
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                </div>
              </div>

              <!-- Step 03 -->
              <div onclick="window.IntalentApp.navigate('pricing-fees')" class="cursor-pointer bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm flex flex-col justify-between relative group hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-space-md">
                  <span class="font-display-lg text-display-lg text-secondary-container/20 group-hover:text-secondary/40 transition-colors">03</span>
                  <div class="w-12 h-12 rounded-2xl bg-surface-container-low text-emerald-600 flex items-center justify-center">
                    <span class="material-symbols-outlined text-[24px]">payments</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Validation &amp; Déblocage</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant mt-2">
                    Le client inspecte et approuve le livrable. Les fonds sont virés instantanément sur le compte bancaire (RIP) ou la carte Edahabia du prestataire avec facture légale.
                  </p>
                </div>
                <div class="mt-space-md pt-space-sm flex items-center gap-1.5 text-emerald-600 font-label-md text-label-md font-bold">
                  <span>Virement sous 60 secondes</span>
                  <span class="material-symbols-outlined text-[16px]">bolt</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. INTALENT PRO & ENTERPRISE CONVERSION CTA + INTERACTIVE BUDGET CALCULATOR -->
        <section class="max-w-7xl mx-auto px-gutter py-space-xl w-full">
          <div class="bg-primary-container text-on-primary rounded-[36px] p-space-xl relative overflow-hidden shadow-2xl">
            <div class="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-secondary rounded-full blur-[120px] opacity-40"></div>
            <div class="pointer-events-none absolute -bottom-20 left-10 w-[350px] h-[350px] bg-tertiary-fixed rounded-full blur-[140px] opacity-25"></div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center relative z-10">
              <div class="lg:col-span-8 flex flex-col gap-space-md">
                <div class="inline-flex items-center gap-2 self-start px-space-md py-1 rounded-full bg-surface-container-lowest/10 backdrop-blur-md">
                  <span class="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
                  <span class="font-label-md text-label-md font-bold text-tertiary-fixed uppercase tracking-wider">Programme Intalent Entreprise &amp; Pro</span>
                </div>
                <h2 class="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-on-primary font-extrabold max-w-2xl leading-tight">
                  Prêt à accélérer vos développements avec des talents d'exception ?
                </h2>
                <p class="font-body-lg text-body-lg text-outline-variant max-w-xl">
                  Que vous soyez une startup en amorçage, une PME industrielle ou une multinationale implantée en Algérie, composez votre escouade tech dédiée en moins de 48 heures.
                </p>
                <div class="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
                  <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="w-full sm:w-auto px-space-xl py-4 rounded-full bg-tertiary-fixed text-primary-container font-label-lg text-label-lg font-bold shadow-[0_12px_28px_-6px_rgba(202,243,0,0.45)] hover:scale-105 active:scale-95 transition-all text-center">
                    Démarrer un projet dès aujourd'hui
                  </button>
                  <button type="button" onclick="window.IntalentApp.navigate('pro-upgrade')" class="w-full sm:w-auto px-space-xl py-4 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-lg text-label-lg font-bold backdrop-blur-md transition-all text-center">
                    Découvrir Intalent Pro (dès 2,500 DA)
                  </button>
                </div>
                <div class="flex items-center gap-space-lg pt-space-sm text-outline-variant font-label-xs text-label-xs flex-wrap">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span> Facturation Auto-entrepreneur déductible</span>
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span> Accompagnement Account Manager dédié</span>
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span> NDA &amp; Propriété intellectuelle stricte</span>
                </div>
              </div>

              <!-- Interactive Estimator Widget -->
              <div class="lg:col-span-4 bg-surface-container-lowest/10 backdrop-blur-xl rounded-[28px] p-space-md flex flex-col gap-space-md shadow-xl border border-white/10">
                <div class="flex justify-between items-center">
                  <span class="font-label-md text-label-md font-bold text-tertiary-fixed">Calculateur de Budget Projet</span>
                  <span class="material-symbols-outlined text-outline-variant text-[20px]">calculate</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="font-label-xs text-label-xs text-outline-variant">Besoin Technique :</label>
                  <select class="w-full bg-surface-container-lowest/15 text-on-primary rounded-xl px-space-sm py-2.5 font-body-sm focus:outline-none cursor-pointer" id="estimator-role">
                    <option class="text-on-surface" value="web">Application Web Fullstack (Next.js)</option>
                    <option class="text-on-surface" value="mobile">Application Mobile Hybride (Flutter)</option>
                    <option class="text-on-surface" value="uiux">Design UI/UX &amp; Prototype Interactif</option>
                    <option class="text-on-surface" value="audit">Audit Sécurité &amp; Cloud DevOps</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex justify-between items-center">
                    <label class="font-label-xs text-label-xs text-outline-variant">Durée estimée :</label>
                    <span class="font-label-md text-label-md font-bold text-tertiary-fixed" id="estimator-days-val">15 jours</span>
                  </div>
                  <input class="w-full accent-tertiary-fixed cursor-pointer" id="estimator-days" max="60" min="5" type="range" value="15">
                </div>
                <div class="p-space-sm rounded-xl bg-surface-container-lowest/10 flex flex-col gap-1">
                  <span class="font-label-xs text-label-xs text-outline-variant">Estimation Enveloppe Séquestre :</span>
                  <div class="flex items-baseline justify-between">
                    <span class="font-headline-md text-headline-md font-black text-tertiary-fixed" id="estimator-total">270 000 DZD</span>
                    <span class="font-label-xs text-label-xs text-outline-variant">HT • Sans frais cachés</span>
                  </div>
                </div>
                <button type="button" id="estimator-submit-btn" class="w-full py-3 rounded-full bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md font-bold transition-all shadow-md">
                  Demander 3 Devis Instantanés
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    // Wire Pro Freelancers Carousel Buttons
    const gridEl = document.getElementById("home-pro-freelancers-grid");
    const prevBtn = document.getElementById("pro-prev-btn");
    const nextBtn = document.getElementById("pro-next-btn");
    if (gridEl && prevBtn && nextBtn && allFreelancers.length > 0) {
      prevBtn.addEventListener("click", () => {
        proSlideIndex = (proSlideIndex - 4 + allFreelancers.length) % allFreelancers.length;
        gridEl.innerHTML = renderProFreelancerCards(proSlideIndex);
      });
      nextBtn.addEventListener("click", () => {
        proSlideIndex = (proSlideIndex + 4) % allFreelancers.length;
        gridEl.innerHTML = renderProFreelancerCards(proSlideIndex);
      });
    }

    // Wire Budget Estimator Calculator
    const roleSelect = document.getElementById("estimator-role");
    const daysSlider = document.getElementById("estimator-days");
    const daysVal = document.getElementById("estimator-days-val");
    const totalDisplay = document.getElementById("estimator-total");
    const submitEstBtn = document.getElementById("estimator-submit-btn");
    const rates = { web: 18000, mobile: 20000, uiux: 14000, audit: 25000 };
    let currentCalculatedBudget = 270000;

    function updateEstimator() {
      if (!roleSelect || !daysSlider || !totalDisplay) return;
      const role = roleSelect.value;
      const days = parseInt(daysSlider.value, 10) || 15;
      daysVal.textContent = days + (days > 1 ? " jours" : " jour");
      const rate = rates[role] || 18000;
      currentCalculatedBudget = rate * days;
      totalDisplay.textContent = currentCalculatedBudget.toLocaleString("fr-DZ") + " DZD";
    }
    if (roleSelect && daysSlider) {
      roleSelect.addEventListener("change", updateEstimator);
      daysSlider.addEventListener("input", updateEstimator);
      updateEstimator();
    }
    if (submitEstBtn) {
      submitEstBtn.addEventListener("click", () => {
        App().navigate(`post-project?budget=${currentCalculatedBudget}`);
      });
    }
  };

  // =========================================================================
  // 2. EXPLORE SERVICES — BENTO 3D (STITCH SCREEN b9834e6cb185480eb2b0032fdc19ea36)
  // =========================================================================
  window.IntalentPages["explore"] = async function (main, state) {
    const { escapeHtml, renderServiceCard, api } = App();
    const p = state.params;

    const qs = new URLSearchParams();
    qs.set("per_page", "120");
    ["q", "category", "subcategory", "skill", "wilaya", "language", "min_price", "max_price", "max_days", "min_rating", "pro_only", "sort", "page"].forEach(k => {
      if (p[k]) qs.set(k, p[k]);
    });

    const data = await api("/api/services?" + qs.toString());
    const services = data.services || [];

    main.innerHTML = `
      <div class="relative w-full overflow-hidden">
        <div class="pointer-events-none absolute -top-40 right-10 w-[550px] h-[550px] rounded-full bg-secondary-fixed opacity-30 blur-[130px]"></div>
        <div class="pointer-events-none absolute top-96 -left-32 w-[420px] h-[420px] rounded-full bg-tertiary-fixed opacity-20 blur-[120px]"></div>

        <div class="max-w-7xl mx-auto px-gutter py-space-lg flex flex-col gap-space-lg relative z-10">
          <!-- Breadcrumbs & Quick Pitch Sub-header -->
          <section class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-xs">
            <div class="flex flex-col gap-space-xs">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span>
                  <span>Marché Algérien Vérifié</span>
                </span>
                <span class="font-label-md text-label-md text-on-surface-variant">Accueil &gt; Explore Tech &amp; Créatifs</span>
              </div>
              <h1 class="font-headline-xl text-headline-xl-mobile lg:text-headline-xl tracking-tight text-on-surface">
                Explorez l'élite du freelancing <span class="text-secondary underline decoration-tertiary-fixed decoration-4 underline-offset-8">en Algérie</span>
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Recrutez des développeurs, designers et experts certifiés avec contrat légal d'auto-entrepreneur et paiement sécurisé sous séquestre SATIM/Edahabia.
              </p>
            </div>
            <div class="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-sm rounded-2xl shadow-sm self-start md:self-end">
              <div class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed animate-ping"></div>
              <div class="flex flex-col">
                <span class="font-label-md text-label-md font-bold text-on-surface">${data.total || services.length} services actifs</span>
                <span class="font-label-xs text-label-xs text-on-surface-variant">58 Wilayas couvertes en DZD</span>
              </div>
            </div>
          </section>

          <!-- Category Filter Pills Bar -->
          <nav aria-label="Catégories principales" class="w-full overflow-x-auto no-scrollbar py-1">
            <div class="flex items-center gap-space-sm min-w-max">
              <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-space-md py-2.5 rounded-full font-label-lg text-label-lg transition-all ${!p.category ? 'bg-tertiary-fixed text-primary-container font-bold shadow-[0_6px_20px_-4px_rgba(202,243,0,0.5)]' : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface'}">
                Tous les services (${data.total || services.length})
              </button>
              ${state.categories.map(c => {
                const cname = state.lang === "fr" ? c.name_fr : (state.lang === "ar" ? c.name_ar : c.name);
                const active = p.category === c.slug;
                return `
                  <button type="button" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')" class="px-space-md py-2.5 rounded-full font-label-lg text-label-lg transition-all ${active ? 'bg-tertiary-fixed text-primary-container font-bold shadow-[0_6px_20px_-4px_rgba(202,243,0,0.5)]' : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface'}">
                    ${escapeHtml(cname)}
                  </button>
                `;
              }).join("")}
            </div>
          </nav>

          <!-- Search & Smart Bar -->
          <form id="explore-search-bar" class="w-full bg-surface-container-lowest p-space-sm sm:p-space-md rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-sm">
            <div class="flex items-center gap-space-sm w-full md:flex-1 bg-surface-container-low px-space-md py-3 rounded-full">
              <span class="material-symbols-outlined text-secondary">search</span>
              <input name="q" value="${escapeHtml(p.q || "")}" class="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-outline" placeholder="Rechercher: React Native, Designer Figma, Intégration SATIM CIB..." type="text">
              <button type="submit" class="px-3 py-1 rounded-full bg-primary-container text-tertiary-fixed font-label-xs text-label-xs font-bold">FILTRER</button>
            </div>
            <div class="flex items-center gap-space-xs sm:gap-space-sm w-full md:w-auto justify-between md:justify-end">
              <div class="flex items-center gap-1.5 px-space-md py-2.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md">
                <span class="material-symbols-outlined text-[18px] text-secondary">sort</span>
                <span class="text-on-surface-variant font-medium">Trier par:</span>
                <select id="explore-sort-select" class="bg-transparent font-bold text-on-surface outline-none cursor-pointer">
                  <option value="recommended" ${(!p.sort || p.sort === 'recommended') ? 'selected' : ''}>Pertinence &amp; Avis</option>
                  <option value="rating" ${p.sort === 'rating' ? 'selected' : ''}>Meilleure Note ★</option>
                  <option value="price_asc" ${p.sort === 'price_asc' ? 'selected' : ''}>Prix Croissant (DZD)</option>
                  <option value="price_desc" ${p.sort === 'price_desc' ? 'selected' : ''}>Prix Décroissant (DZD)</option>
                </select>
              </div>
            </div>
          </form>

          <!-- Main Layout: Bento Left Sidebar + 3-Column Marketplace Bento Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <!-- Filter Sidebar (3 Cols on Desktop) -->
            <aside class="w-full lg:col-span-3 flex flex-col gap-space-md lg:sticky lg:top-28">
              <div class="bg-surface-container-lowest p-space-lg rounded-[28px] shadow-sm flex flex-col gap-space-md">
                <div class="flex items-center justify-between pb-space-xs">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-[22px]">tune</span>
                    <span class="font-title-md text-title-md font-bold text-on-surface">Affiner les profils</span>
                  </div>
                  <button type="button" onclick="window.IntalentApp.navigate('explore')" class="font-label-xs text-label-xs text-secondary hover:underline font-bold uppercase tracking-wider">Réinitialiser</button>
                </div>

                <!-- Wilayas Selection -->
                <div class="flex flex-col gap-space-xs pt-space-xs">
                  <label class="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between">
                    <span>Wilaya d'origine / Pôle</span>
                    <span class="text-on-surface-variant font-normal text-xs">58 Wilayas</span>
                  </label>
                  <select id="sidebar-wilaya-select" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer">
                    <option value="">Toutes les Wilayas (Télétravail)</option>
                    ${state.wilayas.slice(0, 30).map(w => `<option value="${escapeHtml(w.name)}" ${p.wilaya === w.name ? 'selected' : ''}>${w.code} — ${escapeHtml(w.name)}</option>`).join("")}
                  </select>
                </div>

                <!-- Budget Filter DZD -->
                <div class="flex flex-col gap-space-xs pt-space-xs">
                  <label class="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between">
                    <span>Fourchette Budget (DZD)</span>
                    <span class="font-label-xs text-label-xs font-bold text-secondary">د.ج</span>
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button" onclick="window.IntalentApp.navigate('explore?max_price=20000')" class="px-3 py-2 rounded-xl ${p.max_price === '20000' ? 'bg-primary-container text-tertiary-fixed font-bold' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'} text-left font-label-md text-label-md">
                      &lt; 20k DZD
                    </button>
                    <button type="button" onclick="window.IntalentApp.navigate('explore?min_price=20000&max_price=60000')" class="px-3 py-2 rounded-xl ${p.max_price === '60000' ? 'bg-primary-container text-tertiary-fixed font-bold' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'} text-left font-label-md text-label-md">
                      20k - 60k DZD
                    </button>
                    <button type="button" onclick="window.IntalentApp.navigate('explore?min_price=60000&max_price=150000')" class="px-3 py-2 rounded-xl ${p.max_price === '150000' ? 'bg-primary-container text-tertiary-fixed font-bold' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'} text-left font-label-md text-label-md">
                      60k - 150k DZD
                    </button>
                    <button type="button" onclick="window.IntalentApp.navigate('explore?min_price=80000')" class="px-3 py-2 rounded-xl ${p.min_price === '80000' ? 'bg-primary-container text-tertiary-fixed font-bold' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'} text-left font-label-md text-label-md">
                      Projet Pro (&gt;80k)
                    </button>
                  </div>
                </div>

                <!-- Prestation Level -->
                <div class="flex flex-col gap-2 pt-space-xs">
                  <span class="font-label-md text-label-md font-bold text-on-surface">Niveau du talent</span>
                  <label class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors">
                    <input type="checkbox" id="filter-pro-only" ${p.pro_only === 'true' ? 'checked' : ''} class="w-4 h-4 rounded bg-surface accent-secondary">
                    <div class="flex items-center gap-1.5 flex-1">
                      <span class="font-label-md text-label-md font-bold text-on-surface">Intalent Pro</span>
                      <span class="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-[10px] font-extrabold text-on-secondary-fixed">TOP 3%</span>
                    </div>
                  </label>
                </div>

                <!-- Delivery Speed -->
                <div class="flex flex-col gap-2 pt-space-xs">
                  <span class="font-label-md text-label-md font-bold text-on-surface">Vitesse de livraison</span>
                  <div class="flex flex-wrap gap-1.5">
                    <button type="button" onclick="window.IntalentApp.navigate('explore?max_days=2')" class="px-3 py-1.5 rounded-full ${p.max_days === '2' ? 'bg-tertiary-fixed text-primary-container font-bold' : 'bg-surface-container-low text-on-surface'} font-label-md text-label-md flex items-center gap-1">
                      <span>⚡ 48 Heures</span>
                    </button>
                    <button type="button" onclick="window.IntalentApp.navigate('explore?max_days=5')" class="px-3 py-1.5 rounded-full ${p.max_days === '5' ? 'bg-tertiary-fixed text-primary-container font-bold' : 'bg-surface-container-low text-on-surface'} font-label-md text-label-md">
                      Jusqu'à 5 jours
                    </button>
                    <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md">
                      Tous délais
                    </button>
                  </div>
                </div>

                <!-- Guarantee Badges Box -->
                <div class="bg-surface-container-low p-space-md rounded-2xl flex flex-col gap-space-xs">
                  <div class="flex items-center gap-2 text-primary-container">
                    <span class="material-symbols-outlined text-[20px] text-tertiary-fixed-dim material-fill">verified_user</span>
                    <span class="font-title-md text-title-md font-bold text-on-surface">Protection Escrow</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Fonds cantonnés en DZD via SATIM. Aucun versement au prestataire sans votre validation explicite du livrable.
                  </p>
                  <div class="flex items-center gap-2 pt-1">
                    <span class="px-2 py-0.5 rounded-md bg-surface-container-lowest font-label-xs text-label-xs font-bold text-secondary">CIB</span>
                    <span class="px-2 py-0.5 rounded-md bg-surface-container-lowest font-label-xs text-label-xs font-bold text-on-surface">Edahabia</span>
                    <span class="px-2 py-0.5 rounded-md bg-surface-container-lowest font-label-xs text-label-xs font-bold text-on-surface-variant">Facture Légale</span>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Main Marketplace Content (9 Cols on Desktop) -->
            <div class="w-full lg:col-span-9 flex flex-col gap-space-lg">
              <!-- Spot Hero Spotlight Card (from Stitch b9834e6cb185480eb2b0032fdc19ea36) -->
              <article class="w-full bg-gradient-to-br from-primary-container via-surface-container-high to-surface-container-lowest p-space-lg sm:p-space-xl rounded-[28px] relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-lg">
                <div class="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-tertiary-fixed opacity-30 blur-3xl pointer-events-none"></div>
                <div class="flex flex-col gap-space-sm max-w-lg z-10 text-on-surface">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md self-start">
                    <span class="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
                    <span class="font-label-xs text-label-xs font-bold uppercase tracking-wider text-secondary">Talent Spotlight du Mois</span>
                  </div>
                  <h2 class="font-headline-lg text-headline-lg font-extrabold tracking-tight text-white drop-shadow-sm">
                    Développeur Mobile Flutter &amp; Paiement SATIM
                  </h2>
                  <p class="font-body-md text-body-md text-white/90">
                    Réalisez vos applications iOS &amp; Android aux normes bancaires algériennes. Plus de 34 applications livrées avec zéro défaut.
                  </p>
                  <div class="flex items-center gap-space-md pt-space-xs">
                    <button type="button" onclick="window.IntalentApp.navigate('freelancer?username=amine_benali')" class="px-space-lg py-3 rounded-full font-label-lg text-label-lg font-bold bg-tertiary-fixed text-primary-container shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                      <span>Réserver un créneau</span>
                      <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                    <div class="flex flex-col text-white">
                      <span class="font-label-xs text-label-xs uppercase font-bold text-tertiary-fixed">Taux Journalier</span>
                      <span class="font-title-md text-title-md font-extrabold">32,000 DZD <span class="font-normal text-xs">/ jour</span></span>
                    </div>
                  </div>
                </div>
                <div onclick="window.IntalentApp.navigate('freelancer?username=amine_benali')" class="cursor-pointer w-full md:w-64 bg-surface-container-lowest p-space-md rounded-2xl shadow-xl flex flex-col gap-space-sm z-10 relative">
                  <div class="relative w-full h-40 rounded-xl overflow-hidden bg-surface-container">
                    <img class="w-full h-full object-cover" src="https://randomuser.me/api/portraits/men/11.jpg" alt="Amine Benali">
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-bold">Top Vendeur</span>
                    <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-[11px] font-bold text-on-surface">📍 Alger 16</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="flex items-center gap-1">
                        <span class="font-label-lg text-label-lg font-bold text-on-surface">Amine Benali</span>
                        <span class="material-symbols-outlined text-secondary text-[16px] material-fill">check_circle</span>
                      </div>
                      <span class="font-label-xs text-label-xs text-on-surface-variant">Lead Mobile Engineer</span>
                    </div>
                    <div class="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-lg">
                      <span class="material-symbols-outlined text-amber-500 text-[16px] material-fill">star</span>
                      <span class="font-label-md text-label-md font-bold text-on-surface">5.0</span>
                    </div>
                  </div>
                </div>
              </article>

              <!-- 3-Column Service Bento Cards Grid -->
              ${services.length === 0 ? `
                <div class="bg-surface-container-lowest rounded-[28px] p-space-xl text-center shadow-sm">
                  <span class="material-symbols-outlined text-4xl text-secondary mb-2">search_off</span>
                  <h3 class="font-headline-sm text-on-surface font-bold">Aucun service ne correspond exactement à ce filtre</h3>
                  <p class="font-body-sm text-on-surface-variant mt-1 mb-4">Réinitialisez les filtres pour afficher l'ensemble des 104 services disponibles.</p>
                  <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-space-lg py-2.5 rounded-full bg-tertiary-fixed text-primary-container font-label-md font-bold">Afficher tous les services</button>
                </div>
              ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                  ${services.map(renderServiceCard).join("")}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire Search & Sidebar interactive handlers
    const searchForm = document.getElementById("explore-search-bar");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const qVal = searchForm.q.value.trim();
        const nextQs = new URLSearchParams(qs);
        if (qVal) nextQs.set("q", qVal); else nextQs.delete("q");
        App().navigate("explore?" + nextQs.toString());
      });
    }
    const sortSel = document.getElementById("explore-sort-select");
    if (sortSel) {
      sortSel.addEventListener("change", () => {
        const nextQs = new URLSearchParams(qs);
        nextQs.set("sort", sortSel.value);
        App().navigate("explore?" + nextQs.toString());
      });
    }
    const wilayaSel = document.getElementById("sidebar-wilaya-select");
    if (wilayaSel) {
      wilayaSel.addEventListener("change", () => {
        const nextQs = new URLSearchParams(qs);
        if (wilayaSel.value) nextQs.set("wilaya", wilayaSel.value); else nextQs.delete("wilaya");
        App().navigate("explore?" + nextQs.toString());
      });
    }
    const proCb = document.getElementById("filter-pro-only");
    if (proCb) {
      proCb.addEventListener("change", () => {
        const nextQs = new URLSearchParams(qs);
        if (proCb.checked) nextQs.set("pro_only", "true"); else nextQs.delete("pro_only");
        App().navigate("explore?" + nextQs.toString());
      });
    }
  };

  // =========================================================================
  // 3. ALL CATEGORIES DIRECTORY
  // =========================================================================
  window.IntalentPages["categories"] = async function (main, state) {
    const { escapeHtml } = App();
    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-gutter py-space-xl">
        <div class="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-bold uppercase tracking-wider">Répertoire des Compétences DZ</span>
            <h1 class="font-headline-xl text-headline-xl text-on-surface mt-2">Pôles d'Excellence &amp; Catégories</h1>
            <p class="font-body-md text-on-surface-variant mt-1">Sélectionnez un domaine pour explorer les services et nos 100 freelances algériens spécialisés.</p>
          </div>
          <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="px-space-lg py-3 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-bold shadow-md">
            Publier un projet sur-mesure
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          ${state.categories.map(c => {
            const meta = CATEGORY_META[c.slug] || { icon: "hub", bg: "bg-primary-fixed text-primary-container" };
            return `
              <div class="bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                <div>
                  <div class="relative h-44 rounded-2xl overflow-hidden mb-space-md cursor-pointer" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">
                    <img src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.name)}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-3 left-3 w-11 h-11 rounded-2xl ${meta.bg} flex items-center justify-center shadow-md">
                      <span class="material-symbols-outlined">${meta.icon}</span>
                    </div>
                  </div>
                  <h3 class="font-headline-sm text-on-surface font-bold cursor-pointer hover:text-secondary" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">${escapeHtml(c.name_fr || c.name)}</h3>
                  <div class="font-label-xs text-xs text-secondary mt-0.5 mb-2 font-bold">${escapeHtml(c.name)} • ${escapeHtml(c.name_ar)}</div>
                  <p class="font-body-sm text-on-surface-variant mb-4">${escapeHtml(c.description)}</p>
                </div>
                <div class="border-t border-surface-container-high pt-3 space-y-1.5">
                  ${(c.subcategories || []).map(sc => `
                    <a onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}')" class="cursor-pointer flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-surface-container-low font-body-sm text-on-surface hover:text-secondary transition-colors">
                      <span>${escapeHtml(sc.name_fr || sc.name)}</span>
                      <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    </a>
                  `).join("")}
                  <button type="button" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')" class="w-full mt-2 py-2.5 rounded-full bg-surface-container-low hover:bg-tertiary-fixed text-primary-container font-label-md font-bold transition-colors">
                    Explorer ce pôle →
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  };

  // =========================================================================
  // 4. SERVICE DETAILS — BENTO 3D (STITCH SCREEN 64357dd21d5242c2b2260a1696770b24)
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
        pkgFeats = ["Code source / Fichiers sources inclus", "Cession intégrale des droits (NDA)", "Support technique & déploiement"];
      }

      const favSaved = isFavorite("service", s.id);

      main.innerHTML = `
        <div class="max-w-7xl mx-auto px-gutter py-space-xl">
          <!-- Breadcrumb -->
          <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-md text-on-surface-variant font-label-md text-label-md">
            <div class="flex items-center gap-2">
              <a onclick="window.IntalentApp.navigate('home')" class="cursor-pointer hover:text-secondary transition-colors">Accueil</a>
              <span>/</span>
              <a onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(s.category_slug)}')" class="cursor-pointer hover:text-secondary transition-colors">${escapeHtml(s.category_name)}</a>
              <span>/</span>
              <span class="text-on-surface font-bold">Offre Certifiée SATIM</span>
            </div>
            <div class="flex items-center gap-space-sm">
              <button type="button" onclick="window.IntalentApp.toggleFavorite('service', ${s.id}, this)" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-2xs hover:bg-surface-container-high transition-colors ${favSaved ? 'text-error' : 'text-on-surface'} text-label-md font-bold">
                <span class="material-symbols-outlined text-base ${favSaved ? 'material-fill' : ''}">favorite</span>
                <span>Sauvegarder</span>
              </button>
              <button type="button" onclick="window.IntalentApp.openReportModal('service', ${s.id}, 'Service: ${escapeHtml(s.title)}')" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-2xs hover:bg-surface-container-high transition-colors text-on-surface text-label-md font-bold">
                <span class="material-symbols-outlined text-base">flag</span>
                <span>Signaler</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <!-- LEFT COLUMN: 8/12 -->
            <div class="lg:col-span-8 flex flex-col gap-space-xl">
              <div class="flex flex-col gap-space-sm">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold">PROTECTION ESCROW SATIM ACTIVE</span>
                  <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-bold">Facturation Auto-Entrepreneur Conforme</span>
                </div>
                <h1 class="font-headline-xl text-headline-lg lg:text-headline-xl text-on-surface tracking-tight leading-tight">
                  ${escapeHtml(s.title)}
                </h1>
                <div class="flex flex-wrap items-center gap-space-md pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <div class="flex items-center gap-2.5 cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username)}')">
                    <img class="w-11 h-11 rounded-full object-cover ring-2 ring-secondary/30" src="${escapeHtml(s.freelancer_avatar)}" alt="${escapeHtml(s.freelancer_name)}" onerror="this.src='/assets/logos/logo-dark.png'">
                    <div>
                      <div class="flex items-center gap-1 font-title-md text-on-surface font-bold">
                        <span>${escapeHtml(s.freelancer_name)}</span>
                        <span class="material-symbols-outlined text-secondary text-sm material-fill">verified</span>
                      </div>
                      <span class="text-xs text-on-surface-variant">@${escapeHtml(s.freelancer_username)} • ${escapeHtml(s.freelancer_wilaya)}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 font-label-md text-label-md text-on-surface bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-2xs">
                    <span class="material-symbols-outlined text-amber-500 text-sm material-fill">star</span>
                    <span class="font-bold">${Number(s.rating_avg || 5.0).toFixed(2)}</span>
                    <span class="text-on-surface-variant font-normal">(${s.review_count || 18} avis vérifiés)</span>
                  </div>
                </div>
              </div>

              <!-- Media Gallery -->
              <div class="flex flex-col gap-space-sm">
                <div class="relative w-full aspect-[16/10] rounded-[28px] overflow-hidden shadow-md bg-surface-container-high group">
                  <img id="main-gallery-view" class="w-full h-full object-cover" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(s.title)}">
                  <div class="absolute bottom-4 right-4 bg-primary-container/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-tertiary-fixed font-label-xs text-label-xs font-bold flex items-center gap-1 shadow-md">
                    <span class="material-symbols-outlined text-sm">verified_user</span>
                    <span>Livrables Audités Intalent</span>
                  </div>
                </div>
              </div>

              <!-- Description & Deliverables Bento -->
              <div class="bg-surface-container-lowest p-space-xl rounded-[28px] shadow-sm flex flex-col gap-space-lg">
                <div>
                  <span class="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Cahier des Charges &amp; Livrables</span>
                  <h2 class="font-headline-md text-headline-md text-on-surface mt-1">Détails de la prestation</h2>
                </div>
                <div class="font-body-md text-body-md text-on-surface whitespace-pre-line leading-relaxed">${escapeHtml(s.description)}</div>
                <div>
                  <h4 class="font-label-xs text-label-xs uppercase text-on-surface-variant font-bold mb-2">Stack Technique &amp; Compétences</h4>
                  <div class="flex flex-wrap gap-2">
                    ${skills.map(sk => `<span onclick="window.IntalentApp.navigate('explore?skill=${encodeURIComponent(sk)}')" class="cursor-pointer px-3 py-1 rounded-full bg-surface-container-low hover:bg-tertiary-fixed text-on-surface font-label-md text-label-md font-bold transition-colors">${escapeHtml(sk)}</span>`).join("")}
                  </div>
                </div>
              </div>

              <!-- Compare Packages Matrix Table -->
              <div class="bg-surface-container-lowest p-space-xl rounded-[28px] shadow-sm flex flex-col gap-space-lg overflow-hidden">
                <div>
                  <span class="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Grille Tarifaire Transparente</span>
                  <h2 class="font-headline-md text-headline-md text-on-surface mt-1">Comparez les 3 Packs</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left font-body-sm text-body-sm">
                    <thead>
                      <tr class="bg-surface-container-low text-on-surface font-title-md">
                        <th class="p-4 rounded-l-2xl">Critères</th>
                        <th class="p-4 text-center">
                          <div class="text-xs text-on-surface-variant font-normal">Basic</div>
                          <div class="font-bold">${escapeHtml(basicPkg.name)}</div>
                          <div class="text-secondary font-extrabold mt-1">${formatDZD(basicPkg.price_dzd)}</div>
                        </th>
                        <th class="p-4 text-center bg-secondary-fixed/40">
                          <div class="inline-block bg-primary-container text-tertiary-fixed font-label-xs text-[10px] uppercase px-2 py-0.5 rounded-full mb-1">Recommandé</div>
                          <div class="font-bold text-primary-container">${escapeHtml(stdPkg.name)}</div>
                          <div class="text-secondary font-extrabold mt-1">${formatDZD(stdPkg.price_dzd)}</div>
                        </th>
                        <th class="p-4 text-center rounded-r-2xl">
                          <div class="text-xs text-on-surface-variant font-normal">Premium</div>
                          <div class="font-bold">${escapeHtml(premPkg.name)}</div>
                          <div class="text-secondary font-extrabold mt-1">${formatDZD(premPkg.price_dzd)}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-container-high text-on-surface">
                      <tr>
                        <td class="p-4 font-bold">Contenu du Pack</td>
                        <td class="p-4 text-center text-xs">${escapeHtml(basicPkg.description)}</td>
                        <td class="p-4 text-center bg-secondary-fixed/15 text-xs font-semibold">${escapeHtml(stdPkg.description)}</td>
                        <td class="p-4 text-center text-xs">${escapeHtml(premPkg.description)}</td>
                      </tr>
                      <tr>
                        <td class="p-4 font-bold">Délai garanti</td>
                        <td class="p-4 text-center">${basicPkg.delivery_days} jours</td>
                        <td class="p-4 text-center bg-secondary-fixed/15 font-bold text-secondary">${stdPkg.delivery_days} jours</td>
                        <td class="p-4 text-center font-bold">${premPkg.delivery_days} jours</td>
                      </tr>
                      <tr>
                        <td class="p-4 font-bold">Sélection</td>
                        <td class="p-4 text-center">
                          <button type="button" class="pkg-select-matrix px-4 py-2 rounded-full bg-surface-container-low hover:bg-tertiary-fixed text-primary-container font-label-md text-xs font-bold transition-all" data-tier="basic">Choisir Basic</button>
                        </td>
                        <td class="p-4 text-center bg-secondary-fixed/15">
                          <button type="button" class="pkg-select-matrix px-4 py-2 rounded-full bg-tertiary-fixed text-primary-container font-label-md text-xs font-bold transition-all shadow-sm" data-tier="standard">Choisir Standard</button>
                        </td>
                        <td class="p-4 text-center">
                          <button type="button" class="pkg-select-matrix px-4 py-2 rounded-full bg-primary-container text-tertiary-fixed font-label-md text-xs font-bold transition-all" data-tier="premium">Choisir Premium</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: 4/12 STICKY BENTO ORDER BOX -->
            <div class="lg:col-span-4 lg:sticky lg:top-28 flex flex-col gap-space-md">
              <div class="bg-surface-container-lowest rounded-[28px] shadow-[0_24px_48px_-12px_rgba(37,8,63,0.12)] overflow-hidden p-space-lg flex flex-col gap-space-md border border-surface-container-high">
                <div class="grid grid-cols-3 bg-surface-container-low rounded-full p-1 text-center font-label-md text-xs">
                  ${packages.map(p => `
                    <button type="button" class="package-tab py-2 rounded-full font-bold transition-all ${p.tier === selectedTier ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}" data-tier="${escapeHtml(p.tier)}">
                      ${escapeHtml(p.tier.toUpperCase())}
                    </button>
                  `).join("")}
                </div>

                <div class="flex flex-col gap-space-sm pt-space-xs">
                  <div class="flex items-baseline justify-between gap-2">
                    <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(pkg.name)}</span>
                    <span class="font-headline-md text-headline-md font-extrabold text-secondary shrink-0">${formatDZD(pkg.price_dzd)}</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    ${escapeHtml(pkg.description)}
                  </p>
                  <div class="flex items-center justify-between py-2.5 text-on-surface font-label-md text-label-md bg-surface-container-low px-3.5 rounded-2xl">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-secondary text-base">schedule</span>
                      <span>Livraison ${pkg.delivery_days}j</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-secondary text-base">replay</span>
                      <span>${pkg.revisions >= 50 ? 'Illimitées' : pkg.revisions + ' Révisions'}</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2 py-2 text-body-sm text-on-surface">
                    ${pkgFeats.map(f => `
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>${escapeHtml(f)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>

                ${(s.extras || []).length > 0 ? `
                  <div class="bg-surface-container-low p-space-md rounded-2xl flex flex-col gap-2">
                    <span class="font-label-md text-label-md text-on-surface font-bold">Options supplémentaires :</span>
                    ${s.extras.map(ex => `
                      <label class="flex items-center justify-between text-body-sm text-on-surface cursor-pointer select-none">
                        <div class="flex items-center gap-2">
                          <input type="checkbox" class="extra-checkbox w-4 h-4 rounded accent-secondary" value="${ex.id}" data-price="${ex.price_dzd}">
                          <span>${escapeHtml(ex.title)}</span>
                        </div>
                        <span class="font-label-md text-xs font-bold text-secondary">+${formatDZD(ex.price_dzd)}</span>
                      </label>
                    `).join("")}
                  </div>
                ` : ""}

                <div class="flex flex-col gap-space-xs">
                  <button type="button" id="proceed-checkout-btn" class="w-full py-4 rounded-full bg-tertiary-fixed text-primary-container hover:scale-[1.02] font-label-lg text-label-lg font-extrabold transition-all shadow-[0_10px_24px_-6px_rgba(202,243,0,0.5)] flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">lock</span>
                    <span id="proceed-checkout-text">Bloquer les fonds (${formatDZD(pkg.price_dzd)})</span>
                  </button>
                  <button type="button" onclick="window.IntalentApp.openContactModal(${s.freelancer_id}, '${escapeHtml(s.freelancer_name)}', 'Devis sur-mesure: ${escapeHtml(s.title)}')" class="w-full py-3 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-bold transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">chat</span>
                    <span>Discuter avec ${escapeHtml(s.freelancer_name.split(' ')[0])}</span>
                  </button>
                </div>

                <div class="pt-1 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                  <span class="material-symbols-outlined text-sm text-secondary material-fill">verified_user</span>
                  <span>Séquestre SATIM • CIB &amp; Edahabia</span>
                </div>
              </div>
            </div>
          </div>

          ${(s.related_services || []).length ? `
            <div class="mt-space-xl pt-space-lg">
              <h2 class="font-headline-lg text-headline-sm lg:text-headline-lg text-on-surface mb-space-md">Autres prestations vérifiées dans ce domaine</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">${s.related_services.slice(0, 3).map(renderServiceCard).join("")}</div>
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
        btnText.textContent = `Bloquer les fonds (${formatDZD(sum)})`;
      }
      checkboxes.forEach(cb => cb.addEventListener("change", updateButtonTotal));

      btn.addEventListener("click", () => {
        if (!state.user) {
          App().showToast("Veuillez vous connecter pour sécuriser votre contrat sous séquestre.", true);
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
  // 5. CHECKOUT & TUNNEL DE PAIEMENT SÉCURISÉ DZD (STITCH SCREEN 5186fd9454c24cad9c7b2c4b5a692b33)
  // =========================================================================
  window.IntalentPages["checkout"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }
    const serviceId = state.params.service_id || 1;
    const tier = state.params.tier || "standard";
    const extraIds = (state.params.extras || "").split(",").filter(Boolean).map(Number);

    const { service: s } = await api("/api/services/" + encodeURIComponent(serviceId));
    const pkg = (s.packages || []).find(p => p.tier === tier) || s.packages[0];
    const chosenExtras = (s.extras || []).filter(e => extraIds.includes(Number(e.id)));

    const subtotal = Number(pkg.price_dzd) + chosenExtras.reduce((acc, e) => acc + Number(e.price_dzd), 0);
    const commPct = Number(state.settings.commission_rate_pct || 10);
    const fee = Math.round(subtotal * (commPct / 100));
    const total = subtotal + fee;

    let selectedMethod = "Carte Edahabia (Algérie Poste)";

    main.innerHTML = `
      <div class="relative w-full overflow-hidden pb-space-xl">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-48 right-0 w-[30rem] h-[30rem] bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-gutter pt-space-lg">
          <!-- Stepper Indicator (from Stitch 5186fd9454c24cad9c7b2c4b5a692b33) -->
          <div class="mb-space-xl p-space-md md:p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center">
              <div class="flex items-center gap-space-sm">
                <span class="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-md text-label-md font-bold">
                  <span class="material-symbols-outlined text-base">check</span>
                </span>
                <div>
                  <p class="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-bold">Étape 01</p>
                  <p class="font-label-lg text-label-lg text-on-surface">Cahier des Charges</p>
                </div>
              </div>
              <div class="flex items-center gap-space-sm relative">
                <span class="w-8 h-8 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center font-label-md text-label-md font-bold shadow-md">02</span>
                <div>
                  <div class="flex items-center gap-1.5">
                    <p class="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">En cours</p>
                    <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                  </div>
                  <p class="font-label-lg text-label-lg text-on-surface font-bold">Mode de Paiement &amp; Séquestre DZD</p>
                </div>
              </div>
              <div class="flex items-center gap-space-sm opacity-60">
                <span class="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md">03</span>
                <div>
                  <p class="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-bold">Étape 03</p>
                  <p class="font-label-lg text-label-lg text-on-surface-variant">Lancement &amp; Dépôt Garanti</p>
                </div>
              </div>
            </div>
          </div>

          <form id="checkout-order-form" class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <!-- LEFT COLUMN: Payment Methods, Brief & Fiscal Data (7 cols) -->
            <div class="lg:col-span-7 flex flex-col gap-space-lg">
              <div class="flex items-start gap-space-sm p-space-md rounded-2xl bg-surface-container-high">
                <span class="material-symbols-outlined text-secondary text-headline-sm">verified_user</span>
                <div class="flex-1">
                  <div class="flex items-center gap-space-xs">
                    <span class="font-label-lg text-label-lg font-bold text-on-surface">Protocole Sécurisé SATIM / GIE Monétique</span>
                    <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-xs text-label-xs font-bold uppercase tracking-wider">Test Sandbox</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Les règlements par monétique algérienne transitent par des flux chiffrés PCI-DSS v4.0 sous agrément de la Banque d'Algérie.
                  </p>
                </div>
              </div>

              <!-- 1. Cahier des charges -->
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                <h3 class="font-headline-sm text-headline-sm text-on-surface">1. Cahier des charges &amp; Brief de mission</h3>
                <p class="font-body-sm text-on-surface-variant">${escapeHtml(s.requirements_prompt || "Décrivez vos objectifs, délais et livrables attendus.")}</p>
                <textarea name="requirements" rows="3" class="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-secondary/30" placeholder="Bonjour ${escapeHtml(s.freelancer_name)}, voici les spécifications de notre projet..." required>Mise en place complète selon le pack ${escapeHtml(pkg.name)} avec livrables sources et documentation technique.</textarea>
                <div>
                  <label class="font-label-md text-on-surface block mb-1">Joindre un cahier des charges PDF / Archive (Optionnel)</label>
                  <input type="file" id="checkout-ref-file" class="w-full p-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm">
                </div>
              </div>

              <!-- 2. Méthodes de Paiement Algériennes -->
              <div class="flex flex-col gap-space-sm">
                <div class="flex items-center justify-between">
                  <h2 class="font-headline-sm text-headline-sm text-on-surface">2. Moyen de règlement (Séquestre Algérie)</h2>
                  <span class="font-label-xs text-label-xs text-on-surface-variant font-semibold">Devise : DZD (د.ج)</span>
                </div>

                <!-- Option 1: EDAHABIA -->
                <div class="method-option-card p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border-2 border-primary-container cursor-pointer transition-all" data-method="Carte Edahabia (Algérie Poste)">
                  <div class="flex items-start justify-between gap-space-md">
                    <div class="flex items-center gap-space-md">
                      <div class="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center p-1">
                        <div class="w-2 h-2 rounded-full bg-tertiary-fixed"></div>
                      </div>
                      <div>
                        <div class="flex items-center gap-space-xs">
                          <span class="font-title-md text-title-md font-bold text-on-surface">Carte Edahabia</span>
                          <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs font-bold">Algérie Poste</span>
                        </div>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Réseau Monétique Algérie Poste certifié • Sans frais additionnels</p>
                      </div>
                    </div>
                    <div class="hidden sm:flex items-center justify-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-600 text-on-primary font-label-xs text-label-xs font-extrabold tracking-widest shadow-sm">
                      EDAHABIA
                    </div>
                  </div>
                  <div class="mt-space-md pt-space-md border-t border-surface-container-high grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                    <div class="sm:col-span-2">
                      <label class="font-label-xs text-on-surface-variant block mb-1">Numéro de carte Edahabia / CIB</label>
                      <input type="text" value="6035 9410 7721 8829" class="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm">
                    </div>
                    <div>
                      <label class="font-label-xs text-on-surface-variant block mb-1">Expiration / CVV2</label>
                      <input type="text" value="08/28 • 923" class="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-center">
                    </div>
                  </div>
                </div>

                <!-- Option 2: CIB -->
                <div class="method-option-card p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border-2 border-transparent hover:border-secondary/40 cursor-pointer transition-all" data-method="Carte Interbancaire CIB (SATIM)">
                  <div class="flex items-center justify-between gap-space-md">
                    <div class="flex items-center gap-space-md">
                      <div class="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center"></div>
                      <div>
                        <div class="flex items-center gap-space-xs">
                          <span class="font-title-md text-title-md font-bold text-on-surface">Carte Interbancaire CIB</span>
                          <span class="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-xs text-label-xs font-bold">SATIM</span>
                        </div>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Banques affiliées : BDL, BNA, CPA, BEA, SGA, Gulf Bank DZ</p>
                      </div>
                    </div>
                    <div class="font-label-xs text-label-xs font-black tracking-widest text-primary-container bg-surface-container px-2.5 py-1 rounded">CIB</div>
                  </div>
                </div>

                <!-- Option 3: Virement -->
                <div class="method-option-card p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border-2 border-transparent hover:border-secondary/40 cursor-pointer transition-all" data-method="Virement Bancaire RIB Entreprise">
                  <div class="flex items-center justify-between gap-space-md">
                    <div class="flex items-center gap-space-md">
                      <div class="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center"></div>
                      <div>
                        <div class="flex items-center gap-space-xs">
                          <span class="font-title-md text-title-md font-bold text-on-surface">Virement Bancaire Fédéré (RIB)</span>
                          <span class="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-bold">Entreprises &amp; Grands Comptes</span>
                        </div>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Attestation de virement instantanée et facturation fiscale B2B</p>
                      </div>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant">account_balance</span>
                  </div>
                </div>
              </div>

              <!-- 3. Données de Facturation & Traçabilité Fiscale -->
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                <h3 class="font-headline-sm text-headline-sm text-on-surface">3. Données de Facturation &amp; Traçabilité Fiscale</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div class="flex flex-col gap-1">
                    <label class="font-label-md text-label-md font-semibold text-on-surface">Raison sociale ou Nom complet</label>
                    <input class="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm" type="text" value="${escapeHtml(state.user.full_name || 'SARL Algiers Tech Ventures')}">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="font-label-md text-label-md font-semibold text-on-surface">Email de confirmation &amp; Reçu</label>
                    <input class="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm" type="email" value="${escapeHtml(state.user.email || 'billing@intalent.dz')}">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="font-label-md text-label-md font-semibold text-on-surface">Téléphone mobile (+213)</label>
                    <input class="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm" type="tel" value="+213 550 49 20 11">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="font-label-md text-label-md font-semibold text-on-surface">NIF / Numéro Auto-Entrepreneur (ANA)</label>
                    <input class="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm" type="text" value="001916019028472">
                  </div>
                </div>
              </div>

              <!-- Submit & Interactive State Simulator -->
              <button type="submit" class="w-full py-4 px-space-lg rounded-full bg-primary-container text-white flex items-center justify-between group hover:bg-secondary transition-all shadow-xl">
                <div class="flex items-center gap-space-sm">
                  <span class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-tertiary-fixed">
                    <span class="material-symbols-outlined text-xl">lock</span>
                  </span>
                  <div class="text-left">
                    <p class="font-label-xs text-label-xs text-surface-container-high tracking-wider uppercase font-bold">Séquestre Bancaire SATIM</p>
                    <p class="font-headline-sm text-headline-sm text-white font-extrabold">Confirmer &amp; Séquestrer ${formatDZD(total)}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 pr-2">
                  <span class="font-label-lg text-label-lg font-bold text-tertiary-fixed">Autoriser le dépôt</span>
                  <span class="material-symbols-outlined text-tertiary-fixed">arrow_forward</span>
                </div>
              </button>
            </div>

            <!-- RIGHT COLUMN: Order Summary Bento (5 cols) -->
            <div class="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-28">
              <div class="p-space-lg rounded-[28px] bg-surface-container-lowest shadow-md flex flex-col gap-space-md relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-secondary-container to-tertiary-fixed"></div>
                <div class="flex items-start justify-between gap-space-sm pt-space-xs">
                  <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs text-label-xs font-bold">Pack ${escapeHtml(pkg.tier.toUpperCase())}</span>
                  <div class="flex items-center gap-1 text-on-surface-variant font-label-xs text-label-xs">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    <span>Délai : ${pkg.delivery_days} jours ouvrés</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-extrabold leading-snug">${escapeHtml(s.title)}</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${escapeHtml(pkg.description)}</p>
                </div>
                <div class="flex items-center gap-space-sm p-space-sm rounded-2xl bg-surface-container-low">
                  <img class="w-12 h-12 rounded-xl object-cover" src="${escapeHtml(s.freelancer_avatar)}" alt="">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                      <p class="font-title-md text-title-md text-on-surface font-bold truncate">${escapeHtml(s.freelancer_name)}</p>
                      <span class="material-symbols-outlined text-secondary text-base material-fill">verified</span>
                    </div>
                    <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${escapeHtml(s.freelancer_wilaya)}</p>
                  </div>
                </div>
                <div class="space-y-2 pt-2 border-t border-surface-container-high font-body-sm">
                  <div class="flex justify-between">
                    <span>Prestation (${escapeHtml(pkg.name)})</span>
                    <strong>${formatDZD(pkg.price_dzd)}</strong>
                  </div>
                  ${chosenExtras.map(e => `
                    <div class="flex justify-between text-on-surface-variant">
                      <span>+ ${escapeHtml(e.title)}</span>
                      <strong>${formatDZD(e.price_dzd)}</strong>
                    </div>
                  `).join("")}
                  <div class="flex justify-between text-on-surface-variant">
                    <span>Protection Séquestre SATIM (${commPct}%)</span>
                    <strong>${formatDZD(fee)}</strong>
                  </div>
                  <div class="flex justify-between pt-3 border-t border-surface-container-high font-headline-sm text-on-surface font-extrabold">
                    <span>Total Séquestré DZD</span>
                    <span class="text-secondary">${formatDZD(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    // Payment method card selection
    main.querySelectorAll(".method-option-card").forEach(card => {
      card.addEventListener("click", () => {
        selectedMethod = card.getAttribute("data-method");
        main.querySelectorAll(".method-option-card").forEach(c => {
          c.classList.remove("border-primary-container");
          c.classList.add("border-transparent");
        });
        card.classList.remove("border-transparent");
        card.classList.add("border-primary-container");
      });
    });

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
            payment_method: selectedMethod
          })
        });
        showToast(`Contrat #${res.order_number} confirmé et fonds séquestrés via ${selectedMethod} !`);
        await App().refreshBootstrap();
        App().navigate(`order-detail?id=${res.order_id}`);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  // =========================================================================
  // 6. ORDER DETAIL & SECURE DELIVERY
  // =========================================================================
  window.IntalentPages["order-detail"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    const oid = state.params.id;
    const { order: o } = await api("/api/orders/" + encodeURIComponent(oid));
    const isClient = state.user && state.user.id === o.client_id;
    const isFreelancer = state.user && state.user.id === o.freelancer_id;

    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-gutter py-space-xl">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
          <div>
            <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold">CONTRAT SÉQUESTRE #${escapeHtml(o.order_number)}</span>
            <h1 class="font-headline-lg text-headline-lg text-on-surface mt-2">${escapeHtml(o.service_title)}</h1>
            <p class="font-body-sm text-on-surface-variant">Client : <strong>${escapeHtml(o.client_name)}</strong> • Freelance : <strong>${escapeHtml(o.freelancer_name)}</strong> • Statut : <strong class="text-secondary uppercase">${escapeHtml(o.status)}</strong></p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="window.IntalentApp.openContactModal(${isClient ? o.freelancer_id : o.client_id}, '${escapeHtml(isClient ? o.freelancer_name : o.client_name)}', 'Commande #${escapeHtml(o.order_number)}')" class="px-4 py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">videocam</span>
              <span>Messagerie &amp; Appel Direct</span>
            </button>
            <button type="button" onclick="window.IntalentApp.openReportModal('order_dispute', ${o.id}, 'Litige Commande #${escapeHtml(o.order_number)}')" class="px-4 py-2.5 rounded-full bg-error-container text-on-error-container font-label-md font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">gavel</span>
              <span>Arbitrage</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div class="lg:col-span-8 flex flex-col gap-space-lg">
            <div class="bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm">
              <h3 class="font-headline-sm text-on-surface font-bold mb-2">Cahier des charges contractuel</h3>
              <div class="p-space-md rounded-2xl bg-surface-container-low font-body-md text-on-surface whitespace-pre-line">${escapeHtml(o.requirements_submitted)}</div>
            </div>

            <div class="bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm space-y-4">
              <h3 class="font-headline-sm text-on-surface font-bold">Livrables &amp; Versions (${(o.deliveries || []).length})</h3>
              ${(o.deliveries || []).length === 0 ? `<p class="font-body-sm text-on-surface-variant p-4 rounded-2xl bg-surface-container-low">Le prestataire prépare actuellement vos livrables.</p>` :
                o.deliveries.map(d => `
                  <div class="p-space-md rounded-2xl bg-surface-container-low border-l-4 border-secondary">
                    <div class="font-label-xs text-secondary font-bold">Livré le ${escapeHtml(d.created_at)}</div>
                    <p class="font-body-md text-on-surface mt-1 whitespace-pre-line">${escapeHtml(d.message)}</p>
                  </div>
                `).join("")
              }

              ${isFreelancer && ["in_progress", "revision_requested", "delivered"].includes(o.status) ? `
                <form id="submit-delivery-form" class="space-y-3 pt-4 border-t border-surface-container-high">
                  <h4 class="font-title-md text-on-surface font-bold">Envoyer une nouvelle livraison</h4>
                  <textarea name="message" rows="3" class="w-full p-3 rounded-2xl bg-surface-container-low text-on-surface font-body-sm outline-none" placeholder="Détaillez le contenu de votre livraison..." required></textarea>
                  <input type="file" id="delivery-file-input" class="w-full p-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm">
                  <button type="submit" class="px-6 py-3 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-bold shadow-md">Soumettre les livrables</button>
                </form>
              ` : ""}

              ${isClient && o.status === "delivered" ? `
                <div class="pt-4 border-t border-surface-container-high space-y-3">
                  <div class="p-space-md rounded-2xl bg-tertiary-fixed/25 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div class="font-title-md text-on-surface font-bold">Livrables prêts pour validation</div>
                      <div class="font-body-sm text-on-surface-variant">Approuvez pour libérer ${formatDZD(o.freelancer_net_dzd)} au freelance.</div>
                    </div>
                    <button type="button" id="accept-delivery-btn" class="px-6 py-3 rounded-full bg-primary-container text-tertiary-fixed font-label-lg font-bold shadow-md">
                      Valider &amp; Libérer les Fonds
                    </button>
                  </div>
                  <form id="request-revision-form" class="flex gap-2">
                    <input type="text" name="reason" class="flex-1 h-11 px-4 rounded-full bg-surface-container-low text-on-surface font-body-sm outline-none" placeholder="Demander un ajustement..." required>
                    <button type="submit" class="px-5 py-2.5 rounded-full bg-surface-container-high text-on-surface font-label-md font-bold">Révision</button>
                  </form>
                </div>
              ` : ""}
            </div>
          </div>

          <div class="lg:col-span-4 flex flex-col gap-space-md">
            <div class="bg-primary-container text-on-primary rounded-[28px] p-space-lg shadow-lg space-y-2">
              <span class="font-label-xs text-tertiary-fixed uppercase font-bold">Séquestre SATIM Actif</span>
              <div class="font-headline-lg text-white font-extrabold">${formatDZD(o.total_dzd)}</div>
              <p class="font-body-sm text-outline-variant">Net Freelance : <strong>${formatDZD(o.freelancer_net_dzd)}</strong> • Commission (${o.commission_rate_pct}%) : <strong>${formatDZD(o.platform_fee_dzd)}</strong></p>
            </div>
            <div class="bg-surface-container-lowest rounded-[28px] p-space-lg shadow-sm space-y-2">
              <h4 class="font-title-md text-on-surface font-bold">Historique</h4>
              ${(o.history || []).map(h => `
                <div class="border-l-2 border-secondary pl-3 py-1">
                  <div class="font-label-xs text-secondary font-bold uppercase">${escapeHtml(h.status)}</div>
                  <div class="font-body-sm text-on-surface">${escapeHtml(h.note)}</div>
                </div>
              `).join("")}
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
          showToast("Commande validée et fonds débloqués !");
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
          showToast("Demande de révision envoyée.");
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
      <div class="max-w-7xl mx-auto px-gutter py-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-fixed text-primary-container font-label-md text-xs font-extrabold uppercase tracking-wider">
              <span class="material-symbols-outlined text-base">android</span>
              <span>APPLICATION OFFICIELLE INTALENT ANDROID • v3.0</span>
            </div>
            <div class="flex items-center gap-4">
              <img src="/assets/logos/logo-dark.png" alt="INTALENT" class="h-12 w-auto object-contain">
              <span class="px-3 py-1 rounded-full bg-primary-container text-tertiary-fixed text-xs font-extrabold">FR • العربية • EN</span>
            </div>
            <h1 class="font-headline-xl text-3xl sm:text-4xl font-extrabold text-on-surface leading-tight">
              Téléchargez l'Application Mobile INTALENT Algérie (APK)
            </h1>
            <p class="text-on-surface-variant text-base leading-relaxed">
              Emportez tout l'écosystème <strong>INTALENT</strong> dans votre poche. Conçue avec l'identité visuelle officielle Bento 3D, l'application mobile supporte intégralement les <strong>3 langues (Français, العربية RTL, English)</strong>, les paiements Escrow en <strong>DZD (CIB, Edahabia, BaridiMob)</strong> et la messagerie temps réel.
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="/downloads/intalent-algeria.apk" download="intalent-algeria.apk" class="px-7 py-4 rounded-full bg-tertiary-fixed text-primary-container font-label-lg font-extrabold text-sm shadow-[0_10px_24px_-6px_rgba(202,243,0,0.5)] hover:scale-105 transition-all inline-flex items-center gap-3">
                <span class="material-symbols-outlined text-2xl">download</span>
                <div class="text-left">
                  <div class="text-[10px] uppercase tracking-wider">Téléchargement Direct</div>
                  <div class="text-base">Télécharger intalent-algeria.apk</div>
                </div>
              </a>
              <a href="/mobile.html" target="_blank" class="px-6 py-4 rounded-full bg-primary-container text-white hover:bg-secondary font-label-lg font-bold text-sm transition-all inline-flex items-center gap-2.5">
                <span class="material-symbols-outlined text-xl text-tertiary-fixed">open_in_new</span>
                <span>Ouvrir l'App Plein Écran (PWA)</span>
              </a>
            </div>
          </div>

          <div class="lg:col-span-5 flex flex-col items-center">
            <div class="w-full max-w-[390px] rounded-[42px] bg-primary-container p-3.5 shadow-[0_24px_60px_rgba(37,8,63,0.35)] border-4 border-secondary/40">
              <div class="w-28 h-5 bg-black/50 rounded-full mx-auto mb-2.5 flex items-center justify-center">
                <span class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed"></span>
              </div>
              <div class="rounded-[30px] overflow-hidden bg-white h-[680px]">
                <iframe src="/mobile.html" title="Aperçu Interactif Intalent APK" class="w-full h-full border-0"></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
})();
