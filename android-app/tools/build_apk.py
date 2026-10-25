"""Build the production debug APK for Intalent Android App using the local standalone toolchain.
Steps:
1. Copy public/m (core.js, screens-*.js, m.css, index.html) and logos to android-app/app/src/main/assets/m
2. Compile resources with aapt2
3. Compile Java with javac
4. Convert class files to dex with d8
5. Package into APK with aapt2
6. Add classes.dex and assets
7. Sign with apksigner / debug key
8. Copy to public/downloads/intalent-algeria.apk
"""
import os
import sys
import shutil
import subprocess
import zipfile

TOOLCHAIN = r"C:\Users\adel\.gemini\antigravity\scratch\android-toolchain"
SDK = os.path.join(TOOLCHAIN, "sdk")
JDK = os.path.join(TOOLCHAIN, "jdk")

JAVAC = os.path.join(JDK, "bin", "javac.exe")
KEYTOOL = os.path.join(JDK, "bin", "keytool.exe")
AAPT2 = os.path.join(SDK, "build-tools", "34.0.0", "aapt2.exe")
D8 = os.path.join(SDK, "build-tools", "34.0.0", "d8.bat")
APKSIGNER = os.path.join(SDK, "build-tools", "34.0.0", "apksigner.bat")
ANDROID_JAR = os.path.join(SDK, "platforms", "android-34", "android.jar")

BASE_DIR = r"C:\Users\adel\.gemini\antigravity\scratch\intalent"
APP_DIR = os.path.join(BASE_DIR, "android-app", "app")
SRC_DIR = os.path.join(APP_DIR, "src", "main")
BUILD_DIR = os.path.join(APP_DIR, "build")

ENV = dict(os.environ)
ENV["JAVA_HOME"] = JDK
ENV["PATH"] = os.path.join(JDK, "bin") + os.pathsep + os.path.join(SDK, "build-tools", "34.0.0") + os.pathsep + ENV.get("PATH", "")

def run(cmd, cwd=None):
    print("RUN:", " ".join(cmd[:4]) + "...", flush=True)
    p = subprocess.run(cmd, env=ENV, cwd=cwd, capture_output=True, text=True)
    if p.returncode != 0:
        print("STDOUT:", p.stdout, flush=True)
        print("STDERR:", p.stderr, flush=True)
        raise RuntimeError(f"Command failed with code {p.returncode}: {' '.join(cmd[:3])}")
    return p.stdout

def main():
    print("=== Step 1: Prepare assets ===", flush=True)
    assets_dir = os.path.join(SRC_DIR, "assets", "m")
    os.makedirs(assets_dir, exist_ok=True)
    
    # Copy m folder
    src_m = os.path.join(BASE_DIR, "public", "m")
    for f in os.listdir(src_m):
        shutil.copy2(os.path.join(src_m, f), os.path.join(assets_dir, f))
    
    # Copy logos
    assets_logos = os.path.join(SRC_DIR, "assets", "assets", "logos")
    os.makedirs(assets_logos, exist_ok=True)
    src_logos = os.path.join(BASE_DIR, "public", "assets", "logos")
    if os.path.isdir(src_logos):
        for f in os.listdir(src_logos):
            shutil.copy2(os.path.join(src_logos, f), os.path.join(assets_logos, f))
            
    # Also prepare res/drawable with logo
    res_dir = os.path.join(SRC_DIR, "res")
    draw_dir = os.path.join(res_dir, "drawable")
    os.makedirs(draw_dir, exist_ok=True)
    logo_src = os.path.join(src_logos, "logo-white-purple.png")
    if os.path.isfile(logo_src):
        shutil.copy2(logo_src, os.path.join(draw_dir, "icon.png"))

    os.makedirs(BUILD_DIR, exist_ok=True)
    
    print("=== Step 2: Compile resources with aapt2 ===", flush=True)
    res_flat = os.path.join(BUILD_DIR, "compiled_res.zip")
    run([AAPT2, "compile", "--dir", res_dir, "-o", res_flat])
    
    proto_apk = os.path.join(BUILD_DIR, "link_res.apk")
    gen_r = os.path.join(BUILD_DIR, "gen")
    os.makedirs(gen_r, exist_ok=True)
    manifest = os.path.join(SRC_DIR, "AndroidManifest.xml")
    
    # AAPT2 on Windows can insert mixed backslashes when using -A
    # Instead, link resources without -A, then add assets cleanly using python zipfile with forward slashes
    run([
        AAPT2, "link",
        "-I", ANDROID_JAR,
        "--manifest", manifest,
        "--java", gen_r,
        "-o", proto_apk,
        res_flat
    ])

    print("=== Step 3: Compile Java with javac ===", flush=True)
    classes_dir = os.path.join(BUILD_DIR, "classes")
    os.makedirs(classes_dir, exist_ok=True)
    
    java_files = []
    for root, _, files in os.walk(os.path.join(SRC_DIR, "java")):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))
    for root, _, files in os.walk(gen_r):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))
                
    run([
        JAVAC,
        "-source", "1.8",
        "-target", "1.8",
        "-bootclasspath", ANDROID_JAR,
        "-d", classes_dir
    ] + java_files)

    print("=== Step 4: Convert classes to dex with d8 ===", flush=True)
    dex_dir = os.path.join(BUILD_DIR, "dex")
    os.makedirs(dex_dir, exist_ok=True)
    
    all_class_files = []
    for root, _, files in os.walk(classes_dir):
        for f in files:
            if f.endswith(".class"):
                all_class_files.append(os.path.join(root, f))
                
    run([
        D8,
        "--lib", ANDROID_JAR,
        "--output", dex_dir
    ] + all_class_files)

    print("=== Step 5: Assemble unsigned APK with clean forward-slash entries ===", flush=True)
    unsigned_apk = os.path.join(BUILD_DIR, "unsigned.apk")
    shutil.copy2(proto_apk, unsigned_apk)
    
    # Add classes.dex and assets with strict forward slash paths
    dex_file = os.path.join(dex_dir, "classes.dex")
    with zipfile.ZipFile(unsigned_apk, "a", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(dex_file, "classes.dex")
        
        assets_base = os.path.join(SRC_DIR, "assets")
        for root, _, files in os.walk(assets_base):
            for f in files:
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, assets_base).replace("\\", "/")
                arcname = f"assets/{rel_p}"
                zf.write(full_p, arcname)

    print("=== Step 6: Create debug keystore & Sign APK ===", flush=True)
    keystore = os.path.join(BUILD_DIR, "debug.keystore")
    if not os.path.isfile(keystore):
        run([
            KEYTOOL, "-genkeypair",
            "-v",
            "-keystore", keystore,
            "-storepass", "android",
            "-alias", "androiddebugkey",
            "-keypass", "android",
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", "10000",
            "-dname", "CN=Intalent Android, OU=Intalent DZ, O=Intalent, L=Algiers, ST=Algiers, C=DZ"
        ])
        
    final_apk = os.path.join(BUILD_DIR, "intalent-algeria.apk")
    shutil.copy2(unsigned_apk, final_apk)
    
    run([
        APKSIGNER, "sign",
        "--ks", keystore,
        "--ks-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        "--key-pass", "pass:android",
        final_apk
    ])
    
    # Verify signature
    run([APKSIGNER, "verify", final_apk])

    print("=== Step 7: Distribute APK to public downloads ===", flush=True)
    pub_dl = os.path.join(BASE_DIR, "public", "downloads")
    os.makedirs(pub_dl, exist_ok=True)
    dest_apk = os.path.join(pub_dl, "intalent-algeria.apk")
    shutil.copy2(final_apk, dest_apk)
    
    apk_size = os.path.getsize(dest_apk)
    print(f"SUCCESS: APK built and signed! Path: {dest_apk} ({apk_size} bytes / {apk_size // 1024} KB)")

if __name__ == "__main__":
    main()
