import Table from 'react-bootstrap/Table';
import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import './ManualSearch.css';
const url = require('../config.json');
const ManualSearch = () => {
    // const navigate = useNavigate();
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
    const [caseData, setCaseData] = useState();
    const [duesRecords, setDuesRecords] = useState([]);
    let [addressPart1, setAddressPart1] = useState('');
    let [addressPart2, setAddressPart2] = useState('');
    let [addressPart3, setAddressPart3] = useState('');
    const [validated, setValidated] = useState(false);
    const [isDrop, setIsDrop] = useState(0);
    const [ipAddress, setIpAddress] = useState(null);

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
            //fetch icf data from mongo DB 
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
                    setDues()
                }
            }
        } catch (error) {
            setDues()
            console.error('Error fetching IP address:', error);
        }
    };
    const handleRowClick = (row, e) => {
        console.log(e.target.checked, "e.target.checked");
        if (e.target.checked) {
            // Add the selected row to the state if row selected
            setselectedRows_1((prevSelectedRows) => [...prevSelectedRows, row]);
        } else {
            // Remove the unselected row from the state if not checked
            setselectedRows_1((prevSelectedRows) => prevSelectedRows.filter((selectedRow) => selectedRow.id !== row.id));
        }
        console.log("Selected Rows dues Rows : ", selectedRows_1)
    };
    useEffect(() => {
        fetchIpAddress();
        console.log("DUES DATA FOUND : ", JSON.parse(localStorage.getItem('saveExistRes')))
    }, []);
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
            existingResult = existingResult[`${aufnr_11.AUFNR}`];

            if (existingResult) {
                existingResult = existingResult.map(x => {
                    x.SEARCH_MODE = "AUTO-MODE";
                    return {
                        ...x
                    }
                })
                console.log("Existing Result Only : ", existingResult);
                let dues_filter = existingResult.filter(x => x.solr_dues > 500);
                setSearchResults(existingResult);
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
    function removeSpecialCharsAndCapitalize(inputString) {
        // Remove special characters and spaces, but keep numeric characters
        const cleanedString = inputString.replace(/[^a-zA-Z0-9]/g, '');

        // Capitalize the cleaned string
        const capitalizedString = cleanedString.toUpperCase();

        return capitalizedString;
    }
    function capitalizeWord(word) {
        if (typeof word !== 'string' || word.length === 0) {
            return word;
        }
        return word.toUpperCase();
    }

    //insert logs in the mongo db collection logentries
    function setSearchLogs(payload) {
        const requestPromise = fetch(`${url.api_url}/api/create_log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then(async (data) => {
            })
    }

    // Function to handle manual search button click
    const handleManualSearchClick = () => {
        if (!addressPart1 && !addressPart2 && !addressPart3) {
            return;
        }
        const startTime = new Date();
        if (addressPart1)
            addressPart1 = removeSpecialCharsAndCapitalize(addressPart1);
        if (addressPart2)
            addressPart2 = removeSpecialCharsAndCapitalize(addressPart2);
        if (addressPart3)
            addressPart3 = removeSpecialCharsAndCapitalize(addressPart3);
        // Combine the address parts into a single address
        let str_arr = ["1ST", "I", "2ND", "II", "3RD", "III"];
        let str_arr1 = ["BLOCK", "BLK", "PLOT", "PLT"];
        addressPart1 = addressPart1.replace(/[^\w\s]/g, '');
        addressPart2 = addressPart2.replace(/[^\w\s]/g, '');
        addressPart3 = addressPart3 ? addressPart3.trim("") : "";

        let complete_addr = capitalizeWord(addressPart1) + '' + capitalizeWord(addressPart2);
        let words_arr = [complete_addr]
        for (let index = 0; index < str_arr.length; index++) {
            const element = str_arr[index];
            let words = capitalizeWord(addressPart1) + element + capitalizeWord(addressPart2);
            words_arr.push(words);
        }
        for (let index = 0; index < str_arr1.length; index++) {
            const element = str_arr1[index];
            let words = capitalizeWord(addressPart1) + element;
            let words1 = element + capitalizeWord(addressPart1);
            words_arr.push(words);
            words_arr.push(words1);
        }
        addressPart3 = addressPart3.replace(/[^\w\s-]/g, '');
        let drop = localStorage.getItem("dropDataList");

        if (drop && drop === 1) {
            setIsDrop(1);
        } else {
            setIsDrop(0);
        }
        setExistingResult([]);

        //API call to fetch cases from manually entered input by the User
        fetch(`${url.API_url}/api/manual_search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                addressPart1: words_arr,
                addressPart2: [capitalizeWord(addressPart2)],
                addressPart3: capitalizeWord(addressPart3),
                VAPLZ: caseData.VAPLZ, // Assuming division comes from case data
            }),
        })
            .then((response) => response.json())
            .then(async (data) => {
                console.log("MANUAL SEARCH DATA : ", data);
                let finalres = [];
                data.data = data.results_count;
                let all_count = data.data.length;
                if (data.data) {
                    let existingResult1 = localStorage.getItem("saveExistRes");
                    if (existingResult1) {
                        existingResult1 = JSON.parse(existingResult1);
                        existingResult1 = existingResult1[`${aufnr_1.AUFNR}`];
                        let exist = [];
                        if (existingResult1) {
                            finalres = existingResult1;
                            let exist = existingResult1.map(x => x.CONTRACT_ACCOUNT);
                            console.log(exist)
                            setExistingResult(exist)
                        }
                    }
                };
                setSearchResults([]);
                setSearchResults1([]);
                setSearchResultsOther([])
                console.log(searchResults.length, "lll", data.data)
                data.data = data.data.filter(x => !existingResult.includes(x.CONTRACT_ACCOUNT))
                finalres.forEach(x => {
                    x.SEARCH_MODE = "AUTO-MODE"
                })
                console.log(finalres, "finalres")
                data.data.push(...finalres);
                // let dues_filter = data.data.filter(x => x.solr_dues > 500)
                setSearchResults(data.data);
                let obj = getCounts(data.data);
                await setSearchResults1(data.data)
                await setSearchResultsOther(data.data);
                setCounts(obj);

                const endTime = new Date();
                // Calculate the time elapsed in minutes
                const timeElapsedInMilliseconds = endTime - startTime;
                const minutes = Math.floor(timeElapsedInMilliseconds / 60000);
                const seconds = Math.floor((timeElapsedInMilliseconds % 60000) / 1000);
                const milliseconds = (timeElapsedInMilliseconds % 1000).toString().padStart(3, '0').slice(0, 2); // Truncate to two digits

                const formattedTime = `${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds, ${milliseconds} milliseconds`;

                let objs = {
                    "obj": {
                        "LogTextMain": words_arr.join(',') + ',' + [addressPart2].join(","),
                        "logTextAndSrc": [addressPart3].join(','),
                        "MethodName": "MANUAL-MODE",
                        "SolrSearchTime": formattedTime,
                        result_count: '' + all_count,
                        IP_address: ipAddress,
                        "REQUEST": caseData.REQUEST_NO
                    }
                }
                setSearchLogs(objs);
                if (data.error) {
                    console.error("Error fetching search results:", data.error);
                }
            })
            .catch((error) => {
                console.error("Error fetching search results:", error);
            });
    };

    return (
        <div style={{ padding: '0 100px' }}>
            <div style={{ border: '2px solid grey', padding: '10px', borderRadius: '10px' }}>
                <Table striped bordered hover responsive>
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
                    <tbody style={{ fontSize: '14px', lineHeight: '1rem' }}>
                        <tr>
                            <td>{aufnr_11.AUFNR}</td>
                            <td>{aufnr_11.BUKRS}</td>
                            <td>{aufnr_11.VAPLZ}</td>
                            <td>{aufnr_11.NAME}</td>
                            <td>{aufnr_11.SAP_ADDRESS}</td>
                            <td>{aufnr_11.ILART}</td>
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
                    <Table striped bordered hover responsive>
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
                                <th style={{ width: '40%', textAlign: 'center' }}>CONSUMER ADDRESS</th>
                                <th style={{ width: '10%' }}>POLE ID</th>
                                <th style={{ width: '10%' }}>TARIFF CATEGORY</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '14px', lineHeight: '1rem' }}>
                            {searchResults.map((result, index) => {
                                const isResultInExisting = existingResult.some(
                                    (existingRow) => existingRow === result.CONS_REF
                                );
                                function formatDateToDDMMYYYY(dateString) {
                                    const date = new Date(dateString);
                                    const day = date.getDate().toString().padStart(2, '0');
                                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
                                    const year = date.getFullYear();
                                    return `${day}-${month}-${year}`;
                                }
                                return (
                                    <tr key={index} style={{ backgroundColor: isResultInExisting ? '#transparent' : "" }}>
                                        <td>
                                            <input
                                                className="check_box"
                                                type="checkbox"
                                                onChange={(e) => handleRowClick(result, e)}
                                                checked={selectedRows_1.some((selectedRow) => selectedRow.id === result.id)}
                                            />
                                        </td>
                                        <td>{result.SEARCH_MODE || 'MANUAL-MODE'}</td>
                                        <td>{result.solr_dues || '-'}</td>
                                        <td>{result.DUES || '-'}</td>
                                        <td style={{ width: '17%' }} >{result.MOVE_OUT ? formatDateToDDMMYYYY(result.MOVE_OUT) : "-"}</td>
                                        <td>{result.SAP_DEPARTMENT}</td>
                                        <td>{result.BP_TYPE}</td>
                                        <td>{result.CONTRACT_ACCOUNT}</td>
                                        <td>{result.CSTS_CD}</td>
                                        <td style={{ textAlign: "left" }}>{result.SAP_NAME}</td>
                                        <td style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', maxWidth: '2000px', textAlign: 'left' }} className="text-left">
                                            {result.SAP_ADDRESS}
                                        </td>                            <td>{result.SAP_POLE_ID}</td>
                                        <td>{result.TARIFF}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>

                </div>
                <div className='search-section'>
                    <div className='manual-search-form'>
                        <Form>
                            <Row className='mb-3'>
                                <Form.Group as={Col} md="3" controlId="validationCustom01">
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="House/Plot/Block/Khasra"
                                        value={addressPart1}
                                        onChange={(e) => setAddressPart1(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="3" controlId="validationCustom01">
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="Number(House/Plot/Block/Khasra)"
                                        value={addressPart2}
                                        onChange={(e) => setAddressPart2(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="3" controlId="validationCustom01">
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="Area"
                                        value={addressPart3}
                                        onChange={(e) => setAddressPart3(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="3" controlId="validationCustom01">
                                    <Button onClick={handleManualSearchClick}>Start Manual Search</Button>
                                </Form.Group>
                            </Row>
                        </Form>
                    </div><hr />
                    <div className='refine-search-form'>
                        <Form style={{ textAlign: 'center' }}>
                            <Row className='mb-3'>
                                <Form.Group as={Col} md="3" controlId="validationCustom01">
                                    <Button variant='success'>Complete Dues Search</Button>
                                </Form.Group>
                                <Form.Group as={Col} md="3" controlId="validationCustom01">
                                    <Button variant='warning' style={{ width: '100%' }}>Reset</Button>
                                </Form.Group>
                                <Form.Group as={Col} md="3" controlId="validationCustom01">
                                    <Button variant='info'>Back to Home</Button>
                                </Form.Group>
                                <Form.Group as={Col} md="3" controlId="validationCustom01" style={{ display: 'flex' }}>
                                    <Form.Control type='text' style={{ width: '10rem', height: 'baseline' }} />
                                    <Button variant="warning">Refine Search</Button>
                                    <Button>Original List</Button>
                                </Form.Group>
                            </Row>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ManualSearch;