import React from 'react';
import Header from '../headers/header_component';
import Footer from '../footers/footer_component';


const Login = () => {
  return (
    <>
     <Header/>
       <div className='container'>
          <h4 className='mt-3'>Please Enter Your Information to Login</h4>
          <hr></hr>
          <form>
              <div className="row mb-3">
                <label for="email" className="col-sm-2 col-form-label">Email</label>
                <div className="col-sm-10">
                  <input type="email" className="form-control" placeholder="Enter Email"/>
                </div>
              </div>
              <div className="row mb-3">
                <label for="password" className="col-sm-2 col-form-label">Password</label>
                <div className="col-sm-10">
                  <input type="password" className="form-control" placeholder="Enter Password"/>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-10 offset-sm-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="gridCheck1"/>
                    <label className="form-check-label" for="gridCheck1">
                      Remember Me
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary mb-3">Sign in</button>
          </form>
       </div>
     <Footer/>
    </>
  )
}

export default Login