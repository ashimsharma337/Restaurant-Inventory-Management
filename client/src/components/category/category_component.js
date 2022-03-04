import React, { useEffect, useState } from 'react';
import HeaderN from '../dashboard/common/header/header_component';
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import { MdSend, MdEdit, MdOutlineDeleteForever } from "react-icons/md";
import { httpRequest } from "../../services/httpclient";
import toast, { Toaster } from 'react-hot-toast';
import { NavLink } from "react-router-dom";
import Heading from '../dashboard/common/heading/heading';
import DashboardHeader from '../dashboard/common/header/header_component';

const Category = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
     
    const [allCategories, setAllCategories] = useState([]);

    // Fetch all the categories from server
    useEffect(() => {
       httpRequest.getItems("/category")
       .then((response) => {
           let categoryList = response.data.result;
           setAllCategories(categoryList);
           // console.log(allCategories);
       })
       .catch((error) => {
           console.log(error);
       })

    },[]);

    const handleDelete = (index, catId) => {
      httpRequest.deleteItem("/category/"+catId, true)
      .then((response) => {
        //  if(response.result.status == 200){
           // ToDo: axios call to get data
           let new_categories = allCategories.filter((o, i) => (i !== index))
           setAllCategories(new_categories);
           toast.success("Category deleted successfully.");
           
        //  } else {
        //    toast.error(response.data.msg);
        //  }
      })
      .catch((error) => {
           toast.error(error);
      })
    }

  return (
    <>
      <DashboardHeader/>
      <div className='container-fluid'>
        <div className='row'>
           <Sidebar/>
              <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                  <Heading/>

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
                    {
                      allCategories.map((o, i) => (
                        <tr key={i}>
                          <td>{i+1}</td>
                          <td>{o.title}</td>
                          <td>{o.parent_id ? o.parent_id.title : "-"}</td>
                          <td>
                          
                            <NavLink to={"/category/"+o._id} className='btn btn-sm btn-warning'><MdEdit/>&nbsp;Edit</NavLink>&nbsp;
                            <button className='btn btn-sm btn-danger' onClick={(event) => {
                              let confirmed = window.confirm("Are you sure you want to delete this category?");
                              if(confirmed){
                              return handleDelete(i, o._id);
                              }
                            }}><MdOutlineDeleteForever/>&nbsp;Delete</button>
                          
                          </td>
                        </tr>
                      ))
                    }
                      
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

export default Category