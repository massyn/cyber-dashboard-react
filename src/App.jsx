import { lazy, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import theme from "./theme";

const Overview = lazy(() => import("./pages/overview"));
const Metrics = lazy(() => import("./pages/metrics"));
const Detail = lazy(() => import("./pages/detail"));

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <Router>
                <Menu />
                <Suspense fallback={null}>
                    <Routes>
                        <Route path="/"                   element={<Overview />} />
                        <Route path="/metrics"            element={<Metrics />} />
                        <Route path="/metric/:metric_id"  element={<Detail />} />
                    </Routes>
                </Suspense>
            </Router>
        </ThemeProvider>
    );
}

export default App;
