import './App.css';
import { BrowserRouter as Router, Route, Navigate, Routes, Link } from 'react-router-dom';  
import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage/HomePage';
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import DisplayIP from './components/DisplayIP';
import Login2 from './components/Login/Login2';
import ReportDetails from './components/icfReport/ReportDetails';
import RequestTabs from './components/Output/RequestTabs';

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false); // Changed initial state to false

  useEffect(() => {
    const isUserLoggedIn = localStorage.getItem('userIsLoggedIn');
    if (isUserLoggedIn === 'true') {
      setLoggedIn(true);
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  }

  return (
    <Router>
      {isLoggedIn && (
        <Navbar
          fixed="top"
          collapseOnSelect
          expand="lg"
          className="mynavbar" style={{ boxShadow: '0px 5px 10px grey', height:'4rem' }}
        >
          <Container>
            <Navbar.Brand as={Link} to="/home">
              <img className="webpage-name"
                style={{ height: "1.5rem" }}
                src="./layout_set_logo.png"
                alt="Logo"
              /><br/>
              <figcaption style={{ color: "black", fontWeight: 500, fontSize: "10px" }}>
              <span>BSES Rajdhani Power Ltd </span> <br />
              <span className='span'> BSES Yamuna Power Ltd</span>
            </figcaption>{" "}
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="m-auto" >
                <Nav.Link as={Link} to="/home">
                  <b style={{fontSize:'larger'}}><u>INTELLIGENT CF</u></b>
                </Nav.Link>
              </Nav>
              <Nav>
                <Nav.Link as={Link} to="/login" onClick={logout}>
                  <b className="nav-btn">Sign Out</b>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      <div >
        <Routes>
          <Route path="/login"
            element={isLoggedIn ? <Navigate to="/home" /> : <Login2 setLoggedIn={setLoggedIn} />}
          />
          <Route path="/home" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/output" element={isLoggedIn ? <RequestTabs /> : <Navigate to="/login" />} />
          <Route path="/reports" element={<ReportDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
