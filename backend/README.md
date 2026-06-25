# LILA Player Behavior Visualization Tool

A web-based visualization tool developed to help Level Designers analyze player behavior across different maps and matches. The application parses player telemetry stored in Parquet files and visualizes player movement, gameplay events, and heatmaps on their respective minimaps.

---

# Live Demo

**Frontend (Vercel)**

> https://lila-player-tool-murex.vercel.app/

**Backend API (Railway)**

> https://lila-player-tool-production.up.railway.app/

---

## GitHub Repository

>https://github.com/mubiii2/lila-player-tool

# Features

## Core Features

* Load and parse player telemetry from Parquet files.
* Visualize player journeys on the correct minimap.
* Accurate world-coordinate to minimap-coordinate mapping.
* Differentiate Human Players and Bots using distinct colors.
* Display gameplay events:

  * Kills
  * Deaths
  * Loot
  * Storm Deaths
* Interactive timeline playback to replay match progression.
* Heatmap overlays for:

  * Player traffic
  * Kill density
  * Death density
* Match statistics panel.
* Filters for:

  * Map
  * Date
  * Match
* Responsive and interactive UI for fast exploration.

---

# Tech Stack

## Frontend

* React
* Vite
* JavaScript
* HTML5 Canvas
* CSS

## Backend

* FastAPI
* Pandas
* PyArrow

## Deployment

* Frontend: Vercel
* Backend: Railway

---

# Project Structure

```text
LILA-Player-Tool/

├── backend/
│   ├── main.py
│   ├── data_loader.py
│   ├── requirements.txt
│   ├── match_lookup.csv
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── player_data/
│
├── ARCHITECTURE.md
├── INSIGHTS.md
├── README.md
├── match_catalog.csv
└── ...
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/mubiii2/lila-player-tool.git
cd lila-player-tool
```

---

## Backend Setup

Navigate to the backend folder.

```bash
cd backend
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the FastAPI server.

```bash
uvicorn main:app --reload
```

The backend will start at:

```
http://localhost:8000
```

---

## Frontend Setup

Navigate to the frontend folder.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

The frontend will start at:

```
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file inside the frontend folder.

For local development:

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://lila-player-tool-production.up.railway.app
```

---

# How It Works

1. The backend reads player telemetry from Parquet files.
2. Match metadata is loaded using the match catalog and lookup tables.
3. Player positions are converted from world coordinates into minimap coordinates.
4. FastAPI exposes REST endpoints for:

   * Matches
   * Player journeys
   * Events
   * Match information
   * Heatmap data
5. The React frontend requests the required data through the API.
6. The UI renders:

   * Minimap
   * Player paths
   * Event markers
   * Timeline playback
   * Heatmaps
   * Match statistics

---

# API Endpoints

Main endpoints used by the frontend include:

* `/matches`
* `/journey/{match_id}`
* `/events/{match_id}`
* `/match-info/{match_id}`
* `/map-events/{map_name}`

---

# Assignment Requirements Covered

| Requirement                  | Status |
| ---------------------------- | ------ |
| Load Parquet Data            | ✅      |
| Minimap Visualization        | ✅      |
| Human vs Bot Differentiation | ✅      |
| Kill Markers                 | ✅      |
| Death Markers                | ✅      |
| Loot Markers                 | ✅      |
| Storm Death Markers          | ✅      |
| Match Filtering              | ✅      |
| Date Filtering               | ✅      |
| Map Filtering                | ✅      |
| Timeline Playback            | ✅      |
| Heatmaps                     | ✅      |
| Hosted Deployment            | ✅      |

---

# Documentation

Additional documentation is available in:

* **ARCHITECTURE.md** – System design and implementation details.
* **INSIGHTS.md** – Gameplay observations and level design insights derived from the visualization tool.

---

# Future Improvements

* Live telemetry streaming support.
* Player comparison mode.
* Advanced analytics dashboard.
* Export heatmaps as images.
* Session bookmarking.
* Custom event filtering.

---

# Author

Developed as part of the **LILA Games Player Behavior Visualization Tool Assignment**.
