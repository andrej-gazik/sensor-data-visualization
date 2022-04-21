import React, { useEffect } from 'react';
import TextField from '@mui/material/TextField';
import StaticDateRangePicker from '@mui/lab/StaticDateRangePicker';
import DateRangePicker, { DateRange } from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@date-io/date-fns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import { Grid, InputAdornment, ListItem } from '@mui/material';
import Typography from '@material-ui/core/Typography';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import { Paper } from '@material-ui/core';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLefttIcon from '@mui/icons-material/ChevronLeft';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import API from '../api';
import { useParams } from 'react-router';
import * as krigging from '../misc/krigging';
import Plot from 'react-plotly.js';
import idw from '../misc/InverseDistanceWeighting';

const Visualize = (props) => {
	const { id } = useParams();
	const [value, setValue] = React.useState([null, null]);
	const [room, setRoom] = React.useState('');
	const [interpolationInterval, setInterpolationInterval] =
		React.useState('');
	const [aggregate, setAggregate] = React.useState('');
	const [loading, setLoading] = React.useState(true);
	const [sensorPosition, setSensorPosition] = React.useState([]);
	const [slider, setSliderPosition] = React.useState(0);
	const [selected, setSelected] = React.useState(null);
	const [data, setData] = React.useState({
		rooms: [],
		sensors: [],
		sensorData: [],
		interpolatedData: [],
		graphTraces: [],
	});
	const [limits, setLimits] = React.useState({
		min: 0,
		max: 4.5,
		isMaxEnabled: false,
		isMinEnabled: false,
		isSensorEnabled: true,
		isKrigging: true,
	});

	const handleInterpolationChange = (event, newSetInterpolationInterval) => {
		setInterpolationInterval(newSetInterpolationInterval);
	};

	const handleAggregateChange = (event, newSetAggregateInterval) => {
		setAggregate(newSetAggregateInterval);
	};

	const handleRoomChange = (event) => {
		setRoom(event.target.value);
	};

	useEffect(() => {
		API.get(`/visualization/${id}/sensors/`)
			.then((res) => {
				console.log(res);
				setData((data) => ({ ...data, sensors: res.data }));
				console.log('sensors fetched');
			})
			.catch((err) => {
				console.log(err);
			});

		API.get(`/visualization/${id}/room/`)
			.then((res) => {
				console.log(res);
				setData((data) => ({ ...data, rooms: res.data }));
				console.log('room fetched');
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => interpolate(data), [slider]);

	const handleFetch = () => {
		// add checks
		//if (!isEmpty(interpolationInterval) && ! isEmpty(aggregate))
		//TODO: Change
		const req = {
			//ltd: value[0].toISOString(),
			//gtd: value[1].toISOString(),
			ltd: '2017-04-17T14:19:26',
			gtd: '2021-04-17T14:19:26',
			aggregate: aggregate,
			interval: interpolationInterval,
		};

		API.post(`/visualization/${id}/data/`, req)
			.then((res) => {
				console.log(res);
				setData((data) => ({ ...data, sensorData: res.data }));
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const interpolate = (data) => {
		var x = [];
		var y = [];
		var val = [];
		var names = [];
		var sensors = [];

		if (room === '') {
			console.log('no room selected');
			return null;
		}

		// Find sensors corresponding to room
		data.sensors.map((sensor) => {
			if (sensor.room === room.id) {
				sensors.push(sensor);
			}
		});

		// Find sensors that are in room and in measured data
		data.sensorData[slider][Object.keys(data.sensorData[slider])].map(
			(sensor) => {
				//console.log(sensor, sensors);
				sensors.forEach((parsedSensor) => {
					if (parsedSensor.name === sensor[0]) {
						console.log(parsedSensor);
						x.push(parsedSensor.x);
						y.push(parsedSensor.y);
						val.push(sensor[1]);
						names.push(sensor[0].toString());
					}
				});
			}
		);

		//console.log(x, y, val);
		// Predict variogram
		/*
		x = [60, 300, 180];
		y = [90, 90, 90];
		val = [1, 3, 5];
		names = ['test1', 'test2', 'test3'];
		*/
		const variogram = krigging.train(val, x, y, 'exponential', 0, 100);

		// Predict room temperatures
		var minRegions = [];
		var maxRegions = [];
		var mainHeatmap = [];
		console.log(room);
		for (let i = 0; i < room.height; i++) {
			let tmpMin = [];
			let tmpMax = [];
			let tmpArr = [];

			for (let j = 0; j < room.width; j++) {
				var predicted = 0;
				if (limits.isKrigging) {
					predicted = krigging
						.predict(j, i, variogram)
						.toPrecision(3);
				} else {
					predicted = idw(j, i, x, y, val, 2).toPrecision(3);
				}

				tmpArr.push(predicted);

				if (limits.isMaxEnabled) {
					if (predicted >= limits.max) {
						tmpMax.push(predicted);
					} else {
						tmpMax.push(null);
					}
				}

				if (limits.isMinEnabled) {
					if (predicted <= limits.min) {
						tmpMin.push(predicted);
					} else {
						tmpMin.push(null);
					}
				}
			}
			mainHeatmap.push(tmpArr);
			minRegions.push(tmpMin);
			maxRegions.push(tmpMax);
		}

		var graphTraces = [];
		console.log(mainHeatmap);
		graphTraces.push({
			z: mainHeatmap,
			type: 'heatmap',
			colorscale: 'Jet',
		});

		if (limits.isMinEnabled) {
			graphTraces.push({
				z: minRegions,
				type: 'heatmap',
				showscale: false,
				hoverinfo: 'skip',
				colorscale: [
					[0, 'rgba(255, 0, 0, 0.6)'],
					[1, 'rgba(255, 0, 0, 0.6)'],
				],
			});
		}

		if (limits.isMaxEnabled) {
			graphTraces.push({
				z: maxRegions,
				type: 'heatmap',
				showscale: false,
				hoverinfo: 'skip',
				colorscale: [
					[0, 'rgba(0, 0, 255, 0.6)'],
					[1, 'rgba(0, 0, 255, 0.6)'],
				],
			});
		}

		if (limits.isSensorEnabled) {
			graphTraces.push({
				x: x,
				y: y,
				text: names,
				mode: 'markers+text',
				type: 'scatter',
				hoverinfo: 'skip',
				textposition: 'bottom center',
				marker: { size: 12, color: 'rgb(128, 0, 128)' },
				color: 'green',
			});
		}

		//console.log(predicted);
		setData((data) => ({
			...data,
			tracesData: graphTraces,
		}));
		console.log(graphTraces);
	};

	return (
		<Stack direction='column'>
			<Grid
				container
				justifyContent='center'
				direction='row'
				alignItems='center'
				style={{ border: '1px solid grey' }}
			>
				<Stack
					direction='column'
					justifyContent='space-evenly'
					alignItems='center'
					spacing={2}
					sx={{ m: 2 }}
				>
					<Typography variant='h6' component='h6'>
						Resampling interval
					</Typography>
					<ToggleButtonGroup
						color='primary'
						value={interpolationInterval}
						exclusive
						onChange={handleInterpolationChange}
					>
						<ToggleButton value='hour'>Hourly</ToggleButton>
						<ToggleButton value='day'>Dialy</ToggleButton>
						<ToggleButton value='year'>Weekly</ToggleButton>
						<ToggleButton value='month'>Monthly</ToggleButton>
					</ToggleButtonGroup>
					<Typography variant='h6' component='h6'>
						Aggregate function over data
					</Typography>
					<ToggleButtonGroup
						color='secondary'
						value={aggregate}
						exclusive
						onChange={handleAggregateChange}
					>
						<ToggleButton value='min'>Min</ToggleButton>
						<ToggleButton value='max'>Max</ToggleButton>
						<ToggleButton value='avg'>Average</ToggleButton>
						<ToggleButton value='none'>First</ToggleButton>
					</ToggleButtonGroup>
				</Stack>

				<Stack
					direction='column'
					justifyContent='space-evenly'
					alignItems='center'
					sx={{ flexGrow: 1 }}
				>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DateRangePicker
							startText='Visualization interval start'
							endText='Visualization interval end'
							value={value}
							onChange={(newValue) => {
								setValue(newValue);
							}}
							renderInput={(startProps, endProps) => (
								<React.Fragment>
									<TextField {...startProps} />
									<Box> to </Box>
									<TextField {...endProps} />
								</React.Fragment>
							)}
						/>
					</LocalizationProvider>
					<FormControl sx={{ m: 1, width: '300px' }}>
						<InputLabel>Room</InputLabel>
						<Select
							value={room}
							label='Room'
							onChange={handleRoomChange}
						>
							{data.rooms.map((o) => (
								<MenuItem
									key={o.id}
									value={o}
								>{`id: ${o.id}, ${o.name}`}</MenuItem>
							))}
						</Select>
					</FormControl>

					<Button variant='contained' onClick={handleFetch}>
						Fetch data
					</Button>
				</Stack>
			</Grid>

			<Grid
				container
				direction='column'
				style={{ border: '1px solid grey' }}
			>
				<Typography variant='h6' component='h2'>
					Visualization date
				</Typography>
				<Stack
					direction='row'
					justifyContent='center'
					alignItems='center'
				>
					<IconButton aria-label='delete' size='large'>
						<ChevronLefttIcon fontSize='inherit' />
					</IconButton>

					<Slider
						value={slider}
						step={1}
						min={0}
						max={data.sensorData.length - 1}
						onChangeCommitted={(_, newValue) =>
							setSliderPosition(newValue)
						}
					/>

					<IconButton
						aria-label='delete'
						size='large'
						onClick={() => {}}
					>
						<ChevronRightIcon fontSize='inherit' />
					</IconButton>
				</Stack>
			</Grid>
			{/*
			<p>
				{data.sensorData.length
					? Object.keys(data.sensorData[slider])
					: 'None'}
			</p>
			data.sensorData.length
				? data.sensorData[slider][
						Object.keys(data.sensorData[slider])
				  ].map((key) => console.log(key))
				: 'None'*/}

			<Button variant='contained' onClick={() => interpolate(data)}>
				Interpolate
			</Button>
			<Grid
				container
				direction='column'
				justifyContent='center'
				alignItems='center'
				padding={2}
				style={{ border: '1px solid grey' }}
			>
				{/* Plotly graph */}

				<Plot
					data={data.tracesData}
					layout={{
						width: 860,
						height: 640,
						title: data.sensorData.length
							? Object.keys(data.sensorData[slider]).toString()
							: 'No data available for this plot',
					}}
				/>
				<Stack
					direction='row'
					justifyContent='center'
					alignItems='center'
					spacing={2}
					padding={2}
				>
					<FormControlLabel
						sx={{
							display: 'block',
						}}
						control={
							<Switch
								checked={limits.isMaxEnabled}
								onChange={() =>
									setLimits((limits) => ({
										...limits,
										isMaxEnabled: !limits.isMaxEnabled,
									}))
								}
								name='loading'
								color='primary'
							/>
						}
						label='Show max on graph'
					/>

					<FormControlLabel
						sx={{
							display: 'block',
						}}
						control={
							<Switch
								checked={limits.isMinEnabled}
								onChange={() =>
									setLimits((limits) => ({
										...limits,
										isMinEnabled: !limits.isMinEnabled,
									}))
								}
								name='loading'
								color='primary'
							/>
						}
						label='Show min on graph'
					/>

					<FormControlLabel
						control={
							<Switch
								checked={limits.isSensorEnabled}
								onChange={() =>
									setLimits((limits) => ({
										...limits,
										isSensorEnabled:
											!limits.isSensorEnabled,
									}))
								}
								name='loading'
								color='primary'
							/>
						}
						label='Show sensors on graph'
					/>

					<FormControlLabel
						control={
							<Switch
								checked={limits.isKrigging}
								onChange={() =>
									setLimits((limits) => ({
										...limits,
										isKrigging: !limits.isKrigging,
									}))
								}
								name='loading'
								color='primary'
							/>
						}
						label='IDW / Krigging'
					/>
				</Stack>
			</Grid>
		</Stack>
	);
};

export default Visualize;
