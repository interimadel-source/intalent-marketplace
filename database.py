import os
import sqlite3
import json
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

_DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "intalent.db")
DB_PATH = os.environ.get("INTALENT_DB_PATH", _DEFAULT_DB_PATH)
if os.path.dirname(DB_PATH):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
SECRET_KEY = os.environ.get("INTALENT_SECRET_KEY", "intalent-super-secret-prod-key-2026-dz")

WILAYAS = [
    {"code": "01", "name": "Adrar", "name_ar": "أدرار"},
    {"code": "02", "name": "Chlef", "name_ar": "الشلف"},
    {"code": "03", "name": "Laghouat", "name_ar": "الأغواط"},
    {"code": "04", "name": "Oum El Bouaghi", "name_ar": "أم البواقي"},
    {"code": "05", "name": "Batna", "name_ar": "باتنة"},
    {"code": "06", "name": "Béjaïa", "name_ar": "بجاية"},
    {"code": "07", "name": "Biskra", "name_ar": "بسكرة"},
    {"code": "08", "name": "Béchar", "name_ar": "بشار"},
    {"code": "09", "name": "Blida", "name_ar": "البليدة"},
    {"code": "10", "name": "Bouira", "name_ar": "البويرة"},
    {"code": "11", "name": "Tamanrasset", "name_ar": "تمنراست"},
    {"code": "12", "name": "Tébessa", "name_ar": "تبسة"},
    {"code": "13", "name": "Tlemcen", "name_ar": "تلمسان"},
    {"code": "14", "name": "Tiaret", "name_ar": "تيارت"},
    {"code": "15", "name": "Tizi Ouzou", "name_ar": "تيزي وزو"},
    {"code": "16", "name": "Alger", "name_ar": "الجزائر"},
    {"code": "17", "name": "Djelfa", "name_ar": "الجلفة"},
    {"code": "18", "name": "Jijel", "name_ar": "جيجل"},
    {"code": "19", "name": "Sétif", "name_ar": "سطيف"},
    {"code": "20", "name": "Saïda", "name_ar": "سعيدة"},
    {"code": "21", "name": "Skikda", "name_ar": "سكيكدة"},
    {"code": "22", "name": "Sidi Bel Abbès", "name_ar": "سيدي بلعباس"},
    {"code": "23", "name": "Annaba", "name_ar": "عنابة"},
    {"code": "24", "name": "Guelma", "name_ar": "قالمة"},
    {"code": "25", "name": "Constantine", "name_ar": "قسنطينة"},
    {"code": "26", "name": "Médéa", "name_ar": "المدية"},
    {"code": "27", "name": "Mostaganem", "name_ar": "مستغانم"},
    {"code": "28", "name": "M'Sila", "name_ar": "المسيلة"},
    {"code": "29", "name": "Mascara", "name_ar": "معسكر"},
    {"code": "30", "name": "Ouargla", "name_ar": "ورقلة"},
    {"code": "31", "name": "Oran", "name_ar": "وهران"},
    {"code": "32", "name": "El Bayadh", "name_ar": "البيض"},
    {"code": "33", "name": "Illizi", "name_ar": "إليزي"},
    {"code": "34", "name": "Bordj Bou Arréridj", "name_ar": "برج بوعريريج"},
    {"code": "35", "name": "Boumerdès", "name_ar": "بومرداس"},
    {"code": "36", "name": "El Tarf", "name_ar": "الطارف"},
    {"code": "37", "name": "Tindouf", "name_ar": "تندوف"},
    {"code": "38", "name": "Tissemsilt", "name_ar": "تيسمسيلت"},
    {"code": "39", "name": "El Oued", "name_ar": "الوادي"},
    {"code": "40", "name": "Khenchela", "name_ar": "خنشلة"},
    {"code": "41", "name": "Souk Ahras", "name_ar": "سوق أهراس"},
    {"code": "42", "name": "Tipaza", "name_ar": "تيبازة"},
    {"code": "43", "name": "Mila", "name_ar": "ميلة"},
    {"code": "44", "name": "Aïn Defla", "name_ar": "عين الدفلى"},
    {"code": "45", "name": "Naâma", "name_ar": "النعامة"},
    {"code": "46", "name": "Aïn Témouchent", "name_ar": "عين تموشنت"},
    {"code": "47", "name": "Ghardaïa", "name_ar": "غرداية"},
    {"code": "48", "name": "Relizane", "name_ar": "غليزان"},
    {"code": "49", "name": "Timimoun", "name_ar": "تيميمون"},
    {"code": "50", "name": "Bordj Badji Mokhtar", "name_ar": "برج باجي مختار"},
    {"code": "51", "name": "Ouled Djellal", "name_ar": "أولاد جلال"},
    {"code": "52", "name": "Béni Abbès", "name_ar": "بني عباس"},
    {"code": "53", "name": "In Salah", "name_ar": "عين صالح"},
    {"code": "54", "name": "In Guezzam", "name_ar": "عين قزام"},
    {"code": "55", "name": "Touggourt", "name_ar": "تقرت"},
    {"code": "56", "name": "Djanet", "name_ar": "جانت"},
    {"code": "57", "name": "El M'Ghair", "name_ar": "المغير"},
    {"code": "58", "name": "El Meniaa", "name_ar": "المنيعة"},
]

def hash_password(password: str, salt: str = None) -> str:
    if not salt:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return f"{salt}${pwd_hash}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, pwd_hash = stored.split("$", 1)
        expected = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return hmac.compare_digest(pwd_hash, expected)
    except Exception:
        return False

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'client', -- client, freelancer, business, admin
        active_role TEXT NOT NULL DEFAULT 'client',
        roles_enabled TEXT NOT NULL DEFAULT '["client"]', -- JSON list of roles user can switch between
        avatar_url TEXT,
        headline TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        wilaya TEXT DEFAULT '16 - Alger',
        languages TEXT DEFAULT '["Français", "العربية", "English"]',
        hourly_rate_dzd INTEGER DEFAULT 2500,
        is_verified INTEGER DEFAULT 0,
        is_pro INTEGER DEFAULT 0,
        pro_status TEXT DEFAULT 'none', -- none, pending, approved, rejected
        status TEXT DEFAULT 'active', -- active, suspended
        availability TEXT DEFAULT 'available', -- available, busy, vacation
        oauth_provider TEXT DEFAULT 'email',
        wallet_balance_dzd INTEGER DEFAULT 0,
        is_demo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_fr TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        image_url TEXT NOT NULL,
        featured INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        name_fr TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category_slug TEXT
    );

    CREATE TABLE IF NOT EXISTS user_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        level TEXT DEFAULT 'Expert', -- Beginner, Intermediate, Expert
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS portfolio_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        project_url TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        freelancer_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        subcategory_id INTEGER,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        skills_tags TEXT DEFAULT '[]',
        cover_image TEXT NOT NULL,
        gallery_images TEXT DEFAULT '[]',
        faqs TEXT DEFAULT '[]',
        requirements_prompt TEXT DEFAULT 'Please share your project brief, brand guidelines, and target deadline.',
        status TEXT NOT NULL DEFAULT 'approved', -- draft, paused, pending_review, approved, rejected
        is_featured INTEGER DEFAULT 0,
        is_sponsored INTEGER DEFAULT 0,
        is_pro_listing INTEGER DEFAULT 0,
        starting_price_dzd INTEGER NOT NULL DEFAULT 5000,
        delivery_days INTEGER NOT NULL DEFAULT 3,
        rating_avg REAL DEFAULT 0.0,
        review_count INTEGER DEFAULT 0,
        orders_in_queue INTEGER DEFAULT 0,
        is_demo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS service_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        tier TEXT NOT NULL, -- basic, standard, premium
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price_dzd INTEGER NOT NULL,
        delivery_days INTEGER NOT NULL,
        revisions INTEGER NOT NULL,
        features TEXT DEFAULT '[]',
        FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS service_extras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price_dzd INTEGER NOT NULL,
        additional_days INTEGER DEFAULT 0,
        FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        target_type TEXT NOT NULL, -- service, freelancer
        target_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, target_type, target_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        service_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        freelancer_id INTEGER NOT NULL,
        package_tier TEXT NOT NULL,
        package_name TEXT NOT NULL,
        extras_json TEXT DEFAULT '[]',
        subtotal_dzd INTEGER NOT NULL,
        commission_rate_pct INTEGER NOT NULL DEFAULT 10,
        platform_fee_dzd INTEGER NOT NULL,
        total_dzd INTEGER NOT NULL,
        freelancer_net_dzd INTEGER NOT NULL,
        currency TEXT DEFAULT 'DZD',
        requirements_submitted TEXT NOT NULL,
        reference_files TEXT DEFAULT '[]',
        delivery_days INTEGER NOT NULL,
        revisions_allowed INTEGER NOT NULL DEFAULT 2,
        revisions_used INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'in_progress', -- pending_payment, in_progress, delivered, revision_requested, completed, cancelled, disputed
        payment_method TEXT DEFAULT 'CIB / Edahabia Sandbox',
        payment_status TEXT DEFAULT 'paid_sandbox',
        is_demo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(freelancer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT NOT NULL,
        actor_id INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        freelancer_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        files_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER UNIQUE NOT NULL,
        service_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        freelancer_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        communication_rating INTEGER DEFAULT 5,
        quality_rating INTEGER DEFAULT 5,
        comment TEXT NOT NULL,
        status TEXT DEFAULT 'published', -- published, hidden, flagged
        created_at TEXT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(freelancer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        order_id INTEGER,
        subject TEXT DEFAULT '',
        updated_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(user2_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        body TEXT NOT NULL,
        attachments_json TEXT DEFAULT '[]',
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link_route TEXT DEFAULT '',
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_code TEXT UNIQUE NOT NULL,
        client_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        skills_required TEXT DEFAULT '[]',
        budget_min_dzd INTEGER NOT NULL,
        budget_max_dzd INTEGER NOT NULL,
        currency TEXT DEFAULT 'DZD',
        deadline_days INTEGER NOT NULL,
        experience_level TEXT DEFAULT 'Intermediate',
        wilaya_pref TEXT DEFAULT 'All Algeria',
        language_pref TEXT DEFAULT 'Français / العربية',
        attachments_json TEXT DEFAULT '[]',
        status TEXT DEFAULT 'open', -- open, awarded, in_progress, completed, closed
        selected_proposal_id INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        freelancer_id INTEGER NOT NULL,
        bid_amount_dzd INTEGER NOT NULL,
        delivery_days INTEGER NOT NULL,
        cover_letter TEXT NOT NULL,
        milestones_json TEXT DEFAULT '[]',
        status TEXT DEFAULT 'pending', -- pending, accepted, rejected
        created_at TEXT NOT NULL,
        UNIQUE(project_id, freelancer_id),
        FOREIGN KEY(project_id) REFERENCES project_requests(id) ON DELETE CASCADE,
        FOREIGN KEY(freelancer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER UNIQUE NOT NULL,
        company_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        company_size TEXT DEFAULT '11-50 employees',
        rc_nif_number TEXT DEFAULT '',
        wilaya TEXT DEFAULT '16 - Alger',
        website TEXT DEFAULT '',
        description TEXT DEFAULT '',
        verified_business INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS business_team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id INTEGER NOT NULL,
        member_email TEXT NOT NULL,
        member_name TEXT NOT NULL,
        role_permission TEXT DEFAULT 'Hiring Manager', -- Admin, Hiring Manager, Finance, Viewer
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pro_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        specialty TEXT NOT NULL,
        years_experience INTEGER NOT NULL,
        portfolio_links TEXT NOT NULL,
        motivation TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        admin_notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        reviewed_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tx_reference TEXT UNIQUE NOT NULL,
        order_id INTEGER,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- payment, escrow_release, platform_commission, refund, payout
        amount_dzd INTEGER NOT NULL,
        currency TEXT DEFAULT 'DZD',
        provider TEXT DEFAULT 'Satim CIB / Edahabia Sandbox',
        status TEXT DEFAULT 'completed', -- pending, completed, failed, refunded
        is_sandbox INTEGER DEFAULT 1,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        freelancer_id INTEGER NOT NULL,
        amount_dzd INTEGER NOT NULL,
        method TEXT NOT NULL, -- CCP / BaridiMob, Bank Transfer (RIB), Paysera
        account_details TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, processed, rejected
        processed_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(freelancer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports_disputes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        target_type TEXT NOT NULL, -- service, user, order_dispute
        target_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        details TEXT NOT NULL,
        status TEXT DEFAULT 'open', -- open, under_review, resolved, dismissed
        resolution_notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        FOREIGN KEY(reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        category TEXT DEFAULT 'General Inquiry',
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open', -- open, answered, closed
        admin_reply TEXT DEFAULT '',
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS promotions_banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        cta_text TEXT NOT NULL,
        cta_link TEXT NOT NULL,
        badge_text TEXT DEFAULT 'DEMO PLACEMENT',
        bg_gradient TEXT DEFAULT 'linear-gradient(135deg, #25083F 0%, #8B43F5 100%)',
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id INTEGER,
        actor_email TEXT,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        details TEXT,
        created_at TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()

def recalculate_service_rating(conn, service_id: int):
    cur = conn.cursor()
    cur.execute(
        "SELECT COUNT(*) as cnt, COALESCE(AVG(rating), 0.0) as avg_r FROM reviews WHERE service_id = ? AND status = 'published'",
        (service_id,)
    )
    row = cur.fetchone()
    cnt = row["cnt"] if row else 0
    avg_r = round(float(row["avg_r"]), 2) if row and cnt > 0 else 0.0
    cur.execute(
        "UPDATE services SET rating_avg = ?, review_count = ? WHERE id = ?",
        (avg_r, cnt, service_id)
    )
    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database schema initialized at", DB_PATH)
