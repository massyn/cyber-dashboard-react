import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { ChevronRightRounded as ChevronIcon, HelpOutlineRounded as HelpIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import TargetIndicator from "./TargetIndicator";
import StatusChip from "./StatusChip";
import { complianceStatus, formatPercent } from "../utils/status";

const MetricComponent = ({ metric }) => (
    <Box
        data-testid="metric"
        sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "1fr auto 160px 72px auto" },
            alignItems: "center",
            columnGap: 3,
            rowGap: 1,
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            "&:hover": { backgroundColor: "action.hover" },
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
            <Typography
                component={RouterLink}
                to={`/metric/${metric.metric_id}`}
                sx={{ color: "text.primary", textDecoration: "none", fontWeight: 500, "&:hover": { color: "primary.main" } }}
            >
                {metric.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">{metric.metric_id}</Typography>
            {metric.helptext && (
                <Tooltip title={metric.helptext} arrow placement="top">
                    <IconButton size="small" href={metric.url} target="_blank" rel="noopener noreferrer" aria-label="About this metric">
                        <HelpIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
            <StatusChip status={complianceStatus(metric.score, metric.slo, metric.slo_min)} />
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
            <TargetIndicator metric={metric} />
        </Box>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 650, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {formatPercent(metric.score, 0)}
        </Typography>
        <IconButton
            component={RouterLink}
            to={`/metric/${metric.metric_id}`}
            size="small"
            aria-label={`Open ${metric.title}`}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
        >
            <ChevronIcon />
        </IconButton>
    </Box>
);

export default MetricComponent;
