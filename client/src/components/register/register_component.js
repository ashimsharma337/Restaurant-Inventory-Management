import React, { useEffect, useState } from 'react';
import MainHeader from '../headers/header_component';
import Footer from '../footers/footer_component';
import { httpRequest } from '../../services/httpclient';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState({
        name: "",
        email: "",
        password: "",
        cpassword: "",
        position: "",
        restaurantName: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);


  const handleChange = (e) => {
    const {value, name} = e.target;

    setUserDetail({

          ...userDetail,
          [name]: value
  
    })
  }

  

  const handleSubmit = (e) => {
    e.preventDefault();
    //console.log(userDetail);
    setErrors(validateForm(userDetail));
    setIsSubmit(true);
    //console.log(errors);
    
  }
  
  useEffect(() => {
    console.log(errors);
     if(Object.keys(errors).length === 0 && isSubmit){
       // console.log(userDetail);
       httpRequest.postItem("/register", userDetail, true)
       .then((success) => {
         navigate('/login');
       })
       .catch((error) => {
         console.log((error));
       })
     }
  }, [errors])

  const validateForm = (values) => {
        let errors = {};
        var pattern =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!values.name){
          errors.name = "Name is required";
        } 
        if(!values.email){
          errors.email = "Email is required";
        } else if (!pattern.test(values.email)){
          errors.email = "Invalid Email!";
        }
        if(values.position == ''){
          errors.position = "position is required";
        }
        if(!values.password){
          errors.password = "Password is required";
        } else if (values.password.length < 6) {
          errors.password = "Password must be at least six character!";
        }
        if(!values.cpassword){
          errors.cpassword = "Re-Password is required";
        } else if(values.password != values.cpassword){
          errors.cpassword = "Password and Re-Password must matched!"
        }
        if(!values.restaurantName){
          errors.restaurantName = "Restaurant name is required";
        }
        return errors;
  }

  return (
      
    <>
    <MainHeader/>
    <div className="container mt-2">
      <form className="row g-3">
          <div className="col-12">
            <label className="form-label">Name</label>
            <input onChange={handleChange} name="name" type="text" className="form-control" placeholder="Enter Name"/>
            <span className='text-danger'>{errors.name}</span>
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input onChange={handleChange} name="email" type="email" className="form-control" placeholder="Enter Email"/>
            <span className='text-danger'>{errors.email}</span>
          </div>
          <div className="col-md-3">
            <label className="form-label">Password</label>
            <input onChange={handleChange} name="password" type="password" className="form-control" placeholder="Enter Password"/>
            <span className='text-danger'>{errors.password}</span>
          </div>
          <div className="col-md-3">
            <label className="form-label">Re-Password</label>
            <input onChange={handleChange} name="cpassword" type="password" className="form-control" placeholder="Enter Password"/>
            <span className='text-danger'>{errors.cpassword}</span>
          </div>
          <div className="col-md-12">
            <label className="form-label">Position</label>
            <select name="position" onChange={handleChange} className="form-select">
              <option value="">Choose...</option>
              <option value="general-manager">General-Manager</option>
              <option value="kitchen-manager">Kitchen-Manager</option>
              <option value="supervisor">Supervisor</option>
            </select>
            <span className='text-danger'>{errors.position}</span>
          </div>
          <div className="col-md-12">
            <label className="form-label">Restaurant Name</label>
            <input onChange={handleChange} name="restaurantName" type="text" className="form-control" placeholder="Enter Restaurant Name"/>
            <span className='text-danger'>{errors.restaurantName}</span>
          </div>
          <div className="col-12 mb-3">
            <button onClick={handleSubmit} type="submit" className="btn btn-primary">Register</button>
          </div>
      </form>
    </div>
    <Footer/>
    
    </>
  )
}

export default Register