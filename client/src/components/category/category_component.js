import React, { useEffect } from 'react';
import HeaderN from '../dashboard/common/header/header_component';
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import { MdSend } from "react-icons/md";
import { httpRequest } from "../../services/httpclient";

const Category = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
     
    // Fetch all the categories from server
    useEffect(() => {
       httpRequest.getItems("/category")
       .then((response) => {
           console.log(response);
       })
       .catch((error) => {
           console.log(error);
       })
    });

  return (
    <>
      <HeaderN/>
      <div className='container-fluid'>
        <div className='row'>
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

                  <h4>All category</h4>
                  <hr></hr>
                  <div className='container-fluid'>
                  <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th scope="col">S.N</th>
                      <th scope="col">Category</th>
                      <th scope="col">Parent-Category</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      <tr>
                      <td>1</td>
                      <td>random</td>
                      <td>data</td>
                      <td>placeholder</td>
                    </tr>
                  </tbody>
                 </table>
                </div>
               </main>
             </div>
        </div>
    </>
  )
}

export default Category