import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import './ReportDetails.css';

const ReportDetails = () => {
    const [reportData, setReportData] = useState([]);
    const [reportData_copy, setReportDataCopy] = useState([]);
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5001/api/icf_reports')
            .then((res) => {
                setReportData(res.data.data);
                setReportDataCopy(res.data.data);
                console.log("tfcf data entries : ", res.data.data);
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
        const filtered = reportData.filter((prevData) =>
            prevData.createdAt >= fromDate && prevData.createdAt <= toDate
        );
        setReportData(filtered);
    };

    const handleSearchBar = () => {
        console.log("Aufnr search term : ", searchTerm);
        if (!searchTerm) {
            setReportData(reportData_copy);
            return;
        }
        const newFilteredRows = reportData.filter(row => row.aufnr && row.aufnr.includes(searchTerm));
        setReportData(newFilteredRows);
    };
    return (
        <div className="report-container">
            <div className="report-header">
                <h4>ICF REPORT</h4>
            </div>
            <div className="report-search">
                <Form.Group controlId="formFile" className="mb-3" style={{ display: 'flex', alignItems: 'center', width: '30%' }}>
                    <Form.Control placeholder='Search by Request No.' type="text" onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button type="submit" onClick={handleSearchBar}>
                        Search
                    </Button>
                </Form.Group>
                <div style={{ display: 'flex',marginLeft:'12rem',alignItems:'baseline' }}>
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
                            <th>User ID</th>
                            <th>Request No</th>
                            <th>Division</th>
                            <th>MCD</th>
                            <th>DUES</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((data, index) => (
                            data.duesData.length > 0 && (
                                <tr key={data._id}>
                                    <td>{data.duesData.length > 0 ? data.duesData[0].ID : ''}</td>
                                    <td>{data.aufnr}</td>
                                    <td>{data.duesData.length > 0 ? data.duesData[0].DIVISION : ''}</td>
                                    <td>{data.selectedMcd.length > 0 ? <span className='span-check'>&#10003;</span> : <span className='span-cross'>&#10540;</span>}</td>
                                    <td>{data.selectedDues.length > 0 ? <span className='span-check'>&#10003;</span> : <span className='span-cross'>&#10540;</span>}</td>
                                    <td>{formatDate(data.createdAt)}</td>
                                </tr>
                            )))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default ReportDetails;
