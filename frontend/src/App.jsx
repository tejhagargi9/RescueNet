import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/home';

function App() {
  return (
    <Router>
        <Navbar/>

      <Routes>
        <Route path="/" element={<Home/>} />
      </Routes>
    </Router>
  );
}

export default App;
