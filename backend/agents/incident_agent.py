from dotenv import load_dotenv
from openai import OpenAI
import os
import json

load_dotenv()

class IncidentAgent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def create_report(self, metrics: dict, analysis: dict) -> dict:
        prompt = f"""You are an incident management agent for NovaCap Bank.

Based on the following anomaly analysis, create a formal incident report.

Metrics at time of incident:
{json.dumps(metrics, indent=2)}

Analysis:
- Severity: {analysis.get('severity')}
- Root Cause: {analysis.get('root_cause')}
- Impact: {analysis.get('impact')}
- Recommended Action: {analysis.get('recommended_action')}

Create a formal incident report as a JSON object containing:
- title: short descriptive title of the incident
- severity: copy from analysis (low/medium/high)
- summary: 2-3 sentence executive summary
- root_cause: detailed root cause analysis
- impact: detailed impact assessment on banking operations
- recommended_action: step by step remediation plan
- affected_systems: list of potentially affected systems
- priority: P1/P2/P3 based on severity

Respond ONLY with valid JSON, no markdown, no explanation."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert incident manager for a bank. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)