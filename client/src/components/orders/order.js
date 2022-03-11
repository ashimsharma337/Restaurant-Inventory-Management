
import React, { useState, useRef, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Header  from "../dashboard/common/header/header_component";
import Sidebar from '../dashboard/common/sidebar/sidebar_component';
import Heading from "../dashboard/common/heading/heading";
import ReactToPrint from 'react-to-print';
import { useDispatch, useSelector } from "react-redux";
import { getOrders, getProducts, getUsers, setOrders } from "../../redux/actions/actions";
import { Navigate, useNavigate } from 'react-router-dom';
import { httpRequest } from '../../services/httpclient';




const Order = () => {
    const componentRef = useRef();

    const navigate = useNavigate("/orders");

    const data = useSelector((state) => state);

    const dispatch = useDispatch();

    useEffect(() => {

        dispatch(getProducts());
        dispatch(getUsers());
        // dispatch(getOrders());

    }, []);

   

    
    //console.log("Data ", data);
    
    let productsArr = data.allProducts.products;
    // let usersArr = data.allUsers.users;
    // let ordersArr = data.allOrders.orders;

    

    const [order, setOrder] = useState({
        orderItem: "",
        quantity: 0
    })
    
    const [orderList, setOrderList] = useState([]);
    const [preOrder, setPreorder] = useState([]);
    
    const [preDate, setPreDate] = useState();
 
    const handleChange = (e) => {
         const {name, value} = e.target;
         setOrder({
             ...order,
             [name]: value
         });
    }
    
    var addedOrder;
    const handleClick = () => {
        
        const user = JSON.parse(localStorage.getItem("user_info"));
        
        productsArr.filter(function(item) {
            if (item.title == order.orderItem) {
                
                let itemPrice = item.price;
                let unit = item.unit;

                addedOrder = {
                         OrderItem: item.title,
                         quantity: order.quantity,
                         unit: unit,
                         unitPrice: itemPrice,
                         totalPrice: (order.quantity*itemPrice),
                         userName: user.name
                };
               
                
                setOrderList([...orderList, addedOrder]);
                
            
            }
         });
          
    };
    
    useEffect(() => {
        setOrders(orderList);
    }, [orderList]);
    
    console.log("Added order: ", orderList);

    let total = 0;
    orderList.forEach((item) => {
        total = total + item.totalPrice;
    })
    console.log("Total: ", total);

    let preTotal = 0;
    preOrder.forEach((item) => {
        preTotal = preTotal + item.totalPrice;
    })

    const sendOrder = () => {
        dispatch(setOrders(orderList));
        toast.success("Your order has been placed successfully.");
        setOrderList([]);
        setPreorder([]);
    };

    const handlePreOrder = (e) => {

        httpRequest.getItems("/orders", true)
        .then((response) => {

            setPreorder(response.data.result.items[0]);
            setPreDate(response.data.result.created);

        })
        .catch((error) => {
            console.log("Error: ", error);
        })
    }
   console.log("preOrder: ", preOrder);
   
  return (
    <>
      <Header/>


       <div className="container-fluid">
          <div className="row">
            <Sidebar/>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <Heading/>

              
              <ReactToPrint 
                  trigger={() =>  <button className='btn btn-sm btn-primary mb-2'>Print the order table.</button>}
                  content= {() => componentRef.current}
                  documentTitle="New order"
                  pageStyle="print"
              
              />
              
              <h4>Create Order</h4>
              <hr></hr>
              <div className="container-fluid">
                  <table ref={componentRef} className="table table-secondary table-bordered">
                     <thead>
                         <tr>
                             <th>S.N</th>
                             <th>Item</th>
                             <th>Quantity</th>
                             <th>Unit Price</th>
                             <th>Total Price</th>
                             <th>Ordered By</th>
                         </tr>
                     </thead>
                     <tbody>
                         {
                                    orderList.map((order, i) => (
                                        <tr key={i}>
                                            <td>{i+1}</td>
                                            <td>{order.OrderItem}</td>
                                            <td>{order.quantity}&nbsp;{order.unit}</td>
                                            <td>$&nbsp;{order.unitPrice}</td>
                                            <td>$&nbsp;{order.totalPrice}</td>
                                            <td>{order.userName}</td>
                                        </tr>
                                        
                                    ))
                                  
                         }
                     </tbody>
                     <tfoot>
                         <tr>
                             <td>Total</td>
                             <td>{orderList.length}</td>
                             <td>--</td>
                             <td>--</td>
                             <td>$&nbsp;{total}</td>
                             <td>--</td>
                         </tr>
                     </tfoot>
                  </table>
                  <hr></hr>
                  <div className='container-fluid mt-3'>
                  <div className='row'>
                        <div className='col-sm-3'>
                            <label>Item Name:</label>
                            <select name="orderItem" type="text" onChange={handleChange}>
                               <option>Choose</option>
                               {
                                   productsArr.map((o, i) => (
                                       <option key={i} value={o.title}>{o.title}</option>
                                   ))
                               }
                            </select>
                        </div>
                        <div className='col-sm-3'>
                            <label>Quantity:</label>
                            <input name="quantity" onChange={handleChange} type="number"></input>
                        </div>
                        <div className='col-sm-3'>
                            <button type='submit' onClick={handleClick} className='btn btn-sm btn-primary mt-3'>Add Order Item</button>
                        </div>
                        <div className='col-sm-3'>
                            <button className='btn btn-sm btn-primary  mt-3' onClick={sendOrder}>Send Order</button>
                        </div>
                    
                   </div>
                  </div>
                  <hr></hr>

                  
                  <h4 className='mt-3'>Previous Order</h4><br/>
                  <button className='btn btn-sm btn-primary mb-2' onClick={handlePreOrder}>See Previous Orders</button>
                  <table className="table table-secondary table-bordered">
                     <thead>
                         <tr>
                             <th>S.N</th>
                             <th>Item Name</th>
                             <th>Quantity</th>
                             <th>Unit Price</th>
                             <th>Total Price</th>
                             <th>Ordered By</th>
                         </tr>
                     </thead>
                     <tbody>
                         {
                                    preOrder.map((order, i) => (
                                        <tr key={i}>
                                            <td>{i+1}</td>
                                            <td>{order.OrderItem}</td>
                                            <td>{order.quantity}&nbsp;{order.unit}</td>
                                            <td>$&nbsp;{order.unitPrice}</td>
                                            <td>$&nbsp;{order.totalPrice}</td>
                                            <td>{order.userName}</td>
                                        </tr>
                                        
                                    ))
                                  
                         }
                     </tbody>
                     <tfoot>
                         <tr>
                             <td>Total</td>
                             <td>{preOrder.length}</td>
                             <td>--</td>
                             <td>--</td>
                             <td>$&nbsp;{preTotal}</td>
                             <td>Order At&nbsp;{preDate}</td>
                         </tr>
                     </tfoot>
                  </table>
            
              </div>
            </main>
          </div>
        </div>
      <Toaster/>


    </>
  )
}

export default Order;