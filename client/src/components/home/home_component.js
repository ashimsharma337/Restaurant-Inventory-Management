import React from 'react';
import "../../components/home/home_component.css";
import MainHeader from "../headers/header_component";
import Footer from "../footers/footer_component";
import inventoryImage from "../../assets/inventory_image.webp"

const Home = () => {
  return (
    <>
     <MainHeader/>
      <div className='container-fluid' id="homeContainer">
        <div className='row'>
            <div className="col-sm-3">
                <h4>All Resturants solution</h4>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                  Necessitatibus iusto molestiae vitae ducimus ex! Aliquam odio quia 
                  repellendus exercitationem unde porro sapiente molestias, dolores vitae ad 
                  debitis culpa natus ut?</p>
            </div>
            <div className="col-sm-6">
                <h4>Helping Resuraurant Since 1990</h4>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
                  Tempore architecto, eveniet, aperiam id distinctio consequatur,
                  dolore praesentium fuga est harum consequuntur eum dignissimos modi! 
                  Sequi libero aliquid eveniet doloremque magnam?</p>
            </div>
            <div className="col-sm-3">
                <h4>Remember Us For</h4>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                  Necessitatibus iusto molestiae vitae ducimus ex! Aliquam odio quia 
                  repellendus exercitationem unde porro sapiente molestias, dolores vitae ad 
                  debitis culpa natus ut?</p>
            </div>
            {/* <div className="col-sm-3">
              <h4>Success Story</h4>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
              Necessitatibus iusto molestiae vitae ducimus ex! Aliquam odio quia 
              repellendus exercitationem unde porro sapiente molestias, dolores vitae ad 
              debitis culpa natus ut?</p>
          </div> */}
          <div className="col-sm-12">
                <img src={inventoryImage} style={{maxHeight:"100%", maxWidth:"100%"}}/>
            </div>
        </div>
      </div>
      <Footer/>
    </>
  ) 
}

export default Home