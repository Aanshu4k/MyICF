import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Nav, Navbar } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
const SealingSearch = () => {
  return (
    <div className="container">
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Request No.</th>
            <th>COMPANY</th>
            <th>DIVISION</th>
            <th>NAME</th>
            <th>REQUEST ADDRESS</th>
            <th>REQUEST TYPE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DATA..</td>
            <td>DATA..</td>
            <td>DATA..</td>
            <td>DATA..</td>
            <td>DATA..</td>
            <td>DATA..</td>
          </tr>
        </tbody>
      </Table>
      <Tabs defaultActiveKey="auto" id="mcd-tabs" className="p-3">
        <Tab eventKey="auto" title="Auto Count MCD: 70">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Meter Date</th>
                <th>Meter Read Date</th>
                <th>Account Class</th>
                <th>BP No.</th>
                <th>CA Number</th>
                <th>CTS CD</th>
                <th>Consumer Name</th>
                <th>Consumer Address</th>
                <th>Pole Id</th>
                <th>Tariff Category</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>31-12-2009</td>
                <td>MLCC</td>
                <td>Normal</td>
                <td>0015666549</td>
                <td>Sri Vartman Gupta</td>
                <td>3 Block C 42 Common Service Safdarjung</td>
                <td>HGSN/2251</td>
                <td>DOMI</td>
                <td>A250</td>
                <td>Auto</td>
              </tr>
              {/* More rows here */}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="manual" title="Manual Count MCD: 170">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Meter Date</th>
                <th>Meter Read Date</th>
                <th>Account Class</th>
                <th>BP No.</th>
                <th>CA Number</th>
                <th>CTS CD</th>
                <th>Consumer Name</th>
                <th>Consumer Address</th>
                <th>Pole Id</th>
                <th>Tariff Category</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>31-12-2009</td>
                <td>MLCC</td>
                <td>Normal</td>
                <td>0015666549</td>
                <td>Sri Vartman Gupta</td>
                <td>3 Block C 42 Common Service Safdarjung</td>
                <td>HGSN/2251</td>
                <td>DOMI</td>
                <td>A250</td>
                <td>Manual</td>
              </tr>
              {/* More rows here */}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
      <div style={{ display: "flex", border: "2px solid grey" }}>
        <Form className="p-3">
          <Form.Group controlId="division">
            <Form.Label>Multiple Division MCD</Form.Label>
            <Form.Control type="text" placeholder="Enter division" />
          </Form.Group>
          <Form.Group controlId="khasra">
            <Form.Label>House / Plot / Block / Khasra</Form.Label>
            <Form.Control type="text" placeholder="Enter khasra" />
          </Form.Group>
          <Form.Group controlId="number">
            <Form.Label>Number (House / Plot / Block)</Form.Label>
            <Form.Control type="text" placeholder="Enter number" />
          </Form.Group>
          <Form.Group controlId="area">
            <Form.Label>Area</Form.Label>
            <Form.Control type="text" placeholder="Enter area" />
          </Form.Group>
          <Button variant="danger" className="mr-2">
            Start MCD Search
          </Button>
        </Form>
        <div className="p-3">
          <Form inline>
            <Form.Group controlId="number2">
              <Form.Label className="mr-2">
                Number (House / Plot / Block)
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter number"
                className="mr-2"
              />
            </Form.Group>
            <Button variant="danger" className="mr-2">
              Refine Search
            </Button>
            <Button variant="secondary" className="mr-2">
              Original List
            </Button>
            <Button variant="primary" className="mr-2">
              Back To Home
            </Button>
            <Button variant="success">
              <i className="fa fa-check"></i> Complete MCD Search
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};
export default SealingSearch;
