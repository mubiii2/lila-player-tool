import os
import pyarrow.parquet as pq
import pandas as pd

ROOT = r"C:\Users\ASUS\Downloads\LILA games\player_data\player_data"

rows = []

print("Scanning files...")

for folder, _, files in os.walk(ROOT):

    for file in files:

        path = os.path.join(folder, file)

        try:
            table = pq.read_table(path)
            df = table.to_pandas()

            rows.append({
                "match_id": str(df.iloc[0]["match_id"]),
                "file_path": path,
                "map_id": str(df.iloc[0]["map_id"])
            })

        except:
            pass

lookup_df = pd.DataFrame(rows)

lookup_df.to_csv(
    "match_lookup.csv",
    index=False
)

print("Saved", len(lookup_df), "rows")