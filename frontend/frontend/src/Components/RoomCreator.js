import React from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useForm } from 'react-hook-form'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';



const RoomCreator = () => {
    const {
        register, 
        handleSubmit, 
        formState: { errors }
    } = useForm();

    // Add item into 
    const onSubmit = (data) => {
        console.log(data)
        setRooms([...rooms, data])
    };

    const [open, setOpen] = React.useState(false);
    const [rooms, setRooms] = React.useState([]);
    

    const handleClickOpen = () => {
        setOpen(true);
        };

    const handleClose = () => {
        setOpen(false);
        };
    
    const handleInputChange = e => {

    }

    const handleSave = () => {

    }

    const allowOnlyNumber = (value) => {
        return value.replace(/[^0-9]/g, '')
    }


    const handleRoomDelete = (index) => {

        
        const array = [...rooms];
        
        array.splice(index, 1);
        setRooms(array);
        
    }

    return (
        <div>

        
        <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select width and height of selected room from floorplan.
          </DialogContentText>
          
            <TextField
                autoFocus
                margin="dense"
                label="Room name"
                type="text"
                fullWidth
                variant="standard"
                {...register("name", {required: "Required"})}
                error={!!errors?.name}
                helperText={errors?.name ? errors.name.message : null}
            />

            <TextField
                autoFocus
                margin="dense"
                id="width"
                label="Room Width"
                type="number"
                fullWidth
                variant="standard"
                {...register("width", {required: "Required", valueAsNumber: true, min:0})}
                error={!!errors?.width}
                helperText={errors?.width ? errors.width.message : null}
            />

            <TextField
                autoFocus
                margin="dense"
                id="height"
                label="Room Height"
                type="number"
                fullWidth
                variant="standard"
                {...register("height", {required: "Required", valueAsNumber: true, min:0})}
                error={!!errors?.height}
                helperText={errors?.height ? errors.height.message : null}
            />
          
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" onClick={handleClickOpen}>Add room</Button>
        </DialogActions>
        </form>
        </Dialog>

        <Button variant="outlined" onClick={handleClickOpen}>
        Create new room
        </Button>
        
            <List>

              {
              rooms.map((room, index) =>
                <ListItem 
                    key = {index}
                    secondaryAction={
                    <IconButton onClick={() => handleRoomDelete(index)} edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary= {room.name}
                    secondary= {`height: ${room.height} width: ${room.width}`}
                  />
                </ListItem>
              )
              }

            </List>
    
        </div>
    )
}

export default RoomCreator