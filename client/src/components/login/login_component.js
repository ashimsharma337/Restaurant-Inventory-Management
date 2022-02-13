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
                <label for="inputEmail3" className="col-sm-2 col-form-label">Email</label>
                <div className="col-sm-10">
                  <input type="email" className="form-control" id="inputEmail3"/>
                </div>
              </div>
              <div className="row mb-3">
                <label for="inputPassword3" className="col-sm-2 col-form-label">Password</label>
                <div className="col-sm-10">
                  <input type="password" className="form-control" id="inputPassword3"/>
                </div>
              </div>
              <fieldset className="row mb-3">
                <legend className="col-form-label col-sm-2 pt-0">Postion</legend>
                <div className="col-sm-10">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="gridRadios" id="gridRadios1" value="option1" checked/>
                    <label className="form-check-label" for="gridRadios1">
                      General-Manager
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="option2"/>
                    <label className="form-check-label" for="gridRadios2">
                      Kitchen-Manager
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="gridRadios" id="gridRadios3" value="option3"/>
                    <label className="form-check-label" for="gridRadios3">
                      Supervisor
                    </label>
                  </div>
                </div>
              </fieldset>
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