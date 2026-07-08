from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from azure.cosmos import CosmosClient
import os
import uuid
from datetime import datetime

load_dotenv()

class CosmosService:
    def __init__(self):
        endpoint = os.getenv("COSMOS_ENDPOINT")
        credential = DefaultAzureCredential()
        self.client = CosmosClient(endpoint, credential=credential)
        self.database = self.client.get_database_client(os.getenv("COSMOS_DATABASE"))
        self.container = self.database.get_container_client(os.getenv("COSMOS_CONTAINER"))

    def create_incident(self, incident: dict) -> dict:
        incident["id"] = str(uuid.uuid4())
        incident["created_at"] = datetime.utcnow().isoformat()
        incident["status"] = "pending"
        self.container.create_item(body=incident)
        return incident

    def get_incidents(self, status: str = None) -> list:
        if status:
            query = f"SELECT * FROM c WHERE c.status = '{status}' ORDER BY c._ts DESC"
        else:
            query = "SELECT * FROM c ORDER BY c._ts DESC"
        items = list(self.container.query_items(query=query, enable_cross_partition_query=True))
        return items

    def update_incident_status(self, incident_id: str, status: str, severity: str) -> dict:
        item = self.container.read_item(item=incident_id, partition_key=severity)
        item["status"] = status
        item["updated_at"] = datetime.utcnow().isoformat()
        self.container.replace_item(item=incident_id, body=item)
        return item