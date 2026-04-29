import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './style.css';

ReactDOM.createRoot(document.getElementById('dojo-game-root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
