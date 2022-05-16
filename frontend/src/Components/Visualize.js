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
import { Stage, Layer, Rect, Text, Group, Label } from 'react-konva';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import { Toolbar } from '@material-ui/core';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
let colormap = require('colormap');

const floatReg = new RegExp(/^[-+]?([0-9]*\.[0-9]+|[0-9]+)$/);
const COLOR_SCALE_LENGTH = 500;
const DEFAULT_COLOR_SCALE = 'jet';
const COLOR_SCALES = [
	'jet',
	'hot',
	'greys',
	'bluered',
	'inferno',
	'magma',
	'plasma',
	'cool',
	'spring',
	'summer',
	'temperature',
];

const Visualize = () => {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const vizBox = useRef(null);
	const { id } = useParams();
	const [value, setValue] = React.useState(['', '']);
	const [room, setRoom] = React.useState('');
	const [interpolationInterval, setInterpolationInterval] =
		React.useState('');
	const [aggregate, setAggregate] = React.useState('');
	const [loading, setLoading] = React.useState(true);
	const [sensorPosition, setSensorPosition] = React.useState([]);
	const [slider, setSliderPosition] = React.useState(0);
	const [selected, setSelected] = React.useState(null);
	const [colorScale, setColorScale] = React.useState([]);
	const [colorScaleSelect, setColorScaleSelect] =
		React.useState(DEFAULT_COLOR_SCALE);
	const [indicatorIndex, setIndcatorIndex] = React.useState({
		min: null,
		max: null,
		viewIndicator: false,
	});
	const [interpolation, setInterpolation] = React.useState({
		render: false,
		message: 'No data to display please fetch data first.',
	});

	const [minText, setMinText] = React.useState('');
	const [maxText, setMaxText] = React.useState('');

	const [data, setData] = React.useState({
		rooms: [],
		sensors: [],
		sensorData: [],
		sensorDataMin: null,
		sensorsDataMax: null,
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

	const [isLoading, setIsLoading] = React.useState(false);

	const [dateInterval, setDateInteval] = React.useState({
		min: null,
		max: null,
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

	const handleScaleChange = (event) => {
		const min = data.sensorDataMin;
		const max = data.sensorDataMax;
		const step = (max - min) / COLOR_SCALE_LENGTH;
		if (min !== null && max !== null) {
			let colors = colormap({
				colormap: event.target.value,
				nshades: COLOR_SCALE_LENGTH,
				format: 'rgb',
				alpha: 1,
			});
			//console.log(colors);
			// Map linear to minmax values
			setColorScale(
				colors.map((color, index) => {
					return [
						`rgb(${color[0]},${color[1]},${color[2]})`,
						max - step * index,
					];
				})
			);
		}
		console.log(event.target.value, min, max);
		setColorScaleSelect(event.target.value);
	};

	const handleBlur = (event) => {
		if (event.target.name === 'min') {
			//console.log('min');
			try {
				if (
					floatReg.test(event.target.value) &&
					event.target.value !== ''
				) {
					//console.log('valid min');
					const min = parseFloat(event.target.value);
					setLimits((limits) => ({ ...limits, min: min }));
					enqueueSnackbar(`Min ${event.target.value} set`, {
						variant: 'success',
					});
				} else {
					enqueueSnackbar('Unable to set min', {
						variant: 'warning',
					});
				}
			} catch {}
		}

		if (event.target.name === 'max') {
			//console.log('max');
			try {
				if (
					floatReg.test(event.target.value) &&
					event.target.value !== ''
				) {
					//console.log('valid min');
					const max = parseFloat(event.target.value);
					setLimits((limits) => ({ ...limits, max: max }));
					enqueueSnackbar(`Max ${event.target.value} set`, {
						variant: 'success',
					});
				} else {
					enqueueSnackbar('Unable to set max', {
						variant: 'warning',
					});
				}
			} catch {}
		}
	};
	// Component did mount
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
					//console.log(res.data.stats.min_date);
					//console.log(res.data.stats.max_date);
					const maxDate = new Date(res.data.stats.max_date);
					const minDate = new Date(res.data.stats.min_date);
					setDateInteval({
						min: minDate,
						max: maxDate,
					});
					setValue([minDate, null]);
				} catch {}
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	// On slider index change data is interpolated
	useEffect(() => interpolate(data), [slider, limits, room, colorScale]);

	const handleFetch = () => {
		// add checks
		//if (!isEmpty(interpolationInterval) && ! isEmpty(aggregate))
		//TODO: Change
		const req = {
			lte: value[0].toISOString(),
			gte: value[1].toISOString(),
			//lte: '2021-01-12T14:19:26',
			//gte: '2021-04-17T14:19:26',
			aggregate: aggregate,
			interval: interpolationInterval,
		};

		if (req.aggregate === '') {
			enqueueSnackbar('Select interval when trying to fetch data', {
				variant: 'warning',
			});
			return;
		}

		if (req.aggregate === '') {
			enqueueSnackbar('Select aggregate when trying to fetch data', {
				variant: 'warning',
			});
			return;
		}

		if (value[0] === null || value[1] === null) {
			enqueueSnackbar('Select date interval when trying to fetch data', {
				variant: 'warning',
			});
			return;
		}

		API.get(`/visualization/${id}/data/`, { params: req })
			.then((res) => {
				enqueueSnackbar('Data fetched', {
					variant: 'success',
				});
				console.log(res);
				setData((data) => ({
					...data,
					sensorData: res.data.values,
					sensorDataMin: res.data.min_val,
					sensorDataMax: res.data.max_val,
				}));

				if (res.data.values.length === 0) {
					setInterpolation({
						render: false,
						message: 'No data for interpolation',
					});
				} else {
					setSliderPosition(0);
				}
				// Scale colors
				const min = res.data.min_val;
				const max = res.data.max_val;
				const step = (max - min) / COLOR_SCALE_LENGTH;
				let colors = colormap({
					colormap: colorScaleSelect,
					nshades: COLOR_SCALE_LENGTH,
					format: 'rgb',
					alpha: 1,
				});
				console.log(colors);
				// Map linear to minmax values
				setColorScale(
					colors.map((color, index) => {
						return [
							`rgb(${color[0]},${color[1]},${color[2]})`,
							max - step * index,
						];
					})
				);
			})
			.catch((err) => {
				enqueueSnackbar('Data successfully interpolated', {
					variant: 'success',
				});
				console.log(err);
			});
	};

	const interpolate = (data) => {
		console.log(data);
		if (data.sensorData.length === 0) {
			setInterpolation({
				render: false,
				message: 'No data for interpolation',
			});
			enqueueSnackbar('Fetch data to visualize');
			return null;
		}

		//console.log('room', room);
		//console.log('sensors', data.sensors);

		var x = [];
		var y = [];
		var val = [];
		var names = [];
		var sensors = [];

		if (room === '') {
			setInterpolation({
				render: false,
				message:
					'Room not selected or no rooms available for this visualization.',
			});
			enqueueSnackbar(
				'Room not selected or no rooms available for this visualization.',
				{
					variant: 'warning',
				}
			);
			return null;
		}

		// Find sensors corresponding to room
		data.sensors.map((sensor) => {
			if (sensor.room === room.id) {
				sensors.push(sensor);
			}
		});

		if (sensors.length < 3) {
			setInterpolation({
				render: false,
				message: 'Room needs to have more than 3 sensors placed',
			});
			enqueueSnackbar('Room needs to have more than 3 sensors placed', {
				variant: 'warning',
			});
			return null;
		}

		if (data.length === 0) {
			setInterpolation({
				render: false,
				message: 'No data for interpolation',
			});
			enqueueSnackbar('No data for interpolation', {
				variant: 'warning',
			});
			return null;
		}

		try {
			data.sensorData[slider][Object.keys(data.sensorData[slider])].map(
				(sensor) => {
					//console.log(sensor, sensors);
					sensors.forEach((parsedSensor) => {
						if (parsedSensor.name === sensor[0]) {
							//console.log(parsedSensor);
							x.push(parsedSensor.x);
							y.push(parsedSensor.y);
							val.push(sensor[1]);
							console.log(parsedSensor);
							if (parsedSensor.alias !== null) {
								names.push(
									sensor[0].toString() +
										' ' +
										parsedSensor.alias
								);
							} else {
								names.push(sensor[0].toString());
							}
						}
					});
				}
			);
		} catch {
			setInterpolation({
				render: false,
				message: 'Unable to parse sensors for current data.',
			});
			enqueueSnackbar('Unable to parse sensors for current data', {
				variant: 'warning',
			});
			return null;
		}
		// Find sensors that are in room and in measured data

		if (x.length < 3) {
			setInterpolation({
				render: false,
				message: 'Not enough data for interpolation',
			});
			enqueueSnackbar('Not enough data for interpolation', {
				variant: 'warning',
			});
			return null;
		}
		const variogram = krigging.train(val, x, y, 'spherical', 0, 100);

		// Predict room temperatures
		var minRegions = [];
		var maxRegions = [];
		var mainHeatmap = [];

		var max = Number.MIN_VALUE;
		var min = Number.MAX_VALUE;

		//console.log(room);
		for (let i = 0; i < room.height; i++) {
			let tmpMin = [];
			let tmpMax = [];
			let tmpArr = [];

			for (let j = 0; j < room.width; j++) {
				var predicted = 0;
				if (limits.isKrigging) {
					predicted = krigging.predict(j, i, variogram);
				} else {
					predicted = idw(j, i, x, y, val, 2);
					predicted = predicted;
				}

				if (predicted < min) {
					min = predicted;
				}

				if (predicted > max) {
					max = predicted;
				}

				tmpArr.push(predicted.toPrecision(3));

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

		// Colormap filter
		console.log('minmax', min, max);
		var indexes = [];

		var scale = colorScale.filter((item, index) => {
			if (item[1] >= min && item[1] <= max) {
				indexes.push(index);
				return item;
			}
		});

		var finalScale = [];

		if (scale.length === 0) {
			var curr = colorScale[0];
			var curr_index = 0;
			var diff = Math.abs(min - curr[1]);
			for (var val = 0; val < colorScale.length; val++) {
				var newdiff = Math.abs(min - colorScale[val][1]);
				if (newdiff < diff) {
					diff = newdiff;
					curr = colorScale[val];
					curr_index = val;
				}
			}
			scale.push(curr);
			setIndcatorIndex({
				min: curr_index,
				max: curr_index,
				viewIndicator: true,
			});

			finalScale.push([0, curr[0]], [1, curr[0]]);
		} else {
			setIndcatorIndex({
				min: indexes.at(0),
				max: indexes.at(-1),
				viewIndicator: true,
			});

			if (scale.length > 0) {
				const len = scale.length;
				for (var i = 0; i < len; i++) {
					//console.log(scale[i]);
					finalScale.push([
						((1 / (len - 1)) * i).toPrecision(5).toString(),
						scale[i][0],
					]);
				}
			} else {
				finalScale = 'Jet';
			}
		}

		console.log('full', colorScale);

		console.log('filtered', scale);

		console.log('scaled scale', finalScale);

		var graphTraces = [];
		//console.log(mainHeatmap);
		graphTraces.push({
			z: mainHeatmap,
			type: 'heatmap',
			colorscale: finalScale,
			//colorscale: 'Jet',
			hovertemplate:
				'<i>°C</i>: <b>%{z:.2f}</b>' +
				'<br><b>X</b>: %{x} <b>Y</b>: %{y}<br>' +
				'<extra></extra>',
			colorbar: { x: 1, len: 0.7 },
		});

		if (limits.isMinEnabled) {
			graphTraces.push({
				z: minRegions,
				type: 'heatmap',
				showscale: false,
				hoverinfo: 'skip',
				colorscale: [
					[0, 'rgba(0, 0, 255, 0.9)'],
					[1, 'rgba(0, 0, 255, 0.9)'],
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
					[0, 'rgba(255, 0, 0, 0.9)'],
					[1, 'rgba(255, 0, 0, 0.9)'],
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
			});
		}

		//console.log(predicted);
		setData((data) => ({
			...data,
			tracesData: graphTraces,
		}));
		console.log(graphTraces);

		setInterpolation({
			render: true,
			message: '',
		});
	};

	return (
		<Box
			display='flex'
			allignItems='center'
			justifyContent='center'
			sx={{
				flexGrow: 1,
			}}
		>
			<Box
				ref={vizBox}
				display='flex'
				alignItems='center'
				justifyContent='center'
				flexDirection='column'
				sx={{ flexGrow: 1 }}
			>
				<Stack
					direction='row'
					justifyContent='space-around'
					alignItems='center'
					sx={{ m: 1, width: 1, flexGrow: 1 }}
				>
					<Typography variant='body2'>
						{data.sensorData.length > 0
							? `Min: ${Object.keys(
									data.sensorData[0]
							  ).toString()}`
							: ''}
					</Typography>
					<Typography variant='body2'>
						{data.sensorData.length > 0 &&
						data.sensorData[slider] !== undefined
							? `${Object.keys(
									data.sensorData[slider]
							  ).toString()}`
							: ''}
					</Typography>
					<Typography variant='body2'>
						{data.sensorData.length > 0 &&
						data.sensorData[slider] !== undefined
							? `Max: ${Object.keys(
									data.sensorData[data.sensorData.length - 1]
							  ).toString()}`
							: ''}
					</Typography>
				</Stack>
				<Stack
					direction='row'
					justifyContent='center'
					alignItems='center'
					sx={{ m: 1, width: 1, flexGrow: 1 }}
				>
					<IconButton aria-label='delete' size='large'>
						<ChevronLefttIcon
							fontSize='inherit'
							onClick={() => {
								if (slider - 1 < 0) {
									setSliderPosition(
										data.sensorData.length - 1
									);
								} else {
									setSliderPosition(slider - 1);
								}
							}}
						/>
					</IconButton>

					<Slider
						sx={{ flexGrow: 1 }}
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
						onClick={() => {
							if (slider + 1 > data.sensorData.length - 1) {
								setSliderPosition(0);
							} else {
								setSliderPosition(slider + 1);
							}
						}}
					>
						<ChevronRightIcon fontSize='inherit' />
					</IconButton>
				</Stack>
				{interpolation.render ? (
					<Box>
						<Plot
							data={data.tracesData}
							layout={{
								width: 800,
								height: 450,
								margin: {
									l: 20,
									r: 0,
									b: 20,
									t: 50,
								},
								xaxis: {
									scaleanchor: 'y',
									fixedrange: true,
									constrain: 'domain',
									showgrid: false,
									zeroline: false,
									showline: false,
									showticklabels: false,
									title: `${room.width}`,
									titlefont: {
										family: 'Arial, sans-serif',
										size: 18,
										color: 'black',
									},
								},
								yaxis: {
									autorange: 'reversed',
									fixedrange: true,
									showgrid: false,
									zeroline: false,
									showline: false,
									showticklabels: false,
									title: `${room.height}`,
									titlefont: {
										family: 'Arial, sans-serif',
										size: 18,
										color: 'black',
									},
								},
								title:
									data.sensorData.length &&
									data.sensorData[slider] !== undefined
										? Object.keys(
												data.sensorData[slider]
										  ).toString()
										: 'No data available for this plot',
							}}
							config={{ displayModeBar: false }}
						/>
						<Stage width={800} height={65}>
							<Layer>
								<Rect
									width={800}
									height={25}
									x={0}
									y={5}
									fillPriority='linear-gradient'
									fillLinearGradientStartPoint={{
										x: 0,
										y: 0,
									}}
									fillLinearGradientEndPoint={{
										x: 800,
										y: 0,
									}}
									fillLinearGradientColorStops={colorScale.flatMap(
										(v) => [
											1 -
												(
													(v[1] -
														data.sensorDataMin) /
													(data.sensorDataMax -
														data.sensorDataMin)
												).toPrecision(5),
											v[0],
										]
									)}
								/>
								<Text
									x={10}
									y={45}
									text={`${data.sensorDataMax}`}
								/>
								<Text
									x={770}
									y={45}
									text={`${data.sensorDataMin}`}
								/>
								{indicatorIndex.viewIndicator ? (
									<Group>
										<Rect
											x={
												(800 / colorScale.length) *
												indicatorIndex.min
											}
											y={5}
											width={
												(800 / colorScale.length) *
												(indicatorIndex.max -
													indicatorIndex.min)
											}
											height={25}
											stroke='black'
											strokeWidth={5}
										/>
										<Text
											x={
												(800 / colorScale.length) *
												indicatorIndex.min
											}
											y={35}
											text={`${colorScale[
												indicatorIndex.min
											][1].toPrecision(3)}`}
											align='center'
										/>

										<Text
											align='right'
											x={
												(800 / colorScale.length) *
													indicatorIndex.max -
												50
											}
											y={35}
											text={`${colorScale[
												indicatorIndex.max
											][1].toPrecision(3)}`}
											width={50}
										/>
									</Group>
								) : null}
							</Layer>
						</Stage>
					</Box>
				) : (
					<p>{interpolation.message}</p>
				)}
			</Box>
			<Drawer
				variant='permanent'
				anchor='right'
				sx={{
					alignItems: 'center',
					width: 330,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: 330,
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
				</ToggleButtonGroup>
				<Typography variant='h6' component='h6'>
					Aggregate function over data
				</Typography>
				<ToggleButtonGroup
					color='secondary'
					value={aggregate}
					exclusive
					onChange={handleAggregateChange}
					sx={{ m: 1, width: 'auto' }}
				>
					<ToggleButton value='min'>Min</ToggleButton>
					<ToggleButton value='max'>Max</ToggleButton>
					<ToggleButton value='avg'>Average</ToggleButton>
					<ToggleButton value='none'>First</ToggleButton>
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
						value={value}
						onChange={(newValue) => {
							setValue(newValue);
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
				<FormControl sx={{ m: 1, width: 'auto' }}>
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
				<Button
					variant='contained'
					onClick={handleFetch}
					sx={{ m: 1, width: 'auto' }}
				>
					Fetch data
				</Button>
				<Divider sx={{ m: 1, width: 'auto' }} />
				<FormControlLabel
					sx={{ m: 1, width: 'auto' }}
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
					label='Show max overlay on graph'
				/>
				<TextField
					sx={{ m: 1, width: 'auto' }}
					name='max'
					label='Max threshold'
					variant='outlined'
					autoFocus
					onBlur={handleBlur}
					value={maxText}
					onChange={(event) => {
						setMaxText(event.target.value);
					}}
					error={!floatReg.test(maxText) && limits.isMaxEnabled}
					disabled={!limits.isMaxEnabled}
				/>

				<FormControlLabel
					sx={{ m: 1, width: 'auto' }}
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
					label='Show min overlay on graph'
				/>
				<TextField
					sx={{ m: 1, width: 'auto' }}
					name='min'
					label='Min threshold'
					variant='outlined'
					autoFocus
					onBlur={handleBlur}
					value={minText}
					onChange={(event) => {
						setMinText(event.target.value);
					}}
					error={!floatReg.test(minText) && limits.isMinEnabled}
					disabled={!limits.isMinEnabled}
				/>
				<FormControlLabel
					sx={{ m: 1, width: 'auto' }}
					control={
						<Switch
							checked={limits.isSensorEnabled}
							onChange={() =>
								setLimits((limits) => ({
									...limits,
									isSensorEnabled: !limits.isSensorEnabled,
								}))
							}
							name='loading'
							color='primary'
						/>
					}
					label='Show sensors on graph'
				/>

				<FormControlLabel
					sx={{ m: 1, width: 'auto' }}
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
				<Divider sx={{ m: 1, width: 'auto' }} />
				<FormControl sx={{ m: 1, width: 'auto' }}>
					<InputLabel>Color Scale</InputLabel>
					<Select
						value={colorScaleSelect}
						label='Room'
						onChange={handleScaleChange}
					>
						{COLOR_SCALES.map((scale) => (
							<MenuItem key={scale} value={scale}>
								{scale}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Drawer>
		</Box>
	);
};

export default Visualize;
