import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { useParams } from 'react-router';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import API from '../api';

const Upload = () => {
	const { id } = useParams();
	const [file, setFile] = React.useState(null);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const onFileChange = (event) => {
		// Update the state
		setFile(event.target.files[0]);
	};

	const onFileUpload = () => {
		if (file) {
			console.log(file);
			var data = new FormData();
			data.append('file', file);

			API.post(`/visualization/${id}/upload/`, data, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
				.then((res) => console.log(res))
				.catch((error) => console.log(error));
		} else {
			enqueueSnackbar('Please select file before uploading.');
		}
	};

	const fileData = () => {
		if (file) {
			return (
				<div>
					<h2>File details</h2>
					<p>Filename: {file.name}</p>
					<p>Filetype: {file.type}</p>
					<p>Size: {(file.size / 1024).toPrecision(3)} kB</p>
				</div>
			);
		} else {
			return null;
		}
	};

	return (
		<div>
			<input type='file' accept='.csv' onChange={onFileChange} />
			<Button variant='contained' onClick={onFileUpload}>
				Upload
			</Button>
			{fileData()}
		</div>
	);
};

export default Upload;
