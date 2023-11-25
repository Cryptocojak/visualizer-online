import React, { useState } from 'react';
import { Button, Box, Center } from '@chakra-ui/react';

function App() {
  const [colour, setColor] = useState('#FFFFFF');
  const [colourHistory, setColorHistory] = useState(['#FFFF11', '#FF11FF', '#11FFFF']);

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let newColor = '#';
    for (let i = 0; i < 6; i++) {
      newColor += letters[Math.floor(Math.random() * 16)];
    }
    return newColor;
  }

  function handleChangeColour() {
    const newColor = getRandomColor();
    setColor(newColor);
    setColorHistory((prevHistory) => [newColor, ...prevHistory.slice(0, 2)]); // Keep only the last 3 colours
  }

  const thirdLastColor = colourHistory[2];

  return (
    <Box style={{ backgroundColor: colour, minHeight: '100vh' }}>
      <Center height="100vh">
        <Button
          colourScheme="teal"
          backgroundColor={colourHistory[1]} // Second last colour as the current background
          _hover={{ backgroundColor: thirdLastColor }} // Third last colour on hover
          onClick={handleChangeColour}
        >
          Change Colour
        </Button>
      </Center>
    </Box>
  );
}

export default App;
