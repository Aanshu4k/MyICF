import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import './ReportDetails.css';

const ReportDetails = () => {
    const [reportData, setReportData] = useState([]);
    const [reportDataCopy, setReportDataCopy] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: '' });
    const [userid_count, setuserid_count] = useState();

    useEffect(() => {
        axios.get('https://icf1.bsesbrpl.co.in/api/icf_reports')
            .then((res) => {
                setReportData(res.data.data);
                setReportDataCopy(res.data.data);
                console.log("tfcf data entries : ", res.data.data);
                console.log("Cases Missed By Auto Search : ", res.data.data.manualSearchCases)
            });
    }, []);
    function formatDate(utcDateString) {
        const date = new Date(utcDateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}-${month}-${year}`;
    }

    const handleReportSearch = () => {
        const filtered = reportDataCopy.filter((prevData) =>
            prevData.createdAt >= fromDate && prevData.createdAt <= toDate
        );
        if (fromDate === toDate || fromDate) {
            const sameDateData = reportDataCopy.filter(
                (prevData) => formatDate(prevData.createdAt) === formatDate(fromDate)
            );
            setReportData(sameDateData);
        } else {
            setReportData(filtered);
        }
    };

    // const handleSearchByRequestNo = () => {
    //     console.log("Aufnr search term : ", searchTerm);
    //     if (!searchTerm) {
    //         setReportData(reportDataCopy);
    //         return;
    //     }
    //     const newFilteredRows = reportData.filter(row => row.requestNo && row.requestNo.includes(searchTerm.trim()));
    //     setReportData(newFilteredRows);
    // };

    const handleSearchByUserId = () => {
        if (!searchTerm) {
            setReportData(reportDataCopy);
            return;
        }
        const newFilteredRows = reportData.filter(row => row.userId && row.userId.includes(searchTerm.trim()));
        setReportData(newFilteredRows);
        setuserid_count(newFilteredRows.length);
    }
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
            <div className="report-header">
                <h4 style={{ filter: 'drop-shadow(0 0 10px grey)' }}>ICF REPORT</h4>
            </div>
            <div className="report-search">
                <Form.Group controlId="formFile" className="mb-3" style={{ display: 'flex', alignItems: 'center' }}>
                    <Form.Control placeholder='Search by User Id' type="text" onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button type="submit" onClick={handleSearchByUserId}>
                        Search
                    </Button>
                </Form.Group>
                <div style={{ display: 'flex', marginLeft: '12rem', alignItems: 'baseline' }}>
                    <Form.Label>From</Form.Label>
                    <Form.Control type="date" onChange={(e) => setFromDate(e.target.value)} />
                    {" "}<Form.Label>To</Form.Label>
                    <Form.Control type="date" onChange={(e) => setToDate(e.target.value)} />
                    <Button type="submit" onClick={handleReportSearch}>
                        Search
                    </Button>
                </div>
            </div>
            <div className="report-table">
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('userId')}>
                                User ID
                                <FontAwesomeIcon icon={getSortIcon('userId')} />
                                {userid_count || 0}
                            </th>
                            <th onClick={() => requestSort('requestNo')}>
                                Request No
                                <FontAwesomeIcon icon={getSortIcon('requestNo')} />
                            </th>
                            <th onClick={() => requestSort('division')}>
                                Division
                                <FontAwesomeIcon icon={getSortIcon('division')} />
                            </th>
                            <th onClick={() => requestSort('address')} >
                                ADDRESS
                                <FontAwesomeIcon icon={getSortIcon('address')} />
                            </th>
                            <th>DUES (AUTO)</th>
                            <th>MCD (AUTO)</th>
                            <th>CASES MISSED (By Auto Search)</th>
                            <th onClick={() => requestSort('createdAt')}>
                                CF Date
                                <FontAwesomeIcon icon={getSortIcon('createdAt')} />
                            </th>
                            <th onClick={() => requestSort('efficiency')}>Efficiency
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
        </div >
    );
};
export default ReportDetails;