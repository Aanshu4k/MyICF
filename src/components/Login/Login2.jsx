import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import "./Login2.css";
const url = require("../config.json");

const Login2 = () => {
  const [loginDetails, setLoginDetails] = useState({
    email: "testcf",
    password: "",
    submitted: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prevValue) => ({ ...prevValue, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginDetails({ ...loginDetails, submitted: true });
    if (loginDetails.email && loginDetails.password) {
      try {
        const response = await fetch(
          `${url.API_url}/api/LoginByID?ID=${loginDetails.email}&password=${loginDetails.password}`
        );
        const data = await response.json();
        console.log(data);
        if (data.data && data.data.length) {
          localStorage.setItem("userIsLoggedIn", true);
          localStorage.setItem("user", data.data.userType);
          toast.success("Login Successful !!!");
          window.location.href = "/home";
        } else {
          toast.error("ID or Password is incorrect !!");
        }
      } catch (error) {
        toast.error("ID or Password is incorrect !!");
      }
    }
  };
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
      <div className="background-wall">
        <img
          className="main-wallpaper"
          src="./background-wall.png"
          alt="background-wall"
        />
      </div>
      <div className="login-section">
        <div className="main-container">
          <div style={{ marginBottom: "10px" }}>
            <img
              src="./bses-logo.png"
              alt="BSES Logo"
              style={{ height: "5rem", borderRadius: "0 20px" }}
            />
          </div>
          <Form onSubmit={handleSubmit} style={{width:'25rem'}}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>
                <b>USER NAME</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="ID"
                name="email"
                value={loginDetails.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>
                <b>PASSWORD</b>
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={loginDetails.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button
              variant="danger"
              type="submit"
              style={{ width: "100%" }}
              onClick={handleSubmit}
            >
              Login
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};
export default Login2;
