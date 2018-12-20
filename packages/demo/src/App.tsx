import React, { PureComponent, useMemo, useState } from 'react';
import { async, AsyncViewWrapper, useAsyncData } from 'react-async-utils';

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
  const [counter, setCounter] = useState(0);
  const [asyncData] = useAsyncData(searchCharacters);
  const data = async.payloadOrUndefined(asyncData);
  return (
    <div>
      <h1>Tests</h1>
      <button onClick={() => setCounter(counter + 1)}>Click Me!</button>
      <AsyncViewWrapper
        asyncData={asyncData}
        renderOptions={{
          forceError: new Error('MIERDA'),
        }}
      >
        <div>A VERRRR: {JSON.stringify(data)}</div>
      </AsyncViewWrapper>
    </div>
  );
}

export default App;
