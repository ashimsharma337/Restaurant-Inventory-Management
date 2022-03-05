
import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { MdSend } from "react-icons/md";
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { httpRequest } from '../../services/httpclient';
import HeaderN  from "../dashboard/common/header/header_component";
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import Heading from "../dashboard/common/heading/heading";

const EditQuantity = () => {
  let params = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState({

        title: "",
        quantity: 0,
  });


  useEffect(() => {
        httpRequest.getItemById("/products/"+params.id, true)
        .then((response) => {
      
          let product = response.data.result;
          setProductData(product);
          
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
        
        httpRequest.updateQuantityById(process.env.REACT_APP_BASE_URL+"/products/"+params.id, productData, true)
        .then((success) => {
             navigate("/dashboard");
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
              <Heading/>

              <h4>Add Quantity</h4>
              <hr></hr>
              <div className="container-fluid">
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Item-Name:</label>
                          <input name="title" defaultValue = {productData.title || ""}  onChange={handleChange} type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Quantity:</label>
                          <input name="quantity" defaultValue = {productData.quantity || ""} onChange={handleChange} type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  
                  
                  <div className="row mb-3">
                      <div className="offset-md-3 col-md-9">
                          <button type="submit" onClick={handleSubmit} className="btn btn-md btn-dark mt-3"><MdSend/>&nbsp;Send</button>
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

export default EditQuantity;