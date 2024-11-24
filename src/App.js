import React from "react";
import Menu from "./components/Menu";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from "./pages";
import Overview from "./pages/overview";
import Metrics from "./pages/metrics"
import Categories from "./pages/categories"

function App() {
    return (
        <Router>
            <Menu />
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/metrics" element={<Metrics />} />
            </Routes>
        </Router>
    );
}

export default App;
