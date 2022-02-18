import React from 'react';
import { Link } from 'react-router-dom';

const HeaderN = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
  return (
    <>
    <header className="navbar navbar-dark sticky-top bg-primary flex-md-nowrap p-0 shadow">
         <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#">{userInfo.restaurantName}</a>
            <button className="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search"/>
            <div className="navbar-nav">
              <div className="nav-item text-nowrap">
                <Link to="/logout" className="nav-link px-3" >Log out</Link>
              </div>
            </div>
       </header>
    </>
  )
}

export default HeaderN