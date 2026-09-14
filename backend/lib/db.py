import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "bappa_darshan")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

INDEXES = {
    "status_checks": [
        IndexModel([("timestamp", DESCENDING)], name="timestamp_desc")
    ],
    "wishes": [
        IndexModel([("created_at", DESCENDING)], name="created_at_desc")
    ],
    "seva_intents": [
        IndexModel(
            [("date", DESCENDING), ("created_at", DESCENDING)],
            name="date_created_desc",
        )
    ],
    "counters": [
        IndexModel([("key", ASCENDING)], name="key", unique=True)
    ],
}


async def ensure_indexes():
    for name, indexes in INDEXES.items():
        try:
            await getattr(db, name).create_indexes(indexes)
        except Exception:
            pass