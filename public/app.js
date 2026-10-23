(function () {
  const state = {
    lang: localStorage.getItem("intalent_lang") || "en",
    settings: {},
    categories: [],
    skills: [],
    wilayas: [],
    banners: [],
    oauth_status: { google_configured: false, facebook_configured: false },
    user: null,
    favorites: [],
    unread_notifications: 0,
    unread_messages: 0,
    route: "home",
    params: {}
  };

  function t(key) {
    const dict = window.INTALENT_I18N[state.lang] || window.INTALENT_I18N.en;
    return dict[key] || window.INTALENT_I18N.en[key] || key;
  }

  function formatDZD(amount) {
    const num = Number(amount || 0);
    return num.toLocaleString(state.lang === "ar" ? "ar-DZ" : "fr-DZ") + " DZD";
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(msg, isError = false) {
    let wrap = document.getElementById("toast-container");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "toast-container";
      wrap.className = "toast-container";
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast" + (isError ? " error" : "");
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  async function api(path, options = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    const token = localStorage.getItem("intalent_token");
    if (token) headers["Authorization"] = "Bearer " + token;
    const res = await fetch(path, Object.assign({}, options, { headers }));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  async function uploadFileInput(fileInput) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return null;
    const file = fileInput.files[0];
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const res = await api("/api/upload", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, data_url: dataUrl })
    });
    return res.url;
  }

  function isFavorite(type, id) {
    return state.favorites.some(f => f.target_type === type && Number(f.target_id) === Number(id));
  }

  async function toggleFavorite(type, id, btnEl) {
    if (!state.user) {
      showToast("Please sign in to save favorites.", true);
      navigate("login");
      return;
    }
    try {
      const res = await api("/api/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ target_type: type, target_id: Number(id) })
      });
      state.favorites = res.favorites || [];
      if (btnEl) {
        btnEl.classList.toggle("active", res.saved);
      }
      showToast(res.saved ? "Saved to your favorites!" : "Removed from favorites.");
    } catch (e) {
      showToast(e.message, true);
    }
  }

  function openModal(htmlContent) {
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.id = "active-modal";
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `<div class="modal-card">${htmlContent}</div>`;
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    document.body.appendChild(backdrop);
  }

  function closeModal() {
    const m = document.getElementById("active-modal");
    if (m) m.remove();
  }

  function openReportModal(targetType, targetId, label) {
    if (!state.user) {
      showToast("Please sign in to submit a report.", true);
      navigate("login");
      return;
    }
    openModal(`
      <h3 style="color:var(--brand-deep);margin-bottom:8px;">Report ${escapeHtml(label)}</h3>
      <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:16px;">Our Trust & Safety team reviews all marketplace reports promptly.</p>
      <form id="report-modal-form" style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <label style="font-size:0.8rem;font-weight:700;">Reason</label>
          <select name="reason" class="select" style="width:100%;" required>
            <option value="Inaccurate or misleading listing">Inaccurate or misleading listing</option>
            <option value="Copyright or IP violation">Copyright or IP violation</option>
            <option value="Off-platform payment solicitation">Off-platform payment solicitation</option>
            <option value="Order dispute / non-delivery">Order dispute / non-delivery</option>
            <option value="Spam or abusive behavior">Spam or abusive behavior</option>
          </select>
        </div>
        <div>
          <label style="font-size:0.8rem;font-weight:700;">Details</label>
          <textarea name="details" class="textarea" placeholder="Provide specific details..." required></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
          <button type="button" class="btn btn-outline" onclick="window.IntalentApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Report</button>
        </div>
      </form>
    `);
    document.getElementById("report-modal-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await api("/api/reports", {
          method: "POST",
          body: JSON.stringify({
            target_type: targetType,
            target_id: Number(targetId),
            reason: fd.get("reason"),
            details: fd.get("details")
          })
        });
        closeModal();
        showToast("Report submitted to Trust & Safety.");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  function openContactModal(recipientId, recipientName, defaultSubject = "") {
    if (!state.user) {
      showToast("Please sign in to message this freelancer.", true);
      navigate("login");
      return;
    }
    openModal(`
      <h3 style="color:var(--brand-deep);margin-bottom:6px;">Message ${escapeHtml(recipientName)}</h3>
      <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:14px;">Discuss project scope, deliverables, or custom requirements directly.</p>
      <form id="contact-modal-form" style="display:flex;flex-direction:column;gap:12px;">
        <input type="text" name="subject" class="input" value="${escapeHtml(defaultSubject)}" placeholder="Subject (optional)">
        <textarea name="body" class="textarea" placeholder="Salam ${escapeHtml(recipientName)}, I would like to discuss..." required></textarea>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button type="button" class="btn btn-outline" onclick="window.IntalentApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Send Message</button>
        </div>
      </form>
    `);
    document.getElementById("contact-modal-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await api("/api/messages", {
          method: "POST",
          body: JSON.stringify({
            recipient_id: Number(recipientId),
            subject: fd.get("subject"),
            body: fd.get("body")
          })
        });
        closeModal();
        showToast("Message sent!");
        navigate(`messages?conv=${res.conversation_id}`);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  function renderServiceCard(s) {
    const favActive = isFavorite("service", s.id) ? "active" : "";
    return `
      <div class="service-card" data-service-id="${s.id}">
        <div class="service-thumb-wrap" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">
          <img src="${escapeHtml(s.cover_image)}" alt="${escapeHtml(s.title)}" loading="lazy" onerror="this.src='/assets/logos/logo-white-purple.png'">
          <div class="service-badges-top">
            ${s.is_pro_listing || s.freelancer_is_pro ? `<span class="badge badge-pro">✦ PRO</span>` : ""}
            ${s.is_sponsored ? `<span class="badge badge-sponsored">Sponsored</span>` : ""}
            ${s.is_demo ? `<span class="badge badge-demo">Demo</span>` : ""}
          </div>
        </div>
        <button class="fav-btn ${favActive}" title="Save to Favorites" onclick="window.IntalentApp.toggleFavorite('service', ${s.id}, this)">♥</button>
        <div class="service-card-body">
          <div class="seller-row">
            <div class="seller-info" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username || "")}')">
              <img class="seller-avatar" src="${escapeHtml(s.freelancer_avatar || '/assets/logos/logo-dark.png')}" alt="">
              <div>
                <div class="seller-name">${escapeHtml(s.freelancer_name || "Freelancer")}</div>
                <div class="seller-wilaya">${escapeHtml(s.freelancer_wilaya || "Algeria")}</div>
              </div>
            </div>
            ${s.freelancer_is_verified ? `<span class="badge badge-success" title="Verified Identity">✓ Verified</span>` : ""}
          </div>
          <div class="service-title-link" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">${escapeHtml(s.title)}</div>
          <div class="rating-row">
            <span class="star-icon">★</span>
            <strong>${Number(s.rating_avg || 5.0).toFixed(1)}</strong>
            <span style="color:var(--text-secondary);">(${s.review_count || 0})</span>
            <span style="margin-left:auto;font-size:0.78rem;color:var(--text-secondary);">⏱ ${s.delivery_days}d</span>
          </div>
          <div class="service-card-footer">
            <span class="price-label">${t("starting_at")}</span>
            <span class="price-amount">${formatDZD(s.starting_price_dzd)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function getDashboardRouteForUser() {
    if (!state.user) return "login";
    const r = state.user.active_role || state.user.role;
    if (r === "admin") return "admin-dashboard";
    if (r === "freelancer") return "freelancer-dashboard";
    if (r === "business") return "business-dashboard";
    return "client-dashboard";
  }

  function renderHeader() {
    const dir = window.INTALENT_I18N[state.lang]?.dir || "ltr";
    document.body.setAttribute("dir", dir);

    const catLinks = state.categories.map(c => {
      const cname = state.lang === "fr" ? c.name_fr : (state.lang === "ar" ? c.name_ar : c.name);
      const isActive = state.route === "explore" && state.params.category === c.slug;
      return `<span class="cat-bar-item ${isActive ? 'active' : ''}" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">${escapeHtml(cname)}</span>`;
    }).join("");

    let userActions = "";
    if (state.user) {
      const activeRole = state.user.active_role || state.user.role;
      userActions = `
        <span class="nav-link" onclick="window.IntalentApp.navigate('messages')">
          ${t("messages")} ${state.unread_messages > 0 ? `<span class="badge badge-pro">${state.unread_messages}</span>` : ""}
        </span>
        <span class="nav-link" onclick="window.IntalentApp.navigate('notifications')">
          🔔 ${state.unread_notifications > 0 ? `<span class="badge badge-pro">${state.unread_notifications}</span>` : ""}
        </span>
        <span class="nav-link" onclick="window.IntalentApp.navigate('favorites')">♥ ${t("favorites")}</span>
        <select class="select" style="padding:5px 10px;font-size:0.8rem;font-weight:700;background:var(--brand-pale);" onchange="window.IntalentApp.switchActiveRole(this.value)" title="Switch Account Role">
          <option value="client" ${activeRole === 'client' ? 'selected' : ''}>Role: Client</option>
          <option value="freelancer" ${activeRole === 'freelancer' ? 'selected' : ''}>Role: Freelancer</option>
          <option value="business" ${activeRole === 'business' ? 'selected' : ''}>Role: Business</option>
          ${state.user.role === 'admin' ? `<option value="admin" ${activeRole === 'admin' ? 'selected' : ''}>Role: Admin</option>` : ""}
        </select>
        <button class="btn btn-deep btn-sm" onclick="window.IntalentApp.navigate('${getDashboardRouteForUser()}')">${t("dashboard")}</button>
        <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.logout()">${t("logout")}</button>
      `;
    } else {
      userActions = `
        <span class="nav-link" onclick="window.IntalentApp.navigate('login')">${t("sign_in")}</span>
        <button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('register')">${t("join")}</button>
      `;
    }

    return `
      <div class="top-announcement">
        <div class="container top-announcement-inner">
          <div>✦ ${escapeHtml(state.settings.announcement_bar || "Intalent Algeria — Full-Stack Freelance & Business Marketplace")}</div>
          <div style="display:flex;align-items:center;gap:14px;">
            <span>Currency: <strong>DZD (د.ج)</strong></span>
            <select style="background:rgba(255,255,255,0.15);color:#FFF;border:1px solid rgba(255,255,255,0.3);border-radius:6px;padding:2px 8px;font-size:0.78rem;" onchange="window.IntalentApp.setLanguage(this.value)">
              <option value="en" style="color:#000" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="fr" style="color:#000" ${state.lang === 'fr' ? 'selected' : ''}>Français</option>
              <option value="ar" style="color:#000" ${state.lang === 'ar' ? 'selected' : ''}>العربية (RTL)</option>
            </select>
          </div>
        </div>
      </div>
      <header class="site-header">
        <div class="container header-main">
          <div class="brand-logo-wrap" onclick="window.IntalentApp.navigate('home')">
            <img src="/assets/logos/logo-dark.png" alt="Intalent" class="brand-logo-img">
          </div>
          <form class="header-search" onsubmit="event.preventDefault(); window.IntalentApp.navigate('explore?q=' + encodeURIComponent(this.q.value))">
            <input type="text" name="q" placeholder="${escapeHtml(t("search_placeholder"))}" value="${escapeHtml(state.params.q || "")}">
            <button type="submit">${escapeHtml(t("search_btn"))}</button>
          </form>
          <nav class="header-nav">
            <span class="nav-link ${state.route === 'explore' ? 'active' : ''}" onclick="window.IntalentApp.navigate('explore')">${t("explore")}</span>
            <span class="nav-link pro-pill-link" onclick="window.IntalentApp.navigate('pro-talent')"><span class="spark">✦</span> ${t("pro_talent")}</span>
            <span class="nav-link ${state.route === 'business-solutions' ? 'active' : ''}" onclick="window.IntalentApp.navigate('business-solutions')">${t("business")}</span>
            <span class="nav-link ${state.route === 'projects' ? 'active' : ''}" onclick="window.IntalentApp.navigate('projects')">${t("projects")}</span>
            ${userActions}
          </nav>
        </div>
        <div class="categories-bar">
          <div class="container categories-bar-inner">
            <span class="cat-bar-item ${state.route === 'categories' ? 'active' : ''}" onclick="window.IntalentApp.navigate('categories')">All Categories</span>
            ${catLinks}
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <img src="/assets/logos/logo-white-purple.png" alt="Intalent" style="height:48px;width:auto;border-radius:8px;margin-bottom:14px;">
              <p style="color:rgba(255,255,255,0.75);font-size:0.9rem;margin-bottom:14px;">
                Intalent is Algeria's premier freelance services and enterprise talent marketplace connecting verified professionals with clients across all 58 Wilayas.
              </p>
              <div style="font-size:0.82rem;color:var(--brand-lavender);">DZD (د.ج) • Français • العربية • English</div>
            </div>
            <div class="footer-col">
              <h4>Marketplace</h4>
              <ul>
                <li><a onclick="window.IntalentApp.navigate('explore')">Explore Services</a></li>
                <li><a onclick="window.IntalentApp.navigate('categories')">All Categories & Subcategories</a></li>
                <li><a onclick="window.IntalentApp.navigate('freelancers')">Featured Freelancers</a></li>
                <li><a onclick="window.IntalentApp.navigate('pro-talent')">Intalent Pro Talent</a></li>
                <li><a onclick="window.IntalentApp.navigate('projects')">Browse Project Briefs</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>For Clients & Business</h4>
              <ul>
                <li><a onclick="window.IntalentApp.navigate('how-it-works')">How Intalent Works</a></li>
                <li><a onclick="window.IntalentApp.navigate('post-project')">Post a Custom Project</a></li>
                <li><a onclick="window.IntalentApp.navigate('business-solutions')">Intalent Business Solutions</a></li>
                <li><a onclick="window.IntalentApp.navigate('pricing-fees')">Pricing & Fee Structure</a></li>
                <li><a onclick="window.IntalentApp.navigate('trust-safety')">Trust, Safety & Escrow</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Company & Legal</h4>
              <ul>
                <li><a onclick="window.IntalentApp.navigate('about')">About Intalent</a></li>
                <li><a onclick="window.IntalentApp.navigate('pro-upgrade')">Become an Intalent Pro</a></li>
                <li><a onclick="window.IntalentApp.navigate('terms')">Terms of Service</a></li>
                <li><a onclick="window.IntalentApp.navigate('privacy')">Privacy Policy</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Support & Help</h4>
              <ul>
                <li><a onclick="window.IntalentApp.navigate('help-faq')">Help Center & FAQ</a></li>
                <li><a onclick="window.IntalentApp.navigate('contact')">Contact Support</a></li>
                <li><a onclick="window.IntalentApp.navigate('login')">Demo Accounts Login</a></li>
              </ul>
            </div>
          </div>
          <div style="padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.85rem;color:rgba(255,255,255,0.65);">
            <div>© 2026 Intalent Algeria. Official Brand Identity (#25083F / #8B43F5). All rights reserved.</div>
            <div>Payment Gateway Status: <strong>${escapeHtml(state.settings.payment_provider_label || "SATIM CIB / Edahabia Sandbox")}</strong></div>
          </div>
        </div>
      </footer>
    `;
  }

  window.IntalentApp = {
    state,
    t,
    formatDZD,
    escapeHtml,
    showToast,
    api,
    uploadFileInput,
    toggleFavorite,
    openModal,
    closeModal,
    openReportModal,
    openContactModal,
    renderServiceCard,
    getDashboardRouteForUser,
    renderHeader,
    renderFooter,
    setLanguage(lang) {
      state.lang = lang;
      localStorage.setItem("intalent_lang", lang);
      renderCurrentRoute();
    },
    async switchActiveRole(role) {
      try {
        const res = await api("/api/auth/switch-role", {
          method: "POST",
          body: JSON.stringify({ role })
        });
        state.user = res.user;
        showToast(`Switched active workspace to ${role.toUpperCase()}`);
        navigate(getDashboardRouteForUser());
      } catch (e) {
        showToast(e.message, true);
      }
    },
    async logout() {
      try {
        await api("/api/auth/logout", { method: "POST", body: "{}" });
      } catch (_) {}
      localStorage.removeItem("intalent_token");
      state.user = null;
      state.favorites = [];
      showToast("Logged out successfully.");
      navigate("home");
    },
    navigate(target, push = true) {
      const [routePart, queryPart] = target.split("?");
      state.route = routePart || "home";
      state.params = {};
      if (queryPart) {
        const usp = new URLSearchParams(queryPart);
        for (const [k, v] of usp.entries()) state.params[k] = v;
      }
      if (push) {
        window.location.hash = "#" + target;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderCurrentRoute();
    },
    async refreshBootstrap() {
      const data = await api("/api/bootstrap");
      state.settings = data.settings || {};
      state.categories = data.categories || [];
      state.skills = data.skills || [];
      state.wilayas = data.wilayas || [];
      state.banners = data.banners || [];
      state.oauth_status = data.oauth_status || {};
      state.user = data.user || null;
      state.favorites = data.favorites || [];
      state.unread_notifications = data.unread_notifications || 0;
      state.unread_messages = data.unread_messages || 0;
    }
  };

  async function renderCurrentRoute() {
    const root = document.getElementById("app-root");
    if (!root) return;
    root.innerHTML = renderHeader() + `<main id="page-main" style="min-height:70vh;"><div class="container section"><p>Loading Intalent...</p></div></main>` + renderFooter();
    const main = document.getElementById("page-main");
    try {
      if (window.IntalentPages && window.IntalentPages[state.route]) {
        await window.IntalentPages[state.route](main, state);
      } else {
        await window.IntalentPages.home(main, state);
      }
    } catch (err) {
      main.innerHTML = `<div class="container section"><div class="card-panel"><h3>Unable to load view</h3><p style="color:var(--danger);margin-top:8px;">${escapeHtml(err.message)}</p><button class="btn btn-primary" style="margin-top:14px;" onclick="window.IntalentApp.navigate('home')">Return to Homepage</button></div></div>`;
    }
  }

  window.addEventListener("hashchange", () => {
    const raw = window.location.hash.replace(/^#/, "") || "home";
    window.IntalentApp.navigate(raw, false);
  });

  window.addEventListener("DOMContentLoaded", async () => {
    await window.IntalentApp.refreshBootstrap();
    const initial = window.location.hash.replace(/^#/, "") || "home";
    window.IntalentApp.navigate(initial, false);
  });
})();
