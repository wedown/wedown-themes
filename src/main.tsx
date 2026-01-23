import React from 'react';
import ReactDOM from 'react-dom/client';

import './app.css'
import App from './App'
import ThemeProvider from './lib/stores/themeContext';

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
