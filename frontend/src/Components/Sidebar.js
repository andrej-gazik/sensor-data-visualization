import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import { Link, NavLink } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Avatar from '@mui/material/Avatar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import API from '../api';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { withStyles, makeStyles } from '@material-ui/core/styles';

function parseJwt(token) {
	var base64Url = token.split('.')[1];
	var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	var jsonPayload = decodeURIComponent(
		atob(base64)
			.split('')
			.map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);

	return JSON.parse(jsonPayload);
}

const useStyles = makeStyles({
	selected: {
		background: '#9da3c4',
		textDecoration: 'none',
		fontWeight: 'bolder',
	},
	none: {
		background: 'white',
		textDecoration: 'none',
	},
});

export default function Sidebar() {
	const classes = useStyles();
	const { id } = useParams();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const [selected, setSelected] = useState('');
	const [open, setOpen] = useState(false);
	const [data, setData] = useState([]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const onSubmit = (data) => {
		console.log(data);
		console.log(API.baseUrl);
		API.post('/visualization/', data)
			.then((res) => {
				console.log(res);
				handleDialogClose();
				enqueueSnackbar('Visualization successfully created', {
					variant: 'success',
				});
			})
			.catch((err) => {
				console.log(err);
				enqueueSnackbar('Visualization creation failed', {
					variant: 'error',
				});
				handleDialogClose();
			});
	};

	const handleChange = (event) => {
		setSelected(event.target.value);
		// console.log(pathname);
		navigate(`/${event.target.value.id}`, { replace: true });
	};

	const handleDialogOpen = () => {
		setOpen(true);
	};

	const handleDialogClose = () => {
		setOpen(false);
	};

	const handleDialogUpload = () => {
		setOpen(false);
	};

	const handleLogOut = () => {};

	useEffect(() => {
		API.get('/visualization/')
			.then((res) => res.data)
			.then((data) => {
				setData(data);
				setSelected(data[0]);
				console.log(data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<Drawer
			display='flex'
			sx={{
				width: 200,
				maxWidth: 200,
				flexShrink: 0,
				textAlign: 'center',
			}}
			variant='permanent'
			anchor='left'
		>
			<Avatar
				sx={{
					ml: 'auto',
					mr: 'auto',
					mt: 1,
					bgcolor: 'secondary.main',
				}}
			>
				<AccountCircleIcon />
			</Avatar>
			<p>{`user id: ${
				parseJwt(localStorage.getItem('access_token'))['user_id']
			}`}</p>
			<Divider />

			<Button
				variant='contained'
				sx={{ m: 1, width: 'auto' }}
				onClick={handleDialogOpen}
			>
				Create new
			</Button>

			<Dialog open={open} onClose={handleDialogClose}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogTitle>Create blank visualization</DialogTitle>
					<DialogContent>
						<DialogContentText>
							For visualization creation please fill visualization
							name and visualization description.
						</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							id='name'
							label='Visualization name'
							type='text'
							fullWidth
							variant='standard'
							{...register('name', { required: 'Required' })}
							error={!!errors?.name}
							helperText={
								errors?.name ? errors.name.message : null
							}
						/>
						<TextField
							autoFocus
							margin='dense'
							id='description'
							label='Visualization description'
							type='text'
							fullWidth
							variant='standard'
							{...register('description', {
								required: 'Required',
							})}
							error={!!errors?.name}
							helperText={
								errors?.name ? errors.name.message : null
							}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleDialogClose}>Cancel</Button>
						<Button type='submit'>Create</Button>
					</DialogActions>
				</form>
			</Dialog>

			<FormControl sx={{ m: 1, width: 200 }}>
				<InputLabel>Visualization</InputLabel>
				<Select
					value={selected}
					label='Visualization'
					onChange={handleChange}
				>
					{data.map((instance) => (
						<MenuItem key={instance.id} value={instance}>
							{`ID: ${instance.id} ${instance.name}`}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Divider />
			{selected ? (
				<List>
					<ListItem
						button
						selected={pathname === `/room/${selected.id}/`}
						key={'Room'}
						component={Link}
						to={`/room/${selected.id}/`}
					>
						<ListItemText primary={'Room'} />
					</ListItem>

					<ListItem
						button
						selected={pathname === `/upload/${selected.id}/`}
						key={'Upload'}
						component={Link}
						to={`/upload/${selected.id}/`}
					>
						<ListItemText primary={'Upload'} />
					</ListItem>
					<ListItem
						button
						selected={pathname === `/sensors/${selected.id}/`}
						key={'Sensors'}
						component={Link}
						to={`/sensors/${selected.id}/`}
					>
						<ListItemText primary={'Sensors'} />
					</ListItem>
					<ListItem
						selected={pathname === `/visualization/${selected.id}/`}
						button
						key={'Visualization'}
						component={Link}
						to={`/visualization/${selected.id}/`}
					>
						<ListItemText primary={'Visualization'} />
					</ListItem>
				</List>
			) : null}
			<Button sx={{ mt: 'auto' }} variant='text' onClick={handleLogOut}>
				Log out
			</Button>
		</Drawer>
	);
}
