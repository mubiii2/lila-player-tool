import { useEffect, useRef, useCallback, useState } from "react";

function App() {
  const [points, setPoints] = useState([]);
  const [events, setEvents] = useState([]);
  const [matchInfo, setMatchInfo] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [timeline, setTimeline] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("All");
  
  const [selectedMap, setSelectedMap] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");

  const [showJourney, setShowJourney] = useState(true);
const [showBots, setShowBots] = useState(true);

const [showLoot, setShowLoot] = useState(true);

const [showKills, setShowKills] = useState(true);
const [showDeaths, setShowDeaths] = useState(true);
const [showStormDeaths, setShowStormDeaths] = useState(true);

const [viewMode, setViewMode] = useState("journey");

const [heatmapScope, setHeatmapScope] =
  useState("match");

const [mapEvents, setMapEvents] =
  useState([]);

const [isLoadingEvents, setIsLoadingEvents] = useState(false);
const [isLoadingMapEvents, setIsLoadingMapEvents] = useState(false);

useEffect(() => {

  if (!isPlaying) return;

  const interval = setInterval(() => {

    setTimeline((prev) => {

      if (prev >= 100) {

        setIsPlaying(false);
        return 100;

      }

      return prev + 1;

    });

  }, 100 / playbackSpeed);

  return () => clearInterval(interval);

}, [isPlaying, playbackSpeed]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);

        if (data.length > 0) {
          setSelectedMatch(data[0].match_id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;

    setPoints([]);
    setEvents([]);
    setMatchInfo(null);
    setPlayers([]);
    setSelectedPlayer("All");
    setIsLoadingEvents(true);

    fetch(`http://127.0.0.1:8000/journey/${selectedMatch}`)
  .then((res) => res.json())
  .then((data) => {
  
    setPoints(data);
  });
  

    fetch(`http://127.0.0.1:8000/events/${selectedMatch}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setIsLoadingEvents(false);
      });

    fetch(`http://127.0.0.1:8000/match-info/${selectedMatch}`)
      .then((res) => res.json())
      .then((data) => setMatchInfo(data));

    fetch(
  `http://127.0.0.1:8000/players/${selectedMatch}`
)
  .then((res) => res.json())
  .then((data) => {
  setPlayers(data);
  setSelectedPlayer("All");
});
  }, [selectedMatch]);

  const maps = [
  "All",
  ...new Set(matches.map((m) => m.map)),
];

const monthOrder = {
  January: 1, February: 2, March: 3, April: 4,
  May: 5, June: 6, July: 7, August: 8,
  September: 9, October: 10, November: 11, December: 12,
};

const dates = [
  "All",
  ...Array.from(new Set(matches.map((m) => m.date))).sort((a, b) => {
    const [monthA, dayA] = a.split("_");
    const [monthB, dayB] = b.split("_");
    return (monthOrder[monthB] * 100 + parseInt(dayB)) - (monthOrder[monthA] * 100 + parseInt(dayA));
  }),
];

const filteredMatches = matches.filter((match) => {
  const mapMatch = selectedMap === "All" || match.map === selectedMap;
  const dateMatch = selectedDate === "All" || match.date === selectedDate;
  return mapMatch && dateMatch;
});

  useEffect(() => {
  if (filteredMatches.length > 0) {
    setSelectedMatch(filteredMatches[0].match_id);
  }
}, [selectedMap, selectedDate]);

useEffect(() => {
  if (heatmapScope !== "map" || !matchInfo?.map_id) return;

  setIsLoadingMapEvents(true);
  fetch(`http://127.0.0.1:8000/map-events/${matchInfo.map_id}`)
    .then((res) => res.json())
    .then((data) => {
      setMapEvents(data);
      setIsLoadingMapEvents(false);
    });
}, [heatmapScope, matchInfo?.map_id]);

    const maxTime =
      points.length > 0
        ? Math.max(
            ...points.map((p) =>
              new Date(
                p.ts.replace(" ", "T")
              ).getTime()
            )
          )
        : 0;

    const minTime =
      points.length > 0
        ? Math.min(
            ...points.map((p) =>
              new Date(
                p.ts.replace(" ", "T")
              ).getTime()
            )
          )
        : 0;

    const currentTime =
      minTime +
      ((maxTime - minTime) * timeline) / 100;

    const visiblePoints = points.filter(
      (point) =>
        new Date(
          point.ts.replace(" ", "T")
        ).getTime() <= currentTime
    );

  const playerFilteredPoints =
  selectedPlayer === "All"
    ? visiblePoints
    : visiblePoints.filter(
        (point) =>
          point.user_id === selectedPlayer
      );

      const startPoint =
  playerFilteredPoints.length > 0
    ? playerFilteredPoints[0]
    : null;

const endPoint =
  playerFilteredPoints.length > 0
    ? playerFilteredPoints[
        playerFilteredPoints.length - 1
      ]
    : null;


const trafficPoints = playerFilteredPoints.filter(
  (point) =>
    point.event === "Position" ||
    (showBots && point.event === "BotPosition")
);


    const currentTimestamp =
      new Date(currentTime).toISOString();

    const visibleEvents = events.filter(
      (event) =>
        new Date(
          event.ts.replace(" ", "T")
        ).getTime() <= currentTime
    );


  const filteredEvents = visibleEvents.filter((event) => {

  if (
    selectedPlayer !== "All" &&
    event.user_id !== selectedPlayer
  ) {
    return false;
  }

    const playerInfo = players.find(
      (p) => p.user_id === event.user_id
    );

    if (
      !showBots &&
      playerInfo?.type === "Bot"
    ) {
      return false;
    }

  if (event.event === "Loot" && !showLoot)
    return false;

  if (
    (event.event === "Kill" ||
      event.event === "BotKill") &&
    !showKills
  )
    return false;

  if (
    (event.event === "Killed" ||
      event.event === "BotKilled") &&
    !showDeaths
  )
    return false;

  if (
    event.event === "KilledByStorm" &&
    !showStormDeaths
  )
    return false;

  return true;
});

const heatmapEvents =
  heatmapScope === "map"
    ? mapEvents
    : visibleEvents.filter((event) => {
        if (selectedPlayer !== "All" && event.user_id !== selectedPlayer) return false;
        const playerInfo = players.find((p) => p.user_id === event.user_id);
        if (!showBots && playerInfo?.type === "Bot") return false;
        if (event.event === "Loot" && !showLoot) return false;
        if ((event.event === "Kill" || event.event === "BotKill") && !showKills) return false;
        if ((event.event === "Killed" || event.event === "BotKilled") && !showDeaths) return false;
        if (event.event === "KilledByStorm" && !showStormDeaths) return false;
        return true;
      });

const killPoints = heatmapEvents.filter(
  (event) =>
    event.event === "Kill" ||
    event.event === "BotKill"
);

const lootPoints = heatmapEvents.filter(
  (event) =>
    event.event === "Loot"
);

const deathPoints = heatmapEvents.filter(
  (event) =>
    event.event === "Killed" ||
    event.event === "BotKilled" ||
    event.event === "KilledByStorm"
);


  const getEventColor = (event) => {
  switch (event) {
    case "Loot":
      return "yellow";

    case "Kill":
      return "orange";

    case "Killed":
      return "darkred";

    case "BotKill":
      return "red";

    case "BotKilled":
      return "purple";

    case "KilledByStorm":
      return "#4da6ff";

    default:
      return "white";
  }
};

  const getMapImage = () => {
    switch (matchInfo?.map_id) {
      case "Lockdown":
        return "/Lockdown_Minimap.jpg";

      case "GrandRift":
        return "/GrandRift_Minimap.png";

      case "AmbroseValley":
        return "/AmbroseValley_Minimap.png";

      default:
        return "/AmbroseValley_Minimap.png";
    }
  };

const pathPoints = playerFilteredPoints.filter(
  (point) =>
    showBots ||
    point.event !== "BotPosition"
);

const selectedPlayerInfo =
  players.find(
    (p) =>
      p.user_id === selectedPlayer
  );

const playerGroups = {};

pathPoints.forEach((point) => {
  if (!playerGroups[point.user_id]) {
    playerGroups[point.user_id] = [];
  }

  playerGroups[point.user_id].push(point);
});

const heatmapCanvasRef = useRef(null);

const heatmapColors = {
  traffic: "0,255,180",
  loot: "255,255,0",
  kills: "255,0,0",
  deaths: "128,0,255",
};

useEffect(() => {
  const canvas = heatmapCanvasRef.current;
  if (!canvas || viewMode === "journey") return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 800, 800);

  const points =
    viewMode === "traffic" ? trafficPoints :
    viewMode === "loot" ? lootPoints :
    viewMode === "kills" ? killPoints :
    viewMode === "deaths" ? deathPoints : [];

  const color = heatmapColors[viewMode] || "255,255,255";
  const radius = viewMode === "traffic" ? 20 : 18;
  const alpha = viewMode === "traffic" ? 0.08 : 0.18;

  points.forEach((pt) => {
    const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
    grad.addColorStop(0, `rgba(${color},${alpha})`);
    grad.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
}, [viewMode, trafficPoints, lootPoints, killPoints, deathPoints]);

return (
  <div
    style={{
      padding: "20px",
      backgroundColor: "#121212",
      color: "white",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
    >
      <h3
  style={{
    margin: "0 0 8px 0",
  }}
>
  LILA: BLACK Player Journey Tool
</h3>
      <div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "#121212",
    padding: "8px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderBottom: "1px solid #333",
    marginBottom: "10px",
  }}
>

{/* Match Selector */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "10px",
  }}
>
  <label
    style={{
      fontSize: "14px",
      fontWeight: "600",
    }}
  >
    Map
  </label>

  <select
    value={selectedMap}
    onChange={(e) =>
      setSelectedMap(e.target.value)
    }
    style={{
      width: "140px",
      height: "34px",
      fontSize: "13px",
      padding: "4px 8px",
    }}
  >
    {maps.map((map) => (
      <option
        key={map}
        value={map}
      >
        {map}
      </option>
    ))}
  </select>

  <label
    style={{
      fontSize: "14px",
      fontWeight: "600",
    }}
  >
    Date
  </label>

  <select
    value={selectedDate}
    onChange={(e) =>
      setSelectedDate(e.target.value)
    }
    style={{
      width: "140px",
      height: "34px",
      fontSize: "13px",
      padding: "4px 8px",
    }}
  >
    {dates.map((date) => (
      <option
        key={date}
        value={date}
      >
        {date}
      </option>
    ))}
  </select>

  <label
    style={{
      fontSize: "14px",
      fontWeight: "600",
    }}
  >
    Match
  </label>

  <select
    value={selectedMatch}
    onChange={(e) =>
      setSelectedMatch(e.target.value)
    }
    style={{
      width: "280px",
      height: "34px",
      fontSize: "13px",
      padding: "4px 8px",
    }}
  >
    {filteredMatches.map((match) => (
      <option
  key={match.match_id}
  value={match.match_id}
>
  {match.match_id.substring(0, 8)}
  {" • "}
  {match.map}
  {" • "}
  {match.players}P
</option>
    ))}
  </select>

  <label
    style={{
      fontSize: "14px",
      fontWeight: "600",
    }}
  >
    Player
  </label>

  <select
    value={selectedPlayer}
    onChange={(e) =>
      setSelectedPlayer(e.target.value)
    }
    style={{
      width: "180px",
      height: "34px",
      fontSize: "13px",
      padding: "4px 8px",
    }}
  >
    <option value="All">
      All Players
    </option>

    {players.map((player) => (
  <option
    key={player.user_id}
    value={player.user_id}
  >
    {player.user_id} {" "}
    {player.type === "Bot"
      ? "🤖"
      : "👤"}
  </option>
))}
   
  </select>
</div>

      {/* Filters */}
      <div style={{ marginBottom: "0px" }}>
        <label>
          <input
            type="checkbox"
            checked={showJourney}
            onChange={() =>
              setShowJourney(!showJourney)
            }
          />
          Player Journey
        </label>

        <label style={{ marginLeft: "20px" }}>
          <input
            type="checkbox"
            checked={showLoot}
            onChange={() =>
              setShowLoot(!showLoot)
            }
          />
          Loot
        </label>

        <label style={{ marginLeft: "20px" }}>
  <input
    type="checkbox"
    checked={showKills}
    onChange={() =>
      setShowKills(!showKills)
    }
  />
  Kills
</label>

<label style={{ marginLeft: "20px" }}>
  <input
    type="checkbox"
    checked={showDeaths}
    onChange={() =>
      setShowDeaths(!showDeaths)
    }
  />
  Deaths
</label>

<label style={{ marginLeft: "20px" }}>
  <input
    type="checkbox"
    checked={showStormDeaths}
    onChange={() =>
      setShowStormDeaths(!showStormDeaths)
    }
  />
  Storm Deaths
</label>
          
          <label style={{ marginLeft: "20px" }}>
          <input
          type="checkbox"
          checked={showBots}
          onChange={() =>
          setShowBots(!showBots)
          }
         />
         Bot Journey
       
        </label>
       
      </div>

      

      </div>
      
      {/* Match Info */}
      <div
  style={{
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    justifyContent: "center",
  }}
>
<div
  style={{
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",

    position: "sticky",
top: "90px",
alignSelf: "flex-start",

   
  }}
>
  {matchInfo && (
    <div
      style={{
        width: "260px",
        padding: "15px",
        border: "1px solid #444",
        borderRadius: "10px",
        backgroundColor: "#1a1a1a",
        
      }}
    >
      <h3
  style={{
    fontSize: "15px",
    margin: "0 0 10px 0",
  }}
>
  {selectedPlayer === "All"
  ? "Match Info"
  : "Player Stats"}
</h3>

{selectedPlayer === "All" ? (
  <>
    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Map:</strong> {matchInfo.map_id}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Players:</strong> {matchInfo.players}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Humans:</strong> {matchInfo.human_players}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Bots:</strong> {matchInfo.bot_players}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Events:</strong> {matchInfo.events}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Loot:</strong> {matchInfo.loot}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Kills:</strong> {matchInfo.kills}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Deaths:</strong> {matchInfo.deaths}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Bot Kills:</strong> {matchInfo.bot_kills}
    </p>
  </>
) : (
  <>
    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Player:</strong> {selectedPlayer}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Type:</strong>
      {selectedPlayerInfo?.type === "Bot"
        ? " 🤖 Bot"
        : " 👤 Human"}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Journey Points:</strong>
      {playerFilteredPoints.length}
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Loot:</strong>
      {
        events.filter(
          (e) =>
            e.user_id === selectedPlayer &&
            e.event === "Loot"
        ).length
      }
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Kills:</strong>
      {
        events.filter(
          (e) =>
            e.user_id === selectedPlayer &&
            (
              e.event === "Kill" ||
              e.event === "BotKill"
            )
        ).length
      }
    </p>

    <p style={{ fontSize: "14px", margin: "4px 0" }}>
      <strong>Deaths:</strong>
      {
        events.filter(
          (e) =>
            e.user_id === selectedPlayer &&
            (
              e.event === "Killed" ||
              e.event === "BotKilled" ||
              e.event === "KilledByStorm"
            )
        ).length
      }
    </p>
  </>
)}

    </div>

  )}

    <div
  style={{
    width: "260px",
    padding: "15px",
    border: "1px solid #444",
    borderRadius: "10px",
    backgroundColor: "#1a1a1a",
  }}
>

  
  <h3
  style={{
    fontSize: "15px",
    margin: "0 0 10px 0",
  }}
>
  Timeline
</h3>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  }}
>
  {/* Replay Controls */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "10px",
      width: "100%",
    }}
  >
    <button
      onClick={() => setIsPlaying(true)}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      ▶ Play
    </button>

    <button
      onClick={() => setIsPlaying(false)}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      ⏸ Pause
    </button>

    <button
      onClick={() => {
        setIsPlaying(false);
        setTimeline(0);
      }}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      ⏮ Reset
    </button>
  </div>

  {/* Speed Controls */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "10px",
      width: "100%",
    }}
  >
    {[0.5, 1, 2, 4].map((speed) => (
      <button
        key={speed}
        onClick={() => setPlaybackSpeed(speed)}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "none",
          fontWeight: "bold",
          backgroundColor:
            playbackSpeed === speed
              ? "#00c8ff"
              : "#2a2a2a",
          color: "white",
        }}
      >
        {speed}x
      </button>
    ))}
  </div>
</div>

  <input
    type="range"
    min="0"
    max="100"
    value={timeline}
    onChange={(e) =>
      setTimeline(Number(e.target.value))
    }
    style={{
      width: "100%",
    }}
  />

  <p
  style={{
    fontSize: "14px",
    color: "#aaa",
    marginTop: "4px",
  }}
>
  {timeline}%
</p>

</div>

<div
  style={{
    width: "260px",
    padding: "15px",
    border: "1px solid #444",
    borderRadius: "10px",
    backgroundColor: "#1a1a1a",
  }}
>
  <h3
  style={{
    fontSize: "15px",
    margin: "0 0 10px 0",
  }}
>
  Visualization
</h3>

<button
  onClick={() =>
    setViewMode("journey")
  }
  style={{
    width: "100%",
    marginBottom: "18px",
    background:
      viewMode === "journey"
        ? "#1db4e8"
        : "#2d2d2d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Journey
</button>

<>
    <h4
  style={{
    margin: "0 0 10px 0",
    textAlign: "center",
    fontSize: "14px",
  }}
>
  Heatmap Analysis
</h4>

<div
  style={{
    display: "flex",
    marginBottom: "15px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #444",
  }}
>
  <button
    onClick={() =>
      setHeatmapScope("match")
    }
    style={{
      flex: 1,
      padding: "8px",
      border: "none",
      cursor: "pointer",
      background:
        heatmapScope === "match"
          ? "#00c8ff"
          : "#2a2a2a",
      color: "white",
      fontWeight: "bold",
    }}
  >
    Match
  </button>

  <button
    onClick={() =>
      setHeatmapScope("map")
    }
    style={{
      flex: 1,
      padding: "8px",
      border: "none",
      cursor: "pointer",
      background:
        heatmapScope === "map"
          ? "#00c8ff"
          : "#2a2a2a",
      color: "white",
      fontWeight: "bold",
    }}
  >
    Entire Map
  </button>
</div>

{heatmapScope === "map" && (
  <div
    style={{
      textAlign: "center",
      marginBottom: "12px",
      color: "#bdbdbd",
      fontSize: "12px",
    }}
  >
    <div>
      <strong>Map:</strong> {matchInfo?.map_id}
    </div>

    <div>
      <strong>Events:</strong> {mapEvents.length}
    </div>
  </div>
)}

    <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "2px",
  }}
>
{[
  "traffic",
  "loot",
  "kills",
  "deaths",
].map((mode) => (
  <button
    key={mode}
    onClick={() => setViewMode(mode)}
    style={{
      padding: "10px",
      fontSize: "13px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      backgroundColor:
        viewMode === mode
          ? "#00c8ff"
          : "#2a2a2a",
      color: "white",
      fontWeight: "bold",
    }}
  >
    {{
      traffic: "🟢 Traffic",
      loot: "🟡 Loot",
      kills: "🔴 Kills",
      deaths: "🟣 Deaths",
    }[mode]}
  </button>
))}
</div>

</>

</div>

</div>

<div
  style={{
    position: "relative",
    width: "800px",
  }}
>

      {/* Map */}
     
      
        {matchInfo ? (
  <img
    src={getMapImage()}
    alt="Map"
    width="800"
  />
) : (
  <div
    style={{
      width: "800px",
      height: "800px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#1a1a1a",
      color: "#888",
    }}
  >
    Loading Match...
  </div>
)}

        {/* Journey Lines */}
        {showJourney && 
        viewMode === "journey" && (
          <svg
            width="800"
            height="800"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
            }}
          >
            {Object.values(playerGroups).map(
  (playerPoints, playerIndex) => (
    <g key={playerIndex}>
      {playerPoints.slice(1).map(
        (point, index) => (
          <line
            key={index}
            x1={playerPoints[index].x}
            y1={playerPoints[index].y}
            x2={point.x}
            y2={point.y}
            stroke={
              point.event === "BotPosition"
                ? "#00c8ff"
                : "#00ff88"
            }
            strokeWidth="1.5"
          />
        )
      )}
    </g>
  )
)}
          </svg>
        )}

        {/* Journey Points */}
        {showJourney &&
  viewMode === "journey" &&
  playerFilteredPoints
    .filter((point) => {
      if (
        point.event === "BotPosition" &&
        !showBots
      ) {
        return false;
      }

      return true;
    })
    .map((point, index) => (
            <div
              key={`point-${index}`}
              title={point.ts}
              style={{
                position: "absolute",
                left: point.x,
                top: point.y,
                width: "4px",
                height: "4px",
                backgroundColor:
  point.event === "BotPosition"
    ? "#00c8ff"
    : "#00ff88",
                borderRadius: "50%",
              }}
            />
          ))}

       {/* Heatmap canvas - replaces individual blurred divs */}
  {viewMode !== "journey" && (
    <canvas
      ref={heatmapCanvasRef}
      width="800"
      height="800"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  )}

  {/* Loading overlay for match data */}
  {isLoadingEvents && (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "800px",
        height: "800px",
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "5px solid #333",
          borderTop: "5px solid #00c8ff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <div style={{ color: "#ccc", fontSize: "14px" }}>
        Loading match data...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )}

  {/* Loading overlay for entire map events */}
  {isLoadingMapEvents && (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "800px",
        height: "800px",
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "5px solid #333",
          borderTop: "5px solid #00c8ff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <div style={{ color: "#ccc", fontSize: "14px" }}>
        Loading map events...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )}

  {viewMode === "journey" &&
 selectedPlayer !== "All" &&
 startPoint && (
  <div
    style={{
      position: "absolute",
      left: startPoint.x - 6,
      top: startPoint.y - 10,
      color: "lime",
      fontSize: "12px",
      fontWeight: "bold",
      WebkitTextStroke: "1px black",
      zIndex: 1500,
      pointerEvents: "none",
      textShadow:
  "0 0 4px rgba(0,0,0,0.8)"
    }}
  >
    ▲
  </div>
)}

{viewMode === "journey" &&
 selectedPlayer !== "All" &&
 endPoint && (
  <div
    style={{
      position: "absolute",
      left: endPoint.x - 5,
      top: endPoint.y - 8,
      color: "maroon",
      fontSize: "11px",
      fontWeight: "bold",
      WebkitTextStroke: "1px black",
      zIndex: 1500,
      pointerEvents: "none",
      textShadow:
  "0 0 4px rgba(0,0,0,0.8)"
    }}
  >
    ■
  </div>
)}


        {/* Events */}
{viewMode === "journey" &&
  filteredEvents.map((event, index) => (
          <div
            key={`event-${index}`}
            title={`${event.event} | ${event.ts}`}
            style={{
              position: "absolute",
              left: event.x,
              top: event.y,
              width: "8px",
              height: "8px",
              backgroundColor: getEventColor(event.event),
              borderRadius: "50%",
              border: "1px solid black",
              zIndex: 1000,
            }}
          />
        ))}
         <div
  style={{
    position: "absolute",
    bottom: "80px",
    right: "15px",

    backgroundColor: "rgba(20, 20, 20, 0.85)",
    backdropFilter: "blur(4px)",

    padding: "10px 14px",
    borderRadius: "8px",

    border: "1px solid rgba(255,255,255,0.1)",

    display: "flex",
    flexDirection: "column",
    gap: "3px",

    fontSize: "12px",
    color: "white",

    zIndex: 2000,
  }}
>
  <div
    style={{
      fontWeight: "bold",
      color: "#cccccc",
      marginBottom: "4px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      paddingBottom: "4px",
    }}
  >
    Legend
  </div>

  <div style={{ color: "#00ff88", lineHeight: "1.2" }}>
    ● Human Journey
  </div>

  <div style={{ color: "#00c8ff", lineHeight: "1.2" }}>
    ● Bot Journey
  </div>

  <div style={{ color: "yellow", lineHeight: "1.2" }}>
    ● Loot
  </div>

  <div style={{ color: "red", lineHeight: "1.2" }}>
    ● Human Kill
  </div>

  <div style={{ color: "darkred", lineHeight: "1.2" }}>
    ● Human Death
  </div>

  <div style={{ color: "orange", lineHeight: "1.2" }}>
    ● Bot Kill
  </div>

  <div style={{ color: "purple", lineHeight: "1.2" }}>
    ● Bot Death
  </div>

  <div style={{ color: "#4da6ff", lineHeight: "1.2" }}>
    ● Storm Death
  </div>
 <div
  style={{
    color: "#00ff88",
    lineHeight: "1.2",
  }}
>
  ▲ Start
</div>


<div
  style={{
    color: "#ff5555",
    lineHeight: "1.2",
  }}
>
  ■ End
</div>

</div>
</div>
</div>
</div>

   

  );
}

export default App;