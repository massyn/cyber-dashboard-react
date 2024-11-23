import React from "react";
import Menu from "./components/Menu";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from "./pages";
import Overview from "./pages/overview";

function App() {
    return (
        <Router>
            <Menu />
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/overview" element={<Overview />} />
            </Routes>
        </Router>
    );
}

export default App;
