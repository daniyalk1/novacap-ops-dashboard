from fastapi import APIRouter, HTTPException
from services.cosmos_service import CosmosService

router = APIRouter()
cosmos = CosmosService()

@router.get("/incidents")
def get_incidents(status: str = None):
    try:
        incidents = cosmos.get_incidents(status)
        return {"incidents": incidents, "count": len(incidents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str, severity: str = "high"):
    try:
        incidents = cosmos.get_incidents()
        incident = next((i for i in incidents if i["id"] == incident_id), None)
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        return incident
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))