const idw = (xPred, yPred, x, y, val, power) => {
	var a = 0;
	var b = 0;
	for (var i = 0; i < x.length; i++) {
		const dist = calcDist({ x: xPred, y: yPred }, { x: x[i], y: y[i] });
		a += val[i] / Math.pow(dist, power);
		b += 1 / Math.pow(dist, power);
		if (dist === 0) {
			return val[i];
		}
	}
	if (b === 0) {
		return a;
	}
	return a / b;
};

const calcDist = (p, q) => {
	return Math.sqrt(Math.pow(q.x - p.x, 2) + Math.pow(p.y - q.y, 2));
};

export default idw;
