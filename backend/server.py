from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId
import secrets

ROOT_DIR = Path(__file__).parent

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
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
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "user"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class BookRequest(BaseModel):
    type: str = "book"
    name: str
    author: str
    serial_number: str
    isbn: Optional[str] = None
    category: Optional[str] = None
    available_copies: int = 1

class BookResponse(BaseModel):
    id: str
    type: str
    name: str
    author: str
    serial_number: str
    isbn: Optional[str] = None
    category: Optional[str] = None
    available_copies: int
    created_at: str

class MembershipRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    duration_months: int = 6

class MembershipUpdateRequest(BaseModel):
    extend_months: Optional[int] = None
    cancel: bool = False

class MembershipResponse(BaseModel):
    id: str
    membership_number: str
    name: str
    email: str
    phone: str
    address: str
    start_date: str
    end_date: str
    status: str
    created_at: str

class IssueBookRequest(BaseModel):
    book_id: str
    membership_number: str
    issue_date: str
    return_date: str
    remarks: Optional[str] = None

class ReturnBookRequest(BaseModel):
    transaction_id: str
    actual_return_date: str
    fine_paid: bool = False
    fine_remarks: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    book_id: str
    book_name: str
    author: str
    serial_number: str
    membership_number: str
    member_name: str
    issue_date: str
    expected_return_date: str
    actual_return_date: Optional[str] = None
    fine_amount: float = 0.0
    fine_paid: bool = False
    status: str
    remarks: Optional[str] = None
    fine_remarks: Optional[str] = None
    created_at: str

@api_router.post("/auth/register", response_model=UserResponse)
async def register(req: RegisterRequest, response: Response):
    email_lower = req.email.lower()
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(req.password)
    user_doc = {
        "email": email_lower,
        "password_hash": hashed,
        "name": req.name,
        "role": req.role,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return UserResponse(id=user_id, email=email_lower, name=req.name, role=req.role)

@api_router.post("/auth/login", response_model=UserResponse)
async def login(req: LoginRequest, response: Response):
    email_lower = req.email.lower()
    user = await db.users.find_one({"email": email_lower})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return UserResponse(id=user_id, email=email_lower, name=user["name"], role=user["role"])

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["_id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"]
    )

@api_router.get("/books", response_model=List[BookResponse])
async def get_books(current_user: dict = Depends(get_current_user)):
    books = await db.books.find({}, {"_id": 1, "type": 1, "name": 1, "author": 1, "serial_number": 1, "isbn": 1, "category": 1, "available_copies": 1, "created_at": 1}).to_list(1000)
    return [BookResponse(
        id=str(b["_id"]),
        type=b.get("type", "book"),
        name=b["name"],
        author=b["author"],
        serial_number=b["serial_number"],
        isbn=b.get("isbn"),
        category=b.get("category"),
        available_copies=b.get("available_copies", 1),
        created_at=b["created_at"].isoformat() if isinstance(b["created_at"], datetime) else b["created_at"]
    ) for b in books]

@api_router.post("/books", response_model=BookResponse)
async def create_book(book: BookRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.books.find_one({"serial_number": book.serial_number})
    if existing:
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    book_doc = book.model_dump()
    book_doc["created_at"] = datetime.now(timezone.utc)
    result = await db.books.insert_one(book_doc)
    
    return BookResponse(
        id=str(result.inserted_id),
        type=book.type,
        name=book.name,
        author=book.author,
        serial_number=book.serial_number,
        isbn=book.isbn,
        category=book.category,
        available_copies=book.available_copies,
        created_at=book_doc["created_at"].isoformat()
    )

@api_router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: str, book: BookRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.books.find_one({"_id": ObjectId(book_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Book not found")
    
    serial_conflict = await db.books.find_one({"serial_number": book.serial_number, "_id": {"$ne": ObjectId(book_id)}})
    if serial_conflict:
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    book_doc = book.model_dump()
    await db.books.update_one({"_id": ObjectId(book_id)}, {"$set": book_doc})
    
    return BookResponse(
        id=book_id,
        type=book.type,
        name=book.name,
        author=book.author,
        serial_number=book.serial_number,
        isbn=book.isbn,
        category=book.category,
        available_copies=book.available_copies,
        created_at=existing["created_at"].isoformat() if isinstance(existing["created_at"], datetime) else existing["created_at"]
    )

@api_router.get("/books/search")
async def search_books(name: Optional[str] = None, author: Optional[str] = None, serial_number: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if author:
        query["author"] = {"$regex": author, "$options": "i"}
    if serial_number:
        query["serial_number"] = {"$regex": serial_number, "$options": "i"}
    
    if not query:
        raise HTTPException(status_code=400, detail="At least one search parameter required")
    
    books = await db.books.find(query, {"_id": 1, "type": 1, "name": 1, "author": 1, "serial_number": 1, "available_copies": 1}).to_list(100)
    return [{
        "id": str(b["_id"]),
        "type": b.get("type", "book"),
        "name": b["name"],
        "author": b["author"],
        "serial_number": b["serial_number"],
        "available_copies": b.get("available_copies", 1)
    } for b in books]

@api_router.post("/memberships", response_model=MembershipResponse)
async def create_membership(membership: MembershipRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    membership_number = f"MEM{datetime.now().strftime('%Y%m%d%H%M%S')}"
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=membership.duration_months * 30)
    
    membership_doc = membership.model_dump()
    membership_doc["membership_number"] = membership_number
    membership_doc["start_date"] = start_date
    membership_doc["end_date"] = end_date
    membership_doc["status"] = "active"
    membership_doc["created_at"] = start_date
    
    result = await db.memberships.insert_one(membership_doc)
    
    return MembershipResponse(
        id=str(result.inserted_id),
        membership_number=membership_number,
        name=membership.name,
        email=membership.email,
        phone=membership.phone,
        address=membership.address,
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat(),
        status="active",
        created_at=start_date.isoformat()
    )

@api_router.get("/memberships")
async def get_memberships(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    memberships = await db.memberships.find({}, {"_id": 0}).to_list(1000)
    return memberships

@api_router.get("/memberships/{membership_number}", response_model=MembershipResponse)
async def get_membership(membership_number: str, current_user: dict = Depends(get_current_user)):
    membership = await db.memberships.find_one({"membership_number": membership_number})
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    return MembershipResponse(
        id=str(membership["_id"]),
        membership_number=membership["membership_number"],
        name=membership["name"],
        email=membership["email"],
        phone=membership["phone"],
        address=membership["address"],
        start_date=membership["start_date"].isoformat() if isinstance(membership["start_date"], datetime) else membership["start_date"],
        end_date=membership["end_date"].isoformat() if isinstance(membership["end_date"], datetime) else membership["end_date"],
        status=membership["status"],
        created_at=membership["created_at"].isoformat() if isinstance(membership["created_at"], datetime) else membership["created_at"]
    )

@api_router.put("/memberships/{membership_number}")
async def update_membership(membership_number: str, update: MembershipUpdateRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    membership = await db.memberships.find_one({"membership_number": membership_number})
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    if update.cancel:
        await db.memberships.update_one({"membership_number": membership_number}, {"$set": {"status": "cancelled"}})
        return {"message": "Membership cancelled"}
    
    if update.extend_months:
        current_end = membership["end_date"]
        if isinstance(current_end, str):
            current_end = datetime.fromisoformat(current_end.replace("Z", "+00:00"))
        new_end = current_end + timedelta(days=update.extend_months * 30)
        await db.memberships.update_one({"membership_number": membership_number}, {"$set": {"end_date": new_end}})
        return {"message": "Membership extended", "new_end_date": new_end.isoformat()}
    
    return {"message": "No changes made"}

@api_router.post("/transactions/issue", response_model=TransactionResponse)
async def issue_book(transaction: IssueBookRequest, current_user: dict = Depends(get_current_user)):
    book = await db.books.find_one({"_id": ObjectId(transaction.book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.get("available_copies", 1) < 1:
        raise HTTPException(status_code=400, detail="No copies available")
    
    membership = await db.memberships.find_one({"membership_number": transaction.membership_number})
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    if membership["status"] != "active":
        raise HTTPException(status_code=400, detail="Membership is not active")
    
    transaction_doc = {
        "book_id": transaction.book_id,
        "book_name": book["name"],
        "author": book["author"],
        "serial_number": book["serial_number"],
        "membership_number": transaction.membership_number,
        "member_name": membership["name"],
        "issue_date": transaction.issue_date,
        "expected_return_date": transaction.return_date,
        "actual_return_date": None,
        "fine_amount": 0.0,
        "fine_paid": False,
        "status": "issued",
        "remarks": transaction.remarks,
        "fine_remarks": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.transactions.insert_one(transaction_doc)
    await db.books.update_one({"_id": ObjectId(transaction.book_id)}, {"$inc": {"available_copies": -1}})
    
    return TransactionResponse(
        id=str(result.inserted_id),
        book_id=transaction.book_id,
        book_name=book["name"],
        author=book["author"],
        serial_number=book["serial_number"],
        membership_number=transaction.membership_number,
        member_name=membership["name"],
        issue_date=transaction.issue_date,
        expected_return_date=transaction.return_date,
        actual_return_date=None,
        fine_amount=0.0,
        fine_paid=False,
        status="issued",
        remarks=transaction.remarks,
        created_at=transaction_doc["created_at"].isoformat()
    )

@api_router.get("/transactions")
async def get_transactions(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if status:
        query["status"] = status
    
    transactions = await db.transactions.find(query, {"_id": 1, "book_name": 1, "author": 1, "serial_number": 1, "membership_number": 1, "member_name": 1, "issue_date": 1, "expected_return_date": 1, "actual_return_date": 1, "fine_amount": 1, "fine_paid": 1, "status": 1}).to_list(1000)
    return [{
        "id": str(t["_id"]),
        "book_name": t["book_name"],
        "author": t["author"],
        "serial_number": t["serial_number"],
        "membership_number": t["membership_number"],
        "member_name": t["member_name"],
        "issue_date": t["issue_date"],
        "expected_return_date": t["expected_return_date"],
        "actual_return_date": t.get("actual_return_date"),
        "fine_amount": t.get("fine_amount", 0.0),
        "fine_paid": t.get("fine_paid", False),
        "status": t["status"]
    } for t in transactions]

@api_router.get("/transactions/{transaction_id}")
async def get_transaction(transaction_id: str, current_user: dict = Depends(get_current_user)):
    transaction = await db.transactions.find_one({"_id": ObjectId(transaction_id)}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@api_router.post("/transactions/return")
async def return_book(return_req: ReturnBookRequest, current_user: dict = Depends(get_current_user)):
    transaction = await db.transactions.find_one({"_id": ObjectId(return_req.transaction_id)})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] == "returned":
        raise HTTPException(status_code=400, detail="Book already returned")
    
    expected_return = datetime.fromisoformat(transaction["expected_return_date"].replace("Z", "+00:00")) if isinstance(transaction["expected_return_date"], str) else transaction["expected_return_date"]
    actual_return = datetime.fromisoformat(return_req.actual_return_date.replace("Z", "+00:00"))
    
    fine_amount = 0.0
    if actual_return > expected_return:
        days_late = (actual_return - expected_return).days
        fine_amount = days_late * 5.0
    
    if fine_amount > 0 and not return_req.fine_paid:
        raise HTTPException(status_code=400, detail="Fine must be paid before returning")
    
    await db.transactions.update_one(
        {"_id": ObjectId(return_req.transaction_id)},
        {"$set": {
            "actual_return_date": return_req.actual_return_date,
            "fine_amount": fine_amount,
            "fine_paid": return_req.fine_paid if fine_amount > 0 else True,
            "fine_remarks": return_req.fine_remarks,
            "status": "returned"
        }}
    )
    
    await db.books.update_one({"_id": ObjectId(transaction["book_id"])}, {"$inc": {"available_copies": 1}})
    
    return {"message": "Book returned successfully", "fine_amount": fine_amount}

@api_router.get("/reports/issued-books")
async def report_issued_books(current_user: dict = Depends(get_current_user)):
    transactions = await db.transactions.find({"status": "issued"}, {"_id": 0}).to_list(1000)
    return {"total": len(transactions), "transactions": transactions}

@api_router.get("/reports/overdue-books")
async def report_overdue_books(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).isoformat()
    transactions = await db.transactions.find({"status": "issued"}, {"_id": 0}).to_list(1000)
    overdue = [t for t in transactions if t["expected_return_date"] < today]
    return {"total": len(overdue), "transactions": overdue}

@api_router.get("/reports/popular-books")
async def report_popular_books(current_user: dict = Depends(get_current_user)):
    pipeline = [
        {"$group": {"_id": "$book_name", "count": {"$sum": 1}, "author": {"$first": "$author"}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    popular = await db.transactions.aggregate(pipeline).to_list(10)
    return [{"book_name": p["_id"], "author": p["author"], "issue_count": p["count"]} for p in popular]

@api_router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 1, "email": 1, "name": 1, "role": 1, "created_at": 1}).to_list(1000)
    return [{
        "id": str(u["_id"]),
        "email": u["email"],
        "name": u["name"],
        "role": u["role"],
        "created_at": u["created_at"].isoformat() if isinstance(u["created_at"], datetime) else u["created_at"]
    } for u in users]

@api_router.post("/users")
async def create_user(user: RegisterRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    email_lower = user.email.lower()
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user.password)
    user_doc = {
        "email": email_lower,
        "password_hash": hashed,
        "name": user.name,
        "role": user.role,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    
    return {"id": str(result.inserted_id), "email": email_lower, "name": user.name, "role": user.role}

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, user: RegisterRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.users.find_one({"_id": ObjectId(user_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    email_lower = user.email.lower()
    email_conflict = await db.users.find_one({"email": email_lower, "_id": {"$ne": ObjectId(user_id)}})
    if email_conflict:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    update_doc = {"email": email_lower, "name": user.name, "role": user.role}
    if user.password:
        update_doc["password_hash"] = hash_password(user.password)
    
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_doc})
    return {"id": user_id, "email": email_lower, "name": user.name, "role": user.role}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.books.create_index("serial_number", unique=True)
    await db.memberships.create_index("membership_number", unique=True)
    
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@library.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({"email": admin_email, "password_hash": hashed, "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc)})
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")
    
    test_user_email = "user@library.com"
    test_user_password = "user123"
    test_user = await db.users.find_one({"email": test_user_email})
    if test_user is None:
        hashed = hash_password(test_user_password)
        await db.users.insert_one({"email": test_user_email, "password_hash": hashed, "name": "Test User", "role": "user", "created_at": datetime.now(timezone.utc)})
        logger.info(f"Test user created: {test_user_email}")
    
    Path("/app/memory").mkdir(exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write(f"- Role: admin\n\n")
        f.write("## Test User Account\n")
        f.write(f"- Email: {test_user_email}\n")
        f.write(f"- Password: {test_user_password}\n")
        f.write(f"- Role: user\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/register\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/logout\n")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
