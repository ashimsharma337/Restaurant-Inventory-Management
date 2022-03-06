import React from 'react'

const Heading = () => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
  return (
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h4 style={{fontFamily: "cursive", fontWeight: "bold"}}>My Dashboard</h4>
                <span style={{fontFamily: "cursive", fontWeight: "bold"}}>Hi, {userInfo.name} Welcome!</span>
            </div>
  )
}

export default Heading;