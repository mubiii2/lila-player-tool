# ARCHITECTURE.md

# Player Journey Visualization Tool – Architecture

## Overview

The Player Journey Visualization Tool is a web application designed to help Level Designers understand player behavior across different maps and matches. The system transforms raw gameplay telemetry stored in Parquet files into interactive visualizations including player journeys, gameplay events, timeline playback, and heatmaps.

The application follows a simple client-server architecture consisting of a React frontend and a FastAPI backend.

---

# Technology Stack

## Frontend

* React
* Vite
* JavaScript
* HTML5 Canvas
* CSS

### Why React?

React was chosen because it provides a component-based architecture that makes it easy to separate the UI into reusable elements such as filters, minimap rendering, timeline controls, and statistics panels. React's state management also allows efficient updates when users change filters or scrub through the timeline.

---

## Backend

* FastAPI
* Pandas
* PyArrow

### Why FastAPI?

FastAPI offers excellent performance while remaining lightweight and easy to build REST APIs with. It integrates naturally with Pandas, allowing efficient processing of Parquet telemetry before sending only the required information to the frontend.

---

# System Architecture

```text
Player Parquet Files
        │
        ▼
 FastAPI Backend
        │
        ├── Parse Parquet
        ├── Decode Event Types
        ├── Convert Coordinates
        ├── Aggregate Match Data
        └── REST API Endpoints
                │
                ▼
         React Frontend
                │
        ├── Match Filters
        ├── Timeline Playback
        ├── Journey Rendering
        ├── Event Rendering
        ├── Heatmaps
        └── Match Statistics
```

---

# Data Flow

1. The backend loads player telemetry stored in Parquet files using PyArrow.

2. Each Parquet file is converted into a Pandas DataFrame.

3. Byte-encoded event names are decoded into readable strings.

4. Match information is retrieved using the match lookup table.

5. Player positions are converted from world coordinates into minimap pixel coordinates.

6. FastAPI exposes endpoints for:

* Match list
* Player journeys
* Gameplay events
* Match statistics
* Heatmap data

7. The React frontend requests only the data required for the currently selected map or match.

8. The frontend renders the visualizations on top of the appropriate minimap image.

---

# Coordinate Mapping

The game stores player positions using world-space coordinates, while the minimap is represented as a static image.

Each supported map has its own configuration containing:

* World Origin X
* World Origin Z
* World Scale

These values are used to normalize world coordinates into the 0–1 range before converting them into pixel coordinates on an 800×800 minimap.

The conversion process is:

1. Translate world coordinates relative to the map origin.
2. Divide by the map scale.
3. Normalize into minimap space.
4. Convert normalized values into pixel coordinates.
5. Flip the Y-axis to match image coordinate space.

Each map uses different scale and origin values to ensure player movement aligns correctly with the minimap.

---

# Assumptions

Several assumptions were required during implementation:

* Player movement events are represented using `Position` and `BotPosition`.
* Heatmaps are generated using all valid events for the selected visualization.
* Minimap images accurately represent the playable area.
* Event timestamps are chronological and can be used directly for timeline playback.
* Missing or invalid records are ignored instead of interrupting visualization.

---

# Design Decisions & Trade-offs

| Decision                              | Reason                                               |
| ------------------------------------- | ---------------------------------------------------- |
| React instead of Streamlit            | Better UI flexibility and interactive experience     |
| FastAPI instead of Flask              | Higher performance and automatic API documentation   |
| REST API                              | Simpler separation between frontend and backend      |
| Pandas for processing                 | Efficient filtering and aggregation of telemetry     |
| Client-side rendering                 | Smooth interaction without repeated server rendering |
| Predefined coordinate mapping per map | Ensures accurate minimap alignment                   |

---

# Scalability Considerations

The application separates visualization from data processing, making it possible to replace local Parquet files with cloud storage or a database in the future without changing the frontend.

Additional event types, maps, and telemetry can be supported by extending the backend endpoints while keeping the frontend architecture unchanged.

---

# Future Improvements

* Spatial indexing for faster heatmap generation.
* Server-side caching for frequently accessed matches.
* Player comparison mode.
* Additional analytics dashboards.
* Real-time telemetry streaming.
* Advanced event filtering and clustering.

---

The resulting architecture provides a lightweight, modular, and maintainable solution that enables Level Designers to quickly explore player behavior while remaining scalable for larger datasets in the future.
