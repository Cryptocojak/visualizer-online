import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Center,
  Button,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  keyframes,
} from '@chakra-ui/react';
import Web3 from 'web3';

function App() {
  const getInitialRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const [colour, setColour] = useState(getInitialRandomColor());
  const [colourHistory, setColourHistory] = useState([
    getInitialRandomColor(),
    getInitialRandomColor(),
    getInitialRandomColor(),
  ]);
  const [block, setBlock] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [txCount, setTxCount] = useState(null);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [shapeHistory, setShapeHistory] = useState([]);
  const [drawCount, setDrawCount] = useState(1);

  const web3 = useRef(
    new Web3(
      new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_URL)
    )
  ).current;

  // Breathing animation keyframes
  const breathe = keyframes`
    0%, 100% { filter: saturate(0.35); filter: brightness(0.85); }
    50% { filter: saturate(1.58); filter: brightness(1.12);}
  `;

  const getRandomColour = useCallback(() => {
    const baseValue = txCount ? Math.min(txCount, 255) : 0;

    if (isGrayscale) {
      const randomOffset = Math.floor(Math.random() * 100);
      const grayValue = Math.max(
        0,
        Math.min(255, baseValue - randomOffset, baseValue + randomOffset)
      );
      return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    } else {
      const red = Math.floor(
        Math.random() * (256 - baseValue) + baseValue
      );
      const green = Math.floor(
        Math.random() * (256 - baseValue) + baseValue
      );
      const blue = Math.floor(
        Math.random() * (256 - baseValue) + baseValue
      );
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
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const newBlockNumber = await web3.eth.getBlockNumber();
        if (newBlockNumber !== block) {
          setBlock(newBlockNumber);

          const price = await web3.eth.getGasPrice();
          setGasPrice(web3.utils.fromWei(price, 'gwei'));

          const blockInfo = await web3.eth.getBlock(newBlockNumber);
          const txs = blockInfo.transactions.length;
          setTxCount(txs);

          const newColour = getRandomColour();

          setColourHistory((prevHistory) => {
            const updatedHistory = [newColour, ...prevHistory.slice(0, 2)];
            setColour(newColour);

            const maxVisualSize = Math.min(
              windowSize.width,
              windowSize.height
            ) * 0.5;
            const normalizedTxCount = Math.min(txs, 200);
            const scaleFactor = normalizedTxCount / 200;
            const visualRadius = (maxVisualSize * scaleFactor) / 2;
            const squareSide = visualRadius * Math.sqrt(2);
            const padding = visualRadius;

            const x =
              Math.random() * (windowSize.width - 2 * padding) + padding;
            const y =
              Math.random() * (windowSize.height - 2 * padding) + padding;

            const newShape = {
              x,
              y,
              radius: visualRadius,
              squareSide,
              circleColor: updatedHistory[0],
              squareColor: updatedHistory[1] || 'gray',
            };

            setShapeHistory((prev) => [newShape, ...prev.slice(0, 49)]);
            return updatedHistory;
          });
        }
      } catch (error) {
        console.error('Error fetching block data:', error);
      }
    };

    fetchBlockData();
    const intervalId = setInterval(fetchBlockData, 7500);
    return () => clearInterval(intervalId);
  }, [block, web3.eth, web3.utils, getRandomColour, windowSize]);

  return (
    <Box
      bg={colour}
      minHeight="100vh"
      position="relative"
      overflow="hidden"
      animation={`${breathe} 10s ease-in-out infinite`}
    >
      {/* Background SVG with shapes */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
        width={windowSize.width}
        height={windowSize.height}
      >
        {shapeHistory
          .slice(0, drawCount)
          .reverse()
          .map((shape, index, arr) => {
            const isNewest = index === arr.length - 1;
            const baseOpacity = isNewest
              ? 1
              : 1 - ((arr.length - 1 - index) * (1 / drawCount));

            // UI box bounds with 15px padding
            const uiPadding = 1;
            const uiBox = {
              top: windowSize.height / 2 - 200 - uiPadding,
              bottom: windowSize.height / 2 + 200 + uiPadding,
              left: windowSize.width * 0.1 - uiPadding,
              right: windowSize.width * 0.9 + uiPadding,
            };

            const overlapsUI =
              shape.y + shape.radius > uiBox.top &&
              shape.y - shape.radius < uiBox.bottom &&
              shape.x + shape.radius > uiBox.left &&
              shape.x - shape.radius < uiBox.right;

            const opacity = overlapsUI ? 0.15 : baseOpacity;

            return (
              <g key={index} opacity={opacity}>
                <circle
                  cx={shape.x}
                  cy={shape.y}
                  r={shape.radius}
                  fill={shape.circleColor}
                  stroke="black"
                  strokeWidth="2"
                />
                <rect
                  x={shape.x - shape.squareSide / 2}
                  y={shape.y - shape.squareSide / 2}
                  width={shape.squareSide}
                  height={shape.squareSide}
                  fill={shape.squareColor}
                  stroke="black"
                  strokeWidth="1"
                />
              </g>
            );
          })}
      </svg>

      {/* UI controls */}
      <Center
        position="relative"
        zIndex={1}
        flexDirection="column"
        minHeight="100vh"
        gap={4}
        p={4}
      >
        <Button
          colorScheme="teal"
          color="grey"
          bg={colourHistory[1]}
          _hover={{ bg: colourHistory[2] }}
          onClick={handleChangeColour}
        >
          Change Color
        </Button>

        <FormControl display="flex" alignItems="center" justifyContent="center">
          <FormLabel htmlFor="colour-mode-switch" mb="0">
            Grayscale Mode
          </FormLabel>
          <Switch
            id="colour-mode-switch"
            onChange={toggleColourMode}
            isChecked={isGrayscale}
            colorScheme="gray"
          />
        </FormControl>

        {block !== null && (
          <Text fontWeight="bold">Current Block: {block.toString()}</Text>
        )}
        {gasPrice !== null && (
          <Text fontWeight="bold">
            Current Gas Price: {parseFloat(gasPrice).toFixed(2)} Gwei
          </Text>
        )}
        {txCount !== null && (
          <Text fontWeight="bold">Transactions in Last Block: {txCount}</Text>
        )}

        {/* Shape slider at the bottom */}
        <Box width="30%" mt={4}>
          <FormControl>
            <FormLabel>More or less: {drawCount}</FormLabel>
            <Slider
              aria-label="circle-slider"
              min={1}
              max={50}
              step={1}
              value={drawCount}
              onChange={(val) => setDrawCount(val)}
            >
              <SliderTrack bg={colourHistory[1]}>
                <SliderFilledTrack bg={colourHistory[2]} />
              </SliderTrack>
              <SliderThumb boxSize={4} />
            </Slider>
          </FormControl>
        </Box>
      </Center>
    </Box>
  );
}

export default App;
