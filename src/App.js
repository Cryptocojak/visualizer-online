import React, { useState, useEffect, useCallback } from 'react';
import { Button, Box, Center } from '@chakra-ui/react';
import Web3 from 'web3';

function App() {
  const [colour, setColor] = useState('#FFFFFF');
  const [colourHistory, setColorHistory] = useState(['#FFFF11', '#FF11FF', '#11FFFF']);
  const web3 = new Web3(Web3.givenProvider || process.env.REACT_APP_INFURA_URL);
  const [block, setBlock] = useState(web3.eth.getBlockNumber())

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let newColor = '#';
    for (let i = 0; i < 6; i++) {
      newColor += letters[Math.floor(Math.random() * 16)];
    }
    return newColor;
  }

  const handleChangeColour = useCallback(() => {
    const newColor = getRandomColor();
    setColor(newColor);
    setColorHistory((prevHistory) => [newColor, ...prevHistory.slice(0, 2)]);
  }, []);

  useEffect(() => {
    let intervalId;

    const checkBlockNumber = () => {
      web3.eth.getBlockNumber()
        .then(newBlockNumber => {
          if (newBlockNumber !== block) {
            setBlock(newBlockNumber);
            handleChangeColour();
          }
        })
        .catch(console.error);
    };

    intervalId = setInterval(checkBlockNumber, 7500);

    return () => clearInterval(intervalId); 
  }, [block, handleChangeColour, web3.eth]);

  const thirdLastColor = colourHistory[2];

  return (
    <Box bg={colour} minHeight="100vh">
      <Center height="100vh">
        <Button
          colorScheme="teal"
          color="grey"
          bg={colourHistory[1]}
          _hover={{ bg: thirdLastColor }}
          onClick={handleChangeColour}
        >
          Change Colour (Work In Progress)
        </Button>
      </Center>
    </Box>
  );
}

export default App;
