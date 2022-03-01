import "../footers/footer_component.css";
import React from 'react';
import {
  MDBFooter,
  MDBContainer,
  MDBCol,
  MDBRow,
} from 'mdb-react-ui-kit';
import { IoLogoFacebook, IoLogoInstagram } from "react-icons/io";


export default function Footer() {
  return (
    <MDBFooter bgColor='primary' className='text-white text-center text-lg-left'>
      <MDBContainer className='p-4'>
        <MDBRow>
          <MDBCol lg='6' md='12' className='mb-4 mb-md-0'>
            <h5 className='text-uppercase'>About RESINSO</h5>

            <p>
            RESINSO is a Restaurant Inventory Management Web App which helps to provide information 
            about Restaurant Food, Alcohol, Furniture, and others restaurants equipments in order to 
            keep track of all stuff to minimize cost.
            </p>
          </MDBCol>

          <MDBCol lg='3' md='6' className='mb-4 mb-md-0'>
            <h5 className='text-uppercase'>Customer Care</h5>

            <ul className='list-unstyled mb-0'>
              <li>
                <a href='#!' className='text-white'>
                  Contact Us
                </a>
              </li>
              <li>
                <a href='#!' className='text-white'>
                  FAQs
                </a>
              </li>
            </ul>
          </MDBCol>

          <MDBCol lg='3' md='6' className='mb-4 mb-md-0'>
            <h5 className='text-uppercase mb-0'>Follow</h5>

            <ul className='list-unstyled'>
              <li>
                <a href='#!' className='text-white'>
                <IoLogoFacebook/>&nbsp;Facebook
                </a>
              </li>
              <li>
                <a href='#!' className='text-white'>
                  <IoLogoInstagram/>&nbsp;Instagram
                </a>
              </li>
            </ul>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      <div className='text-center p-3' style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        &copy; {new Date().getFullYear()} Copyright:{' '}
        <a className='text-white' href='https://mdbootstrap.com/'>
          MDBootstrap.com
        </a>
      </div>
    </MDBFooter>
  );
}