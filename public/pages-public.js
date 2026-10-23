window.IntalentPages = window.IntalentPages || {};

(function () {
  const App = () => window.IntalentApp;

  // =========================================================================
  // 1. HOMEPAGE
  // =========================================================================
  window.IntalentPages["home"] = async function (main, state) {
    const { t, escapeHtml, formatDZD, renderServiceCard, api } = App();
    const [svcRes, flRes] = await Promise.all([
      api("/api/services?per_page=8"),
      api("/api/freelancers")
    ]);

    const catCards = state.categories.map(c => {
      const cname = state.lang === "fr" ? c.name_fr : (state.lang === "ar" ? c.name_ar : c.name);
      return `
        <div class="category-card" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">
          <img src="${escapeHtml(c.image_url)}" alt="${escapeHtml(cname)}" loading="lazy">
          <div class="category-card-body">
            <div class="category-card-title">${escapeHtml(cname)}</div>
            <p style="font-size:0.83rem;color:var(--text-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(c.description)}</p>
          </div>
        </div>
      `;
    }).join("");

    const bannersHtml = (state.banners || []).map(b => `
      <div style="background:${b.bg_gradient || 'linear-gradient(135deg,#25083F,#8B43F5)'};color:#FFF;border-radius:var(--radius-lg);padding:32px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:20px;">
        <div style="max-width:680px;">
          <span class="badge" style="background:rgba(255,255,255,0.2);color:#FFF;margin-bottom:10px;">${escapeHtml(b.badge_text)}</span>
          <h3 style="font-size:1.6rem;font-weight:800;margin-bottom:8px;">${escapeHtml(b.title)}</h3>
          <p style="color:rgba(255,255,255,0.86);">${escapeHtml(b.subtitle)}</p>
        </div>
        <button class="btn" style="background:#FFF;color:var(--brand-deep);" onclick="window.IntalentApp.navigate('${escapeHtml(b.cta_link)}')">${escapeHtml(b.cta_text)} →</button>
      </div>
    `).join("");

    const featuredFreelancers = (flRes.freelancers || []).slice(0, 4).map(f => `
      <div class="card-panel" style="margin-bottom:0;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <img src="${escapeHtml(f.avatar_url)}" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--brand-violet);">
            <div>
              <div style="font-weight:800;font-size:1.02rem;cursor:pointer;" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">${escapeHtml(f.full_name)}</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);">📍 ${escapeHtml(f.wilaya)} • ★ ${Number(f.rating_avg || 5).toFixed(1)} (${f.review_count || 0})</div>
              <div style="margin-top:4px;">
                ${f.is_pro ? `<span class="badge badge-pro">✦ PRO</span>` : ""}
                ${f.is_verified ? `<span class="badge badge-success">✓ Verified</span>` : ""}
              </div>
            </div>
          </div>
          <p style="font-size:0.88rem;font-weight:600;color:var(--brand-deep);margin-bottom:8px;">${escapeHtml(f.headline)}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
            ${(f.skills || []).slice(0, 3).map(sk => `<span class="badge badge-status">${escapeHtml(sk.skill_name)}</span>`).join("")}
          </div>
        </div>
        <button class="btn btn-outline btn-sm" style="width:100%;" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">View Profile & Portfolio</button>
      </div>
    `).join("");

    main.innerHTML = `
      <section class="hero-section">
        <div class="container hero-grid">
          <div>
            <div class="hero-badge">✦ ${escapeHtml(t("hero_badge"))}</div>
            <h1 class="hero-title">
              ${escapeHtml(t("hero_title_1"))} <span class="accent">${escapeHtml(t("hero_title_accent"))}</span> ${escapeHtml(t("hero_title_2"))}
            </h1>
            <p class="hero-subtitle">${escapeHtml(t("hero_subtitle"))}</p>
            <form class="hero-search-box" onsubmit="event.preventDefault(); window.IntalentApp.navigate('explore?q=' + encodeURIComponent(this.q.value))">
              <input type="text" name="q" placeholder="${escapeHtml(t("search_placeholder"))}">
              <button type="submit" class="btn btn-primary btn-lg">${escapeHtml(t("search_btn"))}</button>
            </form>
            <div class="hero-tags">
              <span>${escapeHtml(t("popular"))}</span>
              <span class="hero-tag-pill" onclick="window.IntalentApp.navigate('explore?q=CIB')">CIB / Edahabia E-Pay</span>
              <span class="hero-tag-pill" onclick="window.IntalentApp.navigate('explore?category=graphics-design')">Logo & Brand Book</span>
              <span class="hero-tag-pill" onclick="window.IntalentApp.navigate('explore?category=ai-data-services')">AI Darija Chatbot</span>
              <span class="hero-tag-pill" onclick="window.IntalentApp.navigate('explore?q=Odoo')">Odoo ERP Algeria</span>
            </div>
          </div>
          <div class="hero-showcase-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
              <img src="/assets/logos/logo-white-purple.png" alt="Intalent" style="height:38px;">
              <span class="badge badge-pro">✦ Vetted Algerian Talent</span>
            </div>
            <div style="background:rgba(37,8,63,0.65);border-radius:12px;padding:16px;margin-bottom:12px;">
              <div style="font-size:0.8rem;color:var(--brand-lavender);font-weight:700;">DIRECT HIRE OR PACKAGED GIGS</div>
              <div style="font-size:1.15rem;font-weight:700;margin:4px 0;">Transparent Pricing in Algerian Dinar (DZD)</div>
              <p style="font-size:0.85rem;color:rgba(255,255,255,0.78);">Compare Basic, Standard, and Premium packages, add custom extras, and track every order milestone.</p>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <button class="btn btn-primary" onclick="window.IntalentApp.navigate('post-project')">Post a Project Brief</button>
              <button class="btn" style="background:rgba(255,255,255,0.14);color:#FFF;" onclick="window.IntalentApp.navigate('pro-talent')">Explore Intalent Pro</button>
            </div>
          </div>
        </div>
      </section>

      <div class="trust-strip">
        <div class="container trust-strip-inner">
          <span>${escapeHtml(t("trusted_by"))}</span>
          <div style="display:flex;gap:24px;flex-wrap:wrap;color:var(--brand-deep);font-weight:800;">
            <span>58 WILAYAS COVERAGE</span>
            <span>•</span>
            <span>PROTECTED ORDER WORKFLOW</span>
            <span>•</span>
            <span>VERIFIED PRO FREELANCERS</span>
            <span>•</span>
            <span>TRILINGUAL (FR / AR / EN)</span>
          </div>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(t("popular_categories"))}</h2>
              <p class="section-subtitle">Browse specialized Algerian talent across software, design, AI, marketing, and business consulting.</p>
            </div>
            <button class="btn btn-outline" onclick="window.IntalentApp.navigate('categories')">${escapeHtml(t("view_all"))} Categories →</button>
          </div>
          <div class="grid-4">${catCards}</div>
        </div>
      </section>

      <section class="section" style="background:var(--brand-pale);border-top:1px solid var(--border-color);border-bottom:1px solid var(--border-color);">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(t("featured_services"))}</h2>
              <p class="section-subtitle">Handpicked services with transparent DZD packages, clear delivery times, and verified client reviews.</p>
            </div>
            <button class="btn btn-primary" onclick="window.IntalentApp.navigate('explore')">Explore All Services →</button>
          </div>
          <div class="grid-4">
            ${(svcRes.services || []).map(renderServiceCard).join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${bannersHtml}
          <div class="section-header" style="margin-top:44px;">
            <div>
              <h2 class="section-title">Featured Algerian Freelancers</h2>
              <p class="section-subtitle">Work directly with top-rated specialists across Algiers, Oran, Constantine, Sétif, and beyond.</p>
            </div>
            <button class="btn btn-outline" onclick="window.IntalentApp.navigate('freelancers')">All Freelancers →</button>
          </div>
          <div class="grid-4">${featuredFreelancers}</div>
        </div>
      </section>
    `;
  };

  // =========================================================================
  // 2. EXPLORE SERVICES & SEARCH RESULTS (REAL DATABASE QUERIES & FILTERS)
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

    const subPills = activeCat && activeCat.subcategories ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
        <button class="btn btn-sm ${!p.subcategory ? 'btn-deep' : 'btn-outline'}" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(activeCat.slug)}')">All ${escapeHtml(activeCat.name)}</button>
        ${activeCat.subcategories.map(sc => `
          <button class="btn btn-sm ${p.subcategory === sc.slug ? 'btn-deep' : 'btn-outline'}" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(activeCat.slug)}&subcategory=${encodeURIComponent(sc.slug)}')">${escapeHtml(sc.name)}</button>
        `).join("")}
      </div>
    ` : "";

    main.innerHTML = `
      <div class="container section">
        <div style="margin-bottom:20px;">
          <div style="font-size:0.84rem;color:var(--text-secondary);margin-bottom:4px;">
            <a onclick="window.IntalentApp.navigate('home')">Intalent</a> / <span>Explore Marketplace</span>
            ${activeCat ? ` / <strong>${escapeHtml(activeCat.name)}</strong>` : ""}
          </div>
          <h1 class="section-title">${activeCat ? escapeHtml(activeCat.name) : (p.q ? `Search Results for "${escapeHtml(p.q)}"` : "Explore Freelance Services")}</h1>
          <p class="section-subtitle">${activeCat ? escapeHtml(activeCat.description) : "Filter by category, budget in DZD, delivery speed, language, and Algerian Wilaya."}</p>
        </div>

        ${subPills}

        <form id="explore-filter-form" class="filter-bar">
          <div class="filter-control" style="flex:1;min-width:180px;">
            <label>Keyword / Skill</label>
            <input type="text" name="q" class="input" placeholder="e.g. React, Logo, Odoo..." value="${escapeHtml(p.q || "")}">
          </div>
          <div class="filter-control">
            <label>Category</label>
            <select name="category" class="select">
              <option value="">All Categories</option>
              ${state.categories.map(c => `<option value="${escapeHtml(c.slug)}" ${p.category === c.slug ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join("")}
            </select>
          </div>
          <div class="filter-control">
            <label>Wilaya</label>
            <select name="wilaya" class="select">
              <option value="">All 58 Wilayas</option>
              ${state.wilayas.map(w => `<option value="${escapeHtml(w.name)}" ${p.wilaya === w.name ? 'selected' : ''}>${w.code} - ${escapeHtml(w.name)}</option>`).join("")}
            </select>
          </div>
          <div class="filter-control">
            <label>Max Budget (DZD)</label>
            <input type="number" name="max_price" class="input" style="width:130px;" placeholder="e.g. 50000" value="${escapeHtml(p.max_price || "")}">
          </div>
          <div class="filter-control">
            <label>Delivery Time</label>
            <select name="max_days" class="select">
              <option value="">Any Time</option>
              <option value="2" ${p.max_days === '2' ? 'selected' : ''}>Express 48 Hours</option>
              <option value="5" ${p.max_days === '5' ? 'selected' : ''}>Up to 5 Days</option>
              <option value="10" ${p.max_days === '10' ? 'selected' : ''}>Up to 10 Days</option>
            </select>
          </div>
          <div class="filter-control">
            <label>Min Rating</label>
            <select name="min_rating" class="select">
              <option value="">Any Rating</option>
              <option value="4.5" ${p.min_rating === '4.5' ? 'selected' : ''}>4.5★ & up</option>
              <option value="4.0" ${p.min_rating === '4.0' ? 'selected' : ''}>4.0★ & up</option>
            </select>
          </div>
          <div class="filter-control">
            <label>Language</label>
            <select name="language" class="select">
              <option value="">Any Language</option>
              <option value="Français" ${p.language === 'Français' ? 'selected' : ''}>Français</option>
              <option value="العربية" ${p.language === 'العربية' ? 'selected' : ''}>العربية</option>
              <option value="English" ${p.language === 'English' ? 'selected' : ''}>English</option>
            </select>
          </div>
          <div class="filter-control">
            <label>Sort By</label>
            <select name="sort" class="select">
              <option value="recommended" ${p.sort === 'recommended' ? 'selected' : ''}>Recommended</option>
              <option value="price_asc" ${p.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price_desc" ${p.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${p.sort === 'rating' ? 'selected' : ''}>Highest Rating</option>
              <option value="newest" ${p.sort === 'newest' ? 'selected' : ''}>Newest Arrivals</option>
            </select>
          </div>
          <div class="filter-control" style="justify-content:center;padding-top:16px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;text-transform:none;font-size:0.86rem;color:var(--brand-deep);">
              <input type="checkbox" name="pro_only" value="true" ${p.pro_only === 'true' ? 'checked' : ''}> ✦ Pro Only
            </label>
          </div>
          <div style="display:flex;gap:8px;padding-top:14px;">
            <button type="submit" class="btn btn-primary">Apply Filters</button>
            <button type="button" class="btn btn-outline" onclick="window.IntalentApp.navigate('explore')">Reset</button>
          </div>
        </form>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
          <div style="font-weight:600;color:var(--text-secondary);">Showing <strong>${data.services.length}</strong> of <strong>${data.total}</strong> verified services</div>
        </div>

        ${data.services.length === 0 ? `
          <div class="card-panel" style="text-align:center;padding:56px 24px;">
            <h3 style="color:var(--brand-deep);margin-bottom:8px;">No services matched your exact filters</h3>
            <p style="color:var(--text-secondary);margin-bottom:20px;">Try broadening your budget range, clearing a filter, or posting a custom project brief for freelancers to bid on.</p>
            <div style="display:flex;justify-content:center;gap:12px;">
              <button class="btn btn-primary" onclick="window.IntalentApp.navigate('explore')">Clear All Filters</button>
              <button class="btn btn-outline" onclick="window.IntalentApp.navigate('post-project')">Post a Custom Project</button>
            </div>
          </div>
        ` : `
          <div class="grid-4">
            ${data.services.map(renderServiceCard).join("")}
          </div>
        `}
      </div>
    `;

    document.getElementById("explore-filter-form").addEventListener("submit", (e) => {
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
      <div class="container section">
        <h1 class="section-title">All Marketplace Categories & Subcategories</h1>
        <p class="section-subtitle" style="margin-bottom:32px;">Browse specialized freelance disciplines across the Intalent ecosystem.</p>
        <div class="grid-3">
          ${state.categories.map(c => `
            <div class="card-panel" style="margin-bottom:0;">
              <img src="${escapeHtml(c.image_url)}" alt="" style="width:100%;height:150px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:14px;">
              <h3 style="color:var(--brand-deep);margin-bottom:6px;cursor:pointer;" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">${escapeHtml(c.name)}</h3>
              <div style="font-size:0.8rem;color:var(--brand-violet);font-weight:600;margin-bottom:8px;">${escapeHtml(c.name_fr)} • ${escapeHtml(c.name_ar)}</div>
              <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:14px;">${escapeHtml(c.description)}</p>
              <div style="display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--border-color);padding-top:12px;">
                ${(c.subcategories || []).map(sc => `
                  <a style="font-size:0.88rem;color:var(--text-main);display:flex;justify-content:space-between;" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}')">
                    <span>→ ${escapeHtml(sc.name)}</span>
                    <span style="color:var(--text-secondary);font-size:0.78rem;">Explore</span>
                  </a>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  };

  // =========================================================================
  // 4. SERVICE DETAILS + PRICING PACKAGES + EXTRAS + CHECKOUT DRAWER
  // =========================================================================
  window.IntalentPages["service"] = async function (main, state) {
    const { escapeHtml, formatDZD, renderServiceCard, api, isFavorite } = App();
    const ident = state.params.slug || state.params.id;
    const { service: s } = await api("/api/services/" + encodeURIComponent(ident));

    const gallery = (() => {
      try { return JSON.parse(s.gallery_images || "[]"); } catch (_) { return [s.cover_image]; }
    })();
    const skills = (() => {
      try { return JSON.parse(s.skills_tags || "[]"); } catch (_) { return []; }
    })();
    const faqs = (() => {
      try { return JSON.parse(s.faqs || "[]"); } catch (_) { return []; }
    })();
    const packages = s.packages && s.packages.length ? s.packages : [
      { tier: "basic", name: "Standard Package", description: s.description, price_dzd: s.starting_price_dzd, delivery_days: s.delivery_days, revisions: 2, features: "[]" }
    ];

    let selectedTier = packages[0].tier;

    function renderView() {
      const pkg = packages.find(p => p.tier === selectedTier) || packages[0];
      let pkgFeats = [];
      try { pkgFeats = JSON.parse(pkg.features || "[]"); } catch (_) {}

      main.innerHTML = `
        <div class="container section">
          <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px;">
            <a onclick="window.IntalentApp.navigate('home')">Home</a> /
            <a onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(s.category_slug)}')">${escapeHtml(s.category_name)}</a>
            ${s.subcategory_name ? ` / <span>${escapeHtml(s.subcategory_name)}</span>` : ""}
          </div>

          <div class="detail-layout">
            <!-- Left Column -->
            <div>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
                ${s.is_pro_listing || s.freelancer_is_pro ? `<span class="badge badge-pro">✦ INTALENT PRO SERVICE</span>` : ""}
                ${s.is_demo ? `<span class="badge badge-demo">Seeded Demo Listing</span>` : ""}
              </div>
              <h1 style="font-size:1.95rem;font-weight:800;color:var(--brand-deep);margin-bottom:16px;line-height:1.25;">${escapeHtml(s.title)}</h1>

              <!-- Seller Header -->
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#FFF;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:22px;flex-wrap:wrap;gap:12px;">
                <div style="display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username)}')">
                  <img src="${escapeHtml(s.freelancer_avatar)}" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--brand-violet);">
                  <div>
                    <div style="font-weight:800;color:var(--brand-deep);">${escapeHtml(s.freelancer_name)} <span style="font-weight:500;color:var(--text-secondary);">@${escapeHtml(s.freelancer_username)}</span></div>
                    <div style="font-size:0.82rem;color:var(--text-secondary);">📍 ${escapeHtml(s.freelancer_wilaya)} • ★ <strong>${Number(s.rating_avg || 5).toFixed(1)}</strong> (${s.review_count} reviews)</div>
                  </div>
                </div>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.openContactModal(${s.freelancer_id}, '${escapeHtml(s.freelancer_name)}', 'Inquiry: ${escapeHtml(s.title)}')">💬 Contact Freelancer</button>
                  <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.toggleFavorite('service', ${s.id})">♥ Save</button>
                  <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.openReportModal('service', ${s.id}, 'Service Listing')">⚑ Report</button>
                </div>
              </div>

              <!-- Image Gallery -->
              <div style="margin-bottom:28px;">
                <img id="main-gallery-img" src="${escapeHtml(s.cover_image)}" alt="" style="width:100%;height:420px;object-fit:cover;border-radius:var(--radius-md);border:1px solid var(--border-color);margin-bottom:10px;">
                ${gallery.length > 1 ? `
                  <div style="display:flex;gap:10px;overflow-x:auto;">
                    ${gallery.map(img => `
                      <img src="${escapeHtml(img)}" alt="" style="width:96px;height:66px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid var(--border-color);" onclick="document.getElementById('main-gallery-img').src='${escapeHtml(img)}'">
                    `).join("")}
                  </div>
                ` : ""}
              </div>

              <!-- About This Service -->
              <div class="card-panel">
                <h3 style="color:var(--brand-deep);margin-bottom:12px;">About This Service</h3>
                <div style="white-space:pre-line;color:var(--text-main);margin-bottom:18px;">${escapeHtml(s.description)}</div>
                <h4 style="font-size:0.85rem;text-transform:uppercase;color:var(--text-secondary);margin-bottom:8px;">Skills & Technologies</h4>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  ${skills.map(sk => `<span class="badge badge-status" style="cursor:pointer;" onclick="window.IntalentApp.navigate('explore?skill=${encodeURIComponent(sk)}')">${escapeHtml(sk)}</span>`).join("")}
                </div>
              </div>

              ${faqs.length ? `
                <div class="card-panel">
                  <h3 style="color:var(--brand-deep);margin-bottom:14px;">Frequently Asked Questions</h3>
                  ${faqs.map(f => `
                    <div style="padding:12px 0;border-bottom:1px solid var(--border-color);">
                      <div style="font-weight:700;color:var(--brand-deep);margin-bottom:4px;">Q: ${escapeHtml(f.q)}</div>
                      <div style="color:var(--text-secondary);font-size:0.92rem;">${escapeHtml(f.a)}</div>
                    </div>
                  `).join("")}
                </div>
              ` : ""}

              <!-- Freelancer Bio Card -->
              <div class="card-panel">
                <h3 style="color:var(--brand-deep);margin-bottom:12px;">About The Freelancer</h3>
                <p style="font-weight:700;margin-bottom:6px;">${escapeHtml(s.freelancer_headline || "")}</p>
                <p style="color:var(--text-secondary);margin-bottom:14px;">${escapeHtml(s.freelancer_bio || "")}</p>
                <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username)}')">View Full Freelancer Profile & Portfolio →</button>
              </div>

              <!-- Verified Client Reviews -->
              <div class="card-panel">
                <h3 style="color:var(--brand-deep);margin-bottom:14px;">Verified Client Reviews (${(s.reviews || []).length})</h3>
                ${(s.reviews || []).length === 0 ? `<p style="color:var(--text-secondary);">No reviews yet for this service. Completed orders are eligible to leave verified reviews.</p>` :
                  s.reviews.map(r => `
                    <div style="padding:14px 0;border-bottom:1px solid var(--border-color);">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <img src="${escapeHtml(r.client_avatar || '/assets/logos/logo-dark.png')}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
                          <strong>${escapeHtml(r.client_name)}</strong>
                          <span style="font-size:0.78rem;color:var(--text-secondary);">(${escapeHtml(r.client_wilaya || 'Algeria')})</span>
                        </div>
                        <span class="star-icon">${"★".repeat(r.rating)} (${r.rating}.0)</span>
                      </div>
                      <p style="color:var(--text-main);font-size:0.92rem;">${escapeHtml(r.comment)}</p>
                    </div>
                  `).join("")
                }
              </div>
            </div>

            <!-- Right Column: Sticky Package & Extras Selector -->
            <div class="package-box">
              <div class="package-tabs">
                ${packages.map(p => `
                  <div class="package-tab ${p.tier === selectedTier ? 'active' : ''}" data-tier="${escapeHtml(p.tier)}">
                    ${escapeHtml(p.tier.toUpperCase())}
                  </div>
                `).join("")}
              </div>
              <div class="package-content">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
                  <h3 style="color:var(--brand-deep);font-size:1.1rem;">${escapeHtml(pkg.name)}</h3>
                  <div style="font-size:1.45rem;font-weight:800;color:var(--brand-violet);">${formatDZD(pkg.price_dzd)}</div>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:16px;">${escapeHtml(pkg.description)}</p>
                <div style="display:flex;gap:18px;font-size:0.86rem;font-weight:700;color:var(--brand-deep);margin-bottom:14px;">
                  <span>⏱ ${pkg.delivery_days} Days Delivery</span>
                  <span>↻ ${pkg.revisions >= 50 ? 'Unlimited' : pkg.revisions} Revisions</span>
                </div>
                <ul style="list-style:none;margin-bottom:18px;display:flex;flex-direction:column;gap:6px;font-size:0.88rem;">
                  ${pkgFeats.map(f => `<li><span style="color:var(--success);font-weight:800;">✓</span> ${escapeHtml(f)}</li>`).join("")}
                </ul>

                ${(s.extras || []).length > 0 ? `
                  <div style="border-top:1px solid var(--border-color);padding-top:14px;margin-bottom:18px;">
                    <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);margin-bottom:8px;">Optional Service Extras</div>
                    ${s.extras.map(ex => `
                      <label style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px;cursor:pointer;font-size:0.86rem;">
                        <span><input type="checkbox" class="extra-checkbox" value="${ex.id}" data-price="${ex.price_dzd}"> ${escapeHtml(ex.title)}</span>
                        <strong style="color:var(--brand-deep);">+${formatDZD(ex.price_dzd)}</strong>
                      </label>
                    `).join("")}
                  </div>
                ` : ""}

                <button id="proceed-checkout-btn" class="btn btn-primary btn-lg" style="width:100%;margin-bottom:10px;">
                  Continue to Checkout (${formatDZD(pkg.price_dzd)}) →
                </button>
                <button class="btn btn-outline" style="width:100%;" onclick="window.IntalentApp.openContactModal(${s.freelancer_id}, '${escapeHtml(s.freelancer_name)}', 'Custom Quote: ${escapeHtml(s.title)}')">
                  Request Custom Quote
                </button>
                <div style="text-align:center;font-size:0.76rem;color:var(--text-secondary);margin-top:12px;">
                  🔒 Protected Escrow Sandbox • Server-verified DZD pricing
                </div>
              </div>
            </div>
          </div>

          ${(s.related_services || []).length ? `
            <div style="margin-top:48px;">
              <h2 class="section-title" style="margin-bottom:20px;">Related Services in ${escapeHtml(s.category_name)}</h2>
              <div class="grid-4">${s.related_services.map(renderServiceCard).join("")}</div>
            </div>
          ` : ""}
        </div>
      `;

      main.querySelectorAll(".package-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          selectedTier = tab.getAttribute("data-tier");
          renderView();
        });
      });

      const checkboxes = main.querySelectorAll(".extra-checkbox");
      const btn = document.getElementById("proceed-checkout-btn");
      function updateButtonTotal() {
        let sum = Number(pkg.price_dzd);
        checkboxes.forEach(cb => {
          if (cb.checked) sum += Number(cb.getAttribute("data-price") || 0);
        });
        btn.textContent = `Continue to Checkout (${formatDZD(sum)}) →`;
      }
      checkboxes.forEach(cb => cb.addEventListener("change", updateButtonTotal));

      btn.addEventListener("click", () => {
        if (!state.user) {
          App().showToast("Please sign in or create an account to place an order.", true);
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
      <div class="container section">
        <h1 class="section-title" style="margin-bottom:8px;">Secure Order Checkout</h1>
        <p class="section-subtitle" style="margin-bottom:28px;">Review your package, submit project requirements, and complete your DZD sandbox payment.</p>

        <div class="detail-layout">
          <form id="checkout-order-form" class="card-panel">
            <div style="background:var(--brand-pale);border:1px solid var(--brand-lavender);padding:14px 16px;border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.88rem;">
              <strong>Payment Architecture Notice:</strong> Running in <strong>${escapeHtml(state.settings.payment_provider_label || "SATIM CIB / Edahabia Sandbox Mode")}</strong>. All totals and commissions are strictly calculated on the server.
            </div>

            <h3 style="color:var(--brand-deep);margin-bottom:12px;">1. Project Requirements for ${escapeHtml(s.freelancer_name)}</h3>
            <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:10px;">${escapeHtml(s.requirements_prompt)}</p>
            <textarea name="requirements" class="textarea" placeholder="Describe your project goals, brand guidelines, target audience, and deliverables..." required></textarea>

            <div style="margin-top:16px;margin-bottom:24px;">
              <label style="font-size:0.82rem;font-weight:700;display:block;margin-bottom:6px;">Reference File Attachment (Optional — PNG, JPG, PDF, ZIP up to 5MB)</label>
              <input type="file" id="checkout-ref-file" class="input" style="width:100%;">
            </div>

            <h3 style="color:var(--brand-deep);margin-bottom:12px;">2. Select Payment Method (Algeria Sandbox)</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;">
              <label style="border:2px solid var(--brand-violet);background:var(--brand-pale);padding:14px;border-radius:var(--radius-sm);cursor:pointer;font-weight:700;">
                <input type="radio" name="payment_method" value="SATIM CIB / Edahabia (Sandbox)" checked> 💳 Carte CIB / Edahabia (Sandbox)
              </label>
              <label style="border:1.5px solid var(--border-color);padding:14px;border-radius:var(--radius-sm);cursor:pointer;font-weight:700;">
                <input type="radio" name="payment_method" value="Corporate Bank Wire / CCP (Sandbox)"> 🏦 Corporate RIB / CCP Escrow
              </label>
            </div>

            <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-secondary);margin-bottom:20px;cursor:pointer;">
              <input type="checkbox" name="simulate_failure" value="1"> Simulate gateway payment failure (for QA / error-state verification)
            </label>

            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
              Confirm & Pay ${formatDZD(total)} (Sandbox)
            </button>
          </form>

          <div class="card-panel">
            <h3 style="color:var(--brand-deep);margin-bottom:14px;">Order Summary</h3>
            <div style="display:flex;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border-color);">
              <img src="${escapeHtml(s.cover_image)}" style="width:84px;height:60px;object-fit:cover;border-radius:8px;">
              <div>
                <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(s.title)}</div>
                <div style="font-size:0.82rem;color:var(--text-secondary);">Freelancer: ${escapeHtml(s.freelancer_name)}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span>Package (${escapeHtml(pkg.tier.toUpperCase())} — ${escapeHtml(pkg.name)})</span>
              <strong>${formatDZD(pkg.price_dzd)}</strong>
            </div>
            ${chosenExtras.map(e => `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.88rem;color:var(--text-secondary);">
                <span>+ Extra: ${escapeHtml(e.title)}</span>
                <strong>${formatDZD(e.price_dzd)}</strong>
              </div>
            `).join("")}
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.88rem;color:var(--text-secondary);">
              <span>Service Fee (${commPct}%)</span>
              <strong>${formatDZD(fee)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid var(--border-color);font-size:1.2rem;font-weight:800;color:var(--brand-deep);">
              <span>Total (Server Verified)</span>
              <span>${formatDZD(total)}</span>
            </div>
            <div style="margin-top:14px;font-size:0.82rem;color:var(--text-secondary);">
              ⏱ Estimated Delivery: <strong>${pkg.delivery_days} Days</strong> • Revisions: <strong>${pkg.revisions}</strong>
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
        showToast(`Order #${res.order_number} confirmed!`);
        await App().refreshBootstrap();
        App().navigate(`order-detail?id=${res.order_id}`);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  // =========================================================================
  // 6. ORDER DETAILS, TRACKING, DELIVERY, REVISIONS & ELIGIBLE REVIEWS
  // =========================================================================
  window.IntalentPages["order-detail"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    const oid = state.params.id;
    const { order: o } = await api("/api/orders/" + encodeURIComponent(oid));
    const isClient = state.user && state.user.id === o.client_id;
    const isFreelancer = state.user && state.user.id === o.freelancer_id;

    main.innerHTML = `
      <div class="container section">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:24px;">
          <div>
            <span class="badge badge-pro">${escapeHtml(o.status.toUpperCase())}</span>
            <h1 class="section-title" style="margin-top:6px;">Order #${escapeHtml(o.order_number)}</h1>
            <p class="section-subtitle">Service: <a style="color:var(--brand-violet);font-weight:700;" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(o.service_slug)}')">${escapeHtml(o.service_title)}</a></p>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-outline" onclick="window.IntalentApp.openContactModal(${isClient ? o.freelancer_id : o.client_id}, '${escapeHtml(isClient ? o.freelancer_name : o.client_name)}', 'Order #${escapeHtml(o.order_number)}')">💬 Open Order Conversation</button>
            <button class="btn btn-danger btn-sm" onclick="window.IntalentApp.openReportModal('order_dispute', ${o.id}, 'Order Dispute #${escapeHtml(o.order_number)}')">⚑ Raise Dispute</button>
          </div>
        </div>

        <div class="detail-layout">
          <div>
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:10px;">Submitted Buyer Requirements</h3>
              <p style="white-space:pre-line;">${escapeHtml(o.requirements_submitted)}</p>
            </div>

            <!-- Deliveries -->
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:12px;">Order Deliveries (${(o.deliveries || []).length})</h3>
              ${(o.deliveries || []).length === 0 ? `<p style="color:var(--text-secondary);">No deliveries submitted yet. The freelancer is working on your order.</p>` :
                o.deliveries.map(d => `
                  <div style="background:var(--brand-pale);padding:16px;border-radius:var(--radius-sm);margin-bottom:12px;border-left:4px solid var(--brand-violet);">
                    <div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:6px;">Delivered at ${escapeHtml(d.created_at)}</div>
                    <p style="white-space:pre-line;font-weight:500;">${escapeHtml(d.message)}</p>
                  </div>
                `).join("")
              }

              ${isFreelancer && ["in_progress", "revision_requested", "delivered"].includes(o.status) ? `
                <form id="submit-delivery-form" style="margin-top:18px;border-top:1px solid var(--border-color);padding-top:16px;">
                  <h4 style="color:var(--brand-deep);margin-bottom:8px;">Submit Work Delivery</h4>
                  <textarea name="message" class="textarea" placeholder="Describe your completed deliverables, links, and instructions..." required></textarea>
                  <div style="margin:10px 0;">
                    <label style="font-size:0.8rem;font-weight:700;">Attach Deliverable File (Optional)</label>
                    <input type="file" id="delivery-file-input" class="input" style="width:100%;">
                  </div>
                  <button type="submit" class="btn btn-primary">Deliver Work Now</button>
                </form>
              ` : ""}

              ${isClient && o.status === "delivered" ? `
                <div style="margin-top:18px;border-top:1px solid var(--border-color);padding-top:16px;display:flex;flex-direction:column;gap:14px;">
                  <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <button id="accept-delivery-btn" class="btn btn-primary">✓ Accept Delivery & Release Earnings</button>
                  </div>
                  <form id="request-revision-form" style="display:flex;gap:10px;">
                    <input type="text" name="reason" class="input" style="flex:1;" placeholder="Need adjustments? Describe revision request..." required>
                    <button type="submit" class="btn btn-outline">Request Revision</button>
                  </form>
                </div>
              ` : ""}
            </div>

            <!-- Eligible Review Form -->
            ${o.status === "completed" ? `
              <div class="card-panel">
                <h3 style="color:var(--brand-deep);margin-bottom:12px;">Verified Order Review</h3>
                ${o.review ? `
                  <div style="background:var(--brand-pale);padding:14px;border-radius:var(--radius-sm);">
                    <div class="star-icon" style="margin-bottom:4px;">${"★".repeat(o.review.rating)} (${o.review.rating}/5)</div>
                    <p>${escapeHtml(o.review.comment)}</p>
                  </div>
                ` : (isClient ? `
                  <form id="leave-review-form" style="display:flex;flex-direction:column;gap:12px;">
                    <div>
                      <label style="font-size:0.82rem;font-weight:700;">Rating (1 to 5 Stars)</label>
                      <select name="rating" class="select" style="width:100%;">
                        <option value="5">★★★★★ (5/5 — Exceptional)</option>
                        <option value="4">★★★★☆ (4/5 — Very Good)</option>
                        <option value="3">★★★☆☆ (3/5 — Satisfactory)</option>
                        <option value="2">★★☆☆☆ (2/5 — Subpar)</option>
                        <option value="1">★☆☆☆☆ (1/5 — Poor)</option>
                      </select>
                    </div>
                    <textarea name="comment" class="textarea" placeholder="Share your experience working with ${escapeHtml(o.freelancer_name)}..." required></textarea>
                    <button type="submit" class="btn btn-primary">Publish Verified Review</button>
                  </form>
                ` : `<p style="color:var(--text-secondary);">Waiting for client review.</p>`)}
              </div>
            ` : ""}
          </div>

          <!-- Right Sidebar: Financials & Status Timeline -->
          <div>
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:14px;">Financial Breakdown</h3>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>Package (${escapeHtml(o.package_tier.toUpperCase())})</span>
                <strong>${formatDZD(o.subtotal_dzd)}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.86rem;color:var(--text-secondary);">
                <span>Platform Fee (${o.commission_rate_pct}%)</span>
                <span>${formatDZD(o.platform_fee_dzd)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border-color);font-weight:800;font-size:1.1rem;color:var(--brand-deep);">
                <span>Total Paid</span>
                <span>${formatDZD(o.total_dzd)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.85rem;color:var(--success);font-weight:700;">
                <span>Freelancer Net Payout</span>
                <span>${formatDZD(o.freelancer_net_dzd)}</span>
              </div>
              <div style="margin-top:12px;font-size:0.8rem;color:var(--text-secondary);">
                Client: <strong>${escapeHtml(o.client_name)}</strong><br>
                Freelancer: <strong>${escapeHtml(o.freelancer_name)}</strong><br>
                Payment: <strong>${escapeHtml(o.payment_method)}</strong>
              </div>
            </div>

            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:12px;">Status History</h3>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${(o.history || []).map(h => `
                  <div style="font-size:0.84rem;border-left:2px solid var(--brand-violet);padding-left:10px;">
                    <div style="font-weight:700;color:var(--brand-deep);">${escapeHtml(h.status.toUpperCase())}</div>
                    <div>${escapeHtml(h.note)}</div>
                    <div style="font-size:0.74rem;color:var(--text-secondary);">${escapeHtml(h.created_at)}</div>
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
          showToast("Delivery submitted successfully!");
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
          showToast("Order completed and freelancer earnings released!");
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
          showToast("Revision request sent to freelancer.");
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
          showToast("Thank you! Your verified review is now live.");
          window.IntalentPages["order-detail"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }
  };
})();
