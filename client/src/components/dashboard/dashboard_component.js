import React, { useEffect, useState } from 'react';
import { MdEdit, MdOutlineDeleteForever } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { NavLink, Link } from 'react-router-dom';
import HeaderN from './common/header/header_component';
import Sidebar from './common/sidebar/sidebar_component';
import { useDispatch, useSelector } from "react-redux";
import { getProducts, getUsers } from "../../redux/actions/productActions";
import Heading from './common/heading/heading';


const Dashboard = () => {
 
  
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
 

  // display order under par level
  const orderToBePlaced = productsArr.filter(function(item) {
  if (item.quantity < item.parLevel) {
      return(true);
  }
  });

  //console.log(orderToBePlaced);
  console.log(usersArr);

  return (
    <>
      <HeaderN/>

        <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              
              <Heading/>
              
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
                      <th scope="col">Unit Price</th>
                      <th scope="col">Par Level</th>
                      <th scope="col">Add Order Received</th>
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
                          <td>{o.parLevel}</td>
                          <td>
                            <NavLink to={"/product/managequantity/"+o._id} className='btn btn-sm btn-primary'>Add quantity</NavLink>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                <hr></hr>

                <div className='row'>
     
                <div className='col-md-6'>
                  <h4>Weekly Uses</h4>
                  <table className="table table-bordered table-warning">
                    <thead>
                      <tr>
                        <th>S.N</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Deduction</th>
                      </tr>
                    </thead>
                    <tbody>
                     {
                        productsArr.map((o, i) => (
                          <tr key={i} className="table-warning">
                            <td>{i+1}</td>
                            <td>{o.title}</td>
                            <td>{o.quantity}&nbsp;{o.unit}</td>
                            <td>
                            <NavLink to={"/product/managequantity/"+o._id} className='btn btn-sm btn-warning'>Deduct quantity</NavLink>
                            </td>
                          </tr>
                        ))
                     }
                    </tbody>
                  </table>
                </div>

                  <div className='col-md-6'>
                  <h4>Order to be placed</h4>
                    <table className='table table-bordered'>
                      <thead>
                       <tr className="table-danger">
                        <th>S.N</th>
                        <th>Product</th>
                        <th>Stocks</th>
                        <th>Par Level</th>
                       </tr>
                      </thead>
                      <tbody>
                        {
                             orderToBePlaced.map((o, i) => (
                                <tr key={i} className="table-danger">
                                  <td>{i+1}</td>
                                  <td>{o.title}</td>
                                  <td>{o.quantity}&nbsp;{o.unit}</td>
                                  <td>{o.parLevel}</td>
                                </tr>
                             ))
                                
                        }
                      </tbody>
                    </table>
                </div>


                <div className='col-md-12'>
                      <h4>Manage Users</h4>
                        <table className='table table-bordered table-success'>
                          <thead>
                           <tr>
                            <th>S.N</th>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Email</th>
                            <th>Manage</th>
                           </tr>
                          </thead>
                          <tbody>
                            {
                                 usersArr.map((o, i) => (
                                   <tr key={i}>
                                     <td>{i+1}</td>
                                     <td>{o.name}</td>
                                     <td>{o.position}</td>
                                     <td>{o.email}</td>
                                     <td>
                                       <NavLink to="/manageuser" className="btn btn-md btn-success">Edit</NavLink>&nbsp;
                                       <NavLink to="/manageuser" className="btn btn-md btn-success">Delete</NavLink>
                                     </td>
                                   </tr>
                                 )) 
                            }
                          </tbody>
                        </table>
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