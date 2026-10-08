#!/usr/bin/env python3
"""Deploy ~/workspace/temple-app/dist to Firebase Hosting via REST API."""
import gzip
import hashlib
import json
import os
import subprocess
import sys
import urllib.request
import urllib.error

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


def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Authorization", "Bearer " + token())
    r.add_header("x-goog-user-project", QUOTA)
    if data:
        r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:500]
        raise RuntimeError(f"{method} {url} -> {e.code}: {detail}")


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
        r = urllib.request.Request(base_url + "/" + h, data=blob, method="POST")
        r.add_header("Content-Type", "application/octet-stream")
        r.add_header("Authorization", "Bearer " + token())
        urllib.request.urlopen(r).read()
    print("uploads done")

    req("PATCH", f"{API}/{vname}?updateMask=status", {"status": "FINALIZED"})
    print("version finalized")

    from urllib.parse import quote
    rel = req("POST", f"{API}/sites/{SITE}/releases?versionName={quote(vname, safe='')}", {})
    print("released:", rel["name"])
    print(f"https://{SITE}.web.app")


if __name__ == "__main__":
    sys.exit(main())
