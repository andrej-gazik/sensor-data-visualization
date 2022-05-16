import React, { useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import DateRangePicker, { DateRange } from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@date-io/date-fns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import Typography from '@material-ui/core/Typography';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import API from '../api';
import { useParams } from 'react-router';
import Plot from 'react-plotly.js';
import { Stage, Layer, Rect, Text, Group, Label } from 'react-konva';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import { Toolbar } from '@material-ui/core';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function Mkt() {
	const { id } = useParams();

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [dateRange, setDateRange] = React.useState(['', '']);
	const [interpolationInterval, setInterpolationInterval] =
		React.useState('');
	const [data, setData] = React.useState({
		rooms: [],
		sensors: [],
		mkt: [],
	});
	const [room, setRoom] = React.useState('');
	const [dateInterval, setDateInterval] = React.useState({
		min: null,
		max: null,
	});
	const [roomSensors, setRoomSensors] = React.useState([]);

	const handleInterpolationChange = (event, newSetInterpolationInterval) => {
		setInterpolationInterval(newSetInterpolationInterval);
	};

	const handleRoomChange = (event) => {
		var sensors = data.sensors.filter(
			(sensor) => sensor.room === event.target.value.id
		);
		console.log(sensors);
		setRoomSensors(sensors);
		setRoom(event.target.value);
	};

	const handleFetch = () => {
		const payload = {
			gte: dateRange[1].toISOString(),
			lte: dateRange[0].toISOString(),
			interval: interpolationInterval,
		};
		console.log(payload);
		if (payload.interval === '') {
			enqueueSnackbar('Select interval when trying to fetch data', {
				variant: 'warning',
			});
			return;
		}

		if (payload.aggregate === '') {
			enqueueSnackbar('Select aggregate when trying to fetch data', {
				variant: 'warning',
			});
			return;
		}

		if (dateRange[0] === null || dateRange[1] === null) {
			enqueueSnackbar('Select date interval when trying to fetch data', {
				variant: 'warning',
			});
			return;
		}

		API.get('/visualization/1/mkt/', { params: payload })
			.then((res) => {
				console.log(res);
				enqueueSnackbar('Data fetched', {
					variant: 'success',
				});
				setData((data) => ({ ...data, mkt: res.data }));
			})
			.catch((err) => {
				console.log(err);
				enqueueSnackbar('Unable to fetch data', {
					variant: 'error',
				});
			});
	};

	useEffect(() => {
		API.get(`/visualization/${id}/sensors/`)
			.then((res) => {
				console.log(res);
				setData((data) => ({ ...data, sensors: res.data }));
				//console.log('sensors fetched');
			})
			.catch((err) => {
				console.log(err);
			});

		API.get(`/visualization/${id}/room/`)
			.then((res) => {
				console.log(res);
				setData((data) => ({ ...data, rooms: res.data }));
				//console.log('room fetched');
			})
			.catch((err) => {
				console.log(err);
			});

		API.get(`/visualization/${id}/`)
			.then((res) => {
				console.log(res);
				try {
					console.log(res.data.stats.min_date);
					console.log(res.data.stats.max_date);
					const maxDate = new Date(res.data.stats.max_date);
					const minDate = new Date(res.data.stats.min_date);
					setDateInterval({
						min: minDate,
						max: maxDate,
					});
					setDateRange([minDate, null]);
				} catch {}
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<Box
			display='flex'
			allignItems='center'
			justifyContent='center'
			sx={{
				flexGrow: 1,
				height: '100%',
			}}
		>
			<Box>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label='simple table'>
						{roomSensors.length > 0 ? (
							<TableHead>
								<TableRow>
									<TableCell>Date</TableCell>
									{roomSensors.map((sensor) => (
										<TableCell align='center'>
											{sensor.name}
										</TableCell>
									))}
								</TableRow>
								<TableRow>
									<TableCell></TableCell>
									{roomSensors.map((sensor) => (
										<TableCell align='center'>
											{sensor.alias}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
						) : (
							<TableHead>
								<TableRow>
									<TableCell>
										No sensors for selected room
									</TableCell>
								</TableRow>
							</TableHead>
						)}

						{data.mkt.length > 0 && roomSensors.length > 0 ? (
							<TableBody>
								{data.mkt.map((obj) => {
									//console.log(obj);
									const key = Object.keys(obj)[0];
									const val = obj[key];
									//console.log('val', val);
									return (
										<TableRow>
											<TableCell>{key}</TableCell>
											{roomSensors.map((sensor) => {
												for (
													var i = 0;
													i < val.length;
													i++
												) {
													const valKey = Object.keys(
														val[i]
													)[0].toString();

													if (
														valKey ===
														sensor.name.toString()
													) {
														console.log('Here');
														return (
															<TableCell>
																{val[i][
																	valKey
																].toPrecision(
																	2
																)}
															</TableCell>
														);
													}
												}
											})}
										</TableRow>
									);
								})}
							</TableBody>
						) : (
							<TableBody></TableBody>
						)}
					</Table>
				</TableContainer>
			</Box>
			<Drawer
				variant='permanent'
				anchor='right'
				sx={{
					alignItems: 'center',
					width: 400,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: 400,
						boxSizing: 'border-box',
					},
				}}
			>
				<Typography variant='h6' component='h6'>
					Resampling interval
				</Typography>
				<ToggleButtonGroup
					color='primary'
					value={interpolationInterval}
					exclusive
					onChange={handleInterpolationChange}
					sx={{ m: 1, width: 'auto' }}
				>
					<ToggleButton value='hour'>Hourly</ToggleButton>
					<ToggleButton value='day'>Dialy</ToggleButton>
					<ToggleButton value='week'>Weekly</ToggleButton>
					<ToggleButton value='month'>Monthly</ToggleButton>
					<ToggleButton value='year'>Yearly</ToggleButton>
				</ToggleButtonGroup>

				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DateRangePicker
						startText='Visualization interval start'
						endText='Visualization interval end'
						minDate={
							dateInterval.min ? dateInterval.min : undefined
						}
						maxDate={
							dateInterval.max ? dateInterval.max : undefined
						}
						value={dateRange}
						onChange={(newValue) => {
							setDateRange(newValue);
						}}
						renderInput={(startProps, endProps) => (
							<Stack direction='column' sx={{ flexGrow: 1 }}>
								<TextField
									{...startProps}
									sx={{ m: 1, width: 'auto' }}
								/>
								<TextField
									{...endProps}
									sx={{ m: 1, width: 'auto' }}
								/>
							</Stack>
						)}
					/>
				</LocalizationProvider>

				<Button
					variant='contained'
					onClick={handleFetch}
					sx={{ m: 1, width: 'auto' }}
				>
					Fetch data
				</Button>
				<Divider sx={{ m: 1, width: 'auto' }} />
				<FormControl sx={{ m: 1, width: 'auto' }}>
					<InputLabel>Room</InputLabel>
					<Select
						value={room}
						label='Room'
						onChange={handleRoomChange}
					>
						{data.rooms.map((o) => (
							<MenuItem key={o.id} value={o}>
								{`id: ${o.id}, ${o.name}`}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Drawer>
		</Box>
	);
}

export default Mkt;
