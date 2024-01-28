
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ManualSearch from './ManualSearch';
const RequestTabs = () => {
    return (
        <Tabs
            defaultActiveKey="dues"
            id="uncontrolled-tab-example"
            className="mb-3" style={{justifyContent:'center',alignContent:'center'}}
        >
            <Tab eventKey="dues" title="Dues Records" >
                <ManualSearch/>
            </Tab>
            <Tab eventKey="mcd" title="MCD Records">
                MCD Records
            </Tab>
        </Tabs>
    )
}
export default RequestTabs;