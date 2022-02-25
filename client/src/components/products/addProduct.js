import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { MdSpaceDashboard, MdList, MdShoppingCart, MdPeopleAlt, MdAdd } from "react-icons/md";
import { Link } from 'react-router-dom';
import { httpRequest } from '../../services/httpclient';
import HeaderN  from "../dashboard/common/header/header_component";
import Sidebar from '../dashboard/common/sidebar/sidebar_component';

const AddProduct = () => {

  const [productData, setProductData] = useState({

        title: "",
        category_id: "",
        vendor: "",
        quantity: 0,
        unit: "",
        price: 0
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
        httpRequest.getItems("/category")
        .then((response) => {
          // console.log(response);
          setCategories(response.data.result);
          console.log(categories);
        })
        .catch((error) => {
          console.log(error);
        })
  },[])

  const handleChange = (e) => {
        const { name, value } = e.target;
    
        setProductData({
          ...productData,
          [name]: value
        });
  }

  const handleSubmit = (e) => {
        console.log(productData);
        console.log(productData.title);
        httpRequest.postItem(process.env.REACT_APP_BASE_URL+"/products", productData, true)
        .then((success) => {
             toast.success("Product added successfully.");
             console.log(success);
        })
        .catch((error) => {
             toast.error(error);
        })
  }


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
                          <label className="col-md-3 h4">Item-Name:</label>
                          <input name="title" onChange={handleChange} type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Category:</label>
                          <select name="category_id" onChange={handleChange} type="text" className="col-md-9">
                            <option value = "">Choose</option>
                            {
                                    categories.map((o, i) => (
                                      <option key = {i} value={o._id}>{o.title}</option>
                                    ))
                            }
                          </select>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Vendor:</label>
                          <input name="vendor" onChange={handleChange} type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Quantity:</label>
                          <input name="quantity" onChange={handleChange} type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Unit:</label>
                          <input name="unit" onChange={handleChange} type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Price:</label>
                          <input name="price" onChange={handleChange} type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  
                  <div className="row mb-3">
                      <div className="offset-md-3 col-md-9">
                          <button type="submit" onClick={handleSubmit} className="btn btn-md btn-dark mt-3"><MdAdd/>&nbsp;Add</button>
                      </div> 
                  </div>
                  
              </div>
            </main>
          </div>
        </div>

      <Toaster/>


    </>
  )
}

export default AddProduct;