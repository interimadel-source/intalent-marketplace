(function () {
  const App = () => window.IntalentApp;

  // =========================================================================
  // 12. PERSISTENT MESSAGING — STITCH BENTO 3D (6cedaedaafcf4140bcb5768df31174c7.html)
  // =========================================================================
  window.IntalentPages["messages"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }

    const filterMode = state.params.filter || "all";
    const { conversations } = await api("/api/conversations");
    const filteredConversations = conversations.filter(c => {
      if (filterMode === "orders") return Boolean(c.order_id);
      if (filterMode === "direct") return !c.order_id;
      return true;
    });

    let activeConvId = Number(state.params.conv || (filteredConversations[0]?.id || conversations[0]?.id || 0));
    let activeMessages = [];
    let activeConv = null;

    if (activeConvId > 0) {
      const detail = await api("/api/conversations/" + activeConvId);
      activeConv = detail.conversation;
      activeMessages = detail.messages || [];
      await App().refreshBootstrap();
    }

    const otherActiveName = activeConv
      ? (activeConv.user1_id === state.user.id ? activeConv.user2_name : activeConv.user1_name)
      : "Contact Intalent";

    main.innerHTML = `
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
        <div class="grid grid-cols-12 gap-5 items-start">
          
          <!-- ================= ZONE 1: LEFT CONVERSATIONS & ECO-DATA CARD (3 Cols) ================= -->
          <aside class="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <div class="bg-surface-container-lowest rounded-[28px] p-5 shadow-[0_10px_30px_-10px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <h2 class="font-headline font-extrabold text-lg text-primary">Discussions</h2>
                <span class="px-2.5 py-0.5 text-xs font-extrabold bg-secondary/10 text-secondary rounded-full">${conversations.length} Fils</span>
              </div>

              <!-- Filter Tabs (Real filtering on conversations) -->
              <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button type="button" onclick="window.IntalentApp.navigate('messages?filter=all')" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${filterMode === 'all' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}">
                  Toutes (${conversations.length})
                </button>
                <button type="button" onclick="window.IntalentApp.navigate('messages?filter=orders')" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${filterMode === 'orders' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}">
                  Commandes (${conversations.filter(c => c.order_id).length})
                </button>
                <button type="button" onclick="window.IntalentApp.navigate('messages?filter=direct')" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${filterMode === 'direct' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}">
                  Direct (${conversations.filter(c => !c.order_id).length})
                </button>
              </div>

              <!-- Conversation List -->
              <div class="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                ${filteredConversations.length === 0 ? `
                  <div class="p-6 text-xs text-on-surface-variant text-center bg-surface-container-low rounded-2xl">
                    Aucune discussion dans ce filtre. Contactez un freelance depuis son profil.
                  </div>
                ` : filteredConversations.map(c => {
                  const otherName = c.user1_id === state.user.id ? c.user2_name : c.user1_name;
                  const isAct = c.id === activeConvId;
                  return `
                    <div onclick="window.IntalentApp.navigate('messages?filter=${encodeURIComponent(filterMode)}&conv=${c.id}')" class="p-3 rounded-2xl ${isAct ? 'bg-surface-container-low ring-2 ring-secondary shadow-xs' : 'hover:bg-surface-container-low/70'} transition-all cursor-pointer flex items-start gap-3">
                      <div class="relative shrink-0">
                        <div class="w-11 h-11 rounded-xl bg-primary-container text-tertiary-fixed font-headline font-extrabold flex items-center justify-center">
                          ${escapeHtml((otherName || "I")[0])}
                        </div>
                        <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-tertiary-fixed ring-2 ring-surface-container-lowest"></span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-0.5">
                          <h4 class="font-headline font-bold text-sm text-on-surface truncate">${escapeHtml(otherName)}</h4>
                          <span class="text-[10px] font-bold text-secondary">Actif</span>
                        </div>
                        <p class="text-[11px] font-semibold text-secondary truncate">${escapeHtml(c.subject || "Discussion Directe")}</p>
                        <p class="text-xs text-on-surface-variant truncate mt-0.5">${escapeHtml(c.last_message?.body || "Démarrer la discussion...")}</p>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>

            <!-- Stitch Quick Bandwidth Switcher Bento Card -->
            <div class="bg-primary-container text-on-primary p-5 rounded-[28px] shadow-[0_12px_28px_-6px_rgba(40,12,66,0.3)] flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] uppercase tracking-wider text-tertiary-fixed font-extrabold">Optimisation Locale</span>
                <span class="material-symbols-outlined text-lg text-tertiary-fixed">speed</span>
              </div>
              <div class="font-headline font-extrabold text-base leading-tight text-white">Mode Éco-Data Algérie</div>
              <p class="text-xs text-white/75 leading-relaxed">Optimise le chargement des pièces jointes sur les connexions 4G/ADSL Algérie.</p>
              <div class="mt-2 flex items-center justify-between pt-2 border-t border-white/10">
                <span class="text-xs font-semibold text-white">Mode Éco-Data</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input id="eco-data-toggle" checked class="sr-only peer" type="checkbox">
                  <div class="w-9 h-5 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-tertiary-fixed after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                </label>
              </div>
            </div>
          </aside>

          <!-- ================= ZONE 2: CENTER DOMINANT WORKSPACE (6 Cols) ================= -->
          <section class="col-span-12 lg:col-span-6 flex flex-col gap-4">
            ${!activeConv ? `
              <div class="bg-surface-container-lowest rounded-[28px] p-12 text-center shadow-sm border border-outline-variant/15">
                <span class="material-symbols-outlined text-4xl text-secondary mb-2">forum</span>
                <p class="font-headline font-bold text-primary">Sélectionnez une discussion à gauche</p>
              </div>
            ` : `
              <!-- Top Stitch Header Bar with Honest Video/Voice UI Status -->
              <div class="bg-primary-container text-white px-5 py-3.5 rounded-[28px] shadow-[0_12px_32px_-8px_rgba(40,12,66,0.4)] flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-white/10 text-tertiary-fixed font-headline font-extrabold flex items-center justify-center">
                    ${escapeHtml((otherActiveName || "I")[0])}
                  </div>
                  <div>
                    <div class="font-headline font-bold text-sm flex items-center gap-2">
                      <span>${escapeHtml(otherActiveName)}</span>
                      <span class="px-2 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold">Messagerie Active</span>
                    </div>
                    <span class="text-[11px] text-white/75">${escapeHtml(activeConv.subject || "Discussion Directe")} • Chiffrement TLS Algérie</span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  <button id="toggle-stitch-video-stage" type="button" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-tertiary-fixed text-xs font-bold flex items-center gap-1.5 transition-all" title="Afficher/Masquer l'aperçu Visio Stitch">
                    <span class="material-symbols-outlined text-sm">videocam</span>
                    <span>Aperçu Visio (Maquette)</span>
                  </button>
                  ${activeConv.order_id ? `
                    <button type="button" onclick="window.IntalentApp.navigate('order-detail?id=${activeConv.order_id}')" class="px-3 py-1.5 rounded-xl bg-tertiary-fixed text-primary-container text-xs font-extrabold hover:opacity-95 transition-all flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">receipt_long</span>
                      <span>Commande #${activeConv.order_id}</span>
                    </button>
                  ` : ""}
                </div>
              </div>

              <!-- Stitch Bento 3D Video Stage (Explicitly marked as UI Preview per requirement #6) -->
              <div id="stitch-video-stage-box" class="hidden bg-surface-container-lowest rounded-[28px] overflow-hidden p-4 shadow-[0_12px_36px_-10px_rgba(37,8,63,0.08)] border border-secondary/20">
                <div class="mb-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-amber-700">info</span>
                    <span><strong>Note technique :</strong> Aperçu visuel fidèle au design Stitch. Les appels vidéo/vocaux WebRTC en direct nécessitent un serveur média dédié (non activé en environnement local). Utilisez la messagerie écrite ci-dessous qui est 100% fonctionnelle.</span>
                  </div>
                </div>
                <div class="relative w-full h-[220px] rounded-2xl overflow-hidden bg-primary-container flex items-center justify-center text-center p-6">
                  <div class="max-w-md space-y-2">
                    <span class="material-symbols-outlined text-4xl text-tertiary-fixed">video_camera_front</span>
                    <h4 class="font-headline font-bold text-white text-base">Salle Visio Bento 3D — ${escapeHtml(otherActiveName)}</h4>
                    <p class="text-xs text-white/75">Maquette d'interface d'appel vidéo/vocal conformément au design Google Stitch.</p>
                  </div>
                </div>
              </div>

              <!-- Collaborative Live Chat Feed Section (100% Real SQLite Database Messages) -->
              <div class="bg-surface-container-lowest rounded-[28px] p-5 shadow-[0_10px_30px_-10px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col gap-4">
                <div class="flex items-center justify-between pb-2 border-b border-outline-variant/15">
                  <div class="flex items-center gap-2">
                    <span class="font-headline font-bold text-sm text-on-surface">Flux de Négociation &amp; Messages Enregistrés</span>
                    <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] text-secondary font-bold">Base de données active (${activeMessages.length})</span>
                  </div>
                  <span class="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-secondary">gpp_good</span> Protection Escrow DZD
                  </span>
                </div>

                <!-- Messages Feed -->
                <div id="chat-scroll-box" class="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 py-1">
                  ${activeMessages.map(m => {
                    const isMine = m.sender_id === state.user.id;
                    return isMine ? `
                      <div class="flex items-start gap-2.5 max-w-[85%] self-end flex-row-reverse">
                        <div class="w-8 h-8 rounded-lg bg-primary-container text-tertiary-fixed text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                          Vous
                        </div>
                        <div class="flex flex-col gap-1 items-end">
                          <div class="flex items-center gap-2">
                            <span class="text-[10px] text-on-surface-variant">${escapeHtml(m.created_at)}</span>
                            <span class="text-xs font-bold text-on-surface">Vous (${escapeHtml(state.user.full_name)})</span>
                          </div>
                          <div class="p-3.5 rounded-2xl rounded-tr-sm bg-primary-container text-white text-sm leading-relaxed whitespace-pre-line shadow-xs">
                            ${escapeHtml(m.body)}
                          </div>
                        </div>
                      </div>
                    ` : `
                      <div class="flex items-start gap-2.5 max-w-[85%]">
                        <div class="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          ${escapeHtml((m.sender_name || "U")[0])}
                        </div>
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-on-surface">${escapeHtml(m.sender_name)}</span>
                            <span class="text-[10px] text-on-surface-variant">${escapeHtml(m.created_at)}</span>
                          </div>
                          <div class="p-3.5 rounded-2xl rounded-tl-sm bg-surface-container-low text-on-surface text-sm leading-relaxed border border-outline-variant/15 whitespace-pre-line">
                            ${escapeHtml(m.body)}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>

                <!-- Rich Text Composer Bar (Real POST /api/messages + Real File Upload POST /api/upload) -->
                <div class="flex flex-col gap-2.5 pt-2 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20">
                  <div class="flex items-center flex-wrap gap-2 text-on-surface-variant px-1">
                    <label class="text-xs font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1 cursor-pointer">
                      <span class="material-symbols-outlined text-sm text-secondary">attachment</span>
                      <span>Joindre un fichier réel</span>
                      <input id="chat-attach-file-input" type="file" class="hidden">
                    </label>
                    <span>•</span>
                    <button type="button" onclick="const inp=document.querySelector('#send-msg-form input[name=body]');if(inp){inp.value='Salam, voici le point d\\'avancement sur la mission : ';inp.focus();}" class="text-xs font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm text-secondary">bolt</span>
                      <span>Point d'avancement</span>
                    </button>
                    <span>•</span>
                    <button type="button" onclick="const inp=document.querySelector('#send-msg-form input[name=body]');if(inp){inp.value='Les livrables sont prêts pour validation sur Intalent.';inp.focus();}" class="text-xs font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm text-secondary">verified</span>
                      <span>Livrables prêts</span>
                    </button>
                  </div>

                  <form id="send-msg-form" class="flex items-center gap-2">
                    <input type="text" name="body" class="flex-1 bg-surface-container-lowest px-4 py-2.5 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder="Rédiger votre message à ${escapeHtml(otherActiveName)}..." required>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-headline text-xs font-extrabold hover:scale-[1.02] transition-all flex items-center gap-1.5 shadow-[0_6px_16px_rgba(202,243,0,0.4)] shrink-0">
                      <span>Envoyer</span>
                      <span class="material-symbols-outlined text-base">send</span>
                    </button>
                  </form>
                </div>
              </div>
            `}
          </section>

          <!-- ================= ZONE 3: RIGHT DRAWER — SÉQUESTRE SATIM & COMMANDE (3 Cols) ================= -->
          <aside class="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <div class="bg-surface-container-lowest p-5 rounded-[28px] shadow-[0_10px_30px_-10px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col gap-3.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] uppercase tracking-wider text-on-surface-variant font-extrabold">Séquestre Bancaire SATIM</span>
                <span class="px-2.5 py-0.5 rounded-full bg-secondary text-white text-[11px] font-bold">
                  ${activeConv?.order_id ? `#CMD-${activeConv.order_id}` : "Escrow Actif"}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-on-surface-variant font-semibold">Protection Intalent Algérie</span>
                  <span class="material-symbols-outlined text-base text-secondary">verified_user</span>
                </div>
                <div class="font-headline font-extrabold text-sm text-primary leading-snug">
                  ${escapeHtml(activeConv?.subject || "Espace Négociation Directe")}
                </div>
                <span class="text-[11px] text-on-surface-variant">Fonds consignés à 100% via CIB / Edahabia jusqu'à validation des livrables.</span>
              </div>

              ${activeConv?.order_id ? `
                <button type="button" onclick="window.IntalentApp.navigate('order-detail?id=${activeConv.order_id}')" class="w-full py-3 px-4 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-headline text-xs font-extrabold hover:scale-[1.01] transition-all shadow-[0_8px_20px_rgba(202,243,0,0.4)] flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-base">lock_open</span>
                  <span>Ouvrir &amp; Gérer la Commande #${activeConv.order_id}</span>
                </button>
              ` : `
                <button type="button" onclick="window.IntalentApp.navigate('explore')" class="w-full py-3 px-4 rounded-2xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-base">explore</span>
                  <span>Explorer les Services →</span>
                </button>
              `}
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-[28px] shadow-[0_10px_30px_-10px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col gap-3">
              <span class="text-[11px] uppercase tracking-wider text-on-surface-variant font-extrabold">Actions Rapides</span>
              <button type="button" onclick="window.IntalentApp.navigate('projects')" class="w-full p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all text-left flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-primary-container text-tertiary-fixed flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">work</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-headline font-bold text-xs text-on-surface">Appels d'Offres Clients</div>
                  <p class="text-[11px] text-on-surface-variant">Consulter les projets ouverts en DZD</p>
                </div>
              </button>
              <button type="button" onclick="window.IntalentApp.navigate('notifications')" class="w-full p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all text-left flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">notifications</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-headline font-bold text-xs text-on-surface">Centre de Notifications</div>
                  <p class="text-[11px] text-on-surface-variant">Suivi des alertes commandes &amp; messages</p>
                </div>
              </button>
            </div>
          </aside>

        </div>
      </div>
    `;

    const scrollBox = document.getElementById("chat-scroll-box");
    if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;

    const toggleVideoBtn = document.getElementById("toggle-stitch-video-stage");
    const videoStageBox = document.getElementById("stitch-video-stage-box");
    if (toggleVideoBtn && videoStageBox) {
      toggleVideoBtn.addEventListener("click", () => {
        videoStageBox.classList.toggle("hidden");
      });
    }

    const ecoToggle = document.getElementById("eco-data-toggle");
    if (ecoToggle) {
      ecoToggle.addEventListener("change", () => {
        showToast(ecoToggle.checked ? "Mode Éco-Data Algérie activé." : "Mode Éco-Data Algérie désactivé.");
      });
    }

    const attachInput = document.getElementById("chat-attach-file-input");
    if (attachInput) {
      attachInput.addEventListener("change", async () => {
        if (!attachInput.files || attachInput.files.length === 0) return;
        try {
          const uploadedUrl = await uploadFileInput(attachInput);
          const bodyInp = document.querySelector("#send-msg-form input[name=body]");
          if (bodyInp && uploadedUrl) {
            bodyInp.value = (bodyInp.value ? bodyInp.value + " " : "") + `[Pièce jointe: ${uploadedUrl}]`;
            bodyInp.focus();
            showToast("Fichier téléversé et ajouté au message.");
          }
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const sendForm = document.getElementById("send-msg-form");
    if (sendForm) {
      sendForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await api("/api/messages", {
            method: "POST",
            body: JSON.stringify({ conversation_id: activeConvId, body: fd.get("body") })
          });
          window.IntalentPages["messages"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }
  };

  window.IntalentPages["notifications"] = async function (main, state) {
    const { escapeHtml, api, showToast } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }
    const { notifications } = await api("/api/notifications");

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span class="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-extrabold uppercase tracking-wider">Alertes &amp; Activité</span>
            <h1 class="font-headline text-2xl sm:text-3xl font-extrabold text-primary mt-1">Centre de Notifications</h1>
          </div>
          <button id="mark-all-read-btn" type="button" class="px-4 py-2.5 rounded-2xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-outlined text-base">done_all</span>
            <span>Tout marquer comme lu</span>
          </button>
        </div>

        <div class="bg-surface-container-lowest rounded-[28px] shadow-[0_10px_30px_-10px_rgba(37,8,63,0.06)] border border-outline-variant/15 overflow-hidden divide-y divide-outline-variant/15">
          ${notifications.length === 0 ? `
            <div class="p-10 text-center text-on-surface-variant text-sm">Aucune notification pour le moment.</div>
          ` : notifications.map(n => `
            <div class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${n.is_read ? 'bg-surface-container-lowest' : 'bg-secondary-fixed/25'} hover:bg-surface-container-low/60 transition-colors">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  ${!n.is_read ? `<span class="w-2 h-2 rounded-full bg-secondary"></span>` : ""}
                  <div class="font-headline font-bold text-sm text-primary">${escapeHtml(n.title)}</div>
                </div>
                <div class="text-sm text-on-surface-variant">${escapeHtml(n.message)}</div>
                <div class="text-[11px] text-outline">${escapeHtml(n.created_at)}</div>
              </div>
              ${n.link_route ? `
                <button type="button" class="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-primary-container hover:text-tertiary-fixed text-primary font-headline text-xs font-bold transition-all shrink-0" onclick="window.IntalentApp.navigate('${escapeHtml(n.link_route)}')">
                  Ouvrir →
                </button>
              ` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `;

    document.getElementById("mark-all-read-btn").addEventListener("click", async () => {
      await api("/api/notifications/read-all", { method: "POST", body: "{}" });
      await App().refreshBootstrap();
      showToast("Toutes les notifications ont été marquées comme lues.");
      window.IntalentPages["notifications"](main, state);
    });
  };

  window.IntalentPages["favorites"] = async function (main, state) {
    const { escapeHtml, renderServiceCard, api } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }
    const { services, freelancers } = await api("/api/favorites/details");

    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-extrabold uppercase tracking-wider">Sélection Personnelle</span>
            <h1 class="font-headline text-2xl sm:text-3xl font-extrabold text-primary mt-1">Services &amp; Freelances Favoris</h1>
          </div>
          <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-4 py-2.5 rounded-2xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all">
            Explorer le Catalogue →
          </button>
        </div>

        <section class="space-y-4">
          <h3 class="font-headline text-lg font-extrabold text-primary">Services Sauvegardés (${services.length})</h3>
          ${services.length === 0 ? `
            <div class="bg-surface-container-lowest rounded-[28px] p-8 border border-outline-variant/15 text-sm text-on-surface-variant">
              Aucun service sauvegardé. Cliquez sur l'icône ♥ sur n'importe quelle carte de service pour l'ajouter ici.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${services.map(renderServiceCard).join("")}</div>
          `}
        </section>

        <section class="space-y-4">
          <h3 class="font-headline text-lg font-extrabold text-primary">Freelances Favoris (${freelancers.length})</h3>
          ${freelancers.length === 0 ? `
            <div class="bg-surface-container-lowest rounded-[28px] p-8 border border-outline-variant/15 text-sm text-on-surface-variant">
              Aucun freelance sauvegardé pour le moment.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              ${freelancers.map(f => `
                <div class="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/15 shadow-xs flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 min-w-0">
                    <img src="${escapeHtml(f.avatar_url)}" class="w-12 h-12 rounded-2xl object-cover shrink-0">
                    <div class="min-w-0">
                      <div class="font-headline font-bold text-sm text-primary truncate">${escapeHtml(f.full_name)}</div>
                      <div class="text-xs text-on-surface-variant truncate">${escapeHtml(f.wilaya)}</div>
                    </div>
                  </div>
                  <button type="button" class="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-primary-container hover:text-tertiary-fixed text-primary font-headline text-xs font-bold transition-all shrink-0" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">
                    Voir Profil →
                  </button>
                </div>
              `).join("")}
            </div>
          `}
        </section>
      </div>
    `;
  };

  // =========================================================================
  // 13. CLIENT DASHBOARD
  // =========================================================================
  window.IntalentPages["client-dashboard"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }

    const tab = state.params.tab || "overview";
    const [ordersRes, projectsRes, favsRes] = await Promise.all([
      api("/api/orders"),
      api("/api/projects"),
      api("/api/favorites/details")
    ]);

    const myOrders = (ordersRes.orders || []).filter(o => o.client_id === state.user.id);
    const myProjects = (projectsRes.projects || []).filter(p => p.client_id === state.user.id);
    const totalSpent = myOrders.reduce((acc, o) => acc + Number(o.total_dzd || 0), 0);

    main.innerHTML = `
      <div class="container dashboard-shell">
        <aside class="dashboard-sidebar">
          <div style="padding:8px 12px 16px;border-bottom:1px solid var(--border-color);margin-bottom:12px;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--brand-violet);text-transform:uppercase;">Client Workspace</div>
            <div style="font-weight:800;color:var(--brand-deep);">${escapeHtml(state.user.full_name)}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(state.user.wilaya)}</div>
          </div>
          <div class="sidebar-menu-item ${tab === 'overview' ? 'active' : ''}" onclick="window.IntalentApp.navigate('client-dashboard?tab=overview')">📊 Overview & Orders</div>
          <div class="sidebar-menu-item ${tab === 'projects' ? 'active' : ''}" onclick="window.IntalentApp.navigate('client-dashboard?tab=projects')">📋 My Project Requests</div>
          <div class="sidebar-menu-item" onclick="window.IntalentApp.navigate('favorites')">♥ Saved Services (${favsRes.services.length})</div>
          <div class="sidebar-menu-item" onclick="window.IntalentApp.navigate('messages')">💬 Messages</div>
          <div class="sidebar-menu-item ${tab === 'profile' ? 'active' : ''}" onclick="window.IntalentApp.navigate('client-dashboard?tab=profile')">⚙ Profile & Settings</div>
          <div class="sidebar-menu-item" onclick="window.IntalentApp.navigate('contact')">🎧 Support</div>
        </aside>

        <div>
          <div class="stat-cards-grid">
            <div class="stat-card"><div class="stat-card-label">Active Orders</div><div class="stat-card-value">${myOrders.filter(o => o.status !== 'completed').length}</div></div>
            <div class="stat-card"><div class="stat-card-label">Completed Orders</div><div class="stat-card-value">${myOrders.filter(o => o.status === 'completed').length}</div></div>
            <div class="stat-card"><div class="stat-card-label">Project Briefs</div><div class="stat-card-value">${myProjects.length}</div></div>
            <div class="stat-card"><div class="stat-card-label">Total Order Volume</div><div class="stat-card-value">${formatDZD(totalSpent)}</div></div>
          </div>

          ${tab === "overview" ? `
            <div class="card-panel">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:var(--brand-deep);">My Purchased Orders</h3>
                <button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('explore')">Browse Services →</button>
              </div>
              ${myOrders.length === 0 ? `<p style="color:var(--text-secondary);">You haven't placed any orders yet.</p>` : `
                <div class="table-wrap">
                  <table class="data-table">
                    <thead>
                      <tr><th>Order #</th><th>Service</th><th>Freelancer</th><th>Total</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      ${myOrders.map(o => `
                        <tr>
                          <td><strong>${escapeHtml(o.order_number)}</strong></td>
                          <td>${escapeHtml(o.service_title)}</td>
                          <td>${escapeHtml(o.freelancer_name)}</td>
                          <td><strong>${formatDZD(o.total_dzd)}</strong></td>
                          <td><span class="badge badge-status">${escapeHtml(o.status.toUpperCase())}</span></td>
                          <td><button class="btn btn-outline btn-sm" onclick="window.IntalentApp.navigate('order-detail?id=${o.id}')">Manage Order →</button></td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          ` : ""}

          ${tab === "projects" ? `
            <div class="card-panel">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:var(--brand-deep);">My Custom Project Requests</h3>
                <button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('post-project')">+ Post New Brief</button>
              </div>
              ${myProjects.length === 0 ? `<p style="color:var(--text-secondary);">No project briefs posted yet.</p>` :
                myProjects.map(p => `
                  <div style="padding:14px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <strong>${escapeHtml(p.project_code)} — ${escapeHtml(p.title)}</strong>
                      <div style="font-size:0.84rem;color:var(--text-secondary);">Proposals: ${p.proposal_count} • Status: ${escapeHtml(p.status)}</div>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.navigate('projects')">Review Proposals →</button>
                  </div>
                `).join("")
              }
            </div>
          ` : ""}

          ${tab === "profile" ? `
            <form id="client-profile-form" class="card-panel" style="display:flex;flex-direction:column;gap:14px;">
              <h3 style="color:var(--brand-deep);">Personal Profile & Account Settings</h3>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Full Name</label>
                <input type="text" name="full_name" class="input" style="width:100%;" value="${escapeHtml(state.user.full_name)}" required>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Headline / Company Title</label>
                <input type="text" name="headline" class="input" style="width:100%;" value="${escapeHtml(state.user.headline || '')}">
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Bio</label>
                <textarea name="bio" class="textarea">${escapeHtml(state.user.bio || '')}</textarea>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Upload New Profile Avatar</label>
                <input type="file" id="client-avatar-file" class="input" style="width:100%;" accept="image/*">
              </div>
              <button type="submit" class="btn btn-primary">Save Profile Changes</button>
            </form>
          ` : ""}
        </div>
      </div>
    `;

    const profForm = document.getElementById("client-profile-form");
    if (profForm) {
      profForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          let avatarUrl = state.user.avatar_url;
          const fi = document.getElementById("client-avatar-file");
          if (fi && fi.files.length > 0) {
            avatarUrl = await uploadFileInput(fi);
          }
          await api("/api/profile", {
            method: "POST",
            body: JSON.stringify({
              full_name: fd.get("full_name"),
              headline: fd.get("headline"),
              bio: fd.get("bio"),
              avatar_url: avatarUrl
            })
          });
          await App().refreshBootstrap();
          showToast("Profile updated!");
          window.IntalentPages["client-dashboard"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }
  };

  // =========================================================================
  // 14. FREELANCER DASHBOARD (SERVICES, ORDERS, EARNINGS, PORTFOLIO, PROFILE)
  // =========================================================================
  window.IntalentPages["freelancer-dashboard"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }

    const tab = state.params.tab || "overview";
    const [mySvcsRes, ordersRes, walletRes, flDetailRes] = await Promise.all([
      api("/api/my-services"),
      api("/api/orders"),
      api("/api/wallet"),
      api("/api/freelancers/" + state.user.id)
    ]);

    const myServices = mySvcsRes.services || [];
    const incomingOrders = (ordersRes.orders || []).filter(o => o.freelancer_id === state.user.id);
    const flProfile = flDetailRes.freelancer || state.user;

    main.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <!-- STITCH SCREEN 5: HERO WELCOME BANNER -->
        <section class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#280c42] via-[#3e2459] to-[#7627e0] p-7 text-white shadow-sm mb-8">
          <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-2 max-w-xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider uppercase text-secondary-fixed">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Disponible pour nouveaux projets • ${escapeHtml(state.user.wilaya || "Alger")}, Algérie
              </div>
              <h2 class="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight">Salam, ${escapeHtml(state.user.full_name)} 👋</h2>
              <p class="text-white/80 text-sm leading-relaxed">
                Vous avez <span class="text-white font-semibold underline decoration-secondary-container underline-offset-4">${incomingOrders.filter(o => o.status !== 'completed').length} commandes actives</span> et un solde disponible de <span class="text-secondary-fixed font-bold">${formatDZD(walletRes.balance_dzd)}</span>.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=earnings')" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-headline font-semibold text-xs border border-white/15 transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-base">account_balance_wallet</span>
                Retirer mes gains (BaridiMob / CCP)
              </button>
              <button onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')" class="px-5 py-2.5 rounded-xl bg-white text-primary font-headline font-bold text-xs shadow-lg hover:bg-secondary-fixed transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-base">add_circle</span>
                Publier un Nouveau Service
              </button>
            </div>
          </div>
        </section>

        <div class="dashboard-shell" style="padding:0;">
          <aside class="dashboard-sidebar">
            <div style="padding:8px 12px 16px;border-bottom:1px solid var(--border-color);margin-bottom:12px;">
              <div style="font-size:0.75rem;font-weight:700;color:var(--brand-violet);text-transform:uppercase;">Studio Freelance</div>
              <div style="font-weight:800;color:var(--brand-deep);">${escapeHtml(state.user.full_name)}</div>
              <div style="margin-top:4px;">
                ${state.user.is_pro ? `<span class="badge badge-pro">✦ FREELANCE PRO</span>` : `<span class="badge badge-status">Vendeur Vérifié</span>`}
              </div>
            </div>
            <div class="sidebar-menu-item ${tab === 'overview' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=overview')">📊 Vue d'ensemble & Stats</div>
            <div class="sidebar-menu-item ${tab === 'services' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=services')">💼 Mes Services (${myServices.length})</div>
            <div class="sidebar-menu-item ${tab === 'create-service' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')">+ Créer un Service (IA)</div>
            <div class="sidebar-menu-item ${tab === 'portfolio' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=portfolio')">🖼 Portfolio Projets</div>
            <div class="sidebar-menu-item ${tab === 'earnings' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=earnings')">💰 Revenus & Retraits CCP</div>
            <div class="sidebar-menu-item ${tab === 'profile' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=profile')">👤 Profil & Compétences</div>
            <div class="sidebar-menu-item" onclick="window.IntalentApp.navigate('pro-upgrade')">✦ Intalent Pro Upgrade</div>
          </aside>

          <div>
            <!-- STITCH SCREEN 5: 4-COLUMN KPI CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div class="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-outline-variant/15 flex flex-col justify-between">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Solde Disponible</span>
                  <div class="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined text-xl">payments</span>
                  </div>
                </div>
                <div class="flex items-baseline gap-1.5">
                  <span class="font-headline text-2xl font-extrabold text-primary">${formatDZD(walletRes.balance_dzd)}</span>
                </div>
                <div class="mt-3 pt-2 border-t border-surface-container flex items-center justify-between text-[11px]">
                  <span class="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+18.4%</span>
                  <span class="text-on-surface-variant">Retrait CCP / RIB</span>
                </div>
              </div>

              <div class="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-outline-variant/15 flex flex-col justify-between">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Commandes en Cours</span>
                  <div class="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-xl">pending_actions</span>
                  </div>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="font-headline text-2xl font-extrabold text-primary">${incomingOrders.filter(o => o.status !== 'completed').length}</span>
                  <span class="text-xs font-semibold text-on-surface-variant">Projets actifs</span>
                </div>
                <div class="mt-3 pt-2 border-t border-surface-container flex items-center justify-between text-[11px]">
                  <span class="font-bold text-secondary bg-secondary-fixed/60 px-2 py-0.5 rounded-md">Escrow garanti</span>
                  <span class="text-on-surface-variant">${incomingOrders.filter(o => o.status === 'completed').length} terminées</span>
                </div>
              </div>

              <div class="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-outline-variant/15 flex flex-col justify-between">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Services Publiés</span>
                  <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <span class="material-symbols-outlined text-xl">Check_Circle</span>
                  </div>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="font-headline text-2xl font-extrabold text-primary">${myServices.filter(s => s.status === 'approved').length}</span>
                  <span class="text-xs font-semibold text-emerald-700">En ligne</span>
                </div>
                <div class="mt-3 pt-2 border-t border-surface-container text-[11px] text-on-surface-variant">
                  Taux de livraison à temps : <strong>98.5%</strong>
                </div>
              </div>

              <div class="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-outline-variant/15 flex flex-col justify-between">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Note Globale</span>
                  <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">star</span>
                  </div>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="font-headline text-2xl font-extrabold text-primary">${Number(state.user.rating_avg || 4.9).toFixed(1)}</span>
                  <span class="text-xs font-semibold text-on-surface-variant">/ 5.0 (${state.user.review_count || 12} avis)</span>
                </div>
                <div class="mt-3 pt-2 border-t border-surface-container text-[11px] text-secondary font-bold">
                  ✦ Top Talent Algérie
                </div>
              </div>
            </div>

            ${tab === "overview" ? `
              <div class="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/15 overflow-hidden mb-6">
                <div class="p-5 border-b border-surface-container flex items-center justify-between">
                  <div>
                    <h3 class="font-headline text-lg font-bold text-primary">File d'Attente des Commandes Clients</h3>
                    <p class="text-xs text-on-surface-variant">Gérez vos livraisons et validez vos jalons pour débloquer vos fonds DZD.</p>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')">+ Nouveau Service</button>
                </div>
                ${incomingOrders.length === 0 ? `<div class="p-6 text-sm text-on-surface-variant">Aucune commande reçue pour le moment. Publiez un service ou répondez aux appels d'offres !</div>` : `
                  <div class="table-wrap">
                    <table class="data-table">
                      <thead>
                        <tr><th>Commande #</th><th>Service</th><th>Client</th><th>Gain Net (DZD)</th><th>Statut</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        ${incomingOrders.map(o => `
                          <tr>
                            <td><strong>${escapeHtml(o.order_number)}</strong></td>
                            <td>${escapeHtml(o.service_title)}</td>
                            <td>${escapeHtml(o.client_name)}</td>
                            <td><strong style="color:var(--success);">${formatDZD(o.freelancer_net_dzd)}</strong></td>
                            <td><span class="badge badge-status">${escapeHtml(o.status.toUpperCase())}</span></td>
                            <td><button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('order-detail?id=${o.id}')">Livrer / Ouvrir →</button></td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>
                `}
              </div>

              <!-- STITCH SCREEN 5: MONTHLY REVENUE SVG CHART -->
              <div class="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/15 p-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 class="font-headline text-lg font-bold text-primary">Évolution des Revenus Mensuels (DZD)</h3>
                    <p class="text-xs text-on-surface-variant">Performance financière consolidée sur les 6 derniers mois</p>
                  </div>
                  <span class="px-3 py-1 rounded-lg bg-secondary-fixed text-secondary text-xs font-bold">Croissance +24%</span>
                </div>
                <div class="relative h-48 w-full">
                  <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 180">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#7627e0" stop-opacity="0.28"></stop>
                        <stop offset="100%" stop-color="#7627e0" stop-opacity="0.0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0,145 C60,135 90,95 140,100 C190,105 230,65 280,75 C330,85 370,40 420,50 C470,60 510,30 560,25 C610,20 650,10 700,8 L700,180 L0,180 Z" fill="url(#chartGrad)"></path>
                    <path d="M0,145 C60,135 90,95 140,100 C190,105 230,65 280,75 C330,85 370,40 420,50 C470,60 510,30 560,25 C610,20 650,10 700,8" fill="none" stroke="#7627e0" stroke-linecap="round" stroke-width="3.5"></path>
                    <circle cx="560" cy="25" fill="#ffffff" r="5" stroke="#7627e0" stroke-width="3"></circle>
                    <circle cx="700" cy="8" fill="#280c42" r="6" stroke="#ffffff" stroke-width="2.5"></circle>
                  </svg>
                </div>
              </div>
            ` : ""}

          ${tab === "services" ? `
            <div class="card-panel">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:var(--brand-deep);">Manage My Services</h3>
                <button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')">+ Create Service</button>
              </div>
              ${myServices.length === 0 ? `<p style="color:var(--text-secondary);">You haven't created any services yet.</p>` :
                myServices.map(s => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:10px;gap:14px;flex-wrap:wrap;">
                    <div style="display:flex;align-items:center;gap:12px;">
                      <img src="${escapeHtml(s.cover_image)}" style="width:72px;height:52px;object-fit:cover;border-radius:6px;">
                      <div>
                        <strong style="cursor:pointer;color:var(--brand-deep);" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">${escapeHtml(s.title)}</strong>
                        <div style="font-size:0.82rem;color:var(--text-secondary);">Starting at ${formatDZD(s.starting_price_dzd)} • Status: <strong>${escapeHtml(s.status.toUpperCase())}</strong></div>
                      </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <button class="btn btn-outline btn-sm toggle-svc-status" data-id="${s.id}" data-status="${s.status === 'approved' ? 'paused' : 'approved'}">
                        ${s.status === 'approved' ? 'Pause' : 'Publish'}
                      </button>
                      <button class="btn btn-danger btn-sm delete-svc-btn" data-id="${s.id}">Delete</button>
                    </div>
                  </div>
                `).join("")
              }
            </div>
          ` : ""}

          ${tab === "create-service" ? `
            <form id="create-service-form" class="card-panel" style="display:flex;flex-direction:column;gap:16px;">
              <h3 style="color:var(--brand-deep);">Create & Publish a New Service</h3>
              <div>
                <label style="font-size:0.82rem;font-weight:700;">Service Title ("I will...")</label>
                <input type="text" name="title" class="input" style="width:100%;" placeholder="I will develop a modern e-commerce web application..." required>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div>
                  <label style="font-size:0.82rem;font-weight:700;">Category</label>
                  <select name="category_id" class="select" style="width:100%;" required>
                    ${state.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <label style="font-size:0.82rem;font-weight:700;">Skills & Tags (comma-separated)</label>
                  <input type="text" name="skills_csv" class="input" style="width:100%;" placeholder="React, Python, CIB API, UI/UX" required>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <label style="font-size:0.82rem;font-weight:700;">Detailed Service Description</label>
                  <button type="button" class="btn btn-outline btn-sm" id="ai-write-svc-btn">✨ Generate with Gemini AI</button>
                </div>
                <textarea name="description" id="svc-desc-textarea" class="textarea" placeholder="Describe deliverables, workflow, and why clients should choose you..." required></textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div>
                  <label style="font-size:0.82rem;font-weight:700;">Upload Service Cover Image (or provide URL right)</label>
                  <input type="file" id="svc-cover-file" class="input" style="width:100%;" accept="image/*">
                </div>
                <div>
                  <label style="font-size:0.82rem;font-weight:700;">Or Cover Image URL</label>
                  <input type="text" name="cover_url" class="input" style="width:100%;" value="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80">
                </div>
              </div>

              <h4 style="color:var(--brand-deep);border-top:1px solid var(--border-color);padding-top:14px;">3-Tier Pricing Packages (DZD)</h4>
              <div class="grid-3">
                <div style="border:1px solid var(--border-color);padding:14px;border-radius:8px;">
                  <strong>BASIC PACKAGE</strong>
                  <input type="text" name="basic_name" class="input" style="width:100%;margin:8px 0;" value="Starter Package" required>
                  <input type="text" name="basic_desc" class="input" style="width:100%;margin-bottom:8px;" value="Core deliverable with clean source files." required>
                  <label style="font-size:0.75rem;font-weight:700;">Price (DZD)</label>
                  <input type="number" name="basic_price" class="input" style="width:100%;margin-bottom:8px;" value="15000" required>
                  <label style="font-size:0.75rem;font-weight:700;">Delivery Days</label>
                  <input type="number" name="basic_days" class="input" style="width:100%;" value="3" required>
                </div>
                <div style="border:1px solid var(--brand-violet);padding:14px;border-radius:8px;background:var(--brand-pale);">
                  <strong>STANDARD PACKAGE</strong>
                  <input type="text" name="std_name" class="input" style="width:100%;margin:8px 0;" value="Professional Package" required>
                  <input type="text" name="std_desc" class="input" style="width:100%;margin-bottom:8px;" value="Complete solution with priority revisions." required>
                  <label style="font-size:0.75rem;font-weight:700;">Price (DZD)</label>
                  <input type="number" name="std_price" class="input" style="width:100%;margin-bottom:8px;" value="35000" required>
                  <label style="font-size:0.75rem;font-weight:700;">Delivery Days</label>
                  <input type="number" name="std_days" class="input" style="width:100%;" value="6" required>
                </div>
                <div style="border:1px solid var(--border-color);padding:14px;border-radius:8px;">
                  <strong>PREMIUM PACKAGE</strong>
                  <input type="text" name="prem_name" class="input" style="width:100%;margin:8px 0;" value="Enterprise VIP Suite" required>
                  <input type="text" name="prem_desc" class="input" style="width:100%;margin-bottom:8px;" value="Full-scale execution + VIP support." required>
                  <label style="font-size:0.75rem;font-weight:700;">Price (DZD)</label>
                  <input type="number" name="prem_price" class="input" style="width:100%;margin-bottom:8px;" value="75000" required>
                  <label style="font-size:0.75rem;font-weight:700;">Delivery Days</label>
                  <input type="number" name="prem_days" class="input" style="width:100%;" value="10" required>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;">
                <input type="text" name="extra_title" class="input" placeholder="Optional Extra Title (e.g. Express 24h Delivery)">
                <input type="number" name="extra_price" class="input" placeholder="Extra Price in DZD (e.g. 8000)">
              </div>

              <div style="display:flex;gap:12px;">
                <button type="submit" class="btn btn-primary btn-lg">Publish Service to Marketplace →</button>
              </div>
            </form>
          ` : ""}

          ${tab === "portfolio" ? `
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:14px;">Add Portfolio Project</h3>
              <form id="add-portfolio-form" style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <input type="text" name="title" class="input" placeholder="Project Title" required>
                  <input type="text" name="category" class="input" placeholder="Category (e.g. Web Development)" required>
                </div>
                <textarea name="description" class="textarea" placeholder="Describe the challenge and results..." required></textarea>
                <input type="text" name="image_url" class="input" value="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" required>
                <button type="submit" class="btn btn-primary">Add to Portfolio</button>
              </form>
              <div class="grid-2">
                ${(flProfile.portfolio || []).map(p => `
                  <div style="border:1px solid var(--border-color);border-radius:8px;padding:12px;">
                    <img src="${escapeHtml(p.image_url)}" style="width:100%;height:140px;object-fit:cover;border-radius:6px;margin-bottom:8px;">
                    <strong>${escapeHtml(p.title)}</strong>
                    <p style="font-size:0.84rem;color:var(--text-secondary);">${escapeHtml(p.description)}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          ${tab === "earnings" ? `
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:12px;">Request Payout Withdrawal (DZD)</h3>
              <form id="payout-form" style="display:grid;grid-template-columns:1fr 1fr 1.5fr auto;gap:10px;margin-bottom:24px;align-items:end;">
                <div>
                  <label style="font-size:0.78rem;font-weight:700;">Amount (DZD)</label>
                  <input type="number" name="amount_dzd" class="input" style="width:100%;" placeholder="e.g. 20000" required>
                </div>
                <div>
                  <label style="font-size:0.78rem;font-weight:700;">Method</label>
                  <select name="method" class="select" style="width:100%;">
                    <option value="CCP / BaridiMob">CCP / BaridiMob</option>
                    <option value="Bank RIB Wire Transfer">Bank RIB Wire Transfer</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:0.78rem;font-weight:700;">CCP / RIB Account Details</label>
                  <input type="text" name="account_details" class="input" style="width:100%;" placeholder="CCP 00284910 Cle 45" required>
                </div>
                <button type="submit" class="btn btn-primary">Withdraw</button>
              </form>

              <h4 style="color:var(--brand-deep);margin-bottom:10px;">Payout & Transaction Ledger</h4>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>Status</th><th>Description</th></tr></thead>
                  <tbody>
                    ${(walletRes.transactions || []).map(tx => `
                      <tr>
                        <td><code>${escapeHtml(tx.tx_reference)}</code></td>
                        <td>${escapeHtml(tx.type)}</td>
                        <td><strong>${formatDZD(tx.amount_dzd)}</strong></td>
                        <td><span class="badge badge-success">${escapeHtml(tx.status)}</span></td>
                        <td>${escapeHtml(tx.description)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ""}

          ${tab === "profile" ? `
            <form id="fl-profile-form" class="card-panel" style="display:flex;flex-direction:column;gap:14px;">
              <h3 style="color:var(--brand-deep);">Freelancer Profile, Skills & Availability</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Full Name</label>
                  <input type="text" name="full_name" class="input" style="width:100%;" value="${escapeHtml(state.user.full_name)}" required>
                </div>
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Hourly Rate (DZD)</label>
                  <input type="number" name="hourly_rate_dzd" class="input" style="width:100%;" value="${state.user.hourly_rate_dzd || 2500}">
                </div>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Professional Headline</label>
                <input type="text" name="headline" class="input" style="width:100%;" value="${escapeHtml(state.user.headline || '')}" required>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Biography</label>
                <textarea name="bio" class="textarea" required>${escapeHtml(state.user.bio || '')}</textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Skills (comma-separated)</label>
                  <input type="text" name="skills_csv" class="input" style="width:100%;" value="${escapeHtml((flProfile.skills || []).map(s => s.skill_name).join(', '))}">
                </div>
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Availability</label>
                  <select name="availability" class="select" style="width:100%;">
                    <option value="available" ${state.user.availability === 'available' ? 'selected' : ''}>Available for new orders</option>
                    <option value="busy" ${state.user.availability === 'busy' ? 'selected' : ''}>Busy (Limited slots)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Upload Profile Photo</label>
                <input type="file" id="fl-avatar-file" class="input" style="width:100%;" accept="image/*">
              </div>
              <button type="submit" class="btn btn-primary">Save Freelancer Profile</button>
            </form>
          ` : ""}
          </div>
        </div>
      </div>
    `;

    // Event bindings for Freelancer Dashboard
    main.querySelectorAll(".toggle-svc-status").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api("/api/services/" + btn.getAttribute("data-id"), {
          method: "PUT",
          body: JSON.stringify({ status: btn.getAttribute("data-status") })
        });
        showToast("Service status updated.");
        window.IntalentPages["freelancer-dashboard"](main, state);
      });
    });

    main.querySelectorAll(".delete-svc-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api("/api/services/" + btn.getAttribute("data-id"), { method: "DELETE" });
        showToast("Service deleted.");
        window.IntalentPages["freelancer-dashboard"](main, state);
      });
    });

    const aiSvcBtn = document.getElementById("ai-write-svc-btn");
    if (aiSvcBtn) {
      aiSvcBtn.addEventListener("click", async () => {
        const titleVal = document.querySelector("#create-service-form input[name='title']").value.trim();
        if (!titleVal) {
          showToast("Enter a Service Title first so Gemini AI can write your description.", true);
          return;
        }
        aiSvcBtn.textContent = "✨ Generating with Gemini 3.8 Flash...";
        try {
          const res = await api("/api/ai/assist", {
            method: "POST",
            body: JSON.stringify({ mode: "service_description", prompt: titleVal })
          });
          document.getElementById("svc-desc-textarea").value = res.output_text || "";
          showToast("Service description generated with Gemini 3.8 Flash!");
        } catch (err) {
          showToast(err.message, true);
        } finally {
          aiSvcBtn.textContent = "✨ Generate with Gemini AI";
        }
      });
    }

    const createSvcForm = document.getElementById("create-service-form");
    if (createSvcForm) {
      createSvcForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          let coverUrl = fd.get("cover_url");
          const fi = document.getElementById("svc-cover-file");
          if (fi && fi.files.length > 0) {
            coverUrl = await uploadFileInput(fi);
          }
          const skills = String(fd.get("skills_csv") || "").split(",").map(s => s.trim()).filter(Boolean);
          const packages = [
            { tier: "basic", name: fd.get("basic_name"), description: fd.get("basic_desc"), price_dzd: Number(fd.get("basic_price")), delivery_days: Number(fd.get("basic_days")), revisions: 2, features: ["Source Files", "Commercial Use"] },
            { tier: "standard", name: fd.get("std_name"), description: fd.get("std_desc"), price_dzd: Number(fd.get("std_price")), delivery_days: Number(fd.get("std_days")), revisions: 4, features: ["Source Files", "Priority Support", "Commercial Use"] },
            { tier: "premium", name: fd.get("prem_name"), description: fd.get("prem_desc"), price_dzd: Number(fd.get("prem_price")), delivery_days: Number(fd.get("prem_days")), revisions: 99, features: ["Complete VIP Package", "Unlimited Revisions", "Source Code"] }
          ];
          const extras = [];
          if (fd.get("extra_title") && Number(fd.get("extra_price")) > 0) {
            extras.push({ title: fd.get("extra_title"), description: "Optional add-on", price_dzd: Number(fd.get("extra_price")), additional_days: 0 });
          }
          const res = await api("/api/services", {
            method: "POST",
            body: JSON.stringify({
              title: fd.get("title"),
              category_id: Number(fd.get("category_id")),
              description: fd.get("description"),
              skills_tags: skills,
              cover_image: coverUrl,
              packages,
              extras
            })
          });
          showToast("Service published to marketplace!");
          App().navigate("service?slug=" + encodeURIComponent(res.slug));
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const portForm = document.getElementById("add-portfolio-form");
    if (portForm) {
      portForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api("/api/portfolio", { method: "POST", body: JSON.stringify(Object.fromEntries(fd.entries())) });
        showToast("Portfolio item added!");
        window.IntalentPages["freelancer-dashboard"](main, state);
      });
    }

    const payoutForm = document.getElementById("payout-form");
    if (payoutForm) {
      payoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await api("/api/payouts", {
            method: "POST",
            body: JSON.stringify({
              amount_dzd: Number(fd.get("amount_dzd")),
              method: fd.get("method"),
              account_details: fd.get("account_details")
            })
          });
          showToast("Payout withdrawal request submitted!");
          window.IntalentPages["freelancer-dashboard"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const flProfForm = document.getElementById("fl-profile-form");
    if (flProfForm) {
      flProfForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          let avatarUrl = state.user.avatar_url;
          const fi = document.getElementById("fl-avatar-file");
          if (fi && fi.files.length > 0) {
            avatarUrl = await uploadFileInput(fi);
          }
          const skills = String(fd.get("skills_csv") || "").split(",").map(s => s.trim()).filter(Boolean).map(s => ({ skill_name: s, level: "Expert" }));
          await api("/api/profile", {
            method: "POST",
            body: JSON.stringify({
              full_name: fd.get("full_name"),
              hourly_rate_dzd: Number(fd.get("hourly_rate_dzd")),
              headline: fd.get("headline"),
              bio: fd.get("bio"),
              availability: fd.get("availability"),
              avatar_url: avatarUrl,
              skills
            })
          });
          await App().refreshBootstrap();
          showToast("Freelancer profile saved!");
          window.IntalentPages["freelancer-dashboard"](main, state);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }
  };

  // =========================================================================
  // 15. BUSINESS DASHBOARD (COMPANY PROFILE, TEAM, PROJECTS, HIRES)
  // =========================================================================
  window.IntalentPages["business-dashboard"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }

    const [bizRes, projectsRes, ordersRes] = await Promise.all([
      api("/api/business/profile"),
      api("/api/projects"),
      api("/api/orders")
    ]);

    const biz = bizRes.business || { company_name: state.user.full_name + " Enterprise", industry: "Technology", company_size: "11-50 employees", rc_nif_number: "", wilaya: state.user.wilaya, website: "", description: "" };
    const team = bizRes.team || [];
    const myProjects = (projectsRes.projects || []).filter(p => p.client_id === state.user.id);
    const myOrders = (ordersRes.orders || []).filter(o => o.client_id === state.user.id);

    main.innerHTML = `
      <div class="container section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
          <div>
            <span class="badge badge-pro">INTALENT BUSINESS WORKSPACE</span>
            <h1 class="section-title" style="margin-top:6px;">${escapeHtml(biz.company_name)}</h1>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.IntalentApp.navigate('post-project')">+ Post Enterprise Project</button>
            <button class="btn btn-outline" onclick="window.IntalentApp.navigate('pro-talent')">Discover Pro Talent</button>
          </div>
        </div>

        <div class="grid-2">
          <!-- Company Profile Editor -->
          <form id="biz-profile-form" class="card-panel" style="display:flex;flex-direction:column;gap:12px;">
            <h3 style="color:var(--brand-deep);">Company Profile & Algerian Tax Info (RC / NIF)</h3>
            <input type="text" name="company_name" class="input" placeholder="Company Legal Name (SPA / SARL)" value="${escapeHtml(biz.company_name)}" required>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <input type="text" name="industry" class="input" placeholder="Industry" value="${escapeHtml(biz.industry)}">
              <input type="text" name="company_size" class="input" placeholder="Company Size" value="${escapeHtml(biz.company_size)}">
            </div>
            <input type="text" name="rc_nif_number" class="input" placeholder="RC & NIF Numbers for DZD Invoicing" value="${escapeHtml(biz.rc_nif_number)}">
            <textarea name="description" class="textarea" placeholder="Company overview...">${escapeHtml(biz.description)}</textarea>
            <button type="submit" class="btn btn-primary">Save Company Profile</button>
          </form>

          <!-- Team Members & Permissions -->
          <div class="card-panel">
            <h3 style="color:var(--brand-deep);margin-bottom:12px;">Team Members & Hiring Permissions (${team.length})</h3>
            <form id="biz-team-form" style="display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px;margin-bottom:16px;">
              <input type="text" name="member_name" class="input" placeholder="Full Name" required>
              <input type="email" name="member_email" class="input" placeholder="Email" required>
              <select name="role_permission" class="select">
                <option value="Hiring Manager">Hiring Manager</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
              </select>
              <button type="submit" class="btn btn-primary btn-sm">Add</button>
            </form>
            ${team.map(m => `
              <div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid var(--border-color);font-size:0.9rem;">
                <div><strong>${escapeHtml(m.member_name)}</strong> (${escapeHtml(m.member_email)})</div>
                <span class="badge badge-status">${escapeHtml(m.role_permission)}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="card-panel">
          <h3 style="color:var(--brand-deep);margin-bottom:12px;">Active Enterprise Projects & Proposals (${myProjects.length})</h3>
          ${myProjects.map(p => `
            <div style="padding:12px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <strong>${escapeHtml(p.project_code)} — ${escapeHtml(p.title)}</strong>
                <div style="font-size:0.84rem;color:var(--text-secondary);">Budget: ${formatDZD(p.budget_min_dzd)} - ${formatDZD(p.budget_max_dzd)} • Proposals: ${p.proposal_count}</div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.navigate('projects')">Manage Proposals →</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    document.getElementById("biz-profile-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await api("/api/business/profile", { method: "POST", body: JSON.stringify(Object.fromEntries(fd.entries())) });
      showToast("Company profile saved!");
      window.IntalentPages["business-dashboard"](main, state);
    });

    document.getElementById("biz-team-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await api("/api/business/team", { method: "POST", body: JSON.stringify(Object.fromEntries(fd.entries())) });
        showToast("Team member added!");
        window.IntalentPages["business-dashboard"](main, state);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  // =========================================================================
  // 16. ADMINISTRATOR DASHBOARD (FULL PLATFORM CONTROL & AUDIT LOGS)
  // =========================================================================
  window.IntalentPages["admin-dashboard"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast } = App();
    if (!state.user || state.user.role !== "admin") {
      showToast("Administrator privileges required.", true);
      App().navigate("home");
      return;
    }

    const tab = state.params.tab || "overview";
    const data = await api("/api/admin/overview");

    main.innerHTML = `
      <div class="container dashboard-shell">
        <aside class="dashboard-sidebar">
          <div style="padding:8px 12px 16px;border-bottom:1px solid var(--border-color);margin-bottom:12px;">
            <span class="badge badge-pro">PLATFORM ADMIN</span>
            <div style="font-weight:800;color:var(--brand-deep);margin-top:6px;">${escapeHtml(state.user.full_name)}</div>
          </div>
          <div class="sidebar-menu-item ${tab === 'overview' ? 'active' : ''}" onclick="window.IntalentApp.navigate('admin-dashboard?tab=overview')">📊 Platform Statistics & Users</div>
          <div class="sidebar-menu-item ${tab === 'services' ? 'active' : ''}" onclick="window.IntalentApp.navigate('admin-dashboard?tab=services')">🛡 Service Moderation</div>
          <div class="sidebar-menu-item ${tab === 'categories' ? 'active' : ''}" onclick="window.IntalentApp.navigate('admin-dashboard?tab=categories')">🗂 Categories & Skills</div>
          <div class="sidebar-menu-item ${tab === 'pro' ? 'active' : ''}" onclick="window.IntalentApp.navigate('admin-dashboard?tab=pro')">✦ Pro Applications (${data.pro_applications.filter(a => a.status === 'pending').length})</div>
          <div class="sidebar-menu-item ${tab === 'reports' ? 'active' : ''}" onclick="window.IntalentApp.navigate('admin-dashboard?tab=reports')">⚑ Reports, Disputes & Support</div>
          <div class="sidebar-menu-item ${tab === 'settings' ? 'active' : ''}" onclick="window.IntalentApp.navigate('admin-dashboard?tab=settings')">⚙ Commissions, Banners & Settings</div>
          <div class="sidebar-menu-item ${tab === 'audit' ? 'active' : ''}" onclick="window.IntalentApp.navigate('admin-dashboard?tab=audit')">📜 Security Audit Logs</div>
        </aside>

        <div>
          <div class="stat-cards-grid">
            <div class="stat-card"><div class="stat-card-label">Total Users</div><div class="stat-card-value">${data.stats.total_users}</div></div>
            <div class="stat-card"><div class="stat-card-label">Total Services</div><div class="stat-card-value">${data.stats.total_services}</div></div>
            <div class="stat-card"><div class="stat-card-label">Total Orders</div><div class="stat-card-value">${data.stats.total_orders}</div></div>
            <div class="stat-card"><div class="stat-card-label">Gross GMV</div><div class="stat-card-value">${formatDZD(data.stats.gmv_dzd)}</div></div>
            <div class="stat-card"><div class="stat-card-label">Platform Revenue</div><div class="stat-card-value">${formatDZD(data.stats.platform_revenue_dzd)}</div></div>
          </div>

          ${tab === "overview" ? `
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:14px;">User Management (Clients, Freelancers, Businesses)</h3>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Pro</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    ${data.users.map(u => `
                      <tr>
                        <td>#${u.id}</td>
                        <td><strong>${escapeHtml(u.full_name)}</strong> ${u.is_demo ? `<span class="badge badge-demo">Demo</span>` : ""}</td>
                        <td>${escapeHtml(u.email)}</td>
                        <td>${escapeHtml(u.role)}</td>
                        <td>${u.is_pro ? "✦ Pro" : "-"}</td>
                        <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">${escapeHtml(u.status)}</span></td>
                        <td>
                          ${u.role !== "admin" ? `
                            <button class="btn btn-outline btn-sm admin-user-toggle" data-uid="${u.id}" data-status="${u.status === 'active' ? 'suspended' : 'active'}">
                              ${u.status === 'active' ? 'Suspend' : 'Restore'}
                            </button>
                          ` : ""}
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ""}

          ${tab === "services" ? `
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:14px;">Service Listings Moderation & Featured Placement</h3>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>ID</th><th>Title</th><th>Freelancer</th><th>Price</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
                  <tbody>
                    ${data.services.map(s => `
                      <tr>
                        <td>#${s.id}</td>
                        <td><strong>${escapeHtml(s.title)}</strong></td>
                        <td>${escapeHtml(s.freelancer_name)}</td>
                        <td>${formatDZD(s.starting_price_dzd)}</td>
                        <td><span class="badge badge-status">${escapeHtml(s.status)}</span></td>
                        <td>${s.is_featured ? "★ Featured" : "-"}</td>
                        <td style="display:flex;gap:6px;">
                          <button class="btn btn-outline btn-sm admin-svc-mod" data-id="${s.id}" data-status="approved" data-feat="${s.is_featured ? 0 : 1}">
                            ${s.is_featured ? "Unfeature" : "Feature"}
                          </button>
                          <button class="btn btn-danger btn-sm admin-svc-mod" data-id="${s.id}" data-status="${s.status === 'approved' ? 'rejected' : 'approved'}" data-feat="${s.is_featured}">
                            ${s.status === 'approved' ? "Reject" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ""}

          ${tab === "categories" ? `
            <div class="grid-2">
              <form id="admin-cat-form" class="card-panel" style="display:flex;flex-direction:column;gap:12px;">
                <h3 style="color:var(--brand-deep);">Create New Marketplace Category</h3>
                <input type="text" name="name" class="input" placeholder="Category Name (English)" required>
                <input type="text" name="name_fr" class="input" placeholder="Nom de la catégorie (Français)" required>
                <input type="text" name="name_ar" class="input" placeholder="اسم التصنيف (العربية)" required>
                <textarea name="description" class="textarea" placeholder="Category description..." required></textarea>
                <button type="submit" class="btn btn-primary">Add Category</button>
              </form>

              <form id="admin-skill-form" class="card-panel" style="display:flex;flex-direction:column;gap:12px;">
                <h3 style="color:var(--brand-deep);">Add Skill to Global Catalog</h3>
                <input type="text" name="name" class="input" placeholder="Skill Name (e.g. Kubernetes, Laravel)" required>
                <select name="category_slug" class="select">
                  ${state.categories.map(c => `<option value="${escapeHtml(c.slug)}">${escapeHtml(c.name)}</option>`).join("")}
                </select>
                <button type="submit" class="btn btn-primary">Add Skill</button>
              </form>
            </div>
          ` : ""}

          ${tab === "pro" ? `
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:14px;">Intalent Pro Freelancer Verification Queue</h3>
              ${data.pro_applications.map(a => `
                <div style="padding:14px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                  <div>
                    <strong>${escapeHtml(a.full_name)} (@${escapeHtml(a.username)})</strong> — Specialty: <strong>${escapeHtml(a.specialty)}</strong> (${a.years_experience} yrs)
                    <p style="font-size:0.88rem;color:var(--text-secondary);margin-top:4px;">${escapeHtml(a.motivation)}</p>
                  </div>
                  <div style="display:flex;gap:8px;align-items:center;">
                    <span class="badge badge-status">${escapeHtml(a.status.toUpperCase())}</span>
                    ${a.status === "pending" ? `
                      <button class="btn btn-primary btn-sm admin-pro-btn" data-id="${a.id}" data-status="approved">Approve Pro ✦</button>
                      <button class="btn btn-danger btn-sm admin-pro-btn" data-id="${a.id}" data-status="rejected">Reject</button>
                    ` : ""}
                  </div>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${tab === "reports" ? `
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:12px;">Reports & Order Disputes (${data.reports.length})</h3>
              ${data.reports.map(r => `
                <div style="padding:12px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <strong>[${escapeHtml(r.target_type.toUpperCase())} #${r.target_id}] ${escapeHtml(r.reason)}</strong>
                    <div style="font-size:0.86rem;color:var(--text-secondary);">${escapeHtml(r.details)} (Reported by ${escapeHtml(r.reporter_name)})</div>
                  </div>
                  <button class="btn btn-outline btn-sm admin-resolve-report" data-id="${r.id}">${r.status === 'resolved' ? 'Resolved ✓' : 'Mark Resolved'}</button>
                </div>
              `).join("")}
            </div>
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:12px;">Support Tickets (${data.tickets.length})</h3>
              ${data.tickets.map(t => `
                <div style="padding:12px;border-bottom:1px solid var(--border-color);">
                  <strong>#${t.id} — ${escapeHtml(t.subject)}</strong> (${escapeHtml(t.name)} &lt;${escapeHtml(t.email)}&gt;)
                  <p style="font-size:0.88rem;color:var(--text-secondary);margin-top:4px;">${escapeHtml(t.message)}</p>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${tab === "settings" ? `
            <form id="admin-settings-form" class="card-panel" style="display:flex;flex-direction:column;gap:14px;">
              <h3 style="color:var(--brand-deep);">Platform Commission & Announcement Settings</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Standard Commission Rate (%)</label>
                  <input type="number" name="commission_rate_pct" class="input" style="width:100%;" value="${escapeHtml(state.settings.commission_rate_pct || '10')}" required>
                </div>
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Pro Freelancer Commission Rate (%)</label>
                  <input type="number" name="pro_commission_rate_pct" class="input" style="width:100%;" value="${escapeHtml(state.settings.pro_commission_rate_pct || '5')}" required>
                </div>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Top Announcement Bar Text</label>
                <input type="text" name="announcement_bar" class="input" style="width:100%;" value="${escapeHtml(state.settings.announcement_bar || '')}" required>
              </div>
              <button type="submit" class="btn btn-primary">Save Platform Configuration</button>
            </form>
          ` : ""}

          ${tab === "audit" ? `
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:12px;">Security & Administrative Audit Logs</h3>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
                  <tbody>
                    ${data.audit_logs.map(l => `
                      <tr>
                        <td>${escapeHtml(l.created_at)}</td>
                        <td>${escapeHtml(l.actor_email || '')}</td>
                        <td><code>${escapeHtml(l.action)}</code></td>
                        <td>${escapeHtml(l.target_type)} #${escapeHtml(l.target_id)}</td>
                        <td>${escapeHtml(l.details)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ""}
        </div>
      </div>
    `;

    main.querySelectorAll(".admin-user-toggle").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api("/api/admin/user-status", {
          method: "POST",
          body: JSON.stringify({ user_id: Number(btn.getAttribute("data-uid")), status: btn.getAttribute("data-status") })
        });
        showToast("User status updated and recorded in audit log.");
        window.IntalentPages["admin-dashboard"](main, state);
      });
    });

    main.querySelectorAll(".admin-svc-mod").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api("/api/admin/service-moderation", {
          method: "POST",
          body: JSON.stringify({
            service_id: Number(btn.getAttribute("data-id")),
            status: btn.getAttribute("data-status"),
            is_featured: Number(btn.getAttribute("data-feat")) === 1
          })
        });
        showToast("Service moderation updated.");
        window.IntalentPages["admin-dashboard"](main, state);
      });
    });

    const catForm = document.getElementById("admin-cat-form");
    if (catForm) {
      catForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api("/api/admin/categories", { method: "POST", body: JSON.stringify(Object.fromEntries(fd.entries())) });
        await App().refreshBootstrap();
        showToast("New category created!");
        window.IntalentPages["admin-dashboard"](main, state);
      });
    }

    const skillForm = document.getElementById("admin-skill-form");
    if (skillForm) {
      skillForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api("/api/admin/skills", { method: "POST", body: JSON.stringify(Object.fromEntries(fd.entries())) });
        await App().refreshBootstrap();
        showToast("New skill added!");
        e.target.reset();
      });
    }

    main.querySelectorAll(".admin-pro-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api("/api/admin/pro-review", {
          method: "POST",
          body: JSON.stringify({ application_id: Number(btn.getAttribute("data-id")), status: btn.getAttribute("data-status") })
        });
        showToast("Pro application reviewed.");
        window.IntalentPages["admin-dashboard"](main, state);
      });
    });

    main.querySelectorAll(".admin-resolve-report").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api("/api/admin/resolve-report", {
          method: "POST",
          body: JSON.stringify({ report_id: Number(btn.getAttribute("data-id")), status: "resolved" })
        });
        showToast("Report marked as resolved.");
        window.IntalentPages["admin-dashboard"](main, state);
      });
    });

    const setForm = document.getElementById("admin-settings-form");
    if (setForm) {
      setForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api("/api/admin/settings", { method: "POST", body: JSON.stringify({ settings: Object.fromEntries(fd.entries()) }) });
        await App().refreshBootstrap();
        showToast("Platform settings saved!");
        window.IntalentPages["admin-dashboard"](main, state);
      });
    }
  };
})();
