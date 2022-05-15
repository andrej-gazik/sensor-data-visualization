from django.db import connection
from psycopg2.extensions import AsIs


def make_query(pk, aggregate, interval, gte, lte):
    if aggregate == "none":
        query = """
        SELECT tm, sensor_name, value
        FROM
            (
            SELECT
                date_trunc(%s, measurement_time) as tm,
                sensor_name,
                ROW_NUMBER() OVER (PARTITION BY date_trunc(%s, measurement_time), sensor_name) as rn,
                measurement_time,
                value
            FROM
                api_sensordata
            WHERE
                measurement_time > %s
                AND 
                measurement_time < %s 
                AND 
                visualization_id = %s
            ) t
        WHERE
            rn = 1     
        ORDER BY 
            tm     
        """
        parameters = [interval, interval, lte, gte, pk]
        print(gte, lte)
        with connection.cursor() as cursor:
            cursor.execute(query, parameters)
            rows = cursor.fetchall()
            return rows
    else:
        query = """
            SELECT
                date_trunc(%s, measurement_time) as tm,
                sensor_name,
                %s(value)
            FROM
                api_sensordata
            WHERE 
                measurement_time > %s
                AND 
                measurement_time < %s 
                AND 
                visualization_id = %s
            GROUP BY
                tm, sensor_name
            ORDER BY
                tm
        """
        parameters = [interval, AsIs(aggregate), lte, gte, pk]

        with connection.cursor() as cursor:
            cursor.execute(query, parameters)
            rows = cursor.fetchall()

            return rows


def mkt(pk, interval, gte, lte):
    query = """
    SELECT
        date_trunc(%s, measurement_time) as tm,
        sensor_name,
        (83.14472/0.008314472)/-LN(SUM(EXP((-1.0 * 83.14472)/(0.008314472 * (value + 273.15))))/COUNT(*))-273.15 AS mkt
    FROM 
        api_sensordata 
    WHERE 
        measurement_time > %s
        AND 
        measurement_time < %s 
        AND 
        visualization_id = %s
    GROUP BY 
        tm, sensor_name
    ORDER BY tm
    """

    parameters = [interval, lte, gte, pk]

    with connection.cursor() as cursor:
        cursor.execute(query, parameters)
        rows = cursor.fetchall()

        with open('output.txt', 'w') as f:
            f.writelines(str(cursor))

        return rows