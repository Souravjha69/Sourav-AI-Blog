"""Export published blogs + authors from MongoDB into static JSON for the frontend.

Run this locally (with the backend's .env configured and MongoDB reachable) after
adding/editing posts through the admin CMS, then commit + push the regenerated
files in frontend/src/data/ to publish the changes on the static Vercel deploy.

    cd backend && source venv/bin/activate
    python scripts/export_static_data.py
"""
import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

OUT_DIR = BACKEND_DIR.parent / "frontend" / "src" / "data"

# Mirrors the hardcoded list served by GET /api/categories — not stored in Mongo.
CATEGORIES = [
    {"name": "Tech", "slug": "tech", "description": "Deep dives into engineering, infra, and product."},
    {"name": "AI", "slug": "ai", "description": "Research, models, and applied intelligence."},
]


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]

    blogs = await db.blogs.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    authors = await db.authors.find({}, {"_id": 0}).to_list(100)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "blogs.json").write_text(json.dumps(blogs, indent=2))
    (OUT_DIR / "authors.json").write_text(json.dumps(authors, indent=2))
    (OUT_DIR / "categories.json").write_text(json.dumps(CATEGORIES, indent=2))

    print(f"Exported {len(blogs)} published blog(s) and {len(authors)} author(s) to {OUT_DIR}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
