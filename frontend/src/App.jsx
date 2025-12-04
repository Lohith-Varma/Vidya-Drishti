import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
