from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import metrics, incidents, actions

app = FastAPI(title="NovaCap AI Operations Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metrics.router, prefix="/api", tags=["Metrics"])
app.include_router(incidents.router, prefix="/api", tags=["Incidents"])
app.include_router(actions.router, prefix="/api", tags=["Actions"])

@app.get("/")
def root():
    return {"message": "NovaCap AI Operations Dashboard API is running", "version": "1.1.0"}