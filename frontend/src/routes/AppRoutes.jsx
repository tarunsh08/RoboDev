import React from 'react'
import { Route, BrowserRouter, Routes} from 'react-router-dom'
import Login from '../pages/Login'

const AppRoutes = () => {
  return (
    <BrowserRouter>
    <Routes>
        <Route path='/' element={<div>Home</div>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<div>Register</div>} />
    </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
