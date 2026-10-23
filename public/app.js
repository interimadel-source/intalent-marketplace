(function () {
  const state = {
    lang: localStorage.getItem("intalent_lang") || "fr",
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
    const dict = window.INTALENT_I18N[state.lang] || window.INTALENT_I18N.fr || window.INTALENT_I18N.en;
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
      showToast("Veuillez vous connecter pour sauvegarder dans vos favoris.", true);
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
        btnEl.classList.toggle("text-error", res.saved);
        const icon = btnEl.querySelector(".material-symbols-outlined");
        if (icon) {
          icon.classList.toggle("material-fill", res.saved);
        }
      }
      showToast(res.saved ? "Ajouté à vos favoris !" : "Retiré de vos favoris.");
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
      showToast("Veuillez vous connecter pour soumettre un signalement.", true);
      navigate("login");
      return;
    }
    openModal(`
      <div class="flex items-center gap-2 mb-2 text-primary-container">
        <span class="material-symbols-outlined text-secondary">flag</span>
        <h3 class="font-headline-sm text-headline-sm font-bold">Signaler : ${escapeHtml(label)}</h3>
      </div>
      <p class="font-body-sm text-on-surface-variant mb-4">Notre équipe Confiance & Sécurité basée à Alger examine chaque signalement rapidement.</p>
      <form id="report-modal-form" class="space-y-3">
        <div>
          <label class="font-label-md text-label-md text-on-surface block mb-1">Motif du signalement</label>
          <select name="reason" class="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" required>
            <option value="Inaccurate or misleading listing">Annonce trompeuse ou inexacte</option>
            <option value="Copyright or IP violation">Violation de propriété intellectuelle / droits d'auteur</option>
            <option value="Off-platform payment solicitation">Demande de paiement hors plateforme (CCP direct / Cash)</option>
            <option value="Order dispute / non-delivery">Litige sur commande / Non-livraison</option>
            <option value="Spam or abusive behavior">Spam ou comportement inapproprié</option>
          </select>
        </div>
        <div>
          <label class="font-label-md text-label-md text-on-surface block mb-1">Détails & preuves</label>
          <textarea name="details" class="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" rows="3" placeholder="Décrivez précisément la situation..." required></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md" onclick="window.IntalentApp.closeModal()">Annuler</button>
          <button type="submit" class="px-5 py-2 rounded-full bg-primary-container text-white hover:bg-secondary font-label-md transition-colors">Envoyer le signalement</button>
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
        showToast("Signalement transmis au Centre de Résolution Intalent.");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  function openContactModal(recipientId, recipientName, defaultSubject = "") {
    if (!state.user) {
      showToast("Veuillez vous connecter pour contacter ce prestataire.", true);
      navigate("login");
      return;
    }
    openModal(`
      <div class="flex items-center gap-2 mb-1 text-primary-container">
        <span class="material-symbols-outlined text-secondary">chat</span>
        <h3 class="font-headline-sm text-headline-sm font-bold">Contacter ${escapeHtml(recipientName)}</h3>
      </div>
      <p class="font-body-sm text-on-surface-variant mb-4">Discutez de votre cahier des charges, des délais ou demandez une offre sur-mesure en DZD.</p>
      <form id="contact-modal-form" class="space-y-3">
        <div>
          <label class="font-label-md text-label-md text-on-surface block mb-1">Objet</label>
          <input type="text" name="subject" class="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" value="${escapeHtml(defaultSubject)}" placeholder="Objet de votre demande (optionnel)">
        </div>
        <div>
          <label class="font-label-md text-label-md text-on-surface block mb-1">Votre message</label>
          <textarea name="body" class="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" rows="4" placeholder="Salam ${escapeHtml(recipientName)}, je souhaiterais discuter de mon projet..." required></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md" onclick="window.IntalentApp.closeModal()">Annuler</button>
          <button type="submit" class="px-5 py-2 rounded-full bg-secondary text-white hover:bg-primary-container font-label-md transition-colors flex items-center gap-1.5">
            <span>Envoyer</span>
            <span class="material-symbols-outlined text-sm">send</span>
          </button>
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
        showToast("Message envoyé en direct !");
        navigate(`messages?conv=${res.conversation_id}`);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  // Exact Google Stitch Project 1 Service Card
  function renderServiceCard(s) {
    const favSaved = isFavorite("service", s.id);
    const initials = (s.freelancer_name || "IN").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
    let skills = [];
    try { skills = JSON.parse(s.skills_tags || "[]"); } catch (_) {}

    let topBadge = "";
    if (s.is_pro_listing || s.freelancer_is_pro) {
      topBadge = `
        <div class="absolute top-3 left-3 px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur text-primary-container font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-xs text-secondary material-fill">verified</span>
          Top Prestataire Pro
        </div>
      `;
    } else if (s.is_sponsored || s.is_featured) {
      topBadge = `
        <div class="absolute top-3 left-3 px-space-sm py-1 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-xs">local_fire_department</span>
          Populaire
        </div>
      `;
    } else if (Number(s.delivery_days) <= 2) {
      topBadge = `
        <div class="absolute top-3 left-3 px-space-sm py-1 rounded-full bg-primary-container/90 backdrop-blur text-on-primary font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-xs text-secondary-fixed">bolt</span>
          Livraison ${s.delivery_days * 24}h
        </div>
      `;
    } else {
      topBadge = `
        <div class="absolute top-3 left-3 px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur text-primary-container font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-xs text-secondary">verified_user</span>
          Escrow DZD
        </div>
      `;
    }

    return `
      <article class="flex flex-col rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-surface-container-highest/60" data-service-id="${s.id}">
        <div class="relative h-48 w-full overflow-hidden bg-surface-container cursor-pointer" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHtml(s.cover_image)}" alt="${escapeHtml(s.title)}" loading="lazy" onerror="this.src='/assets/logos/logo-white-purple.png'">
          ${topBadge}
          <button type="button" aria-label="Favoris" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur ${favSaved ? 'text-error active' : 'text-on-surface'} hover:text-error flex items-center justify-center transition-colors shadow-sm" onclick="event.stopPropagation(); window.IntalentApp.toggleFavorite('service', ${s.id}, this)">
            <span class="material-symbols-outlined text-base ${favSaved ? 'material-fill' : ''}">favorite</span>
          </button>
        </div>
        <div class="p-space-lg flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-space-sm mb-space-sm">
              <div class="relative w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-xs text-primary-container overflow-hidden cursor-pointer flex-shrink-0" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username || '')}')">
                ${s.freelancer_avatar ? `<img src="${escapeHtml(s.freelancer_avatar)}" class="w-full h-full object-cover" alt="" onerror="this.style.display='none'">` : initials}
              </div>
              <div class="flex-1 min-w-0 cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username || '')}')">
                <p class="font-label-lg text-label-lg text-on-surface truncate flex items-center gap-1">
                  <span>${escapeHtml(s.freelancer_name || "Freelance DZ")}</span>
                  ${s.freelancer_is_verified ? `<span class="material-symbols-outlined text-secondary text-xs material-fill" title="Identité Vérifiée">verified</span>` : ""}
                </p>
                <p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-0.5 truncate">
                  <span class="material-symbols-outlined text-xs text-secondary">location_on</span>
                  <span>${escapeHtml(s.freelancer_wilaya || "Alger (16)")}</span>
                </p>
              </div>
              <div class="flex items-center gap-1 text-secondary font-label-md text-label-md flex-shrink-0">
                <span class="material-symbols-outlined text-sm material-fill">star</span>
                <span class="font-bold">${Number(s.rating_avg || 5.0).toFixed(1)}</span>
                <span class="text-on-surface-variant font-normal">(${s.review_count || 0})</span>
              </div>
            </div>
            <h4 class="font-headline-sm text-[17px] leading-snug text-primary-container group-hover:text-secondary transition-colors line-clamp-2 cursor-pointer" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">
              ${escapeHtml(s.title)}
            </h4>
            ${skills.length > 0 ? `
              <div class="flex flex-wrap gap-1.5 pt-2.5">
                ${skills.slice(0, 3).map(sk => `<span class="px-2 py-0.5 rounded bg-surface-container-low font-label-md text-[11px] text-on-surface-variant">${escapeHtml(sk)}</span>`).join("")}
              </div>
            ` : ""}
          </div>
          <div class="mt-space-lg pt-space-md flex items-center justify-between bg-surface-container-low -mx-space-lg -mb-space-lg p-space-md px-space-lg">
            <div>
              <span class="font-label-md text-[11px] text-on-surface-variant block">${t("starting_at")}</span>
              <span class="font-currency-stat text-[18px] text-primary-container font-extrabold">${formatDZD(s.starting_price_dzd)}</span>
            </div>
            <button type="button" class="px-space-md py-2 rounded-full bg-primary-container text-on-primary hover:bg-secondary font-label-md text-label-md transition-colors shadow-sm" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">
              Commander
            </button>
          </div>
        </div>
      </article>
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

    const catOptions = state.categories.map(c => {
      const cname = state.lang === "fr" ? c.name_fr : (state.lang === "ar" ? c.name_ar : c.name);
      return `<option value="${escapeHtml(c.slug)}" ${state.params.category === c.slug ? 'selected' : ''}>${escapeHtml(cname)}</option>`;
    }).join("");

    const catLinks = state.categories.map(c => {
      const cname = state.lang === "fr" ? c.name_fr : (state.lang === "ar" ? c.name_ar : c.name);
      const isActive = state.route === "explore" && state.params.category === c.slug;
      return `
        <a class="font-label-md text-label-md cursor-pointer transition-colors ${isActive ? 'text-secondary font-bold border-b-2 border-secondary pb-0.5' : 'text-on-surface-variant hover:text-secondary'}" onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')">
          ${escapeHtml(cname)}
        </a>
      `;
    }).join("");

    let userNavHtml = "";
    if (state.user) {
      const activeRole = state.user.active_role || state.user.role;
      userNavHtml = `
        <div class="hidden xl:flex items-center bg-surface-container p-1 rounded-full gap-0.5 border border-outline-variant/50" title="Basculer votre profil actif">
          <button type="button" onclick="window.IntalentApp.switchActiveRole('freelancer')" class="px-2.5 py-1 rounded-full font-label-md text-[11px] transition-all ${activeRole === 'freelancer' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Freelance</button>
          <button type="button" onclick="window.IntalentApp.switchActiveRole('client')" class="px-2.5 py-1 rounded-full font-label-md text-[11px] transition-all ${activeRole === 'client' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Client</button>
          <button type="button" onclick="window.IntalentApp.switchActiveRole('business')" class="px-2.5 py-1 rounded-full font-label-md text-[11px] transition-all ${activeRole === 'business' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Business</button>
          ${state.user.role === 'admin' ? `<button type="button" onclick="window.IntalentApp.switchActiveRole('admin')" class="px-2.5 py-1 rounded-full font-label-md text-[11px] transition-all ${activeRole === 'admin' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Admin</button>` : ""}
        </div>
        <button type="button" onclick="window.IntalentApp.navigate('favorites')" aria-label="Favoris" class="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors" title="Mes Favoris">
          <span class="material-symbols-outlined text-[20px]">favorite</span>
          ${state.favorites.length > 0 ? `<span class="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary-fixed text-primary-container font-label-md text-[10px] flex items-center justify-center">${state.favorites.length}</span>` : ""}
        </button>
        <button type="button" onclick="window.IntalentApp.navigate('notifications')" aria-label="Notifications" class="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors" title="Notifications">
          <span class="material-symbols-outlined text-[21px]">notifications</span>
          ${state.unread_notifications > 0 ? `<span class="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary-container text-on-secondary font-label-md text-[10px] flex items-center justify-center">${state.unread_notifications}</span>` : ""}
        </button>
        <button type="button" onclick="window.IntalentApp.navigate('messages')" aria-label="Messagerie" class="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors" title="Messagerie Pro en Direct">
          <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
          ${state.unread_messages > 0 ? `<span class="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary text-on-secondary font-label-md text-[10px] flex items-center justify-center">${state.unread_messages}</span>` : ""}
        </button>
        <button type="button" onclick="window.IntalentApp.navigate('${getDashboardRouteForUser()}')" class="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container border border-surface-variant transition-all">
          <img src="${escapeHtml(state.user.avatar_url || '/assets/logos/logo-dark.png')}" alt="" class="w-7 h-7 rounded-full object-cover ring-2 ring-secondary/30">
          <span class="font-label-md text-label-md text-primary-container font-bold max-w-[100px] truncate">${escapeHtml(state.user.full_name)}</span>
        </button>
        <button type="button" onclick="window.IntalentApp.logout()" title="Déconnexion" class="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
          <span class="material-symbols-outlined text-[19px]">logout</span>
        </button>
      `;
    } else {
      userNavHtml = `
        <a onclick="window.IntalentApp.navigate('login')" class="cursor-pointer font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors px-space-xs">
          ${t("sign_in")}
        </a>
        <a onclick="window.IntalentApp.navigate('register')" class="cursor-pointer bg-primary-container text-on-primary hover:bg-secondary font-label-lg text-label-lg px-space-lg py-2.5 rounded-full transition-all shadow-[0_2px_8px_-2px_rgba(40,12,66,0.2)] hover:shadow-[0_4px_12px_rgba(118,39,224,0.3)]">
          ${t("join")}
        </a>
      `;
    }

    return `
      <header class="sticky top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container-highest shadow-[0_1px_8px_rgba(40,12,66,0.04)]">
        <div class="h-20 max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <!-- Brand Logo -->
          <div class="flex items-center gap-space-lg flex-shrink-0">
            <a onclick="window.IntalentApp.navigate('home')" class="cursor-pointer flex items-center gap-2.5">
              <img src="/assets/logos/logo-dark.png" alt="Intalent" class="h-10 w-auto object-contain">
            </a>
          </div>

          <!-- Unified Header Search Omnibox -->
          <form class="hidden md:flex flex-1 max-w-xl mx-space-md items-center" onsubmit="event.preventDefault(); window.IntalentApp.navigate('explore?q=' + encodeURIComponent(this.q.value) + (this.cat.value ? '&category=' + encodeURIComponent(this.cat.value) : ''))">
            <div class="w-full flex items-center bg-surface-container-low border border-outline-variant rounded-full pl-space-md pr-1.5 py-1.5 transition-all focus-within:border-secondary focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-secondary/15">
              <select name="cat" class="bg-transparent font-label-md text-label-md text-on-surface-variant pr-space-sm border-r border-outline-variant outline-none cursor-pointer max-w-[155px] truncate">
                <option value="">Toutes catégories</option>
                ${catOptions}
              </select>
              <input type="text" name="q" value="${escapeHtml(state.params.q || "")}" class="w-full bg-transparent px-space-sm font-body-sm text-body-sm text-on-surface placeholder-on-surface-variant outline-none" placeholder="${escapeHtml(t("search_placeholder"))}">
              <button type="submit" class="bg-primary-container text-on-primary hover:bg-secondary transition-colors p-2 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-sm leading-none">search</span>
              </button>
            </div>
          </form>

          <!-- Right Actions & Navigation -->
          <nav class="flex items-center gap-space-sm lg:gap-space-md flex-shrink-0">
            <a onclick="window.IntalentApp.navigate('explore')" class="cursor-pointer hidden xl:inline-block font-label-lg text-label-lg ${state.route === 'explore' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'} transition-colors">${t("explore")}</a>
            <a onclick="window.IntalentApp.navigate('pro-talent')" class="cursor-pointer hidden lg:inline-flex items-center gap-1 font-label-lg text-label-lg ${state.route === 'pro-talent' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'} transition-colors">
              <span class="material-symbols-outlined text-secondary text-[16px]">workspace_premium</span>
              <span>${t("pro_talent")}</span>
            </a>
            <a onclick="window.IntalentApp.navigate('business-solutions')" class="cursor-pointer hidden lg:inline-block font-label-lg text-label-lg ${state.route === 'business-solutions' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'} transition-colors">${t("business")}</a>
            <a onclick="window.IntalentApp.navigate('projects')" class="cursor-pointer hidden xl:inline-block font-label-lg text-label-lg ${state.route === 'projects' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'} transition-colors">${t("projects")}</a>

            <!-- Currency DZD & Language Switcher Pill -->
            <div class="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md border border-outline-variant">
              <span>🇩🇿</span>
              <span class="font-currency-stat text-xs text-on-surface">DZD</span>
              <span class="text-outline">|</span>
              <select aria-label="Langue" class="bg-transparent font-label-md text-xs text-primary-container font-bold outline-none cursor-pointer" onchange="window.IntalentApp.setLanguage(this.value)">
                <option value="fr" ${state.lang === 'fr' ? 'selected' : ''}>FR</option>
                <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>AR</option>
                <option value="en" ${state.lang === 'en' ? 'selected' : ''}>EN</option>
              </select>
            </div>

            ${userNavHtml}
          </nav>
        </div>

        <!-- Secondary Category Bar -->
        <div class="w-full bg-surface-container-lowest/80 border-t border-surface-container-highest overflow-x-auto">
          <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-2.5 flex items-center justify-between gap-space-lg whitespace-nowrap">
            <nav class="flex items-center gap-space-lg text-on-surface-variant">
              <a onclick="window.IntalentApp.navigate('categories')" class="cursor-pointer font-label-md text-label-md flex items-center gap-1 ${state.route === 'categories' ? 'text-secondary font-bold border-b-2 border-secondary pb-0.5' : 'text-on-surface-variant hover:text-secondary'} transition-colors">
                <span class="material-symbols-outlined text-[15px]">grid_view</span>
                <span>Toutes les catégories</span>
              </a>
              ${catLinks}
            </nav>
            <a onclick="window.IntalentApp.navigate('post-project')" class="cursor-pointer hidden lg:inline-flex items-center gap-1 font-label-md text-xs text-secondary font-bold hover:underline">
              <span class="material-symbols-outlined text-[15px]">add_circle</span>
              <span>Publier un projet sur-mesure</span>
            </a>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    return `
      <footer class="w-full bg-primary-container text-on-secondary-container border-t border-surface-container-highest mt-space-2xl">
        <div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop pt-space-2xl pb-space-xl">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl mb-space-2xl">
            <div class="lg:col-span-1">
              <div class="flex items-center gap-space-sm mb-space-md cursor-pointer" onclick="window.IntalentApp.navigate('home')">
                <img src="/assets/logos/logo-white-purple.png" alt="Intalent" class="h-11 w-auto rounded-lg">
              </div>
              <p class="font-body-sm text-body-sm text-on-primary-container mb-space-md leading-relaxed">
                La plateforme de référence en Algérie reliant les entreprises et porteurs de projets aux meilleurs talents indépendants qualifiés et vérifiés à travers les 58 Wilayas.
              </p>
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-highest/10 border border-on-primary-container/20 text-on-secondary-container font-label-md text-label-md">
                <span class="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                Réseau Certifié Algérie • 58 Wilayas
              </div>
            </div>

            <div>
              <h4 class="font-label-lg text-label-lg text-white mb-space-md uppercase tracking-wider">Catégories</h4>
              <ul class="space-y-space-sm font-body-sm text-body-sm text-on-primary-container">
                ${state.categories.slice(0, 6).map(c => {
                  const cname = state.lang === "fr" ? c.name_fr : (state.lang === "ar" ? c.name_ar : c.name);
                  return `<li><a onclick="window.IntalentApp.navigate('explore?category=${encodeURIComponent(c.slug)}')" class="cursor-pointer hover:text-white transition-colors">${escapeHtml(cname)}</a></li>`;
                }).join("")}
                <li><a onclick="window.IntalentApp.navigate('categories')" class="cursor-pointer text-secondary-fixed hover:text-white transition-colors font-semibold">Toutes les catégories →</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-label-lg text-label-lg text-white mb-space-md uppercase tracking-wider">Pour les Clients</h4>
              <ul class="space-y-space-sm font-body-sm text-body-sm text-on-primary-container">
                <li><a onclick="window.IntalentApp.navigate('how-it-works')" class="cursor-pointer hover:text-white transition-colors">Comment fonctionne Intalent</a></li>
                <li><a onclick="window.IntalentApp.navigate('business-solutions')" class="cursor-pointer hover:text-white transition-colors">Intalent Business (Entreprises)</a></li>
                <li><a onclick="window.IntalentApp.navigate('post-project')" class="cursor-pointer hover:text-white transition-colors">Publier un appel d'offres</a></li>
                <li><a onclick="window.IntalentApp.navigate('trust-safety')" class="cursor-pointer hover:text-white transition-colors">Paiement Séquestre CIB / Edahabia</a></li>
                <li><a onclick="window.IntalentApp.navigate('pricing-fees')" class="cursor-pointer hover:text-white transition-colors">Tarifs & Facturation Fiscale</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-label-lg text-label-lg text-white mb-space-md uppercase tracking-wider">Pour les Freelances</h4>
              <ul class="space-y-space-sm font-body-sm text-body-sm text-on-primary-container">
                <li><a onclick="window.IntalentApp.navigate('register')" class="cursor-pointer hover:text-white transition-colors">Devenir prestataire certifié</a></li>
                <li><a onclick="window.IntalentApp.navigate('pro-upgrade')" class="cursor-pointer hover:text-white transition-colors">Programme Intalent Pro ✦</a></li>
                <li><a onclick="window.IntalentApp.navigate('freelancers')" class="cursor-pointer hover:text-white transition-colors">Annuaire des Talents DZ</a></li>
                <li><a onclick="window.IntalentApp.navigate('projects')" class="cursor-pointer hover:text-white transition-colors">Projets & Missions ouvertes</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-label-lg text-label-lg text-white mb-space-md uppercase tracking-wider">Entreprise & Support</h4>
              <ul class="space-y-space-sm font-body-sm text-body-sm text-on-primary-container">
                <li><a onclick="window.IntalentApp.navigate('about')" class="cursor-pointer hover:text-white transition-colors">À propos d'Intalent Algérie</a></li>
                <li><a onclick="window.IntalentApp.navigate('help-faq')" class="cursor-pointer hover:text-white transition-colors">Centre d'aide & FAQ</a></li>
                <li><a onclick="window.IntalentApp.navigate('contact')" class="cursor-pointer hover:text-white transition-colors">Contacter le Support 7j/7</a></li>
                <li><a onclick="window.IntalentApp.navigate('terms')" class="cursor-pointer hover:text-white transition-colors">Conditions Générales</a></li>
                <li><a onclick="window.IntalentApp.navigate('privacy')" class="cursor-pointer hover:text-white transition-colors">Politique de Confidentialité</a></li>
              </ul>
            </div>
          </div>

          <div class="pt-space-lg border-t border-surface-container-highest/20 flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div class="flex flex-col sm:flex-row items-center gap-space-sm text-on-primary-container font-body-sm text-body-sm">
              <span>© 2026 Intalent Algérie. Tous droits réservés.</span>
              <span class="hidden sm:inline text-on-primary-container/40">•</span>
              <span>Monnaie officielle : <strong class="text-white font-currency-stat">DZD (د.ج)</strong></span>
              <span class="hidden sm:inline text-on-primary-container/40">•</span>
              <span>Passerelle : <strong class="text-secondary-fixed">${escapeHtml(state.settings.payment_provider_label || "SATIM CIB / Edahabia Sandbox")}</strong></span>
            </div>
            <div class="flex items-center gap-space-md text-on-primary-container font-label-md text-label-md">
              <a onclick="window.IntalentApp.navigate('login')" class="cursor-pointer hover:text-white transition-colors">Comptes Démo QA</a>
              <span>•</span>
              <span class="text-secondary-fixed">Propulsé par Gemini 3.8 Flash AI</span>
            </div>
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
    isFavorite,
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
        showToast(`Profil actif basculé vers : ${role.toUpperCase()}`);
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
      showToast("Déconnexion réussie.");
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
    root.innerHTML = renderHeader() + `<main id="page-main" class="w-full bg-background min-h-[75vh]"><div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl"><p class="text-on-surface-variant">Chargement d'Intalent...</p></div></main>` + renderFooter();
    const main = document.getElementById("page-main");
    try {
      if (window.IntalentPages && window.IntalentPages[state.route]) {
        await window.IntalentPages[state.route](main, state);
      } else {
        await window.IntalentPages.home(main, state);
      }
    } catch (err) {
      main.innerHTML = `<div class="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl"><div class="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm"><h3 class="font-headline-sm text-primary-container">Impossible de charger cette vue</h3><p class="text-error mt-2">${escapeHtml(err.message)}</p><button class="mt-4 px-5 py-2.5 rounded-full bg-primary-container text-white font-label-md" onclick="window.IntalentApp.navigate('home')">Retour à l'accueil</button></div></div>`;
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
