import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot here
import App from './App';

// Get the root element where you want to render your app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement); // Create a root

// Render the App within ChakraProvider and StrictMode using the new root
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
