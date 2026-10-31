import { AppBar, Box, Button, Container, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import {
    DarkModeRounded as DarkIcon,
    GitHub as GitHubIcon,
    LightModeRounded as LightIcon,
    ShieldRounded as ShieldIcon,
} from "@mui/icons-material";
import { NavLink, Link as RouterLink } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/",        label: "Overview" },
    { to: "/metrics", label: "Metrics" },
];

const navButtonSx = {
    color: "brand.barText",
    opacity: 0.7,
    borderRadius: 2,
    px: 1.5,
    "&:hover": { opacity: 1, backgroundColor: "rgba(255, 255, 255, 0.08)" },
    "&.active": { opacity: 1, backgroundColor: "rgba(255, 255, 255, 0.12)" },
};

const ColourModeToggle = () => {
    const { mode, systemMode, setMode } = useColorScheme();
    if (!mode) return null;
    const isDark = (mode === "system" ? systemMode : mode) === "dark";
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";
    return (
        <Tooltip title={label}>
            <IconButton aria-label={label} onClick={() => setMode(isDark ? "light" : "dark")} sx={{ color: "brand.barText" }}>
                {isDark ? <LightIcon /> : <DarkIcon />}
            </IconButton>
        </Tooltip>
    );
};

const Menu = () => (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "brand.bar", color: "brand.barText" }}>
        <Container>
            <Toolbar disableGutters sx={{ gap: 1, minHeight: { xs: 56 } }}>
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{ display: "flex", alignItems: "center", gap: 1, color: "inherit", textDecoration: "none", mr: { xs: 1, sm: 3 } }}
                >
                    <ShieldIcon sx={{ color: "brand.accent" }} />
                    <Typography variant="h6" component="span" sx={{ fontWeight: 650, letterSpacing: "-0.01em", display: { xs: "none", sm: "block" } }}>
                        Cyber Metrics
                    </Typography>
                </Box>
                {NAV_ITEMS.map(({ to, label }) => (
                    <Button key={to} component={NavLink} to={to} end sx={navButtonSx}>
                        {label}
                    </Button>
                ))}
                <Box sx={{ flexGrow: 1 }} />
                <ColourModeToggle />
                <Tooltip title="Source on GitHub">
                    <IconButton
                        aria-label="Source on GitHub"
                        href="https://github.com/massyn/cyber-dashboard-react"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: "brand.barText" }}
                    >
                        <GitHubIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </Container>
    </AppBar>
);

export default Menu;
