import React, { useEffect, useState } from 'react';
import { MdEdit, MdOutlineDeleteForever } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { NavLink } from 'react-router-dom';
import HeaderN from './common/header/header_component';
import Sidebar from './common/sidebar/sidebar_component';
import { useDispatch, useSelector } from "react-redux";
import { getProducts, getUsers } from "../../redux/actions/productActions";


const Dashboard = () => {
  const userInfo = JSON.parse(localStorage.getItem("user_info"));
  
  const data = useSelector((state) => state);

  const dispatch = useDispatch();

  useEffect(() => {

    toast.success('Welcome to Dashboard!');
    dispatch(getProducts());
    dispatch(getUsers());

  }, []);
  
  // console.log("Data: ", data);
  let productsArr = data.allProducts.products;
  let usersArr = data.allUsers.users;
 

  return (
    <>
      <HeaderN/>

        <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Dashboard</h1>
                <span>Hi, {userInfo.name} Welcome!</span>
                <div className="btn-toolbar mb-2 mb-md-0">
                  <div className="btn-group me-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                  </div>
                </div>
              </div>

              
              <div className='container-fluid'>
              <h4>Total Stocks</h4>
              {/* <div className="table-responsive"> */}
                <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th scope="col">S.N</th>
                      <th scope="col">Item</th>
                      <th scope="col">Category</th>
                      <th scope="col">Vender</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Price</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      productsArr.map((o, i) => (
                        <tr key={i}>
                          <td>{i+1}</td>
                          <td>{o.title}</td>
                          <td>{o.category_id?.title}</td>
                          <td>{o.vendor}</td>
                          <td>{o.quantity}&nbsp;{o.unit}</td>
                          <td>${o.price}</td>
                          <td>

                          <NavLink to={"/product/"+o._id} className='btn btn-sm btn-warning' ><MdEdit/>&nbsp;Edit</NavLink>&nbsp;
                          <button onClick = {(event) => {
                            let confirmed = window.confirm("Are you sure you want want to delete this product?");
                            // if(confirmed){
                            //   return handleDelete(i, o._id);
                            // }
                          }} className='btn btn-sm btn-danger'><MdOutlineDeleteForever/>&nbsp;Delete</button>

                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                <hr></hr>
                <div className='row'>
                  <div className='col-md-4'>
                      <h4>Manage Users</h4>
                        <table className='table table-bordered'>
                          <thead>
                           <tr>
                            <th>S.N</th>
                            <th>Name</th>
                            <th>Position</th>
                           </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>Ashim</td>
                              <td>General-Manager</td>
                            </tr>
                            {
                                 usersArr.map((o, i) => (
                                   <tr key={i}>
                                     <td>{i+1}</td>
                                     <td>{o.name}</td>
                                     <td>{o.position}</td>
                                   </tr>
                                 )) 
                            }
                          </tbody>
                        </table>
                  </div>
                  
                  <div className='col-md-4'>
                  <h4>Total stocks</h4>
                    <table className='table table-bordered'>
                      <thead>
                       <tr>
                        <th>S.N</th>
                        <th>Product</th>
                        <th>Stocks</th>
                       </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>chicken</td>
                          <td>4 kg</td>
                        </tr>
                        {
                             productsArr.map((o, i) => (
                                  <tr key={i}>
                                    <td>{i+1}</td>
                                    <td>{o.title}</td>
                                    <td>{o.quantity}&nbsp;{o.unit}</td>
                                  </tr>
                             ))
                        }
                      </tbody>
                    </table>
                </div>

                <div className='col-md-4'>
                  <h4>Create orders</h4>
                    <h6>Place order</h6>
                </div>
              
  
                
              {/* </div> */}
               </div>
              </div>
            </main>
          </div>
        </div>
        <Toaster />

    </>
  )
}

export default Dashboard