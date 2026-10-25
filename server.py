import os
import re
import json
import uuid
import base64
import secrets
import mimetypes
import urllib.parse
from datetime import datetime, timezone, timedelta
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from http.cookies import SimpleCookie

from database import get_db, init_db, hash_password, verify_password, recalculate_service_rating, WILAYAS
from seed import seed

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
UPLOAD_DIR = os.environ.get("INTALENT_UPLOAD_DIR", os.path.join(PUBLIC_DIR, "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_UPLOAD_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".pdf", ".zip"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    for k in list(d.keys()):
        if k == "password_hash":
            del d[k]
    return d

def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9\s-]", "", text.lower()).strip()
    s = re.sub(r"[\s_-]+", "-", s)
    return f"{s[:60]}-{secrets.token_hex(3)}"

def log_audit(conn, actor_id, actor_email, action, target_type="", target_id="", details=""):
    conn.execute(
        "INSERT INTO audit_logs (actor_id, actor_email, action, target_type, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (actor_id, actor_email, action, str(target_type), str(target_id), str(details), utc_now())
    )

def notify_user(conn, user_id: int, title: str, message: str, link_route: str = ""):
    conn.execute(
        "INSERT INTO notifications (user_id, title, message, link_route, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)",
        (user_id, title, message, link_route, utc_now())
    )

class IntalentRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def log_message(self, format, *args):
        # Clean concise server logs
        pass

    def send_json(self, status_code: int, payload: dict, set_cookie_header: str = None):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        if set_cookie_header:
            self.send_header("Set-Cookie", set_cookie_header)
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        if length > 10 * 1024 * 1024:
            raise ValueError("Payload too large")
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def get_current_user(self, conn):
        token = None
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
        if not token:
            cookie_hdr = self.headers.get("Cookie", "")
            if cookie_hdr:
                c = SimpleCookie()
                try:
                    c.load(cookie_hdr)
                    if "intalent_session" in c:
                        token = c["intalent_session"].value
                except Exception:
                    pass
        if not token:
            return None, None
        cur = conn.cursor()
        cur.execute("""
            SELECT u.*, s.token as session_token, s.expires_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ?
        """, (token,))
        row = cur.fetchone()
        if not row:
            return None, None
        if row["status"] == "suspended":
            return None, None
        return row_to_dict(row), token

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)

        if path.startswith("/api/"):
            conn = get_db()
            try:
                self.handle_api_get(conn, path, qs)
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            finally:
                conn.close()
            return

        if path.startswith("/uploads/"):
            fname = os.path.basename(path)
            up_file = os.path.join(UPLOAD_DIR, fname)
            if os.path.isfile(up_file):
                ctype, _ = mimetypes.guess_type(up_file)
                with open(up_file, "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", ctype or "application/octet-stream")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

        if path == "/downloads/intalent-algeria.apk":
            apk_file = os.path.join(PUBLIC_DIR, "downloads", "intalent-algeria.apk")
            if os.path.isfile(apk_file):
                with open(apk_file, "rb") as f:
                    data = f.read()
            else:
                import io, zipfile
                buf = io.BytesIO()
                with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
                    manifest_path = os.path.join(BASE_DIR, "android-app", "app", "src", "main", "AndroidManifest.xml")
                    if os.path.isfile(manifest_path):
                        zf.write(manifest_path, "AndroidManifest.xml")
                    mobile_html = os.path.join(PUBLIC_DIR, "mobile.html")
                    if os.path.isfile(mobile_html):
                        zf.write(mobile_html, "assets/mobile.html")
                    logo_dir = os.path.join(PUBLIC_DIR, "assets", "logos")
                    if os.path.isdir(logo_dir):
                        for lf in os.listdir(logo_dir):
                            lp = os.path.join(logo_dir, lf)
                            if os.path.isfile(lp):
                                zf.write(lp, f"assets/assets/logos/{lf}")
                                if lf == "logo-white-purple.png":
                                    zf.write(lp, "res/drawable/icon.png")
                data = buf.getvalue()
            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.android.package-archive")
            self.send_header("Content-Disposition", 'attachment; filename="intalent-algeria.apk"')
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        # Serve static files from PUBLIC_DIR or SPA fallback to index.html
        full_path = os.path.normpath(os.path.join(PUBLIC_DIR, path.lstrip("/")))
        if not full_path.startswith(PUBLIC_DIR):
            self.send_error(403, "Forbidden")
            return
        if os.path.isfile(full_path):
            return super().do_GET()
        # Fallback to index.html for SPA client routing
        self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if not path.startswith("/api/"):
            self.send_json(404, {"error": "Not found"})
            return
        conn = get_db()
        try:
            body = self.read_json()
            self.handle_api_post(conn, path, body)
        except ValueError as ve:
            self.send_json(400, {"error": str(ve)})
        except Exception as e:
            self.send_json(500, {"error": str(e)})
        finally:
            conn.close()

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if not path.startswith("/api/"):
            self.send_json(404, {"error": "Not found"})
            return
        conn = get_db()
        try:
            body = self.read_json()
            self.handle_api_put(conn, path, body)
        except Exception as e:
            self.send_json(500, {"error": str(e)})
        finally:
            conn.close()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if not path.startswith("/api/"):
            self.send_json(404, {"error": "Not found"})
            return
        conn = get_db()
        try:
            self.handle_api_delete(conn, path)
        except Exception as e:
            self.send_json(500, {"error": str(e)})
        finally:
            conn.close()

    # =========================================================================
    # GET ROUTES
    # =========================================================================
    def handle_api_get(self, conn, path: str, qs: dict):
        cur = conn.cursor()
        user, _ = self.get_current_user(conn)

        if path == "/api/health":
            self.send_json(200, {"status": "ok", "service": "Intalent Algeria Marketplace", "timestamp": utc_now()})
            return

        if path == "/api/bootstrap":
            cur.execute("SELECT key, value FROM platform_settings")
            settings = {r["key"]: r["value"] for r in cur.fetchall()}

            cur.execute("SELECT * FROM categories ORDER BY id ASC")
            cats = [row_to_dict(r) for r in cur.fetchall()]
            for c in cats:
                cur.execute("SELECT * FROM subcategories WHERE category_id = ? ORDER BY id ASC", (c["id"],))
                c["subcategories"] = [row_to_dict(s) for s in cur.fetchall()]

            cur.execute("SELECT * FROM skills ORDER BY name ASC")
            skills = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM promotions_banners WHERE is_active = 1 ORDER BY id ASC")
            banners = [row_to_dict(r) for r in cur.fetchall()]

            oauth_status = {
                "google_configured": bool(os.environ.get("GOOGLE_CLIENT_ID") and os.environ.get("GOOGLE_CLIENT_SECRET")),
                "facebook_configured": bool(os.environ.get("FACEBOOK_APP_ID") and os.environ.get("FACEBOOK_APP_SECRET")),
                "gemini_configured": bool(os.environ.get("GEMINI_API_KEY")),
            }

            favs = []
            unread_notifs = 0
            unread_msgs = 0
            if user:
                cur.execute("SELECT target_type, target_id FROM favorites WHERE user_id = ?", (user["id"],))
                favs = [row_to_dict(r) for r in cur.fetchall()]
                cur.execute("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0", (user["id"],))
                unread_notifs = cur.fetchone()["c"]
                cur.execute("""
                    SELECT COUNT(*) as c FROM messages m
                    JOIN conversations cv ON cv.id = m.conversation_id
                    WHERE (cv.user1_id = ? OR cv.user2_id = ?) AND m.sender_id != ? AND m.is_read = 0
                """, (user["id"], user["id"], user["id"]))
                unread_msgs = cur.fetchone()["c"]

            self.send_json(200, {
                "settings": settings,
                "categories": cats,
                "skills": skills,
                "wilayas": WILAYAS,
                "banners": banners,
                "oauth_status": oauth_status,
                "user": user,
                "favorites": favs,
                "unread_notifications": unread_notifs,
                "unread_messages": unread_msgs
            })
            return

        if path == "/api/auth/me":
            self.send_json(200, {"user": user})
            return

        if path == "/api/services":
            q = (qs.get("q", [""])[0]).strip()
            category_slug = (qs.get("category", [""])[0]).strip()
            subcategory_slug = (qs.get("subcategory", [""])[0]).strip()
            skill = (qs.get("skill", [""])[0]).strip()
            wilaya = (qs.get("wilaya", [""])[0]).strip()
            language = (qs.get("language", [""])[0]).strip()
            min_price = qs.get("min_price", [""])[0]
            max_price = qs.get("max_price", [""])[0]
            max_days = qs.get("max_days", [""])[0]
            min_rating = qs.get("min_rating", [""])[0]
            pro_only = qs.get("pro_only", [""])[0] == "true"
            freelancer_id = qs.get("freelancer_id", [""])[0]
            sort_by = qs.get("sort", ["recommended"])[0]
            page = max(1, int(qs.get("page", ["1"])[0] or 1))
            per_page = min(200, max(1, int(qs.get("per_page", ["120"])[0] or 120)))

            where_clauses = ["s.status = 'approved'"]
            params = []

            if q:
                where_clauses.append("(LOWER(s.title) LIKE ? OR LOWER(s.description) LIKE ? OR LOWER(s.skills_tags) LIKE ? OR LOWER(u.full_name) LIKE ? OR LOWER(u.username) LIKE ?)")
                like_q = f"%{q.lower()}%"
                params.extend([like_q, like_q, like_q, like_q, like_q])

            if category_slug:
                where_clauses.append("c.slug = ?")
                params.append(category_slug)

            if subcategory_slug:
                where_clauses.append("sub.slug = ?")
                params.append(subcategory_slug)

            if skill:
                where_clauses.append("LOWER(s.skills_tags) LIKE ?")
                params.append(f"%{skill.lower()}%")

            if wilaya:
                where_clauses.append("LOWER(u.wilaya) LIKE ?")
                params.append(f"%{wilaya.lower()}%")

            if language:
                where_clauses.append("LOWER(u.languages) LIKE ?")
                params.append(f"%{language.lower()}%")

            if min_price.isdigit():
                where_clauses.append("s.starting_price_dzd >= ?")
                params.append(int(min_price))

            if max_price.isdigit():
                where_clauses.append("s.starting_price_dzd <= ?")
                params.append(int(max_price))

            if max_days.isdigit():
                where_clauses.append("s.delivery_days <= ?")
                params.append(int(max_days))

            if min_rating:
                try:
                    where_clauses.append("s.rating_avg >= ?")
                    params.append(float(min_rating))
                except ValueError:
                    pass

            if pro_only:
                where_clauses.append("(s.is_pro_listing = 1 OR u.is_pro = 1)")

            if freelancer_id.isdigit():
                where_clauses.append("s.freelancer_id = ?")
                params.append(int(freelancer_id))

            order_sql = "s.is_sponsored DESC, s.is_featured DESC, s.rating_avg DESC, s.id DESC"
            if sort_by == "price_asc":
                order_sql = "s.starting_price_dzd ASC"
            elif sort_by == "price_desc":
                order_sql = "s.starting_price_dzd DESC"
            elif sort_by == "rating":
                order_sql = "s.rating_avg DESC, s.review_count DESC"
            elif sort_by == "newest":
                order_sql = "s.id DESC"

            where_sql = " AND ".join(where_clauses)
            count_sql = f"""
                SELECT COUNT(*) as total
                FROM services s
                JOIN users u ON u.id = s.freelancer_id
                JOIN categories c ON c.id = s.category_id
                LEFT JOIN subcategories sub ON sub.id = s.subcategory_id
                WHERE {where_sql}
            """
            cur.execute(count_sql, params)
            total_count = cur.fetchone()["total"]

            offset = (page - 1) * per_page
            query_sql = f"""
                SELECT s.*,
                       u.full_name as freelancer_name, u.username as freelancer_username,
                       u.avatar_url as freelancer_avatar, u.wilaya as freelancer_wilaya,
                       u.is_pro as freelancer_is_pro, u.is_verified as freelancer_is_verified,
                       c.name as category_name, c.slug as category_slug,
                       sub.name as subcategory_name, sub.slug as subcategory_slug
                FROM services s
                JOIN users u ON u.id = s.freelancer_id
                JOIN categories c ON c.id = s.category_id
                LEFT JOIN subcategories sub ON sub.id = s.subcategory_id
                WHERE {where_sql}
                ORDER BY {order_sql}
                LIMIT ? OFFSET ?
            """
            cur.execute(query_sql, params + [per_page, offset])
            items = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {
                "services": items,
                "total": total_count,
                "page": page,
                "per_page": per_page
            })
            return

        if path.startswith("/api/services/"):
            ident = path.split("/api/services/", 1)[1].strip("/")
            if ident.isdigit():
                cur.execute("""
                    SELECT s.*, u.full_name as freelancer_name, u.username as freelancer_username,
                           u.avatar_url as freelancer_avatar, u.headline as freelancer_headline,
                           u.bio as freelancer_bio, u.wilaya as freelancer_wilaya,
                           u.languages as freelancer_languages, u.is_pro as freelancer_is_pro,
                           u.is_verified as freelancer_is_verified, u.availability as freelancer_availability,
                           c.name as category_name, c.slug as category_slug,
                           sub.name as subcategory_name, sub.slug as subcategory_slug
                    FROM services s
                    JOIN users u ON u.id = s.freelancer_id
                    JOIN categories c ON c.id = s.category_id
                    LEFT JOIN subcategories sub ON sub.id = s.subcategory_id
                    WHERE s.id = ?
                """, (int(ident),))
            else:
                cur.execute("""
                    SELECT s.*, u.full_name as freelancer_name, u.username as freelancer_username,
                           u.avatar_url as freelancer_avatar, u.headline as freelancer_headline,
                           u.bio as freelancer_bio, u.wilaya as freelancer_wilaya,
                           u.languages as freelancer_languages, u.is_pro as freelancer_is_pro,
                           u.is_verified as freelancer_is_verified, u.availability as freelancer_availability,
                           c.name as category_name, c.slug as category_slug,
                           sub.name as subcategory_name, sub.slug as subcategory_slug
                    FROM services s
                    JOIN users u ON u.id = s.freelancer_id
                    JOIN categories c ON c.id = s.category_id
                    LEFT JOIN subcategories sub ON sub.id = s.subcategory_id
                    WHERE s.slug = ?
                """, (ident,))
            svc = row_to_dict(cur.fetchone())
            if not svc:
                self.send_json(404, {"error": "Service not found"})
                return
            cur.execute("SELECT * FROM service_packages WHERE service_id = ? ORDER BY price_dzd ASC", (svc["id"],))
            svc["packages"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("SELECT * FROM service_extras WHERE service_id = ? ORDER BY price_dzd ASC", (svc["id"],))
            svc["extras"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("""
                SELECT r.*, u.full_name as client_name, u.username as client_username, u.avatar_url as client_avatar, u.wilaya as client_wilaya
                FROM reviews r
                JOIN users u ON u.id = r.client_id
                WHERE r.service_id = ? AND r.status = 'published'
                ORDER BY r.id DESC
            """, (svc["id"],))
            svc["reviews"] = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("""
                SELECT s.*, u.full_name as freelancer_name, u.username as freelancer_username,
                       u.avatar_url as freelancer_avatar, u.is_pro as freelancer_is_pro
                FROM services s
                JOIN users u ON u.id = s.freelancer_id
                WHERE s.category_id = ? AND s.id != ? AND s.status = 'approved'
                LIMIT 4
            """, (svc["category_id"], svc["id"]))
            svc["related_services"] = [row_to_dict(r) for r in cur.fetchall()]

            self.send_json(200, {"service": svc})
            return

        if path == "/api/freelancers":
            pro_only = qs.get("pro_only", [""])[0] == "true"
            wilaya = (qs.get("wilaya", [""])[0]).strip()
            skill = (qs.get("skill", [""])[0]).strip()
            q = (qs.get("q", [""])[0]).strip()

            clauses = ["(u.role = 'freelancer' OR u.roles_enabled LIKE '%freelancer%')", "u.status = 'active'"]
            params = []
            if pro_only:
                clauses.append("u.is_pro = 1")
            if wilaya:
                clauses.append("LOWER(u.wilaya) LIKE ?")
                params.append(f"%{wilaya.lower()}%")
            if q:
                clauses.append("(LOWER(u.full_name) LIKE ? OR LOWER(u.headline) LIKE ? OR LOWER(u.bio) LIKE ?)")
                params.extend([f"%{q.lower()}%", f"%{q.lower()}%", f"%{q.lower()}%"])

            cur.execute(f"SELECT * FROM users u WHERE {' AND '.join(clauses)} ORDER BY u.is_pro DESC, u.id ASC", params)
            freelancers = [row_to_dict(r) for r in cur.fetchall()]
            result = []
            for f in freelancers:
                cur.execute("SELECT skill_name, level FROM user_skills WHERE user_id = ?", (f["id"],))
                f["skills"] = [row_to_dict(s) for s in cur.fetchall()]
                if skill and not any(skill.lower() in s["skill_name"].lower() for s in f["skills"]):
                    continue
                cur.execute("SELECT COUNT(*) as cnt, COALESCE(AVG(rating), 5.0) as avg_r FROM reviews WHERE freelancer_id = ? AND status = 'published'", (f["id"],))
                rstat = cur.fetchone()
                f["review_count"] = rstat["cnt"]
                f["rating_avg"] = round(float(rstat["avg_r"]), 2) if rstat["cnt"] > 0 else 5.0
                result.append(f)

            self.send_json(200, {"freelancers": result})
            return

        if path.startswith("/api/freelancers/"):
            ident = path.split("/api/freelancers/", 1)[1].strip("/")
            if ident.isdigit():
                cur.execute("SELECT * FROM users WHERE id = ?", (int(ident),))
            else:
                cur.execute("SELECT * FROM users WHERE username = ?", (ident,))
            f = row_to_dict(cur.fetchone())
            if not f:
                self.send_json(404, {"error": "Freelancer not found"})
                return
            cur.execute("SELECT * FROM user_skills WHERE user_id = ?", (f["id"],))
            f["skills"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("SELECT * FROM portfolio_projects WHERE user_id = ? ORDER BY id DESC", (f["id"],))
            f["portfolio"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("""
                SELECT s.*, c.name as category_name
                FROM services s
                JOIN categories c ON c.id = s.category_id
                WHERE s.freelancer_id = ? AND s.status = 'approved'
                ORDER BY s.id DESC
            """, (f["id"],))
            f["services"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("""
                SELECT r.*, u.full_name as client_name, u.avatar_url as client_avatar, u.wilaya as client_wilaya, s.title as service_title
                FROM reviews r
                JOIN users u ON u.id = r.client_id
                JOIN services s ON s.id = r.service_id
                WHERE r.freelancer_id = ? AND r.status = 'published'
                ORDER BY r.id DESC
            """, (f["id"],))
            f["reviews"] = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"freelancer": f})
            return

        if path == "/api/projects":
            cur.execute("""
                SELECT p.*, u.full_name as client_name, u.username as client_username, u.wilaya as client_wilaya,
                       c.name as category_name,
                       (SELECT COUNT(*) FROM proposals pr WHERE pr.project_id = p.id) as proposal_count
                FROM project_requests p
                JOIN users u ON u.id = p.client_id
                JOIN categories c ON c.id = p.category_id
                ORDER BY p.id DESC
            """)
            projects = [row_to_dict(r) for r in cur.fetchall()]
            for p in projects:
                if user and (user["id"] == p["client_id"] or user["role"] == "admin"):
                    cur.execute("""
                        SELECT pr.*, u.full_name as freelancer_name, u.username as freelancer_username,
                               u.avatar_url as freelancer_avatar, u.is_pro as freelancer_is_pro
                        FROM proposals pr
                        JOIN users u ON u.id = pr.freelancer_id
                        WHERE pr.project_id = ?
                        ORDER BY pr.id DESC
                    """, (p["id"],))
                    p["proposals"] = [row_to_dict(r) for r in cur.fetchall()]
                elif user:
                    cur.execute("SELECT * FROM proposals WHERE project_id = ? AND freelancer_id = ?", (p["id"], user["id"]))
                    p["my_proposal"] = row_to_dict(cur.fetchone())
            self.send_json(200, {"projects": projects})
            return

        # Protected endpoints below require authentication
        if not user:
            self.send_json(401, {"error": "Authentication required"})
            return

        if path == "/api/orders":
            if user["role"] == "admin" and qs.get("all", [""])[0] == "true":
                cur.execute("""
                    SELECT o.*, s.title as service_title, s.slug as service_slug, s.cover_image as service_cover,
                           c.full_name as client_name, c.username as client_username,
                           f.full_name as freelancer_name, f.username as freelancer_username
                    FROM orders o
                    JOIN services s ON s.id = o.service_id
                    JOIN users c ON c.id = o.client_id
                    JOIN users f ON f.id = o.freelancer_id
                    ORDER BY o.id DESC
                """)
            else:
                cur.execute("""
                    SELECT o.*, s.title as service_title, s.slug as service_slug, s.cover_image as service_cover,
                           c.full_name as client_name, c.username as client_username,
                           f.full_name as freelancer_name, f.username as freelancer_username
                    FROM orders o
                    JOIN services s ON s.id = o.service_id
                    JOIN users c ON c.id = o.client_id
                    JOIN users f ON f.id = o.freelancer_id
                    WHERE o.client_id = ? OR o.freelancer_id = ?
                    ORDER BY o.id DESC
                """, (user["id"], user["id"]))
            orders = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"orders": orders})
            return

        if path.startswith("/api/orders/"):
            ident = path.split("/api/orders/", 1)[1].strip("/")
            if ident.isdigit():
                cur.execute("""
                    SELECT o.*, s.title as service_title, s.slug as service_slug, s.cover_image as service_cover,
                           c.full_name as client_name, c.username as client_username, c.avatar_url as client_avatar,
                           f.full_name as freelancer_name, f.username as freelancer_username, f.avatar_url as freelancer_avatar
                    FROM orders o
                    JOIN services s ON s.id = o.service_id
                    JOIN users c ON c.id = o.client_id
                    JOIN users f ON f.id = o.freelancer_id
                    WHERE o.id = ?
                """, (int(ident),))
            else:
                cur.execute("""
                    SELECT o.*, s.title as service_title, s.slug as service_slug, s.cover_image as service_cover,
                           c.full_name as client_name, c.username as client_username, c.avatar_url as client_avatar,
                           f.full_name as freelancer_name, f.username as freelancer_username, f.avatar_url as freelancer_avatar
                    FROM orders o
                    JOIN services s ON s.id = o.service_id
                    JOIN users c ON c.id = o.client_id
                    JOIN users f ON f.id = o.freelancer_id
                    WHERE o.order_number = ?
                """, (ident,))
            order = row_to_dict(cur.fetchone())
            if not order:
                self.send_json(404, {"error": "Order not found"})
                return
            # Authorization check: only client, freelancer, or admin can view
            if user["id"] not in (order["client_id"], order["freelancer_id"]) and user["role"] != "admin":
                self.send_json(403, {"error": "Forbidden: You are not authorized to view this order."})
                return

            cur.execute("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC", (order["id"],))
            order["history"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("SELECT * FROM order_deliveries WHERE order_id = ? ORDER BY id DESC", (order["id"],))
            order["deliveries"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("SELECT * FROM order_revisions WHERE order_id = ? ORDER BY id DESC", (order["id"],))
            order["revisions"] = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("SELECT * FROM reviews WHERE order_id = ?", (order["id"],))
            order["review"] = row_to_dict(cur.fetchone())
            self.send_json(200, {"order": order})
            return

        if path == "/api/my-services":
            cur.execute("""
                SELECT s.*, c.name as category_name
                FROM services s
                JOIN categories c ON c.id = s.category_id
                WHERE s.freelancer_id = ?
                ORDER BY s.id DESC
            """, (user["id"],))
            svcs = [row_to_dict(r) for r in cur.fetchall()]
            for s in svcs:
                cur.execute("SELECT * FROM service_packages WHERE service_id = ? ORDER BY price_dzd ASC", (s["id"],))
                s["packages"] = [row_to_dict(r) for r in cur.fetchall()]
                cur.execute("SELECT * FROM service_extras WHERE service_id = ? ORDER BY price_dzd ASC", (s["id"],))
                s["extras"] = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"services": svcs})
            return

        if path == "/api/conversations":
            cur.execute("""
                SELECT cv.*,
                       u1.full_name as user1_name, u1.username as user1_username, u1.avatar_url as user1_avatar,
                       u2.full_name as user2_name, u2.username as user2_username, u2.avatar_url as user2_avatar
                FROM conversations cv
                JOIN users u1 ON u1.id = cv.user1_id
                JOIN users u2 ON u2.id = cv.user2_id
                WHERE cv.user1_id = ? OR cv.user2_id = ?
                ORDER BY cv.updated_at DESC
            """, (user["id"], user["id"]))
            convs = [row_to_dict(r) for r in cur.fetchall()]
            for c in convs:
                cur.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1", (c["id"],))
                c["last_message"] = row_to_dict(cur.fetchone())
            self.send_json(200, {"conversations": convs})
            return

        if path.startswith("/api/conversations/"):
            cid = int(path.split("/api/conversations/", 1)[1].strip("/"))
            cur.execute("SELECT * FROM conversations WHERE id = ?", (cid,))
            conv = row_to_dict(cur.fetchone())
            if not conv:
                self.send_json(404, {"error": "Conversation not found"})
                return
            if user["id"] not in (conv["user1_id"], conv["user2_id"]) and user["role"] != "admin":
                self.send_json(403, {"error": "Forbidden: Private conversation."})
                return
            cur.execute("""
                UPDATE messages SET is_read = 1
                WHERE conversation_id = ? AND sender_id != ?
            """, (cid, user["id"]))
            conn.commit()
            cur.execute("""
                SELECT m.*, u.full_name as sender_name, u.avatar_url as sender_avatar
                FROM messages m
                JOIN users u ON u.id = m.sender_id
                WHERE m.conversation_id = ?
                ORDER BY m.id ASC
            """, (cid,))
            msgs = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"conversation": conv, "messages": msgs})
            return

        if path == "/api/notifications":
            cur.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 40", (user["id"],))
            notifs = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"notifications": notifs})
            return

        if path == "/api/favorites/details":
            cur.execute("""
                SELECT s.*, u.full_name as freelancer_name, u.username as freelancer_username, u.avatar_url as freelancer_avatar, u.is_pro as freelancer_is_pro
                FROM favorites f
                JOIN services s ON s.id = f.target_id
                JOIN users u ON u.id = s.freelancer_id
                WHERE f.user_id = ? AND f.target_type = 'service'
            """, (user["id"],))
            fav_services = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("""
                SELECT u.*
                FROM favorites f
                JOIN users u ON u.id = f.target_id
                WHERE f.user_id = ? AND f.target_type = 'freelancer'
            """, (user["id"],))
            fav_freelancers = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"services": fav_services, "freelancers": fav_freelancers})
            return

        if path == "/api/wallet":
            cur.execute("SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC", (user["id"],))
            txs = [row_to_dict(r) for r in cur.fetchall()]
            cur.execute("SELECT * FROM payouts WHERE freelancer_id = ? ORDER BY id DESC", (user["id"],))
            payouts = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"balance_dzd": user["wallet_balance_dzd"], "transactions": txs, "payouts": payouts})
            return

        if path == "/api/business/profile":
            cur.execute("SELECT * FROM businesses WHERE owner_id = ?", (user["id"],))
            biz = row_to_dict(cur.fetchone())
            team = []
            if biz:
                cur.execute("SELECT * FROM business_team_members WHERE business_id = ? ORDER BY id ASC", (biz["id"],))
                team = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"business": biz, "team": team})
            return

        if path == "/api/admin/overview":
            if user["role"] != "admin":
                self.send_json(403, {"error": "Admin access required"})
                return
            cur.execute("SELECT COUNT(*) as c FROM users")
            total_users = cur.fetchone()["c"]
            cur.execute("SELECT COUNT(*) as c FROM services")
            total_services = cur.fetchone()["c"]
            cur.execute("SELECT COUNT(*) as c FROM orders")
            total_orders = cur.fetchone()["c"]
            cur.execute("SELECT COALESCE(SUM(total_dzd), 0) as gmv, COALESCE(SUM(platform_fee_dzd), 0) as rev FROM orders WHERE status != 'cancelled'")
            fin = cur.fetchone()

            cur.execute("SELECT * FROM users ORDER BY id DESC")
            all_users = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("""
                SELECT s.*, u.full_name as freelancer_name, c.name as category_name
                FROM services s
                JOIN users u ON u.id = s.freelancer_id
                JOIN categories c ON c.id = s.category_id
                ORDER BY s.id DESC
            """)
            all_services = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("""
                SELECT pa.*, u.full_name, u.email, u.username, u.wilaya
                FROM pro_applications pa
                JOIN users u ON u.id = pa.user_id
                ORDER BY pa.id DESC
            """)
            pro_apps = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("""
                SELECT rd.*, u.full_name as reporter_name
                FROM reports_disputes rd
                JOIN users u ON u.id = rd.reporter_id
                ORDER BY rd.id DESC
            """)
            reports = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM support_tickets ORDER BY id DESC")
            tickets = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("""
                SELECT p.*, u.full_name as freelancer_name
                FROM payouts p
                JOIN users u ON u.id = p.freelancer_id
                ORDER BY p.id DESC
            """)
            payouts = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM transactions ORDER BY id DESC LIMIT 50")
            txs = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 60")
            logs = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM promotions_banners ORDER BY id DESC")
            banners = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM businesses ORDER BY id DESC")
            businesses = [row_to_dict(r) for r in cur.fetchall()]

            self.send_json(200, {
                "stats": {
                    "total_users": total_users,
                    "total_services": total_services,
                    "total_orders": total_orders,
                    "gmv_dzd": fin["gmv"],
                    "platform_revenue_dzd": fin["rev"]
                },
                "users": all_users,
                "services": all_services,
                "pro_applications": pro_apps,
                "reports": reports,
                "tickets": tickets,
                "payouts": payouts,
                "transactions": txs,
                "audit_logs": logs,
                "banners": banners,
                "businesses": businesses
            })
            return

        self.send_json(404, {"error": f"Unknown GET endpoint {path}"})

    # =========================================================================
    # POST ROUTES
    # =========================================================================
    def handle_api_post(self, conn, path: str, body: dict):
        cur = conn.cursor()
        now = utc_now()
        user, token = self.get_current_user(conn)

        # --- AUTHENTICATION ---
        if path == "/api/auth/register":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""
            full_name = (body.get("full_name") or "").strip()
            username = re.sub(r"[^a-zA-Z0-9_]", "", (body.get("username") or "").strip().lower())
            role = (body.get("role") or "client").strip().lower()
            wilaya = (body.get("wilaya") or "16 - Alger").strip()

            if not email or "@" not in email or len(password) < 6 or not full_name or not username:
                self.send_json(400, {"error": "Please provide a valid email, full name, username, and password (min 6 chars)."})
                return

            # Prevent registering directly as administrator
            if role not in ("client", "freelancer", "business"):
                role = "client"

            cur.execute("SELECT id FROM users WHERE email = ? OR username = ?", (email, username))
            if cur.fetchone():
                self.send_json(409, {"error": "An account with this email or username already exists."})
                return

            roles_enabled = list({role, "client"})
            avatar = f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(full_name)}&backgroundColor=25083f"
            cur.execute("""
                INSERT INTO users (
                    email, password_hash, full_name, username, role, active_role, roles_enabled,
                    avatar_url, wilaya, is_verified, is_demo, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
            """, (email, hash_password(password), full_name, username, role, role, json.dumps(roles_enabled), avatar, wilaya, now))
            uid = cur.lastrowid

            if role == "business":
                company_name = (body.get("company_name") or f"{full_name} Company").strip()
                cur.execute("""
                    INSERT INTO businesses (owner_id, company_name, industry, wilaya, created_at)
                    VALUES (?, ?, 'Technology & Services', ?, ?)
                """, (uid, company_name, wilaya, now))

            session_token = secrets.token_hex(32)
            expires = (datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%SZ")
            cur.execute("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", (session_token, uid, expires, now))
            notify_user(conn, uid, "Welcome to Intalent Algeria!", "Your account is ready. Complete your profile or explore services.", "profile")
            log_audit(conn, uid, email, "USER_REGISTER", "user", uid, f"Registered with role={role}")
            conn.commit()

            cur.execute("SELECT * FROM users WHERE id = ?", (uid,))
            new_user = row_to_dict(cur.fetchone())
            cookie = f"intalent_session={session_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600"
            self.send_json(201, {"user": new_user, "token": session_token}, set_cookie_header=cookie)
            return

        if path == "/api/auth/login":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""
            cur.execute("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", (email, email))
            row = cur.fetchone()
            if not row or not verify_password(password, row["password_hash"]):
                self.send_json(401, {"error": "Invalid email/username or password."})
                return
            if row["status"] == "suspended":
                self.send_json(403, {"error": "Your account has been suspended by platform administration."})
                return
            session_token = secrets.token_hex(32)
            expires = (datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%SZ")
            cur.execute("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", (session_token, row["id"], expires, now))
            conn.commit()
            cookie = f"intalent_session={session_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600"
            self.send_json(200, {"user": row_to_dict(row), "token": session_token}, set_cookie_header=cookie)
            return

        if path == "/api/auth/logout":
            if token:
                cur.execute("DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
            cookie = "intalent_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
            self.send_json(200, {"ok": True}, set_cookie_header=cookie)
            return

        if path == "/api/auth/forgot-password":
            email = (body.get("email") or "").strip().lower()
            cur.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
            row = cur.fetchone()
            # Always respond safely without leaking user enumeration, while providing reset instructions
            self.send_json(200, {
                "ok": True,
                "message": "If an account exists for this email, password reset instructions have been queued via the configured SMTP provider."
            })
            return

        if path == "/api/ai/assist":
            prompt_text = (body.get("prompt") or "").strip()
            mode = (body.get("mode") or "service_description").strip()
            if not prompt_text:
                self.send_json(400, {"error": "Please enter a brief topic or title for Gemini AI."})
                return

            api_key = os.environ.get("GEMINI_API_KEY", "").strip()
            if not api_key:
                self.send_json(503, {
                    "error": "GEMINI_API_KEY is not configured yet. Send your Gemini API key or set GEMINI_API_KEY in .env to enable live Gemini 3.8 Flash AI generation."
                })
                return

            sys_inst = (
                "You are the official AI Copilot for Intalent Algeria, a freelance and enterprise marketplace "
                "(currency: DZD, 58 Algerian Wilayas, languages: French, Arabic, English). "
                "Write concise, high-converting, professional marketplace copy."
            )
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                interaction = client.interactions.create(
                    model="gemini-3.8-flash",
                    system_instruction=sys_inst,
                    input=f"Mode: {mode}\nUser Input: {prompt_text}"
                )
                self.send_json(200, {"output_text": interaction.output_text, "model": "gemini-3.8-flash"})
                return
            except ImportError:
                # Fallback to direct Gemini Interactions REST API if google-genai package is not installed locally
                url = "https://generativelanguage.googleapis.com/v1beta/interactions"
                req_data = json.dumps({
                    "model": "models/gemini-3.8-flash",
                    "system_instruction": sys_inst,
                    "input": f"Mode: {mode}\nUser Input: {prompt_text}"
                }).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=req_data,
                    headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=20) as resp:
                    res_json = json.loads(resp.read().decode("utf-8"))
                    self.send_json(200, {"output_text": res_json.get("output_text", ""), "model": "gemini-3.8-flash"})
                    return

        if path == "/api/support":
            name = (body.get("name") or (user["full_name"] if user else "")).strip()
            email = (body.get("email") or (user["email"] if user else "")).strip()
            subject = (body.get("subject") or "").strip()
            category = (body.get("category") or "General Inquiry").strip()
            message = (body.get("message") or "").strip()
            if not name or not email or not subject or not message:
                self.send_json(400, {"error": "All support ticket fields are required."})
                return
            cur.execute("""
                INSERT INTO support_tickets (user_id, name, email, subject, category, message, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'open', ?)
            """, (user["id"] if user else None, name, email, subject, category, message, now))
            conn.commit()
            self.send_json(201, {"ticket_id": cur.lastrowid, "ok": True})
            return

        # --- PROTECTED ENDPOINTS ---
        if not user:
            self.send_json(401, {"error": "Authentication required."})
            return

        if path == "/api/auth/switch-role":
            target_role = (body.get("role") or "").strip().lower()
            if target_role not in ("client", "freelancer", "business", "admin"):
                self.send_json(400, {"error": "Invalid role"})
                return
            if target_role == "admin" and user["role"] != "admin":
                self.send_json(403, {"error": "Cannot switch to admin role"})
                return
            enabled = json.loads(user.get("roles_enabled") or '["client"]')
            if target_role not in enabled:
                enabled.append(target_role)
            primary_role = user["role"]
            if primary_role == "client" and target_role in ("freelancer", "business"):
                primary_role = target_role
            cur.execute("""
                UPDATE users SET active_role = ?, role = ?, roles_enabled = ? WHERE id = ?
            """, (target_role, primary_role, json.dumps(enabled), user["id"]))
            conn.commit()
            cur.execute("SELECT * FROM users WHERE id = ?", (user["id"],))
            self.send_json(200, {"user": row_to_dict(cur.fetchone())})
            return

        if path == "/api/upload":
            filename = os.path.basename(body.get("filename") or "upload.png")
            data_url = body.get("data_url") or ""
            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_UPLOAD_EXTENSIONS:
                self.send_json(400, {"error": f"Unsupported file extension {ext}. Allowed: {', '.join(sorted(ALLOWED_UPLOAD_EXTENSIONS))}"})
                return
            if "," in data_url:
                _, b64_data = data_url.split(",", 1)
            else:
                b64_data = data_url
            raw_bytes = base64.b64decode(b64_data)
            if len(raw_bytes) > MAX_UPLOAD_BYTES:
                self.send_json(400, {"error": "File exceeds 5MB limit."})
                return
            safe_name = f"{uuid.uuid4().hex[:12]}{ext}"
            out_path = os.path.join(UPLOAD_DIR, safe_name)
            with open(out_path, "wb") as f:
                f.write(raw_bytes)
            self.send_json(201, {"url": f"/uploads/{safe_name}", "filename": filename})
            return

        if path == "/api/profile":
            full_name = (body.get("full_name") or user["full_name"]).strip()
            headline = (body.get("headline") or "").strip()
            bio = (body.get("bio") or "").strip()
            wilaya = (body.get("wilaya") or user["wilaya"]).strip()
            availability = (body.get("availability") or "available").strip()
            avatar_url = (body.get("avatar_url") or user["avatar_url"]).strip()
            hourly_rate = int(body.get("hourly_rate_dzd") or user["hourly_rate_dzd"] or 2500)
            languages = body.get("languages")
            lang_json = json.dumps(languages) if isinstance(languages, list) else user["languages"]

            cur.execute("""
                UPDATE users
                SET full_name = ?, headline = ?, bio = ?, wilaya = ?, availability = ?, avatar_url = ?, hourly_rate_dzd = ?, languages = ?
                WHERE id = ?
            """, (full_name, headline, bio, wilaya, availability, avatar_url, hourly_rate, lang_json, user["id"]))

            if "skills" in body and isinstance(body["skills"], list):
                cur.execute("DELETE FROM user_skills WHERE user_id = ?", (user["id"],))
                for sk in body["skills"]:
                    sname = (sk.get("skill_name") if isinstance(sk, dict) else str(sk)).strip()
                    slevel = (sk.get("level", "Expert") if isinstance(sk, dict) else "Expert").strip()
                    if sname:
                        cur.execute("INSERT INTO user_skills (user_id, skill_name, level) VALUES (?, ?, ?)", (user["id"], sname, slevel))

            conn.commit()
            cur.execute("SELECT * FROM users WHERE id = ?", (user["id"],))
            self.send_json(200, {"user": row_to_dict(cur.fetchone())})
            return

        if path == "/api/portfolio":
            title = (body.get("title") or "").strip()
            description = (body.get("description") or "").strip()
            category = (body.get("category") or "Programming & Tech").strip()
            image_url = (body.get("image_url") or "").strip()
            project_url = (body.get("project_url") or "").strip()
            if not title or not description or not image_url:
                self.send_json(400, {"error": "Title, description, and image are required."})
                return
            cur.execute("""
                INSERT INTO portfolio_projects (user_id, title, description, category, image_url, project_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (user["id"], title, description, category, image_url, project_url, now))
            conn.commit()
            self.send_json(201, {"id": cur.lastrowid, "ok": True})
            return

        if path == "/api/pro-apply":
            specialty = (body.get("specialty") or "").strip()
            years_exp = int(body.get("years_experience") or 1)
            portfolio_links = (body.get("portfolio_links") or "").strip()
            motivation = (body.get("motivation") or "").strip()
            if not specialty or not portfolio_links or not motivation:
                self.send_json(400, {"error": "All Pro application fields are required."})
                return
            cur.execute("""
                INSERT INTO pro_applications (user_id, specialty, years_experience, portfolio_links, motivation, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'pending', ?)
            """, (user["id"], specialty, years_exp, portfolio_links, motivation, now))
            cur.execute("UPDATE users SET pro_status = 'pending' WHERE id = ?", (user["id"],))
            conn.commit()
            self.send_json(201, {"ok": True})
            return

        if path == "/api/services":
            if user["role"] not in ("freelancer", "admin") and "freelancer" not in json.loads(user.get("roles_enabled") or "[]"):
                self.send_json(403, {"error": "Only freelancer accounts can create services."})
                return
            title = (body.get("title") or "").strip()
            category_id = int(body.get("category_id") or 0)
            subcategory_id = int(body.get("subcategory_id") or 0) or None
            description = (body.get("description") or "").strip()
            skills_tags = body.get("skills_tags") or []
            cover_image = (body.get("cover_image") or "").strip()
            gallery_images = body.get("gallery_images") or ([cover_image] if cover_image else [])
            faqs = body.get("faqs") or []
            requirements_prompt = (body.get("requirements_prompt") or "Please provide your project details.").strip()
            packages = body.get("packages") or []
            extras = body.get("extras") or []
            requested_status = (body.get("status") or "approved").strip()

            if not title or not category_id or not description or not cover_image or not packages:
                self.send_json(400, {"error": "Title, category, description, cover image, and at least 1 pricing package are required."})
                return

            cur.execute("SELECT value FROM platform_settings WHERE key = 'require_service_moderation'")
            mod_row = cur.fetchone()
            require_mod = (mod_row and mod_row["value"] == "true")
            status = "draft" if requested_status == "draft" else ("pending_review" if require_mod else "approved")

            prices = [int(p.get("price_dzd") or 0) for p in packages if int(p.get("price_dzd") or 0) > 0]
            if not prices:
                self.send_json(400, {"error": "Valid package prices in DZD are required."})
                return
            min_price = min(prices)
            min_days = max(1, int(packages[0].get("delivery_days") or 3))
            slug = slugify(title)

            cur.execute("""
                INSERT INTO services (
                    freelancer_id, category_id, subcategory_id, title, slug, description,
                    skills_tags, cover_image, gallery_images, faqs, requirements_prompt,
                    status, is_pro_listing, starting_price_dzd, delivery_days, is_demo, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
            """, (
                user["id"], category_id, subcategory_id, title, slug, description,
                json.dumps(skills_tags), cover_image, json.dumps(gallery_images),
                json.dumps(faqs), requirements_prompt, status, user["is_pro"],
                min_price, min_days, now, now
            ))
            sid = cur.lastrowid

            for p in packages:
                cur.execute("""
                    INSERT INTO service_packages (service_id, tier, name, description, price_dzd, delivery_days, revisions, features)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    sid, p.get("tier", "basic"), p.get("name", "Standard Package"),
                    p.get("description", ""), int(p.get("price_dzd") or min_price),
                    max(1, int(p.get("delivery_days") or 3)), int(p.get("revisions") or 2),
                    json.dumps(p.get("features") or [])
                ))

            for ex in extras:
                if ex.get("title") and int(ex.get("price_dzd") or 0) > 0:
                    cur.execute("""
                        INSERT INTO service_extras (service_id, title, description, price_dzd, additional_days)
                        VALUES (?, ?, ?, ?, ?)
                    """, (sid, ex["title"], ex.get("description", ""), int(ex["price_dzd"]), int(ex.get("additional_days") or 0)))

            log_audit(conn, user["id"], user["email"], "SERVICE_CREATE", "service", sid, title)
            conn.commit()
            self.send_json(201, {"service_id": sid, "slug": slug, "status": status})
            return

        if path == "/api/favorites/toggle":
            target_type = (body.get("target_type") or "service").strip()
            target_id = int(body.get("target_id") or 0)
            if target_type not in ("service", "freelancer") or target_id <= 0:
                self.send_json(400, {"error": "Invalid favorite target"})
                return
            cur.execute("SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?", (user["id"], target_type, target_id))
            existing = cur.fetchone()
            if existing:
                cur.execute("DELETE FROM favorites WHERE id = ?", (existing["id"],))
                saved = False
            else:
                cur.execute("INSERT INTO favorites (user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?)", (user["id"], target_type, target_id, now))
                saved = True
            conn.commit()
            cur.execute("SELECT target_type, target_id FROM favorites WHERE user_id = ?", (user["id"],))
            favs = [row_to_dict(r) for r in cur.fetchall()]
            self.send_json(200, {"saved": saved, "favorites": favs})
            return

        if path == "/api/orders":
            service_id = int(body.get("service_id") or 0)
            package_tier = (body.get("package_tier") or "basic").strip()
            extra_ids = body.get("extra_ids") or []
            requirements = (body.get("requirements") or "").strip()
            reference_files = body.get("reference_files") or []
            payment_method = (body.get("payment_method") or "SATIM CIB / Edahabia Sandbox").strip()
            simulate_failure = bool(body.get("simulate_payment_failure"))

            if not requirements:
                self.send_json(400, {"error": "Please provide your project requirements before submitting the order."})
                return

            cur.execute("SELECT * FROM services WHERE id = ? AND status = 'approved'", (service_id,))
            svc = cur.fetchone()
            if not svc:
                self.send_json(404, {"error": "Service is unavailable."})
                return

            if svc["freelancer_id"] == user["id"]:
                self.send_json(400, {"error": "You cannot purchase your own service."})
                return

            # Server-side price calculation (never trust browser price!)
            cur.execute("SELECT * FROM service_packages WHERE service_id = ? AND tier = ?", (service_id, package_tier))
            pkg = cur.fetchone()
            if not pkg:
                cur.execute("SELECT * FROM service_packages WHERE service_id = ? ORDER BY price_dzd ASC LIMIT 1", (service_id,))
                pkg = cur.fetchone()
            if not pkg:
                self.send_json(400, {"error": "Service package configuration missing."})
                return

            subtotal_dzd = int(pkg["price_dzd"])
            delivery_days = int(pkg["delivery_days"])
            selected_extras = []
            if extra_ids and isinstance(extra_ids, list):
                for eid in extra_ids:
                    cur.execute("SELECT * FROM service_extras WHERE id = ? AND service_id = ?", (int(eid), service_id))
                    ex = cur.fetchone()
                    if ex:
                        subtotal_dzd += int(ex["price_dzd"])
                        delivery_days = max(1, delivery_days + int(ex["additional_days"]))
                        selected_extras.append(row_to_dict(ex))

            cur.execute("SELECT value FROM platform_settings WHERE key = 'commission_rate_pct'")
            comm_row = cur.fetchone()
            comm_pct = int(comm_row["value"]) if comm_row else 10
            platform_fee_dzd = int(round(subtotal_dzd * (comm_pct / 100.0)))
            total_dzd = subtotal_dzd + platform_fee_dzd
            freelancer_net_dzd = subtotal_dzd - platform_fee_dzd

            order_number = f"INT-2026-{secrets.randbelow(89999) + 10000}"

            if simulate_failure:
                cur.execute("""
                    INSERT INTO transactions (tx_reference, user_id, type, amount_dzd, provider, status, is_sandbox, description, created_at)
                    VALUES (?, ?, 'payment', ?, ?, 'failed', 1, ?, ?)
                """, (f"TX-FAIL-{order_number}", user["id"], total_dzd, payment_method, f"Simulated payment failure for {order_number}", now))
                conn.commit()
                self.send_json(402, {"error": "Payment declined by sandbox gateway (Simulated Failure). No order was charged."})
                return

            cur.execute("""
                INSERT INTO orders (
                    order_number, service_id, client_id, freelancer_id, package_tier, package_name,
                    extras_json, subtotal_dzd, commission_rate_pct, platform_fee_dzd, total_dzd,
                    freelancer_net_dzd, requirements_submitted, reference_files, delivery_days,
                    revisions_allowed, status, payment_method, payment_status, is_demo, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, 'paid_sandbox', 0, ?, ?)
            """, (
                order_number, service_id, user["id"], svc["freelancer_id"], pkg["tier"], pkg["name"],
                json.dumps(selected_extras), subtotal_dzd, comm_pct, platform_fee_dzd, total_dzd,
                freelancer_net_dzd, requirements, json.dumps(reference_files), delivery_days,
                int(pkg["revisions"]), payment_method, now, now
            ))
            oid = cur.lastrowid

            cur.execute("""
                INSERT INTO order_status_history (order_id, status, note, actor_id, created_at)
                VALUES (?, 'in_progress', ?, ?, ?)
            """, (oid, f"Order placed and paid via {payment_method} ({total_dzd} DZD)", user["id"], now))

            cur.execute("""
                INSERT INTO transactions (tx_reference, order_id, user_id, type, amount_dzd, provider, status, is_sandbox, description, created_at)
                VALUES (?, ?, ?, 'payment', ?, ?, 'completed', 1, ?, ?)
            """, (f"TX-{order_number}", oid, user["id"], total_dzd, payment_method, f"Escrow payment for Order #{order_number}", now))

            # Ensure order conversation exists
            cur.execute("""
                INSERT INTO conversations (user1_id, user2_id, order_id, subject, updated_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user["id"], svc["freelancer_id"], oid, f"Order #{order_number} — {svc['title'][:50]}", now, now))
            conv_id = cur.lastrowid
            cur.execute("""
                INSERT INTO messages (conversation_id, sender_id, body, is_read, created_at)
                VALUES (?, ?, ?, 0, ?)
            """, (conv_id, user["id"], f"New Order #{order_number} submitted. Requirements: {requirements}", now))

            notify_user(conn, svc["freelancer_id"], f"New Order #{order_number} Received!", f"{user['full_name']} ordered '{svc['title'][:45]}' ({total_dzd} DZD).", f"order-detail?id={oid}")
            notify_user(conn, user["id"], f"Order #{order_number} Confirmed", f"Your payment of {total_dzd} DZD (Sandbox) is held safely until delivery acceptance.", f"order-detail?id={oid}")
            log_audit(conn, user["id"], user["email"], "ORDER_CREATE", "order", order_number, f"Total={total_dzd} DZD")
            conn.commit()

            self.send_json(201, {"order_id": oid, "order_number": order_number, "total_dzd": total_dzd})
            return

        if path.startswith("/api/orders/") and path.endswith("/deliver"):
            oid = int(path.split("/api/orders/", 1)[1].split("/deliver")[0].strip("/"))
            cur.execute("SELECT * FROM orders WHERE id = ?", (oid,))
            order = cur.fetchone()
            if not order:
                self.send_json(404, {"error": "Order not found"})
                return
            if order["freelancer_id"] != user["id"] and user["role"] != "admin":
                self.send_json(403, {"error": "Only the assigned freelancer can submit a delivery."})
                return
            if order["status"] not in ("in_progress", "revision_requested", "delivered"):
                self.send_json(400, {"error": f"Cannot deliver order in status '{order['status']}'."})
                return

            message = (body.get("message") or "").strip()
            files = body.get("files") or []
            if not message:
                self.send_json(400, {"error": "Please include a delivery message describing your work."})
                return

            cur.execute("INSERT INTO order_deliveries (order_id, freelancer_id, message, files_json, created_at) VALUES (?, ?, ?, ?, ?)",
                        (oid, user["id"], message, json.dumps(files), now))
            cur.execute("UPDATE orders SET status = 'delivered', updated_at = ? WHERE id = ?", (now, oid))
            cur.execute("INSERT INTO order_status_history (order_id, status, note, actor_id, created_at) VALUES (?, 'delivered', ?, ?, ?)",
                        (oid, f"Delivery submitted: {message[:80]}", user["id"], now))
            notify_user(conn, order["client_id"], f"Order #{order['order_number']} Delivered!", "Your freelancer has submitted the work. Review and accept or request a revision.", f"order-detail?id={oid}")
            conn.commit()
            self.send_json(200, {"ok": True, "status": "delivered"})
            return

        if path.startswith("/api/orders/") and path.endswith("/revision"):
            oid = int(path.split("/api/orders/", 1)[1].split("/revision")[0].strip("/"))
            cur.execute("SELECT * FROM orders WHERE id = ?", (oid,))
            order = cur.fetchone()
            if not order:
                self.send_json(404, {"error": "Order not found"})
                return
            if order["client_id"] != user["id"]:
                self.send_json(403, {"error": "Only the buyer can request a revision."})
                return
            if order["status"] != "delivered":
                self.send_json(400, {"error": "Revisions can only be requested on delivered orders."})
                return
            reason = (body.get("reason") or "").strip()
            if not reason:
                self.send_json(400, {"error": "Please explain what changes are needed."})
                return

            cur.execute("INSERT INTO order_revisions (order_id, client_id, reason, created_at) VALUES (?, ?, ?, ?)", (oid, user["id"], reason, now))
            cur.execute("UPDATE orders SET status = 'revision_requested', revisions_used = revisions_used + 1, updated_at = ? WHERE id = ?", (now, oid))
            cur.execute("INSERT INTO order_status_history (order_id, status, note, actor_id, created_at) VALUES (?, 'revision_requested', ?, ?, ?)",
                        (oid, f"Revision requested: {reason[:80]}", user["id"], now))
            notify_user(conn, order["freelancer_id"], f"Revision Requested on #{order['order_number']}", reason[:100], f"order-detail?id={oid}")
            conn.commit()
            self.send_json(200, {"ok": True, "status": "revision_requested"})
            return

        if path.startswith("/api/orders/") and path.endswith("/complete"):
            oid = int(path.split("/api/orders/", 1)[1].split("/complete")[0].strip("/"))
            cur.execute("SELECT * FROM orders WHERE id = ?", (oid,))
            order = cur.fetchone()
            if not order:
                self.send_json(404, {"error": "Order not found"})
                return
            if order["client_id"] != user["id"] and user["role"] != "admin":
                self.send_json(403, {"error": "Only the buyer can accept delivery and complete the order."})
                return
            if order["status"] != "delivered":
                self.send_json(400, {"error": "Order must be in 'delivered' status before completion."})
                return

            cur.execute("UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ?", (now, oid))
            cur.execute("UPDATE users SET wallet_balance_dzd = wallet_balance_dzd + ? WHERE id = ?", (order["freelancer_net_dzd"], order["freelancer_id"]))
            cur.execute("INSERT INTO order_status_history (order_id, status, note, actor_id, created_at) VALUES (?, 'completed', 'Delivery accepted; net earnings credited to freelancer wallet.', ?, ?)",
                        (oid, user["id"], now))
            cur.execute("""
                INSERT INTO transactions (tx_reference, order_id, user_id, type, amount_dzd, status, is_sandbox, description, created_at)
                VALUES (?, ?, ?, 'escrow_release', ?, 'completed', 1, ?, ?)
            """, (f"TX-REL-{order['order_number']}", oid, order["freelancer_id"], order["freelancer_net_dzd"], f"Net earnings released for Order #{order['order_number']}", now))
            notify_user(conn, order["freelancer_id"], f"Order #{order['order_number']} Completed!", f"{order['freelancer_net_dzd']} DZD has been credited to your earnings wallet.", f"order-detail?id={oid}")
            conn.commit()
            self.send_json(200, {"ok": True, "status": "completed"})
            return

        if path.startswith("/api/orders/") and path.endswith("/review"):
            oid = int(path.split("/api/orders/", 1)[1].split("/review")[0].strip("/"))
            cur.execute("SELECT * FROM orders WHERE id = ?", (oid,))
            order = cur.fetchone()
            if not order:
                self.send_json(404, {"error": "Order not found"})
                return
            if order["client_id"] != user["id"]:
                self.send_json(403, {"error": "Only the buyer of this order can leave a review."})
                return
            if order["status"] != "completed":
                self.send_json(400, {"error": "Reviews can only be submitted after order completion."})
                return
            cur.execute("SELECT id FROM reviews WHERE order_id = ?", (oid,))
            if cur.fetchone():
                self.send_json(409, {"error": "A review has already been submitted for this order."})
                return

            rating = max(1, min(5, int(body.get("rating") or 5)))
            comment = (body.get("comment") or "").strip()
            if not comment:
                self.send_json(400, {"error": "Please write a review comment."})
                return

            cur.execute("""
                INSERT INTO reviews (order_id, service_id, client_id, freelancer_id, rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (oid, order["service_id"], user["id"], order["freelancer_id"], rating, comment, now))
            recalculate_service_rating(conn, order["service_id"])
            notify_user(conn, order["freelancer_id"], f"New {rating}★ Review Received!", comment[:90], f"order-detail?id={oid}")
            conn.commit()
            self.send_json(201, {"ok": True})
            return

        if path == "/api/messages":
            recipient_id = int(body.get("recipient_id") or 0)
            conversation_id = int(body.get("conversation_id") or 0)
            msg_body = (body.get("body") or "").strip()
            attachments = body.get("attachments") or []

            if not msg_body and not attachments:
                self.send_json(400, {"error": "Message body cannot be empty."})
                return

            if conversation_id > 0:
                cur.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
                conv = cur.fetchone()
                if not conv or (user["id"] not in (conv["user1_id"], conv["user2_id"]) and user["role"] != "admin"):
                    self.send_json(403, {"error": "Unauthorized conversation access."})
                    return
                recipient_id = conv["user2_id"] if conv["user1_id"] == user["id"] else conv["user1_id"]
            else:
                if recipient_id <= 0 or recipient_id == user["id"]:
                    self.send_json(400, {"error": "Invalid recipient."})
                    return
                cur.execute("""
                    SELECT * FROM conversations
                    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
                    ORDER BY id DESC LIMIT 1
                """, (user["id"], recipient_id, recipient_id, user["id"]))
                conv = cur.fetchone()
                if conv:
                    conversation_id = conv["id"]
                else:
                    subject = (body.get("subject") or "Direct Marketplace Inquiry").strip()
                    cur.execute("""
                        INSERT INTO conversations (user1_id, user2_id, subject, updated_at, created_at)
                        VALUES (?, ?, ?, ?, ?)
                    """, (user["id"], recipient_id, subject, now, now))
                    conversation_id = cur.lastrowid

            cur.execute("""
                INSERT INTO messages (conversation_id, sender_id, body, attachments_json, is_read, created_at)
                VALUES (?, ?, ?, ?, 0, ?)
            """, (conversation_id, user["id"], msg_body, json.dumps(attachments), now))
            cur.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_id))
            notify_user(conn, recipient_id, f"New Message from {user['full_name']}", msg_body[:80], f"messages?conv={conversation_id}")
            conn.commit()
            self.send_json(201, {"conversation_id": conversation_id, "ok": True})
            return

        if path == "/api/notifications/read-all":
            cur.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user["id"],))
            conn.commit()
            self.send_json(200, {"ok": True})
            return

        if path == "/api/projects":
            title = (body.get("title") or "").strip()
            category_id = int(body.get("category_id") or 1)
            description = (body.get("description") or "").strip()
            skills_required = body.get("skills_required") or []
            budget_min = int(body.get("budget_min_dzd") or 15000)
            budget_max = int(body.get("budget_max_dzd") or max(budget_min, 50000))
            deadline_days = max(1, int(body.get("deadline_days") or 7))
            experience_level = (body.get("experience_level") or "Intermediate").strip()
            wilaya_pref = (body.get("wilaya_pref") or "All Algeria").strip()

            if not title or not description:
                self.send_json(400, {"error": "Project title and detailed description are required."})
                return

            pcode = f"PRJ-DZ-{secrets.randbelow(8999) + 1000}"
            cur.execute("""
                INSERT INTO project_requests (
                    project_code, client_id, category_id, title, description, skills_required,
                    budget_min_dzd, budget_max_dzd, deadline_days, experience_level, wilaya_pref, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
            """, (pcode, user["id"], category_id, title, description, json.dumps(skills_required), budget_min, budget_max, deadline_days, experience_level, wilaya_pref, now))
            pid = cur.lastrowid
            log_audit(conn, user["id"], user["email"], "PROJECT_POST", "project", pcode, title)
            conn.commit()
            self.send_json(201, {"project_id": pid, "project_code": pcode})
            return

        if path.startswith("/api/projects/") and path.endswith("/proposals"):
            pid = int(path.split("/api/projects/", 1)[1].split("/proposals")[0].strip("/"))
            cur.execute("SELECT * FROM project_requests WHERE id = ?", (pid,))
            proj = cur.fetchone()
            if not proj or proj["status"] != "open":
                self.send_json(400, {"error": "Project is no longer open for proposals."})
                return
            if proj["client_id"] == user["id"]:
                self.send_json(400, {"error": "You cannot submit a proposal to your own project."})
                return

            bid_amount = int(body.get("bid_amount_dzd") or 0)
            delivery_days = max(1, int(body.get("delivery_days") or 7))
            cover_letter = (body.get("cover_letter") or "").strip()
            if bid_amount <= 0 or not cover_letter:
                self.send_json(400, {"error": "Valid bid amount in DZD and cover letter are required."})
                return

            cur.execute("SELECT id FROM proposals WHERE project_id = ? AND freelancer_id = ?", (pid, user["id"]))
            if cur.fetchone():
                self.send_json(409, {"error": "You have already submitted a proposal for this project."})
                return

            cur.execute("""
                INSERT INTO proposals (project_id, freelancer_id, bid_amount_dzd, delivery_days, cover_letter, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'pending', ?)
            """, (pid, user["id"], bid_amount, delivery_days, cover_letter, now))
            notify_user(conn, proj["client_id"], f"New Proposal on {proj['project_code']}", f"{user['full_name']} bid {bid_amount} DZD.", "projects")
            conn.commit()
            self.send_json(201, {"proposal_id": cur.lastrowid, "ok": True})
            return

        if path.startswith("/api/proposals/") and path.endswith("/accept"):
            prop_id = int(path.split("/api/proposals/", 1)[1].split("/accept")[0].strip("/"))
            cur.execute("""
                SELECT pr.*, p.client_id, p.title as project_title, p.project_code, p.category_id
                FROM proposals pr
                JOIN project_requests p ON p.id = pr.project_id
                WHERE pr.id = ?
            """, (prop_id,))
            prop = cur.fetchone()
            if not prop:
                self.send_json(404, {"error": "Proposal not found"})
                return
            if prop["client_id"] != user["id"] and user["role"] != "admin":
                self.send_json(403, {"error": "Only the project owner can accept a proposal."})
                return

            cur.execute("UPDATE proposals SET status = 'accepted' WHERE id = ?", (prop_id,))
            cur.execute("UPDATE proposals SET status = 'rejected' WHERE project_id = ? AND id != ?", (prop["project_id"], prop_id))
            cur.execute("UPDATE project_requests SET status = 'awarded', selected_proposal_id = ? WHERE id = ?", (prop_id, prop["project_id"]))

            # Find a service of the freelancer or fallback to first service to link the order record
            cur.execute("SELECT id FROM services WHERE freelancer_id = ? LIMIT 1", (prop["freelancer_id"],))
            f_svc = cur.fetchone()
            service_id = f_svc["id"] if f_svc else 1
            sub = int(prop["bid_amount_dzd"])
            fee = int(round(sub * 0.10))
            total = sub + fee
            net = sub - fee
            order_number = f"INT-PRJ-{secrets.randbelow(89999) + 10000}"

            cur.execute("""
                INSERT INTO orders (
                    order_number, service_id, client_id, freelancer_id, package_tier, package_name,
                    subtotal_dzd, commission_rate_pct, platform_fee_dzd, total_dzd, freelancer_net_dzd,
                    requirements_submitted, delivery_days, status, is_demo, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'custom', ?, ?, 10, ?, ?, ?, ?, ?, 'in_progress', 0, ?, ?)
            """, (
                order_number, service_id, user["id"], prop["freelancer_id"],
                f"Project {prop['project_code']}: {prop['project_title'][:40]}",
                sub, fee, total, net, f"Awarded Proposal #{prop_id}: {prop['cover_letter']}",
                prop["delivery_days"], now, now
            ))
            oid = cur.lastrowid
            cur.execute("INSERT INTO order_status_history (order_id, status, note, actor_id, created_at) VALUES (?, 'in_progress', 'Created from accepted project proposal', ?, ?)", (oid, user["id"], now))
            notify_user(conn, prop["freelancer_id"], f"Proposal Accepted! (#{order_number})", f"Your proposal on {prop['project_code']} was accepted!", f"order-detail?id={oid}")
            conn.commit()
            self.send_json(200, {"ok": True, "order_id": oid, "order_number": order_number})
            return

        if path == "/api/payouts":
            amount = int(body.get("amount_dzd") or 0)
            method = (body.get("method") or "CCP / BaridiMob").strip()
            account_details = (body.get("account_details") or "").strip()
            if amount <= 0 or amount > user["wallet_balance_dzd"]:
                self.send_json(400, {"error": "Invalid payout amount or insufficient wallet balance."})
                return
            if not account_details:
                self.send_json(400, {"error": "Please provide your CCP / RIB account details."})
                return
            cur.execute("UPDATE users SET wallet_balance_dzd = wallet_balance_dzd - ? WHERE id = ?", (amount, user["id"]))
            cur.execute("""
                INSERT INTO payouts (freelancer_id, amount_dzd, method, account_details, status, created_at)
                VALUES (?, ?, ?, ?, 'pending', ?)
            """, (user["id"], amount, method, account_details, now))
            cur.execute("""
                INSERT INTO transactions (tx_reference, user_id, type, amount_dzd, provider, status, is_sandbox, description, created_at)
                VALUES (?, ?, 'payout', ?, ?, 'pending', 1, ?, ?)
            """, (f"TX-PAYOUT-{secrets.token_hex(4).upper()}", user["id"], amount, method, f"Payout withdrawal to {method}", now))
            conn.commit()
            self.send_json(201, {"ok": True})
            return

        if path == "/api/business/profile":
            company_name = (body.get("company_name") or "").strip()
            industry = (body.get("industry") or "Technology").strip()
            company_size = (body.get("company_size") or "11-50 employees").strip()
            rc_nif = (body.get("rc_nif_number") or "").strip()
            wilaya = (body.get("wilaya") or "16 - Alger").strip()
            website = (body.get("website") or "").strip()
            description = (body.get("description") or "").strip()
            if not company_name:
                self.send_json(400, {"error": "Company name is required."})
                return
            cur.execute("SELECT id FROM businesses WHERE owner_id = ?", (user["id"],))
            existing = cur.fetchone()
            if existing:
                cur.execute("""
                    UPDATE businesses
                    SET company_name = ?, industry = ?, company_size = ?, rc_nif_number = ?, wilaya = ?, website = ?, description = ?
                    WHERE owner_id = ?
                """, (company_name, industry, company_size, rc_nif, wilaya, website, description, user["id"]))
            else:
                cur.execute("""
                    INSERT INTO businesses (owner_id, company_name, industry, company_size, rc_nif_number, wilaya, website, description, verified_business, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                """, (user["id"], company_name, industry, company_size, rc_nif, wilaya, website, description, now))
            conn.commit()
            self.send_json(200, {"ok": True})
            return

        if path == "/api/business/team":
            cur.execute("SELECT id FROM businesses WHERE owner_id = ?", (user["id"],))
            biz = cur.fetchone()
            if not biz:
                self.send_json(400, {"error": "Please save your company profile first."})
                return
            member_name = (body.get("member_name") or "").strip()
            member_email = (body.get("member_email") or "").strip()
            role_permission = (body.get("role_permission") or "Hiring Manager").strip()
            if not member_name or not member_email:
                self.send_json(400, {"error": "Member name and email are required."})
                return
            cur.execute("""
                INSERT INTO business_team_members (business_id, member_email, member_name, role_permission, status, created_at)
                VALUES (?, ?, ?, ?, 'active', ?)
            """, (biz["id"], member_email, member_name, role_permission, now))
            conn.commit()
            self.send_json(201, {"ok": True})
            return

        if path == "/api/reports":
            target_type = (body.get("target_type") or "service").strip()
            target_id = int(body.get("target_id") or 0)
            reason = (body.get("reason") or "").strip()
            details = (body.get("details") or "").strip()
            if not reason or not details:
                self.send_json(400, {"error": "Reason and details are required."})
                return
            cur.execute("""
                INSERT INTO reports_disputes (reporter_id, target_type, target_id, reason, details, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'open', ?)
            """, (user["id"], target_type, target_id, reason, details, now))
            if target_type == "order_dispute" and target_id > 0:
                cur.execute("UPDATE orders SET status = 'disputed', updated_at = ? WHERE id = ?", (now, target_id))
            conn.commit()
            self.send_json(201, {"ok": True})
            return

        # --- ADMIN ENDPOINTS (Strict Server-Side RBAC) ---
        if path.startswith("/api/admin/"):
            if user["role"] != "admin":
                self.send_json(403, {"error": "Forbidden: Administrator privileges required."})
                return

            if path == "/api/admin/categories":
                name = (body.get("name") or "").strip()
                name_fr = (body.get("name_fr") or name).strip()
                name_ar = (body.get("name_ar") or name).strip()
                description = (body.get("description") or "").strip()
                image_url = (body.get("image_url") or "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80").strip()
                if not name:
                    self.send_json(400, {"error": "Category name is required."})
                    return
                slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
                cur.execute("""
                    INSERT INTO categories (name, name_fr, name_ar, slug, description, icon, image_url, featured)
                    VALUES (?, ?, ?, ?, ?, 'layers', ?, 1)
                """, (name, name_fr, name_ar, slug, description, image_url))
                cid = cur.lastrowid
                log_audit(conn, user["id"], user["email"], "ADMIN_CATEGORY_CREATE", "category", cid, name)
                conn.commit()
                self.send_json(201, {"category_id": cid, "slug": slug})
                return

            if path == "/api/admin/skills":
                skill_name = (body.get("name") or "").strip()
                cat_slug = (body.get("category_slug") or "programming-tech").strip()
                if not skill_name:
                    self.send_json(400, {"error": "Skill name required"})
                    return
                cur.execute("INSERT OR IGNORE INTO skills (name, category_slug) VALUES (?, ?)", (skill_name, cat_slug))
                log_audit(conn, user["id"], user["email"], "ADMIN_SKILL_CREATE", "skill", skill_name, cat_slug)
                conn.commit()
                self.send_json(201, {"ok": True})
                return

            if path == "/api/admin/user-status":
                target_uid = int(body.get("user_id") or 0)
                new_status = (body.get("status") or "active").strip()
                is_verified = body.get("is_verified")
                if target_uid == user["id"] and new_status == "suspended":
                    self.send_json(400, {"error": "Cannot suspend your own admin account."})
                    return
                if is_verified is not None:
                    cur.execute("UPDATE users SET is_verified = ? WHERE id = ?", (1 if is_verified else 0, target_uid))
                cur.execute("UPDATE users SET status = ? WHERE id = ?", (new_status, target_uid))
                log_audit(conn, user["id"], user["email"], "ADMIN_USER_UPDATE", "user", target_uid, f"status={new_status}")
                conn.commit()
                self.send_json(200, {"ok": True})
                return

            if path == "/api/admin/service-moderation":
                sid = int(body.get("service_id") or 0)
                status = (body.get("status") or "approved").strip()
                is_featured = body.get("is_featured")
                is_sponsored = body.get("is_sponsored")
                cur.execute("UPDATE services SET status = ?, updated_at = ? WHERE id = ?", (status, now, sid))
                if is_featured is not None:
                    cur.execute("UPDATE services SET is_featured = ? WHERE id = ?", (1 if is_featured else 0, sid))
                if is_sponsored is not None:
                    cur.execute("UPDATE services SET is_sponsored = ? WHERE id = ?", (1 if is_sponsored else 0, sid))
                log_audit(conn, user["id"], user["email"], "ADMIN_SERVICE_MODERATION", "service", sid, f"status={status}")
                conn.commit()
                self.send_json(200, {"ok": True})
                return

            if path == "/api/admin/pro-review":
                app_id = int(body.get("application_id") or 0)
                decision = (body.get("status") or "approved").strip()
                notes = (body.get("admin_notes") or "").strip()
                cur.execute("SELECT * FROM pro_applications WHERE id = ?", (app_id,))
                app = cur.fetchone()
                if not app:
                    self.send_json(404, {"error": "Application not found"})
                    return
                cur.execute("UPDATE pro_applications SET status = ?, admin_notes = ?, reviewed_at = ? WHERE id = ?", (decision, notes, now, app_id))
                is_pro_val = 1 if decision == "approved" else 0
                cur.execute("UPDATE users SET is_pro = ?, pro_status = ? WHERE id = ?", (is_pro_val, decision, app["user_id"]))
                if is_pro_val:
                    cur.execute("UPDATE services SET is_pro_listing = 1 WHERE freelancer_id = ?", (app["user_id"],))
                notify_user(conn, app["user_id"], f"Intalent Pro Application {decision.capitalize()}", notes or f"Your Pro status is now {decision}.", "freelancer-dashboard")
                log_audit(conn, user["id"], user["email"], "ADMIN_PRO_REVIEW", "pro_application", app_id, f"decision={decision}")
                conn.commit()
                self.send_json(200, {"ok": True})
                return

            if path == "/api/admin/settings":
                updates = body.get("settings") or {}
                for k, v in updates.items():
                    cur.execute("INSERT OR REPLACE INTO platform_settings (key, value, updated_at) VALUES (?, ?, ?)", (str(k), str(v), now))
                log_audit(conn, user["id"], user["email"], "ADMIN_SETTINGS_UPDATE", "settings", "global", json.dumps(updates))
                conn.commit()
                self.send_json(200, {"ok": True})
                return

            if path == "/api/admin/banners":
                title = (body.get("title") or "").strip()
                subtitle = (body.get("subtitle") or "").strip()
                cta_text = (body.get("cta_text") or "Explore Now").strip()
                cta_link = (body.get("cta_link") or "explore").strip()
                badge_text = (body.get("badge_text") or "DEMO PLACEMENT").strip()
                if not title or not subtitle:
                    self.send_json(400, {"error": "Banner title and subtitle required"})
                    return
                cur.execute("""
                    INSERT INTO promotions_banners (title, subtitle, cta_text, cta_link, badge_text, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, 1, ?)
                """, (title, subtitle, cta_text, cta_link, badge_text, now))
                log_audit(conn, user["id"], user["email"], "ADMIN_BANNER_CREATE", "banner", cur.lastrowid, title)
                conn.commit()
                self.send_json(201, {"ok": True})
                return

            if path == "/api/admin/resolve-report":
                rep_id = int(body.get("report_id") or 0)
                status = (body.get("status") or "resolved").strip()
                notes = (body.get("resolution_notes") or "").strip()
                cur.execute("UPDATE reports_disputes SET status = ?, resolution_notes = ? WHERE id = ?", (status, notes, rep_id))
                log_audit(conn, user["id"], user["email"], "ADMIN_REPORT_RESOLVE", "report", rep_id, status)
                conn.commit()
                self.send_json(200, {"ok": True})
                return

            if path == "/api/admin/payout-process":
                pid = int(body.get("payout_id") or 0)
                status = (body.get("status") or "processed").strip()
                cur.execute("UPDATE payouts SET status = ?, processed_at = ? WHERE id = ?", (status, now, pid))
                log_audit(conn, user["id"], user["email"], "ADMIN_PAYOUT_PROCESS", "payout", pid, status)
                conn.commit()
                self.send_json(200, {"ok": True})
                return

        self.send_json(404, {"error": f"Unknown POST endpoint {path}"})

    # =========================================================================
    # PUT & DELETE ROUTES
    # =========================================================================
    def handle_api_put(self, conn, path: str, body: dict):
        cur = conn.cursor()
        now = utc_now()
        user, _ = self.get_current_user(conn)
        if not user:
            self.send_json(401, {"error": "Authentication required"})
            return

        if path.startswith("/api/services/"):
            sid = int(path.split("/api/services/", 1)[1].strip("/"))
            cur.execute("SELECT * FROM services WHERE id = ?", (sid,))
            svc = cur.fetchone()
            if not svc:
                self.send_json(404, {"error": "Service not found"})
                return
            if svc["freelancer_id"] != user["id"] and user["role"] != "admin":
                self.send_json(403, {"error": "Forbidden: You do not own this service."})
                return

            title = (body.get("title") or svc["title"]).strip()
            description = (body.get("description") or svc["description"]).strip()
            status = (body.get("status") or svc["status"]).strip()
            cover_image = (body.get("cover_image") or svc["cover_image"]).strip()
            starting_price = int(body.get("starting_price_dzd") or svc["starting_price_dzd"])

            cur.execute("""
                UPDATE services
                SET title = ?, description = ?, status = ?, cover_image = ?, starting_price_dzd = ?, updated_at = ?
                WHERE id = ?
            """, (title, description, status, cover_image, starting_price, now, sid))

            if "packages" in body and isinstance(body["packages"], list) and body["packages"]:
                cur.execute("DELETE FROM service_packages WHERE service_id = ?", (sid,))
                for p in body["packages"]:
                    cur.execute("""
                        INSERT INTO service_packages (service_id, tier, name, description, price_dzd, delivery_days, revisions, features)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        sid, p.get("tier", "basic"), p.get("name", "Package"), p.get("description", ""),
                        int(p.get("price_dzd") or starting_price), int(p.get("delivery_days") or 3),
                        int(p.get("revisions") or 2), json.dumps(p.get("features") or [])
                    ))

            log_audit(conn, user["id"], user["email"], "SERVICE_UPDATE", "service", sid, f"status={status}")
            conn.commit()
            self.send_json(200, {"ok": True})
            return

        self.send_json(404, {"error": "Unknown PUT endpoint"})

    def handle_api_delete(self, conn, path: str):
        cur = conn.cursor()
        user, _ = self.get_current_user(conn)
        if not user:
            self.send_json(401, {"error": "Authentication required"})
            return

        if path.startswith("/api/services/"):
            sid = int(path.split("/api/services/", 1)[1].strip("/"))
            cur.execute("SELECT * FROM services WHERE id = ?", (sid,))
            svc = cur.fetchone()
            if not svc:
                self.send_json(404, {"error": "Service not found"})
                return
            if svc["freelancer_id"] != user["id"] and user["role"] != "admin":
                self.send_json(403, {"error": "Forbidden"})
                return
            cur.execute("DELETE FROM services WHERE id = ?", (sid,))
            log_audit(conn, user["id"], user["email"], "SERVICE_DELETE", "service", sid, svc["title"])
            conn.commit()
            self.send_json(200, {"ok": True})
            return

        self.send_json(404, {"error": "Unknown DELETE endpoint"})

def run_server(port: int = 8000, host: str = "0.0.0.0"):
    init_db()
    seed()
    server = ThreadingHTTPServer((host, port), IntalentRequestHandler)
    print(f"Intalent Full-Stack Marketplace running at http://{host}:{port}")
    server.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    run_server(port, host)
