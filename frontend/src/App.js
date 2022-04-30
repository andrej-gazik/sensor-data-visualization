import logo from './logo.svg';
import './App.css';
import Sidebar from './Components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import RoomCreator from './Components/RoomCreator.js';
import Upload from './Components/Upload';
import Sensors from './Components/Sensors';
import Visualize from './Components/Visualize';
import Box from '@mui/material/Box';
import Layout from './Components/Layout';
import NotFound from './Components/NotFound';
import Home from './Components/Home';
import { useParams } from 'react-router-dom';
import Login from './Components/Login';
import { SnackbarProvider } from 'notistack';

function App() {
	return (
		<div>
			<Routes>
				<Route
					path='/'
					element={
						<Layout>
							<Home />
						</Layout>
					}
				/>
				<Route
					path='/login/'
					element={
						<SnackbarProvider maxSnack={5} hideIconVariant={false}>
							<Login />
						</SnackbarProvider>
					}
				/>
				<Route
					path='/:id/'
					element={
						<Layout>
							<Home />
						</Layout>
					}
				/>
				<Route
					path='/room/:id/'
					element={
						<Layout>
							<RoomCreator />
						</Layout>
					}
				/>
				<Route
					path='/upload/:id/'
					element={
						<Layout>
							<Upload />
						</Layout>
					}
				/>
				<Route
					path='/sensors/:id/'
					element={
						<Layout>
							<Sensors />
						</Layout>
					}
				/>
				<Route
					path='/visualization/:id/'
					element={
						<Layout>
							<Visualize minDate='2020-06-11' />
						</Layout>
					}
				/>
				<Route
					path='*'
					element={
						<Layout>
							<NotFound />
						</Layout>
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
