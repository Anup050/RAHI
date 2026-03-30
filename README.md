# RAHI (Rural AI Healthcare Interface)

**RAHI** is a full-stack hybrid healthcare system designed for rural India, focusing on low-connectivity utility, AI triage, and multilingual support.

## 🏗 System Architecture (Monorepo)

| Scope | Service | Tech Stack | Location |
| :--- | :--- | :--- | :--- |
| **Frontend** | Doctor Dashboard | Next.js (Web) | `apps/web` |
| **Frontend** | Patient App | React Native (Expo) | `apps/mobile` |
| **Services** | Core API | FastAPI | `services/api` |
| **Services** | AI Engine | Scikit-Learn | `services/ai-engine` |
| **Infra** | Orchestration | Docker & Nginx | `infrastructure/` |

## 🚀 Quick Start

### 1. Prerequisites
- Docker Desktop
- Node.js (v18+) & Python (v3.10+)

### 2. Start the Ecosystem (Docker)
We use a centralized makefile for orchestration (Windows users can inspect `Makefile` commands or run directly).

```bash
# Start all services (Backend, AI, Web, Database)
make up

# View logs
make logs

# Stop services
make down
```

### 3. Manual Development
If you prefer running services locally without Docker:

**Backend:**
```bash
cd services/api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Web Dashboard:**
```bash
cd apps/web
npm install
npm run dev
```

**Mobile App:**
```bash
cd apps/mobile
npm install
npx expo start
```
