import React, { Component, useEffect } from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text, Circle, Group, Rect } from 'react-konva';
import { MenuProps, useStyles, options } from './utils';

import { useTheme } from '@mui/material/styles';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import API from '../api';
import { useParams } from 'react-router';
import { width } from '@mui/system';
import { stages } from 'konva/lib/Stage';

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 600;

const getScale = (src, dst) => {
	return Math.min(dst.width / src.width, dst.height / src.height);
};

const Sensors = () => {
	const { id } = useParams();
	const [sensors, setSensors] = React.useState([]);
	const [room, setRoom] = React.useState('');
	const [data, setData] = React.useState({ rooms: [], sensors: [] });
	const [stageSensors, setStageSensors] = React.useState([]);
	const [selectedSensor, setSelectedSensor] = React.useState('');
	const [scaleDimensions, setScaledDimensions] = React.useState({
		ratio: 1,
		width: 800,
		height: 600,
	});
	const [action, setAction] = React.useState('Add');

	useEffect(() => {
		API.get(`/visualization/${id}/sensors/`)
			.then((res) => {
				console.log(sensors);
				setData((data) => ({ ...data, sensors: res.data }));
			})
			.catch((err) => {
				console.log(err);
			});

		API.get(`/visualization/${id}/room/`)
			.then((res) => {
				setData((data) => ({ ...data, rooms: res.data }));
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		const tmp = sensors.map((sensor, index) => {
			if (sensor.room === null || sensor.room !== room.id) {
				return {
					...sensor,
					room: room.id,
					x: 20 + index * 20,
					y: 40,
					isDragging: false,
				};
			} else {
				return {
					...sensor,
					x: sensor.x * scaleDimensions.ratio,
					y: sensor.y * scaleDimensions.ratio,
					isDragging: false,
					alias: 'alias' in sensor ? sensor.alias : 'example',
				};
			}
		});
		//console.log('stage sensors', tmp);
		setStageSensors(tmp);
	}, [sensors, room, scaleDimensions]);

	const handleDragStart = (e) => {
		const id = e.target.id();

		setStageSensors(
			stageSensors.map((sensor) => {
				return { ...sensor, isDragging: sensor.id.toString() === id };
			})
		);
	};

	const handleDragEnd = (e) => {
		const id = e.target.id();
		//if (e.target.x() > 10 && e.target.y() > 10 && )
		setStageSensors((stageSensors) => {
			return stageSensors.map((sensor) => {
				if (id === sensor.id.toString()) {
					return {
						...sensor,
						x: e.target.x() - 10,
						y: e.target.y() - 10,
						isDragging: false,
					};
				} else {
					return sensor;
				}
			});
		});
	};

	const handleSensorChange = (event) => {
		if (event.target.value.length < sensors.length) {
			var current = new Set(event.target.value);
			const filtered = sensors.filter((x) => !current.has(x));
			if (filtered.length > 0 && filtered[0].id === selectedSensor.id)
				setSelectedSensor('');
		}

		setSensors(event.target.value);
	};

	const handleRoomChange = (event) => {
		const room = event.target.value;

		const ratio = getScale(
			{ width: room.width, height: room.height },
			{ width: SCENE_WIDTH, height: SCENE_HEIGHT }
		);

		setScaledDimensions({
			ratio: ratio,
			width: event.target.value.width * ratio,
			height: event.target.value.height * ratio,
		});
		// console.log(scaleDimensions);
		setSensors([]);
		setSelectedSensor('');
		setRoom(event.target.value);
	};

	const handleSubmit = () => {
		console.log('stage sensors', stageSensors);

		const data = stageSensors.map((sensor) => {
			return {
				id: sensor.id,
				room: action === 'Add' ? room.id : null,
				alias: sensor.alias,
				x: Math.round(sensor.x / scaleDimensions.ratio),
				y: Math.round(sensor.y / scaleDimensions.ratio),
			};
		});

		console.log(data);

		API.put(`/visualization/${id}/sensors/`, data)
			.then((res) => console.log(res))
			.catch((err) => console.log(err));
	};

	const handleSelectedSensorChange = (event) => {
		setSelectedSensor(event.target.value);
	};

	const handleSelectedSensorTextChange = (event) => {
		if (event.target.name === 'sensor-alias') {
			setStageSensors((stageSensors) => {
				return stageSensors.map((sensor) => {
					if (sensor.id === selectedSensor.id) {
						return {
							...sensor,
							alias: event.target.value,
						};
					} else {
						return sensor;
					}
				});
			});
		}

		if (
			event.target.value
				.toString()
				.match(/^[+-]?d*.?d+(?:[Ee][+-]?d+)?$/) !== null
		)
			return;

		let val = parseFloat(event.target.value);
		if (isNaN(val)) return;
		console.log(event.target.value);
		if (event.target.name === 'sensor-width') {
			setStageSensors((stageSensors) => {
				return stageSensors.map((sensor) => {
					if (sensor.id === selectedSensor.id) {
						return {
							...sensor,
							x: val * scaleDimensions.ratio,
						};
					} else {
						return sensor;
					}
				});
			});
		}
		if (event.target.name === 'sensor-height') {
			setStageSensors((stageSensors) => {
				return stageSensors.map((sensor) => {
					if (sensor.id === selectedSensor.id) {
						return {
							...sensor,
							y: val * scaleDimensions.ratio,
						};
					} else {
						return sensor;
					}
				});
			});
		}
	};

	return (
		<Stack direction='column' justifyContent='center' alignItems='center'>
			<Stack
				direction='row'
				justifyContent='center'
				alignItems='center'
				spacing={2}
				padding={2}
			>
				<FormControl sx={{ m: 1, width: 300 }}>
					<InputLabel>Room</InputLabel>
					<Select
						value={room}
						label='Room'
						onChange={handleRoomChange}
						MenuProps={MenuProps}
					>
						{data.rooms.map((room) => (
							<MenuItem
								key={`Room ${room.id.toString()}`}
								value={room}
							>
								{room.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl sx={{ m: 1, width: 300 }}>
					<InputLabel>Sensor</InputLabel>
					<Select
						multiple
						value={sensors}
						onChange={handleSensorChange}
						renderValue={(selected) =>
							selected.map((elem) => elem.name).join(', ')
						}
						input={<OutlinedInput label='Name' />}
						MenuProps={MenuProps}
					>
						{data.sensors.map((sensor) => (
							<MenuItem
								key={`Sensor ${sensor.id.toString()}`}
								value={sensor}
							>
								{sensor.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Stack>

			{room ? (
				<Stage
					width={scaleDimensions.width + 20}
					height={scaleDimensions.height + 20}
				>
					<Layer>
						<Rect
							key='key'
							x={10}
							y={10}
							width={scaleDimensions.width}
							height={scaleDimensions.height}
							stroke='black'
						/>

						{stageSensors.map((sensor, index) => (
							<Group key={`Group ${index}`}>
								<Text
									key={`Text ${sensor.id.toString()}`}
									id={sensor.id.toString()}
									x={sensor.x + 10}
									y={sensor.y + 10}
									width={100}
									offsetX={50}
									offsetY={-10}
									text={`${sensor.name} ${
										sensor.alias === null
											? ''
											: sensor.alias
									} x: ${Math.floor(
										sensor.x / scaleDimensions.ratio
									)} y: ${Math.floor(
										sensor.y / scaleDimensions.ratio
									)}`}
									align='center'
								/>
								<Circle
									id={sensor.id.toString()}
									key={`Circle ${sensor.id.toString()}`}
									x={sensor.x + 10}
									y={sensor.y + 10}
									radius={10}
									fill='#89b717'
									opacity={0.8}
									draggable
									shadowColor='black'
									shadowBlur={10}
									shadowOpacity={0.6}
									shadowOffsetX={sensor.isDragging ? 10 : 5}
									shadowOffsetY={sensor.isDragging ? 10 : 5}
									scaleX={sensor.isDragging ? 1.2 : 1}
									scaleY={sensor.isDragging ? 1.2 : 1}
									onDragStart={handleDragStart}
									onDragEnd={handleDragEnd}
								/>
								{sensor.isDragging ? (
									<Circle
										id={sensor.id.toString()}
										key={`DragCircle ${sensor.id.toString()}`}
										x={sensor.x + 10}
										y={sensor.y + 10}
										radius={10}
										fill='#19c797'
										opacity={0.8}
									/>
								) : null}
							</Group>
						))}
					</Layer>
				</Stage>
			) : (
				'No room selected'
			)}

			{room && stageSensors && sensors.length > 0 ? (
				<Stack
					direction='row'
					justifyContent='center'
					alignItems='center'
					spacing={2}
					padding={2}
				>
					<FormControl sx={{ width: 300 }}>
						<InputLabel>Sensor</InputLabel>
						<Select
							MenuProps={MenuProps}
							value={selectedSensor}
							label='Room'
							onChange={handleSelectedSensorChange}
						>
							{sensors.map((sensor) => {
								return (
									<MenuItem
										key={`EditSelect ${sensor.id}`}
										value={sensor || ''}
									>
										{sensor.name}
									</MenuItem>
								);
							})}
						</Select>
					</FormControl>

					<TextField
						label='Width'
						name='sensor-width'
						variant='outlined'
						autoFocus
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									cm
								</InputAdornment>
							),
						}}
						value={
							stageSensors.length > 0 &&
							selectedSensor &&
							stageSensors !== undefined
								? Math.round(
										stageSensors.find(
											(sensor) =>
												sensor.id === selectedSensor.id
										).x / scaleDimensions.ratio
								  )
								: 'No sensor selected' || ''
						}
						onChange={handleSelectedSensorTextChange}
					/>

					<TextField
						name='sensor-height'
						label='Height'
						variant='outlined'
						autoFocus
						value={
							stageSensors.length > 0 &&
							selectedSensor &&
							stageSensors !== undefined
								? Math.round(
										stageSensors.find(
											(sensor) =>
												sensor.id === selectedSensor.id
										).y / scaleDimensions.ratio
								  )
								: 'No sensor selected' || ''
						}
						onChange={handleSelectedSensorTextChange}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									cm
								</InputAdornment>
							),
						}}
					/>
					<TextField
						name='sensor-alias'
						label='Alias'
						variant='outlined'
						autoFocus
						onChange={handleSelectedSensorTextChange}
						value={
							(stageSensors.length > 0 &&
							selectedSensor &&
							stageSensors !== undefined
								? stageSensors.find(
										(sensor) =>
											sensor.id === selectedSensor.id
								  ).alias
								: 'No sensor selected') || ''
						}
					/>
				</Stack>
			) : (
				''
			)}

			{room ? (
				<Box>
					<RadioGroup
						aria-labelledby='demo-controlled-radio-buttons-group'
						name='controlled-radio-buttons-group'
						value={action}
						onChange={(event) => {
							setAction(event.target.value);
						}}
					>
						<FormControlLabel
							value='Add'
							control={<Radio />}
							label='Add'
						/>
						<FormControlLabel
							value='Remove'
							control={<Radio />}
							label='Remove'
						/>
					</RadioGroup>
					<Button variant='contained' onClick={handleSubmit}>
						Submit current sensor positions
					</Button>
				</Box>
			) : (
				''
			)}
		</Stack>
	);
};

export default Sensors;
