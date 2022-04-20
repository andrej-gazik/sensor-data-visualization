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
import API from '../api';
import { useParams } from 'react-router';
import { width } from '@mui/system';

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
	const [selectedSensor, setSelectedSensor] = React.useState({
		x: 'no sensor selected',
		y: 'no sensor selected',
	});
	const [scaleDimensions, setScaledDimensions] = React.useState({
		ratio: 1,
		width: 800,
		height: 600,
	});

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
				};
			}
		});
		console.log(tmp);
		setStageSensors(tmp);
	}, [sensors, room, scaleDimensions]);

	const handleDragStart = (e) => {
		const id = e.target.id();
		/*
		setStars(
			stars.map((star) => {
				return {
					...star,
					isDragging: star.id === id,
				};
			})
		);
		*/
	};

	const handleDragEnd = (e) => {
		const id = e.target.id();
		/*
		setStars((state) => {
			const list = stars.map((star) => {
				if (id === star.id) {
					return {
						id: star.id,
						x: e.target.x(),
						y: e.target.y(),
						isDragging: false,
					};
				} else {
					return star;
				}
			});
			return list;
		});
		*/
	};

	const handleSensorChange = (event) => {
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
		console.log(scaleDimensions);
		setSensors([]);
		setRoom(event.target.value);
	};

	const handleSubmit = () => {};

	const handleSelectedSensorChange = (event) => {
		setSelectedSensor(event.target.value);
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
							<MenuItem value={room}>{room.name}</MenuItem>
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
					>
						{data.sensors.map((sensor) => (
							<MenuItem key={sensor.id} value={sensor}>
								{sensor.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Stack>

			{room ? (
				<Stage
					width={scaleDimensions.width}
					height={scaleDimensions.height}
				>
					<Layer>
						<Rect
							key='key'
							x={10}
							y={10}
							width={scaleDimensions.width - 20}
							height={scaleDimensions.height - 20}
							stroke='black'
						/>

						{stageSensors.map((sensor) => (
							<Group
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
							>
								<Text
									id={sensor.id.toString()}
									x={sensor.x}
									y={sensor.y}
									offsetX={40}
									offsetY={-10}
									text={`${sensor.id} x: ${Math.floor(
										sensor.x / scaleDimensions.ratio
									)} y: ${Math.floor(
										sensor.y / scaleDimensions.ratio
									)}`}
									draggable
									align='center'
								/>
								<Circle
									id={sensor.id.toString()}
									x={sensor.x}
									y={sensor.y}
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
								/>
							</Group>
						))}
					</Layer>
				</Stage>
			) : (
				'No room selected'
			)}

			{room ? (
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
							value={selectedSensor}
							label='Room'
							onChange={handleSelectedSensorChange}
						>
							{stageSensors.map((sensor) => {
								return (
									<MenuItem value={sensor}>
										{sensor.name}
									</MenuItem>
								);
							})}
						</Select>
					</FormControl>

					<TextField
						label='Width'
						variant='outlined'
						autoFocus
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									cm
								</InputAdornment>
							),
						}}
						value={selectedSensor.x}
					/>
					<TextField
						label='Height'
						variant='outlined'
						autoFocus
						value={selectedSensor.y}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									cm
								</InputAdornment>
							),
						}}
					/>
				</Stack>
			) : (
				''
			)}

			{room ? (
				<Button variant='contained' onClick={handleSubmit}>
					Submit current sensor positions
				</Button>
			) : (
				''
			)}
		</Stack>
	);
};

export default Sensors;
