import React from "react";
import Menu from "./components/Menu";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from "./pages";
import Overview from "./pages/overview";
import BusinessUnits from "./pages/business_units";

function App() {
    return (
        <Router>
            <Menu />
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/business_units" element={<BusinessUnits />} />
            </Routes>
        </Router>
    );
}

export default App;
