import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Importiamo il file che hai appena creato
import './assets/styles/index.css';    // Importiamo gli stili

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);