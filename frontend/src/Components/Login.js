import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useForm } from 'react-hook-form';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { SnackbarProvider } from 'notistack';

const theme = createTheme();

const Login = () => {
	const navigate = useNavigate();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const onSubmit = (data) => {
		const req = {
			username: data.username,
			password: data.password,
		};
		console.log(req);

		API.post('/auth/token/obtain/', req)
			.then((res) => {
				localStorage.setItem('access_token', res.data.access);
				localStorage.setItem('refresh_token', res.data.refresh);

				API.defaults.headers['Authorization'] =
					'JWT ' + localStorage.getItem('access_token');

				navigate('/', { replace: true });
			})
			.catch((err) => {
				console.log('login', err.response.data.detail);
				enqueueSnackbar(err.response.data.detail, { variant: 'error' });
			});
	};

	return (
		<ThemeProvider theme={theme}>
			<Container component='main' maxWidth='xs'>
				<CssBaseline />
				<Box
					sx={{
						marginTop: 8,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component='h1' variant='h5'>
						Sensor Data Visualization
					</Typography>
					<Typography component='h1' variant='h5'>
						Sign in
					</Typography>
					<Box
						component='form'
						sx={{ mt: 1 }}
						onSubmit={handleSubmit(onSubmit)}
					>
						<TextField
							margin='normal'
							fullWidth
							id='username'
							required
							label='Username'
							name='username'
							autoComplete='username'
							autoFocus
							{...register('username', {
								required: 'Required',
							})}
							error={!!errors?.width}
							helperText={
								errors?.width ? errors.width.message : null
							}
						/>
						<TextField
							margin='normal'
							fullWidth
							required
							name='password'
							label='Password'
							type='password'
							id='password'
							autoComplete='current-password'
							{...register('password', {
								required: 'Required',
							})}
						/>

						<Button
							type='submit'
							fullWidth
							variant='contained'
							sx={{ mt: 3, mb: 2 }}
						>
							Sign In
						</Button>
					</Box>
				</Box>
			</Container>
		</ThemeProvider>
	);
};

export default Login;
