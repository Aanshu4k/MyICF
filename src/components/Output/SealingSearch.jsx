import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import './SealingSearch.css';
import Button from "react-bootstrap/Button";
import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import Select from "react-select";
let url = require('../config.json')

const SealingSearch = () => {
  const [aufnr_1, setAufnr_1] = useState({});
  const { aufnr } = useParams();
  const [divisions, setDivisions] = useState([]);
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
  const [selectedDivision, setSelectedDivision] = useState([]);
  let [addressPart1, setAddressPart1] = useState("");
  let [addressPart2, setAddressPart2] = useState("");
  let [addressPart3, setAddressPart3] = useState("");

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
      console.log("ICF DATA RESPONSE : ", apiResponse);
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
  const fetchDivisions = () => {
    axios
      .get(`${url.API_url}/api/divisions_on_page_load1`)
      .then((response) => {
        console.log("divisions for Sealing Search : ", response.data.data);
        let arr = [];
        if (response.data.data) {
          response.data.data.forEach(x => {
            arr.push({
              value: x.VAPLZ,
              label: x.VAPLZ
            })
          })
        }
        console.log("Divisions arr : ", arr);
        setDivisions(arr);
      })
      .catch((error) => {
        console.error("Error fetching divisions:", error);
      });
  };
  useEffect(() => {
    fetchIpAddress();
    fetchDivisions();
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
    //for check and uncheck of all rows on one click
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
  const handleFilterByBPType = (bpType) => {
    if (!bpType) {
      setSearchResults(searchResults1);
      let obj = getCounts(searchResultsOther);
      setCounts(obj)
      console.log("final ...")
      return
    }
    // Filter the data based on the selected BP_TYPE
    let filteredData = searchResults1;
    if (bpType === "auto") {
      filteredData = searchResults1.filter((item) => item.SEARCH_MODE === 'AUTO-MODE')
    }
    if (bpType === "manual") {
      filteredData = searchResults1.filter((item) => item.SEARCH_MODE !== 'MANUAL-MODE')
    }
    setSearchResults(filteredData);
    let obj = getCounts(searchResultsOther);
    setCounts(obj);
  };
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
  function setSearchLogs(payload) {
    fetch(`${url.api_url}/api/create_log`, {
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
  const [ipAddress, setIpAddress] = useState(null);
  const handleManualSearch = () => {
    if (!addressPart1 && !addressPart2 && !addressPart3)
      return;

    const startTime = new Date();

    // Process address parts and remove special characters
    let modifiedAddressPart1 = addressPart1 ? removeSpecialCharsAndCapitalize(addressPart1) : '';
    let modifiedAddressPart2 = addressPart2 ? removeSpecialCharsAndCapitalize(addressPart2) : '';
    let modifiedAddressPart3 = addressPart3 ? removeSpecialCharsAndCapitalize(addressPart3.trim()) : '';

    // Array of suffixes to append to address
    let str_arr = ["1ST", "I", "2ND", "II", "3RD", "III"];
    let str_arr1 = ["BLOCK", "BLK", "PLOT", "PLT"];

    // Remove special characters from address parts
    modifiedAddressPart1 = modifiedAddressPart1.replace(/[^\w\s]/g, '');
    modifiedAddressPart2 = modifiedAddressPart2.replace(/[^\w\s]/g, '');
    modifiedAddressPart3 = modifiedAddressPart3.replace(/[^\w\s-]/g, '');

    // Combine address parts into a complete address
    let complete_addr = capitalizeWord(modifiedAddressPart1) + '' + capitalizeWord(modifiedAddressPart2);
    let words_arr = [complete_addr];

    // Generate variations of the address by appending suffixes
    for (let index = 0; index < str_arr.length; index++) {
      const element = str_arr[index];
      let words = capitalizeWord(modifiedAddressPart1) + element + capitalizeWord(modifiedAddressPart2);
      words_arr.push(words);
    }

    // Generate variations of the address by appending suffixes and prefixes
    for (let index = 0; index < str_arr1.length; index++) {
      const element = str_arr1[index];
      let words = capitalizeWord(modifiedAddressPart1) + element;
      let words1 = element + capitalizeWord(modifiedAddressPart2);
      words_arr.push(words);
      words_arr.push(words1);
    }
    let filterDivision = selectedDivision.map(x => x.value)
    // Clear existing result variable
    setExistingResult([]);

    // Fetch data from API
    fetch(`${url.API_url}/api/manual_search_sealing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addressPart1: words_arr,
        addressPart2: [capitalizeWord(modifiedAddressPart2)],
        addressPart3: capitalizeWord(modifiedAddressPart3),
        VAPLZ: caseData.VAPLZ,
        divisions: filterDivision
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Manual search sealing data : ", data);
        let finalres = [];
        data.data = data.results_count;
        set_manual_count(data.results_count.length);
        //need to be clear
        let all_count = data.data.length;
        if (data.data) {
          //retrieves the auto searched mcd data from local storage
          let existingResult1 = localStorage.getItem("sealing_data_1");
          if (existingResult1) {
            existingResult1 = JSON.parse(existingResult1);
            if (existingResult1) {
              finalres = existingResult1;
            }
          }
        };
        //reset the search result to store manual data
        setSearchResults([]);
        setSearchResults1([]);
        setSearchResultsOther([]);

        finalres.map(x => {
          x.SEARCH_MODE = "AUTO-MODE";
          return null;
        })
        console.log("Final res (auto sealing data) : ", finalres);
        data.data.push(...finalres);
        setSearchResults(data.data);
        let obj = getCounts(data.data);
        setSearchResults1(data.data);
        setSearchResultsOther(data.data);
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
          console.error("Error fetching manual search results : ", data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };
  const handleSelectedDivision = (selectedOption) => {

    setSelectedDivision(selectedOption);
    console.log("Selected Division for MCD search : ", selectedDivision)
  }

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
      <div style={{ textAlign: 'center' }}>
        <b>
          <a href><span className="auto" onClick={() => handleFilterByBPType('auto')}>AUTO COUNT MCD : {auto_count}</span> </a>{" "}
          <a href><span className="manual" onClick={() => handleFilterByBPType('auto')}>MANUAL COUNT MCD : {manual_count}</span></a>
          <span>{!isDuesSearchComplete_1 ? "" : "Sent To DSK"}
            {isDuesSearchComplete_1 && (<i className="fa fa-check" style={{ color: 'green', fontSize: '20px' }} />)}
          </span>
        </b>
      </div>
      <div className="mcd-cases-table-wrapper">
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
              <th style={{ width: '40%' }}>
                CONSUMER ADDRESS
              </th>
              <th style={{ width: '10%' }}>POLE ID</th>
              <th style={{ width: '10%' }}>TARIFF CATEGORY</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((result, index) => {
              existingResult.some((existingRow) => existingRow === result.CONS_REF);

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
      </div>

      <div style={{ display: "flex", border: "2px solid grey", justifyContent: 'space-around' }}>
        <Form className="p-3" >
          <div className="row" style={{ padding: '10px' }}>
            <div className="col-md-6">
              <Form.Group controlId="division">
                <Select
                  options={divisions}
                  onChange={handleSelectedDivision}
                  value={selectedDivision}
                  isMulti
                  placeholder="Choose Divisions"
                  dropdownPosition={searchResults.length ? "top" : "bottom"}
                  optionStyle={{ fontSize: '16px', fontWeight: "600", width: '330px', color: "black", alignItems: "left", textAlign: "left" }}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="khasra">
                <Form.Control type="text" placeholder="House / Plot / Block / Khasra" value={addressPart1} onChange={(e) => setAddressPart1(e.target.value)} />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="number">
                <Form.Control type="text" placeholder="Number (House / Plot / Block)" value={addressPart2} onChange={(e) => setAddressPart2(e.target.value)} />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="area">
                <Form.Control type="text" placeholder="Area" value={addressPart3} onChange={(e) => setAddressPart3(e.target.value)} />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12" style={{ textAlign: 'center', margin: '10px' }}>
              <Button variant="danger" className="mr-2" onClick={handleManualSearch}>
                Start MCD Search
              </Button>
            </div>
          </div>
        </Form><hr />
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
              <Button variant="success" disabled={isDuesSearchComplete_2}>
                <i className="fa fa-check"></i> Complete MCD Search
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div >
  );
};
export default SealingSearch;
