import React, {useEffect, useState } from 'react';
import HeaderN from '../dashboard/common/header/header_component';
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import { MdSend } from "react-icons/md";
import { httpRequest } from '../../services/httpclient';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate,  useParams } from 'react-router-dom';
import Heading from '../dashboard/common/heading/heading';

const EditCategory = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
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
        httpRequest.getItems("/category")
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
           console.log(response);
           toast.success("Category updated successfully!"); 
      })
      .catch((error) => {
           console.log(error);
      })
    }

    
  return (
    <>
      <Heading/>
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
                        <select type="text" name="parent_id" defaultValue={category.parent_id || ""} className='col-md-9 mt-3' onChange={(e) => {
                          return setParent_id(e.target.value)
                        }} placeholder='Enter Category type'>
                          <option value="">Choose One</option>
                          <option value="">None</option>
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
                        <button type='submit' onClick={handleSubmit} className='btn btn-sm btn-primary'><MdSend/>&nbsp;Send</button>
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

export default EditCategory