from fastapi import APIRouter
from lib.dates import today_iso
from lib.db import db
from models.temple import Counters,SevaCreate,SevaIntent,aware
router=APIRouter();IST='Asia/Kolkata'
@router.post('/seva',response_model=SevaIntent,status_code=201)
async def create_seva(input:SevaCreate):
 i=SevaIntent(amount=input.amount,name=(input.name or '').strip() or None,date=today_iso(IST));await db.seva_intents.insert_one(i.model_dump());return i
async def build():
 d=await db.counters.find_one({'key':'darshan'});today=today_iso(IST);res=await db.seva_intents.aggregate([{'$match':{'date':today}},{'$group':{'_id':None,'total':{'$sum':'$amount'},'count':{'$sum':1}}}]).to_list(1);total=float(res[0]['total']) if res else 0;count=int(res[0]['count']) if res else 0;return Counters(darshan_count=int(d['count']) if d else 0,seva_today_total=round(total,2),seva_today_count=count)
@router.get('/counters',response_model=Counters)
async def counters(): return await build()
@router.post('/counters/darshan',response_model=Counters,status_code=201)
async def darshan(): await db.counters.update_one({'key':'darshan'},{'$inc':{'count':1}},upsert=True);return await build()
