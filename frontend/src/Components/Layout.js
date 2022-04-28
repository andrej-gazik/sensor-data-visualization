import React from 'react';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

export default function Layout({ children }) {
	return (
		<Box sx={{ display: 'flex' }}>
			<Toolbar>
				<Sidebar />
			</Toolbar>

			{children}
		</Box>
	);
}
