import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Center, Button, Text } from '@chakra-ui/react';
import Web3 from 'web3';

function App() {
  const [colour, setColor] = useState('#FFFFFF');
  const [colourHistory, setColorHistory] = useState(['#FFFF11', '#FF11FF', '#11FFFF']);
  const [block, setBlock] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [txCount, setTxCount] = useState(null);

  const web3 = useRef(
    new Web3(
      new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_URL)
    )
  ).current;

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let newColor = '#';
    for (let i = 0; i < 6; i++) {
      newColor += letters[Math.floor(Math.random() * 16)];
    }
    return newColor;
  };

  const handleChangeColour = useCallback(() => {
    const newColor = getRandomColor();
    setColor(newColor);
    setColorHistory((prevHistory) => [newColor, ...prevHistory.slice(0, 2)]);
  }, []);

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const newBlockNumber = await web3.eth.getBlockNumber();
        if (newBlockNumber !== block) {
          setBlock(newBlockNumber);
          handleChangeColour();

          const price = await web3.eth.getGasPrice();
          setGasPrice(web3.utils.fromWei(price, 'gwei'));

          const blockInfo = await web3.eth.getBlock(newBlockNumber);
          setTxCount(blockInfo.transactions.length);
        }
      } catch (error) {
        console.error('Error fetching block data:', error);
      }
    };

    fetchBlockData();
    const intervalId = setInterval(fetchBlockData, 7500);
    return () => clearInterval(intervalId); 
  }, [handleChangeColour]); 

  const thirdLastColor = colourHistory[2];

  return (
    <Box bg={colour} minHeight="100vh">
      <Center height="100vh" flexDirection="column">
        <Button
          colorScheme="teal"
          color="grey"
          fontWeight="bold"
          bg={colourHistory[1]}
          _hover={{ bg: thirdLastColor }}
          onClick={handleChangeColour}
        >
          Change Colour (Work In Progress)
        </Button>

        {/* Displaying the information */}
        {block !== null && <Text color="grey" fontWeight="bold">Current Block: {block.toString()}</Text>}
        {gasPrice !== null && <Text color="grey" fontWeight="bold">Current Gas Price: {parseFloat(gasPrice).toFixed(2)} Gwei</Text>}
        {txCount !== null && <Text color="grey" fontWeight="bold">Transactions in Last Block: {txCount}</Text>}
      </Center>
    </Box>
  );
}

export default App;
