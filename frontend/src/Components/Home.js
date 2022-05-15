import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
function Home(props) {
	const { id } = useParams();
	const navigate = useNavigate();
	const prevLink = useLocation().state;

	useEffect(() => {
		var str = prevLink;

		if (str) {
			str = str.replace(/[0-9]+/, id.toString());
			navigate(str, { replace: true });
		}
	}, []);

	return (
		<Box sx={{ maxWidth: 400, mt: 5 }}>
			<Stepper orientation='vertical'>
				{steps.map((step, index) => (
					<Step key={step.label} active={true}>
						<StepLabel>{step.label}</StepLabel>
						<StepContent>
							<Typography>{step.description}</Typography>
						</StepContent>
					</Step>
				))}
			</Stepper>
		</Box>
	);
}

const steps = [
	{
		label: 'Crate new blank visualization',
		description: `In sidepanel click button CREATE NEW`,
	},
	{
		label: 'Create new room',
		description:
			'In sidepanel click Room and proceed with creating new room',
	},
	{
		label: 'Upload measurements data from IoT sensors',
		description: 'Select and upload csv file via upload in sidebar',
	},
	{
		label: 'Place sensors in created room',
		description: `Senors parsed from uploaded file can be placed in created rooms via Sensors in side panel`,
	},
	{
		label: 'Visualize data or MKT',
		description: `Final step of visualization is getting graph for placed sensors in rooms or previewing MKT table`,
	},
];

export default Home;
