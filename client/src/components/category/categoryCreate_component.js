import React, {useEffect, useState} from 'react';
import HeaderN from '../dashboard/common/header/header_component';
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import { MdSend } from "react-icons/md";
import { httpRequest } from '../../services/httpclient';

const AddCategory = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
    
    const [title, setTitle] = useState("");
    const [parent_id, setParent_id] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [isLoading, setIsLoding] = useState(true);
    
    useEffect(() => {
      httpRequest.getItems("/category")
      .then((response) => {
        //console.log(response.data.result);
        if(response.data.result.length > 0 ){

          let allparents = response.data.result.filter((o) => (o.parent_id === null));
          console.log(allparents);
          setAllCategories(allparents);
          //console.log(response);
        }
      })
      .catch((error) => {
        console.log(error);
      })
    },[isLoading]);

    //console.log(allCategories);
    
    const handleSubmit = (e) => {
      const data = {
        title: title,
        parent_id: parent_id
      };

      console.log(data);
      httpRequest.postItem("/category", data, true)
      .then((response) => {
           console.log(response);
      })
      .catch((error) => {
           console.log(error);
      })
    }


  return (
    <>
      <HeaderN/>
      <div className='container-fluid'>
        <div className='row'>
           <Sidebar/>
              <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                  <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 className="h2">Dashboard</h1>
                    <span>Hi, {userInfo.name} Welcome!</span>
                    <div className="btn-toolbar mb-2 mb-md-0">
                      <div className="btn-group me-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                      </div>
                    </div>
                  </div>

                  <h4>Add category</h4>
                  <hr></hr>
                  <div className='container-fluid'>
                    <div className='row'>
                      <div className="col-md-12">
                        <label htmlFor="Title mt-3" className= "col-md-3 h4">Product-Name:</label>
                        <input type="text" name="title" className='col-md-9 mt-3' onChange={(e) => setTitle(e.target.value)} placeholder='Enter Category Name'></input>
                      </div>
                    </div>

                    <div className='row'>
                      <div className="col-md-12">
                        <label htmlFor="parenId mt-3" className= "col-md-3 h4">Child of:</label>
                        <select type="text" name="parent_id" className='col-md-9 mt-3' onChange={(e) => setParent_id(e.target.value)} placeholder='Enter Category type'>
                          <option value="">Choose One</option>
                          {
                               allCategories.map((cat, index) => (
                                 <option key={index} value={cat.id}>
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
    </>
  )
}

export default AddCategory