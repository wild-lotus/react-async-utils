import React, { useState } from 'react';
import { useAsyncData } from 'react-async-hooks';
import './App.css';
import logo from './logo.svg';

function App() {
  const [counter, setCounter] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button
          // tslint:disable-next-line: jsx-no-lambda
          onClick={() => {
            setCounter(counter + 1);
          }}
        >
          Click me!
        </button>
      </header>
    </div>
  );
}

export default App;
