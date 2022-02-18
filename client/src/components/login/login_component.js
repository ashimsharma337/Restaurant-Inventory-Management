import React from 'react';
import { useState } from 'react';
import Header from '../headers/header_component';
import Footer from '../footers/footer_component';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';




const Login = () => {
  
  const navigate = useNavigate();
  const [data, setData] = useState({
       email: "",
       password: ""
  });

  

  const handleChange = (e) => {
    const {name, value} = e.target;

    setData({
      ...data,  
      [name]: value
    });

  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    axios.post(process.env.REACT_APP_BASE_URL+"/login",
         {
           email: data.email,
           password: data.password
         },
         {
           responseType: "json",
           headers: {
             "content-type": "application/json"
           },
           timeout: 30000,
           timeoutErrorMessage: "Request timeout"
         }   
    )
    .then((response) => {
        const result = response.data;

        if(result.status === 400){
           toast.error(result.msg);

        } else if(result.status === 200){
          localStorage.setItem("token", result.token);
          navigate("/dashboard");

        }
         else {
          toast.error(result.msg);
         }
    })
    .catch((error) => {
      console.log("Error: ", error);
    })
    
  }

  return (
    <>
     <Header/>
       <div className='container'>
          <h4 className='mt-3'>Please Enter Your Information to Login</h4>
          <hr></hr>
          <form>
              <div className="row mb-3">
                <label htmlFor="email" className="col-sm-2 col-form-label">Email</label>
                <div className="col-sm-10">
                  <input type="email" name="email" onChange={handleChange} className="form-control" placeholder="Enter Email"/>
                </div>
              </div>
              <div className="row mb-3">
                <label htmlFor="password" className="col-sm-2 col-form-label">Password</label>
                <div className="col-sm-10">
                  <input type="password" name="password"  onChange={handleChange} className="form-control" placeholder="Enter Password"/>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-10 offset-sm-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="gridCheck1"/>
                    <label className="form-check-label" htmlFor="gridCheck1">
                      Remember Me
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" onClick={handleSubmit} className="btn btn-primary mb-3">Log In</button>
          </form>
       </div>
     <Footer/>
     <Toaster/>
    </>
  )
}

export default Login