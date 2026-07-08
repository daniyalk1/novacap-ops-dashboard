from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.cosmos_service import CosmosService
from datetime import datetime

router = APIRouter()
cosmos = CosmosService()

class ActionRequest(BaseModel):
    incident_id: str
    severity: str
    action: str  # "approve" or "reject"
    notes: str = ""

@router.post("/actions/respond")
def respond_to_incident(request: ActionRequest):
    try:
        if request.action not in ["approve", "reject"]:
            raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

        status = "approved" if request.action == "approve" else "rejected"
        updated = cosmos.update_incident_status(
            incident_id=request.incident_id,
            status=status,
            severity=request.severity
        )

        return {
            "message": f"Incident {status} successfully",
            "incident_id": request.incident_id,
            "status": status,
            "notes": request.notes,
            "responded_at": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))