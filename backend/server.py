from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from slugify import slugify

# ---- Setup ----
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="sourav.log Blog CMS")
api = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---- Models ----
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class Author(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    bio: str = ""
    avatar_url: str = ""
    role: str = "Writer"
    twitter: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""


class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    content: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CommentIn(BaseModel):
    name: str
    content: str


class Blog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: str
    content: str
    category: str  # "Tech" | "AI"
    tags: List[str] = []
    cover_image: str = ""
    author_id: str
    read_time: int = 5
    likes: int = 0
    comments: List[dict] = []
    published: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BlogIn(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    tags: List[str] = []
    cover_image: str = ""
    author_id: str
    read_time: int = 5
    published: bool = True


class NewsletterIn(BaseModel):
    email: EmailStr


# ---- Auth Routes ----
@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")
    return {"id": user["id"], "email": user["email"], "name": user["name"],
            "role": user["role"], "token": token}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---- Blog Routes (Public) ----
@api.get("/blogs")
async def list_blogs(category: Optional[str] = None, search: Optional[str] = None,
                     limit: int = 20, skip: int = 0):
    q = {"published": True}
    if category and category.lower() != "all":
        q["category"] = category
    if search:
        q["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    cursor = db.blogs.find(q, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    blogs = await cursor.to_list(limit)
    # attach author
    for b in blogs:
        b["author"] = await db.authors.find_one({"id": b["author_id"]}, {"_id": 0})
    return blogs


@api.get("/blogs/{slug}")
async def get_blog(slug: str):
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not blog:
        raise HTTPException(404, "Blog not found")
    blog["author"] = await db.authors.find_one({"id": blog["author_id"]}, {"_id": 0})
    # related
    related = await db.blogs.find(
        {"category": blog["category"], "id": {"$ne": blog["id"]}, "published": True},
        {"_id": 0}
    ).limit(3).to_list(3)
    blog["related"] = related
    return blog


@api.post("/blogs/{slug}/like")
async def like_blog(slug: str):
    r = await db.blogs.find_one_and_update(
        {"slug": slug}, {"$inc": {"likes": 1}},
        return_document=True, projection={"_id": 0, "likes": 1}
    )
    if not r:
        raise HTTPException(404, "Blog not found")
    return {"likes": r["likes"]}


@api.post("/blogs/{slug}/comments")
async def add_comment(slug: str, body: CommentIn):
    comment = Comment(name=body.name, content=body.content).model_dump()
    r = await db.blogs.find_one_and_update(
        {"slug": slug}, {"$push": {"comments": comment}}, return_document=True,
        projection={"_id": 0}
    )
    if not r:
        raise HTTPException(404, "Blog not found")
    return comment


# ---- Author Routes ----
@api.get("/authors")
async def list_authors():
    return await db.authors.find({}, {"_id": 0}).to_list(100)


@api.get("/authors/{author_id}")
async def get_author(author_id: str):
    author = await db.authors.find_one({"id": author_id}, {"_id": 0})
    if not author:
        raise HTTPException(404, "Author not found")
    blogs = await db.blogs.find({"author_id": author_id, "published": True},
                                 {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"author": author, "blogs": blogs}


@api.get("/categories")
async def categories():
    return [
        {"name": "Tech", "slug": "tech", "description": "Deep dives into engineering, infra, and product."},
        {"name": "AI", "slug": "ai", "description": "Research, models, and applied intelligence."},
    ]


@api.post("/newsletter")
async def subscribe(body: NewsletterIn):
    exists = await db.newsletter.find_one({"email": body.email.lower()})
    if exists:
        return {"ok": True, "already": True}
    await db.newsletter.insert_one({
        "id": str(uuid.uuid4()),
        "email": body.email.lower(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"ok": True}


# ---- Admin Routes ----
@api.post("/admin/blogs")
async def admin_create_blog(body: BlogIn, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    slug_base = slugify(body.title)
    slug = slug_base
    i = 1
    while await db.blogs.find_one({"slug": slug}):
        slug = f"{slug_base}-{i}"
        i += 1
    blog = Blog(slug=slug, **body.model_dump())
    await db.blogs.insert_one(blog.model_dump())
    return blog


@api.put("/admin/blogs/{blog_id}")
async def admin_update_blog(blog_id: str, body: BlogIn, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    existing = await db.blogs.find_one({"id": blog_id})
    if not existing:
        raise HTTPException(404, "Blog not found")
    update = body.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    # regenerate slug if title changed
    if body.title != existing["title"]:
        slug_base = slugify(body.title)
        slug = slug_base
        i = 1
        while await db.blogs.find_one({"slug": slug, "id": {"$ne": blog_id}}):
            slug = f"{slug_base}-{i}"
            i += 1
        update["slug"] = slug
    await db.blogs.update_one({"id": blog_id}, {"$set": update})
    return await db.blogs.find_one({"id": blog_id}, {"_id": 0})


@api.delete("/admin/blogs/{blog_id}")
async def admin_delete_blog(blog_id: str, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    r = await db.blogs.delete_one({"id": blog_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Blog not found")
    return {"ok": True}


@api.get("/admin/blogs")
async def admin_list_blogs(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    return await db.blogs.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.get("/admin/stats")
async def admin_stats(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    total = await db.blogs.count_documents({})
    published = await db.blogs.count_documents({"published": True})
    subs = await db.newsletter.count_documents({})
    total_likes = 0
    async for b in db.blogs.find({}, {"likes": 1}):
        total_likes += b.get("likes", 0)
    return {"total_blogs": total, "published": published,
            "subscribers": subs, "total_likes": total_likes}


# ---- Seed & Startup ----
SAMPLE_AUTHORS = [
    {
        "id": "a1",
        "name": "Sourav Kumar Jha",
        "bio": "Full Stack & AI Developer. Founder, editor, and sole writer of sourav.log — building the software and writing about it.",
        "avatar_url": "https://ui-avatars.com/api/?name=Sourav+Jha&background=111111&color=FAFAF8&size=512&bold=true&font-size=0.38",
        "role": "Founder & Editor-in-Chief",
        "twitter": "",
        "linkedin": "https://www.linkedin.com/in/souravitachi/",
        "github": "https://github.com/Souravjha69",
        "website": "https://souravdev-ochre.vercel.app/",
    },
]

SAMPLE_BLOGS = [
    {
        "title": "The Silent Rewrite: How Compilers Are Becoming Reasoning Engines",
        "excerpt": "The next generation of compilers isn't compiling — it's negotiating. A field report from inside the toolchain revolution.",
        "content": "For decades, the compiler was a translator. It took your syntax, ran it through a deterministic pipeline, and produced instructions a machine could execute. Cold. Mechanical. Predictable.\n\nThat era is quietly ending.\n\nModern build systems now embed neural passes that inspect intent, not just tokens. When you ship code today, a graph of learned heuristics is deciding how your loops unroll, which allocations get elided, and — increasingly — whether your comment about 'safety' actually matches the branch you wrote.\n\n## From lexer to listener\n\nThe classic compiler front-end tokenizes and parses. A reasoning compiler reads your code the way a senior engineer reads a pull request. It builds a semantic model. It notices when you named a variable `retries` but only used it once. It flags the mismatch between your docstring and your control flow.\n\nThis isn't autocomplete. This is a peer.\n\n## The trust problem\n\nWhen the compiler is a reasoning engine, deterministic reproducibility becomes negotiable. Two builds of the same source can produce different binaries because the model behind the pass sampled differently. Teams are responding with 'build attestations' — cryptographic receipts of the reasoning trace that produced each artifact.\n\nWe are witnessing the birth of a new discipline. Call it compiler ethnography: the study of how these systems make decisions on our behalf, and how we hold them accountable when they're wrong.\n\n## What comes next\n\nExpect three shifts in the next 18 months: build systems that ship with policies rather than flags, IDEs that surface the compiler's chain-of-thought inline with your code, and a new class of security bug — the reasoning injection.\n\nThe compiler used to be a wall between us and the machine. It's becoming a mirror.",
        "category": "Tech", "tags": ["compilers", "systems", "engineering"],
        "cover_image": "https://images.pexels.com/photos/28767589/pexels-photo-28767589.jpeg",
        "author_id": "a1", "read_time": 8,
    },
    {
        "title": "Small Models, Loud Rooms: The Case for Local Intelligence",
        "excerpt": "The largest model doesn't win. The one closest to your data does. A quiet manifesto for edge-first AI.",
        "content": "There is a particular kind of quiet you only find in a well-tuned local model. No spinner. No latency. No tab telling you a request is 'thinking'.\n\nJust an answer.\n\nWe spent three years chasing scale. Now the interesting frontier is in the other direction — models small enough to sit inside your editor, your terminal, your notes app, and never leave.\n\n## The context you already have\n\nThe most valuable context in your life is on your own disk. Your commits. Your calendar. Your half-written drafts. Sending that to a server, waiting, and receiving a stochastic paragraph back is an absurd dance. The model should come to the data.\n\n## What changes\n\nLatency becomes design. When your model responds in 40ms, you stop typing prompts and start typing intents. The interface flattens. The keyboard becomes the interface.\n\nPrivacy stops being a policy and becomes a property. Your notes never leave your machine because they never had to.\n\n## The trade\n\nYou lose the benchmark leaderboard. You gain a tool that respects you.\n\nThe next great AI product will not be the smartest. It will be the closest.",
        "category": "AI", "tags": ["edge", "llm", "privacy"],
        "cover_image": "https://images.pexels.com/photos/12198534/pexels-photo-12198534.jpeg",
        "author_id": "a1", "read_time": 6,
    },
    {
        "title": "Agents That Ship: A Field Manual for Production Autonomy",
        "excerpt": "Everyone has an agent demo. Almost no one has an agent in production. Here is what the gap actually looks like.",
        "content": "The demo agent solves a puzzle. The production agent survives Monday morning.\n\nThe difference is not intelligence. It is infrastructure.\n\n## The three failure modes\n\nEvery agent I have watched die in production dies for one of three reasons: it forgot what it was doing, it did the same thing twice, or it made a decision no human could review.\n\nMemory, idempotency, auditability. Solve these three and you have a system. Ignore them and you have theater.\n\n## Memory is not a vector database\n\nThe most common mistake is treating memory as retrieval. Memory is state. State needs a schema. State needs migration. State needs a way to be wrong and get corrected.\n\nStart with a boring relational table. Add embeddings only when a human would need to search by meaning.\n\n## Idempotency is a design constraint\n\nAgents retry. Networks fail. Tools timeout. Every action your agent takes must be safe to repeat. If it sends an email, the email must have a deterministic ID. If it charges a card, the charge must have an idempotency key.\n\nThis is not exotic. Payment systems have done this for thirty years. Agents are just late to the party.\n\n## Ship the log, not the loop\n\nThe most important artifact your agent produces is not its output. It is its trace. Every decision, with the inputs it saw and the reasoning it emitted. Store it. Search it. Replay it.\n\nWhen your agent does something surprising in production, and it will, the trace is the difference between a five-minute rollback and a five-day investigation.\n\n## The boring truth\n\nProduction agents look a lot like production anything else. Queues. Retries. Idempotency. Logs. The magic is not in the model. The magic is in treating the model like the least reliable component in the system, and building around that assumption.",
        "category": "AI", "tags": ["agents", "production", "engineering"],
        "cover_image": "https://images.pexels.com/photos/4220817/pexels-photo-4220817.jpeg",
        "author_id": "a1", "read_time": 9,
    },
    {
        "title": "The New Latency: Why Milliseconds Matter Again",
        "excerpt": "For a decade, latency was solved. Then interfaces got smart, and every millisecond became a design decision.",
        "content": "Latency used to be a networking problem. You measured it, you optimized it, you moved on.\n\nThen interfaces got smart. Now every interaction has a decision in the middle of it, and every decision costs time. Latency is back — but this time it is a design problem, not a networking one.\n\n## The 100ms rule, revisited\n\nJakob Nielsen wrote in 1993 that 100ms is the threshold at which an interface feels instant. That rule still holds. What changed is where the 100ms goes.\n\nIn 2015, you spent 20ms on a network round trip and 80ms on rendering. In 2026, you spend 10ms on the network, 40ms on rendering, and 50ms on inference. The interface still needs to feel instant. The budget is tighter.\n\n## The choreography of waiting\n\nWhen you cannot make something faster, you make waiting feel intentional. Skeleton states. Optimistic UI. Streaming tokens. Each of these is a way to convert waiting from an absence into a presence.\n\nThe best interfaces of the next few years will not be the fastest. They will be the ones that make you forget you are waiting.\n\n## Where to spend the budget\n\nCache aggressively. Predict likely next actions. Stream partials. But most of all: measure. The teams shipping the best latency are the teams with the best dashboards. You cannot design what you cannot see.",
        "category": "Tech", "tags": ["performance", "ux", "design"],
        "cover_image": "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg",
        "author_id": "a1", "read_time": 5,
    },
    {
        "title": "Interfaces After the Chatbox",
        "excerpt": "The text prompt was a rest stop. The real interface is being built now, and it doesn't look like a conversation.",
        "content": "The chatbox was never the destination. It was scaffolding — the fastest way to expose a new capability to a world that hadn't yet decided what to do with it.\n\nNow the world is deciding. And it turns out, people do not want to talk to their software. They want their software to disappear.\n\n## Ambient intent\n\nThe next generation of tools reads what you are already doing and offers help without being asked. Not a suggestion. Not a modal. Just the right button, appearing where your cursor already was.\n\nThis is harder than it sounds. It requires the software to be right almost every time, because the cost of a wrong suggestion in your peripheral vision is much higher than the cost of a wrong answer in a chat window.\n\n## The end of prompts\n\nPrompts are a symptom of a mismatch. When the interface understands what you want, you do not need to describe it. You just do it, and the software follows.\n\nExpect to see prompts retreat into the background — becoming the language between systems, not between humans and systems.\n\n## What replaces the chat\n\nThree patterns are emerging. Inline actions, where the interface offers concrete next steps at the point of decision. Ambient annotation, where the software marks up your work with insights you did not ask for. And silent execution, where the software does the boring parts and asks only when it cannot decide.\n\nNone of these look like chat. All of them feel like magic.",
        "category": "Tech", "tags": ["ux", "ai", "design"],
        "cover_image": "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
        "author_id": "a1", "read_time": 7,
    },
    {
        "title": "Open Weights, Closed Cultures",
        "excerpt": "The models are open. The mindsets aren't. A tour of the strange politics of open-source AI.",
        "content": "The weights are on the internet. Anyone can download them. In a technical sense, the models are free.\n\nAnd yet the culture around them is more fractured, more suspicious, and more tribal than any open-source community I have watched in twenty years.\n\n## The paradox\n\nOpen weights should be a great equalizer. Instead, they have created a new hierarchy — one based on who can afford the GPUs to fine-tune them, who has the data to specialize them, and who has the audience to distribute them.\n\nA weight file is not a product. It is a raw material. And raw materials favor whoever already owns the factory.\n\n## What openness actually enables\n\nThe honest case for open weights is not that they democratize AI. It is that they make AI legible. When the weights are open, researchers can probe them. Auditors can inspect them. Attackers can study them.\n\nThat legibility is worth defending. Not because it produces more equal outcomes, but because it produces more accountable systems.\n\n## The next fight\n\nThe open-weights debate is about to move from 'should the weights be public' to 'should the training data be public'. This is a much harder question, because the data is where the values live.\n\nOpen weights without open data is a peace treaty everyone can sign. Open data is a war.",
        "category": "AI", "tags": ["open-source", "policy", "research"],
        "cover_image": "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
        "author_id": "a1", "read_time": 8,
    },
]


async def seed():
    # admin
    admin_email = os.environ.get("ADMIN_EMAIL", "souravkumarjha301@gmail.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email},
                                      {"$set": {"password_hash": hash_password(admin_password)}})

    # authors
    for a in SAMPLE_AUTHORS:
        if not await db.authors.find_one({"id": a["id"]}):
            await db.authors.insert_one(a)

    # blogs
    for i, b in enumerate(SAMPLE_BLOGS):
        s = slugify(b["title"])
        if not await db.blogs.find_one({"slug": s}):
            blog = Blog(slug=s, **b)
            # stagger created_at so ordering is nice
            blog_dict = blog.model_dump()
            blog_dict["created_at"] = (datetime.now(timezone.utc) - timedelta(days=i)).isoformat()
            blog_dict["likes"] = 42 + i * 17
            await db.blogs.insert_one(blog_dict)


@app.on_event("startup")
async def _startup():
    await db.users.create_index("email", unique=True)
    await db.blogs.create_index("slug", unique=True)
    await db.blogs.create_index("category")
    await seed()


@app.on_event("shutdown")
async def _shutdown():
    client.close()


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
