"""
NIRNAY – Seed Traffic Signal Data
==================================
Seed script to load DEMO/SIMULATED traffic signal statistics from data4.csv
into the SQLite database.
"""

import os
import csv
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.traffic import TrafficSignal


def seed_traffic_signals(db: Session) -> None:
    """Read data6.csv and seed the traffic_signals table with simulated Nagpur zone signal counts."""
    # Check if already seeded
    if db.query(TrafficSignal).first() is not None:
        print("[NIRNAY] Traffic signal demo data already present -- skipping.")
        return

    csv_path = os.path.join(os.path.dirname(__file__), "data6.csv")
    if not os.path.exists(csv_path):
        csv_path = "data6.csv"

    if not os.path.exists(csv_path):
        print(f"[NIRNAY] seed_data warning: {csv_path} not found.")
        return

    print(f"[NIRNAY] Seeding traffic signals from {csv_path}...")
    
    ZONE_COUNTS = {
        "Midic Zone": (13, 5),
        "Sonegaon Zone": (22, 17),
        "Sitabuldi Zone": (36, 32),
        "Sadar Zone": (27, 12),
        "Cotton Market Zone": (34, 24),
        "Lakadganj Zone": (22, 14),
        "Ajani traffic Zone": (39, 28),
        "Indore traffic Zone": (35, 24)
    }
    
    def get_zone_from_location(location: str) -> str:
        loc = location.lower()
        if "sitabuldi" in loc or "variety" in loc or "morris" in loc:
            return "Sitabuldi Zone"
        if "sadar" in loc:
            return "Sadar Zone"
        if "cotton" in loc or "mhalgi" in loc or "dighori" in loc:
            return "Cotton Market Zone"
        if "lakadganj" in loc or "kharbi" in loc or "chikli" in loc or "pardi" in loc or "telephone" in loc or "prakash" in loc or "mayo" in loc:
            return "Lakadganj Zone"
        if "ajni" in loc or "manish" in loc or "chhatrapati" in loc or "neeri" in loc:
            return "Ajani traffic Zone"
        if "sonegaon" in loc or "chinchbhavan" in loc or "airport" in loc:
            return "Sonegaon Zone"
        if "hingna" in loc or "dongargaon" in loc or "rajiv" in loc or "seva" in loc or "wadhamna" in loc or "wadi" in loc or "khandghav" in loc or "ravi" in loc or "auto" in loc or "gorewada" in loc:
            return "Midic Zone"
        return "Indore traffic Zone"

    seeded_zones = set()
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            loc = row.get("location")
            if not loc:
                continue
            zone_name = get_zone_from_location(loc)
            if zone_name not in seeded_zones:
                intersections, signalized = ZONE_COUNTS.get(zone_name, (20, 10))
                sig = TrafficSignal(
                    zone_name=f"[DEMO] {zone_name}",
                    intersections=intersections,
                    signalized_intersections=signalized
                )
                db.add(sig)
                seeded_zones.add(zone_name)
    
    for zone_name, (intersections, signalized) in ZONE_COUNTS.items():
        if zone_name not in seeded_zones:
            sig = TrafficSignal(
                zone_name=f"[DEMO] {zone_name}",
                intersections=intersections,
                signalized_intersections=signalized
            )
            db.add(sig)
            seeded_zones.add(zone_name)

    db.commit()
    print("[NIRNAY] Traffic signals seeded successfully.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_traffic_signals(db)
    finally:
        db.close()
