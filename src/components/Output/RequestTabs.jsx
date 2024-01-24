import { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ManualSearch from './ManualSearch';
const RequestTabs = () => {
    return (
        <Tabs
            defaultActiveKey="profile"
            id="uncontrolled-tab-example"
            className="mb-3"
        >
            <Tab eventKey="home" title="Dues Records">
                <ManualSearch/>
            </Tab>
            <Tab eventKey="profile" title="MCD Records">
                MCD Records
            </Tab>
        </Tabs>
    )
}
export default RequestTabs;