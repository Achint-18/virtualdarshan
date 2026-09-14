from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from lib.db import ensure_indexes
from routers import seva,wishes
@asynccontextmanager
async def lifespan(app): await ensure_indexes();yield
app=FastAPI(title='Bappa Darshan API',lifespan=lifespan);app.add_middleware(CORSMiddleware,allow_origins=['*'],allow_credentials=True,allow_methods=['*'],allow_headers=['*']);app.include_router(wishes.router,prefix='/api');app.include_router(seva.router,prefix='/api')
@app.get('/api/health')
async def health(): return {'ok':True}
