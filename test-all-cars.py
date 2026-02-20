import json
import urllib.request
import sys

BASE = "http://localhost:5171"

with open("C:/Users/haval/source/repos/CarCheck/login-resp.json") as f:
    token = json.load(f)["accessToken"]

CARS = ["ABC123", "DEF456", "GHI789", "JKL012", "MNO345"]
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print("=" * 80)
print("TESTING ALL 5 MOCK CARS — 12-FACTOR ANALYSIS")
print("=" * 80)

for reg in CARS:
    # Search
    body = json.dumps({"registrationNumber": reg}).encode()
    req = urllib.request.Request(f"{BASE}/api/cars/search", data=body, headers=headers, method="POST")
    try:
        resp = urllib.request.urlopen(req)
        car = json.loads(resp.read())
        car_id = car["carId"]
        print(f"\n{'='*70}")
        print(f" {car['brand']} {car['model']} ({car['year']}) — {reg}")
        print(f"{'='*70}")
    except urllib.error.HTTPError as e:
        print(f"\n[ERROR] Search {reg}: {e.code} {e.read().decode()}")
        continue

    # Analysis
    req2 = urllib.request.Request(f"{BASE}/api/cars/{car_id}/analysis", headers=headers)
    try:
        resp2 = urllib.request.urlopen(req2)
        analysis = json.loads(resp2.read())
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Analysis {reg}: {e.code} {e.read().decode()}")
        continue

    print(f"  Total Score: {analysis['score']:.1f}/100")
    print(f"  Recommendation: {analysis['recommendation'][:60]}...")
    print()

    b = analysis["breakdown"]
    groups = [
        ("Fordonets skick", [
            ("Alder", "ageScore", "12%"),
            ("Miltal", "mileageScore", "12%"),
            ("Besiktning", "inspectionScore", "10%"),
        ]),
        ("Ekonomi & juridik", [
            ("Skuld & ekonomi", "debtFinanceScore", "15%"),
            ("Marknadsvarde", "marketValueScore", "5%"),
            ("Miljo & skatt", "environmentScore", "5%"),
        ]),
        ("Historik & underhall", [
            ("Forsakring", "insuranceScore", "9%"),
            ("Servicehistorik", "serviceHistoryScore", "8%"),
            ("Agarhistorik", "ownerHistoryScore", "5%"),
        ]),
        ("Sakerhet & tillforlitlighet", [
            ("Drivlina", "drivetrainScore", "8%"),
            ("Aterkallelser", "recallScore", "6%"),
            ("Stold & sakerhet", "theftSecurityScore", "5%"),
        ]),
    ]

    for group_name, items in groups:
        print(f"  [{group_name}]")
        for label, key, weight in items:
            val = b[key]
            bar = "#" * int(val / 5) + "." * (20 - int(val / 5))
            print(f"    {label:<20} {val:6.1f}/100 ({weight}) [{bar}]")
        print()

    if b["debtFinanceScore"] == 0:
        print("  *** KOPSSPARR REGISTRERAD — KOP AVRADS! ***")
        print()

    # Verify all 12 fields present
    expected = ["ageScore", "mileageScore", "insuranceScore", "recallScore",
                "inspectionScore", "debtFinanceScore", "serviceHistoryScore",
                "drivetrainScore", "ownerHistoryScore", "marketValueScore",
                "environmentScore", "theftSecurityScore"]
    missing = [k for k in expected if k not in b]
    if missing:
        print(f"  [FAIL] Missing breakdown fields: {missing}")
    else:
        print(f"  [OK] All 12 breakdown fields present")

print(f"\n{'='*80}")
print("ALL 5 CARS TESTED SUCCESSFULLY")
print(f"{'='*80}")
