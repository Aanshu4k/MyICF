import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import './HomePage.css';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DisplayIP from '../DisplayIP';
const url = require("../config.json");

const HomePage = () => {
    const [cases, setCases] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState("");
    const [caseCount, setCaseCount] = useState(0);
    const [exclude_terms, set_exclude_terms] = useState([]);
    const [exclude_terms1, set_exclude_terms1] = useState([]);
    const [resetDivision, setResetDivision] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectedRowCount, setSelectedRowCount] = useState(0);
    const [showTable,setShowTable] = useState(false);
    const fetchDivisions = () => {
        axios.get(`${url.API_url}/api/divisions_on_page_load1`)
            .then((response) => {
                setDivisions(response.data.data);
            })
            .catch((error) => {
                console.error("Error fetching divisions:", error);
            });
    };

    useEffect(() => {
        fetchDivisions();
    }, []);

    const handleFetchCases = () => {
        console.log("Division Selected : ", selectedDivision);
        if (!selectedDivision.length) {
            toast.error("Please select a division before fetching cases.");
            return;
        }
        setShowTable(true);
        let value = selectedDivision[0].value;
        let usertype = localStorage.getItem("user");

        const requestPromise = fetch(`${url.API_url}/api/fetch_cases`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ VAPLZ: selectedDivision, usertype }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("fetched cases : ", data)
                const rowsWithId = data.data.map((row, index) => ({
                    ...row,
                    id: index + 1,
                }));

                for (let case_ of rowsWithId) {
                    let exist = cases.filter(x => x.aufnr === case_.AUFNR);
                    console.log(exist, "Exist !")
                    if (exist.length) {
                        if (exist[0].duesData.length) {
                            case_.dues_found = true
                        }
                        if (exist[0].tpye && exist[0].tpye === 2) {
                            case_.mcd_found = true
                        }
                    }
                }
                setCases(rowsWithId);
                // Update the case count
                setCaseCount(rowsWithId.length);
                console.log("Fetched cases data:", rowsWithId);
                let filter = divisions.filter(x => x.VAPLZ === value);
                localStorage.setItem("selectedDivision", JSON.stringify(filter))
                const requestPromise = fetch(`${url.API_url}/api/synonyms`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ division: value }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        localStorage.setItem('synom', JSON.stringify(data.data));
                        localStorage.setItem('area', JSON.stringify(data.area))
                        console.log("synonyms : ", data)
                    })
                    .catch((error) => {
                        console.error("Error fetching cases:", error);
                    });

                const requestPromise1 = fetch(`${url.API_url}/api/exclude_list`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ division: value }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.data && data.data.length) {
                            set_exclude_terms(data.data[0]);
                            localStorage.setItem("exclude_1", JSON.stringify(data.data[0]))
                        }
                        if (data.area && data.area.length) {
                            set_exclude_terms1(data.area[0]);
                            localStorage.setItem("exclude_2", JSON.stringify(data.area[0]))
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching cases:", error);
                    });
            })
            .catch((error) => {
                console.error("Error fetching cases:", error);
            });
    };
    const handleRowClick = (row) => {
        setSelectAllChecked(false);
        console.log("selected row: ", selectedRows);
        setSelectedRows([row]); // Set the selected row to an array containing only the clicked row
        // Update selected row count
        setSelectedRowCount(1);
    };
    const handleReset = () => {
        setSelectedDivision(""); // Reset selected division
        setCases([]); // Clear cases data
        setCaseCount(0); // Reset case count
        setResetDivision(true); // Trigger a reset for the division dropdown
        setShowTable(false);
    };
    const handleAutomaticSearch=()=>{

    }
    return (
        <div style={{ marginTop: '6rem', padding: '10px' }}>
            <div className='division-section'>
                <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    style={{ fontSize: '20px', alignItems: 'center', width: '40rem' }}
                >
                    <option>Select a division</option>
                    {divisions.map((division) => (
                        <option key={division.VAPLZ} value={division.VAPLZ}>
                            {division.VAPLZ} - {division.DIVISION_NAME}
                        </option>
                    ))}
                </select>
                {" "}
                <div className="button-container">
                    <Button onClick={handleFetchCases}>Fetch Cases</Button>{" "}
                    <Button onClick={handleAutomaticSearch}>Dues Process</Button>{" "}
                    <Button onClick={handleReset}>Reset</Button>
                </div>
            </div>
            <div className="top-pagination">
                <b>Number of Cases Fetched: {caseCount}
                    {selectedRowCount > 0 && (
                        <>
                            {" "}
                            | {selectedRowCount} row{selectedRowCount > 1 ? "s" : ""} selected
                        </>
                    )}
                </b>
            </div>
            {showTable&&(
                <div className="fetched-cases-table">
                <Table striped bordered hover style={{ height: '200px' }}>
                    <thead style={{ position: 'sticky' }}>
                        <tr>
                            <th>S.No.</th>
                            <th>ORDER NO</th>
                            <th>REQUEST NO</th>
                            <th>NAME</th>
                            <th>APPLIED ADDRESS</th>
                            <th>REQUEST TYPE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map((data) => (
                            <tr key={data.id} className={selectedRows.includes(data) || selectAllChecked ? "selected" : ""}>
                                <td>
                                    <input checked={selectedRows.includes(data) || selectAllChecked}
                                        onChange={(e) => handleRowClick(data)} type="checkbox" />
                                </td>
                                <td>{data.AUFNR}</td>
                                <td>{data.REQUEST_NO}</td>
                                <td>{data.NAME}</td>
                                <td>{data.SAP_ADDRESS}</td>
                                <td>
                                    {(() => {
                                        switch (data.ILART) {
                                            case 'U01':
                                                return 'New Connection';
                                            case 'U02':
                                                return 'Name Change';
                                            case 'U03':
                                                return 'Load Enhancement';
                                            case 'U04':
                                                return 'Load Reduction';
                                            case 'U05':
                                                return 'Category Change (Low to High)';
                                            case 'U06':
                                                return 'Category Change (High to Low)';
                                            case 'U07':
                                                return 'Address Correction';
                                            default:
                                                return data.ILART;
                                        }
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            )}
            
        </div>
    )
}
export default HomePage;