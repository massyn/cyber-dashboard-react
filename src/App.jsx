import { lazy, Suspense } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";

const Overview = lazy(() => import("./pages/overview"));
const Metrics = lazy(() => import("./pages/metrics"));
const Detail = lazy(() => import("./pages/detail"));

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
        background: {
            default: "#f0f4f8",
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
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
