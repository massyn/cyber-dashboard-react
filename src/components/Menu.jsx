import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { NavLink, Link as RouterLink } from "react-router-dom";

const NAVBAR_BG = "#0d2137";

const NAV_ITEMS = [
    { to: "/",        label: "Overview" },
    { to: "/metrics", label: "Metrics" },
];

const navButtonSx = {
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "none",
    "&.active, &:hover": { color: "#fff" },
};

const Menu = () => (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: NAVBAR_BG }}>
        <Container>
            <Toolbar disableGutters variant="dense" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{ color: "inherit", textDecoration: "none", mr: 2 }}
                >
                    Cyber Metrics
                </Typography>
                {NAV_ITEMS.map(({ to, label }) => (
                    <Button key={to} component={NavLink} to={to} end sx={navButtonSx}>
                        {label}
                    </Button>
                ))}
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    href="https://github.com/massyn/cyber-dashboard-react"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={navButtonSx}
                >
                    Github
                </Button>
            </Toolbar>
        </Container>
    </AppBar>
);

export default Menu;
