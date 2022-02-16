import React from 'react';
import Header from '../headers/header_component';
import Footer from '../footers/footer_component';

const Register = () => {
  return (
      
    <>
    <Header/>
    <div className="container mt-2">
      <form className="row g-3">
          <div className="col-12">
            <label for="name" className="form-label">Name</label>
            <input type="text" className="form-control" placeholder="Enter Name"/>
          </div>
          <div className="col-md-6">
            <label for="email" className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter Email"/>
          </div>
          <div className="col-md-3">
            <label for="Password" className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Enter Password"/>
          </div>
          <div className="col-md-3">
            <label for="cPassword" className="form-label">Re-Password</label>
            <input type="cpassword" className="form-control" placeholder="Enter Password"/>
          </div>
          <div className="col-md-12">
            <label for="position" className="form-label">Position</label>
            <select id="position" className="form-select">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div className="col-md-12">
            <label for="status" className="form-label">Status</label>
            <select id="status" className="form-select">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div className="col-md-12">
            <label for="restaurantName" className="form-label">Restaurant Name</label>
            <input type="text" className="form-control" placeholder="Enter Restaurant Name"/>
          </div>
          <div className="col-12 mb-3">
            <button type="submit" className="btn btn-primary">Sign in</button>
          </div>
      </form>
    </div>
    <Footer/>
    </>
  )
}

export default Register