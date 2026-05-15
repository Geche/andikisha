#!/usr/bin/env python3
"""
Seed demo departments and positions for the AndikishaHR dev tenant.
Run via: make seed-demo-data
Or directly: python3 scripts/seed-demo-data.py <token> <tenant_id> <gateway_url>
"""
import json, sys, urllib.request, urllib.error

token    = sys.argv[1]
tenant   = sys.argv[2]
gateway  = sys.argv[3].rstrip("/")

HEADERS = {
    "Authorization": f"Bearer {token}",
    "X-Tenant-ID": tenant,
    "Content-Type": "application/json",
}

DEPARTMENTS = [
    {"name": "Human Resources",  "description": "Recruitment, payroll admin, employee relations"},
    {"name": "Finance",          "description": "Accounting, budgeting, statutory compliance"},
    {"name": "Operations",       "description": "Day-to-day business operations and logistics"},
    {"name": "Engineering",      "description": "Software development and technical infrastructure"},
    {"name": "Sales",            "description": "Business development and client management"},
]

POSITIONS = [
    {"title": "HR Officer",                    "description": "Handles recruitment and employee relations",         "gradeLevel": "L3"},
    {"title": "Sales Representative",          "description": "Field and inside sales",                            "gradeLevel": "L2"},
    {"title": "Sales Manager",                 "description": "Manages the sales team and targets",                "gradeLevel": "L4"},
    {"title": "Software Engineer",             "description": "Full-stack and backend development",                "gradeLevel": "L4"},
    {"title": "Accountant",                    "description": "Bookkeeping, payroll processing, tax filing",       "gradeLevel": "L3"},
    {"title": "Operations Manager",            "description": "Oversees daily operational workflows",              "gradeLevel": "L5"},
    {"title": "Customer Service Representative","description": "First-line customer support",                     "gradeLevel": "L2"},
    {"title": "Marketing Officer",             "description": "Brand management and digital marketing",            "gradeLevel": "L3"},
    {"title": "Administrative Assistant",      "description": "Office administration and executive support",       "gradeLevel": "L2"},
    {"title": "Finance Manager",              "description": "Financial planning, reporting, and compliance",      "gradeLevel": "L5"},
]


def post(endpoint: str, body: dict) -> tuple[int, dict]:
    data = json.dumps(body).encode()
    req = urllib.request.Request(f"{gateway}{endpoint}", data=data, method="POST", headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body2 = {}
        try:
            body2 = json.loads(e.read())
        except Exception:
            pass
        return e.code, body2


def seed(label: str, endpoint: str, items: list[dict], name_key: str):
    created = skipped = failed = 0
    for item in items:
        status, resp = post(endpoint, item)
        if status in (200, 201):
            print(f"  ✓ {item[name_key]}")
            created += 1
        elif status == 409 or (isinstance(resp.get("error"), str) and "DUPLICATE" in resp.get("error", "")):
            print(f"  · {item[name_key]} (already exists)")
            skipped += 1
        else:
            print(f"  ✗ {item[name_key]}: HTTP {status} {resp.get('message', resp)}")
            failed += 1
    print(f"  {label}: {created} created, {skipped} skipped, {failed} failed")


print("Seeding departments…")
seed("Departments", "/api/v1/departments", DEPARTMENTS, "name")

print("Seeding positions…")
seed("Positions", "/api/v1/positions", POSITIONS, "title")
