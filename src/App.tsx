import React from 'react';
import './App.css';
import Home from './Home';
import { ApiContextProvider } from './ApiContext';

function App() {
  return (
    <>
      <ApiContextProvider>
        <Home />
      </ApiContextProvider>
    </>
  );
}

export default App;
