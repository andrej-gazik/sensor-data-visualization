import React, { Component } from 'react';
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

function generateShapes() {
	return [101, 102, 103, 104, 105].map((element, i) => ({
		id: element.toString(),
		x: Math.random() * 800,
		y: Math.random() * 600,
		isDragging: false,
	}));
}

const INITIAL_STATE = generateShapes();

const names = [101, 102, 103, 104, 105, 106, 107, 108];

const Sensors = () => {
	const [stars, setStars] = React.useState(INITIAL_STATE);
	const [sensors, setSensors] = React.useState([]);
	const [room, setRoom] = React.useState(null);
	const [disabled, setDisabled] = React.useState(false);
	const [selectedSensor, setSelectedSensor] = React.useState({
		x: 'no sensor selected',
		y: 'no sensor selected',
	});

	const handleDragStart = (e) => {
		const id = e.target.id();
		setStars(
			stars.map((star) => {
				return {
					...star,
					isDragging: star.id === id,
				};
			})
		);
	};
	const handleDragEnd = (e) => {
		const id = e.target.id();

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
	};

	const handleSensorChange = (event) => {
		const selected = event.target.value;

		setSensors(selected);
	};

	const handleRoomChange = (event) => {
		setRoom(event.target.value);
	};

	const handleCreateStage = () => {
		setDisabled(true);
		// Add room creation
		// Add sensor creation
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
				<FormControl sx={{ m: 1, width: 300 }} disabled={disabled}>
					<InputLabel>Sensor</InputLabel>
					<Select
						multiple
						value={sensors}
						onChange={handleSensorChange}
						renderValue={(selected) => selected.join(', ')}
						input={<OutlinedInput label='Name' />}
						MenuProps={MenuProps}
					>
						{names.map((name) => (
							<MenuItem key={name} value={name}>
								{name}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl sx={{ m: 1, width: 300 }} disabled={disabled}>
					<InputLabel>Room</InputLabel>
					<Select
						value={room}
						label='Room'
						onChange={handleRoomChange}
						MenuProps={MenuProps}
					>
						<MenuItem value={1}>Room 1</MenuItem>
						<MenuItem value={2}>Room 2</MenuItem>
						<MenuItem value={3}>Room 3</MenuItem>
					</Select>
				</FormControl>
				<Button
					variant='contained'
					onClick={handleCreateStage}
					disabled={disabled}
				>
					Set positioning of sensors in room
				</Button>
			</Stack>

			<Stage width={800} height={600}>
				<Layer>
					<Rect
						x={10}
						y={10}
						width={800 - 20}
						height={600 - 20}
						stroke='black'
					/>

					<Text text='Drag sensors to desired location' />
					{stars.map((star) => (
						<Group
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						>
							<Text
								id={star.id}
								x={star.x}
								y={star.y}
								offsetX={40}
								offsetY={-10}
								text={`${star.id} x: ${Math.floor(
									star.x
								)} y: ${Math.floor(star.y)}`}
								draggable
								align='center'
							/>
							<Circle
								id={star.id}
								x={star.x}
								y={star.y}
								radius={10}
								fill='#89b717'
								opacity={0.8}
								draggable
								shadowColor='black'
								shadowBlur={10}
								shadowOpacity={0.6}
								shadowOffsetX={star.isDragging ? 10 : 5}
								shadowOffsetY={star.isDragging ? 10 : 5}
								scaleX={star.isDragging ? 1.2 : 1}
								scaleY={star.isDragging ? 1.2 : 1}
							/>
						</Group>
					))}
				</Layer>
			</Stage>
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
						{stars.map((star) => {
							return <MenuItem value={star}>{star.id}</MenuItem>;
						})}
					</Select>
				</FormControl>

				<TextField
					id='outlined-basic'
					label='Width'
					variant='outlined'
					autoFocus
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>cm</InputAdornment>
						),
					}}
					value={selectedSensor.x}
				/>
				<TextField
					id='outlined-basic'
					label='Height'
					variant='outlined'
					autoFocus
					value={selectedSensor.y}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>cm</InputAdornment>
						),
					}}
				/>
			</Stack>
			<Button variant='contained' onClick={handleSubmit}>
				Submit all sensor positions
			</Button>
		</Stack>
	);
};

export default Sensors;
