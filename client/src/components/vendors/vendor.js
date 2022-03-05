import React, { useEffect, useRef } from 'react';
import HeaderN  from "../dashboard/common/header/header_component";
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import Heading from "../dashboard/common/heading/heading";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../redux/actions/productActions";
import ReactToPrint from 'react-to-print';

const Vendor = () => {
  const componentRef = useRef();

  const data = useSelector((state) => state);

  const dispatch = useDispatch();
   
  useEffect(() => {

    dispatch(getProducts());

  }, []);
  
  let productsArr = data.allProducts.products;

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
              <ReactToPrint 
                  trigger={() =>  <button className='btn btn-sm btn-primary mb-2'>Print the vendor table.</button>}
                  content= {() => componentRef.current}
                  documentTitle="Vendors"
                  pageStyle="print"
              
              />
        
              <div className="container-fluid">
                  <table ref={componentRef} className="table table-secondary table-bordered">
                     <thead>
                         <tr>
                             <th>S.N</th>
                             <th>Name</th>
                             <th>Contact Number</th>
                         </tr>
                     </thead>
                     <tbody>
                         {
                             productsArr.map((o, i) => (
                             <tr key={i}>
                               <td>{i+1}</td>
                               <td>{o.vendor}</td>
                               <td>{o.vendorInfo}</td>
                             </tr>
                             ))
                         }
                     </tbody>
                  </table>
              </div>
            </main>
          </div>
        </div>


    </>
  )
}

export default Vendor;