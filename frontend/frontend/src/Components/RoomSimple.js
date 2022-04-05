import React from 'react';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

const Room = () => {
	let { id } = useParams();

	const [values, setValues] = React.useState({
		width: null,
		height: null,
	});

	const handleChange = (prop) => (event) => {
		setValues({ ...values, [prop]: event.target.value });
	};

	return (
		<div>
			<FormControl sx={{ m: 1, width: '25ch' }} variant='outlined'>
				<FormHelperText id='outlined-height-helper-text'>
					Room Width
				</FormHelperText>
				<OutlinedInput
					id='outlined-adornment-weight'
					value={values.weight}
					onChange={handleChange('width')}
					endAdornment={
						<InputAdornment position='end'>cm</InputAdornment>
					}
					aria-describedby='outlined-weight-helper-text'
					inputProps={{
						'aria-label': 'weight',
					}}
				/>
				<FormHelperText id='outlined-height-helper-text'>
					Room Height
				</FormHelperText>

				<OutlinedInput
					id='outlined-adornment-height'
					value={values.weight}
					onChange={handleChange('height')}
					endAdornment={
						<InputAdornment position='end'>cm</InputAdornment>
					}
					aria-describedby='outlined-height-helper-text'
					inputProps={{
						'aria-label': 'height',
					}}
				/>
			</FormControl>
			<p>Room with is: {values.width}</p>
			<p>Room heigth is {values.height}</p>
		</div>
	);
};

export default Room;
