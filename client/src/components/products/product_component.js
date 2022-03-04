import React, { useEffect, useState } from 'react';
import { MdEdit, MdOutlineDeleteForever } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { NavLink } from 'react-router-dom';
import HeaderN from '../dashboard/common/header/header_component';
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import { httpRequest } from '../../services/httpclient';
import Heading from '../dashboard/common/heading/heading';

const Product = () => {
  const userInfo = JSON.parse(localStorage.getItem("user_info"));
  
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    toast.success('Welcome to Product Page!');
  }, []);

  useEffect(() => {
    httpRequest.getItems("/products")
    .then((response) => {
      // console.log(response.data.result);
      let productList = response.data.result;
      setAllProducts(productList);
      console.log(productList);
    })
    .catch((error) => {
      console.log(error);
    })
  },[])

  const handleDelete = (index, productId) => {
        httpRequest.deleteItem("/products/"+productId, true)
        .then((success) => {
          let new_products = allProducts.filter((o, i) => (i !== index))
          setAllProducts(new_products);
          toast.success("Product deleted successfully.");
        })
        .catch((error) => {
          console.log(error);
          toast.error("Error while deleting product!");
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

              <h4>Product Page</h4>
              <hr></hr>
              <div className='container-fluid'>
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
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      allProducts.map((o, i) => (
                        <tr key={i}>
                          <td>{i+1}</td>
                          <td>{o.title}</td>
                          <td>{o.category_id?.title}</td>
                          <td>{o.vendor}</td>
                          <td>{o.quantity}&nbsp;{o.unit}</td>
                          <td>${o.price}</td>
                          <td>{o.parLevel}</td>
                          <td>

                          <NavLink to={"/product/"+o._id} className='btn btn-sm btn-warning' ><MdEdit/>&nbsp;Edit</NavLink>&nbsp;
                          <button onClick = {(event) => {
                            let confirmed = window.confirm("Are you sure you want want to delete this product?");
                            if(confirmed){
                              return handleDelete(i, o._id);
                            }
                          }} className='btn btn-sm btn-danger'><MdOutlineDeleteForever/>&nbsp;Delete</button>

                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              {/* </div> */}
              </div>
            </main>
          </div>
        </div>
        <Toaster />

    </>
  )
}

export default Product;