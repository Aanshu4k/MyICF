import Table from 'react-bootstrap/Table';
import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import './ManualSearch.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
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
    const [searchResultsOther, setSearchResultsOther] = useState([]); // New state for search results
    const [caseData, setCaseData] = useState();
    let [addressPart1, setAddressPart1] = useState('');
    let [addressPart2, setAddressPart2] = useState('');
    let [addressPart3, setAddressPart3] = useState('');
    const [ipAddress, setIpAddress] = useState(null);
    const [refineQuery, setRefineQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: '' });
    const navigate = useNavigate();

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
            console.log("icf_data_by_params response : ", apiResponse);
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
        console.log("DATA FOR BP TYPE : ", data)
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

    //manual consist the value of the selected cases for which dues process has to be completed
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
                let obj = getCounts(dues_filter);       //count the bp type cases
                setSearchResults1(existingResult)
                setSearchResultsOther(existingResult);
                setCounts(obj); //set counts for result with dues>500
                let exist = existingResult.map(x => x.CONTRACT_ACCOUNT);    //retrievss all the CA number of fetched cases 
                console.log("Existing result : ", exist)
                setExistingResult(exist);
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
    const handleFilterByBPType = (bpType) => {
        if (!bpType) {
            setSearchResults(searchResults1);
            let obj = getCounts(searchResultsOther);
            setCounts(obj)
            console.log("final ...")
            return
        }
        // Filter the data based on the selected BP_TYPE
        let filteredData = [];
        if (bpType === "other") {
            let bps = ["Normal", "ENFORCEMENT", "LEGAL", "Sealing"];
            filteredData = searchResults1.filter((item) => !bps.includes(item.BP_TYPE))
        } else {
            filteredData = searchResults1.filter((item) => item.BP_TYPE == bpType)
        }

        if (bpType === "move") {
            console.log(searchResults1)
            filteredData = searchResults1.filter((item) => item.BP_TYPE === 'Normal' && !item.MOVE_OUT.includes('9999'))
        }
        console.log(filteredData, bpType, "llll", searchResults1)
        setSearchResults(filteredData);
        let obj = getCounts(searchResultsOther);
        setCounts(obj)
    };
    const [duesFilter, setDuesFilter] = useState("all"); // State to keep track of selected dues filter
    // Function to handle the change in the dues filter radio buttons
    const handleDuesFilterChange = (event) => {
        const selectedFilter = event.target.value;
        setDuesFilter(selectedFilter);
        // Filter the data based on the selected radio button
        const filteredData = searchResultsOther.filter((result) => {
            if (selectedFilter === "all") {
                return true; // return all original results
            } else if (selectedFilter === "zero") {
                return result.solr_dues <= 500; // Filter results where DUES is 0
            } else if (selectedFilter === "greater500") {
                return result.solr_dues && result.solr_dues > 500; // Filter results where DUES is greater than 500
            }
            return null;
        });
        let data = getCounts(filteredData);
        setCounts(data)
        setSearchResults(filteredData);
    };

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
        let str = [];
        if (addressPart3) {
            str = addressPart3.split(',');
            str = str.map(x => {
                return removeSpecialCharsAndCapitalize(x);
            })
        }
        else {
            alert("Address search field is empty !");
        }
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
        setExistingResult([]);

        setAddressPart3('')
        //API call to fetch cases from manually entered address as input by the User
        fetch(`${url.API_url}/api/manual_search1`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                addressPart3: str,
                SAP_ADDRESS: aufnr_1.SAP_ADDRESS,
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

                        if (existingResult1) {
                            finalres = existingResult1;
                            let exist = existingResult1.map(x => x.CONTRACT_ACCOUNT);
                            console.log(exist)
                            setExistingResult(exist)
                        }
                    }
                };
                //first reset all the auto search results
                setSearchResults([]);
                setSearchResults1([]);
                setSearchResultsOther([])

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

    //function to check dues and mcd search complete status from local storage
    function checkBt() {
        let dues = sessionStorage.getItem("duesSearchComplete");
        let mcd = sessionStorage.getItem("mcdSearchComplete");
        if (dues) {
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

    // reset the manual search results to auto search result and 
    const openModal = async () => {
        let systemId = sessionStorage.getItem("systemId");
        let obj = {
            systemId,
            type: "dues",
            aufnr: aufnr_1.AUFNR,
            duesData: [],
            selectedDues: []
        }
        console.log("Payload for icf_data_status API : ", obj);
        //api to insert or update a record in tfcfdataentries collection mongoDB 
        await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(obj),
        })
        fetchIpAddress();
        sessionStorage.removeItem("duesSearchComplete");
        checkBt();  //check whether dues & mcd search is complete or not from LocStor
        setselectedRows_1([]);
        setSearchResults(searchResultsOther)
        localStorage.setItem("sealingData", JSON.stringify([]))
    };
    const handleBackToHome = () => {
        navigate('/home');
    }
    function cleanAndUppercaseString(inputString) {
        // Remove special characters and spaces
        const cleanedString = inputString.replace(/[^\w\s]/g, '');

        // Convert the cleaned string to uppercase
        let uppercasedString = cleanedString.toUpperCase();
        uppercasedString = mergeWordsAndRemoveSpaces(uppercasedString)
        return uppercasedString;
    }
    function mergeWordsAndRemoveSpaces(inputString) {
        // Split the input string by spaces
        const words = inputString.split(' ');
        // Remove spaces and merge all words together
        const mergedString = words.join('');
        return mergedString;
    }
    const searchMatchingResultAlgoAgain = async (address, data, val) => {
        return new Promise(async (res, rej) => {
            try {
                const inputAddress = address;

                // Function to check if a word contains numbers
                function containsNumbers(word) {
                    return /\d/.test(word);
                }
                // Split the input address by space
                const wordsArray = inputAddress.split(' ');
                // Merge words with adjacent numbers but keep "h-no" as a single word
                const mergedWords = [];
                let currentWord = '';
                for (const word of wordsArray) {
                    if (currentWord && !containsNumbers(word)) {
                        mergedWords.push(currentWord);
                        currentWord = '';
                    }
                    const endsWithNumber = /\d$/.test(currentWord);
                    const startsWithNumber = /^\d/.test(word);
                    console.log(currentWord, word, "current word");
                    if (currentWord && currentWord.length <= 2 && containsNumbers(word)) {
                        currentWord = currentWord ? `${currentWord} ${word}` : word;
                    }
                    else {
                        if (startsWithNumber && !endsWithNumber) {
                            currentWord = currentWord ? `${currentWord} ${word}` : word;
                        } else {
                            mergedWords.push(currentWord);
                            currentWord = word;
                        }
                    }
                }
                if (currentWord) {
                    mergedWords.push(currentWord);
                }
                let splitAndCleanedWords = mergedWords.flatMap(word => word.split(/\W+/).filter(Boolean));
                splitAndCleanedWords = splitAndCleanedWords.map(x => x.toUpperCase())

                let new_words_arr = []
                function addRomanNumerals(word) {
                    let new_word = word;
                    if (word.includes("1ST")) {
                        let r = new_word.replace('1ST', '');
                        new_words_arr.push(r)
                        new_words_arr.push("1038")
                        new_word = new_word.replace('1ST', 'I',);
                    } else if (word.includes("2ND")) {
                        let r = new_word.replace('2ND', '');
                        new_words_arr.push(r)
                        let w = new_word.replace('2ND', '2');
                        new_words_arr.push(w)
                        new_word = new_word.replace('2ND', 'II');
                    } else if (word.includes("3RD")) {
                        new_word = new_word.replace('3RD', 'III');
                    } else if (word.includes("4TH")) {
                        new_word = new_word.replace('4TH', 'IV');
                    }
                    new_words_arr.push(new_word);
                    return word;
                }
                let wordsWithNumbers = splitAndCleanedWords;
                // Filter the array to get words with numbers
                if (!val) {
                    wordsWithNumbers = splitAndCleanedWords.filter(containsNumbers);
                }
                let modifiedWords = wordsWithNumbers.map(addRomanNumerals);
                modifiedWords = modifiedWords.concat(new_words_arr);
                console.log(wordsWithNumbers, modifiedWords);
                res(modifiedWords)
            } catch (error) {
                console.log(error)
                res([])
            }
        })
    };

    //clean the search query and extracts its matching address using searchMatchingResultAlgoAgain function
    const refineSearch = async (data, str) => {      //auto searched data and search input by the user
        return new Promise(async (res, rej) => {
            try {
                if (str) {
                    str = removeSpecialCharsAndCapitalize(str);
                }
                console.log("Clean Searched Query : ", str);    //clean unwanted characters from the user input
                const currentWordFilteredResults = [];
                // Define a function to check if an array of strings matches the criteria
                function matchesCriteria(arr, str) {
                    if (!Array.isArray(arr)) {
                        return false;
                    }
                    let numericPart1 = str.match(/\d+(\.\d+)?/g); //matches the search query for a word starts with dot for float numbers (extracts the numeric part)
                    let alphabetPart1 = str.match(/[A-Za-z]+/);   //matches the search query for a word starts with character in uppercase and lowercase 

                    console.log("Extracted Alaphabetical and numerical Part : ", alphabetPart1, numericPart1, arr);
                    arr = arr.filter(x => x !== '')
                    let is_exist = false;
                    for (let index = 0; index < arr.length; index++) {
                        const element = arr[index];
                        let alphabetPart = element.match(/[A-Za-z]+/);
                        let numericPart = element.match(/\d+(\.\d+)?/g);
                        if (!alphabetPart) {
                            alphabetPart = ['#']
                        }
                        if (!numericPart) {
                            numericPart = ['0']
                        }
                        if (numericPart1 && alphabetPart1) {
                            let rd = alphabetPart[0].includes(alphabetPart1[0]) && numericPart[0] === numericPart1[0];
                            if (rd) {
                                return true
                            }
                        }
                        if (alphabetPart1 && !numericPart1) {
                            if (alphabetPart1[0] && alphabetPart1[0].length <= 2) {
                                if ((alphabetPart[0] && alphabetPart[0].length === 1) || alphabetPart[0].includes("BL") || alphabetPart[0].includes("BLO") || alphabetPart[0].includes("PLO")) {
                                    let rd = alphabetPart[0].includes(alphabetPart1[0]);
                                    if (rd) {
                                        return true
                                    }
                                } else {
                                    return false
                                }
                            } else {
                                let rd = alphabetPart[0].includes(alphabetPart1[0]);
                                if (rd) {
                                    return true
                                }
                            }
                        }
                        if (numericPart1 && !alphabetPart1) {
                            let rd = numericPart[0] === numericPart1[0];
                            if (rd) {
                                return true;
                            }
                        }
                        console.log("Refine Search term is Exist : ", is_exist)
                    }
                    return false;
                }
                for (const doc of data) {
                    let finalStr = await searchMatchingResultAlgoAgain(doc.SAP_ADDRESS, [], 1);
                    if (matchesCriteria(finalStr, str.toUpperCase())) {
                        currentWordFilteredResults.push(doc);
                    }
                }
                console.log("REFINED RESULT : ", currentWordFilteredResults)
                res(currentWordFilteredResults);
            }
            catch (error) {
                console.log(error);
                res([]);
            }
        });
    };
    const handleRefineSearch = async () => {
        console.log("Search Results before refine search : ", searchResults);
        let result = await refineSearch(searchResults, refineQuery);
        console.log("RESULT AFTER REFINE SEARCH : ", result)
        setRefineQuery("");
        let obj = getCounts(result);        //counts the result based on BP Type
        setCounts(obj);
        // closeModal();
        setSearchResults(result);
        setSearchResults1(result);
        if (refineQuery.trim() === "") {
            alert("Refine Search Query Cannot be empty!!!")
        }
    }
    const originalList = () => {
        setSearchResults(searchResultsOther);
        setSearchResults1(searchResultsOther);
        let obj = getCounts(searchResultsOther);
        setCounts(obj)
    }
    const columnsToExport = ["SEARCH_MODE", "CF_CATEGORY", "ACCOUNT_CLASS", "SOLR_DUES", "SAP_DUES", "MOVE_OUT", "CONTRACT_ACCOUNT", "CSTS_CD", "SAP_NAME", "SAP_ADDRESS", "SAP_POLE_ID", "TARIFF"];
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
    const handleCalculateDues = async () => {
        let count = await getCounts(selectedRows_1);
        console.log("Selected cases : ", counts);
        if (selectedRows_1) {
            Swal.fire({
                title: 'Are you sure?',
                text: '',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, complete it!',
                html: `<style>
                  .enforcement-label { color: blue; }
                  .normal-label { color: green; }
                  .other-label { color: orange; }
                  .move-out-label { color: purple; }
                  .legal-label { color: red; }
                </style>
                
                <div>
                <h5>Do you want to complete the dues search?</h5>
                <p><span id="enforcementLabel" class="enforcement-label">Enforcement selected</span> - <span id="enforcementCount" class="enforcement">${count.enforcement}</span></p>
                <p><span id="normalLabel" class="normal-label">Normal selected</span> - <span id="normalCount" class="normal">${count.normal}</span></p>
                <p><span id="otherLabel" class="other-label">Other selected</span> - <span id="otherCount" class="other">${count.other}</span></p>
                <p><span id="moveOutLabel" class="move-out-label">Move out selected</span> - <span id="moveOutCount" class="move-out">${count.move}</span></p>
                <p><span id="legalLabel" class="legal-label">Legal selected</span> - <span id="legalCount" class="legal">${count.legal}</span></p>
              </div>`
            })
                .then(async (result) => {
                    if (result.isConfirmed) {
                        let systemId = sessionStorage.getItem("systemId");
                        let obj = {
                            systemId,
                            aufnr: aufnr_1.AUFNR,
                            duesData: searchResults,
                            selectedDues: selectedRows_1
                        }

                        await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_status`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(obj),
                        });
                        let caNumbers = selectedRows_1.map(x => x.CONTRACT_ACCOUNT)
                        let response = await fetch(`${url.API_url}/api/calculate_dues`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ caNumbers }),
                        })
                        let dues = await response.json();
                        console.log("Dues to be calculate : ", dues);

                        selectedRows_1.forEach(x => {
                            let duess = dues.duesData.filter(y => y.CA_NUMBER === x.CONTRACT_ACCOUNT);
                            if (duess && duess.length) {
                                x.DUES = duess[0].AMOUNT
                            }
                        });
                        let arr = [...selectedRows_1, ...duesData_.selectedMcd];
                        console.log("arr in calculate dues : ", arr)
                        await fetch(`${url.API_url}/api/sendToDsk`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ data: arr, addr: aufnr_1 }),
                        })
                        exportToExcel(arr, aufnr_1);
                    }
                    else {
                        let caNumbers = selectedRows_1.map(x => x.CONTRACT_ACCOUNT)
                        let response = await fetch(`${url.API_url}/api/calculate_dues`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ caNumbers }),
                        })
                        let dues = await response.json();
                        console.log("dues Data from calculate dues API : ", dues)
                        selectedRows_1.forEach(x => {
                            let duess = dues.duesData.filter(y => y.CA_NUMBER === x.CONTRACT_ACCOUNT);
                            if (duess && duess.length) {
                                x.DUES = duess[0].AMOUNT
                            }
                        });
                    }
                    console.log("Selected Rows for calculating dues : ", selectedRows_1)
                    setselectedRows_1(selectedRows_1);
                    setSearchResults(selectedRows_1);

                    sessionStorage.setItem("duesSearchComplete", "true");
                    checkBt();
                    console.log("AUFNR_1 in complete dues function ", aufnr_1);
                    localStorage.setItem("selectedMatchedRows1", JSON.stringify([aufnr_1]));
                    Swal.fire({
                        title: 'Success!',
                        text: 'Dues search completed successfully.',
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                    });
                })
        }
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
        const sortedReportData = [...searchResults];
        if (sortConfig !== null) {
            sortedReportData.sort((a, b) => {
                const val1 = parseFloat(a[sortConfig.key]);
                const val2 = parseFloat(b[sortConfig.key]);
                if (val1 < val2) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                else
                    if (val1 > val2) {
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
                                        checked={duesFilter === "all"}
                                        label={<span style={{ fontWeight: 600, fontSize: '18px' }}>All</span>}
                                        onChange={handleDuesFilterChange}
                                    />
                                </div>
                                <div className="form-check-box">
                                    <Form.Check
                                        inline
                                        type="radio"
                                        name="duesFilter"
                                        id="greater500"
                                        value="greater500"
                                        checked={duesFilter === "greater500"}
                                        label={<span style={{ fontWeight: 600, fontSize: '18px' }}>Dues &gt; 500</span>}
                                        onChange={handleDuesFilterChange}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <h5 style={{ color: 'darkslategray', cursor: 'pointer' }}>
                            <span className="span5" style={{ color: 'black', fontWeight: 700 }}>
                                <span className="result-count" style={{ float: 'left', cursor: 'pointer', color: 'black', fontWeight: 700, textDecoration: 'underline' }}>
                                    <span>Selected Result: </span> {selectedRows_1.length}
                                </span>
                                <span className="bptype">Total: {counts.total || 0}</span>,
                                <span className="bptype" onClick={() => handleFilterByBPType('Normal')}>
                                    Regular: {counts.normal || 0}
                                </span>
                                <span className="bptype" onClick={() => handleFilterByBPType('ENFORCEMENT')}>
                                    <span>Enforcement:</span>{(counts.enforcement || 0)}
                                </span>
                                <span className="bptype" onClick={() => handleFilterByBPType('LEGAL')}>
                                    <span>Legal:</span> {(counts.legal || 0)}
                                </span>
                                <span className="bptype" onClick={() => handleFilterByBPType('other')} >
                                    <span>Other:</span> {(counts.other || 0)}
                                </span>
                                <span className="bptype" onClick={() => handleFilterByBPType('move')}>
                                    <span>Move Out Cases:</span> {(counts.move || 0)}
                                </span>
                                <span style={{ marginRight: '60px', color: 'green', float: 'right' }}>
                                    {!isDuesSearchComplete_1 ? "" : "Sent To DSK"}
                                    {isDuesSearchComplete_1 && (<i className="fa fa-check" style={{ color: 'green', fontSize: '20px' }} />)}
                                </span>
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
                                <th onClick={() => requestSort('solr_dues')} style={{ whiteSpace: 'nowrap', width: '3%' }}>SOLR DUES
                                    <FontAwesomeIcon icon={getSortIcon('solr_dues')} /></th>
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
                            {sortedData().map((result, index) => {
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
                                <Form.Group as={Col} xs={12} sm={6} md={3} controlId="validationCustom01">
                                    <Button variant='success' disabled={isDuesSearchComplete_2} onClick={handleCalculateDues}>Complete Dues Search</Button>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} sm={6} md={3} controlId="validationCustom01">
                                    <Button variant='warning' onClick={openModal} style={{ width: '100%' }}>Reset</Button>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} sm={6} md={3} controlId="validationCustom01">
                                    <Button variant='info' onClick={handleBackToHome}>Back to Home</Button>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} sm={6} md={3} controlId="validationCustom01" style={{ display: 'flex' }}>
                                    <Form.Control type='text' style={{ width: '10rem', height: 'baseline' }} value={refineQuery} onChange={(e) => setRefineQuery(e.target.value)} />
                                    <Button variant="warning" onClick={handleRefineSearch}>Refine Search</Button>
                                    <Button variant='success' onClick={originalList}>Original List</Button>
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