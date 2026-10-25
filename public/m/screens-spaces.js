/* INTALENT Mobile — Role-specific Spaces & Settings
   Stitch refs:
   - Intalent Freelance - Espace Prestataire (b778f3a65d6d4570b2fc1915f64f89b5)
   - Intalent Business - Espace Recruteur (b63b7552019e4df8baf6d940aeecc6a0)
   - Intalent Admin - Superviseur Algérie (4ca2bdd8283e408a9c499dc4dc475bfd)
   - Account, Notifications & Messaging chat
*/
(function () {
  const S = M.screens;
  const esc = M.esc;

  /* ---------- ACCOUNT & PROFILE SWITCHER ---------- */
  S.account = async (view) => {
    const u = M.state.user;
    if (!u) return M.go("login");
    const activeRole = u.active_role || u.role;

    view.innerHTML = `
      <header class="flex items-center justify-between mb-4 pt-1">
        <h1 class="text-lg font-extrabold text-slate-900">Mon Compte</h1>
        <button class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600" id="b-logout" aria-label="Déconnexion">${M.icon("logout")}</button>
      </header>

      <div class="m-card p-4 flex items-center gap-3 mb-4">
        ${M.avatar(u.avatar_url, u.full_name, "w-14 h-14")}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <h2 class="text-sm font-bold text-slate-900 truncate">${esc(u.full_name)}</h2>
            ${u.is_verified ? M.icon("verified", "text-brand-accent !text-[16px]", true) : ""}
          </div>
          <p class="text-xs text-slate-400">@${esc(u.username)} · ${esc(u.email)}</p>
          <div class="flex items-center gap-1.5 mt-1.5">
            <span class="m-badge bg-brand-neon text-brand-dark uppercase font-extrabold text-[9px]">${esc(activeRole)}</span>
            <span class="text-[10px] text-slate-400">${esc(u.wilaya || "Algérie")}</span>
          </div>
        </div>
      </div>

      <!-- Quick Spaces switch based on roles -->
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Espaces & Rôles</h3>
      <div class="grid grid-cols-2 gap-2 mb-5">
        <button class="m-card p-3 text-left ${activeRole === "freelancer" ? "border-brand-neon bg-brand-dark text-white" : ""}" onclick="M.go('space-freelancer')">
          <div class="flex items-center justify-between mb-1">
            ${M.icon("laptop_mac", activeRole === "freelancer" ? "text-brand-neon" : "text-brand-purple")}
            ${activeRole === "freelancer" ? `<span class="m-badge bg-brand-neon text-brand-dark text-[8px]">ACTIF</span>` : ""}
          </div>
          <p class="text-xs font-bold">Espace Freelance</p>
          <p class="text-[10px] ${activeRole === "freelancer" ? "text-slate-300" : "text-slate-400"}">Gérer mes services</p>
        </button>

        <button class="m-card p-3 text-left ${activeRole === "business" ? "border-brand-neon bg-brand-dark text-white" : ""}" onclick="M.go('space-business')">
          <div class="flex items-center justify-between mb-1">
            ${M.icon("apartment", activeRole === "business" ? "text-brand-neon" : "text-brand-purple")}
            ${activeRole === "business" ? `<span class="m-badge bg-brand-neon text-brand-dark text-[8px]">ACTIF</span>` : ""}
          </div>
          <p class="text-xs font-bold">Espace Entreprise</p>
          <p class="text-[10px] ${activeRole === "business" ? "text-slate-300" : "text-slate-400"}">Missions B2B & Équipe</p>
        </button>

        ${u.role === "admin" ? `
          <button class="m-card p-3 text-left col-span-2 bg-gradient-to-r from-brand-dark to-brand-purple text-white" onclick="M.go('space-admin')">
            <div class="flex items-center justify-between mb-1">
              ${M.icon("shield_person", "text-brand-neon")}
              <span class="m-badge bg-brand-neon text-brand-dark text-[8px]">SUPERVISEUR</span>
            </div>
            <p class="text-xs font-bold">Cockpit Superviseur Algérie</p>
            <p class="text-[10px] text-slate-300">Modération, finances & statistiques globales</p>
          </button>
        ` : ""}
      </div>

      <!-- Navigation links -->
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Navigation & Paramètres</h3>
      <div class="m-card divide-y divide-slate-100 overflow-hidden mb-5">
        <button class="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold" onclick="M.go('edit-profile')">
          <span class="flex items-center gap-2.5">${M.icon("manage_accounts", "text-slate-600")} Modifier mon profil</span>
          ${M.icon("chevron_right", "text-slate-400")}
        </button>

        <button class="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold" onclick="M.go('portfolio')">
          <span class="flex items-center gap-2.5">${M.icon("photo_library", "text-slate-600")} Mon Portfolio de réalisations</span>
          ${M.icon("chevron_right", "text-slate-400")}
        </button>

        <button class="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold" onclick="M.go('orders')">
          <span class="flex items-center gap-2.5">${M.icon("receipt_long", "text-slate-600")} Mes commandes et contrats</span>
          ${M.icon("chevron_right", "text-slate-400")}
        </button>

        <button class="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold" onclick="M.go('wallet')">
          <span class="flex items-center gap-2.5">${M.icon("account_balance_wallet", "text-slate-600")} Poche Extra (Solde & Retraits)</span>
          ${M.icon("chevron_right", "text-slate-400")}
        </button>

        <button class="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold" onclick="M.go('support')">
          <span class="flex items-center gap-2.5">${M.icon("contact_support", "text-slate-600")} Support & Assistance</span>
          ${M.icon("chevron_right", "text-slate-400")}
        </button>
      </div>

      <div class="text-center text-[10px] text-slate-400 pt-2 pb-6">
        Intalent Mobile Edition Algérie · Build 2026.10<br/>
        Plateforme 100% Algérienne en Dinar Algérien (DZD)
      </div>
    `;

    view.querySelector("#b-logout").onclick = async () => {
      if (!confirm("Voulez-vous vous déconnecter ?")) return;
      try {
        await M.api("/api/auth/logout", { body: {} });
      } catch (e) {}
      M.setToken("");
      M.state.user = null;
      M.toast("Déconnexion réussie");
      M.go("login");
    };
  };

  /* ---------- EDIT PROFILE ---------- */
  S["edit-profile"] = async (view) => {
    const u = M.state.user;
    if (!u) return M.go("login");
    const wilayas = (M.state.boot && M.state.boot.wilayas) || ["16 - Alger"];

    view.innerHTML = `
      ${M.topbar("Modifier mon profil", { sub: "Informations visibles publiquement" })}

      <form id="f-prof" class="space-y-4">
        <div>
          <label class="m-label">Nom complet</label>
          <input name="full_name" required class="m-input" value="${esc(u.full_name)}"/>
        </div>

        <div>
          <label class="m-label">Titre professionnel</label>
          <input name="headline" class="m-input" value="${esc(u.headline || "")}" placeholder="ex: Développeur Full-Stack Python & React"/>
        </div>

        <div>
          <label class="m-label">Bio & Présentation</label>
          <textarea name="bio" rows="4" class="m-input" placeholder="Présentez votre parcours et votre méthode de travail...">${esc(u.bio || "")}</textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="m-label">Wilaya</label>
            <select name="wilaya" class="m-input">
              ${wilayas.map((w) => `<option ${w === u.wilaya ? "selected" : ""}>${esc(w)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="m-label">Tarif horaire (DZD)</label>
            <input name="hourly_rate_dzd" type="number" min="500" step="100" class="m-input" value="${u.hourly_rate_dzd || 2500}"/>
          </div>
        </div>

        <div>
          <label class="m-label">Disponibilité</label>
          <select name="availability" class="m-input">
            <option value="available" ${u.availability === "available" ? "selected" : ""}>🟢 Disponible immédiatement</option>
            <option value="busy" ${u.availability === "busy" ? "selected" : ""}>🟡 Occupé / En mission</option>
            <option value="away" ${u.availability === "away" ? "selected" : ""}>🔴 En congé / Indisponible</option>
          </select>
        </div>

        <button class="m-btn-neon w-full !py-4" type="submit">Enregistrer les modifications</button>
      </form>
    `;

    view.querySelector("#f-prof").onsubmit = async (ev) => {
      ev.preventDefault();
      await M.busy(ev.target.querySelector("[type=submit]"), async () => {
        try {
          const form = M.formData(ev.target);
          const r = await M.api("/api/profile", {
            body: {
              full_name: form.full_name,
              headline: form.headline,
              bio: form.bio,
              wilaya: form.wilaya,
              hourly_rate_dzd: Number(form.hourly_rate_dzd),
              availability: form.availability
            }
          });
          M.state.user = r.user;
          M.toast("Profil mis à jour !");
          M.go("account");
        } catch (e) {
          M.toast(e.message, true);
        }
      });
    };
  };

  /* ---------- FREELANCER SPACE (Espace Prestataire) ---------- */
  S["space-freelancer"] = async (view) => {
    const u = M.state.user;
    if (!u) return M.go("login");
    const { services } = await M.api("/api/my-services");

    view.innerHTML = `
      ${M.topbar("Espace Freelance", {
        sub: "Cockpit Prestataire Intalent",
        right: `<button class="w-10 h-10 rounded-full bg-brand-neon flex items-center justify-center text-brand-dark" id="b-new-svc" aria-label="Nouveau service">${M.icon("add")}</button>`
      })}

      <div class="m-hero p-5 mb-4">
        <div class="relative z-10">
          <div class="flex justify-between items-center">
            <span class="m-badge bg-brand-neon text-brand-dark">● REVENUS DU MOIS (NET)</span>
            <span class="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full">+28%</span>
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight mt-2 text-white">${M.dzd(u.wallet_balance_dzd || 0)}</h2>
          
          <div class="grid grid-cols-3 gap-2 mt-4 text-center">
            <div class="bg-white/10 rounded-2xl p-2.5">
              <p class="text-base font-extrabold">${(services || []).length}</p>
              <p class="text-[10px] text-slate-300">Services</p>
            </div>
            <div class="bg-white/10 rounded-2xl p-2.5">
              <p class="text-base font-extrabold">98%</p>
              <p class="text-[10px] text-slate-300">Satisfaction</p>
            </div>
            <div class="bg-brand-neon text-brand-dark rounded-2xl p-2.5 font-bold">
              <p class="text-base font-extrabold">100%</p>
              <p class="text-[10px]">Livrables validés</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-sm font-bold text-slate-900">Mes Services en ligne (${(services || []).length})</h3>
        <button class="text-xs font-bold text-brand-purple" id="b-add-svc-text">+ Créer un service</button>
      </div>

      <div class="space-y-3">
        ${(services || []).length ? services.map((s) => `
          <div class="m-card p-3.5 flex gap-3 items-center">
            <div class="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden shrink-0">
              ${s.cover_image ? `<img src="${esc(s.cover_image)}" class="w-full h-full object-cover" alt=""/>` : ""}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                ${M.statusBadge(s.status)}
                <span class="text-[10px] text-slate-400">dès ${M.dzd(s.starting_price_dzd)}</span>
              </div>
              <h4 class="text-xs font-bold text-slate-900 truncate mt-1">${esc(s.title)}</h4>
              <p class="text-[10px] text-slate-400">${s.orders_in_queue || 0} commandes en file</p>
            </div>
            <button class="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0" onclick="M.go('service/${s.id}')">
              ${M.icon("open_in_new", "!text-[18px]")}
            </button>
          </div>
        `).join("") : M.empty("storefront", "Vous n'avez pas encore publié de service.", "Créer mon premier service", "create-service")}
      </div>
    `;

    const openCreate = () => M.go("create-service");
    view.querySelector("#b-new-svc").onclick = openCreate;
    const addText = view.querySelector("#b-add-svc-text");
    if (addText) addText.onclick = openCreate;
  };

  /* ---------- CREATE SERVICE SCREEN ---------- */
  S["create-service"] = async (view) => {
    if (!M.state.user) return M.go("login");
    const cats = (M.state.boot && M.state.boot.categories) || [];

    view.innerHTML = `
      ${M.topbar("Créer un nouveau service", { sub: "Proposez votre offre sur Intalent" })}

      <form id="f-new-svc" class="space-y-4">
        <div>
          <label class="m-label">Titre du service *</label>
          <input name="title" required class="m-input" placeholder="ex: Je vais concevoir votre identité visuelle complète et logo pro"/>
        </div>

        <div>
          <label class="m-label">Catégorie *</label>
          <select name="category_id" required class="m-input">
            ${cats.map((c) => `<option value="${c.id}">${esc(c.name_fr || c.name)}</option>`).join("")}
          </select>
        </div>

        <div>
          <label class="m-label">Description détaillée de votre offre *</label>
          <textarea name="description" rows="5" required class="m-input" placeholder="Décrivez les compétences mises en œuvre, le processus de travail et ce que recevra le client..."></textarea>
        </div>

        <div>
          <label class="m-label">Tags et mots-clés (séparés par des virgules)</label>
          <input name="skills_tags" class="m-input" placeholder="Logo, Branding, Illustrator, Charte graphique"/>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="m-label">Prix de départ (DZD) *</label>
            <input name="price_dzd" type="number" min="1000" step="500" required class="m-input" value="15000"/>
          </div>
          <div>
            <label class="m-label">Délai de livraison (jours) *</label>
            <input name="delivery_days" type="number" min="1" max="60" required class="m-input" value="4"/>
          </div>
        </div>

        <div>
          <label class="m-label">Questions pour le client (Brief requis)</label>
          <input name="requirements_prompt" class="m-input" placeholder="ex: Veuillez m'envoyer le nom de marque et vos préférences de couleurs."/>
        </div>

        <button class="m-btn-neon w-full !py-4 mt-2" type="submit">
          ${M.icon("store", "!text-[18px]")} Mettre le service en vente
        </button>
      </form>
    `;

    view.querySelector("#f-new-svc").onsubmit = async (ev) => {
      ev.preventDefault();
      await M.busy(ev.target.querySelector("[type=submit]"), async () => {
        try {
          const form = M.formData(ev.target);
          const price = Number(form.price_dzd);
          const days = Number(form.delivery_days);
          const body = {
            title: form.title,
            category_id: Number(form.category_id),
            description: form.description,
            skills_tags: form.skills_tags ? form.skills_tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
            requirements_prompt: form.requirements_prompt,
            cover_image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80",
            packages: [
              {
                tier: "basic",
                name: "Formule Standard",
                description: "Pack complet avec livrables professionnels.",
                price_dzd: price,
                delivery_days: days,
                revisions: 2,
                features: ["Livrable final HD", "Fichiers sources", "Support 7j"]
              }
            ]
          };
          const r = await M.api("/api/services", { body });
          M.toast("Service créé avec succès !");
          M.go("service/" + r.service_id);
        } catch (e) {
          M.toast(e.message, true);
        }
      });
    };
  };

  /* ---------- BUSINESS SPACE (Espace Recruteur B2B) ---------- */
  S["space-business"] = async (view) => {
    const u = M.state.user;
    if (!u) return M.go("login");
    const { business, team } = await M.api("/api/business/profile");

    view.innerHTML = `
      ${M.topbar("Espace Entreprise", { sub: "Pilotage B2B & Recrutement" })}

      <div class="m-hero p-5 mb-4">
        <div class="relative z-10">
          <span class="m-badge bg-brand-neon text-brand-dark">● COCKPIT ENTREPRISE B2B</span>
          <h2 class="text-xl font-extrabold mt-2 text-white">${esc(business ? business.company_name : "Compte Entreprise")}</h2>
          <p class="text-xs text-slate-300 mt-1">${esc(business ? business.industry : "Services & Technologies")} · ${esc(business ? business.wilaya : u.wilaya)}</p>
          
          <div class="grid grid-cols-2 gap-2 mt-4">
            <button class="m-btn-neon !py-2.5 !text-xs" onclick="M.go('post-job')">
              ${M.icon("add", "!text-[16px]")} Nouvelle mission
            </button>
            <button class="m-btn-ghost !bg-white/10 !text-white !border-white/20 !py-2.5 !text-xs" id="b-add-team">
              ${M.icon("person_add", "!text-[16px]")} Inviter collaborateur
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-sm font-bold text-slate-900">Équipe & Accès (${(team || []).length})</h3>
        <span class="text-[11px] text-slate-400">Permissions RBAC</span>
      </div>

      <div class="space-y-2 mb-6">
        ${(team || []).map((m) => `
          <div class="m-card p-3 flex items-center justify-between text-xs">
            <div>
              <p class="font-bold text-slate-900">${esc(m.member_name)}</p>
              <p class="text-[10px] text-slate-400">${esc(m.member_email)}</p>
            </div>
            <span class="m-badge bg-violet-50 text-brand-purple">${esc(m.role_permission)}</span>
          </div>
        `).join("") || M.empty("group", "Aucun membre invité dans l'équipe pour l'instant.")}
      </div>

      <div class="m-card p-4 space-y-3">
        <h4 class="text-xs font-bold text-slate-900">Fiche Entreprise</h4>
        <div class="text-xs space-y-1 text-slate-600">
          <p><b>Registre du commerce / NIF :</b> ${esc((business && business.rc_nif_number) || "Non renseigné")}</p>
          <p><b>Taille :</b> ${esc((business && business.company_size) || "PME 1-10")}</p>
        </div>
      </div>
    `;

    view.querySelector("#b-add-team").onclick = () => {
      const s = M.sheet(`
        <h3 class="text-base font-extrabold mb-3">Ajouter un membre à l'équipe</h3>
        <form id="f-team" class="space-y-3">
          <input name="member_name" required class="m-input" placeholder="Nom du collaborateur"/>
          <input name="member_email" type="email" required class="m-input" placeholder="collaborateur@entreprise.dz"/>
          <select name="role_permission" class="m-input">
            <option value="Hiring Manager">Hiring Manager (Recruteur)</option>
            <option value="Finance & Facturation">Finance & Facturation</option>
            <option value="Chef de Projet">Chef de Projet</option>
          </select>
          <button class="m-btn-neon w-full" type="submit">Ajouter à l'équipe</button>
        </form>
      `);

      s.querySelector("#f-team").onsubmit = async (ev) => {
        ev.preventDefault();
        await M.busy(ev.target.querySelector("button"), async () => {
          try {
            await M.api("/api/business/team", { body: M.formData(ev.target) });
            M.closeSheet();
            M.toast("Membre ajouté à l'équipe");
            M.render();
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    };
  };

  /* ---------- ADMIN SPACE (Superviseur Algérie) ---------- */
  S["space-admin"] = async (view) => {
    const u = M.state.user;
    if (!u || u.role !== "admin") {
      view.innerHTML = `${M.topbar("Accès refusé")}${M.empty("lock", "Accès réservé aux administrateurs Intalent.", "Retour à l'accueil", "home")}`;
      return;
    }

    const { stats, users, services, reports, payouts } = await M.api("/api/admin/overview");

    view.innerHTML = `
      ${M.topbar("Superviseur Algérie", { sub: "Cockpit Direction & Supervision" })}

      <div class="grid grid-cols-2 gap-2 mb-4">
        <div class="m-card p-3 bg-brand-dark text-white">
          <span class="text-[10px] text-slate-400 block">Total Utilisateurs</span>
          <span class="text-xl font-extrabold text-brand-neon">${stats.total_users}</span>
        </div>
        <div class="m-card p-3 bg-brand-dark text-white">
          <span class="text-[10px] text-slate-400 block">Volume GMV DZD</span>
          <span class="text-sm font-extrabold text-white mt-1 block truncate">${M.dzd(stats.gmv_dzd)}</span>
        </div>
        <div class="m-card p-3">
          <span class="text-[10px] text-slate-400 block">Services actifs</span>
          <span class="text-xl font-extrabold text-brand-purple">${stats.total_services}</span>
        </div>
        <div class="m-card p-3">
          <span class="text-[10px] text-slate-400 block">Total Commandes</span>
          <span class="text-xl font-extrabold text-brand-purple">${stats.total_orders}</span>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-sm font-bold text-slate-900">Demandes de virement (${(payouts || []).length})</h3>
        <span class="text-[10px] text-slate-400">Validation manuelle</span>
      </div>

      <div class="space-y-2 mb-5">
        ${(payouts || []).slice(0, 5).map((p) => `
          <div class="m-card p-3 flex justify-between items-center text-xs">
            <div>
              <p class="font-bold">${esc(p.freelancer_name)}</p>
              <p class="text-[10px] text-slate-400">${esc(p.method)} · ${esc(p.account_details)}</p>
            </div>
            <div class="text-right">
              <span class="font-extrabold text-brand-purple block">${M.dzd(p.amount_dzd)}</span>
              ${p.status === "pending" ? `
                <button class="m-badge bg-emerald-100 text-emerald-800 font-bold mt-1 b-approve-pay" data-id="${p.id}">Valider</button>
              ` : M.statusBadge(p.status)}
            </div>
          </div>
        `).join("") || M.empty("done_all", "Aucun retrait en attente.")}
      </div>

      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-sm font-bold text-slate-900">Derniers Utilisateurs Inscrits</h3>
      </div>
      <div class="space-y-2">
        ${(users || []).slice(0, 8).map((usr) => `
          <div class="m-card p-3 flex items-center gap-3 text-xs">
            ${M.avatar(usr.avatar_url, usr.full_name, "w-8 h-8")}
            <div class="flex-1 min-w-0">
              <p class="font-bold truncate">${esc(usr.full_name)}</p>
              <p class="text-[10px] text-slate-400">@${esc(usr.username)} · ${esc(usr.wilaya)}</p>
            </div>
            <span class="m-badge bg-slate-100 text-slate-700">${esc(usr.role)}</span>
          </div>
        `).join("")}
      </div>
    `;

    view.querySelectorAll(".b-approve-pay").forEach((btn) => {
      btn.onclick = async () => {
        const pid = btn.dataset.id;
        await M.busy(btn, async () => {
          try {
            await M.api("/api/admin/payout-process", { body: { payout_id: Number(pid), status: "processed" } });
            M.toast("Virement marqué comme exécuté");
            M.render();
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    });
  };

  /* ---------- NOTIFICATIONS ---------- */
  S.notifications = async (view) => {
    if (!M.state.user) return M.go("login");
    const { notifications } = await M.api("/api/notifications");

    view.innerHTML = `
      ${M.topbar("Notifications", {
        right: `<button class="text-xs font-bold text-brand-purple" id="b-read-all">Tout marquer lu</button>`
      })}

      <div class="space-y-2">
        ${(notifications || []).length ? notifications.map((n) => `
          <div class="m-card p-3.5 space-y-1 ${n.is_read ? "opacity-75" : "border-brand-purple/30 bg-purple-50/20"}">
            <div class="flex justify-between items-center">
              <h4 class="text-xs font-bold text-slate-900">${esc(n.title)}</h4>
              <span class="text-[10px] text-slate-400">${M.ago(n.created_at)}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${esc(n.message)}</p>
          </div>
        `).join("") : M.empty("notifications_none", "Vous n'avez aucune notification.")}
      </div>
    `;

    const raBtn = view.querySelector("#b-read-all");
    if (raBtn) {
      raBtn.onclick = async () => {
        try {
          await M.api("/api/notifications/read-all", { body: {} });
          M.state.unreadNotifs = 0;
          M.toast("Notifications marquées lues");
          M.render();
        } catch (e) {
          M.toast(e.message, true);
        }
      };
    }
  };

  /* ---------- MESSAGING / CHAT ---------- */
  S.messages = async (view) => {
    if (!M.state.user) return M.go("login");
    const { conversations } = await M.api("/api/conversations");
    const myId = Number(M.state.user.id);

    view.innerHTML = `
      ${M.topbar("Messagerie Directe", { sub: "Discussions avec clients et freelances" })}

      <div class="space-y-2">
        ${(conversations || []).length ? conversations.map((c) => {
          const otherId = c.user1_id === myId ? c.user2_id : c.user1_id;
          const otherName = c.user1_id === myId ? c.user2_name : c.user1_name;
          const otherAvatar = c.user1_id === myId ? c.user2_avatar : c.user1_avatar;
          const lastMsg = c.last_message;

          return `
            <div class="m-card p-3.5 flex items-center gap-3 cursor-pointer active:scale-[.99] transition" onclick="M.go('chat/${c.id}')">
              ${M.avatar(otherAvatar, otherName, "w-11 h-11")}
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline">
                  <h4 class="text-xs font-bold text-slate-900 truncate">${esc(otherName)}</h4>
                  <span class="text-[10px] text-slate-400">${lastMsg ? M.ago(lastMsg.created_at) : ""}</span>
                </div>
                <p class="text-xs text-slate-500 truncate mt-0.5">${lastMsg ? esc(lastMsg.body) : "Nouvelle discussion"}</p>
              </div>
            </div>
          `;
        }).join("") : M.empty("chat_bubble_outline", "Aucune discussion active.", "Explorer les talents", "explore?tab=freelancers")}
      </div>
    `;
  };

  /* ---------- ACTIVE CHAT SCREEN ---------- */
  S.chat = async (view, r) => {
    if (!M.state.user) return M.go("login");
    const cid = r.arg;
    const { conversation: conv, messages: msgs } = await M.api(`/api/conversations/${cid}`);
    const myId = Number(M.state.user.id);
    const otherName = conv.user1_id === myId ? conv.user2_name : conv.user1_name;
    const otherId = conv.user1_id === myId ? conv.user2_id : conv.user1_id;

    view.innerHTML = `
      <header class="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3 sticky top-0 bg-brand-surface z-10 pt-1">
        <button class="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-600" onclick="M.go('messages')">${M.icon("arrow_back")}</button>
        <div class="flex-1 min-w-0">
          <h2 class="text-xs font-bold text-slate-900 truncate">${esc(otherName)}</h2>
          <span class="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">● En ligne</span>
        </div>
      </header>

      <div class="space-y-3 pb-20" id="chat-messages">
        ${(msgs || []).map((m) => {
          const isMe = Number(m.sender_id) === myId;
          return `
            <div class="flex ${isMe ? "justify-end" : "justify-start"}">
              <div class="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs ${isMe ? "bg-brand-dark text-white rounded-br-xs" : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"}">
                <p class="leading-relaxed whitespace-pre-line">${esc(m.body)}</p>
                <span class="text-[9px] block text-right mt-1 opacity-70">${M.ago(m.created_at)}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="fixed bottom-0 inset-x-0 mx-auto max-w-[440px] bg-white border-t border-slate-200 p-3 z-30">
        <form id="f-chat" class="flex gap-2 items-center">
          <input name="body" required autocomplete="off" class="m-input !py-2.5 !text-xs flex-1" placeholder="Votre message..."/>
          <button class="w-10 h-10 rounded-2xl bg-brand-neon text-brand-dark flex items-center justify-center shrink-0" type="submit">
            ${M.icon("send", "!text-[18px]")}
          </button>
        </form>
      </div>
    `;

    // Scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);

    view.querySelector("#f-chat").onsubmit = async (ev) => {
      ev.preventDefault();
      const input = ev.target.body;
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      try {
        await M.api("/api/messages", {
          body: {
            conversation_id: Number(cid),
            recipient_id: Number(otherId),
            body: text
          }
        });
        M.render();
      } catch (e) {
        M.toast(e.message, true);
      }
    };
  };

  /* ---------- SUPPORT TICKET ---------- */
  S.support = async (view) => {
    const u = M.state.user;
    view.innerHTML = `
      ${M.topbar("Support & Assistance", { sub: "Équipe Intalent Algérie" })}

      <form id="f-support" class="space-y-4">
        <div>
          <label class="m-label">Objet de la demande *</label>
          <input name="subject" required class="m-input" placeholder="ex: Question sur le déblocage du séquestre DZD"/>
        </div>

        <div>
          <label class="m-label">Catégorie</label>
          <select name="category" class="m-input">
            <option value="Paiements & Retraits DZD">Paiements & Retraits DZD</option>
            <option value="Litige & Commande">Litige & Commande</option>
            <option value="Vérification Compte Pro">Vérification Compte Pro</option>
            <option value="Technique & Bug">Technique & Bug</option>
          </select>
        </div>

        <div>
          <label class="m-label">Message *</label>
          <textarea name="message" rows="5" required class="m-input" placeholder="Décrivez votre situation avec le numéro de commande si applicable..."></textarea>
        </div>

        <button class="m-btn-neon w-full !py-4" type="submit">
          ${M.icon("support_agent", "!text-[18px]")} Envoyer ma demande
        </button>
      </form>
    `;

    view.querySelector("#f-support").onsubmit = async (ev) => {
      ev.preventDefault();
      await M.busy(ev.target.querySelector("[type=submit]"), async () => {
        try {
          const form = M.formData(ev.target);
          await M.api("/api/support", { body: form });
          M.toast("Ticket de support créé ! Notre équipe vous répondra sous 24h.");
          M.go("account");
        } catch (e) {
          M.toast(e.message, true);
        }
      });
    };
  };
})();
