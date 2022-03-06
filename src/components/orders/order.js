
import React, { useState, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import HeaderN  from "../dashboard/common/header/header_component";
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import Heading from "../dashboard/common/heading/heading";
import ReactToPrint from 'react-to-print';



const Order = () => {
    const componentRef = useRef();

    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        title: "",
        quantity: "",
        unit: "",
        price: "",
        vendor: ""
    });

    const handleChange = (e) => {
          const {name, value} = e.target;

          setNewProduct({ ...newProduct, [name]: value });
         
          
    };

    const handleClick = () => {
          setProducts([...products, newProduct]);
          setNewProduct({
              title: "",
              quantity: "",
              unit: "",
              price: "",
              vendor: ""
          });
          toast.success("Order added successfully.")
    };


  return (
    <>
      <HeaderN/>


       <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <Heading/>

              <h4>Create Order</h4>
              <hr></hr>
              <ReactToPrint 
                  trigger={() =>  <button className='btn btn-sm btn-primary mb-2'>Print the order table.</button>}
                  content= {() => componentRef.current}
                  documentTitle="New order"
                  pageStyle="print"
              
              />
              <div className="container-fluid">
                  <table ref={componentRef} className="table table-secondary table-bordered">
                     <thead>
                         <tr>
                             <th>S.N</th>
                             <th>Item</th>
                             <th>Quantity</th>
                             <th>Unit</th>
                             <th>Unit Price</th>
                             <th>Vendor</th>
                             <th>Total Price</th>
                         </tr>
                     </thead>
                     <tbody>
                         {
                                    products.map((product, i) => (
                                        <tr key={i}>
                                            <td>{i+1}</td>
                                            <td>{product.title}</td>
                                            <td>{product.quantity}</td>
                                            <td>{product.unit}</td>
                                            <td>$&nbsp;{product.price}</td>
                                            <td>{product.vendor}</td>
                                            <td>$&nbsp;{product.price*product.quantity}</td>
                                        </tr>
                                        
                                    ))
                                  
                         }
                     </tbody>
                  </table>
                  <div className='container-fluid mt-5'>
                  <div className='row'>
                   
                        <div className='col-sm-3'>
                            <label>Item Name:</label>
                            <input onChange={handleChange} value={newProduct.title} name="title"  type="text"></input>
                        </div>
                        <div className='col-sm-3'>
                            <label>Quantity:</label>
                            <input onChange={handleChange} value={newProduct.quantity} name="quantity" type="number"></input>
                        </div>
                        <div className='col-sm-3'>
                            <label>Unit:</label>
                            <input onChange={handleChange} value={newProduct.unit} name="unit" type="text"></input>
                        </div>
                        <div className='col-sm-3'>
                            <label>Unit Price:</label>
                            <input onChange={handleChange} value={newProduct.price} name="price" type="number"></input>
                        </div>
                        <div className='col-sm-3'>
                            <label >Vendor:</label>
                            <input onChange={handleChange} value={newProduct.vendor} name="vendor" type="text"></input>
                        </div>
                        <div className='col-sm-3'>
                            <button type='submit' onClick={handleClick} className='btn btn-sm btn-primary mt-3'>submit</button>
                        </div>
                    
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

export default Order;