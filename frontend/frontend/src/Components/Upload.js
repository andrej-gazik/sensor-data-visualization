import React, { Component } from 'react'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { useParams } from 'react-router';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';


const Upload = () => {


  const { id } = useParams();
  const [file, setFile] = React.useState(null);

  const onFileChange = event => { 
    // Update the state 
    setFile(event.target.files[0]); 
  }; 

  const onFileUpload = () => {

  }

  const fileData = () => {
    if (file) {
      return (
        <div>
          <h2>
            File details
          </h2>
          <p>
            Filename: {file.name}
          </p>
          <p >
            Filetype: {file.type}
          </p>
          <p>
          Size: {(file.size / 1024).toPrecision(3) } kB
          </p>
        </div>
        )
    } else {
      <div>
        <br/>
        <h4> Choose file before Pressing the Upload button </h4> 
      </div>
    }
  }

  return (
    
      

      
    <div>
      <input id="contained-button-file" type="file" onChange={onFileChange} />
      <Button variant="contained" component="span" onClick={onFileUpload}>
        Upload
      </Button>
      {fileData()}
    </div>
  )
}

export default Upload