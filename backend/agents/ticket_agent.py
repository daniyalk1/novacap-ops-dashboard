from dotenv import load_dotenv
from services.cosmos_service import CosmosService
import os
from datetime import datetime

load_dotenv()

class TicketAgent:
    def __init__(self):
        self.cosmos = CosmosService()

    def create_ticket(self, incident_report: dict, metrics: dict) -> dict:
        ticket = {
            "title": incident_report.get("title"),
            "severity": incident_report.get("severity"),
            "priority": incident_report.get("priority"),
            "summary": incident_report.get("summary"),
            "root_cause": incident_report.get("root_cause"),
            "impact": incident_report.get("impact"),
            "recommended_action": incident_report.get("recommended_action"),
            "affected_systems": incident_report.get("affected_systems", []),
            "metrics_snapshot": metrics,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }

        saved_ticket = self.cosmos.create_incident(ticket)
        print(f"Ticket created: {saved_ticket['id']} - {saved_ticket['title']}")
        return saved_ticket