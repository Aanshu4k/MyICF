import Table from 'react-bootstrap/Table';
import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import './ManualSearch.css';
const ManualSearch = () => {
    const navigate = useNavigate();
    const [currentSearchResults, setCurrentSearchResults] = useState([]); // Current search results
    const { aufnr } = useParams();
    const [aufnr_1, setAufnr_1] = useState({});
    const [counts, setCounts] = useState({});
    const [existingResult, setExistingResult] = useState([]);
    const [isDuesSearchComplete_1, setDuesSearchComplete_1] = useState(null);
    const [isDuesSearchComplete_2, setDuesSearchComplete_2] = useState(false);
    let [selectedRows_1, setselectedRows_1] = useState([]);
    let [duesData_, setDuesData_] = useState(null);
    const [searchResults, setSearchResults] = useState([]); // New state for search results;
    const [searchResults1, setSearchResults1] = useState([]); // New state for search results;
    const [searchResults2, setSearchResults2] = useState([]); // New state for search results;
    const [searchResultsOther, setSearchResultsOther] = useState([]); // New state for search results
    const [casesData, setCaseData] = useState();


    const fetchIpAddress = async () => {
        try {
            let aufnr_11 = localStorage.getItem('manual');
            if (aufnr_11) {
                aufnr_11 = JSON.parse(aufnr_11);
            }
            let obj = {
                aufnr: aufnr_11.AUFNR,
                systemId: sessionStorage.getItem("systemId")
            }
            let data = await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_by_params`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj),
            });
            const apiResponse = await data.json();
            if (apiResponse) {
                const responseData = apiResponse.data;
                setDuesData_(responseData);
                const duesData = responseData.duesData || [];
                const mcd = responseData.mcdData || [];

                if (duesData.length) {
                    setDuesSearchComplete_2(true);
                } else {
                    setDuesSearchComplete_2(0);
                }

                if (duesData.length && responseData.tpye && responseData.tpye === 2) {
                    setDuesSearchComplete_1(true);
                } else {
                    setDuesSearchComplete_1(null);
                }
                const selectedDues = responseData.selectedDues || [];
                setSearchResults(selectedDues);
                setSearchResults1(selectedDues);
                setSearchResultsOther(selectedDues);

                let obj = getCounts(selectedDues);
                setCounts(obj);

                let exist = selectedDues.map(x => x.CONTRACT_ACCOUNT);
                setExistingResult(exist);

                setselectedRows_1(selectedDues);
                if (!duesData.length) {
                    setDues();
                }
            }
        } catch (error) {
            setDues()
            console.error('Error fetching IP address:', error);
        }
    };

    useEffect(() => {
        fetchIpAddress();
    });
    const getCounts = (data) => {
        if (!data) return {
            normal: [].length,
            total: 0,
            enforcement: 0,
            legal: 0,
            mcd: 0,
            move: 0
        }
        let bps = ["Normal", "ENFORCEMENT", "LEGAL", "Sealing"];
        return {
            normal: data.filter(x => x.BP_TYPE === 'Normal').length,
            total: data.length,
            enforcement: data.filter(x => x.BP_TYPE === 'ENFORCEMENT').length,
            legal: data.filter(x => x.BP_TYPE === 'LEGAL').length,
            mcd: data.filter(x => x.BP_TYPE === 'Sealing').length,
            move: data.filter(x => x.BP_TYPE === 'Normal' && !x.MOVE_OUT.includes('9999')).length,
            other: data.filter(x => !bps.includes(x.BP_TYPE)).length
        }
    };
    let aufnr_11 = localStorage.getItem('manual');
    if (aufnr_11) {
        aufnr_11 = JSON.parse(aufnr_11);
        if (aufnr_1.AUFNR !== aufnr_11.AUFNR) {
            setAufnr_1(aufnr_11);
            setCaseData(aufnr_11);
        }
    }
    function setDues() {
        let existingResult = localStorage.getItem("saveExistRes");
        if (existingResult) {
            existingResult = JSON.parse(existingResult);
            existingResult = existingResult[`${aufnr_1.AUFNR}`];
            if (existingResult) {
                existingResult = existingResult.map(x => {
                    x.SEARCH_MODE = "AUTO-MODE";
                    return {
                        ...x
                    }
                })
                let dues_filter = existingResult.filter(x => x.solr_dues > 500)
                setSearchResults(dues_filter);
                let obj = getCounts(dues_filter);

                setSearchResults1(existingResult)
                setSearchResultsOther(existingResult);

                setCounts(obj)
                let exist = existingResult.map(x => x.CONTRACT_ACCOUNT);
                console.log(exist)
                setExistingResult(exist)
            }
        }

        let check = localStorage.getItem("sealingData");
        if (check) {
            check = JSON.parse(check);
            setselectedRows_1(check)
        }
        if (!aufnr) {
            console.error("AUFNR parameter is missing.");
            return;
        }

    }
    return (
        <div style={{ padding: '2rem 100px' }}>
            <div style={{ border: '2px solid grey', padding: '10px', borderRadius: '10px' }}>
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
                            <td>{aufnr_1.AUFNR}</td>
                            <td>{aufnr_1.BUKRS}</td>
                            <td>{aufnr_1.VAPLZ}</td>
                            <td>{aufnr_1.NAME}</td>
                            <td>{aufnr_1.SAP_ADDRESS}</td>
                            <td>{aufnr_1.ILART}</td>
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
                                { }
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
                            <Form style={{ height: 'min-content' }}>
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
                                    <Form.Group as={Col} md="3" controlId="validationCustom01" style={{ display: 'flex' }}>
                                        <Form.Control type='text' style={{ width: '10rem' }} />
                                        <Button variant="warning">Refine Search</Button>
                                        <Button>Original List</Button>
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