# services/pipeline/seed_gold_sample.py
from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

SRC_DIR = Path(__file__).resolve().parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from pipeline.db.gold import upsert_gold

CITY_BASE_AQI = {
    "US_RAL_01": 2,
    "US_DUR_02": 3,
    "GB_LON_01": 1,
}


def generate_sample_rows(hours: int = 48) -> list[dict]:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    rows = []
    for city_id, base_aqi in CITY_BASE_AQI.items():
        for i in range(hours):
            observed_at = now - timedelta(hours=hours - i - 1)
            aqi = max(1, min(5, base_aqi + (i % 3) - 1))
            rows.append({
                "city_id": city_id,
                "observed_at": observed_at,
                "aqi": aqi,
                "pm2_5": 8.0 + aqi * 2,
                "no2": 10.0 + aqi,
            })
    return rows


if __name__ == "__main__":
    result = upsert_gold(generate_sample_rows())
    print(f"Stored {result.stored} rows ({result.inserted} inserted, {result.updated} updated)")