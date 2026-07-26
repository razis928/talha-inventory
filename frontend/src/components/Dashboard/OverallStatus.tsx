import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@mui/material";
import StatusCard from "./StatusCard";
import { BagIcon } from "Components/icons/Bag";
import { BackOrderIcon } from "Components/icons/BackOrderIcon";
import { PaymentIcon } from "Components/icons/PaymentIcon";
const useStyles = makeStyles(theme => ({
  root: {
    top: "5px",
    position: "relative"
  }
}));
interface ILoader {
  readonly size?: number;
}
const OverallStatus: React.FC<ILoader> = props => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h6">Overall Status</Typography>
      <Grid container mt={2} spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatusCard
            title="Orders pending Shipping"
            icon={<BagIcon />}
            count={24}
            buttonText="View Orders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatusCard
            title="Backordered Products"
            icon={<BackOrderIcon />}
            count={28}
            buttonText="View Products"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatusCard
            title="Returned Products"
            icon={<BackOrderIcon />}
            count={28}
            buttonText="View Products"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatusCard
            title="Refunded Payments"
            icon={<PaymentIcon />}
            count={28}
            buttonText="View Payments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatusCard
            title="Failed Payments"
            icon={<PaymentIcon />}
            count={28}
            buttonText="View Payments"
          />
        </Grid>
      </Grid>
    </div>
  );
};
export default OverallStatus;
