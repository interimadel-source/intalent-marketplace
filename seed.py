import json
from datetime import datetime, timezone
from database import get_db, init_db, hash_password, recalculate_service_rating

def seed():
    init_db()
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) as c FROM users")
    if cur.fetchone()["c"] > 0:
        print("Database already seeded.")
        conn.close()
        return

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # 1. Platform Settings
    settings = {
        "platform_name": "Intalent",
        "default_currency": "DZD",
        "commission_rate_pct": "10",
        "pro_commission_rate_pct": "5",
        "require_service_moderation": "false",
        "pro_min_completed_orders": "1",
        "pro_min_rating": "4.5",
        "payment_sandbox_mode": "true",
        "payment_provider_label": "SATIM CIB / Edahabia Gateway (Sandbox Mode)",
        "support_email": "support@intalent.dz",
        "announcement_bar": "Bienvenue sur Intalent Algérie — La plateforme N°1 des talents freelances et entreprises en DZD.",
    }
    for k, v in settings.items():
        cur.execute("INSERT INTO platform_settings (key, value, updated_at) VALUES (?, ?, ?)", (k, v, now))

    # 2. Categories & Subcategories
    categories_data = [
        {
            "name": "Programming & Tech",
            "name_fr": "Programmation & Tech",
            "name_ar": "البرمجة والتقنية",
            "slug": "programming-tech",
            "description": "Full-stack web apps, mobile apps, e-commerce, CIB/Edahabia integrations, and cloud DevOps.",
            "icon": "code",
            "image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("Web Application Development", "Développement Web", "تطوير تطبيقات الويب", "web-development"),
                ("Mobile Apps (iOS & Android)", "Applications Mobiles", "تطبيقات الهاتف", "mobile-apps"),
                ("E-Commerce & Payment Integration", "E-Commerce & Paiement CIB", "التجارة الإلكترونية والدفع", "ecommerce-dev"),
                ("Cybersecurity & Cloud DevOps", "Cybersécurité & DevOps", "الأمن السيبراني والسحابة", "cybersecurity-devops"),
            ]
        },
        {
            "name": "Graphics & Design",
            "name_fr": "Graphisme & Design",
            "name_ar": "التصميم والجرافيك",
            "slug": "graphics-design",
            "description": "Brand identity, logos, UI/UX design in Figma, packaging, and 3D architectural visualization.",
            "icon": "palette",
            "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("Logo & Brand Identity", "Logo & Identité Visuelle", "تصميم الشعارات والهوية", "logo-brand-identity"),
                ("UI/UX Web & Mobile Design", "Design UI/UX", "تصميم واجهات المستخدم", "ui-ux-design"),
                ("Packaging & Label Design", "Packaging & Étiquettes", "تصميم التغليف والمنتجات", "packaging-design"),
                ("Social Media Graphics", "Visuels Réseaux Sociaux", "تصاميم السوشيال ميديا", "social-media-design"),
            ]
        },
        {
            "name": "Digital Marketing",
            "name_fr": "Marketing Digital",
            "name_ar": "التسويق الرقمي",
            "slug": "digital-marketing",
            "description": "Meta & TikTok ads, SEO optimization, Algerian market growth strategy, and social media management.",
            "icon": "trending-up",
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("Social Media Advertising", "Publicité Meta & TikTok", "إعلانات منصات التواصل", "social-media-ads"),
                ("Search Engine Optimization (SEO)", "Référencement SEO", "تحسين محركات البحث", "seo-services"),
                ("Content & Brand Strategy", "Stratégie de Contenu", "استراتيجية المحتوى", "content-strategy"),
            ]
        },
        {
            "name": "Video & Animation",
            "name_fr": "Vidéo & Animation",
            "name_ar": "الفيديو والرسوم المتحركة",
            "slug": "video-animation",
            "description": "Commercial video editing, motion graphics, 3D product animation, and promotional reels.",
            "icon": "video",
            "image_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("Video Editing & Post-Production", "Montage Vidéo Pro", "مونتاج الفيديو", "video-editing"),
                ("2D/3D Motion Graphics", "Motion Design 2D/3D", "موشن جرافيك", "motion-graphics"),
                ("Product & E-commerce Videos", "Vidéos Produits E-commerce", "فيديوهات المنتجات", "product-videos"),
            ]
        },
        {
            "name": "Writing & Translation",
            "name_fr": "Rédaction & Traduction",
            "name_ar": "الكتابة والترجمة",
            "slug": "writing-translation",
            "description": "Multilingual translation (Arabic, French, English), copywriting, legal & technical documentation.",
            "icon": "file-text",
            "image_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("Arabic / French / English Translation", "Traduction AR / FR / EN", "الترجمة الاحترافية", "translation"),
                ("SEO Copywriting & Articles", "Rédaction Web & Copywriting", "كتابة المحتوى والمقالات", "copywriting"),
                ("Technical & Grant Writing", "Rédaction Technique", "الكتابة التقنية", "technical-writing"),
            ]
        },
        {
            "name": "AI & Data Services",
            "name_fr": "Intelligence Artificielle & Data",
            "name_ar": "الذكاء الاصطناعي والبيانات",
            "slug": "ai-data-services",
            "description": "Custom AI chatbots, LLM fine-tuning, workflow automation, and business intelligence dashboards.",
            "icon": "cpu",
            "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("AI Agents & Custom Chatbots", "Agents IA & Chatbots", "وكلاء الذكاء الاصطناعي", "ai-chatbots"),
                ("Data Analytics & PowerBI", "Data Analyse & PowerBI", "تحليل البيانات", "data-analytics"),
                ("Process Automation (n8n / Make)", "Automatisation Workflows", "أتمتة العمليات", "workflow-automation"),
            ]
        },
        {
            "name": "Business & Consulting",
            "name_fr": "Business & Conseil",
            "name_ar": "الأعمال والاستشارات",
            "slug": "business-consulting",
            "description": "Startup pitch decks, Algerian accounting & CNAS/CASNOS consulting, market research, and ERP setup.",
            "icon": "briefcase",
            "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("Financial & Startup Consulting", "Conseil Financier & Startup", "الاستشارات المالية والشركات الناشئة", "financial-consulting"),
                ("Market Research Algeria & MENA", "Étude de Marché Algérie", "دراسة السوق", "market-research"),
                ("Odoo & ERP Implementation", "Intégration Odoo & ERP", "أنظمة إدارة الشركات", "erp-implementation"),
            ]
        },
        {
            "name": "Music & Audio",
            "name_fr": "Musique & Audio",
            "name_ar": "الصوتيات والموسيقى",
            "slug": "music-audio",
            "description": "Arabic, French & Algerian Darija voice-overs, podcast mastering, and sound design.",
            "icon": "mic",
            "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80",
            "subs": [
                ("Voice Over (AR / FR / Darija)", "Voix Off (AR / FR / Darija)", "التعليق الصوتي", "voice-over"),
                ("Podcast & Audio Mastering", "Mixage & Podcast", "هندسة الصوت والبودكاست", "audio-mastering"),
            ]
        }
    ]

    cat_map = {}
    sub_map = {}
    for c in categories_data:
        cur.execute("""
            INSERT INTO categories (name, name_fr, name_ar, slug, description, icon, image_url, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (c["name"], c["name_fr"], c["name_ar"], c["slug"], c["description"], c["icon"], c["image_url"]))
        cid = cur.lastrowid
        cat_map[c["slug"]] = cid
        for s_en, s_fr, s_ar, s_slug in c["subs"]:
            cur.execute("""
                INSERT INTO subcategories (category_id, name, name_fr, name_ar, slug)
                VALUES (?, ?, ?, ?, ?)
            """, (cid, s_en, s_fr, s_ar, s_slug))
            sub_map[s_slug] = cur.lastrowid

    # 3. Skills catalog
    skills_list = [
        ("React & Next.js", "programming-tech"),
        ("TypeScript", "programming-tech"),
        ("Python & FastAPI", "programming-tech"),
        ("PostgreSQL & SQLite", "programming-tech"),
        ("Flutter & Dart", "programming-tech"),
        ("SATIM CIB / Edahabia API", "programming-tech"),
        ("Figma UI/UX", "graphics-design"),
        ("Brand Identity & Illustrator", "graphics-design"),
        ("3D Blender & Cinema4D", "graphics-design"),
        ("Meta & TikTok Ads", "digital-marketing"),
        ("Technical SEO", "digital-marketing"),
        ("After Effects & Premiere Pro", "video-animation"),
        ("Arabic / French Translation", "writing-translation"),
        ("LLM & LangChain Agents", "ai-data-services"),
        ("Odoo ERP Customization", "business-consulting"),
        ("Voice Over (Arabic / French)", "music-audio"),
    ]
    for s_name, c_slug in skills_list:
        cur.execute("INSERT INTO skills (name, category_slug) VALUES (?, ?)", (s_name, c_slug))

    # 4. Users (Admin, Freelancers, Clients, Business)
    users_data = [
        {
            "email": "admin@intalent.dz",
            "password": "AdminPassword123!",
            "full_name": "Karim Mansouri (Platform Admin)",
            "username": "karim_admin",
            "role": "admin",
            "active_role": "admin",
            "roles_enabled": json.dumps(["admin", "client", "freelancer"]),
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            "headline": "Intalent Trust, Safety & Marketplace Operations",
            "bio": "Head of Marketplace Operations at Intalent Algeria.",
            "wilaya": "16 - Alger",
            "is_verified": 1,
            "is_pro": 0,
            "pro_status": "none",
            "wallet_balance_dzd": 0,
            "is_demo": 0
        },
        {
            "email": "amine@intalent.dz",
            "password": "Password123!",
            "full_name": "Amine Benali",
            "username": "amine_fullstack",
            "role": "freelancer",
            "active_role": "freelancer",
            "roles_enabled": json.dumps(["freelancer", "client"]),
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            "headline": "Senior Full-Stack Architect & E-Pay CIB/Edahabia Specialist",
            "bio": "8+ years building scalable fintech, SaaS, and e-commerce platforms across Algeria and Europe. Certified SATIM CIB/Edahabia integration specialist.",
            "wilaya": "16 - Alger",
            "is_verified": 1,
            "is_pro": 1,
            "pro_status": "approved",
            "wallet_balance_dzd": 148500,
            "is_demo": 1,
            "skills": [("React & Next.js", "Expert"), ("Python & FastAPI", "Expert"), ("SATIM CIB / Edahabia API", "Expert"), ("PostgreSQL & SQLite", "Expert")]
        },
        {
            "email": "yasmine@intalent.dz",
            "password": "Password123!",
            "full_name": "Yasmine Khelifi",
            "username": "yasmine_studio",
            "role": "freelancer",
            "active_role": "freelancer",
            "roles_enabled": json.dumps(["freelancer", "client"]),
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            "headline": "Creative Director, Brand Identity & Senior UI/UX Designer",
            "bio": "Award-winning brand designer based in Oran. I craft distinctive bilingual (Arabic + Latin) brand identities, packaging, and Figma design systems for ambitious startups.",
            "wilaya": "31 - Oran",
            "is_verified": 1,
            "is_pro": 1,
            "pro_status": "approved",
            "wallet_balance_dzd": 92000,
            "is_demo": 1,
            "skills": [("Figma UI/UX", "Expert"), ("Brand Identity & Illustrator", "Expert"), ("3D Blender & Cinema4D", "Intermediate")]
        },
        {
            "email": "mehdi@intalent.dz",
            "password": "Password123!",
            "full_name": "Mehdi Touati",
            "username": "mehdi_growth",
            "role": "freelancer",
            "active_role": "freelancer",
            "roles_enabled": json.dumps(["freelancer", "client"]),
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            "headline": "Performance Marketing & E-Commerce ROAS Strategist",
            "bio": "Helping Algerian e-commerce brands and B2B companies scale with high-converting Meta Ads, TikTok campaigns, and server-side pixel tracking.",
            "wilaya": "25 - Constantine",
            "is_verified": 1,
            "is_pro": 0,
            "pro_status": "pending",
            "wallet_balance_dzd": 54000,
            "is_demo": 1,
            "skills": [("Meta & TikTok Ads", "Expert"), ("Technical SEO", "Expert")]
        },
        {
            "email": "lina@intalent.dz",
            "password": "Password123!",
            "full_name": "Lina Boudiaf",
            "username": "lina_ai_motion",
            "role": "freelancer",
            "active_role": "freelancer",
            "roles_enabled": json.dumps(["freelancer", "client"]),
            "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
            "headline": "AI Workflow Engineer & Motion Graphics Specialist",
            "bio": "Combining AI automation (LangChain, n8n, custom WhatsApp/Instagram agents) with high-impact commercial motion design.",
            "wilaya": "19 - Sétif",
            "is_verified": 1,
            "is_pro": 1,
            "pro_status": "approved",
            "wallet_balance_dzd": 115000,
            "is_demo": 1,
            "skills": [("LLM & LangChain Agents", "Expert"), ("After Effects & Premiere Pro", "Expert"), ("Arabic / French Translation", "Expert")]
        },
        {
            "email": "client@intalent.dz",
            "password": "Password123!",
            "full_name": "Sofiane Meziane",
            "username": "sofiane_client",
            "role": "client",
            "active_role": "client",
            "roles_enabled": json.dumps(["client", "freelancer"]),
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
            "headline": "Founder at Casbah Artisanat & E-Shop",
            "bio": "Entrepreneur looking for top Algerian developers, designers, and marketers to grow our digital presence.",
            "wilaya": "16 - Alger",
            "is_verified": 1,
            "is_pro": 0,
            "pro_status": "none",
            "wallet_balance_dzd": 45000,
            "is_demo": 1
        },
        {
            "email": "business@intalent.dz",
            "password": "Password123!",
            "full_name": "Nadia Brahimi (Atlas Tech DZ)",
            "username": "atlastech_dz",
            "role": "business",
            "active_role": "business",
            "roles_enabled": json.dumps(["business", "client"]),
            "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
            "headline": "VP of Engineering & Talent Acquisition — Atlas Tech SPA",
            "bio": "Corporate account for Atlas Tech SPA. We hire verified Pro freelancers and specialized squads for enterprise projects.",
            "wilaya": "16 - Alger",
            "is_verified": 1,
            "is_pro": 1,
            "pro_status": "approved",
            "wallet_balance_dzd": 350000,
            "is_demo": 1
        }
    ]

    user_ids = {}
    for u in users_data:
        cur.execute("""
            INSERT INTO users (
                email, password_hash, full_name, username, role, active_role, roles_enabled,
                avatar_url, headline, bio, wilaya, is_verified, is_pro, pro_status,
                wallet_balance_dzd, is_demo, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            u["email"], hash_password(u["password"]), u["full_name"], u["username"],
            u["role"], u["active_role"], u["roles_enabled"], u["avatar_url"],
            u["headline"], u["bio"], u["wilaya"], u["is_verified"], u["is_pro"],
            u["pro_status"], u["wallet_balance_dzd"], u["is_demo"], now
        ))
        uid = cur.lastrowid
        user_ids[u["username"]] = uid
        for sk_name, sk_lvl in u.get("skills", []):
            cur.execute("INSERT INTO user_skills (user_id, skill_name, level) VALUES (?, ?, ?)", (uid, sk_name, sk_lvl))

    # Portfolio items for freelancers
    portfolios = [
        (user_ids["amine_fullstack"], "DinarPay E-Commerce Checkout Engine", "Complete SATIM CIB & Edahabia payment module with automated PDF invoices and webhook reconciliation.", "Programming & Tech", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", "https://intalent.dz/demo/dinarpay"),
        (user_ids["amine_fullstack"], "MedCare DZ Telemedicine Platform", "Real-time clinic booking and prescription tracking platform across 48+ wilayas.", "Programming & Tech", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", "https://intalent.dz/demo/medcare"),
        (user_ids["yasmine_studio"], "Ziryab Luxury Coffee Brand & Packaging", "Bilingual Arabic/French brand identity, gold-foil packaging, and e-commerce UI kit.", "Graphics & Design", "https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=800&q=80", "https://intalent.dz/demo/ziryab"),
        (user_ids["yasmine_studio"], "Fintech Mobile App Design System", "85+ mobile screens in Figma with dark/light mode and interactive prototypes.", "Graphics & Design", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", "https://intalent.dz/demo/fintech-ui"),
        (user_ids["lina_ai_motion"], "AI Customer Support Agent in Algerian Darija & French", "RAG-powered assistant connected to WhatsApp Business API and Shopify order status.", "AI & Data Services", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", "https://intalent.dz/demo/darija-bot"),
    ]
    for uid, title, desc, cat, img, url in portfolios:
        cur.execute("""
            INSERT INTO portfolio_projects (user_id, title, description, category, image_url, project_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (uid, title, desc, cat, img, url, now))

    # Business profile & team
    cur.execute("""
        INSERT INTO businesses (owner_id, company_name, industry, company_size, rc_nif_number, wilaya, website, description, verified_business, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    """, (
        user_ids["atlastech_dz"], "Atlas Tech Solutions SPA", "Fintech & Enterprise Software",
        "51-200 employees", "RC: 16/00-4829103B21 | NIF: 002116482910355", "16 - Alger",
        "https://atlastech.dz", "Leading enterprise software and digital transformation group in Algiers.", now
    ))
    biz_id = cur.lastrowid
    cur.execute("""
        INSERT INTO business_team_members (business_id, member_email, member_name, role_permission, status, created_at)
        VALUES (?, ?, ?, ?, 'active', ?), (?, ?, ?, ?, 'active', ?)
    """, (
        biz_id, "nadia@atlastech.dz", "Nadia Brahimi", "Admin", now,
        biz_id, "riad.cto@atlastech.dz", "Riad Merabet", "Hiring Manager", now
    ))

    # Pro application pending for Mehdi
    cur.execute("""
        INSERT INTO pro_applications (user_id, specialty, years_experience, portfolio_links, motivation, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
    """, (
        user_ids["mehdi_growth"], "Performance Marketing & E-Commerce Growth", 6,
        "https://intalent.dz/portfolio/mehdi-roas-case-studies",
        "Managed over 45,000,000 DZD in profitable ad spend for top Algerian retail brands with 4.8x average ROAS.", now
    ))

    # 5. Services with Packages & Extras
    services_data = [
        {
            "freelancer": "amine_fullstack",
            "category": "programming-tech",
            "subcategory": "web-development",
            "title": "I will build a full-stack web application or SaaS with CIB & Edahabia payment",
            "slug": "full-stack-web-app-saas-cib-edahabia",
            "description": "Looking for a rock-solid web platform tailored for the Algerian or international market? I architect and build complete full-stack applications with responsive UI, secure backend APIs, database modeling, and official SATIM CIB / Edahabia or Stripe payment integration.\n\nWhat you get:\n- Clean, modular architecture with role-based access control\n- Fast, mobile-first responsive frontend\n- PostgreSQL / SQLite database design with migrations\n- Complete deployment & documentation",
            "skills": ["React & Next.js", "Python & FastAPI", "SATIM CIB / Edahabia API", "PostgreSQL & SQLite"],
            "cover": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 1,
            "is_sponsored": 1,
            "is_pro_listing": 1,
            "packages": [
                ("basic", "Starter MVP / Landing + API", "Responsive 3-page web app with authentication & contact backend.", 25000, 4, 2, ["3 Responsive Pages", "Database Setup", "Source Code Included"]),
                ("standard", "Full Business Web Platform", "Complete dynamic application with user dashboard, admin panel & API.", 65000, 7, 4, ["Up to 10 Pages", "Admin & Client Dashboards", "CIB/Edahabia Sandbox Integration", "30 Days Support"]),
                ("premium", "Enterprise SaaS + E-Pay Suite", "Full-scale marketplace or SaaS with payment gateway, analytics & deployment.", 135000, 14, 99, ["Unlimited Dynamic Pages", "Full E-Payment & Invoicing", "Role-Based Security Audit", "Cloud Deployment & CI/CD"])
            ],
            "extras": [
                ("Express 48h Priority Architecture", "Jump to the top of my queue with rapid milestone delivery", 15000, -1),
                ("Bilingual RTL Arabic + French Localization", "Complete multi-language switch with RTL stylesheet", 12000, 2),
                ("Automated PDF Invoice Generator (NIF/RC)", "Algerian tax-compliant invoice generation", 9000, 1)
            ],
            "faqs": [
                {"q": "Do you assist with SATIM CIB / Edahabia certification?", "a": "Yes! I implement the full technical sandbox and assist you through the official SATIM certification tests."},
                {"q": "Do I get full ownership of the source code?", "a": "100%. You receive the complete repository, database schema, and deployment guide."}
            ]
        },
        {
            "freelancer": "yasmine_studio",
            "category": "graphics-design",
            "subcategory": "logo-brand-identity",
            "title": "I will design a timeless Arabic and Latin brand identity with complete brand book",
            "slug": "timeless-arabic-latin-brand-identity-guideline",
            "description": "Elevate your company with a cohesive, memorable brand identity designed specifically for modern Algerian and MENA businesses. I harmonize Arabic calligraphy/typography with clean Latin wordmarks so your brand shines across packaging, signage, and digital apps.",
            "skills": ["Brand Identity & Illustrator", "Figma UI/UX"],
            "cover": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 1,
            "is_sponsored": 0,
            "is_pro_listing": 1,
            "packages": [
                ("basic", "Essential Logo Pack", "2 original logo concepts + vector source files (AI, EPS, SVG, PNG).", 14000, 3, 2, ["2 Logo Concepts", "Vector Source Files", "High-Res Transparency"]),
                ("standard", "Bilingual Identity (AR + FR/EN)", "3 bilingual logo concepts + color palette, typography & stationery.", 32000, 5, 4, ["3 Bilingual Concepts", "Brand Guidelines PDF", "Business Card & Letterhead", "3D Mockups"]),
                ("premium", "Full Brand Book & Social Kit", "Complete corporate identity system, 25-page brand book, packaging & social kit.", 68000, 9, 99, ["4 Master Concepts", "25-Page Brand Book", "Social Media Templates", "Packaging Die-cut Design"])
            ],
            "extras": [
                ("24-Hour Concept Express", "First draft concepts delivered within 24 hours", 8000, -1),
                ("Animated Logo Intro (MP4/Lottie)", "Custom smooth logo animation for reels & web", 11000, 2)
            ],
            "faqs": [
                {"q": "Are all fonts licensed for commercial use?", "a": "Yes, and custom lettering is 100% original vector artwork."}
            ]
        },
        {
            "freelancer": "yasmine_studio",
            "category": "graphics-design",
            "subcategory": "ui-ux-design",
            "title": "I will design a high-converting Figma UI UX for your web or mobile application",
            "slug": "high-converting-figma-ui-ux-web-mobile",
            "description": "Transform your product vision into an intuitive, developer-ready Figma design system. Every screen is crafted with auto-layout, interactive prototyping, and accessibility standards.",
            "skills": ["Figma UI/UX", "Brand Identity & Illustrator"],
            "cover": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 1,
            "is_sponsored": 0,
            "is_pro_listing": 1,
            "packages": [
                ("basic", "Landing Page or 3 App Screens", "High-converting UI in Figma with desktop + mobile responsive views.", 18000, 3, 2, ["Up to 3 Screens", "Auto-Layout Figma Source", "Responsive Mobile View"]),
                ("standard", "10-Screen Product UI + Prototype", "Complete user journey, component library, and clickable Figma prototype.", 45000, 6, 4, ["Up to 10 Screens", "Design System & Tokens", "Interactive Prototype"]),
                ("premium", "Full SaaS / Mobile App (25 Screens)", "End-to-end UX research, wireframes, 25 UI screens, dark mode & dev handoff.", 95000, 10, 99, ["25 Screens (Web or Mobile)", "Light & Dark Mode", "Developer Handoff Specs"])
            ],
            "extras": [
                ("RTL Arabic Layout Mirroring", "Adapt every screen for right-to-left Arabic UX", 12000, 2)
            ],
            "faqs": [
                {"q": "Do you provide HTML/CSS or Figma?", "a": "This service delivers pixel-perfect Figma files with CSS tokens ready for developers."}
            ]
        },
        {
            "freelancer": "mehdi_growth",
            "category": "digital-marketing",
            "subcategory": "social-media-ads",
            "title": "I will setup and scale profitable Meta and TikTok ad campaigns for Algeria e-commerce",
            "slug": "profitable-meta-tiktok-ads-algeria-ecommerce",
            "description": "Stop burning ad budget on low-quality clicks. I build structured acquisition funnels tailored to Algerian COD (Cash on Delivery) and e-payment buyers with verified Conversion API tracking.",
            "skills": ["Meta & TikTok Ads", "Technical SEO"],
            "cover": "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 1,
            "is_sponsored": 1,
            "is_pro_listing": 0,
            "packages": [
                ("basic", "Pixel + CAPI Audit & 1 Campaign", "Complete Meta Pixel / TikTok Pixel setup + 1 conversion campaign launch.", 12000, 2, 1, ["Pixel & Events Setup", "Audience Research", "1 Campaign Structure"]),
                ("standard", "Growth Funnel + 7 Days Optimization", "3 ad sets, creative hook scriptwriting, retargeting & 7-day management.", 28000, 7, 3, ["3 Conversion Ad Sets", "Ad Copy in FR + Darija", "7 Days Daily Optimization"]),
                ("premium", "Full Monthly Ad Management", "30-day dedicated media buying, A/B testing, weekly ROAS reports & scaling.", 65000, 14, 5, ["30 Days Management", "Unlimited Campaigns", "Custom Looker Studio Dashboard"])
            ],
            "extras": [
                ("3 Direct-Response Video Ad Scripts", "High-converting UGC scripts in Algerian Darija or French", 7500, 1)
            ],
            "faqs": [
                {"q": "Is the ad spend included in the package price?", "a": "Package prices cover my strategy and management fee; ad spend is billed directly by Meta/TikTok to your ad account."}
            ]
        },
        {
            "freelancer": "lina_ai_motion",
            "category": "ai-data-services",
            "subcategory": "ai-chatbots",
            "title": "I will build an AI customer support & order confirmation agent in Darija, AR and FR",
            "slug": "ai-customer-support-agent-darija-arabic-french",
            "description": "Automate your customer support and order confirmations 24/7! I build intelligent AI agents connected to WhatsApp, Instagram DM, or your website that understand Algerian Darija, Arabic, and French.",
            "skills": ["LLM & LangChain Agents", "Arabic / French Translation"],
            "cover": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 1,
            "is_sponsored": 0,
            "is_pro_listing": 1,
            "packages": [
                ("basic", "Website FAQ AI Chatbot", "Trained on your PDF/website docs with instant multilingual answers.", 22000, 3, 2, ["Custom Knowledge Base", "AR/FR/Darija Support", "Web Widget Embed"]),
                ("standard", "WhatsApp + Instagram AI Agent", "Automated lead qualification + Google Sheets / CRM order sync.", 48000, 6, 3, ["WhatsApp & IG Integration", "Automated Order Confirmation", "CRM Webhook Sync"]),
                ("premium", "Enterprise Multi-Agent Workflow", "Full RAG pipeline, human handoff dashboard, voice note transcription & analytics.", 98000, 10, 5, ["Voice Note Understanding", "ERP/Odoo API Integration", "Admin Monitoring Dashboard"])
            ],
            "extras": [
                ("Yalidine / ZR Express API Auto-Sync", "Automatically push confirmed orders to your delivery courier", 16000, 2)
            ],
            "faqs": [
                {"q": "Can the bot understand Algerian Darija written in Latin letters (Arabizi)?", "a": "Yes! My prompt & RAG pipeline accurately handles Arabizi (e.g., 'chhal prix svp'), Arabic script, and French."}
            ]
        },
        {
            "freelancer": "lina_ai_motion",
            "category": "video-animation",
            "subcategory": "motion-graphics",
            "title": "I will create a studio-quality 2D/3D explainer video or commercial product reel",
            "slug": "studio-quality-2d-3d-explainer-video-reel",
            "description": "Capture attention in the first 2 seconds with broadcast-grade motion graphics, kinetic typography, sound design, and voice-over synchronization.",
            "skills": ["After Effects & Premiere Pro", "Voice Over (Arabic / French)"],
            "cover": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 1,
            "is_sponsored": 0,
            "is_pro_listing": 1,
            "packages": [
                ("basic", "15s Social Ad Reel", "Punchy 15-second motion ad in 9:16 or 16:9 with licensed SFX.", 15000, 3, 2, ["15 Seconds Duration", "1080p Full HD", "Sound Design Included"]),
                ("standard", "45s Product / Startup Explainer", "Custom storyboard, motion graphics, and professional voice-over sync.", 36000, 6, 3, ["45 Seconds Duration", "Custom Illustrations", "Voice-Over Included"]),
                ("premium", "90s 4K Commercial + 3 Cutdowns", "Full 90-second flagship video + 3 vertical social cutdowns & project files.", 75000, 10, 5, ["90 Seconds 4K UHD", "Bilingual Subtitles", "After Effects Source Files"])
            ],
            "extras": [
                ("Studio Voice-Over Recording (AR or FR)", "Recorded by a native voice artist", 9000, 1)
            ],
            "faqs": []
        },
        {
            "freelancer": "amine_fullstack",
            "category": "business-consulting",
            "subcategory": "erp-implementation",
            "title": "I will deploy and customize Odoo ERP for Algerian retail, inventory and invoicing",
            "slug": "deploy-customize-odoo-erp-algeria-invoicing",
            "description": "Streamline your company operations with a custom Odoo ERP setup configured for Algerian accounting rules (PCN), G50 preparation, multi-warehouse stock, and POS.",
            "skills": ["Odoo ERP Customization", "Python & FastAPI"],
            "cover": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 0,
            "is_sponsored": 0,
            "is_pro_listing": 1,
            "packages": [
                ("basic", "Odoo Cloud Setup + Core Modules", "Sales, Invoicing, and Inventory setup on your VPS.", 30000, 4, 2, ["VPS Deployment", " Algerian Invoice Header (NIF/NIS/RC)", "Team Training Call"]),
                ("standard", "Custom Workflow + Courier Sync", "Custom Python module + automated shipping labels & stock alerts.", 70000, 8, 3, ["Custom Odoo Module", "Multi-Warehouse Setup", "Courier API Sync"]),
                ("premium", "Full Enterprise ERP Migration", "End-to-end ERP implementation, data migration, and 60-day priority SLA.", 150000, 15, 5, ["Legacy Data Migration", "Custom Accounting Reports", "60 Days SLA Support"])
            ],
            "extras": [],
            "faqs": []
        },
        {
            "freelancer": "mehdi_growth",
            "category": "writing-translation",
            "subcategory": "translation",
            "title": "I will translate and localize websites, apps and contracts between Arabic, French and English",
            "slug": "translate-localize-arabic-french-english",
            "description": "Human, context-aware translation and cultural localization for apps, legal documents, pitch decks, and marketing campaigns across Arabic, French, and English.",
            "skills": ["Arabic / French Translation", "Technical SEO"],
            "cover": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
            "gallery": [
                "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80"
            ],
            "is_featured": 0,
            "is_sponsored": 0,
            "is_pro_listing": 0,
            "packages": [
                ("basic", "Up to 1,000 Words Translation", "Accurate manual translation with proofreading.", 6000, 2, 2, ["1,000 Words", "Native Proofreading", "Formatting Preserved"]),
                ("standard", "Up to 3,500 Words + Localization", "Website JSON/PO files or business documents.", 18000, 4, 3, ["3,500 Words", "SEO Keyword Adaptation", "Glossary Creation"]),
                ("premium", "10,000 Words Executive Pack", "Comprehensive technical manual, app localization or corporate dossier.", 45000, 7, 5, ["10,000 Words", "Dual-Reviewer QA", "Priority Delivery"])
            ],
            "extras": [],
            "faqs": []
        }
    ]

    service_ids = {}
    for s in services_data:
        fid = user_ids[s["freelancer"]]
        cid = cat_map[s["category"]]
        subid = sub_map.get(s["subcategory"])
        min_price = min(p[3] for p in s["packages"])
        min_days = s["packages"][0][4]
        cur.execute("""
            INSERT INTO services (
                freelancer_id, category_id, subcategory_id, title, slug, description,
                skills_tags, cover_image, gallery_images, faqs, status,
                is_featured, is_sponsored, is_pro_listing, starting_price_dzd, delivery_days,
                is_demo, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?, ?, 1, ?, ?)
        """, (
            fid, cid, subid, s["title"], s["slug"], s["description"],
            json.dumps(s["skills"]), s["cover"], json.dumps(s["gallery"]),
            json.dumps(s["faqs"]), s["is_featured"], s["is_sponsored"],
            s["is_pro_listing"], min_price, min_days, now, now
        ))
        sid = cur.lastrowid
        service_ids[s["slug"]] = sid

        for tier, pname, pdesc, price, ddays, revs, feats in s["packages"]:
            cur.execute("""
                INSERT INTO service_packages (service_id, tier, name, description, price_dzd, delivery_days, revisions, features)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (sid, tier, pname, pdesc, price, ddays, revs, json.dumps(feats)))

        for etitle, edesc, eprice, edays in s["extras"]:
            cur.execute("""
                INSERT INTO service_extras (service_id, title, description, price_dzd, additional_days)
                VALUES (?, ?, ?, ?, ?)
            """, (sid, etitle, edesc, eprice, edays))

    # 6. Demo Orders & Real Calculated Reviews
    demo_orders = [
        {
            "order_number": "INT-2026-1001",
            "service_slug": "full-stack-web-app-saas-cib-edahabia",
            "client": "sofiane_client",
            "freelancer": "amine_fullstack",
            "tier": "standard",
            "package_name": "Full Business Web Platform",
            "subtotal": 65000,
            "status": "completed",
            "requirements": "We need an e-commerce platform for Casbah Artisanat with CIB/Edahabia checkout and Yalidine shipping sync.",
            "delivery_msg": "Completed the full web platform, admin dashboard, and SATIM sandbox integration. All tests passing!",
            "review": (5, "Exceptional engineering quality! Amine delivered our e-commerce platform ahead of schedule and the CIB checkout works flawlessly.")
        },
        {
            "order_number": "INT-2026-1002",
            "service_slug": "timeless-arabic-latin-brand-identity-guideline",
            "client": "sofiane_client",
            "freelancer": "yasmine_studio",
            "tier": "standard",
            "package_name": "Bilingual Identity (AR + FR/EN)",
            "subtotal": 32000,
            "status": "completed",
            "requirements": "Modern bilingual Arabic + Latin logo for Casbah Artisanat with royal purple and gold accents.",
            "delivery_msg": "Here is your complete bilingual brand book, vector master files, and packaging mockups.",
            "review": (5, "Yasmine is an extraordinary designer. The Arabic calligraphy paired with the Latin typography exceeded all our expectations!")
        },
        {
            "order_number": "INT-2026-1003",
            "service_slug": "high-converting-figma-ui-ux-web-mobile",
            "client": "atlastech_dz",
            "freelancer": "yasmine_studio",
            "tier": "premium",
            "package_name": "Full SaaS / Mobile App (25 Screens)",
            "subtotal": 95000,
            "status": "completed",
            "requirements": "Enterprise fintech portal design system in Figma with RTL support.",
            "delivery_msg": "Delivered all 25 screens with dark/light tokens and interactive Figma flows.",
            "review": (5, "World-class Figma architecture. Our engineering team implemented the components in record time.")
        },
        {
            "order_number": "INT-2026-1004",
            "service_slug": "profitable-meta-tiktok-ads-algeria-ecommerce",
            "client": "sofiane_client",
            "freelancer": "mehdi_growth",
            "tier": "standard",
            "package_name": "Growth Funnel + 7 Days Optimization",
            "subtotal": 28000,
            "status": "completed",
            "requirements": "Launch Q4 acquisition campaign for our handmade leather collection across Algiers, Oran, and Constantine.",
            "delivery_msg": "Campaigns launched with 4.4x ROAS in the first week. Full analytics report attached.",
            "review": (5, "Mehdi doubled our daily confirmed orders while cutting cost-per-acquisition by 38%.")
        },
        {
            "order_number": "INT-2026-1005",
            "service_slug": "ai-customer-support-agent-darija-arabic-french",
            "client": "atlastech_dz",
            "freelancer": "lina_ai_motion",
            "tier": "standard",
            "package_name": "WhatsApp + Instagram AI Agent",
            "subtotal": 48000,
            "status": "completed",
            "requirements": "AI customer support agent for our B2B helpdesk in Arabic, French, and Darija.",
            "delivery_msg": "Deployed the RAG webhook agent and connected it to your knowledge base.",
            "review": (5, "Impressive accuracy in Algerian Darija and French! Reduced ticket response time from 4 hours to 6 seconds.")
        },
        {
            "order_number": "INT-2026-1006",
            "service_slug": "full-stack-web-app-saas-cib-edahabia",
            "client": "sofiane_client",
            "freelancer": "amine_fullstack",
            "tier": "basic",
            "package_name": "Starter MVP / Landing + API",
            "subtotal": 25000,
            "status": "in_progress",
            "requirements": "Secondary wholesale B2B portal landing page and inventory API endpoint.",
            "delivery_msg": None,
            "review": None
        }
    ]

    for o in demo_orders:
        sid = service_ids[o["service_slug"]]
        cid = user_ids[o["client"]]
        fid = user_ids[o["freelancer"]]
        sub = o["subtotal"]
        fee = int(round(sub * 0.10))
        total = sub + fee
        net = sub - fee
        cur.execute("""
            INSERT INTO orders (
                order_number, service_id, client_id, freelancer_id, package_tier, package_name,
                subtotal_dzd, commission_rate_pct, platform_fee_dzd, total_dzd, freelancer_net_dzd,
                requirements_submitted, delivery_days, status, is_demo, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 10, ?, ?, ?, ?, 5, ?, 1, ?, ?)
        """, (
            o["order_number"], sid, cid, fid, o["tier"], o["package_name"],
            sub, fee, total, net, o["requirements"], o["status"], now, now
        ))
        oid = cur.lastrowid
        cur.execute("INSERT INTO order_status_history (order_id, status, note, actor_id, created_at) VALUES (?, 'in_progress', 'Order created and escrow funded (Sandbox)', ?, ?)", (oid, cid, now))
        cur.execute("""
            INSERT INTO transactions (tx_reference, order_id, user_id, type, amount_dzd, status, is_sandbox, description, created_at)
            VALUES (?, ?, ?, 'payment', ?, 'completed', 1, ?, ?)
        """, (f"TX-{o['order_number']}", oid, cid, total, f"Order payment for {o['order_number']} (Demo Sandbox)", now))

        if o["delivery_msg"]:
            cur.execute("INSERT INTO order_deliveries (order_id, freelancer_id, message, files_json, created_at) VALUES (?, ?, ?, ?, ?)",
                        (oid, fid, o["delivery_msg"], json.dumps(["/assets/logos/logo-dark.png"]), now))
            cur.execute("INSERT INTO order_status_history (order_id, status, note, actor_id, created_at) VALUES (?, 'completed', 'Delivery accepted by client', ?, ?)", (oid, cid, now))

        if o["review"]:
            r_score, r_text = o["review"]
            cur.execute("""
                INSERT INTO reviews (order_id, service_id, client_id, freelancer_id, rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (oid, sid, cid, fid, r_score, r_text, now))
            recalculate_service_rating(conn, sid)

    # 7. Project Requests & Proposals (Custom Briefs & Business Hiring)
    projects_seed = [
        {
            "code": "PRJ-DZ-901",
            "client": "atlastech_dz",
            "category": "programming-tech",
            "title": "Enterprise Logistics & Fleet Tracking Dashboard (48 Wilayas)",
            "description": "Atlas Tech SPA is looking for a senior full-stack developer or squad to build a real-time logistics tracking web dashboard with driver mobile view and automated delivery manifests.",
            "skills": ["React & Next.js", "Python & FastAPI", "PostgreSQL & SQLite"],
            "min": 180000,
            "max": 320000,
            "days": 21,
            "level": "Expert",
            "wilaya": "16 - Alger"
        },
        {
            "code": "PRJ-DZ-902",
            "client": "sofiane_client",
            "category": "graphics-design",
            "title": "3D Product Renders & Ramadan Gift Box Packaging Design",
            "description": "We need luxury gift box dielines and photorealistic 3D product renders for our upcoming artisan collection launch.",
            "skills": ["Brand Identity & Illustrator", "3D Blender & Cinema4D"],
            "min": 35000,
            "max": 60000,
            "days": 10,
            "level": "Intermediate",
            "wilaya": "All Algeria"
        }
    ]
    for p in projects_seed:
        cur.execute("""
            INSERT INTO project_requests (
                project_code, client_id, category_id, title, description, skills_required,
                budget_min_dzd, budget_max_dzd, deadline_days, experience_level, wilaya_pref, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
        """, (
            p["code"], user_ids[p["client"]], cat_map[p["category"]], p["title"], p["description"],
            json.dumps(p["skills"]), p["min"], p["max"], p["days"], p["level"], p["wilaya"], now
        ))
        pid = cur.lastrowid
        if p["code"] == "PRJ-DZ-901":
            cur.execute("""
                INSERT INTO proposals (project_id, freelancer_id, bid_amount_dzd, delivery_days, cover_letter, milestones_json, status, created_at)
                VALUES (?, ?, 245000, 18, ?, ?, 'pending', ?)
            """, (
                pid, user_ids["amine_fullstack"],
                "Bonjour Nadia, I have architected two multi-wilaya logistics platforms in Algiers. I can deliver the real-time GPS map, role-based dispatcher view, and REST API within 18 days.",
                json.dumps([{"title": "Database & API Core", "amount_dzd": 95000}, {"title": "Dispatcher Web UI & Live Map", "amount_dzd": 150000}]),
                now
            ))

    # 8. Conversations & Notifications
    cur.execute("""
        INSERT INTO conversations (user1_id, user2_id, order_id, subject, updated_at, created_at)
        VALUES (?, ?, 1, 'Order #INT-2026-1001 & Wholesale API Discussion', ?, ?)
    """, (user_ids["sofiane_client"], user_ids["amine_fullstack"], now, now))
    conv_id = cur.lastrowid
    cur.execute("""
        INSERT INTO messages (conversation_id, sender_id, body, is_read, created_at)
        VALUES
        (?, ?, 'Salam Amine! Thank you again for the first platform. For the wholesale portal (#INT-2026-1006), can we include a CSV bulk import for inventory?', 1, ?),
        (?, ?, 'Wa alaykoum salam Sofiane! Yes, absolutely. I am adding the CSV & Excel inventory importer today and will push a preview link by evening.', 0, ?)
    """, (conv_id, user_ids["sofiane_client"], now, conv_id, user_ids["amine_fullstack"], now))

    cur.execute("""
        INSERT INTO notifications (user_id, title, message, link_route, is_read, created_at)
        VALUES
        (?, 'New Message from Amine Benali', 'Amine replied regarding Order #INT-2026-1006.', 'messages', 0, ?),
        (?, 'New Order in Progress (#INT-2026-1006)', 'Sofiane Meziane placed a new order on your Full-Stack Web App service.', 'freelancer-dashboard', 0, ?),
        (?, 'New Proposal Received on PRJ-DZ-901', 'Amine Benali submitted a proposal (245,000 DZD) on Enterprise Logistics Dashboard.', 'business-dashboard', 0, ?)
    """, (user_ids["sofiane_client"], now, user_ids["amine_fullstack"], now, user_ids["atlastech_dz"], now))

    # 9. Promotional Banners (Clearly labeled Demo Placements)
    cur.execute("""
        INSERT INTO promotions_banners (title, subtitle, cta_text, cta_link, badge_text, bg_gradient, is_active, created_at)
        VALUES
        ('Intalent Pro — Verified Enterprise Talent in Algeria', 'Hire pre-vetted Algerian engineers, designers, and AI specialists with milestone protection and DZD corporate invoicing.', 'Explore Intalent Pro', 'pro-talent', 'OFFICIAL PROGRAM', 'linear-gradient(135deg, #25083F 0%, #8B43F5 100%)', 1, ?),
        ('Launch Your E-Commerce Store with CIB & Edahabia Ready', 'Connect with certified full-stack developers and performance marketers across all 58 Wilayas.', 'Browse Tech Services', 'explore?category=programming-tech', 'DEMO PLACEMENT', 'linear-gradient(135deg, #2B0B45 0%, #6D28D9 100%)', 1, ?)
    """, (now, now))

    # 10. Sample Favorite, Payout, Report & Audit Log
    cur.execute("INSERT INTO favorites (user_id, target_type, target_id, created_at) VALUES (?, 'service', 1, ?), (?, 'freelancer', 2, ?)",
                (user_ids["sofiane_client"], now, user_ids["sofiane_client"], now))
    cur.execute("""
        INSERT INTO payouts (freelancer_id, amount_dzd, method, account_details, status, processed_at, created_at)
        VALUES (?, 50000, 'CCP / BaridiMob', 'CCP 0024918274 Cle 42 - Amine Benali', 'processed', ?, ?)
    """, (user_ids["amine_fullstack"], now, now))
    cur.execute("""
        INSERT INTO audit_logs (actor_id, actor_email, action, target_type, target_id, details, created_at)
        VALUES (1, 'admin@intalent.dz', 'SYSTEM_SEED', 'platform', 'init', 'Initial Intalent database seed completed with demo markers.', ?)
    """, (now,))

    conn.commit()
    conn.close()
    print("Seed completed successfully.")

if __name__ == "__main__":
    seed()
