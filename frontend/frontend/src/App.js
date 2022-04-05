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

function App() {
	return (
		<div className='App'>
			<Layout>
				<Routes>
					<Route path='/' element={<RoomCreator />} />
					<Route path='/Room/:id' element={<RoomCreator />} />
					<Route path='/Upload/:id' element={<Upload />} />
					<Route path='/Sensors/:id' element={<Sensors />} />
					<Route
						path='/Visualization/:id'
						element={<Visualize minDate='2020-06-11' />}
					/>
				</Routes>
			</Layout>
		</div>
	);
}

export default App;
