#!/usr/bin/env python3
"""
Seed demo departments and positions for the AndikishaHR dev tenant.
Run via: make seed-demo-data
Or directly: python3 scripts/seed-demo-data.py <token> <tenant_id> <gateway_url>

Defaults are owned by the backend seed-defaults endpoints (single source of truth).
This script delegates entirely to those endpoints.
"""
import json, sys, urllib.request, urllib.error

token   = sys.argv[1]
tenant  = sys.argv[2]
gateway = sys.argv[3].rstrip("/")

HEADERS = {
    "Authorization": f"Bearer {token}",
    "X-Tenant-ID": tenant,
    "Content-Type": "application/json",
}


def seed_defaults(label: str, endpoint: str, name_key: str) -> None:
    req = urllib.request.Request(f"{gateway}{endpoint}", data=b"", method="POST", headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            records = json.loads(resp.read())
            print(f"  {label}: {len(records)} records active after seed")
            for r in records:
                print(f"    · {r[name_key]}")
    except urllib.error.HTTPError as e:
        body = {}
        try:
            body = json.loads(e.read())
        except Exception:
            pass
        print(f"  ✗ {label}: HTTP {e.code} {body.get('message', body)}")
        sys.exit(1)


print("Seeding departments…")
seed_defaults("Departments", "/api/v1/departments/seed-defaults", "name")

print("Seeding positions…")
seed_defaults("Positions", "/api/v1/positions/seed-defaults", "title")
