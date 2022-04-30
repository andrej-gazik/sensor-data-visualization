import axios from 'axios';

const API = axios.create({
	baseURL: 'http://localhost:8000/api',
	headers: {
		Authorization: localStorage.getItem('access_token')
			? 'JWT ' + localStorage.getItem('access_token')
			: null,
		'Content-type': 'application/json',
		accept: 'application/json',
	},
});

API.interceptors.response.use(
	(response) => {
		return response;
	},
	async function (error) {
		const originalRequest = error.config;

		if (typeof error.response === 'undefined') {
			alert(
				'A server/network error occurred. ' +
					'Looks like CORS might be the problem. ' +
					'Sorry about this - we will get it fixed shortly.'
			);
			return Promise.reject(error);
		}

		if (
			error.response.status === 401 &&
			originalRequest.url === API.baseURL + '/auth/token/refresh/'
		) {
			console.log('urls match and something happens');
			window.location.href = '/login/';
			return Promise.reject(error);
		}

		if (
			error.response.data.code === 'token_not_valid' &&
			error.response.status === 401 &&
			error.response.statusText === 'Unauthorized'
		) {
			const refreshToken = localStorage.getItem('refresh_token');

			if (refreshToken) {
				const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));

				// exp date in token is expressed in seconds, while now() returns milliseconds:
				const now = Math.ceil(Date.now() / 1000);
				console.log(tokenParts.exp);

				if (tokenParts.exp > now) {
					return API.post('/auth/token/refresh/', {
						refresh: refreshToken,
					})
						.then((response) => {
							localStorage.setItem(
								'access_token',
								response.data.access
							);
							localStorage.setItem(
								'refresh_token',
								response.data.refresh
							);

							API.defaults.headers['Authorization'] =
								'JWT ' + response.data.access;
							originalRequest.headers['Authorization'] =
								'JWT ' + response.data.access;
							console.log('Access token refreshed');
							return API(originalRequest);
						})
						.catch((err) => {
							console.log(err);
						});
				} else {
					console.log(
						'Refresh token is expired',
						tokenParts.exp,
						now
					);
					window.location.href = '/login/';
				}
			} else {
				console.log('Refresh token not available.');
				window.location.href = '/login/';
			}
		}
		console.log('Iam here');
		return Promise.reject(error);
	}
);

export default API;
