# NovaCap AI Operations Dashboard

An AI-powered IT operations dashboard for NovaCap Bank. AI agents monitor banking system metrics, detect anomalies, generate incident reports, and create tickets — ops team approves or rejects recommended actions through a real-time dashboard.

> Built as part of an AI Engineer upskilling roadmap targeting senior AI Engineer and AI Solution Architect roles.

## How It Works

1. Metrics simulator generates real-time banking system metrics (CPU, memory, error rate, response time, transaction volume)
2. **Monitor Agent** watches metrics and detects anomalies using threshold analysis
3. When anomaly detected, **Incident Agent** generates a formal incident report with root cause and impact analysis
4. **Ticket Agent** saves the incident to **Azure CosmosDB** with status "pending"
5. Ops team reviews the incident on the dashboard and approves or rejects the recommended action
6. Decision is recorded back to CosmosDB with timestamp and notes

## Architecture

```
Metrics Simulator → Anomaly Detection → Monitor Agent (OpenAI)
                                              ↓
                                       Incident Agent (OpenAI)
                                              ↓
                                       Ticket Agent → Azure CosmosDB
                                              ↓
                                React Dashboard (human-in-the-loop)
                                              ↓
                                  Approve/Reject → CosmosDB updated
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| AI Agents | OpenAI GPT-4o-mini |
| Database | Azure CosmosDB (free tier) |
| Authentication | Azure DefaultAzureCredential + Service Principal |
| Hosting | Azure Container Apps |
| CI/CD | GitHub Actions |

## Project Structure

```
novacap-ops-dashboard/
├── backend/
│   ├── main.py                      # FastAPI entry point
│   ├── agents/
│   │   ├── monitor_agent.py         # Anomaly analysis agent
│   │   ├── incident_agent.py        # Incident report generation agent
│   │   └── ticket_agent.py          # CosmosDB ticket creation agent
│   ├── services/
│   │   ├── cosmos_service.py        # Azure CosmosDB operations
│   │   └── metrics_simulator.py     # Banking metrics simulation
│   ├── routers/
│   │   ├── metrics.py               # Metrics and anomaly endpoints
│   │   ├── incidents.py             # Incident retrieval endpoints
│   │   └── actions.py               # Approve/reject action endpoints
│   └── requirements.txt
├── frontend/                        # React dashboard (coming soon)
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/metrics/current` | Get current simulated metrics |
| POST | `/api/metrics/trigger-anomaly` | Trigger a metric anomaly |
| POST | `/api/metrics/clear-anomaly` | Clear active anomaly |
| POST | `/api/metrics/analyze` | Run agents and create incident ticket |
| GET | `/api/incidents` | List all incidents from CosmosDB |
| GET | `/api/incidents/{id}` | Get specific incident |
| POST | `/api/actions/respond` | Approve or reject an incident |

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Azure account with CosmosDB resource
- OpenAI API key
- Azure CLI installed and logged in (`az login`)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` from `.env.example`:

```
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
COSMOS_DATABASE=novacap-ops
COSMOS_CONTAINER=incidents
OPENAI_API_KEY=your-openai-key
```

Run:
```bash
uvicorn main:app --reload
```

API at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

## Azure Resources

- **Azure CosmosDB** — free tier (1,000 RU/s + 25 GB forever)
- **Azure Container Apps** — serverless hosting (coming soon)
- **RBAC Role:** `Cosmos DB Built-in Data Contributor` on CosmosDB account

## Key Technical Decisions

- **Three-agent pipeline** — separates concerns: monitoring, incident management, and ticketing are independent agents that can be scaled or replaced individually
- **Human-in-the-loop** — agents never take autonomous action on production systems, they only recommend. Humans approve or reject
- **CosmosDB free tier** — NoSQL document store, partition key by severity for efficient querying, globally distributed, no expiry on free tier
- **Simulated metrics** — realistic banking metrics with configurable anomaly injection for demo purposes

## Roadmap

- [ ] React dashboard with live metrics charts
- [ ] Deploy to Azure Container Apps
- [ ] GitHub Actions CI/CD pipeline
- [ ] Azure Monitor integration for real observability
- [ ] WebSocket for real-time metric updates