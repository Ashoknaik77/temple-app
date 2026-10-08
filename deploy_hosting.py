#!/usr/bin/env python3
"""Deploy ~/workspace/temple-app/dist to Firebase Hosting via REST API (curl-based)."""
import gzip
import hashlib
import json
import os
import subprocess
import sys
import time

SITE = "sri-durga-parameshwari"
DIST = os.path.expanduser("~/workspace/temple-app/dist")
API = "https://firebasehosting.googleapis.com/v1beta1"
QUOTA = os.environ.get("QUOTA_PROJECT", "payroll-attendance-api")
GCLOUD = os.path.expanduser("~/google-cloud-sdk/bin")


def token():
    out = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True,
        env={**os.environ, "PATH": os.environ["PATH"] + ":" + GCLOUD},
    )
    return out.stdout.strip()


def req(method, url, body=None, raw_data=None, content_type="application/json", tries=4):
    """HTTP via curl (robust against the sandbox's flaky chunked-encoding path)."""
    last = None
    for attempt in range(tries):
        cmd = [
            "curl", "-sS", "--max-time", "120", "-X", method, url,
            "-H", "Authorization: Bearer " + token(),
            "-H", "x-goog-user-project: " + QUOTA,
        ]
        if body is not None:
            cmd += ["-H", f"Content-Type: {content_type}", "-d", json.dumps(body)]
        elif raw_data is not None:
            tmp = f"/tmp/deploy_upload_{os.getpid()}.bin"
            with open(tmp, "wb") as f:
                f.write(raw_data)
            cmd += ["-H", f"Content-Type: {content_type}", "--data-binary", "@" + tmp]
        else:
            cmd += ["-H", "Content-Type: application/json"]
        # fail on HTTP errors, but still capture body for diagnostics
        cmd += ["-w", "\n%{http_code}"]
        try:
            out = subprocess.run(cmd, capture_output=True, text=True, timeout=150)
            text = out.stdout
            code = text.rsplit("\n", 1)[-1].strip() if text else ""
            payload = text[: text.rfind("\n")] if "\n" in text else ""
            if out.returncode == 0 and code.startswith("2"):
                return json.loads(payload) if payload else {}
            last = f"curl rc={out.returncode} http={code} body={payload[:300]} err={out.stderr[:200]}"
        except Exception as e:  # noqa: BLE001
            last = f"exception: {e}"
        time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"{method} {url} failed after {tries} tries: {last}")


def gz(b: bytes) -> bytes:
    return gzip.compress(b, compresslevel=9)


def main():
    files = {}
    for root, _, names in os.walk(DIST):
        for n in names:
            full = os.path.join(root, n)
            rel = "/" + os.path.relpath(full, DIST).replace(os.sep, "/")
            blob = gz(open(full, "rb").read())
            h = hashlib.sha256(blob).hexdigest()
            files[rel] = (blob, h)
    print(f"{len(files)} files")

    ver = req("POST", f"{API}/sites/{SITE}/versions",
              {"config": {"rewrites": [{"glob": "**", "path": "/index.html"}]}})
    vname = ver["name"]
    print("version:", vname)

    pop = req("POST", f"{API}/{vname}:populateFiles",
              {"files": {p: h for p, (_, h) in files.items()}})
    base_url = pop["uploadUrl"]
    needed = set(pop.get("uploadRequiredHashes", []))
    hash_to_path = {h: p for p, (_, h) in files.items()}
    print(f"{len(needed)} files need upload")
    for h in needed:
        path = hash_to_path[h]
        blob, _ = files[path]
        req("POST", base_url + "/" + h, raw_data=blob,
            content_type="application/octet-stream")
    print("uploads done")

    req("PATCH", f"{API}/{vname}?updateMask=status", {"status": "FINALIZED"})
    print("version finalized")

    from urllib.parse import quote
    rel = req("POST", f"{API}/sites/{SITE}/releases?versionName={quote(vname, safe='')}", {})
    print("released:", rel["name"])
    print(f"https://{SITE}.web.app")


if __name__ == "__main__":
    sys.exit(main())
