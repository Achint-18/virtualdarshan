import asyncio
from lib.db import db,ensure_indexes
from models.temple import Wish
async def main():
 await ensure_indexes();await db.counters.update_one({'key':'darshan'},{'$setOnInsert':{'count':12483}},upsert=True)
 if await db.wishes.count_documents({})==0:
  await db.wishes.insert_many([Wish(message=m,name=n,is_demo=True).model_dump() for m,n in [('बप्पा मेरे परिवार को सुख-शांति दें।','एक भक्त'),('हर बाधा दूर हो और नई शुरुआत शुभ हो।','राहुल'),('सबके घर में खुशियाँ बनी रहें।','एक भक्त'),('मेरी पढ़ाई और मेहनत सफल हो।','अमन'),('बप्पा सबकी मनोकामना पूरी करें।','एक भक्त')]])
asyncio.run(main())
