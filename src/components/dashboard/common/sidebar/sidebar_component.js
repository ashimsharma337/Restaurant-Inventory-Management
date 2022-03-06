import React from 'react';
import { MdSpaceDashboard, MdList, MdShoppingCart, MdPeopleAlt, MdAdd, MdOutlineInventory2, MdAddCircle, MdMiscellaneousServices } from "react-icons/md";
import { Link } from 'react-router-dom';


const Sidebar = () => {

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
                  <h6 className="sidebar-heading  justify-content-between  px-3 mt-2 mb-1 text-muted">
                    <MdOutlineInventory2/>&nbsp;&nbsp;Stocks
                  </h6>
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
                  <h6 className="sidebar-heading  justify-content-between  px-3 mt-2 mb-1 text-muted">
                    <MdAddCircle/>&nbsp;&nbsp;Add
                  </h6>
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
                  <h6 className="sidebar-heading  justify-content-between  px-3 mt-2 mb-1 text-muted">
                    <MdMiscellaneousServices/>&nbsp;&nbsp;Miscellaneous
                  </h6>
                  <li className="nav-item">
                    <Link to="/order" className="nav-link">
                    <MdList/>&nbsp;
                      Orders
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/vendor" className="nav-link">
                      <MdPeopleAlt/>&nbsp;
                      Venders
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          
    </>
  )
}

export default Sidebar