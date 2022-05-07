import React from 'react';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { SnackbarProvider } from 'notistack';

export default function Layout({ children }) {
	return (
		<SnackbarProvider maxSnack={5} hideIconVariant={false}>
			<Box sx={{ display: 'flex' }}>
				<Toolbar>
					<Sidebar />
				</Toolbar>

				{children}
			</Box>
		</SnackbarProvider>
	);
}
