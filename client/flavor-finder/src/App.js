import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Home from './components/pages/Home'
// import Result from './components/pages/Result'
// import About from './components/pages/About'

function App() {
  return (
    <div className='App'>
    <Router>
      <Routes> {/* Logic for each route */}
        <Route path='/' exact element={<Home />} />
        {/* <Route path='/result' exact element={<Result />} />
        <Route path='/about' exact element={<About />} /> */}
        </Routes>
    </Router>
    </div>
  );
}

export default App;
