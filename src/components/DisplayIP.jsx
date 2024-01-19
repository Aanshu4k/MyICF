import { useState, useEffect } from 'react';
import axios from 'axios';
const DisplayIP = () => {
    const [ip,setIp]=useState('')
    useEffect(()=>{
        axios.get('https://ipapi.co/json')
        .then((response)=> setIp(response.data.ip))
    })
    return (
        <div>
            <h3>Your IP : {ip}</h3>
        </div>
    )
}
export default DisplayIP;