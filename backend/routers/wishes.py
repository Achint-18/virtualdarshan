from fastapi import APIRouter
from pymongo import DESCENDING
from lib.db import db
from models.temple import Wish,WishCreate,aware
router=APIRouter()
def _from(d): return Wish(**{**d,'created_at':aware(d['created_at'])})
@router.post('/wishes',response_model=Wish,status_code=201)
async def create_wish(input:WishCreate):
 w=Wish(message=input.message.strip(),name=(input.name or '').strip() or None);await db.wishes.insert_one(w.model_dump());return w
@router.get('/wishes',response_model=list[Wish])
async def list_wishes(limit:int=30):
 limit=max(1,min(limit,100));docs=await db.wishes.find().sort('created_at',DESCENDING).to_list(limit);return [_from(d) for d in docs]
