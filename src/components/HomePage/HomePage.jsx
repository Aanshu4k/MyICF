import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useState, useEffect } from "react";
import './HomePage.css';
import Table from "react-bootstrap/Table";
const url = require("../config.json");

const HomePage = () => {
    const [cases, setCases] = useState([]);
    const [icfData, setIcfData] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState("");
    const [caseCount, setCaseCount] = useState(0);
    const [exclude_terms, set_exclude_terms] = useState([]);
    const [exclude_terms1, set_exclude_terms1] = useState([]);
    const [resetDivision, setResetDivision] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectedRowCount, setSelectedRowCount] = useState(0);
    const [showTable, setShowTable] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [ipAddress, setIpAddress] = useState(null);
    const navigate = useNavigate();

    const fetchDivisions = () => {
        axios
            .get(`${url.API_url}/api/divisions_on_page_load1`)
            .then((response) => {
                setDivisions(response.data.data);
            })
            .catch((error) => {
                console.error("Error fetching divisions:", error);
            });
    };
    useEffect(() => {
        fetchDivisions();
        fetchIpAddress();
    }, []);
    const fetchIpAddress = async () => {
        try {
            let obj = {
                systemId: sessionStorage.getItem("systemId")
            }
            //to find dues and mcd search process or not 
            let data = await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_by_params_id`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj),
            });
            const apiResponse = await data.json();
            console.log("Icf Data : ", apiResponse.data)  //icfData from MongoDB tfcfentries
            setIcfData(apiResponse.data || []);
        } catch (error) {
            console.error('Error fetching IP address:', error);
        }
    };

    const handleFetchCases = () => {
        if (!selectedDivision.length) {
            toast.error("Please select a division before fetching cases.");
            return;
        }
        setShowTable(true);
        let value = selectedDivision[0].value;
        let usertype = localStorage.getItem("user");

        fetch(`${url.API_url}/api/fetch_cases`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ VAPLZ: selectedDivision, usertype }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("fetched cases : ", data);
                const rowsWithId = data.data.map((row, index) => ({
                    ...row,
                    id: index + 1,
                }));
                //to fetch dues_found and mcd_found from icfData
                for (let case_ of rowsWithId) {
                    let exist = icfData.filter(x => x.aufnr === case_.AUFNR);
                    if (exist.length) {
                        if (exist[0].duesData.length) {
                            case_.dues_found = true
                        }
                        if (exist[0].tpye && exist[0].tpye === 2) {     //if tpye==2 => mcd case exist
                            case_.mcd_found = true
                        }
                    }
                }
                setCases(rowsWithId);
                setCaseCount(rowsWithId.length); // Update the case count
                console.log("Fetched cases data:", rowsWithId);
                let filter = divisions.filter((x) => x.VAPLZ === value);
                localStorage.setItem("selectedDivision", JSON.stringify(selectedDivision));

                //API call to fetch synonyms
                fetch(`${url.API_url}/api/synonyms`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ division: selectedDivision }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        localStorage.setItem("synom", JSON.stringify(data.data));
                        localStorage.setItem("area", JSON.stringify(data.area));
                        console.log("synonyms : ", data);
                    })
                    .catch((error) => {
                        console.error("Error fetching cases:", error);
                    });
                //API call to fetch exclude_list
                fetch(`${url.API_url}/api/exclude_list`, {
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
                            localStorage.setItem("exclude_1", JSON.stringify(data.data[0]));
                        }
                        if (data.area && data.area.length) {
                            set_exclude_terms1(data.area[0]);
                            localStorage.setItem("exclude_2", JSON.stringify(data.area[0]));
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = cases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(caseCount / itemsPerPage);

    const handleRowClick = (row) => {
        setSelectAllChecked(false);
        console.log("selected row: ", selectedRows);
        setSelectedRows([row]); // Set the selected row to an array containing only the clicked row
        // Update selected row count but its always 1
        localStorage.setItem("manual", JSON.stringify(row));
    };
    const handleReset = () => {
        setSelectedDivision(""); // Reset selected division
        setCases([]); // Clear cases data
        setCaseCount(0); // Reset case count
        setDivisions(divisions.map(div => div)); // Trigger a reset for the division dropdown
        setShowTable(false);
    };
    let findLastLongestWord = (str) => {
        return new Promise((res, rej) => {
            // / Sample SAP_ADDRESS
            let sapAddress = str || "";
            // Remove numbers and special characters from the end of the string after a comma or after the last word
            sapAddress = sapAddress
                .replace(/,?\s*\d+\s*[!@#$%^&*()_+=-]*$/, "")
                .replace(/,\s*$/, "");
            // Extract the last word without special characters
            const lastWordWithoutSpecialChars = sapAddress.match(/[^,]+(?=\s*$)/)[0];
            // Split the lastWordWithoutSpecialChars string into words
            const words = lastWordWithoutSpecialChars.split(/\s+/);
            // Find the longest word
            let longestWord = "";
            for (const word of words) {
                console.log(word, "wordwordword", longestWord);
                if (word.length > longestWord.length) {
                    longestWord = word;
                }
            }
            console.log(longestWord, "aaaaaaaaaa");
            res(longestWord);
        });
    };
    const addCommaAfterSpace = (inputString) => {
        // Split the input string into an array of words
        const wordsArray = inputString.split(" ");
        // Join the words in the array with a comma and a space
        const resultString = wordsArray.join(", ");
        return resultString;
    };
    function removeSpecialCharsAndCapitalize(inputString) {
        // Remove special characters and spaces, but keep numeric characters
        const cleanedString = inputString.replace(/[^a-zA-Z0-9]/g, "");

        // Capitalize the cleaned string
        const capitalizedString = cleanedString.toUpperCase();

        return capitalizedString;
    }

    const getWordArr = (word, rest) => {
        console.log(word, "word");
        let data = localStorage.getItem("synom");
        if (data) {
            data = JSON.parse(data);
        } else {
            data = [];
        }
        console.log(data, "data");
        const wordToMatch = word; // The complete word you want to match
        const regex = new RegExp(`\\b${wordToMatch}\\b`); // Create a regular expression with word boundaries
        let filteredData = data.filter((subarray) => {
            return subarray.some(
                (element) => typeof element === "string" && regex.test(element)
            );
        });
        let finalArr = [];
        if (!filteredData.length) {
            return [];
        }
        filteredData[0].forEach((x) => {
            if (x) {
                let r = removeSpecialCharsAndCapitalize(x);
                console.log(r, "wadhjxnm");
                finalArr.push(r + rest);
            }
        });

        console.log(finalArr);
        return finalArr;
    };

    function removeWordsFromArray(inputString, wordsToRemove) {
        let result = inputString;

        wordsToRemove.forEach((word) => {
            word = word.toUpperCase();
            result = result.replace(new RegExp(word, "g"), "");
        });
        console.log(result, "resultresult");
        return result;
    }

    const getWordArr1 = (word, rest) => {
        console.log(word, "wordwordwordword");
        let data = localStorage.getItem("area#");
        if (data) {
            data = JSON.parse(data);
        } else {
            data = [];
        }
        console.log(data, "datadatadatadata");
        const wordToMatch = word; // The complete word you want to match
        let filteredData = data.filter((subarray) => {
            return subarray.some(
                (element) =>
                    typeof element === "string" && element.toUpperCase() === wordToMatch
            );
        });
        // let filteredData1 = data.filter(subarray => {
        //     return subarray.some(element => typeof element === "string" && ((wordToMatch.includes(element.toUpperCase()))));
        // });
        if (!filteredData.length) {
            return [];
        } else {
            return ["1"];
        }
    };
    const searchMatchingResultAlgoAgain = async (address, data) => {
        return new Promise(async (res, rej) => {
            try {
                let inputAddress = address;
                // inputAddress = inputAddress.replace('&',' ')
                inputAddress = inputAddress.replace(
                    /([a-zA-Z0-9])-*, *([a-zA-Z0-9])/g,
                    "$1, $2"
                );
                console.log(inputAddress, "inputAddressfilteredSapAddress");

                // inputAddress = inputAddress.replace(/[^\w\s-/()]/g, '');
                inputAddress = inputAddress.replace(/[^\w\s&/() -]/g, "");
                inputAddress = inputAddress.replace(/&/g, "/");
                inputAddress = inputAddress.replace("AND", "/");
                // Add space before opening parenthesis
                inputAddress = inputAddress.replace(/(\()/g, " $1");
                // Add space after closing parenthesis
                inputAddress = inputAddress.replace(/(\))/g, "$1 ");
                inputAddress = inputAddress.replace(/[()]/g, "");

                console.log(inputAddress, "inputAddress3");

                let regex = /\/(\w+)/g;
                inputAddress = inputAddress.replace(regex, "/$1 ");
                inputAddress = inputAddress.replace(/ \//g, "");
                console.log(inputAddress, "inputAddress2");

                inputAddress = inputAddress.split(/\s+/).join(" ");
                console.log(inputAddress, "inputAddress1");

                function doesNotContainAlphabet(inputString) {
                    return !/[a-zA-Z]/.test(inputString);
                }
                function containsNumbers(word) {
                    return /\d/.test(word);
                }

                function containsOnlyLetters(inputString) {
                    return /^[a-zA-Z]+$/.test(inputString);
                }
                console.log(inputAddress, "inputAddress");

                let wordsArray = inputAddress.split(" ");

                let mergedWords = [];
                let currentWord = "";
                wordsArray = wordsArray.filter((x) => x !== "AND" || x !== "OR");
                for (let word of wordsArray) {
                    if (currentWord && !containsNumbers(word)) {
                        mergedWords.push(currentWord);
                    }
                    const endsWithNumber = /\d$/.test(currentWord);
                    const startsWithNumber = /^\d/.test(word);
                    console.log(currentWord, word, isNaN(word), "defrf");
                    // // alert()
                    if (!/[a-zA-Z]/.test(word)) {
                        let numbersBeforeSlash = word.split("/")[0];

                        mergedWords.push(numbersBeforeSlash);
                    }

                    if (currentWord && currentWord.length <= 2 && containsNumbers(word)) {
                        currentWord = currentWord ? `${currentWord} ${word}` : word;
                    } else {
                        if (startsWithNumber && !endsWithNumber) {
                            currentWord = currentWord ? `${currentWord} ${word}` : word;
                        } else if (
                            word.toLowerCase().startsWith("no") &&
                            containsOnlyLetters(currentWord)
                        ) {
                            currentWord = currentWord ? `${currentWord} ${word}` : word;
                        } else if (
                            (currentWord.startsWith("KH") ||
                                currentWord.startsWith("PLOT") ||
                                currentWord.startsWith("PLT") ||
                                currentWord.startsWith("GALI")) &&
                            doesNotContainAlphabet(word)
                        ) {
                            const prefix = currentWord.match(/^([a-zA-Z]+)(.*)/);
                            if (prefix && prefix.length) {
                                word = prefix[1] + word;
                                mergedWords.push(currentWord);
                                currentWord = word;
                            }
                        } else {
                            mergedWords.push(currentWord);
                            currentWord = word;
                        }
                    }
                }
                if (currentWord) {
                    mergedWords.push(currentWord);
                }
                let mergedWords_bkp = mergedWords;
                mergedWords = [];
                const alphabetPattern = /[a-zA-Z]/;

                mergedWords_bkp.forEach((x) => {
                    if (x.includes("/") && !x.startsWith("KH")) {
                        let split = x.split("/");
                        if (split.length) {
                            let split1 = split[1];
                            console.log(split1);
                            if (alphabetPattern.test(split1)) {
                                console.log(split1, "checking ...");
                                mergedWords.push(...split);
                            } else {
                                mergedWords.push(x);
                            }
                        }
                    } else {
                        mergedWords.push(x);
                    }
                    let str = x;
                    if (str.includes("/")) {
                        let split = str.split("/");
                        if (split.length > 1) {
                            let split1 = split[0];
                            let split2 = split[1];
                            split1 = split1.replace(" ", "");
                            let alphabeticPart = split1.match(/[a-zA-Z]+\s*/);
                            if (alphabeticPart) {
                                let mergedWord = alphabeticPart[0].replace(/\s/g, "") + split2;
                                mergedWords.push(split1, mergedWord);
                            } else {
                                mergedWords.push(str);
                            }
                        }
                    } else {
                        mergedWords.push(str);
                    }
                });
                let splitAndCleanedWords = mergedWords
                    .map((word) => word.replace(/\W/g, "").split(" "))
                    .flat();
                splitAndCleanedWords = splitAndCleanedWords.map((x) => x.toUpperCase());
                let new_words_arr = [];
                function addRomanNumerals(word) {
                    let new_word = word;
                    if (word.includes("1ST")) {
                        let r = new_word.replace("1ST", "");
                        new_words_arr.push(r);
                        new_word = new_word.replace("1ST", "I");
                    } else if (word.includes("2ND")) {
                        let r = new_word.replace("2ND", "");
                        new_words_arr.push(r);
                        let w = new_word.replace("2ND", "2");
                        new_words_arr.push(w);
                        new_word = new_word.replace("2ND", "II");
                    } else if (word.includes("3RD")) {
                        new_word = new_word.replace("3RD", "III");
                    } else if (word.includes("4TH")) {
                        new_word = new_word.replace("4TH", "IV");
                    }
                    new_words_arr.push(new_word);
                    return word;
                }
                const wordsWithNumbers = splitAndCleanedWords.filter(containsNumbers);
                let modifiedWords = wordsWithNumbers.map(addRomanNumerals);
                modifiedWords = modifiedWords.concat(new_words_arr);
                console.log(modifiedWords, "modifiedWords");
                res(modifiedWords);
            } catch (error) {
                console.log(error);
                res([]);
            }
        });
    };
    function splitStringByNumericBetweenAlphabets(inputString) {
        const regex = /([A-Za-z]+)(\d+)([A-Za-z]+)/;
        const match = inputString.match(regex);

        if (match) {
            const [, firstPart, numericPart, secondPart] = match;
            console.log(firstPart, numericPart, secondPart)
            const firstResult = firstPart + numericPart;
            const secondResult = numericPart + secondPart;

            return [firstResult, secondResult];
        }

        return [inputString];
    }
    function removeSpecialCharsFromArray(array) {
        const resultArray = array.map(str => str.replace(/[^\w\s]/g, ''));
        return resultArray;
    }
    const searchMatchingResultAlgoAgainForWords = async (address) => {
        return new Promise(async (res, rej) => {
            try {
                let sap_address = address;
                sap_address = addCommaAfterSpace(sap_address);
                let filteredSapAddress = sap_address;
                filteredSapAddress = filteredSapAddress.replace(/([a-zA-Z0-9])-*, *([a-zAZ0-9])/g, '$1, $2');
                exclude_terms1.forEach(term => {
                    const regex = new RegExp(`\\b${term}\\b`, 'gi');
                    filteredSapAddress = filteredSapAddress.replace(regex, '');
                });

                filteredSapAddress = filteredSapAddress.replace(/[^\w\s-/()]/g, '');

                // Add space before opening parenthesis
                filteredSapAddress = filteredSapAddress.replace(/(\()/g, ' $1');

                // Add space after closing parenthesis
                filteredSapAddress = filteredSapAddress.replace(/(\))/g, '$1 ');
                filteredSapAddress = filteredSapAddress.replace(/[()]/g, '');

                filteredSapAddress = filteredSapAddress.split(/\s+/).join(' ');

                let searchWords = filteredSapAddress.split(' ');

                searchWords = searchWords.filter(x => x !== "")
                console.log(searchWords, "filteredSapAddress");

                let longestWord = searchWords.reduce((prev, current) => (current.length > prev.length ? current : prev), '');
                let lastLongestWord = await findLastLongestWord(sap_address);
                searchWords.splice(searchWords.indexOf(longestWord), 1);
                let secondLongestWord = searchWords.reduce((prev, current) =>
                    current.length > prev.length ? current : prev,
                    ''
                );

                console.log(searchWords, longestWord, lastLongestWord, secondLongestWord, "word Array");

                searchWords.splice(searchWords.indexOf(secondLongestWord), 1);
                let thirdLongestWord = searchWords.reduce((prev, current) =>
                    current.length > prev.length ? current : prev,
                    ''
                );

                searchWords.splice(searchWords.indexOf(thirdLongestWord), 1);

                let fourLongestWord = searchWords.reduce((prev, current) =>
                    current.length > prev.length ? current : prev,
                    ''
                );

                searchWords.splice(searchWords.indexOf(fourLongestWord), 1);
                let fiveLongestWord = searchWords.reduce((prev, current) =>
                    current.length > prev.length ? current : prev,
                    ''
                );

                let final_array_of_words = [longestWord, lastLongestWord, secondLongestWord, thirdLongestWord, longestWord, fiveLongestWord];
                console.log(final_array_of_words, fiveLongestWord, "final words array")
                final_array_of_words = final_array_of_words.filter(word => {
                    if (/\d/.test(word)) {
                        return false;
                    }
                    return true;
                }).map(word => word.toLowerCase());
                console.log(exclude_terms1, "exclude_terms1")
                let send_to_backend = final_array_of_words.filter(item => !exclude_terms1.includes(item) && item !== "");

                send_to_backend = send_to_backend.filter(word => word.length >= 3);
                res(send_to_backend);
            } catch (error) {
                console.log(error);
                res([]);
            }
        });
    };

    const handleSearchMatchingAddresses = async () => {
        localStorage.setItem('selectedRows_1', JSON.stringify([]));
        localStorage.setItem('selectedMatchedRows', JSON.stringify(selectedRows));
        if (selectedRows.length === 0) {
            console.warn("No rows selected. Please select one or more rows.");
            toast.error("Please select a case to start searching");
            return;
        }

        function setSearchLogs(payload) {
            let usertype = localStorage.getItem("user") || "undefined"
            payload['usertype'] = usertype;
            const requestPromise = fetch(`${url.API_url}/api/create_log`, {
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
        const requests = [];
        let saveExistRes = {};
        let addr = [];
        const requestPromises = selectedRows.map(async (row, index) => {
            const startTime = new Date();
            let finalStr = await searchMatchingResultAlgoAgain(row.SAP_ADDRESS, []);
            const inputAddress = row.SAP_ADDRESS;
            function containsWord(word) {
                if (word && word.includes('NO')) {
                    return false;
                }
                return exclude_terms.some(arrWord => word.includes(arrWord.toUpperCase()))
            }
            let new_arr = finalStr.filter(x => !containsWord(x))
            finalStr = new_arr;
            const uniqueArray = [...new Set(finalStr)];
            finalStr = uniqueArray;
            let secondFinalStr = await searchMatchingResultAlgoAgainForWords(row.SAP_ADDRESS, []);
            console.log("Second FinalStr : ", secondFinalStr)
            let uniqueArray1 = [...new Set(secondFinalStr)];
            uniqueArray1 = uniqueArray1.map(x => x.toUpperCase());
            console.log("Final Str : ", finalStr);
            console.log("Unique Array 1 : ", uniqueArray1)

            let gali_no = finalStr.filter(x => x.includes('GALI'));
            finalStr = finalStr.filter(x => !x.includes('GALI'));

            uniqueArray1 = uniqueArray1.filter(x => !x.includes('GALI'))
            uniqueArray1.push(...gali_no);
            uniqueArray1 = uniqueArray1.filter(x => !x.includes('EXT'));

            let r = [];
            let r1 = [];
            let isAreaExis1t = [];

            finalStr.forEach(x => {
                const prefix = x.match(/^([a-zA-Z]+)(.*)/);
                if (prefix && prefix.length) {
                    let arr = getWordArr(prefix[1], prefix[2]);
                    let isAreaExist = getWordArr1(prefix[1]);
                    if (isAreaExist.length) {
                        isAreaExis1t.push(x);
                        r1.push(x, ...arr)
                    }
                    else {
                        r.push(x, ...arr)
                    }
                }
                else {
                    r.push(x)
                }
            });
            let areaExist2 = [];
            let removeonlystr = ["dairy", "hn0", "propno", "and"];
            r.map(x => x = removeWordsFromArray(x, removeonlystr));

            let sealing_str = []
            uniqueArray1.forEach(x => {
                console.log("Unique Array 1 : ", x)
                const prefix = x.match(/^([a-zA-Z]+)(.*)/);
                if (prefix && prefix.length) {
                    let arr = getWordArr(prefix[1], prefix[2]);
                    let area = getWordArr1(prefix[1]);
                    if (area.length) {
                        if (x && x.length <= 3) {
                            areaExist2.push(x);
                            sealing_str.push(x);
                        } else {
                            let breakword = x.slice(0, 3);
                            let breakword1 = x.slice(0, 4);
                            sealing_str.push(x, breakword1);
                            areaExist2.push(x, breakword)
                        }

                    } else {
                        console.log(arr, "array")
                        r1.push(x, ...arr)
                    }
                } else {
                    r1.push(x)
                }
            });

            console.log(r, "isAreaExist")
            r = r.filter(x => !isAreaExis1t.includes(x));
            console.log(r, "isAreaExist2")
            sealing_str = [...sealing_str];
            sealing_str = sealing_str.filter(x => x !== "PHASE")

            r1 = [...r1, ...isAreaExis1t, ...areaExist2];
            r = r.map(x => {
                return removeWordsFromArray(x, removeonlystr)
            });
            const nonKhElements = r.filter(element => !element.startsWith("KH") && !element.startsWith("KN"));
            if (nonKhElements.length > 0) {
                // Remove any element starting with "kh" from arr and push to arr2
                r = r.filter(element => {
                    if (element.startsWith("KH") || element.startsWith("KN")) {
                        r1.push(element);
                        return false; // Remove "kh" element from arr
                    }
                    return true; // Keep non-"kh" element in arr
                });
            }

            r = r.filter(x => {
                console.log(x, "is number")
                if (/^[0-9]+$/.test(x)) {
                    if ((+x) >= 99) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return true
                }
            });
            r = r.filter(
                (value, index, self) => self.indexOf(value) === index
            );
            const nonKhElements1 = r.filter(element => !element.startsWith("KH") && !element.startsWith("KN"));

            if (nonKhElements1.length === 0) {
                let filter = r1.filter(x => x.startsWith("KH"));
                console.log(filter, "filterfilterfilter")
                r.push(...filter);
                r1 = r1.filter(x => !x.startsWith("KH"));
            } else {
                // r = r.filter(element => isNaN(element) || element >= 100);
            };
            if (!r.length) {
                let data = localStorage.getItem('area#');
                if (data) {
                    data = JSON.parse(data);
                } else {
                    data = []
                };
                let flattenedArray = [].concat(...data);
                console.log(flattenedArray, "data ...");
                r = r1;
                r = r.filter(element => !flattenedArray.includes(element));
                r = r.filter(element => element.length > 2);
                r1 = r1.filter(element => !r.includes(element));
            }

            r = r.filter(item => {
                const numericPart = item.match(/\d+/);
                return numericPart !== null;
            });
            const payload = {
                AUFNR: row.AUFNR,
                REQUEST_NO: row.REQUEST_NO,
                BUKRS: row.BUKRS,
                VAPLZ: row.VAPLZ,
                NAME: row.NAME,
                TEL_NUMBER: row.TEL_NUMBER,
                E_MAIL: row.E_MAIL,
                ILART: row.ILART,
                SAP_ADDRESS: row.SAP_ADDRESS,
                finalStr: r,
                sealing_str,
                secondFinalStr: r1
            };
            console.log("PAYLOAD FOR SEARCH DATA : ", payload)
            let splitedNumeric = []
            r.map(x => {
                if (x) {
                    let word = splitStringByNumericBetweenAlphabets(x);
                    splitedNumeric.push(...word);
                }
                return null;
            })
            let finalSplitWords = []
            r.map(x => {
                if (x) {
                    let match = x.match(/([0-9]+)([A-Za-z]+)([0-9]+)/);
                    if (match) {
                        let numericPart1 = match[1];
                        let alphabeticPart = match[2];
                        let numericPart2 = match[3];
                        finalSplitWords.push(`${numericPart1}${alphabeticPart}`, `${alphabeticPart}${numericPart2}`)
                    } else {
                        finalSplitWords.push(x)
                        console.log("No match found");
                    }
                }
                return null;
            });
            finalSplitWords = finalSplitWords.filter(x => !x.startsWith("1100"));
            payload.secondFinalStr = payload.secondFinalStr.filter(x => !x.startsWith("1100"));
            payload.secondFinalStr = removeSpecialCharsFromArray(payload.secondFinalStr);

            payload.finalStr = finalSplitWords;
            let ndstr = [];
            let khExist = payload.secondFinalStr.filter(x => x.startsWith("KH"));
            if (khExist.length) payload.finalStr = [];
            payload.secondFinalStr.map(x => {
                if (x.startsWith("KH")) {
                    payload.finalStr.push(x)
                } else {
                    ndstr.push(x)
                }
            });
            payload.secondFinalStr = ndstr;
            payload['addr'] = row;
            localStorage.setItem('searchStr', JSON.stringify(payload));
            try {
                let response = await fetch(`${url.API_url}/api/search`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                let data = await response.json();
                console.log("Search API response  : ", data);
                row.final = data.results_count;
                if (data.count <= 2000) {
                    saveExistRes[`${row.AUFNR}`] = data.results_count;
                }
                saveExistRes[`${row.AUFNR}_count`] = data.count;
                addr.push(row);
                const endTime = new Date();
                const timeElapsedInMilliseconds = endTime - startTime;
                const minutes = Math.floor(timeElapsedInMilliseconds / 60000);
                const seconds = Math.floor((timeElapsedInMilliseconds % 60000) / 1000);
                const milliseconds = (timeElapsedInMilliseconds % 1000).toString().padStart(3, '0').slice(0, 2);
                const formattedTime = `${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds, ${milliseconds} milliseconds`;

                localStorage.setItem('manual', JSON.stringify(row));
                let obj = {
                    "obj": {
                        "LogTextMain": finalStr.join(','),
                        "logTextAndSrc": uniqueArray1.join(','),
                        "MethodName": "AUTO-MODE",
                        "SolrSearchTime": formattedTime,
                        "REQUEST": row.AUFNR,
                        "refineStr": data.refine_str,
                        result_count: '' + data.count,
                        IP_address: ipAddress
                    }
                };
                setSearchLogs(obj);
                localStorage.setItem('sealing_data_1', JSON.stringify(data.sealing_data))
            } catch (error) {
                console.error("Error in one or more requests:", error);
                // Show an error toast
                toast.error("Error in one or more requests. Search Process is complete.");
            }
        });

        // Use Promise.all to wait for all promises to resolve
        await Promise.all(requestPromises);
        localStorage.removeItem('existingResult');
        localStorage.setItem('saveExistRes', JSON.stringify(saveExistRes)); //save the nearby fetched cases in local storage
        navigate('/output');
    };

    return (
        <div style={{ marginTop: "4rem", padding: "0 5rem", justifyContent: "center" }}>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="top-section">
                <div style={{ textAlign: "center" }}>
                    <h4>Request Pending For CF</h4>
                </div>
                <div className="division-section">
                    <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        style={{ fontSize: "20px", alignItems: "center", width: "40rem" }}
                    >
                        <option value="">Select a division</option>
                        {divisions.map((division) => (
                            <option key={division.VAPLZ} value={division.VAPLZ}>
                                {division.VAPLZ} - {division.DIVISION_NAME}
                            </option>
                        ))}
                    </select>{" "}
                    <div className="button-container">
                        {" "}
                        <Button variant="danger" onClick={handleFetchCases}>
                            Fetch Cases
                        </Button>{" "}
                        <Button onClick={handleSearchMatchingAddresses}>
                            Dues Process
                        </Button>{" "}
                        <Button onClick={handleReset}>Reset</Button>
                    </div>
                </div>
            </div>
            <div className="top-pagination">
                <b>Number of Cases Fetched: {caseCount}</b>
            </div>
            {showTable && (
                <div className="fetched-cases-table">
                    <Table striped bordered hover style={{ height: "auto" }}>
                        <thead style={{ position: "sticky" }}>
                            <tr>
                                <th>SELECT</th>
                                <th>ORDER NO</th>
                                <th>REQUEST NO</th>
                                <th>NAME</th>
                                <th>APPLIED ADDRESS</th>
                                <th>REQUEST TYPE</th>
                                <th>Dues Search</th>
                                <th>MCD Search</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((data) => (
                                <tr
                                    key={data.id}
                                    className={
                                        selectedRows.includes(data) || selectAllChecked
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    <td>
                                        <input
                                            checked={selectedRows.includes(data) || selectAllChecked}
                                            onChange={(e) => handleRowClick(data)}
                                            type="checkbox"
                                        />
                                    </td>
                                    <td>{data.AUFNR}</td>
                                    <td>{data.REQUEST_NO}</td>
                                    <td>{data.NAME}</td>
                                    <td>{data.SAP_ADDRESS}</td>
                                    <td>
                                        {(() => {
                                            switch (data.ILART) {
                                                case "U01":
                                                    return "New Connection";
                                                case "U02":
                                                    return "Name Change";
                                                case "U03":
                                                    return "Load Enhancement";
                                                case "U04":
                                                    return "Load Reduction";
                                                case "U05":
                                                    return "Category Change (Low to High)";
                                                case "U06":
                                                    return "Category Change (High to Low)";
                                                case "U07":
                                                    return "Address Correction";
                                                default:
                                                    return data.ILART;
                                            }
                                        })()}
                                    </td>
                                    <td>
                                        {data.dues_found ? (
                                            <span className="span-check">&#10003;</span>
                                        ) : (
                                            <span className="span-cross">&#10540;</span>
                                        )}
                                    </td>
                                    <td>
                                        {data.mcd_found ? (
                                            <span className="span-check">&#10003;</span>
                                        ) : (
                                            <span className="span-cross">&#10540;</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
            {showTable && (
                <div className="pagination-container">
                    <Button
                        variant="outline-danger"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <b>PREV</b>
                    </Button>{" "}
                    <span>{`Page ${currentPage} of ${totalPages}`}</span>
                    <Button
                        variant="outline-danger"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <b>NEXT</b>
                    </Button>
                </div>
            )}
        </div>
    );
};
export default HomePage;
