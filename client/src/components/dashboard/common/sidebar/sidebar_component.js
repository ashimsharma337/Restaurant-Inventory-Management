import React from 'react';
import { MdSpaceDashboard, MdList, MdShoppingCart, MdPeopleAlt, MdAdd } from "react-icons/md";
import { Link } from 'react-router-dom';


const Sidebar = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
  return (
    <>     
            <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
              <div className="position-sticky pt-3">
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <Link to="/dashboard" className="nav-link active" aria-current="page">
                    <MdSpaceDashboard/>&nbsp;
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                    <MdList/>&nbsp;
                      Orders
                    </a>
                  </li>
                  <li className="nav-item">
                    <Link to="/product" className="nav-link">
                    <MdShoppingCart/>&nbsp;
                      All Products
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/category" className="nav-link">
                    <MdShoppingCart/>&nbsp;
                      All Category
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/addproduct" className="nav-link">
                      <MdAdd/>&nbsp;
                      Add Product
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/addcategory" className="nav-link">
                      <MdAdd/>&nbsp;
                      Add Category
                    </Link>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      <MdPeopleAlt/>&nbsp;
                      Venders
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          
    </>
  )
}

export default Sidebar