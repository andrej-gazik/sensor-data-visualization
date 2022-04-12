SELECT tm, sensor_name, value
FROM

(SELECT
	date_trunc('hour', measurement_time) as tm,
	sensor_name,
	ROW_NUMBER() OVER (PARTITION BY date_trunc('hour', measurement_time), sensor_name) as rn,
	measurement_time,
 	value
FROM
	public.api_sensordata
    ) t
WHERE
	rn = 1