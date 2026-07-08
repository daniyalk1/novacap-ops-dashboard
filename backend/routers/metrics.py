from fastapi import APIRouter
from services.metrics_simulator import MetricsSimulator
from agents.monitor_agent import MonitorAgent
from agents.incident_agent import IncidentAgent
from agents.ticket_agent import TicketAgent

router = APIRouter()
simulator = MetricsSimulator()
monitor_agent = MonitorAgent()
incident_agent = IncidentAgent()
ticket_agent = TicketAgent()

@router.get("/metrics/current")
def get_current_metrics():
    metrics = simulator.generate_metrics()
    anomaly_detected, anomaly_metric, anomaly_value = simulator.is_anomaly(metrics)
    
    return {
        "metrics": metrics,
        "anomaly_detected": anomaly_detected,
        "anomaly_metric": anomaly_metric,
        "anomaly_value": anomaly_value
    }

@router.post("/metrics/trigger-anomaly")
def trigger_anomaly(metric: str = None):
    simulator.trigger_anomaly(metric)
    return {"message": f"Anomaly triggered for metric: {simulator.anomaly_metric}"}

@router.post("/metrics/clear-anomaly")
def clear_anomaly():
    simulator.clear_anomaly()
    return {"message": "Anomaly cleared"}

@router.post("/metrics/analyze")
def analyze_metrics():
    metrics = simulator.generate_metrics()
    anomaly_detected, anomaly_metric, anomaly_value = simulator.is_anomaly(metrics)

    if not anomaly_detected:
        return {
            "metrics": metrics,
            "anomaly_detected": False,
            "message": "All systems normal"
        }

    analysis = monitor_agent.analyze(metrics, anomaly_metric, anomaly_value)
    incident_report = incident_agent.create_report(metrics, analysis)
    ticket = ticket_agent.create_ticket(incident_report, metrics)

    return {
        "metrics": metrics,
        "anomaly_detected": True,
        "anomaly_metric": anomaly_metric,
        "analysis": analysis,
        "incident_report": incident_report,
        "ticket": ticket
    }