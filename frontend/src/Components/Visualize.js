import React, { useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import DateRangePicker, { DateRange } from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@date-io/date-fns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import { Grid } from '@mui/material';
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
let colormap = require('colormap');

const COLOR_SCALE_LENGTH = 100;
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

const Visualize = (props) => {
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
	const [indicatorIndex, setIndcatorIndex] = React.useState({
		min: null,
		max: null,
		viewIndicator: false,
	});
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
		console.log('width', vizBox.current.offsetWidth);
	}, [vizBox.current]);

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
	}, []);

	// On slider index change data is interpolated
	useEffect(() => interpolate(data), [slider]);

	const handleFetch = () => {
		// add checks
		//if (!isEmpty(interpolationInterval) && ! isEmpty(aggregate))
		//TODO: Change
		const req = {
			//ltd: value[0].toISOString(),
			//gtd: value[1].toISOString(),
			ltd: '2021-01-12T14:19:26',
			gtd: '2021-04-17T14:19:26',
			aggregate: aggregate,
			interval: interpolationInterval,
		};

		API.post(`/visualization/${id}/data/`, req)
			.then((res) => {
				console.log(res);
				setData((data) => ({
					...data,
					sensorData: res.data.values,
					sensorDataMin: res.data.min_val,
					sensorDataMax: res.data.max_val,
				}));

				// Scale colors
				const min = res.data.min_val;
				const max = res.data.max_val;
				const step = (max - min) / COLOR_SCALE_LENGTH;
				let colors = colormap({
					colormap: 'jet',
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
				console.log(err);
			});
	};

	const interpolate = (data) => {
		console.log('room', room);
		console.log('sensors', data.sensors);

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
						//console.log(parsedSensor);
						x.push(parsedSensor.x);
						y.push(parsedSensor.y);
						val.push(sensor[1]);
						names.push(sensor[0].toString());
					}
				});
			}
		);

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
					predicted = krigging.predict(j, i, variogram).toFixed(3);
				} else {
					predicted = idw(j, i, x, y, val, 2);
					predicted = predicted.toFixed(3);
				}

				if (predicted < min) {
					min = predicted;
				}

				if (predicted > max) {
					max = predicted;
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

		// Colormap filter
		console.log('minmax', min, max);
		var indexes = [];

		var scale = colorScale.filter((item, index) => {
			if (item[1] >= min && item[1] <= max) {
				indexes.push(index);
				return item;
			}
		});

		setIndcatorIndex({
			min: indexes.at(0),
			max: indexes.at(-1),
			viewIndicator: true,
		});
		console.log('full', colorScale);

		var finalScale = [];

		console.log('filtered', scale);

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
		<Box
			display='flex'
			allignItems='center'
			justifyContent='center'
			sx={{
				flexGrow: 1,
				height: '100%',
			}}
		>
			<Box
				ref={vizBox}
				display='flex'
				alignItems='center'
				justifyContent='center'
				flexDirection='column'
				flexGrow={1}
			>
				<Typography variant='h6' component='h2'>
					Visualization date
				</Typography>
				<Stack
					direction='row'
					justifyContent='center'
					alignItems='center'
					flexGrow={1}
					sx={{ m: 1, width: 1 }}
				>
					<IconButton aria-label='delete' size='large'>
						<ChevronLefttIcon fontSize='inherit' />
					</IconButton>

					<Slider
						flexGrow={1}
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
						title: data.sensorData.length
							? Object.keys(data.sensorData[slider]).toString()
							: 'No data available for this plot',
					}}
					config={{ displayModeBar: false }}
				/>
				<Stage width={800} height={50}>
					<Layer>
						<Rect
							width={800}
							height={25}
							x={0}
							y={5}
							fillPriority='linear-gradient'
							fillLinearGradientStartPoint={{ x: 0, y: 0 }}
							fillLinearGradientEndPoint={{ x: 800, y: 0 }}
							fillLinearGradientColorStops={
								/*
								colorScale.length > 0
									? console.log(
											colorScale.reduce((acc, cur) => {
												console.log(acc, cur);
												return acc.concat([
													(
														(cur[1] -
															data.sensorDataMin) /
														(data.sensorDataMax -
															data.sensorDataMin)
													).toPrecision(5),
													cur[0],
												]);
											})
									  )
									: []
										*/
								colorScale.flatMap((v) => [
									1 -
										(
											(v[1] - data.sensorDataMin) /
											(data.sensorDataMax -
												data.sensorDataMin)
										).toPrecision(5),
									v[0],
								])
							}
						/>
						<Text x={10} y={35} text={`${data.sensorDataMax}`} />
						<Text x={770} y={35} text={`${data.sensorDataMin}`} />
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
			<Drawer
				variant='permanent'
				anchor='right'
				alignItems='center'
				sx={{
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
					name='sensor-alias'
					label='Max threshold'
					variant='outlined'
					autoFocus
					//onChange={handleSelectedSensorTextChange}
					//value={						}
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
					name='sensor-alias'
					label='Min threshold'
					variant='outlined'
					autoFocus
					//onChange={handleSelectedSensorTextChange}
					//value={						}
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
				<Button
					sx={{ m: 1, width: 'auto' }}
					variant='contained'
					onClick={() => interpolate(data)}
				>
					Interpolate
				</Button>
			</Drawer>
		</Box>
	);
};

export default Visualize;
