"""
NIRNAY – Demo / Simulated Seed Data
====================================
WARNING: All data below is **DEMO / SIMULATED** for prototype purposes.
- Zone names reference real Nagpur localities but coordinates are
  approximate and NOT surveyed GPS points.
- Officer IDs, patrol locations, and unit assignments are entirely
  fictional and do NOT represent actual Nagpur Police personnel.
- Traffic densities, risk scores, and incident reports are randomly
  generated and do NOT reflect real-world conditions.

Do NOT use this data for any operational, legal, or statistical purpose.
"""

from datetime import datetime, timezone, timedelta

from app.database.session import SessionLocal
from app.models import (
    Zone,
    Junction,
    Incident,
    Traffic,
    RiskScore,
    RiskHistory,
    PoliceUnit,
    DeploymentRecommendation,
    User,
    IncidentType,
    IncidentStatus,
    TrafficLevel,
    RiskLevel,
    RoadType,
    PoliceUnitStatus,
    DeploymentStatus,
    UserRole,
)
from app.utils.auth import hash_password

_NOW = datetime.now(timezone.utc)


# ─────────────────────────────────────────────────────────
# DEMO ZONES  (approximate centre-points of Nagpur areas)
# ─────────────────────────────────────────────────────────
_DEMO_ZONES = [
    {"zone_id": "ZN-01", "zone_name": "[DEMO] Sitabuldi",       "latitude": 21.1458, "longitude": 79.0882},
    {"zone_id": "ZN-02", "zone_name": "[DEMO] Dharampeth",      "latitude": 21.1500, "longitude": 79.0750},
    {"zone_id": "ZN-03", "zone_name": "[DEMO] Sadar",           "latitude": 21.1550, "longitude": 79.0900},
    {"zone_id": "ZN-04", "zone_name": "[DEMO] Manewada",        "latitude": 21.1200, "longitude": 79.1100},
    {"zone_id": "ZN-05", "zone_name": "[DEMO] Hingna",          "latitude": 21.1050, "longitude": 79.0400},
    {"zone_id": "ZN-06", "zone_name": "[DEMO] Wardha Road",     "latitude": 21.1100, "longitude": 79.0950},
    {"zone_id": "ZN-07", "zone_name": "[DEMO] Lakadganj",       "latitude": 21.1600, "longitude": 79.1100},
    {"zone_id": "ZN-08", "zone_name": "[DEMO] Gandhibagh",      "latitude": 21.1520, "longitude": 79.1000},
]


# ─────────────────────────────────────────────────────────
# DEMO JUNCTIONS
# ─────────────────────────────────────────────────────────
_DEMO_JUNCTIONS = [
    # Sitabuldi
    {"junction_id": "JN-0101", "junction_name": "[DEMO] Sitabuldi T-Point",       "zone_id": "ZN-01", "latitude": 21.1460, "longitude": 79.0885, "road_type": RoadType.ARTERIAL},
    {"junction_id": "JN-0102", "junction_name": "[DEMO] Variety Square",          "zone_id": "ZN-01", "latitude": 21.1480, "longitude": 79.0860, "road_type": RoadType.ARTERIAL},
    # Dharampeth
    {"junction_id": "JN-0201", "junction_name": "[DEMO] Law College Square",      "zone_id": "ZN-02", "latitude": 21.1510, "longitude": 79.0740, "road_type": RoadType.COLLECTOR},
    {"junction_id": "JN-0202", "junction_name": "[DEMO] Dharampeth Tower Chowk",  "zone_id": "ZN-02", "latitude": 21.1495, "longitude": 79.0770, "road_type": RoadType.LOCAL},
    # Sadar
    {"junction_id": "JN-0301", "junction_name": "[DEMO] Sadar Flyover Junction",  "zone_id": "ZN-03", "latitude": 21.1555, "longitude": 79.0910, "road_type": RoadType.HIGHWAY},
    {"junction_id": "JN-0302", "junction_name": "[DEMO] RBI Square",              "zone_id": "ZN-03", "latitude": 21.1540, "longitude": 79.0925, "road_type": RoadType.ARTERIAL},
    # Manewada
    {"junction_id": "JN-0401", "junction_name": "[DEMO] Manewada Square",         "zone_id": "ZN-04", "latitude": 21.1210, "longitude": 79.1110, "road_type": RoadType.LOCAL},
    # Hingna
    {"junction_id": "JN-0501", "junction_name": "[DEMO] Hingna T-Point",          "zone_id": "ZN-05", "latitude": 21.1060, "longitude": 79.0410, "road_type": RoadType.HIGHWAY},
    # Wardha Road
    {"junction_id": "JN-0601", "junction_name": "[DEMO] Wardha Road Flyover",     "zone_id": "ZN-06", "latitude": 21.1115, "longitude": 79.0960, "road_type": RoadType.HIGHWAY},
    {"junction_id": "JN-0602", "junction_name": "[DEMO] Automotive Square",       "zone_id": "ZN-06", "latitude": 21.1090, "longitude": 79.0940, "road_type": RoadType.ARTERIAL},
    # Lakadganj
    {"junction_id": "JN-0701", "junction_name": "[DEMO] Lakadganj Chowk",         "zone_id": "ZN-07", "latitude": 21.1610, "longitude": 79.1110, "road_type": RoadType.COLLECTOR},
    # Gandhibagh
    {"junction_id": "JN-0801", "junction_name": "[DEMO] Cotton Market Square",    "zone_id": "ZN-08", "latitude": 21.1525, "longitude": 79.1010, "road_type": RoadType.ARTERIAL},
]


# ─────────────────────────────────────────────────────────
# DEMO INCIDENTS
# ─────────────────────────────────────────────────────────
_DEMO_INCIDENTS = [
    {"incident_type": IncidentType.ACCIDENT,          "latitude": 21.1461, "longitude": 79.0886, "photo_path": None, "reported_at": _NOW - timedelta(hours=2),  "status": IncidentStatus.VERIFIED},
    {"incident_type": IncidentType.SIGNAL_FAILURE,    "latitude": 21.1512, "longitude": 79.0742, "photo_path": None, "reported_at": _NOW - timedelta(hours=5),  "status": IncidentStatus.IN_PROGRESS},
    {"incident_type": IncidentType.ROAD_HAZARD,       "latitude": 21.1557, "longitude": 79.0912, "photo_path": None, "reported_at": _NOW - timedelta(hours=1),  "status": IncidentStatus.PENDING},
    {"incident_type": IncidentType.VEHICLE_BREAKDOWN, "latitude": 21.1211, "longitude": 79.1112, "photo_path": None, "reported_at": _NOW - timedelta(minutes=45), "status": IncidentStatus.PENDING},
    {"incident_type": IncidentType.TRAFFIC_VIOLATION, "latitude": 21.1062, "longitude": 79.0412, "photo_path": None, "reported_at": _NOW - timedelta(hours=3),  "status": IncidentStatus.RESOLVED},
    {"incident_type": IncidentType.ACCIDENT,          "latitude": 21.1092, "longitude": 79.0942, "photo_path": None, "reported_at": _NOW - timedelta(minutes=20), "status": IncidentStatus.PENDING},
    {"incident_type": IncidentType.ROAD_DAMAGE,       "latitude": 21.1527, "longitude": 79.1012, "photo_path": None, "reported_at": _NOW - timedelta(hours=8),  "status": IncidentStatus.VERIFIED},
]


# ─────────────────────────────────────────────────────────
# DEMO TRAFFIC READINGS
# ─────────────────────────────────────────────────────────
_DEMO_TRAFFIC = [
    {"junction_id": "JN-0101", "traffic_level": TrafficLevel.HIGH,     "vehicle_density": 72.5,  "timestamp": _NOW - timedelta(minutes=10)},
    {"junction_id": "JN-0102", "traffic_level": TrafficLevel.CRITICAL, "vehicle_density": 95.0,  "timestamp": _NOW - timedelta(minutes=8)},
    {"junction_id": "JN-0201", "traffic_level": TrafficLevel.MODERATE, "vehicle_density": 45.3,  "timestamp": _NOW - timedelta(minutes=12)},
    {"junction_id": "JN-0202", "traffic_level": TrafficLevel.LOW,      "vehicle_density": 18.0,  "timestamp": _NOW - timedelta(minutes=15)},
    {"junction_id": "JN-0301", "traffic_level": TrafficLevel.HIGH,     "vehicle_density": 80.2,  "timestamp": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0302", "traffic_level": TrafficLevel.MODERATE, "vehicle_density": 50.7,  "timestamp": _NOW - timedelta(minutes=7)},
    {"junction_id": "JN-0401", "traffic_level": TrafficLevel.LOW,      "vehicle_density": 22.1,  "timestamp": _NOW - timedelta(minutes=20)},
    {"junction_id": "JN-0501", "traffic_level": TrafficLevel.HIGH,     "vehicle_density": 78.9,  "timestamp": _NOW - timedelta(minutes=3)},
    {"junction_id": "JN-0601", "traffic_level": TrafficLevel.CRITICAL, "vehicle_density": 98.4,  "timestamp": _NOW - timedelta(minutes=2)},
    {"junction_id": "JN-0602", "traffic_level": TrafficLevel.HIGH,     "vehicle_density": 70.0,  "timestamp": _NOW - timedelta(minutes=6)},
    {"junction_id": "JN-0701", "traffic_level": TrafficLevel.MODERATE, "vehicle_density": 40.5,  "timestamp": _NOW - timedelta(minutes=14)},
    {"junction_id": "JN-0801", "traffic_level": TrafficLevel.HIGH,     "vehicle_density": 68.3,  "timestamp": _NOW - timedelta(minutes=9)},
]


# ─────────────────────────────────────────────────────────
# DEMO RISK SCORES (latest snapshot)
# ─────────────────────────────────────────────────────────
_DEMO_RISK_SCORES = [
    {"junction_id": "JN-0101", "score": 72.0, "risk_level": RiskLevel.HIGH,     "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0102", "score": 88.5, "risk_level": RiskLevel.CRITICAL, "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0201", "score": 45.0, "risk_level": RiskLevel.MEDIUM,   "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0202", "score": 20.0, "risk_level": RiskLevel.LOW,      "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0301", "score": 78.3, "risk_level": RiskLevel.HIGH,     "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0302", "score": 52.1, "risk_level": RiskLevel.MEDIUM,   "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0401", "score": 25.0, "risk_level": RiskLevel.LOW,      "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0501", "score": 74.8, "risk_level": RiskLevel.HIGH,     "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0601", "score": 91.2, "risk_level": RiskLevel.CRITICAL, "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0602", "score": 67.4, "risk_level": RiskLevel.HIGH,     "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0701", "score": 38.9, "risk_level": RiskLevel.MEDIUM,   "calculated_at": _NOW - timedelta(minutes=5)},
    {"junction_id": "JN-0801", "score": 65.0, "risk_level": RiskLevel.HIGH,     "calculated_at": _NOW - timedelta(minutes=5)},
]


# ─────────────────────────────────────────────────────────
# DEMO RISK HISTORY  (simulated trend over last 6 hours)
# ─────────────────────────────────────────────────────────
def _generate_risk_history() -> list[dict]:
    """Generate 6 hourly snapshots for key junctions (simulated)."""
    history = []
    trending_junctions = {
        "JN-0101": [55, 60, 63, 68, 70, 72],       # increasing
        "JN-0102": [70, 75, 80, 83, 86, 88],       # increasing
        "JN-0301": [82, 80, 79, 78, 78, 78],       # stable-high
        "JN-0601": [60, 70, 78, 85, 89, 91],       # sharply increasing
        "JN-0801": [68, 66, 65, 65, 65, 65],       # stable
    }
    for jid, scores in trending_junctions.items():
        for i, score in enumerate(scores):
            history.append({
                "junction_id": jid,
                "risk_score": float(score),
                "timestamp": _NOW - timedelta(hours=6 - i),
            })
    return history


# ─────────────────────────────────────────────────────────
# DEMO POLICE UNITS  (fictional officers, simulated locations)
# ─────────────────────────────────────────────────────────
_DEMO_POLICE_UNITS = [
    {"officer_id": "OFR-001", "latitude": 21.1465, "longitude": 79.0890, "status": PoliceUnitStatus.AVAILABLE},
    {"officer_id": "OFR-002", "latitude": 21.1505, "longitude": 79.0755, "status": PoliceUnitStatus.AVAILABLE},
    {"officer_id": "OFR-003", "latitude": 21.1548, "longitude": 79.0905, "status": PoliceUnitStatus.ON_DUTY},
    {"officer_id": "OFR-004", "latitude": 21.1215, "longitude": 79.1105, "status": PoliceUnitStatus.AVAILABLE},
    {"officer_id": "OFR-005", "latitude": 21.1055, "longitude": 79.0415, "status": PoliceUnitStatus.OFF_DUTY},
    {"officer_id": "OFR-006", "latitude": 21.1120, "longitude": 79.0965, "status": PoliceUnitStatus.AVAILABLE},
    {"officer_id": "OFR-007", "latitude": 21.1480, "longitude": 79.0870, "status": PoliceUnitStatus.AVAILABLE},
    {"officer_id": "OFR-008", "latitude": 21.1530, "longitude": 79.1015, "status": PoliceUnitStatus.ON_DUTY},
    {"officer_id": "OFR-009", "latitude": 21.1610, "longitude": 79.1115, "status": PoliceUnitStatus.AVAILABLE},
    {"officer_id": "OFR-010", "latitude": 21.1490, "longitude": 79.0900, "status": PoliceUnitStatus.ON_BREAK},
    {"officer_id": "OFR-011", "latitude": 21.1100, "longitude": 79.0950, "status": PoliceUnitStatus.AVAILABLE},
    {"officer_id": "OFR-012", "latitude": 21.1470, "longitude": 79.0880, "status": PoliceUnitStatus.AVAILABLE},
]


# ─────────────────────────────────────────────────────────
# DEMO DEPLOYMENT RECOMMENDATIONS
# ─────────────────────────────────────────────────────────
_DEMO_DEPLOYMENTS = [
    {
        "junction_id": "JN-0102",
        "officer_id": "OFR-007",
        "distance_km": 1.2,
        "estimated_response_minutes": 5.0,
        "reason": "[DEMO] High risk score (88.5), increasing congestion, recent accident in zone ZN-01. Current police coverage below required level.",
        "status": DeploymentStatus.PENDING,
        "created_at": _NOW - timedelta(minutes=3),
    },
    {
        "junction_id": "JN-0102",
        "officer_id": "OFR-012",
        "distance_km": 1.8,
        "estimated_response_minutes": 8.0,
        "reason": "[DEMO] Supporting unit for critical-risk junction. Increasing vehicle density (95 veh/min).",
        "status": DeploymentStatus.PENDING,
        "created_at": _NOW - timedelta(minutes=3),
    },
    {
        "junction_id": "JN-0601",
        "officer_id": "OFR-006",
        "distance_km": 0.8,
        "estimated_response_minutes": 3.5,
        "reason": "[DEMO] Critical risk score (91.2), sharp upward trend, recent accident nearby. Immediate deployment recommended.",
        "status": DeploymentStatus.ACCEPTED,
        "created_at": _NOW - timedelta(minutes=10),
    },
    {
        "junction_id": "JN-0601",
        "officer_id": "OFR-011",
        "distance_km": 1.5,
        "estimated_response_minutes": 6.0,
        "reason": "[DEMO] Backup unit for Wardha Road Flyover. Traffic density at 98.4 veh/min (critical).",
        "status": DeploymentStatus.PENDING,
        "created_at": _NOW - timedelta(minutes=8),
    },
]


# ─────────────────────────────────────────────────────────
# SEED FUNCTION
# ─────────────────────────────────────────────────────────
def seed_demo_data() -> None:
    """
    Populate the database with DEMO / SIMULATED data.

    This function is idempotent when called on an empty database.
    All seeded records are clearly marked as demo data and do NOT
    represent real Nagpur Police operations or live traffic feeds.
    """
    db = SessionLocal()
    try:
        # Skip if data already exists
        if db.query(Zone).first() is not None:
            print("[NIRNAY] Demo data already present -- skipping seed.")
            return

        # 0. Demo user accounts
        #    -------------------------------------------------------
        #    WARNING: These are DEMO accounts for prototype testing.
        #    The police account does NOT represent any real officer.
        #    Passwords are bcrypt-hashed before storage.
        #    -------------------------------------------------------
        demo_users = [
            User(
                username="demo_police",
                email="demo.police@nirnay.dev",
                hashed_password=hash_password("nirnay2026"),
                full_name="[DEMO] Inspector Nagpur",
                role=UserRole.POLICE,
                is_active=True,
            ),
            User(
                username="demo_citizen",
                email="demo.citizen@nirnay.dev",
                hashed_password=hash_password("citizen123"),
                full_name="[DEMO] Rahul Citizen",
                role=UserRole.CITIZEN,
                is_active=True,
            ),
        ]
        for u in demo_users:
            db.add(u)
        db.flush()

        # 1. Zones
        for z in _DEMO_ZONES:
            db.add(Zone(**z))
        db.flush()

        # 2. Junctions
        for j in _DEMO_JUNCTIONS:
            db.add(Junction(**j))
        db.flush()

        # 3. Incidents
        for inc in _DEMO_INCIDENTS:
            db.add(Incident(**inc))
        db.flush()

        # 4. Traffic
        for t in _DEMO_TRAFFIC:
            db.add(Traffic(**t))
        db.flush()

        # 5. Risk scores
        for rs in _DEMO_RISK_SCORES:
            db.add(RiskScore(**rs))
        db.flush()

        # 6. Risk history
        for rh in _generate_risk_history():
            db.add(RiskHistory(**rh))
        db.flush()

        # 7. Police units
        for pu in _DEMO_POLICE_UNITS:
            db.add(PoliceUnit(**pu))
        db.flush()

        # 8. Deployment recommendations
        for dr in _DEMO_DEPLOYMENTS:
            db.add(DeploymentRecommendation(**dr))
        db.flush()

        # 9. Traffic Signals (seeded from data6.csv)
        import os
        import csv
        from app.models.traffic import TrafficSignal
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data6.csv")
        if os.path.exists(csv_path):
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
                    
            db.flush()

        db.commit()
        print("[NIRNAY] Demo data seeded successfully.")
        print(f"  Users:           {len(demo_users)} (police: demo_police / citizen: demo_citizen)")
        print(f"  Zones:           {len(_DEMO_ZONES)}")
        print(f"  Junctions:       {len(_DEMO_JUNCTIONS)}")
        print(f"  Incidents:       {len(_DEMO_INCIDENTS)}")
        print(f"  Traffic records: {len(_DEMO_TRAFFIC)}")
        print(f"  Risk scores:     {len(_DEMO_RISK_SCORES)}")
        print(f"  Risk history:    {len(_generate_risk_history())}")
        print(f"  Police units:    {len(_DEMO_POLICE_UNITS)}")
        print(f"  Deployments:     {len(_DEMO_DEPLOYMENTS)}")

    except Exception as e:
        db.rollback()
        print(f"[NIRNAY] Seed error: {e}")
        raise
    finally:
        db.close()
