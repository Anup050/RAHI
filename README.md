# RAHI: Rural AI Healthcare Interface 🏥

**RAHI** is a comprehensive, production-ready healthcare ecosystem designed specifically for rural and underserved regions in India. It bridges the gap between urban medical expertise and rural accessibility through AI-driven triage, multilingual interfaces, and low-bandwidth telemedicine.

---

## ✨ Key Features

- 🤖 **AI-Powered Triage**: Real-time symptom assessment using an integrated Scikit-Learn prediction engine.
- 📹 **In-App Video Consultations**: Seamless, integrated telemedicine sessions without external app redirects.
- 🚨 **Emergency Alert System**: Priority patient-to-doctor alerting with real-time system and email notifications.
- 🌐 **Hyper-Localized (11 Languages)**: Full i18n support for 11 Indian regional languages (Hindi, Marathi, Bengali, Tamil, etc.).
- 🔔 **Smart Notifications**: Cross-platform notification delivery for appointments, emergencies, and system updates.
- 📧 **Automated Communications**: Professional email delivery for authentication and booking confirmations via Resend API.
- 📉 **Analytics Dashboard**: Real-time health metrics and appointment tracking for doctors and administrators.

---

## 🏗 System Architecture

The RAHI ecosystem is built as a highly decoupled monorepo for scalability and ease of deployment.

| Layer | Service | Tech Stack | Directory |
| :--- | :--- | :--- | :--- |
| **Web** | Doctor Dashboard | Next.js, Tailwind CSS | `apps/web` |
| **Mobile** | Patient App | React Native, Expo, NativeWind | `apps/mobile` |
| **Core API** | Backend Service | FastAPI, SQLAlchemy, Pydantic | `backend/` |
| **AI Hub** | Intelligence Engine | Scikit-Learn, Random Forest | `ai-engine/` |
| **Database** | Persistent Storage | Neon PostgreSQL & MongoDB | Cloud/Managed |
| **Infra** | Orchestration | Docker & Nginx | `infrastructure/` |

---

## 🛠 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (Web), [Expo](https://expo.dev/) (Mobile)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [Neon Postgres](https://neon.tech/) (SQL), [MongoDB](https://www.mongodb.com/) (NoSQL)
- **AI/ML**: [Scikit-Learn](https://scikit-learn.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) / [NativeWind](https://www.nativewind.dev/)
- **Communications**: [Resend](https://resend.com/) (Email), [Lucide](https://lucide.dev/) (Icons)

---

## 🚀 Quick Start

### 1. Prerequisites
- **Docker Desktop**
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Orchestrated Launch (Docker)
The easiest way to start the entire ecosystem is via the provided Makefile:

```bash
# Spin up all services (Web, Mobile Web, Backend, AI Engine, DB)
make up

# View real-time logs
make logs

# Shut down the ecosystem
make down
```

### 3. Manual Development Setup

If you wish to run services independently for development:

**Backend API:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

**Web Dashboard:**
```bash
cd apps/web
npm install
npm run dev
```

**Mobile Application:**
```bash
cd apps/mobile
npm install
npx expo start
```

---

## 📜 Project Execution & Status
For a detailed breakdown of the development phases and security hardening steps, refer to:
- [RAHI Project Execution Log](RAHI_PROJECT_EXECUTION.md)
- [Manual Setup Guide](manual_setup.md)

---
*RAHI - Healing Rural India with Intelligence and Inclusion.*
