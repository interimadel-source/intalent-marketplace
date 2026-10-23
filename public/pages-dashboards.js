(function () {
  const App = () => window.IntalentApp;

  // =========================================================================
  // 12. PERSISTENT MESSAGING & NOTIFICATIONS
  // =========================================================================
  window.IntalentPages["messages"] = async function (main, state) {
    const { escapeHtml, api, showToast } = App();
    if (!state.user) {
      App().navigate("login");
      return;
    }

    const { conversations } = await api("/api/conversations");
    let activeConvId = Number(state.params.conv || (conversations[0]?.id || 0));
    let activeMessages = [];
    let activeConv = null;

    if (activeConvId > 0) {
      const detail = await api("/api/conversations/" + activeConvId);
      activeConv = detail.conversation;
      activeMessages = detail.messages || [];
      await App().refreshBootstrap();
    }

    main.innerHTML = `
      <div class="container section">
        <h1 class="section-title" style="margin-bottom:18px;">Messages & Order Conversations</h1>
        <div class="messaging-grid">
          <div class="conv-list">
            ${conversations.length === 0 ? `<div style="padding:20px;color:var(--text-secondary);">No conversations yet. Contact any freelancer to start chatting.</div>` :
              conversations.map(c => {
                const otherName = c.user1_id === state.user.id ? c.user2_name : c.user1_name;
                return `
                  <div class="conv-item ${c.id === activeConvId ? 'active' : ''}" onclick="window.IntalentApp.navigate('messages?conv=${c.id}')">
                    <div style="font-weight:700;color:var(--brand-deep);">${escapeHtml(otherName)}</div>
                    <div style="font-size:0.78rem;color:var(--brand-violet);font-weight:600;">${escapeHtml(c.subject || "Direct Conversation")}</div>
                    <div style="font-size:0.82rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px;">
                      ${escapeHtml(c.last_message?.body || "")}
                    </div>
                  </div>
                `;
              }).join("")
            }
          </div>
          <div class="chat-pane">
            ${!activeConv ? `
              <div style="margin:auto;text-align:center;color:var(--text-secondary);padding:24px;">
                Select a conversation on the left to view messages.
              </div>
            ` : `
              <div style="padding:14px 20px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong>${escapeHtml(activeConv.subject || "Conversation")}</strong>
                </div>
                ${activeConv.order_id ? `<button class="btn btn-outline btn-sm" onclick="window.IntalentApp.navigate('order-detail?id=${activeConv.order_id}')">View Linked Order →</button>` : ""}
              </div>
              <div class="chat-messages" id="chat-scroll-box">
                ${activeMessages.map(m => `
                  <div class="msg-bubble ${m.sender_id === state.user.id ? 'msg-mine' : 'msg-theirs'}">
                    <div style="font-size:0.74rem;opacity:0.75;margin-bottom:3px;">${escapeHtml(m.sender_name)} • ${escapeHtml(m.created_at)}</div>
                    <div style="white-space:pre-line;">${escapeHtml(m.body)}</div>
                  </div>
                `).join("")}
              </div>
              <form id="send-msg-form" class="chat-input-bar">
                <input type="text" name="body" class="input" style="flex:1;" placeholder="Write a message..." required>
                <button type="submit" class="btn btn-primary">Send</button>
              </form>
            `}
          </div>
        </div>
      </div>
    `;

    const scrollBox = document.getElementById("chat-scroll-box");
    if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;

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
      <div class="container section" style="max-width:820px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h1 class="section-title">Notification Center</h1>
          <button id="mark-all-read-btn" class="btn btn-outline btn-sm">✓ Mark All as Read</button>
        </div>
        <div class="card-panel">
          ${notifications.length === 0 ? `<p style="color:var(--text-secondary);">No notifications yet.</p>` :
            notifications.map(n => `
              <div style="padding:14px;border-bottom:1px solid var(--border-color);background:${n.is_read ? 'transparent' : 'var(--brand-pale)'};display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <div>
                  <div style="font-weight:700;color:var(--brand-deep);">${escapeHtml(n.title)}</div>
                  <div style="font-size:0.9rem;color:var(--text-main);">${escapeHtml(n.message)}</div>
                  <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:4px;">${escapeHtml(n.created_at)}</div>
                </div>
                ${n.link_route ? `<button class="btn btn-outline btn-sm" onclick="window.IntalentApp.navigate('${escapeHtml(n.link_route)}')">Open →</button>` : ""}
              </div>
            `).join("")
          }
        </div>
      </div>
    `;

    document.getElementById("mark-all-read-btn").addEventListener("click", async () => {
      await api("/api/notifications/read-all", { method: "POST", body: "{}" });
      await App().refreshBootstrap();
      showToast("All notifications marked as read.");
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
      <div class="container section">
        <h1 class="section-title" style="margin-bottom:20px;">Saved Services & Favorite Freelancers</h1>
        <h3 style="color:var(--brand-deep);margin-bottom:14px;">Saved Services (${services.length})</h3>
        ${services.length === 0 ? `<div class="card-panel"><p style="color:var(--text-secondary);">No saved services yet. Click the ♥ icon on any service card to save it here.</p></div>` : `
          <div class="grid-4" style="margin-bottom:32px;">${services.map(renderServiceCard).join("")}</div>
        `}
        <h3 style="color:var(--brand-deep);margin-bottom:14px;">Favorite Freelancers (${freelancers.length})</h3>
        ${freelancers.length === 0 ? `<div class="card-panel"><p style="color:var(--text-secondary);">No saved freelancers yet.</p></div>` : `
          <div class="grid-3">
            ${freelancers.map(f => `
              <div class="card-panel" style="margin-bottom:0;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <img src="${escapeHtml(f.avatar_url)}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">
                  <div>
                    <strong>${escapeHtml(f.full_name)}</strong>
                    <div style="font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(f.wilaya)}</div>
                  </div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.IntalentApp.navigate('freelancer?username=${encodeURIComponent(f.username)}')">View →</button>
              </div>
            `).join("")}
          </div>
        `}
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
      <div class="container dashboard-shell">
        <aside class="dashboard-sidebar">
          <div style="padding:8px 12px 16px;border-bottom:1px solid var(--border-color);margin-bottom:12px;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--brand-violet);text-transform:uppercase;">Freelancer Studio</div>
            <div style="font-weight:800;color:var(--brand-deep);">${escapeHtml(state.user.full_name)}</div>
            <div style="margin-top:4px;">
              ${state.user.is_pro ? `<span class="badge badge-pro">✦ PRO SELLER</span>` : `<span class="badge badge-status">Standard Seller</span>`}
            </div>
          </div>
          <div class="sidebar-menu-item ${tab === 'overview' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=overview')">📊 Studio Overview & Orders</div>
          <div class="sidebar-menu-item ${tab === 'services' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=services')">💼 My Services (${myServices.length})</div>
          <div class="sidebar-menu-item ${tab === 'create-service' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')">+ Create New Service</div>
          <div class="sidebar-menu-item ${tab === 'portfolio' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=portfolio')">🖼 Portfolio Projects</div>
          <div class="sidebar-menu-item ${tab === 'earnings' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=earnings')">💰 Earnings & Payouts</div>
          <div class="sidebar-menu-item ${tab === 'profile' ? 'active' : ''}" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=profile')">👤 Profile, Skills & Bio</div>
          <div class="sidebar-menu-item" onclick="window.IntalentApp.navigate('pro-upgrade')">✦ Intalent Pro Upgrade</div>
        </aside>

        <div>
          <div class="stat-cards-grid">
            <div class="stat-card"><div class="stat-card-label">Available Wallet</div><div class="stat-card-value">${formatDZD(walletRes.balance_dzd)}</div></div>
            <div class="stat-card"><div class="stat-card-label">Active Orders</div><div class="stat-card-value">${incomingOrders.filter(o => o.status === 'in_progress' || o.status === 'revision_requested').length}</div></div>
            <div class="stat-card"><div class="stat-card-label">Completed Orders</div><div class="stat-card-value">${incomingOrders.filter(o => o.status === 'completed').length}</div></div>
            <div class="stat-card"><div class="stat-card-label">Published Services</div><div class="stat-card-value">${myServices.filter(s => s.status === 'approved').length}</div></div>
          </div>

          ${tab === "overview" ? `
            <div class="card-panel">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:var(--brand-deep);">Incoming & Active Client Orders</h3>
                <button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('freelancer-dashboard?tab=create-service')">+ Publish New Service</button>
              </div>
              ${incomingOrders.length === 0 ? `<p style="color:var(--text-secondary);">No incoming orders yet. Publish services or bid on project briefs to win orders!</p>` : `
                <div class="table-wrap">
                  <table class="data-table">
                    <thead>
                      <tr><th>Order #</th><th>Service</th><th>Client</th><th>Net Earnings</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      ${incomingOrders.map(o => `
                        <tr>
                          <td><strong>${escapeHtml(o.order_number)}</strong></td>
                          <td>${escapeHtml(o.service_title)}</td>
                          <td>${escapeHtml(o.client_name)}</td>
                          <td><strong style="color:var(--success);">${formatDZD(o.freelancer_net_dzd)}</strong></td>
                          <td><span class="badge badge-status">${escapeHtml(o.status.toUpperCase())}</span></td>
                          <td><button class="btn btn-primary btn-sm" onclick="window.IntalentApp.navigate('order-detail?id=${o.id}')">Deliver / View →</button></td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              `}
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
