import React from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      
        <Navbar/>
        <div className='flex'>
          <Sidebar/>
          <div className='flex-1 overflow-y-auto ml-56'>
            <Outlet/>
          </div>
        </div>
    </div>

  )
}

export default Layout