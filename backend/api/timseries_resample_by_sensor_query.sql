SELECT
	date_trunc('hour', time) as tm,
	loggerid,
	MAX(decimalvalue)
FROM
	thermomapping
GROUP BY
	tm, loggerid
ORDER BY
	tm