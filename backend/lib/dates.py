from datetime import datetime
from zoneinfo import ZoneInfo
def today_iso(tz_name='Asia/Kolkata'): return datetime.now(ZoneInfo(tz_name)).date().isoformat()
