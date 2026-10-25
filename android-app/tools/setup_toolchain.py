"""Download a portable Android build toolchain (JDK 17 + Android SDK build-tools + platform).

Nothing is installed system-wide: everything goes to ../../../android-toolchain
(C:\\Users\\adel\\.gemini\\antigravity\\scratch\\android-toolchain).
"""
import os
import sys
import shutil
import zipfile
import subprocess
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "android-toolchain"))
JDK_URL = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse"
CMDLINE_URL = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
PLATFORM = "platforms;android-34"
BUILD_TOOLS = "build-tools;34.0.0"


def download(url, dest):
    if os.path.isfile(dest) and os.path.getsize(dest) > 1024 * 1024:
        print("already downloaded:", dest, flush=True)
        return
    print("downloading", url, flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "intalent-build"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest + ".part", "wb") as f:
        total = int(r.headers.get("Content-Length") or 0)
        done = 0
        last = -1
        while True:
            chunk = r.read(1024 * 256)
            if not chunk:
                break
            f.write(chunk)
            done += len(chunk)
            if total:
                pct = done * 100 // total
                if pct // 10 != last:
                    last = pct // 10
                    print(f"  {pct}% ({done // (1024*1024)} MB)", flush=True)
    os.replace(dest + ".part", dest)


def main():
    os.makedirs(ROOT, exist_ok=True)

    # 1. JDK 17
    jdk_dir = os.path.join(ROOT, "jdk")
    if not os.path.isdir(jdk_dir):
        z = os.path.join(ROOT, "jdk17.zip")
        download(JDK_URL, z)
        tmp = os.path.join(ROOT, "jdk_tmp")
        with zipfile.ZipFile(z) as zf:
            zf.extractall(tmp)
        inner = os.path.join(tmp, os.listdir(tmp)[0])
        shutil.move(inner, jdk_dir)
        shutil.rmtree(tmp, ignore_errors=True)
    print("JDK ready:", jdk_dir, flush=True)

    # 2. Android command line tools
    sdk = os.path.join(ROOT, "sdk")
    latest = os.path.join(sdk, "cmdline-tools", "latest")
    if not os.path.isdir(latest):
        z = os.path.join(ROOT, "cmdline-tools.zip")
        download(CMDLINE_URL, z)
        tmp = os.path.join(ROOT, "cl_tmp")
        with zipfile.ZipFile(z) as zf:
            zf.extractall(tmp)
        os.makedirs(os.path.dirname(latest), exist_ok=True)
        shutil.move(os.path.join(tmp, "cmdline-tools"), latest)
        shutil.rmtree(tmp, ignore_errors=True)
    print("cmdline-tools ready", flush=True)

    # 3. SDK packages
    env = dict(os.environ)
    env["JAVA_HOME"] = jdk_dir
    env["PATH"] = os.path.join(jdk_dir, "bin") + os.pathsep + env.get("PATH", "")
    sdkmanager = os.path.join(latest, "bin", "sdkmanager.bat")
    if not os.path.isdir(os.path.join(sdk, "build-tools", "34.0.0")) or not os.path.isdir(os.path.join(sdk, "platforms", "android-34")):
        print("accepting licenses + installing", PLATFORM, BUILD_TOOLS, flush=True)
        p = subprocess.run([sdkmanager, f"--sdk_root={sdk}", "--licenses"], input=("y\n" * 20).encode(), env=env, capture_output=True)
        print(p.stdout.decode(errors="ignore")[-500:], flush=True)
        p = subprocess.run([sdkmanager, f"--sdk_root={sdk}", PLATFORM, BUILD_TOOLS], input=("y\n" * 20).encode(), env=env, capture_output=True)
        print(p.stdout.decode(errors="ignore")[-1500:], p.stderr.decode(errors="ignore")[-1500:], flush=True)
    ok = os.path.isfile(os.path.join(sdk, "platforms", "android-34", "android.jar")) and os.path.isdir(os.path.join(sdk, "build-tools", "34.0.0"))
    print("TOOLCHAIN_OK" if ok else "TOOLCHAIN_FAILED", flush=True)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
