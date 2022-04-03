import React, { useEffect, useState }  from 'react'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Stage, Layer, Rect, Image } from "react-konva";


const RoomAdvanced = () => {
    
    const [image, setImage] = useState(new window.Image());
    
    useEffect(() => {
        const img = new window.Image();
        img.src = "https://i.imgur.com/xs5jeju.png";
        setImage(img);
        console.log(img.width)
    }, []);

    const onFileChange = event => {
        const img = new window.Image();
        img.src = window.URL.createObjectURL(event.target.files[0])
        setImage(img)
        
    }

    const getScaledImageCoordinates = (
        containerWidth,
        containerHeight,
        width,
        height,
    ) => {
        var widthRatio = (containerWidth) / width,
            heightRatio = (containerHeight) / height
        var bestRatio = Math.min(widthRatio, heightRatio)
        var newWidth = width * bestRatio,
            newHeight = height * bestRatio
        return {newWidth, newHeight}
    } 

  return (
    <div>
        <input id="contained-button-file" type="file" onChange={onFileChange} />
      
        <Stage width={800} height={600}>
            <Layer>
                <Image image={image}/>
            </Layer>
            <Layer>
                <Rect
                x={20}
                y={50}
                width={100}
                height={100}
                fill="red"
                shadowBlur={5}
                />
            </Layer>
        </Stage>
        <Stack spacing={2} direction="row">
            
            

            <Button variant="contained">Confirm current room selection</Button>
            <Button variant="contained">Submit rooms creation</Button>


        </Stack>

    </div>
    
  )
}

export default RoomAdvanced