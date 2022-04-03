import React from 'react'
import TextField from '@mui/material/TextField';
import StaticDateRangePicker from '@mui/lab/StaticDateRangePicker';
import AdapterDateFns from '@date-io/date-fns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import { Grid, ListItem } from '@mui/material';
import Typography from "@material-ui/core/Typography";
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value}°C`;
}

const marks = [
  {
    value: 0,
    label: '0°C',
  },
  {
    value: 50,
    label: '50°C',
  },
  {
    value: 100,
    label: '100°C',
  },
];

const Visualize = (props) => {
  const [value, setValue] = React.useState([null, null]);
  const [interpolationInterval, setInterpolationInterval] = React.useState('web');
  const [aggregate, setAggregate] = React.useState('web');

  const handleInterpolationChange = (event, newSetInterpolationInterval) => {
    setInterpolationInterval(newSetInterpolationInterval);
  };

  const handleAggregateChange = (event, newSetAggregateInterval) => {
    setAggregate(newSetAggregateInterval);
  };
  
  var timestamp = Date.parse("11/30/2011");
  var dateObject = new Date(timestamp);
  console.log(value)
  return (
        <Grid
          container 
          spacing={1} 
          justifyContent="center"
          direction="column"
          alignItems="center"


        >
          <Grid 
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Grid >
            <Typography variant="h6" component="h6">
            Resampling interval
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={interpolationInterval}
              exclusive
              onChange={handleInterpolationChange}
            >

              <ToggleButton value="hour">Hourly</ToggleButton>
              <ToggleButton value="day">Dialy</ToggleButton>
              <ToggleButton value="year">Weekly</ToggleButton>
              <ToggleButton value="month">Monthly</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        <Grid>
          <Typography variant="h6" component="h2">
            Aggregate function over data
          </Typography>
          <ToggleButtonGroup
            color="secondary"
            value={aggregate}
            exclusive
            onChange={handleAggregateChange}
          >
            <ToggleButton value="min">Min</ToggleButton>
            <ToggleButton value="max">Max</ToggleButton>
            <ToggleButton value="average">Average</ToggleButton>
          </ToggleButtonGroup>

        </Grid>

          </Grid>

          
        
        <Typography variant="h6" component="h2">
          Data range        
        </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StaticDateRangePicker
        displayStaticWrapperAs="desktop"
        minDate={new Date()}
        maxDate={new Date('2022-04-17T03:24:00')}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          console.log(newValue)
        }}

        renderInput={(startProps, endProps) => (
          <React.Fragment>
            <TextField {...startProps} />
            <TextField {...endProps} />
          </React.Fragment>
        )}
      />
    </LocalizationProvider>
    <Button variant="contained">Fetch data</Button>
    <Slider
        style={{ margin:'20px', height:'200px'}}
        height={200}
        getAriaLabel={() => 'Temperature'}
        orientation="vertical"
        getAriaValueText={valuetext}
        defaultValue={[20, 40]}
        marks={marks}
      />
    </Grid>
    

   
  )
}

export default Visualize