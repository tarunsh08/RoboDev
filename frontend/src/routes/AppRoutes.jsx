import React from 'react'
import { Route, BrowserRouter, Routes} from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'

const AppRoutes = () => {
  return (
    <BrowserRouter>
    <Routes>
        <Route path='/' element={<div>Home</div>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
