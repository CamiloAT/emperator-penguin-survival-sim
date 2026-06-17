# Emperor Penguin Survival Sim

[![React](https://img.shields.io/badge/React-18.3.1-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-B73BFE?style=flat&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.184.0-000000?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![React Router](https://img.shields.io/badge/React_Router-7.16.0-CA4245?style=flat&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen?style=flat)]()

An **Agent-Based Modeling (ABM)** web application that simulates the winter huddle behavior of Emperor Penguin colonies (*Aptenodytes forsteri*) across the 92 days of the Antarctic winter. The model captures individual thermodynamics, the rotation dynamics of the huddle, and the stochastic risk of egg loss and freezing on exposed ice.

---

## Main Features

* **Agent-Based Simulation Engine:** Individual penguin agents with body temperature, fat reserves, energy, wind exposure, and life status tracking.
* **Dual View Modes:** Interactive 2D Canvas for clarity and a full 3D scene built with Three.js / React Three Fiber for immersion.
* **Real-Time Dashboard:** Live counters for alive penguins, eggs lost, average temperature, wind chill, and day-of-winter progress.
* **Advanced Statistics:** Historical charts (Recharts) for energy, temperature, and survival over time with end-of-run summaries.
* **Causal Flowchart & Event Log:** Visual representation of agent decision rules and chronological log of significant events.
* **Customization:** Adjustable color palette, climate parameters, and full physiology / thermodynamics / egg advanced settings.
* **Keyboard Shortcuts:** All major actions bound through TanStack Hotkeys with a discoverable in-app help modal.

---

## Pages & Views

| View | Description |
|------|-------------|
| **Landing Page** | Introduction, project context and call-to-action to start a simulation. |
| **Parameter Panel** | Pre-run configuration of the colony, climate, and advanced physiology settings. |
| **Simulation Shell** | Main dashboard with 2D/3D view, controls, live stats, and event log. |
| **Docs Page** | Detailed model documentation, equations, and PASSI methodology. |

---

## Execution and Development Guide

This project is a single-page frontend application (Vite + React). To run it locally you only need Node.js (>= 18).

### 1. Clone the repository

```bash
git clone https://github.com/CamiloAT/emperator-penguin-survival-sim.git
cd emperator-penguin-survival-sim
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to use the simulator.

### 4. Production build (optional)

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

> **Note:** The application is configured for one-click deployment to **Vercel** via the included `vercel.json`. To deploy your own fork, import the repository into Vercel and click **Deploy**. No environment variables are required.

---

## Project Structure

```text
emperator-penguin-survival-sim/
│
├── vercel.json                       ← Vercel deployment config
├── vite.config.js                    ← Vite bundler configuration
├── package.json                      ← Node.js dependencies and scripts
├── index.html                        ← Main HTML template
│
├── public/                           ← Static assets
│   ├── penguin.svg                   ← SVG logo
│   ├── Diagrama Causal.drawio.svg    ← Causal diagram
│   ├── Informe-Proyecto.pdf          ← Full project report
│   └── assets/models/               ← 3D penguin GLB models
│
└── src/                              ← React application
    ├── main.jsx                      ← React entry point
    ├── App.jsx                       ← Main shell and routing
    ├── components/                   ← UI components
    │   ├── LandingPage.jsx           ← Landing page
    │   ├── DocsPage.jsx              ← Model documentation
    │   ├── ControlPanel.jsx          ← Pre-run parameters
    │   ├── SimulationView.jsx        ← 2D/3D scene wrapper
    │   ├── Dashboard.jsx             ← Live stats cards
    │   ├── 3d/                       ← 3D scene components
    │   └── ...                       ← Modals and other components
    │
    ├── simulation/                   ← Core ABM engine
    │   ├── Engine.js                 ← Main tick loop
    │   ├── Penguin.js                ← Penguin agent logic
    │   ├── Environment.js            ← Wind and temperature
    │   ├── Grid.js                   ← Spatial grid
    │   ├── Egg.js                    ← Egg state tracking
    │   └── constants.js              ← Biological parameters
    │
    └── utils/                        ← Utility functions
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 + React Router v7 |
| Bundler | Vite 6 |
| 3D / Canvas | Three.js, React Three Fiber + Drei |
| Charts | Recharts |
| Flowcharts | React Flow |
| Icons | Lucide React |
| Hotkeys | TanStack React Hotkeys |
| Deployment | Vercel (static SPA) |

---

## Authors

| Name | GitHub |
|------|--------|
| **Camilo Andres Arias Tenjo** | [@CamiloAT](https://github.com/CamiloAT) |
| **Jose Luis Ortega Castillo** | [@JoseOrtegaUPTC](https://github.com/JoseOrtegaUPTC) |

*Computer Simulation*
