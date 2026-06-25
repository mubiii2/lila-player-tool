import os
import pyarrow.parquet as pq
import pandas as pd

lookup_df = pd.read_csv(
    r"C:\Users\ASUS\Downloads\LILA games\backend\match_lookup.csv"
)
def get_match_date(match_id):

    row = lookup_df[
        lookup_df["match_id"] == match_id
    ]

    if row.empty:
        return "Unknown"

    file_path = row.iloc[0]["file_path"]

    return os.path.basename(
        os.path.dirname(file_path)
    )

print("Loading data...")

root = ".."

all_frames = []

for folder, _, files in os.walk(root):
    for file in files:

        if file.startswith("."):
            continue

        path = os.path.join(folder, file)

        try:
            table = pq.read_table(path)
            df = table.to_pandas()

            # Decode bytes -> string
            df["event"] = df["event"].apply(
                lambda x: x.decode("utf-8")
                if isinstance(x, bytes)
                else x
            )

            all_frames.append(df)

        except Exception:
            pass

master_df = pd.concat(all_frames, ignore_index=True)

print(f"\nLoaded {len(master_df)} events")

matches = []

for match_id, group in master_df.groupby("match_id"):

    unique_players = group["user_id"].astype(str).unique()

    humans = sum("-" in player for player in unique_players)
    bots = len(unique_players) - humans

    duration_ms = (
        group["ts"].max() - group["ts"].min()
    ).total_seconds() * 1000

    matches.append({
        "match_id": match_id,
        "map": group["map_id"].iloc[0],
        "date": get_match_date(match_id),

        "events": len(group),

        "players": len(unique_players),
        "humans": humans,
        "bots": bots,

        "loot": (group["event"] == "Loot").sum(),

        "bot_kills": (
            (group["event"] == "BotKill").sum()
        ),

        "storm_deaths": (
            (group["event"] == "KilledByStorm").sum()
        ),

        "duration_sec": round(duration_ms / 1000, 2)
    })

matches_df = pd.DataFrame(matches)

print("\n===================================")
print("MATCH DATASET SUMMARY")
print("===================================")

print(f"Total Matches: {len(matches_df)}")
print(f"Average Players: {matches_df['players'].mean():.2f}")
print(f"Average Events: {matches_df['events'].mean():.2f}")

print("\n===================================")
print("TOP 20 BY EVENTS")
print("===================================")

print(
    matches_df
    .sort_values("events", ascending=False)
    .head(20)
)

print("\n===================================")
print("TOP 20 BY PLAYERS")
print("===================================")

print(
    matches_df
    .sort_values("players", ascending=False)
    .head(20)
)

print("\n===================================")
print("TOP 20 BY LOOT")
print("===================================")

print(
    matches_df
    .sort_values("loot", ascending=False)
    .head(20)
)

print("\n===================================")
print("TOP 20 BY BOT KILLS")
print("===================================")

print(
    matches_df
    .sort_values("bot_kills", ascending=False)
    .head(20)
)

# Save match catalog for later use

matches_df.to_csv(
    "match_catalog.csv",
    index=False
)

print("\nSaved match_catalog.csv")

pd.set_option("display.max_columns", None)
pd.set_option("display.width", None)

print(matches_df.sort_values("players", ascending=False).head(20))

matches_df.to_csv("match_catalog.csv", index=False)

print("\nSaved match_catalog.csv")