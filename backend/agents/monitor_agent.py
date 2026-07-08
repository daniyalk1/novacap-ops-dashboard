from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

class MonitorAgent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def analyze(self, metrics: dict, anomaly_metric: str, anomaly_value: float) -> dict:
        prompt = f"""You are an AI monitoring agent for NovaCap Bank's IT operations team.

You have detected an anomaly in the banking system metrics.

Current Metrics:
- CPU Usage: {metrics['cpu_usage']}%
- Memory Usage: {metrics['memory_usage']}%
- Error Rate: {metrics['error_rate']}%
- Response Time: {metrics['response_time_ms']}ms
- Transaction Volume: {metrics['transaction_volume']} tx/min

Anomaly Detected:
- Metric: {anomaly_metric}
- Value: {anomaly_value}

Analyze this anomaly and respond with a JSON object containing:
- severity: "low", "medium", or "high"
- root_cause: your best assessment of what is causing this
- impact: what banking operations could be affected
- recommended_action: specific steps the ops team should take

Respond ONLY with valid JSON, no markdown, no explanation."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert IT operations analyst for a bank. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        import json
        return json.loads(response.choices[0].message.content)