import React from 'react';
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
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function Sidebar() {
	const [id, setId] = React.useState(null);
	const [open, setOpen] = React.useState(false);

	const handleChange = (event) => {
		setId(event.target.value);
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

	return (
		<Drawer
			sx={{
				width: 200,
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					width: 200,
					boxSizing: 'border-box',
				},
			}}
			variant='permanent'
			anchor='left'
		>
			<Button variant='contained' onClick={handleDialogOpen}>
				Create new
			</Button>

			<Dialog open={open} onClose={handleDialogClose}>
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
						type='email'
						fullWidth
						variant='standard'
					/>
					<TextField
						autoFocus
						margin='dense'
						id='desc'
						label='Visualization description'
						type='email'
						fullWidth
						variant='standard'
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDialogClose}>Cancel</Button>
					<Button onClick={handleDialogUpload}>Create</Button>
				</DialogActions>
			</Dialog>

			<Divider />
			<FormControl fullWidth>
				<InputLabel>Visualization</InputLabel>
				<Select
					value={id}
					label='Visualization'
					onChange={handleChange}
				>
					<MenuItem value={1}>Visualization 1</MenuItem>
					<MenuItem value={2}>Visualization 2</MenuItem>
					<MenuItem value={3}>Visualization 3</MenuItem>
				</Select>
			</FormControl>
			<Divider />
			<List>
				{['Room', 'Upload', 'Sensors', 'Visualization'].map(
					(text, index) => (
						<ListItem
							button
							key={text}
							component={Link}
							to={`/${text}/${id}/`}
						>
							<ListItemText primary={text} />
						</ListItem>
					)
				)}
			</List>
		</Drawer>
	);
}
