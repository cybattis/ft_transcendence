import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/CreateAccount' element={<CreateAccount/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
