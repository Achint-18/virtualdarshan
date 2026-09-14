import uuid
from datetime import datetime,timezone
from pydantic import BaseModel,Field
def now(): return datetime.now(timezone.utc)
def aware(dt): return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
class WishCreate(BaseModel): message:str=Field(min_length=2,max_length=500);name:str|None=Field(default=None,max_length=60)
class Wish(BaseModel): id:str=Field(default_factory=lambda:str(uuid.uuid4()));message:str;name:str|None=None;is_demo:bool=False;created_at:datetime=Field(default_factory=now)
class SevaCreate(BaseModel): amount:float=Field(ge=5,le=1000000);name:str|None=Field(default=None,max_length=60)
class SevaIntent(BaseModel): id:str=Field(default_factory=lambda:str(uuid.uuid4()));amount:float;name:str|None=None;date:str;status:str='initiated';created_at:datetime=Field(default_factory=now)
class Counters(BaseModel): darshan_count:int=0;seva_today_total:float=0;seva_today_count:int=0;demo:bool=True
