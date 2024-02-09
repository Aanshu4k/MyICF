import Table from "react-bootstrap/Table";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from "react-bootstrap/Form";
import './SealingSearch.css';
import Button from "react-bootstrap/Button";
import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import Select from "react-select";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
let url = require('../config.json')

const SealingSearch = () => {
  const [aufnr_1, setAufnr_1] = useState({});
  const { aufnr } = useParams();
  const [userTypes, setUserType] = useState("undefined");
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
    let usertype = localStorage.getItem("user") || "undefined";
    setUserType(usertype)
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
        data.data = data.data.filter(x => !existingResult.includes(x.id))
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

  function checkBt() {
    let dues = sessionStorage.getItem("duesSearchComplete");
    let mcd = sessionStorage.getItem("mcdSearchComplete");
    if (mcd) {
      setDuesSearchComplete_2(true);
    } else {
      setDuesSearchComplete_2(0);
    }
    if (dues && mcd) {
      setDuesSearchComplete_1(true)
    } else {
      setDuesSearchComplete_1(null)
    }
  }
  const columnsToExport = ["SEARCH_MODE", "CF_CATEGORY", "ACCOUNT_CLASS", "SAP_DUES", "MOVE_OUT", "CONTRACT_ACCOUNT", "CSTS_CD", "SAP_NAME", "SAP_ADDRESS", "SAP_POLE_ID", "TARIFF", "SEQUENCE_NO"];
  const exportToExcel = (data, user) => {
    if (!data.length) {
      alert("No data exist");
      return
    }

    for (let index = 0; index < data.length; index++) {
      let element = data[index];
      element['CF_CATEGORY'] = element['BP_TYPE'];
      element['ACCOUNT_CLASS'] = element['SAP_DEPARTMENT'];
      element['SOLR_DUES'] = element['solr_dues'];
      element['SAP_DUES'] = element['DUES'];
      element['MOVE_OUT'] = element['MOVE_OUT'].replace("00:00:00.0", "");
    }
    // Create a new array containing only the selected columns
    const filteredData = data.map((item) => {
      const filteredItem = {};
      columnsToExport.forEach((column) => {
        filteredItem[column] = item[column];
        if (!filteredItem['SEARCH_MODE']) {
          filteredItem['SEARCH_MODE'] = "Manual-Mode"
        }
      });
      return filteredItem;
    });
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${user.AUFNR}.xlsx`);
  };

  const handleCalculateDues = () => {
    let auto = selectedRows_1.filter(x => x.SEARCH_MODE === "AUTO-MODE").length;
    let manual = selectedRows_1.filter(x => !x.SEARCH_MODE).length;
    let satisfactionAuto = null;
    let satisfactionManual = null;
    if (duesData_ && duesData_.duesData.length) {
      Swal.fire({
        title: 'Are you satisfied with the results?',
        html: `
      <div>
      <h4 style="font-weight: bold; font-size: 18px; text-align: center;">Auto Result</h4>
      <span>
          <input type="radio" name="satisfactionAuto" value="yes" ${satisfactionAuto === true ? 'checked' : ''}> Yes
        </span>
        <span>
          <input type="radio" name="satisfactionAuto" value="no" ${satisfactionAuto === false ? 'checked' : ''}> No
        </span>
      </div>
      </br>
      <div>
      <h4 style="font-weight: bold; font-size: 18px; text-align: center;">Manual Result</h4>
        <span>
          <input type="radio" name="satisfactionManual" value="yes" ${satisfactionManual === true ? 'checked' : ''}> Yes
        </span>
        <span>
          <input type="radio" name="satisfactionManual" value="no" ${satisfactionManual === false ? 'checked' : ''}> No
        </span>
      </div>
    `,
        preConfirm: () => {
          satisfactionAuto = document.querySelector('input[name="satisfactionAuto"]:checked')?.value;
          satisfactionManual = document.querySelector('input[name="satisfactionManual"]:checked')?.value;

          if (!satisfactionAuto || !satisfactionManual) {
            Swal.showValidationMessage('Please answer both questions.');
            return false; // Prevent closing the modal
          }
          return true;
        },
        confirmButtonText: 'Yes Complete !!',
        allowOutsideClick: () => !Swal.isLoading(), // Prevent closing when loading (on Confirm button click)
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (selectedRows_1) {
            let tt = null
            let systemId = sessionStorage.getItem("systemId");
            let obj = {
              systemId,
              division: aufnr_1.VAPLZ,
              userId: userTypes,
              tpye: "2",
              address: aufnr_1.SAP_ADDRESS,
              isCompleted: 1,
              aufnr: aufnr_1.AUFNR,
              mcdData: searchResults,
              selectedMcd: selectedRows_1
            }
            console.log(obj);
            await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_status`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(obj),
            })
            if (duesData_ && duesData_.duesData.length) {
              tt = "w"
              let caNumbers = duesData_.selectedDues.map(x => x.CONTRACT_ACCOUNT)
              let response = await fetch(`${url.API_url}/api/calculate_dues`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ caNumbers }),
              })
              let dues = await response.json();
              console.log(dues, "duesduesduesdues")
              duesData_.selectedDues.forEach(x => {
                let duess = dues.duesData.filter(y => y.CA_NUMBER === x.CONTRACT_ACCOUNT);
                if (duess && duess.length) {
                  x.DUES = duess[0].AMOUNT
                }
              });
              let usertype = localStorage.getItem("user") || "undefined";

              let arr = [...selectedRows_1, ...duesData_.selectedDues]
              await fetch(`${url.API_url}/api/sendToDsk`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: arr, addr: aufnr_1, satisfactionAuto, satisfactionManual, usertype }),
              })
              exportToExcel(arr, aufnr_1)
            }
            sessionStorage.setItem("duesSearchComplete", "true");
            checkBt();
            localStorage.setItem("sealing_set#", JSON.stringify(selectedRows_1));
            sessionStorage.setItem("mcdSearchComplete", "true");
            let prev_res = localStorage.getItem("sealingData");
            if (prev_res) {
              prev_res = JSON.parse(prev_res)
            } else {
              prev_res = []
            }
            fetchIpAddress();
            // Show success message
            Swal.fire({
              title: 'Success!',
              text: tt ? `CF Process completed successfully.` : `MCD search completed successfully.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
            });
          }
        }
      });
    }
    else {
      if (selectedRows_1) {
        let tt = null;
        Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to complete the MCD search?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          html: `<style>
        .enforcement-label { color: blue; }
        .normal-label { color: green; }
        .other-label { color: orange; }
        .move-out-label { color: purple; }
        .legal-label { color: red; }
      </style>
      
      <div>
      <h5>Do you want to complete the dues search?</h5>
      <p><span id="enforcementLabel" class="enforcement-label">Auto-Mode Selected</span> - <span id="enforcementCount" class="enforcement">${auto}</span></p>
      <p><span id="normalLabel" class="normal-label">Manual-Mode Selected</span> - <span id="normalCount" class="normal">${manual}</span></p>
    </div>`,
          confirmButtonText: 'Yes, complete it!'
        }).then(async (result) => {
          if (result.isConfirmed) {

            let systemId = sessionStorage.getItem("systemId");
            let obj = {
              systemId,
              address: aufnr_1.SAP_ADDRESS,
              isCompleted: 1,
              tpye: "2",
              aufnr: aufnr_1.AUFNR,
              mcdData: searchResults,
              division: aufnr_1.VAPLZ,
              selectedMcd: selectedRows_1,
              userId: userTypes,
            }
            console.log(obj);
            await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_status`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(obj),
            })


            if (duesData_ && duesData_.duesData.length) {
              tt = "s"
              let caNumbers = duesData_.selectedDues.map(x => x.CONTRACT_ACCOUNT)
              let response = await fetch(`${url.API_url}/api/calculate_dues`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ caNumbers }),
              })
              let dues = await response.json();
              console.log(dues, "duesduesduesdues")
              duesData_.selectedDues.forEach(x => {
                let duess = dues.duesData.filter(y => y.CA_NUMBER === x.CONTRACT_ACCOUNT);
                if (duess && duess.length) {
                  x.DUES = duess[0].AMOUNT
                }
              });

              let usertype = localStorage.getItem("user") || "undefined";

              let arr = [...selectedRows_1, ...duesData_.selectedDues]
              await fetch(`${url.API_url}/api/sendToDsk`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: arr, addr: aufnr_1, satisfactionAuto, satisfactionManual, usertype }),
              })
              exportToExcel(arr, aufnr_1)
            }

            sessionStorage.setItem("duesSearchComplete", "true");
            checkBt();
            localStorage.setItem("sealing_set#", JSON.stringify(selectedRows_1));
            sessionStorage.setItem("mcdSearchComplete", "true");
            let prev_res = localStorage.getItem("sealingData");
            if (prev_res) {
              prev_res = JSON.parse(prev_res)
            } else {
              prev_res = []
            }
            fetchIpAddress()
            // Show success message
            Swal.fire({
              title: 'Success!',
              text: tt ? `CF Process completed successfully.` : `MCD search completed successfully.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
            });
          }
        });

      }
    }
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

      <Container fluid style={{ display: "flex", padding: '1rem', border: "2px solid grey", justifyContent: 'space-around' }}>
        <Row style={{ width: '100%' }}>
          <Col xs={12} sm={6} style={{ marginBottom: '1rem', marginTop: '2rem', paddingRight: '8rem' }}>
            <Form>
              <Row style={{ marginBottom: '0.5rem' }}> {/* Added margin bottom */}
                <Col>
                  <Form.Group controlId="division">
                    <Select
                      options={divisions}
                      onChange={handleSelectedDivision}
                      value={selectedDivision}
                      isMulti
                      placeholder="Choose Divisions"
                      dropdownPosition={searchResults.length ? "top" : "bottom"}
                      optionStyle={{ fontSize: '16px', fontWeight: "600", width: '100%', color: "black", alignItems: "left", textAlign: "left" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="justify-content-center" style={{ marginBottom: '0.5rem' }}> {/* Added margin bottom */}
                <Col xs="auto">
                  <Form.Group controlId="area">
                    <Form.Control type="text" placeholder="Ex: 140,khasra 20, laxmi" value={addressPart3} onChange={(e) => setAddressPart3(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs="auto">
                  <Button variant="danger" onClick={handleManualSearch}>Start MCD Search</Button>
                </Col>
              </Row>
            </Form>
          </Col>

          <Col xs={12} sm={6} style={{ marginBottom: '1rem' }}>
            <Form>
              <Row>
                <Col>
                  <div style={{ marginBottom: '1rem' }}>Number (House / Plot / Block)</div>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <Form.Group controlId="refine-term">
                    <Form.Control type="text" placeholder="Enter number" />
                  </Form.Group>
                </Col>
                <Col xs="auto">
                  <Button variant="danger" className="mr-2">Refine Search</Button>
                </Col>
                <Col xs="auto">
                  <Button variant="secondary" className="mr-2">Original List</Button>
                </Col>
              </Row>
              <Row>
                <Col xs="auto">
                  <Button variant="primary" className="mr-2">Back To Home</Button>
                </Col>
                <Col xs="auto">
                  <Button variant="success" disabled={isDuesSearchComplete_2}
                    onClick={handleCalculateDues}>
                    <i className="fa fa-check"></i> Complete MCD Search
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>


    </div >
  );
};
export default SealingSearch;
