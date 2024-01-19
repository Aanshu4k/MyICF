import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import {Toaster,toast} from 'react-hot-toast';
import './Login.css';
const url = require("../config.json");

const LogIn = () => {
  const [loginDetails, setLoginDetails] = useState({
    email: 'testcf',
    password: '',
    submitted: false,
  })
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prevValue) => ({ ...prevValue, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginDetails({ ...loginDetails, submitted: true })
    if (loginDetails.email && loginDetails.password) {
      try {
        const response = await fetch(`${url.API_url}/api/LoginByID?ID=${loginDetails.email}&password=${loginDetails.password}`);
        const data = await response.json();
        console.log(data);
        if (data.data && data.data.length) {
          localStorage.setItem('userIsLoggedIn', true);
          localStorage.setItem('user', data.data.userType);
          toast.success("Login Successful !!!");
          window.location.href = "/home";
        }
        else {
          toast.error("ID or Password is incorrect !!");
        }
      } catch (error) {
        toast.error("ID or Password is incorrect !!");
      }
    }
  };
  return (
    <section>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
      <div className='login-container'>
        <div className='main-container'>
          <div>
            <img src='./logoBSES.gif' alt='BSES Logo' style={{ height: '61px' }} />
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control type="text" placeholder="ID" name='email' value={loginDetails.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control type="password" placeholder="Password" name='password' value={loginDetails.password} onChange={handleChange} />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ width: '100%' }} onClick={handleSubmit}>
              Login
            </Button>
          </Form>
        </div>
      </div>
    </section>
  );
};
export default LogIn;