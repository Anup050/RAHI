# Project Implementation & Technical Documentation: RAHI Healthcare Interface

**Date:** May 13, 2026  
**Project:** RAHI (Rural AI Healthcare Interface)  
**Authors:** Antigravity AI & RAHI Development Team  
**Subject:** Final Technical Report for Deployment & PPT Presentation  

---

## 1. Project Identity
**Project Name:** RAHI (Rural AI Healthcare Interface)  
**Primary Purpose:** RAHI is a comprehensive healthcare ecosystem designed to bridge the accessibility gap in rural India by providing AI-driven symptom triage, hyper-localized multilingual support, and seamless telemedicine connectivity.

---

## 2. The Tech Stack (The 'How')

### 2.1 Frontend: Next.js & React Native
*   **Web Dashboard:** Developed using **Next.js (v14+)** with the App Router. The interface utilizes a modular component structure built with **React** and styled via **Tailwind CSS** for a responsive, modern aesthetic.
*   **Mobile Application:** Built with **React Native** and **Expo**, utilizing **NativeWind** for consistent styling across platforms.
*   **State Management:** Implemented using **React Context API** for global states (Authentication, User Preferences) and **React Hooks** (useState, useEffect, useMemo) for localized component logic and data fetching.

### 2.2 Backend: FastAPI (Python)
*   **Core Logic:** The backend is powered by **FastAPI**, leveraging asynchronous execution for high performance.
*   **Routing:** Utilizes a versioned API structure (`api/v1/`) to ensure backward compatibility and modularity.
*   **Data Integrity:** Employs **Pydantic** for rigorous data validation and **SQLAlchemy** as an ORM for relational data management.
*   **Security:** Integrated **JWT (JSON Web Tokens)** for stateless authentication and **RBAC (Role-Based Access Control)** to distinguish between Patients, Doctors, and Administrators.

### 2.3 AI-Engine: Scikit-Learn Prediction Hub
*   **Model Architecture:** Utilizes a **Random Forest Classifier** trained on a curated dataset of medical symptoms and diseases.
*   **Logic:** The engine processes natural language inputs, extracts keywords using a synonym-mapping algorithm, and generates an 128-dimensional symptom vector.
*   **Serving:** The model is served as a microservice using **FastAPI**, communicating with the main backend via RESTful HTTP requests.

### 2.4 Database: Hybrid Storage Strategy
*   **Relational (SQL):** **Neon PostgreSQL** is used for persistent storage of structured data, including user profiles, appointment schedules, and medical records.
*   **Document (NoSQL):** **MongoDB** is utilized for high-throughput logging, real-time analytics, and caching of non-relational telemetry data.

---

## 3. System Connectivity: The 'Life of a Request'

1.  **User Action:** A patient enters symptoms in the mobile app (e.g., "I have a high fever and headache").
2.  **Frontend Dispatch:** The Expo app sends a POST request to the **Core API** (`/api/v1/ai/triage`).
3.  **Backend Mediation:** The FastAPI backend validates the user's session and forwards the text to the **AI-Engine**.
4.  **Intelligence Processing:** The AI-Engine normalizes the text, detects symptoms ("high_fever", "headache"), runs the Random Forest prediction, and returns the most likely condition with a confidence score.
5.  **Data Persistence:** The Backend logs the triage result in **MongoDB** and updates the patient's record in **PostgreSQL**.
6.  **Response Delivery:** The final assessment is returned to the Frontend, which renders a localized recommendation (e.g., in Marathi) and suggests a relevant specialist.

---

## 4. DFD Logic (Data Flow Diagram)

### 4.1 Level 0: Context Diagram
*   **External Entities:** Patient, Doctor, Admin.
*   **Process:** **RAHI Ecosystem (System 0.0)**.
*   **Data Flows:**
    *   *Patient* sends Symptoms/Auth Data; receives Triage Results/Consultation.
    *   *Doctor* sends Diagnosis/Availability; receives Patient Records/Alerts.
    *   *Admin* sends System Config; receives Analytics Reports.

### 4.2 Level 1: Functional Diagram
*   **Process 1.0 (Auth Service):** Validates credentials against **User Store (DB)**.
*   **Process 2.0 (AI Triage):** Interacts with **AI Engine** and **Symptom Vector Store**.
*   **Process 3.0 (Appointment Mgmt):** Synchronizes **Relational DB** schedules between Patients and Doctors.
*   **Process 4.0 (Emergency Alerts):** Triggers **Notification Engine** (Resend API) based on triage severity.
*   **Process 5.0 (Analytics):** Aggregates data from **SQL/NoSQL** stores for the Admin Dashboard.

---

## 5. Implementation Lifecycle

### 5.1 Deployment & Domain Routing
*   **Frontend Hosting:** The Next.js web application is deployed on **Vercel**, ensuring high availability and edge performance.
*   **Backend & AI Hosting:** Both the FastAPI core and the Scikit-Learn AI Engine are hosted on **Render**, utilizing managed web services and background workers.
*   **Domain Management:** Custom domain routing is implemented via **Vercel** on the **.tech** TLD (**rahihealth.tech**), providing a professional healthcare identity.
*   **CI/CD:** Automated workflows utilize **GitHub Actions** for cross-service testing and automatic deployment triggers to Vercel and Render upon codebase updates.

### 5.2 Testing & Quality Assurance
*   **Unit Testing:** Implemented using **Pytest** for backend logic and **Jest** for frontend components.
*   **Integration Testing:** End-to-end verification of the Frontend-Backend-AI link.
*   **Load Testing:** Conducted using **Locust** to simulate concurrent users and ensure the AI-Engine maintains sub-second response times under peak rural traffic.

---

## 6. Core Functionalities: Technical Breakdown

1.  **AI-Powered Triage:** Implemented using a keyword-extraction pipeline that converts unstructured Hindi/English text into structured feature sets for Random Forest inference.
2.  **In-App Video Consultations:** Integrated using **Jitsi Meet** across both Web and Mobile platforms. This provides a secure, scalable, and bandwidth-efficient telemedicine experience without requiring third-party app installations.
3.  **Emergency Alert System:** A priority-queue mechanism that monitors triage results; conditions flagged as "High Risk" trigger immediate email dispatches via the **Resend API** from the official **noreply@rahihealth.tech** address.
4.  **Hyper-Localized Localization:** Uses **i18next** with dynamic JSON translation files for 11 regional languages, ensuring the UI adapts to the user's cultural context automatically.
5.  **Smart Notifications:** A centralized event-bus architecture that routes system events (e.g., appointment updates) to the mobile push service and the web dashboard simultaneously.

---
*End of Documentation*
