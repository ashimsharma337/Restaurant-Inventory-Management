import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { MdAdd } from "react-icons/md";
import { httpRequest } from '../../services/httpclient';
import HeaderN  from "../dashboard/common/header/header_component";
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import Heading from "../dashboard/common/heading/heading";

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

  const [images, setImages] = useState([]);

  const [newProduct, setNewProduct] = useState({});

  useEffect(() => {
        httpRequest.getItems("/category")
        .then((response) => {
          setCategories(response.data.result);
          console.log(categories);
        })
        .catch((error) => {
          console.log(error);
        })
  },[]);

  const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        console.log("type", type);
        console.log("files", files);

        if(type == "file"){
          let {filesToUpload} = images;

          filesToUpload = Object.keys(files).map((key) => files[key]);

          setImages(filesToUpload);
        } else {
          setProductData({

            ...productData,
            [name]: value

          });
        }
    
  }
        


  const handleSubmit = (e) => {
        e.preventDefault();

        let formData = new FormData();
        
        // file data
        images.map((obj) => {
           formData.append("image", obj, obj.name);
        })
        
        // product data
        for(let key in productData){
            formData.append(key, productData[key])
        }

        
      
       
        httpRequest.postItem(process.env.REACT_APP_BASE_URL+"/products", formData, true)
        .then((success) => {
             toast.success("Product added successfully.");
             console.log(success);
        })
        .catch((error) => {
             toast.error(error);
        })
  };


  return (
    <>
      <HeaderN/>


       <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <Heading/>

              <h4>Add Product</h4>
              <hr></hr>
              <form>
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
                  <div className="row mb-3">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Unit Price:</label>
                          <input name="price" onChange={handleChange} type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row mb-3">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Par Level:</label>
                          <input name="parLevel" onChange={handleChange} type="number" className="col-md-9"></input>
                      </div>
                  </div>
                  <div className="row mb-3">
                      <div className="col-md-12">
                          <label className="col-md-3 h4">Image(optional):</label>
                          <input name="image" onChange={handleChange} type="file" className="col-md-9" multiple></input>
                      </div>
                  </div>
                  <div className="row">
                     {
                       images.map((image, i) => (
                         <div key={i} className="col-md-3">
                           <img src={URL.createObjectURL(image)} className='img img-fluid img-thumbnail'/>
                         </div>
                       ))
                     }
                  </div>
                  
                  
                  <div className="row mb-3">
                      <div className="offset-md-3 col-md-9">
                          <button type="submit" onClick={handleSubmit} className="btn btn-md btn-dark mt-3"><MdAdd/>&nbsp;Add</button>
                      </div> 
                  </div>
                  
              </div>
              </form>
            </main>
          </div>
        </div>

      <Toaster/>


    </>
  )
}

export default AddProduct;