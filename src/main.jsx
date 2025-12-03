import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import './i18n';

const Wrapper = import.meta.env.DEV ? React.Fragment : React.StrictMode;

createRoot(document.getElementById('root')).render(
  <Wrapper>
    <App />
  </Wrapper>
);
