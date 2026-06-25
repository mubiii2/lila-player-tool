# INSIGHTS.md

# Gameplay Insights

The visualization tool was used to explore player journeys, gameplay events, and heatmaps across multiple matches. The following observations demonstrate how the tool can help Level Designers identify player behavior patterns and make informed level design decisions.

---

# Insight 1 – Combat Is Concentrated Around Specific Hotspots

## Observation

The kill and death heatmaps consistently showed clusters of combat occurring around a limited number of locations instead of being evenly distributed across the map.

## Evidence

* Kill markers repeatedly appeared in the same regions across different matches.
* Death markers overlapped heavily with kill hotspots, indicating prolonged engagements in those areas.
* Other sections of the map remained comparatively inactive.

## Actionable Recommendation

Introduce additional incentives in underutilized areas, such as higher-value loot, dynamic objectives, or extraction opportunities, to encourage players to spread across the map.

### Metrics Affected

* Map utilization
* Player distribution
* Encounter diversity
* Match pacing

## Why a Level Designer Should Care

If most combat happens in only a few locations, large portions of the map become underused. Improving player distribution increases strategic variety and makes the environment feel more meaningful.

---

# Insight 2 – Player Traffic Follows Predictable Routes

## Observation

Journey visualization revealed that players frequently travel along similar paths between spawn locations, loot areas, and extraction points.

## Evidence

* High-traffic heatmaps consistently highlighted the same movement corridors.
* Multiple player journeys overlapped in these regions.
* Some alternative paths received very little player traffic.

## Actionable Recommendation

Create meaningful alternatives by adding secondary routes, environmental cover, shortcuts, or additional loot locations to reduce congestion and encourage route diversity.

### Metrics Affected

* Route diversity
* Exploration rate
* Player decision-making
* Travel efficiency

## Why a Level Designer Should Care

Predictable movement patterns reduce replayability and allow experienced players to anticipate enemy movement. Encouraging multiple viable routes increases tactical depth.

---

# Insight 3 – Human and Bot Behaviors Are Visually Distinguishable

## Observation

Separating human players and bots revealed noticeable differences in movement behavior and map coverage.

## Evidence

* Human players generally followed objective-driven routes and reacted to combat hotspots.
* Bot movement appeared more evenly distributed and less concentrated around high-conflict areas.
* Visual differentiation made it easier to identify AI activity within a match.

## Actionable Recommendation

Use the visualization to monitor whether bot behavior adequately supports gameplay. If bots rarely interact with players or occupy low-value regions, adjust their navigation or spawn logic to create more engaging encounters.

### Metrics Affected

* AI engagement rate
* PvE encounter frequency
* Match difficulty
* Player retention

## Why a Level Designer Should Care

Bots play an important role in maintaining match activity. Understanding where bots move and how they interact with players helps improve encounter quality and overall gameplay experience.

---

# Summary

The visualization tool provides Level Designers with immediate visual feedback about player movement, combat distribution, and AI behavior. These insights can be used to improve map balance, encourage exploration, optimize combat flow, and refine encounter design without manually analyzing raw telemetry.
