import React from 'react';
import { MdSpaceDashboard, MdList, MdShoppingCart, MdPeopleAlt, MdAdd } from "react-icons/md";
import { Link } from 'react-router-dom';
import HeaderN  from "../components/dashboard/common/header/header_component";
import Sidebar from './dashboard/common/sidebar/sidebar_component';

const AddProduct = () => {
  return (
    <>
      <HeaderN/>


       <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Dashboard</h1>
                <span>Hi, John Doe Welcome!</span>
                <div className="btn-toolbar mb-2 mb-md-0">
                  <div className="btn-group me-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                  </div>
                </div>
              </div>

              <h4>Add Product</h4>
              <hr></hr>
              <div className="container-fluid">
                  <div className="row">
                      <div className="col-md-12">
                          <label htmlFor="name" className="col-md-3 h4">Item-Name:</label>
                          <input type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label htmlFor="category" className="col-md-3 h4">Category:</label>
                          <input type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label htmlFor="vender" className="col-md-3 h4">Vendor:</label>
                          <input type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label htmlFor="category" className="col-md-3 h4">Quantity:</label>
                          <input type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label htmlFor="category" className="col-md-3 h4">Price:</label>
                          <input type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  
                  <div className="row mb-3">
                      <div className="offset-md-3 col-md-9">
                          <button type="submit" className="btn btn-md btn-dark mt-3"><MdAdd/>&nbsp;Add</button>
                      </div> 
                  </div>
                  
              </div>
            </main>
          </div>
        </div>




    </>
  )
}

export default AddProduct;