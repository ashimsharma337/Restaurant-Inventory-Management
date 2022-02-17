import React from 'react';
import { useState } from 'react';
import Header from '../headers/header_component';
import Footer from '../footers/footer_component';
import { useNavigate } from 'react-router-dom';




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
    console.log("Data: ", data);
    localStorage.setItem("is_loggedIn", true);
    
    const is_loggedIn = localStorage.getItem("is_loggedIn");
    if(is_loggedIn){
      navigate("/dashboard");
  
    }
    console.log(is_loggedIn);
    
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
    </>
  )
}

export default Login