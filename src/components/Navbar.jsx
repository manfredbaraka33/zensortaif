import React from 'react'
import logo from "/assets/logo2.png"

const Navbar = () => {
  return (
    <nav className='navbar navbar-expand-sm justify-content-center'>
        <h2 className='logo nav-item'><img src={logo} alt="" /> ZenSort<span className='text-primary'>A</span><span className='text-danger'>I</span></h2>
    </nav>
  )
}

export default Navbar