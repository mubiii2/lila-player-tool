import os
import pyarrow.parquet as pq
import pandas as pd

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

            df["event"] = df["event"].apply(
                lambda x: x.decode("utf-8")
                if isinstance(x, bytes)
                else x
            )

            all_frames.append(df)

        except:
            pass

master_df = pd.concat(all_frames)

print("\n=== MAPS ===")
print(master_df["map_id"].value_counts())

print("\n=== EVENTS ===")
print(master_df["event"].value_counts())

print("\n=== UNIQUE MATCHES ===")
print(master_df["match_id"].nunique())

print("\n=== UNIQUE PLAYERS ===")
print(master_df["user_id"].nunique())