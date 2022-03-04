import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { MdSend } from "react-icons/md";
import { useParams } from 'react-router-dom';
import { httpRequest } from '../../services/httpclient';
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import Heading from "../dashboard/common/heading/heading";
import DashboardHeader from '../dashboard/common/header/header_component';

const EditProduct = () => {
  let params = useParams();
  const [productData, setProductData] = useState({

        title: "",
        category_id: "",
        vendor: "",
        quantity: 0,
        unit: "",
        price: 0,
        image:[]
  });

  const [categories, setCategories] = useState([]);


  useEffect(() => {
       httpRequest.getItems("/category")
       .then((categories) => {
         console.log("Categories: ", categories);
         let allCategory = categories.data.result;
         setCategories(allCategory);
       })
       .catch((error) => {
         console.log("Error: ", error);
       })
  },[])

  useEffect(() => {
        httpRequest.getItemById("/products/"+params.id)
        .then((response) => {
      
          let product = response.data.result;
          setProductData(product);
          
        })
        .catch((error) => {
          console.log(error);
        })
  },[])

  const handleChange = (e) => {
        const { name, value, type, files} = e.target;
    
        // if(type == "file"){
        //   let {filesToUpload} = images;

        //   filesToUpload = Object.keys(files).map((key) => files[key]);

        //   setImages(filesToUpload);
        // } else {
          setProductData({

            ...productData,
            [name]: value

          });
        // }
  }

  const handleSubmit = (e) => {
        
        httpRequest.updateById(process.env.REACT_APP_BASE_URL+"/products/"+params.id, productData, true)
        .then((success) => {
             toast.success("Product updated successfully.");
             console.log(success);
        })
        .catch((error) => {
             toast.error(error);
        })
  }


  return (
    <>
      <DashboardHeader/>


       <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <Heading/>

              <h4>Edit Product</h4>
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
                          <label className="col-md-3 h4">Category:</label>
                          <select name="category_id" defaultValue = {productData.category_id || ""} onChange={handleChange} type="text" className="col-md-9">
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
                          <input name="vendor" defaultValue = {productData.vendor || ""} onChange={handleChange} type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Quantity:</label>
                          <input name="quantity" defaultValue = {productData.quantity || ""} onChange={handleChange} type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Unit:</label>
                          <input name="unit" onChange={handleChange} defaultValue = {productData.unit || ""} type="text" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Price:</label>
                          <input name="price" onChange={handleChange} defaultValue = {productData.price || ""} type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row mb-3">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Image:</label>
                          <input name="image" onChange={handleChange} defaultValue = {productData.image || ""} type="file" className="col-md-9" multiple></input>
                      </div>
                  </div>
                  {/* <div className="row">
                     {
                       productData.image.map((image, i) => (
                         <div key={i} className="col-md-3">
                           <img src={URL.createObjectURL(image)} className='img img-fluid img-thumbnail'/>
                         </div>
                       ))
                     }
                  </div> */}
                  
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

export default EditProduct;