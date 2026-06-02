# Emperor Penguin Survival Sim

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![TanStack](https://img.shields.io/badge/TanStack_Hotkeys-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

An **Agent-Based Modeling (ABM)** web application that simulates the winter huddle behavior of Emperor Penguin colonies (*Aptenodytes forsteri*) across the 92 days of the Antarctic winter. The model captures individual thermodynamics, the rotation dynamics of the huddle, and the stochastic risk of egg loss and freezing on exposed ice.

**Live demo:** [https://emperator-penguin-survival-sim.vercel.app/](https://emperator-penguin-survival-sim.vercel.app/)

---

## Main Features

### Agent-Based Simulation Engine
* **Penguin agents (`simulation/Penguin.js`):** Individual state including body temperature, fat reserves, energy, wind exposure, and life status (alive / hypothermic / dead).
* **Environment (`simulation/Environment.js`):** Wind speed, ambient temperature, and the three climate phases of the Antarctic winter (June, July, August).
* **Egg system (`simulation/Egg.js`):** Incubation temperature tracking, drop detection and a 1–3 minute survival window on exposed ice.
* **Grid + Engine (`simulation/Grid.js`, `simulation/Engine.js`):** Spatial discretisation, neighbour queries, and the discrete-event loop that drives each tick.
* **Constants (`simulation/constants.js`):** Centralised thermodynamic and biological parameters, easily tweakable for sensitivity analysis.

### Modern Visualization (Frontend - React + Vite)
* **Dual view modes:** Interactive 2D Canvas for clarity and a full 3D scene built with **Three.js / React Three Fiber** for immersion.
* **Real-time dashboard:** Live counters for alive penguins, eggs lost, average temperature, wind chill, and day-of-winter progress.
* **Advanced stats modal:** Historical charts (Recharts) for energy, temperature and survival over time.
* **Causal flowchart & event log:** Visualisation of the agent decision rules and a chronological log of significant events.
* **3D penguin models:** Switchable characters, including an animated GLB premium penguin.
* **Customisation:** Adjustable colour palette, climate parameters, and full physiology / thermodynamics / egg advanced settings.
* **Keyboard shortcuts:** All major actions (pause, speed, view toggle, settings, modals) are bound through **TanStack Hotkeys**, with a discoverable in-app help modal.

### Pages & Routing
* **Landing page:** Introduction, project context and CTAs.
* **Parameter panel:** Pre-run configuration of the colony, climate and advanced physiology.
* **Simulation shell:** The main dashboard with view, controls and stats.
* **Docs page:** Detailed model documentation, equations and PASSI methodology.

---

## Execution and Development Guide

This project is a single-page frontend application (Vite + React). To run it locally you only need Node.js (>= 18).

### 1. Clone the repository

```bash
git clone https://github.com/CamiloAT/emperator-penguin-survival-sim.git
cd emperator-penguin-survival-sim
```

### 2. Install dependencies

*(Requires Node.js to be installed on your computer)*

```bash
npm install
```

### 3. Start the Vite development server

```bash
npm run dev
```

*This will start the web application, commonly at `http://localhost:5173`. Open this link directly in your web browser to use the simulator.*

### 4. Production build (optional)

To build an optimised static bundle in the `dist/` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Deployment

The application is configured for one-click deployment to **Vercel** via the included `vercel.json` (Vite framework preset + SPA rewrites for React Router).

* **Live URL:** [https://emperator-penguin-survival-sim.vercel.app/](https://emperator-penguin-survival-sim.vercel.app/)
* **Repository:** [https://github.com/CamiloAT/emperator-penguin-survival-sim](https://github.com/CamiloAT/emperator-penguin-survival-sim)

To deploy your own fork:

1. Import the repository into Vercel (New Project → Import Git Repository).
2. Vercel will auto-detect Vite and use the existing `vercel.json`.
3. Click **Deploy**. No environment variables are required.

---

## Project Structure

```text
emperator-penguin-survival-sim/
│
├── vercel.json                       ← Vercel deployment config (Vite + SPA rewrites)
├── vite.config.js                    ← Vite bundler configuration
├── package.json                      ← Node.js dependencies and npm scripts
├── index.html                        ← Main HTML template
│
├── public/                           ← Static assets served as-is
│   ├── penguin.svg                   ← SVG logo
│   ├── Diagrama Causal.drawio.svg    ← Causal diagram of the model
│   ├── Informe-Proyecto.pdf          ← Full project report
│   └── assets/
│       └── models/                   ← 3D penguin GLB models
│
└── src/                              ← Web UI Application (React + Vite)
    ├── main.jsx                      ← React entry, wraps app in <HotkeysProvider>
    ├── App.jsx                       ← Main shell, routing, global hotkeys
    ├── index.css                     ← Global styles
    │
    ├── components/                   ← Visual components organised by context
    │   ├── LandingPage.jsx           ← Landing page
    │   ├── DocsPage.jsx              ← Model documentation page
    │   ├── ControlPanel.jsx          ← Pre-run parameter form
    │   ├── ActivePanel.jsx           ← Live run panel
    │   ├── SimulationView.jsx        ← 2D / 3D scene wrapper
    │   ├── Dashboard.jsx             ← Live stats cards
    │   ├── EventLog.jsx              ← Chronological events log
    │   ├── FlowchartView.jsx         ← Causal flowchart (React Flow)
    │   ├── ResultsModal.jsx          ← End-of-run summary
    │   ├── AdvancedStatsModal.jsx    ← Historical charts (Recharts)
    │   ├── SettingsModal.jsx         ← Advanced physiology / climate
    │   ├── ColorSettingsModal.jsx    ← Colour palette customisation
    │   ├── CharacterSelectModal.jsx  ← Penguin model switcher
    │   ├── ConfirmModal.jsx          ← Generic confirm dialog
    │   ├── InfoModal.jsx             ← In-context info popups
    │   ├── ShortcutsHelpModal.jsx    ← Keyboard shortcuts help
    │   ├── HUD.jsx                   ← Day / step counter and overlay
    │   └── 3d/                       ← 3D-specific scene components
    │       ├── Scene3D.jsx
    │       ├── PenguinModel.jsx
    │       ├── EggModel.jsx
    │       ├── Snow.jsx
    │       └── Lighting.jsx
    │
    ├── simulation/                   ← Core ABM engine
    │   ├── Engine.js                 ← Main tick loop and event dispatcher
    │   ├── Penguin.js                ← Penguin agent logic
    │   ├── Environment.js            ← Wind, temperature, climate phases
    │   ├── Grid.js                   ← Spatial grid and neighbour queries
    │   ├── Egg.js                    ← Egg state, drop and freezing timer
    │   └── constants.js              ← Centralised biological parameters
    │
    └── utils/                        ← Isolated utilities
        └── gltfAvailability.js       ← Detects which GLB models are present
```

---

## Tech Stack

| Layer        | Technology                                       |
|--------------|--------------------------------------------------|
| UI Framework | React 18 + React Router v7                       |
| Bundler      | Vite 6                                           |
| 3D / Canvas  | Three.js, React Three Fiber + Drei               |
| Charts       | Recharts                                         |
| Flowcharts   | React Flow                                       |
| Icons        | Lucide React                                     |
| Hotkeys      | TanStack React Hotkeys                           |
| Deployment   | Vercel (static SPA, auto-detected from Vite)     |

---

## Authors

* **Arias Tenjo Camilo Andrés**
* **Ortega Castillo José Luis**

*Computer Simulation — Systems and Computing Engineering*
*Universidad Pedagógica y Tecnológica de Colombia (UPTC)*
