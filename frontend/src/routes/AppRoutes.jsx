import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Home from '../pages/Home'
import Project from '../pages/Project'
import UserAuth from '../auth/UserAuth'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<UserAuth><Home/></UserAuth>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
      <Route path='/project' element={<UserAuth><Project/></UserAuth>} />
    </Routes>
  )
}

export default AppRoutes
