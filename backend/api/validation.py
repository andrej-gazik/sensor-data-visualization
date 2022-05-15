import pandas as pd
import pandera as pa
from pandera import DataFrameSchema, Check, Column
from pandera.errors import SchemaError


def validate_df(df):
    if not isinstance(df, pd.DataFrame):
        return {"file": "Error while parsing data"}

    if len(df.columns) != 3:
        return {"file": "Wrong number of columns"}
    df.columns = ["value", "sensor_id", "time"]

    try:
        mapping = {
            df.columns[0]: "value",
            df.columns[1]: "sensor_id",
            df.columns[2]: "time",
        }

        print(df.columns)

        df["time"] = pd.to_datetime(df["time"], errors="raise")
    except ValueError:
        return {"file": "Unable to parse dates from date column"}
    value_schema = Column(float, name="value")
    sensor_id_schema = Column(int, name="sensor_id", checks=Check(lambda x: x > 0))

    try:
        sensor_id_schema.validate(df)
    except SchemaError:
        return{'file': 'Unable to parse sensor_id column'}

    try:
        value_schema.validate(df)
    except SchemaError:
        return{'file': 'Unable to parse value column'}