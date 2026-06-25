import pyarrow.parquet as pq

def load_player_file(filepath):
    table = pq.read_table(filepath)
    df = table.to_pandas()

    df["event"] = df["event"].apply(
        lambda x: x.decode("utf-8")
        if isinstance(x, bytes)
        else x
    )

    return df