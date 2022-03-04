import React from 'react';
import { Link } from 'react-router-dom';
import { MdFastfood } from "react-icons/md";

const DashboardHeader = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
  return (
    <>
    <header className="navbar navbar-dark sticky-top bg-primary flex-md-nowrap p-0 shadow">
         <Link to="/dashboard" className="navbar-brand col-md-3 col-lg-2 me-0 px-3"><MdFastfood/>&nbsp;{userInfo.restaurantName}</Link>
            
            <div className="navbar-nav">
              <div className="nav-item text-nowrap">
                <Link to="/logout" className="navbar-brand px-3" >Log out</Link>
              </div>
            </div>
       </header>
    </>
  )
}

export default DashboardHeader;