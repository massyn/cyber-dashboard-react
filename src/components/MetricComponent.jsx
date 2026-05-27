import {
    Card,
    Link,
    Tooltip,
    Typography,
    useTheme,
  } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TargetIndicator from "./TargetIndicator";
import { HelpOutlined as HelpOutlineIcon } from "@mui/icons-material";

const MetricComponent = ({ metric }) => {
    const theme = useTheme();
    return (
      <Card
        variant="outlined"
        sx={{
          padding: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          marginBottom: "0.5em",
        }}
        data-testid="metric"
      >
        <div>
          <Typography variant="subtitle1" fontWeight={400}>
            <RouterLink
              to={`/metric/${metric.metric_id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {metric.title}
            </RouterLink>
            {metric.helptext && (
              <Tooltip title={metric.helptext} arrow placement="top">
                <Link
                  href={metric.url}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpOutlineIcon
                    sx={{
                      color: theme.palette.primary.main,
                      verticalAlign: "sub",
                      fontSize: "1.25em",
                    }}
                  />
                </Link>
              </Tooltip>
            )}
          </Typography>
        </div>
        <div style={{ display: "flex", gap: "2em", alignItems: "center" }}>
          <TargetIndicator metric={metric} />
          <Typography variant="h4" sx={{ width: "75px" }}>
            {Math.round(metric.score * 100)}%
          </Typography>
        </div>
      </Card>
    );
};

export default MetricComponent;
