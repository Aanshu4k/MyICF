import './RequestTabs.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ManualSearch from './ManualSearch';
import SealingSearch from './SealingSearch';
const RequestTabs = () => {
    return (
        <Tabs
            defaultActiveKey="dues"
            id="uncontrolled-tab-example"
            className="mb-3" style={{justifyContent:'center',alignContent:'center',marginTop:'4.5rem'}}
        >
            <Tab eventKey="dues" title="Dues Records" >
                <ManualSearch/>
            </Tab>
            <Tab eventKey="mcd" title="MCD Records">
                <SealingSearch/>
            </Tab>
        </Tabs>
    )
}
export default RequestTabs;