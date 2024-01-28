import Table from 'react-bootstrap/Table';
import { Row, Col, Form, Button } from 'react-bootstrap';
import './ManualSearch.css';
const ManualSearch = () => {
    return (
        <div style={{  padding: '0 100px'}}>
            <div style={{ border: '2px solid grey',padding:'10px',borderRadius:'10px' }}>
                <Table striped bordered hover responsive >
                    <thead>
                        <tr>
                            <th>ORDER NO</th>
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
                <div>
                    <div className="filter-section">
                        <Row className="mb-2">
                            <Col xl={12} lg={12} md={12} sm={12} mb={2}>
                                <div className="form-check-box">
                                    <Form.Check
                                        inline
                                        type="radio"
                                        name="duesFilter"
                                        id="all"
                                        value="all"
                                        label={<span style={{ fontWeight: 600, fontSize: '18px' }}>All</span>}
                                    />
                                </div>
                                <div className="form-check-box">
                                    <Form.Check
                                        inline
                                        type="radio"
                                        name="duesFilter"
                                        id="greater500"
                                        value="greater500"
                                        checked
                                        label={<span style={{ fontWeight: 600, fontSize: '18px' }}>Dues &gt; 500</span>}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <h5 style={{ color: 'darkslategray', cursor: 'pointer' }}>
                            <span className="span5" style={{ color: 'black', fontWeight: 700 }}>
                                <span className="span1" style={{ float: 'left', cursor: 'pointer', color: 'black', fontWeight: 700, textDecoration: 'underline' }}>
                                    <span>Selected Result: </span> 0
                                </span>
                                <span>Total:</span>
                                <span style={{ marginLeft: '8px' }}>0</span>,
                                <span className="span4" style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: 600 }}>
                                    <span>Regular:</span> 0
                                </span>
                                <span className="span3" style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: 700 }}>
                                    <span>Enforcement:</span> 0
                                </span>
                                <span className="span2" style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: 700 }}>
                                    <span>Legal:</span> 0
                                </span>
                                <span className="span1" style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: 700 }}>
                                    <span>Other:</span> 0
                                </span>
                                <span className="span1" style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: 700 }}>
                                    <span>Move Out Cases:</span> 0
                                </span>
                                <span style={{ marginRight: '60px', color: 'green', float: 'right' }}> </span>
                            </span>
                        </h5>
                    </div>
                </div>
                <div className="result-table" style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '10px' }}>
                    <Table>
                        <thead className="fixed-header">
                            <tr>
                                <th style={{ whiteSpace: 'nowrap', width: '5%' }}>
                                    <Form.Check type="checkbox" name="" />
                                </th>
                                <th style={{ width: '5%' }}>MODE</th>
                                <th style={{ whiteSpace: 'nowrap', width: '3%' }}>SOLR DUES</th>
                                <th style={{ whiteSpace: 'nowrap', width: '3%' }}>SAP DUES</th>
                                <th style={{ width: '10%' }}>MOVE OUT DATE</th>
                                <th style={{ width: '10%' }}>ACCOUNT CLASS</th>
                                <th style={{ width: '4%' }}>BP TYPE</th>
                                <th style={{ width: '5%' }}>CA NUMBER</th>
                                <th style={{ width: '5%' }}>CSTS CD</th>
                                <th style={{ whiteSpace: 'nowrap', maxWidth: '15%', width: '15%' }}>CONSUMER NAME</th>
                                <th className="text-left" style={{ width: '40%', textAlign: 'left' }}>CONSUMER ADDRESS</th>
                                <th style={{ width: '10%' }}>POLE ID</th>
                                <th style={{ width: '10%' }}>TARIFF CATEGORY</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>

                            </tr>
                        </tbody>
                    </Table>
                    <div className='search-section'>
                        <div className='manual-search-form'>
                            <Form>
                                <Row className='mb-3'>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Form.Control
                                            required
                                            type="text"
                                            placeholder="House/Plot/Block/Khasra"
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Form.Control
                                            required
                                            type="text"
                                            placeholder="Number(House/Plot/Block/Khasra)"
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Form.Control
                                            required
                                            type="text"
                                            placeholder="Area"
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Button>Start Manual Search</Button>
                                    </Form.Group>
                                </Row>
                            </Form>
                        </div>
                        <div className='refine-search-form'>
                            <Form>
                                <Row className='mb-3'>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Button variant='success'>Complete Dues Search</Button>
                                    </Form.Group>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Button variant='warning'>Reset</Button>
                                    </Form.Group>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Button variant='info'>Back to Home</Button>
                                    </Form.Group>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Button>Start Manual Search</Button>
                                    </Form.Group>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
export default ManualSearch;