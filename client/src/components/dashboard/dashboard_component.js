import React from 'react'
import { MdSpaceDashboard, MdList, MdShoppingCart, MdPeopleAlt } from "react-icons/md"

const Dashboard = () => {
  return (
    <>
      <header className="navbar navbar-dark sticky-top bg-primary flex-md-nowrap p-0 shadow">
         <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#">Company name</a>
            <button className="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search"/>
            <div className="navbar-nav">
              <div className="nav-item text-nowrap">
                <a className="nav-link px-3" href="#">Sign out</a>
              </div>
            </div>
       </header>

        <div className="container-fluid">
          <div className="row">
            <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
              <div className="position-sticky pt-3">
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">
                    <MdSpaceDashboard/>&nbsp;
                      Dashboard
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                    <MdList/>&nbsp;
                      Orders
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                    <MdShoppingCart/>&nbsp;
                      Products
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      <MdPeopleAlt/>&nbsp;
                      Customers
                    </a>
                  </li>
                </ul>
              </div>
            </nav>

            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Dashboard</h1>
                <span>Hi, John Doe Welcome!</span>
                <div className="btn-toolbar mb-2 mb-md-0">
                  <div className="btn-group me-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                  </div>
                </div>
              </div>

              <h2>Section title</h2>
              <div className="table-responsive">
                <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Header</th>
                      <th scope="col">Header</th>
                      <th scope="col">Header</th>
                      <th scope="col">Header</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1,001</td>
                      <td>random</td>
                      <td>data</td>
                      <td>placeholder</td>
                      <td>text</td>
                    </tr>
                    <tr>
                      <td>1,002</td>
                      <td>placeholder</td>
                      <td>irrelevant</td>
                      <td>visual</td>
                      <td>layout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>

    </>
  )
}

export default Dashboard