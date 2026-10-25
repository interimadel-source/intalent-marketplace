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
          <select name="reason" class="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" required>
            <option value="Inaccurate or misleading listing">Annonce trompeuse ou inexacte</option>
            <option value="Copyright or IP violation">Violation de propriété intellectuelle / droits d'auteur</option>
            <option value="Off-platform payment solicitation">Demande de paiement hors plateforme (CCP direct / Cash)</option>
            <option value="Order dispute / non-delivery">Litige sur commande / Non-livraison</option>
            <option value="Spam or abusive behavior">Spam ou comportement inapproprié</option>
          </select>
        </div>
        <div>
          <label class="font-label-md text-label-md text-on-surface block mb-1">Détails & preuves</label>
          <textarea name="details" class="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" rows="3" placeholder="Décrivez précisément la situation..." required></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md font-bold" onclick="window.IntalentApp.closeModal()">Annuler</button>
          <button type="submit" class="px-5 py-2 rounded-full bg-tertiary-fixed text-primary-container hover:scale-105 font-label-md font-bold transition-all shadow-sm">Envoyer le signalement</button>
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
      <p class="font-body-sm text-on-surface-variant mb-4">Discutez de votre cahier des charges, des délais ou demandez une offre sur-mesure en DZD avec séquestre SATIM.</p>
      <form id="contact-modal-form" class="space-y-3">
        <div>
          <label class="font-label-md text-label-md text-on-surface block mb-1">Objet</label>
          <input type="text" name="subject" class="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" value="${escapeHtml(defaultSubject)}" placeholder="Objet de votre demande (optionnel)">
        </div>
        <div>
          <label class="font-label-md text-label-md text-on-surface block mb-1">Votre message</label>
          <textarea name="body" class="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm outline-none border border-outline-variant" rows="4" placeholder="Salam ${escapeHtml(recipientName)}, je souhaiterais discuter de mon projet..." required></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md font-bold" onclick="window.IntalentApp.closeModal()">Annuler</button>
          <button type="submit" class="px-5 py-2.5 rounded-full bg-tertiary-fixed text-primary-container hover:scale-105 font-label-md font-bold transition-all shadow-sm flex items-center gap-1.5">
            <span>Envoyer en direct</span>
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

  // Bento 3D Service Card matching Stitch Screen b9834e6cb185480eb2b0032fdc19ea36 & Home Page
  function renderServiceCard(s) {
    const favSaved = isFavorite("service", s.id);
    const initials = (s.freelancer_name || "IN").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
    let skills = [];
    try { skills = JSON.parse(s.skills_tags || "[]"); } catch (_) {}

    let topBadge = "";
    if (s.is_pro_listing || s.freelancer_is_pro) {
      topBadge = `
        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary-container text-tertiary-fixed font-label-xs text-label-xs font-extrabold flex items-center gap-1 shadow-md">
          <span class="material-symbols-outlined text-[13px]">verified</span>
          <span>INTALENT PRO</span>
        </div>
      `;
    } else if (s.is_sponsored || s.is_featured) {
      topBadge = `
        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-label-xs font-extrabold flex items-center gap-1 shadow-md">
          <span class="material-symbols-outlined text-[13px]">bolt</span>
          <span>TOP VEDETTE</span>
        </div>
      `;
    } else {
      topBadge = `
        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-xs text-label-xs font-bold flex items-center gap-1 shadow-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Séquestre SATIM</span>
        </div>
      `;
    }

    return `
      <article class="flex flex-col rounded-[28px] bg-surface-container-lowest p-space-md shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-10px_rgba(37,8,63,0.12)] transition-all duration-300 group" data-service-id="${s.id}">
        <div class="relative h-44 w-full rounded-2xl overflow-hidden bg-surface-container mb-space-sm cursor-pointer" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHtml(s.cover_image)}" alt="${escapeHtml(s.title)}" loading="lazy" onerror="this.src='/assets/logos/logo-white-purple.png'">
          ${topBadge}
          <button type="button" aria-label="Favoris" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur ${favSaved ? 'text-error active' : 'text-on-surface'} hover:text-error flex items-center justify-center transition-colors shadow-sm" onclick="event.stopPropagation(); window.IntalentApp.toggleFavorite('service', ${s.id}, this)">
            <span class="material-symbols-outlined text-base ${favSaved ? 'material-fill' : ''}">favorite</span>
          </button>
          <div class="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-primary-container/95 backdrop-blur-md text-tertiary-fixed font-label-xs text-label-xs font-bold shadow-sm">
            ★ ${Number(s.rating_avg || 5.0).toFixed(1)} (${s.review_count || 12} avis)
          </div>
        </div>
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <div class="relative w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-xs text-primary-container overflow-hidden cursor-pointer flex-shrink-0 ring-2 ring-surface-container-high" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username || '')}')">
                ${s.freelancer_avatar ? `<img src="${escapeHtml(s.freelancer_avatar)}" class="w-full h-full object-cover" alt="${escapeHtml(s.freelancer_name || '')}" onerror="this.style.display='none'">` : initials}
              </div>
              <div class="flex-1 min-w-0 cursor-pointer" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(s.freelancer_username || '')}')">
                <p class="font-label-lg text-label-lg text-on-surface font-bold truncate flex items-center gap-1">
                  <span>${escapeHtml(s.freelancer_name || "Freelance DZ")}</span>
                  ${s.freelancer_is_verified ? `<span class="material-symbols-outlined text-secondary text-[14px] material-fill" title="Identité CNI/ANA Vérifiée">verified</span>` : ""}
                </p>
                <p class="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1 truncate">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>${escapeHtml(s.freelancer_wilaya || "Alger (16)")}</span>
                  <span>•</span>
                  <span>Livraison ${s.delivery_days || 3}j</span>
                </p>
              </div>
            </div>
            <h4 class="font-title-md text-[16px] leading-snug text-on-surface font-bold group-hover:text-secondary transition-colors line-clamp-2 cursor-pointer" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">
              ${escapeHtml(s.title)}
            </h4>
            ${skills.length > 0 ? `
              <div class="flex flex-wrap gap-1 mt-space-sm">
                ${skills.slice(0, 3).map(sk => `<span class="px-2 py-0.5 rounded bg-surface-container-low font-label-xs text-label-xs text-on-surface">${escapeHtml(sk)}</span>`).join("")}
              </div>
            ` : ""}
          </div>
          <div class="mt-space-md pt-space-sm border-t border-surface-container-high/60 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="font-label-xs text-label-xs text-on-surface-variant">${t("starting_at")}</span>
              <span class="font-title-md text-title-md text-on-surface font-extrabold">${Number(s.starting_price_dzd || 0).toLocaleString("fr-DZ")} <span class="font-label-xs text-label-xs font-bold text-secondary">DZD</span></span>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" title="Contacter en direct" class="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors" onclick="event.stopPropagation(); window.IntalentApp.openContactModal(${s.freelancer_id || 2}, '${escapeHtml(s.freelancer_name || 'Prestataire')}', '${escapeHtml(s.title)}')">
                <span class="material-symbols-outlined text-[17px]">chat</span>
              </button>
              <button type="button" class="px-space-md py-2 rounded-full bg-tertiary-fixed text-primary-container hover:scale-105 font-label-md text-label-md font-bold transition-all shadow-sm" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">
                Commander
              </button>
            </div>
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

  // Exact Bento 3D Header from c75e2cfaaf304826ba062663587f01f6.html using official /assets/logos/logo-dark.png
  function renderHeader() {
    const dir = window.INTALENT_I18N[state.lang]?.dir || "ltr";
    document.body.setAttribute("dir", dir);

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
        <div class="hidden xl:flex items-center bg-surface-container-low p-1 rounded-full gap-0.5 border border-outline-variant/40" title="Basculer votre profil actif">
          <button type="button" onclick="window.IntalentApp.switchActiveRole('freelancer')" class="px-2.5 py-1 rounded-full font-label-xs text-[10px] font-bold transition-all ${activeRole === 'freelancer' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Freelance</button>
          <button type="button" onclick="window.IntalentApp.switchActiveRole('client')" class="px-2.5 py-1 rounded-full font-label-xs text-[10px] font-bold transition-all ${activeRole === 'client' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Client</button>
          <button type="button" onclick="window.IntalentApp.switchActiveRole('business')" class="px-2.5 py-1 rounded-full font-label-xs text-[10px] font-bold transition-all ${activeRole === 'business' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Business</button>
          <button type="button" onclick="window.IntalentApp.switchActiveRole('admin')" class="px-2.5 py-1 rounded-full font-label-xs text-[10px] font-bold transition-all ${activeRole === 'admin' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Admin / Interne</button>
        </div>
        <button type="button" onclick="window.IntalentApp.navigate('favorites')" aria-label="Favoris" class="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-secondary transition-colors" title="Mes Favoris">
          <span class="material-symbols-outlined text-[20px]">favorite</span>
          ${state.favorites.length > 0 ? `<span class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-[10px] font-bold flex items-center justify-center">${state.favorites.length}</span>` : ""}
        </button>
        <button type="button" onclick="window.IntalentApp.navigate('notifications')" aria-label="Notifications" class="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-secondary transition-colors" title="Notifications">
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          ${state.unread_notifications > 0 ? `<span class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-secondary text-white font-label-xs text-[10px] font-bold flex items-center justify-center">${state.unread_notifications}</span>` : ""}
        </button>
        <button type="button" onclick="window.IntalentApp.navigate('messages')" aria-label="Messagerie" class="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-secondary transition-colors" title="Messagerie, Appel Vidéo & Vocal en Direct">
          <span class="material-symbols-outlined text-[20px]">videocam</span>
          ${state.unread_messages > 0 ? `<span class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-tertiary-fixed text-primary-container font-label-xs text-[10px] font-bold flex items-center justify-center">${state.unread_messages}</span>` : ""}
        </button>
        <button type="button" onclick="window.IntalentApp.navigate('${getDashboardRouteForUser()}')" class="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-all">
          <img src="${escapeHtml(state.user.avatar_url || '/assets/logos/logo-dark.png')}" alt="" class="w-7 h-7 rounded-full object-cover ring-2 ring-secondary/40">
          <span class="font-label-md text-label-md text-on-surface font-bold max-w-[100px] truncate">${escapeHtml(state.user.full_name)}</span>
        </button>
        <button type="button" onclick="window.IntalentApp.logout()" title="Déconnexion" class="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
          <span class="material-symbols-outlined text-[19px]">logout</span>
        </button>
      `;
    } else {
      userNavHtml = `
        <a onclick="window.IntalentApp.navigate('login')" class="cursor-pointer inline-flex items-center justify-center px-space-md py-2.5 rounded-full font-label-lg text-label-lg font-bold text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-all">
          ${t("sign_in")}
        </a>
        <a onclick="window.IntalentApp.navigate('register')" class="cursor-pointer inline-flex items-center justify-center px-space-lg py-2.5 rounded-full font-label-lg text-label-lg font-bold bg-tertiary-fixed text-primary-container shadow-[0_8px_20px_-4px_rgba(202,243,0,0.45)] hover:shadow-[0_10px_24px_-4px_rgba(202,243,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all">
          ${t("join")}
        </a>
      `;
    }

    return `
      <header class="sticky top-0 inset-x-0 w-full z-50 bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(37,8,63,0.05)] border-b border-surface-container-high/60">
        <div class="h-20 w-full px-gutter max-w-7xl mx-auto flex items-center justify-between gap-space-md">
          <!-- Official INTALENT Brand Logo + Quick Search Bar -->
          <div class="flex items-center gap-space-lg flex-shrink-0">
            <a onclick="window.IntalentApp.navigate('home')" class="cursor-pointer flex items-center gap-2.5 group">
              <img src="/assets/logos/logo-dark.png" alt="INTALENT Algérie" class="h-10 w-auto object-contain">
              <span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-wider">DZ 3.0</span>
            </a>
            <form class="hidden xl:flex items-center relative w-64" onsubmit="event.preventDefault(); window.IntalentApp.navigate('explore?q=' + encodeURIComponent(this.q.value))">
              <div class="w-full flex items-center justify-between bg-surface-container-low px-space-md py-2 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-secondary/20">
                <div class="flex items-center gap-1.5 text-on-surface-variant flex-1">
                  <span class="material-symbols-outlined text-[18px] text-secondary">search</span>
                  <input type="text" name="q" value="${escapeHtml(state.params.q || "")}" class="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder-on-surface-variant outline-none" placeholder="Rechercher un profil ou service...">
                </div>
                <button type="submit" class="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold font-label-xs text-on-surface-variant bg-surface-container-highest rounded-md shadow-sm hover:bg-secondary hover:text-white transition-colors">OK</button>
              </div>
            </form>
          </div>

          <!-- Center Bento Pill Navigation -->
          <nav class="hidden lg:flex items-center gap-1 bg-surface-container-low p-1.5 rounded-full">
            <a onclick="window.IntalentApp.navigate('explore')" class="cursor-pointer px-space-md py-1.5 rounded-full font-label-lg text-label-lg transition-all ${state.route === 'explore' ? 'bg-surface-container-high text-on-surface font-bold shadow-2xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}">Explore</a>
            <a onclick="window.IntalentApp.navigate('freelancers')" class="cursor-pointer px-space-md py-1.5 rounded-full font-label-lg text-label-lg transition-all ${state.route === 'freelancers' ? 'bg-surface-container-high text-on-surface font-bold shadow-2xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}">100 Freelances DZ</a>
            <a onclick="window.IntalentApp.navigate('pro-upgrade')" class="cursor-pointer px-space-md py-1.5 rounded-full font-label-lg text-label-lg transition-all flex items-center gap-1.5 ${state.route === 'pro-upgrade' || state.route === 'pro-talent' ? 'bg-surface-container-high text-on-surface font-bold shadow-2xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}">
              <span class="inline-block w-2 h-2 rounded-full bg-secondary"></span>
              <span>Intalent Pro</span>
            </a>
            <a onclick="window.IntalentApp.navigate('business-solutions')" class="cursor-pointer px-space-md py-1.5 rounded-full font-label-lg text-label-lg transition-all flex items-center gap-1.5 ${state.route === 'business-solutions' ? 'bg-surface-container-high text-on-surface font-bold shadow-2xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}">
              <span class="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
              <span>Intalent Business</span>
            </a>
            <a onclick="window.IntalentApp.navigate('trust-safety')" class="cursor-pointer px-space-md py-1.5 rounded-full font-label-lg text-label-lg transition-all flex items-center gap-1.5 ${state.route === 'trust-safety' ? 'bg-surface-container-high text-on-surface font-bold shadow-2xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}">
              <span class="inline-block w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
              <span>Garantie SATIM</span>
            </a>
          </nav>

          <!-- Right Actions: DZD + Lang + APK + User -->
          <div class="flex items-center gap-space-sm flex-shrink-0">
            <a onclick="window.IntalentApp.navigate('mobile-app')" class="cursor-pointer hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-container text-tertiary-fixed hover:scale-105 font-label-xs text-label-xs font-extrabold transition-all shadow-sm" title="Télécharger l'application Android Intalent APK">
              <span class="material-symbols-outlined text-[15px]">android</span>
              <span>App APK</span>
            </a>
            <div class="hidden md:flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-full gap-1.5 text-on-surface">
              <span class="text-sm leading-none">🇩🇿</span>
              <span class="font-label-md text-label-md font-bold tracking-tight text-on-surface">DZD (د.ج)</span>
              <span class="text-outline-variant font-label-xs">|</span>
              <select aria-label="Langue" class="bg-transparent font-label-md text-xs text-on-surface font-bold outline-none cursor-pointer" onchange="window.IntalentApp.setLanguage(this.value)">
                <option value="fr" ${state.lang === 'fr' ? 'selected' : ''}>FR</option>
                <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>AR</option>
                <option value="en" ${state.lang === 'en' ? 'selected' : ''}>EN</option>
              </select>
            </div>
            ${userNavHtml}
          </div>
        </div>

        <!-- Secondary Category & Quick Action Bar -->
        <div class="w-full bg-surface-container-lowest/90 border-t border-surface-container-high/50 overflow-x-auto">
          <div class="max-w-7xl mx-auto px-gutter py-2 flex items-center justify-between gap-space-lg whitespace-nowrap">
            <nav class="flex items-center gap-space-md text-on-surface-variant">
              <a onclick="window.IntalentApp.navigate('categories')" class="cursor-pointer font-label-md text-label-md flex items-center gap-1 ${state.route === 'categories' ? 'text-secondary font-bold border-b-2 border-secondary pb-0.5' : 'text-on-surface-variant hover:text-secondary'} transition-colors">
                <span class="material-symbols-outlined text-[15px]">grid_view</span>
                <span>Pôles Tech</span>
              </a>
              ${catLinks}
            </nav>
            <div class="hidden lg:flex items-center gap-4">
              <a onclick="window.IntalentApp.navigate('projects')" class="cursor-pointer inline-flex items-center gap-1 font-label-md text-xs text-on-surface-variant hover:text-secondary font-bold">
                <span class="material-symbols-outlined text-[15px] text-secondary">work</span>
                <span>Missions Ouvertes</span>
              </a>
              <a onclick="window.IntalentApp.navigate('post-project')" class="cursor-pointer inline-flex items-center gap-1 font-label-md text-xs text-primary-container bg-tertiary-fixed px-3 py-1 rounded-full font-extrabold hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[14px]">add_circle</span>
                <span>Publier un Projet</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  // Exact Bento 3D Footer from c75e2cfaaf304826ba062663587f01f6.html using official /assets/logos/logo-dark.png
  function renderFooter() {
    return `
      <footer class="w-full bg-surface-container-lowest mt-space-xl pt-space-xl pb-margin shadow-[0_-4px_24px_rgba(37,8,63,0.03)] border-t border-surface-container-high">
        <div class="max-w-7xl mx-auto px-gutter">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl">
            <div class="lg:col-span-2 flex flex-col gap-space-md">
              <div class="flex items-center gap-space-sm cursor-pointer" onclick="window.IntalentApp.navigate('home')">
                <img src="/assets/logos/logo-dark.png" alt="INTALENT Algérie" class="h-10 w-auto object-contain">
              </div>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Le hub d'élite reliant les ingénieurs logiciels, designers UI/UX et experts cloud algériens aux entreprises locales et internationales avec paiement séquestre SATIM sécurisé.
              </p>
              <div class="flex flex-col gap-space-xs pt-space-xs">
                <span class="font-label-xs text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">Infrastructure Monétique Agréée</span>
                <div class="flex items-center gap-space-sm flex-wrap">
                  <div class="px-space-sm py-1.5 rounded-xl bg-surface-container-low flex items-center gap-1.5 shadow-sm cursor-pointer" onclick="window.IntalentApp.navigate('trust-safety')">
                    <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                    <span class="font-label-md text-label-md font-bold text-on-surface">GIE Monétique &amp; SATIM</span>
                  </div>
                  <div class="px-space-sm py-1.5 rounded-xl bg-surface-container-low flex items-center gap-1.5 shadow-sm cursor-pointer" onclick="window.IntalentApp.navigate('trust-safety')">
                    <span class="font-label-md text-label-md font-bold text-secondary">CIB</span>
                    <span class="font-label-xs text-label-xs text-on-surface-variant">Interbancaire</span>
                  </div>
                  <div class="px-space-sm py-1.5 rounded-xl bg-surface-container-low flex items-center gap-1.5 shadow-sm cursor-pointer" onclick="window.IntalentApp.navigate('trust-safety')">
                    <span class="font-label-md text-label-md font-bold text-on-surface">Edahabia</span>
                    <span class="font-label-xs text-label-xs text-on-surface-variant">Algérie Poste</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-space-sm">
              <span class="font-title-md text-title-md font-bold text-on-surface">Domaines Tech</span>
              <ul class="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><a onclick="window.IntalentApp.navigate('explore?category=programming-tech')" class="cursor-pointer hover:text-secondary transition-colors">Développement Fullstack &amp; Mobile</a></li>
                <li><a onclick="window.IntalentApp.navigate('explore?category=ai-data')" class="cursor-pointer hover:text-secondary transition-colors">Intelligence Artificielle &amp; Data</a></li>
                <li><a onclick="window.IntalentApp.navigate('explore?category=programming-tech')" class="cursor-pointer hover:text-secondary transition-colors">Cloud, DevOps &amp; Cybersécurité</a></li>
                <li><a onclick="window.IntalentApp.navigate('explore?category=graphics-design')" class="cursor-pointer hover:text-secondary transition-colors">UI/UX &amp; Product Design</a></li>
                <li><a onclick="window.IntalentApp.navigate('explore?category=digital-marketing')" class="cursor-pointer hover:text-secondary transition-colors">Marketing Digital &amp; TikTok DZ</a></li>
                <li><a onclick="window.IntalentApp.navigate('pro-upgrade')" class="cursor-pointer text-secondary font-bold hover:underline">Abonnements Intalent Pro →</a></li>
              </ul>
            </div>

            <div class="flex flex-col gap-space-sm">
              <span class="font-title-md text-title-md font-bold text-on-surface">Pôles &amp; Wilayas</span>
              <ul class="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><a onclick="window.IntalentApp.navigate('freelancers?wilaya=Alger')" class="cursor-pointer hover:text-secondary transition-colors">Alger (16) — Sidi Abdellah Cyberparc</a></li>
                <li><a onclick="window.IntalentApp.navigate('freelancers?wilaya=Oran')" class="cursor-pointer hover:text-secondary transition-colors">Oran (31) — Pôle Technologique USTO</a></li>
                <li><a onclick="window.IntalentApp.navigate('freelancers?wilaya=Constantine')" class="cursor-pointer hover:text-secondary transition-colors">Constantine (25) &amp; Sétif (19)</a></li>
                <li><a onclick="window.IntalentApp.navigate('freelancers?wilaya=Annaba')" class="cursor-pointer hover:text-secondary transition-colors">Annaba (23), Tlemcen (13), Batna (05)</a></li>
                <li><a onclick="window.IntalentApp.navigate('freelancers')" class="cursor-pointer text-secondary font-bold hover:underline">Voir les 100 Freelances Certifiés →</a></li>
              </ul>
            </div>

            <div class="flex flex-col gap-space-sm">
              <span class="font-title-md text-title-md font-bold text-on-surface">Confiance &amp; Légal</span>
              <ul class="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><a onclick="window.IntalentApp.navigate('trust-safety')" class="cursor-pointer hover:text-secondary transition-colors">Garantie Escrow &amp; Séquestre DZD</a></li>
                <li><a onclick="window.IntalentApp.navigate('pricing-fees')" class="cursor-pointer hover:text-secondary transition-colors">Contrat Auto-Entrepreneur (ANA)</a></li>
                <li><a onclick="window.IntalentApp.navigate('business-solutions')" class="cursor-pointer hover:text-secondary transition-colors">Intalent Business &amp; Squads B2B</a></li>
                <li><a onclick="window.IntalentApp.navigate('mobile-app')" class="cursor-pointer hover:text-secondary transition-colors">Application Mobile Android (APK)</a></li>
                <li><a onclick="window.IntalentApp.navigate('contact')" class="cursor-pointer hover:text-secondary transition-colors">Centre d'Assistance 24/7</a></li>
              </ul>
            </div>
          </div>

          <div class="pt-space-lg border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div class="flex items-center gap-space-sm flex-wrap text-center sm:text-left">
              <span class="font-body-sm text-body-sm text-on-surface-variant">© 2026 INTALENT Tech Marketplace. Conçu pour l'écosystème technologique en Algérie (58 Wilayas).</span>
            </div>
            <div class="flex items-center gap-space-md text-on-surface-variant font-label-md text-label-md">
              <span class="inline-flex items-center gap-1.5 text-on-surface font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Système SATIM Opérationnel</span>
              </span>
              <a onclick="window.IntalentApp.navigate('login')" class="cursor-pointer hover:text-secondary transition-colors font-bold">Comptes Démo QA</a>
              <a onclick="window.IntalentApp.navigate('privacy')" class="cursor-pointer hover:text-on-surface transition-colors">Confidentialité</a>
              <a onclick="window.IntalentApp.navigate('terms')" class="cursor-pointer hover:text-on-surface transition-colors">Conditions Générales</a>
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
    let root = document.getElementById("app-root") || document.getElementById("app-main") || document.body;
    if (!root) return;
    root.innerHTML = renderHeader() + `<main id="page-main" class="w-full bg-surface min-h-[75vh]"><div class="max-w-7xl mx-auto px-gutter py-space-xl"><p class="text-on-surface-variant">Chargement d'Intalent...</p></div></main>` + renderFooter();
    const main = document.getElementById("page-main") || root;
    try {
      if (window.IntalentPages && window.IntalentPages[state.route]) {
        await window.IntalentPages[state.route](main, state);
      } else {
        await window.IntalentPages.home(main, state);
      }
    } catch (err) {
      main.innerHTML = `<div class="max-w-7xl mx-auto px-gutter py-space-xl"><div class="bg-surface-container-lowest p-space-xl rounded-[28px] shadow-sm"><h3 class="font-headline-sm text-primary-container">Impossible de charger cette vue</h3><p class="text-error mt-2">${escapeHtml(err.message)}</p><button class="mt-4 px-5 py-2.5 rounded-full bg-tertiary-fixed text-primary-container font-label-md font-bold" onclick="window.IntalentApp.navigate('home')">Retour à l'accueil</button></div></div>`;
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
