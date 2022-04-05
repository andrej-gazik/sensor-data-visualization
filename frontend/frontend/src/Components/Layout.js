import React from 'react';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';

export default function Layout({ children }) {
	return (
		<div>
			<Box
				sx={{
					display: 'flex',
					align: 'center',
					justifyContent: 'center',
				}}
			>
				<Sidebar></Sidebar>

				{children}
			</Box>
		</div>
	);
}
