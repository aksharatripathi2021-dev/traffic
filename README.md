# NIRNAY – Intelligent Traffic Risk & Police Deployment System

> **Nagpur City Intelligent Traffic Risk Prediction, Police Patrol Allocation, and Citizen Hazard Reporting Platform**

NIRNAY is a modern, frontend-first intelligent traffic risk management and tactical police deployment system designed for urban traffic management in Nagpur, Maharashtra. The system monitors traffic bottlenecks, calculates dynamic risk scores across key arterial junctions, provides AI-assisted deployment recommendations for police patrol units, and empowers citizens to report real-time road hazards with visual evidence.

---

## 1. Project Overview

Urban traffic management in growing cities like Nagpur faces critical challenges: congestion bottlenecks, unpredictable monsoon waterlogging, localized road accidents, and suboptimal deployment of traffic police personnel. 

**NIRNAY** (*Decision in Hindi/Marathi*) bridges the gap between active citizen reporting and tactical police operations. It provides a synchronized platform where:
- Citizens can monitor live traffic risk levels and report road hazards.
- Traffic Police Commanders can view real-time risk heat maps, inspect coverage gaps, receive AI-driven patrol deployment recommendations, and verify crowdsourced hazard reports.

---

## 2. Problem Statement

1. **Information Asymmetry**: Commuters lack real-time visibility into micro-level road hazards (waterlogged underpasses, signal failures, localized crashes).
2. **Reactive Police Allocation**: Traffic police dispatch is often reactive rather than predictive, leading to prolonged congestion and increased accident severity.
3. **Coverage Gaps**: Police officers are often unevenly distributed across junctions, leaving critical high-risk choke points under-staffed.
4. **Unstructured Hazard Intake**: Citizen emergency reporting often lacks precise geolocation telemetry and photo verification.

---

## 3. Proposed Solution

NIRNAY delivers a dual-portal command-and-citizen interface powered by a dynamic multi-factor risk index:
- **Geographic Risk Heat Map**: Continuous Gaussian heat layer highlighting risk density across major Nagpur junctions (Pardi, Sitabuldi, Sadar, Wardha Road, Hingna, Manish Nagar, Dharampeth).
- **Proactive AI Deployment Engine**: Multi-factor decision algorithm that weighs risk severity, trend direction, coverage gaps, officer distance, and ETA to recommend optimal patrol assignments.
- **Citizen Hazard Intake Module**: Geotagged incident reporting with image upload/preview, GPS geolocation, and status tracking.
- **Unified State Synchronization**: Shared `localStorage` and reactive state layer keeping citizen reports and police deployments in sync in real time.

---

## 4. Key Features

| Feature | Citizen Portal | Police Command Center |
| :--- | :---: | :---: |
| **Interactive Leaflet Map** | Yes (Nagpur risk visualization) | Yes (Tactical zoom & center) |
| **Traffic Risk Heat Map** | Yes (🟢 Low $\rightarrow$ 🔴 Critical) | Yes (🟢 Low $\rightarrow$ 🔴 Critical) |
| **Zone Telemetry Inspection** | Yes (Modal overview) | Yes (Deep-dive command panel) |
| **Incident Reporting & Photo Upload** | Yes (Drag-and-drop / File / Preset) | Queue verification & resolution |
| **Browser GPS & Demo Fallback** | Yes (Auto-detected / Manual pin) | GPS coordinate telemetry |
| **Dynamic Risk Score & Trend Chart** | View-only risk indicators | Interactive SVG time-series chart |
| **Coverage Gap Indicator** | Summary | Numerical gap & percent metrics |
| **Available Officers Table** | N/A | Proximity, ETA & duty status |
| **AI Deployment Recommendation** | N/A | Accept / Modify / Reject actions |
| **Emergency Helplines (112)** | Quick-dial buttons | Telemetry dispatching |

---

## 5. Citizen Workflow

1. **Authentication**: Enter Name and Email ID at `/citizen/login` (validated and saved in local state).
2. **Dashboard Exploration**:
   - Inspect the interactive Nagpur Leaflet Risk Heat Map.
   - Click any zone circle to view instant popup telemetry and click **"VIEW DETAILS"** for the complete breakdown.
   - Review live environmental conditions (congestion %, rainfall state, emergency dialer).
3. **Hazard Reporting** (`/citizen/report`):
   - Upload or drag-and-drop photo evidence (or choose sample demo photos).
   - Select from 4 incident categories: **Accident**, **Road Blocked**, **Water Logging**, or **Heavy Congestion**.
   - Acquire browser GPS coordinates or use the **"Use Demo GPS"** fallback.
   - Enter optional notes and click **"SUBMIT INCIDENT REPORT"**.
4. **Receipt & Confirmation**: Receive unique Report ID (`REP-XXXX`) with initial status `"Pending"` and verification `"Unverified"`.

---

## 6. Police Workflow

1. **Authentication**: Enter Officer Name and Police ID at `/police/login`.
2. **Single Integrated Command Dashboard** (`/police/dashboard`):
   - **Section 1 (Nagpur Map)**: Click any zone circle to automatically scroll and focus on its live telemetry.
   - **Section 2 (Selected Zone Info)**: View Junction name, ID, traffic level, and weather.
   - **Section 3 (Risk Score Gauge)**: Visual circular/progress gauge (0–100) classified as `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
   - **Section 4 (Risk Trend Chart)**: Dynamic SVG line chart tracking time-series trajectory with operational advice (*"Immediate deployment recommended"*).
   - **Section 5 (Police Coverage)**: Inspect Deployed vs Required units, coverage gap, and coverage %.
   - **Section 6 (Nearby Officers Table)**: Review active officers with rank, badge, distance, and estimated response ETA.
   - **Section 7 (NIRNAY AI Recommendation)**: Review AI-suggested personnel, response window, and reason breakdown.
   - **Section 8 (Actions)**:
     - **ACCEPT**: Automatically dispatches recommended officers and recalculates zone risk score & coverage gap.
     - **REJECT**: Marks recommendation as rejected.
     - **MODIFY**: Opens modal to select custom officers to dispatch.
   - **Citizen Reports Queue**: Verify, resolve, or reject citizen-submitted hazard reports in real-time.

---

## 7. AI Recommendation System

The AI Deployment Engine in `src/utils/aiRecommendation.ts` calculates optimal patrol allocations dynamically using multi-factor heuristics:

$$\text{Risk Index} = f(\text{Congestion Severity}, \text{Weather Severity}, \text{Historical Collisions}, \text{Coverage Gap})$$

### Decision Factors:
- **Risk Score & Trend**: High scores ($\ge 75$) or `Increasing` trends trigger priority dispatch.
- **Coverage Gap**: Calculated as $\max(0, \text{Required Personnel} - \text{Current Personnel})$.
- **Officer Proximity & Availability**: Ranks active officers based on shortest Euclidean distance and shortest ETA window.
- **Urgency Tag**: Displays `NECESSARY TO DEPLOY` when coverage deficit and risk score justify immediate intervention.

---

## 8. Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Mapping & GIS**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) + HTML5 Canvas Heatmap Layer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State & Persistence**: React Hooks + Browser `localStorage`

---

## 9. Project Structure

```text
NIRNAY/
├── public/                     # Static assets and icons
├── src/
│   ├── components/
│   │   ├── citizen/            # Incident reporting form, report cards
│   │   ├── common/             # Button, Card, Modal, Table, StatusBadge, Toast, RiskIndicator
│   │   ├── map/                # LeafletMap, TrafficHeatmapLayer, LocationPickerMap
│   │   └── police/             # Deployment modals, officer lists
│   ├── context/                # ToastContext & notification providers
│   ├── data/                   # Centralized seed mock datasets (mockZones, mockOfficers, mockReports)
│   │   ├── zones.ts            # Zone seed data export
│   │   ├── officers.ts         # Officer roster data export
│   │   └── reports.ts          # Citizen reports data export
│   ├── hooks/                  # useMockData, useToast custom hooks
│   ├── layouts/                # MainLayout, CitizenLayout, PoliceLayout
│   ├── pages/
│   │   ├── LandingPage.tsx     # Hero & dual role selection landing screen
│   │   ├── citizen/            # CitizenLoginPage, CitizenDashboard, CitizenReportPage
│   │   └── police/             # PoliceLoginPage, PoliceDashboard, PoliceZoneDetail
│   ├── services/               # storageService (localStorage synchronization)
│   ├── types/                  # traffic.ts (Domain models, types, interfaces)
│   ├── utils/                  # riskCalculator.ts, aiRecommendation.ts, formatters.ts
│   ├── App.tsx                 # Route declarations & navigation shell
│   ├── main.tsx                # React DOM root entrypoint
│   └── index.css               # Global Tailwind CSS and Leaflet styles
├── index.html                  # HTML5 shell & Leaflet CSS CDN link
├── package.json                # Project scripts & dependencies
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite build configuration
```

---

## 10. Installation

Ensure you have [Node.js](https://nodejs.org/) (version 20.18+ or 22+) installed on your machine.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aksharatripathi2021-dev/traffic.git
   cd traffic
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## 11. Running Locally

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the application**:
   Open your browser and navigate to `http://localhost:5173/`.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## 12. Mock Data

The application includes realistic baseline datasets for Nagpur City:
- **7 Major Zones**: Pardi Junction, Sitabuldi, Sadar, Wardha Road, Hingna, Manish Nagar, Dharampeth.
- **Police Officers Roster**: 6 active officers with rank, badge numbers, proximity distances, and status.
- **Citizen Incident Reports**: Pre-seeded crowdsourced hazards with coordinates, timestamps, and images.

To reset the mock state back to the original demo baseline at any time, click the **"Reset Seed"** button in the top navigation bar or police dashboard.

---

## 13. Current Frontend Limitations

> [!NOTE]
> This application is currently a **frontend-first prototype**.
> - **Data Storage**: Uses browser `localStorage` and client-side state. Changes persist in your browser session but are not yet synchronized across multiple independent client devices over a remote network.
> - **AI Engine**: The multi-factor heuristic algorithms run client-side in TypeScript rather than on a remote machine learning backend server.
> - **External APIs**: Uses OpenStreetMap public tile layers and simulated browser geolocation fallbacks.

---

## 14. Future Backend/API Integration

The system architecture is structured with clean service layers (`storageService.ts`, `useMockData.ts`, `traffic.ts`) for straightforward future backend integration:

```text
Frontend (React + Leaflet)
       │
       ▼ (REST / WebSocket API)
Backend (FastAPI / Node.js / Express)
       │
       ├── PostgreSQL / PostGIS (Geospatial storage for zones & hazards)
       ├── Redis (Real-time police GPS telemetry & pub/sub events)
       └── ML Risk Engine (Predictive congestion & collision risk modeling)
```

---

## License

This project was developed for the **NIRNAY Traffic Risk & Police Deployment** platform. All rights reserved.
