
import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { GiConfirmed } from "react-icons/gi";
import { useNavigate, useParams } from 'react-router-dom';
import { httpRequest } from '../../services/httpclient';
import HeaderN  from "../dashboard/common/header/header_component";
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import Heading from "../dashboard/common/heading/heading";

const Vendor = () => {
  
   

  return (
    <>
      <HeaderN/>


       <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <Heading/>

              <h4>Vendors</h4>
              <hr></hr>
        
              <div className="container-fluid">
                  <table className="table table-secondary table-bordered">
                     <thead>
                         <tr>
                             <th>S.N</th>
                             <th>Name</th>
                             <th>Contact Number</th>
                             <th>Fax Number</th>
                             <th>Email Id</th>
                         </tr>
                     </thead>
                     <tbody>
                         
                     </tbody>
                  </table>
              </div>
            </main>
          </div>
        </div>

      <Toaster/>


    </>
  )
}

export default Vendor;