import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import CircularProgress from '@mui/material/CircularProgress';
import './ReportDetails.css';
import * as moment from 'moment';

const ReportDetails = () => {
    const [reportData, setReportData] = useState([]);
    const [reportDataCopy, setReportDataCopy] = useState([]);
    let [fromDate, setFromDate] = useState('');
    let [toDate, setToDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: '' });
    const [userid_count, setuserid_count] = useState();
    const [divisionCount, setDivisionCount] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get('https://icf1.bsesbrpl.co.in/api/icf_reports')
            .then((res) => {
                setReportData(res.data.data);
                setReportDataCopy(res.data.data);
                console.log("tfcf data entries : ", res.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data : ", error);
                setLoading(false);
            })
    }, [fromDate, toDate]);

    useEffect(() => {
        const uniqueUserIds = new Set(reportData.map(data => data.userId));
        setuserid_count(uniqueUserIds.size);
        // Calculate unique divisions count
        const uniqueDivisions = new Set(reportData.map(data => data.division));
        setDivisionCount(uniqueDivisions.size);
    }, [reportData]);

    function formatDate(utcDateString) {
        const date = new Date(utcDateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}-${month}-${year}`;
    }
    const handleFilterByDate = () => {
        const filtered = reportDataCopy.filter((prevData) => {
            const createdDate = moment(prevData.createdAt);

            // check if the createdDate is between the fromDate and toDate
            return createdDate.isBetween(fromDate, toDate, "day", "[]");
        });
        setReportData(filtered);
    };

    const handleSearchByUserId = () => {
        if (!searchTerm && fromDate && toDate) {
            // If no search term, apply only date filter
            handleFilterByDate();
            return;
        }
        if (!searchTerm) {
            setReportData(reportDataCopy)
        }
        const newFilteredRows = reportDataCopy.filter(row => row.userId && row.userId.toLowerCase().includes(searchTerm.trim().toLowerCase()));
        if (fromDate || toDate) {
            // If date filter is applied, further filter the search results
            const filteredByDate = newFilteredRows.filter((prevData) => {
                const createdDate = moment(prevData.createdAt);
                return createdDate.isBetween(fromDate, toDate, "day", "[]");
            });
            setReportData(filteredByDate);
        } else {
            // If no date filter applied, just set the search results
            setReportData(newFilteredRows);
        }
        console.log("newFilteredRows : ", newFilteredRows);
        var userIds = newFilteredRows.map(({ userId }) => userId);
        var uniqueUserId = new Set(userIds);
        setuserid_count(uniqueUserId.size);
    };

    //this will toggle the sorting direction Asc or Desc
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    //function to sort the data asc or desc
    const sortedData = () => {
        const sortedReportData = [...reportData];
        if (sortConfig !== null) {
            sortedReportData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortedReportData;
    };

    const getSortIcon = (columnName) => {
        if (sortConfig && sortConfig.key === columnName) {
            return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
        }
        return faSort;
    };

    return (
        <div className="report-container">
            <>
                <div className="report-header">
                    <h4 style={{ filter: 'drop-shadow(0 0 10px grey)' }}>ICF REPORT</h4>
                </div>
                <div className="report-search">
                    <Form.Group controlId="formFile" className="mb-3" style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Control placeholder='Search by User Id (ALL)' type="text" onChange={(e) => setSearchTerm(e.target.value)} />
                        <Button type="submit" onClick={handleSearchByUserId}>
                            Search
                        </Button>
                    </Form.Group>
                    <div style={{ display: 'flex', marginLeft: '12rem', alignItems: 'baseline' }}>
                        <Form.Label>From</Form.Label>
                        <Form.Control type="date" onChange={(e) => setFromDate(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                        {" "}<Form.Label>To</Form.Label>
                        <Form.Control type="date" onChange={(e) => setToDate(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                        <Button type="submit" onClick={handleFilterByDate}>
                            Search
                        </Button>
                    </div>
                </div>
                {loading ? (
                    <div className="loading-spinner">
                        <CircularProgress />
                    </div>
                ) : (
                    <div className="report-table">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort('userId')} >
                                        User ID
                                        <FontAwesomeIcon icon={getSortIcon('userId')} /><br />
                                        ( {userid_count} )
                                    </th>
                                    <th onClick={() => requestSort('requestNo')}>
                                        REQUEST NO
                                        <FontAwesomeIcon icon={getSortIcon('requestNo')} /><br />
                                        ( {reportData.length} )
                                    </th>
                                    <th onClick={() => requestSort('division')}>
                                        DIVISION
                                        <FontAwesomeIcon icon={getSortIcon('division')} /><br />
                                        ( {divisionCount} )
                                    </th>
                                    <th onClick={() => requestSort('address')} >
                                        ADDRESS
                                        <FontAwesomeIcon icon={getSortIcon('address')} />
                                    </th>
                                    <th>DUES (AUTO)</th>
                                    <th>MCD (AUTO)</th>
                                    <th>MISSED DUES {" "}AUTO SEARCH</th>
                                    <th onClick={() => requestSort('createdAt')}>
                                        CF Date
                                        <FontAwesomeIcon icon={getSortIcon('createdAt')} />
                                    </th>
                                    <th onClick={() => requestSort('efficiency')}>EFFICIENCY
                                        <FontAwesomeIcon icon={getSortIcon('efficiency')} />
                                    </th>
                                </tr >
                            </thead >
                            {reportData.length === 0 ? (
                                <div className="no-results-found">No results found</div>
                            ) : (
                                <tbody>
                                    {sortedData().map((data, index) => (
                                        <tr key={data._id}>
                                            <td>{data.userId}</td>
                                            <td>{data.requestNo}</td>
                                            <td>{data.division}</td>
                                            <td>{data.address}</td>
                                            <td>{data.duesData.length}</td>
                                            <td>{data.mcdData.length} </td>
                                            {/* <td>{data.type === '1' || data.type === '2' ? <span className='span-check'>&#10003;</span> : <span className='span-cross'>&#10540;</span>}</td>
                                <td>{data.type === '' || data.type === '2' ? <span className='span-check'>&#10003;</span> : <span className='span-cross'>&#10540;</span>}</td> */}
                                            <td>{data.autoSearchCases !== data.manualSearchCases ? data.manualSearchCases.length : 0}</td>
                                            <td style={{ width: 'max-content', whiteSpace: 'nowrap' }}>{formatDate(data.createdAt)}</td>
                                            <td>
                                                {/* {((data.autoRecordsFound.length/(data.autoSearchCases.length+data.manualSearchCases.length))*100).toFixed(2)}  */}
                                                {(data.efficiency.percentage || 0).toFixed(2)}
                                                %
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </Table >
                    </div >
                )}

            </>


        </div >
    );
};
export default ReportDetails;