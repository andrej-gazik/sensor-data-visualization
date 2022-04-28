from django.db import connection
from psycopg2.extensions import AsIs


def make_query(pk, aggregate, interval, gtd, ltd):
    # pk = 1
    # aggregate = 'max'
    # interval = 'hour'
    # gtd = '2022-04-11T21:30:07'
    # ltd = '2018-04-11T21:30:07'
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
                public.api_sensordata
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
        parameters = [interval, interval, ltd, gtd, pk]

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
                public.api_sensordata
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
        parameters = [interval, AsIs(aggregate), ltd, gtd, pk]

        with connection.cursor() as cursor:
            cursor.execute(query, parameters)
            rows = cursor.fetchall()

            with open('output.txt', 'w') as f:
                f.writelines(str(cursor))

            return rows

