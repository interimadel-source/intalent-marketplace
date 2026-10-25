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
  // 13. CLIENT DASHBOARD — STITCH BENTO 3D (ee2948f9f58c4cb4a98291d5b38168cd.html)
  // =========================================================================
  window.IntalentPages["client-dashboard"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, uploadFileInput } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }

    const tab = state.params.tab || "overview";
    const statusFilter = state.params.status || "all";
    const [ordersRes, projectsRes, favsRes] = await Promise.all([
      api("/api/orders"),
      api("/api/projects"),
      api("/api/favorites/details")
    ]);

    const myOrders = (ordersRes.orders || []).filter(o => o.client_id === state.user.id);
    const filteredOrders = myOrders.filter(o => statusFilter === "all" ? true : o.status === statusFilter);
    const myProjects = (projectsRes.projects || []).filter(p => p.client_id === state.user.id);
    const totalSpent = myOrders.reduce((acc, o) => acc + Number(o.total_dzd || 0), 0);
    const escrowActiveOrders = myOrders.filter(o => o.status !== "completed" && o.status !== "cancelled");
    const escrowAmount = escrowActiveOrders.reduce((acc, o) => acc + Number(o.total_dzd || 0), 0);

    main.innerHTML = `
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6">
        <!-- Top Stitch Bento Header & Navigation Pills -->
        <div class="bg-surface-container-lowest rounded-[28px] p-6 shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <img src="${escapeHtml(state.user.avatar_url)}" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-secondary/25 shrink-0" alt="${escapeHtml(state.user.full_name)}">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-extrabold uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-secondary"></span>
                Espace Client Algérie • ${escapeHtml(state.user.wilaya || "Alger")}
              </div>
              <h1 class="font-headline text-xl sm:text-2xl font-extrabold text-primary mt-0.5">${escapeHtml(state.user.full_name)}</h1>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="window.IntalentApp.navigate('client-dashboard?tab=overview')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'overview' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}">
              📊 Commandes &amp; Séquestre (${myOrders.length})
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('client-dashboard?tab=projects')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'projects' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}">
              📋 Mes Projets (${myProjects.length})
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('favorites')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold bg-surface-container-low text-on-surface hover:bg-surface-container transition-all">
              ♥ Favoris (${favsRes.services.length})
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('messages')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold bg-surface-container-low text-on-surface hover:bg-surface-container transition-all">
              💬 Messagerie
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('client-dashboard?tab=profile')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'profile' ? 'bg-primary-container text-tertiary-fixed shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}">
              ⚙ Profil
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('post-project')" class="px-4 py-2 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-headline text-xs font-extrabold shadow-[0_6px_16px_rgba(202,243,0,0.4)] hover:scale-[1.02] transition-all">
              + Publier un Projet
            </button>
          </div>
        </div>

        <!-- Stitch 4-Column Bento 3D KPI Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <!-- Metric 1: Total Volume -->
          <div class="p-6 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_28px_-6px_rgba(37,8,63,0.05)] border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Volume Commandé</span>
                <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">payments</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-primary">${formatDZD(totalSpent)}</div>
              <p class="text-xs text-on-surface-variant mt-1">Total investi sur vos projets Intalent</p>
            </div>
            <div class="pt-4 mt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs">
              <span class="text-on-surface-variant">Facturation DZD</span>
              <span class="font-bold text-secondary">TVA &amp; NIF inclus</span>
            </div>
          </div>

          <!-- Metric 2: Séquestre SATIM (Dark Bento Card from Stitch) -->
          <div class="p-6 rounded-[28px] bg-primary-container text-white shadow-[0_16px_36px_-8px_rgba(40,12,66,0.35)] relative overflow-hidden flex flex-col justify-between">
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-white/10 text-tertiary-fixed text-[11px] font-bold uppercase tracking-wider">Séquestre SATIM</span>
                <div class="w-10 h-10 rounded-2xl bg-tertiary-fixed text-primary-container flex items-center justify-center shadow-[0_4px_16px_rgba(202,243,0,0.4)]">
                  <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">lock</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-white">${formatDZD(escrowAmount)}</div>
              <div class="flex items-center gap-1.5 mt-1 text-xs text-white/80">
                <span class="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
                <span>${escrowActiveOrders.length} commande(s) sous séquestre actif</span>
              </div>
            </div>
            <div class="relative z-10 pt-3 mt-4 flex items-center justify-between bg-white/10 rounded-2xl p-2.5">
              <span class="text-[11px] text-white font-semibold">Garantie CIB &amp; Edahabia</span>
              <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed/20 text-tertiary-fixed text-[10px] font-extrabold">100% SÉCURISÉ</span>
            </div>
          </div>

          <!-- Metric 3: Commandes en cours & terminées -->
          <div class="p-6 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_28px_-6px_rgba(37,8,63,0.05)] border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Suivi Livraisons</span>
                <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">local_shipping</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-primary">${escrowActiveOrders.length} <span class="text-sm font-bold text-on-surface-variant">En cours</span></div>
              <p class="text-xs text-on-surface-variant mt-1">${myOrders.filter(o => o.status === 'completed').length} commande(s) validée(s) et terminée(s)</p>
            </div>
            <div class="pt-4 mt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs">
              <span class="text-on-surface-variant">À valider par vous :</span>
              <span class="font-extrabold text-secondary">${myOrders.filter(o => o.status === 'delivered').length} livrable(s)</span>
            </div>
          </div>

          <!-- Metric 4: Appels d'offres -->
          <div class="p-6 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_28px_-6px_rgba(37,8,63,0.05)] border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Appels d'Offres</span>
                <div class="w-10 h-10 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">assignment</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-primary">${myProjects.length} <span class="text-sm font-bold text-on-surface-variant">Briefs</span></div>
              <p class="text-xs text-on-surface-variant mt-1">Projets publiés aux freelances DZ</p>
            </div>
            <div class="pt-4 mt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs">
              <button type="button" onclick="window.IntalentApp.navigate('explore')" class="font-bold text-secondary hover:underline">Explorer le catalogue →</button>
            </div>
          </div>
        </div>

        ${tab === "overview" ? `
          <!-- Stitch Bento Orders List Section -->
          <div class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col gap-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed text-primary-container text-[11px] font-extrabold uppercase tracking-wider">Missions &amp; Commandes</span>
                <h3 class="font-headline text-xl font-extrabold text-primary mt-1">Vos Commandes &amp; Jalons Escrow</h3>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <select id="client-order-status-filter" class="px-3.5 py-2 bg-surface-container-low rounded-xl font-headline text-xs font-bold text-on-surface border border-outline-variant/20">
                  <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Toutes les commandes (${myOrders.length})</option>
                  <option value="in_progress" ${statusFilter === 'in_progress' ? 'selected' : ''}>En production (${myOrders.filter(o => o.status === 'in_progress').length})</option>
                  <option value="delivered" ${statusFilter === 'delivered' ? 'selected' : ''}>Livrables à valider (${myOrders.filter(o => o.status === 'delivered').length})</option>
                  <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>Terminées &amp; Payées (${myOrders.filter(o => o.status === 'completed').length})</option>
                </select>
                <button type="button" onclick="window.IntalentApp.navigate('explore')" class="px-4 py-2 rounded-xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all">
                  Commander un Service →
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              ${filteredOrders.length === 0 ? `
                <div class="p-8 rounded-2xl bg-surface-container-low text-center text-sm text-on-surface-variant">
                  Aucune commande dans cette catégorie.
                </div>
              ` : filteredOrders.map(o => `
                <div class="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-outline-variant/15">
                  <div class="flex items-start sm:items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl ${o.status === 'delivered' ? 'bg-tertiary-fixed text-primary-container' : 'bg-primary-container text-tertiary-fixed'} flex items-center justify-center shrink-0 shadow-sm">
                      <span class="material-symbols-outlined text-xl">${o.status === 'completed' ? 'verified' : o.status === 'delivered' ? 'inventory_2' : 'pending_actions'}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-headline text-xs font-extrabold text-secondary">#${escapeHtml(o.order_number)}</span>
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-900' : o.status === 'delivered' ? 'bg-tertiary-fixed text-primary-container' : 'bg-secondary-fixed text-secondary'}">
                          ${escapeHtml(o.status)}
                        </span>
                      </div>
                      <h4 class="font-headline text-base font-extrabold text-primary mt-0.5">${escapeHtml(o.service_title)}</h4>
                      <div class="text-xs text-on-surface-variant mt-1">
                        Freelance : <strong class="text-on-surface">${escapeHtml(o.freelancer_name)}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4">
                    <div class="sm:text-right">
                      <span class="font-headline text-lg font-extrabold text-primary">${formatDZD(o.total_dzd)}</span>
                      <div class="text-[11px] font-bold text-secondary">
                        ${o.status === 'delivered' ? 'Livrable prêt à valider' : o.status === 'completed' ? 'Séquestre libéré' : 'Fonds protégés SATIM'}
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" onclick="window.IntalentApp.navigate('order-detail?id=${o.id}')" class="px-4 py-2.5 rounded-xl ${o.status === 'delivered' ? 'bg-tertiary-fixed text-primary-container' : 'bg-primary-container text-tertiary-fixed'} font-headline text-xs font-extrabold hover:opacity-95 transition-all flex items-center gap-1.5 shadow-sm">
                        <span class="material-symbols-outlined text-sm">${o.status === 'delivered' ? 'check_circle' : 'receipt_long'}</span>
                        <span>${o.status === 'delivered' ? 'Examiner &amp; Valider →' : 'Gérer la Commande →'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>

            <!-- Stitch Security & Escrow Guarantee Footer Note -->
            <div class="p-4 rounded-2xl bg-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-primary-container text-tertiary-fixed flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">verified_user</span>
                </div>
                <p class="text-xs text-on-surface">
                  <strong class="font-bold text-primary">Conformité Loi 18-05 &amp; Garantie Escrow :</strong> Vos paiements DZD restent sécurisés sous séquestre jusqu'à votre validation de la livraison.
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-[11px] font-bold text-primary">SATIM / CIB</span>
                <span class="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-[11px] font-bold text-secondary">Edahabia</span>
              </div>
            </div>
          </div>
        ` : ""}

        ${tab === "projects" ? `
          <div class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 class="font-headline text-xl font-extrabold text-primary">Mes Appels d'Offres &amp; Projets Sur-Mesure</h3>
                <p class="text-xs text-on-surface-variant">Consultez les propositions des freelances algériens sur vos cahiers des charges.</p>
              </div>
              <button type="button" class="px-4 py-2.5 rounded-xl bg-tertiary-fixed text-primary-container font-headline text-xs font-extrabold shadow-sm" onclick="window.IntalentApp.navigate('post-project')">
                + Publier un Nouveau Projet
              </button>
            </div>
            ${myProjects.length === 0 ? `<p class="text-sm text-on-surface-variant">Aucun projet publié pour le moment.</p>` :
              myProjects.map(p => `
                <div class="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-extrabold text-secondary">${escapeHtml(p.project_code)}</span>
                      <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold uppercase">${escapeHtml(p.status)}</span>
                    </div>
                    <h4 class="font-headline text-base font-bold text-primary mt-0.5">${escapeHtml(p.title)}</h4>
                    <div class="text-xs text-on-surface-variant mt-1">Offres reçues : <strong>${p.proposal_count}</strong> • Budget : ${formatDZD(p.budget_min_dzd)} – ${formatDZD(p.budget_max_dzd)}</div>
                  </div>
                  <button type="button" class="px-4 py-2 rounded-xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all" onclick="window.IntalentApp.navigate('projects')">
                    Consulter les Offres (${p.proposal_count}) →
                  </button>
                </div>
              `).join("")
            }
          </div>
        ` : ""}

        ${tab === "profile" ? `
          <form id="client-profile-form" class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 space-y-5 max-w-3xl">
            <h3 class="font-headline text-xl font-extrabold text-primary">Paramètres du Profil Client</h3>
            <div>
              <label class="block text-xs font-bold text-primary mb-1.5">Nom Complet</label>
              <input type="text" name="full_name" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20" value="${escapeHtml(state.user.full_name)}" required>
            </div>
            <div>
              <label class="block text-xs font-bold text-primary mb-1.5">Titre / Entreprise</label>
              <input type="text" name="headline" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20" value="${escapeHtml(state.user.headline || '')}">
            </div>
            <div>
              <label class="block text-xs font-bold text-primary mb-1.5"> Présentation / Bio</label>
              <textarea name="bio" rows="4" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20">${escapeHtml(state.user.bio || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-primary mb-1.5">Photo de Profil</label>
              <input type="file" id="client-avatar-file" class="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20" accept="image/*">
            </div>
            <button type="submit" class="px-6 py-3 rounded-xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all shadow-sm">
              Enregistrer les Modifications
            </button>
          </form>
        ` : ""}
      </div>
    `;

    const statusSel = document.getElementById("client-order-status-filter");
    if (statusSel) {
      statusSel.addEventListener("change", () => {
        App().navigate("client-dashboard?tab=overview&status=" + encodeURIComponent(statusSel.value));
      });
    }

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
  // 14. FREELANCER DASHBOARD — STITCH BENTO 3D (ee2948f9f58c4cb4a98291d5b38168cd.html & 5d524dd4102d43d489ca342846c238ee.html)
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
    const activeOrders = incomingOrders.filter(o => o.status !== "completed" && o.status !== "cancelled");
    const escrowTotal = activeOrders.reduce((acc, o) => acc + Number(o.freelancer_net_dzd || o.total_dzd || 0), 0);
    const flProfile = flDetailRes.freelancer || state.user;

    main.innerHTML = `
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6">
        <!-- STITCH BENTO 3D TOP HEADER & NAVIGATION TABS -->
        <section class="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#280c42] via-[#3e2459] to-[#7627e0] p-6 sm:p-8 text-white shadow-[0_16px_36px_-8px_rgba(40,12,66,0.35)]">
          <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="flex items-start sm:items-center gap-4">
              <img src="${escapeHtml(state.user.avatar_url)}" class="w-16 h-16 rounded-2xl object-cover ring-2 ring-tertiary-fixed shrink-0" alt="${escapeHtml(state.user.full_name)}">
              <div class="space-y-1">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-tertiary-fixed">
                  <span class="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
                  Studio Freelance Bento 3D • ${escapeHtml(state.user.wilaya || "Alger")}, Algérie
                </div>
                <h2 class="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight">Salam, ${escapeHtml(state.user.full_name)} 👋</h2>
                <p class="text-white/80 text-xs sm:text-sm">
                  Vous avez <strong class="text-tertiary-fixed">${activeOrders.length} commande(s) active(s)</strong> et un solde disponible de <strong class="text-tertiary-fixed">${formatDZD(walletRes.balance_dzd)}</strong>.
                </p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=earnings')" class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs border border-white/15 transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-tertiary-fixed">account_balance_wallet</span>
                <span>Retirer mes gains (CCP / BaridiMob)</span>
              </button>
              <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')" class="px-5 py-2.5 rounded-2xl bg-tertiary-fixed text-primary-container font-headline font-extrabold text-xs shadow-[0_8px_20px_rgba(202,243,0,0.4)] hover:scale-[1.02] transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-base">add_circle</span>
                <span>Publier un Nouveau Service</span>
              </button>
            </div>
          </div>

          <!-- Horizontal Bento Tab Pills -->
          <div class="relative z-10 flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/15">
            <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=overview')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'overview' ? 'bg-tertiary-fixed text-primary-container shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}">
              📊 Analytics &amp; Commandes (${incomingOrders.length})
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=services')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'services' ? 'bg-tertiary-fixed text-primary-container shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}">
              💼 Mes Services (${myServices.length})
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'create-service' ? 'bg-tertiary-fixed text-primary-container shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}">
              + Créer un Service (Stitch Studio)
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=portfolio')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'portfolio' ? 'bg-tertiary-fixed text-primary-container shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}">
              🖼 Portfolio (${(flProfile.portfolio || []).length})
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=earnings')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'earnings' ? 'bg-tertiary-fixed text-primary-container shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}">
              💰 Revenus &amp; Retraits CCP
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=profile')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold transition-all ${tab === 'profile' ? 'bg-tertiary-fixed text-primary-container shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}">
              👤 Profil &amp; Compétences
            </button>
            <button type="button" onclick="window.IntalentApp.navigate('pro-upgrade')" class="px-4 py-2 rounded-xl font-headline text-xs font-extrabold bg-white/10 text-tertiary-fixed hover:bg-white/20 transition-all ml-auto">
              ✦ Intalent Pro
            </button>
          </div>
        </section>

        <!-- STITCH SCREEN (ee2948f9f58c4cb4a98291d5b38168cd.html): 4-COLUMN BENTO 3D KPI ROW -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <!-- Metric 1: Solde Disponible -->
          <div class="p-6 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_28px_-6px_rgba(37,8,63,0.05)] border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Solde Disponible</span>
                <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">payments</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-primary">${formatDZD(walletRes.balance_dzd)}</div>
              <div class="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
                <span class="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">+18.4%</span>
                <span>prêt pour virement CCP / RIB</span>
              </div>
            </div>
            <div class="pt-4 mt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs">
              <span class="text-on-surface-variant">Retrait instantané</span>
              <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=earnings')" class="font-bold text-secondary hover:underline">Retirer →</button>
            </div>
          </div>

          <!-- Metric 2: Séquestre SATIM (Dark Bento Card from Stitch) -->
          <div class="p-6 rounded-[28px] bg-primary-container text-white shadow-[0_16px_36px_-8px_rgba(40,12,66,0.35)] relative overflow-hidden flex flex-col justify-between">
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-white/10 text-tertiary-fixed text-[11px] font-bold uppercase tracking-wider">Séquestre SATIM</span>
                <div class="w-10 h-10 rounded-2xl bg-tertiary-fixed text-primary-container flex items-center justify-center shadow-[0_4px_16px_rgba(202,243,0,0.4)]">
                  <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">lock</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-white">${formatDZD(escrowTotal)}</div>
              <div class="flex items-center gap-1.5 mt-1 text-xs text-white/80">
                <span class="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
                <span>${activeOrders.length} commande(s) sous séquestre actif</span>
              </div>
            </div>
            <div class="relative z-10 pt-3 mt-4 flex items-center justify-between bg-white/10 rounded-2xl p-2.5">
              <span class="text-[11px] text-white font-semibold">Garantie CIB &amp; Edahabia</span>
              <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed/20 text-tertiary-fixed text-[10px] font-extrabold">100% SÉCURISÉ</span>
            </div>
          </div>

          <!-- Metric 3: Commandes Clientes & Satisfaction -->
          <div class="p-6 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_28px_-6px_rgba(37,8,63,0.05)] border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Commandes Clientes</span>
                <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">local_shipping</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-primary">${activeOrders.length} <span class="text-sm font-bold text-on-surface-variant">En cours</span></div>
              <div class="text-xs text-on-surface-variant mt-1">
                <strong class="text-secondary">${incomingOrders.filter(o => o.status === 'completed').length}</strong> mission(s) livrée(s) et clôturée(s)
              </div>
            </div>
            <div class="pt-4 mt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs">
              <span class="text-on-surface-variant">Note Globale</span>
              <span class="font-extrabold text-primary">★ ${Number(state.user.rating_avg || 4.9).toFixed(1)} (${state.user.review_count || 12} avis)</span>
            </div>
          </div>

          <!-- Metric 4: Services Publiés & Conversion -->
          <div class="p-6 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_28px_-6px_rgba(37,8,63,0.05)] border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Catalogue Actif</span>
                <div class="w-10 h-10 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">verified</span>
                </div>
              </div>
              <div class="font-headline text-2xl font-extrabold text-primary">${myServices.filter(s => s.status === 'approved').length} <span class="text-sm font-bold text-emerald-700">En ligne</span></div>
              <div class="text-xs text-on-surface-variant mt-1">Taux de livraison à temps : <strong>98.5%</strong></div>
            </div>
            <div class="pt-4 mt-4 border-t border-outline-variant/15">
              <div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div class="h-full bg-secondary rounded-full" style="width: 92%;"></div>
              </div>
            </div>
          </div>
        </div>

        ${tab === "overview" ? `
          <!-- STITCH MAIN BENTO CHART SECTION (8 Cols Analytical Chart + 4 Cols Services & Wilayas Breakdown) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- 8 Cols: Analytical Chart -->
            <div class="lg:col-span-8 p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col justify-between">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed shadow-[0_0_8px_rgba(202,243,0,1)]"></span>
                    <span class="text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant">Flux Financiers &amp; Volume</span>
                  </div>
                  <h3 class="font-headline text-lg sm:text-xl font-extrabold text-primary mt-1">Analyse des Commandes &amp; Revenus Encaissés (DZD)</h3>
                </div>
                <div class="flex items-center gap-3 text-xs font-bold text-on-surface-variant">
                  <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-secondary"></span> Revenus (DZD)</span>
                  <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-tertiary-fixed border border-primary"></span> Commandes</span>
                </div>
              </div>

              <div class="relative w-full h-64 flex flex-col justify-end">
                <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 240">
                  <defs>
                    <linearGradient id="areaGradFl" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#7627e0" stop-opacity="0.32"></stop>
                      <stop offset="100%" stop-color="#7627e0" stop-opacity="0.0"></stop>
                    </linearGradient>
                    <linearGradient id="barGradFl" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#caf300" stop-opacity="0.9"></stop>
                      <stop offset="100%" stop-color="#caf300" stop-opacity="0.25"></stop>
                    </linearGradient>
                  </defs>
                  <line stroke="#f3eaff" stroke-dasharray="4 4" stroke-width="1.5" x1="0" x2="800" y1="40" y2="40"></line>
                  <line stroke="#f3eaff" stroke-dasharray="4 4" stroke-width="1.5" x1="0" x2="800" y1="100" y2="100"></line>
                  <line stroke="#f3eaff" stroke-dasharray="4 4" stroke-width="1.5" x1="0" x2="800" y1="160" y2="160"></line>
                  <rect fill="url(#barGradFl)" height="55" rx="8" width="16" x="45" y="160"></rect>
                  <rect fill="url(#barGradFl)" height="80" rx="8" width="16" x="145" y="135"></rect>
                  <rect fill="url(#barGradFl)" height="105" rx="8" width="16" x="245" y="110"></rect>
                  <rect fill="url(#barGradFl)" height="125" rx="8" width="16" x="345" y="90"></rect>
                  <rect fill="url(#barGradFl)" height="150" rx="8" width="16" x="445" y="65"></rect>
                  <rect fill="url(#barGradFl)" height="175" rx="8" width="16" x="545" y="40"></rect>
                  <rect fill="url(#barGradFl)" height="160" rx="8" width="16" x="645" y="55"></rect>
                  <rect fill="url(#barGradFl)" height="185" rx="8" width="16" x="735" y="30"></rect>
                  <path d="M 53 175 C 150 155, 250 115, 353 105 C 450 95, 550 45, 653 60 L 743 35 L 743 215 L 53 215 Z" fill="url(#areaGradFl)"></path>
                  <path d="M 53 175 C 150 155, 250 115, 353 105 C 450 95, 550 45, 653 60 L 743 35" fill="none" stroke="#7627e0" stroke-linecap="round" stroke-width="4"></path>
                  <circle cx="553" cy="48" fill="#caf300" r="7" stroke="#280c42" stroke-width="3"></circle>
                  <circle cx="743" cy="35" fill="#7627e0" r="6" stroke="#ffffff" stroke-width="2.5"></circle>
                </svg>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 bg-surface-container-low rounded-2xl p-4">
                <div>
                  <div class="text-[11px] text-on-surface-variant uppercase font-bold">Panier Moyen</div>
                  <div class="font-headline text-base font-extrabold text-primary">48,500 DZD</div>
                </div>
                <div>
                  <div class="text-[11px] text-on-surface-variant uppercase font-bold">Séquestre SATIM</div>
                  <div class="font-headline text-base font-extrabold text-secondary">Instant (CIB / Edahabia)</div>
                </div>
                <div>
                  <div class="text-[11px] text-on-surface-variant uppercase font-bold">Taux de Satisfaction</div>
                  <div class="font-headline text-base font-extrabold text-primary">99.2% Positif</div>
                </div>
              </div>
            </div>

            <!-- 4 Cols: Services & Wilayas Breakdown -->
            <div class="lg:col-span-4 p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col justify-between">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant">Typologie &amp; Territoire</span>
                    <h3 class="font-headline text-lg font-extrabold text-primary">Services &amp; Wilayas</h3>
                  </div>
                  <span class="p-2 rounded-xl bg-surface-container text-secondary">
                    <span class="material-symbols-outlined text-lg">pie_chart</span>
                  </span>
                </div>

                <div class="flex flex-col gap-3">
                  <div class="p-3 rounded-xl bg-surface-container-low space-y-1.5">
                    <div class="flex items-center justify-between text-xs font-bold">
                      <span class="text-primary">16 • Alger (Hydra, Bab Ezzouar)</span>
                      <span class="text-secondary">52%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div class="h-full bg-secondary rounded-full" style="width: 52%;"></div>
                    </div>
                  </div>
                  <div class="p-3 rounded-xl bg-surface-container-low space-y-1.5">
                    <div class="flex items-center justify-between text-xs font-bold">
                      <span class="text-primary">31 • Oran (Akid Lotfi, Es Senia)</span>
                      <span class="text-primary">28%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div class="h-full bg-tertiary-fixed-dim rounded-full" style="width: 28%;"></div>
                    </div>
                  </div>
                  <div class="p-3 rounded-xl bg-surface-container-low space-y-1.5">
                    <div class="flex items-center justify-between text-xs font-bold">
                      <span class="text-primary">25/19 • Constantine &amp; Sétif</span>
                      <span class="text-primary">20%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div class="h-full bg-primary-container rounded-full" style="width: 20%;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" onclick="window.IntalentApp.navigate('projects')" class="mt-6 w-full py-3 px-4 rounded-xl bg-surface-container-low hover:bg-primary-container hover:text-tertiary-fixed text-primary font-headline text-xs font-extrabold transition-all flex items-center justify-center gap-2">
                <span>Explorer les Appels d'Offres DZ</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- STITCH BOTTOM BENTO SECTION: DERNIÈRES COMMANDES CLIENTS & JALONS ESCROW -->
          <div class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 flex flex-col gap-5">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed text-primary-container text-[11px] font-extrabold uppercase tracking-wider">Missions en Production</span>
                <h3 class="font-headline text-xl font-extrabold text-primary mt-1">Dernières Commandes Clients &amp; Jalons Escrow</h3>
              </div>
              <button type="button" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')" class="px-4 py-2 rounded-xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all">
                + Nouveau Service
              </button>
            </div>

            ${incomingOrders.length === 0 ? `
              <div class="p-8 rounded-2xl bg-surface-container-low text-sm text-on-surface-variant text-center">
                Aucune commande reçue pour le moment. Publiez un service ou répondez aux appels d'offres !
              </div>
            ` : `
              <div class="flex flex-col gap-4">
                ${incomingOrders.map(o => `
                  <div class="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-outline-variant/15">
                    <div class="flex items-start sm:items-center gap-4">
                      <div class="w-12 h-12 rounded-2xl bg-primary-container text-tertiary-fixed flex items-center justify-center shrink-0 shadow-sm">
                        <span class="material-symbols-outlined text-xl">${o.status === 'completed' ? 'check_circle' : 'inventory_2'}</span>
                      </div>
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-headline text-xs font-extrabold text-secondary">#${escapeHtml(o.order_number)}</span>
                          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${o.status === 'completed' ? 'bg-tertiary-fixed text-primary-container' : 'bg-secondary/10 text-secondary'}">
                            ${escapeHtml(o.status)}
                          </span>
                        </div>
                        <h4 class="font-headline text-base font-extrabold text-primary mt-0.5">${escapeHtml(o.service_title)}</h4>
                        <div class="text-xs text-on-surface-variant mt-1">
                          Client : <strong class="text-on-surface">${escapeHtml(o.client_name)}</strong>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4">
                      <div class="sm:text-right">
                        <span class="font-headline text-lg font-extrabold text-primary">${formatDZD(o.freelancer_net_dzd)}</span>
                        <div class="text-[11px] font-bold text-secondary">Gain Net Freelance (DZD)</div>
                      </div>
                      <button type="button" onclick="window.IntalentApp.navigate('order-detail?id=${o.id}')" class="px-4 py-2.5 rounded-xl bg-secondary text-white font-headline text-xs font-extrabold hover:bg-primary-container hover:text-tertiary-fixed transition-all flex items-center gap-1.5 shadow-sm">
                        <span class="material-symbols-outlined text-sm">upload_file</span>
                        <span>Livrer / Ouvrir →</span>
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        ` : ""}

        ${tab === "services" ? `
          <div class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 class="font-headline text-xl font-extrabold text-primary">Gérer Mes Services Publiés (${myServices.length})</h3>
                <p class="text-xs text-on-surface-variant">Activez, mettez en pause ou supprimez vos offres du catalogue Intalent.</p>
              </div>
              <button type="button" class="px-4 py-2.5 rounded-xl bg-tertiary-fixed text-primary-container font-headline text-xs font-extrabold shadow-sm" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')">
                + Créer un Nouveau Service
              </button>
            </div>
            ${myServices.length === 0 ? `<p class="text-sm text-on-surface-variant">Vous n'avez pas encore publié de service.</p>` :
              myServices.map(s => `
                <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-wrap items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <img src="${escapeHtml(s.cover_image)}" class="w-20 h-14 object-cover rounded-xl shrink-0">
                    <div>
                      <strong class="font-headline text-sm font-extrabold text-primary hover:text-secondary cursor-pointer block" onclick="window.IntalentApp.navigate('service?slug=${encodeURIComponent(s.slug)}')">${escapeHtml(s.title)}</strong>
                      <div class="text-xs text-on-surface-variant mt-0.5">À partir de <strong>${formatDZD(s.starting_price_dzd)}</strong> • Statut : <span class="uppercase font-bold text-secondary">${escapeHtml(s.status)}</span></div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/25 font-headline text-xs font-bold text-primary hover:bg-primary-container hover:text-tertiary-fixed transition-all toggle-svc-status" data-id="${s.id}" data-status="${s.status === 'approved' ? 'paused' : 'approved'}">
                      ${s.status === 'approved' ? 'Mettre en Pause' : 'Publier'}
                    </button>
                    <button type="button" class="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-600 hover:text-white font-headline text-xs font-bold transition-all delete-svc-btn" data-id="${s.id}">
                      Supprimer
                    </button>
                  </div>
                </div>
              `).join("")
            }
          </div>
        ` : ""}

        ${tab === "create-service" ? `
          <!-- STITCH SCREEN (5d524dd4102d43d489ca342846c238ee.html): CRÉER & PUBLIER UN SERVICE FREELANCE -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form id="create-service-form" class="lg:col-span-8 flex flex-col gap-6">
              <!-- Section 1: Informations Générales -->
              <div class="bg-surface-container-lowest rounded-[28px] p-6 sm:p-8 shadow-sm border border-outline-variant/15 space-y-5">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-[11px] uppercase tracking-wider font-extrabold text-secondary">Étape 01 • Base Fondamentale</span>
                    <h3 class="font-headline text-xl font-extrabold text-primary">Informations Générales du Service</h3>
                  </div>
                  <span class="material-symbols-outlined text-2xl text-secondary">auto_stories</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-primary mb-1.5">Titre du service (« Je vais... ») *</label>
                  <input type="text" name="title" class="w-full px-4 py-3.5 rounded-2xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20 focus:ring-2 focus:ring-secondary/40 outline-none" placeholder="Ex: Je vais développer une application web e-commerce avec paiement CIB / Edahabia..." required>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-primary mb-1.5">Catégorie principale *</label>
                    <select name="category_id" class="w-full px-4 py-3.5 rounded-2xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20 outline-none" required>
                      ${state.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-primary mb-1.5">Compétences &amp; Tags (séparés par virgule) *</label>
                    <input type="text" name="skills_csv" class="w-full px-4 py-3.5 rounded-2xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20 outline-none" placeholder="React, Python, SATIM API, UI/UX 3D" required>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="text-xs font-bold text-primary">Description détaillée de l'offre *</label>
                    <button type="button" id="ai-write-svc-btn" class="px-3 py-1.5 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white font-headline text-xs font-extrabold transition-all flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">magic_button</span>
                      <span>✨ Assistance IA INTALENT</span>
                    </button>
                  </div>
                  <textarea name="description" id="svc-desc-textarea" rows="6" class="w-full p-4 rounded-2xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20 outline-none" placeholder="Décrivez clairement les livrables, les étapes de collaboration et vos garanties..." required></textarea>
                </div>
              </div>

              <!-- Section 2: Galerie & Médias -->
              <div class="bg-surface-container-lowest rounded-[28px] p-6 sm:p-8 shadow-sm border border-outline-variant/15 space-y-4">
                <div>
                  <span class="text-[11px] uppercase tracking-wider font-extrabold text-secondary">Étape 02 • Attractivité Visuelle</span>
                  <h3 class="font-headline text-xl font-extrabold text-primary">Galerie &amp; Couverture Principale</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-primary mb-1.5">Téléverser une image de couverture</label>
                    <input type="file" id="svc-cover-file" class="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20" accept="image/*">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-primary mb-1.5">Ou URL de l'image de couverture</label>
                    <input type="text" name="cover_url" class="w-full px-4 py-3 rounded-2xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/20" value="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80">
                  </div>
                </div>
              </div>

              <!-- Section 3: Tarification 3 Forfaits (DZD) -->
              <div class="bg-surface-container-lowest rounded-[28px] p-6 sm:p-8 shadow-sm border border-outline-variant/15 space-y-5">
                <div>
                  <span class="text-[11px] uppercase tracking-wider font-extrabold text-secondary">Étape 03 • Conditions Commerciales DZD</span>
                  <h3 class="font-headline text-xl font-extrabold text-primary">Tarification en 3 Forfaits (Dinar Algérien)</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-2.5">
                    <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-extrabold uppercase">Forfait Basic</span>
                    <input type="text" name="basic_name" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs font-bold" value="Starter Package" required>
                    <input type="text" name="basic_desc" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs" value="Livrable essentiel avec fichiers sources." required>
                    <div>
                      <label class="block text-[11px] font-bold text-on-surface-variant">Prix (DZD)</label>
                      <input type="number" name="basic_price" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest font-headline font-extrabold text-sm" value="15000" required>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-on-surface-variant">Délai (Jours)</label>
                      <input type="number" name="basic_days" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs font-bold" value="3" required>
                    </div>
                  </div>

                  <div class="p-4 rounded-2xl bg-secondary-fixed/40 border-2 border-secondary space-y-2.5">
                    <span class="px-2.5 py-0.5 rounded-full bg-secondary text-white text-[11px] font-extrabold uppercase">Forfait Standard</span>
                    <input type="text" name="std_name" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs font-bold" value="Professional Package" required>
                    <input type="text" name="std_desc" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs" value="Solution complète avec révisions prioritaires." required>
                    <div>
                      <label class="block text-[11px] font-bold text-on-surface-variant">Prix (DZD)</label>
                      <input type="number" name="std_price" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest font-headline font-extrabold text-sm" value="35000" required>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-on-surface-variant">Délai (Jours)</label>
                      <input type="number" name="std_days" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs font-bold" value="6" required>
                    </div>
                  </div>

                  <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-2.5">
                    <span class="px-2.5 py-0.5 rounded-full bg-primary-container text-tertiary-fixed text-[11px] font-extrabold uppercase">Forfait Premium</span>
                    <input type="text" name="prem_name" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs font-bold" value="Enterprise VIP Suite" required>
                    <input type="text" name="prem_desc" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs" value="Exécution intégrale + accompagnement VIP." required>
                    <div>
                      <label class="block text-[11px] font-bold text-on-surface-variant">Prix (DZD)</label>
                      <input type="number" name="prem_price" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest font-headline font-extrabold text-sm" value="75000" required>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-on-surface-variant">Délai (Jours)</label>
                      <input type="number" name="prem_days" class="w-full px-3 py-2 rounded-xl bg-surface-container-lowest text-xs font-bold" value="10" required>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-bold text-primary mb-1">Option Supplémentaire (Facultatif)</label>
                    <input type="text" name="extra_title" class="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-xs" placeholder="Ex: Livraison Express 24h">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-primary mb-1">Prix Option (DZD)</label>
                    <input type="number" name="extra_price" class="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-xs" placeholder="Ex: 8000">
                  </div>
                </div>

                <div class="pt-4 flex items-center justify-end">
                  <button type="submit" class="px-8 py-4 rounded-full bg-tertiary-fixed text-primary-container font-headline text-sm font-extrabold shadow-[0_10px_24px_-6px_rgba(202,243,0,0.55)] hover:scale-[1.02] transition-all flex items-center gap-2">
                    <span>Publier le Service sur le Marketplace</span>
                    <span class="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </form>

            <!-- Right 4 Cols: Stitch Live Marketplace Preview & Playbook -->
            <aside class="lg:col-span-4 flex flex-col gap-5">
              <div class="bg-surface-container-lowest rounded-[28px] p-6 shadow-md border border-outline-variant/15 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] uppercase tracking-wider font-extrabold text-primary flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Aperçu Marketplace
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">Bento 3D</span>
                </div>
                <div class="p-4 rounded-2xl bg-surface-container-low space-y-2">
                  <div class="flex items-center gap-2.5">
                    <img src="${escapeHtml(state.user.avatar_url)}" class="w-9 h-9 rounded-full object-cover">
                    <div>
                      <div class="font-headline font-bold text-xs text-primary">${escapeHtml(state.user.full_name)}</div>
                      <div class="text-[11px] text-on-surface-variant">${escapeHtml(state.user.wilaya || "Alger")} • Vérifié Intalent</div>
                    </div>
                  </div>
                  <p class="text-xs text-on-surface-variant leading-relaxed">
                    Votre service sera immédiatement indexé dans le moteur de recherche avec garantie Séquestre SATIM / CIB / Edahabia.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        ` : ""}

        ${tab === "portfolio" ? `
          <div class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 space-y-6">
            <h3 class="font-headline text-xl font-extrabold text-primary">Ajouter une Réalisation au Portfolio</h3>
            <form id="add-portfolio-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="title" class="px-4 py-3 rounded-xl bg-surface-container-low text-sm border border-outline-variant/20" placeholder="Titre du projet réalisé" required>
              <input type="text" name="category" class="px-4 py-3 rounded-xl bg-surface-container-low text-sm border border-outline-variant/20" placeholder="Catégorie (ex: Développement Web)" required>
              <textarea name="description" rows="3" class="md:col-span-2 px-4 py-3 rounded-xl bg-surface-container-low text-sm border border-outline-variant/20" placeholder="Décrivez le défi client et les résultats obtenus..." required></textarea>
              <input type="text" name="image_url" class="px-4 py-3 rounded-xl bg-surface-container-low text-sm border border-outline-variant/20" value="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" required>
              <button type="submit" class="px-6 py-3 rounded-xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all">
                + Ajouter au Portfolio
              </button>
            </form>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              ${(flProfile.portfolio || []).map(p => `
                <div class="rounded-2xl bg-surface-container-low overflow-hidden border border-outline-variant/15">
                  <img src="${escapeHtml(p.image_url)}" class="w-full h-40 object-cover">
                  <div class="p-4">
                    <strong class="font-headline text-sm font-bold text-primary block">${escapeHtml(p.title)}</strong>
                    <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(p.description)}</p>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        ${tab === "earnings" ? `
          <div class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 space-y-6">
            <div>
              <h3 class="font-headline text-xl font-extrabold text-primary">Demander un Retrait de Gains (DZD)</h3>
              <p class="text-xs text-on-surface-variant">Solde disponible : <strong>${formatDZD(walletRes.balance_dzd)}</strong> • Virement vers Algérie Poste (CCP / BaridiMob) ou RIB Bancaire.</p>
            </div>
            <form id="payout-form" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-surface-container-low p-5 rounded-2xl">
              <div>
                <label class="block text-xs font-bold text-primary mb-1">Montant (DZD)</label>
                <input type="number" name="amount_dzd" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-sm font-bold" placeholder="Ex: 20000" required>
              </div>
              <div>
                <label class="block text-xs font-bold text-primary mb-1">Méthode de retrait</label>
                <select name="method" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-sm font-bold">
                  <option value="CCP / BaridiMob">CCP / BaridiMob</option>
                  <option value="Bank RIB Wire Transfer">Virement Bancaire RIB</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-primary mb-1">Coordonnées CCP / RIP / RIB</label>
                <input type="text" name="account_details" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-sm" placeholder="CCP 00284910 Clé 45" required>
              </div>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-tertiary-fixed text-primary-container font-headline text-xs font-extrabold shadow-sm hover:scale-[1.02] transition-all">
                Demander le Retrait
              </button>
            </form>

            <div>
              <h4 class="font-headline text-base font-extrabold text-primary mb-3">Historique des Transactions &amp; Retraits</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr class="bg-surface-container-low text-on-surface-variant text-xs uppercase">
                      <th class="py-3 px-4 rounded-l-xl">Référence</th>
                      <th class="py-3 px-4">Type</th>
                      <th class="py-3 px-4">Montant</th>
                      <th class="py-3 px-4">Statut</th>
                      <th class="py-3 px-4 rounded-r-xl">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/15">
                    ${(walletRes.transactions || []).map(tx => `
                      <tr>
                        <td class="py-3 px-4 font-mono text-xs">${escapeHtml(tx.tx_reference)}</td>
                        <td class="py-3 px-4">${escapeHtml(tx.type)}</td>
                        <td class="py-3 px-4 font-headline font-bold text-primary">${formatDZD(tx.amount_dzd)}</td>
                        <td class="py-3 px-4"><span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">${escapeHtml(tx.status)}</span></td>
                        <td class="py-3 px-4 text-xs text-on-surface-variant">${escapeHtml(tx.description)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ` : ""}

        ${tab === "profile" ? `
          <form id="fl-profile-form" class="p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(37,8,63,0.06)] border border-outline-variant/15 space-y-5 max-w-3xl">
            <h3 class="font-headline text-xl font-extrabold text-primary">Profil Freelance, Compétences &amp; Disponibilité</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-primary mb-1">Nom Complet</label>
                <input type="text" name="full_name" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm" value="${escapeHtml(state.user.full_name)}" required>
              </div>
              <div>
                <label class="block text-xs font-bold text-primary mb-1">Taux Horaire Indicatif (DZD / h)</label>
                <input type="number" name="hourly_rate_dzd" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm font-bold" value="${state.user.hourly_rate_dzd || 2500}">
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-primary mb-1">Titre Professionnel</label>
              <input type="text" name="headline" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm" value="${escapeHtml(state.user.headline || '')}" required>
            </div>
            <div>
              <label class="block text-xs font-bold text-primary mb-1">Biographie &amp; Expérience</label>
              <textarea name="bio" rows="4" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm" required>${escapeHtml(state.user.bio || '')}</textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-primary mb-1">Compétences (séparées par virgule)</label>
                <input type="text" name="skills_csv" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm" value="${escapeHtml((flProfile.skills || []).map(s => s.skill_name).join(', '))}">
              </div>
              <div>
                <label class="block text-xs font-bold text-primary mb-1">Disponibilité</label>
                <select name="availability" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm font-bold">
                  <option value="available" ${state.user.availability === 'available' ? 'selected' : ''}>Disponible immédiatement</option>
                  <option value="busy" ${state.user.availability === 'busy' ? 'selected' : ''}>Occupé (Créneaux limités)</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-primary mb-1">Photo de Profil</label>
              <input type="file" id="fl-avatar-file" class="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm" accept="image/*">
            </div>
            <button type="submit" class="px-6 py-3 rounded-xl bg-primary-container text-tertiary-fixed font-headline text-xs font-extrabold hover:bg-secondary hover:text-white transition-all shadow-sm">
              Enregistrer le Profil Freelance
            </button>
          </form>
        ` : ""}
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
