import pandas as pd


def validate_df(df):
    if not isinstance(df, pd.DataFrame):
        return {"file": "Error while parsing data"}

    if len(df.columns) != 3:
        return {"file": "Wrong number of columns"}
    try:
        mapping = {
            df.columns[0]: "value",
            df.columns[1]: "sensor_id",
            df.columns[2]: "time",
        }
        # df.rename(columns=mapping)
        df.columns = ["value", "sensor_id", "time"]
        # print('renamed')

        df["time"] = pd.to_datetime(df["time"], errors="raise")
    except ValueError:
        return {"file": "Unable to parse dates from date column"}
