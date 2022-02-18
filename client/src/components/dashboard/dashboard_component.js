import React, { useEffect } from 'react';
import { MdSpaceDashboard, MdList, MdShoppingCart, MdPeopleAlt, MdAdd } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import HeaderN from './common/header/header_component';
import Sidebar from './common/sidebar/sidebar_component';

const Dashboard = () => {
  const userInfo = JSON.parse(localStorage.getItem("user_info"));
  

  useEffect(() => {
    toast.success('Welcome to Dashboard!');
  }, []);

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

              <h2>Product Page</h2>
              <div className="table-responsive">
                <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Category</th>
                      <th scope="col">Vender</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Price</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1,001</td>
                      <td>random</td>
                      <td>data</td>
                      <td>placeholder</td>
                      <td>text</td>
                      <td>text</td>
                    </tr>
                    <tr>
                      <td>1,002</td>
                      <td>placeholder</td>
                      <td>irrelevant</td>
                      <td>visual</td>
                      <td>layout</td>
                      <td>text</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
        <Toaster />

    </>
  )
}

export default Dashboard