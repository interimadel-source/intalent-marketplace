/* INTALENT Mobile — Work & Transactions Screens
   Stitch refs:
   - Projects & Milestones (d6dd5c2ada6e48a3823ab0e26058b5cb)
   - Appels d'Offres & Missions Entreprises (21319844052e4c5891661f4f28513328)
   - Post a Job (f30ca41cec5b471daee88d67c27a412b)
   - Wallet DZD (267a121322804a35ae3ae7627d302c00)
   - Orders list & order detail (deliver, revision, complete, review)
*/
(function () {
  const S = M.screens;
  const esc = M.esc;

  /* ---------- MISSIONS (Appels d'offres / Projets clients) ---------- */
  S.missions = async (view) => {
    const u = M.state.user;
    const cats = (M.state.boot && M.state.boot.categories) || [];
    const { projects } = await M.api("/api/projects");
    const openProjects = (projects || []).filter((p) => p.status === "open");

    view.innerHTML = `
      ${M.topbar("Appels d'Offres & Missions", {
        sub: "Opportunités ouvertes en Algérie",
        right: u ? `<button class="w-10 h-10 rounded-full bg-brand-neon flex items-center justify-center text-brand-dark" onclick="M.go('post-job')" aria-label="Publier">${M.icon("add")}</button>` : ""
      })}
      
      <div class="m-hero p-5 mb-4">
        <div class="relative z-10">
          <span class="m-badge bg-brand-neon text-brand-dark">● MARCHÉ DES PROJETS DZD</span>
          <h2 class="text-base font-extrabold mt-2">Missions & Contrats Entreprises</h2>
          <p class="text-xs text-slate-300 mt-1">Postulez avec votre devis ou publiez un besoin en quelques clics.</p>
          <div class="flex gap-2 mt-4">
            <button class="m-btn-neon !py-2 !px-3 !text-xs" onclick="M.go('${u ? "post-job" : "login"}')">
              ${M.icon("add_circle", "!text-[16px]")} Publier un projet
            </button>
            <button class="m-btn-ghost !bg-white/10 !text-white !border-white/20 !py-2 !px-3 !text-xs" onclick="M.go('orders')">
              ${M.icon("receipt_long", "!text-[16px]")} Mes commandes
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-sm font-bold text-slate-900">Missions disponibles (${openProjects.length})</h3>
        <span class="text-[11px] text-slate-500">${(projects || []).length} au total</span>
      </div>

      <div class="space-y-3">
        ${openProjects.length ? openProjects.map((p) => `
          <div class="m-card p-4 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <span class="m-badge bg-violet-50 text-brand-purple">${esc(p.category_name || "Projet")}</span>
              <span class="m-badge bg-emerald-50 text-emerald-700">Ouvert</span>
            </div>
            
            <div>
              <h4 class="text-sm font-bold text-slate-900 leading-snug cursor-pointer" onclick="M.go('mission/${p.id}')">${esc(p.title)}</h4>
              <p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">${esc(p.description)}</p>
            </div>

            <div class="flex flex-wrap gap-1.5">
              ${M.parseList(p.skills_required).slice(0, 3).map((s) => `<span class="m-chip !py-0.5 !px-2 !text-[10px]">${esc(s)}</span>`).join("")}
            </div>

            <div class="h-px bg-slate-100"></div>

            <div class="flex items-center justify-between pt-1">
              <div>
                <p class="text-[10px] text-slate-400">Budget estimé</p>
                <p class="text-xs font-extrabold text-brand-purple">${M.dzd(p.budget_min_dzd)} – ${M.dzd(p.budget_max_dzd)}</p>
              </div>
              <button class="m-btn-dark !py-2 !px-3 !text-xs" onclick="M.go('mission/${p.id}')">
                Voir détails & Devis ${M.icon("arrow_forward", "!text-[14px]")}
              </button>
            </div>
          </div>
        `).join("") : M.empty("work_off", "Aucune mission ouverte pour l'instant.", "Publier la première", "post-job")}
      </div>
    `;
  };

  /* ---------- MISSION DETAIL & PROPOSAL SUBMISSION ---------- */
  S.mission = async (view, r) => {
    const mid = r.arg;
    const { projects } = await M.api("/api/projects");
    const p = (projects || []).find((x) => String(x.id) === String(mid));
    if (!p) {
      view.innerHTML = `${M.topbar("Mission non trouvée")}${M.empty("error", "Cette mission n'existe plus ou a été retirée.", "Retour aux missions", "missions")}`;
      return;
    }

    const u = M.state.user;
    const isOwner = u && (Number(u.id) === Number(p.client_id) || u.role === "admin");
    const myProp = p.my_proposal;

    view.innerHTML = `
      ${M.topbar("Détail de la Mission", { sub: p.project_code || "Appel d'offres" })}

      <div class="m-card p-5 space-y-4">
        <div class="flex justify-between items-center">
          <span class="m-badge bg-violet-50 text-brand-purple font-bold">${esc(p.category_name)}</span>
          ${M.statusBadge(p.status)}
        </div>

        <h1 class="text-base font-extrabold text-slate-900 leading-snug">${esc(p.title)}</h1>

        <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
          <div><span class="text-slate-400 text-[10px] block">Budget</span><b class="text-brand-purple">${M.dzd(p.budget_min_dzd)} – ${M.dzd(p.budget_max_dzd)}</b></div>
          <div><span class="text-slate-400 text-[10px] block">Délai souhaité</span><b>${p.deadline_days} jours</b></div>
          <div><span class="text-slate-400 text-[10px] block">Niveau demandé</span><b>${esc(p.experience_level || "Tous")}</b></div>
          <div><span class="text-slate-400 text-[10px] block">Client</span><b>${esc(p.client_name)}</b></div>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cahier des charges</h4>
          <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white border border-slate-100 p-3 rounded-2xl">${esc(p.description)}</p>
        </div>

        ${(p.skills_required && M.parseList(p.skills_required).length) ? `
          <div>
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Compétences attendues</h4>
            <div class="flex flex-wrap gap-1.5">
              ${M.parseList(p.skills_required).map((s) => `<span class="m-chip">${esc(s)}</span>`).join("")}
            </div>
          </div>
        ` : ""}
      </div>

      ${isOwner ? `
        <div class="mt-6">
          <h3 class="text-sm font-bold text-slate-900 mb-3 px-1">Propositions reçues (${(p.proposals || []).length})</h3>
          <div class="space-y-3">
            ${(p.proposals || []).map((prop) => `
              <div class="m-card p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    ${M.avatar(prop.freelancer_avatar, prop.freelancer_name, "w-8 h-8")}
                    <div>
                      <p class="text-xs font-bold">${esc(prop.freelancer_name)}</p>
                      <p class="text-[10px] text-slate-400">${prop.delivery_days} jours de livraison</p>
                    </div>
                  </div>
                  <span class="text-xs font-extrabold text-brand-purple">${M.dzd(prop.bid_amount_dzd)}</span>
                </div>
                <p class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">${esc(prop.cover_letter)}</p>
                ${p.status === "open" ? `
                  <button class="m-btn-neon w-full !py-2.5 !text-xs b-accept-prop" data-pid="${prop.id}">
                    Accepter l'offre & Créer le contrat DZD
                  </button>
                ` : `<span class="m-badge bg-emerald-50 text-emerald-700">Offre sélectionnée</span>`}
              </div>
            `).join("") || M.empty("inbox", "Aucune proposition reçue pour l'instant.")}
          </div>
        </div>
      ` : `
        <div class="mt-6">
          ${myProp ? `
            <div class="m-card p-4 border-2 border-emerald-500/20 bg-emerald-50/30">
              <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-2">
                ${M.icon("check_circle", "text-emerald-600", true)} Vous avez déjà postulé
              </div>
              <div class="flex justify-between text-xs py-1"><span>Votre devis :</span><b>${M.dzd(myProp.bid_amount_dzd)}</b></div>
              <div class="flex justify-between text-xs py-1"><span>Délai proposé :</span><b>${myProp.delivery_days} jours</b></div>
              <p class="text-xs text-slate-600 mt-2 p-2.5 bg-white rounded-xl border border-slate-100">${esc(myProp.cover_letter)}</p>
            </div>
          ` : p.status === "open" ? `
            <div class="m-card p-4">
              <h3 class="text-sm font-extrabold text-slate-900 mb-1">Envoyer une proposition</h3>
              <p class="text-xs text-slate-500 mb-4">Proposez votre montant en DZD et vos délais de livraison.</p>
              <form id="f-prop" class="space-y-3">
                <div>
                  <label class="m-label">Montant du devis (DZD)</label>
                  <input name="bid_amount_dzd" type="number" min="1000" step="500" required class="m-input" placeholder="${p.budget_min_dzd}"/>
                </div>
                <div>
                  <label class="m-label">Délai estimé (jours)</label>
                  <input name="delivery_days" type="number" min="1" max="90" required class="m-input" value="${p.deadline_days || 7}"/>
                </div>
                <div>
                  <label class="m-label">Lettre de motivation & Approche</label>
                  <textarea name="cover_letter" rows="4" required class="m-input" placeholder="Expliquez comment vous allez réaliser cette mission avec succès..."></textarea>
                </div>
                <button class="m-btn-neon w-full !py-3.5" type="submit">
                  ${M.icon("send", "!text-[18px]")} Soumettre mon offre
                </button>
              </form>
            </div>
          ` : `<div class="m-card p-4 text-center text-xs text-slate-500">Les candidatures pour cette mission sont clôturées.</div>`}
        </div>
      `}
    `;

    // Bind owner proposal accept
    view.querySelectorAll(".b-accept-prop").forEach((btn) => {
      btn.onclick = async () => {
        const propId = btn.dataset.pid;
        if (!confirm("Voulez-vous accepter cette proposition et lancer le contrat avec séquestre ?")) return;
        await M.busy(btn, async () => {
          try {
            const r = await M.api(`/api/proposals/${propId}/accept`, { body: {} });
            M.toast("Proposition acceptée ! Contrat #" + r.order_number + " créé");
            M.go("order/" + r.order_id);
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    });

    // Bind proposal submit
    const propForm = view.querySelector("#f-prop");
    if (propForm) {
      propForm.onsubmit = async (ev) => {
        ev.preventDefault();
        if (!u) return M.go("login");
        await M.busy(propForm.querySelector("[type=submit]"), async () => {
          try {
            const data = M.formData(propForm);
            await M.api(`/api/projects/${mid}/proposals`, {
              body: {
                bid_amount_dzd: Number(data.bid_amount_dzd),
                delivery_days: Number(data.delivery_days),
                cover_letter: data.cover_letter
              }
            });
            M.toast("Votre proposition a été transmise au client !");
            M.render();
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    }
  };

  /* ---------- POST A JOB (Publier une mission) ---------- */
  S["post-job"] = async (view) => {
    if (!M.state.user) return M.go("login");
    const cats = (M.state.boot && M.state.boot.categories) || [];
    const wilayas = (M.state.boot && M.state.boot.wilayas) || ["16 - Alger"];

    view.innerHTML = `
      ${M.topbar("Publier une mission", { sub: "Trouvez un freelance algérien qualifié" })}

      <form id="f-job" class="space-y-4">
        <div>
          <label class="m-label">Titre de la mission *</label>
          <input name="title" required class="m-input" placeholder="ex: Développement application mobile Flutter e-commerce"/>
        </div>

        <div>
          <label class="m-label">Catégorie *</label>
          <select name="category_id" required class="m-input">
            ${cats.map((c) => `<option value="${c.id}">${esc(c.name_fr || c.name)}</option>`).join("")}
          </select>
        </div>

        <div>
          <label class="m-label">Description détaillée du besoin *</label>
          <textarea name="description" rows="5" required class="m-input" placeholder="Décrivez les livrables attendus, les technologies préférées, et le contexte de votre projet..."></textarea>
        </div>

        <div>
          <label class="m-label">Compétences recherchées (séparées par des virgules)</label>
          <input name="skills" class="m-input" placeholder="Flutter, REST API, Figma, Firebase"/>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="m-label">Budget Min (DZD) *</label>
            <input name="budget_min_dzd" type="number" min="5000" step="1000" required class="m-input" value="25000"/>
          </div>
          <div>
            <label class="m-label">Budget Max (DZD) *</label>
            <input name="budget_max_dzd" type="number" min="5000" step="1000" required class="m-input" value="70000"/>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="m-label">Délai estimé (jours) *</label>
            <input name="deadline_days" type="number" min="1" max="180" required class="m-input" value="14"/>
          </div>
          <div>
            <label class="m-label">Niveau d'expérience</label>
            <select name="experience_level" class="m-input">
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Junior">Junior</option>
              <option value="Expert">Expert / Pro</option>
            </select>
          </div>
        </div>

        <div>
          <label class="m-label">Préférence géographique</label>
          <select name="wilaya_pref" class="m-input">
            <option value="Toute l'Algérie (Télétravail)">Toute l'Algérie (Télétravail)</option>
            ${wilayas.map((w) => `<option value="${esc(w)}">${esc(w)}</option>`).join("")}
          </select>
        </div>

        <button class="m-btn-neon w-full !py-4 mt-2" type="submit">
          ${M.icon("publish", "!text-[18px]")} Publier la mission sur Intalent
        </button>
      </form>
    `;

    view.querySelector("#f-job").onsubmit = async (ev) => {
      ev.preventDefault();
      await M.busy(ev.target.querySelector("[type=submit]"), async () => {
        try {
          const form = M.formData(ev.target);
          const body = {
            title: form.title,
            category_id: Number(form.category_id),
            description: form.description,
            skills_required: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
            budget_min_dzd: Number(form.budget_min_dzd),
            budget_max_dzd: Number(form.budget_max_dzd),
            deadline_days: Number(form.deadline_days),
            experience_level: form.experience_level,
            wilaya_pref: form.wilaya_pref
          };
          const r = await M.api("/api/projects", { body });
          M.toast("Mission #" + r.project_code + " publiée avec succès !");
          M.go("mission/" + r.project_id);
        } catch (e) {
          M.toast(e.message, true);
        }
      });
    };
  };

  /* ---------- ORDERS LIST (Commandes en cours et historique) ---------- */
  S.orders = async (view) => {
    if (!M.state.user) return M.go("login");
    const { orders } = await M.api("/api/orders");
    const active = (orders || []).filter((o) => ["in_progress", "delivered", "revision_requested"].includes(o.status));
    const finished = (orders || []).filter((o) => ["completed", "cancelled"].includes(o.status));

    view.innerHTML = `
      ${M.topbar("Mes Commandes & Contrats", { sub: "Suivi des projets et séquestres DZD" })}

      <div class="flex gap-2 mb-4" id="ord-tabs">
        <button class="m-chip on" data-target="active">En cours (${active.length})</button>
        <button class="m-chip" data-target="history">Historique (${finished.length})</button>
      </div>

      <div id="ord-active" class="space-y-3">
        ${active.length ? active.map((o) => renderOrderRow(o)).join("") : M.empty("receipt_long", "Aucune commande en cours.")}
      </div>

      <div id="ord-history" class="space-y-3 hidden">
        ${finished.length ? finished.map((o) => renderOrderRow(o)).join("") : M.empty("history", "Aucune commande dans l'historique.")}
      </div>
    `;

    function renderOrderRow(o) {
      const isClient = Number(M.state.user.id) === Number(o.client_id);
      const otherName = isClient ? o.freelancer_name : o.client_name;
      return `
        <div class="m-card p-4 space-y-3 cursor-pointer active:scale-[.99] transition" onclick="M.go('order/${o.id}')">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-bold text-slate-400">#${esc(o.order_number)}</span>
              <h4 class="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">${esc(o.service_title)}</h4>
            </div>
            ${M.statusBadge(o.status)}
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <span class="text-slate-500">${isClient ? "Prestataire" : "Client"} : <b>${esc(otherName)}</b></span>
            <span class="font-extrabold text-brand-purple">${M.dzd(o.total_dzd)}</span>
          </div>
        </div>
      `;
    }

    view.querySelectorAll("#ord-tabs .m-chip").forEach((btn) => {
      btn.onclick = () => {
        view.querySelectorAll("#ord-tabs .m-chip").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        const isAct = btn.dataset.target === "active";
        view.querySelector("#ord-active").classList.toggle("hidden", !isAct);
        view.querySelector("#ord-history").classList.toggle("hidden", isAct);
      };
    });
  };

  /* ---------- ORDER DETAIL & WORKFLOW (Livraison, Révision, Validation, Avis) ---------- */
  S.order = async (view, r) => {
    const oid = r.arg;
    const { order: o } = await M.api(`/api/orders/${oid}`);
    const u = M.state.user;
    const isClient = Number(u.id) === Number(o.client_id);
    const isFreelancer = Number(u.id) === Number(o.freelancer_id);

    view.innerHTML = `
      ${M.topbar("Commande #" + o.order_number, { sub: o.service_title })}

      <div class="m-card p-4 space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-500">Statut du contrat</span>
          ${M.statusBadge(o.status)}
        </div>

        <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
          <div><span class="text-slate-400 text-[10px] block">Montant séquestré</span><b class="text-brand-purple">${M.dzd(o.total_dzd)}</b></div>
          <div><span class="text-slate-400 text-[10px] block">Formule</span><b>${esc(o.package_name || o.package_tier)}</b></div>
          <div><span class="text-slate-400 text-[10px] block">Client</span><b>${esc(o.client_name)}</b></div>
          <div><span class="text-slate-400 text-[10px] block">Freelance</span><b>${esc(o.freelancer_name)}</b></div>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Brief initial</h4>
          <p class="text-xs text-slate-600 bg-white border border-slate-100 p-3 rounded-2xl">${esc(o.requirements_submitted)}</p>
        </div>
      </div>

      <!-- WORKFLOW ACTIONS -->
      <div class="mt-4 space-y-3">
        <!-- FREELANCER: Deliver work -->
        ${isFreelancer && (o.status === "in_progress" || o.status === "revision_requested") ? `
          <div class="m-card p-4 border-2 border-brand-neon">
            <h4 class="text-xs font-extrabold text-brand-dark mb-1">Déposer les livrables</h4>
            <p class="text-[11px] text-slate-500 mb-3">Soumettez votre travail et un message au client pour déclencher la revue.</p>
            <form id="f-deliver" class="space-y-2.5">
              <textarea name="message" rows="3" required class="m-input" placeholder="Voici les fichiers finaux et le lien vers la prévisualisation..."></textarea>
              <button class="m-btn-neon w-full !py-3" type="submit">
                ${M.icon("upload_file", "!text-[18px]")} Livrer la commande
              </button>
            </form>
          </div>
        ` : ""}

        <!-- CLIENT: Accept delivery or request revision -->
        ${isClient && o.status === "delivered" ? `
          <div class="m-card p-4 border-2 border-emerald-500 space-y-3">
            <h4 class="text-xs font-extrabold text-emerald-800">Livrables reçus</h4>
            <p class="text-[11px] text-slate-600 leading-relaxed">Le prestataire a livré le travail. Vérifiez les fichiers puis validez pour libérer le paiement du séquestre.</p>
            <div class="grid grid-cols-2 gap-2">
              <button class="m-btn-neon !py-3" id="b-complete">
                ${M.icon("check_circle", "!text-[18px]")} Valider & Payer
              </button>
              <button class="m-btn-ghost !py-3" id="b-revision">
                ${M.icon("autorenew", "!text-[18px]")} Demander révision
              </button>
            </div>
          </div>
        ` : ""}

        <!-- COMPLETED: Review submission if not reviewed yet -->
        ${o.status === "completed" ? `
          <div class="m-card p-4 bg-emerald-50/50 border border-emerald-200">
            <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              ${M.icon("verified", "text-emerald-600", true)} Commande finalisée et séquestre DZD débloqué avec succès.
            </div>
            ${isClient && !o.review ? `
              <div class="mt-4 pt-3 border-t border-emerald-100">
                <h5 class="text-xs font-bold text-slate-900 mb-2">Laisser un avis sur le travail :</h5>
                <form id="f-review" class="space-y-2">
                  <div class="flex gap-2 items-center">
                    <span class="text-xs font-bold">Note :</span>
                    <select name="rating" class="m-input !py-1 !px-2 !w-auto">
                      <option value="5">★★★★★ 5 étoiles</option>
                      <option value="4">★★★★☆ 4 étoiles</option>
                      <option value="3">★★★☆☆ 3 étoiles</option>
                    </select>
                  </div>
                  <textarea name="comment" rows="2" required class="m-input" placeholder="Votre commentaire sur la qualité et la ponctualité..."></textarea>
                  <button class="m-btn-dark w-full !py-2.5" type="submit">Publier l'avis</button>
                </form>
              </div>
            ` : ""}
          </div>
        ` : ""}

        <!-- Chat with other party -->
        <button class="m-btn-ghost w-full !py-3" onclick="M.contact(${isClient ? o.freelancer_id : o.client_id}, '${esc(isClient ? o.freelancer_name : o.client_name).replace(/'/g, "\\'")}')">
          ${M.icon("chat", "!text-[18px]")} Discuter avec ${esc(isClient ? o.freelancer_name : o.client_name)}
        </button>
      </div>
    `;

    // Bind deliver
    const delForm = view.querySelector("#f-deliver");
    if (delForm) {
      delForm.onsubmit = async (ev) => {
        ev.preventDefault();
        await M.busy(delForm.querySelector("[type=submit]"), async () => {
          try {
            await M.api(`/api/orders/${oid}/deliver`, {
              body: { message: delForm.message.value.trim(), files: [] }
            });
            M.toast("Commande livrée au client !");
            M.render();
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    }

    // Bind complete
    const compBtn = view.querySelector("#b-complete");
    if (compBtn) {
      compBtn.onclick = async () => {
        if (!confirm("Confirmez-vous que les livrables sont conformes ? Le montant sera transféré dans la poche du prestataire.")) return;
        await M.busy(compBtn, async () => {
          try {
            await M.api(`/api/orders/${oid}/complete`, { body: {} });
            M.toast("Paiement validé avec succès !");
            M.render();
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    }

    // Bind revision
    const revBtn = view.querySelector("#b-revision");
    if (revBtn) {
      revBtn.onclick = () => {
        const s = M.sheet(`
          <h3 class="text-base font-extrabold mb-2">Demande de révision</h3>
          <p class="text-xs text-slate-500 mb-3">Précisez les modifications souhaitées au prestataire.</p>
          <form id="f-rev" class="space-y-3">
            <textarea name="reason" rows="4" required class="m-input" placeholder="Ex: Veuillez modifier la palette de couleurs et corriger le texte sur la slide 2..."></textarea>
            <button class="m-btn-neon w-full" type="submit">Envoyer la demande</button>
          </form>
        `);
        s.querySelector("#f-rev").onsubmit = async (ev) => {
          ev.preventDefault();
          await M.busy(ev.target.querySelector("button"), async () => {
            try {
              await M.api(`/api/orders/${oid}/revision`, { body: { reason: ev.target.reason.value.trim() } });
              M.closeSheet();
              M.toast("Demande de révision transmise.");
              M.render();
            } catch (e) {
              M.toast(e.message, true);
            }
          });
        };
      };
    }

    // Bind review
    const revForm = view.querySelector("#f-review");
    if (revForm) {
      revForm.onsubmit = async (ev) => {
        ev.preventDefault();
        await M.busy(revForm.querySelector("[type=submit]"), async () => {
          try {
            await M.api(`/api/orders/${oid}/review`, {
              body: { rating: Number(revForm.rating.value), comment: revForm.comment.value.trim() }
            });
            M.toast("Merci pour votre avis !");
            M.render();
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    }
  };

  /* ---------- WALLET DZD (La Poche Extra) ---------- */
  S.wallet = async (view) => {
    if (!M.state.user) return M.go("login");
    const { balance_dzd, transactions, payouts } = await M.api("/api/wallet");

    view.innerHTML = `
      ${M.topbar("La Poche Extra", { sub: "Portefeuille & Retraits DZD" })}

      <div class="m-hero p-5 mb-4">
        <div class="relative z-10">
          <div class="flex justify-between items-center">
            <span class="m-badge bg-brand-neon text-brand-dark">● SOLDE DISPONIBLE</span>
            <span class="text-xs font-bold text-brand-neon flex items-center gap-1">${M.icon("account_balance_wallet", "!text-[16px]")} DZD WALLET</span>
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight mt-3 text-white">${M.dzd(balance_dzd)}</h2>
          <p class="text-[11px] text-slate-300 mt-0.5">≈ ${(balance_dzd / 148).toFixed(2)} EUR au cours de référence</p>
          
          <div class="grid grid-cols-2 gap-2 mt-5">
            <button class="m-btn-neon !py-3 !text-xs" id="b-withdraw">
              ${M.icon("bolt", "!text-[18px]")} Retrait Instantané
            </button>
            <button class="m-btn-ghost !bg-white/10 !text-white !border-white/20 !py-3 !text-xs" id="b-topup">
              ${M.icon("add_card", "!text-[18px]")} Recharger solde
            </button>
          </div>
        </div>
      </div>

      <div class="mb-4">
        ${M.sandboxNote("Les retraits CCP / BaridiMob et virements bancaires BNA / CPA / BDL sont simulés en mode sandbox. Les demandes sont enregistrées dans votre registre d'audit.")}
      </div>

      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-sm font-bold text-slate-900">Méthodes de retrait liées</h3>
        <button class="text-xs font-bold text-brand-purple" id="b-add-method">+ Ajouter</button>
      </div>

      <div class="space-y-2.5 mb-6">
        <div class="m-card p-3 flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-brand-neon/20 text-brand-dark flex items-center justify-center">${M.icon("smartphone")}</div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">BaridiMob / Edahabia <span class="m-badge bg-brand-neon text-brand-dark text-[9px]">DÉFAUT</span></p>
            <p class="text-[10px] text-slate-400">RIP •• 00799999002345678912</p>
          </div>
          <span class="text-[10px] font-bold text-emerald-600">0% Frais</span>
        </div>

        <div class="m-card p-3 flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">${M.icon("account_balance")}</div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">Compte CCP Algérie Poste</p>
            <p class="text-[10px] text-slate-400">CCP •• 802920374 clef 08</p>
          </div>
          <span class="text-[10px] font-semibold text-slate-400">24h ouvrées</span>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-sm font-bold text-slate-900">Relevé des activités</h3>
        <span class="text-[11px] text-slate-400">${(transactions || []).length} transactions</span>
      </div>

      <div class="space-y-2">
        ${(transactions || []).slice(0, 15).map((t) => `
          <div class="m-card p-3 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-full flex items-center justify-center ${t.type === "escrow_release" || t.type === "deposit" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}">
                ${M.icon(t.type === "escrow_release" ? "south_west" : "north_east", "!text-[16px]")}
              </span>
              <div>
                <p class="font-bold text-slate-900 line-clamp-1">${esc(t.description || t.type)}</p>
                <p class="text-[10px] text-slate-400">${M.date(t.created_at)}</p>
              </div>
            </div>
            <span class="font-extrabold ${t.type === "escrow_release" ? "text-emerald-600" : "text-slate-800"}">
              ${t.type === "escrow_release" ? "+" : "-"}${M.dzd(t.amount_dzd)}
            </span>
          </div>
        `).join("") || M.empty("receipt", "Aucune transaction enregistrée.")}
      </div>
    `;

    // Withdraw sheet
    view.querySelector("#b-withdraw").onclick = () => {
      const s = M.sheet(`
        <h3 class="text-base font-extrabold mb-1">Demande de retrait DZD</h3>
        <p class="text-xs text-slate-500 mb-4">Solde disponible : <b>${M.dzd(balance_dzd)}</b></p>
        <form id="f-payout" class="space-y-3">
          <div>
            <label class="m-label">Montant à retirer (DZD)</label>
            <input name="amount_dzd" type="number" min="1000" max="${balance_dzd || 100000}" required class="m-input" value="${Math.min(balance_dzd, 20000)}"/>
          </div>
          <div>
            <label class="m-label">Méthode de réception</label>
            <select name="method" class="m-input">
              <option value="BaridiMob">BaridiMob (Instantané)</option>
              <option value="Compte CCP">Compte CCP Algérie Poste</option>
              <option value="Virement Bancaire (RIB BNA/BDL/CPA)">Virement Bancaire</option>
            </select>
          </div>
          <div>
            <label class="m-label">Numéro RIP / CCP / RIB</label>
            <input name="account_details" required class="m-input" placeholder="00799999002345678912"/>
          </div>
          <button class="m-btn-neon w-full !py-3.5" type="submit">Confirmer le virement</button>
        </form>
      `);

      s.querySelector("#f-payout").onsubmit = async (ev) => {
        ev.preventDefault();
        await M.busy(ev.target.querySelector("button"), async () => {
          try {
            const fd = M.formData(ev.target);
            await M.api("/api/payouts", {
              body: {
                amount_dzd: Number(fd.amount_dzd),
                method: fd.method,
                account_details: fd.account_details
              }
            });
            M.closeSheet();
            M.toast("Demande de virement envoyée !");
            await M.refresh();
            M.render();
          } catch (e) {
            M.toast(e.message, true);
          }
        });
      };
    };

    view.querySelector("#b-topup").onclick = () => {
      M.toast("Recharge de compte : utilisez l'achat direct de service en mode sandbox.");
    };

    view.querySelector("#b-add-method").onclick = () => {
      M.toast("Ajout de coordonnées bancaires : disponible dans la fiche profil.");
    };
  };

  /* ---------- FAVORITES ---------- */
  S.favorites = async (view) => {
    if (!M.state.user) return M.go("login");
    const { services, freelancers } = await M.api("/api/favorites/details");

    view.innerHTML = `
      ${M.topbar("Mes Favoris", { sub: "Services et talents enregistrés" })}

      <div class="flex gap-2 mb-4" id="fav-tabs">
        <button class="m-chip on" data-target="services">Services (${(services || []).length})</button>
        <button class="m-chip" data-target="freelancers">Freelances (${(freelancers || []).length})</button>
      </div>

      <div id="fav-services" class="grid grid-cols-2 gap-3">
        ${(services || []).length ? services.map(M.serviceCard).join("") : M.empty("bookmark_border", "Aucun service en favoris.", "Explorer les services", "explore?tab=services")}
      </div>

      <div id="fav-freelancers" class="space-y-2.5 hidden">
        ${(freelancers || []).length ? freelancers.map(M.freelancerRow).join("") : M.empty("group", "Aucun freelance en favoris.", "Découvrir les freelances", "explore?tab=freelancers")}
      </div>
    `;

    view.querySelectorAll("#fav-tabs .m-chip").forEach((btn) => {
      btn.onclick = () => {
        view.querySelectorAll("#fav-tabs .m-chip").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        const isSvc = btn.dataset.target === "services";
        view.querySelector("#fav-services").classList.toggle("hidden", !isSvc);
        view.querySelector("#fav-freelancers").classList.toggle("hidden", isSvc);
      };
    });
  };
})();
