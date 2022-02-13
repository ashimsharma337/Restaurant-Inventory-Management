import React from 'react';
import { MdOutlineInventory, MdOutlineLogin } from "react-icons/md"
import { GiArchiveRegister } from "react-icons/gi";
import { Link } from 'react-router-dom';

const Header = () => {
  return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
              <div className="container-fluid">
                    <a className="navbar-brand" href="#"><MdOutlineInventory/>&nbsp;RESINSO</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                      <span className="navbar-toggler-icon"></span>
                    </button>
                    <ul className="nav">
                      <li className="nav-link">
                        <Link to="/contact" className = "navbar-brand">About us</Link>
                      </li>
                      <li className="nav-link">
                        <Link to="/login" className = "navbar-brand" ><MdOutlineLogin/>&nbsp;Login</Link>
                      </li>
                      <li className="nav-link">
                        <Link to="/register" className = "navbar-brand"><GiArchiveRegister/>&nbsp;Register</Link>
                      </li>
                    </ul>
               </div>
        </nav>
  )
}

export default Header;