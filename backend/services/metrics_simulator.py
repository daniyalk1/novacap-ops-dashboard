import random
import time
from datetime import datetime

class MetricsSimulator:
    def __init__(self):
        self.base_metrics = {
            "cpu_usage": 45.0,
            "memory_usage": 60.0,
            "error_rate": 0.5,
            "response_time_ms": 120.0,
            "transaction_volume": 1000.0
        }
        self.anomaly_active = False
        self.anomaly_metric = None

    def generate_metrics(self) -> dict:
        metrics = {}
        for key, base in self.base_metrics.items():
            if self.anomaly_active and self.anomaly_metric == key:
                if key == "cpu_usage":
                    metrics[key] = round(random.uniform(85, 99), 2)
                elif key == "memory_usage":
                    metrics[key] = round(random.uniform(88, 98), 2)
                elif key == "error_rate":
                    metrics[key] = round(random.uniform(8, 15), 2)
                elif key == "response_time_ms":
                    metrics[key] = round(random.uniform(800, 2000), 2)
                elif key == "transaction_volume":
                    metrics[key] = round(random.uniform(50, 150), 2)
            else:
                noise = random.uniform(-5, 5)
                metrics[key] = round(max(0, base + noise), 2)

        metrics["timestamp"] = datetime.utcnow().isoformat()
        metrics["service"] = "NovaCap Banking Core"
        return metrics

    def trigger_anomaly(self, metric: str = None):
        self.anomaly_active = True
        self.anomaly_metric = metric or random.choice(list(self.base_metrics.keys()))

    def clear_anomaly(self):
        self.anomaly_active = False
        self.anomaly_metric = None

    def is_anomaly(self, metrics: dict) -> tuple[bool, str, str]:
        thresholds = {
            "cpu_usage": (80, "high"),
            "memory_usage": (85, "high"),
            "error_rate": (5, "high"),
            "response_time_ms": (500, "high"),
            "transaction_volume": (200, "low")
        }

        for metric, (threshold, direction) in thresholds.items():
            value = metrics.get(metric, 0)
            if direction == "high" and value > threshold:
                return True, metric, value
            if direction == "low" and value < threshold:
                return True, metric, value

        return False, None, None