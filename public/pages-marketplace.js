(function () {
  const App = () => window.IntalentApp;

  // =========================================================================
  // 7. FREELANCER DIRECTORY & PREMIUM PRO TALENT DISCOVERY
  // =========================================================================
  async function renderFreelancerDirectory(main, state, proOnlyDefault = false) {
    const { escapeHtml, formatDZD, api } = App();
    const proOnly = proOnlyDefault || state.params.pro_only === "true";
    const wilaya = state.params.wilaya || "";
    const q = state.params.q || "";

    const qs = new URLSearchParams();
    if (proOnly) qs.set("pro_only", "true");
    if (wilaya) qs.set("wilaya", wilaya);
    if (q) qs.set("q", q);

    const { freelancers } = await api("/api/freelancers?" + qs.toString());

    main.innerHTML = `
      <div class="container section">
        <div style="background:${proOnly ? 'linear-gradient(135deg,#25083F,#4A148C)' : 'var(--brand-pale)'};color:${proOnly ? '#FFF' : 'var(--text-main)'};padding:32px;border-radius:var(--radius-lg);margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
          <div>
            ${proOnly ? `<span class="badge badge-pro" style="margin-bottom:8px;">✦ VERIFIED PRO TALENT</span>` : ""}
            <h1 style="font-size:2rem;font-weight:800;">${proOnly ? "Intalent Pro — Vetted Algerian Specialists" : "Discover Top Algerian Freelancers"}</h1>
            <p style="opacity:0.86;max-width:650px;margin-top:6px;">
              ${proOnly ? "Every Intalent Pro freelancer has passed portfolio verification, technical review, and client delivery audits." : "Browse skilled independent professionals across all 58 Algerian Wilayas."}
            </p>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn ${proOnly ? 'btn-primary' : 'btn-deep'}" onclick="window.IntalentApp.navigate('pro-upgrade')">Apply for Intalent Pro →</button>
          </div>
        </div>

        <form id="fl-filter-form" class="filter-bar">
          <div class="filter-control" style="flex:1;">
            <label>Search Name or Headline</label>
            <input type="text" name="q" class="input" placeholder="e.g. Full-Stack, UI/UX, Marketing..." value="${escapeHtml(q)}">
          </div>
          <div class="filter-control">
            <label>Wilaya</label>
            <select name="wilaya" class="select">
              <option value="">All 58 Wilayas</option>
              ${state.wilayas.map(w => `<option value="${escapeHtml(w.name)}" ${wilaya === w.name ? 'selected' : ''}>${w.code} - ${escapeHtml(w.name)}</option>`).join("")}
            </select>
          </div>
          <div style="padding-top:16px;display:flex;gap:8px;">
            <button type="submit" class="btn btn-primary">Search Talent</button>
            <button type="button" class="btn btn-outline" onclick="window.IntalentApp.navigate('${proOnly ? 'pro-talent' : 'freelancers'}')">Reset</button>
          </div>
        </form>

        <div class="grid-3">
          ${freelancers.map(f => `
            <div class="card-panel" style="margin-bottom:0;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                  <img src="${escapeHtml(f.avatar_url)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--brand-violet);">
                  <div>
                    <h3 style="color:var(--brand-deep);cursor:pointer;" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">${escapeHtml(f.full_name)}</h3>
                    <div style="font-size:0.82rem;color:var(--text-secondary);">📍 ${escapeHtml(f.wilaya)} • ★ <strong>${Number(f.rating_avg || 5).toFixed(1)}</strong> (${f.review_count || 0})</div>
                    <div style="margin-top:4px;display:flex;gap:6px;">
                      ${f.is_pro ? `<span class="badge badge-pro">✦ PRO</span>` : ""}
                      ${f.is_verified ? `<span class="badge badge-success">✓ Verified</span>` : ""}
                      ${f.is_demo ? `<span class="badge badge-demo">Demo</span>` : ""}
                    </div>
                  </div>
                </div>
                <p style="font-weight:700;color:var(--brand-deep);margin-bottom:8px;">${escapeHtml(f.headline)}</p>
                <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:14px;">${escapeHtml(f.bio)}</p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
                  ${(f.skills || []).map(s => `<span class="badge badge-status">${escapeHtml(s.skill_name)}</span>`).join("")}
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:12px;">
                <span style="font-size:0.84rem;font-weight:700;color:var(--brand-deep);">${formatDZD(f.hourly_rate_dzd || 2500)} / hr</span>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.toggleFavorite('freelancer', ${f.id})">♥</button>
                  <button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">View Profile →</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    document.getElementById("fl-filter-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const next = new URLSearchParams();
      if (proOnly) next.set("pro_only", "true");
      if (fd.get("q")) next.set("q", fd.get("q"));
      if (fd.get("wilaya")) next.set("wilaya", fd.get("wilaya"));
      App().navigate((proOnly ? "pro-talent?" : "freelancers?") + next.toString());
    });
  }

  window.IntalentPages["freelancers"] = (main, state) => renderFreelancerDirectory(main, state, false);
  window.IntalentPages["pro-talent"] = (main, state) => renderFreelancerDirectory(main, state, true);

  // =========================================================================
  // 8. INDIVIDUAL FREELANCER PROFILE, PORTFOLIO & REVIEWS
  // =========================================================================
  window.IntalentPages["freelancer"] = async function (main, state) {
    const { escapeHtml, formatDZD, renderServiceCard, api } = App();
    const ident = state.params.username || state.params.id;
    const { freelancer: f } = await api("/api/freelancers/" + encodeURIComponent(ident));
    let langs = [];
    try { langs = JSON.parse(f.languages || "[]"); } catch (_) {}

    main.innerHTML = `
      <div class="container section">
        <div class="card-panel" style="background:linear-gradient(135deg,#25083F 0%,#2B0B45 100%);color:#FFF;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;">
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
              <img src="${escapeHtml(f.avatar_url)}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid var(--brand-lavender);">
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h1 style="font-size:1.85rem;font-weight:800;">${escapeHtml(f.full_name)}</h1>
                  ${f.is_pro ? `<span class="badge badge-pro">✦ INTALENT PRO</span>` : ""}
                  ${f.is_verified ? `<span class="badge badge-success">✓ Verified</span>` : ""}
                </div>
                <p style="color:var(--brand-lavender);font-size:1.05rem;font-weight:600;margin:4px 0;">${escapeHtml(f.headline)}</p>
                <div style="font-size:0.88rem;color:rgba(255,255,255,0.8);">
                  📍 ${escapeHtml(f.wilaya)} • 🗣 ${escapeHtml(langs.join(", "))} • Availability: <strong>${escapeHtml(f.availability || "available")}</strong>
                </div>
              </div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-primary" onclick="window.IntalentApp.openContactModal(${f.id}, '${escapeHtml(f.full_name)}')">💬 Contact ${escapeHtml(f.full_name)}</button>
              <button class="btn btn-outline" style="background:rgba(255,255,255,0.1);color:#FFF;border-color:rgba(255,255,255,0.3);" onclick="window.IntalentApp.toggleFavorite('freelancer', ${f.id})">♥ Save Talent</button>
              <button class="btn btn-outline btn-sm" style="background:transparent;color:#FFF;border-color:rgba(255,255,255,0.25);" onclick="window.IntalentApp.openReportModal('user', ${f.id}, 'Freelancer Profile')">⚑ Report</button>
            </div>
          </div>
        </div>

        <div class="detail-layout">
          <div>
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:10px;">Biography & Expertise</h3>
              <p style="white-space:pre-line;margin-bottom:16px;">${escapeHtml(f.bio)}</p>
              <h4 style="font-size:0.82rem;text-transform:uppercase;color:var(--text-secondary);margin-bottom:8px;">Verified Skills</h4>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${(f.skills || []).map(s => `<span class="badge badge-status">${escapeHtml(s.skill_name)} (${escapeHtml(s.level)})</span>`).join("")}
              </div>
            </div>

            <h2 class="section-title" style="margin:28px 0 16px;">Active Services by ${escapeHtml(f.full_name)} (${(f.services || []).length})</h2>
            <div class="grid-2" style="margin-bottom:32px;">
              ${(f.services || []).map(s => renderServiceCard(Object.assign({}, s, {
                freelancer_name: f.full_name,
                freelancer_username: f.username,
                freelancer_avatar: f.avatar_url,
                freelancer_wilaya: f.wilaya,
                freelancer_is_pro: f.is_pro,
                freelancer_is_verified: f.is_verified
              }))).join("")}
            </div>

            <h2 class="section-title" style="margin-bottom:16px;">Portfolio Gallery (${(f.portfolio || []).length})</h2>
            ${(f.portfolio || []).length === 0 ? `<div class="card-panel"><p style="color:var(--text-secondary);">No portfolio projects published yet.</p></div>` : `
              <div class="grid-2" style="margin-bottom:32px;">
                ${f.portfolio.map(p => `
                  <div class="card-panel" style="margin-bottom:0;">
                    <img src="${escapeHtml(p.image_url)}" style="width:100%;height:190px;object-fit:cover;border-radius:8px;margin-bottom:12px;">
                    <span class="badge badge-status" style="margin-bottom:6px;">${escapeHtml(p.category)}</span>
                    <h4 style="color:var(--brand-deep);margin-bottom:6px;">${escapeHtml(p.title)}</h4>
                    <p style="font-size:0.88rem;color:var(--text-secondary);">${escapeHtml(p.description)}</p>
                  </div>
                `).join("")}
              </div>
            `}

            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:14px;">Client Reviews (${(f.reviews || []).length})</h3>
              ${(f.reviews || []).length === 0 ? `<p style="color:var(--text-secondary);">No reviews yet.</p>` :
                f.reviews.map(r => `
                  <div style="padding:12px 0;border-bottom:1px solid var(--border-color);">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <strong>${escapeHtml(r.client_name)} <span style="font-weight:400;color:var(--text-secondary);">on ${escapeHtml(r.service_title)}</span></strong>
                      <span class="star-icon">${"★".repeat(r.rating)}</span>
                    </div>
                    <p style="font-size:0.9rem;">${escapeHtml(r.comment)}</p>
                  </div>
                `).join("")
              }
            </div>
          </div>

          <div>
            <div class="card-panel">
              <h3 style="color:var(--brand-deep);margin-bottom:12px;">Quick Facts</h3>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <span style="color:var(--text-secondary);">Hourly Rate</span>
                <strong>${formatDZD(f.hourly_rate_dzd || 2500)}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <span style="color:var(--text-secondary);">Wilaya</span>
                <strong>${escapeHtml(f.wilaya)}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;">
                <span style="color:var(--text-secondary);">Tier Status</span>
                <strong>${f.is_pro ? "Intalent Pro ✦" : "Standard Verified"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // =========================================================================
  // 9. CUSTOM PROJECT REQUESTS & PROPOSALS (MARKETPLACE BRIEFS)
  // =========================================================================
  window.IntalentPages["projects"] = async function (main, state) {
    const { escapeHtml, formatDZD, api, showToast, openModal, closeModal } = App();
    const { projects } = await api("/api/projects");

    main.innerHTML = `
      <div class="container section">
        <div class="section-header">
          <div>
            <h1 class="section-title">Custom Project Briefs & Proposals</h1>
            <p class="section-subtitle">Clients and businesses post custom scopes in DZD; verified freelancers submit tailored proposals.</p>
          </div>
          <button class="btn btn-primary" onclick="window.IntalentApp.navigate('post-project')">+ Post a Project Brief</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px;">
          ${projects.map(p => {
            let skills = [];
            try { skills = JSON.parse(p.skills_required || "[]"); } catch (_) {}
            const isOwner = state.user && (state.user.id === p.client_id || state.user.role === "admin");

            return `
              <div class="card-panel" style="margin-bottom:0;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
                  <div style="flex:1;">
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
                      <span class="badge badge-pro">${escapeHtml(p.project_code)}</span>
                      <span class="badge badge-status">${escapeHtml(p.category_name)}</span>
                      <span class="badge ${p.status === 'open' ? 'badge-success' : 'badge-warning'}">${escapeHtml(p.status.toUpperCase())}</span>
                    </div>
                    <h3 style="color:var(--brand-deep);font-size:1.25rem;margin-bottom:8px;">${escapeHtml(p.title)}</h3>
                    <p style="color:var(--text-main);margin-bottom:12px;">${escapeHtml(p.description)}</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                      ${skills.map(sk => `<span class="badge badge-status">${escapeHtml(sk)}</span>`).join("")}
                    </div>
                    <div style="font-size:0.84rem;color:var(--text-secondary);">
                      Posted by <strong>${escapeHtml(p.client_name)}</strong> (${escapeHtml(p.client_wilaya)}) • Deadline: <strong>${p.deadline_days} days</strong> • Experience: <strong>${escapeHtml(p.experience_level)}</strong> • Proposals: <strong>${p.proposal_count}</strong>
                    </div>
                  </div>
                  <div style="text-align:right;min-width:210px;">
                    <div style="font-size:0.76rem;text-transform:uppercase;color:var(--text-secondary);font-weight:700;">Budget Range</div>
                    <div style="font-size:1.2rem;font-weight:800;color:var(--brand-deep);margin-bottom:12px;">
                      ${formatDZD(p.budget_min_dzd)} – ${formatDZD(p.budget_max_dzd)}
                    </div>
                    ${p.status === "open" && !isOwner ? `
                      <button class="btn btn-primary btn-sm submit-proposal-trigger" data-pid="${p.id}" data-title="${escapeHtml(p.title)}">
                        ${p.my_proposal ? "Proposal Submitted ✓" : "Submit Proposal →"}
                      </button>
                    ` : ""}
                  </div>
                </div>

                ${isOwner && (p.proposals || []).length > 0 ? `
                  <div style="margin-top:18px;border-top:1px solid var(--border-color);padding-top:14px;">
                    <h4 style="color:var(--brand-deep);margin-bottom:10px;">Received Freelancer Proposals (${p.proposals.length})</h4>
                    ${p.proposals.map(pr => `
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--brand-pale);border-radius:8px;margin-bottom:8px;gap:12px;flex-wrap:wrap;">
                        <div>
                          <strong>${escapeHtml(pr.freelancer_name)}</strong> ${pr.freelancer_is_pro ? `<span class="badge badge-pro">PRO</span>` : ""}
                          — Bid: <strong style="color:var(--brand-violet);">${formatDZD(pr.bid_amount_dzd)}</strong> in ${pr.delivery_days} days
                          <p style="font-size:0.88rem;margin-top:4px;">${escapeHtml(pr.cover_letter)}</p>
                        </div>
                        ${p.status === "open" && pr.status === "pending" ? `
                          <button class="btn btn-primary btn-sm accept-proposal-btn" data-propid="${pr.id}">Accept & Hire →</button>
                        ` : `<span class="badge badge-status">${escapeHtml(pr.status.toUpperCase())}</span>`}
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    main.querySelectorAll(".submit-proposal-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!state.user) {
          showToast("Please sign in as a freelancer to submit a proposal.", true);
          App().navigate("login");
          return;
        }
        const pid = btn.getAttribute("data-pid");
        const ptitle = btn.getAttribute("data-title");
        openModal(`
          <h3 style="color:var(--brand-deep);margin-bottom:6px;">Submit Proposal</h3>
          <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:14px;">Project: <strong>${escapeHtml(ptitle)}</strong></p>
          <form id="proposal-modal-form" style="display:flex;flex-direction:column;gap:12px;">
            <div>
              <label style="font-size:0.8rem;font-weight:700;">Your Bid Amount (DZD)</label>
              <input type="number" name="bid_amount_dzd" class="input" style="width:100%;" placeholder="e.g. 45000" required>
            </div>
            <div>
              <label style="font-size:0.8rem;font-weight:700;">Estimated Delivery (Days)</label>
              <input type="number" name="delivery_days" class="input" style="width:100%;" value="7" required>
            </div>
            <div>
              <label style="font-size:0.8rem;font-weight:700;">Proposal & Execution Plan</label>
              <textarea name="cover_letter" class="textarea" placeholder="Explain your relevant experience, milestones, and approach..." required></textarea>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:10px;">
              <button type="button" class="btn btn-outline" onclick="window.IntalentApp.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Send Proposal</button>
            </div>
          </form>
        `);
        document.getElementById("proposal-modal-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await api(`/api/projects/${pid}/proposals`, {
              method: "POST",
              body: JSON.stringify({
                bid_amount_dzd: Number(fd.get("bid_amount_dzd")),
                delivery_days: Number(fd.get("delivery_days")),
                cover_letter: fd.get("cover_letter")
              })
            });
            closeModal();
            showToast("Proposal submitted successfully!");
            window.IntalentPages["projects"](main, state);
          } catch (err) {
            showToast(err.message, true);
          }
        });
      });
    });

    main.querySelectorAll(".accept-proposal-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const propId = btn.getAttribute("data-propid");
        try {
          const res = await api(`/api/proposals/${propId}/accept`, { method: "POST", body: "{}" });
          showToast(`Proposal accepted! Order #${res.order_number} created.`);
          App().navigate(`order-detail?id=${res.order_id}`);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  };

  window.IntalentPages["post-project"] = async function (main, state) {
    const { escapeHtml, api, showToast } = App();
    if (!state.user) {
      showToast("Please sign in to post a project brief.", true);
      App().navigate("login");
      return;
    }

    main.innerHTML = `
      <div class="container section" style="max-width:820px;">
        <h1 class="section-title">Post a Custom Project Request</h1>
        <p class="section-subtitle" style="margin-bottom:24px;">Describe your requirements, timeline, and DZD budget to receive proposals from verified freelancers.</p>

        <form id="post-project-form" class="card-panel" style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <label style="font-size:0.82rem;font-weight:700;">Project Title</label>
            <input type="text" name="title" class="input" style="width:100%;" placeholder="e.g. Build a Mobile Delivery App in Flutter for Oran & Algiers" required>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="font-size:0.82rem;font-weight:700;">Category</label>
              <select name="category_id" class="select" style="width:100%;">
                ${state.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label style="font-size:0.82rem;font-weight:700;">Required Experience Level</label>
              <select name="experience_level" class="select" style="width:100%;">
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert / Pro Verified</option>
                <option value="Entry">Entry Level</option>
              </select>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <label style="font-size:0.82rem;font-weight:700;">Detailed Project Description & Deliverables</label>
              <button type="button" class="btn btn-outline btn-sm" id="ai-write-project-btn">✨ Write Brief with Gemini AI</button>
            </div>
            <textarea name="description" id="project-desc-textarea" class="textarea" placeholder="Include scope, technical preferences, and key milestones..." required></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
            <div>
              <label style="font-size:0.82rem;font-weight:700;">Min Budget (DZD)</label>
              <input type="number" name="budget_min_dzd" class="input" style="width:100%;" value="25000" required>
            </div>
            <div>
              <label style="font-size:0.82rem;font-weight:700;">Max Budget (DZD)</label>
              <input type="number" name="budget_max_dzd" class="input" style="width:100%;" value="80000" required>
            </div>
            <div>
              <label style="font-size:0.82rem;font-weight:700;">Target Deadline (Days)</label>
              <input type="number" name="deadline_days" class="input" style="width:100%;" value="14" required>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="font-size:0.82rem;font-weight:700;">Required Skills (comma-separated)</label>
              <input type="text" name="skills_csv" class="input" style="width:100%;" placeholder="React, Python, Figma, SEO">
            </div>
            <div>
              <label style="font-size:0.82rem;font-weight:700;">Wilaya Preference</label>
              <select name="wilaya_pref" class="select" style="width:100%;">
                <option value="All Algeria">All Algeria (Remote)</option>
                ${state.wilayas.map(w => `<option value="${w.code} - ${escapeHtml(w.name)}">${w.code} - ${escapeHtml(w.name)}</option>`).join("")}
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg">Publish Project Brief →</button>
        </form>
      </div>
    `;

    const aiBtn = document.getElementById("ai-write-project-btn");
    if (aiBtn) {
      aiBtn.addEventListener("click", async () => {
        const titleVal = document.querySelector("#post-project-form input[name='title']").value.trim();
        if (!titleVal) {
          showToast("Enter a Project Title first so Gemini AI can write your brief.", true);
          return;
        }
        aiBtn.textContent = "✨ Generating with Gemini 3.8 Flash...";
        try {
          const res = await api("/api/ai/assist", {
            method: "POST",
            body: JSON.stringify({ mode: "project_brief", prompt: titleVal })
          });
          document.getElementById("project-desc-textarea").value = res.output_text || "";
          showToast("Project brief generated with Gemini 3.8 Flash!");
        } catch (err) {
          showToast(err.message, true);
        } finally {
          aiBtn.textContent = "✨ Write Brief with Gemini AI";
        }
      });
    }

    document.getElementById("post-project-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const skills = String(fd.get("skills_csv") || "").split(",").map(s => s.trim()).filter(Boolean);
      try {
        const res = await api("/api/projects", {
          method: "POST",
          body: JSON.stringify({
            title: fd.get("title"),
            category_id: Number(fd.get("category_id")),
            experience_level: fd.get("experience_level"),
            description: fd.get("description"),
            budget_min_dzd: Number(fd.get("budget_min_dzd")),
            budget_max_dzd: Number(fd.get("budget_max_dzd")),
            deadline_days: Number(fd.get("deadline_days")),
            skills_required: skills,
            wilaya_pref: fd.get("wilaya_pref")
          })
        });
        showToast(`Project ${res.project_code} published!`);
        App().navigate("projects");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  // =========================================================================
  // 10. AUTHENTICATION PAGES (LOGIN, REGISTER, FORGOT PASSWORD, OAUTH HONEST STATE)
  // =========================================================================
  window.IntalentPages["login"] = async function (main, state) {
    const { escapeHtml, api, showToast, getDashboardRouteForUser } = App();
    const gReady = state.oauth_status.google_configured;
    const fbReady = state.oauth_status.facebook_configured;

    main.innerHTML = `
      <div class="container section" style="max-width:520px;">
        <div class="card-panel">
          <div style="text-align:center;margin-bottom:20px;">
            <img src="/assets/logos/logo-dark.png" alt="Intalent" style="height:46px;margin-bottom:10px;">
            <h1 style="font-size:1.55rem;color:var(--brand-deep);">Sign In to Intalent</h1>
            <p style="color:var(--text-secondary);font-size:0.9rem;">Access your client, freelancer, business, or admin workspace.</p>
          </div>

          <form id="login-form" style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <label style="font-size:0.8rem;font-weight:700;">Email or Username</label>
              <input type="text" name="email" id="login-email" class="input" style="width:100%;" placeholder="you@intalent.dz" required>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;">
                <label style="font-size:0.8rem;font-weight:700;">Password</label>
                <a style="font-size:0.8rem;color:var(--brand-violet);" onclick="window.IntalentApp.navigate('forgot-password')">Forgot password?</a>
              </div>
              <input type="password" name="password" id="login-password" class="input" style="width:100%;" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Sign In</button>
          </form>

          <!-- Social OAuth Section -->
          <div style="margin:20px 0;border-top:1px solid var(--border-color);padding-top:16px;">
            <div style="font-size:0.78rem;text-transform:uppercase;color:var(--text-secondary);font-weight:700;text-align:center;margin-bottom:10px;">Social Sign-In (OAuth 2.0)</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.IntalentApp.handleOAuthClick('Google', ${gReady})">
                🌐 Google ${gReady ? '' : '(Setup Needed)'}
              </button>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.IntalentApp.handleOAuthClick('Facebook', ${fbReady})">
                📘 Facebook ${fbReady ? '' : '(Setup Needed)'}
              </button>
            </div>
          </div>

          <!-- Instant Demo Login Helpers for QA Testing -->
          <div style="background:var(--brand-pale);padding:14px;border-radius:var(--radius-sm);font-size:0.82rem;">
            <div style="font-weight:800;color:var(--brand-deep);margin-bottom:8px;">One-Click QA / Demo Account Fill:</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('login-email').value='client@intalent.dz';document.getElementById('login-password').value='Password123!';">Client</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('login-email').value='amine@intalent.dz';document.getElementById('login-password').value='Password123!';">Pro Freelancer</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('login-email').value='business@intalent.dz';document.getElementById('login-password').value='Password123!';">Business</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('login-email').value='admin@intalent.dz';document.getElementById('login-password').value='AdminPassword123!';">Admin</button>
            </div>
          </div>

          <p style="text-align:center;font-size:0.88rem;margin-top:16px;">
            New to Intalent? <a style="color:var(--brand-violet);font-weight:700;" onclick="window.IntalentApp.navigate('register')">Create an Account</a>
          </p>
        </div>
      </div>
    `;

    window.IntalentApp.handleOAuthClick = function (provider, configured) {
      if (!configured) {
        App().openModal(`
          <h3 style="color:var(--brand-deep);margin-bottom:8px;">${escapeHtml(provider)} OAuth 2.0 Configuration Required</h3>
          <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:12px;">
            Per security requirements, Intalent never fakes social sign-in when OAuth credentials are not present in the environment.
          </p>
          <div style="background:var(--brand-pale);padding:12px;border-radius:8px;font-family:monospace;font-size:0.82rem;margin-bottom:14px;">
            ${provider === 'Google' ? 'GOOGLE_CLIENT_ID=...<br>GOOGLE_CLIENT_SECRET=...' : 'FACEBOOK_APP_ID=...<br>FACEBOOK_APP_SECRET=...'}
          </div>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px;">Add these variables to your <code>.env</code> file as documented in <code>README.md</code>, or use email/password authentication now.</p>
          <button class="btn btn-primary" onclick="window.IntalentApp.closeModal()">Understood</button>
        `);
      }
    };

    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") })
        });
        localStorage.setItem("intalent_token", res.token);
        await App().refreshBootstrap();
        showToast(`Welcome back, ${res.user.full_name}!`);
        App().navigate(getDashboardRouteForUser());
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  window.IntalentPages["register"] = async function (main, state) {
    const { escapeHtml, api, showToast, getDashboardRouteForUser } = App();
    main.innerHTML = `
      <div class="container section" style="max-width:580px;">
        <div class="card-panel">
          <div style="text-align:center;margin-bottom:20px;">
            <img src="/assets/logos/logo-dark.png" alt="Intalent" style="height:44px;margin-bottom:8px;">
            <h1 style="font-size:1.55rem;color:var(--brand-deep);">Join Intalent Algeria</h1>
            <p style="color:var(--text-secondary);font-size:0.9rem;">Create your account as a Client, Freelancer, or Business.</p>
          </div>

          <form id="register-form" style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <label style="font-size:0.8rem;font-weight:700;">Select Primary Account Type</label>
              <select name="role" class="select" style="width:100%;" required>
                <option value="client">Client — Hire freelancers & purchase services</option>
                <option value="freelancer">Freelancer — Publish services & earn in DZD</option>
                <option value="business">Business — Manage company hiring, briefs & team</option>
              </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Full Name</label>
                <input type="text" name="full_name" class="input" style="width:100%;" placeholder="Karim Benali" required>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Username</label>
                <input type="text" name="username" class="input" style="width:100%;" placeholder="karim_dev" required>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Email Address</label>
                <input type="email" name="email" class="input" style="width:100%;" placeholder="karim@example.dz" required>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Wilaya</label>
                <select name="wilaya" class="select" style="width:100%;">
                  ${state.wilayas.map(w => `<option value="${w.code} - ${escapeHtml(w.name)}" ${w.code === '16' ? 'selected' : ''}>${w.code} - ${escapeHtml(w.name)}</option>`).join("")}
                </select>
              </div>
            </div>
            <div>
              <label style="font-size:0.8rem;font-weight:700;">Password (minimum 6 characters)</label>
              <input type="password" name="password" class="input" style="width:100%;" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Create My Account →</button>
          </form>
          <p style="text-align:center;font-size:0.88rem;margin-top:16px;">
            Already have an account? <a style="color:var(--brand-violet);font-weight:700;" onclick="window.IntalentApp.navigate('login')">Sign In</a>
          </p>
        </div>
      </div>
    `;

    document.getElementById("register-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            role: fd.get("role"),
            full_name: fd.get("full_name"),
            username: fd.get("username"),
            email: fd.get("email"),
            wilaya: fd.get("wilaya"),
            password: fd.get("password")
          })
        });
        localStorage.setItem("intalent_token", res.token);
        await App().refreshBootstrap();
        showToast("Account created and signed in!");
        App().navigate(getDashboardRouteForUser());
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  window.IntalentPages["forgot-password"] = async function (main) {
    const { api, showToast } = App();
    main.innerHTML = `
      <div class="container section" style="max-width:480px;">
        <div class="card-panel">
          <h2 style="color:var(--brand-deep);margin-bottom:8px;">Reset Your Password</h2>
          <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:16px;">Enter your registered email address to request a password reset link.</p>
          <form id="forgot-form" style="display:flex;flex-direction:column;gap:12px;">
            <input type="email" name="email" class="input" placeholder="you@intalent.dz" required>
            <button type="submit" class="btn btn-primary">Send Reset Instructions</button>
          </form>
        </div>
      </div>
    `;
    document.getElementById("forgot-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: fd.get("email") }) });
      showToast(res.message);
    });
  };

  // =========================================================================
  // 11. PUBLIC INFORMATIONAL, BUSINESS, PRO UPGRADE & SUPPORT PAGES
  // =========================================================================
  window.IntalentPages["business-solutions"] = async function (main) {
    main.innerHTML = `
      <div class="container section">
        <div style="background:linear-gradient(135deg,#25083F 0%,#461278 100%);color:#FFF;padding:48px;border-radius:var(--radius-lg);margin-bottom:36px;">
          <span class="badge badge-pro" style="margin-bottom:10px;">INTALENT BUSINESS SOLUTIONS</span>
          <h1 style="font-size:2.4rem;font-weight:800;margin-bottom:12px;">Scale Your Enterprise Engineering, Design & Marketing Teams in Algeria</h1>
          <p style="font-size:1.05rem;color:rgba(255,255,255,0.85);max-width:720px;margin-bottom:24px;">
            Dedicated talent shortlisting, multi-member corporate accounts, RC/NIF compliant DZD invoicing, and milestone-based project management.
          </p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-lg" onclick="window.IntalentApp.navigate('business-dashboard')">Open Business Workspace →</button>
            <button class="btn btn-outline btn-lg" style="background:transparent;color:#FFF;border-color:#FFF;" onclick="window.IntalentApp.navigate('post-project')">Post Enterprise Brief</button>
          </div>
        </div>
        <div class="grid-3">
          <div class="card-panel"><h3>1. Vetted Pro Squads</h3><p style="color:var(--text-secondary);margin-top:8px;">Collaborate with top 5% Algerian tech and creative specialists verified by our operations team.</p></div>
          <div class="card-panel"><h3>2. Team Permissions</h3><p style="color:var(--text-secondary);margin-top:8px;">Invite hiring managers, CTOs, and finance officers under one unified company profile.</p></div>
          <div class="card-panel"><h3>3. DZD Corporate Compliance</h3><p style="color:var(--text-secondary);margin-top:8px;">Track every transaction with clear RC, NIF, and NIS references for Algerian corporate accounting.</p></div>
        </div>
      </div>
    `;
  };

  window.IntalentPages["pro-upgrade"] = async function (main, state) {
    const { escapeHtml, api, showToast } = App();
    main.innerHTML = `
      <div class="container section" style="max-width:900px;">
        <div style="text-align:center;margin-bottom:32px;">
          <span class="badge badge-pro">✦ PROFESSIONAL TIER SYSTEM</span>
          <h1 class="section-title" style="margin-top:8px;">Intalent Standard vs. Intalent Pro</h1>
          <p class="section-subtitle">Intalent Pro status is earned through verified expertise and administrator review — never automatically granted.</p>
        </div>

        <div class="grid-2" style="margin-bottom:32px;">
          <div class="card-panel">
            <h3 style="color:var(--brand-deep);">Standard Freelancer</h3>
            <div style="font-size:1.5rem;font-weight:800;margin:10px 0;">Free Account</div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;font-size:0.9rem;">
              <li>✓ Publish unlimited services with 3-tier packages</li>
              <li>✓ Receive orders & proposals in DZD</li>
              <li>✓ Standard platform commission (${escapeHtml(state.settings.commission_rate_pct || '10')}%)</li>
            </ul>
          </div>
          <div class="card-panel" style="border:2px solid var(--brand-violet);background:var(--brand-pale);">
            <span class="badge badge-pro">ADMIN VERIFIED</span>
            <h3 style="color:var(--brand-deep);margin-top:6px;">Intalent Pro ✦</h3>
            <div style="font-size:1.5rem;font-weight:800;margin:10px 0;color:var(--brand-violet);">Application & Review</div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;font-size:0.9rem;">
              <li>✦ Official <strong>PRO</strong> badge on profile & services</li>
              <li>✦ Featured in the Intalent Pro directory & filter</li>
              <li>✦ Reduced Pro commission (${escapeHtml(state.settings.pro_commission_rate_pct || '5')}%)</li>
              <li>✦ Priority access to Business & Enterprise briefs</li>
            </ul>
          </div>
        </div>

        <div class="card-panel">
          <h3 style="color:var(--brand-deep);margin-bottom:10px;">Apply for Intalent Pro Review</h3>
          ${!state.user ? `<p>Please <a style="color:var(--brand-violet);font-weight:700;" onclick="window.IntalentApp.navigate('login')">sign in</a> to submit your Pro application.</p>` : `
            <form id="pro-apply-form" style="display:flex;flex-direction:column;gap:12px;">
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Primary Specialty</label>
                <input type="text" name="specialty" class="input" style="width:100%;" placeholder="e.g. Full-Stack Engineering, Brand Architecture..." required>
              </div>
              <div style="display:grid;grid-template-columns:1fr 2fr;gap:12px;">
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Years of Experience</label>
                  <input type="number" name="years_experience" class="input" style="width:100%;" value="5" required>
                </div>
                <div>
                  <label style="font-size:0.8rem;font-weight:700;">Portfolio / GitHub / Behance Links</label>
                  <input type="text" name="portfolio_links" class="input" style="width:100%;" placeholder="https://..." required>
                </div>
              </div>
              <div>
                <label style="font-size:0.8rem;font-weight:700;">Notable Client Projects & Achievements</label>
                <textarea name="motivation" class="textarea" placeholder="Describe 2-3 flagship projects you have delivered..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Submit Application for Admin Verification</button>
            </form>
          `}
        </div>
      </div>
    `;
    const form = document.getElementById("pro-apply-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await api("/api/pro-apply", {
            method: "POST",
            body: JSON.stringify({
              specialty: fd.get("specialty"),
              years_experience: Number(fd.get("years_experience")),
              portfolio_links: fd.get("portfolio_links"),
              motivation: fd.get("motivation")
            })
          });
          showToast("Pro application submitted! An administrator will review your credentials.");
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }
  };

  window.IntalentPages["how-it-works"] = async function (main) {
    main.innerHTML = `
      <div class="container section">
        <h1 class="section-title">How Intalent Works</h1>
        <p class="section-subtitle" style="margin-bottom:28px;">From discovery to final delivery and payout — transparent, structured, and secure.</p>
        <div class="grid-4">
          <div class="card-panel"><h3>1. Discover or Post</h3><p style="color:var(--text-secondary);margin-top:8px;">Search packaged services by category, Wilaya, and DZD budget, or post a custom project brief.</p></div>
          <div class="card-panel"><h3>2. Order & Escrow</h3><p style="color:var(--text-secondary);margin-top:8px;">Select a Basic, Standard, or Premium tier, attach project briefs, and fund the order safely.</p></div>
          <div class="card-panel"><h3>3. Collaborate & Review</h3><p style="color:var(--text-secondary);margin-top:8px;">Communicate in real-time order threads, review submitted deliverables, or request revisions.</p></div>
          <div class="card-panel"><h3>4. Approve & Rate</h3><p style="color:var(--text-secondary);margin-top:8px;">Once you accept delivery, net funds release to the freelancer's wallet and you leave a verified review.</p></div>
        </div>
      </div>
    `;
  };

  window.IntalentPages["about"] = async function (main) {
    main.innerHTML = `
      <div class="container section" style="max-width:860px;">
        <div class="card-panel">
          <img src="/assets/logos/logo-dark.png" alt="Intalent" style="height:48px;margin-bottom:16px;">
          <h1 class="section-title" style="margin-bottom:12px;">About Intalent Algeria</h1>
          <p style="margin-bottom:14px;">Intalent is built to empower Algeria's rapidly growing digital economy — connecting independent engineers, designers, marketers, translators, and consultants with clients across all 58 Wilayas.</p>
          <p style="color:var(--text-secondary);">With native support for Algerian Dinar (DZD) pricing, trilingual navigation (Français, العربية, English), and transparent order protection, Intalent bridges the gap between talent and opportunity.</p>
        </div>
      </div>
    `;
  };

  window.IntalentPages["pricing-fees"] = async function (main, state) {
    main.innerHTML = `
      <div class="container section" style="max-width:860px;">
        <h1 class="section-title" style="margin-bottom:12px;">Pricing & Platform Commissions</h1>
        <div class="card-panel">
          <h3>Transparent DZD Fee Structure</h3>
          <p style="margin:10px 0;color:var(--text-secondary);">Joining Intalent, creating a freelancer profile, publishing services, and posting project briefs are 100% free.</p>
          <ul style="margin-left:20px;display:flex;flex-direction:column;gap:8px;">
            <li><strong>Standard Service Commission:</strong> ${state.settings.commission_rate_pct || 10}% calculated automatically on the server.</li>
            <li><strong>Intalent Pro Commission:</strong> ${state.settings.pro_commission_rate_pct || 5}% for verified Pro freelancers.</li>
            <li><strong>Payout Methods:</strong> Algérie Poste CCP / BaridiMob, Bank RIB Wire Transfer.</li>
          </ul>
        </div>
      </div>
    `;
  };

  window.IntalentPages["trust-safety"] = async function (main) {
    main.innerHTML = `
      <div class="container section" style="max-width:860px;">
        <h1 class="section-title" style="margin-bottom:12px;">Trust, Safety & Order Protection</h1>
        <div class="card-panel">
          <p style="margin-bottom:12px;">Every order on Intalent follows strict server-enforced state transitions (In Progress → Delivered → Revision Requested / Completed).</p>
          <p style="color:var(--text-secondary);">Reviews can only be submitted by the actual buyer of a completed order — eliminating fake ratings. Any user can report suspicious listings or open an order dispute directly from the order page for administrator resolution.</p>
        </div>
      </div>
    `;
  };

  window.IntalentPages["help-faq"] = async function (main) {
    main.innerHTML = `
      <div class="container section" style="max-width:860px;">
        <h1 class="section-title" style="margin-bottom:16px;">Help Center & Frequently Asked Questions</h1>
        <div class="card-panel">
          <h4>How do payments work in Algeria?</h4>
          <p style="color:var(--text-secondary);margin:6px 0 16px;">Intalent includes a complete SATIM CIB / Edahabia & Corporate RIB checkout architecture. In development/demo mode, transactions run in our clearly labeled Sandbox so you can test the entire order and wallet flow safely.</p>
          <h4>Can I use the same account to both buy and sell services?</h4>
          <p style="color:var(--text-secondary);margin:6px 0 16px;">Yes! Use the Role Switcher in the top header to switch seamlessly between Client, Freelancer, and Business workspaces without creating duplicate accounts.</p>
          <h4>How are ratings calculated?</h4>
          <p style="color:var(--text-secondary);margin:6px 0;">Ratings are dynamically recalculated in SQLite whenever an eligible buyer submits a review on a completed order.</p>
        </div>
      </div>
    `;
  };

  window.IntalentPages["contact"] = async function (main, state) {
    const { escapeHtml, api, showToast } = App();
    main.innerHTML = `
      <div class="container section" style="max-width:640px;">
        <h1 class="section-title" style="margin-bottom:8px;">Contact Intalent Support</h1>
        <p class="section-subtitle" style="margin-bottom:20px;">Submit a support ticket directly to our platform administration queue.</p>
        <form id="contact-support-form" class="card-panel" style="display:flex;flex-direction:column;gap:14px;">
          <input type="text" name="name" class="input" placeholder="Your Full Name" value="${escapeHtml(state.user?.full_name || '')}" required>
          <input type="email" name="email" class="input" placeholder="Your Email Address" value="${escapeHtml(state.user?.email || '')}" required>
          <select name="category" class="select">
            <option value="Order & Payment Support">Order & Payment Support</option>
            <option value="Freelancer Verification / Pro">Freelancer Verification / Pro</option>
            <option value="Enterprise & Business">Enterprise & Business</option>
            <option value="Technical Issue">Technical Issue</option>
          </select>
          <input type="text" name="subject" class="input" placeholder="Subject" required>
          <textarea name="message" class="textarea" placeholder="How can our team help you?" required></textarea>
          <button type="submit" class="btn btn-primary">Submit Support Ticket</button>
        </form>
      </div>
    `;
    document.getElementById("contact-support-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await api("/api/support", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(fd.entries()))
        });
        showToast(`Support ticket #${res.ticket_id} received!`);
        e.target.reset();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  };

  window.IntalentPages["terms"] = async function (main) {
    main.innerHTML = `<div class="container section" style="max-width:820px;"><div class="card-panel"><h1>Terms of Service</h1><p style="margin-top:12px;color:var(--text-secondary);">By using Intalent Algeria, users agree to abide by marketplace honesty rules, accurate service descriptions, intellectual property respect, and server-governed order dispute resolution.</p></div></div>`;
  };

  window.IntalentPages["privacy"] = async function (main) {
    main.innerHTML = `<div class="container section" style="max-width:820px;"><div class="card-panel"><h1>Privacy Policy</h1><p style="margin-top:12px;color:var(--text-secondary);">Intalent protects personal data in accordance with Algerian Law 18-07 on the protection of individuals in the processing of personal data. Private messages and order files are strictly restricted to authorized participants.</p></div></div>`;
  };
})();
