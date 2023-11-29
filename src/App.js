import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Center, Button, Text, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import Web3 from 'web3';

function App() {
  const [colour, setColour] = useState('rgb(255, 255, 255)');
  const [colourHistory, setColourHistory] = useState(['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)']);
  const [block, setBlock] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [txCount, setTxCount] = useState(null);
  const [isGrayscale, setIsGrayscale] = useState(false);

  const web3 = useRef(
    new Web3(
      new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_URL)
    )
  ).current;

  // Generate a random colour based on transaction count
  const getRandomColour = useCallback(() => {
    const baseValue = txCount ? Math.min(txCount, 255) : 0;
  
    if (isGrayscale) {
      const randomOffset = Math.floor(Math.random() * 100);
      const grayValue = Math.max(0, Math.min(255, baseValue - randomOffset, baseValue + randomOffset));
      return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    } else {
      const red = Math.floor(Math.random() * (256 - baseValue) + baseValue);
      const green = Math.floor(Math.random() * (256 - baseValue) + baseValue);
      const blue = Math.floor(Math.random() * (256 - baseValue) + baseValue);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  }, [txCount, isGrayscale]);

  const handleChangeColour = () => {
    const newColour = getRandomColour();
    setColour(newColour);
    setColourHistory((prevHistory) => [newColour, ...prevHistory.slice(0, 2)]);
  };

  const toggleColourMode = () => {
    setIsGrayscale(!isGrayscale);
  };

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const newBlockNumber = await web3.eth.getBlockNumber();
        if (newBlockNumber !== block) {
          setBlock(newBlockNumber);

          const price = await web3.eth.getGasPrice();
          setGasPrice(web3.utils.fromWei(price, 'gwei'));

          const blockInfo = await web3.eth.getBlock(newBlockNumber);
          setTxCount(blockInfo.transactions.length);

          // Update colour based on the new transaction count
          const newColour = getRandomColour();
          setColour(newColour);
          setColourHistory((prevHistory) => [newColour, ...prevHistory.slice(0, 2)]);
        }
      } catch (error) {
        console.error('Error fetching block data:', error);
      }
    };

    fetchBlockData();
    const intervalId = setInterval(fetchBlockData, 7500);
    return () => clearInterval(intervalId);
  }, [block, web3.eth, web3.utils, getRandomColour]); // Include getRandomColour in dependency array

  const secondLastColour = colourHistory.length > 1 ? colourHistory[1].slice(1) : 'teal';
  const switchColour = isGrayscale ? secondLastColour : 'gray';

  return (
    <Box bg={colour} minHeight="100vh">
      <Center height="100vh" flexDirection="column">
        <Button
          colourScheme="teal"
          colour="grey"
          fontWeight="bold"
          bg={colourHistory[1]}
          _hover={{ bg: colourHistory[2] }}
          onClick={handleChangeColour}
        >
          Change Colour
        </Button>

        <FormControl display="flex" alignItems="center" justifyContent="center" marginTop="4">
          <FormLabel htmlFor="colour-mode-switch" mb="0">
            Grayscale Mode
          </FormLabel>
          <Switch id="colour-mode-switch" onChange={toggleColourMode} isChecked={isGrayscale}
            colourScheme={switchColour}
          />
        </FormControl>

        {/* Displaying the information */}
        {block !== null && <Text colour="grey" fontWeight="bold">Current Block: {block.toString()}</Text>}
        {gasPrice !== null && <Text colour="grey" fontWeight="bold">Current Gas Price: {parseFloat(gasPrice).toFixed(2)} Gwei</Text>}
        {txCount !== null && <Text colour="grey" fontWeight="bold">Transactions in Last Block: {txCount}</Text>}
      </Center>
    </Box>
  );
}

export default App;
