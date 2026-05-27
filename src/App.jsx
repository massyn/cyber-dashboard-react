import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Menu from "./components/Menu";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Overview from "./pages/overview";
import Metrics from "./pages/metrics";
import Detail from "./pages/detail";

const theme = createTheme({
    palette: {
        primary: {
            main:  "#1565c0",
            dark:  "#0d47a1",
            light: "#5e92f3",
        },
        secondary: {
            main: "#42a5f5",
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Menu />
                <Routes>
                    <Route path="/"                   element={<Overview />} />
                    <Route path="/metrics"            element={<Metrics />} />
                    <Route path="/metric/:metric_id"  element={<Detail />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
