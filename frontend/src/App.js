import React, { useState, useEffect } from 'react';

function App() {
  const [tests, setTests] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/tests')
      .then(response => response.json())
      .then(data => setTests(data))
      .catch(err => setError(err.message));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/tests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, age }),
    })
      .then(response => response.json())
      .then(data => setTests([...tests, data]))
      .catch(err => setError(err.message));
  };

  return (
    <div className="App">
      <h1>Test List</h1>
      {error && <p>Error: {error}</p>}
      <ul>
        {tests.map(test => (
          <li key={test._id}>{test.name} - {test.age}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <button type="submit">Add Test</button>
      </form>
    </div>
  );
}

export default App;