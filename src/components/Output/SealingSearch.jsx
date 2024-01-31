import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import './SealingSearch.css';
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const SealingSearch = () => {
  const [aufnr_1, setAufnr_1] = useState({});
  const { aufnr } = useParams();
  const [caseData, setCaseData] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [existingResult, setExistingResult] = useState([]);
  let [selectedRows_1, setselectedRows_1] = useState([]);
  const [searchResultsOther, setSearchResultsOther] = useState([]);
  let [duesData_, setDuesData_] = useState(null);
  const [isDuesSearchComplete_2, setDuesSearchComplete_2] = useState(false);
  const [isDuesSearchComplete_1, setDuesSearchComplete_1] = useState(null);
  const [searchResults1, setSearchResults1] = useState([]); // New state for search results;
  const [auto_count, set_auto_count] = useState(0);
  const [manual_count, set_manual_count] = useState(0);
  const [counts, setCounts] = useState({});

  let aufnr_11 = localStorage.getItem('manual');
  if (aufnr_11) {
    aufnr_11 = JSON.parse(aufnr_11);
    if (aufnr_1.AUFNR !== aufnr_11.AUFNR) {
      setAufnr_1(aufnr_11);
      setCaseData(aufnr_11);
    }
  }
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
        const duesData = responseData.duesData || [];
        const mcd = responseData.mcdData || [];
        setDuesData_(responseData)
        if (responseData.tpye && responseData.tpye === 2) {
          setDuesSearchComplete_2(true);

        } else {

          setDuesSearchComplete_2(0);

        }
        if (duesData.length && responseData.tpye && responseData.tpye === 2) {
          setDuesSearchComplete_1(true);
        } else {
          setDuesSearchComplete_1(null);
        }
        const selectedDues = responseData.selectedMcd || [];
        // Transformations or other logic can be applied here
        setSearchResults(mcd);
        setSearchResults1(mcd);
        setSearchResultsOther(mcd);
        if (!mcd.length) {
          setDues()
        }
        let obj = getCounts(mcd);
        setCounts(obj);
        setselectedRows_1(selectedDues);
      }

    } catch (error) {
      setDues()
      console.error('Error fetching IP address:', error);
    }
  };
  useEffect(() => {
    fetchIpAddress();
  }, []);
  const handleRowClick = (row, e) => {
    console.log(e.target.checked, "e.target.checked");
    if (e.target.checked) {
      console.log("1");
      // Add the selected row to the state
      setselectedRows_1((prevSelectedRows) => [...prevSelectedRows, row]);
    } else {
      console.log("2");
      // Remove the unselected row from the state
      setselectedRows_1((prevSelectedRows) => prevSelectedRows.filter((selectedRow) => selectedRow.id !== row.id));
    }
    console.log("Selected Row : ", selectedRows_1)
  };
  // Function to handle forward and next pagination controls
  const getCounts = (data) => {
    if (!data) return {
      normal: [].length,
      total: 0,
      enforcement: 0,
      legal: 0,
      mcd: 0
    }
    let bps = ["Normal", "ENFORCEMENT", "LEGAL", "Sealing"];
    return {
      normal: data.filter(x => x.BP_TYPE === 'Normal').length,
      total: data.length,
      enforcement: data.filter(x => x.BP_TYPE === 'ENFORCEMENT').length,
      legal: data.filter(x => x.BP_TYPE === 'LEGAL').length,
      mcd: data.filter(x => x.BP_TYPE === 'Sealing').length,
      other: data.filter(x => !bps.includes(x.BP_TYPE)).length
    }
  };
  function setDues() {
    let existingResult = localStorage.getItem("sealing_data_1");
    if (existingResult) {
      existingResult = JSON.parse(existingResult);
      set_auto_count(existingResult.length)
      if (existingResult) {
        existingResult = existingResult.map(x => {
          x.SEARCH_MODE = "AUTO-MODE";
          return {
            ...x
          }
        })
        setSearchResults(existingResult)
        setSearchResults1(existingResult)
        setSearchResultsOther(existingResult);
        let obj = getCounts(existingResult);
        setCounts(obj)
        let exist = existingResult.map(x => x.id);
        console.log(exist)
        setExistingResult(exist)
      }
    }

    let checked = localStorage.getItem("sealing_set#");
    if (checked) {
      checked = JSON.parse(checked);
      setselectedRows_1(checked)
    }
    if (!aufnr) {
      console.error("AUFNR parameter is missing.");
      return;
    }
  }
  const handleRowClick_1 = (e) => {
    if (e.target.checked) {
      selectedRows_1 = searchResults;
      // Check all checkboxes
      const checkboxes = document.getElementsByClassName("check_box");
      const checkboxArray = Array.from(checkboxes); // Convert HTMLCollection to array
      checkboxArray.forEach((checkbox) => (checkbox.checked = true));
      setselectedRows_1(selectedRows_1)
    } else {
      selectedRows_1 = [];
      // Uncheck all checkboxes
      const checkboxes = document.getElementsByClassName("check_box");
      const checkboxArray = Array.from(checkboxes); // Convert HTMLCollection to array
      checkboxArray.forEach((checkbox) => (checkbox.checked = false));
      setselectedRows_1([])

    }
  };
  return (
    <div className="mcd-container">
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
            <td>{aufnr_1.AUFNR}</td>
            <td>{aufnr_1.BUKRS}</td>
            <td>{aufnr_1.VAPLZ}</td>
            <td>{aufnr_1.NAME}</td>
            <td>{aufnr_1.SAP_ADDRESS}</td>
            <td>{aufnr_1.ILART}</td>
          </tr>
        </tbody>
      </Table>
      <Tabs defaultActiveKey="auto" id="mcd-tabs" className="p-3">
        <Tab eventKey="auto" title="Auto Count MCD: 70">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', width: '5%' }}>
                  <input onChange={(e) => handleRowClick_1(e)} type="checkbox" name="" />
                </th>
                <th style={{ width: '5%' }}>MODE</th>
                <th style={{ whiteSpace: 'nowrap', width: '3%' }}>DUES</th>
                <th style={{ width: '10%' }}>MOVE OUT DATE</th>
                <th style={{ width: '10%' }}>ACCOUNT CLASS</th>
                <th style={{ width: '4%' }}>BP TYPE</th>
                <th style={{ width: '5%' }}>CA NUMBER</th>
                <th style={{ width: '5%' }}>CSTS CD</th>
                <th style={{ whiteSpace: 'nowrap', maxWidth: '15%', width: '15%' }}>CONSUMER NAME</th>
                <th style={{ width: '40%', textAlign: 'left' }} className="text-left">
                  CONSUMER ADDRESS
                </th>
                <th style={{ width: '10%' }}>POLE ID</th>
                <th style={{ width: '10%' }}>TARIFF CATEGORY</th>
              </tr>
            </thead>
            <tbody>
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
                  <tr key={index}>
                    <td>
                      <input
                        className="check_box"
                        type="checkbox"
                        disabled={result.disabled}
                        onChange={(e) => handleRowClick(result, e)}
                        checked={selectedRows_1.some((selectedRow) => selectedRow.id === result.id)}
                      />
                    </td>
                    <td>{result.SEARCH_MODE || 'MANUAL-MODE'}</td>
                    <td>{result.DUES || '-'}</td>
                    <td>{result.MOVE_OUT ? formatDateToDDMMYYYY(result.MOVE_OUT) : "-"}</td>
                    <td>{result.SAP_DEPARTMENT}</td>
                    <td>{result.BP_TYPE}</td>
                    <td>{result.CONTRACT_ACCOUNT}</td>
                    <td>{result.CSTS_CD}</td>
                    <td>{result.SAP_NAME}</td>
                    <td>{result.SAP_ADDRESS}</td>
                    <td>{result.SAP_POLE_ID}</td>
                    <td>{result.TARIFF}</td>
                  </tr>
                );
              })}
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
                
              </tr>
            </tbody>
          </Table>
        </Tab>
      </Tabs>
      <div style={{ display: "flex", border: "2px solid grey", justifyContent: 'space-around' }}>
        <Form className="p-3" >
          <div className="row" style={{ padding: '10px' }}>
            <div className="col-md-6">
              <Form.Group controlId="division">
                <Form.Select placeholder="Select Division">
                  <option value="division1">Select Division</option>
                  <option value="division1">Division 1</option>
                  <option value="division2">Division 2</option>
                  <option value="division3">Division 3</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="khasra">
                <Form.Control type="text" placeholder="House / Plot / Block / Khasra" />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="number">
                <Form.Control type="text" placeholder="Number (House / Plot / Block)" />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="area">
                <Form.Control type="text" placeholder="Area" />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12" style={{ textAlign: 'center', margin: '10px' }}>
              <Button variant="danger" className="mr-2">
                Start MCD Search
              </Button>
            </div>
          </div>
        </Form>
        <div className="p-3">
          <Form style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', margin: '10px 0' }}>
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
            </div>
            <div>
              <Button variant="primary" className="mr-2">
                Back To Home
              </Button>
              <Button variant="success">
                <i className="fa fa-check"></i> Complete MCD Search
              </Button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};
export default SealingSearch;
