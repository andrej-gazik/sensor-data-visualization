import React from 'react';
import TextField from '@mui/material/TextField';
import StaticDateRangePicker from '@mui/lab/StaticDateRangePicker';
import DateRangePicker, { DateRange } from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@date-io/date-fns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import { Grid, ListItem } from '@mui/material';
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

const marks = [
	{
		value: 0,
		label: '0°C',
	},
	{
		value: 20,
		label: '20°C',
	},
	{
		value: 37,
		label: '37°C',
	},
	{
		value: 100,
		label: '100°C',
	},
];

function valuetext(value) {
	return `${value}°C`;
}

const Visualize = (props) => {
	const [value, setValue] = React.useState([null, null]);
	const [room, setRoom] = React.useState(null);
	const [interpolationInterval, setInterpolationInterval] =
		React.useState('web');
	const [aggregate, setAggregate] = React.useState('web');
	const [loading, setLoading] = React.useState(true);

	function handleClick() {
		setLoading(true);
	}

	const handleInterpolationChange = (event, newSetInterpolationInterval) => {
		setInterpolationInterval(newSetInterpolationInterval);
	};

	const handleAggregateChange = (event, newSetAggregateInterval) => {
		setAggregate(newSetAggregateInterval);
	};

	const handleRoomChange = (event) => {
		setRoom(event.target.value);
	};

	return (
		<Stack direction='column'>
			<Grid
				container
				justifyContent='center'
				direction='row'
				alignItems='center'
				fullWidth
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
						<ToggleButton value='average'>Average</ToggleButton>
						<ToggleButton value='first'>First</ToggleButton>
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
							<MenuItem value={1}>Room 1</MenuItem>
							<MenuItem value={2}>Room 2</MenuItem>
							<MenuItem value={3}>Room 3</MenuItem>
						</Select>
					</FormControl>

					<Button variant='contained'>Fetch data</Button>
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
						aria-label='Temperature'
						defaultValue={30}
						getAriaValueText={valuetext}
						valueLabelDisplay='auto'
						step={10}
						marks
						min={10}
						max={110}
					/>

					<IconButton aria-label='delete' size='large'>
						<ChevronRightIcon fontSize='inherit' />
					</IconButton>
				</Stack>
			</Grid>
			<Grid
				container
				direction='column'
				justifyContent='center'
				alignItems='center'
				padding={2}
				style={{ border: '1px solid grey' }}
			>
				<img src='https://i.imgur.com/HNFs32d.png' />

				<FormControlLabel
					sx={{
						display: 'block',
					}}
					control={
						<Switch
							checked={loading}
							onChange={() => setLoading(!loading)}
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
							checked={loading}
							onChange={() => setLoading(!loading)}
							name='loading'
							color='primary'
						/>
					}
					label='Show min on graph'
				/>

				<FormControlLabel
					control={
						<Switch
							checked={loading}
							onChange={() => setLoading(!loading)}
							name='loading'
							color='primary'
						/>
					}
					label='Show sensors on graph'
				/>

				<Slider
					getAriaLabel={() => 'Temperature'}
					orientation='horizontal'
					getAriaValueText={valuetext}
					defaultValue={[20, 37]}
					marks={marks}
				/>
			</Grid>
		</Stack>
	);
};

export default Visualize;
