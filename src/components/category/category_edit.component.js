import React, {useEffect, useState } from 'react';
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import { GiConfirmed } from "react-icons/gi";
import { httpRequest } from '../../services/httpclient';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate,  useParams } from 'react-router-dom';
import Heading from '../dashboard/common/heading/heading';
import DashboardHeader from '../dashboard/common/header/header_component';

const EditCategory = () => {

    const navigate = useNavigate();
    let params = useParams();
    
    const [category, setCategory] = useState({});
    const [title, setTitle] = useState("");
    const [parent_id, setParent_id] = useState(null);
    const [allParentCat, setAllParentCat] = useState([]);
    
    
    useEffect(() => {
      
      httpRequest.getItemById("category/"+params.id, true)
      .then((response) => {
           setCategory(response.data.result);
      })
      .catch((error) => {
           console.log("Error: ", error);
      })

    },[]);

    useEffect(() => {
        httpRequest.getItems("/category", true)
        .then((response) => {
          
          if(response.data.result.length > 0 ){
  
            let allparents = response.data.result.filter((o) => (o.parent_id === null));

            setAllParentCat(allparents);
    
          }
        })
        .catch((error) => {
          console.log(error);
        })
      },[]);

    useEffect(() => {
        if(category){
            setTitle(category.title);
            setParent_id(category.parent_id);
        } 
    },[category])
    

    const handleSubmit = (e) => {
    
      const data = {
        title: title,
        parent_id: parent_id
      };

      console.log(data);
      
      httpRequest.updateById("/category/"+params.id, data, true)
      .then((response) => {
           navigate("/category");
      })
      .catch((error) => {
           console.log(error);
           toast.danger(error);
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

                  <h4>Edit category</h4>
                  <hr></hr>
                  <div className='container-fluid'>
                    <div className='row'>
                      <div className="col-md-12">
                        <label htmlFor="Title mt-3" className= "col-md-3 h4">Category-Name:</label>
                        <input type="text" name="title" defaultValue={category.title || ""} className='col-md-9 mt-3' onChange={(e) => {
                            return setTitle(e.target.value)
                            }} placeholder='Enter Category Name'></input>
                      </div>
                    </div>

                    <div className='row'>
                      <div className="col-md-12">
                        <label htmlFor="parenId mt-3" className= "col-md-3 h4">Child of:</label>
                        <select type="text" name="parent_id"  className='col-md-9 mt-3' onChange={(e) => {
                          return setParent_id(e.target.value || null)
                        }} defaultValue={category.parent_id || ""} placeholder='Enter Category type'>
                          <option value="" >Choose One</option>
                          <option value="" >This product is a category.</option>
                          {
                               allParentCat.map((cat, index) => (
                                 <option key={index} value={cat._id}>
                                   {cat.title}
                                 </option>
                               ))
                          }
                        </select>
                      </div>
                    </div>

                    <div className='row'>
                      <div className="offset-3 col-md-9 mt-3">
                        <button type='submit' onClick={handleSubmit} className='btn btn-sm btn-primary'><GiConfirmed/>&nbsp;Confirm</button>
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

export default EditCategory;