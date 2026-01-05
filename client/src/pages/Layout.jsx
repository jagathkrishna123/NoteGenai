import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div>

        <div className='min-h-screen bg-gray-50'>
            <Navbar/>
            <div className='flex'>
              <Sidebar/>
              <Outlet/>
            </div>
            
        </div>
    </div>
    
  )
}

export default Layout