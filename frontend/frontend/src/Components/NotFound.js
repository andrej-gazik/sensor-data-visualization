import React, { useEffect } from 'react';

function NotFound(props) {
	useEffect(() => {
		console.log(props);
	}, []);
	return <div>NotFound {props.id}</div>;
}

export default NotFound;
