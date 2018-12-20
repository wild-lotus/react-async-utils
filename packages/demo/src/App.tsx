import React, { useState } from 'react';
import { useAsyncData } from 'react-async-utils';
// import { useAsyncData } from './hooks/useAsyncData';
import './App.css';
import logo from './logo.svg';

function searchCharacters(search: string = '') {
  const apiKey = 'f9dfb1e8d466d36c27850bedd2047687';
  return fetch(
    `https://gateway.marvel.com/v1/public/comics?apikey=${apiKey}&titleStartsWith=${search}`,
    {
      method: 'GET',
    },
  ).then(r => r.json());
}

function App() {
  const [search, setSearch] = useState('');
  const [asyncData] = useAsyncData(searchCharacters);
  return (
    <div className="App">
      {/* <header className="App-header">
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
      </header> */}
      <h1>ASYNC SHIT</h1>
      {JSON.stringify(asyncData)}
      {/* <AsyncView asyncData={asyncData}>
        {data => JSON.stringify(data)}
      </AsyncView> */}
    </div>
  );
}

export default App;
