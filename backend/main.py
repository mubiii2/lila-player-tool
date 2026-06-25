from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data_loader import load_player_file
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAP_SIZE = 800

MAP_CONFIG = {
    "AmbroseValley": {"scale": 900,  "origin_x": -370, "origin_z": -473},
    "GrandRift":     {"scale": 581,  "origin_x": -290, "origin_z": -290},
    "Lockdown":      {"scale": 1000, "origin_x": -500, "origin_z": -500},
}

lookup_df = pd.read_csv("match_lookup.csv")
print(
    lookup_df.groupby("match_id")
    .size()
    .sort_values(ascending=False)
    .head(20)
)

match_id = "fbbc5d02-dd79-42fb-bba5-d768023891c8.nakama-0"

rows = lookup_df[
    lookup_df["match_id"] == match_id
]

print(rows[["match_id", "file_path"]])

def world_to_map(x, z, map_id="AmbroseValley"):
    cfg = MAP_CONFIG.get(map_id, MAP_CONFIG["AmbroseValley"])
    u = (x - cfg["origin_x"]) / cfg["scale"]
    v = (z - cfg["origin_z"]) / cfg["scale"]
    pixel_x = u * MAP_SIZE
    pixel_y = (1 - v) * MAP_SIZE
    return round(pixel_x, 2), round(pixel_y, 2)

def get_file_path(match_id):

    row = lookup_df[
        lookup_df["match_id"] == match_id
    ]

    if row.empty:
        return None

    relative_path = row.iloc[0]["file_path"]

    return os.path.join(
        BASE_DIR,
        "..",
        "player_data",
        "player_data",
        relative_path
    )


def get_file_paths(match_id):

    rows = lookup_df[
        lookup_df["match_id"] == match_id
    ]

    if rows.empty:
        return []

    paths = []

    for relative_path in rows["file_path"]:
        paths.append(
            os.path.join(
                BASE_DIR,
                "..",
                "player_data",
                "player_data",
                relative_path
            )
        )

    return paths

@app.get("/")
def home():
    return {"status": "success"}


@app.get("/matches")
def matches():

    df = pd.read_csv("match_catalog.csv")

    player_counts = (
        lookup_df.groupby("match_id")
        .size()
        .to_dict()
    )

    matches = []

    for _, row in df.iterrows():

        matches.append({
            "match_id": row["match_id"],
            "map": row["map"],
            "date": row["date"],
            "players": player_counts.get(
                row["match_id"],
                1
            )
        })
    matches.sort(
        key=lambda x: x["players"],
        reverse=True
    )

    return matches[:100]

@app.get("/journey/{match_id}")
def journey(match_id: str):

    file_paths = get_file_paths(match_id)

    if not file_paths:
        return []

    dfs = []

    for file_path in file_paths:
        dfs.append(
            load_player_file(file_path)
        )

    df = pd.concat(
        dfs,
        ignore_index=True
    )
    map_id = str(df.iloc[0]["map_id"])

    movement_df = df[
    df["event"].isin(["Position", "BotPosition"])
]

    points = []

    for _, row in movement_df.iterrows():

        pixel_x, pixel_y = world_to_map(row["x"], row["z"], map_id)
        points.append({
    "x": pixel_x,
    "y": pixel_y,
    "event": row["event"],
    "ts": str(row["ts"]),
    "user_id": str(row["user_id"])
})

    return points


@app.get("/events/{match_id}")
def events(match_id: str):

    file_paths = get_file_paths(match_id)

    if not file_paths:
        return []

    dfs = []

    for file_path in file_paths:
        dfs.append(
            load_player_file(file_path)
        )

    df = pd.concat(
        dfs,
        ignore_index=True
    )

    map_id = str(df.iloc[0]["map_id"])

    event_df = df[
    ~df["event"].isin(
        ["Position", "BotPosition"]
    )
]

    markers = []

    for _, row in event_df.iterrows():

        pixel_x, pixel_y = world_to_map(row["x"], row["z"], map_id)

        markers.append({
            "x": pixel_x,
            "y": pixel_y,
            "event": row["event"],
            "ts": str(row["ts"]),
            "user_id": str(row["user_id"])
        })

    return markers


@app.get("/match-info/{match_id}")
def match_info(match_id: str):

    file_paths = get_file_paths(match_id)

    if not file_paths:
        return {}

    dfs = []

    for file_path in file_paths:
        dfs.append(
            load_player_file(file_path)
        )

    df = pd.concat(
        dfs,
        ignore_index=True
    )

    event_counts = df["event"].value_counts().to_dict()

    human_players = (
        df[df["event"] == "Position"]
        ["user_id"]
        .nunique()
    )

    bot_players = (
        df[df["event"] == "BotPosition"]
        ["user_id"]
        .nunique()
    )

    return {
        "match_id": str(df.iloc[0]["match_id"]),
        "map_id": str(df.iloc[0]["map_id"]),

        "players": human_players + bot_players,

        "human_players": human_players,
        "bot_players": bot_players,

        "events": len(df),

        "loot": event_counts.get("Loot", 0),

        "kills":
            event_counts.get("Kill", 0)
            + event_counts.get("BotKill", 0),

        "deaths":
            event_counts.get("Killed", 0)
            + event_counts.get("BotKilled", 0)
            + event_counts.get("KilledByStorm", 0),

        "bot_kills":
            event_counts.get("BotKill", 0),
    }

@app.get("/map-bounds/{match_id}")
def map_bounds(match_id: str):

    file_path = get_file_path(match_id)

    if not file_path:
        return {"error": "Match not found"}

    df = load_player_file(file_path)

    return {
        "map": str(df.iloc[0]["map_id"]),
        "min_x": float(df["x"].min()),
        "max_x": float(df["x"].max()),
        "min_z": float(df["z"].min()),
        "max_z": float(df["z"].max())
    }

@app.get("/event-types/{match_id}")
def event_types(match_id: str):

    file_path = get_file_path(match_id)

    df = load_player_file(file_path)

    return df["event"].value_counts().to_dict()

@app.get("/all-event-types")
def all_event_types():

    import os
    import pyarrow.parquet as pq

    events = set()

    root = ".."

    for folder, _, files in os.walk(root):
        for file in files:

            try:
                table = pq.read_table(
                    os.path.join(folder, file)
                )

                df = table.to_pandas()

                for event in df["event"].unique():

                    if isinstance(event, bytes):
                        event = event.decode("utf-8")

                    events.add(event)

            except:
                pass

    return sorted(list(events))

@app.get("/columns/{match_id}")
def columns(match_id: str):

    file_path = get_file_path(match_id)

    if not file_path:
        return []

    df = load_player_file(file_path)

    return list(df.columns)

@app.get("/debug-users/{match_id}")
def debug_users(match_id: str):

    file_path = get_file_path(match_id)

    if not file_path:
        return []

    df = load_player_file(file_path)

    return list(df["user_id"].unique())


@app.get("/debug-match/{match_id}")
def debug_match(match_id: str):

    file_paths = get_file_paths(match_id)

    result = []

    for file_path in file_paths:

        df = load_player_file(file_path)

        result.append({
            "user": str(df.iloc[0]["user_id"]),
            "map": str(df.iloc[0]["map_id"])
        })

    return result

@app.get("/columns-sample/{match_id}")
def columns_sample(match_id: str):

    file_path = get_file_path(match_id)

    df = load_player_file(file_path)

    return df.iloc[0].to_dict()

@app.get("/players/{match_id}")
def players(match_id: str):

    file_paths = get_file_paths(match_id)

    players = []

    for file_path in file_paths:

        df = load_player_file(file_path)

        user_id = str(df.iloc[0]["user_id"])

        player_type = (
            "Bot"
            if (df["event"] == "BotPosition").any()
            else "Human"
        )

        players.append({
            "user_id": user_id,
            "type": player_type
        })

    return players

    
@app.get("/match-player-counts")
def match_player_counts():

    counts = (
        lookup_df.groupby("match_id")
        .size()
        .sort_values(ascending=False)
        .head(50)
    )

    return counts.to_dict()

@app.get("/map-events/{map_name}")
def map_events(map_name: str):

    catalog = pd.read_csv("match_catalog.csv")

    map_matches = catalog[
        catalog["map"] == map_name
    ]

    all_markers = []

    for match_id in map_matches["match_id"]:

        file_paths = get_file_paths(match_id)

        if not file_paths:
            continue

        dfs = []

        for file_path in file_paths:
            dfs.append(
                load_player_file(file_path)
            )

        df = pd.concat(
            dfs,
            ignore_index=True
        )

        event_df = df[
            ~df["event"].isin(
                ["Position", "BotPosition"]
            )
        ]

        map_id = str(df.iloc[0]["map_id"])

        for _, row in event_df.iterrows():

            pixel_x, pixel_y = world_to_map(
                row["x"],
                row["z"],
                map_id
            )

            all_markers.append({
                "x": pixel_x,
                "y": pixel_y,
                "event": row["event"],
                "user_id": str(row["user_id"])
            })

    return all_markers

@app.get("/debug-file-paths/{match_id}")
def debug_file_paths(match_id: str):
    return get_file_paths(match_id)

@app.get("/debug-file-exists/{match_id}")
def debug_file_exists(match_id: str):

    import os

    paths = get_file_paths(match_id)

    return {
        "paths": paths,
        "exists": [os.path.exists(p) for p in paths]
    }